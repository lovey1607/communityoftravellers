import http.server
import socketserver
import sys
import os
import json
import subprocess

PORT = 8000
DB_FILE = os.path.abspath("db.json")

def load_db():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, 'r') as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "trips": [],
        "pending_imports": [],
        "rejected_imports": [],
        "duplicates": [],
        "reports": []
    }

def save_db(db):
    with open(DB_FILE, 'w') as f:
        json.dump(db, f, indent=2)

class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/trips':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            db = load_db()
            self.wfile.write(json.dumps(db.get("trips", [])).encode('utf-8'))
            return

        elif self.path == '/api/hosts':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            db = load_db()
            # Return hosts from db if they exist, otherwise empty array
            self.wfile.write(json.dumps(db.get("hosts", [])).encode('utf-8'))
            return

        elif self.path == '/api/jobs':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            db = load_db()
            self.wfile.write(json.dumps(db.get("jobs", [])).encode('utf-8'))
            return

        elif self.path == '/api/remote':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            db = load_db()
            self.wfile.write(json.dumps(db.get("remoteStays", [])).encode('utf-8'))
            return

        elif self.path == '/api/invite':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            db = load_db()
            self.wfile.write(json.dumps(db.get("inviteTrips", [])).encode('utf-8'))
            return
            
        elif self.path == '/api/aggregation/pending':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            db = load_db()
            self.wfile.write(json.dumps(db.get("pending_imports", [])).encode('utf-8'))
            return
            
        elif self.path == '/api/aggregation/duplicates':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            db = load_db()
            self.wfile.write(json.dumps(db.get("duplicates", [])).encode('utf-8'))
            return
            
        elif self.path == '/api/aggregation/reports':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            db = load_db()
            self.wfile.write(json.dumps(db.get("reports", [])).encode('utf-8'))
            return

        super().do_GET()

    def do_POST(self):
        # Read body content
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8')
        
        if self.path == '/api/trips/initialize':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                seed_trips = json.loads(post_data)
                db = load_db()
                if not db.get("trips"):
                    db["trips"] = seed_trips
                    save_db(db)
                self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            except Exception as e:
                self.send_error(400, f"Bad request: {e}")
            return
            
        elif self.path == '/api/aggregation/approve':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                body = json.loads(post_data)
                trip_id = body.get("id")
                db = load_db()
                
                pending = db.get("pending_imports", [])
                match = next((t for t in pending if t.get("id") == trip_id), None)
                if match:
                    match["status"] = "published"
                    db["trips"].append(match)
                    db["pending_imports"] = [t for t in pending if t.get("id") != trip_id]
                    save_db(db)
                    self.wfile.write(json.dumps({"success": True, "trip": match}).encode('utf-8'))
                else:
                    self.wfile.write(json.dumps({"success": False, "message": "Trip not found in pending"}).encode('utf-8'))
            except Exception as e:
                self.send_error(400, f"Bad request: {e}")
            return
            
        elif self.path == '/api/aggregation/reject':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                body = json.loads(post_data)
                trip_id = body.get("id")
                db = load_db()
                
                pending = db.get("pending_imports", [])
                match = next((t for t in pending if t.get("id") == trip_id), None)
                if match:
                    match["status"] = "rejected"
                    db["rejected_imports"].append(match)
                    db["pending_imports"] = [t for t in pending if t.get("id") != trip_id]
                    save_db(db)
                    self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
                else:
                    self.wfile.write(json.dumps({"success": False, "message": "Trip not found in pending"}).encode('utf-8'))
            except Exception as e:
                self.send_error(400, f"Bad request: {e}")
            return
            
        elif self.path == '/api/aggregation/merge':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                body = json.loads(post_data)
                dup_id = body.get("dupId")
                action = body.get("action") # 'merge' or 'ignore'
                
                db = load_db()
                dups = db.get("duplicates", [])
                dup_group = next((g for g in dups if g.get("id") == dup_id), None)
                
                if dup_group:
                    crawled_trip = dup_group.get("crawled_trip")
                    if action == 'merge':
                        # Merge departure dates to the existing trip
                        existing_trip_id = dup_group.get("matches")[0].get("existing_trip_id")
                        existing_trip = next((t for t in db.get("trips", []) if t.get("id") == existing_trip_id), None)
                        if existing_trip:
                            # Merge departure dates
                            crawled_dates = crawled_trip.get("departureDates", [])
                            existing_dates = existing_trip.get("departureDates", [])
                            merged_dates = list(set(existing_dates + crawled_dates))
                            existing_trip["departureDates"] = merged_dates
                    elif action == 'ignore':
                        # Keep separate, meaning publish the crawled trip as a new standalone trip
                        crawled_trip["status"] = "published"
                        db["trips"].append(crawled_trip)
                        
                    # Remove from duplicate queue
                    db["duplicates"] = [g for g in dups if g.get("id") != dup_id]
                    save_db(db)
                    self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
                else:
                    self.wfile.write(json.dumps({"success": False, "message": "Duplicate group not found"}).encode('utf-8'))
            except Exception as e:
                self.send_error(400, f"Bad request: {e}")
            return
            
        elif self.path == '/api/aggregation/trigger':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                # Trigger the scheduler run
                script_path = os.path.join(os.path.dirname(__file__), "aggregation_engine", "scheduler.py")
                # Run as background subprocess
                subprocess.Popen([sys.executable, script_path])
                self.wfile.write(json.dumps({"success": True, "message": "Crawler run initiated successfully"}).encode('utf-8'))
            except Exception as e:
                self.wfile.write(json.dumps({"success": False, "message": str(e)}).encode('utf-8'))
            return

        elif self.path == '/api/jobs/initialize':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                seed = json.loads(post_data)
                db = load_db()
                if not db.get("jobs"):
                    db["jobs"] = seed
                    save_db(db)
                self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            except Exception as e:
                self.send_error(400, f"Bad request: {e}")
            return

        elif self.path == '/api/remote/initialize':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                seed = json.loads(post_data)
                db = load_db()
                if not db.get("remoteStays"):
                    db["remoteStays"] = seed
                    save_db(db)
                self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            except Exception as e:
                self.send_error(400, f"Bad request: {e}")
            return

        elif self.path == '/api/invite/initialize':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                seed = json.loads(post_data)
                db = load_db()
                if not db.get("inviteTrips"):
                    db["inviteTrips"] = seed
                    save_db(db)
                self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            except Exception as e:
                self.send_error(400, f"Bad request: {e}")
            return

        elif self.path == '/api/jobs':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                item = json.loads(post_data)
                db = load_db()
                collection = db.get("jobs", [])
                idx = next((i for i, x in enumerate(collection) if x.get("id") == item.get("id")), -1)
                if idx > -1:
                    collection[idx] = item
                else:
                    collection.append(item)
                db["jobs"] = collection
                save_db(db)
                self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            except Exception as e:
                self.send_error(400, f"Bad request: {e}")
            return

        elif self.path == '/api/remote':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                item = json.loads(post_data)
                db = load_db()
                collection = db.get("remoteStays", [])
                idx = next((i for i, x in enumerate(collection) if x.get("id") == item.get("id")), -1)
                if idx > -1:
                    collection[idx] = item
                else:
                    collection.append(item)
                db["remoteStays"] = collection
                save_db(db)
                self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            except Exception as e:
                self.send_error(400, f"Bad request: {e}")
            return

        elif self.path == '/api/invite':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                item = json.loads(post_data)
                db = load_db()
                collection = db.get("inviteTrips", [])
                idx = next((i for i, x in enumerate(collection) if x.get("id") == item.get("id")), -1)
                if idx > -1:
                    collection[idx] = item
                else:
                    collection.append(item)
                db["inviteTrips"] = collection
                save_db(db)
                self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            except Exception as e:
                self.send_error(400, f"Bad request: {e}")
            return

        elif self.path == '/api/jobs/delete':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                body = json.loads(post_data)
                item_id = body.get("id")
                db = load_db()
                db["jobs"] = [x for x in db.get("jobs", []) if x.get("id") != item_id]
                save_db(db)
                self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            except Exception as e:
                self.send_error(400, f"Bad request: {e}")
            return

        # Job approve/reject: POST /api/jobs/<id>/approve or /api/jobs/<id>/reject
        elif self.path.startswith('/api/jobs/') and (self.path.endswith('/approve') or self.path.endswith('/reject')):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                parts = self.path.split('/')
                job_id = parts[3] if len(parts) > 3 else None
                action = parts[4] if len(parts) > 4 else None
                if job_id and action in ('approve', 'reject'):
                    new_status = 'approved' if action == 'approve' else 'rejected'
                    db = load_db()
                    for job in db.get("jobs", []):
                        if job.get("id") == job_id:
                            job["status"] = new_status
                            break
                    save_db(db)
                self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            except Exception as e:
                self.send_error(400, f"Bad request: {e}")
            return

        elif self.path == '/api/remote/delete':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                body = json.loads(post_data)
                item_id = body.get("id")
                db = load_db()
                db["remoteStays"] = [x for x in db.get("remoteStays", []) if x.get("id") != item_id]
                save_db(db)
                self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            except Exception as e:
                self.send_error(400, f"Bad request: {e}")
            return

        elif self.path == '/api/invite/delete':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                body = json.loads(post_data)
                item_id = body.get("id")
                db = load_db()
                db["inviteTrips"] = [x for x in db.get("inviteTrips", []) if x.get("id") != item_id]
                save_db(db)
                self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            except Exception as e:
                self.send_error(400, f"Bad request: {e}")
            return

        self.send_error(404, "API endpoint not found")

# Set the directory to serve if needed (default is current directory)
handler = CustomHTTPHandler

# Allow port reuse to avoid "Address already in use" errors on restarts
socketserver.TCPServer.allow_reuse_address = True

try:
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"🚀 Serving Community of Travellers on http://localhost:{PORT}")
        print("💡 API server initialized. Serving static content & REST endpoints.")
        sys.stdout.flush()
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nStopping server...")
except Exception as e:
    sys.stderr.write(f"Error: {e}\n")
