# ==============================================================================
# AI-Powered Dispute Assistant: Advanced Agent CLI (V3 - With Prompt Engineering)
# ==============================================================================
# This final version includes a custom prompt prefix to give the agent
# better context about the data, significantly improving its accuracy.
# ==============================================================================

import pandas as pd
import os
from langchain_openai import OpenAI
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent
from langchain.agents.agent_types import AgentType
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def agent_cli():
    """
    Initializes and runs the LangChain Pandas Agent CLI.
    """
    # --- [1. SETUP & VALIDATION] ---
    if not os.getenv("OPENAI_API_KEY"):
        print("="*60)
        print("FATAL ERROR: The 'OPENAI_API_KEY' environment variable is not set.")
        print("Please set your NEW OpenAI API key and restart the script.")
        print("="*60)
        return
        
    # --- [2. DATA LOADING AND PREPARATION] ---
    print("Loading and preparing data for the agent...")
    try:
        classified_df = pd.read_csv('classified_disputes.csv')
        resolutions_df = pd.read_csv('resolutions.csv')
        original_disputes_df = pd.read_csv('1.csv')
        
        enriched_classified_df = pd.merge(
            classified_df,
            original_disputes_df[['dispute_id', 'created_at']],
            on='dispute_id',
            how='left'
        )
        
        enriched_classified_df['created_at'] = pd.to_datetime(enriched_classified_df['created_at'])
        enriched_classified_df['status'] = 'OPEN'
        
        print("Data loaded and enriched successfully.")

    except FileNotFoundError as e:
        print(f"FATAL ERROR: A required CSV file was not found.")
        print(f"Details: {e}")
        print("Please ensure all required CSV files are in the same directory.")
        return
    print("-" * 30)

    # --- [3. AGENT INITIALIZATION WITH CUSTOM PROMPT] ---
    print("Initializing the LangChain agent with custom instructions...")
    
    llm = OpenAI(temperature=0)
    
    # ** THIS IS THE KEY IMPROVEMENT **
    # We create a detailed set of instructions (a prefix) for the agent.
    AGENT_PREFIX = """
    You are a helpful and highly intelligent AI assistant working with financial dispute data.
    You have access to two pandas dataframes:
    1. `df1`: This dataframe contains classified customer disputes with the following important columns:
        - `dispute_id`: The unique identifier for a dispute.
        - `predicted_category`: The type of dispute. This is the most important column for categorization. Possible values are DUPLICATE_CHARGE, FAILED_TRANSACTION, FRAUD, REFUND_PENDING, OTHERS.
        - `confidence`: The model's confidence in its prediction.
        - `created_at`: The timestamp when the dispute was created.
        - `status`: The current status of the dispute, e.g., 'OPEN'.
    2. `df2`: This dataframe contains the suggested resolution action and justification for each dispute_id.

    Your main goal is to answer questions about these disputes accurately.

    IMPORTANT GUIDELINES:
    - When a user asks about "duplicates", "duplicate charges", or similar, they mean rows where `df1['predicted_category'] == 'DUPLICATE_CHARGE'`. They are NOT asking about duplicate rows in the dataframe itself.
    - When a user asks about "fraud", "fraudulent cases", or similar, they mean rows where `df1['predicted_category'] == 'FRAUD'`.
    - When asked to "break down disputes by type" or for a "breakdown by category", you should perform a `value_counts()` on the `df1['predicted_category']` column.
    - Be precise. If you are asked for a count, provide the number. If you are asked for a list, provide the list.
    - The data is for the year 2025. If asked about "today", assume it means the latest date in the `created_at` column.
    """
    
    agent = create_pandas_dataframe_agent(
        llm=llm,
        df=[enriched_classified_df, resolutions_df],
        prefix=AGENT_PREFIX, # We inject our custom instructions here
        verbose=True,
        agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        allow_dangerous_code=True
    )
    
    print("Agent is ready. You can now ask questions.")
    print("Example: 'How many duplicate charges were there on 2025-08-01?'")
    print("Type 'exit' to quit.")
    print("-" * 30)

    # --- [4. INTERACTIVE CLI LOOP] ---
    # (This part remains the same)
    while True:
        prompt = input("\n> Ask a question about the disputes: ").strip()
        if prompt.lower() == "exit":
            print("Goodbye!")
            break
        if not prompt:
            continue
        
        try:
            response = agent.invoke(prompt)
            print("\n--- Agent's Answer ---")
            print(response['output'])
            print("----------------------")
        except Exception as e:
            print(f"\nAn error occurred: {e}")
            print("The agent could not process that request. Please try rephrasing your question.")

if __name__ == "__main__":
    agent_cli()