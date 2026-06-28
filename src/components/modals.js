// ============================================
// Platform Custom Modals System
// 1. Request Community Access Modal
// 2. AI Trip Matcher Modal
// ============================================

import { showModal, closeModal } from './toast.js';
import { store } from '../state.js';
import { trips } from '../data/trips.js';
import { hosts } from '../data/hosts.js';
import { formatPrice } from '../utils/format.js';
import { navigateTo } from '../router.js';

// Seed community requests helper
export function getCommunityRequests() {
    const stored = localStorage.getItem('cot_community_requests');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse community requests:', e);
        }
    }
    
    // Default seed data
    const seed = [
        {
            id: 'req-001',
            name: 'Rohan Mehta',
            phone: '+91 98765 43210',
            email: 'rohan.mehta@gmail.com',
            social: '@rohan_mehta',
            location: 'Mumbai, India',
            source: 'WhatsApp Community',
            submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            status: 'pending'
        },
        {
            id: 'req-002',
            name: 'Aisha Sen',
            phone: '+91 99887 76655',
            email: 'aisha.sen@yahoo.com',
            social: '@aisha_travels',
            location: 'Kolkata, India',
            source: 'BHX Project Invite',
            submittedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            status: 'approved'
        }
    ];
    localStorage.setItem('cot_community_requests', JSON.stringify(seed));
    return seed;
}

export function saveCommunityRequests(requests) {
    localStorage.setItem('cot_community_requests', JSON.stringify(requests));
}

// ─── 1. REQUEST COMMUNITY ACCESS MODAL ─────────────────────────
export function showCommunityAccessModal(source = 'WhatsApp Community') {
    const modalContent = `
        <div style="font-family:var(--font-body);text-align:left;color:var(--color-text-primary)">
            <p class="text-muted" style="font-size:13px;line-height:1.5;margin-bottom:20px">
                Fill in your details to join our exclusive WhatsApp community for group trip updates and last-minute deals.
            </p>
            
            <form id="community-access-form" style="display:flex;flex-direction:column;gap:14px">
                <div class="form-group">
                    <label class="form-label" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:rgba(255,255,255,0.7)">Name *</label>
                    <input type="text" class="input" id="comm-name" placeholder="Your full name" required style="border-radius:8px">
                </div>
                
                <div class="form-group">
                    <label class="form-label" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:rgba(255,255,255,0.7)">WhatsApp Number *</label>
                    <input type="text" class="input" id="comm-phone" placeholder="+91 98765 43210" required style="border-radius:8px">
                </div>
                
                <div class="form-group">
                    <label class="form-label" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:rgba(255,255,255,0.7)">Email *</label>
                    <input type="email" class="input" id="comm-email" placeholder="you@example.com" required style="border-radius:8px">
                </div>
                
                <div class="form-group">
                    <label class="form-label" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:rgba(255,255,255,0.7)">Social Media Handle</label>
                    <input type="text" class="input" id="comm-social" placeholder="@yourhandle (Instagram/Twitter)" style="border-radius:8px">
                </div>
                
                <div class="form-group" style="margin-bottom:10px">
                    <label class="form-label" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:rgba(255,255,255,0.7)">Location</label>
                    <input type="text" class="input" id="comm-loc" placeholder="City, Country" style="border-radius:8px">
                </div>
                
                <button type="submit" class="btn w-full" style="background:#00d4aa;color:#000;font-weight:700;padding:12px;border-radius:8px;font-size:14px;border:none;cursor:pointer;transition:opacity 0.2s;">
                    Submit Request
                </button>
            </form>
        </div>
    `;

    showModal({
        title: '🔒 Request Community Access',
        content: modalContent,
        actions: [], // Actions are handled by submit button inside the form
        size: 'sm'
    });

    // Add submit handler
    const form = document.getElementById('community-access-form');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('comm-name').value;
        const phone = document.getElementById('comm-phone').value;
        const email = document.getElementById('comm-email').value;
        const social = document.getElementById('comm-social').value || 'Not provided';
        const location = document.getElementById('comm-loc').value || 'India';
        
        const requests = getCommunityRequests();
        const newRequest = {
            id: 'req-' + Date.now(),
            name,
            phone,
            email,
            social,
            location,
            source,
            submittedAt: new Date().toISOString(),
            status: 'pending'
        };
        
        requests.push(newRequest);
        saveCommunityRequests(requests);
        
        closeModal();
        store.addToast('Request submitted successfully! We will review your profile shortly. 📄', 'success');
    });
}

// ─── 2. AI TRIP MATCHER MODAL ──────────────────────────────────
export function showAiTripMatcherModal() {
    const modalContent = `
        <div style="font-family:var(--font-body);text-align:center;color:var(--color-text-primary);min-height:280px" id="ai-matcher-container">
            <p class="text-muted" style="font-size:13px;line-height:1.5;margin-bottom:20px;text-align:left">
                Upload a screenshot of your group chat where friends are discussing travel plans. Our AI will analyze it and recommend matching trips!
            </p>
            
            <!-- Upload Box Area -->
            <div id="ai-upload-area" style="border:2px dashed rgba(0,212,170,0.3);background:rgba(0,212,170,0.02);border-radius:12px;padding:32px 20px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;transition:all 0.2s ease;">
                <span class="material-icons-round" style="font-size:48px;color:#00d4aa;">cloud_upload</span>
                <div>
                    <strong style="display:block;font-size:14px;color:#ffffff">Click to upload chat screenshot</strong>
                    <span style="font-size:11px;color:var(--color-text-muted);display:block;margin-top:4px">PNG, JPG up to 5MB</span>
                </div>
                <input type="file" id="ai-file-input" accept="image/*" style="display:none">
            </div>
            
            <div style="margin:20px 0 12px;display:flex;align-items:center;justify-content:center;gap:10px">
                <span style="flex-grow:1;height:1px;background:rgba(255,255,255,0.06)"></span>
                <span class="text-muted" style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em">Or choose a mock chat to simulate</span>
                <span style="flex-grow:1;height:1px;background:rgba(255,255,255,0.06)"></span>
            </div>
            
            <!-- Mock Chat options -->
            <div style="display:flex;flex-direction:column;gap:8px">
                <button class="btn btn-secondary btn-sm mock-chat-btn" data-type="goa" style="justify-content:flex-start;text-align:left;border-radius:8px;padding:10px 14px;width:100%;font-size:12px">
                    <span class="material-icons-round" style="font-size:16px;color:#ff5a00;margin-right:8px">beach_access</span>
                    <strong>Beach Vibe Chat</strong>: "Goa plan, July, need water sports & budget hotels, 5 friends"
                </button>
                <button class="btn btn-secondary btn-sm mock-chat-btn" data-type="munnar" style="justify-content:flex-start;text-align:left;border-radius:8px;padding:10px 14px;width:100%;font-size:12px">
                    <span class="material-icons-round" style="font-size:16px;color:#00d4aa;margin-right:8px">nature_people</span>
                    <strong>Scenic Hills Chat</strong>: "Munnar tea fields, camps, trekking, 3 girls"
                </button>
                <button class="btn btn-secondary btn-sm mock-chat-btn" data-type="ladakh" style="justify-content:flex-start;text-align:left;border-radius:8px;padding:10px 14px;width:100%;font-size:12px">
                    <span class="material-icons-round" style="font-size:16px;color:#a855f7;margin-right:8px">motorcycle</span>
                    <strong>Adventure Bike Chat</strong>: "Ladakh ride, Khardung La & camping, 6 guys, August"
                </button>
            </div>
        </div>
    `;

    showModal({
        title: '🪄 AI Trip Matcher',
        content: modalContent,
        actions: [],
        size: 'md'
    });

    // Event listeners
    const uploadArea = document.getElementById('ai-upload-area');
    const fileInput = document.getElementById('ai-file-input');
    
    uploadArea?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            // Simulate AI matching for uploaded files (defaulting to Goa/Manali mix)
            startSimulation('goa');
        }
    });
    
    document.querySelectorAll('.mock-chat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const chatType = btn.dataset.type;
            startSimulation(chatType);
        });
    });
}

function startSimulation(type) {
    const container = document.getElementById('ai-matcher-container');
    if (!container) return;
    
    // 1. LOADING SCREEN STAGE
    let step = 0;
    const steps = [
        { label: 'Reading chat history logs...', progress: 25 },
        { label: 'Running OCR & NLP entity parsing...', progress: 55 },
        { label: 'Extracting group size, budget, and dates...', progress: 85 },
        { label: 'Searching matching verified departures...', progress: 100 }
    ];
    
    const runStep = () => {
        if (step < steps.length) {
            container.innerHTML = `
                <div style="padding:40px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;min-height:280px">
                    <div class="spinner" style="width:48px;height:48px;border:3px solid rgba(0,212,170,0.1);border-top-color:#00d4aa;border-radius:50%;animation:spin 1s linear infinite;"></div>
                    <div>
                        <strong style="color:#ffffff;display:block;font-size:16px">${steps[step].label}</strong>
                        <div style="width:200px;height:4px;background:rgba(255,255,255,0.06);border-radius:99px;margin:12px auto 0;overflow:hidden">
                            <div style="height:100%;background:#00d4aa;width:${steps[step].progress}%;transition:width 0.4s ease;"></div>
                        </div>
                    </div>
                </div>
            `;
            step++;
            setTimeout(runStep, 800);
        } else {
            showResults(type);
        }
    };
    
    runStep();
}

function showResults(type) {
    const container = document.getElementById('ai-matcher-container');
    if (!container) return;
    
    let destination = 'Goa';
    let count = 5;
    let timing = 'July 2026';
    let category = 'Beach / Water Sports';
    let matches = [];
    
    const verifiedHosts = hosts.filter(h => h.verified);
    const verifiedHostIds = verifiedHosts.map(h => h.id);
    
    if (type === 'goa') {
        destination = 'Goa';
        count = 5;
        timing = 'July 2026';
        category = 'Beach / Water Sports';
        // Find Goa trips
        matches = trips.filter(t => t.status === 'published' && verifiedHostIds.includes(t.hostId) && (t.destination.toLowerCase().includes('goa') || t.categories.includes('beach')));
    } else if (type === 'munnar') {
        destination = 'Munnar';
        count = 3;
        timing = 'July 2026';
        category = 'Hill Station / Trekking';
        matches = trips.filter(t => t.status === 'published' && (t.destination.toLowerCase().includes('munnar') || t.destination.toLowerCase().includes('kerala')));
    } else if (type === 'ladakh') {
        destination = 'Leh & Ladakh';
        count = 6;
        timing = 'August 2026';
        category = 'Adventure / Road-Trip';
        matches = trips.filter(t => t.status === 'published' && (t.destination.toLowerCase().includes('leh') || t.destination.toLowerCase().includes('ladakh') || t.destination.toLowerCase().includes('spiti')));
    }
    
    // In case no matches found, default to popular trips
    if (matches.length === 0) {
        matches = trips.filter(t => t.status === 'published' && verifiedHostIds.includes(t.hostId)).slice(0, 2);
    }
    
    container.innerHTML = `
        <div style="font-family:var(--font-body);text-align:left;color:var(--color-text-primary)">
            <!-- Extracted info box -->
            <div style="background:rgba(0,212,170,0.04);border:1px solid rgba(0,212,170,0.15);border-radius:10px;padding:16px;margin-bottom:20px;display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px">
                <div>
                    <span class="text-muted" style="display:block;margin-bottom:2px">Destination Parsed:</span>
                    <strong style="color:#ffffff;font-size:13px;display:flex;align-items:center;gap:4px">
                        <span class="material-icons-round" style="font-size:16px;color:#00d4aa">place</span>
                        ${destination}
                    </strong>
                </div>
                <div>
                    <span class="text-muted" style="display:block;margin-bottom:2px">Group Size:</span>
                    <strong style="color:#ffffff;font-size:13px;display:flex;align-items:center;gap:4px">
                        <span class="material-icons-round" style="font-size:16px;color:#00d4aa">groups</span>
                        ${count} Travelers
                    </strong>
                </div>
                <div>
                    <span class="text-muted" style="display:block;margin-bottom:2px">Timing Parsed:</span>
                    <strong style="color:#ffffff;font-size:13px;display:flex;align-items:center;gap:4px">
                        <span class="material-icons-round" style="font-size:16px;color:#00d4aa">calendar_month</span>
                        ${timing}
                    </strong>
                </div>
                <div>
                    <span class="text-muted" style="display:block;margin-bottom:2px">Travel Category:</span>
                    <strong style="color:#ffffff;font-size:13px;display:flex;align-items:center;gap:4px">
                        <span class="material-icons-round" style="font-size:16px;color:#00d4aa">category</span>
                        ${category}
                    </strong>
                </div>
            </div>
            
            <h4 style="margin-bottom:12px;color:#ffffff;font-size:13px;text-transform:uppercase;letter-spacing:0.05em">Recommended Departures (${matches.length})</h4>
            
            <!-- Recommendations List -->
            <div style="display:flex;flex-direction:column;gap:10px;max-height:220px;overflow-y:auto;padding-right:4px;margin-bottom:20px">
                ${matches.map(t => {
                    const host = hosts.find(h => h.id === t.hostId);
                    return `
                        <div style="display:flex;gap:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:8px;align-items:center">
                            <div style="width:70px;height:55px;border-radius:6px;overflow:hidden;flex-shrink:0">
                                <img src="${t.coverImage}" style="width:100%;height:100%;object-fit:cover" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80';">
                            </div>
                            <div style="flex-grow:1;min-width:0">
                                <h5 style="margin:0 0 2px 0;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#ffffff">${t.title}</h5>
                                <div style="font-size:11px;color:var(--color-text-muted)">
                                    ${t.duration.days} Days · By ${host?.name || 'Verified Host'}
                                </div>
                            </div>
                            <div style="text-align:right;flex-shrink:0">
                                <div style="font-weight:700;color:#00d4aa;font-size:13px">${formatPrice(t.price)}</div>
                                <a href="javascript:void(0)" class="ai-view-trip-link" data-slug="${t.slug}" style="font-size:10px;color:var(--color-teal);text-decoration:underline;margin-top:4px;display:inline-block">View Details</a>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div style="display:flex;gap:10px">
                <button class="btn btn-secondary w-full" id="ai-reupload-btn" style="border-radius:8px;padding:10px;font-size:13px">Upload Another</button>
                <button class="btn w-full" id="ai-apply-filters-btn" style="background:#00d4aa;color:#000;font-weight:700;border-radius:8px;padding:10px;font-size:13px;border:none">See All Matches</button>
            </div>
        </div>
    `;
    
    // Bind results events
    document.querySelectorAll('.ai-view-trip-link').forEach(link => {
        link.addEventListener('click', () => {
            const slug = link.dataset.slug;
            closeModal();
            window.location.hash = `#/trip/${slug}`;
        });
    });
    
    document.getElementById('ai-reupload-btn')?.addEventListener('click', () => {
        showAiTripMatcherModal();
    });
    
    document.getElementById('ai-apply-filters-btn')?.addEventListener('click', () => {
        closeModal();
        store.set('filters.destination', destination === 'Leh & Ladakh' ? 'Ladakh' : destination);
        navigateTo('/trips');
    });
}
