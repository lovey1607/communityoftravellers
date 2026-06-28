// ============================================================
// Community of Travellers — Formatting Utilities
// Price, date, duration, number, and display helpers
// ============================================================

// ─── Price Formatting ────────────────────────────────────────

/**
 * Format a price amount with currency symbol.
 * Defaults to Indian Rupee (INR) with Indian grouping: ₹1,23,456
 *
 * @param {number} amount   – numeric amount
 * @param {string} currency – ISO 4217 currency code (default 'INR')
 * @returns {string} formatted price, e.g. '₹12,999'
 */
export function formatPrice(amount, currency = 'INR') {
  if (amount == null || isNaN(amount)) return '—';

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback for unsupported currencies
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', THB: '฿' };
    const sym = symbols[currency] || currency + ' ';
    return `${sym}${Number(amount).toLocaleString('en-IN')}`;
  }
}

// ─── Date Formatting ─────────────────────────────────────────

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Parse a date string or Date object safely.
 * @param {string|Date} input
 * @returns {Date|null}
 */
function _parseDate(input) {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format a date as 'Jul 15, 2026'.
 *
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  const d = _parseDate(dateStr);
  if (!d) return '—';
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Format a date range intelligently.
 * - Same month & year  → 'Jul 15 – 19, 2026'
 * - Same year           → 'Jul 15 – Aug 2, 2026'
 * - Different years     → 'Dec 28, 2026 – Jan 3, 2027'
 *
 * @param {string|Date} start
 * @param {string|Date} end
 * @returns {string}
 */
export function formatDateRange(start, end) {
  const s = _parseDate(start);
  const e = _parseDate(end);
  if (!s) return '—';
  if (!e) return formatDate(s);

  const sMonth = MONTH_SHORT[s.getMonth()];
  const eMonth = MONTH_SHORT[e.getMonth()];
  const sDay = s.getDate();
  const eDay = e.getDate();
  const sYear = s.getFullYear();
  const eYear = e.getFullYear();

  if (sYear === eYear && s.getMonth() === e.getMonth()) {
    return `${sMonth} ${sDay} – ${eDay}, ${sYear}`;
  }
  if (sYear === eYear) {
    return `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${sYear}`;
  }
  return `${sMonth} ${sDay}, ${sYear} – ${eMonth} ${eDay}, ${eYear}`;
}

// ─── Duration Formatting ─────────────────────────────────────

/**
 * Format trip duration as '4N / 5D'.
 *
 * @param {number} nights
 * @param {number} [days] – if omitted, calculated as nights + 1
 * @returns {string}
 */
export function formatDuration(nights, days) {
  if (nights == null && days == null) return '—';
  const n = nights ?? (days != null ? days - 1 : 0);
  const d = days ?? (nights != null ? nights + 1 : 0);
  return `${n}N / ${d}D`;
}

// ─── Relative Time ───────────────────────────────────────────

/**
 * Format a date as relative time string.
 * Examples: 'Just now', '5 minutes ago', '2 hours ago', '3 days ago',
 *           '2 weeks ago', '1 month ago', 'Jul 15, 2025'
 *
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatRelativeTime(dateStr) {
  const d = _parseDate(dateStr);
  if (!d) return '—';

  const now = Date.now();
  const diffMs = now - d.getTime();

  // Future dates
  if (diffMs < 0) {
    const absDiff = Math.abs(diffMs);
    const days = Math.floor(absDiff / 86_400_000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `In ${days} days`;
    if (days < 30) return `In ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}`;
    return formatDate(d);
  }

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 30) return 'Just now';
  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (weeks === 1) return '1 week ago';
  if (weeks < 5) return `${weeks} weeks ago`;
  if (months === 1) return '1 month ago';
  if (months < 12) return `${months} months ago`;

  // Older than ~12 months: show full date
  return formatDate(d);
}

// ─── Number Formatting (Indian System) ──────────────────────

/**
 * Format a number using the Indian short-form system.
 * - 999       → '999'
 * - 1,200     → '1.2K'
 * - 15,000    → '15K'
 * - 1,50,000  → '1.5L'
 * - 10,00,000 → '10L'
 * - 1,00,00,000 → '1Cr'
 *
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (num == null || isNaN(num)) return '—';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1_00_00_000) {
    const val = absNum / 1_00_00_000;
    return `${sign}${_trimDecimal(val)}Cr`;
  }
  if (absNum >= 1_00_000) {
    const val = absNum / 1_00_000;
    return `${sign}${_trimDecimal(val)}L`;
  }
  if (absNum >= 1_000) {
    const val = absNum / 1_000;
    return `${sign}${_trimDecimal(val)}K`;
  }

  return `${sign}${absNum}`;
}

/**
 * Trim a decimal to at most 1 decimal place, dropping trailing '.0'.
 * @param {number} val
 * @returns {string}
 */
function _trimDecimal(val) {
  const fixed = val.toFixed(1);
  return fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed;
}

// ─── Slug Generation ─────────────────────────────────────────

/**
 * Generate a URL-safe slug from text.
 * 'Spiti Valley Road Trip!' → 'spiti-valley-road-trip'
 *
 * @param {string} text
 * @returns {string}
 */
export function generateSlug(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')                     // decompose accents
    .replace(/[\u0300-\u036f]/g, '')      // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')         // remove non-alphanumeric
    .replace(/[\s_]+/g, '-')              // spaces / underscores → hyphens
    .replace(/-+/g, '-')                  // collapse multiple hyphens
    .replace(/^-|-$/g, '');               // trim leading/trailing hyphens
}

// ─── Text Truncation ─────────────────────────────────────────

/**
 * Truncate text at a word boundary with '…' suffix.
 *
 * @param {string} text
 * @param {number} maxLength – max character count (default 120)
 * @returns {string}
 */
export function truncateText(text, maxLength = 120) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;

  // Cut at last space before maxLength
  const trimmed = text.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  const cutPoint = lastSpace > maxLength * 0.6 ? lastSpace : maxLength;

  return trimmed.slice(0, cutPoint).trimEnd() + '…';
}

// ─── Star Rating ─────────────────────────────────────────────

/**
 * Convert a numeric rating (0–5) into an array of star types
 * for rendering star icons.
 *
 * @param {number} rating – value between 0 and 5
 * @param {number} [totalStars=5] – total number of stars
 * @returns {Array<'full'|'half'|'empty'>}
 *
 * @example
 * getStarArray(3.7) → ['full','full','full','half','empty']
 */
export function getStarArray(rating, totalStars = 5) {
  if (rating == null || isNaN(rating)) return Array(totalStars).fill('empty');

  const clamped = Math.max(0, Math.min(rating, totalStars));
  const stars = [];

  for (let i = 1; i <= totalStars; i++) {
    if (clamped >= i) {
      stars.push('full');
    } else if (clamped >= i - 0.5) {
      stars.push('half');
    } else {
      stars.push('empty');
    }
  }

  return stars;
}

// ─── Discount Calculation ────────────────────────────────────

/**
 * Calculate discount percentage.
 *
 * @param {number} original – original price
 * @param {number} current  – current / discounted price
 * @returns {number} discount percentage (0-100), rounded to nearest integer
 */
export function calculateDiscount(original, current) {
  if (!original || !current || original <= 0 || current <= 0) return 0;
  if (current >= original) return 0;
  return Math.round(((original - current) / original) * 100);
}

// ─── Seat Availability ──────────────────────────────────────

/**
 * Compute seat availability status.
 *
 * @param {number} booked – seats already booked / filled
 * @param {number} total  – total seat capacity
 * @returns {{ available: number, percentage: number, urgency: 'high'|'medium'|'low', text: string }}
 */
export function getSeatsStatus(booked, total) {
  if (total == null || total <= 0) {
    return { available: 0, percentage: 0, urgency: 'low', text: 'Contact for availability' };
  }

  const filled = Math.max(0, booked ?? 0);
  const available = Math.max(0, total - filled);
  const percentage = Math.round((filled / total) * 100);

  let urgency = 'low';
  let text = '';

  if (available === 0) {
    urgency = 'high';
    text = 'Sold out';
  } else if (available <= 2) {
    urgency = 'high';
    text = `Only ${available} seat${available > 1 ? 's' : ''} left!`;
  } else if (percentage >= 75) {
    urgency = 'high';
    text = `Only ${available} seats left — filling fast!`;
  } else if (percentage >= 50) {
    urgency = 'medium';
    text = `${available} seats available`;
  } else {
    urgency = 'low';
    text = `${available} seats available`;
  }

  return { available, percentage, urgency, text };
}
