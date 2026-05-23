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

for i in range(10):
    time.sleep(4) # Wait for Python ML and Gemini API to finish
    res = requests.get(status_url, headers=headers)
    data = res.json()
    print(f"Polling Attempt {i+1}: Status = {data.get('status')}")
    
    if data.get("status") == "COMPLETED":
        print("\n================== FINAL AI SUMMARY ==================")
        print("Total Income:", data["summaryMetrics"].get("totalIncome"))
        print("Total Expense:", data["summaryMetrics"].get("totalExpense"))
        print("Category Breakdown:", data["summaryMetrics"].get("categoryBreakdown"))
        print("\nGemini AI Advisor Recommendation:")
        print(data.get("aiSummary"))
        print("======================================================")
        break
