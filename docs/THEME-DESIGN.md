# Theme & Design System

## Color System

### Financial Colors (Custom oklch)

| Name | CSS Variable | Light Mode | Dark Mode | Usage |
|------|-------------|------------|-----------|-------|
| Gain (Profit) | `text-gain` | `oklch(0.7 0.15 145)` | Same | Positive price changes, profits |
| Loss | `text-loss` | `oklch(0.6 0.2 25)` | Same | Negative price changes, losses |
| Gain Background | `bg-gain` | `oklch(0.7 0.15 145)` | Same | Gain badges |
| Loss Background | `bg-loss` | `oklch(0.6 0.2 25)` | Same | Loss badges |
| Gain Soft | `bg-gain-soft` | `oklch(0.7 0.15 145 / 0.15)` | Same | Subtle gain backgrounds |
| Loss Soft | `bg-loss-soft` | `oklch(0.6 0.2 25 / 0.15)` | Same | Subtle loss backgrounds |

**Flutter mapping:**
```dart
// lib/app/theme.dart
class AppColors {
  static const gain = Color(0xFF26A69A);     // oklch(0.7 0.15 145) ≈ #26a69a
  static const loss = Color(0xFFEF5350);     // oklch(0.6 0.2 25) ≈ #ef5350
  static const gainSoft = Color(0x2626A69A); // 15% alpha
  static const lossSoft = Color(0x26EF5350); // 15% alpha
}
```

### Risk Level Colors

| Risk | Background | Border | Text |
|------|-----------|--------|------|
| High (Cao) | `bg-destructive/10` | `border-destructive/20` | `text-destructive` |
| Medium (Vừa) | `bg-amber-500/10` | `border-amber-500/20` | `text-amber-600` |
| Low (Thấp) | `bg-emerald-500/10` | `border-emerald-500/20` | `text-emerald-600` |

### Alert Card Border Colors
- High risk: `border-l-destructive` (left border, 4px)
- Medium risk: `border-l-amber-500`
- Low risk: `border-l-emerald-500`

### Category Badge Colors
| Category | Color |
|----------|-------|
| Vĩ mô (macro) | Purple / violet |
| Vi mô (micro) | Blue |
| Chứng khoán (stock) | Emerald / green |
| Crypto | Orange |
| Vàng (gold) | Yellow / amber |

### News Importance
- Important: Red dot indicator (filled circle before title)

### Online Status Colors
| Status | Color |
|--------|-------|
| Online | Green (emerald) |
| Away | Amber |
| Offline | Gray (muted) |

### Avatar Colors (8 presets for experts)
A set of 8 distinct colors used as backgrounds for expert avatar initials.

---

## Typography

### Font Family
- **Default**: System font stack (Inter on web)
- **Numbers/Financial**: Tabular nums (monospace-aligned digits)

### Size Scale
| Element | Mobile | Desktop |
|---------|--------|---------|
| Page title (h1) | text-xl (20px) | text-xl (20px) |
| Section title (h2) | text-lg (18px) | text-lg (18px) |
| Card title | text-sm base (14px) | text-base (16px) |
| Body text | text-sm (14px) | text-sm (14px) |
| Small/caption | text-xs (12px) | text-xs (12px) |
| Tiny labels | text-[11px] | text-xs (12px) |
| Large numbers | text-2xl (24px) | text-3xl (30px) |
| Price display | text-base (16px) | text-lg (18px) |

### Font Weight
- Bold: `font-bold` (700) — titles, numbers, prices
- Semibold: `font-semibold` (600) — card titles, labels
- Medium: `font-medium` (500) — values, change indicators
- Normal: `font-normal` (400) — body text

### Text Color Hierarchy
- **Primary**: `text-foreground` — main text
- **Secondary**: `text-muted-foreground` — labels, subtitles
- **Tertiary**: `text-foreground/80` — descriptions
- **Disabled**: `text-muted-foreground/50`

---

## Spacing & Layout

### Base Unit
- Border radius base: `0.625rem` (10px)

### Padding Scale
| Context | Mobile | Desktop |
|---------|--------|---------|
| Page padding | px-3 | px-6 (md+) |
| Card padding | p-3 | p-4 (sm+) |
| Card gap | gap-3 | gap-6 (md+) |
| Section gap | space-y-5 | space-y-8 (md+) |
| Header height | h-12 (48px) | h-14 (sm+, 56px) |
| Bottom nav height | 80px | — |
| Bottom nav safe area | safe-area-inset-bottom | — |

### Touch Targets
- Minimum: `min-h-[44px]` (44px) for all interactive elements
- Bottom nav items: 44px
- Tab triggers: `min-h-[44px]`

### Card Styles
```css
/* Standard card */
rounded-lg border bg-card p-3 sm:p-4

/* Card with left border (alerts) */
rounded-lg border border-l-4 bg-card p-3 sm:p-4

/* Hover effect */
hover:bg-muted/50 cursor-pointer transition-colors

/* Press effect (mobile) */
active:scale-[0.98] transition-transform
```

---

## Light/Dark Mode

### Theme Implementation
Uses `next-themes` (web). Flutter equivalent: `ThemeMode.system/light/dark`.

### Light Theme
- Background: White
- Foreground: Dark navy `oklch(0.145 0 0)`
- Card: White with subtle border
- Muted: Light gray
- Primary: Vibrant color (adapted per platform)

### Dark Theme
- Background: Dark navy `oklch(0.13 0.005 260)`
- Foreground: Light `oklch(0.985 0 0)`
- Card: Dark elevated surface
- Muted: Dark gray with slight blue tint
- Primary: Light/bright variant

### Chart Theme Colors

| Element | Dark | Light |
|---------|------|-------|
| Background | `#131722` | `#ffffff` |
| Grid | `rgba(42, 46, 57, 0.5)` | `rgba(197, 203, 206, 0.5)` |
| Text | `#d1d4dc` | `#333333` |
| Gain candle | `#26a69a` | `#26a69a` |
| Loss candle | `#ef5350` | `#ef5350` |
| Gain volume | `rgba(38, 166, 154, 0.3)` | `rgba(38, 166, 154, 0.3)` |
| Loss volume | `rgba(239, 83, 80, 0.3)` | `rgba(239, 83, 80, 0.3)` |
| Crosshair | `#758696` | `#758696` |
| MA20 | `#2962ff` | `#2962ff` |
| MA50 | `#ff6d00` | `#ff6d00` |
| MA100 | `#ff1744` | `#ff1744` |
| Bollinger | `rgba(41, 98, 255, 0.3)` | same |
| RSI overbought line | `rgba(239, 83, 80, 0.3)` | same |
| RSI oversold line | `rgba(38, 166, 154, 0.3)` | same |

---

## Sidebar Theme
Custom sidebar color system with separate variables:
- `--sidebar-background`
- `--sidebar-foreground`
- `--sidebar-primary`
- `--sidebar-accent`
- `--sidebar-border`
- `--sidebar-ring`

---

## Animation Specifications

### Framer Motion → Flutter Animation Map

| Animation | Web (Framer) | Flutter |
|-----------|-------------|---------|
| Fade up | `initial: {opacity:0, y:16}, animate: {opacity:1, y:0}` | `FadeInUp` or custom `SlideTransition` + `FadeTransition` |
| Stagger children | `staggerChildren: 0.1` | `StaggeredAnimationList` |
| List item stagger | `delay: index * 0.03` | Custom `AnimationController` with delay |
| Spring | `type: "spring", stiffness: 300, damping: 30` | `SpringSimulation` |
| Sheet open | `AnimatePresence` with spring | `showModalBottomSheet` with animation |
| Card press | `active:scale-[0.98]` | `ScaleTransition` or `AnimatedScale` |
| Tab indicator | `LayoutGroup` smooth transition | `AnimatedContainer` or `Decoration` |

### Animation Durations
| Type | Duration |
|------|----------|
| Section fade-up | 450ms easeOut |
| List item fade-up | 200ms easeOut |
| Stagger delay | 100ms between sections |
| Tab switch | 150ms |
| Press effect | 100ms |
| Sheet slide | 300ms spring |

---

## Custom CSS Classes (Flutter Equivalents)

| CSS Class | Description | Flutter Equivalent |
|-----------|-------------|-------------------|
| `.custom-scrollbar` | Thin scrollbar (6px), 20% opacity, hover 40% | Custom `ScrollBehavior` or `Scrollbar` |
| `.scrollbar-hide` / `.scrollbar-none` | Hide scrollbar | `ScrollConfiguration(behavior: ScrollConfiguration.of(context).copyWith(scrollbars: false))` |
| `.safe-bottom` | Safe area padding for iOS | `SafeArea(bottom: true)` |
| `.tabular-nums` | Monospace-aligned numbers | `TextStyle(letterSpacing: 0.5)` or monospace font |
| `.no-select` | Prevent text selection | `SelectionArea(disabled: true)` or `TextSelectionDisabled` |
| `.scroll-smooth` | Smooth scrolling | `ScrollController` with `animateTo` |

---

## Responsive Breakpoints

| Breakpoint | Min Width | CSS Prefix | Notes |
|------------|-----------|-----------|-------|
| Mobile | 0px | (default) | Single column, cards, bottom nav |
| Small | 640px | `sm:` | Wider cards, 2-column grids |
| Medium | 768px | `md:` | Tables visible, side-by-side layouts |
| Large | 1024px | `lg:` | Wider tables, more columns |
| Extra Large | 1280px | `xl:` | Sidebar visible, bottom nav hidden |
| 2XL | 1536px | `2xl:` | Max content width |

### Key Responsive Changes
| Feature | Mobile (<640px) | Desktop (≥1280px) |
|---------|-----------------|-------------------|
| Navigation | Bottom nav | Sidebar |
| Market data | Cards (2-col grid) | Table |
| Sheets | Bottom drawer | Right-side sheet |
| OHLC values | Hidden | Shown in header |
| Table columns | Symbol, Name, Price, Change, Chart | All columns including Volume, Market Cap |
| Tab labels | Shortened (Bật, K.Hoạt, L.Sử) | Full labels |
| Alert card padding | p-3 | p-4 |
| Section gap | space-y-5 | space-y-8 |

---

## Icon System

Uses **Lucide** icon library. Common icons used:

| Icon | Usage |
|------|-------|
| `LayoutDashboard` | Home tab |
| `Newspaper` | News tab |
| `Bell`, `BellOff` | Alerts tab, notification |
| `TrendingUp`, `TrendingDown` | Market tab, price changes |
| `MessageCircle` | Chat tab |
| `User` | Profile tab |
| `Search` | Search input |
| `Bookmark` | Watchlist |
| `Zap` | Alert (custom), scanner |
| `BarChart3` | RSI indicator |
| `ShieldAlert` | Default alert icon |
| `ArrowUpDown`, `ArrowUp`, `ArrowDown` | Sort indicators |
| `LineChart` | Chart button |
| `Sun`, `Moon` | Theme toggle |
| `Menu` | Hamburger (mobile sidebar) |
| `X` | Close buttons |
| `ChevronRight` | Navigation arrows |
| `Clock` | Time-related |
| `Star` | Rating |
| `Heart` | Follow/bookmark |
| `Share2` | Share |
| `Copy` | Copy to clipboard |
| `Camera` | Edit avatar |
| `Lock` | Password, security |
| `Mail` | Email |
| `Phone` | Phone number |
| `Check`, `CheckCircle` | Success, verified |
| `AlertCircle`, `AlertTriangle` | Warning, error |
| `RefreshCw` | Refresh/reload |
| `Download` | Download/Export |
| `Settings` | Settings |
| `Globe` | Web/International |
| `Hash` | Tag |
| `Minus`, `Plus` | Remove, add |
| `Crosshair` | Chart crosshair tool |
| `Minus` (horizontal) | Chart horizontal line tool |
| `TrendingUp` (angled) | Chart trendline tool |
| `Layers` | Chart fibonacci tool |
| `Square` | Chart rectangle tool |

**Flutter equivalent**: Use `lucide_icons` package or `Material Icons` / `Cupertino Icons` with mapping.
