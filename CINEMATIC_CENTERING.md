# Cinematic Spotlight Centering

## 🎬 The Fix

The card opening UI is now **perfectly centered in the viewport** with a cinematic vignette effect, creating a dramatic spotlight presentation.

---

## ✨ What Changed

### **Before** ❌
```tsx
<div className="fixed inset-0 flex items-center justify-center" 
     style={{ paddingTop: '60px', paddingBottom: '60px' }}>
```
- Positioned too high on screen
- Simple gradient background
- No visual focus point
- Felt cramped under header

### **After** ✅
```tsx
<div className="fixed inset-0" style={{ paddingTop: '60px' }}>
  <div className="absolute inset-0 bg-black">
    <div className="absolute inset-0 bg-gradient-radial 
                    from-transparent via-black/40 to-black"/>
  </div>
  
  <div className="relative h-full flex items-center justify-center">
    {/* Card container */}
  </div>
</div>
```

**Improvements:**
- ✅ **True vertical centering** - uses full viewport height
- ✅ **Cinematic vignette** - radial gradient spotlight
- ✅ **Visual hierarchy** - clear focus on center
- ✅ **Professional feel** - theater-mode presentation

---

## 🎨 The Spotlight Effect

### **Vignette Gradient**
```css
.bg-gradient-radial {
  background-image: radial-gradient(circle at center, var(--tw-gradient-stops));
}
```

**Applied as:**
```tsx
<div className="bg-gradient-radial from-transparent via-black/40 to-black"/>
```

**Visual Effect:**
- **Center**: Fully transparent (spotlight)
- **Middle**: 40% black (gentle fade)
- **Edges**: Full black (vignette darkness)

This creates a **natural spotlight** that draws the eye to the center where the cards appear.

---

## 📐 Layout Structure

```
Fixed Viewport (minus 60px header)
└── Black Background Layer
    ├── Vignette Overlay (radial gradient)
    └── Centered Flex Container (100% height)
        └── Card Container (centered vertically & horizontally)
            └── Rounded Box
                ├── Rarity Glows
                ├── Card Stack
                └── Instructions
```

### **Vertical Centering**
```tsx
<div className="relative h-full flex items-center justify-center">
```
- Takes full remaining viewport height
- Uses flexbox for perfect centering
- `items-center` = vertical centering
- `justify-center` = horizontal centering

---

## 🎯 Visual Impact

### **Before Layout**
```
[Header - 60px]
[Card Container] ← Too high!
[Empty space]
[Empty space]
[Empty space]
```

### **After Layout**
```
[Header - 60px]
[Empty space]
  [Card Container] ← Perfectly centered!
[Empty space]
```

---

## 💡 Why This Works

### **1. Psychological Sweet Spot**
The center of the viewport is where users naturally focus. Placing the cards here creates maximum impact.

### **2. Cinematic Framing**
The vignette effect mimics how movies present important moments - darkening the edges to focus attention.

### **3. Breathing Room**
Equal space above and below gives the UI room to "breathe" and feels premium.

### **4. Professional Polish**
Theater-mode presentation makes the experience feel like a curated show, not just functional UI.

---

## 🎭 Cinematic Elements

### **Vignette**
- Darkens screen edges
- Creates natural spotlight
- Focuses attention on center
- Reduces visual noise

### **Full-Height Centering**
- Uses entire viewport
- Perfect balance above/below
- Not cramped under header
- Room for animations

### **Rounded Container**
- Clear visual boundaries
- Premium card game aesthetic
- Shadow for depth
- Gradient for richness

---

## ✅ Result

The pack opening UI now has a **true cinematic presentation**:

✅ **Perfectly centered** - vertical sweet spot  
✅ **Vignette spotlight** - dramatic focus  
✅ **Breathing room** - balanced spacing  
✅ **Theater mode** - immersive experience  
✅ **Professional polish** - premium feel  

**Opening packs now feels like being in a spotlight at a live card reveal show!** 🎬✨

---

## 🔧 Technical Notes

**CSS Lint Warnings:**
The `@tailwind` warnings are expected - these are Tailwind CSS directives that get processed during build time, not runtime errors.

**Height Calculation:**
The container uses `h-full` which equals `calc(100vh - 60px)` due to the `paddingTop: '60px'` on the parent.

**Z-Index Layering:**
1. Background (black) - z-index: auto
2. Vignette overlay - z-index: auto
3. Card container - z-index: 10
4. Cards within - z-index: 1000-stackPos
