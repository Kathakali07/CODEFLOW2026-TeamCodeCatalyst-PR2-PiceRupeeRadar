from fastapi import FastAPI, BackgroundTasks
import threading
from consumer import start_consumer

app = FastAPI(title="AI FinTech Execution Engine")

# Start the RabbitMQ consumer in a background thread when the API starts
@app.on_event("startup")
def startup_event():
    print("Starting up FastAPI and initializing background consumer thread...")
    consumer_thread = threading.Thread(target=start_consumer, daemon=True)
    consumer_thread.start()

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "AI Execution Engine"}

@app.get("/")
def root():
    return {"message": "AI FinTech Bank Statement Analyzer - Execution Service is Running!"}
