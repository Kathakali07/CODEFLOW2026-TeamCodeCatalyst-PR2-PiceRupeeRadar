import os
import time
import boto3
import requests
import json
import re
import uuid
from collections import defaultdict
from dotenv import load_dotenv
from database import db_helper
from inference import ml_engine
from botocore.config import Config

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "dummy_key")

# AWS SQS Setup
AWS_REGION = os.getenv('AWS_REGION', 'ap-south-1')
QUEUE_NAME = 'analyze-statement-queue'
sqs = boto3.client('sqs', region_name=AWS_REGION)

def get_queue_url():
    try:
        response = sqs.get_queue_url(QueueName=QUEUE_NAME)
        return response['QueueUrl']
    except sqs.exceptions.QueueDoesNotExist:
        # Create queue if it doesn't exist (helpful for local/hackathon testing)
        response = sqs.create_queue(QueueName=QUEUE_NAME)
        print(f"Created SQS Queue: {QUEUE_NAME}")
        return response['QueueUrl']

QUEUE_URL = get_queue_url()

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
        print(f"Error: Document {doc_id} not found in DynamoDB.")
        return False

    transactions = doc.get("transactions", [])
    raw_text = doc.get("rawText", None)
    
    # 1. If we have rawText but no transactions, we need to extract transactions via Bedrock LLM first
    if raw_text and not transactions:
        print(f"Extracting transactions from raw PDF text via Bedrock for {doc_id}...")
        prompt = "You are a financial data extraction AI. Extract all bank transactions from the following raw text extracted from a PDF bank statement. " + \
                 "Return ONLY a strict JSON array of objects. Do not wrap it in markdown block quotes. Each object must have exactly these keys: " + \
                 "'date' (String, YYYY-MM-DD), 'rawNarration' (String), 'amount' (Number), 'type' (String, strictly 'CREDIT' or 'DEBIT'). " + \
                 "If it is an expense/withdrawal, it is a DEBIT. If it is an income/deposit, it is a CREDIT. " + \
                 "Do not include any explanation or extra text.\n\nRAW PDF TEXT:\n" + raw_text

        try:
            config = Config(read_timeout=300, retries={'max_attempts': 1})
            bedrock = boto3.client('bedrock-runtime', region_name=AWS_REGION, config=config)
            response = bedrock.converse(
                modelId="google.gemma-3-27b-it",
                messages=[{"role": "user", "content": [{"text": prompt}]}],
                inferenceConfig={"temperature": 0.0}
            )
            extracted_text = response['output']['message']['content'][0]['text'].strip()
            
            # Clean JSON wrapping
            extracted_text = re.sub(r"^```json\s*", "", extracted_text)
            extracted_text = re.sub(r"\s*```$", "", extracted_text)
            extracted_text = extracted_text.strip()
            
            transactions = json.loads(extracted_text)
            
            # Ensure required fields and generate UUIDs
            for t in transactions:
                t['txnId'] = str(uuid.uuid4())
                t['amount'] = float(t.get('amount', 0.0))
                t['rawNarration'] = t.get('rawNarration', '')
                t['date'] = t.get('date', '')
                t['type'] = t.get('type', 'DEBIT')
                
            print(f"Successfully extracted {len(transactions)} transactions.")
        except Exception as e:
            print(f"Error extracting transactions via Bedrock: {e}")
            return False
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
        # DynamoDB uses Decimal for floats, convert to float
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

    # 3. Batch LLM Fallback via AWS Bedrock (Claude 3 Haiku)
    if confused_txns:
        print(f"Batching {len(confused_txns)} confused transactions to AWS Bedrock...")
        prompt = "Categorize the following transactions into strictly one of these categories: [Food, Shopping, Rent, Travel, Salary, UPI Transfer, Subscription, EMI, Investment, Bank Fees]. Return ONLY a valid JSON array of objects with keys 'index' and 'category'. Do not wrap in markdown or give any explanations.\n\nTransactions:\n"
        for c in confused_txns:
            prompt += f"Index: {c['index']} | Text: {c['text']}\n"
            
        try:
            bedrock = boto3.client('bedrock-runtime', region_name=AWS_REGION)
            response = bedrock.converse(
                modelId="google.gemma-3-27b-it",
                messages=[
                    {
                        "role": "user",
                        "content": [{"text": prompt}]
                    }
                ],
                inferenceConfig={"temperature": 0.0}
            )
            
            llm_text = response['output']['message']['content'][0]['text'].strip()
            
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
                    transactions[idx]["mlData"]["source"] = "AWS_Bedrock"
        except Exception as e:
            print(f"AWS Bedrock Batch Fallback exception: {e}")

    # 4. Final Aggregation
    for txn in transactions:
        amount = float(txn.get("amount", 0.0))
        txn_type = txn.get("type", "DEBIT")
        predicted_category = txn["mlData"]["predictedCategory"]
        is_recurring = txn["mlData"]["isRecurring"]
        is_anomaly = txn["mlData"]["isAnomaly"]
        
        # Fix formatting for DynamoDB (Cannot store float, but can store python float directly via boto3 as it converts to Decimal)
        # We will keep it as python float/int, boto3 handles it.
        
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
        "totalIncome": int(total_income), # Use int to avoid DynamoDB decimal conversion issues if minor precision lost
        "totalExpense": int(total_expense),
        "totalRecurringExpense": int(total_recurring_expense),
        "anomaliesCount": anomalies_count,
        "financialHealth": health_status,
        "highestCategory": highest_cat,
        "categoryBreakdown": {k: int(v) for k, v in category_totals.items()}
    }

    # Fix transaction amounts for DynamoDB (Convert float to int for safety in JSON structure)
    for txn in transactions:
        txn['amount'] = int(float(txn['amount']))
        txn['mlData']['confidenceScore'] = str(txn['mlData']['confidenceScore']) # Keep float precision as string

    # 5. Generate AI Financial Advice instantly before saving COMPLETED status
    ai_summary = "AI Advisor is currently analyzing your data. Please check back later."
    try:
        bedrock = boto3.client('bedrock-runtime', region_name=AWS_REGION)
        prompt = f"You are a professional, empathetic, and highly analytical financial advisor for a premium FinTech app. Your client has a total monthly income of ₹{total_income:,.2f} and total expenses of ₹{total_expense:,.2f}. Their highest spending category is '{highest_cat}'. Write a 2-3 sentence personalized financial recommendation that is encouraging, insightful, and professional. Do not use markdown, and ensure the tone is suitable for a professional banking application."
        
        response = bedrock.converse(
            modelId="google.gemma-3-27b-it",
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={"temperature": 0.5}
        )
        ai_summary = response['output']['message']['content'][0]['text'].strip()
        print("Generated AI Financial Advice.")
    except Exception as e:
        print(f"Error generating AI summary: {e}")

    success = db_helper.update_document_results(doc_id, transactions, summary_metrics, ai_summary)
    if success:
        print(f"Successfully processed and updated DynamoDB for {doc_id}")
        return True
    else:
        print(f"Failed to update DynamoDB for {doc_id}")
        return False

def start_consumer():
    print(f"Starting AWS SQS Consumer on {QUEUE_URL}...")
    
    while True:
        try:
            # Long polling for 20 seconds
            response = sqs.receive_message(
                QueueUrl=QUEUE_URL,
                MaxNumberOfMessages=1,
                WaitTimeSeconds=20
            )
            
            messages = response.get('Messages', [])
            for message in messages:
                doc_id = message['Body']
                receipt_handle = message['ReceiptHandle']
                
                print(f"Received message for docId: {doc_id}")
                success = process_statement(doc_id)
                
                if success:
                    # Delete message from queue
                    sqs.delete_message(
                        QueueUrl=QUEUE_URL,
                        ReceiptHandle=receipt_handle
                    )
                    print("Deleted message from queue.")
                    
        except Exception as e:
            print(f"Error polling SQS: {e}")
            time.sleep(5)

if __name__ == "__main__":
    start_consumer()
