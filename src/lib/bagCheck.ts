import { readJson, writeItem } from './storage';

export const BAG_CHECK_KEY = 'bag-check';

export interface BagCheck {
  // Den poslední kontroly ve tvaru RRRR-MM-DD.
  lastChecked: string;
}

export function isBagCheck(value: unknown): value is BagCheck {
  if (typeof value !== 'object' || value === null) return false;
  const { lastChecked } = value as Partial<BagCheck>;
  return typeof lastChecked === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(lastChecked) && !Number.isNaN(Date.parse(lastChecked));
}

export function loadBagCheck(): BagCheck | null {
  const stored = readJson(BAG_CHECK_KEY);
  return isBagCheck(stored) ? stored : null;
}

export function saveBagCheck(now = new Date()): BagCheck | null {
  const pad = (part: number) => String(part).padStart(2, '0');
  const check = { lastChecked: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` };
  return writeItem(BAG_CHECK_KEY, JSON.stringify(check)) ? check : null;
}

// Počítá se v místních kalendářních dnech, aby změna času nebo denní doba nic neposunuly.
export function daysSince(lastChecked: string, now = new Date()): number {
  const [year, month, day] = lastChecked.split('-').map(Number);
  const then = Date.UTC(year, month - 1, day);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - then) / 86400000);
}

export function formatCheckAge(days: number): string {
  if (days <= 0) return 'dnes';
  if (days === 1) return 'včera';
  return `před ${days} dny`;
}

export function formatCheckDate(lastChecked: string): string {
  const [year, month, day] = lastChecked.split('-').map(Number);
  return `${day}. ${month}. ${year}`;
}
