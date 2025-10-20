// Premium SVG rarity icons - clean, minimal, scalable
import type { Rarity } from '@/lib/types'

type IconProps = { className?: string; size?: number }

// D1 - Common: Bold circle (clear foundation)
export function CommonIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

// D2 - Uncommon: Bold hexagon (clear structure)
export function UncommonIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M8 2L12.5 5V11L8 14L3.5 11V5L8 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  )
}

// D3 - Rare: Bold diamond (classic gem)
export function RareIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M8 2L13 8L8 14L3 8L8 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  )
}

// D4 - Double Rare: Filled diamond (premium solid)
export function DoubleRareIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M8 2L13 8L8 14L3 8L8 2Z" fill="currentColor" fillOpacity="0.25"/>
      <path d="M8 2L13 8L8 14L3 8L8 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  )
}

// D5 - Elite Rare: Diamond with sparkle (shining gem)
export function EliteRareIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M8 2L13 8L8 14L3 8L8 2Z" fill="currentColor" fillOpacity="0.25"/>
      <path d="M8 2L13 8L8 14L3 8L8 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      {/* Sparkle */}
      <line x1="8" y1="1" x2="8" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="15" x2="8" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="8" x2="4" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// S1 - Illustration Rare: One Star (Pokemon TCG style)
export function IllustrationRareIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" fill="currentColor" fillOpacity="0.3"/>
      <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  )
}

// S2 - Special Illustration: Two Stars (Pokemon TCG style)
export function SpecialIllustrationIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      {/* Left star */}
      <path d="M5 2L6 5L9 6L6 7L5 10L4 7L1 6L4 5L5 2Z" fill="currentColor" fillOpacity="0.3"/>
      <path d="M5 2L6 5L9 6L6 7L5 10L4 7L1 6L4 5L5 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      {/* Right star */}
      <path d="M11 6L12 9L15 10L12 11L11 14L10 11L7 10L10 9L11 6Z" fill="currentColor" fillOpacity="0.3"/>
      <path d="M11 6L12 9L15 10L12 11L11 14L10 11L7 10L10 9L11 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  )
}

// S3 - Mythic/EX: Three Stars in Triangle Formation
export function MythicIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      {/* Top star */}
      <path d="M8 1L9 4L12 5L9 6L8 9L7 6L4 5L7 4L8 1Z" fill="currentColor" fillOpacity="0.3"/>
      <path d="M8 1L9 4L12 5L9 6L8 9L7 6L4 5L7 4L8 1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      {/* Bottom left star */}
      <path d="M4 9L5 11.5L7.5 12.5L5 13.5L4 16L3 13.5L0.5 12.5L3 11.5L4 9Z" fill="currentColor" fillOpacity="0.3"/>
      <path d="M4 9L5 11.5L7.5 12.5L5 13.5L4 16L3 13.5L0.5 12.5L3 11.5L4 9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      {/* Bottom right star */}
      <path d="M12 9L13 11.5L15.5 12.5L13 13.5L12 16L11 13.5L8.5 12.5L11 11.5L12 9Z" fill="currentColor" fillOpacity="0.3"/>
      <path d="M12 9L13 11.5L15.5 12.5L13 13.5L12 16L11 13.5L8.5 12.5L11 11.5L12 9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  )
}

// S4 - Hyper Rare: Big Star with Gradient (nonchalant)
export function HyperRareIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <defs>
        <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.6"/>
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6"/>
        </linearGradient>
      </defs>
      {/* Big star with gradient fill */}
      <path d="M8 1L10 6L15 8L10 10L8 15L6 10L1 8L6 6L8 1Z" fill="url(#starGradient)"/>
      <path d="M8 1L10 6L15 8L10 10L8 15L6 10L1 8L6 6L8 1Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  )
}

// CROWN - Crown Rare: Royal crown (ultimate rarity)
export function CrownIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      {/* Crown shape */}
      <path d="M2 11L3 5L5.5 7.5L8 3L10.5 7.5L13 5L14 11H2Z" fill="currentColor" fillOpacity="0.3"/>
      <path d="M2 11L3 5L5.5 7.5L8 3L10.5 7.5L13 5L14 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Crown base */}
      <rect x="2" y="11" width="12" height="2.5" rx="0.5" fill="currentColor" fillOpacity="0.4"/>
      <rect x="2" y="11" width="12" height="2.5" rx="0.5" stroke="currentColor" strokeWidth="2"/>
      {/* Jewels */}
      <circle cx="5.5" cy="7.5" r="1" fill="currentColor"/>
      <circle cx="8" cy="3" r="1" fill="currentColor"/>
      <circle cx="10.5" cy="7.5" r="1" fill="currentColor"/>
    </svg>
  )
}

// Utility function to get icon by rarity
export function getRarityIcon(rarity: Rarity, props?: IconProps) {
  switch(rarity) {
    case 'D1': return <CommonIcon {...props} />
    case 'D2': return <UncommonIcon {...props} />
    case 'D3': return <RareIcon {...props} />
    case 'D4': return <DoubleRareIcon {...props} />
    case 'D5': return <EliteRareIcon {...props} />
    case 'S1': return <IllustrationRareIcon {...props} />
    case 'S2': return <SpecialIllustrationIcon {...props} />
    case 'S3': return <MythicIcon {...props} />
    case 'S4': return <HyperRareIcon {...props} />
    case 'CROWN': return <CrownIcon {...props} />
    default: return <CommonIcon {...props} />
  }
}
