import type { DepartmentTheme } from './types';

/**
 * Per-department themes. Each department gets a distinct accent palette, a
 * default background effect, and a default layout template — so Engineering does
 * not look like Science does not look like Ops. Screens may override per-field.
 */
export const THEMES: Record<string, DepartmentTheme> = {
  'Ops — Command': { accent: 'amber', secondary: 'butterscotch', effect: 'starfield', layout: 'grid' },
  Engineering: { accent: 'amber', secondary: 'peach', effect: 'energy', layout: 'feature' },
  Environmental: { accent: 'iceBlue', secondary: 'butterscotch', effect: 'none', layout: 'console' },
  Tactical: { accent: 'peach', secondary: 'red', effect: 'tactical', layout: 'feature' },
  Science: { accent: 'lavender', secondary: 'iceBlue', effect: 'nebula', layout: 'grid' },
  'Conflict & Coexistence': { accent: 'amber', secondary: 'red', effect: 'none', layout: 'console' },
};

export const DEFAULT_THEME: DepartmentTheme = {
  accent: 'amber',
  secondary: 'butterscotch',
  effect: 'none',
  layout: 'grid',
};

export const themeFor = (family: string): DepartmentTheme => THEMES[family] ?? DEFAULT_THEME;
