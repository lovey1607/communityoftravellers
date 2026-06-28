// ============================================================
// Community of Travellers — SEO Utilities
// Dynamic meta tags, Open Graph, Twitter Cards, JSON-LD schemas
// ============================================================

const SITE_NAME = 'Community of Travellers';
const SITE_URL = 'https://communityoftravellers.in';
const DEFAULT_IMAGE = `${SITE_URL}/images/og-default.jpg`;
const DEFAULT_DESCRIPTION = 'Discover curated group trips across India and beyond. Join verified hosts, meet fellow travellers, and create unforgettable memories.';

// ─── Meta Tag Helpers ────────────────────────────────────────

/**
 * Get or create a <meta> element by attribute selector.
 * @param {string} attr  – attribute name (e.g. 'name', 'property')
 * @param {string} value – attribute value (e.g. 'description', 'og:title')
 * @returns {HTMLMetaElement}
 */
function getOrCreateMeta(attr, value) {
  let el = document.querySelector(`meta[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  return el;
}

/**
 * Get or create the <link rel="canonical"> element.
 * @returns {HTMLLinkElement}
 */
function getOrCreateCanonical() {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  return el;
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Update all SEO-relevant tags for the current page.
 *
 * @param {Object}  options
 * @param {string}  [options.title]       – page title (site name appended automatically)
 * @param {string}  [options.description] – meta description (max ~160 chars recommended)
 * @param {string}  [options.url]         – canonical URL
 * @param {string}  [options.image]       – social share image URL
 * @param {string}  [options.type]        – og:type (default 'website')
 */
export function updatePageSEO({
  title,
  description,
  url,
  image,
  type = 'website',
} = {}) {
  try {
    // ── Document Title ─────────────────────────────────────
    const fullTitle = title
      ? `${title} — ${SITE_NAME}`
      : SITE_NAME;
    document.title = fullTitle;

    // ── Meta Description ───────────────────────────────────
    const desc = description || DEFAULT_DESCRIPTION;
    getOrCreateMeta('name', 'description').setAttribute('content', desc);

    // ── Open Graph ─────────────────────────────────────────
    getOrCreateMeta('property', 'og:title').setAttribute('content', title || SITE_NAME);
    getOrCreateMeta('property', 'og:description').setAttribute('content', desc);
    getOrCreateMeta('property', 'og:url').setAttribute('content', url || SITE_URL);
    getOrCreateMeta('property', 'og:image').setAttribute('content', image || DEFAULT_IMAGE);
    getOrCreateMeta('property', 'og:type').setAttribute('content', type);
    getOrCreateMeta('property', 'og:site_name').setAttribute('content', SITE_NAME);

    // ── Twitter Card ───────────────────────────────────────
    getOrCreateMeta('name', 'twitter:card').setAttribute('content', 'summary_large_image');
    getOrCreateMeta('name', 'twitter:title').setAttribute('content', title || SITE_NAME);
    getOrCreateMeta('name', 'twitter:description').setAttribute('content', desc);
    getOrCreateMeta('name', 'twitter:image').setAttribute('content', image || DEFAULT_IMAGE);

    // ── Canonical URL ──────────────────────────────────────
    if (url) {
      getOrCreateCanonical().setAttribute('href', url);
    }
  } catch (err) {
    console.error('[SEO] Failed to update page meta:', err);
  }
}

/**
 * Generate a JSON-LD schema object for a trip listing.
 * Combines TravelAction, Event, and (optionally) AggregateRating schemas.
 *
 * @param {Object} trip  – trip data object
 * @param {Object} host  – host data object
 * @returns {Object} JSON-LD schema
 */
export function generateTripSchema(trip, host) {
  if (!trip) {
    console.warn('[SEO] generateTripSchema called without trip data');
    return null;
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: trip.title || trip.name || 'Trip',
    description: trip.description || trip.shortDescription || '',
    startDate: trip.startDate || trip.departureDate || '',
    endDate: trip.endDate || trip.returnDate || '',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    image: trip.coverImage || trip.images?.[0] || DEFAULT_IMAGE,
    url: `${SITE_URL}/#/trip/${trip.id}`,
    location: _buildLocation(trip),
    organizer: _buildOrganizer(host),
    offers: {
      '@type': 'Offer',
      price: trip.currentPrice || trip.price || 0,
      priceCurrency: trip.currency || 'INR',
      availability: _getAvailability(trip),
      url: `${SITE_URL}/#/trip/${trip.id}`,
      validFrom: trip.createdAt || trip.publishedDate || '',
    },
  };

  // Aggregate Rating
  if (trip.rating && trip.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: trip.rating,
      reviewCount: trip.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Travel action sub-schema
  if (trip.origin) {
    schema.subjectOf = {
      '@type': 'TravelAction',
      fromLocation: {
        '@type': 'Place',
        name: trip.origin,
      },
      toLocation: {
        '@type': 'Place',
        name: trip.destination || trip.location || '',
      },
    };
  }

  return schema;
}

/**
 * Generate a JSON-LD schema for a host profile.
 *
 * @param {Object} host – host data object
 * @returns {Object} JSON-LD schema
 */
export function generateHostSchema(host) {
  if (!host) {
    console.warn('[SEO] generateHostSchema called without host data');
    return null;
  }

  const isCompany = host.type === 'company';
  const schema = {
    '@context': 'https://schema.org',
    '@type': isCompany ? 'Organization' : 'Person',
    name: host.name,
    description: host.bio || '',
    image: host.avatar || '',
    url: `${SITE_URL}/#/host/${host.id}`,
  };

  if (host.location) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: host.location,
      addressRegion: host.state || '',
      addressCountry: 'IN',
    };
  }

  if (host.rating && host.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: host.rating,
      reviewCount: host.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Social / sameAs links
  const sameAs = [];
  if (host.socialLinks) {
    if (host.socialLinks.instagram) {
      sameAs.push(`https://instagram.com/${host.socialLinks.instagram.replace('@', '')}`);
    }
    if (host.socialLinks.youtube) {
      sameAs.push(`https://youtube.com/@${host.socialLinks.youtube}`);
    }
    if (host.socialLinks.twitter) {
      sameAs.push(`https://twitter.com/${host.socialLinks.twitter.replace('@', '')}`);
    }
    if (host.socialLinks.website) {
      sameAs.push(
        host.socialLinks.website.startsWith('http')
          ? host.socialLinks.website
          : `https://${host.socialLinks.website}`
      );
    }
  }
  if (sameAs.length) {
    schema.sameAs = sameAs;
  }

  // Company-specific details
  if (isCompany && host.companyDetails) {
    schema.foundingDate = host.companyDetails.yearEstablished
      ? String(host.companyDetails.yearEstablished)
      : undefined;
    schema.numberOfEmployees = host.companyDetails.teamSize
      ? { '@type': 'QuantitativeValue', value: host.companyDetails.teamSize }
      : undefined;
  }

  return schema;
}

/**
 * Inject a JSON-LD <script> tag into the document <head>.
 * Removes any previously injected CoT schema script first.
 *
 * @param {Object|Object[]} schema – JSON-LD object(s)
 */
export function injectSchema(schema) {
  if (!schema) return;

  try {
    // Remove previous CoT schema scripts
    const existing = document.querySelectorAll('script[data-cot-schema]');
    existing.forEach((el) => el.remove());

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-cot-schema', 'true');
    script.textContent = JSON.stringify(schema, null, 0);
    document.head.appendChild(script);
  } catch (err) {
    console.error('[SEO] Failed to inject JSON-LD schema:', err);
  }
}

// ─── Private Helpers ─────────────────────────────────────────

function _buildLocation(trip) {
  const destination = trip.destination || trip.location || '';
  if (!destination) return undefined;

  return {
    '@type': 'Place',
    name: destination,
    address: {
      '@type': 'PostalAddress',
      addressLocality: destination,
      addressCountry: trip.country || 'IN',
    },
  };
}

function _buildOrganizer(host) {
  if (!host) return undefined;
  const isCompany = host.type === 'company';

  return {
    '@type': isCompany ? 'Organization' : 'Person',
    name: host.name,
    url: `${SITE_URL}/#/host/${host.id}`,
  };
}

function _getAvailability(trip) {
  const booked = trip.bookedSeats ?? trip.seatsFilled ?? 0;
  const total = trip.totalSeats ?? trip.maxGroupSize ?? 0;

  if (total === 0) return 'https://schema.org/InStock';
  if (booked >= total) return 'https://schema.org/SoldOut';
  if ((booked / total) >= 0.8) return 'https://schema.org/LimitedAvailability';
  return 'https://schema.org/InStock';
}
