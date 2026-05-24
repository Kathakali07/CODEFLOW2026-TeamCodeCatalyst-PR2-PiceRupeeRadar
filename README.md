# Pice Rupee Radar (P.A.E) 🚀

Welcome to **Pice Rupee Radar (P.A.E)**, a next-generation AI-powered personal financial assistant. Available on both **Web** and **Mobile**, this platform automatically parses your bank statements, detects spending anomalies, tracks your subscriptions, and provides intelligent, personalized investment recommendations.

---

## 🌟 Core System Architecture & Features

This platform is engineered using modern, scalable, and resilient design patterns rather than a traditional monolithic approach.

### 🧩 Decentralized Microservices
The system is fully decoupled into distinct, specialized services communicating securely over the network:
- **Core API Service (Java/Spring Boot):** Acts as the central nervous system, handling authentication, user state, and business logic.
- **AI/ML Service (Python/FastAPI):** Dedicated to heavy compute tasks like Machine Learning and PDF processing.
- **Web Frontend (React/Vite) & Mobile App (React Native):** Cross-platform, responsive presentation layers consuming the unified APIs.

### ⚡ Event-Driven & Scalable
Designed to handle intensive workloads without blocking the main application thread. Uploaded bank statements trigger asynchronous, event-driven processing pipelines, ensuring the UI remains highly responsive while complex anomaly detection and ledger aggregations execute in the background.

### 🛡️ Robust Security & API Rate Limiting
To prevent abuse, resource exhaustion, and potential DDoS attacks, the backend implements **strict API Rate Limiting**. High-cost endpoints (like file parsing and AI chat) are carefully throttled per user, ensuring high availability and cost control across the distributed environment.

---

## 🧠 Explicit LLM Boundaries (Gemini AI)

While P.A.E features advanced artificial intelligence, we enforce strict, deterministic boundaries on where large language models (LLMs) are utilized. 

**The Gemini LLM is used EXCLUSIVELY for:**
1. **OCR / Statement Parsing:** Extracting raw, unstructured text from complex bank statement PDFs into structured data.
2. **AI Summary:** Generating human-readable, high-level summaries of a user's financial health based on parsed data.
3. **Interactive Chatbot:** Powering the conversational UI where users can query their spending patterns. 

*Note: All other critical operations—including transaction categorizations, mathematical ledger aggregations, anomaly detection (using autoencoders), and subscription matching—are handled by dedicated, deterministic ML models or strict code logic, ensuring 100% financial accuracy free from LLM hallucinations.*

---

## 🔐 System Guardrails
The conversational AI is strictly bounded by backend-injected prompt guardrails. It is hardcoded to instantly decline answering non-financial, political, or off-topic questions, ensuring a safe, focused environment.

---

## 👥 Contributors
- **Satyam**
- **Rabishankar**
- **Kathakali**
- **Saheli**

Built by Team CodeCatalyst.
