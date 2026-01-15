import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if an event is free based on its price
 * Free = null, empty string, "0", "gratuit", "free"
 */
export function isFreeEvent(price: string | null | undefined): boolean {
  if (!price) return true;
  const normalized = price.toLowerCase().trim();
  return normalized === '' || normalized === '0' || normalized === 'gratuit' || normalized === 'free';
}

/**
 * Format price for display
 * @param price - The price string (null = free, numeric string = price in FCFA)
 * @param locale - Current locale for translation
 * @returns Formatted price string
 */
export function formatPrice(price: string | null | undefined, locale: string = 'fr'): string {
  if (isFreeEvent(price)) {
    return locale === 'en' ? 'Free' : locale === 'wo' ? 'Fegul' : 'Gratuit';
  }

  // Try to parse as number and format
  const numericPrice = parseInt(price || '0', 10);
  if (!isNaN(numericPrice) && numericPrice > 0) {
    // Format with thousand separators
    const formatted = numericPrice.toLocaleString('fr-FR');
    return `${formatted} FCFA`;
  }

  // Fallback: return as-is (for legacy data like "5000 FCFA")
  return price || '';
}
