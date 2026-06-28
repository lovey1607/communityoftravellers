// ============================================
// Trip Card Component
// Premium marketplace listing card (travols replica)
// ============================================

import { store } from '../state.js';
import { formatPrice, getSeatsStatus, calculateDiscount } from '../utils/format.js';

const DESTINATION_FALLBACKS = {
    'goa': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    'manali': 'https://images.unsplash.com/photo-1506038634487-60a69ae4b7b1?w=800&q=80',
    'kashmir': 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800&q=80',
    'ladakh': 'https://images.unsplash.com/photo-1596701062351-df5f8af0d385?w=800&q=80',
    'kerala': 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80',
    'rajasthan': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
    'jaipur': 'https://images.unsplash.com/photo-1477584305590-38772bfd85af?w=800&q=80',
    'udaipur': 'https://images.unsplash.com/photo-1562979314-adc7404d762c?w=800&q=80',
    'himalayas': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
    'coorg': 'https://images.unsplash.com/photo-1590050752117-238cb061295a?w=800&q=80',
    'ooty': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80'
};

function getTripCoverImage(trip) {
    if (trip.coverImage && trip.coverImage.trim() !== '') {
        return trip.coverImage;
    }
    const dest = (trip.destination || '').toLowerCase();
    for (const key of Object.keys(DESTINATION_FALLBACKS)) {
        if (dest.includes(key)) {
            return DESTINATION_FALLBACKS[key];
        }
    }
    // Default fallback image
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';
}

export function renderTripCard(trip, host, options = {}) {
    const isSaved = store.isTripSaved(trip.id);
    const seats = getSeatsStatus(trip.bookedSeats, trip.totalSeats);
    const discount = calculateDiscount(trip.originalPrice, trip.price);
    const coverImage = getTripCoverImage(trip);

    // Format next date: month and day/year (e.g. Feb 5 or June 2026)
    const formatNextDate = (startDateStr) => {
        if (!startDateStr) return 'Feb';
        const date = new Date(startDateStr);
        if (isNaN(date.getTime())) return 'Feb';
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear();
        if (day <= 10) {
            return `${month} ${day}`;
        }
        return `${month} ${year}`;
    };

    return `
        <article class="trip-card-redesign" data-trip-id="${trip.id}" data-trip-slug="${trip.slug}">
            <!-- Card Image Section -->
            <div class="card-img-block">
                <img src="${coverImage}" alt="${trip.title}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80';">
                
                <!-- Discount tag -->
                ${discount > 0 ? `<div class="card-discount-badge">${discount}%</div>` : ''}
                
                <!-- Wishlist heart icon -->
                <button class="card-wishlist-btn ${isSaved ? 'saved' : ''}" 
                        data-trip-id="${trip.id}" 
                        aria-label="${isSaved ? 'Remove from saved' : 'Save trip'}">
                    <span class="material-icons-round">${isSaved ? 'favorite' : 'favorite_border'}</span>
                </button>

                <!-- Bottom overlay detailing joined seats & host type -->
                <div class="card-img-bottom-overlay">
                    <div class="card-joined-badge">${trip.bookedSeats} joined</div>
                    <div class="card-host-type-badge ${host?.type === 'influencer' ? 'creator' : 'company'}">
                        ${host?.type === 'influencer' ? 'Travel Influencer' : 'Top Travel Company'}
                    </div>
                    ${seats.available <= 5 && seats.available > 0 ? `<div class="card-seats-left-badge">${seats.available} left!</div>` : ''}
                </div>
            </div>

            <!-- Card Body Info Section -->
            <div class="card-body-block">
                <!-- Title & Rating -->
                <div class="card-title-row">
                    <h3 class="card-title-text">
                        <a href="#/trip/${trip.slug}">${trip.title}</a>
                    </h3>
                    <div class="card-rating-block">
                        <span class="star-icon">★</span>
                        <span class="rating-num">${trip.rating}</span>
                    </div>
                </div>

                <!-- Destination / Location -->
                <div class="card-location-row">
                    <span class="material-icons-round">place</span>
                    <span>${trip.destination}${trip.destinationState ? ', ' + trip.destinationState : ''}</span>
                </div>

                <!-- Host Verification Badge Pill -->
                <div class="card-host-row">
                    ${host ? `
                        <a href="#/host/${host.id}" class="card-host-pill-link" style="text-decoration:none; color:inherit; display:block;">
                            <div class="card-host-pill">
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <span class="card-host-icon">⚡</span>
                                    <span class="card-host-name">${host.name}</span>
                                </div>
                                ${host.verified ? '<span class="material-icons-round card-host-verified" style="color: #33e0be;">check_box</span>' : ''}
                            </div>
                        </a>
                    ` : `
                        <div class="card-host-pill">
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span class="card-host-icon">⚡</span>
                                <span class="card-host-name">Unknown Host</span>
                            </div>
                        </div>
                    `}
                </div>

                <!-- Meta Details: Duration & Group Seats -->
                <div class="card-meta-row">
                    <div class="card-meta-detail">
                        <span class="material-icons-round">calendar_today</span>
                        <span>${trip.duration.nights}N - ${trip.duration.days}D</span>
                    </div>
                    <div class="card-meta-detail">
                        <span class="material-icons-round">group</span>
                        <span>${trip.bookedSeats}/${trip.totalSeats}</span>
                        ${trip.groupType === 'women-only' ? `<span class="female-gender-symbol">♀</span>` : ''}
                    </div>
                </div>

                <!-- Type tags (Stay, Travel) -->
                <div class="card-tags-row">
                    <span class="card-tag-pill">${trip.stayType}</span>
                    <span class="card-tag-pill">${trip.transportMode}</span>
                </div>

                <!-- Card Footer Details: Pricing & Next Departure Date -->
                <div class="card-footer-block">
                    <div class="card-price-section">
                        <span class="price-label">Starting from</span>
                        <div class="price-numbers">
                            <span class="price-current">${formatPrice(trip.price)}</span>
                            ${trip.originalPrice > trip.price ? `<span class="price-original">${formatPrice(trip.originalPrice)}</span>` : ''}
                        </div>
                    </div>
                    <div class="card-departure-section">
                        <span class="departure-label">Next</span>
                        <span class="departure-date">${formatNextDate(trip.dates.start)}</span>
                    </div>
                </div>
            </div>
        </article>
    `;
}

export function setupTripCardEvents() {
    // Save/Wishlist toggling
    document.querySelectorAll('.card-wishlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const tripId = btn.dataset.tripId;
            const wasSaved = store.isTripSaved(tripId);
            store.toggleSavedTrip(tripId);
            
            btn.classList.toggle('saved');
            const icon = btn.querySelector('.material-icons-round');
            if (icon) icon.textContent = wasSaved ? 'favorite_border' : 'favorite';
            
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => btn.style.transform = '', 200);
            
            store.addToast(
                wasSaved ? 'Removed from saved trips' : 'Saved to your wishlist! ❤️',
                wasSaved ? 'info' : 'success'
            );
        });
    });

    // Redirection on card click
    document.querySelectorAll('.trip-card-redesign').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button') || e.target.closest('a')) return;
            const slug = card.dataset.tripSlug;
            if (slug) window.location.hash = `#/trip/${slug}`;
        });
    });
}

export function renderTripGrid(trips, hosts, options = {}) {
    const { columns = 'auto', emptyMessage = 'No trips found matching your filters.' } = options;
    
    if (!trips || trips.length === 0) {
        return `
            <div class="results-empty">
                <span class="material-icons-round" style="font-size:64px;color:var(--color-text-muted);margin-bottom:var(--space-4)">flight_takeoff</span>
                <h3>No trips found</h3>
                <p class="text-muted">${emptyMessage}</p>
                <a href="#/" class="btn btn-primary" style="margin-top:var(--space-6)">Browse All Trips</a>
            </div>
        `;
    }

    const hostsMap = {};
    (hosts || []).forEach(h => hostsMap[h.id] = h);

    return `
        <div class="trip-grid ${columns === 'auto' ? '' : `trip-grid-${columns}`}">
            ${trips.map((trip, i) => `
                <div class="animate-in stagger-${Math.min(i % 6 + 1, 6)}">
                    ${renderTripCard(trip, hostsMap[trip.hostId], options)}
                </div>
            `).join('')}
        </div>
    `;
}
