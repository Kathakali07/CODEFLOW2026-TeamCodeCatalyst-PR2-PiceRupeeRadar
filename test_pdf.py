import requests
import time
from fpdf import FPDF
import sys

# 1. Generate a dummy PDF Bank Statement (COMMENTED OUT)
# pdf = FPDF()
# pdf.add_page()
# ... skipping dummy generation ...

pdf_filename = "Bandhan.pdf"
print(f"[*] Using real PDF: {pdf_filename}")

# 2. Upload to Spring Boot API
url = "http://localhost:8081/api/statements/upload"
token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyX2luZF85OTg4IiwiaWF0IjoxNzc5NTQ3NTgxLCJleHAiOjE3Nzk2MzM5ODF9.t6O9P8sO83IxNDgRNukxaxzPVpnIiJ9BkpuSAnsbJhI"

headers = {
    "Authorization": f"Bearer {token}"
}

print("\n[*] Uploading PDF to API with JWT Token...")
with open(pdf_filename, "rb") as f:
    files = {"file": (pdf_filename, f, "application/pdf")}
    response = requests.post(url, headers=headers, files=files)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code != 200:
    print("Upload failed. Make sure Spring Boot is running and the token is correct.")
    sys.exit(1)

doc_id = response.json().get("documentId")

# 3. Poll for Status
print(f"\n[*] Polling status for Document ID: {doc_id}")
status_url = f"http://localhost:8081/api/statements/status/{doc_id}"

for i in range(45): # Increased to 45 attempts (up to 3 minutes) for slow LLM extraction
    time.sleep(4) 
    res = requests.get(status_url, headers=headers)
    data = res.json()
    status = data.get("status")
    
    if status == "EXTRACTING_PDF":
        print(f"Polling Attempt {i+1}: ⏳ EXTRACTING_PDF (Gemini 3.5 AI is reading the document...)")
    elif status == "PROCESSING":
        print(f"Polling Attempt {i+1}: ⚙️ PROCESSING (Python ML is running DistilBERT & Autoencoder...)")
    else:
        print(f"Polling Attempt {i+1}: ✅ Status = {status}")
    
    if status == "COMPLETED":
        print("\n================== FINAL AI SUMMARY ==================")
        print("Highest Category:", data["summaryMetrics"].get("highestCategory"))
        print("Total Income:", data["summaryMetrics"].get("totalIncome"))
        print("Total Expense:", data["summaryMetrics"].get("totalExpense"))
        print("Recurring Expense:", data["summaryMetrics"].get("totalRecurringExpense"))
        print("Anomalies Count:", data["summaryMetrics"].get("anomaliesCount"))
        print("Financial Health:", data["summaryMetrics"].get("financialHealth"))
        print("Category Breakdown:", data["summaryMetrics"].get("categoryBreakdown"))
        print("\nGemini AI Advisor Recommendation:")
        print(data.get("aiSummary"))
        print("======================================================")
        
        # 4. Fetch Full Document to show Zero-Redundancy grouped lists
        print("\n[*] Fetching Full Document for Frontend Dashboard...")
        full_doc_url = f"http://localhost:8081/api/statements/{doc_id}"
        full_res = requests.get(full_doc_url, headers=headers)
        full_data = full_res.json()
        
        print("\n--- ZERO REDUNDANCY FRONTEND LISTS ---")
        anomalies_list = full_data.get("anomalousTransactions", [])
        recurring_list = full_data.get("recurringTransactions", [])
        
        print(f"Number of Anomalous Transactions ready for UI: {len(anomalies_list)}")
        if anomalies_list:
            print(f"  Example Anomaly: {anomalies_list[0].get('rawNarration')} -> {anomalies_list[0].get('amount')}")
            
        print(f"Number of Recurring Transactions ready for UI: {len(recurring_list)}")
        if recurring_list:
            print(f"  Example Recurring: {recurring_list[0].get('rawNarration')} -> {recurring_list[0].get('amount')}")
        
        print("\nExpense Breakdown Transaction Lists:")
        breakdown_lists = full_data.get("expenseBreakdownTransactions", {})
        for cat, txns in breakdown_lists.items():
            print(f"  - {cat}: {len(txns)} transactions")
        
        break
