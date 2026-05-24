import os
from google.cloud import firestore

os.environ["FIRESTORE_EMULATOR_HOST"] = "127.0.0.1:8080"
db = firestore.Client(project="fintech-hackathon")

docs = db.collection("statements").stream()
for doc in docs:
    print(f"Deleting doc {doc.id}...")
    doc.reference.delete()
    
users = db.collection("users").stream()
for user in users:
    print(f"Deleting user {user.id}...")
    user.reference.delete()
    
print("All data wiped!")
