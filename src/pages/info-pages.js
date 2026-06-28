// ============================================
// Platform Info & Showcase Pages
// Beautiful, premium layouts for remaining links
// ============================================

import { hosts } from '../data/hosts.js';
import { trips } from '../data/trips.js';
import { store, escapeHTML } from '../state.js';
import { showCommunityAccessModal } from '../components/modals.js';
import { jobs, syncJobsWithServer } from '../data/jobs.js';
import { remoteStays, syncRemoteStaysWithServer } from '../data/remote.js';
import { inviteTrips, syncInviteTripsWithServer } from '../data/invite.js';
import { showModal } from '../components/toast.js';

// ─── Experiences Page (#/experiences) ─────────────────────────────────
export function renderExperiencesPage() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div class="experiences-page" style="padding-top:calc(var(--nav-height) + var(--space-6));min-height:90vh;">
            <div class="container animate-in">
                <div class="section-header" style="margin-bottom:var(--space-6);text-align:center;flex-direction:column;align-items:center">
                    <h1 class="section-title">Local <span class="text-gradient">Experiences</span></h1>
                    <p class="section-subtitle" style="max-width:500px">Add unique micro-adventures and offbeat activities to your journey</p>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:var(--space-6)">
                    <div class="glass-card" style="overflow:hidden">
                        <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80" alt="Scuba Diving" style="width:100%;height:180px;object-fit:cover">
                        <div style="padding:var(--space-4)">
                            <span class="badge badge-teal" style="margin-bottom:8px">Water Sports</span>
                            <h3 style="margin-bottom:4px">Scuba Certification - Netrani Island</h3>
                            <p class="text-muted" style="font-size:var(--text-sm);margin-bottom:var(--space-4)">Get PADI certified with marine biologists. Includes 4 open water dives.</p>
                            <div style="display:flex;justify-content:space-between;align-items:center">
                                <strong>₹18,500 <span style="font-size:10px;color:var(--color-text-muted)">/ person</span></strong>
                                <button class="btn btn-primary btn-sm book-exp-btn" data-exp="Scuba Netrani">Book</button>
                            </div>
                        </div>
                    </div>
                    <div class="glass-card" style="overflow:hidden">
                        <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80" alt="Paragliding" style="width:100%;height:180px;object-fit:cover">
                        <div style="padding:var(--space-4)">
                            <span class="badge badge-amber" style="margin-bottom:8px">Adventure</span>
                            <h3 style="margin-bottom:4px">Tandem Paragliding - Bir Billing</h3>
                            <p class="text-muted" style="font-size:var(--text-sm);margin-bottom:var(--space-4)">Soar above the tea gardens of Bir Billing with certified instructors.</p>
                            <div style="display:flex;justify-content:space-between;align-items:center">
                                <strong>₹2,999 <span style="font-size:10px;color:var(--color-text-muted)">/ person</span></strong>
                                <button class="btn btn-primary btn-sm book-exp-btn" data-exp="Paragliding Bir">Book</button>
                            </div>
                        </div>
                    </div>
                    <div class="glass-card" style="overflow:hidden">
                        <img src="https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80" alt="Hot Air Balloon" style="width:100%;height:180px;object-fit:cover">
                        <div style="padding:var(--space-4)">
                            <span class="badge badge-coral" style="margin-bottom:8px">Heritage</span>
                            <h3 style="margin-bottom:4px">Hot Air Balloon Safari - Jaipur</h3>
                            <p class="text-muted" style="font-size:var(--text-sm);margin-bottom:var(--space-4)">Fly above the majestic forts of Jaipur at sunrise. Includes champagne breakfast.</p>
                            <div style="display:flex;justify-content:space-between;align-items:center">
                                <strong>₹12,499 <span style="font-size:10px;color:var(--color-text-muted)">/ person</span></strong>
                                <button class="btn btn-primary btn-sm book-exp-btn" data-exp="Balloon Jaipur">Book</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    setupExpPageEvents();
}

function setupExpPageEvents() {
    document.querySelectorAll('.book-exp-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const exp = btn.dataset.exp;
            store.addToast(`🎉 Reservation request for "${exp}" sent successfully!`, 'success');
        });
    });
}


// ─── Community Forum Page (#/community) ───────────────────────────────
export function renderCommunityPage() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div class="community-page" style="padding-top:calc(var(--nav-height) + var(--space-6));min-height:90vh;">
            <div class="container animate-in" style="display:grid;grid-template-columns:2fr 1fr;gap:var(--space-6);align-items:start">
                
                <!-- Left Content: Threads -->
                <div>
                    <div class="section-header" style="margin-bottom:var(--space-4)">
                        <div>
                            <h1 class="section-title" style="margin-bottom:0">Travelers <span class="text-gradient">Hub</span></h1>
                            <p class="section-subtitle">Find travel companions, ask questions, and share logs</p>
                        </div>
                        <button class="btn btn-primary btn-sm" id="create-post-btn">New Post</button>
                    </div>

                    <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                        <div class="glass-card" style="padding:var(--space-4)">
                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:var(--space-2)">
                                <span class="badge badge-teal" style="font-size:9px">Co-Travelers</span>
                                <span class="text-muted" style="font-size:var(--text-xs)">Posted by @ananya_wanders · 4 hours ago</span>
                            </div>
                            <h3 style="font-size:var(--text-md);margin-bottom:8px">Looking for a travel buddy for Himachal in June! 🏔️</h3>
                            <p style="color:var(--color-text-secondary);font-size:var(--text-sm)">Hey everyone, I am planning to join Priya's backpack trip to Spiti Valley on June 15th. Anyone else heading from Delhi? Let's connect and share the ride!</p>
                            <div style="display:flex;gap:var(--space-4);margin-top:var(--space-3);font-size:var(--text-xs);color:var(--color-text-muted)">
                                <span>💬 12 replies</span>
                                <span>🔥 45 views</span>
                            </div>
                        </div>

                        <div class="glass-card" style="padding:var(--space-4)">
                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:var(--space-2)">
                                <span class="badge badge-amber" style="font-size:9px">QA</span>
                                <span class="text-muted" style="font-size:var(--text-xs)">Posted by @rahul_coder · 1 day ago</span>
                            </div>
                            <h3 style="font-size:var(--text-md);margin-bottom:8px">Is Airtel network stable during Ladakh trek? 📶</h3>
                            <p style="color:var(--color-text-secondary);font-size:var(--text-sm)">Hello guys, I am going on the Ladakh Bike Expedition next week. Do I need to get a post-paid BSNL sim or will my Airtel work in Leh/Nubra?</p>
                            <div style="display:flex;gap:var(--space-4);margin-top:var(--space-3);font-size:var(--text-xs);color:var(--color-text-muted)">
                                <span>💬 8 replies</span>
                                <span>🔥 29 views</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Content: Sidebar -->
                <aside class="glass-panel" style="padding:var(--space-5)">
                    <h3 style="margin-bottom:var(--space-3)">Active Meetups</h3>
                    <div style="display:flex;flex-direction:column;gap:12px;font-size:var(--text-sm)">
                        <div style="border-left:3px solid var(--color-teal);padding-left:8px">
                            <strong>Delhi Traveler Coffee Meetup</strong>
                            <div class="text-muted" style="font-size:11px">Saturday, 5:00 PM · Connaught Place</div>
                        </div>
                        <div style="border-left:3px solid var(--color-amber);padding-left:8px">
                            <strong>Mumbai Sunset Photo Walk</strong>
                            <div class="text-muted" style="font-size:11px">Sunday, 4:30 PM · Marine Drive</div>
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    `;

    document.getElementById('create-post-btn')?.addEventListener('click', () => {
        store.addToast('Forum posting is simulated. Thanks for sharing! 🌍', 'success');
    });
}


// ─── Hosts Grid Page (#/hosts) ────────────────────────────────────────
export function renderHostsPage() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div class="hosts-page" style="padding-top:calc(var(--nav-height) + var(--space-6));min-height:90vh;">
            <div class="container animate-in">
                <div class="section-header" style="margin-bottom:var(--space-6);text-align:center;flex-direction:column;align-items:center">
                    <h1 class="section-title">Verified <span class="text-gradient">Hosts</span></h1>
                    <p class="section-subtitle" style="max-width:500px">Explore profiles of India's top travel influencers and verified travel companies</p>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:var(--space-6);margin-bottom:var(--space-10)">
                    ${hosts.map(host => `
                        <div class="glass-card" style="padding:var(--space-5);display:flex;flex-direction:column;justify-content:space-between">
                            <div>
                                <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3)">
                                    <div class="avatar avatar-md">
                                        <img src="${host.avatar}" alt="${host.name}">
                                    </div>
                                    <div>
                                        <h3 style="font-size:var(--text-md);margin-bottom:2px;display:flex;align-items:center;gap:4px">
                                            ${host.name}
                                            ${host.verified ? '<span class="material-icons-round" style="color:var(--color-teal);font-size:16px">verified</span>' : ''}
                                        </h3>
                                        <span class="text-muted" style="font-size:var(--text-xs);text-transform:capitalize">${host.type} Host · ${host.location}</span>
                                    </div>
                                </div>
                                <p style="color:var(--color-text-secondary);font-size:var(--text-sm);line-height:1.4;margin-bottom:var(--space-4)">
                                    ${(host.bio || '').slice(0, 140)}${(host.bio && host.bio.length > 140) ? '...' : ''}
                                </p>
                            </div>
                            <div>
                                <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--color-text-muted);border-top:1px solid rgba(255,255,255,0.05);padding-top:var(--space-3);margin-bottom:var(--space-4)">
                                    <span>⭐ ${host.rating} rating</span>
                                    <span>📋 ${host.tripCount} departures</span>
                                    <span>👥 ${host.travelerCount}+ guests</span>
                                </div>
                                <div style="display:flex;gap:var(--space-2)">
                                    <a href="#/host/${host.id}" class="btn btn-secondary btn-sm w-full">Profile</a>
                                    <a href="#/trips?host=${host.id}" class="btn btn-primary btn-sm w-full">Explore Trips</a>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Call to Action for hosting -->
                <div class="glass-card" style="padding:var(--space-8);text-align:center;max-width:800px;margin:0 auto var(--space-10);border-color:var(--color-teal)">
                    <span class="material-icons-round" style="font-size:48px;color:var(--color-teal);margin-bottom:var(--space-2)">storefront</span>
                    <h2 style="font-size:var(--text-2xl);margin-bottom:var(--space-2)">Are you a travel influencer or a top travel company?</h2>
                    <p class="text-muted" style="max-width:550px;margin:0 auto var(--space-6)">
                        Share your unique travel itineraries directly with your community or clients. Build credibility with a verified host profile, capture traveler leads, and manage bookings seamlessly.
                    </p>
                    <a href="#/host-register" class="btn btn-primary btn-lg" style="display:inline-flex;align-items:center;gap:8px">
                        <span class="material-icons-round">add_circle</span>
                        Become a Host Today
                    </a>
                </div>
            </div>
        </div>
    `;
}



// ─── Travel Jobs Page (#/jobs) ────────────────────────────────────────

// Jobs page filter state
let jobsSearchQuery = '';
let jobsTypeFilters = []; // 'full-time','part-time','contract','internship','volunteer','free-trip'
let jobsCompanyTypeFilter = 'all'; // 'all','influencer','company'
let jobsCategoryFilter = 'all';
let jobsExperienceFilter = 'all';
let jobsLocationFilter = 'all';
let jobsRemoteFilter = 'all'; // 'all','remote','onsite'
let jobsSortBy = 'newest';

export function renderJobsPage() {
    const app = document.getElementById('app');
    if (!app) return;

    syncJobsWithServer().then(updated => {
        if (updated) {
            const grid = document.getElementById('jobs-listings-grid');
            if (grid) {
                grid.innerHTML = getFilteredJobsHtml();
                bindJobsEvents();
            }
        }
    });

    const uniqueLocations = [...new Set(
        jobs.filter(j => j.status === 'approved').map(j => j.locationState).filter(Boolean)
    )].sort();

    app.innerHTML = `
        <div class="jobs-page" style="padding-top:calc(var(--nav-height) + var(--space-4));min-height:90vh;">
            <style>
                .jobs-filter-sidebar { width:260px; flex-shrink:0; }
                .jobs-filter-section { margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.06); }
                .jobs-filter-label { font-size:11px; font-weight:700; color:rgba(255,255,255,0.45); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px; }
                .jobs-filter-check { display:flex; align-items:center; gap:8px; padding:4px 0; cursor:pointer; font-size:13px; color:rgba(255,255,255,0.75); transition:color 0.2s; }
                .jobs-filter-check:hover { color:#fff; }
                .jobs-filter-check input[type=checkbox], .jobs-filter-check input[type=radio] { accent-color:var(--color-teal); width:14px; height:14px; cursor:pointer; }
                .job-card-pro { background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:20px; transition:all 0.25s ease; cursor:pointer; position:relative; overflow:hidden; }
                .job-card-pro:hover { border-color:rgba(0,242,254,0.3); background:rgba(0,242,254,0.03); transform:translateY(-2px); box-shadow:0 8px 30px rgba(0,0,0,0.3); }
                .job-card-pro.featured { border-color:rgba(255,160,0,0.35); background:rgba(255,160,0,0.03); }
                .job-card-pro.featured::before { content:'⭐ Featured'; position:absolute; top:12px; right:12px; font-size:9px; font-weight:700; background:rgba(255,160,0,0.15); color:#ffa000; border:1px solid rgba(255,160,0,0.3); border-radius:20px; padding:2px 8px; letter-spacing:0.05em; }
                .job-type-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; }
                .badge-full-time { background:rgba(0,242,254,0.12); color:#00f2fe; border:1px solid rgba(0,242,254,0.2); }
                .badge-part-time { background:rgba(99,102,241,0.12); color:#818cf8; border:1px solid rgba(99,102,241,0.2); }
                .badge-contract { background:rgba(245,158,11,0.12); color:#fbbf24; border:1px solid rgba(245,158,11,0.2); }
                .badge-internship { background:rgba(16,185,129,0.12); color:#34d399; border:1px solid rgba(16,185,129,0.2); }
                .badge-volunteer { background:rgba(239,68,68,0.12); color:#f87171; border:1px solid rgba(239,68,68,0.2); }
                .badge-free-trip { background:rgba(168,85,247,0.12); color:#c084fc; border:1px solid rgba(168,85,247,0.2); }
                .badge-influencer { background:rgba(236,72,153,0.1); color:#f472b6; border:1px solid rgba(236,72,153,0.2); }
                .badge-company { background:rgba(59,130,246,0.1); color:#60a5fa; border:1px solid rgba(59,130,246,0.2); }
                .job-tag { display:inline-block; padding:2px 8px; border-radius:20px; font-size:10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.55); margin:2px; }
                .jobs-sort-bar { display:flex; align-items:center; gap:8px; padding:10px 16px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:10px; margin-bottom:16px; flex-wrap:wrap; }
                .sort-btn { padding:4px 14px; border-radius:20px; border:1px solid rgba(255,255,255,0.1); background:transparent; color:rgba(255,255,255,0.6); font-size:12px; cursor:pointer; transition:all 0.2s; }
                .sort-btn.active, .sort-btn:hover { background:rgba(0,242,254,0.1); border-color:var(--color-teal); color:#fff; }
                .quick-filter-pill { padding:5px 14px; border-radius:20px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.65); font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s; }
                .quick-filter-pill:hover { background:rgba(0,242,254,0.08); border-color:var(--color-teal); color:#fff; }
                .quick-filter-pill.active { background:rgba(0,242,254,0.12); border-color:var(--color-teal); color:#00f2fe; }
                @media (max-width:768px) { .jobs-layout { flex-direction:column !important; } .jobs-filter-sidebar { width:100% !important; } }
            </style>

            <div class="container animate-in">
                <!-- Hero Header -->
                <div style="text-align:center; margin-bottom:32px;">
                    <div style="font-size:11px; font-weight:700; color:var(--color-teal); letter-spacing:0.2em; text-transform:uppercase; margin-bottom:8px;">✈️ Work. Wander. Explore.</div>
                    <h1 class="section-title">Jobs for <span class="text-gradient">Globetrotters</span></h1>
                    <p class="section-subtitle" style="max-width:560px; margin:0 auto 16px;">Discover jobs, internships, volunteer programs & free trip slots posted by top travel companies and influencers.</p>
                    
                    <!-- Quick Filters -->
                    <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-bottom:16px;">
                        <button class="quick-filter-pill ${jobsTypeFilters.includes('volunteer') ? 'active' : ''}" data-quick="volunteer">🤝 Volunteer</button>
                        <button class="quick-filter-pill ${jobsTypeFilters.includes('free-trip') ? 'active' : ''}" data-quick="free-trip">✈️ Free Trips</button>
                        <button class="quick-filter-pill ${jobsCompanyTypeFilter === 'influencer' ? 'active' : ''}" data-quick="influencer">🎥 By Influencer</button>
                        <button class="quick-filter-pill ${jobsCompanyTypeFilter === 'company' ? 'active' : ''}" data-quick="company">🏢 By Companies</button>
                        <button class="quick-filter-pill ${jobsTypeFilters.includes('internship') ? 'active' : ''}" data-quick="internship">📋 Internships</button>
                        <button class="quick-filter-pill ${jobsRemoteFilter === 'remote' ? 'active' : ''}" data-quick="remote">💻 Remote</button>
                    </div>

                    <!-- Post a Job CTA -->
                    ${store.get('currentUser') ? `
                        <button class="btn btn-primary" id="post-job-btn" style="margin:0 auto;">
                            <span class="material-icons-round" style="font-size:16px;vertical-align:middle;margin-right:6px;">add_circle_outline</span>
                            Post a Job / Trip Opportunity
                        </button>
                    ` : `
                        <a href="#/login" class="btn btn-secondary" style="font-size:13px;">Login to Post a Job Opportunity</a>
                    `}
                </div>

                <!-- Search Bar -->
                <div style="position:relative; max-width:700px; margin:0 auto 28px;">
                    <span class="material-icons-round" style="position:absolute; left:16px; top:50%; transform:translateY(-50%); color:rgba(255,255,255,0.4); font-size:20px; pointer-events:none;">search</span>
                    <input type="text" id="jobs-search-input" placeholder="Search by role, company, skill, destination..." value="${jobsSearchQuery}" style="width:100%; background:rgba(8,8,8,0.75); border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:14px 48px; color:#fff; font-size:14px; outline:none; font-family:var(--font-body); box-sizing:border-box; backdrop-filter:blur(20px);">
                    ${jobsSearchQuery ? `<button id="jobs-search-clear" style="position:absolute; right:16px; top:50%; transform:translateY(-50%); background:none; border:none; color:rgba(255,255,255,0.4); cursor:pointer; font-size:20px; line-height:1;">×</button>` : ''}
                </div>

                <!-- Main Layout -->
                <div class="jobs-layout" style="display:flex; gap:24px; align-items:flex-start;">
                    
                    <!-- Left Sidebar: Filters -->
                    <aside class="jobs-filter-sidebar glass-panel" style="padding:20px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:14px; position:sticky; top:calc(var(--nav-height) + 16px);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                            <h3 style="margin:0; font-size:14px; color:#fff; font-weight:700;">Filters</h3>
                            <button id="jobs-clear-filters" style="background:none; border:none; color:var(--color-teal); font-size:11px; cursor:pointer; font-weight:600;">Clear All</button>
                        </div>

                        <!-- Job Type -->
                        <div class="jobs-filter-section">
                            <div class="jobs-filter-label">Job Type</div>
                            ${[
                                {val:'full-time', label:'Full Time'},
                                {val:'part-time', label:'Part Time'},
                                {val:'contract', label:'Contract'},
                                {val:'internship', label:'Internship'},
                                {val:'volunteer', label:'🤝 Volunteer'},
                                {val:'free-trip', label:'✈️ Free Trip'}
                            ].map(t => `
                                <label class="jobs-filter-check">
                                    <input type="checkbox" class="job-type-filter" data-val="${t.val}" ${jobsTypeFilters.includes(t.val) ? 'checked' : ''}>
                                    ${t.label}
                                </label>
                            `).join('')}
                        </div>

                        <!-- Posted By -->
                        <div class="jobs-filter-section">
                            <div class="jobs-filter-label">Posted By</div>
                            ${[
                                {val:'all', label:'All Posters'},
                                {val:'influencer', label:'🎥 Travel Influencers'},
                                {val:'company', label:'🏢 Travel Companies'}
                            ].map(t => `
                                <label class="jobs-filter-check">
                                    <input type="radio" name="company-type-filter" class="job-ctype-filter" data-val="${t.val}" ${jobsCompanyTypeFilter === t.val ? 'checked' : ''}>
                                    ${t.label}
                                </label>
                            `).join('')}
                        </div>

                        <!-- Category -->
                        <div class="jobs-filter-section">
                            <div class="jobs-filter-label">Category</div>
                            <select id="jobs-category-filter" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:8px 10px; color:#fff; font-size:13px; cursor:pointer;">
                                <option value="all" ${jobsCategoryFilter === 'all' ? 'selected' : ''}>All Categories</option>
                                <option value="photography-content" ${jobsCategoryFilter === 'photography-content' ? 'selected' : ''}>📷 Photography / Content</option>
                                <option value="tour-guiding" ${jobsCategoryFilter === 'tour-guiding' ? 'selected' : ''}>🧭 Tour Guiding</option>
                                <option value="trip-management" ${jobsCategoryFilter === 'trip-management' ? 'selected' : ''}>🗺️ Trip Management</option>
                                <option value="operations" ${jobsCategoryFilter === 'operations' ? 'selected' : ''}>⚙️ Operations</option>
                                <option value="marketing" ${jobsCategoryFilter === 'marketing' ? 'selected' : ''}>📣 Marketing / Social</option>
                                <option value="hospitality" ${jobsCategoryFilter === 'hospitality' ? 'selected' : ''}>🏨 Hospitality</option>
                                <option value="volunteering" ${jobsCategoryFilter === 'volunteering' ? 'selected' : ''}>🤝 Volunteering</option>
                            </select>
                        </div>

                        <!-- Experience -->
                        <div class="jobs-filter-section">
                            <div class="jobs-filter-label">Experience</div>
                            ${[
                                {val:'all', label:'All Levels'},
                                {val:'fresher', label:'Fresher / No Experience'},
                                {val:'1-3', label:'1 – 3 Years'},
                                {val:'3-5', label:'3 – 5 Years'},
                                {val:'5+', label:'5+ Years'}
                            ].map(t => `
                                <label class="jobs-filter-check">
                                    <input type="radio" name="exp-filter" class="job-exp-filter" data-val="${t.val}" ${jobsExperienceFilter === t.val ? 'checked' : ''}>
                                    ${t.label}
                                </label>
                            `).join('')}
                        </div>

                        <!-- Location -->
                        <div class="jobs-filter-section">
                            <div class="jobs-filter-label">Location / State</div>
                            <select id="jobs-location-filter" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:8px 10px; color:#fff; font-size:13px; cursor:pointer;">
                                <option value="all" ${jobsLocationFilter === 'all' ? 'selected' : ''}>All Locations</option>
                                <option value="International" ${jobsLocationFilter === 'International' ? 'selected' : ''}>🌍 International</option>
                                ${uniqueLocations.filter(l => l !== 'International' && l !== 'Multiple').map(loc => `
                                    <option value="${loc}" ${jobsLocationFilter === loc ? 'selected' : ''}>${loc}</option>
                                `).join('')}
                                <option value="Multiple" ${jobsLocationFilter === 'Multiple' ? 'selected' : ''}>Multiple / Pan India</option>
                            </select>
                        </div>

                        <!-- Remote -->
                        <div class="jobs-filter-section" style="border-bottom:none; margin-bottom:0; padding-bottom:0;">
                            <div class="jobs-filter-label">Work Mode</div>
                            ${[
                                {val:'all', label:'All'},
                                {val:'remote', label:'💻 Remote / WFH'},
                                {val:'onsite', label:'📍 On-site / Travel'}
                            ].map(t => `
                                <label class="jobs-filter-check">
                                    <input type="radio" name="remote-filter" class="job-remote-filter" data-val="${t.val}" ${jobsRemoteFilter === t.val ? 'checked' : ''}>
                                    ${t.label}
                                </label>
                            `).join('')}
                        </div>
                    </aside>

                    <!-- Right: Job Listings -->
                    <div style="flex:1; min-width:0;">
                        <!-- Sort Bar -->
                        <div class="jobs-sort-bar">
                            <span style="font-size:11px; color:rgba(255,255,255,0.4); font-weight:700; text-transform:uppercase; letter-spacing:0.08em; margin-right:4px;">Sort:</span>
                            <button class="sort-btn ${jobsSortBy === 'newest' ? 'active' : ''}" data-sort="newest">Newest</button>
                            <button class="sort-btn ${jobsSortBy === 'featured' ? 'active' : ''}" data-sort="featured">Featured First</button>
                            <button class="sort-btn ${jobsSortBy === 'free' ? 'active' : ''}" data-sort="free">Free / Volunteer</button>
                            <span id="jobs-count-text" style="margin-left:auto; font-size:12px; color:rgba(255,255,255,0.4);"></span>
                        </div>

                        <!-- Listings Grid -->
                        <div id="jobs-listings-grid" style="display:flex; flex-direction:column; gap:12px;">
                            ${getFilteredJobsHtml()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    bindJobsEvents();
}

function getFilteredJobsHtml() {
    let filtered = jobs.filter(j => j.status === 'approved');

    if (jobsSearchQuery) {
        const q = jobsSearchQuery.toLowerCase();
        filtered = filtered.filter(j =>
            j.title?.toLowerCase().includes(q) ||
            j.company?.toLowerCase().includes(q) ||
            j.location?.toLowerCase().includes(q) ||
            j.description?.toLowerCase().includes(q) ||
            j.tags?.some(t => t.toLowerCase().includes(q))
        );
    }

    if (jobsTypeFilters.length > 0) {
        filtered = filtered.filter(j => jobsTypeFilters.includes(j.jobType));
    }

    if (jobsCompanyTypeFilter !== 'all') {
        filtered = filtered.filter(j => j.companyType === jobsCompanyTypeFilter);
    }

    if (jobsCategoryFilter !== 'all') {
        filtered = filtered.filter(j => j.category === jobsCategoryFilter);
    }

    if (jobsExperienceFilter !== 'all') {
        filtered = filtered.filter(j => j.experience === jobsExperienceFilter);
    }

    if (jobsLocationFilter !== 'all') {
        filtered = filtered.filter(j => j.locationState === jobsLocationFilter);
    }

    if (jobsRemoteFilter === 'remote') {
        filtered = filtered.filter(j => j.remote === true);
    } else if (jobsRemoteFilter === 'onsite') {
        filtered = filtered.filter(j => j.remote !== true);
    }

    // Sort
    if (jobsSortBy === 'newest') {
        filtered = filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (jobsSortBy === 'featured') {
        filtered = filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    } else if (jobsSortBy === 'free') {
        filtered = filtered.sort((a, b) => (b.isFree ? 1 : 0) - (a.isFree ? 1 : 0));
    }

    // Update count badge
    const countEl = document.getElementById('jobs-count-text');
    if (countEl) countEl.textContent = `${filtered.length} listing${filtered.length !== 1 ? 's' : ''} found`;

    if (filtered.length === 0) {
        return `<div class="glass-card" style="padding:48px; text-align:center; color:rgba(255,255,255,0.5);">
            <span class="material-icons-round" style="font-size:48px; color:rgba(255,255,255,0.15); display:block; margin-bottom:12px;">work_off</span>
            <p style="font-size:15px; margin-bottom:8px;">No listings match your filters.</p>
            <p style="font-size:13px;">Try adjusting or clearing your filters.</p>
        </div>`;
    }

    const typeBadgeMap = {
        'full-time': 'badge-full-time',
        'part-time': 'badge-part-time',
        'contract': 'badge-contract',
        'internship': 'badge-internship',
        'volunteer': 'badge-volunteer',
        'free-trip': 'badge-free-trip'
    };

    const typeLabels = {
        'full-time': '💼 Full Time',
        'part-time': '⏰ Part Time',
        'contract': '📄 Contract',
        'internship': '📋 Internship',
        'volunteer': '🤝 Volunteer',
        'free-trip': '✈️ Free Trip'
    };

    const categoryLabels = {
        'photography-content': '📷 Photography / Content',
        'tour-guiding': '🧭 Tour Guiding',
        'trip-management': '🗺️ Trip Management',
        'operations': '⚙️ Operations',
        'marketing': '📣 Marketing',
        'hospitality': '🏨 Hospitality',
        'volunteering': '🤝 Volunteering'
    };

    return filtered.map(job => `
        <div class="job-card-pro ${job.featured ? 'featured' : ''} animate-in" data-job-id="${job.id}">
            <div style="display:flex; gap:14px; align-items:flex-start;">
                <!-- Company Avatar -->
                <div style="flex-shrink:0;">
                    <img src="${job.postedByAvatar || 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=100&q=80'}" 
                         onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=100&q=80';"
                         alt="${escapeHTML(job.company)}" 
                         style="width:52px; height:52px; border-radius:12px; object-fit:cover; border:1px solid rgba(255,255,255,0.1);">
                </div>
                
                <!-- Job Info -->
                <div style="flex:1; min-width:0;">
                    <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:6px; align-items:center;">
                        <span class="job-type-badge ${typeBadgeMap[job.jobType] || 'badge-contract'}">${typeLabels[job.jobType] || job.jobType}</span>
                        <span class="job-type-badge ${job.companyType === 'influencer' ? 'badge-influencer' : 'badge-company'}">${job.companyType === 'influencer' ? '🎥 Influencer' : '🏢 Company'}</span>
                        ${job.isFree ? '<span class="job-type-badge" style="background:rgba(34,197,94,0.12); color:#4ade80; border-color:rgba(34,197,94,0.25);">💚 Free / No Cost</span>' : ''}
                        ${job.remote ? '<span class="job-type-badge" style="background:rgba(139,92,246,0.12); color:#a78bfa; border-color:rgba(139,92,246,0.25);">💻 Remote</span>' : ''}
                    </div>
 
                    <h3 style="font-size:16px; font-weight:700; color:#fff; margin:0 0 2px; line-height:1.3;">${escapeHTML(job.title)}</h3>
                    <div style="font-size:13px; color:rgba(255,255,255,0.6); margin-bottom:6px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                        <span style="font-weight:600; color:rgba(255,255,255,0.8);">${escapeHTML(job.company)}</span>
                        <span>·</span>
                        <span class="material-icons-round" style="font-size:12px;">place</span>${escapeHTML(job.location)}
                        ${job.openings ? `<span>·</span><span style="color:var(--color-teal); font-weight:600;">${job.openings} opening${job.openings > 1 ? 's' : ''}</span>` : ''}
                    </div>
 
                    <p style="font-size:13px; color:rgba(255,255,255,0.65); line-height:1.5; margin:0 0 10px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${escapeHTML(job.description)}</p>
 
                    <div style="display:flex; gap:4px; flex-wrap:wrap; margin-bottom:10px;">
                        ${(job.tags || []).slice(0, 5).map(t => `<span class="job-tag">${escapeHTML(t)}</span>`).join('')}
                        ${job.category ? `<span class="job-tag">${categoryLabels[job.category] ? escapeHTML(categoryLabels[job.category]) : escapeHTML(job.category)}</span>` : ''}
                    </div>
                </div>

                <!-- Right: Salary + Action -->
                <div style="flex-shrink:0; text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
                    <div style="font-size:13px; font-weight:700; color:${job.isFree ? '#4ade80' : 'var(--color-teal)'};">${job.salary}</div>
                    <div style="font-size:10px; color:rgba(255,255,255,0.3); font-weight:500;">${job.experience === 'fresher' ? 'Fresher OK' : job.experience + ' yrs exp'}</div>
                    <div style="display:flex; gap:6px; flex-direction:column;">
                        <button class="btn btn-primary btn-sm view-job-detail-btn" data-job-id="${job.id}" style="font-size:12px; padding:6px 14px; white-space:nowrap;">View Details</button>
                        <button class="btn btn-ghost btn-sm quick-apply-job-btn" data-job-id="${job.id}" style="font-size:11px; padding:4px 12px; color:var(--color-teal); border-color:rgba(0,242,254,0.2);">Quick Apply</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function bindJobsEvents() {
    // Update count on load
    const countEl = document.getElementById('jobs-count-text');
    if (countEl) {
        const showing = document.querySelectorAll('.job-card-pro').length;
        countEl.textContent = `${showing} listing${showing !== 1 ? 's' : ''} found`;
    }

    // Search
    document.getElementById('jobs-search-input')?.addEventListener('input', (e) => {
        jobsSearchQuery = e.target.value;
        document.getElementById('jobs-listings-grid').innerHTML = getFilteredJobsHtml();
        bindJobsCardEvents();
    });

    document.getElementById('jobs-search-clear')?.addEventListener('click', () => {
        jobsSearchQuery = '';
        renderJobsPage();
    });

    // Type checkboxes
    document.querySelectorAll('.job-type-filter').forEach(cb => {
        cb.addEventListener('change', () => {
            const val = cb.dataset.val;
            if (cb.checked) { if (!jobsTypeFilters.includes(val)) jobsTypeFilters.push(val); }
            else { jobsTypeFilters = jobsTypeFilters.filter(v => v !== val); }
            document.getElementById('jobs-listings-grid').innerHTML = getFilteredJobsHtml();
            bindJobsCardEvents();
        });
    });

    // Company type radio
    document.querySelectorAll('.job-ctype-filter').forEach(r => {
        r.addEventListener('change', () => {
            jobsCompanyTypeFilter = r.dataset.val;
            document.getElementById('jobs-listings-grid').innerHTML = getFilteredJobsHtml();
            bindJobsCardEvents();
        });
    });

    // Category
    document.getElementById('jobs-category-filter')?.addEventListener('change', (e) => {
        jobsCategoryFilter = e.target.value;
        document.getElementById('jobs-listings-grid').innerHTML = getFilteredJobsHtml();
        bindJobsCardEvents();
    });

    // Experience
    document.querySelectorAll('.job-exp-filter').forEach(r => {
        r.addEventListener('change', () => {
            jobsExperienceFilter = r.dataset.val;
            document.getElementById('jobs-listings-grid').innerHTML = getFilteredJobsHtml();
            bindJobsCardEvents();
        });
    });

    // Location
    document.getElementById('jobs-location-filter')?.addEventListener('change', (e) => {
        jobsLocationFilter = e.target.value;
        document.getElementById('jobs-listings-grid').innerHTML = getFilteredJobsHtml();
        bindJobsCardEvents();
    });

    // Remote
    document.querySelectorAll('.job-remote-filter').forEach(r => {
        r.addEventListener('change', () => {
            jobsRemoteFilter = r.dataset.val;
            document.getElementById('jobs-listings-grid').innerHTML = getFilteredJobsHtml();
            bindJobsCardEvents();
        });
    });

    // Sort
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            jobsSortBy = btn.dataset.sort;
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.toggle('active', b === btn));
            document.getElementById('jobs-listings-grid').innerHTML = getFilteredJobsHtml();
            bindJobsCardEvents();
        });
    });

    // Quick filter pills
    document.querySelectorAll('.quick-filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const q = pill.dataset.quick;
            if (q === 'volunteer' || q === 'free-trip' || q === 'internship') {
                const isActive = jobsTypeFilters.includes(q);
                if (isActive) {
                    jobsTypeFilters = jobsTypeFilters.filter(v => v !== q);
                } else {
                    jobsTypeFilters.push(q);
                }
            } else if (q === 'influencer' || q === 'company') {
                jobsCompanyTypeFilter = jobsCompanyTypeFilter === q ? 'all' : q;
            } else if (q === 'remote') {
                jobsRemoteFilter = jobsRemoteFilter === 'remote' ? 'all' : 'remote';
            }
            renderJobsPage();
        });
    });

    // Clear all
    document.getElementById('jobs-clear-filters')?.addEventListener('click', () => {
        jobsSearchQuery = '';
        jobsTypeFilters = [];
        jobsCompanyTypeFilter = 'all';
        jobsCategoryFilter = 'all';
        jobsExperienceFilter = 'all';
        jobsLocationFilter = 'all';
        jobsRemoteFilter = 'all';
        jobsSortBy = 'newest';
        renderJobsPage();
    });

    // Post a Job
    document.getElementById('post-job-btn')?.addEventListener('click', () => {
        showPostJobModal();
    });

    bindJobsCardEvents();
}

function bindJobsCardEvents() {
    // View detail
    document.querySelectorAll('.view-job-detail-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const job = jobs.find(j => j.id === btn.dataset.jobId);
            if (job) showJobDetailModal(job);
        });
    });

    // Card click
    document.querySelectorAll('.job-card-pro').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            const job = jobs.find(j => j.id === card.dataset.jobId);
            if (job) showJobDetailModal(job);
        });
    });

    // Quick apply
    document.querySelectorAll('.quick-apply-job-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const job = jobs.find(j => j.id === btn.dataset.jobId);
            if (job) showApplyJobModal(job);
        });
    });
}

function showJobDetailModal(job) {
    const typeLabels = {
        'full-time': '💼 Full Time', 'part-time': '⏰ Part Time', 'contract': '📄 Contract',
        'internship': '📋 Internship', 'volunteer': '🤝 Volunteer', 'free-trip': '✈️ Free Trip'
    };
    const modalContent = `
        <div style="max-height:70vh; overflow-y:auto; padding-right:4px;">
            <img src="${job.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80'}" 
                 onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80';"
                 alt="${job.title}" style="width:100%; height:180px; object-fit:cover; border-radius:10px; margin-bottom:16px;">
            
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px; flex-wrap:wrap;">
                <img src="${job.postedByAvatar || ''}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=100&q=80';" style="width:40px;height:40px;border-radius:8px;object-fit:cover;">
                <div>
                    <div style="font-weight:700; font-size:15px; color:#fff;">${job.company}</div>
                    <div style="font-size:11px; color:rgba(255,255,255,0.45);">${job.companyType === 'influencer' ? '🎥 Travel Influencer' : '🏢 Travel Company'}</div>
                </div>
                <div style="margin-left:auto; font-size:18px; font-weight:800; color:${job.isFree ? '#4ade80' : 'var(--color-teal)'};">${job.salary}</div>
            </div>

            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px;">
                ${job.isFree ? '<span style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:rgba(34,197,94,0.12);color:#4ade80;border:1px solid rgba(34,197,94,0.25);">💚 Free / Fully Sponsored</span>' : ''}
                <span style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:rgba(0,242,254,0.1);color:#00f2fe;border:1px solid rgba(0,242,254,0.2);">${typeLabels[job.jobType] || job.jobType}</span>
                ${job.remote ? '<span style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:rgba(139,92,246,0.12);color:#a78bfa;border:1px solid rgba(139,92,246,0.25);">💻 Remote OK</span>' : ''}
                <span style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.1);">📍 ${job.location}</span>
                ${job.openings ? `<span style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.6);border:1px solid rgba(255,255,255,0.1);">🟢 ${job.openings} openings</span>` : ''}
            </div>

            <div style="margin-bottom:14px;">
                <div style="font-size:11px; font-weight:700; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px;">About the Role</div>
                <p style="font-size:13px; color:rgba(255,255,255,0.8); line-height:1.65;">${job.description}</p>
            </div>

            ${job.requirements?.length ? `
                <div style="margin-bottom:14px;">
                    <div style="font-size:11px; font-weight:700; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px;">Requirements</div>
                    <ul style="margin:0; padding-left:16px; font-size:13px; color:rgba(255,255,255,0.75); line-height:1.8;">
                        ${job.requirements.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${job.perks?.length ? `
                <div style="margin-bottom:14px;">
                    <div style="font-size:11px; font-weight:700; color:var(--color-teal); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px;">✨ Perks & Benefits</div>
                    <ul style="margin:0; padding-left:16px; font-size:13px; color:rgba(255,255,255,0.75); line-height:1.8;">
                        ${job.perks.map(p => `<li>${p}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            ${job.tags?.length ? `
                <div style="display:flex; gap:4px; flex-wrap:wrap;">
                    ${job.tags.map(t => `<span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.55);">${t}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `;

    showModal({
        title: job.title,
        content: modalContent,
        actions: [
            {
                id: 'apply-job-from-detail',
                label: job.isFree ? '✈️ Apply for Free Trip' : '📄 Apply Now',
                className: 'btn-primary',
                onClick: () => {
                    document.querySelector('.modal-overlay')?.remove();
                    setTimeout(() => showApplyJobModal(job), 100);
                }
            },
            ...(job.applyEmail ? [{
                id: 'email-job-direct',
                label: '✉️ Email Directly',
                className: 'btn-secondary',
                onClick: () => {
                    window.location.href = `mailto:${job.applyEmail}?subject=Application for ${job.title}&body=Hi ${job.company}, I am interested in the ${job.title} role.`;
                }
            }] : [])
        ]
    });
}

function showApplyJobModal(job) {
    const currentUser = store.get('currentUser');
    const modalContent = `
        <form id="job-apply-form" style="display:flex;flex-direction:column;gap:12px;text-align:left;">
            <p style="font-size:13px; color:rgba(255,255,255,0.7); margin:0 0 4px;">Applying to: <strong style="color:#fff;">${job.title}</strong> at <strong style="color:var(--color-teal);">${job.company}</strong></p>
            <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:11px;">Your Name *</label>
                <input type="text" class="input" id="apply-name" value="${currentUser?.name || ''}" placeholder="Full Name" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);">
            </div>
            <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:11px;">Email Address *</label>
                <input type="email" class="input" id="apply-email" value="${currentUser?.email || ''}" placeholder="your@email.com" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);">
            </div>
            <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:11px;">Phone / WhatsApp</label>
                <input type="text" class="input" id="apply-phone" placeholder="+91 99999 99999" style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);">
            </div>
            <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:11px;">Portfolio / Instagram / LinkedIn URL</label>
                <input type="text" class="input" id="apply-portfolio" placeholder="https://..." style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);">
            </div>
            <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:11px;">Cover Note / Why you? *</label>
                <textarea class="input" id="apply-note" rows="3" placeholder="Tell them about yourself, your experience, why you're the perfect fit..." required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);resize:vertical;"></textarea>
            </div>
        </form>
    `;

    showModal({
        title: `Apply — ${job.title}`,
        content: modalContent,
        actions: [
            {
                id: 'submit-job-apply',
                label: '🚀 Submit Application',
                className: 'btn-primary',
                onClick: () => {
                    const name = document.getElementById('apply-name')?.value?.trim();
                    const email = document.getElementById('apply-email')?.value?.trim();
                    const note = document.getElementById('apply-note')?.value?.trim();
                    if (!name || !email || !note) {
                        store.addToast('Please fill all required fields.', 'warning');
                        return;
                    }
                    document.querySelector('.modal-overlay')?.remove();
                    store.addToast(`Application for "${job.title}" sent to ${job.company}! 🎉 They will reach out soon.`, 'success');
                }
            }
        ]
    });
}

function showPostJobModal() {
    const modalContent = `
        <form id="post-job-form" style="display:flex;flex-direction:column;gap:12px;text-align:left;max-height:65vh;overflow-y:auto;padding-right:4px;">
            <p style="font-size:12px; color:rgba(255,255,255,0.5); margin:0 0 4px;">Your listing will be submitted for admin review before going live.</p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div class="form-group" style="margin:0;">
                    <label class="form-label" style="font-size:11px;">Job Title *</label>
                    <input type="text" class="input" id="post-job-title" placeholder="e.g. Trip Photographer" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);">
                </div>
                <div class="form-group" style="margin:0;">
                    <label class="form-label" style="font-size:11px;">Company / Brand Name *</label>
                    <input type="text" class="input" id="post-job-company" placeholder="e.g. Himalayan Treks" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);">
                </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div class="form-group" style="margin:0;">
                    <label class="form-label" style="font-size:11px;">Posted By *</label>
                    <select class="input" id="post-job-ctype" style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);">
                        <option value="company">🏢 Travel Company</option>
                        <option value="influencer">🎥 Travel Influencer</option>
                    </select>
                </div>
                <div class="form-group" style="margin:0;">
                    <label class="form-label" style="font-size:11px;">Job Type *</label>
                    <select class="input" id="post-job-type" style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);">
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                        <option value="volunteer">🤝 Volunteer</option>
                        <option value="free-trip">✈️ Free Trip Slot</option>
                    </select>
                </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div class="form-group" style="margin:0;">
                    <label class="form-label" style="font-size:11px;">Location *</label>
                    <input type="text" class="input" id="post-job-location" placeholder="e.g. Manali, HP" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);">
                </div>
                <div class="form-group" style="margin:0;">
                    <label class="form-label" style="font-size:11px;">Salary / Compensation</label>
                    <input type="text" class="input" id="post-job-salary" placeholder="e.g. ₹40K/mo or Sponsored" style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);">
                </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div class="form-group" style="margin:0;">
                    <label class="form-label" style="font-size:11px;">Category</label>
                    <select class="input" id="post-job-category" style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);">
                        <option value="photography-content">Photography / Content</option>
                        <option value="tour-guiding">Tour Guiding</option>
                        <option value="trip-management">Trip Management</option>
                        <option value="operations">Operations</option>
                        <option value="marketing">Marketing / Social</option>
                        <option value="hospitality">Hospitality</option>
                        <option value="volunteering">Volunteering</option>
                    </select>
                </div>
                <div class="form-group" style="margin:0;">
                    <label class="form-label" style="font-size:11px;">Openings</label>
                    <input type="number" class="input" id="post-job-openings" placeholder="1" min="1" value="1" style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);">
                </div>
            </div>
            <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:11px;">Description *</label>
                <textarea class="input" id="post-job-desc" rows="3" placeholder="Describe the role, responsibilities, and what you're looking for..." required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);resize:vertical;"></textarea>
            </div>
            <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:11px;">Your Contact Email *</label>
                <input type="email" class="input" id="post-job-email" placeholder="contact@yourbrand.com" value="${store.get('currentUser.email') || ''}" required style="background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.12);">
            </div>
        </form>
    `;

    showModal({
        title: '📋 Post a Job / Trip Opportunity',
        content: modalContent,
        actions: [
            {
                id: 'submit-post-job',
                label: '🚀 Submit for Review',
                className: 'btn-primary',
                onClick: () => {
                    const title = document.getElementById('post-job-title')?.value?.trim();
                    const company = document.getElementById('post-job-company')?.value?.trim();
                    const desc = document.getElementById('post-job-desc')?.value?.trim();
                    const email = document.getElementById('post-job-email')?.value?.trim();
                    if (!title || !company || !desc || !email) {
                        store.addToast('Please fill all required fields.', 'warning');
                        return;
                    }
                    const newJob = {
                        id: 'job-' + Date.now(),
                        title,
                        company,
                        companyType: document.getElementById('post-job-ctype')?.value || 'company',
                        location: document.getElementById('post-job-location')?.value || 'India',
                        locationCity: '',
                        locationState: '',
                        salary: document.getElementById('post-job-salary')?.value || 'Negotiable',
                        isFree: ['volunteer','free-trip'].includes(document.getElementById('post-job-type')?.value),
                        jobType: document.getElementById('post-job-type')?.value || 'full-time',
                        category: document.getElementById('post-job-category')?.value || 'operations',
                        experience: '1-3',
                        openings: parseInt(document.getElementById('post-job-openings')?.value) || 1,
                        remote: false,
                        featured: false,
                        status: 'pending',
                        description: desc,
                        requirements: [],
                        perks: [],
                        applyEmail: email,
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
                    store.addToast('Job listing submitted for review! 🎉 Admin will approve it shortly.', 'success');
                }
            }
        ]
    });
}




// ─── Work Remote Page (#/remote) ──────────────────────────────────────
let remoteSearchQuery = '';
let remoteSelectedLocation = 'all';
let remoteMaxPrice = 30000;
let remoteWifiFilter = 'all';

export function renderRemotePage() {
    const app = document.getElementById('app');
    if (!app) return;

    // Trigger sync in background
    syncRemoteStaysWithServer().then(updated => {
        if (updated) {
            // Re-render only if values match active filters
            const container = document.getElementById('remote-stays-grid-container');
            if (container) {
                container.innerHTML = getFilteredStaysHtml();
                bindRemoteCardEvents();
            }
        }
    });

    function getFilteredStaysHtml() {
        const filteredStays = remoteStays.filter(stay => {
            const matchSearch = !remoteSearchQuery
                ? true
                : (stay.title?.toLowerCase().includes(remoteSearchQuery.toLowerCase()) ||
                   stay.description?.toLowerCase().includes(remoteSearchQuery.toLowerCase()) ||
                   stay.features?.toLowerCase().includes(remoteSearchQuery.toLowerCase()) ||
                   stay.location?.toLowerCase().includes(remoteSearchQuery.toLowerCase()));

            const matchLoc = remoteSelectedLocation === 'all'
                ? true
                : (stay.location?.toLowerCase().includes(remoteSelectedLocation) ||
                   stay.title?.toLowerCase().includes(remoteSelectedLocation));

            const matchPrice = (stay.price || 0) <= remoteMaxPrice;

            let matchWifi = true;
            if (remoteWifiFilter === 'starlink') {
                matchWifi = stay.wifi?.toLowerCase().includes('starlink');
            } else if (remoteWifiFilter === 'high') {
                const speedMatch = stay.wifi?.match(/(\d+)\s*Mbps/i);
                const speed = speedMatch ? parseInt(speedMatch[1]) : 0;
                matchWifi = speed >= 120;
            }

            return matchSearch && matchLoc && matchPrice && matchWifi;
        });

        if (filteredStays.length === 0) {
            return `<div class="glass-card" style="padding:var(--space-6);grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.7)">No matching co-living stays found. Adjust your filters!</div>`;
        }

        return filteredStays.map(stay => {
            const features = stay.features ? stay.features.split(',').map(f => f.trim()) : [];
            const rating = stay.rating || 4.7;
            const reviewsCount = stay.reviewsCount || 24;
            const hostName = stay.hostName || 'Priya Sharma';

            return `
                <div class="glass-card remote-stay-card" style="overflow:hidden;background:rgba(255, 255, 255, 0.02);border:1px solid rgba(255,255,255,0.08);display:flex;flex-direction:column;justify-content:space-between">
                    <div>
                        <div style="position:relative;width:100%;height:180px;overflow:hidden">
                            <img src="${stay.coverImage || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80'}" alt="${escapeHTML(stay.title)}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.3s ease" class="stay-card-img" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80';">
                            <div style="position:absolute;top:12px;left:12px;background:rgba(8,8,8,0.8);backdrop-filter:blur(6px);padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;color:var(--color-teal);border:1px solid rgba(255,255,255,0.08)">
                                📍 ${escapeHTML(stay.location || 'India')}
                            </div>
                        </div>
                        <div style="padding:var(--space-4)">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                                <span style="font-size:12px;color:rgba(255,255,255,0.6)">Hosted by ${escapeHTML(hostName)}</span>
                                <div style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--color-warning)">
                                    <span>★</span>
                                    <span style="font-weight:600;color:#fff">${rating}</span>
                                    <span style="color:rgba(255,255,255,0.4)">(${reviewsCount})</span>
                                </div>
                            </div>
                            <h3 style="margin-bottom:8px;color:#ffffff;font-size:16px;line-height:1.3">${escapeHTML(stay.title)}</h3>
                            <div style="display:flex;flex-wrap:wrap;gap:6px;font-size:11px;color:var(--color-teal);margin-bottom:10px">
                                <span style="background:rgba(0,242,254,0.05);padding:2px 6px;border-radius:4px;border:1px solid rgba(0,242,254,0.1)">${escapeHTML(stay.wifi || '📶 High-Speed WiFi')}</span>
                                ${features.slice(0, 3).map(f => `<span style="background:rgba(255,255,255,0.03);padding:2px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.05)">${escapeHTML(f)}</span>`).join('')}
                            </div>
                            <p style="color:rgba(255,255,255,0.75);font-size:12px;margin-bottom:var(--space-4);line-height:1.4">${escapeHTML(stay.description)}</p>
                        </div>
                    </div>
                    <div style="padding:0 var(--space-4) var(--space-4) var(--space-4)">
                        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px">
                            <strong style="color:#ffffff;font-size:15px">₹${stay.price?.toLocaleString('en-IN')} <span style="font-size:10px;color:rgba(255,255,255,0.5);font-weight:normal">/ month</span></strong>
                            <button class="btn btn-primary btn-sm connect-host-btn" data-stay-id="${stay.id}">Apply to Stay</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    app.innerHTML = `
        <style>
            .remote-stay-card:hover .stay-card-img {
                transform: scale(1.05);
            }
            .slider::-webkit-slider-thumb {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: var(--color-teal);
                cursor: pointer;
            }
        </style>
        <div class="remote-page" style="padding-top:calc(var(--nav-height) + var(--space-6));min-height:90vh;">
            <div class="container animate-in">
                <div class="section-header" style="margin-bottom:var(--space-6);text-align:center;flex-direction:column;align-items:center">
                    <h1 class="section-title">Remote Work <span class="text-gradient">Stays</span></h1>
                    <p class="section-subtitle" style="max-width:500px;color:rgba(255,255,255,0.75)">Premium Airbnb-style co-living spaces for developers, creators, and digital nomads</p>
                </div>

                <!-- Interactive Filters Bar -->
                <div class="remote-filters-bar glass-card" style="padding:var(--space-4);margin-bottom:var(--space-6);display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--space-4);background:rgba(255,255,255,0.02)">
                    <div class="form-group" style="margin:0">
                        <label class="form-label" style="font-size:11px;color:rgba(255,255,255,0.6)">Search Stays</label>
                        <input type="text" class="input" id="remote-search-input" value="${remoteSearchQuery}" placeholder="Search location, features..." style="background:rgba(255,255,255,0.05);color:#fff;border-color:rgba(255,255,255,0.1)">
                    </div>
                    <div class="form-group" style="margin:0">
                        <label class="form-label" style="font-size:11px;color:rgba(255,255,255,0.6)">Location</label>
                        <select class="input" id="remote-loc-select" style="background:rgba(255,255,255,0.05);color:#fff;border-color:rgba(255,255,255,0.1);cursor:pointer">
                            <option value="all" ${remoteSelectedLocation === 'all' ? 'selected' : ''}>All Locations</option>
                            <option value="goa" ${remoteSelectedLocation === 'goa' ? 'selected' : ''}>Goa</option>
                            <option value="manali" ${remoteSelectedLocation === 'manali' ? 'selected' : ''}>Manali</option>
                            <option value="kerala" ${remoteSelectedLocation === 'kerala' ? 'selected' : ''}>Kerala</option>
                            <option value="himachal" ${remoteSelectedLocation === 'himachal' ? 'selected' : ''}>Himachal / HP</option>
                            <option value="rajasthan" ${remoteSelectedLocation === 'rajasthan' ? 'selected' : ''}>Rajasthan</option>
                            <option value="coorg" ${remoteSelectedLocation === 'coorg' ? 'selected' : ''}>Coorg</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin:0">
                        <div style="display:flex;justify-content:space-between;align-items:center">
                            <label class="form-label" style="font-size:11px;color:rgba(255,255,255,0.6)">Max Price</label>
                            <span style="font-size:11px;color:var(--color-teal);font-weight:600">₹${remoteMaxPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <input type="range" min="15000" max="30000" step="1000" class="slider" id="remote-price-range" value="${remoteMaxPrice}" style="width:100%;accent-color:var(--color-teal);background:rgba(255,255,255,0.1);height:6px;border-radius:3px;margin-top:8px">
                    </div>
                    <div class="form-group" style="margin:0">
                        <label class="form-label" style="font-size:11px;color:rgba(255,255,255,0.6)">Internet Option</label>
                        <select class="input" id="remote-wifi-select" style="background:rgba(255,255,255,0.05);color:#fff;border-color:rgba(255,255,255,0.1);cursor:pointer">
                            <option value="all" ${remoteWifiFilter === 'all' ? 'selected' : ''}>Any Speed</option>
                            <option value="starlink" ${remoteWifiFilter === 'starlink' ? 'selected' : ''}>Starlink Only</option>
                            <option value="high" ${remoteWifiFilter === 'high' ? 'selected' : ''}>120+ Mbps</option>
                        </select>
                    </div>
                </div>

                <!-- Stays Grid -->
                <div id="remote-stays-grid-container" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:var(--space-6)">
                    ${getFilteredStaysHtml()}
                </div>
            </div>
        </div>
    `;

    // Bind filters events
    const searchInput = document.getElementById('remote-search-input');
    searchInput?.addEventListener('input', (e) => {
        remoteSearchQuery = e.target.value;
        updateRemoteGrid();
    });

    const locSelect = document.getElementById('remote-loc-select');
    locSelect?.addEventListener('change', (e) => {
        remoteSelectedLocation = e.target.value;
        updateRemoteGrid();
    });

    const priceRange = document.getElementById('remote-price-range');
    priceRange?.addEventListener('input', (e) => {
        remoteMaxPrice = parseInt(e.target.value) || 30000;
        const label = priceRange.previousElementSibling.querySelector('span');
        if (label) label.textContent = `₹${remoteMaxPrice.toLocaleString('en-IN')}`;
        updateRemoteGrid();
    });

    const wifiSelect = document.getElementById('remote-wifi-select');
    wifiSelect?.addEventListener('change', (e) => {
        remoteWifiFilter = e.target.value;
        updateRemoteGrid();
    });

    function updateRemoteGrid() {
        const grid = document.getElementById('remote-stays-grid-container');
        if (grid) {
            grid.innerHTML = getFilteredStaysHtml();
            bindRemoteCardEvents();
        }
    }

    function bindRemoteCardEvents() {
        document.querySelectorAll('.connect-host-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const stayId = btn.dataset.stayId;
                const stay = remoteStays.find(s => s.id === stayId);
                if (!stay) return;

                const user = store.get('currentUser') || {};
                const userName = user.name || '';
                const userEmail = user.email || '';

                const modalContent = `
                    <form id="connect-host-form" style="display:flex;flex-direction:column;gap:12px;text-align:left;color:#fff">
                        <p style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:8px;line-height:1.4">
                            Apply to stay at <strong>${stay.title}</strong>. The host will review your application and details to contact you directly.
                        </p>
                        <div class="form-group">
                            <label class="form-label" style="font-size:11px">Your Name *</label>
                            <input type="text" class="input" id="connect-user-name" value="${userName}" placeholder="Enter name" required style="background:rgba(255,255,255,0.05);color:#fff;border-color:rgba(255,255,255,0.12)">
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="font-size:11px">Your Email Address *</label>
                            <input type="email" class="input" id="connect-user-email" value="${userEmail}" placeholder="name@example.com" required style="background:rgba(255,255,255,0.05);color:#fff;border-color:rgba(255,255,255,0.12)">
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="font-size:11px">Co-living Stay Option</label>
                            <input type="text" class="input" value="${stay.title}" disabled style="background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.5);border-color:rgba(255,255,255,0.08)">
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="font-size:11px">Message for ${stay.hostName || 'Host'} *</label>
                            <textarea class="input" id="connect-message" rows="4" placeholder="Briefly describe your remote job, timeline, and why you'd be a great fit for this community co-living..." required style="background:rgba(255,255,255,0.05);color:#fff;border-color:rgba(255,255,255,0.12)"></textarea>
                        </div>
                    </form>
                `;

                showModal({
                    title: `Connect with Host: ${stay.hostName || 'Rahul Mehta'}`,
                    content: modalContent,
                    actions: [
                        {
                            id: 'send-host-msg-btn',
                            label: 'Send Application',
                            className: 'btn-primary',
                            onClick: () => {
                                const name = document.getElementById('connect-user-name').value;
                                const email = document.getElementById('connect-user-email').value;
                                const msg = document.getElementById('connect-message').value;
                                if (!name || !email || !msg) {
                                    store.addToast('Please fill all required fields.', 'warning');
                                    return;
                                }
                                store.addToast(`✉️ Application for "${stay.title}" successfully sent to ${stay.hostName || 'host'}! They will contact you shortly.`, 'success');
                            }
                        }
                    ]
                });
            });
        });
    }

    bindRemoteCardEvents();
}

// ─── Invite Only Page (#/invite-only) ──────────────────────────────────
export function renderInviteOnlyPage() {
    const app = document.getElementById('app');
    if (!app) return;

    // Trigger sync in background
    syncInviteTripsWithServer().then(updated => {
        if (updated) {
            const grid = document.querySelector('.invite-grid');
            if (grid) {
                grid.innerHTML = inviteTrips.length === 0
                    ? `<div class="glass-card" style="padding:var(--space-6);grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.7)">No invite-only trips listed at this moment. Please check back later!</div>`
                    : inviteTrips.map((trip, i) => `
                        <div class="invite-card animate-in stagger-${(i % 3) + 1}">
                            <div>
                                <div class="invite-card-top">
                                    <span class="invite-card-emoji">${trip.emoji || '🚀'}</span>
                                    <div class="invite-badge-label">
                                        <span class="material-icons-round" style="font-size:12px;">lock</span> Invite
                                    </div>
                                </div>
                                <h3 class="invite-card-title">${trip.title}</h3>
                                <p class="invite-card-desc" style="color:rgba(255,255,255,0.85);font-size:13px;line-height:1.4">${trip.description}</p>
                            </div>
                            <div>
                                <div class="invite-card-meta" style="color:rgba(255,255,255,0.75)">
                                    <div class="invite-card-meta-item">
                                        <span class="material-icons-round">calendar_today</span>
                                        <span>${trip.date}</span>
                                    </div>
                                    <div class="invite-card-meta-item">
                                        <span class="material-icons-round">people</span>
                                        <span>${trip.slots} slots</span>
                                    </div>
                                </div>
                                <button class="btn btn-primary w-full request-invite-btn" data-invite="${trip.title}" style="border-radius:10px;">Request Invite</button>
                            </div>
                        </div>
                    `).join('');
                
                // Rebind event listeners
                document.querySelectorAll('.request-invite-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const eventName = btn.dataset.invite;
                        showCommunityAccessModal(eventName);
                    });
                });
            }
        }
    });

    const inviteCardsHtml = inviteTrips.length === 0
        ? `<div class="glass-card" style="padding:var(--space-6);grid-column:1/-1;text-align:center;color:rgba(255,255,255,0.7)">No invite-only trips listed at this moment. Please check back later!</div>`
        : inviteTrips.map((trip, i) => `
            <div class="invite-card animate-in stagger-${(i % 3) + 1}">
                <div>
                    <div class="invite-card-top">
                        <span class="invite-card-emoji">${trip.emoji || '🚀'}</span>
                        <div class="invite-badge-label">
                            <span class="material-icons-round" style="font-size:12px;">lock</span> Invite
                        </div>
                    </div>
                    <h3 class="invite-card-title">${trip.title}</h3>
                    <p class="invite-card-desc" style="color:rgba(255,255,255,0.85);font-size:13px;line-height:1.4">${trip.description}</p>
                </div>
                <div>
                    <div class="invite-card-meta" style="color:rgba(255,255,255,0.75)">
                        <div class="invite-card-meta-item">
                            <span class="material-icons-round">calendar_today</span>
                            <span>${trip.date}</span>
                        </div>
                        <div class="invite-card-meta-item">
                            <span class="material-icons-round">people</span>
                            <span>${trip.slots} slots</span>
                        </div>
                    </div>
                    <button class="btn btn-primary w-full request-invite-btn" data-invite="${trip.title}" style="border-radius:10px;">Request Invite</button>
                </div>
            </div>
        `).join('');

    app.innerHTML = `
        <style>
            .invite-focused-page {
                padding-top: calc(var(--nav-height) + var(--space-6));
                min-height: 90vh;
            }
            .invite-header-container {
                margin-bottom: var(--space-8);
            }
            .invite-title-row {
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
                font-family: var(--font-heading);
                font-size: clamp(2rem, 4vw, 3rem);
                font-weight: 800;
                color: #ffffff;
                margin: 0 0 12px 0;
            }
            .invite-title-row .material-icons-round {
                font-size: 36px;
                color: var(--color-teal);
            }
            .invite-subtitle-row {
                display: flex !important;
                flex-wrap: wrap !important;
                align-items: center !important;
                gap: 16px !important;
                margin-bottom: var(--space-6);
            }
            .invite-subtitle-text {
                font-size: 16px;
                color: rgba(255,255,255,0.8);
                margin: 0;
            }
            .wa-details-btn {
                background: rgba(34, 197, 94, 0.05) !important;
                border: 1px solid rgba(34, 197, 94, 0.25) !important;
                color: #22c55e !important;
                padding: 8px 16px !important;
                border-radius: 99px !important;
                font-size: 13px !important;
                font-weight: 600 !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 6px !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
            }
            .wa-details-btn:hover {
                background: rgba(34, 197, 94, 0.1) !important;
                border-color: rgba(34, 197, 94, 0.4) !important;
                transform: translateY(-1px);
            }
            .invite-grid {
                display: grid !important;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
                gap: 24px !important;
                margin-bottom: 48px !important;
            }
            .invite-card {
                background: rgba(255,255,255,0.02) !important;
                border: 1px solid rgba(255,255,255,0.08) !important;
                border-radius: var(--radius-xl) !important;
                padding: 24px !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                position: relative !important;
                transition: all 0.3s ease !important;
                height: 320px !important;
                text-align: left !important;
            }
            .invite-card:hover {
                border-color: rgba(255, 90, 0, 0.4) !important;
                transform: translateY(-4px) !important;
                box-shadow: 0 10px 35px rgba(255, 90, 0, 0.08) !important;
            }
            .invite-card-top {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                margin-bottom: 20px !important;
            }
            .invite-card-emoji {
                font-size: 32px !important;
            }
            .invite-badge-label {
                background: rgba(255, 90, 0, 0.05) !important;
                border: 1px solid rgba(255, 90, 0, 0.2) !important;
                color: var(--color-teal) !important;
                font-size: 11px !important;
                font-weight: 700 !important;
                padding: 4px 10px !important;
                border-radius: 6px !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 4px !important;
            }
            .invite-card-title {
                font-family: var(--font-heading) !important;
                font-size: 18px !important;
                font-weight: 700 !important;
                color: #ffffff !important;
                margin: 0 0 8px 0 !important;
            }
            .invite-card-meta {
                display: flex !important;
                flex-direction: column !important;
                gap: 6px !important;
                margin-bottom: 20px !important;
                font-size: 13px !important;
            }
            .invite-card-meta-item {
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
            }
            .invite-card-meta-item .material-icons-round {
                font-size: 16px !important;
                color: var(--color-teal) !important;
            }
        </style>

        <div class="invite-focused-page">
            <div class="container animate-in">
                <!-- Header section -->
                <div class="invite-header-container">
                    <h1 class="invite-title-row">
                        <span class="material-icons-round" style="font-size:36px;color:var(--color-teal);">lock</span>
                        <span>Invite Only & <span class="text-gradient">Focused Trips</span></span>
                    </h1>
                    <div class="invite-subtitle-row">
                        <p class="invite-subtitle-text">Curated, exclusive experiences for niche communities and focused travelers</p>
                        <button class="wa-details-btn" id="wa-invite-details">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle;">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.42 9.863-9.864.002-2.637-1.023-5.117-2.884-6.979C16.59 1.892 14.117.87 11.48.868 6.042.868 1.623 5.286 1.618 10.728c-.001 1.705.453 3.37 1.317 4.858L1.921 21.07l5.726-1.5-.15.084zM17.9 14.8c-.29-.15-1.71-.85-1.98-.95-.26-.1-.46-.15-.65.15-.2.3-.75.95-.92 1.15-.17.19-.34.22-.63.07-1.16-.58-1.93-1.02-2.68-2.3-.2-.34.2-.32.57-1.07.06-.13.03-.25-.01-.33-.05-.08-.45-1.08-.62-1.48-.16-.4-.33-.33-.46-.34H10.15c-.2 0-.5.07-.77.37-.26.3-1.02 1-1.02 2.43 0 1.43 1.04 2.82 1.19 3 .15.19 2.05 3.13 4.96 4.39.7.3 1.23.48 1.66.62.7.22 1.34.19 1.84.12.56-.08 1.71-.7 1.95-1.37.24-.68.24-1.26.17-1.37-.07-.11-.27-.2-.56-.35z"/>
                            </svg>
                            <span>Join WhatsApp for Details</span>
                        </button>
                    </div>
                </div>

                <!-- Cards Grid -->
                <div class="invite-grid">
                    ${inviteCardsHtml}
                </div>

                <!-- Curated Experiences (Image 7 Layout Component inside info-pages.js) -->
                <div class="experiences-section-embed" style="margin-top: 60px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 60px;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h2 style="font-family: var(--font-heading); font-size: 32px; font-weight: 800; color: #ffffff;">Curated <span class="text-gradient">Experiences</span></h2>
                        <p style="color: rgba(255,255,255,0.8); font-size: 15px; margin-top: 8px;">From adrenaline-pumping adventures to peaceful wellness retreats, discover experiences that match your travel style.</p>
                    </div>

                    <!-- Categories cards -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 60px;">
                        ${[
                            { title: 'Adventure', desc: 'Trekking, camping, and thrilling expeditions', icon: 'landscape', color: '#ff5a00' },
                            { title: 'Beach & Islands', desc: 'Tropical getaways and island hopping', icon: 'beach_access', color: '#ff9f1c' },
                            { title: 'Cultural', desc: 'Heritage tours and local immersions', icon: 'auto_awesome', color: '#ff9f1c' },
                            { title: 'Wellness', desc: 'Yoga retreats and spiritual journeys', icon: 'favorite', color: '#33e0be' },
                            { title: 'Photography', desc: 'Scenic tours for photographers', icon: 'photo_camera', color: '#f43f5e' },
                            { title: 'Exploration', desc: 'Off-beat destinations and hidden gems', icon: 'explore', color: '#a855f7' }
                        ].map(c => `
                            <div class="glass-card" style="padding: 24px 16px; text-align: center; border-radius: var(--radius-lg); border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 180px;">
                                <div style="width: 44px; height: 44px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; color: ${c.color}; margin-bottom: 16px;">
                                    <span class="material-icons-round" style="font-size:24px;">${c.icon}</span>
                                </div>
                                <h4 style="font-family: var(--font-heading); font-size: 15px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0;">${c.title}</h4>
                                <p style="font-size: 11px; color: rgba(255,255,255,0.75); margin: 0; line-height: 1.4;">${c.desc}</p>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Why Travel with Groups -->
                    <div style="text-align: center; max-width: 700px; margin: 0 auto; padding: 40px 0;">
                        <h3 style="font-family: var(--font-heading); font-size: 26px; font-weight: 800; color: #ffffff; margin-bottom: 16px;">Why Travel with Groups?</h3>
                        <p style="color: rgba(255,255,255,0.8); font-size: 14px; line-height: 1.6;">Group trips offer the perfect blend of adventure and companionship. Meet like-minded travelers, share experiences, and create memories that last a lifetime.</p>
                    </div>
                </div>

            </div>
        </div>
    `;

    // Bind event listeners
    document.querySelectorAll('.request-invite-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const eventName = btn.dataset.invite;
            showCommunityAccessModal(eventName);
        });
    });

    document.getElementById('wa-invite-details')?.addEventListener('click', () => {
        showCommunityAccessModal('Invite Only Page WhatsApp Banner');
    });
}
