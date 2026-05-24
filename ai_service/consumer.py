import os
import time
from google.cloud import pubsub_v1
from google.api_core.exceptions import AlreadyExists
from database import db_helper
from inference import ml_engine

# Emulator setup for local dev
if os.getenv("USE_GCP_EMULATOR", "true").lower() == "true":
    os.environ["PUBSUB_EMULATOR_HOST"] = "127.0.0.1:8085"

PROJECT_ID = os.getenv("GCP_PROJECT", "fintech-hackathon")
TOPIC_ID = "analyze-statement-topic"
SUBSCRIPTION_ID = "analyze-statement-sub"

def setup_pubsub():
    """Ensure the topic and subscription exist (crucial for emulator/hackathon setup)."""
    publisher = pubsub_v1.PublisherClient()
    subscriber = pubsub_v1.SubscriberClient()
    
    topic_path = publisher.topic_path(PROJECT_ID, TOPIC_ID)
    subscription_path = subscriber.subscription_path(PROJECT_ID, SUBSCRIPTION_ID)
    
    try:
        publisher.create_topic(request={"name": topic_path})
        print(f"Created topic: {topic_path}")
    except AlreadyExists:
        pass
        
    try:
        subscriber.create_subscription(request={"name": subscription_path, "topic": topic_path})
        print(f"Created subscription: {subscription_path}")
    except AlreadyExists:
        pass

import requests
import json
import re
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "dummy_key")

def calculate_sketchiness(merchant_string):
    merchant_string = str(merchant_string)
    if len(merchant_string) == 0: return 0.0
    non_alpha_count = sum(1 for char in merchant_string if not char.isalpha())
    return round(non_alpha_count / len(merchant_string), 2)

def extract_merchant(text):
    text = text.strip()
    if text.startswith("UPI/"):
        parts = text.split("/")
        if len(parts) > 3:
            return parts[3][:15].strip()
        elif len(parts) > 1:
            return parts[-1][:15].strip()
    elif "NEFT" in text or "IMPS" in text:
        parts = text.split("-")
        if len(parts) > 2:
            return parts[2][:15].strip()
    elif "/" in text:
        return text.split("/")[0][:15].strip()
    return text[:15].strip()

def process_statement(doc_id: str):
    print(f"Processing Document ID: {doc_id}")
    doc = db_helper.get_document(doc_id)
    
    if not doc:
        print(f"Error: Document {doc_id} not found in Firestore.")
        return

    transactions = doc.get("transactions", [])
    total_income = 0.0
    total_expense = 0.0
    total_recurring_expense = 0.0
    anomalies_count = 0
    category_totals = {}
    
    # 1. Pre-computation for velocities and routine analysis
    merchant_dates = defaultdict(list)
    merchant_amounts = defaultdict(list)
    date_amounts = defaultdict(list)
    
    for txn in transactions:
        text = txn.get("rawNarration", "")
        merchant_name = extract_merchant(text)
        date_str = txn.get("date", "")
        amount = float(txn.get("amount", 0.0))
        
        merchant_dates[merchant_name].append(date_str)
        merchant_amounts[merchant_name].append(amount)
        if amount > 1000 and amount % 1000 == 0:
            date_amounts[date_str].append(amount)

    confused_txns = []

    # 2. First Pass: DistilBERT Classification & Feature Extraction
    for i, txn in enumerate(transactions):
        text = txn.get("rawNarration", "")
        merchant_name = extract_merchant(text)
        date_str = txn.get("date", "")
        amount = float(txn.get("amount", 0.0))
        txn_type = txn.get("type", "DEBIT")
        
        # 3. Anomaly Detection
        sketchiness = calculate_sketchiness(merchant_name)
        velocity = len(date_amounts.get(date_str, []))
        if txn_type == "CREDIT":
            is_anomaly = False
        else:
            is_anomaly = ml_engine.detect_anomaly(amount, merchant_sketchiness_score=sketchiness, velocity_score=velocity)
        
        # Categorization
        cat_result = ml_engine.categorize_transaction(text)
        predicted_category = cat_result["predictedCategory"]
        confidence = cat_result.get("confidenceScore", 1.0)
        top2_distance = cat_result.get("top2Distance", 1.0)
        source = "DistilBERT"
        
        # Subscription vs Routine Spend Analysis
        is_recurring = False
        merchant_count = len(merchant_dates[merchant_name])
        amounts_list = merchant_amounts[merchant_name]
        txn_type = txn.get("type", "DEBIT")
        
        if txn_type == "DEBIT":
            if merchant_count > 3:
                variance = max(amounts_list) - min(amounts_list)
                avg_amount = sum(amounts_list) / merchant_count
                if avg_amount > 0 and (variance / avg_amount) < 0.20:
                    is_recurring = True
                    predicted_category = "Routine Habit"
            elif merchant_count == 1:
                amount_ends_in_9 = str(int(amount)).endswith("9")
                if predicted_category == "Subscription" or amount_ends_in_9:
                    is_recurring = True
                    predicted_category = "Subscription"
        
        # Queue low confidence transactions for Batch LLM (except if already tagged as Routine)
        if (confidence < 0.60 or top2_distance < 0.1) and predicted_category != "Routine Habit":
            confused_txns.append({'index': i, 'text': text})
            
        txn["mlData"] = {
            "predictedCategory": predicted_category,
            "confidenceScore": confidence,
            "isAnomaly": is_anomaly,
            "isRecurring": is_recurring,
            "source": source
        }

    # 3. Batch LLM Fallback (Single API Call)
    if confused_txns:
        print(f"Batching {len(confused_txns)} confused transactions to Gemini...")
        prompt = "Categorize the following transactions into strictly one of these categories: [Food, Shopping, Rent, Travel, Salary, UPI Transfer, Subscription, EMI, Investment, Bank Fees]. Return ONLY a valid JSON array of objects with keys 'index' and 'category'. Do not wrap in markdown or give any explanations.\n\nTransactions:\n"
        for c in confused_txns:
            prompt += f"Index: {c['index']} | Text: {c['text']}\n"
            
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={GEMINI_API_KEY}"
            headers = {'Content-Type': 'application/json'}
            data = {"contents": [{"parts":[{"text": prompt}]}]}
            
            resp = requests.post(url, headers=headers, json=data)
            resp_json = resp.json()
            
            if 'candidates' in resp_json:
                llm_text = resp_json['candidates'][0]['content']['parts'][0]['text'].strip()
                
                # Manual regex to handle markdown in python
                llm_text = re.sub(r"^```json\s*", "", llm_text)
                llm_text = re.sub(r"\s*```$", "", llm_text)
                llm_text = llm_text.strip()
                
                llm_results = json.loads(llm_text)
                for res in llm_results:
                    idx = res.get('index')
                    cat = res.get('category')
                    if idx is not None and cat:
                        transactions[idx]["mlData"]["predictedCategory"] = cat
                        transactions[idx]["mlData"]["confidenceScore"] = 0.99
                        transactions[idx]["mlData"]["source"] = "LLM_Fallback"
            else:
                print(f"Gemini Batch Fallback failed to parse response: {resp_json}")
        except Exception as e:
            print(f"Gemini Batch Fallback exception: {e}")

    # 4. Final Aggregation
    for txn in transactions:
        amount = float(txn.get("amount", 0.0))
        txn_type = txn.get("type", "DEBIT")
        predicted_category = txn["mlData"]["predictedCategory"]
        is_recurring = txn["mlData"]["isRecurring"]
        is_anomaly = txn["mlData"]["isAnomaly"]
        
        if txn_type == "CREDIT":
            total_income += amount
        else:
            total_expense += amount
            category_totals[predicted_category] = category_totals.get(predicted_category, 0) + amount
            if is_recurring:
                total_recurring_expense += amount
        
        if is_anomaly:
            anomalies_count += 1

    highest_cat = max(category_totals, key=category_totals.get) if category_totals else "None"
    
    if total_income == 0 and total_expense > 0:
        health_status = "CRITICAL"
    elif total_expense > total_income:
        health_status = "CRITICAL"
    elif total_expense > (total_income * 0.8):
        health_status = "WARNING"
    else:
        health_status = "GOOD"
    
    summary_metrics = {
        "totalIncome": round(total_income, 2),
        "totalExpense": round(total_expense, 2),
        "totalRecurringExpense": round(total_recurring_expense, 2),
        "anomaliesCount": anomalies_count,
        "financialHealth": health_status,
        "highestCategory": highest_cat,
        "categoryBreakdown": {k: round(v, 2) for k, v in category_totals.items()}
    }

    success = db_helper.update_document_results(doc_id, transactions, summary_metrics)
    if success:
        print(f"Successfully processed and updated {doc_id}")
    else:
        print(f"Failed to update Firestore for {doc_id}")

def pubsub_callback(message: pubsub_v1.subscriber.message.Message):
    doc_id = message.data.decode("utf-8")
    try:
        process_statement(doc_id)
        message.ack()
    except Exception as e:
        print(f"Error processing message: {e}")
        message.nack()

def start_consumer():
    print("Starting GCP Pub/Sub Consumer...")
    
    # Wait for the emulator to spin up
    time.sleep(5)
    setup_pubsub()
    
    subscriber = pubsub_v1.SubscriberClient()
    subscription_path = subscriber.subscription_path(PROJECT_ID, SUBSCRIPTION_ID)
    
    streaming_pull_future = subscriber.subscribe(subscription_path, callback=pubsub_callback)
    print(f"Listening for messages on {subscription_path}...")
    
    try:
        streaming_pull_future.result()
    except Exception as e:
        streaming_pull_future.cancel()
        print(f"Streaming pull canceled: {e}")

if __name__ == "__main__":
    start_consumer()
