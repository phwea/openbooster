# Stage Panel Refactor - Complete Rebuild

## 🎯 Summary

Complete refactor of pack opening UI from full-viewport layout to **centered stage panel** with all visuals and effects contained within clipping boundaries. No more full-width bands or global overlays.

---

## 📋 Changes Made

### **Component Structure** (`PackView.tsx`)

#### **Before** ❌
```tsx
<div className="fixed inset-0">
  <div className="absolute inset-0 bg-black">
    <div className="bg-gradient-radial"/> {/* Full-width vignette */}
  </div>
  <div className="relative h-full flex items-center justify-center">
    <div className="max-w-2xl">
      {/* Card container */}
    </div>
  </div>
</div>
```

#### **After** ✅
```tsx
<section id="open-stage">
  <div className="stage-panel">
    <div className="stage-header">{/* Set info */}</div>
    <div className="stage-canvas">
      {/* All visuals contained here */}
      <div className="stage-glow">{/* Rarity glows */}</div>
      <div className="card-stack-3d">{/* 3D cards */}</div>
    </div>
    <div className="stage-cta">{/* Instructions */}</div>
  </div>
</section>
```

---

## 🏗️ Layout Structure

### **Semantic Hierarchy**

```
#open-stage (z-index: 0)
└── .stage-panel (z-index: 1) - max-width: 840px, centered
    ├── .stage-header - pack info, card count
    ├── .stage-canvas (z-index: 2) - clipping boundary
    │   ├── .stage-glow (z-index: 3) - rarity background glows
    │   ├── .card-stack-3d (z-index: 4) - 3D card display
    │   │   └── .card-stack-inner
    │   │       └── .card-stack-item (z-index: 1000-n)
    │   │           ├── .particle-container (z-index: 5)
    │   │           └── .card-scale
    │   └── [Future: scanlines, film grain, etc.]
    └── .stage-cta - instructions, buttons
```

---

## 🎨 CSS Implementation

### **Stage Panel** (centered container)

```css
.stage-panel {
  max-width: 840px;
  min-height: 520px;
  margin-inline: auto;
  margin-top: clamp(24px, 6vh, 64px);
  padding: 20px 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  z-index: 1;
}
```

**Key Properties:**
- ✅ `max-width: 840px` - never exceeds viewport
- ✅ `margin-inline: auto` - horizontal centering
- ✅ `clamp(24px, 6vh, 64px)` - responsive top spacing
- ✅ `backdrop-filter: blur(8px)` - glassmorphism
- ✅ `border-radius: 24px` - smooth rounded corners

### **Stage Canvas** (clipping boundary)

```css
.stage-canvas {
  position: relative;
  min-height: 400px;
  border-radius: 16px;
  overflow: hidden;        /* Clips all children */
  isolation: isolate;      /* Establishes stacking context */
  z-index: 2;
}
```

**Purpose:**
- ✅ `overflow: hidden` - clips particles, glows, effects
- ✅ `isolation: isolate` - prevents z-index bleed
- ✅ `border-radius: 16px` - inner rounded corners
- ✅ All visual effects are **children** of this node

### **Glow Layer** (contained backgrounds)

```css
.stage-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}

.glow-radial {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 600px;
  height: 600px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  filter: blur(60px);
  animation: pulse-glow 3s ease-in-out infinite;
}
```

**Key Changes:**
- ❌ **Before**: Full-viewport vignette (`position: fixed`)
- ✅ **After**: Contained within `.stage-canvas` (`position: absolute; inset: 0`)
- ✅ Clips at canvas boundaries
- ✅ Pulsing animation preserved

---

## 📐 Z-Index Hierarchy

| Layer | Z-Index | Purpose |
|-------|---------|---------|
| `#open-stage` | 0 | Black background |
| `.stage-panel` | 1 | Container panel |
| `.stage-canvas` | 2 | Clipping boundary |
| `.stage-glow` | 3 | Rarity backgrounds |
| `.card-stack-3d` | 4 | Card display area |
| `.particle-container` | 5 | Particle effects |
| `.card-stack-item` | 1000-n | Individual cards |

**No overlapping contexts** - each layer has clear purpose and scope.

---

## 🚫 Removed Full-Width Elements

### **1. Vignette Background** ❌ REMOVED
```tsx
// OLD: Full-viewport vignette
<div className="absolute inset-0 bg-gradient-radial from-transparent via-black/40 to-black"/>
```

**Reason:** Created full-width overlay outside stage panel boundaries.

**Replacement:** Simple black background on `#open-stage`.

### **2. Centered Flex Container** ❌ REMOVED
```tsx
// OLD: Extra wrapper for centering
<div className="relative h-full flex items-center justify-center">
```

**Reason:** Not needed with proper `margin-inline: auto` on `.stage-panel`.

**Replacement:** Direct stage panel centering with CSS.

### **3. Nested Wrapper Divs** ❌ REMOVED
```tsx
// OLD: Multiple nested divs
<div className="relative z-10 w-full max-w-2xl mx-4">
  <div className="bg-gradient-to-b ...">
    <div className="flex flex-col ...">
```

**Reason:** Over-nested structure; confusing z-index management.

**Replacement:** Flat semantic structure (header, canvas, cta).

---

## ✅ Clipping Implementation

### **Particle Container**
```css
.particle-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;  /* Allows burst but clipped by .stage-canvas */
  z-index: 5;
}
```

**How It Works:**
1. Particles use `overflow: visible` to animate outward
2. Parent `.stage-canvas` has `overflow: hidden`
3. Particles are clipped at canvas boundary
4. **No particles escape** the stage panel

### **Card Stack Containment**
```css
.card-stack-3d {
  position: relative;
  perspective: 1600px;
  transform-style: preserve-3d;
  min-height: 400px;
  z-index: 4;
}
```

**3D transforms stay contained:**
- Cards animate in Z-space (`translateZ`)
- But X/Y bounds respect `.stage-canvas` clipping
- Discard animations float upward **within bounds**

---

## 📱 Responsive Design

```css
@media (max-width: 640px) {
  .stage-panel {
    max-width: calc(100vw - 32px);  /* 16px margin each side */
    margin-top: 16px;
    padding: 16px 20px;
    min-height: 480px;
  }
  
  .card-stack-inner {
    width: 200px;  /* Smaller cards */
    height: 280px;
  }
  
  .card-scale {
    transform: scale(1.2);  /* Reduced scale */
  }
}
```

**Mobile Adjustments:**
- ✅ Panel never exceeds viewport width
- ✅ Smaller card dimensions
- ✅ Reduced scale factor
- ✅ Tighter spacing

---

## ♿ Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  .card-discarding {
    animation: card-discard-reduced 400ms ease forwards !important;
  }
  @keyframes card-discard-reduced {
    to { opacity: 0; }  /* Simple fade only */
  }
  
  .card-promoting {
    animation: none !important;
  }
  
  .glow-radial {
    animation: none;
    opacity: 0.2;  /* Static dim glow */
  }
  
  .particle {
    display: none;  /* No particle burst */
  }
}
```

**Reduced Motion:**
- ✅ Discard = fade only (no 3D movement)
- ✅ No promotion animation
- ✅ Static glow (no pulse)
- ✅ No particles
- ✅ **Layout unchanged** - only motion disabled

---

## 🔍 Acceptance Criteria

### ✅ **No Full-Width Elements**
```bash
# DevTools check
document.querySelectorAll('#open-stage [style*="100vw"]')
# Returns: NodeList []

document.querySelectorAll('#open-stage .absolute.inset-0')
# Returns: Only children of .stage-canvas, .stage-panel
```

### ✅ **Responsive Centering**
- Tested 320px - 1600px
- Panel stays centered at all breakpoints
- No horizontal scroll

### ✅ **Clipping Boundaries**
- Particles don't escape canvas
- Glows contained within bounds
- Card animations stay in stage

### ✅ **Z-Index Integrity**
- No overlapping stacking contexts
- Clear hierarchy: 0 → 1 → 2 → 3 → 4 → 5
- Tooltips/skip button use z-index: 10

---

## 📝 Migration Notes

### **Removed Components**
1. **Vignette overlay** - replaced with simple black background
2. **Full-height flex wrapper** - replaced with CSS centering
3. **Nested gradient divs** - replaced with semantic structure

### **Relocated Elements**
1. **Rarity glows** - moved from fixed overlay to `.stage-canvas` child
2. **Particle effects** - repositioned as absolute within canvas
3. **Instructions** - moved to `.stage-cta` semantic section

### **New Semantic Structure**
- `.stage-header` - pack metadata
- `.stage-canvas` - visual display area
- `.stage-cta` - call-to-action / instructions

---

## 🎯 Result

A **professional, contained stage panel** with:

✅ **Centered max-width container** (840px)  
✅ **All effects clipped** within `.stage-canvas`  
✅ **Clear z-index hierarchy** (0-5, 10)  
✅ **No full-viewport overlays**  
✅ **Glassmorphism backdrop**  
✅ **Responsive mobile support**  
✅ **Reduced motion compliance**  
✅ **Semantic HTML structure**  

**Professional card game stage presentation with zero layout regressions!** 🎴✨

---

## 🔧 Technical Notes

**CSS Linter Warnings:**
The `@tailwind` and `@apply` warnings are expected - these are Tailwind CSS directives processed at build time.

**Transform Conflicts:**
Card animations use `!important` on keyframes to override inline transform styles from 3D positioning logic.

**Isolation:**
`.stage-canvas` uses `isolation: isolate` to create a new stacking context, preventing z-index bleed from parent contexts.
