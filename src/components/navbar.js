// ============================================
// Navbar Component
// Glass navigation with mobile menu
// ============================================

import { store, escapeHTML } from '../state.js';
import { navigateTo } from '../router.js';

const NAV_LINKS = [
    { label: 'Discover', path: '/', icon: 'explore' },
    { label: 'Group Trips', path: '/trips', icon: 'group' },
    { label: 'Invite Only', path: '/invite-only', icon: 'vpn_key' },
    { label: 'Travel Jobs', path: '/jobs', icon: 'work' },
    { label: 'Work Remote', path: '/remote', icon: 'laptop_mac' },
];

export function renderNavbar() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    const isLoggedIn = store.get('isLoggedIn');
    const user = store.get('currentUser');
    const userRole = store.get('userRole');
    const unreadCount = store.get('unreadCount');

    nav.innerHTML = `
        <div class="navbar" id="navbar">
            <div class="container navbar-inner">
                <!-- Logo -->
                <a href="#/" class="nav-brand" id="nav-brand">
                    <div class="nav-brand-icon">
                        <svg width="32" height="32" viewBox="0 0 32 32">
                            <defs><linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff5a00"/><stop offset="100%" stop-color="#ff9f1c"/></linearGradient></defs>
                            <circle cx="16" cy="16" r="14" fill="none" stroke="url(#logo-g)" stroke-width="2"/>
                            <ellipse cx="16" cy="16" rx="6" ry="13" fill="none" stroke="url(#logo-g)" stroke-width="1.2" opacity="0.6"/>
                            <line x1="3" y1="16" x2="29" y2="16" stroke="url(#logo-g)" stroke-width="0.8" opacity="0.5"/>
                            <circle cx="12" cy="12" r="1.5" fill="#ff5a00"/>
                            <circle cx="20" cy="18" r="1.2" fill="#ff9f1c"/>
                        </svg>
                    </div>
                    <div class="nav-brand-text">
                        <span class="nav-brand-name">Community of <span class="text-gradient">Travellers</span></span>
                    </div>
                </a>

                <!-- Desktop Nav Links -->
                <div class="nav-links" id="nav-links">
                    ${NAV_LINKS.map(link => `
                        <a href="#${link.path}" class="nav-link ${window.location.hash === '#' + link.path || (link.path === '/' && (!window.location.hash || window.location.hash === '#/')) ? 'active' : ''}" data-path="${link.path}">
                            ${link.label}
                        </a>
                    `).join('')}
                </div>

                <!-- Right Actions -->
                <div class="nav-actions">
                    ${isLoggedIn ? `
                        <!-- Notifications -->
                        <button class="btn btn-icon btn-ghost nav-notification" id="nav-notifications" aria-label="Notifications">
                            <span class="material-icons-round">notifications</span>
                            ${unreadCount > 0 ? `<span class="notification-badge">${unreadCount}</span>` : ''}
                        </button>
                        
                        <!-- Messages -->
                        <a href="#/messages" class="btn btn-icon btn-ghost nav-messages" aria-label="Messages">
                            <span class="material-icons-round">chat</span>
                        </a>

                        <!-- Saved -->
                        <a href="#/saved" class="btn btn-icon btn-ghost" aria-label="Saved trips">
                            <span class="material-icons-round">favorite_border</span>
                        </a>

                        ${userRole === 'admin' ? `
                            <a href="#/admin" class="btn btn-secondary btn-sm nav-admin-cta" style="background:var(--gradient-teal);border:none;">
                                <span class="material-icons-round" style="font-size:16px">admin_panel_settings</span>
                                Admin Panel
                            </a>
                        ` : userRole === 'host' ? `
                            <a href="#/dashboard" class="btn btn-secondary btn-sm nav-dashboard-cta">
                                <span class="material-icons-round" style="font-size:16px">dashboard</span>
                                Dashboard
                            </a>
                        ` : `
                            <a href="#/host-register" class="btn btn-primary btn-sm nav-host-cta">
                                <span class="material-icons-round" style="font-size:16px">add_circle</span>
                                Become a Host
                            </a>
                        `}

                        <!-- User Menu -->
                        <div class="nav-user-menu dropdown" id="nav-user-menu">
                            <button class="nav-user-trigger" id="nav-user-trigger" style="background:none;border:none;cursor:pointer;padding:0;">
                                <div class="avatar avatar-sm">
                                    <img src="${user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'}" alt="${escapeHTML(user?.name || 'User')}" loading="lazy">
                                </div>
                            </button>
                            <div class="nav-dropdown dropdown-menu" id="nav-dropdown">
                                <div class="nav-dropdown-header" style="padding:var(--space-3) var(--space-4);display:flex;flex-direction:column;gap:4px;border-bottom:1px solid var(--color-border);margin-bottom:var(--space-2)">
                                    <strong style="color:var(--color-text-primary);font-size:var(--text-sm);font-weight:600;display:block;">${escapeHTML(user?.name || 'User')}</strong>
                                    <span class="text-muted" style="font-size:var(--text-xs);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;">${escapeHTML(user?.email || '')}</span>
                                </div>
                                <a href="#/profile" class="nav-dropdown-item dropdown-item">
                                    <span class="material-icons-round">person</span> My Profile
                                </a>
                                <a href="#/saved" class="nav-dropdown-item dropdown-item">
                                    <span class="material-icons-round">favorite</span> Saved Trips
                                </a>
                                <a href="#/messages" class="nav-dropdown-item dropdown-item">
                                    <span class="material-icons-round">chat</span> Messages
                                </a>
                                ${userRole === 'host' ? `
                                    <a href="#/dashboard" class="nav-dropdown-item dropdown-item">
                                        <span class="material-icons-round">dashboard</span> Host Dashboard
                                    </a>
                                ` : ''}
                                ${userRole === 'traveler' ? `
                                    <a href="#/host-register" class="nav-dropdown-item dropdown-item" style="color:var(--color-teal)">
                                        <span class="material-icons-round" style="color:var(--color-teal)">add_circle</span> Become a Host
                                    </a>
                                ` : ''}
                                ${userRole === 'admin' ? `
                                    <a href="#/admin" class="nav-dropdown-item dropdown-item">
                                        <span class="material-icons-round">admin_panel_settings</span> Admin Panel
                                    </a>
                                ` : ''}
                                <div class="nav-dropdown-divider dropdown-divider"></div>
                                <button class="nav-dropdown-item dropdown-item destructive" id="nav-logout">
                                    <span class="material-icons-round">logout</span> Logout
                                </button>
                            </div>
                        </div>
                    ` : `
                        <a href="#/trips" class="btn btn-primary btn-sm nav-start-exploring" style="border-radius:99px;padding:8px 18px;background:linear-gradient(135deg, #f59e0b 0%, #ff9f1c 100%);color:#0f172a;border:none;display:inline-flex;align-items:center;gap:6px;font-weight:700;box-shadow:0 2px 10px rgba(245,158,11,0.25);white-space:nowrap;">
                            <span class="material-icons-round" style="font-size:16px;">near_me</span>
                            Start Exploring
                        </a>
                        <a href="#/login" class="btn btn-ghost btn-sm nav-login-btn" style="border-radius:99px;padding:8px 16px;color:#ffffff;display:inline-flex;align-items:center;gap:6px;background:transparent;border:none;white-space:nowrap;">
                            <span class="material-icons-round" style="font-size:16px;">login</span>
                            Login
                        </a>
                        <a href="#/host-register" class="btn btn-outline btn-sm nav-host-btn" style="border-radius:99px;padding:7px 16px;border:1px solid rgba(255,255,255,0.2);display:inline-flex;align-items:center;gap:6px;color:#ffffff;background:transparent;white-space:nowrap;">
                            <span class="material-icons-round" style="font-size:16px;">person_outline</span>
                            Host
                        </a>
                    `}

                    <!-- Mobile Menu Toggle -->
                    <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle menu" aria-expanded="false">
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile Menu Overlay -->
        <div class="mobile-menu-overlay" id="mobile-menu-overlay">
            <div class="mobile-menu-panel glass-panel" id="mobile-menu-panel">
                <div class="mobile-menu-header">
                    <span class="nav-brand-name">Community of <span class="text-gradient">Travellers</span></span>
                    <button class="btn btn-icon btn-ghost" id="mobile-menu-close" aria-label="Close menu">
                        <span class="material-icons-round">close</span>
                    </button>
                </div>
                <div class="mobile-menu-links">
                    ${NAV_LINKS.map(link => `
                        <a href="#${link.path}" class="mobile-menu-link" data-path="${link.path}">
                            <span class="material-icons-round">${link.icon}</span>
                            ${link.label}
                        </a>
                    `).join('')}
                </div>
                <div class="mobile-menu-divider"></div>
                <div class="mobile-menu-actions">
                    ${!isLoggedIn ? `
                        <a href="#/login" class="btn btn-secondary w-full">Log in</a>
                        <a href="#/signup" class="btn btn-primary w-full">Sign up</a>
                        <a href="#/host-register" class="btn btn-warm w-full">Become a Host</a>
                    ` : `
                        <a href="#/profile" class="btn btn-ghost w-full" style="justify-content:flex-start;gap:12px;">
                            <span class="material-icons-round">person</span> My Profile
                        </a>
                        ${userRole === 'admin' ? `
                            <a href="#/admin" class="btn btn-ghost w-full" style="justify-content:flex-start;gap:12px;">
                                <span class="material-icons-round">admin_panel_settings</span> Admin Panel
                            </a>
                        ` : userRole === 'host' ? `
                            <a href="#/dashboard" class="btn btn-ghost w-full" style="justify-content:flex-start;gap:12px;">
                                <span class="material-icons-round">dashboard</span> Dashboard
                            </a>
                        ` : `
                            <a href="#/host-register" class="btn btn-ghost w-full" style="justify-content:flex-start;gap:12px;color:var(--color-teal)">
                                <span class="material-icons-round" style="color:var(--color-teal)">add_circle</span> Become a Host
                            </a>
                        `}
                        <button class="btn btn-ghost w-full" id="mobile-logout" style="justify-content:flex-start;gap:12px;">
                            <span class="material-icons-round">logout</span> Logout
                        </button>
                    `}
                </div>
                <div class="mobile-menu-footer">
                    <a href="#/" class="btn btn-primary btn-lg w-full">
                        <span class="material-icons-round">travel_explore</span>
                        Start Exploring
                    </a>
                </div>
            </div>
        </div>
    `;

    // Setup event listeners
    setupNavbarEvents();
}

function setupNavbarEvents() {
    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        const currentScroll = window.scrollY;
        
        if (currentScroll > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
        
        // Hide/show on scroll direction
        if (currentScroll > lastScroll && currentScroll > 200) {
            navbar.classList.add('navbar-hidden');
        } else {
            navbar.classList.remove('navbar-hidden');
        }
        
        lastScroll = currentScroll;
    });

    // Mobile menu
    const menuBtn = document.getElementById('mobile-menu-btn');
    const overlay = document.getElementById('mobile-menu-overlay');
    const closeBtn = document.getElementById('mobile-menu-close');

    const toggleMenu = (show) => {
        overlay?.classList.toggle('open', show);
        menuBtn?.classList.toggle('active', show);
        menuBtn?.setAttribute('aria-expanded', show);
        document.body.style.overflow = show ? 'hidden' : '';
    };

    menuBtn?.addEventListener('click', () => toggleMenu(true));
    closeBtn?.addEventListener('click', () => toggleMenu(false));
    overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) toggleMenu(false);
    });

    // Close mobile menu on clicking any link/button inside panel
    document.querySelectorAll('#mobile-menu-panel a, #mobile-menu-panel button').forEach(el => {
        el.addEventListener('click', () => toggleMenu(false));
    });

    // User dropdown
    const userTrigger = document.getElementById('nav-user-trigger');
    const dropdown = document.getElementById('nav-dropdown');
    if (userTrigger && dropdown) {
        userTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });
        document.addEventListener('click', () => dropdown.classList.remove('open'));
    }

    // Logout
    document.getElementById('nav-logout')?.addEventListener('click', () => {
        store.logout();
        navigateTo('/');
        renderNavbar();
        store.addToast('Logged out successfully', 'info');
    });
    document.getElementById('mobile-logout')?.addEventListener('click', () => {
        store.logout();
        navigateTo('/');
        toggleMenu(false);
        renderNavbar();
        store.addToast('Logged out successfully', 'info');
    });
}

// Mobile Bottom Navigation
export function renderMobileNav() {
    const mobileNav = document.getElementById('mobile-bottom-nav');
    if (!mobileNav) return;

    mobileNav.innerHTML = `
        <div class="mobile-nav">
            <a href="#/" class="mobile-nav-item ${!window.location.hash || window.location.hash === '#/' ? 'active' : ''}">
                <span class="material-icons-round">explore</span>
                <span>Discover</span>
            </a>
            <a href="#/trips" class="mobile-nav-item ${window.location.hash === '#/trips' ? 'active' : ''}">
                <span class="material-icons-round">map</span>
                <span>Trips</span>
            </a>
            <a href="#/saved" class="mobile-nav-item ${window.location.hash === '#/saved' ? 'active' : ''}">
                <span class="material-icons-round">favorite_border</span>
                <span>Saved</span>
            </a>
            <a href="#/messages" class="mobile-nav-item ${window.location.hash === '#/messages' ? 'active' : ''}">
                <span class="material-icons-round">chat_bubble_outline</span>
                <span>Messages</span>
                ${store.get('unreadCount') > 0 ? '<span class="mobile-nav-badge"></span>' : ''}
            </a>
            <a href="#/${store.get('isLoggedIn') ? 'profile' : 'login'}" class="mobile-nav-item">
                <span class="material-icons-round">person_outline</span>
                <span>${store.get('isLoggedIn') ? 'Profile' : 'Login'}</span>
            </a>
        </div>
    `;
}
