// ============================================
// Invite Only Seed Data & State Synchronization
// ============================================

const defaultInviteTrips = [
  {
    id: 'invite-001',
    emoji: '🚀',
    title: 'BHX Project',
    description: 'Exclusive startup founder meetup in Bangalore',
    date: 'Jan 15-17, 2026',
    slots: 20
  },
  {
    id: 'invite-002',
    emoji: '🎵',
    title: 'Shoonya Festival',
    description: 'Curated music & wellness experience in Goa',
    date: 'Feb 10-12, 2026',
    slots: 30
  },
  {
    id: 'invite-003',
    emoji: '🎪',
    title: 'Ziro Festival',
    description: 'Exclusive music festival experience in Ziro Valley, Arunachal Pradesh',
    date: 'Sep 24-27, 2026',
    slots: 25
  }
];

let localInviteTrips = [];
try {
  const parsed = JSON.parse(localStorage.getItem('cot_dynamic_invite_trips'));
  if (Array.isArray(parsed)) {
    localInviteTrips = parsed;
  }
} catch (e) {
  console.warn('Failed to load dynamic invite trips from localStorage:', e);
}

export const inviteTrips = localInviteTrips.length > 0 ? localInviteTrips : [...defaultInviteTrips];

export function saveInviteTrips() {
  try {
    localStorage.setItem('cot_dynamic_invite_trips', JSON.stringify(inviteTrips));
  } catch (e) {
    console.warn('Failed to save dynamic invite trips to localStorage:', e);
  }
}

export async function syncInviteTripsWithServer() {
  try {
    const res = await fetch('/api/invite');
    if (res.ok) {
      const serverInviteTrips = await res.json();
      if (Array.isArray(serverInviteTrips) && serverInviteTrips.length > 0) {
        inviteTrips.length = 0;
        inviteTrips.push(...serverInviteTrips);
        saveInviteTrips();
        return true;
      } else if (Array.isArray(serverInviteTrips) && serverInviteTrips.length === 0) {
        // Initialize server with default seed data
        await fetch('/api/invite/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultInviteTrips)
        });
      }
    }
  } catch (e) {
    console.warn('Failed to sync invite trips with server:', e);
  }
  return false;
}
