import os
import time
from google.cloud import firestore
from google.cloud import pubsub_v1
from google.api_core.exceptions import AlreadyExists

# Emulator setup for local dev
if os.getenv("USE_GCP_EMULATOR", "true").lower() == "true":
    os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
    os.environ["PUBSUB_EMULATOR_HOST"] = "localhost:8085"

PROJECT_ID = os.getenv("GCP_PROJECT", "fintech-hackathon")
COLLECTION_NAME = "statements"
TOPIC_ID = "analyze-statement-topic"

print("1. Connecting to Firestore Emulator...")
db = firestore.Client(project=PROJECT_ID)
collection = db.collection(COLLECTION_NAME)

# Highly realistic, messy, and obscure synthetic Indian Bank Transactions
dummy_doc = {
    "userId": "user_ind_9988",
    "status": "PROCESSING",
    "transactions": [
        {
            "txnId": "txn_101",
            "rawNarration": "UPI/P2M/3123456789/ZOMATO/HDFC",
            "amount": 345.50,
            "type": "DEBIT",
            "date": "2026-05-20"
        },
        {
            "txnId": "txn_102",
            "rawNarration": "NEFT-IN-SBIN0001234-TCS LTD-SALARY MAY",
            "amount": 125000.00,
            "type": "CREDIT",
            "date": "2026-05-21"
        },
        {
            "txnId": "txn_103",
            "rawNarration": "POS 45678XXXXX123 RELIANCE SMART",
            "amount": 4500.00,
            "type": "DEBIT",
            "date": "2026-05-22"
        },
        {
            "txnId": "txn_104",
            "rawNarration": "ACH/D/LIC PREMIUM/POL1234567",
            "amount": 1250.00,
            "type": "DEBIT",
            "date": "2026-05-22"
        },
        {
            "txnId": "txn_105",
            "rawNarration": "IMPS/P2A/9876543/JOHN DOE/RENT",
            "amount": 18000.00,
            "type": "DEBIT",
            "date": "2026-05-23"
        },
        {
            "txnId": "txn_106",
            "rawNarration": "INTERNATIONAL TXN / PAYPAL / USD 5000 / UNUSUAL",
            "amount": 420000.00, # Very high amount, should trigger anomaly!
            "type": "DEBIT",
            "date": "2026-05-23"
        },
        {
            "txnId": "txn_107",
            "rawNarration": "UPI/314159265/AMAZON SELLER SERVICES/ICICI",
            "amount": 1299.00,
            "type": "DEBIT",
            "date": "2026-05-24"
        },
        {
            "txnId": "txn_108",
            "rawNarration": "BIL/0987654321/MSEDCL/ELECTRICITY/BILLDESK",
            "amount": 2350.00,
            "type": "DEBIT",
            "date": "2026-05-25"
        },
        {
            "txnId": "txn_109",
            "rawNarration": "NACH/GROWW/BSE/MUTUAL FUND SIP",
            "amount": 5000.00,
            "type": "DEBIT",
            "date": "2026-05-25"
        },
        {
            "txnId": "txn_110",
            "rawNarration": "ATM/WDL/9082/SANTACRUZ/MUMBAI",
            "amount": 10000.00,
            "type": "DEBIT",
            "date": "2026-05-26"
        },
        {
            "txnId": "txn_111",
            "rawNarration": "UPI/CR/99018/BHARATPE/MERCHANT REFUND",
            "amount": 450.00,
            "type": "CREDIT",
            "date": "2026-05-26"
        },
        {
            "txnId": "txn_112",
            "rawNarration": "POS 112233XX OLA CABS/TRIP REF 9988",
            "amount": 320.00,
            "type": "DEBIT",
            "date": "2026-05-27"
        },
        {
            "txnId": "txn_113",
            "rawNarration": "SI/NETFLIX.COM/87654321/MONTHLY",
            "amount": 649.00,
            "type": "DEBIT",
            "date": "2026-05-28"
        },
        {
            "txnId": "txn_114",
            "rawNarration": "RTGS/IND/00112233/ZERODHA BROKING LTD",
            "amount": 50000.00,
            "type": "DEBIT",
            "date": "2026-05-29"
        },
        {
            "txnId": "txn_115",
            "rawNarration": "UPI/P2P/11223344/SWIGGY INSTAMART/HDFC",
            "amount": 890.00,
            "type": "DEBIT",
            "date": "2026-05-29"
        },
        {
            "txnId": "txn_116",
            "rawNarration": "TRF/EMI/LOAN A/C 9988776655/HDFC BANK",
            "amount": 14500.00,
            "type": "DEBIT",
            "date": "2026-05-30"
        },
        {
            "txnId": "txn_117",
            "rawNarration": "NEFT-CR-AXIS0009988-DIVIDEND-RELIANCE IND",
            "amount": 1250.00,
            "type": "CREDIT",
            "date": "2026-05-31"
        },
        {
            "txnId": "txn_118",
            "rawNarration": "FEE/ANNUAL MAINTENANCE CHARGE/DEBIT CARD",
            "amount": 590.00,
            "type": "DEBIT",
            "date": "2026-05-31"
        },
        {
            "txnId": "txn_119",
            "rawNarration": "POS 998877XXXXX111 MAKE MY TRIP INDIA",
            "amount": 18500.00,
            "type": "DEBIT",
            "date": "2026-06-01"
        },
        {
            "txnId": "txn_120",
            "rawNarration": "UPI/123456789/UNKNOWN STRANGE TXN/GPY",
            "amount": 200000.00, # Another potential anomaly
            "type": "DEBIT",
            "date": "2026-06-01"
        }
    ]
}

# Insert into Firestore
doc_id = "test_statement_ind_001"
doc_ref = collection.document(doc_id)
doc_ref.set(dummy_doc)
print(f"Inserted realistic Document '{doc_id}' into Firestore.")

print("2. Connecting to Pub/Sub Emulator...")
publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(PROJECT_ID, TOPIC_ID)

# Ensure topic exists
try:
    publisher.create_topic(request={"name": topic_path})
except AlreadyExists:
    pass

# Publish Message
future = publisher.publish(topic_path, doc_id.encode("utf-8"))
message_id = future.result()

print(f"Published '{doc_id}' to Pub/Sub Topic {TOPIC_ID} (Message ID: {message_id}).")
print("Check your FastAPI server logs to see the consumer process it! It should categorize 'ZOMATO' as Food, 'TCS' as Salary, and hopefully flag the 4.2 Lakh Paypal transaction as an anomaly!")
