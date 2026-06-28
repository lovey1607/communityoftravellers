// ============================================
// Travel Jobs Seed Data & State Synchronization
// ============================================

const defaultJobs = [
  {
    id: 'job-001',
    title: 'Expedition Group Captain',
    company: 'Himalayan Treks Co.',
    companyType: 'company',
    location: 'Manali, Himachal Pradesh',
    locationCity: 'Manali',
    locationState: 'Himachal Pradesh',
    salary: '₹40,000 - ₹60,000 / mo',
    isFree: false,
    jobType: 'full-time',
    category: 'tour-guiding',
    experience: '3-5',
    openings: 3,
    remote: false,
    featured: true,
    status: 'approved',
    description: 'Lead group tours of 15+ adventurers across Uttarakhand & Himachal. Must have BMC/AMC certification and basic first-aid training. You will plan routes, manage safety, and deliver unforgettable mountain experiences.',
    requirements: ['BMC/AMC Certification', 'Wilderness First Aid', '3+ years guiding experience', 'Fluent Hindi & English', 'Physically fit for high altitude'],
    perks: ['Accommodation provided', 'All meals included on trip', 'Performance bonus per tour', 'Travel allowance', 'Equipment provided'],
    applyEmail: 'careers@himalayantreks.in',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    postedByName: 'Himalayan Treks Co.',
    postedByAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80',
    tags: ['Trekking', 'Leadership', 'Mountains', 'Certified'],
    createdAt: '2026-06-01'
  },
  {
    id: 'job-002',
    title: 'Trip Videographer & Content Creator',
    company: 'Wanderlust with Priya',
    companyType: 'influencer',
    location: 'Mumbai (Travel Required)',
    locationCity: 'Mumbai',
    locationState: 'Maharashtra',
    salary: '₹8,000 - ₹12,000 / trip',
    isFree: false,
    jobType: 'contract',
    category: 'photography-content',
    experience: '1-3',
    openings: 2,
    remote: false,
    featured: true,
    status: 'approved',
    description: 'Join Priya\'s upcoming group tours to shoot vertical Reels and documentary footage for 500K+ audience. Accommodation and travel fully sponsored. 3 trips planned across Rajasthan, Kerala, and Meghalaya.',
    requirements: ['Sony A7/GoPro 11 or similar', '2+ years content creation', 'Reels/Shorts editing skills', 'Drone licence (preferred)', 'Travel content portfolio'],
    perks: ['All travel & stay covered', 'Revenue share on viral content', 'Exposure to 500K audience', 'Camera gear provided', 'Post-production tools included'],
    applyEmail: 'priya@wanderlust.in',
    coverImage: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80',
    postedByName: 'Wanderlust with Priya',
    postedByAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    tags: ['Videography', 'Reels', 'Content', 'Travel'],
    createdAt: '2026-06-05'
  },
  {
    id: 'job-003',
    title: 'Volunteer Trail Maintenance & Camp Guide',
    company: 'Save the Trails Initiative',
    companyType: 'company',
    location: 'Spiti Valley, Himachal Pradesh',
    locationCity: 'Spiti Valley',
    locationState: 'Himachal Pradesh',
    salary: 'Volunteer (Free Accommodation + Meals)',
    isFree: true,
    jobType: 'volunteer',
    category: 'volunteering',
    experience: 'fresher',
    openings: 10,
    remote: false,
    featured: false,
    status: 'approved',
    description: 'Contribute to trail conservation in Spiti Valley for 2 weeks. Help maintain hiking paths, guide small trekking groups, and assist with eco-camp management. Accommodation and nutritious meals fully provided.',
    requirements: ['Passion for mountains & conservation', 'Basic trekking fitness', 'Willingness to do physical work', 'Min 18 years old'],
    perks: ['Free accommodation in eco-lodge', 'All meals provided', 'Certificate of completion', 'Knowledge of Spiti ecosystem', 'Community experience'],
    applyEmail: 'volunteer@savethetrails.org',
    coverImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    postedByName: 'Save the Trails Initiative',
    postedByAvatar: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=100&q=80',
    tags: ['Volunteer', 'Eco', 'Conservation', 'Mountains', 'Free'],
    createdAt: '2026-06-07'
  },
  {
    id: 'job-004',
    title: 'Free Trip Slot — Goa Beach Film Project',
    company: 'Nomad Frames by Arjun',
    companyType: 'influencer',
    location: 'Goa (All expenses paid)',
    locationCity: 'Goa',
    locationState: 'Goa',
    salary: 'Fully Sponsored Trip',
    isFree: true,
    jobType: 'free-trip',
    category: 'photography-content',
    experience: '1-3',
    openings: 1,
    remote: false,
    featured: true,
    status: 'approved',
    description: 'Arjun is looking for ONE skilled underwater/beach photographer to join his 5-day Goa production trip. Everything paid — flights, 5-star hotel, food, diving sessions. Your work will be fully credited on his 500K YouTube documentary.',
    requirements: ['Underwater photography portfolio', 'Sony/Canon mirrorless', 'Beach/coastal photography experience', 'Adobe Lightroom proficiency'],
    perks: ['100% expenses covered', '5-star beachfront hotel', 'All meals & diving included', 'Full credit on 500K YouTube video', 'Professional portfolio content'],
    applyEmail: 'arjun@nomadframes.io',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    postedByName: 'Nomad Frames by Arjun',
    postedByAvatar: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=100&q=80',
    tags: ['Free Trip', 'Photography', 'Goa', 'Influencer', 'Beach'],
    createdAt: '2026-06-08'
  },
  {
    id: 'job-005',
    title: 'Travel Operations Coordinator',
    company: 'Trekk India Pvt. Ltd.',
    companyType: 'company',
    location: 'Delhi (Hybrid)',
    locationCity: 'Delhi',
    locationState: 'Delhi',
    salary: '₹25,000 - ₹35,000 / mo',
    isFree: false,
    jobType: 'full-time',
    category: 'operations',
    experience: '1-3',
    openings: 2,
    remote: true,
    featured: false,
    status: 'approved',
    description: 'Coordinate logistics for 20+ group trips per month. Handle vendor relationships, accommodation bookings, transport arrangements, and on-ground support teams across 15+ destinations in India and Southeast Asia.',
    requirements: ['1-3 years operations experience', 'Google Sheets/Excel proficiency', 'Strong communication', 'Knowledge of travel vendors in India', 'Problem solving under pressure'],
    perks: ['Hybrid work (3 days office)', 'Free trip on select tours', 'Health insurance', 'Annual bonus', 'Travel industry discount network'],
    applyEmail: 'hr@trekkindia.com',
    coverImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',
    postedByName: 'Trekk India Pvt. Ltd.',
    postedByAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80',
    tags: ['Operations', 'Coordination', 'Hybrid', 'Travel Industry'],
    createdAt: '2026-06-10'
  },
  {
    id: 'job-006',
    title: 'Social Media Manager — Travel Brand',
    company: 'Roam & Wander Co.',
    companyType: 'company',
    location: 'Bangalore (Remote)',
    locationCity: 'Bangalore',
    locationState: 'Karnataka',
    salary: '₹30,000 - ₹45,000 / mo',
    isFree: false,
    jobType: 'full-time',
    category: 'marketing',
    experience: '1-3',
    openings: 1,
    remote: true,
    featured: false,
    status: 'approved',
    description: 'Manage Instagram, YouTube Shorts, and Pinterest for India\'s fastest growing adventure travel brand with 800K+ followers. Create campaigns, analyse engagement, and collaborate with influencer partners.',
    requirements: ['2+ years social media management', 'Travel/lifestyle brand experience', 'Canva/Adobe design skills', 'Analytics-driven mindset', 'Travel photography sense'],
    perks: ['100% remote', '2 free company trips/year', 'Creative freedom', 'Tools & subscriptions provided', 'Work with top influencer network'],
    applyEmail: 'marketing@roamandwander.in',
    coverImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80',
    postedByName: 'Roam & Wander Co.',
    postedByAvatar: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=100&q=80',
    tags: ['Social Media', 'Marketing', 'Remote', 'Content', 'Brand'],
    createdAt: '2026-06-12'
  },
  {
    id: 'job-007',
    title: 'Travel Influencer Trip Manager',
    company: 'Backpacker Bliss with Kavya',
    companyType: 'influencer',
    location: 'Pan India (Travel-based)',
    locationCity: 'Pan India',
    locationState: 'Multiple',
    salary: '₹15,000 - ₹20,000 / trip',
    isFree: false,
    jobType: 'part-time',
    category: 'trip-management',
    experience: '1-3',
    openings: 1,
    remote: false,
    featured: false,
    status: 'approved',
    description: 'Manage all logistics for Kavya\'s group travel experiences. Handle hotel check-ins, vendor calls, itinerary execution, group communication, and on-ground problem solving during 4-8 day group trips.',
    requirements: ['Travel management/leadership experience', 'Excellent Hindi & English communication', 'Calm under pressure', 'Willingness to travel pan-India', 'Detail-oriented'],
    perks: ['Travel fully covered', 'Accommodation on trips', 'Meals during trips', 'Featured on 300K community', 'Bonus per positive review'],
    applyEmail: 'kavya@backpackerbliss.com',
    coverImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
    postedByName: 'Backpacker Bliss with Kavya',
    postedByAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80',
    tags: ['Trip Management', 'Influencer', 'Leadership', 'Travel'],
    createdAt: '2026-06-14'
  },
  {
    id: 'job-008',
    title: 'Intern — Travel Experience Design',
    company: 'Beyond Borders Journeys',
    companyType: 'company',
    location: 'Mumbai (In-office)',
    locationCity: 'Mumbai',
    locationState: 'Maharashtra',
    salary: '₹8,000 / mo Stipend',
    isFree: false,
    jobType: 'internship',
    category: 'operations',
    experience: 'fresher',
    openings: 3,
    remote: false,
    featured: false,
    status: 'approved',
    description: '3-month internship helping design itineraries for premium group travel experiences. Research destinations, curate local activities, identify hidden gems, and build day-by-day itinerary documents.',
    requirements: ['College student or recent grad', 'Deep passion for travel', 'Research & writing skills', 'Microsoft Office proficiency', 'Curiosity and initiative'],
    perks: ['₹8,000 monthly stipend', 'Free day trips on weekends', 'Industry mentorship', 'PPO opportunity for top performers', 'Strong resume builder'],
    applyEmail: 'internships@beyondborders.co.in',
    coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
    postedByName: 'Beyond Borders Journeys',
    postedByAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80',
    tags: ['Internship', 'Design', 'Fresher', 'Stipend'],
    createdAt: '2026-06-15'
  },
  {
    id: 'job-009',
    title: 'Free Bali Trip — Travel Blogger (Sponsored)',
    company: 'Sunnyside Escapes',
    companyType: 'influencer',
    location: 'Bali, Indonesia (Fully Sponsored)',
    locationCity: 'Bali',
    locationState: 'International',
    salary: 'Fully Sponsored (₹80,000 trip value)',
    isFree: true,
    jobType: 'free-trip',
    category: 'photography-content',
    experience: '1-3',
    openings: 2,
    remote: false,
    featured: true,
    status: 'approved',
    description: 'Sunnyside Escapes is sponsoring 2 travel bloggers for an 8-day Bali trip worth ₹80,000. All-inclusive: flights from Delhi, 5-star villa, all activities. In return: 3 Instagram carousel posts, 5 Reels, and 1 YouTube vlog.',
    requirements: ['10,000+ Instagram followers (travel niche)', 'Active YouTube channel', 'Professional photography gear', 'Prior brand collaboration experience', 'Engagement rate 4%+'],
    perks: ['Direct flights from Delhi', '5-star private villa', 'All activities covered', 'Meals & transport covered', 'Additional ₹15,000 brand fee'],
    applyEmail: 'collabs@sunnysideescapes.com',
    coverImage: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&q=80',
    postedByName: 'Sunnyside Escapes',
    postedByAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    tags: ['Free Trip', 'Bali', 'Sponsored', 'Blogger', 'International'],
    createdAt: '2026-06-20'
  },
  {
    id: 'job-010',
    title: 'Volunteer — Community Kitchen & Local Immersion',
    company: 'Earthtones Foundation',
    companyType: 'company',
    location: 'Ladakh, J&K',
    locationCity: 'Ladakh',
    locationState: 'Jammu & Kashmir',
    salary: 'Volunteer (Free stay + meals)',
    isFree: true,
    jobType: 'volunteer',
    category: 'volunteering',
    experience: 'fresher',
    openings: 8,
    remote: false,
    featured: false,
    status: 'approved',
    description: 'Volunteer for 10 days in a remote Ladakhi village. Assist in the community kitchen, help with local school education programs, and participate in traditional weaving and farming activities.',
    requirements: ['Open mind & cultural sensitivity', 'Basic physical fitness for altitude (3500m)', 'No specific skills required — just dedication', 'Min 21 years of age'],
    perks: ['Free traditional homestay', 'Authentic local meals', 'Cultural immersion certificate', 'Photography opportunities', 'Carbon offset certificate'],
    applyEmail: 'volunteer@earthtones.org',
    coverImage: 'https://images.unsplash.com/photo-1547481887-a26e2cacb5b2?w=800&q=80',
    postedByName: 'Earthtones Foundation',
    postedByAvatar: 'https://images.unsplash.com/photo-1542156822-6924d1a71ace?w=100&q=80',
    tags: ['Volunteer', 'Ladakh', 'Community', 'Culture', 'Free', 'NGO'],
    createdAt: '2026-06-23'
  }
];

let localJobs = [];
try {
  const parsed = JSON.parse(localStorage.getItem('cot_dynamic_jobs'));
  if (Array.isArray(parsed) && parsed.length > 0) {
    localJobs = parsed;
  }
} catch (e) {
  console.warn('Failed to load dynamic jobs from localStorage:', e);
}

export const jobs = localJobs.length > 0 ? localJobs : [...defaultJobs];

export function saveJobs() {
  try {
    localStorage.setItem('cot_dynamic_jobs', JSON.stringify(jobs));
  } catch (e) {
    console.warn('Failed to save dynamic jobs to localStorage:', e);
  }
}

export async function syncJobsWithServer() {
  try {
    const res = await fetch('/api/jobs');
    if (res.ok) {
      const serverJobs = await res.json();
      if (Array.isArray(serverJobs) && serverJobs.length > 0) {
        jobs.length = 0;
        jobs.push(...serverJobs);
        saveJobs();
        return true;
      } else if (Array.isArray(serverJobs) && serverJobs.length === 0) {
        await fetch('/api/jobs/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultJobs)
        });
        jobs.length = 0;
        jobs.push(...defaultJobs);
        saveJobs();
      }
    }
  } catch (e) {
    console.warn('Failed to sync jobs with server:', e);
  }
  return false;
}
