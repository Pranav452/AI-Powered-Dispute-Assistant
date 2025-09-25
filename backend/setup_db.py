# ==============================================================================
# AI-Powered Dispute Assistant: Database Setup Script
# ==============================================================================
# This is a one-time setup script to create and populate the SQLite database.
#
# It performs the following steps:
# 1. Defines the database schema (tables and columns).
# 2. Creates the database file and the tables.
# 3. Reads the raw transaction and dispute CSV files.
# 4. Runs the entire AI pipeline (prediction + LLM enrichment) on the disputes.
# 5. Inserts the final, enriched data into the database.
#
# To run: `python setup_database.py` from within the `backend` directory.
# ==============================================================================

import sqlite3
import pandas as pd
import numpy as np
import pickle
import os
from sentence_transformers import SentenceTransformer
import openai
from tqdm import tqdm
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- [0. CONFIGURATION AND PATHS] ---

# This script assumes it's being run from the `backend` directory.
DB_PATH = 'database.db'
TRANSACTIONS_CSV_PATH = 'data/2.csv' # I've assumed the name
DISPUTES_CSV_PATH = 'data/1.csv'
MODEL_DIR = 'ml_models/'

# Configure how many LLM calls to make in parallel
MAX_WORKERS = 10

# --- [1. INITIALIZE CLIENTS AND MODELS] ---

def initialize_openai_client():
    """Initializes the OpenAI client, ensuring the API key is set."""
    # Ensure you have your OPENAI_API_KEY set as an environment variable
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("FATAL ERROR: The 'OPENAI_API_KEY' environment variable is not set.")
    try:
        client = openai.OpenAI(api_key=api_key)
        print("OpenAI client initialized successfully.")
        return client
    except Exception as e:
        raise ConnectionError(f"Failed to initialize OpenAI client. Error: {e}")

# Load models and clients globally to be reused
try:
    print("Loading all models...")
    client = initialize_openai_client()
    with open(os.path.join(MODEL_DIR, 'logistic_regression_model.pkl'), 'rb') as f:
        model = pickle.load(f)
    with open(os.path.join(MODEL_DIR, 'pca.pkl'), 'rb') as f:
        pca = pickle.load(f)
    sentence_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    print("All models loaded successfully.")
except (FileNotFoundError, ValueError, ConnectionError) as e:
    print(f"Error during initialization: {e}")
    exit()

# --- [2. DATABASE SCHEMA AND CREATION] ---

def create_tables(conn):
    """Creates all necessary tables in the database."""
    cursor = conn.cursor()
    print("Creating database tables...")

    # Disputes Table: The main table for our application
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS disputes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dispute_id TEXT NOT NULL UNIQUE,
        customer_id TEXT,
        txn_id TEXT,
        description TEXT,
        predicted_category TEXT,
        confidence REAL,
        explanation TEXT,
        suggested_action TEXT,
        justification TEXT,
        status TEXT DEFAULT 'OPEN',
        created_at DATETIME
    )
    ''')

    # Dispute History Table: For tracking status changes
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS dispute_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dispute_id TEXT NOT NULL,
        field_changed TEXT,
        old_value TEXT,
        new_value TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dispute_id) REFERENCES disputes (dispute_id)
    )
    ''')

    # Transactions Table: For the fuzzy matching bonus task
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        txn_id TEXT NOT NULL UNIQUE,
        customer_id TEXT,
        amount REAL,
        status TEXT,
        "timestamp" DATETIME,
        channel TEXT,
        merchant TEXT
    )
    ''')
    
    conn.commit()
    print("Tables created successfully.")

# --- [3. AI PROCESSING LOGIC (Reused from previous scripts)] ---

# (These functions are copied from your main processing script)
def get_predictions_and_confidence(descriptions):
    embeddings = sentence_model.encode(descriptions)
    embeddings_pca = pca.transform(embeddings)
    predictions = model.predict(embeddings_pca)
    probabilities = model.predict_proba(embeddings_pca)
    confidence = np.max(probabilities, axis=1)
    return predictions, confidence

def generate_llm_explanation(description, category):
    prompt = f"Explain in one sentence why this dispute: '{description}' was classified as '{category}', quoting key evidence."
    try:
        response = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=0.0, max_tokens=70)
        return response.choices[0].message.content.strip()
    except Exception: return f"Classified as {category} based on semantic analysis."

def generate_llm_justification(description, category, action):
    prompt = f"For a dispute classified as '{category}' with description '{description}', explain in one sentence why the action '{action}' is the correct next step for a support agent."
    try:
        response = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=0.1, max_tokens=80)
        return response.choices[0].message.content.strip()
    except Exception: return f"Action '{action}' is recommended for disputes of type '{category}'."

# --- [4. DATA POPULATION LOGIC] ---

def populate_database(conn):
    """Reads CSVs, processes data, and inserts into the database."""
    
    # 4.1 Populate Transactions Table
    print("\nPopulating 'transactions' table...")
    try:
        trans_df = pd.read_csv(TRANSACTIONS_CSV_PATH)
        # The column name in the CSV is 'timestamp', which is a keyword.
        # We need to make sure it maps correctly to our schema.
        trans_df.to_sql('transactions', conn, if_exists='replace', index=False)
        print(f"Successfully inserted {len(trans_df)} rows into 'transactions' table.")
    except FileNotFoundError:
        print(f"WARNING: '{TRANSACTIONS_CSV_PATH}' not found. Skipping population of transactions table.")

    # 4.2 Process and Populate Disputes Table
    print("\nPopulating 'disputes' table (This will run the AI pipeline)...")
    try:
        disputes_df = pd.read_csv(DISPUTES_CSV_PATH)
    except FileNotFoundError:
        print(f"FATAL ERROR: '{DISPUTES_CSV_PATH}' not found. Cannot populate disputes.")
        return

    # --- Run the full AI pipeline ---
    print("Step A: Running ML model for classification...")
    descriptions = disputes_df['description'].tolist()
    predicted_categories, confidence_scores = get_predictions_and_confidence(descriptions)
    disputes_df['predicted_category'] = predicted_categories
    disputes_df['confidence'] = confidence_scores

    resolution_rules = {
        "DUPLICATE_CHARGE": "Auto-refund", "FAILED_TRANSACTION": "Manual review",
        "FRAUD": "Mark as potential fraud", "REFUND_PENDING": "Ask for more info",
        "OTHERS": "Manual review"
    }
    disputes_df['suggested_action'] = disputes_df['predicted_category'].map(resolution_rules)

    print(f"Step B: Generating explanations via LLM (in parallel)...")
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        explanations = list(tqdm(executor.map(generate_llm_explanation, disputes_df['description'], disputes_df['predicted_category']), total=len(disputes_df)))
    disputes_df['explanation'] = explanations

    print(f"Step C: Generating justifications via LLM (in parallel)...")
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        justifications = list(tqdm(executor.map(generate_llm_justification, disputes_df['description'], disputes_df['predicted_category'], disputes_df['suggested_action']), total=len(disputes_df)))
    disputes_df['justification'] = justifications
    
    # --- Prepare final DataFrame for DB insertion ---
    # Select and rename columns to match the 'disputes' table schema
    final_disputes_df = disputes_df[[
        'dispute_id', 'customer_id', 'txn_id', 'description', 'predicted_category',
        'confidence', 'explanation', 'suggested_action', 'justification', 'created_at'
    ]].copy()
    
    # ***** THIS IS THE CRITICAL FIX *****
    # Add the default status column before saving to the database.
    final_disputes_df['status'] = 'OPEN'
    
    final_disputes_df.to_sql('disputes', conn, if_exists='replace', index=False)
    print(f"\nSuccessfully inserted {len(final_disputes_df)} rows into 'disputes' table.")


# --- [5. MAIN EXECUTION] ---

if __name__ == "__main__":
    # Ensure database file is clean for a fresh setup
    if os.path.exists(DB_PATH):
        print(f"Found existing database at '{DB_PATH}'. Deleting for a fresh setup.")
        os.remove(DB_PATH)

    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        create_tables(conn)
        populate_database(conn)
        print("\n✅ Database setup completed successfully!")
    except Exception as e:
        print(f"\nAn error occurred during database setup: {e}")
    finally:
        if conn:
            conn.close()