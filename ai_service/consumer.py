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
    
    from collections import Counter
    import re
    
    # PASS 1: Pre-computation for Multivariate ML Features
    date_counts = Counter()
    category_amounts = {}
    
    for txn in transactions:
        text = txn.get("rawNarration", "")
        amount = float(txn.get("amount", 0.0))
        date = txn.get("date", "")
        
        # Categorize early so we can compute category deviation
        cat_result = ml_engine.categorize_transaction(text)
        txn["predictedCategory"] = cat_result["predictedCategory"]
        txn["confidenceScore"] = cat_result["confidenceScore"]
        
        date_counts[date] += 1
        if txn["predictedCategory"] not in category_amounts:
            category_amounts[txn["predictedCategory"]] = []
        category_amounts[txn["predictedCategory"]].append(amount)
        
    category_means = {cat: sum(amts)/len(amts) for cat, amts in category_amounts.items()}

    # PASS 2: Feature Extraction and Inference
    for txn in transactions:
        text = txn.get("rawNarration", "")
        amount = float(txn.get("amount", 0.0))
        txn_type = txn.get("type", "DEBIT")
        date = txn.get("date", "")
        predicted_category = txn["predictedCategory"]
        confidence_score = txn["confidenceScore"]
        
        # Extract multivariate features
        velocity_score = float(date_counts[date])
        deviation_score = abs(amount - category_means[predicted_category])
        
        # ML Inference using dynamic kwargs
        is_anomaly = ml_engine.detect_anomaly(
            amount, 
            velocity_score=velocity_score, 
            deviation_score=deviation_score
        )
        
        # Simple heuristic for recurring payments (EMI, Subscriptions, SIPs, Premiums)
        recurring_keywords = [r"\bMONTHLY\b", r"\bSIP\b", r"\bPREMIUM\b", r"\bEMI\b", r"\bSUBSCRIPTION\b", r"\bNACH\b", r"\bSI/"]
        model_is_recurring = predicted_category in ["EMI", "Subscription"] and confidence_score > 0.97
        is_recurring = model_is_recurring or any(re.search(kw, text.upper()) for kw in recurring_keywords)
        
        txn["mlData"] = {
            "predictedCategory": predicted_category,
            "confidenceScore": confidence_score,
            "isAnomaly": is_anomaly,
            "isRecurring": is_recurring
        }
        
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
    
    # Calculate Financial Health Indicator
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
