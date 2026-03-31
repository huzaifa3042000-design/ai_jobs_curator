import crypto from 'crypto';

export function hashObject(obj) {
  return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16);
}

export function timeAgo(date) {
  if (!date) return 'Unknown';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function parseMoneyValue(money) {
  if (!money) return null;
  if (typeof money === 'number') return money;
  if (money.rawValue) return parseFloat(money.rawValue);
  if (typeof money === 'string') return parseFloat(money.replace(/[^0-9.-]/g, ''));
  return null;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
