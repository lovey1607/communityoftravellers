// ============================================
// Trip Detail Page
// Reorganized premium details view (travols replica style)
// ============================================

import { trips } from '../data/trips.js';
import { hosts } from '../data/hosts.js';
import { reviews } from '../data/reviews.js';
import { renderTripCard, setupTripCardEvents } from '../components/trip-card.js';
import { store } from '../state.js';
import { formatPrice, formatDateRange, formatDuration, getSeatsStatus, getStarArray, calculateDiscount, formatRelativeTime } from '../utils/format.js';

// Dynamic Gallery Enrichment: generates a 5-image list if details are scarce
function getEnrichedGallery(trip) {
    let images = [];
    if (trip.gallery && trip.gallery.length > 0) {
        images = [...trip.gallery];
    } else if (trip.coverImage) {
        images = [trip.coverImage];
    }

    if (images.length < 5) {
        const dest = (trip.destination || '').toLowerCase();
        const state = (trip.destinationState || '').toLowerCase();
        let pool = [];

        if (dest.includes('goa')) {
            pool = [
                'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80',
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
                'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=80',
                'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1200&q=80',
                'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80'
            ];
        } else if (dest.includes('manali') || dest.includes('kasol') || dest.includes('spiti') || state.includes('himachal') || dest.includes('solang')) {
            pool = [
                'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80',
                'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1200&q=80',
                'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
                'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?w=1200&q=80'
            ];
        } else if (dest.includes('ladakh') || dest.includes('leh')) {
            pool = [
                'https://images.unsplash.com/photo-1506038634487-60a69ae4b7b1?w=1200&q=80',
                'https://images.unsplash.com/photo-1572428003240-31a6e2c0a48c?w=1200&q=80',
                'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=1200&q=80',
                'https://images.unsplash.com/photo-1622161834243-e851795fbe58?w=1200&q=80',
                'https://images.unsplash.com/photo-1614093665675-bf7d488a09f3?w=1200&q=80'
            ];
        } else if (dest.includes('jaisalmer') || dest.includes('jaipur') || dest.includes('jodhpur') || state.includes('rajasthan')) {
            pool = [
                'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&q=80',
                'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80',
                'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80',
                'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80',
                'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80'
            ];
        } else if (dest.includes('kerala') || dest.includes('alleppey') || dest.includes('munnar')) {
            pool = [
                'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80',
                'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&q=80',
                'https://images.unsplash.com/photo-1609340443334-02f39b580e23?w=1200&q=80',
                'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80',
                'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200&q=80'
            ];
        } else if (dest.includes('rishikesh') || state.includes('uttarakhand')) {
            pool = [
                'https://images.unsplash.com/photo-1545389336-cf090694435e?w=1200&q=80',
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
                'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80',
                'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
                'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1200&q=80'
            ];
        } else if (dest.includes('meghalaya') || state.includes('meghalaya')) {
            pool = [
                'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80',
                'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&q=80',
                'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80',
                'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80',
                'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80'
            ];
        } else if (dest.includes('bali')) {
            pool = [
                'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
                'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&q=80',
                'https://images.unsplash.com/photo-1573790387438-4da905039392?w=1200&q=80',
                'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&q=80',
                'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=1200&q=80'
            ];
        } else if (dest.includes('thailand') || dest.includes('bangkok') || dest.includes('phuket')) {
            pool = [
                'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&q=80',
                'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=80',
                'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=1200&q=80',
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
                'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=1200&q=80'
            ];
        } else if (dest.includes('vietnam') || dest.includes('hanoi')) {
            pool = [
                'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
                'https://images.unsplash.com/photo-1509060464153-44667396260f?w=1200&q=80',
                'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=1200&q=80',
                'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=1200&q=80',
                'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80'
            ];
        } else {
            pool = [
                'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80',
                'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80',
                'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80',
                'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
                'https://images.unsplash.com/photo-1472214222555-d40475821c42?w=1200&q=80'
            ];
        }

        for (const url of pool) {
            if (images.length >= 5) break;
            if (!images.includes(url)) {
                images.push(url);
            }
        }

        while (images.length < 5) {
            images.push(pool[images.length % pool.length]);
        }
    }
    return images;
}

export function renderTripDetailPage(slug) {
    const app = document.getElementById('app');
    if (!app) return;

    const trip = trips.find(t => t.slug === slug);
    const host = trip ? (hosts || []).find(h => h.id === trip.hostId) : null;

    if (!trip || (trip.status === 'published' && host && !host.verified)) {
        app.innerHTML = `
            <div class="container" style="padding:calc(var(--nav-height) + var(--space-12)) 0;text-align:center">
                <h2>Trip listing unavailable</h2>
                <p class="text-muted">The host of this trip is currently unverified or undergoing review.</p>
                <a href="#/" class="btn btn-primary" style="margin-top:var(--space-6)">Go Home</a>
            </div>
        `;
        return;
    }

    const tripReviews = (reviews || []).filter(r => r.tripId === trip.id || r.hostId === trip.hostId).slice(0, 6);
    const verifiedHostsSet = new Set(hosts.filter(h => h.verified).map(h => h.id));
    const relatedTrips = trips.filter(t => t.id !== trip.id && t.status === 'published' && verifiedHostsSet.has(t.hostId) && (t.destination === trip.destination || t.categories.some(c => trip.categories.includes(c)))).slice(0, 3);
    const seats = getSeatsStatus(trip.bookedSeats, trip.totalSeats);
    const discount = calculateDiscount(trip.originalPrice, trip.price);
    const isSaved = store.isTripSaved(trip.id);
    const hostsMap = {};
    (hosts || []).forEach(h => hostsMap[h.id] = h);

    const transportIcons = { flight: 'flight', bus: 'directions_bus', train: 'train', 'self-drive': 'directions_car', mixed: 'commute', bike: 'two_wheeler' };
    const stayIcons = { hotel: 'hotel', hostel: 'night_shelter', camping: 'cabin', homestay: 'home', resort: 'pool', villa: 'villa', mixed: 'apartment', houseboat: 'directions_boat' };

    const enrichedImages = getEnrichedGallery(trip);

    app.innerHTML = `
        <style>
            .trip-detail {
                padding-top: calc(var(--nav-height) + var(--space-4));
                background: #000000;
                color: #ffffff;
                font-family: var(--font-body);
            }
            .trip-detail-layout {
                display: grid !important;
                grid-template-columns: 1fr 380px !important;
                gap: var(--space-8) !important;
                align-items: start !important;
                margin-top: 24px !important;
            }
            @media (max-width: 992px) {
                .trip-detail-layout {
                    grid-template-columns: 1fr !important;
                    gap: var(--space-6) !important;
                }
                .trip-detail-sidebar {
                    position: static !important;
                    margin-top: 20px !important;
                }
            }

            /* Gallery Mosaic - Premium Grid Layout */
            .trip-gallery-mosaic {
                display: grid !important;
                grid-template-rows: 1fr 1fr !important;
                grid-template-columns: 2fr 1fr 1fr !important;
                gap: 10px !important;
                height: 460px !important;
                border-radius: var(--radius-xl) !important;
                overflow: hidden !important;
                margin-bottom: 24px !important;
                position: relative !important;
            }
            .trip-gallery-mosaic .gallery-main {
                grid-row: 1 / 3 !important;
                grid-column: 1 / 2 !important;
                overflow: hidden !important;
                height: 100% !important;
            }
            .trip-gallery-mosaic .gallery-main img {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                transition: transform var(--transition-slow) !important;
                cursor: pointer !important;
            }
            .trip-gallery-mosaic .gallery-main img:hover {
                transform: scale(1.02) !important;
            }
            .trip-gallery-mosaic .gallery-thumb {
                overflow: hidden !important;
                height: 100% !important;
                position: relative !important;
            }
            .trip-gallery-mosaic .gallery-thumb img {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                transition: transform var(--transition-base) !important;
                cursor: pointer !important;
            }
            .trip-gallery-mosaic .gallery-thumb img:hover {
                transform: scale(1.04) !important;
            }

            .gallery-more-overlay {
                position: absolute !important;
                inset: 0 !important;
                background: rgba(0, 0, 0, 0.6) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-family: var(--font-heading) !important;
                font-size: var(--text-xl) !important;
                font-weight: 700 !important;
                color: #ffffff !important;
                cursor: pointer !important;
                pointer-events: none !important;
            }

            /* Responsive Gallery */
            @media (max-width: 768px) {
                .trip-gallery-mosaic {
                    grid-template-columns: 1fr !important;
                    grid-template-rows: 280px !important;
                    height: 280px !important;
                }
                .trip-gallery-mosaic .gallery-thumb {
                    display: none !important;
                }
                .trip-gallery-mosaic .gallery-main {
                    grid-row: 1 / 2 !important;
                    grid-column: 1 / 2 !important;
                }
            }

            /* Accordion timeline details styling */
            details.itinerary-item-details::-webkit-details-marker {
                display: none !important;
            }
            details.itinerary-item-details summary::-webkit-details-marker {
                display: none !important;
            }
            details.itinerary-item-details {
                background: rgba(255, 255, 255, 0.02) !important;
                border: 1px solid rgba(255, 255, 255, 0.06) !important;
                border-radius: 12px !important;
                overflow: hidden !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            details.itinerary-item-details[open] {
                border-color: rgba(255, 90, 0, 0.3) !important;
                box-shadow: 0 4px 20px rgba(255, 90, 0, 0.04) !important;
                background: rgba(255, 255, 255, 0.03) !important;
            }
            details.itinerary-item-details[open] .accordion-icon {
                transform: rotate(180deg) !important;
                color: var(--color-teal) !important;
            }

            /* Overview grid cards */
            .trip-overview-grid {
                display: grid !important;
                grid-template-columns: repeat(4, 1fr) !important;
                gap: 12px !important;
                margin: 24px 0 !important;
            }
            @media (max-width: 768px) {
                .trip-overview-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                }
            }
            .trip-overview-card {
                background: rgba(255, 255, 255, 0.02) !important;
                border: 1px solid rgba(255, 255, 255, 0.05) !important;
                border-radius: 12px !important;
                padding: 16px !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                text-align: center !important;
                transition: all 0.2s ease !important;
            }
            .trip-overview-card:hover {
                border-color: rgba(255, 90, 0, 0.2) !important;
                background: rgba(255, 255, 255, 0.04) !important;
                transform: translateY(-2px);
            }
            .trip-overview-icon {
                font-size: 24px !important;
                color: #ff9f1c !important;
                margin-bottom: 8px !important;
            }
            .trip-overview-value {
                font-size: 14px !important;
                font-weight: 700 !important;
                color: #ffffff !important;
                text-transform: capitalize !important;
            }
            .trip-overview-label {
                font-size: 11px !important;
                color: rgba(255, 255, 255, 0.4) !important;
                margin-top: 4px !important;
            }

            /* Inclusions lists */
            .trip-inclusion-grid {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 20px !important;
                margin-top: 16px !important;
            }
            @media (max-width: 768px) {
                .trip-inclusion-grid {
                    grid-template-columns: 1fr !important;
                }
            }
            .inclusion-card {
                background: rgba(255, 255, 255, 0.02) !important;
                border: 1px solid rgba(255, 255, 255, 0.05) !important;
                border-radius: 12px !important;
                padding: 20px !important;
            }
        </style>

        <div class="trip-detail" id="trip-detail">
            <!-- Gallery Section (Always rendered as a premium 5-image mosaic) -->
            <div class="container">
                <div class="trip-gallery-mosaic">
                    <div class="gallery-main">
                        <img src="${enrichedImages[0]}" alt="${trip.title}" id="gallery-main-img" loading="eager" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80';">
                    </div>
                    ${enrichedImages.slice(1, 5).map((img, i) => `
                        <div class="gallery-thumb ${i === 3 && enrichedImages.length > 5 ? 'gallery-more' : ''}">
                            <img src="${img}" alt="${trip.title} photo ${i + 2}" loading="lazy" data-gallery-idx="${i + 1}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1506038634487-60a69ae4b7b1?w=800&q=80';">
                            ${i === 3 && enrichedImages.length > 5 ? `<div class="gallery-more-overlay">+${enrichedImages.length - 5} photos</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="container">
                <div class="trip-detail-layout">
                    <!-- Main Content Column -->
                    <div class="trip-detail-main">
                        <!-- Breadcrumb -->
                        <nav class="breadcrumb" aria-label="Breadcrumb">
                            <a href="#/">Home</a>
                            <span class="material-icons-round" style="font-size:14px">chevron_right</span>
                            <a href="#/trips">Trips</a>
                            <span class="material-icons-round" style="font-size:14px">chevron_right</span>
                            <span>${trip.title}</span>
                        </nav>

                        <!-- Premium Redesigned Details Summary Header Card -->
                        <div class="trip-detail-header-card glass-panel" style="padding: 24px; margin: 16px 0 24px 0; border-radius: var(--radius-xl); border: 1px solid rgba(255, 255, 255, 0.08); display: flex; flex-direction: column; gap: 16px; background: rgba(8, 8, 8, 0.5);">
                            <!-- Badges & Ratings Row -->
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                                <div class="trip-badges" style="display: flex; gap: 8px;">
                                    ${trip.trending ? '<span class="badge badge-amber" style="background:#ff9f1c; color:#000; font-weight:700;">🔥 Trending</span>' : ''}
                                    ${trip.featured ? '<span class="badge badge-teal" style="background:#33e0be; color:#000; font-weight:700;">⭐ Featured</span>' : ''}
                                    ${trip.groupType === 'women-only' ? '<span class="badge" style="background:#f43f5e; color:#fff; font-weight:700;">👩 Females Only</span>' : ''}
                                    ${discount > 0 ? `<span class="badge" style="background:#ff5a00; color:#fff; font-weight:700;">🏷️ ${discount}% OFF</span>` : ''}
                                </div>
                                <div style="display: flex; align-items: center; gap: 4px; font-size: 15px; font-weight: 700; color: #ffffff;">
                                    <span style="color: #ff9f1c; font-size: 16px;">★</span>
                                    <span>${trip.rating}</span>
                                    <span style="color: rgba(255,255,255,0.4); font-weight: 500; font-size: 12px; margin-left: 2px;">(${trip.reviewCount} reviews)</span>
                                </div>
                            </div>

                            <!-- Title & Subtitle -->
                            <div>
                                <h1 class="trip-title" style="margin: 0; font-size: clamp(24px, 4vw, 32px); font-weight: 800; font-family: var(--font-heading); color: #ffffff; line-height: 1.2;">${trip.title}</h1>
                                <p class="trip-subtitle" style="color: rgba(255,255,255,0.6); font-size: 15px; margin: 8px 0 0 0; line-height: 1.4;">${trip.subtitle || ''}</p>
                            </div>

                            <!-- High Visibility PDF Itinerary Banner (always shown, with default fallback if not set) -->
                            <div style="background: rgba(0, 242, 254, 0.05); border: 1px solid rgba(0, 242, 254, 0.2); padding: 12px 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-top: 4px;">
                                <div style="display: flex; align-items: center; gap: 8px; text-align: left;">
                                    <span class="material-icons-round" style="color: #00f2fe; font-size: 22px;">picture_as_pdf</span>
                                    <div>
                                        <div style="font-size: 13px; font-weight: 700; color: #ffffff;">Detailed PDF Itinerary Available</div>
                                        <div style="font-size: 11px; color: rgba(255,255,255,0.5);">View the complete day-by-day roadmap, stays details, maps and preparation guide.</div>
                                    </div>
                                </div>
                                <a href="${trip.itineraryUrl || 'https://drive.google.com/file/d/1aY-XU7e7q8b9c1d2e3f4g5h6i7j8k9l0/view?usp=sharing'}" target="_blank" class="btn btn-secondary btn-sm" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none; padding:8px 16px; font-size:12px; border:1px solid #00f2fe; background:#00f2fe; color:#000000; font-weight:700; border-radius:6px; transition: all 0.2s ease;">
                                    <span class="material-icons-round" style="font-size:16px;">open_in_new</span>
                                    View Full Itinerary (Google Drive)
                                </a>
                            </div>

                            <!-- Location Info -->
                            <div class="trip-location" style="display: flex; align-items: center; gap: 6px; font-size: 14px; color: rgba(255,255,255,0.5); font-weight: 500;">
                                <span class="material-icons-round" style="font-size: 18px; color: var(--color-teal);">place</span>
                                <span>${trip.destination}, ${trip.destinationState}</span>
                                ${trip.origin ? `<span style="color: rgba(255,255,255,0.2)">·</span><span class="material-icons-round" style="font-size: 16px; color: rgba(255,255,255,0.4)">flight_takeoff</span><span>from ${trip.origin}</span>` : ''}
                            </div>

                            <div style="height: 1px; background: rgba(255,255,255,0.06); width: 100%;"></div>

                            <!-- Core Details Horizontal Row -->
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                                <!-- Host Info Pill -->
                                <div style="display: flex; align-items: center; width: 100%;">
                                    ${host ? `
                                        <a href="#/host/${host.id}" style="text-decoration:none; color:inherit; width: 100%;">
                                            <div class="card-host-pill" style="display: flex; align-items: center; justify-content: space-between; width: 100%; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 8px 12px; box-sizing: border-box;">
                                                <div style="display: flex; align-items: center; gap: 6px;">
                                                    <span style="color: #ff9f1c; font-size: 12px;">⚡</span>
                                                    <span style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8);">${host.name}</span>
                                                </div>
                                                ${host.verified ? '<span class="material-icons-round" style="color: #33e0be; font-size: 14px;">check_box</span>' : ''}
                                            </div>
                                        </a>
                                    ` : `
                                        <div class="card-host-pill" style="display: flex; align-items: center; justify-content: space-between; width: 100%; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 8px 12px; box-sizing: border-box;">
                                            <div style="display: flex; align-items: center; gap: 6px;">
                                                <span style="color: #ff9f1c; font-size: 12px;">⚡</span>
                                                <span style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8);">Unknown Host</span>
                                            </div>
                                        </div>
                                    `}
                                </div>

                                <!-- Duration & Dates Info -->
                                <div style="display: flex; flex-direction: column; justify-content: center; gap: 4px; padding: 0 4px;">
                                    <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #ffffff; font-weight: 600;">
                                        <span class="material-icons-round" style="font-size: 16px; color: rgba(255,255,255,0.4);">calendar_today</span>
                                        <span>${trip.duration.nights}N - ${trip.duration.days}D</span>
                                    </div>
                                    <span style="font-size: 11px; color: rgba(255,255,255,0.4); padding-left: 22px;">${formatDateRange(trip.dates.start, trip.dates.end)}</span>
                                </div>

                                <!-- Slot Bookings Progress -->
                                <div style="display: flex; flex-direction: column; justify-content: center; gap: 4px; padding: 0 4px;">
                                    <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #ffffff; font-weight: 600;">
                                        <span class="material-icons-round" style="font-size: 16px; color: rgba(255,255,255,0.4);">group</span>
                                        <span>${trip.bookedSeats}/${trip.totalSeats} Joined</span>
                                        ${trip.groupType === 'women-only' ? `<span style="color:#f43f5e; font-weight:800; font-size:14px; margin-left:2px;">♀</span>` : ''}
                                    </div>
                                    <span class="seats-text ${seats.urgency}" style="font-size: 11px; font-weight: 700; padding-left: 22px;">${seats.text}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Overview Cards -->
                        <div class="trip-overview-grid">
                            <div class="trip-overview-card">
                                <span class="trip-overview-icon material-icons-round">${transportIcons[trip.transportMode] || 'commute'}</span>
                                <span class="trip-overview-value">${trip.transportMode}</span>
                                <span class="trip-overview-label">Transport</span>
                            </div>
                            <div class="trip-overview-card">
                                <span class="trip-overview-icon material-icons-round">${stayIcons[trip.stayType] || 'hotel'}</span>
                                <span class="trip-overview-value">${trip.stayType}</span>
                                <span class="trip-overview-label">Accommodation</span>
                            </div>
                            <div class="trip-overview-card">
                                <span class="trip-overview-icon">🍽️</span>
                                <span class="trip-overview-value">${trip.foodType}</span>
                                <span class="trip-overview-label">Food</span>
                            </div>
                            <div class="trip-overview-card">
                                <span class="trip-overview-icon material-icons-round">group</span>
                                <span class="trip-overview-value">${trip.totalSeats} max</span>
                                <span class="trip-overview-label">Group Size</span>
                            </div>
                        </div>

                        <!-- Description Section -->
                        <div class="trip-section">
                            <h2 class="trip-section-title">About This Trip</h2>
                            <p class="trip-description line-clamp-4" id="trip-description-text" style="color:rgba(255,255,255,0.75); line-height:1.6; font-size:14px;">${trip.description}</p>
                            <button class="trip-read-more" id="trip-read-more-btn" style="border:none;background:transparent;padding:0;font-family:inherit;color:var(--color-teal);font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:4px;margin-top:8px;">
                                Read More <span class="material-icons-round" style="font-size:16px;">expand_more</span>
                            </button>
                            <div class="trip-card-tags" style="margin-top:var(--space-4); display:flex; gap:8px; flex-wrap:wrap;">
                                ${trip.highlights.map(h => `<span class="trip-tag" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:6px 12px; font-size:12px; color:rgba(255,255,255,0.7);">${h}</span>`).join('')}
                            </div>
                        </div>

                        <!-- Collapsible Day Accordion Itinerary -->
                        <div class="trip-section">
                            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:16px;">
                                <h2 class="trip-section-title" style="margin:0;">Day-by-Day Itinerary</h2>
                                ${trip.itineraryUrl ? `
                                    <a href="${trip.itineraryUrl}" target="_blank" class="btn btn-secondary btn-sm" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none; padding:6px 14px; font-size:12px; border-color:rgba(0,242,254,0.3); color:#00f2fe; margin-left:auto;">
                                        <span class="material-icons-round" style="font-size:16px; vertical-align:middle;">picture_as_pdf</span>
                                        View Detailed Itinerary (PDF)
                                    </a>
                                ` : ''}
                            </div>
                            <div class="itinerary-accordion-list" style="display:flex; flex-direction:column; gap:12px;">
                                ${(trip.itinerary || []).map((day, i) => `
                                    <details class="itinerary-item-details" ${i === 0 ? 'open' : ''}>
                                        <summary style="padding:16px 20px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; font-weight:700; font-size:14px; color:#ffffff; outline:none; user-select:none;">
                                            <div style="display:flex; align-items:center; gap:12px;">
                                                <span style="background:#ff5a00; color:#ffffff; font-family:var(--font-heading); font-size:11px; font-weight:800; padding:4px 10px; border-radius:6px; text-transform:uppercase; letter-spacing:0.05em;">Day ${day.day}</span>
                                                <span style="font-family:var(--font-heading); font-size:15px; font-weight:700;">${day.title}</span>
                                            </div>
                                            <span class="material-icons-round accordion-icon" style="font-size:20px; color:rgba(255,255,255,0.4); transition:transform 0.2s ease;">expand_more</span>
                                        </summary>
                                        <div style="padding:0 20px 20px 20px; border-top:1px solid rgba(255,255,255,0.03); margin-top:0;">
                                            <ul class="itinerary-activities" style="list-style:none; padding:12px 0 0 0; margin:0; display:flex; flex-direction:column; gap:8px;">
                                                ${day.activities.map(a => `
                                                    <li style="display:flex; align-items:flex-start; gap:8px; font-size:14px; color:rgba(255,255,255,0.75); line-height:1.4;">
                                                        <span class="material-icons-round" style="font-size:16px; color:var(--color-teal); margin-top:2px;">check_box</span>
                                                        <span>${a}</span>
                                                    </li>
                                                `).join('')}
                                            </ul>
                                            <div class="itinerary-meta" style="display:flex; gap:16px; margin-top:16px; font-size:12px; color:rgba(255,255,255,0.4); border-top:1px solid rgba(255,255,255,0.03); padding-top:12px;">
                                                ${day.meals?.length ? `<span>🍽️ Meals: ${day.meals.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}</span>` : ''}
                                                ${day.stay ? `<span>🏨 Stay: ${day.stay}</span>` : ''}
                                            </div>
                                        </div>
                                    </details>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Side-by-Side Inclusions & Exclusions -->
                        <div class="trip-section">
                            <h2 class="trip-section-title">Inclusions & Exclusions</h2>
                            <div class="trip-inclusion-grid">
                                <div class="inclusion-card">
                                    <h4 style="color:var(--color-success); margin-bottom:12px; display:flex; align-items:center; gap:6px; font-family:var(--font-heading); font-size:16px; font-weight:700;">
                                        <span class="material-icons-round">check_circle</span> Inclusions
                                    </h4>
                                    <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px;">
                                        ${(trip.inclusions || []).map(item => `
                                            <li style="display:flex; align-items:flex-start; gap:8px; font-size:13px; color:rgba(255,255,255,0.75); line-height:1.4;">
                                                <span class="material-icons-round" style="color:var(--color-success); font-size:16px; margin-top:1px;">check</span>
                                                <span>${item}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                                <div class="inclusion-card">
                                    <h4 style="color:var(--color-error); margin-bottom:12px; display:flex; align-items:center; gap:6px; font-family:var(--font-heading); font-size:16px; font-weight:700;">
                                        <span class="material-icons-round">cancel</span> Exclusions
                                    </h4>
                                    <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:8px;">
                                        ${(trip.exclusions || []).map(item => `
                                            <li style="display:flex; align-items:flex-start; gap:8px; font-size:13px; color:rgba(255,255,255,0.75); line-height:1.4;">
                                                <span class="material-icons-round" style="color:var(--color-error); font-size:16px; margin-top:1px;">close</span>
                                                <span>${item}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- Rich Host Card Section -->
                        <div class="trip-section">
                            <h2 class="trip-section-title">Your Host</h2>
                            ${host ? `
                                <div class="trip-host-card glass-card" style="border-radius:16px; border:1px solid rgba(255,255,255,0.08); padding:24px; background:rgba(8, 8, 8, 0.4);">
                                    <div style="display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap;">
                                        <div class="trip-host-avatar" style="width:70px; height:70px; border-radius:50%; overflow:hidden; border:2px solid var(--color-teal); flex-shrink:0;">
                                            <img src="${host.avatar}" alt="${host.name}" style="width:100%; height:100%; object-fit:cover;">
                                        </div>
                                        <div class="trip-host-info" style="flex:1; min-width:200px;">
                                            <div style="display:flex; align-items:center; gap:8px;">
                                                <h3 class="trip-host-name" style="margin:0; font-size:18px; font-weight:700; color:#ffffff; font-family:var(--font-heading);">${host.name}</h3>
                                                ${host.verified ? '<span class="badge" style="background:rgba(51, 224, 190, 0.15); color:#33e0be; border:1px solid rgba(51, 224, 190, 0.3); font-size:10px; padding:2px 8px; border-radius:6px; font-weight:700;">Verified Host</span>' : ''}
                                            </div>
                                            <p class="trip-host-meta" style="color:rgba(255,255,255,0.4); font-size:12px; margin:4px 0 12px 0; text-transform:capitalize;">${host.type} Host · Based in ${host.location}</p>
                                            <p style="color:rgba(255,255,255,0.7); font-size:13px; line-height:1.5; margin:0 0 16px 0;">${host.bio}</p>
                                            <div class="trip-host-stats" style="display:flex; flex-wrap:wrap; gap:16px; font-size:12px; color:rgba(255,255,255,0.5); border-top:1px solid rgba(255,255,255,0.04); padding-top:12px;">
                                                <span>⭐ <strong style="color:#ffffff;">${host.rating}</strong> Rating</span>
                                                <span>📋 <strong style="color:#ffffff;">${host.tripCount}</strong> Departures</span>
                                                <span>👥 <strong style="color:#ffffff;">${host.travelerCount}+</strong> Guests</span>
                                                <span>💬 <strong style="color:#ffffff;">${host.responseRate}%</strong> Reply Rate</span>
                                            </div>
                                            <div style="margin-top:20px; display:flex; gap:10px;">
                                                <a href="#/host/${host.id}" class="btn btn-secondary btn-sm" style="padding:6px 16px; font-size:12px;">View Profile</a>
                                                <button class="btn btn-ghost btn-sm" data-host-id="${host.id}" id="detail-message-host" style="padding:6px 16px; font-size:12px; border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; gap:4px;">
                                                    <span class="material-icons-round" style="font-size:14px">chat</span> Message Host
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ` : '<p class="text-muted">Host information unavailable</p>'}
                        </div>

                        <!-- Safety & Trust -->
                        <div class="trip-section">
                            <h2 class="trip-section-title">🛡️ Safety & Trust</h2>
                            <div class="glass-card" style="padding:20px; border-radius:12px; border:1px solid rgba(255,255,255,0.05); background:rgba(8, 8, 8, 0.2);">
                                <ul style="list-style:none; padding:0; margin:0 0 16px 0; display:flex; flex-direction:column; gap:8px;">
                                    ${(trip.safetyNotes || []).map(note => `
                                        <li style="display:flex; align-items:flex-start; gap:8px; font-size:13px; color:rgba(255,255,255,0.75); line-height:1.4;">
                                            <span class="material-icons-round" style="color:var(--color-teal); font-size:16px; margin-top:1px;">shield</span>
                                            <span>${note}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                                <p style="margin:0; font-size:13px; color:rgba(255,255,255,0.5); border-top:1px solid rgba(255,255,255,0.04); padding-top:12px;"><strong>Cancellation Policy:</strong> ${trip.cancellationPolicy}</p>
                            </div>
                        </div>

                        <!-- FAQs -->
                        ${trip.faq?.length ? `
                            <div class="trip-section">
                                <h2 class="trip-section-title">Frequently Asked Questions</h2>
                                <div class="trip-faq-list" style="display:flex; flex-direction:column; gap:10px; margin-top:16px;">
                                    ${trip.faq.map((item, i) => `
                                        <details class="faq-item glass-card" ${i === 0 ? 'open' : ''} style="border:1px solid rgba(255,255,255,0.05); border-radius:10px; overflow:hidden;">
                                            <summary class="faq-question" style="padding:14px 20px; cursor:pointer; font-weight:600; font-size:14px; color:#ffffff; display:flex; justify-content:space-between; align-items:center; outline:none; user-select:none; list-style:none;">
                                                <span>${item.q}</span>
                                                <span class="material-icons-round" style="font-size:18px; color:rgba(255,255,255,0.3)">expand_more</span>
                                            </summary>
                                            <p class="faq-answer" style="padding:0 20px 16px 20px; margin:0; border-top:1px solid rgba(255,255,255,0.03); padding-top:12px; color:rgba(255,255,255,0.65); font-size:13px; line-height:1.5;">${item.a}</p>
                                        </details>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Reviews Section -->
                        ${tripReviews.length ? `
                            <div class="trip-section">
                                <h2 class="trip-section-title">Reviews</h2>
                                <div class="trip-reviews-summary" style="display:flex; align-items:center; gap:16px; margin:16px 0;">
                                    <div class="trip-reviews-big-number" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); padding:12px 20px; border-radius:12px; display:flex; align-items:center; gap:8px;">
                                        <span style="font-size:32px; font-weight:800; color:#ffffff; font-family:var(--font-heading);">${trip.rating}</span>
                                        <span style="color:#ff9f1c; font-size:24px; margin-top:-4px;">★</span>
                                    </div>
                                    <span class="text-muted" style="font-size:14px; color:rgba(255,255,255,0.5);">${trip.reviewCount} Travelers Reviews</span>
                                </div>
                                <div class="reviews-list" style="display:flex; flex-direction:column; gap:12px;">
                                    ${tripReviews.map(rev => `
                                        <div class="review-card glass-card" style="padding:16px; border-radius:12px; border:1px solid rgba(255,255,255,0.05); background:rgba(8, 8, 8, 0.2);">
                                            <div class="review-header" style="display:flex; align-items:center; gap:12px;">
                                                <div class="avatar avatar-sm" style="width:36px; height:36px; border-radius:50%; overflow:hidden;"><img src="${rev.userAvatar}" alt="${rev.userName}" style="width:100%; height:100%; object-fit:cover;"></div>
                                                <div>
                                                    <strong style="font-size:13px; color:#ffffff;">${rev.userName}</strong>
                                                    <span class="text-muted" style="font-size:11px; color:rgba(255,255,255,0.4);"> · ${rev.userCity} · ${formatRelativeTime(rev.date)}</span>
                                                </div>
                                                <div style="margin-left:auto; color:#ff9f1c; font-size:12px;">${'★'.repeat(rev.rating)}</div>
                                            </div>
                                            <p style="margin:12px 0 0 0; color:rgba(255,255,255,0.7); font-size:13px; line-height:1.5;">${rev.text}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Related Trips -->
                        ${relatedTrips.length ? `
                            <div class="trip-section">
                                <h2 class="trip-section-title">You Might Also Like</h2>
                                <div class="trip-related-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-top:16px;">
                                    ${relatedTrips.map(t => renderTripCard(t, hostsMap[t.hostId], { compact: true })).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Sidebar / Booking Widget Column -->
                    <aside class="trip-detail-sidebar">
                        <div class="booking-widget glass-panel" id="booking-widget" style="padding:24px; border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-xl); background:rgba(8, 8, 8, 0.7); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); position:sticky; top:calc(var(--nav-height) + 24px); box-sizing:border-box; width:100%;">
                            <div class="booking-price" style="display:flex; align-items:baseline; gap:8px;">
                                <span class="booking-price-current" style="font-size:26px; font-weight:800; color:#ffffff; font-family:var(--font-heading);">${formatPrice(trip.price)}</span>
                                ${trip.originalPrice > trip.price ? `
                                    <span class="booking-price-original" style="font-size:14px; text-decoration:line-through; color:rgba(255,255,255,0.4);">${formatPrice(trip.originalPrice)}</span>
                                    <span class="booking-price-discount" style="font-size:11px; background:#ff9f1c; color:#000000; font-weight:800; padding:2px 6px; border-radius:4px; margin-left:auto;">${discount}% OFF</span>
                                ` : ''}
                            </div>
                            <span style="font-size:12px; color:rgba(255,255,255,0.4);">per traveler</span>

                            <div class="booking-divider" style="height:1px; background:rgba(255,255,255,0.08); margin:16px 0;"></div>

                            <!-- Booking Attributes Table -->
                            <div class="booking-details-list" style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px;">
                                <div class="booking-detail-row" style="display:flex; justify-content:space-between; font-size:13px;">
                                    <span class="booking-detail-label" style="color:rgba(255,255,255,0.4);">📅 Next Departure</span>
                                    <span class="booking-detail-value" style="color:#ffffff; font-weight:600;">${trip.dates.start}</span>
                                </div>
                                <div class="booking-detail-row" style="display:flex; justify-content:space-between; font-size:13px;">
                                    <span class="booking-detail-label" style="color:rgba(255,255,255,0.4);">⏱️ Duration</span>
                                    <span class="booking-detail-value" style="color:#ffffff; font-weight:600;">${trip.duration.nights}N - ${trip.duration.days}D</span>
                                </div>
                                <div class="booking-detail-row" style="display:flex; justify-content:space-between; font-size:13px;">
                                    <span class="booking-detail-label" style="color:rgba(255,255,255,0.4);">🚗 Transport</span>
                                    <span class="booking-detail-value" style="color:#ffffff; font-weight:600; text-transform:capitalize;">${trip.transportMode}</span>
                                </div>
                                <div class="booking-detail-row" style="display:flex; justify-content:space-between; font-size:13px;">
                                    <span class="booking-detail-label" style="color:rgba(255,255,255,0.4);">🏨 Accommodation</span>
                                    <span class="booking-detail-value" style="color:#ffffff; font-weight:600; text-transform:capitalize;">${trip.stayType}</span>
                                </div>
                                <div class="booking-detail-row" style="display:flex; justify-content:space-between; font-size:13px;">
                                    <span class="booking-detail-label" style="color:rgba(255,255,255,0.4);">🍽️ Meal Plan</span>
                                    <span class="booking-detail-value" style="color:#ffffff; font-weight:600; text-transform:capitalize;">${trip.foodType}</span>
                                </div>
                            </div>

                            <div class="booking-divider" style="height:1px; background:rgba(255,255,255,0.08); margin:16px 0;"></div>

                            <!-- Seats Remaining Status Bar -->
                            <div class="booking-seats" style="margin-bottom:20px;">
                                <div class="booking-seats-text" style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">
                                    <span class="seats-text ${seats.urgency}" style="font-weight:700;">${seats.text}</span>
                                    <span class="seats-count" style="color:rgba(255,255,255,0.6);">${trip.bookedSeats} / ${trip.totalSeats} Joined</span>
                                </div>
                                <div class="progress-bar" style="height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
                                    <div class="progress-bar-fill ${seats.urgency === 'high' ? 'warning' : ''}" style="width:${(trip.bookedSeats / trip.totalSeats) * 100}%; height:100%; background:var(--color-teal); border-radius:3px; transition:width 0.4s ease;"></div>
                                </div>
                            </div>

                            <!-- High Visibility Itinerary PDF CTA Link -->
                            <div style="margin-bottom: 16px;">
                                <a href="${trip.itineraryUrl || 'https://drive.google.com/file/d/1aY-XU7e7q8b9c1d2e3f4g5h6i7j8k9l0/view?usp=sharing'}" target="_blank" class="btn btn-secondary w-full" style="display:flex; align-items:center; justify-content:center; gap:8px; padding:10px; border:1px dashed rgba(0,242,254,0.4); background:rgba(0,242,254,0.06); color:#00f2fe; text-decoration:none; font-weight:700; font-size:13px; border-radius:8px; width:100%; box-sizing:border-box; transition:all 0.2s ease;">
                                    <span class="material-icons-round" style="font-size:18px;">picture_as_pdf</span>
                                    Download Detailed Itinerary (PDF)
                                </a>
                            </div>

                            <!-- CTAs -->
                            <button class="btn btn-primary btn-lg w-full booking-cta" id="book-now-btn" ${seats.available === 0 ? 'disabled' : ''} style="width:100%; background:#ff5a00; border-color:#ff5a00; color:#ffffff; font-weight:700; padding:12px; font-family:var(--font-heading); margin-bottom:12px;">
                                ${seats.available === 0 ? 'Sold Out' : 'Book Now — ' + formatPrice(trip.price)}
                            </button>

                            <div class="booking-secondary-actions" style="display:grid; grid-template-columns:1fr 50px 50px; gap:8px;">
                                <a href="https://wa.me/${host?.phone || '919876543210'}?text=Hi%20${encodeURIComponent(host?.name || 'Host')}!%20I%20am%20interested%20in%20your%20trip%20'${encodeURIComponent(trip.title)}'.%20Can%20you%20please%20share%20more%20details?" target="_blank" class="btn btn-secondary w-full" style="border:1px solid rgba(34,197,94,0.3); background:rgba(34,197,94,0.08); color:#22c55e; display:flex; align-items:center; justify-content:center; gap:6px; text-decoration:none; font-size:13px; font-weight:600;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.42 9.863-9.864.002-2.637-1.023-5.117-2.884-6.979C16.59 1.892 14.117.87 11.48.868 6.042.868 1.623 5.286 1.618 10.728c-.001 1.705.453 3.37 1.317 4.858L1.921 21.07l5.726-1.5-.15.084zM17.9 14.8c-.29-.15-1.71-.85-1.98-.95-.26-.1-.46-.15-.65.15-.2.3-.75.95-.92 1.15-.17.19-.34.22-.63.07-1.16-.58-1.93-1.02-2.68-2.3-.2-.34.2-.32.57-1.07.06-.13.03-.25-.01-.33-.05-.08-.45-1.08-.62-1.48-.16-.4-.33-.33-.46-.34H10.15c-.2 0-.5.07-.77.37-.26.3-1.02 1-1.02 2.43 0 1.43 1.04 2.82 1.19 3 .15.19 2.05 3.13 4.96 4.39.7.3 1.23.48 1.66.62.7.22 1.34.19 1.84.12.56-.08 1.71-.7 1.95-1.37.24-.68.24-1.26.17-1.37-.07-.11-.27-.2-.56-.35z"/>
                                    </svg>
                                    WhatsApp
                                </a>
                                <button class="btn btn-ghost ${isSaved ? 'saved' : ''}" id="detail-save-btn" data-trip-id="${trip.id}" style="border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.02); color:${isSaved ? '#f43f5e' : 'rgba(255,255,255,0.6)'}; display:flex; align-items:center; justify-content:center;">
                                    <span class="material-icons-round" style="font-size:18px">${isSaved ? 'favorite' : 'favorite_border'}</span>
                                </button>
                                <button class="btn btn-ghost" id="detail-share-btn" style="border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.02); color:rgba(255,255,255,0.6); display:flex; align-items:center; justify-content:center;">
                                    <span class="material-icons-round" style="font-size:18px">share</span>
                                </button>
                            </div>

                            <p class="booking-reassurance" style="font-size:11px; color:rgba(255,255,255,0.3); text-align:center; margin:16px 0 0 0;">
                                🔒 Secure Booking · Free Cancellation up to 15 Days
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>

        <!-- Sticky Mobile Booking Bar -->
        <div class="booking-mobile-bar" style="position:fixed; bottom:0; left:0; right:0; background:rgba(8,8,8,0.9); border-top:1px solid rgba(255,255,255,0.08); padding:12px 20px; display:none; justify-content:space-between; align-items:center; z-index:999; backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);">
            <div class="booking-mobile-price">
                <span class="booking-mobile-price-main" style="font-size:18px; font-weight:800; color:#ffffff; font-family:var(--font-heading);">${formatPrice(trip.price)}</span>
                <span class="booking-mobile-price-sub" style="font-size:11px; color:rgba(255,255,255,0.4); display:block;">per traveler</span>
            </div>
            <button class="btn btn-primary" id="mobile-book-btn" ${seats.available === 0 ? 'disabled' : ''} style="background:#ff5a00; border-color:#ff5a00; color:#ffffff; padding:10px 24px; font-weight:700;">
                ${seats.available === 0 ? 'Sold Out' : 'Book Now'}
            </button>
        </div>
    `;

    // Events
    setupTripDetailEvents(trip, host);
    setupTripCardEvents();
    initScrollAnimations();
}

function setupTripDetailEvents(trip, host) {
    // Book now
    document.getElementById('book-now-btn')?.addEventListener('click', () => {
        if (!store.get('isLoggedIn')) {
            store.addToast('Please log in to book this trip', 'warning');
            window.location.hash = '#/login';
            return;
        }
        store.addToast('🎉 Booking request sent! The host will contact you within 24 hours.', 'success');
    });

    // Save
    document.getElementById('detail-save-btn')?.addEventListener('click', () => {
        const wasSaved = store.isTripSaved(trip.id);
        store.toggleSavedTrip(trip.id);
        const btn = document.getElementById('detail-save-btn');
        const icon = btn?.querySelector('.material-icons-round');
        if (icon) {
            icon.textContent = wasSaved ? 'favorite_border' : 'favorite';
        }
        if (btn) {
            btn.style.color = wasSaved ? 'rgba(255,255,255,0.6)' : '#f43f5e';
            btn.classList.toggle('saved');
        }
        store.addToast(wasSaved ? 'Removed from saved' : 'Saved to wishlist! ❤️', wasSaved ? 'info' : 'success');
    });

    // Share
    document.getElementById('detail-share-btn')?.addEventListener('click', async () => {
        const url = window.location.href;
        if (navigator.share) {
            try { await navigator.share({ title: trip.title, text: trip.subtitle, url }); } catch { }
        } else {
            await navigator.clipboard.writeText(url);
            store.addToast('Link copied! 📋', 'success');
        }
    });

    // Message host
    document.getElementById('detail-message-host')?.addEventListener('click', () => {
        if (!store.get('isLoggedIn')) {
            store.addToast('Please log in to message hosts', 'warning');
            window.location.hash = '#/login';
            return;
        }
        window.location.hash = `#/messages?trip=${trip.id}&host=${trip.hostId}`;
    });

    // Gallery thumbnail click to swap main image
    document.querySelectorAll('.trip-gallery-mosaic img').forEach(img => {
        img.addEventListener('click', () => {
            const mainImg = document.getElementById('gallery-main-img');
            if (mainImg) {
                const targetSrc = img.src;
                img.src = mainImg.src;
                mainImg.src = targetSrc;
            }
        });
    });

    // Mobile book button click triggers main book button
    document.getElementById('mobile-book-btn')?.addEventListener('click', () => {
        document.getElementById('book-now-btn')?.click();
    });

    // Read more toggle
    const descText = document.getElementById('trip-description-text');
    const readMoreBtn = document.getElementById('trip-read-more-btn');
    if (descText && readMoreBtn) {
        // Check if content overflows 4 lines
        if (descText.scrollHeight <= descText.clientHeight) {
            readMoreBtn.style.display = 'none';
            descText.classList.remove('line-clamp-4');
        } else {
            readMoreBtn.addEventListener('click', () => {
                const isClamped = descText.classList.contains('line-clamp-4');
                if (isClamped) {
                    descText.classList.remove('line-clamp-4');
                    readMoreBtn.innerHTML = `Read Less <span class="material-icons-round" style="font-size:16px;">expand_less</span>`;
                } else {
                    descText.classList.add('line-clamp-4');
                    readMoreBtn.innerHTML = `Read More <span class="material-icons-round" style="font-size:16px;">expand_more</span>`;
                }
            });
        }
    }

    // Toggle display of mobile book bar on scroll
    const checkScroll = () => {
        const mobileBar = document.querySelector('.booking-mobile-bar');
        const bookBtn = document.getElementById('book-now-btn');
        if (!mobileBar || !bookBtn) return;
        
        if (window.innerWidth <= 992) {
            const rect = bookBtn.getBoundingClientRect();
            if (rect.bottom < 0) {
                mobileBar.style.display = 'flex';
            } else {
                mobileBar.style.display = 'none';
            }
        } else {
            mobileBar.style.display = 'none';
        }
    };
    window.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    // Trigger once
    setTimeout(checkScroll, 200);
}

function initScrollAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1 }
    );
    document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));
}

function renderTripGallery(images, title) {
    const count = images.length;
    // Airbnb style grid
    return `
        <div class="trip-gallery-mosaic">
            <div class="gallery-main">
                <img src="${images[0]}" alt="${title}" id="gallery-main-img" loading="eager" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80';">
            </div>
            ${images.slice(1, 5).map((img, i) => `
                <div class="gallery-thumb ${i === 3 && images.length > 5 ? 'gallery-more' : ''}">
                    <img src="${img}" alt="${title} photo ${i + 2}" loading="lazy" data-gallery-idx="${i + 1}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1506038634487-60a69ae4b7b1?w=800&q=80';">
                    ${i === 3 && images.length > 5 ? `<div class="gallery-more-overlay">+${images.length - 5} photos</div>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}
