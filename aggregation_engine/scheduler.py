import os
import json
import datetime
from crawler import TripCrawler
from normalizer import TripNormalizer
from deduplicator import TripDeduplicator

class AggregationScheduler:
    def __init__(self):
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "db.json"))
        self.crawler = TripCrawler()
        self.normalizer = TripNormalizer()
        self.deduplicator = TripDeduplicator()

    def load_db(self):
        if os.path.exists(self.db_path):
            try:
                with open(self.db_path, 'r') as f:
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

    def save_db(self, db):
        with open(self.db_path, 'w') as f:
            json.dump(db, f, indent=2)

    def run_pipeline(self):
        print(f"⏰ Starting Trip Aggregation Engine Run - {datetime.datetime.now().isoformat()}")
        db = self.load_db()
        
        sources_crawled = list(self.crawler.sources.keys())
        new_trips_count = 0
        duplicates_found = 0
        success_count = 0
        failed_count = 0
        
        all_discovered = {}
        for source in sources_crawled:
            try:
                links = self.crawler.discover_links(source)
                all_discovered[source] = links
            except Exception as e:
                print(f"❌ Failed to crawl source {source}: {e}")
                failed_count += 1

        existing_trips = db.get("trips", [])
        pending_imports = db.get("pending_imports", [])
        
        existing_urls = {t.get("sourceUrl") for t in existing_trips if t.get("sourceUrl")}
        pending_urls = {p.get("sourceUrl") for p in pending_imports if p.get("sourceUrl")}
        
        for source, links in all_discovered.items():
            for link in links:
                if link in existing_urls or link in pending_urls:
                    continue
                
                try:
                    raw_text = self.crawler.extract_raw_page(link)
                    normalized_data = self.normalizer.normalize(raw_text, link)
                    
                    # Map source name to hostId
                    source_key = source.lower().replace(" ", "").replace("&", "")
                    host_id_map = {
                        "wanderon": "host-wanderon",
                        "justwravel": "host-justwravel",
                        "thrillophilia": "host-thrillophilia",
                        "tanyakhanijow": "host-tanyakhanijow",
                        "monkeymagictrips": "host-monkeymagic",
                        "captureatrip": "host-captureatrip",
                        "deyoradventures": "host-deyor",
                        "trekthehimalayas": "host-trekthehimalayas",
                        "indiahikes": "host-indiahikes",
                        "adventurenation": "host-adventurenation",
                        "veenaworld": "host-veenaworld",
                        "thomascookindia": "host-thomascook",
                        "sotc": "host-sotc",
                        "tripototrips": "host-tripoto",
                        "go4explore": "host-go4explore",
                        "nomadgao": "host-nomadgao",
                        "solotravelindia": "host-solotravelindia"
                    }
                    normalized_data["hostId"] = host_id_map.get(source_key, "host-001")
                    normalized_data["featured"] = True
                    normalized_data["trending"] = True
                    import time
                    normalized_data["id"] = f"crawled-{source_key}-{int(time.time()*1000)}-{new_trips_count}"
                    normalized_data["sourceUrl"] = link
                    normalized_data["companyName"] = source
                    normalized_data["status"] = "published"
                    normalized_data["createdAt"] = datetime.datetime.now().isoformat()
                    
                    # Fallback cover image if none found
                    if not normalized_data.get("coverImage"):
                        normalized_data["coverImage"] = "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80"
                        normalized_data["gallery"] = [normalized_data["coverImage"]]

                    slug_base = normalized_data.get("title", "trip").lower().replace(" ", "-")
                    slug_base = "".join(c for c in slug_base if c.isalnum() or c == "-")
                    normalized_data["slug"] = f"{slug_base}-{normalized_data['duration']['days']}d-{normalized_data['duration']['nights']}n"
                    
                    dups = self.deduplicator.find_duplicates(normalized_data, existing_trips, threshold=70)
                    if dups:
                        duplicates_found += 1
                        db["duplicates"].append({
                            "id": "dup-" + str(datetime.datetime.now().timestamp()).replace('.', ''),
                            "crawled_trip": normalized_data,
                            "matches": dups,
                            "resolved": False
                        })
                    else:
                        new_trips_count += 1
                        # Auto-publish directly to trips array
                        db["trips"].append(normalized_data)
                    
                    success_count += 1
                except Exception as e:
                    print(f"❌ Failed to process URL {link}: {e}")
                    failed_count += 1

        total_runs = success_count + failed_count
        success_rate = int((success_count / total_runs) * 100) if total_runs > 0 else 100
        
        report = {
            "id": "rep-" + str(datetime.datetime.now().timestamp()).replace('.', ''),
            "timestamp": datetime.datetime.now().isoformat(),
            "sources_crawled": sources_crawled,
            "new_trips_found": new_trips_count,
            "duplicates_detected": duplicates_found,
            "failed_imports": failed_count,
            "success_rate": success_rate
        }
        
        if "reports" not in db:
            db["reports"] = []
        db["reports"].insert(0, report)
        db["reports"] = db["reports"][:20]
        
        self.save_db(db)
        print(f"✅ Pipeline run complete. New trips: {new_trips_count}, Duplicates: {duplicates_found}, Reports saved.")
        return report

if __name__ == "__main__":
    scheduler = AggregationScheduler()
    scheduler.run_pipeline()
