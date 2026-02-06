/**
 * Validates if a string is a valid 6-digit hex color (e.g., #RRGGBB)
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Converts a hex color to RGB values with fallback
 * @param hexColor - The hex color string (e.g., #1A2C45)
 * @param fallback - Fallback hex color if input is invalid (default: #1A2C45)
 * @returns Object with r, g, b values (0-255)
 */
export function hexToRgb(hexColor: string, fallback: string = '#1A2C45'): { r: number; g: number; b: number } {
  const color = isValidHexColor(hexColor) ? hexColor : fallback;
  
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  return { r, g, b };
}

/**
 * Clamps a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
