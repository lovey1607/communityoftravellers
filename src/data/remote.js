// ============================================
// Remote Stays Seed Data & State Synchronization
// ============================================

const defaultRemoteStays = [
  {
    id: 'remote-001',
    title: 'The Nomad Villa - Anjuna, Goa',
    wifi: '📶 150 Mbps WiFi',
    features: 'Coffee Maker, Poolside desk, AC, Beach Access',
    price: 25000,
    coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80',
    description: 'A stunning glassmorphism villa shared by remote builders. Steps from Anjuna beach.',
    location: 'Goa',
    rating: 4.9,
    reviewsCount: 42,
    hostName: 'Rahul Mehta'
  },
  {
    id: 'remote-002',
    title: 'Alpine Co-living - Vashisht, Manali',
    wifi: '📶 100 Mbps Starlink',
    features: 'Fireplace, Mountain-view desk, Kitchen, Heater',
    price: 18000,
    coverImage: 'https://images.unsplash.com/photo-1506038634487-60a69ae4b7b1?w=600&q=80',
    description: 'Stay surrounded by snow-peaks. Co-working attic room with 360 view.',
    location: 'Manali',
    rating: 4.8,
    reviewsCount: 36,
    hostName: 'Priya Sharma'
  },
  {
    id: 'remote-003',
    title: 'Valley View Retreat - Munnar, Kerala',
    wifi: '📶 120 Mbps Fiber',
    features: 'Kitchen, Tea Garden, Private Balcony, Coffee Maker',
    price: 22000,
    coverImage: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=600&q=80',
    description: 'Co-living space nestled in the tea plantations. Quiet, serene, and perfect for deep focus work.',
    location: 'Kerala',
    rating: 4.7,
    reviewsCount: 28,
    hostName: 'Ananya Nair'
  },
  {
    id: 'remote-004',
    title: 'Himalayan Forest Cabin - Dharamshala, HP',
    wifi: '📶 80 Mbps WiFi',
    features: 'Power Backup, Heater, Dedicated Desk, Hiking Trails',
    price: 20000,
    coverImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80',
    description: 'Rustic wooden cabin surrounded by pine trees. Great community campfire chats and workshops.',
    location: 'Himachal',
    rating: 4.9,
    reviewsCount: 19,
    hostName: 'Amit Joshi'
  },
  {
    id: 'remote-005',
    title: 'Royal Haveli Co-work - Udaipur, Rajasthan',
    wifi: '📶 150 Mbps Fiber',
    features: 'AC, Rooftop Cafe, Dedicated Desk, Pool',
    price: 27000,
    coverImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80',
    description: 'Work from a restored heritage haveli overlooking Lake Pichola. Premium high-speed workstations.',
    location: 'Rajasthan',
    rating: 4.8,
    reviewsCount: 31,
    hostName: 'Vikram Singh'
  },
  {
    id: 'remote-006',
    title: 'Silicon Valley Escape - Coorg, Karnataka',
    wifi: '📶 100 Mbps WiFi',
    features: 'Power Backup, Coffee Estate Walk, Kitchen, AC',
    price: 24000,
    coverImage: 'https://images.unsplash.com/photo-1590050752117-238cb061295a?w=600&q=80',
    description: 'Escape the city rush. A quiet estate stay designed for software developers and designers.',
    location: 'Coorg',
    rating: 4.6,
    reviewsCount: 24,
    hostName: 'Sanjay Gowda'
  }
];

let localRemoteStays = [];
try {
  const parsed = JSON.parse(localStorage.getItem('cot_dynamic_remote_stays'));
  if (Array.isArray(parsed)) {
    localRemoteStays = parsed;
  }
} catch (e) {
  console.warn('Failed to load dynamic remote stays from localStorage:', e);
}

export const remoteStays = localRemoteStays.length >= defaultRemoteStays.length ? localRemoteStays : [...defaultRemoteStays];

export function saveRemoteStays() {
  try {
    localStorage.setItem('cot_dynamic_remote_stays', JSON.stringify(remoteStays));
  } catch (e) {
    console.warn('Failed to save dynamic remote stays to localStorage:', e);
  }
}

export async function syncRemoteStaysWithServer() {
  try {
    const res = await fetch('/api/remote');
    if (res.ok) {
      const serverRemoteStays = await res.json();
      if (Array.isArray(serverRemoteStays) && serverRemoteStays.length > 0) {
        remoteStays.length = 0;
        remoteStays.push(...serverRemoteStays);
        saveRemoteStays();
        return true;
      } else if (Array.isArray(serverRemoteStays) && serverRemoteStays.length === 0) {
        // Initialize server with default seed data
        await fetch('/api/remote/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultRemoteStays)
        });
      }
    }
  } catch (e) {
    console.warn('Failed to sync remote stays with server:', e);
  }
  return false;
}
