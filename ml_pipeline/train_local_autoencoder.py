import pandas as pd
import numpy as np
import random
import string
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle
import os

# 1. Feature Engineering: Calculate Merchant Sketchiness
def calculate_sketchiness(merchant_string):
    """Calculates the ratio of numbers and special characters to total length.
       Normal: 'Zomato' -> Score: 0.0
       Sketchy: 'q911440666@ybl' -> Score: 0.71"""
    merchant_string = str(merchant_string)
    if len(merchant_string) == 0: return 0.0
    
    non_alpha_count = sum(1 for char in merchant_string if not char.isalpha())
    return round(non_alpha_count / len(merchant_string), 2)

def generate_base_data(num_rows=50000):
    print("Generating base synthetic dataset (USD)...")
    merchants = ["Netflix", "Spotify", "Amazon", "Uber", "Starbucks", "Local Grocer", "Gym", "Zomato", "Swiggy"]
    
    rows = []
    for _ in range(num_rows):
        amount_usd = max(1.0, np.random.normal(30.0, 20.0))
        merchant = random.choice(merchants)
        rows.append({
            'amount': amount_usd,
            'merchant': merchant,
            'is_fraud': 0
        })
    return pd.DataFrame(rows)

def transform_and_train(output_dir):
    # 2. Load and Scale the Base Data
    print("Generating large dataset...")
    df = generate_base_data(250000) # Increased to 250,000 for better Autoencoder learning
    
    # Converts USD to INR to match the variance of Indian bank statements.
    df['amount_inr'] = df['amount'] * 83.5 
    
    # Applies the sketchiness mathematical function
    df['merchant_sketchiness_score'] = df['merchant'].apply(calculate_sketchiness)
    
    # 3. Inject Synthetic "Micro-Splitting" (Money Muling) Fraud
    print("Injecting synthetic Indian UPI fraud rings...")
    synthetic_fraud_rows = []
    
    # Increased fraud rings to 2500 to match the ~1% ratio in the larger dataset
    for _ in range(2500):
        fraud_amount = random.choice([2000.0, 5000.0, 9999.0])
        sketchy_vpa = ''.join(random.choices(string.ascii_lowercase + string.digits, k=12)) + "@ybl"
        sketchiness = calculate_sketchiness(sketchy_vpa)
        
        num_splits = random.randint(5, 10) 
        for _ in range(num_splits):
            synthetic_fraud_rows.append({
                'amount': fraud_amount / 83.5, # Dummy original
                'amount_inr': fraud_amount,
                'merchant': sketchy_vpa,
                'merchant_sketchiness_score': sketchiness,
                'is_fraud': 1 
            })
            
    # 4. Merge and Export
    fraud_df = pd.DataFrame(synthetic_fraud_rows)
    final_df = pd.concat([df, fraud_df], ignore_index=True)
    final_df = final_df.sample(frac=1, random_state=42).reset_index(drop=True) 
    
    # --- TRAINING THE AUTOENCODER ---
    print("Preparing features for Autoencoder training...")
    
    # We will use exactly 2 features for anomaly detection to keep it perfectly calibrated:
    # 1. amount_inr
    # 2. merchant_sketchiness_score
    NUMERICAL_COLS = ['amount_inr', 'merchant_sketchiness_score']
    INPUT_FEATURES = len(NUMERICAL_COLS)
    
    normal_data = final_df[final_df['is_fraud'] == 0]
    fraud_data = final_df[final_df['is_fraud'] == 1]
    
    X_normal = normal_data[NUMERICAL_COLS].values
    
    X_train, X_val = train_test_split(X_normal, test_size=0.2, random_state=42)
    
    print("Scaling numerical features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(8, activation='relu', input_shape=(INPUT_FEATURES,)),
        tf.keras.layers.Dense(4, activation='relu'),
        tf.keras.layers.Dense(8, activation='relu'),
        tf.keras.layers.Dense(INPUT_FEATURES, activation='linear')
    ])
    
    model.compile(optimizer='adam', loss='mse')
    
    print("Starting training...")
    history = model.fit(
        X_train_scaled, X_train_scaled,
        validation_data=(X_val_scaled, X_val_scaled),
        epochs=10,
        batch_size=64,
        callbacks=[tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)]
    )
    
    # Save artifacts directly to ai_service
    os.makedirs(output_dir, exist_ok=True)
    model.save(os.path.join(output_dir, 'autoencoder_model.h5'))
    
    with open(os.path.join(output_dir, 'scaler.pkl'), 'wb') as f:
        pickle.dump(scaler, f)
        
    print(f"Training complete! Artifacts saved to {output_dir}")

if __name__ == "__main__":
    transform_and_train('e:/Projects/P.A.E/ai_service')
