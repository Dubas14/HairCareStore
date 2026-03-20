/**
 * Shared design tokens for Payload admin custom views.
 * Use these instead of hardcoding hex colors or magic numbers.
 */

export const COLORS = {
  // Brand
  sea400: '#5bc4c4',
  sea500: '#4a9e9e',
  sea600: '#3d8585',

  // Backgrounds
  bg: '#ffffff',
  bgSubtle: '#f8f9fa',
  bgMuted: '#f1f3f5',
  bgHover: '#f8fffe',

  // Borders
  border: '#e9ecef',
  borderLight: '#f0f0f0',
  borderFocus: '#5bc4c4',

  // Text
  text: '#1a1a2e',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',

  // Status
  statusActive: '#5a9e7a',
  statusActiveBg: '#f0faf4',
  statusDraft: '#f59e0b',
  statusDraftBg: '#fffbeb',
  statusInactive: '#9ca3af',
  statusInactiveBg: '#f3f4f6',
  statusDanger: '#ef4444',
  statusDangerBg: '#fef2f2',

  // Misc
  shadow: 'rgba(0, 0, 0, 0.04)',
  shadowSea: 'rgba(91, 196, 196, 0.08)',
} as const

export const SHADOWS = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.04)',
  md: '0 2px 12px rgba(0, 0, 0, 0.04)',
  lg: '0 8px 30px rgba(91, 196, 196, 0.08)',
  focus: '0 0 0 3px rgba(91, 196, 196, 0.15)',
} as const

export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 16,
  full: 9999,
} as const

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const

export const FONT_SIZES = {
  xs: 11,
  sm: 12,
  md: 13,
  lg: 14,
  xl: 16,
  heading: 22,
} as const

/** Status badge style getter */
export function getStatusStyle(variant: 'active' | 'draft' | 'inactive' | 'danger') {
  const map = {
    active: { color: COLORS.statusActive, bg: COLORS.statusActiveBg, label: '●' },
    draft: { color: COLORS.statusDraft, bg: COLORS.statusDraftBg, label: '●' },
    inactive: { color: COLORS.statusInactive, bg: COLORS.statusInactiveBg, label: '●' },
    danger: { color: COLORS.statusDanger, bg: COLORS.statusDangerBg, label: '●' },
  }
  return map[variant]
}
