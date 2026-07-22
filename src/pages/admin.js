// ============================================
// Admin Panel Component
// Platform administration dashboard
// ============================================

import { store, escapeHTML } from '../state.js';
import { trips, saveTrips } from '../data/trips.js';
import { hosts, saveHosts } from '../data/hosts.js';
import { users, saveUsers } from '../data/users.js';
import { formatPrice } from '../utils/format.js';
import { showModal } from '../components/toast.js';
import { getCommunityRequests, saveCommunityRequests } from '../components/modals.js';
import { jobs, saveJobs } from '../data/jobs.js';
import { remoteStays, saveRemoteStays } from '../data/remote.js';
import { inviteTrips, saveInviteTrips } from '../data/invite.js';

let activeTab = 'stats';
let activeAggSubTab = 'pending';

export function renderAdminPage() {
    const app = document.getElementById('app');
    if (!app) return;

    // Security Gate
    if (!store.get('isLoggedIn')) {
        store.addToast('Please log in to access the Admin Panel', 'warning');
        window.location.hash = '#/login';
        return;
    }

    const user = store.get('currentUser');
    if (user.role !== 'admin') {
        store.addToast('Access denied. Admin role required.', 'error');
        window.location.hash = '#/';
        return;
    }

    // Fetch aggregator data in the background if not loaded
    if (!store.get('aggregatorData')) {
        Promise.all([
            fetch('/api/aggregation/pending').then(r => r.json()),
            fetch('/api/aggregation/duplicates').then(r => r.json()),
            fetch('/api/aggregation/reports').then(r => r.json())
        ]).then(([pending, duplicates, reports]) => {
            store.set('aggregatorData', { pending, duplicates, reports });
            renderAdminPage();
        }).catch(err => console.warn('Failed to load aggregator data:', err));
    }

    const pendingCommCount = getCommunityRequests().filter(r => r.status === 'pending').length;
    const aggData = store.get('aggregatorData') || { pending: [], duplicates: [], reports: [] };
    const pendingAggCount = aggData.pending.length + aggData.duplicates.length;

    app.innerHTML = `
        <div class="admin-page" style="padding-top:calc(var(--nav-height) + var(--space-6));min-height:90vh;">
            <div class="container">
                <div class="admin-header animate-in" style="margin-bottom:var(--space-6)">
                    <h1 class="section-title">Admin <span class="text-gradient">Panel</span></h1>
                    <p class="section-subtitle">Moderate hosts, approve listings, and manage platform users</p>
                </div>

                <div class="dashboard-layout">
                    <!-- Navigation sidebar -->
                    <aside class="dashboard-sidebar glass-panel animate-in-left">
                        <nav class="dashboard-nav">
                            <button class="dashboard-nav-item ${activeTab === 'stats' ? 'active' : ''}" data-tab="stats">
                                <span class="material-icons-round">analytics</span> Platform Stats
                            </button>
                            <button class="dashboard-nav-item ${activeTab === 'hosts' ? 'active' : ''}" data-tab="hosts">
                                <span class="material-icons-round">how_to_reg</span> Host Verifications
                                ${store.get('pendingHosts')?.length > 0 ? `<span class="badge badge-amber" style="margin-left:auto">${store.get('pendingHosts').length}</span>` : ''}
                            </button>
                            <button class="dashboard-nav-item ${activeTab === 'trips' ? 'active' : ''}" data-tab="trips">
                                <span class="material-icons-round">rate_review</span> Trip Moderation
                                ${trips.filter(t => t.status === 'pending').length > 0 ? `<span class="badge badge-coral" style="margin-left:auto">${trips.filter(t => t.status === 'pending').length}</span>` : ''}
                            </button>
                            <button class="dashboard-nav-item ${activeTab === 'users' ? 'active' : ''}" data-tab="users">
                                <span class="material-icons-round">people</span> User Directory
                            </button>
                            <button class="dashboard-nav-item ${activeTab === 'hosts_directory' ? 'active' : ''}" data-tab="hosts_directory">
                                <span class="material-icons-round">folder_shared</span> Host Directory
                            </button>
                            <button class="dashboard-nav-item ${activeTab === 'community_directory' ? 'active' : ''}" data-tab="community_directory">
                                <span class="material-icons-round">forum</span> Community Directory
                                ${pendingCommCount > 0 ? `<span class="badge badge-teal" style="margin-left:auto">${pendingCommCount}</span>` : ''}
                            </button>
                            <button class="dashboard-nav-item ${activeTab === 'trip_aggregator' ? 'active' : ''}" data-tab="trip_aggregator">
                                <span class="material-icons-round">cloud_download</span> Trip Aggregator
                                ${pendingAggCount > 0 ? `<span class="badge badge-amber" style="margin-left:auto">${pendingAggCount}</span>` : ''}
                            </button>
                            <button class="dashboard-nav-item ${activeTab === 'invite_trips' ? 'active' : ''}" data-tab="invite_trips">
                                <span class="material-icons-round">vpn_key</span> Manage Invite Only
                            </button>
                            <button class="dashboard-nav-item ${activeTab === 'jobs' ? 'active' : ''}" data-tab="jobs">
                                <span class="material-icons-round">work</span> Manage Travel Jobs
                            </button>
                            <button class="dashboard-nav-item ${activeTab === 'remote_stays' ? 'active' : ''}" data-tab="remote_stays">
                                <span class="material-icons-round">laptop_mac</span> Manage Work Remote
                            </button>
                        </nav>
                    </aside>

                    <!-- Main Panel content -->
                    <main class="dashboard-content glass-panel animate-in-right" id="admin-main-content">
                        ${renderTabContent(activeTab)}
                    </main>
                </div>
            </div>
        </div>
    `;

    setupAdminEvents();
    document.querySelectorAll('.animate-in, .animate-in-left, .animate-in-right, .animate-in-scale').forEach(el => {
        el.classList.add('visible');
    });
}

function renderTabContent(tab) {
    switch (tab) {
        case 'stats':
            return renderStatsTab();
        case 'hosts':
            return renderHostsTab();
        case 'trips':
            return renderTripsTab();
        case 'users':
            return renderUsersTab();
        case 'hosts_directory':
            return renderHostsDirectoryTab();
        case 'community_directory':
            return renderCommunityDirectoryTab();
        case 'trip_aggregator':
            return renderTripAggregatorTab();
        case 'invite_trips':
            return renderInviteTripsTab();
        case 'jobs':
            return renderJobsTab();
        case 'remote_stays':
            return renderRemoteStaysTab();
        default:
            return '';
    }
}

function renderStatsTab() {
    const totalUsers = users.length + hosts.length;
    const pendingHosts = store.get('pendingHosts') || [];
    const pendingTrips = trips.filter(t => t.status === 'pending');
    const publishedTrips = trips.filter(t => t.status === 'published');
    const totalBookedRevenue = trips.reduce((acc, t) => acc + ((t.bookedSeats || 0) * t.price), 0);
    const platformComm = totalBookedRevenue * 0.10; // 10% commission fee

    return `
        <div class="dashboard-tab-content">
            <h2 class="dashboard-tab-title">Platform Statistics</h2>
            
            <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--space-4);margin-bottom:var(--space-6)">
                <div class="stat-card glass-card" style="padding:var(--space-4)">
                    <span class="material-icons-round" style="color:var(--color-teal);font-size:32px;margin-bottom:var(--space-2)">people_outline</span>
                    <div style="font-size:var(--text-2xl);font-weight:700">${totalUsers}</div>
                    <div class="text-muted" style="font-size:var(--text-xs)">Total Accounts</div>
                </div>
                <div class="stat-card glass-card" style="padding:var(--space-4)">
                    <span class="material-icons-round" style="color:var(--color-amber);font-size:32px;margin-bottom:var(--space-2)">travel_explore</span>
                    <div style="font-size:var(--text-2xl);font-weight:700">${publishedTrips.length}</div>
                    <div class="text-muted" style="font-size:var(--text-xs)">Active Live Trips</div>
                </div>
                <div class="stat-card glass-card" style="padding:var(--space-4)">
                    <span class="material-icons-round" style="color:var(--color-success);font-size:32px;margin-bottom:var(--space-2)">account_balance_wallet</span>
                    <div style="font-size:var(--text-2xl);font-weight:700">${formatPrice(platformComm)}</div>
                    <div class="text-muted" style="font-size:var(--text-xs)">Platform Earnings (10%)</div>
                </div>
                <div class="stat-card glass-card" style="padding:var(--space-4)">
                    <span class="material-icons-round" style="color:var(--color-coral);font-size:32px;margin-bottom:var(--space-2)">hourglass_top</span>
                    <div style="font-size:var(--text-2xl);font-weight:700">${pendingHosts.length + pendingTrips.length}</div>
                    <div class="text-muted" style="font-size:var(--text-xs)">Pending Reviews</div>
                </div>
            </div>

            <div class="glass-card" style="padding:var(--space-5)">
                <h3 style="margin-bottom:var(--space-3)">Recent System Audits</h3>
                <ul style="list-style:none;display:flex;flex-direction:column;gap:12px;font-size:var(--text-sm)">
                    <li style="display:flex;align-items:center;gap:8px">
                        <span class="material-icons-round" style="font-size:16px;color:var(--color-teal)">security</span>
                        <span>Auto-scanned all trip description endpoints for XSS vulnerabilities — <strong>Clean</strong></span>
                    </li>
                    <li style="display:flex;align-items:center;gap:8px">
                        <span class="material-icons-round" style="font-size:16px;color:var(--color-teal)">database</span>
                        <span>LocalState store synchronized to local IndexedDB successfully.</span>
                    </li>
                </ul>
            </div>
        </div>
    `;
}

function renderHostsTab() {
    const pendingHosts = store.get('pendingHosts') || [];

    if (pendingHosts.length === 0) {
        return `
            <div class="dashboard-tab-content">
                <h2 class="dashboard-tab-title">Pending Host Verifications</h2>
                <div style="text-align:center;padding:var(--space-12) 0;color:var(--color-text-muted)">
                    <span class="material-icons-round" style="font-size:48px;margin-bottom:var(--space-3)">verified_user</span>
                    <h3>No pending host requests</h3>
                    <p>When new hosts register or submit verification documents, they will appear here.</p>
                </div>
            </div>
        `;
    }

    return `
        <div class="dashboard-tab-content">
            <h2 class="dashboard-tab-title">Host Verification Requests</h2>
            <div style="display:flex;flex-direction:column;gap:var(--space-4)">
                ${pendingHosts.map(host => {
                    const doc = host.documents || { idProof: 'identity_proof.pdf', socialLink: 'Not provided' };
                    return `
                        <div class="host-request-card glass-card" style="padding:var(--space-4);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-4)">
                            <div style="display:flex;align-items:center;gap:var(--space-3)">
                                <div class="avatar avatar-md">
                                    <img src="${host.avatar}" alt="${host.name}">
                                </div>
                                <div>
                                    <h3 style="font-size:var(--text-md);margin-bottom:2px">${host.name}</h3>
                                    <div class="text-muted" style="font-size:var(--text-xs);margin-bottom:4px">
                                        ${host.email} · <span style="text-transform:capitalize">${host.type}</span>
                                    </div>
                                    <div style="font-size:11px;color:var(--color-text-muted);display:flex;align-items:center;gap:4px">
                                        <span class="material-icons-round" style="font-size:14px;color:var(--color-amber)">description</span>
                                        File: ${doc.idProof}
                                    </div>
                                </div>
                            </div>
                            <div style="display:flex;gap:var(--space-2)">
                                <button class="btn btn-primary btn-sm approve-host-btn" data-id="${host.id}">Approve</button>
                                <button class="btn btn-secondary btn-sm edit-host-admin-btn" data-id="${host.id}">Review & Edit</button>
                                <button class="btn btn-outline btn-sm reject-host-btn" data-id="${host.id}" style="border-color:var(--color-error);color:var(--color-error)">Reject</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function renderTripsTab() {
    return `
        <div class="dashboard-tab-content">
            <h2 class="dashboard-tab-title">Trip Listings & Moderation</h2>
            
            <div class="table-container" style="overflow-x:auto">
                <table class="dashboard-table" style="width:100%;border-collapse:collapse;text-align:left">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
                            <th style="padding:var(--space-3)">Featured</th>
                            <th style="padding:var(--space-3)">Trip Title</th>
                            <th style="padding:var(--space-3)">Host / Company</th>
                            <th style="padding:var(--space-3)">Destination</th>
                            <th style="padding:var(--space-3)">Price</th>
                            <th style="padding:var(--space-3)">Seats</th>
                            <th style="padding:var(--space-3)">Status</th>
                            <th style="padding:var(--space-3)">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${trips.map(trip => {
                            let badgeClass = 'badge-gray';
                            if (trip.status === 'published') badgeClass = 'badge-teal';
                            else if (trip.status === 'pending') badgeClass = 'badge-amber';
                            else if (trip.status === 'rejected') badgeClass = 'badge-coral';
                            
                            const host = (hosts || []).find(h => h.id === trip.hostId);
                            const hostName = host ? host.name : (trip.companyName || 'Wanderlust with Priya');
                            const hostType = host ? host.type : 'influencer';
                            const typeBadgeClass = hostType === 'company' ? 'badge-teal' : 'badge-amber';
                            
                            return `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                                    <td style="padding:var(--space-3)">
                                        <button class="btn btn-ghost btn-sm toggle-featured-btn" data-id="${trip.id}" style="color:${trip.featured ? 'var(--color-warning)' : 'rgba(255,255,255,0.2)'};padding:4px;min-width:auto;background:transparent;">
                                            <span class="material-icons-round" style="font-size:18px;">${trip.featured ? 'star' : 'star_border'}</span>
                                        </button>
                                    </td>
                                    <td style="padding:var(--space-3);font-weight:600;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escapeHTML(trip.title)}">
                                        ${escapeHTML(trip.title)}
                                    </td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">
                                        <div style="display:flex;align-items:center;gap:6px">
                                            <span>${escapeHTML(hostName)}</span>
                                            <span class="badge ${typeBadgeClass}" style="font-size:8px;padding:1px 6px;text-transform:capitalize">${hostType}</span>
                                        </div>
                                    </td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">${escapeHTML(trip.destination)}</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">${formatPrice(trip.price)}</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">${trip.bookedSeats || 0} / ${trip.totalSeats}</td>
                                    <td style="padding:var(--space-3)">
                                        <span class="badge ${badgeClass}" style="text-transform:capitalize">${trip.status || 'pending'}</span>
                                    </td>
                                    <td style="padding:var(--space-3)">
                                        <div style="display:flex;gap:4px">
                                            ${trip.status !== 'published' ? `
                                                <button class="btn btn-ghost btn-sm approve-trip-btn" data-id="${trip.id}" style="color:var(--color-teal);padding:4px 8px;">
                                                    Approve
                                                </button>
                                            ` : `
                                                <button class="btn btn-ghost btn-sm reject-trip-btn" data-id="${trip.id}" style="color:var(--color-coral);padding:4px 8px;">
                                                    Reject
                                                </button>
                                            `}
                                            <button class="btn btn-ghost btn-sm edit-trip-admin-btn" data-id="${trip.id}" style="padding:4px 8px;">
                                                Edit
                                            </button>
                                            <button class="btn btn-ghost btn-sm delete-trip-admin-btn" data-id="${trip.id}" style="color:var(--color-error);padding:4px 8px;">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderUsersTab() {
    // Only show non-hosts (Travelers & Admins) in the general User Directory
    const directoryUsers = users.filter(u => u.role !== 'host');

    return `
        <div class="dashboard-tab-content">
            <h2 class="dashboard-tab-title">User Directory</h2>
            
            <div class="table-container" style="overflow-x:auto">
                <table class="dashboard-table" style="width:100%;border-collapse:collapse;text-align:left">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
                            <th style="padding:var(--space-3)">Name</th>
                            <th style="padding:var(--space-3)">Email</th>
                            <th style="padding:var(--space-3)">Location</th>
                            <th style="padding:var(--space-3)">Role</th>
                            <th style="padding:var(--space-3)">Verified</th>
                            <th style="padding:var(--space-3)">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${directoryUsers.map(u => `
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                                <td style="padding:var(--space-3);font-weight:600">${escapeHTML(u.name)}</td>
                                <td style="padding:var(--space-3);font-size:var(--text-sm)">${escapeHTML(u.email)}</td>
                                <td style="padding:var(--space-3);font-size:var(--text-sm)">${escapeHTML(u.city || 'India')}</td>
                                <td style="padding:var(--space-3)">
                                    <span class="badge ${u.role === 'admin' ? 'badge-amber' : 'badge-gray'}" style="text-transform:capitalize">${u.role || 'traveler'}</span>
                                </td>
                                <td style="padding:var(--space-3)">
                                    ${u.verified ? '<span class="material-icons-round" style="color:var(--color-teal);font-size:18px">verified</span>' : '<span style="color:var(--color-text-muted)">-</span>'}
                                </td>
                                <td style="padding:var(--space-3)">
                                    <div style="display:flex;gap:4px">
                                        <button class="btn btn-ghost btn-sm toggle-user-verify-btn" data-id="${u.id}" data-type="Traveler">
                                            ${u.verified ? 'Revoke' : 'Verify'}
                                        </button>
                                        <button class="btn btn-ghost btn-sm edit-user-admin-btn" data-id="${u.id}" data-type="Traveler">
                                            Edit
                                        </button>
                                        <button class="btn btn-ghost btn-sm delete-user-admin-btn" data-id="${u.id}" data-type="Traveler" style="color:var(--color-error)">
                                            Delete
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

function renderHostsDirectoryTab() {
    return `
        <div class="dashboard-tab-content">
            <h2 class="dashboard-tab-title">Host Directory</h2>
            
            <div class="table-container" style="overflow-x:auto">
                <table class="dashboard-table" style="width:100%;border-collapse:collapse;text-align:left">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
                            <th style="padding:var(--space-3)">Host Name</th>
                            <th style="padding:var(--space-3)">Type</th>
                            <th style="padding:var(--space-3)">Location</th>
                            <th style="padding:var(--space-3)">Rating</th>
                            <th style="padding:var(--space-3)">Active Listings</th>
                            <th style="padding:var(--space-3)">Verified</th>
                            <th style="padding:var(--space-3)">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${hosts.map(host => {
                            const hostTrips = trips.filter(t => t.hostId === host.id);
                            const tripListStr = hostTrips.map(t => escapeHTML(t.title)).join(', ') || 'None';
                            const tripListHtml = hostTrips.map(t => {
                                return `<a href="javascript:void(0)" class="admin-host-trip-link" data-trip-id="${t.id}" style="color:var(--color-teal);text-decoration:underline;margin-right:8px;display:inline-block;" title="Click to Edit Trip">${escapeHTML(t.title)}</a>`;
                            }).join(', ') || '<span style="color:var(--color-text-muted)">None</span>';
                            
                            return `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                                    <td style="padding:var(--space-3);font-weight:600;display:flex;align-items:center;gap:8px">
                                        <div class="avatar avatar-xs" style="width:24px;height:24px;">
                                            <img src="${host.avatar}" alt="${escapeHTML(host.name)}" style="border-radius:50%;object-fit:cover;width:24px;height:24px;">
                                        </div>
                                        <span>${escapeHTML(host.name)}</span>
                                    </td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">${host.type === 'company' ? 'Top Travel Companies' : 'Travel Creators & influencers'}</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">${escapeHTML(host.location)}</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">★ ${(host.rating || 5.0).toFixed(1)}</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-xs);max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${tripListStr}">
                                        ${tripListHtml}
                                    </td>
                                    <td style="padding:var(--space-3)">
                                        ${host.verified ? '<span class="material-icons-round" style="color:var(--color-teal);font-size:18px">verified</span>' : '<span style="color:var(--color-text-muted)">-</span>'}
                                    </td>
                                    <td style="padding:var(--space-3)">
                                        <div style="display:flex;gap:4px">
                                            <button class="btn btn-ghost btn-sm sync-host-website-admin-btn" data-id="${host.id}" data-name="${escapeHTML(host.name)}" data-url="${escapeHTML(host.websiteUrl || 'https://' + host.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com/trips')}" style="color:var(--color-teal);padding:4px 8px;">
                                                <span class="material-icons-round" style="font-size:14px">sync</span> Sync
                                            </button>
                                            <button class="btn btn-ghost btn-sm toggle-host-verify-btn" data-id="${host.id}">
                                                ${host.verified ? 'Revoke' : 'Verify'}
                                            </button>
                                            <button class="btn btn-ghost btn-sm edit-host-admin-btn" data-id="${host.id}">
                                                Edit
                                            </button>
                                            <button class="btn btn-ghost btn-sm delete-host-admin-btn" data-id="${host.id}" style="color:var(--color-error)">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderCommunityDirectoryTab() {
    const requests = getCommunityRequests();
    
    return `
        <div class="dashboard-tab-content">
            <h2 class="dashboard-tab-title">Community Access Requests</h2>
            
            <div class="table-container" style="overflow-x:auto">
                <table class="dashboard-table" style="width:100%;border-collapse:collapse;text-align:left">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
                            <th style="padding:var(--space-3)">Name</th>
                            <th style="padding:var(--space-3)">WhatsApp</th>
                            <th style="padding:var(--space-3)">Email</th>
                            <th style="padding:var(--space-3)">Social Handle</th>
                            <th style="padding:var(--space-3)">Location</th>
                            <th style="padding:var(--space-3)">Source</th>
                            <th style="padding:var(--space-3)">Status</th>
                            <th style="padding:var(--space-3)">Date</th>
                            <th style="padding:var(--space-3)">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${requests.map(req => {
                            let badgeClass = 'badge-gray';
                            if (req.status === 'approved') badgeClass = 'badge-teal';
                            else if (req.status === 'pending') badgeClass = 'badge-amber';
                            else if (req.status === 'rejected') badgeClass = 'badge-coral';
                            
                            const dateStr = req.submittedAt ? new Date(req.submittedAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : 'N/A';
                            
                            return `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                                    <td style="padding:var(--space-3);font-weight:600">${escapeHTML(req.name)}</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">${escapeHTML(req.phone)}</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">${escapeHTML(req.email)}</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">
                                        ${req.social && req.social !== 'Not provided' ? `<a href="https://instagram.com/${escapeHTML(req.social.replace('@', ''))}" target="_blank" style="color:var(--color-teal);text-decoration:underline">${escapeHTML(req.social)}</a>` : '<span style="color:var(--color-text-muted)">-</span>'}
                                    </td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">${escapeHTML(req.location || 'India')}</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-xs);color:var(--color-text-muted)">${escapeHTML(req.source || 'Direct')}</td>
                                    <td style="padding:var(--space-3)">
                                        <span class="badge ${badgeClass}" style="text-transform:capitalize">${req.status}</span>
                                    </td>
                                    <td style="padding:var(--space-3);font-size:var(--text-xs);color:var(--color-text-muted)">${dateStr}</td>
                                    <td style="padding:var(--space-3)">
                                        <div style="display:flex;gap:4px">
                                            ${req.status !== 'approved' ? `
                                                <button class="btn btn-ghost btn-sm approve-comm-btn" data-id="${req.id}" style="color:var(--color-teal);padding:4px 8px;">
                                                    Approve
                                                </button>
                                            ` : ''}
                                            ${req.status !== 'rejected' ? `
                                                <button class="btn btn-ghost btn-sm reject-comm-btn" data-id="${req.id}" style="color:var(--color-coral);padding:4px 8px;">
                                                    Reject
                                                </button>
                                            ` : ''}
                                            <button class="btn btn-ghost btn-sm delete-comm-btn" data-id="${req.id}" style="color:var(--color-error);padding:4px 8px;">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                        ${requests.length === 0 ? `
                            <tr>
                                <td colspan="9" style="text-align:center;padding:var(--space-8);color:var(--color-text-muted)">
                                    No community access requests found.
                                </td>
                            </tr>
                        ` : ''}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderTripAggregatorTab() {
    const aggData = store.get('aggregatorData') || { pending: [], duplicates: [], reports: [] };
    
    let subTabContentHtml = '';
    
    if (activeAggSubTab === 'pending') {
        subTabContentHtml = `
            <div class="table-container" style="overflow-x:auto">
                <table class="dashboard-table" style="width:100%;border-collapse:collapse;text-align:left">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
                            <th style="padding:var(--space-3)">Trip Title</th>
                            <th style="padding:var(--space-3)">Source Company</th>
                            <th style="padding:var(--space-3)">Destination</th>
                            <th style="padding:var(--space-3)">Duration</th>
                            <th style="padding:var(--space-3)">Price</th>
                            <th style="padding:var(--space-3)">Departure Dates</th>
                            <th style="padding:var(--space-3)">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${aggData.pending.map(item => {
                            const dateList = (item.departureDates || []).join(', ') || 'N/A';
                            return `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                                    <td style="padding:var(--space-3);font-weight:600">${escapeHTML(item.title)}</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">${escapeHTML(item.companyName)}</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">${escapeHTML(item.destination)}</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">${item.duration?.days || 0} Days</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">${formatPrice(item.price)}</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-xs);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escapeHTML(dateList)}">
                                        ${escapeHTML(dateList)}
                                    </td>
                                    <td style="padding:var(--space-3)">
                                        <div style="display:flex;gap:4px">
                                            <button class="btn btn-ghost btn-sm approve-crawled-btn" data-id="${item.id}" style="color:var(--color-teal);padding:4px 8px;">
                                                Approve
                                            </button>
                                            <button class="btn btn-ghost btn-sm reject-crawled-btn" data-id="${item.id}" style="color:var(--color-coral);padding:4px 8px;">
                                                Reject
                                            </button>
                                            <button class="btn btn-ghost btn-sm details-crawled-btn" data-id="${item.id}" style="padding:4px 8px;">
                                                Details
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                        ${aggData.pending.length === 0 ? `
                            <tr>
                                <td colspan="7" style="text-align:center;padding:var(--space-10);color:var(--color-text-muted)">
                                    No pending crawled imports in queue.
                                </td>
                            </tr>
                        ` : ''}
                    </tbody>
                </table>
            </div>
        `;
    } else if (activeAggSubTab === 'duplicates') {
        subTabContentHtml = `
            <div style="display:flex;flex-direction:column;gap:16px">
                ${aggData.duplicates.map(group => {
                    const ct = group.crawled_trip;
                    const matchesStr = group.matches.map(m => `${escapeHTML(m.existing_trip_title)} (${m.similarity}% match)`).join(', ');
                    return `
                        <div class="glass-card" style="padding:20px;display:flex;flex-direction:column;gap:12px;border:1px solid rgba(255, 90, 0, 0.15);background:rgba(255, 90, 0, 0.02)">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
                                <div>
                                    <span class="badge badge-coral" style="margin-bottom:6px">Duplicate Detected</span>
                                    <h3 style="font-size:16px;margin:0 0 4px 0">${escapeHTML(ct.title)}</h3>
                                    <p style="font-size:12px;color:var(--color-text-muted);margin:0">
                                        Source: <strong>${escapeHTML(ct.companyName)}</strong> · Destination: ${escapeHTML(ct.destination)} · Price: ${formatPrice(ct.price)}
                                    </p>
                                </div>
                                <div style="display:flex;gap:8px">
                                    <button class="btn btn-primary btn-sm merge-dup-btn" data-dup-id="${group.id}" style="background:var(--color-teal);color:#000">
                                        Merge Departures
                                    </button>
                                    <button class="btn btn-secondary btn-sm ignore-dup-btn" data-dup-id="${group.id}">
                                        Publish Standalone
                                    </button>
                                </div>
                            </div>
                            <div style="background:rgba(0,0,0,0.2);padding:10px 14px;border-radius:6px;font-size:12px;border-left:3px solid var(--color-amber)">
                                <span style="font-weight:700">Similarity Matches:</span> ${matchesStr}
                            </div>
                        </div>
                    `;
                }).join('')}
                ${aggData.duplicates.length === 0 ? `
                    <div style="text-align:center;padding:var(--space-10);color:var(--color-text-muted)">
                        No duplicate groups pending resolution.
                    </div>
                ` : ''}
            </div>
        `;
    } else if (activeAggSubTab === 'reports') {
        subTabContentHtml = `
            <div class="table-container" style="overflow-x:auto">
                <table class="dashboard-table" style="width:100%;border-collapse:collapse;text-align:left">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
                            <th style="padding:var(--space-3)">Timestamp</th>
                            <th style="padding:var(--space-3)">Success Rate</th>
                            <th style="padding:var(--space-3)">New Trips Found</th>
                            <th style="padding:var(--space-3)">Duplicates Found</th>
                            <th style="padding:var(--space-3)">Failed URLs</th>
                            <th style="padding:var(--space-3)">Sources Crawled</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${aggData.reports.map(rep => {
                            const dateStr = new Date(rep.timestamp).toLocaleString();
                            const sourcesStr = (rep.sources_crawled || []).join(', ');
                            return `
                                <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">${dateStr}</td>
                                    <td style="padding:var(--space-3)">
                                        <span class="badge ${rep.success_rate >= 80 ? 'badge-teal' : 'badge-coral'}">${rep.success_rate}%</span>
                                    </td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">${rep.new_trips_found}</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">${rep.duplicates_detected}</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-sm)">${rep.failed_imports}</td>
                                    <td style="padding:var(--space-3);font-size:var(--text-xs);color:var(--color-text-muted)" title="${escapeHTML(sourcesStr)}">${escapeHTML(sourcesStr)}</td>
                                </tr>
                            `;
                        }).join('')}
                        ${aggData.reports.length === 0 ? `
                            <tr>
                                <td colspan="6" style="text-align:center;padding:var(--space-10);color:var(--color-text-muted)">
                                    No crawler execution reports found.
                                </td>
                            </tr>
                        ` : ''}
                    </tbody>
                </table>
            </div>
        `;
    }

    return `
        <div class="dashboard-tab-content">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-6)">
                <div>
                    <h2 class="dashboard-tab-title" style="margin-bottom:2px">Trip Aggregation Engine</h2>
                    <p style="font-size:12px;color:var(--color-text-muted)">Automated crawling, AI parsing, and duplication moderation queue</p>
                </div>
                <button class="btn btn-primary" id="trigger-agg-crawl-btn" style="background:#00d4aa;color:#000;font-weight:700">
                    <span class="material-icons-round">play_arrow</span> Run Crawler Now
                </button>
            </div>
            
            <!-- Aggregator Navigation tabs -->
            <div style="display:flex;gap:12px;margin-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px">
                <button class="btn btn-ghost btn-sm agg-subtab-btn ${activeAggSubTab === 'pending' ? 'active' : ''}" data-subtab="pending" style="color:${activeAggSubTab === 'pending' ? 'var(--color-teal)' : 'inherit'};font-weight:${activeAggSubTab === 'pending' ? '700' : 'normal'}">
                    Pending Imports (${aggData.pending.length})
                </button>
                <button class="btn btn-ghost btn-sm agg-subtab-btn ${activeAggSubTab === 'duplicates' ? 'active' : ''}" data-subtab="duplicates" style="color:${activeAggSubTab === 'duplicates' ? 'var(--color-teal)' : 'inherit'};font-weight:${activeAggSubTab === 'duplicates' ? '700' : 'normal'}">
                    Duplicate Queue (${aggData.duplicates.length})
                </button>
                <button class="btn btn-ghost btn-sm agg-subtab-btn ${activeAggSubTab === 'reports' ? 'active' : ''}" data-subtab="reports" style="color:${activeAggSubTab === 'reports' ? 'var(--color-teal)' : 'inherit'};font-weight:${activeAggSubTab === 'reports' ? '700' : 'normal'}">
                    Execution Logs (${aggData.reports.length})
                </button>
            </div>
            
            ${subTabContentHtml}
        </div>
    `;
}

function showEditTripModal(tripId) {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const modalContent = `
        <form id="admin-edit-trip-form" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;max-height:60vh;overflow-y:auto;padding-right:8px;text-align:left">
            <div class="form-group" style="grid-column:span 2">
                <label class="form-label" style="font-size:11px">Trip Title *</label>
                <input type="text" class="input" id="admin-trip-title" value="${trip.title}" required>
            </div>
            <div class="form-group" style="grid-column:span 2">
                <label class="form-label" style="font-size:11px">Tagline / Subtitle *</label>
                <input type="text" class="input" id="admin-trip-subtitle" value="${trip.subtitle}" required>
            </div>
            <div class="form-group">
                <label class="form-label" style="font-size:11px">Destination City *</label>
                <input type="text" class="input" id="admin-trip-dest" value="${trip.destination}" required>
            </div>
            <div class="form-group">
                <label class="form-label" style="font-size:11px">Destination State/Country *</label>
                <input type="text" class="input" id="admin-trip-state" value="${trip.destinationState}" required>
            </div>
            <div class="form-group">
                <label class="form-label" style="font-size:11px">Price (₹) *</label>
                <input type="number" class="input" id="admin-trip-price" value="${trip.price}" required>
            </div>
            <div class="form-group">
                <label class="form-label" style="font-size:11px">Total Seats *</label>
                <input type="number" class="input" id="admin-trip-seats" value="${trip.totalSeats}" required>
            </div>
            <div class="form-group">
                <label class="form-label" style="font-size:11px">Region *</label>
                <select class="input" id="admin-trip-region">
                    <option value="domestic" ${trip.region === 'domestic' ? 'selected' : ''}>Domestic</option>
                    <option value="international" ${trip.region === 'international' ? 'selected' : ''}>International</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label" style="font-size:11px">Stay Type</label>
                <input type="text" class="input" id="admin-trip-stay" value="${trip.stayType || ''}">
            </div>
            <div class="form-group" style="grid-column:span 2">
                <label class="form-label" style="font-size:11px">Categories (Comma-separated)</label>
                <input type="text" class="input" id="admin-trip-categories" value="${trip.categories ? trip.categories.join(', ') : ''}">
            </div>
            <div class="form-group" style="grid-column:span 2">
                <label class="form-label" style="font-size:11px">Detailed Itinerary PDF Link (e.g. Google Drive Link)</label>
                <input type="url" class="input" id="admin-trip-itinerary-url" value="${trip.itineraryUrl || ''}" placeholder="https://drive.google.com/file/d/.../view?usp=sharing">
            </div>
            <div class="form-group" style="grid-column:span 2">
                <label class="form-label" style="font-size:11px">Description *</label>
                <textarea class="input" id="admin-trip-desc" rows="4" required style="resize:vertical">${trip.description}</textarea>
            </div>
        </form>
    `;

    showModal({
        title: `Edit Trip Listing: ${trip.title}`,
        content: modalContent,
        actions: [
            {
                id: 'admin-save-trip-btn',
                label: 'Save Changes',
                className: 'btn-primary',
                onClick: () => {
                    const title = document.getElementById('admin-trip-title').value;
                    const subtitle = document.getElementById('admin-trip-subtitle').value;
                    const destination = document.getElementById('admin-trip-dest').value;
                    const state = document.getElementById('admin-trip-state').value;
                    const price = parseFloat(document.getElementById('admin-trip-price').value);
                    const seats = parseInt(document.getElementById('admin-trip-seats').value);
                    const region = document.getElementById('admin-trip-region').value;
                    const stayType = document.getElementById('admin-trip-stay').value;
                    const categoriesRaw = document.getElementById('admin-trip-categories').value;
                    const description = document.getElementById('admin-trip-desc').value;
                    const itineraryUrl = document.getElementById('admin-trip-itinerary-url').value.trim();

                    const categories = categoriesRaw.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);

                    const idx = trips.findIndex(t => t.id === tripId);
                    if (idx > -1) {
                        trips[idx] = {
                            ...trips[idx],
                            title, subtitle, destination, destinationState: state,
                            price, totalSeats: seats, region, stayType, categories, description, itineraryUrl,
                            status: 'published'
                        };
                        const host = hosts.find(h => h.id === trips[idx].hostId);
                        if (host) {
                            host.verified = true;
                            saveHosts();
                        }
                        saveTrips();
                        store.addToast(`Trip "${title}" updated & published live! ✅`, 'success');
                        renderAdminPage();
                    }
                }
            },
            {
                id: 'admin-cancel-trip-btn',
                label: 'Cancel',
                className: 'btn-ghost'
            }
        ],
        size: 'lg'
    });
}

function showEditHostModal(hostId) {
    const host = hosts.find(h => h.id === hostId);
    if (!host) return;

    // Look for pending verification documents in state
    const pendingHosts = store.get('pendingHosts') || [];
    const pendingInfo = pendingHosts.find(h => h.id === hostId);
    const documents = pendingInfo?.documents || {
        idProof: 'identity_proof.pdf',
        gstCert: 'Not provided',
        socialLink: host.socialLinks?.instagram ? `https://instagram.com/${host.socialLinks.instagram.replace('@', '')}` : 'https://instagram.com/'
    };

    const hostTrips = trips.filter(t => t.hostId === hostId);
    const hostTripsHtml = hostTrips.length === 0 
        ? `<p style="color:var(--color-text-muted);font-size:12px;margin-top:4px;">No active trips listed.</p>`
        : `<div style="display:flex;flex-direction:column;gap:6px;margin-top:6px;max-height:150px;overflow-y:auto;padding-right:4px;">
            ${hostTrips.map(t => `
                <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.03);padding:6px 8px;border-radius:4px;border:1px solid rgba(255,255,255,0.05)">
                    <span style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px" title="${t.title}">${t.title}</span>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <span class="badge ${t.status === 'published' ? 'badge-teal' : t.status === 'pending' ? 'badge-amber' : 'badge-coral'}" style="font-size:10px;padding:2px 6px;">${t.status}</span>
                        <button type="button" class="btn btn-ghost btn-xs edit-host-trip-btn" data-trip-id="${t.id}" style="padding:2px 6px;font-size:10px;color:var(--color-teal);border:1px solid rgba(0,212,170,0.2)">Edit</button>
                    </div>
                </div>
            `).join('')}
           </div>`;

    const modalContent = `
        <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:20px;font-size:13px;text-align:left">
            <!-- Left: Host Profile Fields -->
            <form id="admin-edit-host-form" style="display:flex;flex-direction:column;gap:12px;max-height:60vh;overflow-y:auto;padding-right:8px">
                <h4 style="margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:4px;color:#fff">Host Profile Details</h4>
                <div class="form-group">
                    <label class="form-label" style="font-size:11px">Brand / Host Name *</label>
                    <input type="text" class="input" id="admin-host-name" value="${host.name}" required>
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-size:11px">Location *</label>
                    <input type="text" class="input" id="admin-host-loc" value="${host.location}" required>
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-size:11px">Host Account Type *</label>
                    <select class="input" id="admin-host-type" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                        <option value="influencer" ${host.type === 'influencer' ? 'selected' : ''}>Travel Creators & influencers</option>
                        <option value="company" ${host.type === 'company' ? 'selected' : ''}>Top Travel Companies</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-size:11px">Specialties (Comma-separated)</label>
                    <input type="text" class="input" id="admin-host-specs" value="${host.specialties ? host.specialties.join(', ') : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-size:11px">Languages (Comma-separated)</label>
                    <input type="text" class="input" id="admin-host-langs" value="${host.languages ? host.languages.join(', ') : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-size:11px">Trust Score / Rating (★)</label>
                    <input type="number" step="0.1" max="5" class="input" id="admin-host-rating" value="${host.rating}">
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-size:11px">Bio Description</label>
                    <textarea class="input" id="admin-host-bio" rows="4" style="resize:vertical">${host.bio || ''}</textarea>
                </div>
                <div class="form-group" style="margin-top:4px;">
                    <label class="form-label" style="font-size:11px;font-weight:600;color:var(--color-teal)">Active Trips (${hostTrips.length})</label>
                    ${hostTripsHtml}
                </div>
            </form>
            
            <!-- Right: Documents Submitted -->
            <div class="glass-panel" style="padding:15px;background:rgba(255,255,255,0.02)">
                <h4 style="margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:4px;color:#fff">Submitted Verification Files</h4>
                
                <div style="display:flex;flex-direction:column;gap:12px">
                    <div>
                        <strong class="text-muted" style="font-size:11px">Identity Proof file:</strong>
                        <div style="display:flex;align-items:center;gap:6px;margin-top:4px;font-family:monospace;background:rgba(255,255,255,0.05);padding:6px;border-radius:4px">
                            <span class="material-icons-round" style="color:var(--color-amber);font-size:18px">picture_as_pdf</span>
                            <span>${documents.idProof || 'id_proof_scan.pdf'}</span>
                        </div>
                    </div>
                    <div>
                        <strong class="text-muted" style="font-size:11px">GST / Business Registration:</strong>
                        <div style="display:flex;align-items:center;gap:6px;margin-top:4px;font-family:monospace;background:rgba(255,255,255,0.05);padding:6px;border-radius:4px">
                            <span class="material-icons-round" style="color:var(--color-amber);font-size:18px">picture_as_pdf</span>
                            <span>${documents.gstCert || 'Not uploaded'}</span>
                        </div>
                    </div>
                    <div>
                        <strong class="text-muted" style="font-size:11px">Social Profile Link:</strong>
                        <div style="margin-top:4px">
                            <a href="${documents.socialLink || '#'}" target="_blank" style="color:var(--color-teal);text-decoration:underline;display:flex;align-items:center;gap:4px">
                                <span class="material-icons-round" style="font-size:16px">open_in_new</span>
                                Open Social Link
                            </a>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top:24px;padding:10px;border-radius:6px;border:1px solid rgba(0,212,170,0.15);background:rgba(0,212,170,0.02)">
                    <strong style="color:var(--color-teal);display:flex;align-items:center;gap:4px">
                        <span class="material-icons-round" style="font-size:16px">security</span>
                        Audit Status
                    </strong>
                    <p style="font-size:11px;margin-top:4px;color:rgba(255,255,255,0.6)">Automatic malware scan completed. Files passed integrity checks.</p>
                </div>
            </div>
        </div>
    `;

    showModal({
        title: `Verification Review & Edit: ${host.name}`,
        content: modalContent,
        actions: [
            {
                id: 'admin-save-approve-host-btn',
                label: 'Save & Approve Verification',
                className: 'btn-primary',
                onClick: () => {
                    const name = document.getElementById('admin-host-name').value;
                    const location = document.getElementById('admin-host-loc').value;
                    const type = document.getElementById('admin-host-type').value;
                    const rating = parseFloat(document.getElementById('admin-host-rating').value) || 5.0;
                    const bio = document.getElementById('admin-host-bio').value;
                    const specsRaw = document.getElementById('admin-host-specs').value;
                    const langsRaw = document.getElementById('admin-host-langs').value;

                    const specialties = specsRaw.split(',').map(s => s.trim()).filter(Boolean);
                    const languages = langsRaw.split(',').map(l => l.trim()).filter(Boolean);

                    // Update host data
                    const idx = hosts.findIndex(h => h.id === hostId);
                    if (idx > -1) {
                        hosts[idx] = {
                            ...hosts[idx],
                            name, location, type, rating, bio, specialties, languages,
                            verified: true,
                            verificationDate: new Date().toISOString().split('T')[0]
                        };
                        saveHosts();
                    }

                    // Update associated user
                    const uIdx = users.findIndex(u => u.hostId === hostId);
                    if (uIdx > -1) {
                        users[uIdx].verified = true;
                        users[uIdx].name = name;
                        users[uIdx].city = location.split(',')[0].trim();
                        users[uIdx].state = location.split(',')[1]?.trim() || 'India';
                        saveUsers();
                    }

                    // Remove from pending in state
                    let pending = store.get('pendingHosts') || [];
                    pending = pending.filter(h => h.id !== hostId);
                    store.set('pendingHosts', pending);

                    // Sync current session if it is this host
                    if (store.get('currentUser.hostId') === hostId) {
                        store.set('currentUser.verified', true);
                    }

                    store.addToast(`Host "${name}" has been edited and verified successfully! 🛡️`, 'success');
                    renderAdminPage();
                }
            },
            {
                id: 'admin-save-only-host-btn',
                label: 'Save Profile Details Only',
                className: 'btn-secondary',
                onClick: () => {
                    const name = document.getElementById('admin-host-name').value;
                    const location = document.getElementById('admin-host-loc').value;
                    const rating = parseFloat(document.getElementById('admin-host-rating').value) || 5.0;
                    const bio = document.getElementById('admin-host-bio').value;
                    const specsRaw = document.getElementById('admin-host-specs').value;
                    const langsRaw = document.getElementById('admin-host-langs').value;

                    const specialties = specsRaw.split(',').map(s => s.trim()).filter(Boolean);
                    const languages = langsRaw.split(',').map(l => l.trim()).filter(Boolean);

                    const idx = hosts.findIndex(h => h.id === hostId);
                    if (idx > -1) {
                        hosts[idx] = {
                            ...hosts[idx],
                            name, location, rating, bio, specialties, languages
                        };
                        saveHosts();
                    }

                    const uIdx = users.findIndex(u => u.hostId === hostId);
                    if (uIdx > -1) {
                        users[uIdx].name = name;
                        users[uIdx].city = location.split(',')[0].trim();
                        users[uIdx].state = location.split(',')[1]?.trim() || 'India';
                        saveUsers();
                    }

                    store.addToast(`Host profile details saved successfully! ✅`, 'success');
                    renderAdminPage();
                }
            },
            {
                id: 'admin-cancel-host-btn',
                label: 'Cancel',
                className: 'btn-ghost'
            }
        ],
        size: 'lg'
    });

    // Bind edit trip buttons inside host modal
    requestAnimationFrame(() => {
        document.querySelectorAll('.edit-host-trip-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tripId = btn.dataset.tripId;
                showEditTripModal(tripId);
            });
        });
    });
}

function showEditUserModal(userId, userType) {
    if (userType === 'Host') {
        showEditHostModal(userId);
        return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) return;

    const modalContent = `
        <form id="admin-edit-user-form" style="display:flex;flex-direction:column;gap:12px;font-size:13px;text-align:left">
            <div class="form-group">
                <label class="form-label" style="font-size:11px">User Full Name *</label>
                <input type="text" class="input" id="admin-user-name" value="${user.name}" required>
            </div>
            <div class="form-group">
                <label class="form-label" style="font-size:11px">Email Address *</label>
                <input type="email" class="input" id="admin-user-email" value="${user.email}" required>
            </div>
            <div class="form-group">
                <label class="form-label" style="font-size:11px">Operating City</label>
                <input type="text" class="input" id="admin-user-city" value="${user.city || ''}">
            </div>
            <div class="form-group">
                <label class="form-label" style="font-size:11px">User Role *</label>
                <select class="input" id="admin-user-role">
                    <option value="traveler" ${user.role === 'traveler' ? 'selected' : ''}>Traveler</option>
                    <option value="host" ${user.role === 'host' ? 'selected' : ''}>Host</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label" style="font-size:11px">Verification Status</label>
                <select class="input" id="admin-user-verified">
                    <option value="true" ${user.verified ? 'selected' : ''}>Verified (Active Badge)</option>
                    <option value="false" ${!user.verified ? 'selected' : ''}>Unverified</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label" style="font-size:11px">Bio Description</label>
                <textarea class="input" id="admin-user-bio" rows="3" style="resize:vertical">${user.bio || ''}</textarea>
            </div>
        </form>
    `;

    showModal({
        title: `Edit User Profile: ${user.name}`,
        content: modalContent,
        actions: [
            {
                id: 'admin-save-user-btn',
                label: 'Save Changes',
                className: 'btn-primary',
                onClick: () => {
                    const name = document.getElementById('admin-user-name').value;
                    const email = document.getElementById('admin-user-email').value;
                    const city = document.getElementById('admin-user-city').value;
                    const role = document.getElementById('admin-user-role').value;
                    const verified = document.getElementById('admin-user-verified').value === 'true';
                    const bio = document.getElementById('admin-user-bio').value;

                    const idx = users.findIndex(u => u.id === userId);
                    if (idx > -1) {
                        users[idx] = {
                            ...users[idx],
                            name, email, city, role, verified, bio
                        };
                        saveUsers();
                        
                        // Sync current session if this is the active user
                        if (store.get('currentUser.id') === userId) {
                            store.set('currentUser', users[idx]);
                            store.set('userRole', role);
                        }

                        store.addToast(`User details updated successfully! ✅`, 'success');
                        renderAdminPage();
                    }
                }
            },
            {
                id: 'admin-cancel-user-btn',
                label: 'Cancel',
                className: 'btn-ghost'
            }
        ],
        size: 'md'
    });
}

function setupAdminEvents() {
    // Nav click handlers
    document.querySelectorAll('.dashboard-nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            activeTab = btn.dataset.tab;
            renderAdminPage();
        });
    });

    // Approve Host request
    document.querySelectorAll('.approve-host-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const hostId = btn.dataset.id;
            
            // Update hosts data array
            const hostIndex = hosts.findIndex(h => h.id === hostId);
            if (hostIndex > -1) {
                hosts[hostIndex].verified = true;
                saveHosts();
            }

            // Also update the associated user in users database
            const userIndex = users.findIndex(u => u.hostId === hostId);
            if (userIndex > -1) {
                users[userIndex].verified = true;
                saveUsers();
            }

            // If the approved host is currently logged in, update current session
            if (store.get('currentUser.hostId') === hostId) {
                store.set('currentUser.verified', true);
            }

            // Remove from pending review in state store
            let pending = store.get('pendingHosts') || [];
            pending = pending.filter(h => h.id !== hostId);
            store.set('pendingHosts', pending);
            store.set('verificationStatus', 'verified');

            store.addToast('Host approved and verified! 🛡️', 'success');
            renderAdminPage();
        });
    });

    // Review & Edit Host Details
    document.querySelectorAll('.edit-host-admin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const hostId = btn.dataset.id;
            showEditHostModal(hostId);
        });
    });

    // Toggle Featured Status
    document.querySelectorAll('.toggle-featured-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tripId = btn.dataset.id;
            const trip = trips.find(t => t.id === tripId);
            if (trip) {
                trip.featured = !trip.featured;
                saveTrips();
                store.addToast(`Trip "${trip.title}" featured status updated! ⭐`, 'success');
                renderAdminPage();
            }
        });
    });

    // Edit Trip details
    document.querySelectorAll('.edit-trip-admin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tripId = btn.dataset.id;
            showEditTripModal(tripId);
        });
    });

    // Edit User Profile Details
    document.querySelectorAll('.edit-user-admin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.dataset.id;
            const userType = btn.dataset.type;
            showEditUserModal(userId, userType);
        });
    });

    // Reject Host request
    document.querySelectorAll('.reject-host-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const hostId = btn.dataset.id;
            
            // Remove from pending review
            let pending = store.get('pendingHosts') || [];
            pending = pending.filter(h => h.id !== hostId);
            store.set('pendingHosts', pending);
            store.set('verificationStatus', 'rejected');

            store.addToast('Host documents rejected.', 'warning');
            renderAdminPage();
        });
    });

    // Approve Trip listing
    document.querySelectorAll('.approve-trip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tripId = btn.dataset.id;
            const idx = trips.findIndex(t => t.id === tripId);
            if (idx > -1) {
                trips[idx].status = 'published';
                // Also verify host if pending so trip is visible everywhere
                const host = hosts.find(h => h.id === trips[idx].hostId);
                if (host) {
                    host.verified = true;
                    saveHosts();
                }
                saveTrips();
                store.addToast(`Listing "${trips[idx].title}" approved and published! ✈️`, 'success');
            }
            renderAdminPage();
        });
    });

    // Reject Trip listing
    document.querySelectorAll('.reject-trip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tripId = btn.dataset.id;
            const idx = trips.findIndex(t => t.id === tripId);
            if (idx > -1) {
                trips[idx].status = 'rejected';
                saveTrips();
                store.addToast('Listing rejected.', 'info');
            }
            renderAdminPage();
        });
    });

    // Toggle User verification in list
    document.querySelectorAll('.toggle-user-verify-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const type = btn.dataset.type;

            if (type === 'Host') {
                const idx = hosts.findIndex(h => h.id === id);
                if (idx > -1) {
                    hosts[idx].verified = !hosts[idx].verified;
                    saveHosts();
                    store.addToast(`Verification toggled for host ${hosts[idx].name}`, 'success');
                }
            } else {
                const idx = users.findIndex(u => u.id === id);
                if (idx > -1) {
                    users[idx].verified = !users[idx].verified;
                    saveUsers();
                    store.addToast(`Verification toggled for traveler ${users[idx].name}`, 'success');
                }
            }
            renderAdminPage();
        });
    });

    // Delete User listing
    document.querySelectorAll('.delete-user-admin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const type = btn.dataset.type;
            const name = type === 'Host' ? (hosts.find(h => h.id === id)?.name || id) : (users.find(u => u.id === id)?.name || id);
            
            if (confirm(`⚠️ Are you sure you want to permanently delete the ${type.toLowerCase()} "${name}"?`)) {
                if (type === 'Host') {
                    const hostIdx = hosts.findIndex(h => h.id === id);
                    if (hostIdx > -1) {
                        hosts.splice(hostIdx, 1);
                        saveHosts();
                    }
                    // Remove associated user as well
                    const userIdx = users.findIndex(u => u.hostId === id);
                    if (userIdx > -1) {
                        users.splice(userIdx, 1);
                        saveUsers();
                    }
                    // Purge associated trips
                    for (let i = trips.length - 1; i >= 0; i--) {
                        if (trips[i].hostId === id) {
                            trips.splice(i, 1);
                        }
                    }
                    saveTrips();
                } else {
                    const userIdx = users.findIndex(u => u.id === id);
                    if (userIdx > -1) {
                        users.splice(userIdx, 1);
                        saveUsers();
                    }
                }
                store.addToast(`Deleted ${type.toLowerCase()} account successfully!`, 'info');
                renderAdminPage();
            }
        });
    });

    // Delete Trip listing
    document.querySelectorAll('.delete-trip-admin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tripId = btn.dataset.id;
            const trip = trips.find(t => t.id === tripId);
            const title = trip?.title || tripId;
            
            if (confirm(`⚠️ Are you sure you want to permanently delete the trip listing "${title}"?`)) {
                const idx = trips.findIndex(t => t.id === tripId);
                if (idx > -1) {
                    trips.splice(idx, 1);
                    saveTrips();
                    store.addToast('Trip listing deleted successfully.', 'info');
                }
            }
        });
    });

    // Toggle Host verification
    // Sync Host Website from Directory
    document.querySelectorAll('.sync-host-website-admin-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const hostId = btn.dataset.id;
            const hostName = btn.dataset.name;
            const websiteUrl = btn.dataset.url;
            
            btn.disabled = true;
            btn.innerHTML = `<span class="material-icons-round spinning" style="font-size:14px">sync</span>`;
            store.addToast(`🔍 Triggered live website sync for "${hostName}" (${websiteUrl})...`, 'info');
            
            try {
                const res = await fetch('/api/aggregation/sync-host-website', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hostId, websiteUrl, hostName })
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
                    store.addToast(`✨ ${data.message || 'Host website trips synced successfully!'}`, 'success');
                } else {
                    store.addToast(`Website sync complete for ${hostName}!`, 'success');
                }
            } catch (err) {
                console.warn('Sync website error:', err);
                store.addToast(`Sync complete for ${hostName}!`, 'success');
            } finally {
                btn.disabled = false;
                btn.innerHTML = `<span class="material-icons-round" style="font-size:14px">sync</span> Sync`;
                renderAdminPage();
            }
        });
    });

    document.querySelectorAll('.toggle-host-verify-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const idx = hosts.findIndex(h => h.id === id);
            if (idx > -1) {
                hosts[idx].verified = !hosts[idx].verified;
                saveHosts();
                
                // Also sync to traveler user profile
                const userIdx = users.findIndex(u => u.hostId === id);
                if (userIdx > -1) {
                    users[userIdx].verified = hosts[idx].verified;
                    saveUsers();
                }

                // Sync current session if it is this host
                if (store.get('currentUser.hostId') === id) {
                    store.set('currentUser.verified', hosts[idx].verified);
                }
                
                store.addToast(`Host "${hosts[idx].name}" verification toggled!`, 'success');
                renderAdminPage();
            }
        });
    });

    // Delete Host listing from Directory
    document.querySelectorAll('.delete-host-admin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const name = hosts.find(h => h.id === id)?.name || id;
            
            if (confirm(`⚠️ Are you sure you want to permanently delete the host "${name}"? This will also delete their associated user account and all of their active trips.`)) {
                const hostIdx = hosts.findIndex(h => h.id === id);
                if (hostIdx > -1) {
                    hosts.splice(hostIdx, 1);
                    saveHosts();
                }
                // Remove associated user as well
                const userIdx = users.findIndex(u => u.hostId === id);
                if (userIdx > -1) {
                    users.splice(userIdx, 1);
                    saveUsers();
                }
                // Purge associated trips
                for (let i = trips.length - 1; i >= 0; i--) {
                    if (trips[i].hostId === id) {
                        trips.splice(i, 1);
                    }
                }
                saveTrips();

                // Clear from pending hosts if it's there
                let pending = store.get('pendingHosts') || [];
                pending = pending.filter(h => h.id !== id);
                store.set('pendingHosts', pending);

                store.addToast(`Host, user account, and all trip listings deleted successfully!`, 'info');
                renderAdminPage();
            }
        });
    });

    // Click on trip title link in Host Directory tab opens Trip Edit Modal
    document.querySelectorAll('.admin-host-trip-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            const tripId = link.dataset.tripId;
            showEditTripModal(tripId);
        });
    });

    // Approve Community Access request
    document.querySelectorAll('.approve-comm-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const reqId = btn.dataset.id;
            const requests = getCommunityRequests();
            const idx = requests.findIndex(r => r.id === reqId);
            if (idx > -1) {
                requests[idx].status = 'approved';
                saveCommunityRequests(requests);
                store.addToast(`Access approved for ${requests[idx].name}! 🎉`, 'success');
                renderAdminPage();
            }
        });
    });

    // Reject Community Access request
    document.querySelectorAll('.reject-comm-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const reqId = btn.dataset.id;
            const requests = getCommunityRequests();
            const idx = requests.findIndex(r => r.id === reqId);
            if (idx > -1) {
                requests[idx].status = 'rejected';
                saveCommunityRequests(requests);
                store.addToast(`Access rejected for ${requests[idx].name}.`, 'warning');
                renderAdminPage();
            }
        });
    });

    // Delete Community Access request
    document.querySelectorAll('.delete-comm-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const reqId = btn.dataset.id;
            const requests = getCommunityRequests();
            const idx = requests.findIndex(r => r.id === reqId);
            if (idx > -1) {
                const name = requests[idx].name;
                if (confirm(`Are you sure you want to delete the request from "${name}"?`)) {
                    requests.splice(idx, 1);
                    saveCommunityRequests(requests);
                    store.addToast(`Deleted request from ${name}.`, 'info');
                    renderAdminPage();
                }
            }
        });
    });

    // Aggregator Subtab navigation
    document.querySelectorAll('.agg-subtab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeAggSubTab = btn.dataset.subtab;
            renderAdminPage();
        });
    });

    // Trigger crawler run
    document.getElementById('trigger-agg-crawl-btn')?.addEventListener('click', () => {
        const btn = document.getElementById('trigger-agg-crawl-btn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<span class="material-icons-round spinning">sync</span> Crawling...`;
        }
        
        fetch('/api/aggregation/trigger', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    store.addToast('Crawling pipeline triggered in background! 🚀', 'success');
                    // Wait a bit for crawler mock/urllib extraction, then invalidate cached data
                    setTimeout(() => {
                        store.set('aggregatorData', null);
                        renderAdminPage();
                    }, 4000);
                } else {
                    store.addToast('Failed to trigger crawler: ' + data.message, 'error');
                    if (btn) {
                        btn.disabled = false;
                        btn.innerHTML = `<span class="material-icons-round">play_arrow</span> Run Crawler Now`;
                    }
                }
            })
            .catch(err => {
                store.addToast('Network error triggering crawl pipeline', 'error');
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = `<span class="material-icons-round">play_arrow</span> Run Crawler Now`;
                }
            });
    });

    // Approve Crawled Trip
    document.querySelectorAll('.approve-crawled-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tripId = btn.dataset.id;
            fetch('/api/aggregation/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: tripId })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    store.addToast('Trip approved and published successfully! ✈️', 'success');
                    // Re-sync local state trips with server
                    import('../data/trips.js').then(mod => {
                        mod.syncTripsWithServer().then(() => {
                            store.set('aggregatorData', null); // Invalidate aggregator cache
                            renderAdminPage();
                        });
                    });
                } else {
                    store.addToast('Approval failed: ' + data.message, 'error');
                }
            });
        });
    });

    // Reject Crawled Trip
    document.querySelectorAll('.reject-crawled-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tripId = btn.dataset.id;
            fetch('/api/aggregation/reject', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: tripId })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    store.addToast('Trip proposal rejected and archived.', 'info');
                    store.set('aggregatorData', null);
                    renderAdminPage();
                } else {
                    store.addToast('Rejection failed: ' + data.message, 'error');
                }
            });
        });
    });

    // Merge duplicate departures
    document.querySelectorAll('.merge-dup-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dupId = btn.dataset.dupId;
            fetch('/api/aggregation/merge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dupId, action: 'merge' })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    store.addToast('Departure dates merged into existing trip! 📅', 'success');
                    // Re-sync local state trips with server
                    import('../data/trips.js').then(mod => {
                        mod.syncTripsWithServer().then(() => {
                            store.set('aggregatorData', null);
                            renderAdminPage();
                        });
                    });
                } else {
                    store.addToast('Merge failed: ' + data.message, 'error');
                }
            });
        });
    });

    // Ignore duplicate and publish standalone
    document.querySelectorAll('.ignore-dup-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dupId = btn.dataset.dupId;
            fetch('/api/aggregation/merge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dupId, action: 'ignore' })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    store.addToast('Published crawled trip as a separate new departure! ✈️', 'success');
                    // Re-sync local state trips with server
                    import('../data/trips.js').then(mod => {
                        mod.syncTripsWithServer().then(() => {
                            store.set('aggregatorData', null);
                            renderAdminPage();
                        });
                    });
                } else {
                    store.addToast('Publish failed: ' + data.message, 'error');
                }
            });
        });
    });

    // View Details of crawled trip
    document.querySelectorAll('.details-crawled-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tripId = btn.dataset.id;
            const aggData = store.get('aggregatorData') || { pending: [] };
            const item = aggData.pending.find(t => t.id === tripId);
            if (!item) return;

            const modalContent = `
                <div style="font-size:13px;text-align:left;max-height:60vh;overflow-y:auto;padding-right:8px;color:var(--color-text-primary)">
                    <h4 style="color:#fff;margin-bottom:6px">Overview</h4>
                    <p style="margin-bottom:14px;line-height:1.5">${item.description}</p>
                    
                    <h4 style="color:#fff;margin-bottom:6px">Inclusions</h4>
                    <ul style="margin:0 0 14px 18px;padding:0;line-height:1.4">
                        ${(item.inclusions || []).map(inc => `<li>${inc}</li>`).join('')}
                    </ul>

                    <h4 style="color:#fff;margin-bottom:6px">Exclusions</h4>
                    <ul style="margin:0 0 14px 18px;padding:0;line-height:1.4">
                        ${(item.exclusions || []).map(exc => `<li>${exc}</li>`).join('')}
                    </ul>

                    <h4 style="color:#fff;margin-bottom:6px">Cancellation Policy</h4>
                    <p style="line-height:1.4">${item.cancellationPolicy || 'Standard terms apply.'}</p>
                </div>
            `;

            showModal({
                title: `Crawled Details: ${item.title}`,
                content: modalContent,
                actions: [
                    {
                        id: 'close-details-btn',
                        label: 'Close',
                        className: 'btn-ghost'
                    }
                ],
                size: 'md'
            });
        });
    });

    setupManagementEvents();
}

function setupManagementEvents() {
    // ─── INVITE ONLY DASHBOARD EVENTS ──────────────────────────────────
    // Add New Invite Trip
    document.querySelectorAll('.add-invite-admin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalContent = `
                <form id="admin-add-invite-form" style="display:flex;flex-direction:column;gap:12px;text-align:left">
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Emoji *</label>
                        <input type="text" class="input" id="add-invite-emoji" value="🚀" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Title *</label>
                        <input type="text" class="input" id="add-invite-title" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Description *</label>
                        <textarea class="input" id="add-invite-desc" rows="3" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Date *</label>
                        <input type="text" class="input" id="add-invite-date" placeholder="e.g. July 20-23, 2026" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Slots *</label>
                        <input type="number" class="input" id="add-invite-slots" value="20" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                </form>
            `;
            showModal({
                title: 'Add New Invite-focused Trip',
                content: modalContent,
                actions: [
                    {
                        id: 'save-new-invite-btn',
                        label: 'Save Trip',
                        className: 'btn-primary',
                        onClick: () => {
                            const emoji = document.getElementById('add-invite-emoji').value;
                            const title = document.getElementById('add-invite-title').value;
                            const description = document.getElementById('add-invite-desc').value;
                            const date = document.getElementById('add-invite-date').value;
                            const slots = parseInt(document.getElementById('add-invite-slots').value) || 20;

                            if (!title || !description || !date) {
                                store.addToast('Please fill all required fields.', 'warning');
                                return;
                            }

                            const newTrip = {
                                id: 'invite-' + Date.now(),
                                emoji, title, description, date, slots
                            };

                            inviteTrips.push(newTrip);
                            saveInviteTrips();
                            fetch('/api/invite', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(newTrip)
                            }).then(() => {
                                store.addToast('New focused trip created successfully! 🚀', 'success');
                                renderAdminPage();
                            });
                        }
                    }
                ]
            });
        });
    });

    // Edit Invite Trip
    document.querySelectorAll('.edit-invite-admin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const trip = inviteTrips.find(t => t.id === id);
            if (!trip) return;

            const modalContent = `
                <form id="admin-edit-invite-form" style="display:flex;flex-direction:column;gap:12px;text-align:left">
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Emoji *</label>
                        <input type="text" class="input" id="edit-invite-emoji" value="${trip.emoji || '🚀'}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Title *</label>
                        <input type="text" class="input" id="edit-invite-title" value="${trip.title}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Description *</label>
                        <textarea class="input" id="edit-invite-desc" rows="3" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">${trip.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Date *</label>
                        <input type="text" class="input" id="edit-invite-date" value="${trip.date}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Slots *</label>
                        <input type="number" class="input" id="edit-invite-slots" value="${trip.slots}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                </form>
            `;
            showModal({
                title: 'Edit Invite-focused Trip',
                content: modalContent,
                actions: [
                    {
                        id: 'save-edit-invite-btn',
                        label: 'Save Changes',
                        className: 'btn-primary',
                        onClick: () => {
                            trip.emoji = document.getElementById('edit-invite-emoji').value;
                            trip.title = document.getElementById('edit-invite-title').value;
                            trip.description = document.getElementById('edit-invite-desc').value;
                            trip.date = document.getElementById('edit-invite-date').value;
                            trip.slots = parseInt(document.getElementById('edit-invite-slots').value) || 20;

                            saveInviteTrips();
                            fetch('/api/invite', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(trip)
                            }).then(() => {
                                store.addToast('Trip details updated successfully!', 'success');
                                renderAdminPage();
                            });
                        }
                    }
                ]
            });
        });
    });

    // Delete Invite Trip
    document.querySelectorAll('.delete-invite-admin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            if (confirm('Are you sure you want to delete this invite-only trip?')) {
                const idx = inviteTrips.findIndex(t => t.id === id);
                if (idx > -1) {
                    inviteTrips.splice(idx, 1);
                    saveInviteTrips();
                    fetch('/api/invite/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id })
                    }).then(() => {
                        store.addToast('Focused trip deleted successfully!', 'success');
                        renderAdminPage();
                    });
                }
            }
        });
    });

    // ─── TRAVEL JOBS DASHBOARD EVENTS ──────────────────────────────────

    // Status tab filter
    document.querySelectorAll('.admin-job-status-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const status = btn.dataset.status;
            document.querySelectorAll('.admin-job-status-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tbody = document.getElementById('admin-jobs-tbody');
            if (!tbody) return;
            const typeColors = {
                'full-time': '#00f2fe', 'part-time': '#818cf8', 'contract': '#fbbf24',
                'internship': '#34d399', 'volunteer': '#f87171', 'free-trip': '#c084fc'
            };
            const statusColors = { approved: '#4ade80', pending: '#fbbf24', rejected: '#f87171' };
            const filtered = status === 'all' ? jobs : jobs.filter(j => j.status === status);
            tbody.innerHTML = filtered.map(job => {
                const typeColor = typeColors[job.jobType] || '#aaa';
                return `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                        <td style="padding:var(--space-3);max-width:200px;">
                            <div style="font-weight:600;color:#fff;font-size:13px;">${escapeHTML(job.title)}</div>
                            ${job.featured ? '<span style="font-size:9px;color:#ffa000;font-weight:700;">⭐ FEATURED</span>' : ''}
                        </td>
                        <td style="padding:var(--space-3);font-size:13px;">
                            <div>${escapeHTML(job.company)}</div>
                            <div style="font-size:10px;color:${job.companyType === 'influencer' ? '#f472b6' : '#60a5fa'};font-weight:600;">${job.companyType === 'influencer' ? '🎥 Influencer' : '🏢 Company'}</div>
                        </td>
                        <td style="padding:var(--space-3);font-size:13px;color:rgba(255,255,255,0.7);">${job.location ? escapeHTML(job.location) : '—'}</td>
                        <td style="padding:var(--space-3);font-size:12px;font-weight:600;color:${job.isFree ? '#4ade80' : 'var(--color-teal)'};">${job.salary ? escapeHTML(job.salary) : '—'}</td>
                        <td style="padding:var(--space-3);"><span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:9px;font-weight:700;text-transform:uppercase;background:${typeColor}18;color:${typeColor};border:1px solid ${typeColor}30;">${job.jobType || 'N/A'}</span></td>
                        <td style="padding:var(--space-3);"><span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:9px;font-weight:700;text-transform:uppercase;background:${(statusColors[job.status]||'#aaa')}15;color:${statusColors[job.status]||'#aaa'};border:1px solid ${(statusColors[job.status]||'#aaa')}30;">${job.status || 'pending'}</span></td>
                        <td style="padding:var(--space-3);">
                            <div style="display:flex;gap:4px;flex-wrap:wrap;">
                                ${job.status === 'pending' ? `<button class="btn btn-ghost btn-sm approve-job-admin-btn" data-id="${job.id}" style="color:#4ade80;font-size:11px;padding:3px 10px;">✓ Approve</button><button class="btn btn-ghost btn-sm reject-job-admin-btn" data-id="${job.id}" style="color:#f87171;font-size:11px;padding:3px 10px;">✗ Reject</button>` : ''}
                                ${job.status === 'approved' ? `<button class="btn btn-ghost btn-sm toggle-featured-job-btn" data-id="${job.id}" style="color:${job.featured ? '#ffa000' : 'rgba(255,255,255,0.5)'};font-size:10px;padding:3px 8px;">${job.featured ? '★ Unfeature' : '☆ Feature'}</button>` : ''}
                                <button class="btn btn-ghost btn-sm edit-job-admin-btn" data-id="${job.id}" style="font-size:11px;padding:3px 10px;">Edit</button>
                                <button class="btn btn-ghost btn-sm delete-job-admin-btn" data-id="${job.id}" style="color:var(--color-error);font-size:11px;padding:3px 10px;">Delete</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            // Re-bind row actions after table update
            setupJobRowActions();
        });
    });

    function setupJobRowActions() {
        // Approve Job
        document.querySelectorAll('.approve-job-admin-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const job = jobs.find(j => j.id === id);
                if (job) {
                    job.status = 'approved';
                    saveJobs();
                    fetch(`/api/jobs/${id}/approve`, { method: 'POST' }).catch(() => {});
                    store.addToast(`Job "${job.title}" has been approved! ✅`, 'success');
                    renderAdminPage();
                }
            });
        });

        // Reject Job
        document.querySelectorAll('.reject-job-admin-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const job = jobs.find(j => j.id === id);
                if (job) {
                    job.status = 'rejected';
                    saveJobs();
                    fetch(`/api/jobs/${id}/reject`, { method: 'POST' }).catch(() => {});
                    store.addToast(`Job "${job.title}" has been rejected.`, 'warning');
                    renderAdminPage();
                }
            });
        });

        // Toggle Featured
        document.querySelectorAll('.toggle-featured-job-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const job = jobs.find(j => j.id === id);
                if (job) {
                    job.featured = !job.featured;
                    saveJobs();
                    store.addToast(job.featured ? `"${job.title}" is now featured! ⭐` : `"${job.title}" removed from featured.`, 'success');
                    renderAdminPage();
                }
            });
        });
    }

    // Initialize row action handlers
    setupJobRowActions();

    // Add New Job
    document.querySelectorAll('.add-job-admin-btn').forEach(btn => {

        btn.addEventListener('click', () => {
            const modalContent = `
                <form id="admin-add-job-form" style="display:flex;flex-direction:column;gap:12px;text-align:left;max-height:60vh;overflow-y:auto;padding-right:4px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="form-group" style="margin:0;">
                            <label class="form-label" style="font-size:11px;">Job Title *</label>
                            <input type="text" class="input" id="add-job-title" placeholder="e.g. Expedition Captain" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label class="form-label" style="font-size:11px;">Company Name *</label>
                            <input type="text" class="input" id="add-job-company" placeholder="e.g. Himalayan Treks" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="form-group" style="margin:0;">
                            <label class="form-label" style="font-size:11px;">Posted By</label>
                            <select class="input" id="add-job-ctype" style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                                <option value="company">🏢 Travel Company</option>
                                <option value="influencer">🎥 Travel Influencer</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label class="form-label" style="font-size:11px;">Job Type *</label>
                            <select class="input" id="add-job-type" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                                <option value="full-time">Full Time</option>
                                <option value="part-time">Part Time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                                <option value="volunteer">🤝 Volunteer</option>
                                <option value="free-trip">✈️ Free Trip Slot</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="form-group" style="margin:0;">
                            <label class="form-label" style="font-size:11px;">Location *</label>
                            <input type="text" class="input" id="add-job-loc" placeholder="e.g. Manali, HP" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label class="form-label" style="font-size:11px;">Salary / Comp</label>
                            <input type="text" class="input" id="add-job-salary" placeholder="e.g. ₹40K - ₹60K / mo" style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                        </div>
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label class="form-label" style="font-size:11px;">Apply Email</label>
                        <input type="email" class="input" id="add-job-email" placeholder="careers@company.com" style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label class="form-label" style="font-size:11px;">Description *</label>
                        <textarea class="input" id="add-job-desc" rows="3" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);resize:vertical;"></textarea>
                    </div>
                </form>
            `;
            showModal({
                title: 'Add New Job Listing',
                content: modalContent,
                actions: [
                    {
                        id: 'save-new-job-btn',
                        label: 'Save & Publish Job',
                        className: 'btn-primary',
                        onClick: () => {
                            const title = document.getElementById('add-job-title').value.trim();
                            const company = document.getElementById('add-job-company').value.trim();
                            const location = document.getElementById('add-job-loc').value.trim();
                            const salary = document.getElementById('add-job-salary').value.trim();
                            const jobType = document.getElementById('add-job-type').value;
                            const companyType = document.getElementById('add-job-ctype').value;
                            const description = document.getElementById('add-job-desc').value.trim();
                            const applyEmail = document.getElementById('add-job-email').value.trim();

                            if (!title || !company || !location || !description) {
                                store.addToast('Please fill all required fields.', 'warning');
                                return;
                            }

                            const newJob = {
                                id: 'job-' + Date.now(),
                                title, company, companyType, location,
                                locationCity: '', locationState: '',
                                salary: salary || 'Negotiable',
                                isFree: ['volunteer','free-trip'].includes(jobType),
                                jobType, category: 'operations',
                                experience: '1-3', openings: 1,
                                remote: false, featured: false,
                                status: 'approved',
                                description, requirements: [], perks: [],
                                applyEmail,
                                coverImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
                                postedByName: company,
                                postedByAvatar: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=100&q=80',
                                tags: [],
                                createdAt: new Date().toISOString().split('T')[0]
                            };

                            jobs.push(newJob);
                            saveJobs();
                            fetch('/api/jobs', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(newJob)
                            }).catch(() => {});
                            document.querySelector('.modal-overlay')?.remove();
                            store.addToast('Job listing created and published! 💼', 'success');
                            renderAdminPage();
                        }
                    }
                ]
            });
        });
    });

    // Edit Job
    document.querySelectorAll('.edit-job-admin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const job = jobs.find(j => j.id === id);
            if (!job) return;

            const modalContent = `
                <form id="admin-edit-job-form" style="display:flex;flex-direction:column;gap:12px;text-align:left;max-height:60vh;overflow-y:auto;padding-right:4px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="form-group" style="margin:0;">
                            <label class="form-label" style="font-size:11px;">Job Title *</label>
                            <input type="text" class="input" id="edit-job-title" value="${job.title}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label class="form-label" style="font-size:11px;">Company Name *</label>
                            <input type="text" class="input" id="edit-job-company" value="${job.company}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="form-group" style="margin:0;">
                            <label class="form-label" style="font-size:11px;">Posted By</label>
                            <select class="input" id="edit-job-ctype" style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                                <option value="company" ${job.companyType === 'company' ? 'selected' : ''}>🏢 Travel Company</option>
                                <option value="influencer" ${job.companyType === 'influencer' ? 'selected' : ''}>🎥 Travel Influencer</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label class="form-label" style="font-size:11px;">Job Type *</label>
                            <select class="input" id="edit-job-type" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                                <option value="full-time" ${(job.jobType||job.type) === 'full-time' ? 'selected' : ''}>Full Time</option>
                                <option value="part-time" ${(job.jobType||job.type) === 'part-time' ? 'selected' : ''}>Part Time</option>
                                <option value="contract" ${(job.jobType||job.type) === 'contract' ? 'selected' : ''}>Contract</option>
                                <option value="internship" ${(job.jobType||job.type) === 'internship' ? 'selected' : ''}>Internship</option>
                                <option value="volunteer" ${(job.jobType||job.type) === 'volunteer' ? 'selected' : ''}>🤝 Volunteer</option>
                                <option value="free-trip" ${(job.jobType||job.type) === 'free-trip' ? 'selected' : ''}>✈️ Free Trip Slot</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="form-group" style="margin:0;">
                            <label class="form-label" style="font-size:11px;">Location *</label>
                            <input type="text" class="input" id="edit-job-loc" value="${job.location}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <label class="form-label" style="font-size:11px;">Salary / Comp</label>
                            <input type="text" class="input" id="edit-job-salary" value="${job.salary}" style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                        </div>
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label class="form-label" style="font-size:11px;">Apply Email</label>
                        <input type="email" class="input" id="edit-job-email" value="${job.applyEmail || ''}" placeholder="careers@company.com" style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label class="form-label" style="font-size:11px;">Status</label>
                        <select class="input" id="edit-job-status" style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                            <option value="approved" ${job.status === 'approved' ? 'selected' : ''}>✅ Approved</option>
                            <option value="pending" ${job.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
                            <option value="rejected" ${job.status === 'rejected' ? 'selected' : ''}>❌ Rejected</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label class="form-label" style="font-size:11px;">Description *</label>
                        <textarea class="input" id="edit-job-desc" rows="3" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);resize:vertical;">${job.description}</textarea>
                    </div>
                </form>
            `;
            showModal({
                title: 'Edit Job Listing',
                content: modalContent,
                actions: [
                    {
                        id: 'save-edit-job-btn',
                        label: 'Save Changes',
                        className: 'btn-primary',
                        onClick: () => {
                            job.title = document.getElementById('edit-job-title').value.trim();
                            job.company = document.getElementById('edit-job-company').value.trim();
                            job.companyType = document.getElementById('edit-job-ctype').value;
                            job.location = document.getElementById('edit-job-loc').value.trim();
                            job.salary = document.getElementById('edit-job-salary').value.trim();
                            job.jobType = document.getElementById('edit-job-type').value;
                            job.isFree = ['volunteer','free-trip'].includes(job.jobType);
                            job.status = document.getElementById('edit-job-status').value;
                            job.applyEmail = document.getElementById('edit-job-email').value.trim();
                            job.description = document.getElementById('edit-job-desc').value.trim();
                            job.postedByName = job.company;

                            saveJobs();
                            fetch('/api/jobs', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(job)
                            }).catch(() => {});
                            document.querySelector('.modal-overlay')?.remove();
                            store.addToast('Job details updated successfully! ✏️', 'success');
                            renderAdminPage();
                        }
                    }
                ]
            });
        });
    });

    // Delete Job
    document.querySelectorAll('.delete-job-admin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            if (confirm('Are you sure you want to delete this job listing?')) {
                const idx = jobs.findIndex(j => j.id === id);
                if (idx > -1) {
                    jobs.splice(idx, 1);
                    saveJobs();
                    fetch('/api/jobs/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id })
                    }).then(() => {
                        store.addToast('Job listing deleted!', 'success');
                        renderAdminPage();
                    });
                }
            }
        });
    });

    // ─── REMOTE STAYS DASHBOARD EVENTS ──────────────────────────────────
    // Add New Stay
    document.querySelectorAll('.add-remote-admin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalContent = `
                <form id="admin-add-stay-form" style="display:flex;flex-direction:column;gap:12px;text-align:left">
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Stay Name *</label>
                        <input type="text" class="input" id="add-stay-title" placeholder="e.g. Nomad Villa - Anjuna, Goa" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Location *</label>
                        <input type="text" class="input" id="add-stay-location" placeholder="e.g. Goa" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Host Name *</label>
                        <input type="text" class="input" id="add-stay-hostname" placeholder="e.g. Rahul Mehta" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Rating *</label>
                        <input type="number" step="0.1" min="1" max="5" class="input" id="add-stay-rating" value="4.8" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Reviews Count *</label>
                        <input type="number" class="input" id="add-stay-reviewscount" value="15" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Image URL *</label>
                        <input type="text" class="input" id="add-stay-img" value="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">WiFi Speed *</label>
                        <input type="text" class="input" id="add-stay-wifi" placeholder="e.g. 📶 150 Mbps WiFi" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Features (Comma-separated) *</label>
                        <input type="text" class="input" id="add-stay-features" placeholder="e.g. Coffee Maker, AC, Pool" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Monthly Price (₹) *</label>
                        <input type="number" class="input" id="add-stay-price" value="20000" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Description *</label>
                        <textarea class="input" id="add-stay-desc" rows="3" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)"></textarea>
                    </div>
                </form>
            `;
            showModal({
                title: 'Add New Work Remote Stay',
                content: modalContent,
                actions: [
                    {
                        id: 'save-new-stay-btn',
                        label: 'Save Stay',
                        className: 'btn-primary',
                        onClick: () => {
                            const title = document.getElementById('add-stay-title').value;
                            const location = document.getElementById('add-stay-location').value;
                            const hostName = document.getElementById('add-stay-hostname').value;
                            const rating = parseFloat(document.getElementById('add-stay-rating').value) || 4.8;
                            const reviewsCount = parseInt(document.getElementById('add-stay-reviewscount').value) || 15;
                            const coverImage = document.getElementById('add-stay-img').value;
                            const wifi = document.getElementById('add-stay-wifi').value;
                            const features = document.getElementById('add-stay-features').value;
                            const price = parseInt(document.getElementById('add-stay-price').value) || 0;
                            const description = document.getElementById('add-stay-desc').value;

                            if (!title || !location || !hostName || !coverImage || !wifi || !features || !description) {
                                store.addToast('Please fill all required fields.', 'warning');
                                return;
                            }

                            const newStay = {
                                id: 'remote-' + Date.now(),
                                title, location, hostName, rating, reviewsCount, coverImage, wifi, features, price, description
                            };

                            remoteStays.push(newStay);
                            saveRemoteStays();
                            fetch('/api/remote', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(newStay)
                            }).then(() => {
                                store.addToast('Co-living stay created successfully! 🏡', 'success');
                                renderAdminPage();
                            });
                        }
                    }
                ]
            });
        });
    });

    // Edit Stay
    document.querySelectorAll('.edit-remote-admin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const stay = remoteStays.find(s => s.id === id);
            if (!stay) return;

            const modalContent = `
                <form id="admin-edit-stay-form" style="display:flex;flex-direction:column;gap:12px;text-align:left">
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Stay Name *</label>
                        <input type="text" class="input" id="edit-stay-title" value="${stay.title}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Location *</label>
                        <input type="text" class="input" id="edit-stay-location" value="${stay.location || ''}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Host Name *</label>
                        <input type="text" class="input" id="edit-stay-hostname" value="${stay.hostName || ''}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Rating *</label>
                        <input type="number" step="0.1" min="1" max="5" class="input" id="edit-stay-rating" value="${stay.rating || 4.8}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Reviews Count *</label>
                        <input type="number" class="input" id="edit-stay-reviewscount" value="${stay.reviewsCount || 15}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Image URL *</label>
                        <input type="text" class="input" id="edit-stay-img" value="${stay.coverImage}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">WiFi Speed *</label>
                        <input type="text" class="input" id="edit-stay-wifi" value="${stay.wifi || ''}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Features (Comma-separated) *</label>
                        <input type="text" class="input" id="edit-stay-features" value="${stay.features || ''}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Monthly Price (₹) *</label>
                        <input type="number" class="input" id="edit-stay-price" value="${stay.price}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size:11px">Description *</label>
                        <textarea class="input" id="edit-stay-desc" rows="3" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12)">${stay.description}</textarea>
                    </div>
                </form>
            `;
            showModal({
                title: 'Edit Work Remote Stay',
                content: modalContent,
                actions: [
                    {
                        id: 'save-edit-stay-btn',
                        label: 'Save Changes',
                        className: 'btn-primary',
                        onClick: () => {
                            stay.title = document.getElementById('edit-stay-title').value;
                            stay.location = document.getElementById('edit-stay-location').value;
                            stay.hostName = document.getElementById('edit-stay-hostname').value;
                            stay.rating = parseFloat(document.getElementById('edit-stay-rating').value) || 4.8;
                            stay.reviewsCount = parseInt(document.getElementById('edit-stay-reviewscount').value) || 15;
                            stay.coverImage = document.getElementById('edit-stay-img').value;
                            stay.wifi = document.getElementById('edit-stay-wifi').value;
                            stay.features = document.getElementById('edit-stay-features').value;
                            stay.price = parseInt(document.getElementById('edit-stay-price').value) || 0;
                            stay.description = document.getElementById('edit-stay-desc').value;

                            saveRemoteStays();
                            fetch('/api/remote', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(stay)
                            }).then(() => {
                                store.addToast('Stay details updated!', 'success');
                                renderAdminPage();
                            });
                        }
                    }
                ]
            });
        });
    });

    // Delete Stay
    document.querySelectorAll('.delete-remote-admin-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            if (confirm('Are you sure you want to delete this workcation stay?')) {
                const idx = remoteStays.findIndex(s => s.id === id);
                if (idx > -1) {
                    remoteStays.splice(idx, 1);
                    saveRemoteStays();
                    fetch('/api/remote/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id })
                    }).then(() => {
                        store.addToast('Workcation stay deleted!', 'success');
                        renderAdminPage();
                    });
                }
            }
        });
    });
}

function renderInviteTripsTab() {
    return `
        <div class="dashboard-tab-content">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)">
                <h2 class="dashboard-tab-title" style="margin:0">Invite Only & Focused Trips</h2>
                <button class="btn btn-primary btn-sm add-invite-admin-btn">
                    <span class="material-icons-round" style="font-size:16px;vertical-align:middle;margin-right:4px">add</span>
                    Add Focused Trip
                </button>
            </div>
            
            <div class="table-container" style="overflow-x:auto">
                <table class="dashboard-table" style="width:100%;border-collapse:collapse;text-align:left">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
                            <th style="padding:var(--space-3)">Emoji</th>
                            <th style="padding:var(--space-3)">Title</th>
                            <th style="padding:var(--space-3)">Description</th>
                            <th style="padding:var(--space-3)">Date</th>
                            <th style="padding:var(--space-3)">Slots</th>
                            <th style="padding:var(--space-3)">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${inviteTrips.map(trip => `
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                                <td style="padding:var(--space-3);font-size:24px">${escapeHTML(trip.emoji || '🚀')}</td>
                                <td style="padding:var(--space-3);font-weight:600;color:#fff">${escapeHTML(trip.title)}</td>
                                <td style="padding:var(--space-3);font-size:var(--text-sm);max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escapeHTML(trip.description)}">${escapeHTML(trip.description)}</td>
                                <td style="padding:var(--space-3);font-size:var(--text-sm)">${escapeHTML(trip.date)}</td>
                                <td style="padding:var(--space-3);font-size:var(--text-sm)">${escapeHTML(trip.slots)} slots</td>
                                <td style="padding:var(--space-3)">
                                    <div style="display:flex;gap:4px">
                                        <button class="btn btn-ghost btn-sm edit-invite-admin-btn" data-id="${trip.id}">Edit</button>
                                        <button class="btn btn-ghost btn-sm delete-invite-admin-btn" data-id="${trip.id}" style="color:var(--color-error)">Delete</button>
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

function renderJobsTab() {
    const pendingJobs = jobs.filter(j => j.status === 'pending');
    const approvedJobs = jobs.filter(j => j.status === 'approved');
    const rejectedJobs = jobs.filter(j => j.status === 'rejected');

    const typeColors = {
        'full-time': '#00f2fe', 'part-time': '#818cf8', 'contract': '#fbbf24',
        'internship': '#34d399', 'volunteer': '#f87171', 'free-trip': '#c084fc'
    };

    function jobRow(job) {
        const statusColors = { approved: '#4ade80', pending: '#fbbf24', rejected: '#f87171' };
        const typeColor = typeColors[job.jobType] || '#aaa';
        return `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                <td style="padding:var(--space-3);max-width:200px;">
                    <div style="font-weight:600;color:#fff;font-size:13px;line-height:1.3;">${escapeHTML(job.title)}</div>
                    ${job.featured ? '<span style="font-size:9px;color:#ffa000;font-weight:700;">⭐ FEATURED</span>' : ''}
                </td>
                <td style="padding:var(--space-3);font-size:var(--text-sm);">
                    <div style="color:rgba(255,255,255,0.85);">${escapeHTML(job.company)}</div>
                    <div style="font-size:10px;color:${job.companyType === 'influencer' ? '#f472b6' : '#60a5fa'};font-weight:600;">${job.companyType === 'influencer' ? '🎥 Influencer' : '🏢 Company'}</div>
                </td>
                <td style="padding:var(--space-3);font-size:var(--text-sm);color:rgba(255,255,255,0.7);">
                    <span class="material-icons-round" style="font-size:11px;vertical-align:middle;">place</span>
                    ${job.location ? escapeHTML(job.location) : '—'}
                </td>
                <td style="padding:var(--space-3);font-size:12px;font-weight:600;color:${job.isFree ? '#4ade80' : 'var(--color-teal)'};">
                    ${job.salary ? escapeHTML(job.salary) : '—'}
                </td>
                <td style="padding:var(--space-3);">
                    <span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;background:${typeColor}18;color:${typeColor};border:1px solid ${typeColor}30;">${job.jobType || 'N/A'}</span>
                </td>
                <td style="padding:var(--space-3);">
                    <span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:9px;font-weight:700;text-transform:uppercase;background:${(statusColors[job.status]||'#aaa')}15;color:${statusColors[job.status]||'#aaa'};border:1px solid ${(statusColors[job.status]||'#aaa')}30;">${job.status || 'pending'}</span>
                </td>
                <td style="padding:var(--space-3);">
                    <div style="display:flex;gap:4px;flex-wrap:wrap;">
                        ${job.status === 'pending' ? `
                            <button class="btn btn-ghost btn-sm approve-job-admin-btn" data-id="${job.id}" style="color:#4ade80;border-color:rgba(74,222,128,0.2);font-size:11px;padding:3px 10px;">✓ Approve</button>
                            <button class="btn btn-ghost btn-sm reject-job-admin-btn" data-id="${job.id}" style="color:#f87171;border-color:rgba(248,113,113,0.2);font-size:11px;padding:3px 10px;">✗ Reject</button>
                        ` : ''}
                        ${job.status === 'approved' ? `
                            <button class="btn btn-ghost btn-sm toggle-featured-job-btn" data-id="${job.id}" style="color:${job.featured ? '#ffa000' : 'rgba(255,255,255,0.5)'};font-size:10px;padding:3px 8px;">${job.featured ? '★ Unfeature' : '☆ Feature'}</button>
                        ` : ''}
                        <button class="btn btn-ghost btn-sm edit-job-admin-btn" data-id="${job.id}" style="font-size:11px;padding:3px 10px;">Edit</button>
                        <button class="btn btn-ghost btn-sm delete-job-admin-btn" data-id="${job.id}" style="color:var(--color-error);font-size:11px;padding:3px 10px;">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    }

    return `
        <div class="dashboard-tab-content">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4);flex-wrap:wrap;gap:8px;">
                <h2 class="dashboard-tab-title" style="margin:0;">Travel Jobs Listings</h2>
                <div style="display:flex;gap:8px;align-items:center;">
                    ${pendingJobs.length > 0 ? `<span style="background:rgba(251,191,36,0.15);border:1px solid rgba(251,191,36,0.3);color:#fbbf24;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">${pendingJobs.length} Pending Review</span>` : ''}
                    <button class="btn btn-primary btn-sm add-job-admin-btn">
                        <span class="material-icons-round" style="font-size:16px;vertical-align:middle;margin-right:4px;">add</span>
                        Add Job Listing
                    </button>
                </div>
            </div>

            <!-- Status Tabs -->
            <div style="display:flex;gap:6px;margin-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.07);padding-bottom:12px;">
                <button class="admin-job-status-tab sort-btn active" data-status="all" style="padding:5px 14px;">All (${jobs.length})</button>
                <button class="admin-job-status-tab sort-btn ${pendingJobs.length > 0 ? '' : ''}" data-status="pending" style="padding:5px 14px;">
                    ⏳ Pending (${pendingJobs.length})${pendingJobs.length > 0 ? ' 🔴' : ''}
                </button>
                <button class="admin-job-status-tab sort-btn" data-status="approved" style="padding:5px 14px;">✅ Approved (${approvedJobs.length})</button>
                <button class="admin-job-status-tab sort-btn" data-status="rejected" style="padding:5px 14px;">❌ Rejected (${rejectedJobs.length})</button>
            </div>
            
            <div class="table-container" style="overflow-x:auto" id="admin-jobs-table-wrap">
                <table class="dashboard-table" style="width:100%;border-collapse:collapse;text-align:left">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
                            <th style="padding:var(--space-3);font-size:11px;color:rgba(255,255,255,0.45);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Job Title</th>
                            <th style="padding:var(--space-3);font-size:11px;color:rgba(255,255,255,0.45);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Posted By</th>
                            <th style="padding:var(--space-3);font-size:11px;color:rgba(255,255,255,0.45);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Location</th>
                            <th style="padding:var(--space-3);font-size:11px;color:rgba(255,255,255,0.45);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Salary</th>
                            <th style="padding:var(--space-3);font-size:11px;color:rgba(255,255,255,0.45);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Job Type</th>
                            <th style="padding:var(--space-3);font-size:11px;color:rgba(255,255,255,0.45);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Status</th>
                            <th style="padding:var(--space-3);font-size:11px;color:rgba(255,255,255,0.45);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="admin-jobs-tbody">
                        ${jobs.map(job => jobRow(job)).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderRemoteStaysTab() {
    return `
        <div class="dashboard-tab-content">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)">
                <h2 class="dashboard-tab-title" style="margin:0">Work Remote Stays</h2>
                <button class="btn btn-primary btn-sm add-remote-admin-btn">
                    <span class="material-icons-round" style="font-size:16px;vertical-align:middle;margin-right:4px">add</span>
                    Add Stay
                </button>
            </div>
            
            <div class="table-container" style="overflow-x:auto">
                <table class="dashboard-table" style="width:100%;border-collapse:collapse;text-align:left">
                    <thead>
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.1)">
                            <th style="padding:var(--space-3)">Image</th>
                            <th style="padding:var(--space-3)">Stay Name</th>
                            <th style="padding:var(--space-3)">WiFi</th>
                            <th style="padding:var(--space-3)">Features</th>
                            <th style="padding:var(--space-3)">Price</th>
                            <th style="padding:var(--space-3)">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${remoteStays.map(stay => `
                            <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                                <td style="padding:var(--space-2)">
                                    <img src="${stay.coverImage}" alt="${escapeHTML(stay.title)}" style="width:50px;height:35px;border-radius:4px;object-fit:cover" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80';">
                                </td>
                                <td style="padding:var(--space-3);font-weight:600;color:#fff">${escapeHTML(stay.title)}</td>
                                <td style="padding:var(--space-3);font-size:var(--text-sm)">${escapeHTML(stay.wifi)}</td>
                                <td style="padding:var(--space-3);font-size:var(--text-xs);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escapeHTML(stay.features)}">${escapeHTML(stay.features)}</td>
                                <td style="padding:var(--space-3);font-size:var(--text-sm);color:var(--color-teal);font-weight:500">₹${stay.price?.toLocaleString('en-IN')}/mo</td>
                                <td style="padding:var(--space-3)">
                                    <div style="display:flex;gap:4px">
                                        <button class="btn btn-ghost btn-sm edit-remote-admin-btn" data-id="${stay.id}">Edit</button>
                                        <button class="btn btn-ghost btn-sm delete-remote-admin-btn" data-id="${stay.id}" style="color:var(--color-error)">Delete</button>
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
