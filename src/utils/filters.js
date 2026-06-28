// ============================================================
// Community of Travellers — Filter Engine
// Multi-field filtering, sorting, URL serialization
// ============================================================

// ─── Filter Trips ────────────────────────────────────────────

/**
 * Apply all active filters to a trip array.
 *
 * @param {Object[]} trips – full trips array
 * @param {Object}   filters – active filter state
 * @param {string}   [filters.search]          – free-text search query
 * @param {string}   [filters.destination]      – destination name (partial match)
 * @param {string}   [filters.origin]           – departure city (partial match)
 * @param {Object}   [filters.dateRange]        – { start: string, end: string }
 * @param {number}   [filters.budgetMin]        – minimum price
 * @param {number}   [filters.budgetMax]        – maximum price
 * @param {string}   [filters.region]           – 'domestic' | 'international'
 * @param {string|string[]} [filters.tripType]  – category id(s)
 * @param {string}   [filters.hostType]         – 'influencer' | 'company'
 * @param {string}   [filters.stayType]         – stay type id
 * @param {string}   [filters.transportMode]    – transport mode id
 * @param {string}   [filters.foodPreference]   – food preference id
 * @param {string}   [filters.groupType]        – group type id
 * @param {boolean}  [filters.verifiedOnly]     – only verified hosts
 * @param {boolean}  [filters.trending]         – only trending trips
 * @param {string}   [filters.duration]         – duration range id
 * @param {string}   [filters.sortBy]           – sort key
 * @returns {Object[]} filtered (and optionally sorted) trips
 */
export function filterTrips(trips, filters = {}, hosts = []) {
  if (!Array.isArray(trips) || trips.length === 0) return [];

  let result = trips;

  // Build hosts map for fast host detail lookup
  const hostsMap = {};
  if (Array.isArray(hosts)) {
    hosts.forEach((h) => {
      hostsMap[h.id] = h;
    });
  }

  // ── Free-text search ─────────────────────────────────────
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    if (q) {
      result = result.filter((trip) => {
        const haystack = [
          trip.title,
          trip.name,
          trip.destination,
          trip.origin,
          trip.shortDescription,
          trip.description,
          trip.hostName,
          ...(trip.tags || []),
          ...(trip.categories || []),
          ...(trip.highlights || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
    }
  }

  // ── Destination ──────────────────────────────────────────
  if (filters.destination) {
    const dest = filters.destination.toLowerCase().trim();
    result = result.filter((trip) =>
      (trip.destination || trip.location || '').toLowerCase().includes(dest)
    );
  }

  // ── Origin / Departure City ──────────────────────────────
  if (filters.origin) {
    const orig = filters.origin.toLowerCase().trim();
    result = result.filter((trip) => {
      const origins = Array.isArray(trip.departureCities)
        ? trip.departureCities
        : [trip.origin || trip.departureCity || ''];
      return origins.some((o) => o.toLowerCase().includes(orig));
    });
  }

  // ── Date Range ───────────────────────────────────────────
  if (filters.dateRange) {
    const { start, end } = filters.dateRange;
    const filterStart = start ? new Date(start).getTime() : null;
    const filterEnd = end ? new Date(end).getTime() : null;

    if (filterStart || filterEnd) {
      result = result.filter((trip) => {
        const tripStart = trip.startDate || trip.departureDate;
        const tripEnd = trip.endDate || trip.returnDate;
        if (!tripStart) return false;

        const ts = new Date(tripStart).getTime();
        const te = tripEnd ? new Date(tripEnd).getTime() : ts;

        if (filterStart && te < filterStart) return false;
        if (filterEnd && ts > filterEnd) return false;
        return true;
      });
    }
  }

  // ── Budget Range ─────────────────────────────────────────
  if (filters.budgetMin != null || filters.budgetMax != null) {
    result = result.filter((trip) => {
      const price = trip.currentPrice ?? trip.price ?? 0;
      if (filters.budgetMin != null && price < filters.budgetMin) return false;
      if (filters.budgetMax != null && price > filters.budgetMax) return false;
      return true;
    });
  }

  // ── Region ───────────────────────────────────────────────
  if (filters.region) {
    result = result.filter((trip) => trip.region === filters.region);
  }

  // ── Trip Type / Category ─────────────────────────────────
  if (filters.tripType) {
    const types = Array.isArray(filters.tripType)
      ? filters.tripType
      : [filters.tripType];

    if (types.length > 0) {
      result = result.filter((trip) => {
        const tripCats = [
          ...(trip.categories || []),
          ...(trip.tags || []),
          trip.type,
          trip.tripType,
        ].filter(Boolean);
        return types.some((t) => tripCats.includes(t));
      });
    }
  }

  // ── Host Type ────────────────────────────────────────────
  if (filters.hostType) {
    result = result.filter((trip) => {
      const type = trip.hostType || hostsMap[trip.hostId]?.type;
      return type === filters.hostType;
    });
  }

  // ── Stay Type ────────────────────────────────────────────
  if (filters.stayType) {
    result = result.filter((trip) => {
      const stays = Array.isArray(trip.stayType) ? trip.stayType : [trip.stayType];
      return stays.includes(filters.stayType);
    });
  }

  // ── Transport Mode ───────────────────────────────────────
  if (filters.transportMode) {
    result = result.filter((trip) => {
      const modes = Array.isArray(trip.transportMode)
        ? trip.transportMode
        : [trip.transportMode];
      return modes.includes(filters.transportMode);
    });
  }

  // ── Food Preference ──────────────────────────────────────
  if (filters.foodPreference) {
    result = result.filter((trip) => {
      const prefs = Array.isArray(trip.foodPreference)
        ? trip.foodPreference
        : [trip.foodPreference];
      // 'both' is a wildcard that matches all
      return prefs.includes(filters.foodPreference) || prefs.includes('both');
    });
  }

  // ── Group Type ───────────────────────────────────────────
  if (filters.groupType) {
    result = result.filter((trip) => {
      const groups = Array.isArray(trip.groupType) ? trip.groupType : [trip.groupType];
      return groups.includes(filters.groupType);
    });
  }

  // ── Host ID ──────────────────────────────────────────────
  if (filters.hostId) {
    result = result.filter((trip) => trip.hostId === filters.hostId);
  }

  // ── Host Name Query ──────────────────────────────────────
  if (filters.hostNameQuery) {
    const hn = filters.hostNameQuery.toLowerCase().trim();
    result = result.filter((trip) => {
      const hostName = hostsMap[trip.hostId]?.name || trip.hostName || '';
      return hostName.toLowerCase().includes(hn);
    });
  }

  // ── Verified Only ────────────────────────────────────────
  if (filters.verifiedOnly) {
    result = result.filter((trip) => {
      return trip.verified || trip.hostVerified || hostsMap[trip.hostId]?.verified;
    });
  }

  // ── Trending Only ────────────────────────────────────────
  if (filters.trending) {
    result = result.filter((trip) => trip.trending || trip.isTrending);
  }

  // ── Duration Range ───────────────────────────────────────
  if (filters.duration) {
    const durationRanges = {
      weekend: { min: 2, max: 3 },
      short: { min: 4, max: 5 },
      medium: { min: 6, max: 8 },
      long: { min: 9, max: 12 },
      extended: { min: 13, max: Infinity },
    };

    const range = durationRanges[filters.duration];
    if (range) {
      result = result.filter((trip) => {
        const days = trip.days || trip.duration || (trip.nights ? trip.nights + 1 : 0);
        return days >= range.min && days <= range.max;
      });
    }
  }

  // ── Sort ─────────────────────────────────────────────────
  if (filters.sortBy) {
    result = sortTrips(result, filters.sortBy);
  }

  return result;
}

// ─── Sort Trips ──────────────────────────────────────────────

/**
 * Sort a trips array by the given criterion.
 * Returns a new sorted array (does not mutate the original).
 *
 * @param {Object[]} trips
 * @param {string}   sortBy – one of:
 *   'trending', 'newest', 'price-low', 'price-high',
 *   'rating', 'popularity', 'duration-short', 'duration-long',
 *   'departure-soon', 'seats-left', 'recommended'
 * @returns {Object[]}
 */
export function sortTrips(trips, sortBy) {
  if (!Array.isArray(trips) || trips.length === 0) return [];

  const sorted = [...trips];

  switch (sortBy) {
    case 'price-low':
      sorted.sort((a, b) => _getPrice(a) - _getPrice(b));
      break;

    case 'price-high':
      sorted.sort((a, b) => _getPrice(b) - _getPrice(a));
      break;

    case 'rating':
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;

    case 'popularity':
      sorted.sort((a, b) => {
        const popA = (a.bookedSeats || 0) + (a.reviewCount || 0) + (a.views || 0);
        const popB = (b.bookedSeats || 0) + (b.reviewCount || 0) + (b.views || 0);
        return popB - popA;
      });
      break;

    case 'newest':
      sorted.sort((a, b) => {
        const da = new Date(a.createdAt || a.publishedDate || 0).getTime();
        const db = new Date(b.createdAt || b.publishedDate || 0).getTime();
        return db - da;
      });
      break;

    case 'duration-short':
      sorted.sort((a, b) => _getDays(a) - _getDays(b));
      break;

    case 'duration-long':
      sorted.sort((a, b) => _getDays(b) - _getDays(a));
      break;

    case 'departure-soon':
      sorted.sort((a, b) => {
        const da = new Date(a.startDate || a.departureDate || '9999-12-31').getTime();
        const db = new Date(b.startDate || b.departureDate || '9999-12-31').getTime();
        return da - db;
      });
      break;

    case 'seats-left':
      sorted.sort((a, b) => {
        const seatsA = (a.totalSeats || 0) - (a.bookedSeats || 0);
        const seatsB = (b.totalSeats || 0) - (b.bookedSeats || 0);
        return seatsA - seatsB; // fewest seats left → first (urgency)
      });
      break;

    case 'trending':
      sorted.sort((a, b) => {
        // Trending items float to top, then sort by a composite score
        const tA = a.trending || a.isTrending ? 1 : 0;
        const tB = b.trending || b.isTrending ? 1 : 0;
        if (tA !== tB) return tB - tA;
        // Secondary: composite score
        const scoreA = (a.rating || 0) * 20 + (a.bookedSeats || 0) + (a.reviewCount || 0);
        const scoreB = (b.rating || 0) * 20 + (b.bookedSeats || 0) + (b.reviewCount || 0);
        return scoreB - scoreA;
      });
      break;

    case 'recommended':
    default:
      // Composite relevance: verified boost + rating + popularity + recency
      sorted.sort((a, b) => {
        const scoreA = _recommendationScore(a);
        const scoreB = _recommendationScore(b);
        return scoreB - scoreA;
      });
      break;
  }

  return sorted;
}

// ─── Filter Counts ───────────────────────────────────────────

/**
 * Count how many trips match each value for a given filter key.
 *
 * @param {Object[]} trips
 * @param {string}   filterKey – e.g. 'region', 'tripType', 'hostType',
 *                               'stayType', 'groupType', 'transportMode'
 * @returns {Object<string, number>} e.g. { domestic: 15, international: 10 }
 */
export function getFilterCounts(trips, filterKey) {
  if (!Array.isArray(trips) || !filterKey) return {};

  const counts = {};

  // Map filter key → trip property path(s)
  const keyMap = {
    region: ['region'],
    tripType: ['categories', 'tags', 'type', 'tripType'],
    hostType: ['hostType'],
    stayType: ['stayType'],
    transportMode: ['transportMode'],
    foodPreference: ['foodPreference'],
    groupType: ['groupType'],
    duration: null, // special handling below
  };

  const props = keyMap[filterKey];

  if (filterKey === 'duration') {
    // Count by duration range
    const ranges = {
      weekend: { min: 2, max: 3 },
      short: { min: 4, max: 5 },
      medium: { min: 6, max: 8 },
      long: { min: 9, max: 12 },
      extended: { min: 13, max: Infinity },
    };
    for (const [id, range] of Object.entries(ranges)) {
      counts[id] = trips.filter((t) => {
        const days = _getDays(t);
        return days >= range.min && days <= range.max;
      }).length;
    }
    return counts;
  }

  if (!props) return counts;

  for (const trip of trips) {
    for (const prop of props) {
      const val = trip[prop];
      if (val == null) continue;

      const values = Array.isArray(val) ? val : [val];
      for (const v of values) {
        if (v && typeof v === 'string') {
          counts[v] = (counts[v] || 0) + 1;
        }
      }
    }
  }

  return counts;
}

// ─── URL Serialization ──────────────────────────────────────

/**
 * Serialize a filters object into a URL search params string.
 * Only includes keys with truthy values.
 *
 * @param {Object} filters
 * @returns {string} e.g. 'region=domestic&budgetMax=20000&sortBy=price-low'
 */
export function serializeFilters(filters) {
  if (!filters || typeof filters !== 'object') return '';

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value == null || value === '' || value === false) continue;

    if (key === 'dateRange' && typeof value === 'object') {
      if (value.start) params.set('dateStart', value.start);
      if (value.end) params.set('dateEnd', value.end);
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        params.set(key, value.join(','));
      }
    } else if (typeof value === 'object') {
      // Skip nested objects we don't know how to serialize
      continue;
    } else {
      params.set(key, String(value));
    }
  }

  return params.toString();
}

/**
 * Deserialize a URL search params string back into a filters object.
 *
 * @param {string} paramString – e.g. 'region=domestic&budgetMax=20000'
 * @returns {Object} filter object
 */
export function deserializeFilters(paramString) {
  if (!paramString || typeof paramString !== 'string') return {};

  const params = new URLSearchParams(paramString);
  const filters = {};

  // Numeric keys
  const numericKeys = ['budgetMin', 'budgetMax'];
  // Boolean keys
  const booleanKeys = ['verifiedOnly', 'trending'];
  // Array keys (comma-separated)
  const arrayKeys = ['tripType'];

  for (const [key, value] of params.entries()) {
    // Handle date range reconstruction
    if (key === 'dateStart') {
      if (!filters.dateRange) filters.dateRange = {};
      filters.dateRange.start = value;
      continue;
    }
    if (key === 'dateEnd') {
      if (!filters.dateRange) filters.dateRange = {};
      filters.dateRange.end = value;
      continue;
    }

    if (numericKeys.includes(key)) {
      const num = Number(value);
      if (!isNaN(num)) filters[key] = num;
    } else if (booleanKeys.includes(key)) {
      filters[key] = value === 'true';
    } else if (arrayKeys.includes(key)) {
      filters[key] = value.split(',').filter(Boolean);
    } else {
      filters[key] = value;
    }
  }

  return filters;
}

// ─── Active Filter Chips ─────────────────────────────────────

/**
 * Generate an array of "chip" descriptors for currently active filters.
 * Useful for rendering dismissible filter tags in the UI.
 *
 * @param {Object} filters
 * @returns {Array<{ key: string, value: *, label: string }>}
 */
export function getActiveFilterChips(filters) {
  if (!filters || typeof filters !== 'object') return [];

  const chips = [];

  const labelMap = {
    search: (v) => `Search: "${v}"`,
    destination: (v) => `Destination: ${v}`,
    origin: (v) => `From: ${v}`,
    dateRange: (v) => {
      if (!v) return null;
      const parts = [];
      if (v.start) parts.push(v.start);
      if (v.end) parts.push(v.end);
      return parts.length ? `Dates: ${parts.join(' → ')}` : null;
    },
    budgetMin: (v) => `Min: ₹${Number(v).toLocaleString('en-IN')}`,
    budgetMax: (v) => `Max: ₹${Number(v).toLocaleString('en-IN')}`,
    region: (v) => `Region: ${_capitalize(v)}`,
    tripType: (v) => {
      const types = Array.isArray(v) ? v : [v];
      return types.map((t) => `Type: ${_capitalize(t)}`);
    },
    hostType: (v) => `Host: ${_capitalize(v)}`,
    stayType: (v) => `Stay: ${_capitalize(v)}`,
    transportMode: (v) => `Transport: ${_capitalize(v)}`,
    foodPreference: (v) => `Food: ${_capitalize(v)}`,
    groupType: (v) => `Group: ${_capitalize(v)}`,
    verifiedOnly: (v) => v ? 'Verified only' : null,
    trending: (v) => v ? 'Trending' : null,
    duration: (v) => `Duration: ${_capitalize(v)}`,
  };

  for (const [key, value] of Object.entries(filters)) {
    if (value == null || value === '' || value === false) continue;
    if (key === 'sortBy') continue; // sort is not shown as a chip

    const mapper = labelMap[key];
    if (!mapper) continue;

    const label = mapper(value);
    if (!label) continue;

    if (Array.isArray(label)) {
      // tripType returns multiple labels
      const values = Array.isArray(value) ? value : [value];
      label.forEach((l, i) => {
        chips.push({ key, value: values[i], label: l });
      });
    } else {
      chips.push({ key, value, label });
    }
  }

  return chips;
}

// ─── Private Helpers ─────────────────────────────────────────

function _getPrice(trip) {
  return trip.currentPrice ?? trip.price ?? 0;
}

function _getDays(trip) {
  return trip.days || trip.duration || (trip.nights ? trip.nights + 1 : 0);
}

function _recommendationScore(trip) {
  let score = 0;
  score += (trip.verified || trip.hostVerified) ? 30 : 0;
  score += (trip.trending || trip.isTrending) ? 25 : 0;
  score += (trip.rating || 0) * 15;
  score += Math.min((trip.reviewCount || 0) * 0.5, 25);
  score += Math.min((trip.bookedSeats || 0) * 0.3, 20);

  // Recency boost (trips created recently get a bump)
  const created = new Date(trip.createdAt || trip.publishedDate || 0).getTime();
  const ageMs = Date.now() - created;
  const ageDays = ageMs / 86_400_000;
  if (ageDays < 7) score += 15;
  else if (ageDays < 30) score += 8;
  else if (ageDays < 90) score += 3;

  return score;
}

function _capitalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
