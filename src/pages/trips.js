// ============================================
// Trips Listing Page (Search Results)
// ============================================

import { trips } from '../data/trips.js';
import { hosts } from '../data/hosts.js';
import { renderSearchFilters, setupFilterEvents } from '../components/search-filters.js';
import { renderTripGrid, setupTripCardEvents } from '../components/trip-card.js';
import { filterTrips as applyFilters, sortTrips } from '../utils/filters.js';
import { store } from '../state.js';

let joinerInterval = null;

const CATEGORY_PILLS = [
    { id: '', label: 'All Trips', icon: 'explore' },
    { id: 'adventure', label: 'Adventure', icon: 'mountain' },
    { id: 'cultural', label: 'Cultural', icon: 'museum' },
    { id: 'trekking', label: 'Trekking', icon: 'hiking' },
    { id: 'beach', label: 'Beach', icon: 'beach_access' },
    { id: 'mountain', label: 'Mountain', icon: 'terrain' },
    { id: 'social', label: 'Social', icon: 'groups' }
];

export function renderTripsPage() {
    const app = document.getElementById('app');
    if (!app) return;

    // Clean up previous interval if any
    if (joinerInterval) {
        clearInterval(joinerInterval);
        joinerInterval = null;
    }

    const activeFilters = store.get('filters');
    const activeCategory = (activeFilters.tripType && activeFilters.tripType.length > 0) ? activeFilters.tripType[0] : '';

    app.innerHTML = `
        <style>
            .category-pills-row {
                display: flex !important;
                gap: 10px !important;
                margin: 24px 0 20px 0 !important;
                overflow-x: auto !important;
                padding-bottom: 6px !important;
                -ms-overflow-style: none !important;
                scrollbar-width: none !important;
            }
            .category-pills-row::-webkit-scrollbar {
                display: none !important;
            }
            .category-pill {
                background: rgba(255, 255, 255, 0.03) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                border-radius: 99px !important;
                padding: 10px 20px !important;
                color: rgba(255, 255, 255, 0.75) !important;
                font-size: 13px !important;
                font-weight: 500 !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                white-space: nowrap !important;
                font-family: var(--font-body) !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 6px !important;
            }
            .category-pill:hover {
                background: rgba(255, 90, 0, 0.1) !important;
                border-color: rgba(255, 90, 0, 0.3) !important;
                color: #ffffff !important;
                transform: translateY(-1px);
            }
            .category-pill.active {
                background: rgba(255, 90, 0, 0.15) !important;
                border-color: var(--color-teal) !important;
                color: var(--color-teal) !important;
                font-weight: 600 !important;
            }

            .floating-joiner-toast {
                position: fixed !important;
                bottom: 24px !important;
                right: 24px !important;
                background: rgba(8, 8, 8, 0.85) !important;
                border: 1px solid rgba(255, 90, 0, 0.2) !important;
                border-radius: var(--radius-xl) !important;
                padding: 12px 20px !important;
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
                backdrop-filter: blur(20px) !important;
                -webkit-backdrop-filter: blur(20px) !important;
                z-index: 1000 !important;
                transform: translateY(100px) !important;
                opacity: 0 !important;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
                pointer-events: none !important;
            }
            .floating-joiner-toast.show {
                transform: translateY(0) !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }

            .whatsapp-chat-float {
                position: fixed !important;
                bottom: 96px !important;
                right: 24px !important;
                width: 50px !important;
                height: 50px !important;
                background: #22c55e !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                color: #ffffff !important;
                box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4) !important;
                cursor: pointer !important;
                z-index: 999 !important;
                transition: all 0.2s ease !important;
                border: none !important;
            }
            .whatsapp-chat-float:hover {
                transform: scale(1.1) rotate(5deg) !important;
                box-shadow: 0 6px 20px rgba(34, 197, 94, 0.6) !important;
            }
        </style>

        <div class="trips-page" style="padding-top:calc(var(--nav-height) + var(--space-6))">
            <div class="container">
                <div class="section-header" style="margin-bottom:var(--space-6)">
                    <div>
                        <h1 class="section-title">Discover <span class="text-gradient">Group Trips</span></h1>
                        <p class="section-subtitle">Find your perfect adventure hosted by your favorite travel influencers and top travel companies.</p>
                    </div>
                </div>
                
                <!-- Filter Panel -->
                ${renderSearchFilters({ showSort: false })}

                <!-- Category Pills Row -->
                <div class="category-pills-row">
                    ${CATEGORY_PILLS.map(p => `
                        <button class="category-pill ${activeCategory === p.id ? 'active' : ''}" data-cat-id="${p.id}">
                            ${p.label}
                        </button>
                    `).join('')}
                </div>
                
                <!-- Results Section -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <span id="results-count-display" style="font-size:14px; font-weight:600; color:rgba(255,255,255,0.8);">Showing 0 trips</span>
                </div>

                <div id="trips-results-container">
                    ${renderFilteredTrips()}
                </div>
            </div>
        </div>

        <!-- Floating Live Joiner Toast -->
        <div class="floating-joiner-toast" id="floating-joiner-toast">
            <div style="width: 24px; height: 24px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.2);">
                <img id="joiner-avatar" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&q=80" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <span id="joiner-text" style="font-size: 13px; color: #ffffff;">Amit Saxena from Mumbai just joined</span>
        </div>

        <!-- Floating WhatsApp Help Button -->
        <button class="whatsapp-chat-float" id="whatsapp-chat-float" aria-label="Chat on WhatsApp">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.42 9.863-9.864.002-2.637-1.023-5.117-2.884-6.979C16.59 1.892 14.117.87 11.48.868 6.042.868 1.623 5.286 1.618 10.728c-.001 1.705.453 3.37 1.317 4.858L1.921 21.07l5.726-1.5-.15.084zM17.9 14.8c-.29-.15-1.71-.85-1.98-.95-.26-.1-.46-.15-.65.15-.2.3-.75.95-.92 1.15-.17.19-.34.22-.63.07-1.16-.58-1.93-1.02-2.68-2.3-.2-.34.2-.32.57-1.07.06-.13.03-.25-.01-.33-.05-.08-.45-1.08-.62-1.48-.16-.4-.33-.33-.46-.34H10.15c-.2 0-.5.07-.77.37-.26.3-1.02 1-1.02 2.43 0 1.43 1.04 2.82 1.19 3 .15.19 2.05 3.13 4.96 4.39.7.3 1.23.48 1.66.62.7.22 1.34.19 1.84.12.56-.08 1.71-.7 1.95-1.37.24-.68.24-1.26.17-1.37-.07-.11-.27-.2-.56-.35z"/>
            </svg>
        </button>
    `;

    setupFilterEvents(handleFilterChange);
    setupPageControls();
    setupTripCardEvents();
    updateResultsCount();
    initJoinerNotifications();
}

function setupPageControls() {
    // Category pills click
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const catId = pill.dataset.catId;
            document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            if (catId) {
                store.set('filters.tripType', [catId]);
            } else {
                store.set('filters.tripType', []);
            }
            handleFilterChange();
        });
    });

    // Help Button
    document.getElementById('whatsapp-chat-float')?.addEventListener('click', () => {
        store.addToast('💬 Opening WhatsApp Chat with Community Support...', 'success');
    });
}

function handleFilterChange() {
    const container = document.getElementById('trips-results-container');
    if (!container) return;
    container.innerHTML = renderFilteredTrips();
    setupTripCardEvents();
    updateResultsCount();
    document.querySelectorAll('.animate-in, .animate-in-left, .animate-in-right, .animate-in-scale').forEach(el => {
        el.classList.add('visible');
    });
}

function renderFilteredTrips() {
    const filters = store.get('filters');
    const verifiedHostsSet = new Set(hosts.filter(h => h.verified).map(h => h.id));
    const publishedTrips = trips.filter(t => t.status === 'published' && verifiedHostsSet.has(t.hostId));
    let filtered = applyFilters(publishedTrips, filters, hosts);
    filtered = sortTrips(filtered, filters.sortBy);
    return renderTripGrid(filtered, hosts);
}

function updateResultsCount() {
    const display = document.getElementById('results-count-display');
    if (!display) return;
    const filters = store.get('filters');
    const verifiedHostsSet = new Set(hosts.filter(h => h.verified).map(h => h.id));
    const publishedTrips = trips.filter(t => t.status === 'published' && verifiedHostsSet.has(t.hostId));
    const filtered = applyFilters(publishedTrips, filters, hosts);
    display.textContent = `Showing ${filtered.length} trip${filtered.length !== 1 ? 's' : ''}`;
}

function initJoinerNotifications() {
    const toast = document.getElementById('floating-joiner-toast');
    const avatar = document.getElementById('joiner-avatar');
    const text = document.getElementById('joiner-text');
    if (!toast || !avatar || !text) return;

    const mockJoiners = [
        { name: 'Amit Saxena', city: 'Mumbai', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&q=80' },
        { name: 'Priya Sharma', city: 'Delhi', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&q=80' },
        { name: 'Rahul Joshi', city: 'Pune', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&q=80' },
        { name: 'Neha Gupta', city: 'Bangalore', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&q=80' }
    ];

    let index = 0;

    const showNotification = () => {
        const joiner = mockJoiners[index];
        avatar.src = joiner.avatar;
        text.innerHTML = `<strong>${joiner.name}</strong> from ${joiner.city} just joined`;
        
        toast.classList.add('show');

        // Hide after 3.5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            index = (index + 1) % mockJoiners.length;
        }, 3500);
    };

    // First trigger after 4s, then repeat every 12s
    setTimeout(() => {
        showNotification();
        joinerInterval = setInterval(showNotification, 12000);
    }, 4000);
}
