# ==============================================================================
# AI-Powered Dispute Assistant: Data Export Script
# ==============================================================================
# This script is designed to fulfill the submission requirement of providing
# `classified_disputes.csv` and `resolutions.csv`.
#
# It connects to the final SQLite database (the single source of truth) and
# exports the data into the required CSV formats.
#
# To run: `python export_data.py` from within the `backend` directory.
# ==============================================================================

import sqlite3
import pandas as pd
import os

DB_PATH = 'database.db'
OUTPUT_DIR = '../' # Save to the root project folder

def export_data():
    """
    Connects to the SQLite database and exports the disputes data
    into two separate CSV files as per the submission requirements.
    """
    if not os.path.exists(DB_PATH):
        print(f"FATAL ERROR: Database file not found at '{DB_PATH}'.")
        print("Please run `setup_database.py` first to create and populate the database.")
        return

    print(f"Connecting to database at '{DB_PATH}'...")
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        
        # Read the entire disputes table into a pandas DataFrame
        disputes_df = pd.read_sql_query("SELECT * FROM disputes", conn)
        print(f"Successfully loaded {len(disputes_df)} records from the database.")

        # --- Create classified_disputes.csv ---
        classified_columns = [
            'dispute_id',
            'predicted_category',
            'confidence',
            'explanation'
        ]
        classified_df = disputes_df[classified_columns]
        classified_output_path = os.path.join(OUTPUT_DIR, 'classified_disputes.csv')
        classified_df.to_csv(classified_output_path, index=False)
        print(f"Successfully exported 'classified_disputes.csv' to the project root directory.")
        
        # --- Create resolutions.csv ---
        resolutions_columns = [
            'dispute_id',
            'suggested_action',
            'justification'
        ]
        resolutions_df = disputes_df[resolutions_columns]
        resolutions_output_path = os.path.join(OUTPUT_DIR, 'resolutions.csv')
        resolutions_df.to_csv(resolutions_output_path, index=False)
        print(f"Successfully exported 'resolutions.csv' to the project root directory.")
        
        print("\n✅ Export process completed successfully!")

    except Exception as e:
        print(f"\nAn error occurred during the export process: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    export_data()