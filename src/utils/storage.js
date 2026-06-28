// ============================================================
// Community of Travellers — localStorage Abstraction
// Namespaced key-value store with JSON serialization
// ============================================================

const NAMESPACE = 'cot_';
const MAX_RECENT_SEARCHES = 10;
const MAX_MESSAGES = 200;
const MAX_INQUIRIES = 100;

// ─── Low-Level Helpers ───────────────────────────────────────

/**
 * Safely read from localStorage. Returns `null` on any failure.
 * @param {string} rawKey – full (namespaced) key
 * @returns {*}
 */
function _read(rawKey) {
  try {
    const raw = localStorage.getItem(rawKey);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[Storage] Failed to read key "${rawKey}":`, err);
    return null;
  }
}

/**
 * Safely write to localStorage. Returns `true` on success.
 * Handles QuotaExceededError by attempting to free space.
 * @param {string} rawKey – full (namespaced) key
 * @param {*}      value  – JSON-serializable value
 * @returns {boolean}
 */
function _write(rawKey, value) {
  try {
    localStorage.setItem(rawKey, JSON.stringify(value));
    return true;
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      console.warn('[Storage] Quota exceeded. Attempting cleanup…');
      _cleanup();
      try {
        localStorage.setItem(rawKey, JSON.stringify(value));
        return true;
      } catch (retryErr) {
        console.error('[Storage] Still over quota after cleanup:', retryErr);
        return false;
      }
    }
    console.error(`[Storage] Failed to write key "${rawKey}":`, err);
    return false;
  }
}

/**
 * Remove a key from localStorage.
 * @param {string} rawKey
 */
function _remove(rawKey) {
  try {
    localStorage.removeItem(rawKey);
  } catch (err) {
    console.warn(`[Storage] Failed to remove key "${rawKey}":`, err);
  }
}

/**
 * Emergency cleanup — removes oldest messages and searches to free space.
 */
function _cleanup() {
  try {
    // Trim messages to half
    const messages = _read(`${NAMESPACE}messages`);
    if (Array.isArray(messages) && messages.length > 20) {
      _write(`${NAMESPACE}messages`, messages.slice(-Math.floor(messages.length / 2)));
    }
    // Trim searches to 3
    const searches = _read(`${NAMESPACE}recent_searches`);
    if (Array.isArray(searches) && searches.length > 3) {
      _write(`${NAMESPACE}recent_searches`, searches.slice(-3));
    }
  } catch (_) {
    // Best-effort
  }
}

// ─── Public Storage API ──────────────────────────────────────

export const Storage = {
  // ── Generic Key-Value ──────────────────────────────────────

  /**
   * Get a value by key.
   * @param {string} key – logical key (namespace prefix added automatically)
   * @returns {*} parsed value or null
   */
  get(key) {
    if (!key) return null;
    return _read(`${NAMESPACE}${key}`);
  },

  /**
   * Set a value by key.
   * @param {string} key
   * @param {*}      value – must be JSON-serializable
   * @returns {boolean} success
   */
  set(key, value) {
    if (!key) return false;
    return _write(`${NAMESPACE}${key}`, value);
  },

  /**
   * Remove a key.
   * @param {string} key
   */
  remove(key) {
    if (!key) return;
    _remove(`${NAMESPACE}${key}`);
  },

  /**
   * Remove all CoT-namespaced keys.
   */
  clear() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(NAMESPACE)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (err) {
      console.error('[Storage] Failed to clear namespace:', err);
    }
  },

  // ── Saved Trips ────────────────────────────────────────────

  /**
   * Get all saved trip IDs.
   * @returns {string[]}
   */
  getSavedTrips() {
    return _read(`${NAMESPACE}saved_trips`) || [];
  },

  /**
   * Save a trip by ID.
   * @param {string} tripId
   * @returns {boolean}
   */
  saveTrip(tripId) {
    if (!tripId) return false;
    const saved = this.getSavedTrips();
    if (saved.includes(tripId)) return true; // already saved
    saved.push(tripId);
    return _write(`${NAMESPACE}saved_trips`, saved);
  },

  /**
   * Remove a trip from saved list.
   * @param {string} tripId
   * @returns {boolean}
   */
  unsaveTrip(tripId) {
    if (!tripId) return false;
    const saved = this.getSavedTrips();
    const idx = saved.indexOf(tripId);
    if (idx === -1) return true; // not saved anyway
    saved.splice(idx, 1);
    return _write(`${NAMESPACE}saved_trips`, saved);
  },

  /**
   * Check if a trip is saved.
   * @param {string} tripId
   * @returns {boolean}
   */
  isTripSaved(tripId) {
    if (!tripId) return false;
    return this.getSavedTrips().includes(tripId);
  },

  // ── Current User ───────────────────────────────────────────

  /**
   * Get the currently logged-in user object.
   * @returns {Object|null}
   */
  getCurrentUser() {
    return _read(`${NAMESPACE}current_user`);
  },

  /**
   * Store the currently logged-in user.
   * @param {Object} user
   * @returns {boolean}
   */
  setCurrentUser(user) {
    if (!user) {
      _remove(`${NAMESPACE}current_user`);
      return true;
    }
    return _write(`${NAMESPACE}current_user`, user);
  },

  // ── Messages ───────────────────────────────────────────────

  /**
   * Get all stored messages.
   * @returns {Object[]}
   */
  getMessages() {
    return _read(`${NAMESPACE}messages`) || [];
  },

  /**
   * Add a message. Trims to MAX_MESSAGES if needed.
   * @param {Object} message – must include at least { id, text, timestamp }
   * @returns {boolean}
   */
  addMessage(message) {
    if (!message) return false;
    const msgs = this.getMessages();
    // Prevent duplicate IDs
    if (message.id && msgs.some((m) => m.id === message.id)) {
      return true;
    }
    msgs.push({
      ...message,
      timestamp: message.timestamp || new Date().toISOString(),
    });
    // Trim oldest messages if over limit
    const trimmed = msgs.length > MAX_MESSAGES
      ? msgs.slice(-MAX_MESSAGES)
      : msgs;
    return _write(`${NAMESPACE}messages`, trimmed);
  },

  // ── Inquiries ──────────────────────────────────────────────

  /**
   * Get all stored inquiries.
   * @returns {Object[]}
   */
  getInquiries() {
    return _read(`${NAMESPACE}inquiries`) || [];
  },

  /**
   * Add an inquiry. Trims to MAX_INQUIRIES if needed.
   * @param {Object} inquiry – { tripId, hostId, message, name, email, phone, ... }
   * @returns {boolean}
   */
  addInquiry(inquiry) {
    if (!inquiry) return false;
    const list = this.getInquiries();
    const entry = {
      ...inquiry,
      id: inquiry.id || `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: inquiry.createdAt || new Date().toISOString(),
      status: inquiry.status || 'pending',
    };
    list.push(entry);
    const trimmed = list.length > MAX_INQUIRIES
      ? list.slice(-MAX_INQUIRIES)
      : list;
    return _write(`${NAMESPACE}inquiries`, trimmed);
  },

  // ── Recent Searches ────────────────────────────────────────

  /**
   * Get recent search terms.
   * @returns {string[]}
   */
  getRecentSearches() {
    return _read(`${NAMESPACE}recent_searches`) || [];
  },

  /**
   * Add a search term. Deduplicates and caps at MAX_RECENT_SEARCHES.
   * @param {string} search
   * @returns {boolean}
   */
  addRecentSearch(search) {
    if (!search || typeof search !== 'string') return false;
    const term = search.trim();
    if (!term) return false;

    let list = this.getRecentSearches();
    // Remove duplicate (case-insensitive)
    list = list.filter((s) => s.toLowerCase() !== term.toLowerCase());
    // Add to front (most recent first)
    list.unshift(term);
    // Cap length
    if (list.length > MAX_RECENT_SEARCHES) {
      list = list.slice(0, MAX_RECENT_SEARCHES);
    }
    return _write(`${NAMESPACE}recent_searches`, list);
  },

  /**
   * Clear recent search history.
   */
  clearRecentSearches() {
    _remove(`${NAMESPACE}recent_searches`);
  },
};
