import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle
import os

# --- 1. CONFIGURATION ---
# Adjust the dataset path based on Kaggle's actual input directory structure
DATASET_PATH = '/kaggle/input/financial-transactions-dataset-for-fraud-detection/transactions.csv'
# INPUT_FEATURES will be calculated dynamically based on available columns

print(f"TensorFlow Version: {tf.__version__}")

# --- 2. DATA LOADING & PREPROCESSING ---
print("Loading data...")
df = pd.read_csv(DATASET_PATH)

print(f"Original dataset shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")

# Automatically select all numerical columns to maximize model accuracy
all_numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

# Exclude the target variable and any ID/account columns that shouldn't be trained on
cols_to_exclude = ['is_fraud', 'transaction_id', 'sender_account', 'receiver_account', 'timestamp']
NUMERICAL_COLS = [col for col in all_numeric_cols if col not in cols_to_exclude]

INPUT_FEATURES = len(NUMERICAL_COLS)
print(f"Using {INPUT_FEATURES} numerical features for training: {NUMERICAL_COLS}")

# Drop missing rows for these specific columns
df = df.dropna(subset=NUMERICAL_COLS + ['is_fraud'])

# For Autoencoders, we train ONLY on normal/non-fraudulent data (is_fraud == 0)
normal_data = df[df['is_fraud'] == 0]
fraud_data = df[df['is_fraud'] == 1]

print(f"Normal transactions count: {len(normal_data)}")
print(f"Fraud transactions count: {len(fraud_data)}")

# Extract the selected features
X_normal = normal_data[NUMERICAL_COLS].values
X_fraud = fraud_data[NUMERICAL_COLS].values

# Split normal data into Train and Validation
X_train, X_val = train_test_split(X_normal, test_size=0.2, random_state=42)

# --- 3. SCALING ---
print("Scaling numerical features...")
scaler = StandardScaler()

# Fit scaler strictly on training normal data to avoid data leakage
X_train_scaled = scaler.fit_transform(X_train)

# Transform validation and fraud data
X_val_scaled = scaler.transform(X_val)
X_fraud_scaled = scaler.transform(X_fraud)

# --- 4. MODEL ARCHITECTURE ---
print(f"Building Autoencoder model for {INPUT_FEATURES} features...")
# Dynamically scale the neural network layers based on the number of input features
first_layer_nodes = max(8, int(INPUT_FEATURES * 0.75))
bottleneck_nodes = max(4, int(INPUT_FEATURES * 0.5))

model = tf.keras.Sequential([
    # Encoder
    tf.keras.layers.Dense(first_layer_nodes, activation='relu', input_shape=(INPUT_FEATURES,)),
    # Bottleneck
    tf.keras.layers.Dense(bottleneck_nodes, activation='relu'),
    # Decoder
    tf.keras.layers.Dense(first_layer_nodes, activation='relu'),
    # Output layer (linear activation to reconstruct inputs)
    tf.keras.layers.Dense(INPUT_FEATURES, activation='linear')
])

model.compile(optimizer='adam', loss='mse')
model.summary()

# --- 5. TRAINING ---
print("Starting training...")
# Autoencoders learn to reconstruct the input, so X_train is both input and target
history = model.fit(
    X_train_scaled, X_train_scaled,
    validation_data=(X_val_scaled, X_val_scaled),
    epochs=15,
    batch_size=64,
    callbacks=[tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)]
)

# --- 6. SAVING ARTIFACTS ---
print("Saving artifacts to /kaggle/working/...")
WORK_DIR = '/kaggle/working/'

# Save model
model.save(os.path.join(WORK_DIR, 'autoencoder_model.h5'))

# Save scaler (crucial for inference API)
with open(os.path.join(WORK_DIR, 'scaler.pkl'), 'wb') as f:
    pickle.dump(scaler, f)
    
print("Training complete! Please download autoencoder_model.h5 and scaler.pkl.")
