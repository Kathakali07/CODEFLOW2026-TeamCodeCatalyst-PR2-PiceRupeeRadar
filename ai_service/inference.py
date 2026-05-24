import os
import json
import pickle
import numpy as np
import tensorflow as tf
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import random

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model_weights")

class MLEngine:
    def __init__(self):
        self.distilbert_model = None
        self.tokenizer = None
        self.classes = None
        self.autoencoder_model = None
        self.scaler = None
        self.is_dummy = False
        
        self._load_artifacts()

    def _load_artifacts(self):
        try:
            # Categorization model (DistilBERT)
            self.distilbert_model = AutoModelForSequenceClassification.from_pretrained(os.path.join(MODEL_DIR, "distilbert_categorization_model"))
            self.distilbert_model.eval() # Set to evaluation mode
            
            self.tokenizer = AutoTokenizer.from_pretrained(os.path.join(MODEL_DIR, "distilbert_tokenizer"))
                
            with open(os.path.join(MODEL_DIR, "classes.json"), "r") as f:
                self.classes = json.load(f)

            # Anomaly model
            self.autoencoder_model = tf.keras.models.load_model(os.path.join(MODEL_DIR, "autoencoder_model.h5"), compile=False)
            
            with open(os.path.join(MODEL_DIR, "scaler.pkl"), "rb") as f:
                self.scaler = pickle.load(f)
                
            print("Successfully loaded all ML artifacts!")
        except Exception as e:
            print(f"WARNING: Could not load ML artifacts due to: {str(e)}")
            print("Falling back to DUMMY MODE for testing.")
            self.is_dummy = True
            self.classes = ['Food', 'Salary', 'Investment', 'Travel', 'Utilities']

    def categorize_transaction(self, text: str) -> dict:
        if self.is_dummy:
            return {
                "predictedCategory": random.choice(self.classes),
                "confidenceScore": round(random.uniform(0.6, 0.99), 2)
            }
            
        # Real inference
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=32)
        
        with torch.no_grad():
            outputs = self.distilbert_model(**inputs)
            
        logits = outputs.logits
        probs = torch.nn.functional.softmax(logits, dim=-1)
        
        max_idx = torch.argmax(probs, dim=1).item()
        confidence = probs[0][max_idx].item()
        
        return {
            "predictedCategory": self.classes[max_idx],
            "confidenceScore": float(confidence)
        }

    def detect_anomaly(self, amount: float, **kwargs) -> bool:
        if self.is_dummy:
            return random.random() > 0.95 # 5% chance of anomaly
            
        # Real inference
        expected_features = self.scaler.n_features_in_
        
        # Initialize with the mean of the training data so missing features don't cause huge reconstruction errors
        if hasattr(self.scaler, 'mean_') and self.scaler.mean_ is not None:
            features = np.expand_dims(self.scaler.mean_, axis=0).copy()
        else:
            features = np.zeros((1, expected_features))
            
        # We assign amount to the first feature. 
        features[0, 0] = amount 
        
        # Dynamic Feature Mapping
        mapping = {
            'velocity_score': 1,
            'deviation_score': 2,
            'time_of_day_risk': 3,
            'geographical_distance': 4
        }
        
        for kw, val in kwargs.items():
            if kw in mapping and mapping[kw] < expected_features:
                features[0, mapping[kw]] = float(val)
                
        scaled_features = self.scaler.transform(features)
        reconstructed = self.autoencoder_model.predict(scaled_features, verbose=0)
        
        mse = np.mean(np.power(scaled_features - reconstructed, 2), axis=1)[0]
        
        # Threshold logic - adjust based on your training loss
        # Increased to 50.0 to prevent false positives on typical salary amounts (e.g. 5000)
        # while still easily catching extreme outliers like 420,000 (MSE > 300k)
        threshold = 50.0 
        return bool(mse > threshold)

ml_engine = MLEngine()
