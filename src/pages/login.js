// ============================================
// Auth Pages — Login & Signup
// ============================================

import { store } from '../state.js';
import { users, saveUsers } from '../data/users.js';

export function renderLoginPage() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div class="auth-page">
            <div class="auth-panel glass-panel">
                <div style="text-align:center;margin-bottom:var(--space-2)">
                    <svg width="40" height="40" viewBox="0 0 32 32"><defs><linearGradient id="al" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00d4aa"/><stop offset="100%" stop-color="#00bcd4"/></linearGradient></defs><circle cx="16" cy="16" r="14" fill="none" stroke="url(#al)" stroke-width="2"/><ellipse cx="16" cy="16" rx="6" ry="13" fill="none" stroke="url(#al)" stroke-width="1.2" opacity="0.6"/><circle cx="12" cy="12" r="1.5" fill="#00d4aa"/></svg>
                </div>
                <h2 class="auth-title">Welcome Back</h2>
                <p class="auth-subtitle">Log in to your Community of Travellers account</p>

                <form class="auth-form" id="login-form">
                    <div class="form-group">
                        <label class="form-label" for="login-email">Email</label>
                        <input type="email" class="input" id="login-email" placeholder="you@example.com" required value="ananya@example.com">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="login-password">Password</label>
                        <input type="password" class="input" id="login-password" placeholder="Enter password" required value="demo123">
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg w-full">Log In</button>
                </form>

                <div class="auth-divider"><span style="color:var(--color-text-muted);font-size:var(--text-sm)">or continue with</span></div>

                <div class="auth-social-buttons">
                    <button class="btn btn-glass w-full" id="google-login">
                        <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.94 10.94 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        Google
                    </button>
                </div>

                <p class="auth-footer">
                    Don't have an account? <a href="#/signup" class="text-gradient" style="font-weight:600">Sign up</a>
                </p>

                <div style="margin-top:var(--space-4);padding:var(--space-3);background:rgba(255,255,255,0.03);border:1px dashed var(--color-border);border-radius:var(--radius-md);text-align:center">
                    <p style="font-size:var(--text-xs);color:var(--color-text-secondary);margin-bottom:var(--space-2)">🚀 <strong>Quick Demo Login Presets:</strong></p>
                    <div style="display:flex;gap:var(--space-2);justify-content:center;flex-wrap:wrap;">
                        <button type="button" class="btn btn-glass btn-sm" id="preset-traveler" style="padding:var(--space-1) var(--space-2);font-size:11px;">👩 Traveler</button>
                        <button type="button" class="btn btn-glass btn-sm" id="preset-host" style="padding:var(--space-1) var(--space-2);font-size:11px;">🏡 Host (Priya)</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Helper to log in instantly
    const loginInstantly = (email, password) => {
        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');
        if (emailInput && passInput) {
            emailInput.value = email;
            passInput.value = password;
            document.getElementById('login-form')?.requestSubmit();
        }
    };

    // Preset button event listeners
    document.getElementById('preset-traveler')?.addEventListener('click', () => {
        loginInstantly('ananya.sharma@example.com', 'demo123');
    });
    document.getElementById('preset-host')?.addEventListener('click', () => {
        loginInstantly('priya@example.com', 'demo123');
    });

    document.getElementById('login-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email')?.value?.trim()?.toLowerCase();
        const password = document.getElementById('login-password')?.value;
        
        const user = users.find(u => u.email?.toLowerCase() === email);
        if (!user) {
            store.addToast(`Account not found for ${escapeHTML(email)}!`, 'error');
            return;
        }

        const requiredPassword = user.password || 'demo123';
        if (password !== requiredPassword) {
            store.addToast(`Incorrect password!`, 'error');
            return;
        }

        store.login(user);
        store.addToast(`Welcome back, ${user.name}! 🎉`, 'success');
        window.location.hash = '#/';
    });

    document.getElementById('google-login')?.addEventListener('click', () => {
        const user = users[0];
        store.login(user);
        store.addToast(`Logged in with Google as ${user.name}! 🎉`, 'success');
        window.location.hash = '#/';
    });
}

export function renderSignupPage() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
        <div class="auth-page">
            <div class="auth-panel glass-panel">
                <h2 class="auth-title">Join the Community</h2>
                <p class="auth-subtitle">Create your free account and start exploring</p>

                <form class="auth-form" id="signup-form">
                    <div class="form-group">
                        <label class="form-label" for="signup-name">Full Name</label>
                        <input type="text" class="input" id="signup-name" placeholder="Your name" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="signup-email">Email</label>
                        <input type="email" class="input" id="signup-email" placeholder="you@example.com" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="signup-city">City</label>
                        <input type="text" class="input" id="signup-city" placeholder="Mumbai, Delhi, etc.">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="signup-password">Password</label>
                        <input type="password" class="input" id="signup-password" placeholder="Min 8 characters" required minlength="8">
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg w-full">Create Account</button>
                </form>

                <p class="auth-footer">
                    Already have an account? <a href="#/login" class="text-gradient" style="font-weight:600">Log in</a>
                </p>
            </div>
        </div>
    `;

    document.getElementById('signup-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name')?.value || 'Traveller';
        const email = document.getElementById('signup-email')?.value;
        const city = document.getElementById('signup-city')?.value || 'India';
        const newUser = {
            id: 'user-new-' + Date.now(),
            name, email, city, role: 'traveler',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
            savedTrips: [], interests: [], tripsCompleted: 0
        };
        users.push(newUser);
        saveUsers();
        store.login(newUser);
        store.addToast(`Welcome to the community, ${name}! 🎉🌍`, 'success');
        window.location.hash = '#/';
    });
}
