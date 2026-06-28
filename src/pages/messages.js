// ============================================
// Messaging Center Component
// Split-pane real-time chat between travelers and hosts
// ============================================

import { store } from '../state.js';
import { trips } from '../data/trips.js';
import { hosts } from '../data/hosts.js';
import { users } from '../data/users.js';

let activeThreadId = null;
let replyTimer = null;

export function renderMessagesPage() {
    const app = document.getElementById('app');
    if (!app) return;

    if (!store.get('isLoggedIn')) {
        store.addToast('Please log in to view your messages', 'warning');
        window.location.hash = '#/login';
        return;
    }

    const user = store.get('currentUser');
    
    // Seed sample threads if inquiries is empty to show a live messaging center
    seedSampleThreads(user);

    // Get thread query param if navigating from an inquiry
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.slice(hash.indexOf('?')));
    const threadParam = urlParams.get('thread');
    const tripParam = urlParams.get('trip');
    const hostParam = urlParams.get('host');

    const inquiries = store.get('inquiries') || [];
    
    // Select thread based on navigation context
    if (threadParam) {
        activeThreadId = threadParam;
    } else if (tripParam && hostParam) {
        // Find or create thread for this trip
        const matched = inquiries.find(inq => inq.tripId === tripParam && inq.travelerId === user.id);
        if (matched) {
            activeThreadId = matched.id;
        } else {
            // Create a brand new inquiry thread context
            const tripObj = trips.find(t => t.id === tripParam) || trips[0];
            const hostObj = hosts.find(h => h.id === hostParam) || hosts[0];
            const newInq = {
                id: `inq-${Date.now()}`,
                tripId: tripParam,
                tripTitle: tripObj.title,
                hostId: hostParam,
                hostName: hostObj.name,
                hostAvatar: hostObj.avatar,
                travelerId: user.id,
                travelerName: user.name,
                travelerCity: user.city || 'India',
                message: `Hi ${hostObj.name}, I am interested in joining your group trip to ${tripObj.destination}. Can you share more details?`,
                status: 'pending',
                timestamp: new Date().toISOString()
            };
            
            inquiries.unshift(newInq);
            store.set('inquiries', inquiries);
            
            // Seed opening message from traveler
            const msgs = store.get('messages') || [];
            msgs.push({
                id: `msg-open-${Date.now()}`,
                threadId: newInq.id,
                senderId: user.id,
                senderName: user.name,
                senderAvatar: user.avatar,
                text: newInq.message,
                timestamp: new Date().toISOString()
            });
            store.set('messages', msgs);
            
            activeThreadId = newInq.id;
        }
    } else if (!activeThreadId && inquiries.length > 0) {
        // Fallback to first thread
        activeThreadId = inquiries[0].id;
    }

    const myThreads = inquiries.filter(inq => inq.travelerId === user.id || inq.hostId === user.hostId);
    const activeThread = inquiries.find(inq => inq.id === activeThreadId);
    const allMessages = store.get('messages') || [];
    const activeMessages = allMessages.filter(msg => msg.threadId === activeThreadId);

    app.innerHTML = `
        <div class="messages-page" style="padding-top:calc(var(--nav-height) + var(--space-4));height:calc(100vh - var(--nav-height) - 40px);min-height:500px">
            <div class="container messages-container glass-panel animate-in" style="height:100%;display:grid;grid-template-columns:300px 1fr;padding:0;overflow:hidden">
                
                <!-- Left Pane: Thread List -->
                <aside class="messages-threads-pane" style="border-right:1px solid rgba(255,255,255,0.08);display:flex;flex-direction:column">
                    <div class="threads-header" style="padding:var(--space-4);border-bottom:1px solid rgba(255,255,255,0.08)">
                        <h2 style="font-size:var(--text-lg);margin-bottom:0">Conversions</h2>
                    </div>
                    <div class="threads-list" style="flex-grow:1;overflow-y:auto;display:flex;flex-direction:column">
                        ${myThreads.map(thread => {
                            const isSelected = thread.id === activeThreadId;
                            const partnerName = user.role === 'host' ? thread.travelerName : thread.hostName;
                            const partnerAvatar = user.role === 'host' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80' : thread.hostAvatar;
                            const threadMsgs = allMessages.filter(m => m.threadId === thread.id);
                            const lastMsg = threadMsgs[threadMsgs.length - 1]?.text || thread.message;

                            return `
                                <button class="thread-item ${isSelected ? 'active' : ''}" data-thread-id="${thread.id}" style="text-align:left;display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);background:none;border:none;border-bottom:1px solid rgba(255,255,255,0.03);cursor:pointer;width:100%;transition:background 0.2s">
                                    <div class="avatar avatar-sm" style="flex-shrink:0">
                                        <img src="${partnerAvatar}" alt="${partnerName}">
                                    </div>
                                    <div style="flex-grow:1;min-width:0">
                                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
                                            <strong style="font-size:var(--text-sm);color:var(--color-text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${partnerName}</strong>
                                            <span style="font-size:var(--text-xs);color:var(--color-text-muted)">${new Date(thread.timestamp).toLocaleDateString([], {month:'short', day:'numeric'})}</span>
                                        </div>
                                        <div style="font-size:var(--text-xs);color:var(--color-teal);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:2px">${thread.tripTitle}</div>
                                        <p style="font-size:var(--text-xs);color:var(--color-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0">${lastMsg}</p>
                                    </div>
                                </button>
                            `;
                        }).join('')}
                    </div>
                </aside>

                <!-- Right Pane: Active Conversation -->
                <main class="messages-chat-pane" style="display:flex;flex-direction:column;height:100%;position:relative">
                    ${activeThread ? `
                        <!-- Chat Header -->
                        <div class="chat-header" style="padding:var(--space-3) var(--space-4);border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.01)">
                            <div style="display:flex;align-items:center;gap:var(--space-3)">
                                <div class="avatar avatar-sm">
                                    <img src="${user.role === 'host' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80' : activeThread.hostAvatar}" alt="${user.role === 'host' ? activeThread.travelerName : activeThread.hostName}">
                                </div>
                                <div>
                                    <h3 style="font-size:var(--text-md);margin-bottom:2px">${user.role === 'host' ? activeThread.travelerName : activeThread.hostName}</h3>
                                    <span style="font-size:var(--text-xs);color:var(--color-text-secondary)">Trip Context: <a href="#/trip/${trips.find(t=>t.id===activeThread.tripId)?.slug || ''}" class="hover-gradient" style="font-weight:600">${activeThread.tripTitle}</a></span>
                                </div>
                            </div>
                            <span class="badge ${
                                activeThread.status === 'confirmed' ? 'badge-teal' : 'badge-amber'
                            }" style="text-transform:capitalize">${activeThread.status}</span>
                        </div>

                        <!-- Chat Messages List -->
                        <div class="chat-messages-area" id="chat-messages-list" style="flex-grow:1;padding:var(--space-4);overflow-y:auto;display:flex;flex-direction:column;gap:var(--space-3)">
                            ${activeMessages.map(msg => {
                                const isSelf = msg.senderId === user.id;
                                return `
                                    <div class="chat-message-bubble ${isSelf ? 'self' : ''}" style="display:flex;gap:var(--space-2);max-width:70%;align-self:${isSelf ? 'flex-end' : 'flex-start'};flex-direction:${isSelf ? 'row-reverse' : 'row'}">
                                        <div class="avatar avatar-xs" style="flex-shrink:0">
                                            <img src="${msg.senderAvatar}" alt="${msg.senderName}">
                                        </div>
                                        <div style="display:flex;flex-direction:column;align-items:${isSelf ? 'flex-end' : 'flex-start'}">
                                            <div style="background:${isSelf ? 'var(--color-teal)' : 'rgba(255,255,255,0.06)'};color:${isSelf ? '#0a0f1a' : 'inherit'};padding:var(--space-2) var(--space-4);border-radius:16px;font-size:var(--text-sm);line-height:1.4">
                                                ${msg.text}
                                            </div>
                                            <span style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:2px">${new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                            
                            <!-- Typing indicator container -->
                            <div class="typing-indicator" id="chat-typing-indicator" style="display:none;align-self:flex-start;gap:var(--space-2);align-items:center;background:rgba(255,255,255,0.06);padding:var(--space-2) var(--space-4);border-radius:16px;font-size:var(--text-sm)">
                                <span class="typing-dot"></span>
                                <span class="typing-dot"></span>
                                <span class="typing-dot"></span>
                            </div>
                        </div>

                        <!-- Chat Input Box -->
                        <div class="chat-input-area" style="padding:var(--space-3) var(--space-4);border-top:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.01)">
                            <form id="chat-send-form" style="display:flex;gap:var(--space-3)">
                                <input type="text" class="input" id="chat-input-val" placeholder="Type a message..." required autocomplete="off" style="flex-grow:1">
                                <button type="submit" class="btn btn-primary">
                                    <span class="material-icons-round" style="margin-right:0">send</span>
                                </button>
                            </form>
                        </div>
                    ` : `
                        <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--color-text-muted)">
                            <span class="material-icons-round" style="font-size:64px;margin-bottom:var(--space-3)">chat</span>
                            <h3>Select a thread to start chatting</h3>
                        </div>
                    `}
                </main>

            </div>
        </div>
    `;

    setupChatEvents(user, activeThread, activeMessages);
}

function setupChatEvents(user, activeThread, activeMessages) {
    // Thread selection click
    document.querySelectorAll('.thread-item').forEach(btn => {
        btn.addEventListener('click', () => {
            activeThreadId = btn.dataset.threadId;
            // Clean up any pending timer
            if (replyTimer) {
                clearTimeout(replyTimer);
                replyTimer = null;
            }
            // Navigate without parameter query to avoid conflicts
            window.location.hash = `#/messages?thread=${activeThreadId}`;
            renderMessagesPage();
        });
    });

    // Scroll to chat bottom
    const chatArea = document.getElementById('chat-messages-list');
    if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    // Chat sending form submission
    const form = document.getElementById('chat-send-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('chat-input-val');
            const text = input.value.trim();
            if (!text) return;

            const allMessages = store.get('messages') || [];
            
            // Add user message
            const newMsg = {
                id: `msg-${Date.now()}`,
                threadId: activeThread.id,
                senderId: user.id,
                senderName: user.name,
                senderAvatar: user.avatar,
                text: text,
                timestamp: new Date().toISOString()
            };

            allMessages.push(newMsg);
            store.set('messages', allMessages);
            input.value = '';

            renderMessagesPage();

            // Simulate Host automated reply
            if (user.role === 'traveler') {
                simulateHostReply(activeThread.id, activeThread.hostName, activeThread.hostAvatar, text);
            }
        });
    }
}

function simulateHostReply(threadId, hostName, hostAvatar, travelerMsg) {
    const indicator = document.getElementById('chat-typing-indicator');
    if (indicator) {
        indicator.style.display = 'flex';
        const chatArea = document.getElementById('chat-messages-list');
        if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
    }

    replyTimer = setTimeout(() => {
        const indicator = document.getElementById('chat-typing-indicator');
        if (indicator) indicator.style.display = 'none';

        const allMessages = store.get('messages') || [];
        
        let responseText = `Hi! Thanks for reaching out about this trip. I'd love to have you join our group! What questions do you have about the itinerary or stay?`;
        
        // Dynamic smart response logic for demo realism
        const msgLower = travelerMsg.toLowerCase();
        if (msgLower.includes('itinerary') || msgLower.includes('schedule') || msgLower.includes('plan')) {
            responseText = `We have a fully detailed day-by-day itinerary with verified local guides. You can check the outline on the trip listing or download the itinerary PDF!`;
        } else if (msgLower.includes('price') || msgLower.includes('discount') || msgLower.includes('cost')) {
            responseText = `The price listed per person is all-inclusive of accommodation, transfers, activities, and meals as specified. Let me know if you are booking for a group of 3 or more so I can offer a small group discount.`;
        } else if (msgLower.includes('safety') || msgLower.includes('safe') || msgLower.includes('women')) {
            responseText = `Safety is our top priority! We verify all local cab operators, choose premium secure accommodations, and always have an experienced group captain lead the trek.`;
        }

        const replyMsg = {
            id: `msg-reply-${Date.now()}`,
            threadId: threadId,
            senderId: 'host-partner', // Simulates the host
            senderName: hostName,
            senderAvatar: hostAvatar,
            text: responseText,
            timestamp: new Date().toISOString()
        };

        allMessages.push(replyMsg);
        store.set('messages', allMessages);
        
        // Play notification sound or show toast if not currently looking at the same page
        if (window.location.hash.includes('#/messages')) {
            renderMessagesPage();
        } else {
            store.addToast(`New message from ${hostName} regarding trip inquiry!`, 'info');
        }
    }, 2000);
}

function seedSampleThreads(user) {
    const inquiries = store.get('inquiries') || [];
    if (inquiries.length === 0) {
        // Create 2 demo inquiries
        const demoInq1 = {
            id: 'inq-demo-1',
            tripId: 'trip-001',
            tripTitle: 'Goa Sunset & Beach Backpacking',
            hostId: 'host-001',
            hostName: 'Wanderlust with Priya',
            hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
            travelerId: user.id,
            travelerName: user.name,
            travelerCity: user.city || 'India',
            message: 'Is the dolphin safari included in the standard package?',
            status: 'pending',
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
        };

        const demoInq2 = {
            id: 'inq-demo-2',
            tripId: 'trip-003',
            tripTitle: 'Ladakh Bike Expedition',
            hostId: 'host-002',
            hostName: 'The Roaming Rajput',
            hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
            travelerId: user.id,
            travelerName: user.name,
            travelerCity: user.city || 'India',
            message: 'I want to rent a single rider bike, what are the extra charges?',
            status: 'confirmed',
            timestamp: new Date(Date.now() - 3600000 * 3).toISOString() // 3 hours ago
        };

        inquiries.push(demoInq1, demoInq2);
        store.set('inquiries', inquiries);

        // Seed correspondence messages
        const msgs = store.get('messages') || [];
        msgs.push(
            {
                id: 'msg-seed-1',
                threadId: 'inq-demo-1',
                senderId: user.id,
                senderName: user.name,
                senderAvatar: user.avatar,
                text: 'Is the dolphin safari included in the standard package?',
                timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
            },
            {
                id: 'msg-seed-2',
                threadId: 'inq-demo-1',
                senderId: 'host-001',
                senderName: 'Wanderlust with Priya',
                senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
                text: 'Hi Ananya! Yes, dolphin cruising and snorkeling are both fully included in our day 3 activities. 🐬🏝️',
                timestamp: new Date(Date.now() - 3600000 * 23).toISOString()
            },
            {
                id: 'msg-seed-3',
                threadId: 'inq-demo-2',
                senderId: user.id,
                senderName: user.name,
                senderAvatar: user.avatar,
                text: 'I want to rent a single rider bike, what are the extra charges?',
                timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
            }
        );
        store.set('messages', msgs);
    }
}
