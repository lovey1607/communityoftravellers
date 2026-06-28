// ============================================================
// Community of Travellers — Social Sharing Utilities
// Web Share API, WhatsApp, Twitter/X, Facebook, Clipboard
// ============================================================

const SITE_URL = 'https://communityoftravellers.in';
const SITE_NAME = 'Community of Travellers';

// ─── Share Text Generation ───────────────────────────────────

/**
 * Generate a shareable text message for a trip.
 *
 * @param {Object} trip
 * @returns {string}
 */
export function generateShareText(trip) {
  if (!trip) return `Check out trips on ${SITE_NAME}! ${SITE_URL}`;

  const title = trip.title || trip.name || 'Amazing Trip';
  const destination = trip.destination || trip.location || '';
  const price = trip.currentPrice ?? trip.price;
  const duration = _formatDurationShort(trip);

  const parts = [title];

  if (destination) {
    parts.push(`📍 ${destination}`);
  }
  if (duration) {
    parts.push(`📅 ${duration}`);
  }
  if (price != null) {
    parts.push(`💰 Starting at ₹${Number(price).toLocaleString('en-IN')}`);
  }

  parts.push('');
  parts.push(`Book now on ${SITE_NAME} 👇`);
  parts.push(_getTripUrl(trip));

  return parts.join('\n');
}

// ─── Web Share API ───────────────────────────────────────────

/**
 * Share a trip using the native Web Share API.
 * Falls back to copying the link to clipboard on unsupported browsers.
 *
 * @param {Object} trip
 * @returns {Promise<{ method: 'native'|'clipboard', success: boolean }>}
 */
export async function shareTrip(trip) {
  const url = _getTripUrl(trip);
  const title = trip?.title || trip?.name || 'Check out this trip!';
  const text = generateShareText(trip);

  // Try native Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return { method: 'native', success: true };
    } catch (err) {
      // User cancelled or error
      if (err.name === 'AbortError') {
        return { method: 'native', success: false };
      }
      // Fall through to clipboard
      console.warn('[Share] Native share failed, falling back to clipboard:', err);
    }
  }

  // Fallback: copy URL to clipboard
  const copied = await copyToClipboard(url);
  return { method: 'clipboard', success: copied };
}

// ─── WhatsApp ────────────────────────────────────────────────

/**
 * Generate a WhatsApp share URL for a trip.
 *
 * @param {Object} trip
 * @returns {string} wa.me URL
 */
export function getWhatsAppShareURL(trip) {
  const text = generateShareText(trip);
  const encoded = encodeURIComponent(text);
  return `https://wa.me/?text=${encoded}`;
}

// ─── Twitter / X ─────────────────────────────────────────────

/**
 * Generate a Twitter (X) share URL for a trip.
 *
 * @param {Object} trip
 * @returns {string} twitter intent URL
 */
export function getTwitterShareURL(trip) {
  const url = _getTripUrl(trip);
  const title = trip?.title || trip?.name || 'Check out this trip!';
  const destination = trip?.destination || trip?.location || '';

  let tweetText = `${title}`;
  if (destination) {
    tweetText += ` 📍 ${destination}`;
  }

  const price = trip?.currentPrice ?? trip?.price;
  if (price != null) {
    tweetText += ` | ₹${Number(price).toLocaleString('en-IN')}`;
  }

  const hashtags = _generateHashtags(trip);
  const params = new URLSearchParams({
    text: tweetText,
    url,
    via: 'CommunityOfTrav',
  });
  if (hashtags) {
    params.set('hashtags', hashtags);
  }

  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

// ─── Facebook ────────────────────────────────────────────────

/**
 * Generate a Facebook share URL for a trip.
 *
 * @param {Object} trip
 * @returns {string} facebook sharer URL
 */
export function getFacebookShareURL(trip) {
  const url = _getTripUrl(trip);
  const params = new URLSearchParams({ u: url });
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

// ─── Clipboard ───────────────────────────────────────────────

/**
 * Copy text to the clipboard.
 * Uses the modern Clipboard API with a textarea fallback.
 *
 * @param {string} text
 * @returns {Promise<boolean>} true if copy succeeded
 */
export async function copyToClipboard(text) {
  if (!text) return false;

  // Modern Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('[Share] Clipboard API failed, trying fallback:', err);
    }
  }

  // Fallback: invisible textarea
  return _fallbackCopy(text);
}

// ─── Private Helpers ─────────────────────────────────────────

/**
 * Get the full shareable URL for a trip.
 * @param {Object} trip
 * @returns {string}
 */
function _getTripUrl(trip) {
  if (!trip?.id) return SITE_URL;
  return `${SITE_URL}/#/trip/${trip.id}`;
}

/**
 * Generate short duration string for share text.
 * @param {Object} trip
 * @returns {string}
 */
function _formatDurationShort(trip) {
  const nights = trip.nights;
  const days = trip.days || trip.duration || (nights != null ? nights + 1 : null);
  if (days == null) return '';
  const n = nights ?? (days - 1);
  return `${n}N/${days}D`;
}

/**
 * Generate comma-separated hashtag list for Twitter.
 * @param {Object} trip
 * @returns {string}
 */
function _generateHashtags(trip) {
  const tags = ['CommunityOfTravellers', 'Travel'];

  const dest = trip?.destination || trip?.location || '';
  if (dest) {
    // Convert "Spiti Valley" → "SpitiValley"
    const cleaned = dest.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const tag = cleaned.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    if (tag) tags.push(tag);
  }

  const categories = trip?.categories || trip?.tags || [];
  if (categories.length > 0) {
    const catTag = categories[0]
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .split(/[-\s]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
    if (catTag && !tags.includes(catTag)) tags.push(catTag);
  }

  return tags.slice(0, 5).join(',');
}

/**
 * Fallback clipboard copy using a temporary textarea.
 * @param {string} text
 * @returns {boolean}
 */
function _fallbackCopy(text) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Move off-screen
    textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
    textarea.setAttribute('readonly', '');
    textarea.setAttribute('aria-hidden', 'true');
    document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(0, text.length); // iOS compatibility

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.error('[Share] Fallback copy failed:', err);
    return false;
  }
}
