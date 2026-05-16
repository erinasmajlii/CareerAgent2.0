// ─── Light Theme ─────────────────────────────────────────────────────────────
export const LIGHT = {
  primary:       '#6C63FF',
  primaryLight:  '#EEEDFF',
  primaryDark:   '#5349CC',
  accent:        '#A78BFA',
  bg:            '#F5F4FF',
  surface:       '#FFFFFF',
  surfaceHigh:   '#F0EEFF',
  surfaceGlass:  'rgba(255,255,255,0.7)',
  text:          '#1E1B4B',
  subtext:       '#6B7280',
  border:        '#E4E2FF',
  inputBg:       '#F9F8FF',
  success:       '#059669',
  successLight:  '#ECFDF5',
  warning:       '#D97706',
  warningLight:  '#FFFBEB',
  danger:        '#DC2626',
  dangerLight:   '#FEF2F2',
  card:          '#FFFFFF',
  tabBar:        'rgba(255,255,255,0.92)',
  tabBorder:     'rgba(108,99,255,0.12)',
  neonGlow:      'rgba(108,99,255,0.35)',
};

// ─── Dark Theme — "Cyber-Lounge" ──────────────────────────────────────────────
export const DARK = {
  primary:       '#8B7FFF',
  primaryLight:  '#1E1B3A',
  primaryDark:   '#6C63FF',
  accent:        '#C4B5FD',
  bg:            '#080810',       // deep charcoal
  surface:       '#10101E',       // slightly lighter charcoal
  surfaceHigh:   '#18182E',
  surfaceGlass:  'rgba(255,255,255,0.04)',  // glassmorphism
  text:          '#F0EEFF',
  subtext:       '#9CA3AF',
  border:        'rgba(139,127,255,0.25)',  // violet glow border
  inputBg:       '#18182E',
  success:       '#10B981',
  successLight:  '#0A2018',
  warning:       '#F59E0B',
  warningLight:  '#1E1500',
  danger:        '#EF4444',
  dangerLight:   '#1E0505',
  card:          '#10101E',
  tabBar:        'rgba(8,8,16,0.92)',
  tabBorder:     'rgba(139,127,255,0.2)',
  neonGlow:      'rgba(139,127,255,0.5)',
};

// ─── Gradients ────────────────────────────────────────────────────────────────
export const LIGHT_GRAD  = ['#6C63FF', '#A78BFA'];
export const DARK_GRAD   = ['#6C63FF', '#8B7FFF'];
export const NEON_GRAD   = ['#7C3AED', '#8B7FFF', '#6C63FF'];

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const shadow = {
  shadowColor: '#6C63FF',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 14,
  elevation: 6,
};

export const shadowSm = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 2,
};

export const neonShadow = {
  shadowColor: '#8B7FFF',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.7,
  shadowRadius: 12,
  elevation: 8,
};

// ─── Legacy exports ───────────────────────────────────────────────────────────
export const C    = LIGHT;
export const GRAD = LIGHT_GRAD;
