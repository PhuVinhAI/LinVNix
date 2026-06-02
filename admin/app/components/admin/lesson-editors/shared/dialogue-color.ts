/**
 * Sinh màu HSL ổn định cho mỗi character trong hội thoại.
 * Cùng một seed (character id) sẽ luôn cho cùng một màu nền + foreground.
 */

const PALETTE: Array<{ bgClass: string; textClass: string; borderClass: string; chipClass: string; ringClass: string; hoverBgClass: string; focusBgClass: string }> = [
  {
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-500/30',
    chipClass: 'bg-blue-500 text-white',
    ringClass: 'focus:ring-blue-500/40',
    hoverBgClass: 'hover:bg-blue-500/15',
    focusBgClass: 'focus:bg-blue-500/10',
  },
  {
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-500/30',
    chipClass: 'bg-emerald-500 text-white',
    ringClass: 'focus:ring-emerald-500/40',
    hoverBgClass: 'hover:bg-emerald-500/15',
    focusBgClass: 'focus:bg-emerald-500/10',
  },
  {
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-500/30',
    chipClass: 'bg-amber-500 text-white',
    ringClass: 'focus:ring-amber-500/40',
    hoverBgClass: 'hover:bg-amber-500/15',
    focusBgClass: 'focus:bg-amber-500/10',
  },
  {
    bgClass: 'bg-violet-500/10',
    textClass: 'text-violet-700 dark:text-violet-300',
    borderClass: 'border-violet-500/30',
    chipClass: 'bg-violet-500 text-white',
    ringClass: 'focus:ring-violet-500/40',
    hoverBgClass: 'hover:bg-violet-500/15',
    focusBgClass: 'focus:bg-violet-500/10',
  },
  {
    bgClass: 'bg-pink-500/10',
    textClass: 'text-pink-700 dark:text-pink-300',
    borderClass: 'border-pink-500/30',
    chipClass: 'bg-pink-500 text-white',
    ringClass: 'focus:ring-pink-500/40',
    hoverBgClass: 'hover:bg-pink-500/15',
    focusBgClass: 'focus:bg-pink-500/10',
  },
  {
    bgClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-700 dark:text-cyan-300',
    borderClass: 'border-cyan-500/30',
    chipClass: 'bg-cyan-500 text-white',
    ringClass: 'focus:ring-cyan-500/40',
    hoverBgClass: 'hover:bg-cyan-500/15',
    focusBgClass: 'focus:bg-cyan-500/10',
  },
  {
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-700 dark:text-orange-300',
    borderClass: 'border-orange-500/30',
    chipClass: 'bg-orange-500 text-white',
    ringClass: 'focus:ring-orange-500/40',
    hoverBgClass: 'hover:bg-orange-500/15',
    focusBgClass: 'focus:bg-orange-500/10',
  },
  {
    bgClass: 'bg-lime-500/10',
    textClass: 'text-lime-700 dark:text-lime-300',
    borderClass: 'border-lime-500/30',
    chipClass: 'bg-lime-500 text-white',
    ringClass: 'focus:ring-lime-500/40',
    hoverBgClass: 'hover:bg-lime-500/15',
    focusBgClass: 'focus:bg-lime-500/10',
  },
]

export type DialogueColor = (typeof PALETTE)[number]

function hash(seed: string): number {
  let h = 5381
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h + seed.charCodeAt(i)) >>> 0
  }
  return h
}

export function colorForCharacter(seed: string): DialogueColor {
  return PALETTE[hash(seed) % PALETTE.length]
}

export function initialFor(name: string): string {
  const trimmed = name.trim()
  return (trimmed[0] || '?').toUpperCase()
}
