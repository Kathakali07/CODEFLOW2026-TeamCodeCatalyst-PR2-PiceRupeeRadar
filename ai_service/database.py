import os
from google.cloud import firestore

# During local development, the emulator variables must be set before initializing the client.
# docker-compose maps firestore to 8080.
if os.getenv("USE_GCP_EMULATOR", "true").lower() == "true":
    os.environ["FIRESTORE_EMULATOR_HOST"] = "127.0.0.1:8080"
    
# In production on Cloud Run, it automatically picks up the default project credentials.
# For local emulator, project ID can be dummy.
PROJECT_ID = os.getenv("GCP_PROJECT", "fintech-hackathon")
COLLECTION_NAME = "statements"

class DatabaseHelper:
    def __init__(self):
        self.db = firestore.Client(project=PROJECT_ID)
        self.collection = self.db.collection(COLLECTION_NAME)

    def get_document(self, doc_id: str):
        doc_ref = self.collection.document(doc_id)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict()
        return None

    def update_document_results(self, doc_id: str, updated_transactions: list, summary_metrics: dict):
        """
        Updates the Firestore document with ML predictions.
        """
        doc_ref = self.collection.document(doc_id)
        
        try:
            doc_ref.update({
                "transactions": updated_transactions,
                "summaryMetrics": summary_metrics,
                "status": "COMPLETED"
            })
            return True
        except Exception as e:
            print(f"Firestore Update Error: {e}")
            return False

db_helper = DatabaseHelper()
