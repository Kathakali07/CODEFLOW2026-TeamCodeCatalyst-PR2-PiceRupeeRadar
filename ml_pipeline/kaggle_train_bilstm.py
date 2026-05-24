import pandas as pd
import numpy as np
import re
import json
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import os

# --- 1. CONFIGURATION ---
# Adjust the dataset paths based on Kaggle's actual input directory structure
TRAIN_PATH = '/kaggle/input/indian-banking-transaction-text-dataset/financial_transaction_train.csv'
TEST_PATH = '/kaggle/input/indian-banking-transaction-text-dataset/financial_transaction_test.csv'
MAX_VOCAB_SIZE = 5000
MAX_SEQ_LENGTH = 15
EMBEDDING_DIM = 64

print(f"TensorFlow Version: {tf.__version__}")

# --- 2. DATA LOADING & PREPROCESSING ---
print("Loading data...")
# Read datasets (adjust column names if they differ slightly)
df_train = pd.read_csv(TRAIN_PATH)
df_test = pd.read_csv(TEST_PATH)
df = pd.concat([df_train, df_test], ignore_index=True)

# Assume columns are 'Transaction_Text' and 'Label' based on dataset description
text_col = 'Transaction_Text' if 'Transaction_Text' in df.columns else df.columns[0]
label_col = 'Label' if 'Label' in df.columns else df.columns[1]

# Drop missing values
df = df.dropna(subset=[text_col, label_col])

def clean_text(text):
    text = str(text).upper()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\b\d+\b', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

print("Cleaning text data...")
df['clean_text'] = df[text_col].apply(clean_text)

# Encode Labels (String Categories -> Integers)
label_encoder = LabelEncoder()
df['encoded_label'] = label_encoder.fit_transform(df[label_col])
num_classes = len(label_encoder.classes_)
print(f"Found {num_classes} categories: {list(label_encoder.classes_)}")

# Tokenize text
print("Tokenizing text...")
tokenizer = Tokenizer(num_words=MAX_VOCAB_SIZE, oov_token="<OOV>")
tokenizer.fit_on_texts(df['clean_text'])

# Convert text to sequences of integers
X_sequences = tokenizer.texts_to_sequences(df['clean_text'])
X_padded = pad_sequences(X_sequences, maxlen=MAX_SEQ_LENGTH, padding='post', truncating='post')
y = df['encoded_label'].values

# Train/Test Split
X_train, X_val, y_train, y_val = train_test_split(X_padded, y, test_size=0.2, random_state=42)

# --- 3. MODEL ARCHITECTURE ---
print("Building BiLSTM model...")
model = tf.keras.Sequential([
    tf.keras.layers.Embedding(input_dim=MAX_VOCAB_SIZE, output_dim=EMBEDDING_DIM, input_length=MAX_SEQ_LENGTH),
    tf.keras.layers.Bidirectional(tf.keras.layers.LSTM(64)),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(num_classes, activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
model.summary()

# --- 4. TRAINING ---
print("Starting training...")
history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=10,
    batch_size=32,
    callbacks=[tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=2, restore_best_weights=True)]
)

# --- 5. SAVING ARTIFACTS ---
print("Saving artifacts to /kaggle/working/...")
WORK_DIR = '/kaggle/working/'

# Save the trained model weights
model.save(os.path.join(WORK_DIR, 'categorization_model.h5'))

# Save the tokenizer mapping (crucial for inference API)
tokenizer_json = tokenizer.to_json()
with open(os.path.join(WORK_DIR, 'tokenizer.json'), 'w', encoding='utf-8') as f:
    f.write(tokenizer_json)

# Save the label classes to decode integer predictions back to text
with open(os.path.join(WORK_DIR, 'classes.json'), 'w', encoding='utf-8') as f:
    json.dump(list(label_encoder.classes_), f)

print("Training complete! Please download categorization_model.h5, tokenizer.json, and classes.json.")
