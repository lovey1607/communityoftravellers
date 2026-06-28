import re

class TripDeduplicator:
    def calculate_similarity(self, trip_a, trip_b):
        """
        Calculates a similarity score between two trips from 0 to 100.
        """
        score = 0
        
        # 1. Destination Matching (Weight: 30)
        dest_a = re.sub(r'[^a-zA-Z]', '', trip_a.get('destination', '').lower())
        dest_b = re.sub(r'[^a-zA-Z]', '', trip_b.get('destination', '').lower())
        if dest_a and dest_b:
            if dest_a == dest_b or dest_a in dest_b or dest_b in dest_a:
                score += 30
            else:
                # Partial match
                intersection = len(set(dest_a) & set(dest_b))
                union = len(set(dest_a) | set(dest_b))
                if union > 0:
                    score += int((intersection / union) * 15)

        # 2. Duration Matching (Weight: 25)
        dur_a = trip_a.get('duration', {})
        dur_b = trip_b.get('duration', {})
        days_a = dur_a.get('days', 0) if isinstance(dur_a, dict) else 0
        days_b = dur_b.get('days', 0) if isinstance(dur_b, dict) else 0
        if days_a > 0 and days_b > 0:
            diff = abs(days_a - days_b)
            if diff == 0:
                score += 25
            elif diff == 1:
                score += 15
            elif diff == 2:
                score += 5

        # 3. Price Similarity (Weight: 15)
        price_a = trip_a.get('price', 0)
        price_b = trip_b.get('price', 0)
        if price_a > 0 and price_b > 0:
            ratio = min(price_a, price_b) / max(price_a, price_b)
            score += int(ratio * 15)

        # 4. Itinerary / Highlights Overlap (Weight: 30)
        highlights_a = set([h.lower().strip() for h in trip_a.get('highlights', [])])
        highlights_b = set([h.lower().strip() for h in trip_b.get('highlights', [])])
        if highlights_a and highlights_b:
            intersection = len(highlights_a & highlights_b)
            union = len(highlights_a | highlights_b)
            if union > 0:
                score += int((intersection / union) * 30)
        else:
            # Fallback to description word matching
            desc_a = set(trip_a.get('description', '').lower().split())
            desc_b = set(trip_b.get('description', '').lower().split())
            if desc_a and desc_b:
                intersection = len(desc_a & desc_b)
                union = len(desc_a | desc_b)
                if union > 0:
                    score += int((intersection / union) * 20)

        return min(score, 100)

    def find_duplicates(self, new_trip, existing_trips, threshold=70):
        duplicates = []
        for existing in existing_trips:
            sim = self.calculate_similarity(new_trip, existing)
            if sim >= threshold:
                duplicates.append({
                    "existing_trip_id": existing.get('id'),
                    "existing_trip_title": existing.get('title'),
                    "existing_host_id": existing.get('hostId'),
                    "similarity": sim
                })
        return duplicates

if __name__ == "__main__":
    dedup = TripDeduplicator()
    a = {
        "destination": "Bali",
        "duration": {"days": 6, "nights": 5},
        "price": 45000,
        "highlights": ["Ubud swing", "Nusa Penida"]
    }
    b = {
        "destination": "Bali Island",
        "duration": {"days": 6, "nights": 5},
        "price": 42000,
        "highlights": ["Ubud Rice Terrace swing", "Nusa Penida tour"]
    }
    print(dedup.calculate_similarity(a, b))
