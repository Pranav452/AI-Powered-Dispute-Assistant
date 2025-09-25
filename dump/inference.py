# Load the saved model (Logistic Regression, LightGBM, or XGBoost) and the saved PCA object.
import pickle
from sklearn.decomposition import PCA
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import LabelEncoder
import numpy as np

# Load Logistic Regression model
with open('logistic_regression_model.pkl', 'rb') as f:
    loaded_log_reg_model = pickle.load(f)

# Load the PCA object
with open('pca.pkl', 'rb') as f:
    loaded_pca = pickle.load(f)

# Load the LabelEncoder object (only needed for XGBoost, but loading it here for completeness if you switch models)
with open('label_encoder.pkl', 'rb') as f:
    loaded_label_encoder = pickle.load(f)

# Load the sentence transformer model
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')


def predict_new_data(new_descriptions):
    """
    Takes new raw data, preprocesses it, and makes predictions using the loaded model.

    Args:
        new_descriptions (list): A list of raw text descriptions.

    Returns:
        numpy.ndarray: Predicted labels.
    """
    # Preprocessing steps:
    # 1. Generate embeddings
    embeddings = model.encode(new_descriptions)

    # 2. Apply PCA
    preprocessed_embeddings = loaded_pca.transform(embeddings)

    # Inference step:
    # Make predictions using the loaded model
    predictions_encoded = loaded_log_reg_model.predict(preprocessed_embeddings)

    # Inverse transform if using XGBoost (or any model that required label encoding)
    # For Logistic Regression, the loaded_log_reg_model already predicts the original labels
    # If you were using the XGBoost model, you would uncomment the line below:
    # predictions = loaded_label_encoder.inverse_transform(predictions_encoded)
    predictions = predictions_encoded

    return predictions

print("Inference snippet defined.")

# Example new data
new_descriptions_example = [
    "two pay",
    "Money was debited but the transaction failed.",
    "Someone used my card for a transaction I didn't make.",
    "Waiting for a refund after canceling an order."
]

# Get predictions using the inference snippet
predictions_example = predict_new_data(new_descriptions_example)

print("\nPredictions for example data:")
print(predictions_example)