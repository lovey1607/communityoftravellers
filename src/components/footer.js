// ============================================
// Footer Component
// ============================================

import { destinations } from '../data/destinations.js';

export function renderFooter() {
    const footer = document.getElementById('main-footer');
    if (!footer) return;

    const topDestinations = (destinations || []).filter(d => d.popular).slice(0, 8);

    footer.innerHTML = `
        <div class="footer">
            <div class="container">
                <!-- Ambient glow -->
                <div class="footer-glow"></div>

                <div class="footer-grid">
                    <!-- Brand Column -->
                    <div class="footer-column footer-brand-col">
                        <div class="footer-brand">
                            <svg width="28" height="28" viewBox="0 0 32 32"><defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#00d4aa"/><stop offset="100%" stop-color="#00bcd4"/></linearGradient></defs><circle cx="16" cy="16" r="14" fill="none" stroke="url(#fg)" stroke-width="2"/><ellipse cx="16" cy="16" rx="6" ry="13" fill="none" stroke="url(#fg)" stroke-width="1.2" opacity="0.6"/><line x1="3" y1="16" x2="29" y2="16" stroke="url(#fg)" stroke-width="0.8" opacity="0.5"/><circle cx="12" cy="12" r="1.5" fill="#00d4aa"/><circle cx="20" cy="18" r="1.2" fill="#f59e0b"/></svg>
                            <span class="footer-brand-name">Community of <span class="text-gradient">Travellers</span></span>
                        </div>
                        <p class="footer-tagline">Let's travel together smartly & safely</p>
                        <p class="footer-description">India's most trusted group travel marketplace. Discover verified hosts, curated trips, and a community that travels together.</p>
                        <div class="footer-socials">
                            <a href="#" class="footer-social-link" aria-label="Instagram">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
                            </a>
                            <a href="#" class="footer-social-link" aria-label="Twitter/X">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </a>
                            <a href="#" class="footer-social-link" aria-label="YouTube">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            </a>
                            <a href="#" class="footer-social-link" aria-label="LinkedIn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </a>
                        </div>
                    </div>

                    <!-- Quick Links -->
                    <div class="footer-column">
                        <h4 class="footer-column-title">Discover</h4>
                        <ul class="footer-links">
                            <li><a href="#/trips">Group Trips</a></li>
                            <li><a href="#/experiences">Experiences</a></li>
                            <li><a href="#/destinations">Destinations</a></li>
                            <li><a href="#/community">Community</a></li>
                            <li><a href="#/hosts">Travel Hosts</a></li>
                            <li><a href="#/jobs">Travel Jobs</a></li>
                        </ul>
                    </div>

                    <!-- Hosting -->
                    <div class="footer-column">
                        <h4 class="footer-column-title">For Hosts</h4>
                        <ul class="footer-links">
                            <li><a href="#/host-register">Become a Host</a></li>
                            <li><a href="#/dashboard">Host Dashboard</a></li>
                            <li><a href="#/host-guide">Hosting Guide</a></li>
                            <li><a href="#/verification">Verification</a></li>
                            <li><a href="#/pricing">Pricing</a></li>
                            <li><a href="#/support">Host Support</a></li>
                        </ul>
                    </div>

                    <!-- Destinations -->
                    <div class="footer-column">
                        <h4 class="footer-column-title">Top Destinations</h4>
                        <ul class="footer-links">
                            ${topDestinations.map(d => `<li><a href="#/destination/${d.slug}">${d.name}</a></li>`).join('')}
                        </ul>
                    </div>

                    <!-- Support -->
                    <div class="footer-column">
                        <h4 class="footer-column-title">Support</h4>
                        <ul class="footer-links">
                            <li><a href="#/about">About Us</a></li>
                            <li><a href="#/contact">Contact</a></li>
                            <li><a href="#/faq">FAQs</a></li>
                            <li><a href="#/safety">Safety Center</a></li>
                            <li><a href="#/privacy">Privacy Policy</a></li>
                            <li><a href="#/terms">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                <!-- Bottom Bar -->
                <div class="footer-bottom">
                    <p class="footer-copyright">© 2026 Community of Travellers. All rights reserved.</p>
                    <p class="footer-love">Made with ❤️ for the travel community</p>
                </div>
            </div>
        </div>
    `;
}
