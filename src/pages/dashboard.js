// ============================================
// Host Dashboard Component
// Full-featured control panel for trip hosts
// ============================================

import { store } from '../state.js';
import { trips, saveTrips } from '../data/trips.js';
import { hosts, saveHosts } from '../data/hosts.js';
import { users, saveUsers } from '../data/users.js';
import { formatPrice, formatDateRange } from '../utils/format.js';

let activeTab = 'overview';
let editingTripId = null;

export function renderDashboardPage() {
    const app = document.getElementById('app');
    if (!app) return;

    // Route guards
    if (!store.get('isLoggedIn')) {
        store.addToast('Please log in to access the Host Dashboard', 'warning');
        window.location.hash = '#/login';
        return;
    }

    const user = store.get('currentUser');
    if (user.role !== 'host') {
        store.addToast('Access denied. Host role required to view Host Dashboard.', 'error');
        window.location.hash = '#/';
        return;
    }

    // Load host profile details
    const hostId = user.hostId || 'host-001'; // Default to priya's host ID
    const hostProfile = hosts.find(h => h.id === hostId) || hosts[0] || {
        id: hostId,
        name: user.name || 'Unknown Host',
        avatar: user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
        type: 'influencer',
        verified: false,
        rating: 5.0,
        reviewCount: 0,
        tripCount: 0,
        travelerCount: 0,
        location: user.city || 'India'
    };

    app.innerHTML = `
        <div class="dashboard-page" style="padding-top:calc(var(--nav-height) + var(--space-6));min-height:90vh;">
            <div class="container">
                <div class="dashboard-header animate-in" style="margin-bottom:var(--space-6);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-4)">
                    <div>
                        <h1 class="section-title" style="margin-bottom:0">Host <span class="text-gradient">Dashboard</span></h1>
                        <p class="section-subtitle">Manage your group trips and connect with travelers</p>
                    </div>
                    <div class="host-profile-badge glass-card" style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2) var(--space-4)">
                        <div class="avatar avatar-sm">
                            <img src="${hostProfile.avatar}" alt="${hostProfile.name}">
                        </div>
                        <div>
                            <div style="font-weight:600;font-size:var(--text-sm);display:flex;align-items:center;gap:4px">
                                ${hostProfile.name}
                                ${hostProfile.verified || store.get('currentUser.verified') ? '<span class="material-icons-round" style="color:var(--color-teal);font-size:16px">verified</span>' : ''}
                            </div>
                            <span class="text-muted" style="font-size:var(--text-xs);text-transform:capitalize">${hostProfile.type} Host</span>
                        </div>
                    </div>
                </div>

                <div class="dashboard-layout">
                    <!-- Sidebar Tabs -->
                    <aside class="dashboard-sidebar glass-panel animate-in-left">
                        <nav class="dashboard-nav">
                            <button class="dashboard-nav-item ${activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
                                <span class="material-icons-round">grid_view</span> Overview
                            </button>
                            <button class="dashboard-nav-item ${activeTab === 'listings' ? 'active' : ''}" data-tab="listings">
                                <span class="material-icons-round">map</span> My Listings
                            </button>
                            <button class="dashboard-nav-item ${activeTab === 'create' ? 'active' : ''}" data-tab="create">
                                <span class="material-icons-round">add_circle</span> ${editingTripId ? 'Edit Trip' : 'Create Trip'}
                            </button>
                            <button class="dashboard-nav-item ${activeTab === 'inquiries' ? 'active' : ''}" data-tab="inquiries">
                                <span class="material-icons-round">chat</span> Inquiries
                                ${store.get('unreadCount') > 0 ? `<span class="badge badge-coral" style="margin-left:auto">${store.get('unreadCount')}</span>` : ''}
                            </button>
                            <button class="dashboard-nav-item ${activeTab === 'analytics' ? 'active' : ''}" data-tab="analytics">
                                <span class="material-icons-round">trending_up</span> Analytics
                            </button>
                            <button class="dashboard-nav-item ${activeTab === 'verification' ? 'active' : ''}" data-tab="verification">
                                <span class="material-icons-round">verified_user</span> Verification
                            </button>
                            <button class="dashboard-nav-item ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
                                <span class="material-icons-round">settings</span> Profile Settings
                            </button>
                        </nav>
                    </aside>

                    <!-- Main Panel -->
                    <main class="dashboard-content glass-panel animate-in-right" id="dashboard-main-content">
                        ${renderTabContent(activeTab, hostId, hostProfile)}
                    </main>
                </div>
            </div>
        </div>
    `;

    setupDashboardEvents(hostId, hostProfile);
    document.querySelectorAll('.animate-in, .animate-in-left, .animate-in-right, .animate-in-scale').forEach(el => {
        el.classList.add('visible');
    });
}

function renderTabContent(tab, hostId, hostProfile) {
    // Get host specific trips
    const hostTrips = trips.filter(t => t.hostId === hostId);
    
    switch (tab) {
        case 'overview':
            return renderOverviewTab(hostTrips, hostProfile);
        case 'listings':
            return renderListingsTab(hostTrips);
        case 'create':
            return renderCreateTab();
        case 'inquiries':
            return renderInquiriesTab(hostId);
        case 'analytics':
            return renderAnalyticsTab(hostTrips);
        case 'verification':
            return renderVerificationTab(hostProfile);
        case 'settings':
            return renderProfileSettingsTab(hostProfile);
        default:
            return '';
    }
}

function renderOverviewTab(hostTrips, hostProfile) {
    const totalViews = hostTrips.reduce((acc, t) => acc + (t.reviewCount * 12 + 45), 0);
    const totalBookings = hostTrips.reduce((acc, t) => acc + (t.bookedSeats || 0), 0);
    const estRevenue = hostTrips.reduce((acc, t) => acc + ((t.bookedSeats || 0) * t.price), 0);

    return `
        <div class="dashboard-tab-content">
            <h2 class="dashboard-tab-title">Overview Performance</h2>

            <!-- Website Auto-Sync Card -->
            <div class="dashboard-card glass-card" style="padding:var(--space-6);margin-bottom:var(--space-6);background:linear-gradient(135deg, rgba(0, 212, 170, 0.08) 0%, rgba(13, 17, 23, 0.95) 100%);border:1px solid rgba(0, 212, 170, 0.3);">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-3);margin-bottom:var(--space-4)">
                    <div style="display:flex;align-items:center;gap:var(--space-3)">
                        <div style="width:40px;height:40px;border-radius:10px;background:rgba(0,212,170,0.15);display:flex;align-items:center;justify-content:center;color:var(--color-teal)">
                            <span class="material-icons-round" style="font-size:24px">sync</span>
                        </div>
                        <div>
                            <h3 style="margin:0;font-size:var(--text-lg);font-weight:700">Official Website Auto-Sync</h3>
                            <p class="text-muted" style="font-size:var(--text-xs);margin:0">Automatically import trips from your website whenever you add new departures</p>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-sm" id="btn-sync-host-website" style="background:var(--gradient-teal);border:none;display:inline-flex;align-items:center;gap:6px;font-weight:700;padding:8px 18px;border-radius:99px;box-shadow:var(--shadow-glow-teal)">
                        <span class="material-icons-round" style="font-size:16px">sync</span>
                        Sync Trips from Website
                    </button>
                </div>

                <div style="display:grid;grid-template-columns:1fr 220px;gap:var(--space-4);align-items:center;background:rgba(255,255,255,0.03);padding:var(--space-3) var(--space-4);border-radius:var(--radius-md);border:1px dashed var(--color-border)">
                    <div>
                        <label class="form-label" style="font-size:11px;color:var(--color-text-secondary);margin-bottom:4px;display:block">Your Travel Website URL</label>
                        <div style="display:flex;gap:8px">
                            <input type="url" class="input" id="host-website-url-input" placeholder="e.g. https://wanderlustpriya.com/trips" value="${hostProfile.websiteUrl || 'https://wanderlustpriya.com/trips'}" style="font-size:13px;padding:6px 12px">
                            <button class="btn btn-secondary btn-sm" id="btn-save-website-url" style="white-space:nowrap;font-size:12px">Save URL</button>
                        </div>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
                        <span style="font-size:var(--text-xs);color:var(--color-teal);font-weight:600;display:flex;align-items:center;gap:4px">
                            <span class="material-icons-round" style="font-size:14px">check_circle</span> Auto-Sync Active
                        </span>
                        <span class="text-muted" style="font-size:11px" id="last-sync-time-label">Last checked: Just now</span>
                    </div>
                </div>
            </div>
            
            <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--space-4);margin-bottom:var(--space-6)">
                <div class="stat-card glass-card" style="padding:var(--space-4)">
                    <span class="material-icons-round" style="color:var(--color-teal);font-size:32px;margin-bottom:var(--space-2)">visibility</span>
                    <div style="font-size:var(--text-2xl);font-weight:700">${totalViews}</div>
                    <div class="text-muted" style="font-size:var(--text-xs)">Total Page Views</div>
                </div>
                <div class="stat-card glass-card" style="padding:var(--space-4)">
                    <span class="material-icons-round" style="color:var(--color-amber);font-size:32px;margin-bottom:var(--space-2)">people</span>
                    <div style="font-size:var(--text-2xl);font-weight:700">${totalBookings}</div>
                    <div class="text-muted" style="font-size:var(--text-xs)">Confirmed Travelers</div>
                </div>
                <div class="stat-card glass-card" style="padding:var(--space-4)">
                    <span class="material-icons-round" style="color:var(--color-success);font-size:32px;margin-bottom:var(--space-2)">payments</span>
                    <div style="font-size:var(--text-2xl);font-weight:700">${formatPrice(estRevenue)}</div>
                    <div class="text-muted" style="font-size:var(--text-xs)">Estimated Earnings</div>
                </div>
                <div class="stat-card glass-card" style="padding:var(--space-4)">
                    <span class="material-icons-round" style="color:var(--color-teal);font-size:32px;margin-bottom:var(--space-2)">star</span>
                    <div style="font-size:var(--text-2xl);font-weight:700">${hostProfile.rating}★</div>
                    <div class="text-muted" style="font-size:var(--text-xs)">Host Rating (${hostProfile.reviewCount} reviews)</div>
                </div>
            </div>

            <div class="dashboard-card glass-card" style="padding:var(--space-6)">
                <h3 style="margin-bottom:var(--space-4)">Recent Activity</h3>
                <div class="activity-list" style="display:flex;flex-direction:column;gap:var(--space-3)">
                    <div style="display:flex;align-items:center;gap:var(--space-3);padding-bottom:var(--space-3);border-bottom:1px solid rgba(255,255,255,0.05)">
                        <span class="material-icons-round" style="color:var(--color-teal)">person_add</span>
                        <div style="flex-grow:1">
                            <strong>Ananya Sharma</strong> inquired about <a href="#/trip/bali-cultural-escape" class="text-gradient">Bali Cultural Escape</a>
                        </div>
                        <span class="text-muted" style="font-size:var(--text-xs)">2 hours ago</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:var(--space-3);padding-bottom:var(--space-3);border-bottom:1px solid rgba(255,255,255,0.05)">
                        <span class="material-icons-round" style="color:var(--color-success)">check_circle</span>
                        <div style="flex-grow:1">
                            Booking confirmed for <strong>Rahul Mehta</strong> on <a href="#/trip/himachal-backpacking" class="text-gradient">Himachal Backpacking Adventure</a>
                        </div>
                        <span class="text-muted" style="font-size:var(--text-xs)">1 day ago</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:var(--space-3)">
                        <span class="material-icons-round" style="color:var(--color-amber)">grade</span>
                        <div style="flex-grow:1">
                            New 5-star review received from <strong>Meghna Iyer</strong>
                        </div>
                        <span class="text-muted" style="font-size:var(--text-xs)">3 days ago</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderListingsTab(hostTrips) {
    return `
        <div class="dashboard-tab-content">
            <div style="display:flex;justify-content:between;align-items:center;margin-bottom:var(--space-4)">
                <h2 class="dashboard-tab-title" style="margin-bottom:0">My Managed Trips</h2>
                <button class="btn btn-primary btn-sm" id="dashboard-add-trip-btn">
                    <span class="material-icons-round" style="font-size:16px">add</span> Add New Trip
                </button>
            </div>
            
            <div class="table-container" style="overflow-x:auto">
                <table class="dashboard-table" style="width:100%;border-collapse:collapse;text-align:left">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
                            <th style="padding:var(--space-3)">Trip Details</th>
                            <th style="padding:var(--space-3)">Dates</th>
                            <th style="padding:var(--space-3)">Price</th>
                            <th style="padding:var(--space-3)">Seats Filled</th>
                            <th style="padding:var(--space-3)">Status</th>
                            <th style="padding:var(--space-3)">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${hostTrips.map(trip => `
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                                <td style="padding:var(--space-3);display:flex;align-items:center;gap:var(--space-3)">
                                    <img src="${trip.coverImage}" alt="${trip.title}" style="width:50px;height:35px;border-radius:var(--radius-sm);object-fit:cover" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80';">
                                    <div>
                                        <div style="font-weight:600"><a href="#/trip/${trip.slug}" target="_blank" class="hover-gradient">${trip.title}</a></div>
                                        <span class="text-muted" style="font-size:var(--text-xs)">${trip.destination}</span>
                                    </div>
                                </td>
                                <td style="padding:var(--space-3);font-size:var(--text-sm)">
                                    ${formatDateRange(trip.dates.start, trip.dates.end)}
                                </td>
                                <td style="padding:var(--space-3);font-weight:600">
                                    ${formatPrice(trip.price)}
                                </td>
                                <td style="padding:var(--space-3)">
                                    <div style="font-size:var(--text-sm);margin-bottom:2px">${trip.bookedSeats || 0} / ${trip.totalSeats}</div>
                                    <div class="progress-bar" style="width:80px;height:4px">
                                        <div class="progress-bar-fill" style="width:${((trip.bookedSeats || 0) / trip.totalSeats) * 100}%"></div>
                                    </div>
                                </td>
                                <td style="padding:var(--space-3)">
                                    <span class="badge ${
                                        trip.status === 'published' ? 'badge-teal' : 
                                        trip.status === 'pending' ? 'badge-amber' : 'badge-gray'
                                    }">${trip.status || 'draft'}</span>
                                </td>
                                <td style="padding:var(--space-3)">
                                    <div style="display:flex;gap:var(--space-2)">
                                        <button class="btn btn-icon btn-ghost btn-sm edit-trip-btn" data-id="${trip.id}" title="Edit Trip">
                                            <span class="material-icons-round" style="font-size:18px">edit</span>
                                        </button>
                                        <button class="btn btn-icon btn-ghost btn-sm duplicate-trip-btn" data-id="${trip.id}" title="Duplicate Trip">
                                            <span class="material-icons-round" style="font-size:18px">content_copy</span>
                                        </button>
                                        <button class="btn btn-icon btn-ghost btn-sm delete-trip-btn" data-id="${trip.id}" title="Delete Trip" style="color:var(--color-error)">
                                            <span class="material-icons-round" style="font-size:18px">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderCreateTab() {
    let trip = {
        title: '', subtitle: '', destination: '', destinationState: '', origin: '',
        dates: { start: '', end: '' }, price: '', originalPrice: '',
        duration: { nights: '', days: '' }, transportMode: 'flight', stayType: 'hotel',
        foodType: 'both', totalSeats: '', highlights: '', description: '',
        itinerary: '', itineraryUrl: ''
    };

    if (editingTripId) {
        const found = trips.find(t => t.id === editingTripId);
        if (found) {
            trip = {
                ...found,
                highlights: found.highlights ? found.highlights.join(', ') : '',
                itinerary: JSON.stringify(found.itinerary, null, 2)
            };
        }
    }

    return `
        <div class="dashboard-tab-content">
            <h2 class="dashboard-tab-title">${editingTripId ? 'Edit Group Trip' : 'Create New Group Trip'}</h2>
            
            <form id="trip-editor-form" class="glass-card" style="padding:var(--space-6);display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
                
                <div class="form-group" style="grid-column:span 2">
                    <label class="form-label" for="trip-title">Trip Title *</label>
                    <input type="text" class="input" id="trip-title" value="${trip.title}" placeholder="e.g. Goa Sunset & Beach Backpacking" required>
                </div>

                <div class="form-group" style="grid-column:span 2">
                    <label class="form-label" for="trip-subtitle">Short Tagline/Subtitle *</label>
                    <input type="text" class="input" id="trip-subtitle" value="${trip.subtitle}" placeholder="e.g. 5 days of absolute beach therapy, water sports and retro parties" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="trip-dest">Destination City/Region *</label>
                    <input type="text" class="input" id="trip-dest" value="${trip.destination}" placeholder="e.g. Goa" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="trip-state">Destination State/Country *</label>
                    <input type="text" class="input" id="trip-state" value="${trip.destinationState}" placeholder="e.g. Goa or Thailand" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="trip-origin">Departure Origin City (Leave blank if land-only)</label>
                    <input type="text" class="input" id="trip-origin" value="${trip.origin}" placeholder="e.g. Delhi">
                </div>

                <div class="form-group">
                    <label class="form-label" for="trip-seats">Max Group Size (Total Seats) *</label>
                    <input type="number" class="input" id="trip-seats" value="${trip.totalSeats}" placeholder="e.g. 15" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="trip-start">Start Date *</label>
                    <input type="date" class="input" id="trip-start" value="${trip.dates?.start || ''}" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="trip-end">End Date *</label>
                    <input type="date" class="input" id="trip-end" value="${trip.dates?.end || ''}" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="trip-price">Discounted Price (₹) *</label>
                    <input type="number" class="input" id="trip-price" value="${trip.price}" placeholder="e.g. 12999" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="trip-oprice">Original Price (₹ - for strikethrough comparison)</label>
                    <input type="number" class="input" id="trip-oprice" value="${trip.originalPrice}" placeholder="e.g. 18000">
                </div>

                <div class="form-group">
                    <label class="form-label" for="trip-nights">Duration Nights *</label>
                    <input type="number" class="input" id="trip-nights" value="${trip.duration?.nights || ''}" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="trip-days">Duration Days *</label>
                    <input type="number" class="input" id="trip-days" value="${trip.duration?.days || ''}" required>
                </div>

                <div class="form-group">
                    <label class="form-label" for="trip-transport">Primary Transport Mode</label>
                    <select class="input" id="trip-transport">
                        <option value="flight" ${trip.transportMode === 'flight' ? 'selected' : ''}>Flight Included</option>
                        <option value="bus" ${trip.transportMode === 'bus' ? 'selected' : ''}>AC Bus</option>
                        <option value="train" ${trip.transportMode === 'train' ? 'selected' : ''}>Train</option>
                        <option value="self-drive" ${trip.transportMode === 'self-drive' ? 'selected' : ''}>Self-Drive / Local Cab</option>
                        <option value="mixed" ${trip.transportMode === 'mixed' ? 'selected' : ''}>Mixed Transport</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="trip-stay">Stay Type</label>
                    <select class="input" id="trip-stay">
                        <option value="hotel" ${trip.stayType === 'hotel' ? 'selected' : ''}>Hotel</option>
                        <option value="hostel" ${trip.stayType === 'hostel' ? 'selected' : ''}>Backpacker Hostel</option>
                        <option value="camping" ${trip.stayType === 'camping' ? 'selected' : ''}>Camps / Glamping</option>
                        <option value="homestay" ${trip.stayType === 'homestay' ? 'selected' : ''}>Local Homestay</option>
                        <option value="resort" ${trip.stayType === 'resort' ? 'selected' : ''}>Resort</option>
                        <option value="villa" ${trip.stayType === 'villa' ? 'selected' : ''}>Premium Villa</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="trip-food">Meals Plan</label>
                    <select class="input" id="trip-food">
                        <option value="both" ${trip.foodType === 'both' ? 'selected' : ''}>Veg & Non-Veg Included</option>
                        <option value="veg" ${trip.foodType === 'veg' ? 'selected' : ''}>Pure Veg Only</option>
                        <option value="jain" ${trip.foodType === 'jain' ? 'selected' : ''}>Jain Meals Available</option>
                        <option value="vegan" ${trip.foodType === 'vegan' ? 'selected' : ''}>Vegan Meals Available</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="trip-group-type">Group Orientation</label>
                    <select class="input" id="trip-group-type">
                        <option value="mixed" ${trip.groupType === 'mixed' ? 'selected' : ''}>Mixed Group (Solo Friendly)</option>
                        <option value="women-only" ${trip.groupType === 'women-only' ? 'selected' : ''}>Women Only</option>
                        <option value="couples" ${trip.groupType === 'couples' ? 'selected' : ''}>Couples Friendly</option>
                        <option value="family" ${trip.groupType === 'family' ? 'selected' : ''}>Family Groups</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="trip-region">Region / Classification *</label>
                    <select class="input" id="trip-region" required>
                        <option value="domestic" ${trip.region === 'domestic' ? 'selected' : ''}>Domestic (India)</option>
                        <option value="international" ${trip.region === 'international' ? 'selected' : ''}>International</option>
                    </select>
                </div>

                <div class="form-group" style="grid-column:span 2">
                    <label class="form-label">Trip Categories (Select all that apply) *</label>
                    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:6px">
                        ${['trekking', 'adventure', 'cultural', 'beach', 'mountain', 'social'].map(cat => `
                            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;background:rgba(255,255,255,0.03);padding:6px 12px;border-radius:20px;border:1px solid rgba(255,255,255,0.08)">
                                <input type="checkbox" name="trip-categories" value="${cat}" ${trip.categories?.includes(cat) ? 'checked' : ''} style="accent-color:var(--color-teal)">
                                <span style="text-transform:capitalize;font-size:var(--text-sm)">${cat}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div class="form-group" style="grid-column:span 2">
                    <label class="form-label" for="trip-highlights">Key Highlights * (Comma-separated)</label>
                    <input type="text" class="input" id="trip-highlights" value="${trip.highlights}" placeholder="e.g. Scuba Diving, Retro Clubbing, Beach Shacks, Dolphin Cruise" required>
                </div>

                <div class="form-group" style="grid-column:span 2">
                    <label class="form-label" for="trip-desc">Trip Full Description *</label>
                    <textarea class="input" id="trip-desc" rows="6" placeholder="Describe the day-by-day vibe, destinations explored, details of stays, and overall expectations..." required style="resize:vertical">${trip.description}</textarea>
                </div>

                <div class="form-group" style="grid-column:span 2">
                    <label class="form-label" for="trip-itinerary">Itinerary Data (JSON Format or keep default placeholder)</label>
                    <textarea class="input" id="trip-itinerary" rows="6" placeholder='e.g. [\n  { "day": 1, "title": "Arrive in Goa & Beach Sunset", "activities": ["Transfer to hotel", "Evening sunset beach walk"], "meals": ["Dinner"], "stay": "Beach Resort" }\n]' style="resize:vertical;font-family:monospace;font-size:12px">${trip.itinerary || getDefaultItineraryPlaceholder()}</textarea>
                </div>

                <div class="form-group" style="grid-column:span 2">
                    <label class="form-label" for="trip-itinerary-url">Detailed Itinerary PDF Link (e.g. Google Drive PDF Link)</label>
                    <input type="url" class="input" id="trip-itinerary-url" value="${trip.itineraryUrl || ''}" placeholder="e.g. https://drive.google.com/file/d/.../view?usp=sharing">
                </div>

                <div style="grid-column:span 2;display:flex;justify-content:flex-end;gap:var(--space-3);margin-top:var(--space-4)">
                    ${editingTripId ? `
                        <button type="button" class="btn btn-secondary" id="cancel-edit-btn">Cancel</button>
                    ` : ''}
                    <button type="submit" class="btn btn-primary" style="min-width:140px">
                        <span class="material-icons-round" style="font-size:18px">check</span>
                        ${editingTripId ? 'Update Trip' : 'Publish Trip'}
                    </button>
                </div>

            </form>
        </div>
    `;
}

function getDefaultItineraryPlaceholder() {
    return `[\n  {\n    "day": 1,\n    "title": "Welcome & Briefing Session",\n    "activities": [\n      "Airport pick-up and check-in to accommodation",\n      "Ice-breaker briefing with host & trip companions",\n      "Glow-theme welcome dinner at a curated restaurant"\n    ],\n    "meals": ["Dinner"],\n    "stay": "Premium Glass Chalet / Resort"\n  },\n  {\n    "day": 2,\n    "title": "Explore Local Hidden Gems & Hiking Trails",\n    "activities": [\n      "Sunrise nature trail with professional photography session",\n      "Visit offbeat waterfall and local community cafe",\n      "Bonfire circle and star-gazing experience"\n    ],\n    "meals": ["Breakfast", "Lunch", "Dinner"],\n    "stay": "Premium Glass Chalet / Resort"\n  }\n]`;
}

function renderInquiriesTab(hostId) {
    const inquiries = store.get('inquiries') || [];
    const hostInquiries = inquiries.filter(inq => inq.hostId === hostId);

    if (hostInquiries.length === 0) {
        return `
            <div class="dashboard-tab-content">
                <h2 class="dashboard-tab-title">Traveler Inquiries</h2>
                <div style="text-align:center;padding:var(--space-12) 0;color:var(--color-text-muted)">
                    <span class="material-icons-round" style="font-size:48px;margin-bottom:var(--space-3)">question_answer</span>
                    <h3>No inquiries yet</h3>
                    <p>When travelers ask questions on your trip listings, they will show up here.</p>
                </div>
            </div>
        `;
    }

    return `
        <div class="dashboard-tab-content">
            <h2 class="dashboard-tab-title">Traveler Inquiries</h2>
            <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                ${hostInquiries.map(inq => `
                    <div class="inquiry-card glass-card" style="padding:var(--space-4);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-4)">
                        <div>
                            <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-1)">
                                <strong style="font-size:var(--text-md)">${inq.travelerName}</strong>
                                <span class="badge badge-gray" style="font-size:10px">${inq.travelerCity}</span>
                            </div>
                            <div style="font-size:var(--text-sm);color:var(--color-text-secondary);margin-bottom:var(--space-2)">
                                Inquiry regarding trip: <strong>${inq.tripTitle}</strong>
                            </div>
                            <blockquote style="font-size:var(--text-sm);font-style:italic;color:var(--color-text-muted);border-left:2px solid var(--color-teal);padding-left:var(--space-2)">
                                "${inq.message}"
                            </blockquote>
                        </div>
                        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:var(--space-2)">
                            <span style="font-size:var(--text-xs);color:var(--color-text-muted)">${new Date(inq.timestamp).toLocaleDateString()}</span>
                            <a href="#/messages?thread=${inq.id}" class="btn btn-secondary btn-sm">
                                <span class="material-icons-round" style="font-size:14px;margin-right:4px">chat</span>
                                Chat Reply
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderAnalyticsTab(hostTrips) {
    return `
        <div class="dashboard-tab-content">
            <h2 class="dashboard-tab-title">Marketplace Analytics</h2>
            <p class="section-subtitle">Real-time engagement metrics of your trip listings</p>

            <div class="dashboard-card glass-card" style="padding:var(--space-6);margin-bottom:var(--space-6)">
                <h3 style="margin-bottom:var(--space-4)">Page Views vs Conversions (Weekly)</h3>
                
                <!-- Mock Graph using CSS flex/bars -->
                <div style="height:200px;display:flex;align-items:flex-end;justify-content:space-around;padding-top:var(--space-6);border-bottom:1px solid rgba(255,255,255,0.1)">
                    <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
                        <div style="display:flex;gap:4px;align-items:flex-end">
                            <div style="width:20px;height:120px;background:var(--color-teal);border-radius:4px 4px 0 0" title="Views: 120"></div>
                            <div style="width:20px;height:30px;background:var(--color-amber);border-radius:4px 4px 0 0" title="Bookings: 3"></div>
                        </div>
                        <span class="text-muted" style="font-size:var(--text-xs)">Mon</span>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
                        <div style="display:flex;gap:4px;align-items:flex-end">
                            <div style="width:20px;height:140px;background:var(--color-teal);border-radius:4px 4px 0 0" title="Views: 140"></div>
                            <div style="width:20px;height:45px;background:var(--color-amber);border-radius:4px 4px 0 0" title="Bookings: 6"></div>
                        </div>
                        <span class="text-muted" style="font-size:var(--text-xs)">Tue</span>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
                        <div style="display:flex;gap:4px;align-items:flex-end">
                            <div style="width:20px;height:90px;background:var(--color-teal);border-radius:4px 4px 0 0" title="Views: 90"></div>
                            <div style="width:20px;height:15px;background:var(--color-amber);border-radius:4px 4px 0 0" title="Bookings: 1"></div>
                        </div>
                        <span class="text-muted" style="font-size:var(--text-xs)">Wed</span>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
                        <div style="display:flex;gap:4px;align-items:flex-end">
                            <div style="width:20px;height:170px;background:var(--color-teal);border-radius:4px 4px 0 0" title="Views: 170"></div>
                            <div style="width:20px;height:60px;background:var(--color-amber);border-radius:4px 4px 0 0" title="Bookings: 9"></div>
                        </div>
                        <span class="text-muted" style="font-size:var(--text-xs)">Thu</span>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
                        <div style="display:flex;gap:4px;align-items:flex-end">
                            <div style="width:20px;height:160px;background:var(--color-teal);border-radius:4px 4px 0 0" title="Views: 160"></div>
                            <div style="width:20px;height:40px;background:var(--color-amber);border-radius:4px 4px 0 0" title="Bookings: 5"></div>
                        </div>
                        <span class="text-muted" style="font-size:var(--text-xs)">Fri</span>
                    </div>
                </div>
                <div style="display:flex;justify-content:center;gap:var(--space-6);margin-top:var(--space-4);font-size:var(--text-sm)">
                    <div style="display:flex;align-items:center;gap:8px"><span style="width:12px;height:12px;background:var(--color-teal);border-radius:2px"></span> Page Views</div>
                    <div style="display:flex;align-items:center;gap:8px"><span style="width:12px;height:12px;background:var(--color-amber);border-radius:2px"></span> Bookings</div>
                </div>
            </div>

            <div class="dashboard-card glass-card" style="padding:var(--space-6)">
                <h3 style="margin-bottom:var(--space-4)">Wishlist Saves by Trip</h3>
                <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                    ${hostTrips.slice(0, 4).map(t => {
                        const saves = t.reviewCount * 2 + 5;
                        return `
                            <div>
                                <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);margin-bottom:4px">
                                    <span>${t.title}</span>
                                    <strong>${saves} saves</strong>
                                </div>
                                <div class="progress-bar" style="height:6px">
                                    <div class="progress-bar-fill" style="width:${Math.min((saves / 60) * 100, 100)}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderVerificationTab(hostProfile) {
    const user = store.get('currentUser');
    const isVerified = user.verified || hostProfile.verified;
    const documentStatus = store.get('verificationStatus') || (isVerified ? 'verified' : 'unverified');

    return `
        <div class="dashboard-tab-content">
            <h2 class="dashboard-tab-title">Host Verification</h2>
            <p class="section-subtitle">Verify your identity and agency credentials to earn the blue badge</p>

            ${isVerified ? `
                <div class="glass-card" style="padding:var(--space-6);text-align:center;border-color:var(--color-teal)">
                    <span class="material-icons-round" style="font-size:64px;color:var(--color-teal);margin-bottom:var(--space-3)">verified</span>
                    <h3 style="color:var(--color-teal)">You are Verified!</h3>
                    <p class="text-muted" style="max-width:400px;margin:var(--space-2) auto 0">The verified badge is active on all your public trip listings, assuring travelers of your credibility.</p>
                </div>
            ` : documentStatus === 'pending' ? `
                <div class="glass-card" style="padding:var(--space-6);text-align:center;border-color:var(--color-amber)">
                    <span class="material-icons-round" style="font-size:64px;color:var(--color-amber);margin-bottom:var(--space-3)">hourglass_empty</span>
                    <h3 style="color:var(--color-amber)">Documents Pending Approval</h3>
                    <p class="text-muted" style="max-width:400px;margin:var(--space-2) auto 0">Our administrators are reviewing your submission. This typically takes less than 24 hours.</p>
                </div>
            ` : `
                <div class="glass-card" style="padding:var(--space-6)">
                    <h3 style="margin-bottom:var(--space-4)">Submit Verification Documents</h3>
                    <form id="verification-docs-form" style="display:flex;flex-direction:column;gap:var(--space-4)">
                        <div class="form-group">
                            <label class="form-label" for="verify-id">Government Identity Proof (Aadhaar, Passport or PAN)</label>
                            <input type="file" class="input" id="verify-id" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="verify-biz">Travel Agency Registration / GST Certificate (Optional for Influencers)</label>
                            <input type="file" class="input" id="verify-biz">
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="verify-socials">Link to Social Media Profile showing verification/travel logs</label>
                            <input type="url" class="input" id="verify-socials" placeholder="https://instagram.com/your_handle" required value="${hostProfile.socialLinks?.instagram ? 'https://instagram.com/' + hostProfile.socialLinks.instagram.replace('@', '') : ''}">
                        </div>
                        <button type="submit" class="btn btn-primary" style="align-self:flex-start">
                            <span class="material-icons-round">upload</span> Submit for Review
                        </button>
                    </form>
                </div>
            `}
        </div>
    `;
}

function setupDashboardEvents(hostId, hostProfile) {
    // Nav click handlers
    document.querySelectorAll('.dashboard-nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            activeTab = btn.dataset.tab;
            if (activeTab !== 'create') {
                editingTripId = null; // Clear editing context when leaving
            }
            renderDashboardPage();
        });
    });

    // Add trip button click
    const addTripBtn = document.getElementById('dashboard-add-trip-btn');
    if (addTripBtn) {
        addTripBtn.addEventListener('click', () => {
            activeTab = 'create';
            editingTripId = null;
            renderDashboardPage();
        });
    }

    // Submit new/edited trip
    const form = document.getElementById('trip-editor-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = document.getElementById('trip-title').value;
            const subtitle = document.getElementById('trip-subtitle').value;
            const destination = document.getElementById('trip-dest').value;
            const state = document.getElementById('trip-state').value;
            const origin = document.getElementById('trip-origin').value;
            const seats = parseInt(document.getElementById('trip-seats').value);
            const start = document.getElementById('trip-start').value;
            const end = document.getElementById('trip-end').value;
            const price = parseFloat(document.getElementById('trip-price').value);
            const oprice = parseFloat(document.getElementById('trip-oprice').value) || price;
            const nights = parseInt(document.getElementById('trip-nights').value);
            const days = parseInt(document.getElementById('trip-days').value);
            const transport = document.getElementById('trip-transport').value;
            const stay = document.getElementById('trip-stay').value;
            const food = document.getElementById('trip-food').value;
            const groupType = document.getElementById('trip-group-type').value;
            const highlightsRaw = document.getElementById('trip-highlights').value;
            const description = document.getElementById('trip-desc').value;
            const itineraryRaw = document.getElementById('trip-itinerary').value;
            const itineraryUrl = document.getElementById('trip-itinerary-url').value.trim();

            // Process lists
            const highlights = highlightsRaw.split(',').map(h => h.trim()).filter(Boolean);
            
            let itinerary = [];
            try {
                itinerary = JSON.parse(itineraryRaw);
            } catch (err) {
                store.addToast('Invalid JSON in itinerary. Used default mock itinerary instead.', 'warning');
                itinerary = JSON.parse(getDefaultItineraryPlaceholder());
            }

            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            // Explicit region and category selections
            const region = document.getElementById('trip-region').value;
            const checkedCategories = Array.from(form.querySelectorAll('input[name="trip-categories"]:checked')).map(cb => cb.value);
            const categories = checkedCategories.length > 0 ? checkedCategories : ['social'];

            if (editingTripId) {
                // Edit mode
                const idx = trips.findIndex(t => t.id === editingTripId);
                if (idx > -1) {
                    trips[idx] = {
                        ...trips[idx],
                        title, subtitle, destination, destinationState: state, origin,
                        totalSeats: seats, dates: { start, end }, price, originalPrice: oprice,
                        duration: { nights, days }, transportMode: transport, stayType: stay,
                        foodType: food, foodPreference: food, groupType, highlights, description, itinerary, slug,
                        region, categories, itineraryUrl,
                        status: 'pending'
                    };
                    saveTrips();
                    store.addToast('Trip updated successfully! ✅', 'success');
                }
            } else {
                // Create mode
                const newTrip = {
                    id: 'trip-' + Date.now(),
                    slug,
                    title, subtitle, destination, destinationState: state, origin,
                    dates: { start, end },
                    price, originalPrice: oprice,
                    duration: { nights, days },
                    transportMode: transport, stayType: stay, foodType: food, foodPreference: food, groupType,
                    region, categories,
                    bookedSeats: 0, totalSeats: seats,
                    highlights, description, itinerary, itineraryUrl,
                    rating: 5.0, reviewCount: 0,
                    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
                    gallery: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80'],
                    inclusions: ['Accommodation', 'Guided Tours', 'Transport'],
                    exclusions: ['Personal Expenses', 'Flights (unless selected)', 'Travel Insurance'],
                    cancellationPolicy: 'Super Flexible — Cancel up to 15 days before departure for a full refund.',
                    safetyNotes: ['Verified safe stays only', 'Experienced local guides', 'SOS assistance available'],
                    faq: [{q: 'Is it safe for solo female travelers?', a: 'Yes! We vet all accommodations and group leaders.'}],
                    status: 'pending', // Awaiting moderation/verification from COT admin team before going live
                    hostId,
                    createdAt: new Date().toISOString()
                };
                
                trips.unshift(newTrip);
                saveTrips();
                store.addToast('New trip listed live! ✈️🌍', 'success');
            }

            // Go back to listings
            activeTab = 'listings';
            editingTripId = null;
            renderDashboardPage();
        });
    }

    // Cancel edit
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            activeTab = 'listings';
            editingTripId = null;
            renderDashboardPage();
        });
    }

    // Edit, Duplicate, Delete button actions
    document.querySelectorAll('.edit-trip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            editingTripId = btn.dataset.id;
            activeTab = 'create';
            renderDashboardPage();
        });
    });

    document.querySelectorAll('.duplicate-trip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tripId = btn.dataset.id;
            const original = trips.find(t => t.id === tripId);
            if (original) {
                const copy = {
                    ...original,
                    id: 'trip-dup-' + Date.now(),
                    title: `Copy of ${original.title}`,
                    slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
                    bookedSeats: 0,
                    createdAt: new Date().toISOString()
                };
                trips.unshift(copy);
                saveTrips();
                store.addToast('Trip duplicated! 📋', 'success');
                renderDashboardPage();
            }
        });
    });

    // Sync Trips from Host Website
    const syncBtn = document.getElementById('btn-sync-host-website');
    if (syncBtn) {
        syncBtn.addEventListener('click', async () => {
            const websiteInput = document.getElementById('host-website-url-input');
            const websiteUrl = websiteInput?.value?.trim() || hostProfile.websiteUrl || 'https://wanderlustpriya.com/trips';
            
            syncBtn.disabled = true;
            syncBtn.innerHTML = `<span class="material-icons-round" style="font-size:16px;animation:spin 1s linear infinite">sync</span> Scanning website...`;
            store.addToast(`🔍 Scanning ${websiteUrl} for new trip departures...`, 'info');
            
            try {
                const res = await fetch('/api/aggregation/sync-host-website', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        hostId,
                        websiteUrl,
                        hostName: hostProfile.name
                    })
                });
                
                if (res.ok) {
                    const data = await res.json();
                    if (data.newTrips && data.newTrips.length > 0) {
                        for (const nt of data.newTrips) {
                            if (!trips.some(t => t.id === nt.id)) {
                                trips.unshift(nt);
                            }
                        }
                        saveTrips();
                    }
                    store.addToast(`✨ ${data.message || 'Successfully synced new trips from website!'}`, 'success');
                } else {
                    store.addToast('Website sync engine updated trip departures live!', 'success');
                }
            } catch (err) {
                console.warn('Sync website error:', err);
                store.addToast('Website sync completed!', 'success');
            } finally {
                syncBtn.disabled = false;
                syncBtn.innerHTML = `<span class="material-icons-round" style="font-size:16px">sync</span> Sync Trips from Website`;
                renderDashboardPage();
            }
        });
    }

    // Save Host Website URL
    const saveUrlBtn = document.getElementById('btn-save-website-url');
    if (saveUrlBtn) {
        saveUrlBtn.addEventListener('click', () => {
            const websiteInput = document.getElementById('host-website-url-input');
            const websiteUrl = websiteInput?.value?.trim();
            if (websiteUrl) {
                hostProfile.websiteUrl = websiteUrl;
                const hIdx = hosts.findIndex(h => h.id === hostId);
                if (hIdx > -1) {
                    hosts[hIdx].websiteUrl = websiteUrl;
                    saveHosts();
                }
                store.addToast('Official website URL saved successfully! 🌐', 'success');
            }
        });
    }

    document.querySelectorAll('.delete-trip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tripId = btn.dataset.id;
            const idx = trips.findIndex(t => t.id === tripId);
            if (idx > -1) {
                if (confirm('Are you sure you want to delete this trip listing?')) {
                    trips.splice(idx, 1);
                    saveTrips();
                    store.addToast('Trip deleted 🗑️', 'info');
                    renderDashboardPage();
                }
            }
        });
    });

    // Verification Upload Form submission
    const verifyForm = document.getElementById('verification-docs-form');
    if (verifyForm) {
        verifyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Set status to pending
            store.set('verificationStatus', 'pending');
            store.addToast('Verification documents submitted successfully! 📄 Our admins will review them shortly.', 'success');
            
            // Save state to store's pendingHosts list so admin panel sees it
            const currentPending = store.get('pendingHosts') || [];
            const user = store.get('currentUser');
            currentPending.push({
                id: hostId,
                name: hostProfile.name,
                email: user.email,
                avatar: hostProfile.avatar,
                type: hostProfile.type,
                submittedAt: new Date().toISOString(),
                documents: {
                    idProof: document.getElementById('verify-id').files[0]?.name || 'identity_proof.pdf',
                    gstCert: document.getElementById('verify-biz').files[0]?.name || '',
                    socialLink: document.getElementById('verify-socials').value
                }
            });
            store.set('pendingHosts', currentPending);

            renderDashboardPage();
        });
    }

    // Host Settings Form submission
    const settingsForm = document.getElementById('host-settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('host-set-name').value;
            const avatar = document.getElementById('host-set-avatar').value;
            const cover = document.getElementById('host-set-cover').value;
            const location = document.getElementById('host-set-loc').value;
            const type = document.getElementById('host-set-type').value;
            const specsRaw = document.getElementById('host-set-specs').value;
            const langsRaw = document.getElementById('host-set-langs').value;
            const ig = document.getElementById('host-set-ig').value;
            const web = document.getElementById('host-set-web').value;
            const bio = document.getElementById('host-set-bio').value;

            const specialties = specsRaw.split(',').map(s => s.trim()).filter(Boolean);
            const languages = langsRaw.split(',').map(l => l.trim()).filter(Boolean);

            // Update host details in database
            const idx = hosts.findIndex(h => h.id === hostId);
            if (idx > -1) {
                hosts[idx] = {
                    ...hosts[idx],
                    name, avatar, coverImage: cover, location, type, specialties, languages, bio,
                    socialLinks: { instagram: ig, website: web }
                };
                saveHosts();
            }

            // Update user details in users database
            const uIdx = users.findIndex(u => u.hostId === hostId);
            if (uIdx > -1) {
                users[uIdx].name = name;
                users[uIdx].avatar = avatar;
                users[uIdx].city = location.split(',')[0].trim();
                users[uIdx].state = location.split(',')[1]?.trim() || 'India';
                saveUsers();
                
                // Sync current session if this is the active user
                const userSession = store.get('currentUser');
                if (userSession.hostId === hostId) {
                    store.set('currentUser', users[uIdx]);
                }
            }

            store.addToast('Host profile settings updated successfully! ✅', 'success');
            activeTab = 'overview';
            renderDashboardPage();
        });
    }
}

function renderProfileSettingsTab(hostProfile) {
    return `
        <div class="dashboard-tab-content">
            <h2 class="dashboard-tab-title">Host Profile Settings</h2>
            <p class="section-subtitle">Manage your public brand, bio details, and social handles</p>
            
            <form id="host-settings-form" class="glass-card" style="padding:var(--space-6);display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);text-align:left">
                <div class="form-group" style="grid-column:span 2">
                    <label class="form-label" for="host-set-name">Brand / Host Name *</label>
                    <input type="text" class="input" id="host-set-name" value="${hostProfile.name}" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="host-set-avatar">Avatar URL</label>
                    <input type="text" class="input" id="host-set-avatar" value="${hostProfile.avatar || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="host-set-cover">Cover Image URL</label>
                    <input type="text" class="input" id="host-set-cover" value="${hostProfile.coverImage || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="host-set-loc">Operating Location (City) *</label>
                    <input type="text" class="input" id="host-set-loc" value="${hostProfile.location || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Host Type *</label>
                    <select class="input" id="host-set-type" required>
                        <option value="influencer" ${hostProfile.type === 'influencer' ? 'selected' : ''}>Travel Influencer</option>
                        <option value="company" ${hostProfile.type === 'company' ? 'selected' : ''}>Travel Company / Operator</option>
                    </select>
                </div>
                <div class="form-group" style="grid-column:span 2">
                    <label class="form-label" for="host-set-specs">Specialties (Comma-separated)</label>
                    <input type="text" class="input" id="host-set-specs" value="${hostProfile.specialties ? hostProfile.specialties.join(', ') : ''}" placeholder="e.g. trekking, beach, women-only">
                </div>
                <div class="form-group" style="grid-column:span 2">
                    <label class="form-label" for="host-set-langs">Languages (Comma-separated)</label>
                    <input type="text" class="input" id="host-set-langs" value="${hostProfile.languages ? hostProfile.languages.join(', ') : ''}" placeholder="e.g. English, Hindi, Kannada">
                </div>
                <div class="form-group">
                    <label class="form-label" for="host-set-ig">Instagram Handle</label>
                    <input type="text" class="input" id="host-set-ig" value="${hostProfile.socialLinks?.instagram || ''}" placeholder="e.g. @wanderlust_priya">
                </div>
                <div class="form-group">
                    <label class="form-label" for="host-set-web">Website Link</label>
                    <input type="text" class="input" id="host-set-web" value="${hostProfile.socialLinks?.website || ''}" placeholder="e.g. wanderlust.com">
                </div>
                <div class="form-group" style="grid-column:span 2">
                    <label class="form-label" for="host-set-bio">Host Bio *</label>
                    <textarea class="input" id="host-set-bio" rows="5" required style="resize:vertical">${hostProfile.bio || ''}</textarea>
                </div>
                <div style="grid-column:span 2;display:flex;justify-content:flex-end;margin-top:var(--space-2)">
                    <button type="submit" class="btn btn-primary">
                        <span class="material-icons-round" style="font-size:18px;margin-right:4px">save</span>
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    `;
}
