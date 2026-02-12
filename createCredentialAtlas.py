import os
import hashlib
from pymongo import MongoClient
from dotenv import load_dotenv

# Load variables from .env into the environment
load_dotenv()

def create_initial_users():
    # Retrieve the URI from the environment variable
    uri = os.getenv("MONGODB_URI")
    
    if not uri:
        print("Error: MONGODB_URI not found in .env file.")
        return

    try:
        client = MongoClient(uri)
        db = client["po_app"]
        users_col = db["users"]

        # Clear existing users
        users_col.delete_many({})

        def hash_pass(password):
            return hashlib.sha256(password.encode()).hexdigest()

        users = [
            {"username": "adminbeck", "password": hash_pass("admin@9889"), "role": "admin"},
            {"username": "11", "password": hash_pass("11"), "role": "admin"},
            {"username": "staff", "password": hash_pass("staf@9889"), "role": "user"},
            {"username": "2", "password": hash_pass("2"), "role": "user"}
        ]

        users_col.insert_many(users)
        print("Successfully created Admin and Staff users in MongoDB Atlas.")
        
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    create_initial_users()