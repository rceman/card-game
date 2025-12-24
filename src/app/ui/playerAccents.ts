export type PlayerSide = 'p1' | 'p2';

export const PLAYER_ACCENTS = {
  p1: {
    badge: 'bg-blue-600',
    button: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-700',
    border: 'border-blue-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.7)]'
  },
  p2: {
    badge: 'bg-amber-500',
    button: 'bg-amber-500',
    buttonHover: 'hover:bg-amber-600',
    border: 'border-amber-500',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.7)]'
  }
} as const;
