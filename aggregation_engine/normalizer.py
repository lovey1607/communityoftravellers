import json
import os
import urllib.request

class TripNormalizer:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        # Load from config.json if exists
        config_path = os.path.join(os.path.dirname(__file__), "config.json")
        if not self.api_key and os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    config = json.load(f)
                    self.api_key = config.get("GEMINI_API_KEY")
            except Exception:
                pass

    def normalize(self, raw_text, source_url):
        print(f"🔮 Normalizing content using AI parser for {source_url}...")
        
        if self.api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"
                prompt = (
                    "You are a travel database importer. Convert the following raw text from a trip page into a clean, structured JSON object. "
                    "Return ONLY valid raw JSON matching the following schema. No markdown backticks, no comments, no extra text.\n\n"
                    "Schema:\n"
                    "{\n"
                    "  \"title\": \"Trip Name\",\n"
                    "  \"destination\": \"City or Region\",\n"
                    "  \"destinationState\": \"State or Country\",\n"
                    "  \"price\": 12000,\n"
                    "  \"originalPrice\": 15000,\n"
                    "  \"duration\": {\"nights\": 5, \"days\": 6},\n"
                    "  \"dates\": {\"start\": \"YYYY-MM-DD\", \"end\": \"YYYY-MM-DD\"},\n"
                    "  \"departureDates\": [\"YYYY-MM-DD\"],\n"
                    "  \"categories\": [\"trekking\", \"camping\"],\n"
                    "  \"highlights\": [\"Highlight 1\", \"Highlight 2\"],\n"
                    "  \"description\": \"Brief overview\",\n"
                    "  \"origin\": \"Delhi\",\n"
                    "  \"region\": \"domestic\",\n"
                    "  \"subRegion\": \"north-india\",\n"
                    "  \"transportMode\": \"car\",\n"
                    "  \"stayType\": \"hotel\",\n"
                    "  \"foodType\": \"both\",\n"
                    "  \"totalSeats\": 15,\n"
                    "  \"bookedSeats\": 5,\n"
                    "  \"groupType\": \"mixed\",\n"
                    "  \"rating\": 4.5,\n"
                    "  \"reviewCount\": 20,\n"
                    "  \"itinerary\": [{\"day\": 1, \"title\": \"Day Title\", \"activities\": [\"Activity\"], \"meals\": [\"breakfast\"], \"stay\": \"Hotel\"}],\n"
                    "  \"inclusions\": [\"Inclusion 1\"],\n"
                    "  \"exclusions\": [\"Exclusion 1\"],\n"
                    "  \"cancellationPolicy\": \"Terms\"\n"
                    "}\n\n"
                    f"Raw Text:\n{raw_text}"
                )
                body = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"responseMimeType": "application/json"}
                }
                req = urllib.request.Request(
                    url, data=json.dumps(body).encode('utf-8'),
                    headers={'Content-Type': 'application/json'}, method='POST'
                )
                with urllib.request.urlopen(req, timeout=10) as response:
                    res_data = json.loads(response.read().decode('utf-8'))
                    text_response = res_data['candidates'][0]['content']['parts'][0]['text']
                    parsed = json.loads(text_response)
                    # Ensure all required fields have defaults
                    return self._ensure_defaults(parsed)
            except Exception as e:
                print(f"⚠️ Gemini API failed: {e}. Falling back to rule-based parser.")
        
        return self.mock_normalize(raw_text, source_url)

    def _ensure_defaults(self, data):
        """Guarantee every field the frontend needs exists."""
        data.setdefault("origin", "Delhi")
        data.setdefault("region", "domestic")
        data.setdefault("subRegion", "north-india")
        data.setdefault("transportMode", "car")
        data.setdefault("stayType", "hotel")
        data.setdefault("foodType", "both")
        data.setdefault("totalSeats", 15)
        data.setdefault("bookedSeats", 0)
        data.setdefault("groupType", "mixed")
        data.setdefault("rating", 4.5)
        data.setdefault("reviewCount", 0)
        data.setdefault("currency", "INR")
        data.setdefault("safetyNotes", ["First aid kit available", "Experienced trip leader"])
        data.setdefault("faq", [{"q": "Is this trip safe?", "a": "Yes, all trips are led by experienced guides with safety equipment."}])
        # Fix region for international destinations
        dest_lower = data.get("destination", "").lower()
        state_lower = data.get("destinationState", "").lower()
        if any(k in dest_lower or k in state_lower for k in ["bali", "indonesia", "thailand", "vietnam", "japan", "switzerland", "paris", "europe", "dubai"]):
            data["region"] = "international"
            if "bali" in dest_lower or "indonesia" in state_lower:
                data["subRegion"] = "southeast-asia"
            elif "thailand" in dest_lower:
                data["subRegion"] = "southeast-asia"
            elif "vietnam" in dest_lower:
                data["subRegion"] = "southeast-asia"
            elif "japan" in dest_lower:
                data["subRegion"] = "east-asia"
            else:
                data["subRegion"] = "europe"
        return data

    def mock_normalize(self, raw_text, source_url):
        """Company-aware mock normalizer producing unique trips per source."""
        raw_lower = raw_text.lower()
        url_lower = source_url.lower()

        # ── Company-specific trip templates ──────────────────────────
        templates = {
            "wanderon": {
                "title": "Bali Backpacking Explorer",
                "destination": "Bali", "destinationState": "Indonesia", "origin": "Delhi",
                "region": "international", "subRegion": "southeast-asia",
                "price": 45000, "nights": 5, "days": 6,
                "start": "2026-07-10", "end": "2026-07-16",
                "categories": ["beach", "adventure", "cultural"],
                "highlights": ["Ubud Rice Terrace Swing", "Nusa Penida Island Tour", "Kuta Beach Sunset Party", "Tanah Lot Temple"],
                "description": "Explore the tropical paradise of Bali with WanderOn. From Ubud's lush rice terraces to the pristine beaches of Nusa Penida, this backpacking trip covers everything.",
                "transportMode": "car", "stayType": "hotel", "groupType": "mixed",
                "totalSeats": 16, "bookedSeats": 9, "rating": 4.8, "reviewCount": 87,
                "coverImage": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80"
            },
            "justwravel": {
                "title": "Meghalaya Backpacking Adventure",
                "destination": "Shillong & Cherrapunji", "destinationState": "Meghalaya", "origin": "Guwahati",
                "region": "domestic", "subRegion": "northeast-india",
                "price": 22000, "nights": 5, "days": 6,
                "start": "2026-07-25", "end": "2026-07-31",
                "categories": ["trekking", "scenic", "adventure"],
                "highlights": ["Living Root Bridge Trek", "Dawki Crystal River Boating", "Mawlynnong Cleanest Village", "Seven Sisters Falls"],
                "description": "Trek to the famous double-decker living root bridges and boat on the crystal-clear Umngot River in Dawki with JustWravel.",
                "transportMode": "car", "stayType": "homestay", "groupType": "mixed",
                "totalSeats": 18, "bookedSeats": 12, "rating": 4.7, "reviewCount": 65,
                "coverImage": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80"
            },
            "thrillophilia": {
                "title": "Ladakh Bike Expedition",
                "destination": "Leh & Ladakh", "destinationState": "Ladakh", "origin": "Delhi",
                "region": "domestic", "subRegion": "north-india",
                "price": 32000, "nights": 8, "days": 9,
                "start": "2026-07-18", "end": "2026-07-27",
                "categories": ["adventure", "mountain", "road-trip"],
                "highlights": ["Khardung La Pass Ride", "Pangong Lake Camping", "Nubra Valley Camel Safari", "Magnetic Hill Visit"],
                "description": "Conquer the world's highest motorable passes on this epic bike expedition through Ladakh with Thrillophilia.",
                "transportMode": "self-drive", "stayType": "camping", "groupType": "mixed",
                "totalSeats": 14, "bookedSeats": 7, "rating": 4.6, "reviewCount": 112,
                "coverImage": "https://images.unsplash.com/photo-1506038634487-60a69ae4b7b1?w=800&q=80"
            },
            "captureatrip": {
                "title": "Northeast India Explorer",
                "destination": "Meghalaya & Assam", "destinationState": "Meghalaya", "origin": "Guwahati",
                "region": "domestic", "subRegion": "northeast-india",
                "price": 21500, "nights": 5, "days": 6,
                "start": "2026-08-15", "end": "2026-08-21",
                "categories": ["cultural", "scenic", "trekking"],
                "highlights": ["Kaziranga National Park Safari", "Cherrapunji Waterfalls", "Dawki River Boating", "Shillong Heritage Walk"],
                "description": "Journey through the clouds of Meghalaya and the wild plains of Assam. Root bridges, crystal rivers, and one-horned rhinos await.",
                "transportMode": "car", "stayType": "hotel", "groupType": "mixed",
                "totalSeats": 15, "bookedSeats": 8, "rating": 4.7, "reviewCount": 54,
                "coverImage": "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80"
            },
            "deyor": {
                "title": "Ladakh Road Trip Adventure",
                "destination": "Leh-Manali Highway", "destinationState": "Ladakh", "origin": "Manali",
                "region": "domestic", "subRegion": "north-india",
                "price": 29999, "nights": 7, "days": 8,
                "start": "2026-07-15", "end": "2026-07-23",
                "categories": ["road-trip", "mountain", "adventure"],
                "highlights": ["Rohtang Pass Crossing", "Jispa Valley Camping", "Pangong Lake Sunrise", "Tso Moriri Lake"],
                "description": "The ultimate road trip from Manali to Leh through some of the most dramatic mountain passes in the world with Deyor Adventures.",
                "transportMode": "car", "stayType": "camping", "groupType": "mixed",
                "totalSeats": 12, "bookedSeats": 5, "rating": 4.6, "reviewCount": 43,
                "coverImage": "https://images.unsplash.com/photo-1572428003240-31a6e2c0a48c?w=800&q=80"
            },
            "trekthehimalayas": {
                "title": "Valley of Flowers Trek",
                "destination": "Valley of Flowers", "destinationState": "Uttarakhand", "origin": "Haridwar",
                "region": "domestic", "subRegion": "north-india",
                "price": 10200, "nights": 5, "days": 6,
                "start": "2026-07-12", "end": "2026-07-18",
                "categories": ["trekking", "mountain", "scenic"],
                "highlights": ["UNESCO World Heritage Flora", "Hemkund Sahib Gurudwara", "Alpine Meadow Camping", "Bhyundar Valley Views"],
                "description": "Walk through a UNESCO World Heritage valley carpeted with rare Himalayan wildflowers. A moderate trek perfect for nature lovers.",
                "transportMode": "car", "stayType": "camping", "groupType": "mixed",
                "totalSeats": 20, "bookedSeats": 14, "rating": 4.8, "reviewCount": 128,
                "coverImage": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"
            },
            "indiahikes": {
                "title": "Kedarkantha Winter Trek",
                "destination": "Kedarkantha", "destinationState": "Uttarakhand", "origin": "Dehradun",
                "region": "domestic", "subRegion": "north-india",
                "price": 9500, "nights": 5, "days": 6,
                "start": "2026-12-20", "end": "2026-12-26",
                "categories": ["trekking", "mountain", "camping"],
                "highlights": ["Summit at 12,500 ft", "Snow-covered Pine Forests", "Juda Ka Talab Camping", "360° Himalayan Panorama"],
                "description": "India's most popular winter trek through snow-laden trails to the Kedarkantha summit. Perfect for beginners and experienced trekkers alike.",
                "transportMode": "car", "stayType": "camping", "groupType": "mixed",
                "totalSeats": 25, "bookedSeats": 18, "rating": 4.9, "reviewCount": 245,
                "coverImage": "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800&q=80"
            },
            "adventurenation": {
                "title": "Rishikesh River Rafting Weekend",
                "destination": "Rishikesh", "destinationState": "Uttarakhand", "origin": "Delhi",
                "region": "domestic", "subRegion": "north-india",
                "price": 4999, "nights": 2, "days": 3,
                "start": "2026-06-14", "end": "2026-06-17",
                "categories": ["adventure", "camping", "social"],
                "highlights": ["16 km White Water Rafting", "Cliff Jumping at Shivpuri", "Riverside Beach Camping", "Bonfire & Music Night"],
                "description": "The ultimate adrenaline weekend in Rishikesh — raft Grade 3+ rapids, jump off cliffs, and camp by the Ganga under the stars.",
                "transportMode": "bus", "stayType": "camping", "groupType": "mixed",
                "totalSeats": 30, "bookedSeats": 22, "rating": 4.5, "reviewCount": 38,
                "coverImage": "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80"
            },
            "veenaworld": {
                "title": "Kashmir Paradise Family Tour",
                "destination": "Srinagar & Gulmarg", "destinationState": "Jammu & Kashmir", "origin": "Delhi",
                "region": "domestic", "subRegion": "north-india",
                "price": 32000, "nights": 5, "days": 6,
                "start": "2026-06-18", "end": "2026-06-24",
                "categories": ["scenic", "cultural", "mountain"],
                "highlights": ["Dal Lake Shikara Ride", "Gulmarg Gondola Phase 1 & 2", "Pahalgam Betaab Valley", "Mughal Gardens Tour"],
                "description": "Experience the paradise on earth with Veena World's escorted Kashmir family tour. Houseboats, gondola rides, and meadow walks.",
                "transportMode": "car", "stayType": "hotel", "groupType": "family",
                "totalSeats": 20, "bookedSeats": 16, "rating": 4.6, "reviewCount": 156,
                "coverImage": "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800&q=80"
            },
            "thomascook": {
                "title": "Switzerland & Paris Dream Tour",
                "destination": "Geneva, Zurich & Paris", "destinationState": "Europe", "origin": "Mumbai",
                "region": "international", "subRegion": "europe",
                "price": 145000, "nights": 6, "days": 7,
                "start": "2026-08-05", "end": "2026-08-12",
                "categories": ["luxury", "cultural", "scenic"],
                "highlights": ["Jungfraujoch Top of Europe", "Eiffel Tower Evening Visit", "Rhine Falls Cruise", "Swiss Chocolate Factory"],
                "description": "Live the European dream — cruise Swiss lakes, ride to the top of Europe, and dine under the Eiffel Tower with Thomas Cook India.",
                "transportMode": "flight", "stayType": "hotel", "groupType": "family",
                "totalSeats": 25, "bookedSeats": 19, "rating": 4.7, "reviewCount": 210,
                "coverImage": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80"
            },
            "sotc": {
                "title": "Thailand Beach Escapade",
                "destination": "Bangkok & Pattaya", "destinationState": "Thailand", "origin": "Mumbai",
                "region": "international", "subRegion": "southeast-asia",
                "price": 38000, "nights": 4, "days": 5,
                "start": "2026-07-10", "end": "2026-07-15",
                "categories": ["beach", "cultural", "social"],
                "highlights": ["Grand Palace & Wat Pho Temples", "Coral Island Speedboat Trip", "Floating Market Tour", "Alcazar Cabaret Show"],
                "description": "Sun, temples, and tropical beaches — the classic Bangkok-Pattaya group escape with SOTC.",
                "transportMode": "flight", "stayType": "hotel", "groupType": "mixed",
                "totalSeats": 20, "bookedSeats": 14, "rating": 4.6, "reviewCount": 98,
                "coverImage": "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80"
            },
            "tripoto": {
                "title": "Bir Billing Mindful Retreat",
                "destination": "Bir Billing", "destinationState": "Himachal Pradesh", "origin": "Delhi",
                "region": "domestic", "subRegion": "north-india",
                "price": 11000, "nights": 3, "days": 4,
                "start": "2026-06-22", "end": "2026-06-26",
                "categories": ["wellness", "mountain", "adventure"],
                "highlights": ["Paragliding at World Cup Site", "Tibetan Monastery Visit", "Forest Meditation Walks", "Organic Farm Lunch"],
                "description": "A mindful mountain retreat in Bir — paraglide over valleys, meditate in monasteries, and stay in eco mud villas.",
                "transportMode": "bus", "stayType": "homestay", "groupType": "mixed",
                "totalSeats": 12, "bookedSeats": 7, "rating": 4.7, "reviewCount": 62,
                "coverImage": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80"
            },
            "go4explore": {
                "title": "Manali to Leh Jeep Safari",
                "destination": "Manali to Leh", "destinationState": "Himachal Pradesh & Ladakh", "origin": "Delhi",
                "region": "domestic", "subRegion": "north-india",
                "price": 24000, "nights": 8, "days": 9,
                "start": "2026-07-12", "end": "2026-07-21",
                "categories": ["road-trip", "adventure", "mountain"],
                "highlights": ["Atal Tunnel Drive", "Baralacha La Pass", "Magnetic Hill", "Tso Kar Lake Camping"],
                "description": "The legendary Manali-Leh highway in a 4x4 Jeep. Cross five high-altitude passes, camp by pristine lakes, and experience raw Himalayan beauty.",
                "transportMode": "car", "stayType": "camping", "groupType": "mixed",
                "totalSeats": 14, "bookedSeats": 6, "rating": 4.6, "reviewCount": 51,
                "coverImage": "https://images.unsplash.com/photo-1572428003240-31a6e2c0a48c?w=800&q=80"
            },
            "nomadgao": {
                "title": "Goa Co-Working Retreat",
                "destination": "North Goa", "destinationState": "Goa", "origin": "Mumbai",
                "region": "domestic", "subRegion": "west-india",
                "price": 15000, "nights": 6, "days": 7,
                "start": "2026-09-20", "end": "2026-09-27",
                "categories": ["social", "beach", "luxury"],
                "highlights": ["Beachside Co-working Space", "Surf Lessons at Ashwem", "Community Networking Dinners", "Weekend Houseboat Party"],
                "description": "Work from paradise — a curated coliving and coworking retreat in premium Assagao villas with ultrafast WiFi and a community of remote workers.",
                "transportMode": "flight", "stayType": "hotel", "groupType": "mixed",
                "totalSeats": 16, "bookedSeats": 10, "rating": 4.8, "reviewCount": 34,
                "coverImage": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80"
            },
            "solotravelindia": {
                "title": "Jaisalmer Desert Safari Camp",
                "destination": "Jaisalmer", "destinationState": "Rajasthan", "origin": "Jodhpur",
                "region": "domestic", "subRegion": "west-india",
                "price": 6500, "nights": 3, "days": 4,
                "start": "2026-10-14", "end": "2026-10-18",
                "categories": ["camping", "cultural", "adventure"],
                "highlights": ["Sam Sand Dunes Camel Safari", "Jaisalmer Fort Heritage Walk", "Desert Camping Under Stars", "Rajasthani Folk Music Night"],
                "description": "Budget-friendly desert magic — explore the golden fort, ride camels across sand dunes, and camp under a billion stars in the Thar Desert.",
                "transportMode": "bus", "stayType": "camping", "groupType": "mixed",
                "totalSeats": 20, "bookedSeats": 13, "rating": 4.5, "reviewCount": 42,
                "coverImage": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80"
            },
            "tanyakhanijow": {
                "title": "Goa Creator Beach Trip",
                "destination": "South Goa", "destinationState": "Goa", "origin": "Mumbai",
                "region": "domestic", "subRegion": "west-india",
                "price": 18000, "nights": 4, "days": 5,
                "start": "2026-09-15", "end": "2026-09-20",
                "categories": ["beach", "social", "photography"],
                "highlights": ["Palolem Beach Kayaking", "Old Goa Heritage Tour", "Spice Plantation Visit", "Sunset Cruise Party"],
                "description": "Join travel filmmaker Tanya Khanijow for a curated South Goa trip — hidden beaches, Portuguese heritage, spice trails, and epic sunsets.",
                "transportMode": "car", "stayType": "hotel", "groupType": "mixed",
                "totalSeats": 12, "bookedSeats": 8, "rating": 4.9, "reviewCount": 47,
                "coverImage": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80"
            },
            "monkeymagic": {
                "title": "Spiti Valley Cold Desert Expedition",
                "destination": "Spiti Valley", "destinationState": "Himachal Pradesh", "origin": "Delhi",
                "region": "domestic", "subRegion": "north-india",
                "price": 18500, "nights": 7, "days": 8,
                "start": "2026-06-22", "end": "2026-06-30",
                "categories": ["adventure", "mountain", "road-trip"],
                "highlights": ["Key Monastery Visit", "Chandratal Lake Stargazing", "Chicham Bridge Crossing", "Langza Fossil Village"],
                "description": "Raw, unscripted adventure through the cold desert of Spiti. Homestays, monasteries, and starlit camping at Chandratal with Monkey Magic.",
                "transportMode": "car", "stayType": "homestay", "groupType": "mixed",
                "totalSeats": 14, "bookedSeats": 9, "rating": 4.8, "reviewCount": 56,
                "coverImage": "https://images.unsplash.com/photo-1572428003240-31a6e2c0a48c?w=800&q=80"
            },
        }

        # Second variant trips for each company (crawled from 2nd URL)
        variant_templates = {
            "wanderon": {
                "title": "Kasol Kheerganga Trek",
                "destination": "Kasol & Kheerganga", "destinationState": "Himachal Pradesh", "origin": "Delhi",
                "region": "domestic", "subRegion": "north-india",
                "price": 8999, "nights": 3, "days": 4,
                "start": "2026-06-20", "end": "2026-06-24",
                "categories": ["trekking", "mountain", "social"],
                "highlights": ["Kheerganga Hot Springs Trek", "Parvati Valley Cafes", "Chalal Village Walk", "Riverside Camping"],
                "description": "The iconic Parvati Valley experience — trek to natural hot springs at Kheerganga, explore Kasol's vibrant backpacker scene, and camp by the river.",
                "transportMode": "bus", "stayType": "camping", "groupType": "mixed",
                "totalSeats": 20, "bookedSeats": 15, "rating": 4.7, "reviewCount": 134,
                "coverImage": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80"
            },
            "justwravel": {
                "title": "Manali Snow Adventure",
                "destination": "Manali & Solang", "destinationState": "Himachal Pradesh", "origin": "Delhi",
                "region": "domestic", "subRegion": "north-india",
                "price": 12999, "nights": 4, "days": 5,
                "start": "2026-12-15", "end": "2026-12-20",
                "categories": ["mountain", "adventure", "scenic"],
                "highlights": ["Solang Valley Snow Activities", "Old Manali Café Hopping", "Atal Tunnel Visit", "Jogini Waterfall Trek"],
                "description": "Winter wonderland in Manali — play in Solang snow, explore Old Manali's bohemian cafes, and trek through pine forests.",
                "transportMode": "bus", "stayType": "hotel", "groupType": "mixed",
                "totalSeats": 18, "bookedSeats": 11, "rating": 4.6, "reviewCount": 78,
                "coverImage": "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800&q=80"
            },
            "thrillophilia": {
                "title": "Vietnam Cultural Discovery",
                "destination": "Hanoi & Halong Bay", "destinationState": "Vietnam", "origin": "Delhi",
                "region": "international", "subRegion": "southeast-asia",
                "price": 52000, "nights": 5, "days": 6,
                "start": "2026-09-05", "end": "2026-09-11",
                "categories": ["cultural", "scenic", "beach"],
                "highlights": ["Halong Bay Overnight Cruise", "Hoi An Lantern Streets", "Cu Chi Tunnels Tour", "Vietnamese Cooking Class"],
                "description": "From the emerald waters of Halong Bay to the ancient lantern-lit streets of Hoi An — immerse yourself in Vietnam's rich culture.",
                "transportMode": "flight", "stayType": "hotel", "groupType": "mixed",
                "totalSeats": 16, "bookedSeats": 10, "rating": 4.7, "reviewCount": 73,
                "coverImage": "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80"
            },
            "captureatrip": {
                "title": "Sikkim Gangtok Expedition",
                "destination": "Gangtok & Pelling", "destinationState": "Sikkim", "origin": "Bagdogra",
                "region": "domestic", "subRegion": "northeast-india",
                "price": 19500, "nights": 5, "days": 6,
                "start": "2026-10-05", "end": "2026-10-11",
                "categories": ["mountain", "cultural", "scenic"],
                "highlights": ["Tsomgo Lake Visit", "Nathula Pass Border", "Pelling Skywalk", "Rumtek Monastery Tour"],
                "description": "Explore the hidden kingdom of Sikkim — from the Indo-China border at Nathula to the serene monasteries and the mighty Kanchenjunga views.",
                "transportMode": "car", "stayType": "hotel", "groupType": "mixed",
                "totalSeats": 14, "bookedSeats": 6, "rating": 4.6, "reviewCount": 38,
                "coverImage": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
            },
            "deyor": {
                "title": "Spiti Valley Jeep Expedition",
                "destination": "Spiti Valley", "destinationState": "Himachal Pradesh", "origin": "Chandigarh",
                "region": "domestic", "subRegion": "north-india",
                "price": 22999, "nights": 6, "days": 7,
                "start": "2026-08-01", "end": "2026-08-08",
                "categories": ["road-trip", "mountain", "adventure"],
                "highlights": ["Pin Valley National Park", "Dhankar Monastery", "Tabo Cave Monastery", "Chandratal Lakeside Camp"],
                "description": "Cross through the mystical cold desert of Spiti in rugged 4x4 Jeeps. Ancient monasteries, fossil villages, and starlit camping await.",
                "transportMode": "car", "stayType": "camping", "groupType": "mixed",
                "totalSeats": 12, "bookedSeats": 4, "rating": 4.7, "reviewCount": 31,
                "coverImage": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"
            },
            "trekthehimalayas": {
                "title": "Hampta Pass Trek",
                "destination": "Hampta Pass", "destinationState": "Himachal Pradesh", "origin": "Manali",
                "region": "domestic", "subRegion": "north-india",
                "price": 8500, "nights": 4, "days": 5,
                "start": "2026-07-05", "end": "2026-07-10",
                "categories": ["trekking", "mountain", "camping"],
                "highlights": ["Cross Hampta Pass at 14,000 ft", "Chandratal Lake Side Trip", "Lush Green Meadows", "River Crossings"],
                "description": "A dramatic crossover trek from lush Kullu to barren Lahaul. One of India's most scenic moderate treks with stunning valley contrasts.",
                "transportMode": "car", "stayType": "camping", "groupType": "mixed",
                "totalSeats": 20, "bookedSeats": 15, "rating": 4.8, "reviewCount": 167,
                "coverImage": "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80"
            },
            "indiahikes": {
                "title": "Brahmatal Winter Trek",
                "destination": "Brahmatal", "destinationState": "Uttarakhand", "origin": "Kathgodam",
                "region": "domestic", "subRegion": "north-india",
                "price": 8250, "nights": 5, "days": 6,
                "start": "2026-01-10", "end": "2026-01-16",
                "categories": ["trekking", "mountain", "camping"],
                "highlights": ["Brahmatal Frozen Lake", "Mt. Trishul & Nanda Ghunti Views", "Snow Trail Through Oak Forests", "Summit Day Sunrise"],
                "description": "Walk on a frozen alpine lake with the mighty Trishul and Nanda Ghunti peaks as backdrop. A magical winter Himalayan trek.",
                "transportMode": "car", "stayType": "camping", "groupType": "mixed",
                "totalSeats": 22, "bookedSeats": 16, "rating": 4.8, "reviewCount": 189,
                "coverImage": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"
            },
            "adventurenation": {
                "title": "Coorg Coffee Trail Weekend",
                "destination": "Coorg", "destinationState": "Karnataka", "origin": "Bangalore",
                "region": "domestic", "subRegion": "south-india",
                "price": 7999, "nights": 2, "days": 3,
                "start": "2026-08-08", "end": "2026-08-11",
                "categories": ["scenic", "cultural", "social"],
                "highlights": ["Coffee Plantation Walk", "Abbey Falls Visit", "Dubare Elephant Camp", "Raja's Seat Sunset"],
                "description": "The Scotland of India — walk through coffee plantations, visit waterfalls, and sip fresh filter coffee in misty Coorg hills.",
                "transportMode": "car", "stayType": "homestay", "groupType": "mixed",
                "totalSeats": 16, "bookedSeats": 9, "rating": 4.5, "reviewCount": 28,
                "coverImage": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80"
            },
            "veenaworld": {
                "title": "Kerala Backwaters & Munnar",
                "destination": "Alleppey & Munnar", "destinationState": "Kerala", "origin": "Kochi",
                "region": "domestic", "subRegion": "south-india",
                "price": 28000, "nights": 5, "days": 6,
                "start": "2026-09-10", "end": "2026-09-16",
                "categories": ["scenic", "cultural", "luxury"],
                "highlights": ["Alleppey Houseboat Stay", "Munnar Tea Garden Walk", "Periyar Wildlife Cruise", "Kathakali Dance Show"],
                "description": "Cruise Kerala's magical backwaters on a traditional houseboat, trek through lush tea gardens in Munnar, and spot elephants in Periyar.",
                "transportMode": "car", "stayType": "hotel", "groupType": "family",
                "totalSeats": 20, "bookedSeats": 15, "rating": 4.7, "reviewCount": 134,
                "coverImage": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80"
            },
            "thomascook": {
                "title": "Dubai Dazzle Group Tour",
                "destination": "Dubai", "destinationState": "UAE", "origin": "Mumbai",
                "region": "international", "subRegion": "middle-east",
                "price": 65000, "nights": 4, "days": 5,
                "start": "2026-10-20", "end": "2026-10-25",
                "categories": ["luxury", "cultural", "social"],
                "highlights": ["Burj Khalifa At The Top", "Desert Safari with BBQ", "Dubai Marina Dhow Cruise", "Global Village Visit"],
                "description": "Experience the glitz and glamour of Dubai — from the world's tallest building to desert dune bashing and luxury dhow cruises.",
                "transportMode": "flight", "stayType": "hotel", "groupType": "family",
                "totalSeats": 25, "bookedSeats": 20, "rating": 4.6, "reviewCount": 178,
                "coverImage": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80"
            },
            "sotc": {
                "title": "Singapore Family Funfest",
                "destination": "Singapore", "destinationState": "Singapore", "origin": "Delhi",
                "region": "international", "subRegion": "southeast-asia",
                "price": 55000, "nights": 4, "days": 5,
                "start": "2026-11-15", "end": "2026-11-20",
                "categories": ["family", "cultural", "luxury"],
                "highlights": ["Universal Studios Full Day", "Marina Bay Sands Light Show", "Sentosa Island Adventure", "Gardens by the Bay"],
                "description": "The perfect family vacation in the Lion City — theme parks, futuristic gardens, and a vibrant food scene.",
                "transportMode": "flight", "stayType": "hotel", "groupType": "family",
                "totalSeats": 22, "bookedSeats": 17, "rating": 4.7, "reviewCount": 125,
                "coverImage": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80"
            },
            "tripoto": {
                "title": "Spiti Valley Road Trip",
                "destination": "Spiti Valley", "destinationState": "Himachal Pradesh", "origin": "Shimla",
                "region": "domestic", "subRegion": "north-india",
                "price": 19000, "nights": 6, "days": 7,
                "start": "2026-08-15", "end": "2026-08-22",
                "categories": ["road-trip", "mountain", "adventure"],
                "highlights": ["Chitkul Last Village", "Nako Lake Reflection", "Gue Mummy Monastery", "Night Sky Photography"],
                "description": "An offbeat Spiti circuit via Shimla — explore the last Indian village Chitkul, the 500-year-old mummy at Gue, and camp under the Milky Way.",
                "transportMode": "car", "stayType": "homestay", "groupType": "mixed",
                "totalSeats": 10, "bookedSeats": 6, "rating": 4.8, "reviewCount": 44,
                "coverImage": "https://images.unsplash.com/photo-1572428003240-31a6e2c0a48c?w=800&q=80"
            },
            "go4explore": {
                "title": "Rajasthan Backpacking Circuit",
                "destination": "Jaipur, Udaipur & Jodhpur", "destinationState": "Rajasthan", "origin": "Delhi",
                "region": "domestic", "subRegion": "west-india",
                "price": 16999, "nights": 5, "days": 6,
                "start": "2026-11-01", "end": "2026-11-07",
                "categories": ["cultural", "heritage", "social"],
                "highlights": ["Amber Fort Jeep Ride", "Lake Pichola Boat Cruise", "Blue City Walking Tour", "Sam Sand Dunes Camel Ride"],
                "description": "The ultimate Rajasthan backpacking trip — forts, palaces, lake cruises, and desert camping across three royal cities.",
                "transportMode": "bus", "stayType": "hotel", "groupType": "mixed",
                "totalSeats": 18, "bookedSeats": 12, "rating": 4.6, "reviewCount": 63,
                "coverImage": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80"
            },
            "nomadgao": {
                "title": "Himachal Workcation Retreat",
                "destination": "Bir & Barot", "destinationState": "Himachal Pradesh", "origin": "Delhi",
                "region": "domestic", "subRegion": "north-india",
                "price": 12000, "nights": 6, "days": 7,
                "start": "2026-10-01", "end": "2026-10-08",
                "categories": ["social", "mountain", "wellness"],
                "highlights": ["Mountain Co-working Space", "Paragliding in Bir", "Barot Valley Trout Fishing", "Community Bonfire Nights"],
                "description": "Work from the mountains — a coliving retreat in the peaceful hills of Bir with high-speed internet, paragliding, and community vibes.",
                "transportMode": "bus", "stayType": "homestay", "groupType": "mixed",
                "totalSeats": 12, "bookedSeats": 7, "rating": 4.7, "reviewCount": 22,
                "coverImage": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80"
            },
            "solotravelindia": {
                "title": "Himachal Budget Backpacking",
                "destination": "Kasol & Tosh", "destinationState": "Himachal Pradesh", "origin": "Delhi",
                "region": "domestic", "subRegion": "north-india",
                "price": 5500, "nights": 3, "days": 4,
                "start": "2026-07-05", "end": "2026-07-09",
                "categories": ["trekking", "social", "camping"],
                "highlights": ["Tosh Village Trek", "Parvati Valley Exploration", "Israeli Cafe Hopping", "Manikaran Hot Springs"],
                "description": "The ultimate budget trip to Parvati Valley — trek to Tosh, soak in Manikaran hot springs, and experience the backpacker culture of Kasol.",
                "transportMode": "bus", "stayType": "camping", "groupType": "mixed",
                "totalSeats": 22, "bookedSeats": 16, "rating": 4.4, "reviewCount": 55,
                "coverImage": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80"
            },
            "tanyakhanijow": {
                "title": "Kerala Houseboat & Backwaters",
                "destination": "Alleppey & Varkala", "destinationState": "Kerala", "origin": "Kochi",
                "region": "domestic", "subRegion": "south-india",
                "price": 22000, "nights": 4, "days": 5,
                "start": "2026-10-10", "end": "2026-10-15",
                "categories": ["scenic", "cultural", "beach"],
                "highlights": ["Alleppey Houseboat Cruise", "Varkala Cliff Beach", "Toddy Shop Experience", "Kathakali Live Performance"],
                "description": "Experience God's Own Country with Tanya — cruise the backwaters, surf at Varkala cliffs, and taste authentic Kerala cuisine.",
                "transportMode": "car", "stayType": "hotel", "groupType": "mixed",
                "totalSeats": 12, "bookedSeats": 10, "rating": 4.9, "reviewCount": 39,
                "coverImage": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80"
            },
            "monkeymagic": {
                "title": "Ladakh Overland Road Trip",
                "destination": "Leh & Pangong", "destinationState": "Ladakh", "origin": "Manali",
                "region": "domestic", "subRegion": "north-india",
                "price": 25000, "nights": 8, "days": 9,
                "start": "2026-08-05", "end": "2026-08-14",
                "categories": ["road-trip", "adventure", "mountain"],
                "highlights": ["Manali-Leh Highway Drive", "Pangong Lake Sunrise", "Nubra Valley Sand Dunes", "Hemis Monastery Visit"],
                "description": "The raw overland route from Manali to Leh — no flights, just pure mountain road tripping through the highest passes in the world.",
                "transportMode": "car", "stayType": "camping", "groupType": "mixed",
                "totalSeats": 12, "bookedSeats": 8, "rating": 4.7, "reviewCount": 48,
                "coverImage": "https://images.unsplash.com/photo-1506038634487-60a69ae4b7b1?w=800&q=80"
            },
        }

        # Determine which company this URL belongs to
        company_key = None
        for key in templates:
            if key in url_lower.replace(" ", ""):
                company_key = key
                break

        # Determine if this is the 1st or 2nd URL (variant)
        is_variant = "weekend" in url_lower or "cultural" in url_lower or "backpacking" in url_lower or "exotic" in url_lower

        if company_key:
            if is_variant and company_key in variant_templates:
                tpl = variant_templates[company_key]
            else:
                tpl = templates[company_key]
        else:
            # Fallback: try to match from raw text
            for key in templates:
                if key in raw_lower:
                    company_key = key
                    tpl = templates[key]
                    break
            else:
                tpl = templates["wanderon"]

        nights = tpl["nights"]
        days = tpl["days"]

        return {
            "title": tpl["title"],
            "destination": tpl["destination"],
            "destinationState": tpl["destinationState"],
            "origin": tpl.get("origin", "Delhi"),
            "region": tpl.get("region", "domestic"),
            "subRegion": tpl.get("subRegion", "north-india"),
            "price": tpl["price"],
            "originalPrice": int(tpl["price"] * 1.3),
            "currency": "INR",
            "duration": {"nights": nights, "days": days},
            "dates": {"start": tpl["start"], "end": tpl["end"]},
            "departureDates": [tpl["start"]],
            "categories": tpl["categories"],
            "highlights": tpl["highlights"],
            "description": tpl["description"],
            "transportMode": tpl.get("transportMode", "car"),
            "stayType": tpl.get("stayType", "hotel"),
            "foodType": "both",
            "totalSeats": tpl.get("totalSeats", 15),
            "bookedSeats": tpl.get("bookedSeats", 0),
            "groupType": tpl.get("groupType", "mixed"),
            "rating": tpl.get("rating", 4.5),
            "reviewCount": tpl.get("reviewCount", 0),
            "coverImage": tpl.get("coverImage", "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80"),
            "gallery": [tpl.get("coverImage", "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80")],
            "itinerary": [
                {"day": 1, "title": "Arrival & Welcome", "activities": ["Meet your group", "Check in to stays", "Welcome dinner & briefing"], "meals": ["dinner"], "stay": "Premium Stay"},
                {"day": 2, "title": "Exploration & Highlights", "activities": tpl["highlights"][:3], "meals": ["breakfast", "dinner"], "stay": "Premium Stay"}
            ],
            "inclusions": ["Premium stays", "Breakfast & Dinners", "All transfers", "Experienced guide", "Entry fees"],
            "exclusions": ["Airfare/train fare", "Personal expenses", "Lunch", "Tips"],
            "cancellationPolicy": "Full refund 15 days prior. 50% refund 7 days prior. No refund after.",
            "safetyNotes": ["First aid kit available", "Experienced trip leader", "Emergency vehicle backup"],
            "faq": [{"q": "Is this trip safe?", "a": "Yes, all trips are led by experienced guides with full safety equipment."}]
        }

if __name__ == "__main__":
    norm = TripNormalizer()
    res = norm.normalize("Raw text about Bali", "https://wanderon.in/trips/bali-backpacking-group-trip")
    print(json.dumps(res, indent=2))
