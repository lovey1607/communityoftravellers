// ============================================
// Home Page — Full Landing Experience
// ============================================

import { trips } from '../data/trips.js';
import { hosts } from '../data/hosts.js';
import { destinations } from '../data/destinations.js';
import { categories } from '../data/categories.js';
import { reviews } from '../data/reviews.js';
import { renderTripCard, setupTripCardEvents } from '../components/trip-card.js';
import { Particles } from '../components/particles.js';
import { store, escapeHTML } from '../state.js';
import { formatNumber, formatPrice } from '../utils/format.js';
import { showCommunityAccessModal, showAiTripMatcherModal } from '../components/modals.js';

let particleInstance = null;
let globeInstance = null;
let liveTimerInstance = null;
let heroStartDate = '2026-06-01';
let heroEndDate = '2026-09-30';
let activeMonthFilter = 'all';

export function renderHomePage() {
    const app = document.getElementById('app');
    if (!app) return;

    // Set page theme to sunset by default
    if (document.body) {
        document.body.classList.add('theme-sunset');
        document.body.classList.remove('theme-sunrise');
    }

    const verifiedHostsSet = new Set(hosts.filter(h => h.verified).map(h => h.id));
    const featuredTrips = trips.filter(t => t.featured && t.status === 'published' && verifiedHostsSet.has(t.hostId));
    const trendingTrips = trips.filter(t => t.trending && t.status === 'published' && verifiedHostsSet.has(t.hostId));
    const firstSixTrending = trendingTrips.slice(0, 6);
    const remainingTrending = trendingTrips.slice(6);
    const popularDests = (destinations || []).filter(d => d.popular).slice(0, 8);
    const topReviews = (reviews || []).slice(0, 3);
    const hostsMap = {};
    (hosts || []).forEach(h => hostsMap[h.id] = h);

    app.innerHTML = `
        <!-- ====== HERO SECTION ====== -->
        <style>
            .hero-section {
                background: linear-gradient(135deg, rgba(251, 191, 36, 0.25) 0%, rgba(7, 10, 30, 0.85) 100%), url('https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1600&q=80') center/cover no-repeat !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                position: relative !important;
                min-height: 100vh !important;
                padding: calc(var(--nav-height) + 40px) var(--space-4) 40px var(--space-4) !important;
                transition: background 0.8s ease;
                overflow: hidden !important;
            }
            .hero-content-split {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                max-width: 1200px;
                gap: 40px;
                position: relative;
                z-index: 2;
            }
            .hero-left {
                flex: 1.1;
                text-align: left;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }
            .hero-right {
                flex: 0.9;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
                min-width: 420px;
            }
            .dest-pill {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.08);
                padding: 8px 18px;
                border-radius: 99px;
                color: rgba(255, 255, 255, 0.85);
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: var(--font-body);
            }
            .dest-pill:hover {
                background: rgba(255, 90, 0, 0.15);
                border-color: rgba(255, 90, 0, 0.4);
                color: #ffffff;
                transform: translateY(-2px);
            }
            .action-card {
                display: flex;
                align-items: center;
                gap: 16px;
                background: rgba(255, 90, 0, 0.04);
                border: 1px solid rgba(255, 90, 0, 0.15);
                padding: 14px 24px;
                border-radius: var(--radius-xl);
                cursor: pointer;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                max-width: 330px;
                width: 100%;
                text-align: left;
            }
            .action-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                background: rgba(255, 90, 0, 0.08);
                border-color: rgba(255, 90, 0, 0.4);
            }
            .action-card.wa-card {
                background: rgba(34, 197, 94, 0.04);
                border: 1px solid rgba(34, 197, 94, 0.15);
            }
            .action-card.wa-card:hover {
                background: rgba(34, 197, 94, 0.08);
                border-color: rgba(34, 197, 94, 0.4);
            }
            .hero-title-left {
                font-family: var(--font-heading);
                font-size: clamp(2rem, 3.8vw, 3.25rem);
                font-weight: 800;
                line-height: 1.15;
                text-transform: none;
                text-align: left;
                color: #ffffff;
                letter-spacing: -0.02em;
                margin-bottom: 24px;
            }
            .hero-title-left span {
                text-transform: none;
            }
            .carousel-3d-viewport {
                width: 100%;
                height: 430px;
                margin: 0;
                perspective: 1500px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            .carousel-3d-deck {
                width: 280px;
                height: 380px;
                transform-style: preserve-3d;
                transform: rotateX(-5deg) rotateY(0deg);
                cursor: grab;
            }
            .carousel-3d-deck .trip-card-redesign {
                width: 280px !important;
                height: 380px !important;
            }
            @media (max-width: 1024px) {
                .hero-content-split {
                    flex-direction: column;
                    text-align: center;
                    align-items: center;
                }
                .hero-left {
                    align-items: center;
                    text-align: center;
                }
                .hero-right {
                    min-width: unset;
                    width: 100%;
                    margin-top: 30px;
                }
                .hero-title-left {
                    text-align: center;
                }
            }
            @media (min-width: 1025px) {
                .hero-title-one-line {
                    white-space: nowrap;
                }
            }
            
            /* Journey Planner Calendar Styles */
            .quick-month-btn:hover {
                background: rgba(0, 242, 254, 0.06) !important;
                border-color: rgba(0, 242, 254, 0.4) !important;
                transform: translateY(-1px);
            }
            .quick-month-btn.active {
                background: rgba(0, 242, 254, 0.12) !important;
                border-color: var(--color-teal) !important;
                color: #fff !important;
                box-shadow: 0 0 10px rgba(0, 242, 254, 0.2);
            }
            .date-picker-3d:focus {
                border-color: var(--color-teal) !important;
                box-shadow: 0 0 8px rgba(0, 242, 254, 0.2);
            }
            @keyframes morph3d {
                0% {
                    opacity: 0;
                    transform: translate3d(0, 40px, -120px) rotateX(-15deg) scale(0.85);
                }
                100% {
                    opacity: 1;
                    transform: translate3d(0, 0, 0) rotateX(0deg) scale(1);
                }
            }
            .carousel-card-wrapper {
                animation: morph3d 0.55s cubic-bezier(0.23, 1, 0.32, 1) forwards;
            }

            /* Experience Gateway Section styles */
            .gateway-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--space-8);
                margin-top: var(--space-8);
            }
            @media (max-width: 768px) {
                .gateway-grid {
                    grid-template-columns: 1fr;
                    gap: var(--space-6);
                }
            }
            .gateway-card {
                position: relative;
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: var(--radius-lg);
                padding: var(--space-8) var(--space-6);
                text-align: center;
                cursor: pointer;
                overflow: hidden;
                transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.5s, box-shadow 0.5s;
                transform-style: preserve-3d;
                perspective: 1000px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .gateway-card::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%);
                opacity: 1;
                transition: opacity 0.5s;
                z-index: -1;
            }
            .gateway-card.creator-card:hover, .gateway-card.creator-card.active-gateway {
                border-color: rgba(255, 120, 0, 0.45);
                box-shadow: 0 20px 45px rgba(255, 90, 0, 0.12), inset 0 0 20px rgba(255, 90, 0, 0.04);
            }
            .gateway-card.agency-card:hover, .gateway-card.agency-card.active-gateway {
                border-color: rgba(0, 242, 254, 0.45);
                box-shadow: 0 20px 45px rgba(0, 188, 212, 0.12), inset 0 0 20px rgba(0, 188, 212, 0.04);
            }
            .gateway-card.active-gateway {
                background: rgba(255, 255, 255, 0.04);
            }
            .portal-ring-container {
                position: relative;
                width: 140px;
                height: 140px;
                margin-bottom: var(--space-6);
                perspective: 500px;
                display: flex;
                align-items: center;
                justify-content: center;
                transform: translateZ(30px);
            }
            .portal-orb {
                width: 65px;
                height: 65px;
                border-radius: 50%;
                position: absolute;
                z-index: 2;
                transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s;
            }
            .creator-card .portal-orb {
                background: radial-gradient(circle at 30% 30%, #ffd700, #ff5e00 85%);
                box-shadow: 0 0 35px rgba(255, 94, 0, 0.6), inset -5px -5px 15px rgba(0,0,0,0.5);
            }
            .agency-card .portal-orb {
                background: radial-gradient(circle at 30% 30%, #00f2fe, #0072ff 85%);
                box-shadow: 0 0 35px rgba(0, 242, 254, 0.6), inset -5px -5px 15px rgba(0,0,0,0.5);
            }
            .gateway-card:hover .portal-orb {
                transform: scale(1.1) translateZ(10px);
            }
            .portal-ring {
                position: absolute;
                border: 2px dashed rgba(255,255,255,0.25);
                border-radius: 50%;
                animation: spin-ring 12s linear infinite;
                transform-style: preserve-3d;
            }
            .creator-card .portal-ring {
                border-color: rgba(255, 159, 28, 0.35);
            }
            .agency-card .portal-ring {
                border-color: rgba(0, 242, 254, 0.35);
            }
            .ring-1 {
                width: 110px; height: 110px;
                transform: rotateX(65deg) rotateY(15deg);
            }
            .ring-2 {
                width: 125px; height: 125px;
                transform: rotateX(-65deg) rotateY(-15deg);
                animation-duration: 18s;
                animation-direction: reverse;
            }
            .ring-3 {
                width: 140px; height: 140px;
                transform: rotateX(85deg) rotateY(0deg);
                animation-duration: 25s;
                border-style: dotted;
            }
            @keyframes spin-ring {
                0% { transform: rotateZ(0deg) rotateX(var(--rotX, 60deg)); }
                100% { transform: rotateZ(360deg) rotateX(var(--rotX, 60deg)); }
            }
            .gateway-badge {
                padding: 4px 12px;
                border-radius: 99px;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                margin-bottom: var(--space-3);
                border: 1px solid currentColor;
            }
            .creator-card .gateway-badge {
                color: #ff9f28;
                background: rgba(255, 159, 40, 0.05);
            }
            .agency-card .gateway-badge {
                color: #00f2fe;
                background: rgba(0, 242, 254, 0.05);
            }
            .gateway-card-title {
                font-size: var(--text-xl);
                font-family: var(--font-heading);
                font-weight: 700;
                margin-bottom: var(--space-2);
                color: #fff;
                transform: translateZ(20px);
            }
            .gateway-card-desc {
                font-size: 13px;
                color: var(--color-text-secondary);
                line-height: 1.6;
                margin-bottom: var(--space-4);
                max-width: 320px;
                transform: translateZ(10px);
            }
            .gateway-card-action {
                font-size: 12px;
                font-weight: 600;
                color: var(--color-teal);
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: auto;
                transition: gap 0.3s;
                transform: translateZ(15px);
            }
            .gateway-card:hover .gateway-card-action {
                gap: 10px;
                color: #fff;
            }
            .gateway-card-check {
                position: absolute;
                top: 16px;
                right: 16px;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 1.5px solid rgba(255,255,255,0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                opacity: 0.3;
            }
            .gateway-card.active-gateway .gateway-card-check {
                opacity: 1;
                border-color: transparent;
            }
            .creator-card.active-gateway .gateway-card-check {
                background: #ff5e00;
                color: #fff;
                box-shadow: 0 0 15px rgba(255, 94, 0, 0.6);
            }
            .agency-card.active-gateway .gateway-card-check {
                background: #00f2fe;
                color: #0c0f24;
                box-shadow: 0 0 15px rgba(0, 242, 254, 0.6);
            }
            .gateway-filter-pill-container {
                display: flex;
                justify-content: center;
                gap: 12px;
            }
            .gateway-pill {
                padding: 8px 18px;
                border-radius: 99px;
                font-size: 13px;
                font-weight: 600;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.08);
                color: var(--color-text-secondary);
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .gateway-pill:hover {
                background: rgba(255,255,255,0.06);
                color: #fff;
            }
            .gateway-pill.active {
                background: #fff;
                color: #0c0f24;
                border-color: #fff;
                box-shadow: 0 5px 15px rgba(255,255,255,0.15);
            }
            .trending-trip-card-wrapper.hidden-card {
                display: none !important;
            }
        </style>
        <section class="hero-section" id="hero-section">
            <canvas class="particles-canvas" id="particles-canvas" style="position: absolute; top:0; left:0; width:100%; height:100%; pointer-events: none; z-index: 1;"></canvas>
            <div class="hero-globe-container" id="hero-globe-container" style="position: absolute; width: 100%; height: 100%; left: 0; top: 0; right: 0; bottom: 0; z-index: 1; opacity: 0.35; pointer-events: none; transform: none; display: flex; align-items: center; justify-content: center;"></div>
            
            <div class="hero-content-split">
                <!-- Left side: Poetic Copy & Traditional Widgets -->
                <div class="hero-left" style="gap: var(--space-4);">
                    <!-- Top Live Signup Notification -->
                    <div class="live-signup-notification" id="live-signup-notification" style="display: flex; align-items: center; gap: 10px; background: rgba(8, 8, 8, 0.7); border: 1px solid rgba(255,255,255,0.08); padding: 8px 18px; border-radius: 99px; font-size: 13px; color: var(--color-text-primary); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 4px 12px rgba(0,0,0,0.25); transition: all 0.3s ease;">
                        <div style="width: 22px; height: 22px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.2);">
                            <img id="live-signup-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&q=80" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <span id="live-signup-text"><strong>Sameer Desai</strong> from Bhopal just joined</span>
                    </div>

                    <div style="font-family: var(--font-heading); font-size: 11px; font-weight: 700; color: var(--color-teal); letter-spacing: 0.25em; text-transform: uppercase; text-shadow: 0 0 10px rgba(0, 242, 254, 0.35);">
                        ✨ Discover experiences and amazing trips
                    </div>

                    <h1 class="hero-title-left hero-title-one-line" style="margin-bottom: 8px; font-size: clamp(20px, 3.2vw, 32px); line-height: 1.2;">
                        Travel with <span class="text-gradient">Travel Influencers & Top Travel Companies</span>
                    </h1>

                    <p style="font-size: 16px; color: rgba(255,255,255,0.7); max-width: 580px; margin-bottom: 16px; line-height: 1.5; font-family: var(--font-body);">
                        Join curated group adventures led by travel influencers and top travel companies. Explore the world in style, map your vibe, and travel with your community.
                    </p>

                    <!-- WhatsApp Community Gateways -->
                    <div style="display:flex; gap:12px; width: 100%; max-width: 580px; margin-bottom: 16px; flex-wrap: wrap;">
                        <a href="https://chat.whatsapp.com/verified-travellers" target="_blank" class="action-card wa-card" style="flex:1; min-width:240px; text-decoration:none; padding:12px 18px; border-radius:12px; display:flex; align-items:center; gap:12px; background:rgba(34,197,94,0.03); border:1px solid rgba(34,197,94,0.18); transition:all 0.2s ease;">
                            <div style="width:36px; height:36px; border-radius:50%; background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); display:flex; align-items:center; justify-content:center; color:#22c55e; flex-shrink:0;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.42 9.863-9.864.002-2.637-1.023-5.117-2.884-6.979C16.59 1.892 14.117.87 11.48.868 6.042.868 1.623 5.286 1.618 10.728c-.001 1.705.453 3.37 1.317 4.858L1.921 21.07l5.726-1.5-.15.084zM17.9 14.8c-.29-.15-1.71-.85-1.98-.95-.26-.1-.46-.15-.65.15-.2.3-.75.95-.92 1.15-.17.19-.34.22-.63.07-1.16-.58-1.93-1.02-2.68-2.3-.2-.34.2-.32.57-1.07.06-.13.03-.25-.01-.33-.05-.08-.45-1.08-.62-1.48-.16-.4-.33-.33-.46-.34H10.15c-.2 0-.5.07-.77.37-.26.3-1.02 1-1.02 2.43 0 1.43 1.04 2.82 1.19 3 .15.19 2.05 3.13 4.96 4.39.7.3 1.23.48 1.66.62.7.22 1.34.19 1.84.12.56-.08 1.71-.7 1.95-1.37.24-.68.24-1.26.17-1.37-.07-.11-.27-.2-.56-.35z"/>
                                </svg>
                            </div>
                            <div style="text-align:left;">
                                <div style="font-size:12px; font-weight:700; color:#ffffff; display:flex; align-items:center; gap:4px;">
                                    Verified Travellers WhatsApp Community <span style="background:rgba(34,197,94,0.15); color:#22c55e; border-radius:4px; font-size:9px; padding:1px 4px; font-weight:800; border:1px solid rgba(34,197,94,0.3)">Join</span>
                                </div>
                                <div style="font-size:10px; color:rgba(255,255,255,0.45); margin-top:2px;">Get great deals, location wise communities.</div>
                            </div>
                        </a>
 
                        <a href="https://chat.whatsapp.com/female-travellers" target="_blank" class="action-card wa-card" style="flex:1; min-width:240px; text-decoration:none; padding:12px 18px; border-radius:12px; display:flex; align-items:center; gap:12px; background:rgba(244,63,94,0.03); border:1px solid rgba(244,63,94,0.18); transition:all 0.2s ease;">
                            <div style="width:36px; height:36px; border-radius:50%; background:rgba(244,63,94,0.1); border:1px solid rgba(244,63,94,0.3); display:flex; align-items:center; justify-content:center; color:#f43f5e; flex-shrink:0;">
                                <span class="material-icons-round" style="font-size:20px;">female</span>
                            </div>
                            <div style="text-align:left;">
                                <div style="font-size:12px; font-weight:700; color:#ffffff; display:flex; align-items:center; gap:4px;">
                                    Verified Female only WhatsApp Community <span style="background:rgba(244,63,94,0.15); color:#f43f5e; border-radius:4px; font-size:9px; padding:1px 4px; font-weight:800; border:1px solid rgba(244,63,94,0.3)">Join</span>
                                </div>
                                <div style="font-size:10px; color:rgba(255,255,255,0.45); margin-top:2px;">Females only, Get great deals, location wise communities.</div>
                            </div>
                        </a>
                    </div>

                    <!-- Search Bar -->
                    <div class="hero-search-wrapper" style="width: 100%; max-width: 580px; position: relative; z-index: 5; margin-bottom: 8px;">
                        <div class="hero-search-bar" style="display: flex; align-items: center; background: rgba(8, 8, 8, 0.75); border: 2px solid rgba(255, 90, 0, 0.2); border-radius: 99px; padding: 4px 4px 4px 18px; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 90, 0, 0.05); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); transition: all 0.3s ease;">
                            <span class="material-icons-round" style="color: var(--color-teal); font-size: 22px; margin-right: 8px;">place</span>
                            <input type="text" id="hero-search-input" placeholder="Search Vietnam, Bali, Ladakh..." style="background: transparent; border: none; color: #ffffff; font-size: 16px; width: 100%; outline: none; font-family: var(--font-body); padding: 6px 0;" autocomplete="off">
                            <button class="btn btn-primary" id="hero-search-btn" style="border-radius: 50%; width: 40px; height: 40px; min-width: 40px; padding: 0; display: flex; align-items: center; justify-content: center; background: var(--gradient-teal); border: none; color: #ffffff; cursor: pointer; transition: transform 0.2s ease;">
                                <span class="material-icons-round" style="font-size: 18px;">search</span>
                            </button>
                        </div>
                    </div>

                    <!-- 3D Category Pills Bar -->
                    <div class="popular-destinations-pills" style="display: flex; flex-direction: column; align-items: flex-start; gap: 6px; width: 100%; margin-bottom: 12px;">
                        <span style="font-family: var(--font-heading); font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.4); letter-spacing: 0.15em; text-transform: uppercase;">Explore by Category</span>
                        <div class="hero-categories-3d">
                            ${categories.slice(0, 8).map((cat, i) => `
                                <a href="#/trips?type=${cat.id}" class="category-pill-3d" style="--i:${i}">
                                    <span class="category-icon">${cat.icon}</span>
                                    <span>${cat.label}</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Right side: 3D Curved Card Carousel floating in front of Globe + Stacked Calendar Planner -->
                <div class="hero-right" style="display:flex; flex-direction:column; gap:20px; align-items:center;">
                    <div class="carousel-3d-viewport">
                        <button class="carousel-nav-btn prev" id="carousel-prev-btn" aria-label="Previous Trip">
                            <span class="material-icons-round">chevron_left</span>
                        </button>
                        <div class="carousel-3d-deck" id="celestial-carousel-deck" data-cards="0">
                            <!-- Trending cards render here dynamically -->
                        </div>
                        <button class="carousel-nav-btn next" id="carousel-next-btn" aria-label="Next Trip">
                            <span class="material-icons-round">chevron_right</span>
                        </button>
                        <div class="carousel-drag-guide">
                            <span class="material-icons-round" style="font-size:14px; vertical-align:middle; margin-right:4px">swipe</span>
                            SWIPE OR USE ARROWS
                        </div>
                    </div>

                    <!-- Interactive 3D Journey Calendar Planner -->
                    <div class="journey-planner-card glass-card animate-in stagger-2" style="width:100%; max-width:400px; padding:16px; background:rgba(8, 8, 8, 0.75); border:1px solid rgba(0, 242, 254, 0.15); border-radius:16px; z-index: 10;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
                            <div style="display:flex; align-items:center; gap:6px">
                                <span class="material-icons-round" style="color:var(--color-teal); font-size:18px; animation: pulse 2s infinite">date_range</span>
                                <h4 style="margin:0; font-size:11px; font-weight:700; color:#fff; text-transform:uppercase; letter-spacing:0.05em">Journey Date Planner</h4>
                            </div>
                            <span id="journey-matches-count" style="font-size:10px; background:rgba(0,242,254,0.1); color:var(--color-teal); padding:1px 6px; border-radius:12px; font-weight:600">Calculating...</span>
                        </div>
                        
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px">
                            <div class="form-group" style="margin:0">
                                <label class="form-label" style="font-size:9px; color:rgba(255,255,255,0.5); margin-bottom:2px; display:block">Depart After</label>
                                <input type="date" class="input date-picker-3d" id="hero-start-date" value="${heroStartDate}" style="background:rgba(255,255,255,0.05); color:#fff; border-color:rgba(255,255,255,0.12); padding:6px 10px; border-radius:6px; font-size:12px; cursor:pointer; width:100%">
                            </div>
                            <div class="form-group" style="margin:0">
                                <label class="form-label" style="font-size:9px; color:rgba(255,255,255,0.5); margin-bottom:2px; display:block">Depart Before</label>
                                <input type="date" class="input date-picker-3d" id="hero-end-date" value="${heroEndDate}" style="background:rgba(255,255,255,0.05); color:#fff; border-color:rgba(255,255,255,0.12); padding:6px 10px; border-radius:6px; font-size:12px; cursor:pointer; width:100%">
                            </div>
                        </div>
                        
                        <!-- Quick Select Month Pills -->
                        <div>
                            <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; margin-bottom:4px">Quick Select Month</span>
                            <div style="display:flex; gap:4px; flex-wrap:wrap">
                                <button class="quick-month-btn ${activeMonthFilter === 'all' ? 'active' : ''}" data-month="all" style="background:${activeMonthFilter === 'all' ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${activeMonthFilter === 'all' ? 'var(--color-teal)' : 'rgba(255,255,255,0.08)'}; color:#fff; padding:3px 8px; border-radius:20px; font-size:10px; cursor:pointer; font-weight:600; transition:all 0.2s ease">All</button>
                                <button class="quick-month-btn ${activeMonthFilter === '06' ? 'active' : ''}" data-month="06" style="background:${activeMonthFilter === '06' ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${activeMonthFilter === '06' ? 'var(--color-teal)' : 'rgba(255,255,255,0.08)'}; color:#fff; padding:3px 8px; border-radius:20px; font-size:10px; cursor:pointer; font-weight:600; transition:all 0.2s ease">Jun</button>
                                <button class="quick-month-btn ${activeMonthFilter === '07' ? 'active' : ''}" data-month="07" style="background:${activeMonthFilter === '07' ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${activeMonthFilter === '07' ? 'var(--color-teal)' : 'rgba(255,255,255,0.08)'}; color:#fff; padding:3px 8px; border-radius:20px; font-size:10px; cursor:pointer; font-weight:600; transition:all 0.2s ease">Jul</button>
                                <button class="quick-month-btn ${activeMonthFilter === '08' ? 'active' : ''}" data-month="08" style="background:${activeMonthFilter === '08' ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${activeMonthFilter === '08' ? 'var(--color-teal)' : 'rgba(255,255,255,0.08)'}; color:#fff; padding:3px 8px; border-radius:20px; font-size:10px; cursor:pointer; font-weight:600; transition:all 0.2s ease">Aug</button>
                                <button class="quick-month-btn ${activeMonthFilter === '09' ? 'active' : ''}" data-month="09" style="background:${activeMonthFilter === '09' ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${activeMonthFilter === '09' ? 'var(--color-teal)' : 'rgba(255,255,255,0.08)'}; color:#fff; padding:3px 8px; border-radius:20px; font-size:10px; cursor:pointer; font-weight:600; transition:all 0.2s ease">Sep</button>
                            </div>
                        </div>
                    </div>
                </div>
        </section>



        <!-- ====== EXPERIENCE GATEWAY (3D SELECTOR) ====== -->
        <section class="home-section theme-sunset" id="experience-gateway-section" style="border-bottom:1.5px solid rgba(255,255,255,0.035); padding: var(--space-12) 0;">
            <div class="container">
                <div class="section-header animate-in" style="text-align:center;flex-direction:column;align-items:center;margin-bottom:var(--space-8)">
                    <h2 class="section-title">Select Your <span class="text-gradient">Travel Vibe</span></h2>
                    <p class="section-subtitle" style="max-width:550px;text-align:center;">
                        Choose between aesthetic creator-led social journeys or professionally guided agency expeditions. Hover to spin the 3D globe to their destinations.
                    </p>
                </div>
                
                <div class="gateway-grid">
                    <!-- Creator Card -->
                    <div class="gateway-card creator-card animate-in stagger-1" id="gateway-card-creator" data-type="influencer">
                        <div class="gateway-card-check">
                            <span class="material-icons-round" style="font-size:14px;">done</span>
                        </div>
                        <div class="portal-ring-container">
                            <div class="portal-ring ring-1" style="--rotX: 65deg;"></div>
                            <div class="portal-ring ring-2" style="--rotX: -65deg;"></div>
                            <div class="portal-ring ring-3" style="--rotX: 85deg;"></div>
                            <div class="portal-orb"></div>
                        </div>
                        <span class="gateway-badge" style="display:inline-flex;align-items:center;gap:4px;">✨ Travel Influencers <span class="material-icons-round" style="font-size:14px;color:#33e0be;">verified</span></span>
                        <h3 class="gateway-card-title">Travel Influencers</h3>
                        <p class="gateway-card-desc">
                            Aesthetic retreats, social journeys, and curated travel led by verified travel influencers.
                        </p>
                        <div class="gateway-card-action">
                            <span>Explore Influencer Trips</span>
                            <span class="material-icons-round" style="font-size:16px;">arrow_forward</span>
                        </div>
                    </div>
                    
                    <!-- Agency Card -->
                    <div class="gateway-card agency-card animate-in stagger-2" id="gateway-card-agency" data-type="company">
                        <div class="gateway-card-check">
                            <span class="material-icons-round" style="font-size:14px;">done</span>
                        </div>
                        <div class="portal-ring-container">
                            <div class="portal-ring ring-1" style="--rotX: 65deg;"></div>
                            <div class="portal-ring ring-2" style="--rotX: -65deg;"></div>
                            <div class="portal-ring ring-3" style="--rotX: 85deg;"></div>
                            <div class="portal-orb"></div>
                        </div>
                        <span class="gateway-badge" style="display:inline-flex;align-items:center;gap:4px;">🏢 Top Travel Companies <span class="material-icons-round" style="font-size:14px;color:#33e0be;">verified</span></span>
                        <h3 class="gateway-card-title">Top Travel Companies</h3>
                        <p class="gateway-card-desc">
                            Wilderness treks, high-altitude expeditions, and fully structured tours. Managed by top travel companies.
                        </p>
                        <div class="gateway-card-action">
                            <span>Explore Company Trips</span>
                            <span class="material-icons-round" style="font-size:16px;">arrow_forward</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ====== TRENDING TRIPS ====== -->
        <section class="home-section theme-sunset" id="trending-section" style="padding-top: var(--space-8);">
            <div class="container">
                <div class="section-header animate-in" style="flex-wrap: wrap; gap: var(--space-4);">
                    <div>
                        <h2 class="section-title">🔥 <span class="text-gradient">Trending</span> Trips</h2>
                        <p class="section-subtitle" id="trending-section-subtitle">Filling up fast — book before they're gone!</p>
                    </div>
                    
                    <!-- Filter Pills -->
                    <div class="gateway-filter-pill-container" id="gateway-filter-pills" style="margin: 0;">
                        <button class="gateway-pill active" data-pill-type="all">
                            <span class="material-icons-round" style="font-size:15px;">travel_explore</span> All Vibe
                        </button>
                        <button class="gateway-pill" data-pill-type="influencer">
                            <span class="material-icons-round" style="font-size:15px;">auto_awesome</span> Travel Influencers
                        </button>
                        <button class="gateway-pill" data-pill-type="company">
                            <span class="material-icons-round" style="font-size:15px;">business_center</span> Top Travel Companies
                        </button>
                    </div>
                    
                    <a href="#/trips?sort=popularity" class="btn btn-ghost btn-sm">
                        See all <span class="material-icons-round" style="font-size:16px">arrow_forward</span>
                    </a>
                </div>
                
                <div id="trending-trips-container">
                    <div class="trip-grid" id="trending-trips-grid">
                        ${trendingTrips.map((trip, i) => `
                            <div class="trending-trip-card-wrapper animate-in stagger-${(i % 3) + 1} ${i >= 6 ? 'hidden-card' : ''}" data-index="${i}">
                                ${renderTripCard(trip, hostsMap[trip.hostId])}
                            </div>
                        `).join('')}
                    </div>

                    ${trendingTrips.length > 6 ? `
                        <div class="trending-expander-container animate-in">
                            <button class="btn btn-trending-expander" id="btn-trending-toggle">
                                <span class="material-icons-round" style="font-size:18px;margin-right:6px">expand_more</span>
                                Show More (${trendingTrips.length - 6})
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        </section>

        <!-- ====== HOW IT WORKS ====== -->
        <section class="home-section how-it-works-section theme-sunrise" id="how-it-works">
            <div class="container">
                <div class="section-header animate-in" style="text-align:center;flex-direction:column;align-items:center">
                    <h2 class="section-title">How It <span class="text-gradient">Works</span></h2>
                    <p class="section-subtitle" style="max-width:500px">From discovery to departure — your journey starts here</p>
                </div>
                <div class="how-it-works-grid">
                    <div class="how-it-works-step glass-card animate-in stagger-1">
                        <div class="step-number">1</div>
                        <h3 class="step-title">Discover Trips</h3>
                        <p class="step-description">Browse curated group trips by destination, budget, dates, or travel style. Filter to find your perfect match.</p>
                    </div>
                    <div class="how-it-works-step glass-card animate-in stagger-2">
                        <div class="step-number">2</div>
                        <h3 class="step-title">Connect with Hosts</h3>
                        <p class="step-description">Message verified trip hosts directly. Ask questions, check reviews, and feel confident about who you're traveling with.</p>
                    </div>
                    <div class="how-it-works-step glass-card animate-in stagger-3">
                        <div class="step-number">3</div>
                        <h3 class="step-title">Book & Travel</h3>
                        <p class="step-description">Reserve your spot with transparent pricing. No hidden fees. Join the group chat, pack your bags, and go!</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- ====== FEATURED TRIPS ====== -->
        <section class="home-section theme-sunset" id="featured-section">
            <div class="container">
                <div class="section-header animate-in">
                    <div>
                        <h2 class="section-title">⭐ <span class="text-gradient">Featured</span> Adventures</h2>
                        <p class="section-subtitle">Editor's picks — handpicked by our travel experts</p>
                    </div>
                    <a href="#/trips?sort=recommended" class="btn btn-ghost btn-sm">
                        Browse all <span class="material-icons-round" style="font-size:16px">arrow_forward</span>
                    </a>
                </div>
                <div class="featured-carousel-wrapper">
                    <button class="featured-carousel-btn prev-btn" id="featured-prev-btn" aria-label="Previous Featured Trip">
                        <span class="material-icons-round">chevron_left</span>
                    </button>
                    <div class="featured-carousel" id="featured-carousel-scroll">
                        ${featuredTrips.map((trip, i) => `
                            <div class="featured-carousel-item animate-in stagger-${(i % 3) + 1}">
                                ${renderTripCard(trip, hostsMap[trip.hostId])}
                            </div>
                        `).join('')}
                    </div>
                    <button class="featured-carousel-btn next-btn" id="featured-next-btn" aria-label="Next Featured Trip">
                        <span class="material-icons-round">chevron_right</span>
                    </button>
                </div>
            </div>
        </section>

        <!-- ====== TESTIMONIALS ====== -->
        <section class="home-section testimonials-section theme-sunrise" id="testimonials-section">
            <div class="container">
                <div class="section-header animate-in" style="text-align:center;flex-direction:column;align-items:center">
                    <h2 class="section-title">What Travellers <span class="text-gradient">Say</span></h2>
                    <p class="section-subtitle">Real stories from real people</p>
                </div>
                <div class="testimonials-grid">
                    ${topReviews.map((rev, i) => `
                        <div class="testimonial-card glass-card animate-in stagger-${i + 1}">
                            <div class="testimonial-stars">${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}</div>
                            <p class="testimonial-quote">"${rev.text}"</p>
                            <div class="testimonial-author">
                                <div class="avatar avatar-sm">
                                    <img src="${rev.userAvatar}" alt="${rev.userName}" loading="lazy">
                                </div>
                                <div>
                                    <strong>${rev.userName}</strong>
                                    <span class="text-muted">${rev.userCity}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <!-- ====== HOST CTA ====== -->
        <section class="home-section theme-sunset" id="host-cta-section">
            <div class="container">
                <div class="host-cta-section glass-panel animate-in">
                    <div class="host-cta-content">
                        <h2 class="host-cta-title">Are You a Travel Creator or <span class="text-gradient">Travel Influencer?</span></h2>
                        <p class="host-cta-subtitle">Join India's fastest-growing creator-led travel marketplace. List your group trips, get verified, and reach thousands of travel fans.</p>
                        <div class="host-cta-features">
                            <div class="host-cta-feature">
                                <span class="material-icons-round" style="color:var(--color-teal)">verified</span>
                                <span>Get verified host badge</span>
                            </div>
                            <div class="host-cta-feature">
                                <span class="material-icons-round" style="color:var(--color-teal)">group</span>
                                <span>Reach 50K+ travelers</span>
                            </div>
                            <div class="host-cta-feature">
                                <span class="material-icons-round" style="color:var(--color-teal)">dashboard</span>
                                <span>Free host dashboard</span>
                            </div>
                            <div class="host-cta-feature">
                                <span class="material-icons-round" style="color:var(--color-teal)">analytics</span>
                                <span>Analytics & insights</span>
                            </div>
                        </div>
                        <a href="#/host-register" class="btn btn-primary btn-lg" style="margin-top:var(--space-8)">
                            <span class="material-icons-round">add_circle</span>
                            Start Hosting — It's Free
                        </a>
                    </div>
                </div>
            </div>
        </section>

        <!-- ====== NEWSLETTER ====== -->
        <section class="home-section theme-sunrise" id="newsletter-section">
            <div class="container">
                <div class="newsletter-section glass-panel animate-in">
                    <span class="material-icons-round" style="font-size:48px;color:var(--color-teal)">mail</span>
                    <h2 class="newsletter-title">Get Travel Deals in Your Inbox</h2>
                    <p class="section-subtitle">Join 25,000+ subscribers for exclusive trip deals, travel tips, and community updates.</p>
                    <form class="newsletter-form" id="newsletter-form">
                        <input type="email" class="input" placeholder="Enter your email address" required id="newsletter-email">
                        <button type="submit" class="btn btn-primary">Subscribe</button>
                    </form>
                    <p style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:var(--space-3)">No spam, ever. Unsubscribe anytime.</p>
                </div>
            </div>
        </section>
    `;

    // Initialize interactions
    setupHomepageEvents(trendingTrips, hostsMap);
    setupTripCardEvents();
    initParticles();
    initGlobe();
    initScrollAnimations();
    
    // Initialize static hero carousel with first 8 trending trips
    initHeroCarousel();
}

const CITIES_LOC = {
    'delhi': { lat: 28.61, lon: 77.21 },
    'mumbai': { lat: 19.07, lon: 72.87 },
    'bangalore': { lat: 12.97, lon: 77.59 },
    'chennai': { lat: 13.08, lon: 80.27 },
    'kolkata': { lat: 22.57, lon: 88.36 },
    'hyderabad': { lat: 17.38, lon: 78.49 },
    'goa': { lat: 15.49, lon: 73.82 },
    'manali': { lat: 32.24, lon: 77.19 },
    'ladakh': { lat: 34.15, lon: 77.57 },
    'jaisalmer': { lat: 26.92, lon: 70.90 },
    'kerala': { lat: 9.93, lon: 76.26 },
    'rishikesh': { lat: 30.09, lon: 78.27 },
    'agra': { lat: 27.18, lon: 78.02 },
    'bali': { lat: -8.34, lon: 115.17 },
    'bangkok': { lat: 13.75, lon: 100.50 },
    'dubai': { lat: 25.20, lon: 55.27 },
    'istanbul': { lat: 41.01, lon: 28.98 },
    'tokyo': { lat: 35.68, lon: 139.69 },
    'maldives': { lat: 4.18, lon: 73.51 },
    'kathmandu': { lat: 27.70, lon: 85.32 },
    'hanoi': { lat: 21.02, lon: 105.85 },
    'paris': { lat: 48.86, lon: 2.35 },
    'singapore': { lat: 1.35, lon: 103.82 },
    'tbilisi': { lat: 41.69, lon: 44.80 }
};

function updateMatchesCount() {
    const verifiedHostsSet = new Set(hosts.filter(h => h.verified).map(h => h.id));
    const filteredCount = trips.filter(trip => {
        const isPublished = trip.status === 'published' && verifiedHostsSet.has(trip.hostId);
        if (!isPublished) return false;

        const tripDateStr = trip.dates?.start;
        if (!tripDateStr) return false;

        if (activeMonthFilter !== 'all') {
            const tripMonth = tripDateStr.split('-')[1];
            return tripMonth === activeMonthFilter;
        } else {
            return tripDateStr >= heroStartDate && tripDateStr <= heroEndDate;
        }
    }).length;

    const countBadge = document.getElementById('journey-matches-count');
    if (countBadge) {
        countBadge.textContent = `${filteredCount} trip${filteredCount === 1 ? '' : 's'} found`;
    }
}

function initHeroCarousel() {
    const deck = document.getElementById('celestial-carousel-deck');
    if (!deck) return;
    
    if (deck._cleanupCarousel) {
        deck._cleanupCarousel();
    }
    
    // Filter trips based on interactive journey calendar picker
    const verifiedHostsSet = new Set(hosts.filter(h => h.verified).map(h => h.id));
    const hostsMap = {};
    hosts.forEach(h => hostsMap[h.id] = h);
    
    const filtered = trips.filter(trip => {
        const isPublished = trip.status === 'published' && verifiedHostsSet.has(trip.hostId);
        if (!isPublished) return false;

        const tripDateStr = trip.dates?.start;
        if (!tripDateStr) return false;

        if (activeMonthFilter !== 'all') {
            const tripMonth = tripDateStr.split('-')[1];
            return tripMonth === activeMonthFilter;
        } else {
            return tripDateStr >= heroStartDate && tripDateStr <= heroEndDate;
        }
    });
    
    // Limit to maximum 8 cards as supported by CSS transforms
    const cardsToShow = filtered.slice(0, 8);
    deck.setAttribute('data-cards', cardsToShow.length);
    
    // Update matches count badge on UI
    updateMatchesCount();
    
    if (cardsToShow.length === 0) {
        deck.innerHTML = `
            <div style="grid-column:1/-1;width:100%;text-align:center;padding:60px 20px;color:rgba(255,255,255,0.4);animation: morph3d 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;">
                <span class="material-icons-round" style="font-size:48px;color:rgba(255,255,255,0.15)">explore_off</span>
                <p style="margin-top:10px;font-size:14px">No trips match these dates.</p>
            </div>
        `;
        return;
    }
    
    deck.innerHTML = cardsToShow.map(trip => `
        <div class="carousel-card-wrapper" style="pointer-events: auto;">
            ${renderTripCard(trip, hostsMap[trip.hostId])}
        </div>
    `).join('');
    
    // Initialize 3D effects on cards
    import('../components/effects.js').then(({ initCardTilts, setupCursorListeners, init3DCarousel }) => {
        initCardTilts();
        setupCursorListeners();
        init3DCarousel((activeIndex) => {
            const activeTrip = cardsToShow[activeIndex];
            if (activeTrip && globeInstance) {
                const dest = activeTrip.destination.toLowerCase();
                let coords = CITIES_LOC[dest];
                if (!coords) {
                    for (const key in CITIES_LOC) {
                        if (dest.includes(key) || key.includes(dest)) {
                            coords = CITIES_LOC[key];
                            break;
                        }
                    }
                }
                if (coords) {
                    globeInstance.spinToCoordinates(coords.lat, coords.lon, activeTrip.destination);
                }

                // Match shape/color index based on categories
                let shapeIdx = 0;
                if (activeTrip.categories.includes('beach')) {
                    shapeIdx = 1;
                } else if (activeTrip.categories.includes('mountain') || activeTrip.categories.includes('trekking')) {
                    shapeIdx = 2;
                } else if (activeTrip.categories.includes('cultural') || activeTrip.categories.includes('social')) {
                    shapeIdx = 3;
                }
                import('../components/effects.js').then(({ setBackgroundShape }) => {
                    setBackgroundShape(shapeIdx);
                }).catch(err => console.warn(err));
            }
        });
    }).catch(err => console.error(err));
}

function setupHomepageEvents(trendingTrips, hostsMap) {
    // Hero search
    const searchInput = document.getElementById('hero-search-input');
    const searchBtn = document.getElementById('hero-search-btn');
    
    searchBtn?.addEventListener('click', () => {
        const query = searchInput?.value?.trim();
        if (query) {
            const lowerQuery = query.toLowerCase();
            let matchedCity = null;
            for (const name in CITIES_LOC) {
                if (lowerQuery.includes(name) || name.includes(lowerQuery)) {
                    matchedCity = { name, ...CITIES_LOC[name] };
                    break;
                }
            }
            
            if (matchedCity && globeInstance) {
                globeInstance.spinToCoordinates(matchedCity.lat, matchedCity.lon, matchedCity.name);
                store.addToast(`Mapping destination to ${matchedCity.name.toUpperCase()}...`, 'info');
                setTimeout(() => {
                    store.set('filters.destination', query);
                    window.location.hash = '#/trips';
                }, 1800);
            } else {
                store.set('filters.destination', query);
                window.location.hash = '#/trips';
            }
        } else {
            window.location.hash = '#/trips';
        }
    });

    searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') searchBtn?.click();
    });

    // Destination pills
    document.querySelectorAll('.dest-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const dest = pill.dataset.dest;
            const lowerDest = dest.toLowerCase();
            let matchedCity = null;
            for (const name in CITIES_LOC) {
                if (lowerDest.includes(name) || name.includes(lowerDest)) {
                    matchedCity = { name, ...CITIES_LOC[name] };
                    break;
                }
            }
            
            if (matchedCity && globeInstance) {
                globeInstance.spinToCoordinates(matchedCity.lat, matchedCity.lon, matchedCity.name);
                store.addToast(`Navigating globe to ${dest}...`, 'info');
                setTimeout(() => {
                    store.set('filters.destination', dest);
                    window.location.hash = '#/trips';
                }, 1600);
            } else {
                store.set('filters.destination', dest);
                window.location.hash = '#/trips';
            }
        });
    });

    // Journey Date Planner Events
    document.getElementById('hero-start-date')?.addEventListener('change', (e) => {
        heroStartDate = e.target.value;
        if (activeMonthFilter !== 'all') {
            activeMonthFilter = 'all';
            document.querySelectorAll('.quick-month-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.month === 'all');
                btn.style.background = btn.dataset.month === 'all' ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.03)';
                btn.style.borderColor = btn.dataset.month === 'all' ? 'var(--color-teal)' : 'rgba(255,255,255,0.08)';
            });
        }
        initHeroCarousel();
    });

    document.getElementById('hero-end-date')?.addEventListener('change', (e) => {
        heroEndDate = e.target.value;
        if (activeMonthFilter !== 'all') {
            activeMonthFilter = 'all';
            document.querySelectorAll('.quick-month-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.month === 'all');
                btn.style.background = btn.dataset.month === 'all' ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.03)';
                btn.style.borderColor = btn.dataset.month === 'all' ? 'var(--color-teal)' : 'rgba(255,255,255,0.08)';
            });
        }
        initHeroCarousel();
    });

    document.querySelectorAll('.quick-month-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeMonthFilter = btn.dataset.month;
            document.querySelectorAll('.quick-month-btn').forEach(b => {
                b.classList.toggle('active', b === btn);
                b.style.background = b === btn ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.03)';
                b.style.borderColor = b === btn ? 'var(--color-teal)' : 'rgba(255,255,255,0.08)';
            });
            initHeroCarousel();
        });
    });

    // Action cards
    document.getElementById('btn-upload-chat')?.addEventListener('click', () => {
        showAiTripMatcherModal();
    });

    document.getElementById('btn-join-wa')?.addEventListener('click', () => {
        showCommunityAccessModal('Home Page Action Card');
    });

    // Newsletter
    document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('newsletter-email')?.value;
        if (email) {
            store.addToast('Thanks for subscribing! 🎉 Check your inbox for a welcome email.', 'success');
            document.getElementById('newsletter-email').value = '';
        }
    });

    // Live signup notification rotation
    const signups = [
        { name: 'Sameer Desai', city: 'Bhopal', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&q=80' },
        { name: 'Amit Saxena', city: 'Mumbai', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&q=80' },
        { name: 'Ananya Sharma', city: 'Delhi', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&q=80' },
        { name: 'Rahul Verma', city: 'Bangalore', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&q=80' },
        { name: 'Priya Patel', city: 'Ahmedabad', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&q=80' }
    ];
    let currentSignupIndex = 0;
    const liveEl = document.getElementById('live-signup-notification');
    const liveAvatar = document.getElementById('live-signup-avatar');
    const liveText = document.getElementById('live-signup-text');
    
    if (liveEl && liveAvatar && liveText) {
        liveTimerInstance = setInterval(() => {
            currentSignupIndex = (currentSignupIndex + 1) % signups.length;
            const signup = signups[currentSignupIndex];
            
            liveEl.style.opacity = '0';
            liveEl.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                liveAvatar.src = signup.avatar;
                liveText.innerHTML = `<strong>${escapeHTML(signup.name)}</strong> from ${escapeHTML(signup.city)} just joined`;
                liveEl.style.opacity = '1';
                liveEl.style.transform = 'translateY(0)';
            }, 300);
        }, 5000);
    }

    // 3D Experience Gateway Selection / Interactive Hover Effects
    const cards = document.querySelectorAll('.gateway-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width/2;
            const y = e.clientY - rect.top - rect.height/2;
            const rx = -(y / (rect.height/2)) * 10;
            const ry = (x / (rect.width/2)) * 10;
            card.style.setProperty('--rx', `${rx}deg`);
            card.style.setProperty('--ry', `${ry}deg`);
            card.style.transform = `rotateY(${ry}deg) rotateX(${rx}deg) scale(1.03)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--rx', `0deg`);
            card.style.setProperty('--ry', `0deg`);
            card.style.transform = `none`;
        });

        // Click filters trips & scrolls to trending
        card.addEventListener('click', () => {
            const type = card.dataset.type;
            filterTrendingTrips(type);
            
            // Scroll to trending trips
            const dest = document.getElementById('trending-section');
            if (dest) {
                dest.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            store.addToast(`Filtering trips by ${type === 'influencer' ? 'Travel Creators' : 'Agencies'}...`, 'info');
        });
    });

    // Globe Spin & Theme Change on hover
    const creatorCard = document.getElementById('gateway-card-creator');
    const agencyCard = document.getElementById('gateway-card-agency');
    
    creatorCard?.addEventListener('mouseenter', () => {
        document.body.classList.add('theme-sunset');
        document.body.classList.remove('theme-sunrise');
        if (globeInstance) {
            globeInstance.spinToCoordinates(-8.34, 115.17, 'Bali (Creators Hub)');
        }
    });

    agencyCard?.addEventListener('mouseenter', () => {
        document.body.classList.add('theme-sunrise');
        document.body.classList.remove('theme-sunset');
        if (globeInstance) {
            globeInstance.spinToCoordinates(34.15, 77.57, 'Ladakh (Adventure Base)');
        }
    });

    // Gateway Pills click filters
    const pills = document.querySelectorAll('#gateway-filter-pills .gateway-pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            const type = pill.dataset.pillType;
            filterTrendingTrips(type);
        });
    });

    // Collapsible Trending Trips toggle listener (fallback for initial load)
    const toggleBtn = document.getElementById('btn-trending-toggle');
    
    toggleBtn?.addEventListener('click', () => {
        const hiddenCards = document.querySelectorAll('.trending-trip-card-wrapper.hidden-card');
        const isCollapsed = hiddenCards.length > 0;
        
        if (isCollapsed) {
            hiddenCards.forEach((card, idx) => {
                card.classList.remove('hidden-card');
                card.classList.add('showing-card');
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
                setTimeout(() => {
                    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, idx * 50);
            });
            toggleBtn.innerHTML = `
                <span class="material-icons-round" style="font-size:18px;margin-right:6px">expand_less</span>
                Show Less
            `;
            setTimeout(() => {
                if (window.ScrollTrigger) window.ScrollTrigger.refresh();
                import('../components/effects.js').then(({ initCardTilts, setupCursorListeners }) => {
                    initCardTilts();
                    setupCursorListeners();
                });
            }, 650);
        } else {
            const allExtraCards = document.querySelectorAll('.trending-trip-card-wrapper[data-index]');
            allExtraCards.forEach(card => {
                const idx = parseInt(card.dataset.index || '0');
                if (idx >= 6) {
                    card.classList.add('hidden-card');
                    card.classList.remove('showing-card');
                }
            });
            toggleBtn.innerHTML = `
                <span class="material-icons-round" style="font-size:18px;margin-right:6px">expand_more</span>
                Show More (${allExtraCards.length - 6})
            `;
            const trendingSection = document.getElementById('trending-section');
            if (trendingSection) {
                trendingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            setTimeout(() => {
                if (window.ScrollTrigger) window.ScrollTrigger.refresh();
            }, 650);
        }
    });

    // Define filterTrendingTrips inside setupHomepageEvents
    function filterTrendingTrips(type) {
        const creatorCard = document.getElementById('gateway-card-creator');
        const agencyCard = document.getElementById('gateway-card-agency');
        if (creatorCard && agencyCard) {
            creatorCard.classList.remove('active-gateway');
            agencyCard.classList.remove('active-gateway');
            if (type === 'influencer') creatorCard.classList.add('active-gateway');
            if (type === 'company') agencyCard.classList.add('active-gateway');
        }

        const pills = document.querySelectorAll('#gateway-filter-pills .gateway-pill');
        pills.forEach(p => {
            p.classList.remove('active');
            if (p.dataset.pillType === type) p.classList.add('active');
        });

        // Filter trips
        let filtered = [];
        if (type === 'all') {
            filtered = trendingTrips;
        } else {
            filtered = trendingTrips.filter(t => {
                const host = hostsMap[t.hostId];
                return host && host.type === type;
            });
        }

        const container = document.getElementById('trending-trips-container');
        if (!container) return;

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: var(--space-12) 0; color: var(--color-text-secondary);">
                    <span class="material-icons-round" style="font-size: 48px; opacity: 0.3; margin-bottom: var(--space-2);">explore_off</span>
                    <p>No trending trips available under this experience vibe.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="trip-grid" id="trending-trips-grid">
                ${filtered.map((trip, i) => `
                    <div class="trending-trip-card-wrapper animate-in stagger-${(i % 3) + 1} ${i >= 6 ? 'hidden-card' : ''}" data-index="${i}">
                        ${renderTripCard(trip, hostsMap[trip.hostId])}
                    </div>
                `).join('')}
            </div>
        `;

        if (filtered.length > 6) {
            html += `
                <div class="trending-expander-container animate-in" style="animation-play-state: running; opacity: 1; transform: none;">
                    <button class="btn btn-trending-expander" id="btn-trending-toggle">
                        <span class="material-icons-round" style="font-size:18px;margin-right:6px">expand_more</span>
                        Show More (${filtered.length - 6})
                    </button>
                </div>
            `;
        }

        container.style.opacity = '0';
        container.style.transform = 'translateY(15px)';
        container.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

        setTimeout(() => {
            container.innerHTML = html;
            container.style.opacity = '1';
            container.style.transform = 'none';

            // Setup events for newly rendered trip cards
            setupTripCardEvents();
            
            // Re-setup expander toggle listener
            const newToggleBtn = document.getElementById('btn-trending-toggle');
            if (newToggleBtn) {
                newToggleBtn.addEventListener('click', () => {
                    const hiddenCards = document.querySelectorAll('.trending-trip-card-wrapper.hidden-card');
                    const isCollapsed = hiddenCards.length > 0;
                    
                    if (isCollapsed) {
                        hiddenCards.forEach((card, idx) => {
                            card.classList.remove('hidden-card');
                            card.classList.add('showing-card');
                            card.style.opacity = '0';
                            card.style.transform = 'translateY(15px)';
                            setTimeout(() => {
                                card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                                card.style.opacity = '1';
                                card.style.transform = 'translateY(0)';
                            }, idx * 50);
                        });
                        newToggleBtn.innerHTML = `
                            <span class="material-icons-round" style="font-size:18px;margin-right:6px">expand_less</span>
                            Show Less
                        `;
                    } else {
                        const allExtraCards = document.querySelectorAll('.trending-trip-card-wrapper[data-index]');
                        allExtraCards.forEach(card => {
                            const idx = parseInt(card.dataset.index || '0');
                            if (idx >= 6) {
                                card.classList.add('hidden-card');
                                card.classList.remove('showing-card');
                            }
                        });
                        document.getElementById('trending-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        newToggleBtn.innerHTML = `
                            <span class="material-icons-round" style="font-size:18px;margin-right:6px">expand_more</span>
                            Show More (${filtered.length - 6})
                        `;
                    }
                });
            }
        }, 250);
        // Wire up featured carousel scroll buttons
        const featPrev = document.getElementById('featured-prev-btn');
        const featNext = document.getElementById('featured-next-btn');
        const featScroll = document.getElementById('featured-carousel-scroll');
        if (featPrev && featNext && featScroll) {
            featPrev.addEventListener('click', () => {
                featScroll.scrollLeft -= 380;
            });
            featNext.addEventListener('click', () => {
                featScroll.scrollLeft += 380;
            });
        }
    }
}

function initParticles() {
    // Canvas is replaced by the global morph particles canvas
}

function initScrollAnimations() {
    if (!window.gsap || !window.ScrollTrigger) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );
        document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));
        return;
    }

    // Register ScrollTrigger
    window.gsap.registerPlugin(window.ScrollTrigger);

    // Particle background shape changes on scroll
    import('../components/effects.js').then(({ setBackgroundShape }) => {
        window.ScrollTrigger.create({
            trigger: '#hero-section',
            start: 'top top',
            end: 'bottom center',
            onEnter: () => setBackgroundShape(0),
            onEnterBack: () => setBackgroundShape(0)
        });

        window.ScrollTrigger.create({
            trigger: '#destinations-section',
            start: 'top center',
            end: 'bottom center',
            onEnter: () => setBackgroundShape(1),
            onEnterBack: () => setBackgroundShape(1)
        });

        window.ScrollTrigger.create({
            trigger: '#trending-section',
            start: 'top center',
            end: 'bottom center',
            onEnter: () => setBackgroundShape(2),
            onEnterBack: () => setBackgroundShape(2)
        });

        window.ScrollTrigger.create({
            trigger: '#how-it-works',
            start: 'top center',
            end: 'bottom center',
            onEnter: () => setBackgroundShape(3),
            onEnterBack: () => setBackgroundShape(3)
        });
    }).catch(err => console.warn('Could not load shape control:', err));

    // Entry anims
    document.querySelectorAll('.animate-in').forEach((el) => {
        window.gsap.fromTo(el, 
            { opacity: 0, y: 35 }, 
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.85, 
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // Parallax on globe container
    const globeContainer = document.getElementById('hero-globe-container');
    if (globeContainer) {
        window.gsap.to(globeContainer, {
            y: 120,
            scale: 0.8,
            opacity: 0.15,
            scrollTrigger: {
                trigger: '#hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }

    // Floating action cards
    window.gsap.to('.action-card', {
        y: -6,
        duration: 2.2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.3
    });
}

async function initGlobe() {
    const container = document.getElementById('hero-globe-container');
    if (container) {
        try {
            const { Globe } = await import('../components/globe.js');
            globeInstance = new Globe(container);
        } catch (e) {
            console.error('Failed to initialize 3D Globe dynamically:', e);
        }
    }
}

export function destroyHomePage() {
    if (particleInstance) {
        particleInstance.destroy();
        particleInstance = null;
    }
    if (globeInstance) {
        globeInstance.destroy();
        globeInstance = null;
    }
    if (liveTimerInstance) {
        clearInterval(liveTimerInstance);
        liveTimerInstance = null;
    }
    const deck = document.getElementById('celestial-carousel-deck');
    if (deck && deck._cleanupCarousel) {
        deck._cleanupCarousel();
    }
}
