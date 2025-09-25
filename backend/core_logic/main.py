# ==============================================================================
# AI-Powered Dispute Assistant: Main Processing Script (Optimized)
# ==============================================================================
# This script performs the core tasks of the assignment with performance optimizations:
# 1. Loads a trained ML model to classify customer disputes.
# 2. Uses an LLM (OpenAI's GPT) to generate explanations IN PARALLEL for speed.
# 3. Applies a rule-based system to suggest a resolution action.
# 4. Uses an LLM again to create dynamic justifications IN PARALLEL.
# 5. Outputs the results into the correctly formatted CSV files.
# ==============================================================================

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

# --- [0. CONFIGURATION AND SETUP] ---

# Controls how many LLM API calls to make simultaneously.
# Increase for faster processing, but be mindful of API rate limits.
MAX_WORKERS = 10

def initialize_openai_client():
    """Initializes the OpenAI client, ensuring the API key is set."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("="*60)
        print("FATAL ERROR: The 'OPENAI_API_KEY' environment variable is not set.")
        print("Please set your OpenAI API key and restart the script.")
        print("="*60)
        exit()
    try:
        client = openai.OpenAI(api_key=api_key)
        print("OpenAI client initialized successfully.")
        return client
    except Exception as e:
        print(f"Failed to initialize OpenAI client. Error: {e}")
        exit()

# Initialize the client globally
client = initialize_openai_client()
print("-" * 30)

# --- [1. LOAD LOCAL ML ASSETS] ---

print("Loading local machine learning assets...")
try:
    with open('logistic_regression_model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('pca.pkl', 'rb') as f:
        pca = pickle.load(f)
    sentence_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    print("All local models and encoders loaded successfully.")
except FileNotFoundError as e:
    print(f"FATAL ERROR: A required model file was not found: {e.name}")
    print("Please ensure 'logistic_regression_model.pkl' and 'pca.pkl' are in the same directory.")
    exit()
print("-" * 30)


# --- [2. CORE FUNCTIONS (Unchanged)] ---

def get_predictions_and_confidence(descriptions):
    """Encodes descriptions, applies PCA, and returns predictions from the ML model."""
    embeddings = sentence_model.encode(descriptions)
    embeddings_pca = pca.transform(embeddings)
    predictions = model.predict(embeddings_pca)
    probabilities = model.predict_proba(embeddings_pca)
    confidence = np.max(probabilities, axis=1)
    return predictions, confidence

def generate_llm_explanation(description, category):
    """(For Task 1) Uses an LLM to generate a human-readable explanation."""
    prompt = f"""You are an AI assistant for a financial support agent. Your task is to explain why a customer's dispute was classified.
    - Customer's Description: "{description}"
    - Predicted Category: {category}
    Explain in one clear sentence why this dispute falls into the '{category}' category, quoting key evidence from the customer's description."""
    try:
        response = client.chat.completions.create(model="gpt-3.5-turbo", messages=[{"role": "system", "content": "You write clear, evidence-based explanations."}, {"role": "user", "content": prompt}], temperature=0.0, max_tokens=70)
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Warning: OpenAI API call failed for explanation. Falling back. Error: {e}")
        return f"Classified as {category} based on semantic analysis."

def generate_llm_justification(description, category, action):
    """(For Task 2) Uses an LLM to generate a dynamic justification for an action."""
    prompt = f"""You are an AI assistant helping a financial support agent. A customer dispute has been analyzed.
    - Customer's Description: "{description}"
    - Classified as: {category}
    - Suggested next action: {action}
    Write a brief, one-sentence justification for the agent explaining why '{action}' is the correct next step, connecting it to the customer's complaint."""
    try:
        response = client.chat.completions.create(model="gpt-3.5-turbo", messages=[{"role": "system", "content": "You write clear, actionable justifications for support agents."}, {"role": "user", "content": prompt}], temperature=0.1, max_tokens=80)
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Warning: OpenAI API call failed for justification. Falling back. Error: {e}")
        return resolution_rules[category]['justification']

# --- [3. BUSINESS LOGIC RULES (Unchanged)] ---

resolution_rules = {
    "DUPLICATE_CHARGE": {"action": "Auto-refund", "justification": "System detected a duplicate charge, qualifying for an automatic refund."},
    "FAILED_TRANSACTION": {"action": "Manual review", "justification": "Transaction failed but the customer was debited. This requires manual investigation."},
    "FRAUD": {"action": "Mark as potential fraud", "justification": "The transaction was flagged as fraudulent by the customer and must be reviewed by the fraud team."},
    "REFUND_PENDING": {"action": "Ask for more info", "justification": "Customer is waiting for a refund. An agent needs to check the status and provide an update."},
    "OTHERS": {"action": "Manual review", "justification": "The dispute does not fit a standard category and requires a manual agent review."}
}

# --- [4. MAIN EXECUTION WORKFLOW (OPTIMIZED)] ---

if __name__ == "__main__":
    print("Starting dispute processing workflow...")
    
    try:
        disputes_df = pd.read_csv('1.csv')
        print(f"Loaded {len(disputes_df)} disputes from 'Assignment Submission Required.csv'.")
    except FileNotFoundError:
        print("FATAL ERROR: 'Assignment Submission Required.csv' not found.")
        exit()
    print("-" * 30)

    # --- TASK 1: Dispute Classification & Explanation (Parallelized) ---
    print("Step 1: Running ML model for classification...")
    descriptions = disputes_df['description'].tolist()
    predicted_categories, confidence_scores = get_predictions_and_confidence(descriptions)
    
    print(f"Step 2: Generating explanations via LLM in parallel (using up to {MAX_WORKERS} workers)...")
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # executor.map runs the function for each item in the iterables, in parallel.
        explanations = list(tqdm(executor.map(generate_llm_explanation, descriptions, predicted_categories), total=len(descriptions), desc="Explaining"))

    # CONFIRMATION: The DataFrame columns match the required output format.
    classified_df = pd.DataFrame({
        'dispute_id': disputes_df['dispute_id'],
        'predicted_category': predicted_categories,
        'confidence': [f"{score:.2f}" for score in confidence_scores],
        'explanation': explanations
    })
    classified_df.to_csv('classified_disputes.csv', index=False)
    print("Successfully generated 'classified_disputes.csv'")
    print("-" * 30)

    # --- TASK 2: Resolution Suggestion & Justification (Parallelized) ---
    print(f"Step 3: Generating justifications via LLM in parallel (using up to {MAX_WORKERS} workers)...")
    
    # First, prepare the arguments for each parallel call
    justification_args = []
    for _, row in classified_df.iterrows():
        category = row['predicted_category']
        dispute_id = row['dispute_id']
        original_description = disputes_df.loc[disputes_df['dispute_id'] == dispute_id, 'description'].iloc[0]
        action = resolution_rules[category]['action']
        justification_args.append((original_description, category, action))

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Use a lambda function to unpack the tuple of arguments for each call
        justifications = list(tqdm(executor.map(lambda p: generate_llm_justification(*p), justification_args), total=len(justification_args), desc="Justifying"))

    # CONFIRMATION: The DataFrame columns match the required output format.
    resolutions_df = pd.DataFrame({
        'dispute_id': classified_df['dispute_id'],
        'suggested_action': [resolution_rules[cat]['action'] for cat in classified_df['predicted_category']],
        'justification': justifications
    })
    resolutions_df.to_csv('resolutions.csv', index=False)
    print("Successfully generated 'resolutions.csv'")
    print("-" * 30)

    print("\n✅ All tasks completed successfully!")