// ============================================================
// Community of Travellers — Filter & Category Seed Data
// ============================================================

export const categories = [
  { id: 'adventure', label: 'Adventure', icon: '⛰️', color: '#f59e0b', description: 'Thrilling outdoor activities and adrenaline-pumping experiences' },
  { id: 'beach', label: 'Beach', icon: '🏖️', color: '#00bcd4', description: 'Sun, sand, and surf at stunning coastal destinations' },
  { id: 'cultural', label: 'Cultural', icon: '🏛️', color: '#e91e63', description: 'Explore heritage sites, local traditions, and living history' },
  { id: 'trekking', label: 'Trekking', icon: '🥾', color: '#4caf50', description: 'Guided treks through mountains, forests, and valleys' },
  { id: 'mountain', label: 'Mountain', icon: '🏔️', color: '#2196f3', description: 'Scenic mountain escapes with breathtaking views' },
  { id: 'road-trip', label: 'Road Trip', icon: '🚗', color: '#ff5722', description: 'Epic road journeys through scenic highways and rural backroads' },
  { id: 'luxury', label: 'Luxury', icon: '✨', color: '#9c27b0', description: 'Premium stays, fine dining, and exclusive experiences' },
  { id: 'spiritual', label: 'Spiritual', icon: '🕉️', color: '#ff9800', description: 'Temples, ashrams, meditation retreats, and sacred journeys' },
  { id: 'offbeat', label: 'Offbeat', icon: '🗺️', color: '#607d8b', description: 'Hidden gems and lesser-known destinations off the tourist trail' },
  { id: 'social', label: 'Social', icon: '🎉', color: '#e040fb', description: 'Meet fellow travelers, group activities, and shared experiences' },
  { id: 'wildlife', label: 'Wildlife', icon: '🐘', color: '#795548', description: 'Safari, bird watching, and encounters with exotic wildlife' },
  { id: 'wellness', label: 'Wellness', icon: '🧘', color: '#26a69a', description: 'Yoga retreats, spa getaways, and holistic healing' },
  { id: 'water-sports', label: 'Water Sports', icon: '🏄', color: '#0288d1', description: 'Scuba diving, snorkeling, surfing, kayaking, and more' },
  { id: 'photography', label: 'Photography', icon: '📸', color: '#8d6e63', description: 'Scenic spots, golden hours, and photography-focused itineraries' },
  { id: 'food', label: 'Food & Culinary', icon: '🍜', color: '#d32f2f', description: 'Food trails, local cuisine, cooking classes, and culinary tours' },
  { id: 'nightlife', label: 'Nightlife', icon: '🌙', color: '#7b1fa2', description: 'Clubs, beach parties, live music, and after-dark fun' },
  { id: 'camping', label: 'Camping', icon: '⛺', color: '#33691e', description: 'Stargazing, bonfires, and nights under the open sky' },
  { id: 'heritage', label: 'Heritage', icon: '🏰', color: '#bf360c', description: 'Forts, palaces, ancient ruins, and architectural wonders' },
];

export const regions = [
  { id: 'domestic', label: 'Domestic (India)', icon: '🇮🇳' },
  { id: 'international', label: 'International', icon: '🌏' },
];

export const subRegions = [
  { id: 'north-india', label: 'North India', region: 'domestic' },
  { id: 'south-india', label: 'South India', region: 'domestic' },
  { id: 'west-india', label: 'West India', region: 'domestic' },
  { id: 'east-india', label: 'East India', region: 'domestic' },
  { id: 'northeast-india', label: 'Northeast India', region: 'domestic' },
  { id: 'central-india', label: 'Central India', region: 'domestic' },
  { id: 'southeast-asia', label: 'Southeast Asia', region: 'international' },
  { id: 'middle-east', label: 'Middle East', region: 'international' },
  { id: 'east-asia', label: 'East Asia', region: 'international' },
  { id: 'south-asia', label: 'South Asia', region: 'international' },
  { id: 'europe', label: 'Europe', region: 'international' },
  { id: 'indian-ocean', label: 'Indian Ocean Islands', region: 'international' },
  { id: 'caucasus', label: 'Caucasus', region: 'international' },
];

export const transportModes = [
  { id: 'flight', label: 'Flight', icon: '✈️', description: 'Air travel included or recommended' },
  { id: 'bus', label: 'Bus / Volvo', icon: '🚌', description: 'AC Volvo or sleeper bus travel' },
  { id: 'train', label: 'Train', icon: '🚂', description: 'Train journey included' },
  { id: 'self-drive', label: 'Self Drive', icon: '🚗', description: 'Road trip with rented or personal vehicles' },
  { id: 'bike', label: 'Bike / Motorcycle', icon: '🏍️', description: 'Motorcycle expedition' },
  { id: 'mixed', label: 'Mixed Transport', icon: '🔄', description: 'Combination of flight, road, and local transport' },
  { id: 'cruise', label: 'Cruise / Ferry', icon: '🚢', description: 'Includes ferry or cruise travel' },
];

export const stayTypes = [
  { id: 'hotel', label: 'Hotel', icon: '🏨', description: '3-star to 5-star hotel accommodation' },
  { id: 'hostel', label: 'Hostel', icon: '🛏️', description: 'Budget-friendly shared or private dorm rooms' },
  { id: 'camping', label: 'Camping', icon: '⛺', description: 'Tents, glamping, or riverside camps' },
  { id: 'homestay', label: 'Homestay', icon: '🏡', description: 'Stay with local families for authentic experience' },
  { id: 'resort', label: 'Resort', icon: '🏖️', description: 'Full-service resort accommodation' },
  { id: 'villa', label: 'Villa / Cottage', icon: '🏘️', description: 'Private villa or cottage stay' },
  { id: 'houseboat', label: 'Houseboat', icon: '🚤', description: 'Floating accommodation on backwaters or lakes' },
  { id: 'mixed', label: 'Mixed Stays', icon: '🔄', description: 'Combination of different stay types' },
];

export const foodPreferences = [
  { id: 'both', label: 'Veg & Non-Veg', icon: '🍽️' },
  { id: 'veg', label: 'Pure Vegetarian', icon: '🥬' },
  { id: 'non-veg', label: 'Non-Vegetarian', icon: '🍗' },
  { id: 'jain', label: 'Jain Food Available', icon: '🥗' },
  { id: 'vegan', label: 'Vegan Options', icon: '🌱' },
];

export const groupTypes = [
  { id: 'mixed', label: 'Mixed Group', icon: '👥', description: 'Open to all genders and travel styles' },
  { id: 'women-only', label: 'Women Only', icon: '👩‍👩‍👧', description: 'Exclusively for women travelers' },
  { id: 'couples', label: 'Couples', icon: '💑', description: 'Designed for couples and partners' },
  { id: 'family', label: 'Family Friendly', icon: '👨‍👩‍👧‍👦', description: 'Suitable for families with children' },
  { id: 'friends', label: 'Friends Group', icon: '🤝', description: 'Perfect for friend groups' },
  { id: 'solo-friendly', label: 'Solo Friendly', icon: '🧑', description: 'Ideal for solo travelers joining a group' },
];

export const sortOptions = [
  { id: 'recommended', label: 'Recommended', icon: '⭐' },
  { id: 'price-low', label: 'Price: Low to High', icon: '💰' },
  { id: 'price-high', label: 'Price: High to Low', icon: '💎' },
  { id: 'rating', label: 'Highest Rated', icon: '🏆' },
  { id: 'popularity', label: 'Most Popular', icon: '🔥' },
  { id: 'duration-short', label: 'Duration: Short to Long', icon: '⏱️' },
  { id: 'duration-long', label: 'Duration: Long to Short', icon: '⏳' },
  { id: 'departure-soon', label: 'Departing Soon', icon: '📅' },
  { id: 'seats-left', label: 'Filling Fast', icon: '🎟️' },
  { id: 'newest', label: 'Newly Added', icon: '🆕' },
];

export const priceRanges = [
  { id: 'budget', label: 'Under ₹10,000', min: 0, max: 10000 },
  { id: 'value', label: '₹10,000 – ₹20,000', min: 10000, max: 20000 },
  { id: 'mid', label: '₹20,000 – ₹40,000', min: 20000, max: 40000 },
  { id: 'premium', label: '₹40,000 – ₹70,000', min: 40000, max: 70000 },
  { id: 'luxury', label: '₹70,000+', min: 70000, max: Infinity },
];

export const durationRanges = [
  { id: 'weekend', label: '2–3 Days', minDays: 2, maxDays: 3 },
  { id: 'short', label: '4–5 Days', minDays: 4, maxDays: 5 },
  { id: 'medium', label: '6–8 Days', minDays: 6, maxDays: 8 },
  { id: 'long', label: '9–12 Days', minDays: 9, maxDays: 12 },
  { id: 'extended', label: '13+ Days', minDays: 13, maxDays: Infinity },
];
