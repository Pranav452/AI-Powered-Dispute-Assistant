#!/usr/bin/env python3
"""
Fraud Category Prediction System
Uses pre-trained Logistic Regression model to predict fraud categories from descriptions
"""

import pickle
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
import re
import warnings
warnings.filterwarnings('ignore')

class FraudPredictor:
    def __init__(self, model_path='/Users/pranavnair/ml_oasis/Logistic Regression Model.pkl'):
        """
        Initialize the fraud predictor with the trained model
        
        Args:
            model_path (str): Path to the pickle file containing the trained model
        """
        self.model_path = model_path
        self.model = None
        self.vectorizer = None
        self.label_encoder = None
        self.categories = ['DUPLICATE_CHARGE', 'FAILED_TRANSACTION', 'FRAUD', 'REFUND_PENDING', 'OTHERS']
        
        # Load the model
        self.load_model()
        
        # If model doesn't include preprocessing components, create them from training data
        if self.vectorizer is None or self.label_encoder is None:
            self.setup_preprocessing()
    
    def load_model(self):
        """Load the trained model from pickle file"""
        try:
            print("Loading trained model...")
            with open(self.model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            # Handle different pickle formats
            if isinstance(model_data, dict):
                # If it's a dictionary with model components
                self.model = model_data.get('model')
                self.vectorizer = model_data.get('vectorizer')
                self.label_encoder = model_data.get('label_encoder')
                print("✓ Loaded model with preprocessing components")
            else:
                # If it's just the model
                self.model = model_data
                print("✓ Loaded model (preprocessing components will be created)")
                
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    
    def setup_preprocessing(self):
        """Setup preprocessing components if not included in the pickle file"""
        print("Setting up preprocessing components...")
        
        # Load training data to fit preprocessing components
        try:
            df = pd.read_csv('/Users/pranavnair/ml_oasis/fraud_data_cleaned.csv')
        except:
            df = pd.read_csv('/Users/pranavnair/ml_oasis/fraud_data.csv')
        
        # Setup TF-IDF Vectorizer with parameters that match the trained model
        # The model expects 177 features, so we'll use max_features=177
        self.vectorizer = TfidfVectorizer(
            max_features=177,
            stop_words='english',
            lowercase=True,
            ngram_range=(1, 1)  # Using unigrams only to match expected feature count
        )
        self.vectorizer.fit(df['description'])
        
        # Setup Label Encoder
        self.label_encoder = LabelEncoder()
        self.label_encoder.fit(df['category'])
        
        print("✓ Preprocessing components setup complete")
    
    def preprocess_text(self, text):
        """
        Preprocess the input text description
        
        Args:
            text (str): Input description text
            
        Returns:
            str: Cleaned text
        """
        # Convert to lowercase
        text = text.lower().strip()
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,!?-]', '', text)
        
        return text
    
    def predict_single(self, description):
        """
        Predict the fraud category for a single description
        
        Args:
            description (str): The fraud description text
            
        Returns:
            dict: Prediction results with category, probability, and confidence scores
        """
        # Preprocess the text
        cleaned_text = self.preprocess_text(description)
        
        # Vectorize the text
        text_vector = self.vectorizer.transform([cleaned_text])
        
        # Make prediction
        prediction = self.model.predict(text_vector)[0]
        probabilities = self.model.predict_proba(text_vector)[0]
        
        # Convert prediction back to category name
        if hasattr(self.label_encoder, 'inverse_transform'):
            predicted_category = self.label_encoder.inverse_transform([prediction])[0]
        else:
            predicted_category = self.categories[prediction]
        
        # Get confidence scores for all categories
        if hasattr(self.label_encoder, 'classes_'):
            category_names = self.label_encoder.classes_
        else:
            category_names = self.categories
        
        confidence_scores = {}
        for i, category in enumerate(category_names):
            confidence_scores[category] = round(probabilities[i] * 100, 2)
        
        # Sort by confidence
        sorted_scores = dict(sorted(confidence_scores.items(), key=lambda x: x[1], reverse=True))
        
        return {
            'predicted_category': predicted_category,
            'confidence': round(max(probabilities) * 100, 2),
            'all_probabilities': sorted_scores,
            'cleaned_text': cleaned_text
        }
    
    def predict_batch(self, descriptions):
        """
        Predict categories for multiple descriptions
        
        Args:
            descriptions (list): List of description texts
            
        Returns:
            list: List of prediction dictionaries
        """
        results = []
        for desc in descriptions:
            result = self.predict_single(desc)
            results.append(result)
        return results
    
    def interactive_prediction(self):
        """Interactive mode for making predictions"""
        print("\n" + "="*60)
        print("FRAUD CATEGORY PREDICTION SYSTEM")
        print("="*60)
        print("Enter fraud descriptions to get category predictions.")
        print("Type 'quit' to exit, 'help' for examples.")
        print("-"*60)
        
        while True:
            try:
                user_input = input("\nEnter description: ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'q']:
                    print("Goodbye!")
                    break
                
                elif user_input.lower() == 'help':
                    self.show_examples()
                    continue
                
                elif len(user_input) < 5:
                    print("Please enter a more detailed description.")
                    continue
                
                # Make prediction
                result = self.predict_single(user_input)
                
                # Display results
                print(f"\n{'='*50}")
                print(f"📝 Input: {user_input}")
                print(f"🔍 Cleaned: {result['cleaned_text']}")
                print(f"🎯 Predicted Category: {result['predicted_category']}")
                print(f"📊 Confidence: {result['confidence']}%")
                print(f"\n📈 All Category Probabilities:")
                for category, prob in result['all_probabilities'].items():
                    bar = "█" * int(prob / 5)  # Visual bar
                    print(f"   {category:<18}: {prob:>6.2f}% {bar}")
                print(f"{'='*50}")
                
            except KeyboardInterrupt:
                print("\n\nGoodbye!")
                break
            except Exception as e:
                print(f"Error: {e}")
    
    def show_examples(self):
        """Show example descriptions for each category"""
        examples = {
            'DUPLICATE_CHARGE': [
                "I was charged twice for the same UPI payment",
                "Got two identical charges from the same merchant"
            ],
            'FAILED_TRANSACTION': [
                "Payment failed but money was debited from account",
                "Transaction shows failed but amount was deducted"
            ],
            'FRAUD': [
                "I did not authorize this transaction, it's fraudulent",
                "This charge appeared on my card but I never made it"
            ],
            'REFUND_PENDING': [
                "Still waiting for refund after canceled order",
                "Refund has been pending for over a week now"
            ],
            'OTHERS': [
                "The merchant charged wrong amount than agreed",
                "Service was not provided as promised but charged"
            ]
        }
        
        print(f"\n{'='*60}")
        print("EXAMPLE DESCRIPTIONS BY CATEGORY")
        print(f"{'='*60}")
        
        for category, example_list in examples.items():
            print(f"\n{category}:")
            for i, example in enumerate(example_list, 1):
                print(f"  {i}. {example}")
        print(f"{'='*60}")

def main():
    """Main function to run the prediction system"""
    try:
        # Initialize the predictor
        predictor = FraudPredictor()
        
        # Test with a sample prediction
        print("\n🧪 Testing with sample description...")
        sample_desc = "I was charged twice for the same online purchase"
        result = predictor.predict_single(sample_desc)
        
        print(f"Sample: {sample_desc}")
        print(f"Prediction: {result['predicted_category']} ({result['confidence']}% confidence)")
        
        # Start interactive mode
        predictor.interactive_prediction()
        
    except Exception as e:
        print(f"Error initializing predictor: {e}")
        print("Please ensure the model file exists and is properly formatted.")

if __name__ == "__main__":
    main()
