import { CoinType } from '@/types';
import { VIP_TIERS } from '@/lib/constants';

/**
 * Merge class names conditionally (simplified clsx/cn)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format a number as currency with coin symbol
 */
export function formatCurrency(amount: number, coin: CoinType = 'BTC', maxDecimals?: number): string {
  const decimals = maxDecimals ?? getCoinDecimals(coin);
  const formatted = amount.toFixed(decimals);
  // Remove trailing zeros after decimal
  const trimmed = formatted.replace(/\.?0+$/, '') || '0';
  return `${trimmed} ${coin}`;
}

/**
 * Format large numbers with abbreviations (1K, 1M, 1B)
 */
export function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(decimals).replace(/\.?0+$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(decimals).replace(/\.?0+$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(decimals).replace(/\.?0+$/, '') + 'K';
  }
  return num.toFixed(decimals).replace(/\.?0+$/, '');
}

/**
 * Format a number with commas
 */
export function formatWithCommas(num: number, decimals: number = 2): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Shorten a blockchain address
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Get relative time string
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  return `${Math.floor(months / 12)}y ago`;
}

/**
 * Generate a deterministic avatar URL using DiceBear
 */
export function generateAvatar(seed: string): string {
  return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0f1923`;
}

/**
 * Get VIP tier info by level
 */
export function getVIPTier(level: number) {
  return VIP_TIERS[Math.min(level, VIP_TIERS.length - 1)] || VIP_TIERS[0];
}

/**
 * Get VIP tier name
 */
export function getVIPName(level: number): string {
  return getVIPTier(level).name;
}

/**
 * Get VIP badge color class
 */
export function getVIPBadgeClass(level: number): string {
  if (level >= 10) return 'badge-diamond';
  if (level >= 7) return 'badge-gold';
  if (level >= 4) return 'badge-silver';
  if (level >= 1) return 'badge-bronze';
  return '';
}

/**
 * Get coin decimal places
 */
function getCoinDecimals(coin: CoinType): number {
  const decimals: Record<string, number> = {
    BTC: 8,
    ETH: 6,
    USDT: 2,
    USDC: 2,
    BNB: 4,
    SOL: 4,
    DOGE: 2,
    TRX: 2,
    LTC: 6,
    XRP: 4,
    ADA: 4,
    MATIC: 4,
  };
  return decimals[coin] ?? 8;
}

/**
 * Calculate profit from bet amount and multiplier
 */
export function calculateProfit(betAmount: number, multiplier: number): number {
  return betAmount * multiplier - betAmount;
}

/**
 * Calculate win chance from multiplier (with house edge)
 */
export function calculateWinChance(multiplier: number, houseEdge: number = 1): number {
  return ((100 - houseEdge) / multiplier);
}

/**
 * Generate a random client seed
 */
export function generateClientSeed(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(16);
  if (typeof window !== 'undefined') {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  for (let i = 0; i < 16; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate random hex color
 */
export function randomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Check if running on server
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}
