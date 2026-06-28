// ============================================
// Main Application Entry Point
// Community of Travellers — SPA Bootstrap
// ============================================

import { renderNavbar, renderMobileNav } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { initToasts } from './components/toast.js';
import { store } from './state.js';
import { syncTripsWithServer } from './data/trips.js';
import { 
    initBackgroundParticles, 
    initCustomCursor, 
    initCardTilts, 
    setupCursorListeners, 
    applyWishlistStamp 
} from './components/effects.js';

// Page imports
import { renderHomePage, destroyHomePage } from './pages/home.js';
import { renderTripDetailPage } from './pages/trip-detail.js';
import { renderTripsPage } from './pages/trips.js';
import { renderLoginPage, renderSignupPage } from './pages/login.js';
import { renderDashboardPage } from './pages/dashboard.js';
import { renderAdminPage } from './pages/admin.js';
import { renderProfilePage } from './pages/profile.js';
import { renderMessagesPage } from './pages/messages.js';
import { renderSavedPage } from './pages/saved.js';
import { renderHostRegisterPage } from './pages/host-register.js';
import { renderHostProfilePage } from './pages/host-profile.js';
import { renderExperiencesPage, renderCommunityPage, renderHostsPage, renderJobsPage, renderRemotePage, renderInviteOnlyPage } from './pages/info-pages.js';

// ─── Router ─────────────────────────────────────────────────
const routes = {
    '/': renderHomePage,
    '/trips': renderTripsPage,
    '/login': renderLoginPage,
    '/signup': renderSignupPage,
    '/dashboard': renderDashboardPage,
    '/admin': renderAdminPage,
    '/profile': renderProfilePage,
    '/messages': renderMessagesPage,
    '/saved': renderSavedPage,
    '/host-register': renderHostRegisterPage,
    '/experiences': renderExperiencesPage,
    '/community': renderCommunityPage,
    '/hosts': renderHostsPage,
    '/jobs': renderJobsPage,
    '/remote': renderRemotePage,
    '/invite-only': renderInviteOnlyPage,
};

function initGlobalAnimations() {
    const elements = document.querySelectorAll('.animate-in, .animate-in-left, .animate-in-right, .animate-in-scale');
    
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.01, rootMargin: '0px' }
    );

    elements.forEach(el => {
        observer.observe(el);
        // Fail-safe fallback to ensure content is never left invisible
        setTimeout(() => {
            el.classList.add('visible');
        }, 150);
    });
}

function handleRoute() {
    try {
        const hash = window.location.hash.slice(1) || '/';
        const [path, queryString] = hash.split('?');

        // Parse query params
        if (queryString) {
            const params = new URLSearchParams(queryString);
            // Apply filter params
            if (params.get('type')) store.set('filters.tripType', [params.get('type')]);
            if (params.get('sort')) store.set('filters.sortBy', params.get('sort'));
            if (params.get('dest')) store.set('filters.destination', params.get('dest'));
            if (params.get('host')) store.set('filters.hostId', params.get('host'));
        } else {
            if (path === '/trips') {
                store.set('filters.hostId', '');
            }
        }

        // Cleanup previous page
        destroyHomePage?.();

        // Scroll to top
        window.scrollTo(0, 0);

        // Match route
        if (routes[path]) {
            routes[path]();
        } else if (path.startsWith('/trip/')) {
            const slug = path.replace('/trip/', '');
            renderTripDetailPage(slug);
        } else if (path.startsWith('/host/')) {
            const hostId = path.replace('/host/', '');
            renderHostProfilePage(hostId);
        } else {
            // 404 fallback
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = `
                    <div style="min-height:80vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:var(--space-8)">
                        <span class="material-icons-round" style="font-size:80px;color:var(--color-text-muted);margin-bottom:var(--space-4)">explore_off</span>
                        <h2 style="font-size:var(--text-3xl)">Page Not Found</h2>
                        <p class="text-muted" style="margin-top:var(--space-3);max-width:400px">The destination you're looking for doesn't exist yet. Let's get you back on track!</p>
                        <a href="#/" class="btn btn-primary btn-lg" style="margin-top:var(--space-6)">
                            <span class="material-icons-round">home</span>
                            Back to Home
                        </a>
                    </div>
                `;
            }
        }

        // Re-render nav with active states
        renderNavbar();
        renderMobileNav();
        renderFooter();

        // Trigger entrance scroll animations globally
        initGlobalAnimations();

        // 3D Visual Effects hookups
        setTimeout(() => {
            initCardTilts();
            setupCursorListeners();
        }, 80);
    } catch (error) {
        console.error('Routing/Rendering Error:', error);
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div style="min-height:80vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:var(--space-8);color:var(--color-coral)">
                    <span class="material-icons-round" style="font-size:80px;margin-bottom:var(--space-4)">error_outline</span>
                    <h2 style="font-size:var(--text-3xl)">Application Error</h2>
                    <p style="margin-top:var(--space-3);max-width:600px;font-family:monospace;background:rgba(255,255,255,0.05);padding:var(--space-4);border-radius:var(--radius-md);text-align:left;overflow-x:auto;">
                        ${error.message}<br><br>${error.stack ? error.stack.replace(/\\n/g, '<br>').replace(/\n/g, '<br>') : ''}
                    </p>
                    <a href="#/" class="btn btn-primary btn-lg" style="margin-top:var(--space-6)">
                        <span class="material-icons-round">home</span>
                        Back to Home
                    </a>
                </div>
            `;
        }
    }
}

function setupWishlistStampListeners() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.card-wishlist-btn');
        if (!btn) return;
        
        const tripId = btn.dataset.tripId;
        const card = btn.closest('.trip-card-redesign');
        if (!card) return;
        
        setTimeout(() => {
            const isSavedNow = store.isTripSaved(tripId);
            applyWishlistStamp(card, isSavedNow);
        }, 80);
    });
}

// ─── Initialize App ─────────────────────────────────────────
function init() {
    // Initialize toast system
    initToasts();

    // Start global 3D & custom effects
    initBackgroundParticles();
    initCustomCursor();
    setupWishlistStampListeners();

    // Render initial shell
    renderNavbar();
    renderMobileNav();
    renderFooter();

    // Initial route
    syncTripsWithServer().then(() => {
        handleRoute();
    }).catch(() => {
        handleRoute();
    });

    // Listen for route changes
    window.addEventListener('hashchange', handleRoute);

    // Watch store role/login updates to immediately sync shell UI
    store.on('isLoggedIn', () => {
        renderNavbar();
        renderMobileNav();
    });
    store.on('userRole', () => {
        renderNavbar();
        renderMobileNav();
    });

    // Setup global toast renderer
    store.on('toasts', (toasts) => {
        const container = document.getElementById('toast-container');
        if (!container) return;
        container.innerHTML = toasts.map(toast => `
            <div class="toast toast-${toast.type}" id="toast-${toast.id}">
                <span class="toast-icon material-icons-round">${
                    toast.type === 'success' ? 'check_circle' :
                    toast.type === 'error' ? 'error' :
                    toast.type === 'warning' ? 'warning' : 'info'
                }</span>
                <span class="toast-message">${toast.message}</span>
                <button class="toast-close" onclick="this.closest('.toast').remove()" aria-label="Close">
                    <span class="material-icons-round" style="font-size:16px">close</span>
                </button>
            </div>
        `).join('');

        // Auto-dismiss
        toasts.forEach(toast => {
            setTimeout(() => {
                const el = document.getElementById(`toast-${toast.id}`);
                if (el) {
                    el.style.animation = 'slideOutRight 0.3s ease forwards';
                    setTimeout(() => el.remove(), 300);
                }
                store.removeToast(toast.id);
            }, 4000);
        });
    });

    console.log('%c✈️ Community of Travellers', 'font-size:20px;font-weight:bold;color:#00d4aa;');
    console.log('%cLet\'s travel together smartly & safely', 'font-size:12px;color:#94a3b8;');
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
