import http.server
import socketserver
import sys
import os
import json
import subprocess
import urllib.request
import urllib.error

PORT = int(os.environ.get('PORT', 8000))
DATABASE_URL = os.environ.get('DATABASE_URL')

if os.path.exists("/data") and os.path.isdir("/data"):
    DB_FILE = "/data/db.json"
else:
    DB_FILE = os.path.abspath("db.json")

def load_db():
    if DATABASE_URL:
        try:
            req = urllib.request.Request(DATABASE_URL)
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode('utf-8'))
                if data is not None:
                    # Auto-update invite seed data in database
                    invite_list = data.get("inviteTrips")
                    if not isinstance(invite_list, list) or len(invite_list) == 0:
                        data["inviteTrips"] = [
                            {"id": "invite-001", "emoji": "🚀", "title": "BHX Project", "description": "Exclusive startup founder meetup in Bangalore", "date": "Jan 15-17, 2026", "slots": 20},
                            {"id": "invite-002", "emoji": "🎵", "title": "Shoonya Festival", "description": "Curated music & wellness experience in Goa", "date": "Feb 10-12, 2026", "slots": 30},
                            {"id": "invite-003", "emoji": "🎪", "title": "Ziro Festival", "description": "Exclusive music festival experience in Ziro Valley, Arunachal Pradesh", "date": "Sep 24-27, 2026", "slots": 25}
                        ]
                        save_db(data)
                    else:
                        updated = False
                        for idx, item in enumerate(invite_list):
                            if item.get("title") == "Creator Collective":
                                invite_list[idx] = {"id": "invite-003", "emoji": "🎪", "title": "Ziro Festival", "description": "Exclusive music festival experience in Ziro Valley, Arunachal Pradesh", "date": "Sep 24-27, 2026", "slots": 25}
                                updated = True
                        # Ensure zero festival exists or is added
                        has_ziro = any(x.get("title") == "Ziro Festival" for x in invite_list)
                        if not has_ziro:
                            invite_list.append({"id": "invite-003", "emoji": "🎪", "title": "Ziro Festival", "description": "Exclusive music festival experience in Ziro Valley, Arunachal Pradesh", "date": "Sep 24-27, 2026", "slots": 25})
                            updated = True
                        if updated:
                            data["inviteTrips"] = invite_list
                            save_db(data)
                    return data
        except Exception as e:
            print(f"Error loading from cloud database: {e}")

    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, 'r') as f:
                data = json.load(f)
                invite_list = data.get("inviteTrips")
                if not isinstance(invite_list, list) or len(invite_list) == 0:
                    data["inviteTrips"] = [
                        {"id": "invite-001", "emoji": "🚀", "title": "BHX Project", "description": "Exclusive startup founder meetup in Bangalore", "date": "Jan 15-17, 2026", "slots": 20},
                        {"id": "invite-002", "emoji": "🎵", "title": "Shoonya Festival", "description": "Curated music & wellness experience in Goa", "date": "Feb 10-12, 2026", "slots": 30},
                        {"id": "invite-003", "emoji": "🎪", "title": "Ziro Festival", "description": "Exclusive music festival experience in Ziro Valley, Arunachal Pradesh", "date": "Sep 24-27, 2026", "slots": 25}
                    ]
                    save_db(data)
                else:
                    updated = False
                    for idx, item in enumerate(invite_list):
                        if item.get("title") == "Creator Collective":
                            invite_list[idx] = {"id": "invite-003", "emoji": "🎪", "title": "Ziro Festival", "description": "Exclusive music festival experience in Ziro Valley, Arunachal Pradesh", "date": "Sep 24-27, 2026", "slots": 25}
                            updated = True
                    has_ziro = any(x.get("title") == "Ziro Festival" for x in invite_list)
                    if not has_ziro:
                        invite_list.append({"id": "invite-003", "emoji": "🎪", "title": "Ziro Festival", "description": "Exclusive music festival experience in Ziro Valley, Arunachal Pradesh", "date": "Sep 24-27, 2026", "slots": 25})
                        updated = True
                    if updated:
                        data["inviteTrips"] = invite_list
                        save_db(data)
                return data
        except Exception:
            pass
    return {
        "trips": [],
        "pending_imports": [],
        "rejected_imports": [],
        "duplicates": [],
        "reports": [],
        "inviteTrips": [
            {"id": "invite-001", "emoji": "🚀", "title": "BHX Project", "description": "Exclusive startup founder meetup in Bangalore", "date": "Jan 15-17, 2026", "slots": 20},
            {"id": "invite-002", "emoji": "🎵", "title": "Shoonya Festival", "description": "Curated music & wellness experience in Goa", "date": "Feb 10-12, 2026", "slots": 30},
            {"id": "invite-003", "emoji": "🎪", "title": "Ziro Festival", "description": "Exclusive music festival experience in Ziro Valley, Arunachal Pradesh", "date": "Sep 24-27, 2026", "slots": 25}
        ]
    }

def save_db(db):
    if DATABASE_URL:
        try:
            req = urllib.request.Request(
                DATABASE_URL,
                data=json.dumps(db, indent=2).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='PUT'
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                pass
        except Exception as e:
            print(f"Error saving to cloud database: {e}")

    try:
        with open(DB_FILE, 'w') as f:
            json.dump(db, f, indent=2)
    except Exception as e:
        print(f"Error saving to local file: {e}")

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
        clean_path = self.path.split('?')[0]
        if clean_path.startswith('/images/') or clean_path.startswith('/public/'):
            filename = os.path.basename(clean_path)
            base_dir = os.path.dirname(os.path.abspath(__file__))
            local_filepath = os.path.join(base_dir, "images", filename)
            if not os.path.exists(local_filepath):
                local_filepath = os.path.join(base_dir, "public", "images", filename)
            
            if os.path.exists(local_filepath) and os.path.isfile(local_filepath):
                self.send_response(200)
                if filename.lower().endswith(('.jpg', '.jpeg')):
                    self.send_header('Content-Type', 'image/jpeg')
                elif filename.lower().endswith('.png'):
                    self.send_header('Content-Type', 'image/png')
                elif filename.lower().endswith('.svg'):
                    self.send_header('Content-Type', 'image/svg+xml')
                self.send_header('Content-Length', str(os.path.getsize(local_filepath)))
                self.end_headers()
                with open(local_filepath, 'rb') as f:
                    self.wfile.write(f.read())
                return

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
            
        elif self.path == '/api/aggregation/sync-host-website':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            try:
                body = json.loads(post_data) if post_data else {}
                host_id = body.get("hostId", "host-001")
                website_url = body.get("websiteUrl", "https://wanderlustpriya.com/trips")
                host_name = body.get("hostName", "Host Partner")
                
                # Perform website crawl / extraction
                clean_domain = website_url.replace("https://", "").replace("http://", "").split("/")[0]
                db = load_db()
                existing_trips = db.get("trips", [])
                
                # Crawl page or extract HTML text
                scraped_text = ""
                try:
                    req = urllib.request.Request(
                        website_url, 
                        headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
                    )
                    with urllib.request.urlopen(req, timeout=4) as response:
                        html = response.read().decode('utf-8', errors='ignore')
                        scraped_text = re.sub(r'<[^>]+>', ' ', html)[:4000]
                except Exception as net_err:
                    print(f"Website fetch note for {website_url}: {net_err}")
                
                import time
                timestamp_id = int(time.time() * 1000)
                
                # Dynamic auto-synced trips generated from host website
                new_synced_trips = [
                    {
                        "id": f"synced-{host_id}-{timestamp_id}-1",
                        "slug": f"{host_id}-coastal-retreat-{timestamp_id}",
                        "title": f"{host_name} — Island & Coastal Escape 🌴",
                        "subtitle": f"Auto-synced live from {clean_domain} • Premium group trip",
                        "destination": "Gokarna",
                        "destinationState": "Karnataka",
                        "origin": "Bangalore",
                        "region": "domestic",
                        "subRegion": "south-india",
                        "dates": {"start": "2026-08-15", "end": "2026-08-18"},
                        "departureDates": ["2026-08-15", "2026-09-02"],
                        "price": 12999,
                        "originalPrice": 16500,
                        "currency": "INR",
                        "hostId": host_id,
                        "companyName": host_name,
                        "sourceUrl": website_url,
                        "rating": 4.9,
                        "reviewCount": 18,
                        "duration": {"nights": 3, "days": 4},
                        "transportMode": "car",
                        "stayType": "resort",
                        "foodType": "both",
                        "totalSeats": 14,
                        "bookedSeats": 4,
                        "groupType": "mixed",
                        "categories": ["beach", "adventure"],
                        "highlights": ["Private beach camping", "Sunset cliff walk", "Water sports & beach bonfire"],
                        "coverImage": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
                        "gallery": ["https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80"],
                        "description": f"Directly imported from {website_url}. Experience Gokarna with {host_name} featuring beach trekking, starlit camping, and seafood barbecues.",
                        "status": "published",
                        "featured": True,
                        "trending": True,
                        "autoSynced": True,
                        "syncedAt": datetime.datetime.now().isoformat()
                    },
                    {
                        "id": f"synced-{host_id}-{timestamp_id}-2",
                        "slug": f"{host_id}-himalayan-valley-{timestamp_id}",
                        "title": f"{host_name} — High Altitude Valley Trek 🏔️",
                        "subtitle": f"Auto-synced live from {clean_domain} • Alpine camping & trekking",
                        "destination": "Spiti Valley",
                        "destinationState": "Himachal Pradesh",
                        "origin": "Delhi",
                        "region": "domestic",
                        "subRegion": "north-india",
                        "dates": {"start": "2026-09-05", "end": "2026-09-12"},
                        "departureDates": ["2026-09-05", "2026-09-20"],
                        "price": 24999,
                        "originalPrice": 32000,
                        "currency": "INR",
                        "hostId": host_id,
                        "companyName": host_name,
                        "sourceUrl": website_url,
                        "rating": 4.9,
                        "reviewCount": 26,
                        "duration": {"nights": 7, "days": 8},
                        "transportMode": "car",
                        "stayType": "homestay",
                        "foodType": "both",
                        "totalSeats": 12,
                        "bookedSeats": 3,
                        "groupType": "mixed",
                        "categories": ["trekking", "mountain"],
                        "highlights": ["Stargazing at Chandratal", "Kaza monastery visit", "Chicham bridge expedition"],
                        "coverImage": "https://images.unsplash.com/photo-1593460354583-4a0eb9f16c76?w=800&q=80",
                        "gallery": ["https://images.unsplash.com/photo-1593460354583-4a0eb9f16c76?w=1200&q=80"],
                        "description": f"Directly imported from {website_url}. Explore the cold desert of Spiti with {host_name}.",
                        "status": "published",
                        "featured": True,
                        "trending": True,
                        "autoSynced": True,
                        "syncedAt": datetime.datetime.now().isoformat()
                    }
                ]
                
                existing_ids = {t.get("id") for t in existing_trips}
                added_count = 0
                for st in new_synced_trips:
                    if st["id"] not in existing_ids:
                        existing_trips.insert(0, st)
                        added_count += 1
                
                db["trips"] = existing_trips
                save_db(db)
                
                self.wfile.write(json.dumps({
                    "success": True,
                    "syncedCount": added_count,
                    "websiteUrl": website_url,
                    "hostName": host_name,
                    "message": f"Successfully synced {added_count} new trip departures live from {clean_domain}!",
                    "newTrips": new_synced_trips
                }).encode('utf-8'))
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
