import pandas as pd
import numpy as np
import re
import json
import os
import torch
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments

# --- 1. CONFIGURATION ---
# Updated to read from the newly generated datasets in the working directory
TRAIN_PATH = '/kaggle/working/financial_transaction_train.csv'
TEST_PATH = '/kaggle/working/financial_transaction_test.csv'
MODEL_NAME = 'distilbert-base-uncased'
MAX_SEQ_LENGTH = 32
BATCH_SIZE = 16
EPOCHS = 3

# --- 2. DATA LOADING & PREPROCESSING ---
print("Loading data...")
df_train = pd.read_csv(TRAIN_PATH)
df_test = pd.read_csv(TEST_PATH)
df = pd.concat([df_train, df_test], ignore_index=True)

# Assume columns are 'Transaction_Text' and 'Label'
text_col = 'Transaction_Text' if 'Transaction_Text' in df.columns else df.columns[0]
label_col = 'Label' if 'Label' in df.columns else df.columns[1]

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

# --- 3. TOKENIZATION & DATASETS (HUGGINGFACE) ---
print("Tokenizing text with AutoTokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

X_train_text, X_val_text, y_train, y_val = train_test_split(
    df['clean_text'].tolist(), 
    df['encoded_label'].values, 
    test_size=0.2, 
    random_state=42
)

train_encodings = tokenizer(X_train_text, truncation=True, padding=True, max_length=MAX_SEQ_LENGTH)
val_encodings = tokenizer(X_val_text, truncation=True, padding=True, max_length=MAX_SEQ_LENGTH)

class TransactionDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item

    def __len__(self):
        return len(self.labels)

train_dataset = TransactionDataset(train_encodings, y_train)
val_dataset = TransactionDataset(val_encodings, y_val)

# --- 4. MODEL ARCHITECTURE ---
print("Building PyTorch DistilBERT model...")
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=num_classes)

# --- 5. TRAINING (HUGGINGFACE TRAINER) ---
print("Starting training...")
WORK_DIR = '/kaggle/working/'

training_args = TrainingArguments(
    output_dir=os.path.join(WORK_DIR, 'results'),
    num_train_epochs=EPOCHS,
    per_device_train_batch_size=BATCH_SIZE,
    per_device_eval_batch_size=BATCH_SIZE,
    warmup_steps=100,
    weight_decay=0.01,
    logging_dir=os.path.join(WORK_DIR, 'logs'),
    logging_steps=10,
    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    report_to="none" # Disable wandb/tensorboard for simple kaggle script
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset
)

trainer.train()

# --- 6. SAVING ARTIFACTS ---
print("Saving artifacts to /kaggle/working/...")

# Save the transformer model and tokenizer
model.save_pretrained(os.path.join(WORK_DIR, 'distilbert_categorization_model'))
tokenizer.save_pretrained(os.path.join(WORK_DIR, 'distilbert_tokenizer'))

# Save the label classes to decode integer predictions back to text
with open(os.path.join(WORK_DIR, 'classes.json'), 'w', encoding='utf-8') as f:
    json.dump(list(label_encoder.classes_), f)

print("Training complete!")
print("Download the 'distilbert_categorization_model' folder, 'distilbert_tokenizer' folder, and 'classes.json'.")
