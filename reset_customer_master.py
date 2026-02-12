import os
import json
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def import_customer_master():
    # 1. Setup Connection
    uri = os.getenv("MONGODB_URI")
    if not uri:
        print("Error: MONGODB_URI not found in .env file.")
        return

    try:
        client = MongoClient(uri)
        db = client["po_app"]
        customer_col = db["customer_master"]

        # 2. Load the JSON file
        file_path = "customer_master_data.json"
        if not os.path.exists(file_path):
            print(f"Error: {file_path} not found.")
            return

        with open(file_path, "r") as file:
            raw_data = json.load(file)

        # 3. Transform data from { "id": {data} } to a list [ {customer_id: id, ...data} ]
        formatted_data = []
        for customer_id, details in raw_data.items():
            # We add the key as 'customer_id' so the info isn't lost
            document = {
                "customer_id": customer_id,
                "customer_names": details.get("customer_names", []),
                "sales_org": details.get("sales_org", ""),
                "ship_to": details.get("ship_to", {})
            }
            formatted_data.append(document)

        # 4. Insert into MongoDB
        if formatted_data:
            # Clear existing data to avoid duplicates (optional)
            customer_col.delete_many({})
            
            # Insert the new list
            result = customer_col.insert_many(formatted_data)
            print(f"Successfully imported {len(result.inserted_ids)} customers into 'customer_master'.")
        else:
            print("No data found in JSON to import.")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    import_customer_master()