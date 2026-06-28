// ============================================
// Traveler Profile Component
// Manage traveler details and trip inquiries
// ============================================

import { store } from '../state.js';
import { trips } from '../data/trips.js';
import { hosts } from '../data/hosts.js';
import { renderTripCard, setupTripCardEvents } from '../components/trip-card.js';
import { formatPrice } from '../utils/format.js';

let activeProfileTab = 'wishlist';

export function renderProfilePage() {
    const app = document.getElementById('app');
    if (!app) return;

    if (!store.get('isLoggedIn')) {
        store.addToast('Please log in to view your profile', 'warning');
        window.location.hash = '#/login';
        return;
    }

    const user = store.get('currentUser');
    const savedTripIds = store.get('savedTrips') || [];
    const verifiedHostsSet = new Set(hosts.filter(h => h.verified).map(h => h.id));
    const wishlistTrips = trips.filter(t => savedTripIds.includes(t.id) && t.status === 'published' && verifiedHostsSet.has(t.hostId));
    const hostsMap = {};
    hosts.forEach(h => hostsMap[h.id] = h);

    const inquiries = store.get('inquiries') || [];
    const myInquiries = inquiries.filter(inq => inq.travelerId === user.id);

    app.innerHTML = `
        <div class="profile-page" style="padding-top:calc(var(--nav-height) + var(--space-6));min-height:90vh;">
            <div class="container" style="display:grid;grid-template-columns:1fr 2fr;gap:var(--space-6);align-items:start;flex-wrap:wrap">
                
                <!-- Left: Profile Info Card -->
                <aside class="profile-card glass-panel animate-in-left" style="padding:var(--space-6);text-align:center">
                    <div class="avatar avatar-lg" style="margin:0 auto var(--space-4)">
                        <img src="${user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80'}" alt="${user.name}">
                    </div>
                    
                    <h2 style="font-size:var(--text-xl);margin-bottom:2px">${user.name}</h2>
                    <p class="text-muted" style="font-size:var(--text-sm);margin-bottom:var(--space-3)">${user.city || 'India'} · Joined ${new Date(user.joinedDate || Date.now()).toLocaleDateString()}</p>
                    
                    <p style="font-size:var(--text-sm);color:var(--color-text-secondary);line-height:1.5;margin-bottom:var(--space-4)">
                        ${user.bio || 'This traveler hasn\'t added a bio yet. Set a custom traveler description to share details with prospective hosts.'}
                    </p>

                    <!-- Edit Profile Trigger -->
                    <button class="btn btn-secondary btn-sm w-full" id="edit-profile-bio-btn" style="margin-bottom:var(--space-4)">
                        <span class="material-icons-round" style="font-size:16px;margin-right:4px">edit</span> Edit Bio
                    </button>

                    <div class="profile-tags" style="display:flex;flex-wrap:wrap;justify-content:center;gap:6px">
                        ${(user.interests || ['adventure', 'backpacking']).map(tag => `
                            <span class="trip-tag" style="background:rgba(255,255,255,0.03)">#${tag}</span>
                        `).join('')}
                    </div>

                    <!-- Host/Admin Redirects -->
                    ${user.role === 'host' ? `
                        <div class="profile-card-action" style="margin-top:var(--space-6)">
                            <a href="#/dashboard" class="btn btn-primary btn-sm w-full">Go to Host Dashboard</a>
                        </div>
                    ` : ''}
                    ${user.role === 'admin' ? `
                        <div class="profile-card-action" style="margin-top:var(--space-6)">
                            <a href="#/admin" class="btn btn-primary btn-sm w-full">Go to Admin Panel</a>
                        </div>
                    ` : ''}
                </aside>

                <!-- Right: Profile Tabs (Wishlist, Booking Log) -->
                <main class="profile-content animate-in-right" style="display:flex;flex-direction:column;gap:var(--space-4)">
                    <div class="profile-tabs glass-panel" style="display:flex;gap:var(--space-4);padding:var(--space-2) var(--space-4)">
                        <button class="btn ${activeProfileTab === 'wishlist' ? 'btn-primary' : 'btn-ghost'} btn-sm" id="profile-tab-wishlist">
                            <span class="material-icons-round" style="font-size:16px;margin-right:4px">favorite</span> Wishlist (${wishlistTrips.length})
                        </button>
                        <button class="btn ${activeProfileTab === 'bookings' ? 'btn-primary' : 'btn-ghost'} btn-sm" id="profile-tab-bookings">
                            <span class="material-icons-round" style="font-size:16px;margin-right:4px">receipt</span> Booking Inquiries (${myInquiries.length})
                        </button>
                    </div>

                    <div class="profile-tab-panel glass-panel" style="padding:var(--space-6);min-height:400px">
                        ${renderActiveTabContent(activeProfileTab, wishlistTrips, myInquiries, hostsMap)}
                    </div>
                </main>

            </div>
        </div>

        <!-- Edit Profile Modal overlay -->
        <div id="profile-modal-root"></div>
    `;

    setupProfileEvents(user);
    setupTripCardEvents();
    document.querySelectorAll('.animate-in, .animate-in-left, .animate-in-right, .animate-in-scale').forEach(el => {
        el.classList.add('visible');
    });
}

function renderActiveTabContent(tab, wishlistTrips, myInquiries, hostsMap) {
    if (tab === 'wishlist') {
        if (wishlistTrips.length === 0) {
            return `
                <div style="text-align:center;padding:var(--space-12) 0;color:var(--color-text-muted)">
                    <span class="material-icons-round" style="font-size:48px;margin-bottom:var(--space-3)">favorite_border</span>
                    <h3>Your Wishlist is Empty</h3>
                    <p style="margin-top:4px">Save interesting trips to review later or share with friends.</p>
                    <a href="#/trips" class="btn btn-primary btn-sm" style="margin-top:var(--space-4)">Find Trips</a>
                </div>
            `;
        }
        return `
            <div class="trip-grid" style="grid-template-columns:repeat(auto-fit, minmax(260px, 1fr))">
                ${wishlistTrips.map(trip => renderTripCard(trip, hostsMap[trip.hostId], { compact: true })).join('')}
            </div>
        `;
    } else {
        if (myInquiries.length === 0) {
            return `
                <div style="text-align:center;padding:var(--space-12) 0;color:var(--color-text-muted)">
                    <span class="material-icons-round" style="font-size:48px;margin-bottom:var(--space-3)">receipt_long</span>
                    <h3>No bookings requested</h3>
                    <p style="margin-top:4px">Submit queries or booking requests on trip detail pages to begin.</p>
                    <a href="#/trips" class="btn btn-primary btn-sm" style="margin-top:var(--space-4)">Find Trips</a>
                </div>
            `;
        }
        return `
            <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                ${myInquiries.map(inq => `
                    <div class="inquiry-row glass-card" style="padding:var(--space-4);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-4)">
                        <div>
                            <h4 style="font-size:var(--text-md);margin-bottom:2px">${inq.tripTitle}</h4>
                            <span class="text-muted" style="font-size:var(--text-xs)">Host: ${inq.hostName} · Requested on ${new Date(inq.timestamp).toLocaleDateString()}</span>
                            <p style="margin-top:var(--space-2);font-size:var(--text-sm);color:var(--color-text-secondary);font-style:italic">"${inq.message}"</p>
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:var(--space-2)">
                            <span class="badge ${
                                inq.status === 'confirmed' ? 'badge-teal' : 
                                inq.status === 'pending' ? 'badge-amber' : 'badge-gray'
                            }" style="text-transform:capitalize">${inq.status}</span>
                            <a href="#/messages?thread=${inq.id}" class="btn btn-glass btn-sm">
                                <span class="material-icons-round" style="font-size:14px;margin-right:4px">chat</span> Open Chat
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function setupProfileEvents(user) {
    // Tab triggers
    document.getElementById('profile-tab-wishlist')?.addEventListener('click', () => {
        activeProfileTab = 'wishlist';
        renderProfilePage();
    });

    document.getElementById('profile-tab-bookings')?.addEventListener('click', () => {
        activeProfileTab = 'bookings';
        renderProfilePage();
    });

    // Bio modal trigger
    document.getElementById('edit-profile-bio-btn')?.addEventListener('click', () => {
        const root = document.getElementById('profile-modal-root');
        if (!root) return;

        root.innerHTML = `
            <div class="modal-overlay open" id="bio-modal-overlay">
                <div class="modal-panel glass-panel" style="max-width:400px;width:90%">
                    <div class="modal-header">
                        <h3>Update Profile</h3>
                        <button class="btn btn-icon btn-ghost" id="close-bio-modal-btn">
                            <span class="material-icons-round">close</span>
                        </button>
                    </div>
                    <form id="bio-update-form" style="display:flex;flex-direction:column;gap:var(--space-4);margin-top:var(--space-4)">
                        <div class="form-group">
                            <label class="form-label" for="bio-input-val">Profile Description / Bio</label>
                            <textarea class="input" id="bio-input-val" rows="4" required style="resize:vertical">${user.bio || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="tags-input-val">Interests (Comma-separated)</label>
                            <input type="text" class="input" id="tags-input-val" value="${user.interests ? user.interests.join(', ') : ''}" placeholder="e.g. trekking, food, beach">
                        </div>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </form>
                </div>
            </div>
        `;

        // Event listeners inside modal
        document.getElementById('close-bio-modal-btn')?.addEventListener('click', () => {
            root.innerHTML = '';
        });
        document.getElementById('bio-modal-overlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) root.innerHTML = '';
        });

        document.getElementById('bio-update-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const bio = document.getElementById('bio-input-val').value;
            const tagsRaw = document.getElementById('tags-input-val').value;
            const interests = tagsRaw.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);

            const updatedUser = {
                ...user,
                bio,
                interests
            };

            store.set('currentUser', updatedUser);
            store.addToast('Profile updated! ✅', 'success');
            
            root.innerHTML = '';
            renderProfilePage();
        });
    });
}
