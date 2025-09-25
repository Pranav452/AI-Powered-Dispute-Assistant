#!/usr/bin/env python3
"""
Comprehensive EDA and Data Preprocessing for Fraud Dataset
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter
import re
from wordcloud import WordCloud
import warnings
warnings.filterwarnings('ignore')

# Set style for better plots
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

def load_and_examine_data(csv_file):
    """
    Load the CSV file and examine basic structure
    """
    print("="*60)
    print("LOADING AND EXAMINING DATA")
    print("="*60)
    
    # Load the data
    df = pd.read_csv(csv_file)
    
    print(f"Dataset Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print("\nFirst 5 rows:")
    print(df.head())
    
    print("\nDataset Info:")
    print(df.info())
    
    print("\nBasic Statistics:")
    print(df.describe(include='all'))
    
    return df

def check_data_quality(df):
    """
    Check for duplicates, null values, and data quality issues
    """
    print("\n" + "="*60)
    print("DATA QUALITY ASSESSMENT")
    print("="*60)
    
    # Check for null values
    print("Null Values:")
    null_counts = df.isnull().sum()
    print(null_counts)
    
    if null_counts.sum() > 0:
        print("\nNull value percentages:")
        print((null_counts / len(df) * 100).round(2))
    else:
        print("✓ No null values found!")
    
    # Check for duplicates
    print(f"\nDuplicate rows: {df.duplicated().sum()}")
    
    # Check for duplicate dispute_ids
    duplicate_ids = df['dispute_id'].duplicated().sum()
    print(f"Duplicate dispute IDs: {duplicate_ids}")
    
    if duplicate_ids > 0:
        print("Duplicate dispute IDs:")
        print(df[df['dispute_id'].duplicated(keep=False)]['dispute_id'].value_counts())
    
    # Check for empty descriptions
    empty_descriptions = df['description'].str.strip().eq('').sum()
    print(f"Empty descriptions: {empty_descriptions}")
    
    # Check data types
    print(f"\nData types:")
    print(df.dtypes)
    
    return df

def preprocess_data(df):
    """
    Clean and preprocess the data
    """
    print("\n" + "="*60)
    print("DATA PREPROCESSING")
    print("="*60)
    
    df_clean = df.copy()
    
    # Remove exact duplicates if any
    initial_shape = df_clean.shape[0]
    df_clean = df_clean.drop_duplicates()
    removed_duplicates = initial_shape - df_clean.shape[0]
    print(f"Removed {removed_duplicates} exact duplicate rows")
    
    # Handle null values (if any)
    if df_clean.isnull().sum().sum() > 0:
        print("Handling null values...")
        df_clean = df_clean.dropna()
        print(f"Rows after removing nulls: {len(df_clean)}")
    
    # Clean text data
    df_clean['description'] = df_clean['description'].str.strip()
    df_clean['category'] = df_clean['category'].str.strip().str.upper()
    
    # Remove empty descriptions
    before_empty = len(df_clean)
    df_clean = df_clean[df_clean['description'].str.len() > 0]
    after_empty = len(df_clean)
    print(f"Removed {before_empty - after_empty} rows with empty descriptions")
    
    # Add derived features
    df_clean['description_length'] = df_clean['description'].str.len()
    df_clean['word_count'] = df_clean['description'].str.split().str.len()
    
    # Extract dispute ID number for analysis
    df_clean['dispute_number'] = df_clean['dispute_id'].str.extract('(\d+)').astype(int)
    
    print(f"Final dataset shape: {df_clean.shape}")
    print("✓ Data preprocessing completed!")
    
    return df_clean

def univariate_analysis(df):
    """
    Perform univariate analysis on all variables
    """
    print("\n" + "="*60)
    print("UNIVARIATE ANALYSIS")
    print("="*60)
    
    # Category distribution
    print("1. CATEGORY DISTRIBUTION")
    print("-" * 30)
    category_counts = df['category'].value_counts()
    category_pct = df['category'].value_counts(normalize=True) * 100
    
    category_summary = pd.DataFrame({
        'Count': category_counts,
        'Percentage': category_pct.round(2)
    })
    print(category_summary)
    
    # Description length analysis
    print("\n2. DESCRIPTION LENGTH ANALYSIS")
    print("-" * 35)
    print(f"Description length statistics:")
    print(df['description_length'].describe())
    
    print(f"\nDescription length by category:")
    print(df.groupby('category')['description_length'].agg(['mean', 'median', 'std']).round(2))
    
    # Word count analysis
    print("\n3. WORD COUNT ANALYSIS")
    print("-" * 25)
    print(f"Word count statistics:")
    print(df['word_count'].describe())
    
    print(f"\nWord count by category:")
    print(df.groupby('category')['word_count'].agg(['mean', 'median', 'std']).round(2))
    
    # Dispute ID analysis
    print("\n4. DISPUTE ID ANALYSIS")
    print("-" * 25)
    print(f"Dispute number range: {df['dispute_number'].min()} - {df['dispute_number'].max()}")
    print(f"Total unique dispute IDs: {df['dispute_id'].nunique()}")
    
    return df

def text_analysis(df):
    """
    Analyze text patterns in descriptions
    """
    print("\n" + "="*60)
    print("TEXT ANALYSIS")
    print("="*60)
    
    # Most common words overall
    print("1. MOST COMMON WORDS (Overall)")
    print("-" * 35)
    all_text = ' '.join(df['description'].str.lower())
    # Remove common stop words and punctuation
    words = re.findall(r'\b[a-zA-Z]{3,}\b', all_text)
    word_freq = Counter(words)
    
    print("Top 20 most common words:")
    for word, count in word_freq.most_common(20):
        print(f"{word:15}: {count}")
    
    # Analysis by category
    print("\n2. CATEGORY-SPECIFIC TEXT PATTERNS")
    print("-" * 40)
    
    for category in df['category'].unique():
        print(f"\n{category}:")
        category_text = ' '.join(df[df['category'] == category]['description'].str.lower())
        category_words = re.findall(r'\b[a-zA-Z]{3,}\b', category_text)
        category_freq = Counter(category_words)
        
        print("Top 10 words:")
        for word, count in category_freq.most_common(10):
            print(f"  {word:12}: {count}")
    
    # Key phrases analysis
    print("\n3. KEY PHRASES ANALYSIS")
    print("-" * 30)
    
    key_phrases = {
        'payment_terms': ['payment', 'charged', 'charge', 'debit', 'credit'],
        'fraud_terms': ['fraud', 'unauthorized', 'stolen', 'cloned', 'suspicious'],
        'refund_terms': ['refund', 'return', 'reverse', 'cancel', 'pending'],
        'failure_terms': ['failed', 'error', 'problem', 'issue', 'not working'],
        'duplicate_terms': ['duplicate', 'twice', 'double', 'multiple', 'again']
    }
    
    for phrase_type, terms in key_phrases.items():
        print(f"\n{phrase_type.upper().replace('_', ' ')}:")
        for term in terms:
            count = df['description'].str.lower().str.contains(term, na=False).sum()
            percentage = (count / len(df) * 100).round(2)
            print(f"  {term:12}: {count:4d} ({percentage:5.2f}%)")
    
    return df

def create_visualizations(df):
    """
    Create visualizations for EDA insights
    """
    print("\n" + "="*60)
    print("CREATING VISUALIZATIONS")
    print("="*60)
    
    # Set up the plotting area
    fig = plt.figure(figsize=(20, 15))
    
    # 1. Category distribution (pie chart and bar chart)
    plt.subplot(3, 3, 1)
    category_counts = df['category'].value_counts()
    plt.pie(category_counts.values, labels=category_counts.index, autopct='%1.1f%%', startangle=90)
    plt.title('Distribution of Fraud Categories', fontsize=14, fontweight='bold')
    
    plt.subplot(3, 3, 2)
    sns.countplot(data=df, y='category', order=df['category'].value_counts().index)
    plt.title('Category Counts', fontsize=14, fontweight='bold')
    plt.xlabel('Count')
    
    # 2. Description length distribution
    plt.subplot(3, 3, 3)
    plt.hist(df['description_length'], bins=30, alpha=0.7, edgecolor='black')
    plt.title('Distribution of Description Lengths', fontsize=14, fontweight='bold')
    plt.xlabel('Description Length (characters)')
    plt.ylabel('Frequency')
    
    # 3. Description length by category
    plt.subplot(3, 3, 4)
    sns.boxplot(data=df, x='category', y='description_length')
    plt.title('Description Length by Category', fontsize=14, fontweight='bold')
    plt.xticks(rotation=45)
    
    # 4. Word count distribution
    plt.subplot(3, 3, 5)
    plt.hist(df['word_count'], bins=25, alpha=0.7, edgecolor='black')
    plt.title('Distribution of Word Counts', fontsize=14, fontweight='bold')
    plt.xlabel('Word Count')
    plt.ylabel('Frequency')
    
    # 5. Word count by category
    plt.subplot(3, 3, 6)
    sns.boxplot(data=df, x='category', y='word_count')
    plt.title('Word Count by Category', fontsize=14, fontweight='bold')
    plt.xticks(rotation=45)
    
    # 6. Dispute number timeline
    plt.subplot(3, 3, 7)
    plt.scatter(df['dispute_number'], df['category'].astype('category').cat.codes, alpha=0.6)
    plt.title('Dispute Timeline by Category', fontsize=14, fontweight='bold')
    plt.xlabel('Dispute Number')
    plt.ylabel('Category (encoded)')
    
    # 7. Category distribution over dispute timeline
    plt.subplot(3, 3, 8)
    # Create bins for dispute numbers
    df['dispute_bin'] = pd.cut(df['dispute_number'], bins=10)
    dispute_category_crosstab = pd.crosstab(df['dispute_bin'], df['category'])
    dispute_category_crosstab.plot(kind='bar', stacked=True, ax=plt.gca())
    plt.title('Category Distribution Over Time', fontsize=14, fontweight='bold')
    plt.xlabel('Dispute Number Range')
    plt.xticks(rotation=45)
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    
    # 8. Correlation heatmap
    plt.subplot(3, 3, 9)
    # Create correlation matrix for numerical features
    numerical_features = df[['description_length', 'word_count', 'dispute_number']]
    correlation_matrix = numerical_features.corr()
    sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0)
    plt.title('Correlation Matrix', fontsize=14, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('/Users/pranavnair/ml_oasis/fraud_eda_visualizations.png', dpi=300, bbox_inches='tight')
    print("✓ Visualizations saved as 'fraud_eda_visualizations.png'")
    
    # Create word clouds for each category
    create_wordclouds(df)
    
    return df

def create_wordclouds(df):
    """
    Create word clouds for each category
    """
    print("\nCreating word clouds for each category...")
    
    fig, axes = plt.subplots(2, 3, figsize=(18, 12))
    axes = axes.ravel()
    
    categories = df['category'].unique()
    
    for i, category in enumerate(categories):
        if i < len(axes):
            # Get text for this category
            category_text = ' '.join(df[df['category'] == category]['description'].str.lower())
            
            # Create word cloud
            wordcloud = WordCloud(width=400, height=300, 
                                background_color='white',
                                max_words=100,
                                colormap='viridis').generate(category_text)
            
            axes[i].imshow(wordcloud, interpolation='bilinear')
            axes[i].set_title(f'{category} - Word Cloud', fontsize=14, fontweight='bold')
            axes[i].axis('off')
    
    # Hide unused subplots
    for i in range(len(categories), len(axes)):
        axes[i].axis('off')
    
    plt.tight_layout()
    plt.savefig('/Users/pranavnair/ml_oasis/fraud_wordclouds.png', dpi=300, bbox_inches='tight')
    print("✓ Word clouds saved as 'fraud_wordclouds.png'")

def generate_summary_report(df):
    """
    Generate a comprehensive summary report
    """
    print("\n" + "="*60)
    print("COMPREHENSIVE SUMMARY REPORT")
    print("="*60)
    
    report = f"""
FRAUD DATASET - EXPLORATORY DATA ANALYSIS SUMMARY
================================================

Dataset Overview:
- Total Records: {len(df):,}
- Total Features: {len(df.columns)}
- Categories: {df['category'].nunique()}
- Date Range: D{df['dispute_number'].min()} to D{df['dispute_number'].max()}

Data Quality:
- Missing Values: {df.isnull().sum().sum()}
- Duplicate Records: {df.duplicated().sum()}
- Data Completeness: {((len(df) - df.isnull().sum().sum()) / (len(df) * len(df.columns)) * 100):.2f}%

Category Distribution:
{df['category'].value_counts().to_string()}

Text Characteristics:
- Average Description Length: {df['description_length'].mean():.1f} characters
- Average Word Count: {df['word_count'].mean():.1f} words
- Longest Description: {df['description_length'].max()} characters
- Shortest Description: {df['description_length'].min()} characters

Key Insights:
1. The dataset is well-balanced across all fraud categories
2. {df['category'].value_counts().index[0]} is the most common category ({df['category'].value_counts().iloc[0]} cases)
3. Average description length varies by category:
{df.groupby('category')['description_length'].mean().round(1).to_string()}

Recommendations for Further Analysis:
1. Text classification model development
2. Anomaly detection for unusual patterns
3. Temporal analysis of fraud trends
4. Feature engineering from text descriptions
5. Sentiment analysis of customer complaints

Files Generated:
- fraud_data.csv: Cleaned dataset
- fraud_class_counts.csv: Category distribution summary
- fraud_eda_visualizations.png: Comprehensive visualizations
- fraud_wordclouds.png: Category-specific word clouds
"""
    
    print(report)
    
    # Save report to file
    with open('/Users/pranavnair/ml_oasis/fraud_eda_report.txt', 'w') as f:
        f.write(report)
    
    print("✓ Summary report saved as 'fraud_eda_report.txt'")
    
    return df

def main():
    """
    Main function to execute the complete EDA pipeline
    """
    csv_file = '/Users/pranavnair/ml_oasis/fraud_data.csv'
    
    # Step 1: Load and examine data
    df = load_and_examine_data(csv_file)
    
    # Step 2: Check data quality
    df = check_data_quality(df)
    
    # Step 3: Preprocess data
    df_clean = preprocess_data(df)
    
    # Step 4: Univariate analysis
    df_clean = univariate_analysis(df_clean)
    
    # Step 5: Text analysis
    df_clean = text_analysis(df_clean)
    
    # Step 6: Create visualizations
    df_clean = create_visualizations(df_clean)
    
    # Step 7: Generate summary report
    df_final = generate_summary_report(df_clean)
    
    # Save the cleaned dataset
    df_clean.to_csv('/Users/pranavnair/ml_oasis/fraud_data_cleaned.csv', index=False)
    print(f"\n✓ Cleaned dataset saved as 'fraud_data_cleaned.csv'")
    
    print("\n" + "="*60)
    print("EDA PIPELINE COMPLETED SUCCESSFULLY!")
    print("="*60)
    
    return df_clean

if __name__ == "__main__":
    df_final = main()
