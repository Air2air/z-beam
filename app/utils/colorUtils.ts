/**
 * Color utility functions for interpolation and manipulation
 */

/**
 * Smooth easing function (ease-in-out cubic)
 * Creates smoother transitions between colors
 */
function smoothStep(t: number): number {
  // Clamp to 0-1
  t = Math.max(0, Math.min(1, t));
  // Smooth cubic ease-in-out
  return t * t * (3 - 2 * t);
}

/**
 * Convert hex to HSL
 */
function hexToHsl(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return [h, s, l];
}

/**
 * Convert HSL to hex
 */
function hslToHex(h: number, s: number, l: number): string {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Interpolate between two hex colors with smooth easing
 * Uses HSL color space for more perceptually uniform transitions
 * @param color1 - First hex color (e.g., "#FF0000")
 * @param color2 - Second hex color (e.g., "#00FF00")
 * @param factor - Interpolation factor (0 to 1)
 * @param useSmoothing - Apply smooth easing (default: true)
 * @returns Interpolated hex color
 */
export function interpolateColor(
  color1: string, 
  color2: string, 
  factor: number,
  useSmoothing: boolean = true
): string {
  // Apply smooth easing
  const t = useSmoothing ? smoothStep(factor) : factor;
  
  // Convert to HSL for perceptually smoother interpolation
  const [h1, s1, l1] = hexToHsl(color1);
  const [h2, s2, l2] = hexToHsl(color2);
  
  // Handle hue interpolation (shortest path around color wheel)
  let hDiff = h2 - h1;
  if (hDiff > 0.5) hDiff -= 1;
  if (hDiff < -0.5) hDiff += 1;
  
  const h = (h1 + hDiff * t + 1) % 1;
  const s = s1 + (s2 - s1) * t;
  const l = l1 + (l2 - l1) * t;
  
  return hslToHex(h, s, l);
}

/**
 * Darken a hex color by a percentage
 * @param hex - Hex color (e.g., "#FF0000")
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened hex color
 */
export function darkenColor(hex: string, percent: number = 30): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 0 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}
