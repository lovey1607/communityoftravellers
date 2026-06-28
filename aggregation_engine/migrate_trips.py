import json
import os

db_path = "/Users/pranjalgazal/.gemini/antigravity/scratch/community-of-travellers/db.json"

if os.path.exists(db_path):
    with open(db_path, 'r') as f:
        db = json.load(f)
    
    # Get all pending imports
    pending = db.get("pending_imports", [])
    
    # Change status to published
    for item in pending:
        item["status"] = "published"
    
    # Overwrite trips with these crawled trips
    db["trips"] = pending
    db["pending_imports"] = []
    db["duplicates"] = []
    
    with open(db_path, 'w') as f:
        json.dump(db, f, indent=2)
    print("✅ Successfully migrated crawled trips to published and cleared pending imports queue!")
else:
    print("❌ db.json not found.")
