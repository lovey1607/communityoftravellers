// ============================================
// Global State Management — Reactive Store
// ============================================

export function escapeHTML(str) {
    if (!str) return '';
    return str
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

class Store {
    constructor() {
        this._state = {
            // User state
            currentUser: null,
            isLoggedIn: false,
            userRole: null, // 'traveler', 'host', 'admin'
            
            // Navigation
            currentPage: 'home',
            mobileMenuOpen: false,
            
            // Filters
            filters: {
                destination: '',
                origin: '',
                dateStart: '',
                dateEnd: '',
                budgetMin: 0,
                budgetMax: 1000000,
                region: '',
                tripType: [],
                hostType: '',
                hostId: '',
                hostNameQuery: '',
                stayType: '',
                transportMode: '',
                foodPreference: '',
                groupType: '',
                verifiedOnly: false,
                sortBy: 'trending',
                searchQuery: ''
            },
            
            // Saved trips
            savedTrips: [],
            
            // Messages
            messages: [],
            unreadCount: 0,
            
            // Inquiries
            inquiries: [],
            
            // Recent searches
            recentSearches: [],
            
            // UI state
            filterDrawerOpen: false,
            lightboxOpen: false,
            lightboxImages: [],
            lightboxIndex: 0,
            toasts: [],
            loading: false,
            
            // Host dashboard
            hostTrips: [],
            hostInquiries: [],
            
            // Admin
            pendingHosts: [],
            pendingTrips: []
        };
        
        this._listeners = {};
        this._globalListeners = [];
        
        // Load persisted state
        this._loadPersistedState();
    }

    // Get state value
    get(key) {
        return key.split('.').reduce((obj, k) => obj?.[k], this._state);
    }

    // Get entire state
    getState() {
        return { ...this._state };
    }

    // Set state value
    set(key, value) {
        const keys = key.split('.');
        let obj = this._state;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in obj)) obj[keys[i]] = {};
            obj = obj[keys[i]];
        }
        
        const oldValue = obj[keys[keys.length - 1]];
        obj[keys[keys.length - 1]] = value;
        
        // Notify listeners
        this._notify(key, value, oldValue);
        
        // Persist certain keys
        this._persistState(key);
    }

    // Update state with partial object
    update(updates) {
        for (const [key, value] of Object.entries(updates)) {
            this.set(key, value);
        }
    }

    // Subscribe to state changes
    on(key, callback) {
        if (!this._listeners[key]) {
            this._listeners[key] = [];
        }
        this._listeners[key].push(callback);
        
        // Return unsubscribe function
        return () => {
            this._listeners[key] = this._listeners[key].filter(cb => cb !== callback);
        };
    }

    // Subscribe to all state changes
    onAny(callback) {
        this._globalListeners.push(callback);
        return () => {
            this._globalListeners = this._globalListeners.filter(cb => cb !== callback);
        };
    }

    // Notify listeners
    _notify(key, newValue, oldValue) {
        // Specific listeners
        if (this._listeners[key]) {
            this._listeners[key].forEach(cb => cb(newValue, oldValue, key));
        }
        
        // Parent key listeners (e.g., 'filters' when 'filters.destination' changes)
        const parentKey = key.split('.').slice(0, -1).join('.');
        if (parentKey && this._listeners[parentKey]) {
            this._listeners[parentKey].forEach(cb => cb(this.get(parentKey), null, parentKey));
        }
        
        // Global listeners
        this._globalListeners.forEach(cb => cb(key, newValue, oldValue));
    }

    // Persist certain state to localStorage
    _persistState(key) {
        const persistedKeys = ['savedTrips', 'currentUser', 'isLoggedIn', 'userRole', 'recentSearches', 'messages', 'inquiries', 'pendingHosts', 'verificationStatus'];
        const rootKey = key.split('.')[0];
        
        if (persistedKeys.includes(rootKey)) {
            try {
                localStorage.setItem(`cot_${rootKey}`, JSON.stringify(this.get(rootKey)));
            } catch (e) {
                console.warn('Failed to persist state:', e);
            }
        }
    }

    // Load persisted state from localStorage
    _loadPersistedState() {
        const persistedKeys = ['savedTrips', 'currentUser', 'isLoggedIn', 'userRole', 'recentSearches', 'messages', 'inquiries', 'pendingHosts', 'verificationStatus'];
        const arrayKeys = ['savedTrips', 'recentSearches', 'messages', 'inquiries', 'pendingHosts'];
        
        for (const key of persistedKeys) {
            try {
                const stored = localStorage.getItem(`cot_${key}`);
                if (stored !== null && stored !== 'undefined') {
                    const parsed = JSON.parse(stored);
                    if (arrayKeys.includes(key) && !Array.isArray(parsed)) {
                        this._state[key] = [];
                    } else {
                        this._state[key] = parsed;
                    }
                }
            } catch (e) {
                console.warn(`Failed to load persisted state for ${key}:`, e);
                if (arrayKeys.includes(key)) {
                    this._state[key] = [];
                }
            }
        }
        
        // Seed default pending hosts if empty for end-to-end testing
        if (this._state.pendingHosts.length === 0) {
            this._state.pendingHosts = [
                {
                    id: 'host-013',
                    name: 'Peak Experiences',
                    email: 'contact@peakexp.com',
                    avatar: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80',
                    type: 'company',
                    submittedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
                    documents: {
                        idProof: 'business_license_peak.pdf',
                        gstCert: 'gstin_27aaacp1234a1z2.pdf',
                        socialLink: 'https://instagram.com/peakexperiences'
                    }
                },
                {
                    id: 'host-pending-01',
                    name: 'Nomadic Nishant',
                    email: 'nishant@nomadicnishant.com',
                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
                    type: 'influencer',
                    submittedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
                    documents: {
                        idProof: 'aadhaar_card_nishant.pdf',
                        gstCert: '',
                        socialLink: 'https://instagram.com/nomadic_nishant'
                    }
                }
            ];
            try {
                localStorage.setItem('cot_pendingHosts', JSON.stringify(this._state.pendingHosts));
            } catch (e) {
                console.warn('Failed to save seeded pending hosts:', e);
            }
        }
    }

    // Reset filters
    resetFilters() {
        this.set('filters', {
            destination: '',
            origin: '',
            dateStart: '',
            dateEnd: '',
            budgetMin: 0,
            budgetMax: 1000000,
            region: '',
            tripType: [],
            hostType: '',
            hostId: '',
            stayType: '',
            transportMode: '',
            foodPreference: '',
            groupType: '',
            verifiedOnly: false,
            sortBy: 'trending',
            searchQuery: ''
        });
    }

    // Toggle saved trip
    toggleSavedTrip(tripId) {
        const saved = [...this.get('savedTrips')];
        const index = saved.indexOf(tripId);
        
        if (index > -1) {
            saved.splice(index, 1);
        } else {
            saved.push(tripId);
        }
        
        this.set('savedTrips', saved);
        return index === -1; // Returns true if saved, false if unsaved
    }

    // Check if trip is saved
    isTripSaved(tripId) {
        return this.get('savedTrips').includes(tripId);
    }

    // Add toast notification
    addToast(message, type = 'info', duration = 4000) {
        const toast = {
            id: Date.now() + Math.random(),
            message,
            type,
            duration,
            timestamp: Date.now()
        };
        
        const toasts = [...this.get('toasts'), toast];
        this.set('toasts', toasts);
        
        // Auto remove
        if (duration > 0) {
            setTimeout(() => this.removeToast(toast.id), duration);
        }
        
        return toast.id;
    }

    // Remove toast
    removeToast(toastId) {
        const toasts = this.get('toasts').filter(t => t.id !== toastId);
        this.set('toasts', toasts);
    }

    // Login
    login(user) {
        this.update({
            currentUser: user,
            isLoggedIn: true,
            userRole: user.role || 'traveler'
        });
    }

    // Logout
    logout() {
        this.update({
            currentUser: null,
            isLoggedIn: false,
            userRole: null
        });
        localStorage.removeItem('cot_currentUser');
        localStorage.removeItem('cot_isLoggedIn');
        localStorage.removeItem('cot_userRole');
    }

    // Add message
    addMessage(message) {
        const messages = [...this.get('messages'), {
            ...message,
            id: `msg-${Date.now()}`,
            timestamp: new Date().toISOString(),
            read: false
        }];
        this.set('messages', messages);
        this.set('unreadCount', messages.filter(m => !m.read).length);
    }

    // Mark message as read
    markMessageRead(messageId) {
        const messages = this.get('messages').map(m =>
            m.id === messageId ? { ...m, read: true } : m
        );
        this.set('messages', messages);
        this.set('unreadCount', messages.filter(m => !m.read).length);
    }

    // Add inquiry
    addInquiry(inquiry) {
        const inquiries = [...this.get('inquiries'), {
            ...inquiry,
            id: `inq-${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'pending'
        }];
        this.set('inquiries', inquiries);
    }

    // Add recent search
    addRecentSearch(search) {
        let recent = [...this.get('recentSearches')];
        // Remove duplicate
        recent = recent.filter(s => s.query !== search.query);
        // Add to front
        recent.unshift({ ...search, timestamp: Date.now() });
        // Keep only last 10
        recent = recent.slice(0, 10);
        this.set('recentSearches', recent);
    }
}

// Create singleton store instance
export const store = new Store();
