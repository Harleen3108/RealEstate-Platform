export const formatINR = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '₹0';
  const num = Number(value);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  return `₹${num.toLocaleString('en-IN')}`;
};

export const titleCase = (str = '') =>
  String(str)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop';

export const resolveImage = (url, backendUrl = '') => {
  if (!url) return FALLBACK_IMAGE;
  if (url.startsWith('http')) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && url.includes('localhost:5000')) {
      return url.replace('http://localhost:5000', backendUrl);
    }
    return url;
  }
  return `${backendUrl}${url}`;
};

export { FALLBACK_IMAGE };
