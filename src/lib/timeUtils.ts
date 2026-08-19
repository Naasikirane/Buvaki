/**
 * Real timestamp parsing, formatting, and live dynamic relative time calculation.
 */

export function parseTimestampToDate(value: any): Date {
  if (!value) return new Date();

  // If already a Date object
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? new Date() : value;
  }

  // If Firestore Timestamp object with toDate()
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    try {
      return value.toDate();
    } catch {
      // fallback
    }
  }

  // If Firestore timestamp { seconds, nanoseconds } or { _seconds, _nanoseconds }
  if (typeof value === 'object') {
    const sec = value.seconds ?? value._seconds;
    if (typeof sec === 'number') {
      return new Date(sec * 1000);
    }
  }

  // If numeric milliseconds timestamp or numeric string
  if (typeof value === 'number') {
    return new Date(value);
  }

  if (typeof value === 'string') {
    // If it's a numeric string like "1787099933000"
    if (/^\d{10,13}$/.test(value)) {
      const num = parseInt(value, 10);
      return new Date(value.length === 10 ? num * 1000 : num);
    }

    // Try parsing as ISO / Date string
    const parsed = Date.parse(value);
    if (!isNaN(parsed)) {
      return new Date(parsed);
    }

    // Legacy relative string handling (e.g., "2 hours ago", "4 hours ago", "Yesterday", "Just now")
    const now = Date.now();
    const lower = value.toLowerCase().trim();
    if (lower === 'just now') return new Date(now);
    if (lower.includes('min') || lower.includes('minute')) {
      const match = lower.match(/\d+/);
      const mins = match ? parseInt(match[0], 10) : 5;
      return new Date(now - mins * 60 * 1000);
    }
    if (lower.includes('hour') || lower.includes('hr')) {
      const match = lower.match(/\d+/);
      const hrs = match ? parseInt(match[0], 10) : 1;
      return new Date(now - hrs * 3600 * 1000);
    }
    if (lower.includes('day') || lower.includes('yesterday')) {
      const match = lower.match(/\d+/);
      const days = lower.includes('yesterday') ? 1 : (match ? parseInt(match[0], 10) : 1);
      return new Date(now - days * 86400 * 1000);
    }
    if (lower.includes('week')) {
      const match = lower.match(/\d+/);
      const weeks = match ? parseInt(match[0], 10) : 1;
      return new Date(now - weeks * 7 * 86400 * 1000);
    }
  }

  return new Date();
}

/**
 * Returns an accurate relative real time label (e.g. "Just now", "2m ago", "1h ago", "Yesterday at 4:15 PM", "Aug 18, 2026")
 */
export function formatRealTimestamp(value: any): string {
  const date = parseTimestampToDate(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // If slightly in future or less than 15 seconds ago
  if (diffMs < 15000) {
    return 'Just now';
  }

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) {
    return `${diffSec}s ago`;
  }

  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays === 1) {
    const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `Yesterday at ${timeStr}`;
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  // Same year: e.g. "Aug 18 at 4:38 PM"
  const isSameYear = date.getFullYear() === now.getFullYear();
  if (isSameYear) {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  // Different year: e.g. "Aug 18, 2025"
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Formats full exact date and time for tooltips, titles, and detailed modal timestamps.
 * Example: "Tuesday, August 18, 2026 at 4:38:53 PM GMT-7"
 */
export function formatFullExactDateTime(value: any): string {
  const date = parseTimestampToDate(value);
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

/**
 * Returns numeric epoch milliseconds for precise date sorting
 */
export function getTimestampEpoch(value: any): number {
  return parseTimestampToDate(value).getTime();
}
