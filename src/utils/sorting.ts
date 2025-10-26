/**
 * Sort items alphabetically by name (case-insensitive)
 */
export function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => 
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
  );
}

/**
 * Sort groups by numeric value in name, then alphabetically
 */
export function sortGroups<T extends { name: string }>(groups: T[]): T[] {
  return [...groups].sort((a, b) => {
    const numA = parseInt(a.name.match(/\d+/)?.[0] || '0', 10);
    const numB = parseInt(b.name.match(/\d+/)?.[0] || '0', 10);
    
    if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
      return numB - numA; // Descending numeric order
    }
    
    return b.name.localeCompare(a.name, 'en', { sensitivity: 'base' });
  });
}

/**
 * Sort travels by date (oldest first), then alphabetically
 */
export function sortTravels<T extends { name: string }>(travels: T[]): T[] {
  return [...travels].sort((a, b) => {
    const dateA = new Date(a.name);
    const dateB = new Date(b.name);

    const isValidDateA = !isNaN(dateA.getTime());
    const isValidDateB = !isNaN(dateB.getTime());

    // Both are valid dates → sort by date (oldest → newest)
    if (isValidDateA && isValidDateB) {
      return dateA.getTime() - dateB.getTime();
    }

    // Only one is valid → dates come first
    if (isValidDateA && !isValidDateB) return -1;
    if (!isValidDateA && isValidDateB) return 1;

    // Neither are valid → sort alphabetically
    return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
  });
}
