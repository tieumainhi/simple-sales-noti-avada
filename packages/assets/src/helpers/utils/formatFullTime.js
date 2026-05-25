const fullMonthList = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export function formatBothDateTime(datetime = new Date(), timeZone = '') {
  return formatDateOnly(datetime, timeZone) + ' ' + formatTimeOnly(datetime, timeZone);
}

export function formatDateOnly(datetime = new Date(), timeZone = '') {
  let result = new Date(datetime);
  if (timeZone !== '') {
    result = new Date(result.toLocaleString('en-US', { timeZone }));
  }
  return fullMonthList[result.getMonth()] + ' ' + result.getDate() + ', ' + result.getFullYear();
}

export function formatDateRaw(datetime = new Date(), timeZone = '') {
  let result = new Date(datetime);
  if (timeZone !== '') {
    result = new Date(result.toLocaleString('en-US', { timeZone }));
  }
  return [
    result.getFullYear(),
    zeroSuffix(result.getMonth() + 1),
    zeroSuffix(result.getDate())
  ].join('/');
}

export function formatTimeOnly(datetime = new Date(), timeZone = '') {
  let result = new Date(datetime);
  if (timeZone !== '') {
    result = new Date(result.toLocaleString('en-US', { timeZone }));
  }
  return [zeroSuffix(result.getHours()), zeroSuffix(result.getMinutes())].join(':');
}

function zeroSuffix(str) {
  return ('0' + str).slice(-2);
}

/**
 * @param {Date|string|Object} timestamp
 * @returns {Date|null}
 */
export function toDate(timestamp) {
  if (!timestamp) return null;
  if (timestamp._seconds) return new Date(timestamp._seconds * 1000);

  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * @param {Date|string|Object} timestamp
 * @returns {string}
 */
export function formatNotificationDate(timestamp) {
  const date = toDate(timestamp);
  return date ? `From ${formatDateOnly(date)}` : '';
}

/**
 * @param {Date|string|Object} timestamp
 * @returns {string}
 */
export function formatTimeAgo(timestamp) {
  const date = toDate(timestamp);
  if (!date) return 'a day ago';

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return 'just now';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function formatRelativeDate(value) {
  const date = parseDate(value);
  if (!date) return '';

  const diffSeconds = Math.max(Math.floor((Date.now() - date.getTime()) / 1000), 0);
  const units = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];

  for (const unit of units) {
    const amount = Math.floor(diffSeconds / unit.seconds);
    if (amount >= 1) {
      return `${amount} ${unit.label}${amount > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  if (typeof value === 'object') {
    const seconds = value.seconds || value._seconds;
    if (seconds) return new Date(seconds * 1000);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
