# Pack Opening Animation System

## 🎯 Overview

Deterministic, smooth pack opening animation system optimized for low-end devices. Features auto-progression, rarity-specific VFX, and elegant slide-away animations.

---

## 🎬 Animation Flow

### **1. Initial State**
- Stack of 5 cards with depth offset
- Top card faces upward, interactable
- Cards behind stack with translateZ offset (10px each)

### **2. Click → Flip**
```typescript
flipTop() {
  // Flip card to reveal
  // Auto-discard after viewing:
  //  - Common cards: 800ms
  //  - Rare cards (S1+): 1200ms
}
```

### **3. Shine Effect** ✨
```css
.card-revealed::after {
  animation: card-shine 0.6s ease-out;
}
```
- Linear gradient sweep across card (120deg angle)
- 0.3 opacity white shine
- Sweeps left to right in 600ms

### **4. Auto-Discard**
```css
.card-discarding {
  animation: card-discard 700ms cubic-bezier(0.34, 1.2, 0.64, 1);
}
```

**Animation Breakdown:**
- **0-20%**: Lift & tilt preparation
  - `translateZ(30px)` - moves toward viewer
  - `translateX(-10px)` - slight left shift
  - `translateY(-20px)` - lifts up
  - `rotateZ(-2deg)` - tilts slightly
  - `brightness(1.1)` - flash
  
- **20-100%**: Slide away
  - `translateZ(120px)` - forward in space
  - `translateX(-80px)` - slides left
  - `translateY(-180px)` - floats up
  - `rotateZ(-25deg)` - rotates dramatically
  - `rotateY(30deg)` - 3D flip
  - `scale(0.5)` - shrinks
  - `blur(4px)` - motion blur
  - `opacity: 0` - fades out

### **5. Next Card Promotion**
```css
.card-promoting {
  animation: card-promote 450ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

**Animation Breakdown:**
- **0%**: Behind position
  - `translateZ(10px)` 
  - `translateY(-6px)`
  - `scale(0.95)`
  - `brightness(0.9)`

- **60%**: Overshoot bounce
  - `translateZ(-5px)` - moves past front
  - `translateY(3px)` - slight dip
  - `scale(1.02)` - scales up
  - `brightness(1.05)` - flash

- **100%**: Settle
  - `translateZ(0px)` - perfect position
  - `scale(1)` - normal size
  - `brightness(1)` - normal

---

## ✨ Rarity-Specific VFX

### **Common (D1-D5)**
- Standard flip + shine
- 800ms view time
- Clean slide-away

### **Rare (S1-S2)** 🌟
- **8 particle burst** (cyan `#66ccff`)
- **Blue background glow** (pulsing)
- **Golden drop shadow** (24px blur)
- **1200ms view time** (extra appreciation)

### **Mythic (S3-S4)** ⚡
- **12 particle burst** (magenta `#ff66ff`)
- **Magenta background glow** (pulsing)
- **Enhanced drop shadow**
- **1200ms view time**

### **Crown Rare** 👑
- **12 particle burst** (gold `#ffd700`)
- **Golden background glow** (pulsing, 0.5 opacity)
- **Maximum drop shadow**
- **1200ms view time**

---

## 💫 Particle System

### **Configuration**
```typescript
const particleCount = cardRarity >= 8 ? 12 : 8
const color = cardRarity === 10 ? '#ffd700' :  // Gold
             cardRarity >= 8 ? '#ff66ff' :    // Magenta
             '#66ccff'                         // Cyan
```

### **Animation**
```css
@keyframes particle-burst {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0px) scale(1);
    opacity: 1;
  }
  50% {
    opacity: 1;  /* Hold visibility */
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) 
               translateY(calc(var(--distance) * -1)) scale(0.3);
    opacity: 0;
  }
}
```

**Properties:**
- **Angle**: Evenly distributed 360° (e.g., 8 particles = 45° each)
- **Distance**: Random 100-150px
- **Duration**: 1.2s
- **Stagger**: 0.05s per particle
- **Visual**: 8px circle with glow (`box-shadow: 0 0 8px currentColor`)

---

## 🌟 Background Glow System

### **Glow Layer**
```css
.stage-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}

.glow-radial {
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(60px);
  animation: pulse-glow 3s ease-in-out infinite;
}
```

### **Pulsing Animation**
```css
@keyframes pulse-glow {
  0%, 100% { 
    opacity: 0.25;
    transform: translate(-50%, -50%) scale(1);
  }
  50% { 
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1.1);
  }
}
```

**Effect:**
- Breathes in/out (scale 1.0 → 1.1 → 1.0)
- Pulses brightness (0.25 → 0.4 → 0.25)
- 3s cycle
- Smooth ease-in-out

---

## 🎯 Performance Optimization

### **GPU Acceleration**
All transforms use GPU-accelerated properties:
- ✅ `transform` (translateX, translateY, translateZ, scale, rotate)
- ✅ `opacity`
- ✅ `filter` (blur, brightness)

**No layout thrashing:**
- ❌ No `width`, `height`, `top`, `left` animations
- ❌ No `margin`, `padding` changes
- ❌ No DOM manipulation during animation

### **RequestAnimationFrame**
Micro physics for smooth camera settle (unused in click mode, kept for future):
```typescript
useEffect(()=>{
  const step = ()=>{
    rafRef.current = requestAnimationFrame(step)
    // Spring physics for sx, sy → srx, sry
  }
  rafRef.current = requestAnimationFrame(step)
  return ()=>{ if(rafRef.current) cancelAnimationFrame(rafRef.current) }
}, [sx, sy])
```

### **Clipping Optimization**
```css
.stage-canvas {
  overflow: hidden;
  isolation: isolate;
  border-radius: 16px;
}
```
- `overflow: hidden` - clips particles, prevents repaints outside bounds
- `isolation: isolate` - creates stacking context, prevents z-index bleed
- All effects contained within rounded container

### **Low-End Device Considerations**
1. **CSS transitions** instead of JS animation loops
2. **Hardware-accelerated transforms** only
3. **Minimal repaints** via containment
4. **Deterministic timing** (no random delays)
5. **No heavy libraries** (pure CSS + React)

---

## ⚡ Timing Configuration

| Event | Duration | Easing |
|-------|----------|--------|
| **Shine sweep** | 600ms | ease-out |
| **Card discard** | 700ms | cubic-bezier(0.34, 1.2, 0.64, 1) |
| **Card promote** | 450ms | cubic-bezier(0.34, 1.56, 0.64, 1) |
| **Particle burst** | 1200ms | ease-out |
| **Glow pulse** | 3000ms | ease-in-out (loop) |
| **Common view** | 800ms | - |
| **Rare view** | 1200ms | - |

**Total cycle time:**
- Common: ~800ms (view) + 700ms (discard) + 450ms (promote) = **~2s**
- Rare: ~1200ms (view) + 700ms (discard) + 450ms (promote) = **~2.4s**

---

## 🎨 Visual Effects Breakdown

### **Shine Effect** ✨
```css
linear-gradient(
  120deg,
  transparent 0%,
  transparent 40%,
  rgba(255, 255, 255, 0.3) 50%,  /* Peak shine */
  transparent 60%,
  transparent 100%
)
```
- Diagonal sweep (120deg)
- 20% visible range (40-60%)
- 30% white opacity at peak
- Translates across card (X: -100% → 100%)

### **Drop Shadow** (Rare Cards)
```css
filter: drop-shadow(0 0 24px rgba(255, 200, 100, 0.7));
```
- Warm golden glow
- 24px blur radius
- 70% opacity
- Only on revealed rare cards

### **Motion Blur** (Discard)
```css
filter: brightness(0.7) blur(4px);
```
- Simulates speed
- Subtle 4px blur
- Dims to 70% brightness
- Applied at end of discard

---

## ♿ Accessibility

### **Reduced Motion**
```css
@media (prefers-reduced-motion: reduce) {
  .card-discarding {
    animation: card-discard-reduced 400ms ease forwards !important;
  }
  @keyframes card-discard-reduced {
    to { opacity: 0; }  /* Fade only, no movement */
  }
  
  .card-promoting {
    animation: none !important;  /* Instant */
  }
  
  .glow-radial {
    animation: none;
    opacity: 0.2;  /* Static dim glow */
  }
  
  .particle {
    display: none;  /* No particles */
  }
}
```

**Behavior:**
- ✅ Discard becomes simple fade (no 3D movement)
- ✅ No promotion animation (instant swap)
- ✅ Static background glow (no pulse)
- ✅ No particle effects
- ✅ Shine effect disabled (via `animation: none`)

---

## 📱 Responsive Adjustments

```css
@media (max-width: 640px) {
  .stage-panel {
    max-width: calc(100vw - 32px);
    padding: 16px 20px;
    min-height: 480px;
  }
  
  .card-stack-inner {
    width: 200px;
    height: 280px;
  }
  
  .card-scale {
    transform: scale(1.2);  /* Smaller scale */
  }
}
```

**Mobile:**
- Smaller cards (200x280 vs 240x336)
- Reduced scale (1.2x vs 1.35x)
- Tighter container padding
- Maintains aspect ratio

---

## 🔧 Technical Implementation

### **React State Management**
```typescript
const [flipped, setFlipped] = useState<boolean[]>(cards.map(()=>false))
const [removed, setRemoved] = useState<boolean[]>(cards.map(()=>false))
const [discarding, setDiscarding] = useState<number | null>(null)
const [promoteIndex, setPromoteIndex] = useState<number | null>(null)
```

**Flow:**
1. Click → `flipTop()` → `flipped[i] = true` → Shine plays
2. Auto-delay → `discardTop()` → `discarding = i` → Slide plays
3. Timeout → `removed[i] = true` → `promoteIndex = nextIdx`
4. Timeout → `promoteIndex = null` → Next card ready

### **CSS Class Application**
```tsx
className={`card-stack-item
  ${isDiscarding ? 'card-discarding' : ''} 
  ${promoteIndex===i ? 'card-promoting' : ''}
  ${flipped[i] && isTop ? 'card-revealed' : ''}
`}
```

**Deterministic:**
- State-driven (no random timing)
- Single source of truth
- No race conditions
- Predictable frame timing

---

## ✅ Key Features

✅ **Deterministic** - same timing every time  
✅ **Smooth** - 60fps on low-end devices  
✅ **No flickering** - GPU-accelerated only  
✅ **Auto-progression** - hands-free experience  
✅ **Rarity VFX** - particles, glows, shadows  
✅ **Shine effect** - premium reveal feel  
✅ **Elegant slide** - 3D rotation + motion blur  
✅ **Contained** - clipped within stage panel  
✅ **Accessible** - reduced motion support  
✅ **Responsive** - mobile optimized  

**A polished, professional pack opening experience!** 🎴✨
