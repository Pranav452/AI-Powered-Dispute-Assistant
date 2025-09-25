#!/usr/bin/env python3
"""
Script to convert fraud.txt to CSV format and analyze class distribution.
"""

import pandas as pd
import csv
from collections import Counter

def convert_txt_to_csv(input_file, output_file):
    """
    Convert the fraud.txt file to CSV format.
    Handles both tab-separated and space-separated formats.
    
    Args:
        input_file (str): Path to the input .txt file
        output_file (str): Path to the output .csv file
    
    Returns:
        pd.DataFrame: The converted DataFrame
    """
    # Read the file and parse it
    data = []
    
    # Define the expected categories to help with parsing
    categories = {'DUPLICATE_CHARGE', 'FAILED_TRANSACTION', 'FRAUD', 'REFUND_PENDING', 'OTHERS'}
    
    with open(input_file, 'r', encoding='utf-8') as file:
        lines = file.readlines()
        
        # Skip the first empty line and get the header
        header_line = lines[1].strip()
        headers = header_line.split('\t')
        
        # Process data lines (starting from line 2, index 2)
        for line_num, line in enumerate(lines[2:], start=3):
            line = line.strip()
            if line:  # Skip empty lines
                # Try tab-separated format first
                if '\t' in line:
                    parts = line.split('\t')
                    if len(parts) >= 3:
                        dispute_id = parts[0]
                        # Join all parts except first and last as description (in case description has tabs)
                        description = '\t'.join(parts[1:-1])
                        category = parts[-1]
                        data.append([dispute_id, description, category])
                        continue
                
                # If tab-separated doesn't work, try space-separated format
                # Look for the category at the end of the line
                found_category = None
                for cat in categories:
                    if line.endswith(' ' + cat):
                        found_category = cat
                        break
                
                if found_category:
                    # Extract the part before the category
                    prefix = line[:-len(found_category)-1].strip()
                    
                    # Split the prefix to get dispute_id and description
                    parts = prefix.split(' ', 1)  # Split into at most 2 parts
                    if len(parts) >= 2:
                        dispute_id = parts[0]
                        description = parts[1]
                        data.append([dispute_id, description, found_category])
                    elif len(parts) == 1:
                        # Only dispute_id found, description is empty
                        dispute_id = parts[0]
                        description = ""
                        data.append([dispute_id, description, found_category])
                else:
                    # If we can't parse the line, print a warning and skip
                    print(f"Warning: Could not parse line {line_num}: {line[:100]}...")
    
    # Create DataFrame
    df = pd.DataFrame(data, columns=['dispute_id', 'description', 'category'])
    
    # Save to CSV
    df.to_csv(output_file, index=False, quoting=csv.QUOTE_ALL)
    
    print(f"Successfully converted {input_file} to {output_file}")
    print(f"Total records: {len(df)}")
    
    return df

def count_classes(df):
    """
    Count occurrences of each category/class in the DataFrame.
    
    Args:
        df (pd.DataFrame): The DataFrame containing the fraud data
    
    Returns:
        pd.DataFrame: DataFrame with class counts
    """
    # Count occurrences of each category
    class_counts = df['category'].value_counts().reset_index()
    class_counts.columns = ['category', 'count']
    
    # Calculate percentages
    total_records = len(df)
    class_counts['percentage'] = (class_counts['count'] / total_records * 100).round(2)
    
    # Sort by count in descending order
    class_counts = class_counts.sort_values('count', ascending=False).reset_index(drop=True)
    
    return class_counts

def main():
    """
    Main function to execute the conversion and analysis.
    """
    input_file = '/Users/pranavnair/ml_oasis/fraud.txt'
    output_file = '/Users/pranavnair/ml_oasis/fraud_data.csv'
    
    # Convert TXT to CSV
    print("Converting fraud.txt to CSV format...")
    df = convert_txt_to_csv(input_file, output_file)
    
    # Count classes
    print("\nAnalyzing class distribution...")
    class_counts_df = count_classes(df)
    
    # Display results
    print("\nClass Distribution:")
    print("=" * 50)
    print(class_counts_df.to_string(index=False))
    
    # Save class counts to separate CSV
    class_counts_file = '/Users/pranavnair/ml_oasis/fraud_class_counts.csv'
    class_counts_df.to_csv(class_counts_file, index=False)
    print(f"\nClass counts saved to: {class_counts_file}")
    
    # Display some sample data
    print("\nSample data from converted CSV:")
    print("=" * 50)
    print(df.head(10).to_string(index=False))
    
    return df, class_counts_df

if __name__ == "__main__":
    df, class_counts = main()
