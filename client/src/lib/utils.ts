import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

export function getCategoryIcon(icon: string): string {
  // Map category icons to Lucide React icons
  const iconMap: Record<string, string> = {
    'fas fa-utensils': 'utensils',
    'fas fa-car': 'car',
    'fas fa-shopping-cart': 'shopping-cart',
    'fas fa-gamepad': 'gamepad-2',
    'fas fa-bolt': 'zap',
    'fas fa-heartbeat': 'heart-pulse',
    'fas fa-question': 'help-circle',
  };
  
  return iconMap[icon] || 'help-circle';
}

export function getCategoryColor(color: string): string {
  // Map category colors to Tailwind classes
  const colorMap: Record<string, string> = {
    'red': 'text-red-500 bg-red-500/10',
    'blue': 'text-blue-500 bg-blue-500/10',
    'green': 'text-green-500 bg-green-500/10',
    'purple': 'text-purple-500 bg-purple-500/10',
    'yellow': 'text-yellow-500 bg-yellow-500/10',
    'pink': 'text-pink-500 bg-pink-500/10',
    'gray': 'text-gray-500 bg-gray-500/10',
  };
  
  return colorMap[color] || 'text-gray-500 bg-gray-500/10';
}
