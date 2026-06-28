// ============================================
// Public Host Profile Page Component
// Portfolio of host trips, reviews, and achievements
// ============================================

import { hosts } from '../data/hosts.js';
import { trips } from '../data/trips.js';
import { renderTripGrid, setupTripCardEvents } from '../components/trip-card.js';

export function renderHostProfilePage(hostId) {
    const app = document.getElementById('app');
    if (!app) return;

    const host = hosts.find(h => h.id === hostId);
    if (!host) {
        app.innerHTML = `<div class="container" style="padding:100px 0;text-align:center"><h2>Host not found</h2><p class="text-muted">This host profile does not exist.</p><a href="#/" class="btn btn-primary" style="margin-top:20px">Go Home</a></div>`;
        return;
    }

    const hostTrips = host.verified ? trips.filter(t => t.hostId === host.id && t.status === 'published') : [];

    app.innerHTML = `
        <div class="host-profile-page" style="padding-top:calc(var(--nav-height) + var(--space-4));min-height:90vh;">
            <!-- Cover Header -->
            <div class="container animate-in">
                <div class="host-profile-cover glass-panel" style="position:relative;height:240px;border-radius:var(--radius-lg);overflow:hidden;margin-bottom:var(--space-6)">
                    <img src="${host.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80'}" alt="Cover Image" style="width:100%;height:100%;object-fit:cover;opacity:0.4">
                    <div style="position:absolute;bottom:var(--space-4);left:var(--space-4);display:flex;align-items:flex-end;gap:var(--space-4);flex-wrap:wrap">
                        <div class="avatar avatar-lg" style="border:3px solid var(--color-teal);box-shadow:var(--shadow-glow)">
                            <img src="${host.avatar}" alt="${host.name}">
                        </div>
                        <div style="margin-bottom:8px">
                            <h1 style="font-size:var(--text-2xl);margin-bottom:2px;display:flex;align-items:center;gap:6px">
                                ${host.name}
                                ${host.verified ? '<span class="material-icons-round" style="color:var(--color-teal);font-size:20px">verified</span>' : ''}
                            </h1>
                            <p class="text-muted" style="font-size:var(--text-sm)">${host.type} Host · ${host.location}, ${host.state}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Content Layout -->
            <div class="container" style="display:grid;grid-template-columns:1fr 2.5fr;gap:var(--space-6);align-items:start;flex-wrap:wrap">
                
                <!-- Left Sidebar Details -->
                <aside class="glass-panel animate-in-left" style="padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-5)">
                    <div>
                        <h3 style="margin-bottom:var(--space-2)">About Host</h3>
                        <p style="color:var(--color-text-secondary);font-size:var(--text-sm);line-height:1.5">${host.bio}</p>
                    </div>

                    <div style="border-top:1px solid rgba(255,255,255,0.05);padding-top:var(--space-4)">
                        <h4 style="margin-bottom:var(--space-2)">Response Stats</h4>
                        <div style="display:flex;flex-direction:column;gap:8px;font-size:var(--text-sm)">
                            <div style="display:flex;justify-content:space-between">
                                <span class="text-muted">Response Rate:</span>
                                <strong>${host.responseRate}%</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between">
                                <span class="text-muted">Response Time:</span>
                                <strong>${host.responseTime}</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between">
                                <span class="text-muted">Member Since:</span>
                                <strong>${(() => {
                                    const d = host.joinedDate ? new Date(host.joinedDate) : null;
                                    return (d && !isNaN(d.getTime())) ? d.toLocaleDateString([], {year:'numeric', month:'short'}) : 'Recently';
                                })()}</strong>
                            </div>
                        </div>
                    </div>

                    <div style="border-top:1px solid rgba(255,255,255,0.05);padding-top:var(--space-4)">
                        <h4 style="margin-bottom:var(--space-2)">Languages</h4>
                        <div style="display:flex;flex-wrap:wrap;gap:6px">
                            ${(host.languages || []).map(lang => `<span class="trip-tag" style="background:rgba(255,255,255,0.02)">${lang}</span>`).join('')}
                        </div>
                    </div>
                </aside>

                <!-- Right Main Content: Trips -->
                <main class="animate-in-right" style="display:flex;flex-direction:column;gap:var(--space-5)">
                    <div class="glass-panel" style="padding:var(--space-5)">
                        <h2 class="dashboard-tab-title">Departures by ${host.name}</h2>
                        
                        <div style="margin-top:var(--space-4)">
                            ${renderTripGrid(hostTrips, hosts, { columns: 'auto' })}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    `;

    setupTripCardEvents();
}
