// ============================================
// Saved Trips / Wishlist Component
// Display and manage favorited group travel adventures
// ============================================

import { store } from '../state.js';
import { trips } from '../data/trips.js';
import { hosts } from '../data/hosts.js';
import { renderTripGrid, setupTripCardEvents } from '../components/trip-card.js';

export function renderSavedPage() {
    const app = document.getElementById('app');
    if (!app) return;

    const savedTripIds = store.get('savedTrips') || [];
    const verifiedHostsSet = new Set(hosts.filter(h => h.verified).map(h => h.id));
    const wishlistTrips = trips.filter(t => savedTripIds.includes(t.id) && t.status === 'published' && verifiedHostsSet.has(t.hostId));

    app.innerHTML = `
        <div class="saved-trips-page" style="padding-top:calc(var(--nav-height) + var(--space-6));min-height:90vh;">
            <div class="container">
                <div class="section-header animate-in" style="margin-bottom:var(--space-6);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-4)">
                    <div>
                        <h1 class="section-title" style="margin-bottom:0">My Saved <span class="text-gradient">Trips</span></h1>
                        <p class="section-subtitle">Keep track of your dream itineraries and upcoming explorations</p>
                    </div>
                    ${wishlistTrips.length > 0 ? `
                        <button class="btn btn-secondary btn-sm" id="share-wishlist-btn">
                            <span class="material-icons-round" style="font-size:16px;margin-right:4px">share</span> Share Collection
                        </button>
                    ` : ''}
                </div>

                <div class="wishlist-content-area animate-in" style="margin-top:var(--space-4)">
                    ${renderWishlistContent(wishlistTrips)}
                </div>
            </div>
        </div>
    `;

    setupWishlistEvents();
    setupTripCardEvents();
}

function renderWishlistContent(wishlistTrips) {
    if (wishlistTrips.length === 0) {
        return `
            <div class="results-empty" style="text-align:center;padding:var(--space-12) 0;color:var(--color-text-muted)">
                <span class="material-icons-round" style="font-size:64px;margin-bottom:var(--space-4);color:var(--color-text-muted)">favorite_border</span>
                <h3>Your Wishlist is Empty</h3>
                <p style="margin-top:4px;max-width:400px;margin:var(--space-2) auto 0">Discover premium group trips by verified hosts, save them by tapping the heart icon, and they will show up here.</p>
                <a href="#/trips" class="btn btn-primary" style="margin-top:var(--space-6)">Explore Group Trips</a>
            </div>
        `;
    }

    return renderTripGrid(wishlistTrips, hosts);
}

function setupWishlistEvents() {
    document.getElementById('share-wishlist-btn')?.addEventListener('click', async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Saved Group Trips - Community of Travellers',
                    text: 'Check out the group trips I am planning to join on Community of Travellers!',
                    url
                });
            } catch { }
        } else {
            await navigator.clipboard.writeText(url);
            store.addToast('Wishlist link copied to clipboard! 📋', 'success');
        }
    });

    // We can also tap into store changes so the page automatically re-renders if a user un-favorites a trip card
    store.on('savedTrips', () => {
        if (window.location.hash === '#/saved') {
            renderSavedPage();
        }
    });
}
