# ==============================================================================
# AI-Powered Dispute Assistant: Backend API Server (FastAPI Version)
# ==============================================================================
# This script runs a FastAPI web server that provides a RESTful API for the frontend.
#
# To run:
# 1. Activate venv: `source venv/bin/activate`
# 2. Run the server: `uvicorn app:app --reload`
# 3. Access the interactive docs at http://127.0.0.1:8000/docs
# ==============================================================================

import sqlite3
import pandas as pd
from datetime import timedelta
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import necessary LangChain components at the top of your app.py
from langchain_openai import OpenAI
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent
from langchain.agents.agent_types import AgentType


# --- [1. APP AND DATABASE SETUP] ---

app = FastAPI(
    title="AI Dispute Assistant API",
    description="API for managing and analyzing payment disputes.",
    version="1.0.0"
)

# Configure CORS to allow requests from your Next.js frontend
origins = [
    "http://localhost:3000",  # Default Next.js port
    "http://localhost:3001",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = 'database.db'

def get_db_connection():
    """Creates a connection to the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# --- [2. PYDANTIC MODELS FOR DATA VALIDATION] ---

# This model defines the structure for the status update request body
class StatusUpdate(BaseModel):
    status: str

# Add this to the Pydantic Models section in app.py
class ChatQuery(BaseModel):
    query: str

# --- [3. CORE API ENDPOINTS] ---

@app.get("/api/disputes", response_model=List[Dict[str, Any]])
def get_disputes():
    """Fetch all disputes from the database, ordered by creation date."""
    try:
        conn = get_db_connection()
        disputes = conn.execute('SELECT * FROM disputes ORDER BY created_at DESC').fetchall()
        conn.close()
        return [dict(row) for row in disputes]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/disputes/{dispute_id}")
def get_dispute_details(dispute_id: str):
    """Fetch details for a single dispute and its complete history."""
    try:
        conn = get_db_connection()
        dispute = conn.execute('SELECT * FROM disputes WHERE dispute_id = ?', (dispute_id,)).fetchone()
        history = conn.execute('SELECT * FROM dispute_history WHERE dispute_id = ? ORDER BY timestamp ASC', (dispute_id,)).fetchall()
        conn.close()

        if dispute is None:
            raise HTTPException(status_code=404, detail="Dispute not found")
        
        return {
            "details": dict(dispute),
            "history": [dict(row) for row in history]
        }
    except Exception as e:
        # Re-raise HTTPException if it's already one, otherwise wrap it
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/disputes/{dispute_id}")
def update_dispute_status(dispute_id: str, status_update: StatusUpdate):
    """Update the status of a dispute and log the change in the history table."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        current_dispute = cursor.execute('SELECT status FROM disputes WHERE dispute_id = ?', (dispute_id,)).fetchone()
        if current_dispute is None:
            raise HTTPException(status_code=404, detail="Dispute not found")
        
        old_status = current_dispute['status']
        new_status = status_update.status
        
        cursor.execute('UPDATE disputes SET status = ? WHERE dispute_id = ?', (new_status, dispute_id))
        cursor.execute('INSERT INTO dispute_history (dispute_id, field_changed, old_value, new_value) VALUES (?, ?, ?, ?)',
                       (dispute_id, 'status', old_status, new_status))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": f"Dispute {dispute_id} status updated to {new_status}"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

# --- [4. BONUS TASK ENDPOINTS] ---

@app.get("/api/trends")
def get_trends():
    """Get aggregated data for dispute trends visualization."""
    try:
        conn = get_db_connection()
        query = "SELECT date(created_at) as day, predicted_category, COUNT(*) as count FROM disputes GROUP BY day, predicted_category ORDER BY day;"
        trends_df = pd.read_sql_query(query, conn)
        conn.close()
        
        pivot_df = trends_df.pivot(index='day', columns='predicted_category', values='count').fillna(0)
        chart_data = pivot_df.reset_index().to_dict(orient='records')
        
        return chart_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/find-fuzzy-duplicates")
def find_fuzzy_duplicates():
    """Runs the fuzzy matching logic on the transactions table."""
    try:
        conn = get_db_connection()
        transactions_df = pd.read_sql_query("SELECT * FROM transactions", conn)
        conn.close()

        transactions_df['timestamp'] = pd.to_datetime(transactions_df['timestamp'])
        transactions_df = transactions_df.sort_values(by=['customer_id', 'timestamp'])
        
        potential_duplicates = []
        for _, group in transactions_df.groupby('customer_id'):
            for i, row1 in group.iterrows():
                for _, row2 in group.loc[i+1:].iterrows():
                    time_diff = row2['timestamp'] - row1['timestamp']
                    if (row1['amount'] == row2['amount'] and
                        row1['merchant'] == row2['merchant'] and
                        time_diff <= timedelta(minutes=5)):
                        
                        potential_duplicates.append({
                            'original_txn_id': row1['txn_id'], 'duplicate_txn_id': row2['txn_id'],
                            'customer_id': row1['customer_id'], 'amount': row1['amount'],
                            'merchant': row1['merchant'], 'time_diff_seconds': time_diff.total_seconds()
                        })
                        break
        
        return potential_duplicates
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- [5. CONVERSATIONAL AGENT ENDPOINT] ---

# This is a helper function to avoid loading data on every single request
# In a production app, you'd use a more robust caching mechanism
_cached_data = None
def get_agent_dataframes():
    """Loads and prepares the SINGLE disputes dataframe for the agent, caching it in memory."""
    global _cached_data
    if _cached_data is None:
        print("Loading and caching data for agent...")
        # *** CHANGE #1: ONLY LOAD THE 'disputes' TABLE ***
        disputes_df = pd.read_sql_query("SELECT * FROM disputes", get_db_connection())
        disputes_df['created_at'] = pd.to_datetime(disputes_df['created_at'])
        # The agent now receives a list with just ONE dataframe
        _cached_data = [disputes_df]
    return _cached_data

@app.post("/api/chat")
def handle_chat_query(query: ChatQuery):
    """Receives a user query, runs it through the LangChain agent, and returns the answer."""
    
    # *** CHANGE #2: UPDATE THE AGENT'S INSTRUCTIONS ***
    AGENT_PREFIX = """
    You are a direct and factual AI assistant for analyzing financial dispute data.
    Your ONLY goal is to answer questions by executing Python code on a pandas dataframe named `df1`.

    **IMPORTANT RULES:**
    1.  **DO NOT** greet the user or engage in conversational chit-chat.
    2.  **DO NOT** redefine the dataframe `df1`. It is already provided to you.
    3.  Your task is to translate the user's question directly into executable pandas code using `df1`.
    4.  If the user's query is a greeting or does not seem like a question about the data (e.g., "hi", "how are you"), your ONLY valid response is: "I can only answer questions about the dispute data. Please ask a question like 'How many fraud cases are there?'"

    **DATA CONTEXT:**
    - `df1` contains all dispute data. Key columns are 'predicted_category', 'status', 'suggested_action', and 'created_at'.
    - **The `status` column can have values like 'OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'. "Unresolved" means the status is not 'RESOLVED' or 'CLOSED'.**
    - A query about "duplicates" means you must filter `df1['predicted_category'] == 'DUPLICATE_CHARGE'`.
    - A query about "fraud" means you must filter `df1['predicted_category'] == 'FRAUD'`.

    **--- FINAL ANSWER FORMATTING ---**
    Your final answer MUST be a clear, human-readable sentence or a summarized list.
    **DO NOT** output the python code or the raw dataframe as your final answer.
    For example, after calculating a count, DO NOT answer `df1[df1['predicted_category'] == 'FRAUD'].shape[0]`.
    Instead, your final answer should be: "There are 3 fraud cases."
    """
    
    try:
        # Get the cached dataframes
        dataframes = get_agent_dataframes()
        
        # Initialize the agent
        agent = create_pandas_dataframe_agent(
            llm=OpenAI(temperature=0),
            df=dataframes, # This now correctly passes a list with one dataframe
            prefix=AGENT_PREFIX,
            verbose=True,
            agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            allow_dangerous_code=True
        )
        
        # Invoke the agent with the user's query
        response = agent.invoke(query.query)
        
        return {"answer": response.get('output', "I couldn't find an answer.")}
        
    except Exception as e:
        print(f"Agent Error: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request.")

# --- [6. Uvicorn Server Entry Point] ---
# This part is for convenience, allowing `python app.py` to work,
# but the standard way to run is `uvicorn app.py:app --reload`.
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)