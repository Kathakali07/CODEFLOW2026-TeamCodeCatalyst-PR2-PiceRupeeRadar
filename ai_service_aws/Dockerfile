FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

EXPOSE 8080

# Start the FastAPI wrapper (which spins up the SQS thread automatically)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
