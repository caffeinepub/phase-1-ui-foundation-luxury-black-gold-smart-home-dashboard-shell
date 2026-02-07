/**
 * Utility functions for managing URL parameters and session state
 */

// Get URL parameter by name
export function getSecretParameter(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Session storage helpers for Rooms page state
export function saveRoomsDisplayCount(count: number): void {
  sessionStorage.setItem('rooms-display-count', count.toString());
}

export function loadRoomsDisplayCount(defaultValue: number = 25): number {
  const stored = sessionStorage.getItem('rooms-display-count');
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
      return parsed;
    }
  }
  return defaultValue;
}

export function saveRoomsShowHidden(showHidden: boolean): void {
  sessionStorage.setItem('rooms-show-hidden', showHidden.toString());
}

export function loadRoomsShowHidden(defaultValue: boolean = false): boolean {
  const stored = sessionStorage.getItem('rooms-show-hidden');
  if (stored) {
    return stored === 'true';
  }
  return defaultValue;
}
