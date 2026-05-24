import pandas as pd # Imports pandas for dataframe creation and CSV export.
import random # Imports random for generating randomized transaction attributes.
import string # Imports string to generate random alphanumeric trace IDs.

# 1. Exhaustive Indian Business Taxonomy
merchants = { # Dictionary holding categories and real Indian businesses.
    "Food": ["Zomato", "Swiggy", "Blinkit", "Zepto", "Dominos", "KFC", "Starbucks", "Haldirams"], # Food entities.
    "Shopping": ["Amazon", "Flipkart", "Myntra", "Ajio", "Nykaa", "Reliance Digital", "BigBasket"], # Shopping entities.
    "Travel": ["Ola Cabs", "Uber", "Rapido", "MakeMyTrip", "IRCTC", "RedBus", "Indigo", "Delhi Metro"], # Travel entities.
    "Investment": ["Zerodha", "Groww", "Upstox", "AngelOne", "CoinDCX", "Mutual Fund", "BSE"], # Investment entities.
    "Subscription": ["Netflix", "Amazon Prime", "Hotstar", "Spotify", "YouTube", "Google India"], # Subscription entities.
    "EMI": ["Bajaj Finance", "HDFC Loan", "SBI Home Loan", "Cred", "ZestMoney", "Navi"], # EMI and loan entities.
    "Rent": ["NoBroker", "Cred Rent", "MagicBricks", "Housing", "Stanza Living", "Zolo"], # Rent entities.
    "Salary": ["TCS", "Infosys", "Wipro", "Cognizant", "Reliance", "Accenture", "IBM India"], # Salary providers.
    "UPI Transfer": ["Rahul", "Priya", "Amit", "Neha", "Rohit", "Sneha", "Vikram", "Local Kirana"] # P2P transfers.
} # Closes the dictionary.

# 2. Bandhan Bank Format Generators
banks = ["ybl", "axl", "oksb", "icic", "pty", "okbi"] # Common acquiring bank codes seen in the statement.
trace_prefixes = ["HDF", "AXI", "SBI", "YBN"] # Common trace ID prefixes seen in the statement.

def generate_random_hash(length=30): # Function to generate the long alphanumeric trace hash.
    characters = string.ascii_lowercase + string.digits # Uses lowercase letters and numbers.
    return ''.join(random.choice(characters) for _ in range(length)) # Creates a random string of the specified length.

def generate_bandhan_transaction(category, entity): # Core function to mimic the Bandhan PDF format.
    is_credit = category in ["Salary"] or (category == "UPI Transfer" and random.choice([True, False])) # Salary is always a credit; P2P can be either.
    txn_type = "CR" if is_credit else "DR" # Sets the Debit (DR) or Credit (CR) tag.
    prefix = "C" if is_credit else "D" # Sets the C or D prefix for the transaction ID.
    
    txn_id = f"{prefix}12{random.randint(1000000000, 9999999999)}" # Generates the 12-digit reference ID (e.g., D120913906497).
    
    # Bandhan strictly truncates merchant names to exactly 10 characters and uppercases them (e.g., 'GOOGLE IND').
    truncated_entity = entity.upper()[:10].ljust(10, ' ') 
    
    bank_code = random.choice(banks) # Randomly selects a bank code.
    
    # Generates a realistic looking UPI VPA based on the entity name.
    vpa = f"{entity.lower().replace(' ', '')[:8]}{random.randint(100,999)}@{bank_code}" 
    
    remarks = random.choice(["UPI", "Payment fr", "MOPSUPITxn", "Merchant Q"]) # Randomizes the remarks field.
    trace_id = f"{random.choice(trace_prefixes)}{generate_random_hash()}" # Builds the final system trace ID.
    
    # Occasionally generate a NEFT transaction instead of UPI for Salary or large payments.
    if category == "Salary" or (category == "Rent" and random.random() > 0.8): 
        ifsc = f"{random.choice(['SBIN', 'HDFC', 'ICIC'])}000{random.randint(1000,9999)}" # Generates a fake IFSC.
        return f"NEFT {txn_type.title()}-{ifsc}-{entity.upper()}-{ifsc}{random.randint(1000000000, 9999999999)}" # Returns the NEFT format.
    
    # Constructs and returns the massive, concatenated UPI string perfectly matching the PDF.
    return f"UPI/{txn_type}/{txn_id}/{truncated_entity}/{bank_code}/{vpa}/{remarks}/{trace_id}" 

# 3. Build the Dataset
dataset = [] # Initializes the list to store the data.
num_records_per_category = 5000 # Sets 5000 records per category for a total of 45,000.

for category, entities in merchants.items(): # Iterates through the taxonomy.
    for _ in range(num_records_per_category): # Loops to generate the required volume.
        entity = random.choice(entities) # Picks a random entity from the current category.
        transaction_text = generate_bandhan_transaction(category, entity) # Calls the generator function.
        dataset.append({"Transaction_Text": transaction_text, "Label": category}) # Adds the record to the dataset.

df = pd.DataFrame(dataset) # Converts to a pandas dataframe.
df = df.sample(frac=1, random_state=42).reset_index(drop=True) # Shuffles the dataset completely.

# 4. Strict 80/20 Train and Validation Split
train_size = int(0.8 * len(df)) # Calculates exactly 80% of the row count for the training boundary.

train_df = df.iloc[:train_size] # Slices everything from the start up to the 80% mark for training.
val_df = df.iloc[train_size:] # Slices everything from the 80% mark to the end for validation.

import os

# 5. Export to CSV (Names matched exactly with Kaggle script)
output_dir = '/kaggle/working/'
os.makedirs(output_dir, exist_ok=True) # Ensure directory exists (helpful if testing locally)

train_df.to_csv(os.path.join(output_dir, 'financial_transaction_train.csv'), index=False) 
val_df.to_csv(os.path.join(output_dir, 'financial_transaction_test.csv'), index=False)

print(f"Bandhan format datasets generated successfully! Train: {len(train_df)} rows, Validation: {len(val_df)} rows.") # Outputs the final file sizes to the console.