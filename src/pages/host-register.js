// ============================================
// Host Registration Component
// Onboard influencers and travel companies
// ============================================

import { store } from '../state.js';
import { hosts, saveHosts } from '../data/hosts.js';
import { users, saveUsers } from '../data/users.js';

export function renderHostRegisterPage() {
    const app = document.getElementById('app');
    if (!app) return;

    const isLoggedIn = store.get('isLoggedIn');
    const user = store.get('currentUser');
    const userRole = store.get('userRole');

    let formHtml = '';

    if (isLoggedIn && (userRole === 'host' || userRole === 'admin')) {
        // Already a Host or Admin
        formHtml = `
            <div class="glass-panel" style="padding:var(--space-8);text-align:center;">
                <span class="material-icons-round" style="font-size:64px;color:var(--color-teal);margin-bottom:var(--space-4)">check_circle</span>
                <h2 style="font-size:var(--text-2xl);margin-bottom:var(--space-2)">You are a registered ${userRole}!</h2>
                <p class="text-muted" style="margin-bottom:var(--space-6)">You have full access to manage listings and view analytics.</p>
                <a href="#/dashboard" class="btn btn-primary btn-lg" style="display:inline-flex;align-items:center;gap:8px">
                    <span class="material-icons-round">dashboard</span>
                    Go to Host Dashboard
                </a>
            </div>
        `;
    } else if (isLoggedIn && userRole === 'traveler') {
        // Logged in Traveler: Upgrade Flow (no email/password fields needed)
        formHtml = `
            <div class="host-register-form-panel glass-panel animate-in-right" style="padding:var(--space-6)">
                <h2 style="font-size:var(--text-2xl);margin-bottom:var(--space-1)">Convert to Host Account</h2>
                <p class="text-muted" style="font-size:var(--text-sm);margin-bottom:var(--space-4)">Upgrade your traveler profile to start hosting trips</p>

                <form id="host-upgrade-form" style="display:flex;flex-direction:column;gap:var(--space-3)">
                    <div class="form-group">
                        <label class="form-label" for="host-reg-name">Influencer / Brand Name *</label>
                        <input type="text" class="input" id="host-reg-name" placeholder="e.g. Wanderlust with ${user.name || 'Priya'}" required value="${user.name ? 'Wanderlust with ' + user.name : ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="host-reg-loc">Operating Location *</label>
                        <input type="text" class="input" id="host-reg-loc" placeholder="e.g. Mumbai, Maharashtra" required value="${user.city ? user.city + (user.state ? ', ' + user.state : '') : ''}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Host Account Type *</label>
                        <div style="display:flex;gap:var(--space-4);margin-top:4px;">
                            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;color:#fff;">
                                <input type="radio" name="host-reg-type" value="influencer" checked style="accent-color:var(--color-teal);">
                                <span>Travel Influencer</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;color:#fff;">
                                <input type="radio" name="host-reg-type" value="company" style="accent-color:var(--color-teal);">
                                <span>Top Travel Company</span>
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="host-reg-social">Instagram @Handle *</label>
                        <input type="text" class="input" id="host-reg-social" placeholder="e.g. @wanderlust_priya" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="host-reg-website">Official Website URL (for Auto-Syncing Trips) 🌐</label>
                        <input type="url" class="input" id="host-reg-website" placeholder="e.g. https://wanderlustpriya.com/trips">
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg w-full" style="margin-top:var(--space-3)">
                        <span class="material-icons-round" style="margin-right:8px">rocket_launch</span> Upgrade to Host Account
                    </button>
                </form>
            </div>
        `;
    } else {
        // Guest: Complete Signup Flow
        formHtml = `
            <div class="host-register-form-panel glass-panel animate-in-right" style="padding:var(--space-6)">
                <h2 style="font-size:var(--text-2xl);margin-bottom:var(--space-1)">Become a Host</h2>
                <p class="text-muted" style="font-size:var(--text-sm);margin-bottom:var(--space-4)">Register your agency or influencer brand to launch</p>

                <form id="host-register-form" style="display:flex;flex-direction:column;gap:var(--space-3)">
                    <div class="form-group">
                        <label class="form-label" for="host-reg-name">Influencer / Brand Name *</label>
                        <input type="text" class="input" id="host-reg-name" placeholder="e.g. Wanderlust with Priya" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="host-reg-email">Email *</label>
                        <input type="email" class="input" id="host-reg-email" placeholder="priya@example.com" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="host-reg-password">Password *</label>
                        <input type="password" class="input" id="host-reg-password" placeholder="Create secure password" required minlength="8">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="host-reg-loc">Operating Location *</label>
                        <input type="text" class="input" id="host-reg-loc" placeholder="e.g. Mumbai, Maharashtra" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Host Account Type *</label>
                        <div style="display:flex;gap:var(--space-4);margin-top:4px;">
                            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;color:#fff;">
                                <input type="radio" name="host-reg-type" value="influencer" checked style="accent-color:var(--color-teal);">
                                <span>Travel Influencer</span>
                            </label>
                            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;color:#fff;">
                                <input type="radio" name="host-reg-type" value="company" style="accent-color:var(--color-teal);">
                                <span>Top Travel Company</span>
                            </label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="host-reg-social">Instagram @Handle *</label>
                        <input type="text" class="input" id="host-reg-social" placeholder="e.g. @wanderlust_priya" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="host-reg-website">Official Website URL (for Auto-Syncing Trips) 🌐</label>
                        <input type="url" class="input" id="host-reg-website" placeholder="e.g. https://wanderlustpriya.com/trips">
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg w-full" style="margin-top:var(--space-3)">
                        <span class="material-icons-round" style="margin-right:8px">rocket_launch</span> Setup Host Account
                    </button>
                </form>
            </div>
        `;
    }

    app.innerHTML = `
        <div class="host-register-page" style="padding-top:calc(var(--nav-height) + var(--space-6));min-height:90vh;">
            <div class="container">
                <!-- Registration Row -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:var(--space-8);align-items:center;margin-bottom:var(--space-12)">
                    
                    <!-- Left Content: Value Props -->
                    <div class="host-register-intro animate-in-left">
                        <div class="hero-badge" style="margin-bottom:var(--space-4)">
                            <span class="hero-badge-dot" style="background:var(--color-amber)"></span>
                            <span>Listings are 100% Free</span>
                        </div>
                        <h1 style="font-size:var(--text-4xl);line-height:1.2;margin-bottom:var(--space-3)">
                            Turn Your Travel Influence into <span class="text-gradient">Group Expeditions</span>
                        </h1>
                        <p style="color:var(--color-text-secondary);font-size:var(--text-md);line-height:1.6;margin-bottom:var(--space-6)">
                            Join India's premium travel community. List your curated itineraries, get verified with a blue badge, connect directly with travelers, and manage bookings effortlessly.
                        </p>

                        <div style="display:flex;flex-direction:column;gap:var(--space-4)">
                            <div style="display:flex;gap:var(--space-3)">
                                <span class="material-icons-round" style="color:var(--color-teal);font-size:24px;flex-shrink:0">verified</span>
                                <div>
                                    <strong style="font-size:var(--text-md)">Verified Authority</strong>
                                    <p style="color:var(--color-text-muted);font-size:var(--text-sm);margin-top:2px">Receive a verified host badge to stand out and build immediate trust.</p>
                                </div>
                            </div>
                            <div style="display:flex;gap:var(--space-3)">
                                <span class="material-icons-round" style="color:var(--color-teal);font-size:24px;flex-shrink:0">dashboard</span>
                                <div>
                                    <strong style="font-size:var(--text-md)">Intuitive Creator Suite</strong>
                                    <p style="color:var(--color-text-muted);font-size:var(--text-sm);margin-top:2px">Manage multiple departures, build day-by-day itineraries, and duplicate listing templates.</p>
                                </div>
                            </div>
                            <div style="display:flex;gap:var(--space-3)">
                                <span class="material-icons-round" style="color:var(--color-teal);font-size:24px;flex-shrink:0">chat</span>
                                <div>
                                    <strong style="font-size:var(--text-md)">Direct Lead Capture</strong>
                                    <p style="color:var(--color-text-muted);font-size:var(--text-sm);margin-top:2px">Message travelers directly inside our secure hub. Confirm reservations and build group chats.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Content: Form -->
                    ${formHtml}

                </div>

                <!-- Interactive How It Works Onboarding Process Flow -->
                <div class="how-it-works-section animate-in" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:var(--space-12);margin-bottom:var(--space-10)">
                    <div style="text-align:center;margin-bottom:var(--space-8)">
                        <h2 style="font-family:var(--font-heading);font-size:var(--text-3xl);font-weight:800;color:#ffffff">The Host Onboarding & <span class="text-gradient">Verification Pipeline</span></h2>
                        <p style="color:rgba(255,255,255,0.55);font-size:var(--text-sm);margin-top:8px;max-width:550px;margin-inline:auto">Understand the end-to-end process from signup to launching live trips on the explore portal.</p>
                    </div>

                    <!-- Steps Grid -->
                    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:var(--space-6)">
                        
                        <!-- Step 1 -->
                        <div class="glass-card" style="padding:var(--space-5);position:relative;border-top:4px solid var(--color-amber)">
                            <div style="position:absolute;top:-20px;left:20px;width:36px;height:36px;border-radius:50%;background:var(--color-amber);color:#000;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;box-shadow:0 0 15px rgba(245,158,11,0.4)">1</div>
                            <h3 style="font-size:16px;margin-top:10px;margin-bottom:8px">1. Register Hub</h3>
                            <p class="text-muted" style="font-size:var(--text-xs);line-height:1.4">Fill in your brand name, operating location, and social media handles. This sets up your host dashboard immediately.</p>
                        </div>

                        <!-- Step 2 -->
                        <div class="glass-card" style="padding:var(--space-5);position:relative;border-top:4px solid var(--color-teal)">
                            <div style="position:absolute;top:-20px;left:20px;width:36px;height:36px;border-radius:50%;background:var(--color-teal);color:#000;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;box-shadow:0 0 15px rgba(0,212,170,0.4)">2</div>
                            <h3 style="font-size:16px;margin-top:10px;margin-bottom:8px">2. Verify Credentials</h3>
                            <p class="text-muted" style="font-size:var(--text-xs);line-height:1.4">Navigate to the <strong>Verification</strong> tab in your dashboard, upload government ID / GST registration files, and submit. Admins review this to award the blue verified badge.</p>
                        </div>

                        <!-- Step 3 -->
                        <div class="glass-card" style="padding:var(--space-5);position:relative;border-top:4px solid var(--color-coral)">
                            <div style="position:absolute;top:-20px;left:20px;width:36px;height:36px;border-radius:50%;background:var(--color-coral);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;box-shadow:0 0 15px rgba(244,63,94,0.4)">3</div>
                            <h3 style="font-size:16px;margin-top:10px;margin-bottom:8px">3. Create & List Tours</h3>
                            <p class="text-muted" style="font-size:var(--text-xs);line-height:1.4">Use the <strong>Create Trip</strong> wizard to build detailed itineraries, pricing tiers, inclusions/exclusions, and highlights. Tours are initially saved as <code>pending</code>.</p>
                        </div>

                        <!-- Step 4 -->
                        <div class="glass-card" style="padding:var(--space-5);position:relative;border-top:4px solid var(--color-success)">
                            <div style="position:absolute;top:-20px;left:20px;width:36px;height:36px;border-radius:50%;background:var(--color-success);color:#000;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;box-shadow:0 0 15px rgba(16,185,129,0.4)">4</div>
                            <h3 style="font-size:16px;margin-top:10px;margin-bottom:8px">4. Admin Review & Live</h3>
                            <p class="text-muted" style="font-size:var(--text-xs);line-height:1.4">Our admin team reviews your listed tours for formatting and authenticity. Upon approval, the trip goes live instantly on the public explore page!</p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    `;

    setupHostRegisterEvents();
}

function setupHostRegisterEvents() {
    const upgradeForm = document.getElementById('host-upgrade-form');
    if (upgradeForm) {
        upgradeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = store.get('currentUser');
            const name = document.getElementById('host-reg-name').value;
            const type = document.querySelector('input[name="host-reg-type"]:checked')?.value || 'influencer';
            const location = document.getElementById('host-reg-loc').value;
            const social = document.getElementById('host-reg-social').value;

            // Generate host ID
            const hostId = 'host-user-' + Date.now();

            // 1. Create and push to hosts database
            const newHost = {
                id: hostId,
                name,
                type,
                avatar: user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
                coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
                bio: `Curated group tours by ${name}. Located in ${location}. Connect with us for safe and premium journeys.`,
                location,
                verified: false,
                rating: 5.0,
                reviewCount: 0,
                tripCount: 0,
                travelerCount: 0,
                responseRate: 100,
                responseTime: 'Within a few hours',
                joinedDate: new Date().toISOString().split('T')[0],
                websiteUrl: document.getElementById('host-reg-website')?.value?.trim() || null,
                socialLinks: {
                    instagram: social.startsWith('@') ? social : null,
                    website: document.getElementById('host-reg-website')?.value?.trim() || (!social.startsWith('@') ? social : null)
                },
                specialties: ['Group Travel', 'Curated Adventures'],
                languages: ['English', 'Hindi']
            };

            hosts.push(newHost);
            saveHosts();

            // 2. Upgrade user profile in local database
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex > -1) {
                users[userIndex].role = 'host';
                users[userIndex].hostId = hostId;
                users[userIndex].name = name;
                users[userIndex].city = location.split(',')[0].trim();
                users[userIndex].state = location.split(',')[1]?.trim() || 'India';
                saveUsers();
            }

            // 3. Update active session store
            const upgradedUser = {
                ...user,
                role: 'host',
                hostId: hostId,
                name,
                city: location.split(',')[0].trim(),
                state: location.split(',')[1]?.trim() || 'India'
            };
            store.login(upgradedUser);

            store.addToast(`Account upgraded successfully! Welcome to hosting, ${name}! 🚀`, 'success');
            window.location.hash = '#/dashboard';
        });
    }

    const form = document.getElementById('host-register-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('host-reg-name').value;
            const email = document.getElementById('host-reg-email').value;
            const password = document.getElementById('host-reg-password').value;
            const type = document.querySelector('input[name="host-reg-type"]:checked')?.value || 'influencer';
            const location = document.getElementById('host-reg-loc').value;
            const social = document.getElementById('host-reg-social').value;

            // Generate host ID
            const hostId = 'host-user-' + Date.now();

            // 1. Create and push to hosts database seed
            const newHost = {
                id: hostId,
                name,
                type,
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', // Default avatar
                coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
                bio: `Curated group tours by ${name}. Located in ${location}. Connect with us for safe and premium journeys.`,
                location,
                verified: false,
                rating: 5.0,
                reviewCount: 0,
                tripCount: 0,
                travelerCount: 0,
                responseRate: 100,
                responseTime: 'Within a few hours',
                joinedDate: new Date().toISOString().split('T')[0],
                websiteUrl: document.getElementById('host-reg-website')?.value?.trim() || null,
                socialLinks: {
                    instagram: social.startsWith('@') ? social : null,
                    website: document.getElementById('host-reg-website')?.value?.trim() || (!social.startsWith('@') ? social : null)
                },
                specialties: ['Group Travel', 'Curated Adventures'],
                languages: ['English', 'Hindi']
            };

            hosts.push(newHost);
            saveHosts();

            // 2. Create and push user profile
            const newUser = {
                id: 'user-host-' + Date.now(),
                name,
                email,
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
                city: location.split(',')[0].trim(),
                state: location.split(',')[1]?.trim() || 'India',
                role: 'host',
                hostId: hostId,
                joinedDate: new Date().toISOString().split('T')[0],
                bio: newHost.bio,
                savedTrips: [],
                interests: ['adventure', 'group-trips'],
                tripsCompleted: 0,
                tripsUpcoming: 0,
                verified: false,
                phone: '+91-XXXXX-XXXXX'
            };

            users.push(newUser);
            saveUsers();

            // 3. Log user in and save state
            store.login(newUser);

            store.addToast(`Welcome to the Community, ${name}! Your host profile is configured. 🚀`, 'success');
            window.location.hash = '#/dashboard';
        });
    }
}
