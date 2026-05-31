import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUSD(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function getHealthColor(score: number) {
  if (score <= 25) return 'var(--health-critical)';
  if (score <= 50) return 'var(--health-danger)';
  if (score <= 70) return 'var(--health-warning)';
  return 'var(--health-safe)';
}

export function getHealthStatusLabel(score: number) {
  if (score <= 25) return 'CRITICAL';
  if (score <= 50) return 'DANGER';
  if (score <= 70) return 'WARNING';
  return 'SAFE';
}
