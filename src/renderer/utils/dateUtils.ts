/**
 * Converts an ISO timestamp string to a relative time string (e.g., "1h ago", "30m ago")
 * @param timestamp - ISO timestamp string (e.g., "2025-11-16T20:50:09+00:00")
 * @returns Relative time string (e.g., "1h ago", "30m ago", "2d ago")
 */
export const formatRelativeTime = (timestamp: string): string => {
  if (!timestamp) return '';

  try {
    const now = new Date();
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return timestamp; // Return original if invalid
    }

    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Handle future dates
    if (diffMs < 0) {
      return 'just now';
    }

    // Less than a minute
    if (diffSeconds < 60) {
      return 'just now';
    }

    // Less than an hour
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }

    // Less than a day
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    // Less than a week
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    // Less than a month
    if (diffWeeks < 4) {
      return `${diffWeeks}w ago`;
    }

    // Less than a year
    if (diffMonths < 12) {
      return `${diffMonths}mo ago`;
    }

    // More than a year
    return `${diffYears}y ago`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return timestamp; // Return original on error
  }
};

