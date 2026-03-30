
export const getTimestamp = (dateStr) => {
    if (!dateStr) return 0;
    
    // Handle Date objects
    if (dateStr instanceof Date) {
      const t = dateStr.getTime();
      return isNaN(t) ? 0 : t;
    }
    
    // Handle number (timestamp)
    if (typeof dateStr === 'number') {
      return dateStr;
    }

    const s = String(dateStr).trim();
    if (!s) return 0;

    // 1. ISO strings (e.g., 2025-02-07T10:00:00.000Z) - already UTC
    if (s.includes('T')) {
      const d = new Date(s);
      const t = d.getTime();
      if (!isNaN(t)) return t;
    }

    // 2. MySQL DATETIME strings (e.g., 2025-02-07 10:00:00)
    // We treat these as UTC because that's what our backend stores (via toISOString + replace)
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) {
      const d = new Date(s.replace(' ', 'T') + 'Z');
      const t = d.getTime();
      if (!isNaN(t)) return t;
    }

    // 3. Indian Locale strings from .toLocaleString("en-IN")
    const localeMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if (localeMatch) {
      const dd = parseInt(localeMatch[1], 10);
      const mm = parseInt(localeMatch[2], 10) - 1;
      const yyyy = parseInt(localeMatch[3], 10);
      let hh = parseInt(localeMatch[4], 10);
      const min = parseInt(localeMatch[5], 10);
      const sec = localeMatch[6] ? parseInt(localeMatch[6], 10) : 0;
      const ampm = localeMatch[7].toUpperCase();
      
      if (ampm === 'PM' && hh < 12) hh += 12;
      if (ampm === 'AM' && hh === 12) hh = 0;
      
      // Important: Since this was formatted for IST, new Date(...) will use local time.
      // If the client is also in IST, this is correct for local relative comparisons.
      const d = new Date(yyyy, mm, dd, hh, min, sec);
      const t = d.getTime();
      if (!isNaN(t)) return t;
    }

    // Default fallback
    const d = new Date(s);
    const t = d.getTime();
    return isNaN(t) ? 0 : t;
};

export const formatDuration = (ms) => {
    if (ms <= 0) return "0s";
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
};
