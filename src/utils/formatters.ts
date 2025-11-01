/**
 * Format currency in Philippine Peso
 */
export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date to local string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}
