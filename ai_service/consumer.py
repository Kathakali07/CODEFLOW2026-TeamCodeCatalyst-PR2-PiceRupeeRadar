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
    category_totals = {}

    for txn in transactions:
        text = txn.get("rawNarration", "")
        amount = float(txn.get("amount", 0.0))
        txn_type = txn.get("type", "DEBIT")
        
        # ML Inference
        cat_result = ml_engine.categorize_transaction(text)
        predicted_category = cat_result["predictedCategory"]
        is_anomaly = ml_engine.detect_anomaly(amount)
        
        # Simple heuristic for recurring payments (EMI, Subscriptions, SIPs, Premiums)
        recurring_keywords = ["MONTHLY", "SIP", "PREMIUM", "EMI", "SUBSCRIPTION", "NACH", "SI/"]
        is_recurring = predicted_category in ["EMI", "Subscription"] or any(kw in text for kw in recurring_keywords)
        
        txn["mlData"] = {
            "predictedCategory": predicted_category,
            "confidenceScore": cat_result["confidenceScore"],
            "isAnomaly": is_anomaly,
            "isRecurring": is_recurring
        }
        
        if txn_type == "CREDIT":
            total_income += amount
        else:
            total_expense += amount
            category_totals[predicted_category] = category_totals.get(predicted_category, 0) + amount

    highest_cat = max(category_totals, key=category_totals.get) if category_totals else "None"
    
    summary_metrics = {
        "totalIncome": round(total_income, 2),
        "totalExpense": round(total_expense, 2),
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
