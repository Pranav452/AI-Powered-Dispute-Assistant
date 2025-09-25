#!/usr/bin/env python3
"""
Simple Fraud Category Prediction System
Direct interface to use your trained logistic regression model
"""

import pickle
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
import re
import warnings
warnings.filterwarnings('ignore')

def load_model(model_path='/Users/pranavnair/ml_oasis/Logistic Regression Model.pkl'):
    """Load the trained logistic regression model"""
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        print("✓ Model loaded successfully")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

def create_vectorizer():
    """Create and fit a TF-IDF vectorizer on the training data"""
    try:
        # Load the training data
        try:
            df = pd.read_csv('/Users/pranavnair/ml_oasis/fraud_data_cleaned.csv')
        except:
            df = pd.read_csv('/Users/pranavnair/ml_oasis/fraud_data.csv')
        
        # Create vectorizer with settings that should match your model
        vectorizer = TfidfVectorizer(
            max_features=177,  # Match the expected input features
            stop_words='english',
            lowercase=True,
            ngram_range=(1, 1)
        )
        
        # Fit on training data
        vectorizer.fit(df['description'])
        print("✓ Vectorizer created and fitted")
        return vectorizer, df
        
    except Exception as e:
        print(f"Error creating vectorizer: {e}")
        return None, None

def preprocess_text(text):
    """Clean and preprocess the input text"""
    # Convert to lowercase and strip
    text = text.lower().strip()
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s.,!?-]', '', text)
    
    return text

def predict_fraud_category(description, model=None, vectorizer=None, categories=None):
    """
    Predict fraud category for a given description
    
    Args:
        description (str): The fraud description text
        model: Trained logistic regression model
        vectorizer: Fitted TF-IDF vectorizer
        categories (list): List of category names
    
    Returns:
        dict: Prediction results
    """
    if model is None or vectorizer is None:
        return {"error": "Model or vectorizer not provided"}
    
    try:
        # Preprocess the text
        cleaned_text = preprocess_text(description)
        
        # Vectorize the text
        text_vector = vectorizer.transform([cleaned_text])
        
        # Make prediction
        prediction = model.predict(text_vector)[0]
        probabilities = model.predict_proba(text_vector)[0]
        
        # Get category names
        if categories is None:
            categories = ['DUPLICATE_CHARGE', 'FAILED_TRANSACTION', 'FRAUD', 'REFUND_PENDING', 'OTHERS']
        
        # Map prediction to category
        if isinstance(prediction, (int, np.integer)):
            predicted_category = categories[prediction] if prediction < len(categories) else f"Category_{prediction}"
        else:
            predicted_category = str(prediction)
        
        # Create confidence scores
        confidence_scores = {}
        for i, category in enumerate(categories[:len(probabilities)]):
            confidence_scores[category] = round(probabilities[i] * 100, 2)
        
        # Sort by confidence
        sorted_scores = dict(sorted(confidence_scores.items(), key=lambda x: x[1], reverse=True))
        
        return {
            'original_text': description,
            'cleaned_text': cleaned_text,
            'predicted_category': predicted_category,
            'confidence': round(max(probabilities) * 100, 2),
            'all_probabilities': sorted_scores
        }
        
    except Exception as e:
        return {"error": f"Prediction failed: {e}"}

def interactive_mode():
    """Run interactive prediction mode"""
    print("\n" + "="*60)
    print("FRAUD CATEGORY PREDICTION SYSTEM")
    print("="*60)
    
    # Load model and setup
    model = load_model()
    if model is None:
        print("Failed to load model. Exiting.")
        return
    
    vectorizer, df = create_vectorizer()
    if vectorizer is None:
        print("Failed to create vectorizer. Exiting.")
        return
    
    # Get unique categories from data
    categories = sorted(df['category'].unique().tolist())
    print(f"Available categories: {', '.join(categories)}")
    
    print("\nEnter fraud descriptions to get predictions.")
    print("Type 'quit' to exit, 'help' for examples, 'test' for sample predictions.")
    print("-"*60)
    
    # Sample test cases
    test_cases = [
        "I was charged twice for the same online purchase",
        "My payment failed but money was still deducted",
        "I did not authorize this transaction on my card",
        "Still waiting for my refund after order cancellation",
        "The merchant charged me more than the agreed amount"
    ]
    
    while True:
        try:
            user_input = input("\nEnter description: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("Goodbye!")
                break
            
            elif user_input.lower() == 'help':
                print(f"\n{'='*50}")
                print("EXAMPLE DESCRIPTIONS:")
                print(f"{'='*50}")
                for i, example in enumerate(test_cases, 1):
                    print(f"{i}. {example}")
                print(f"{'='*50}")
                continue
            
            elif user_input.lower() == 'test':
                print(f"\n{'='*50}")
                print("RUNNING TEST PREDICTIONS:")
                print(f"{'='*50}")
                for i, test_desc in enumerate(test_cases, 1):
                    result = predict_fraud_category(test_desc, model, vectorizer, categories)
                    if 'error' not in result:
                        print(f"\n{i}. Input: {test_desc}")
                        print(f"   Prediction: {result['predicted_category']} ({result['confidence']}%)")
                    else:
                        print(f"\n{i}. Error: {result['error']}")
                print(f"{'='*50}")
                continue
            
            elif len(user_input) < 5:
                print("Please enter a more detailed description.")
                continue
            
            # Make prediction
            result = predict_fraud_category(user_input, model, vectorizer, categories)
            
            if 'error' in result:
                print(f"Error: {result['error']}")
                continue
            
            # Display results
            print(f"\n{'='*50}")
            print(f"📝 Original: {result['original_text']}")
            print(f"🔍 Cleaned: {result['cleaned_text']}")
            print(f"🎯 Predicted: {result['predicted_category']}")
            print(f"📊 Confidence: {result['confidence']}%")
            print(f"\n📈 All Probabilities:")
            for category, prob in result['all_probabilities'].items():
                bar = "█" * max(1, int(prob / 5))  # Visual bar
                print(f"   {category:<18}: {prob:>6.2f}% {bar}")
            print(f"{'='*50}")
            
        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")

def predict_single_description(description):
    """
    Simple function to predict a single description
    
    Args:
        description (str): The fraud description
    
    Returns:
        dict: Prediction result
    """
    model = load_model()
    if model is None:
        return {"error": "Failed to load model"}
    
    vectorizer, df = create_vectorizer()
    if vectorizer is None:
        return {"error": "Failed to create vectorizer"}
    
    categories = sorted(df['category'].unique().tolist())
    
    return predict_fraud_category(description, model, vectorizer, categories)

if __name__ == "__main__":
    interactive_mode()
