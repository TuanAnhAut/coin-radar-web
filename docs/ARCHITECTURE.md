# Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Flutter App)                    │
├─────────────────────────────────────────────────────────┤
│  Screens        │  Widgets       │  State (Riverpod)   │
│  (Pages/Views)   │  (Components)  │  (Providers)         │
├─────────────────────────────────────────────────────────┤
│              Navigation (GoRouter + AuthGuard)            │
├─────────────────────────────────────────────────────────┤
│                  Services Layer (Dio HTTP)                │
├─────────────────────────────────────────────────────────┤
│  Local Storage  │  WebSocket/Socket.io  │  Push Notif    │
└─────────────────────────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  REST API   │
                    │  (Backend)  │
                    └─────────────┘
```

## Core Patterns

### 1. Single-Page Application (SPA) with View Switching

The app is NOT a multi-page traditional app. It uses **view switching** within a single shell:

```
App Shell (always visible)
├── Header (fixed top)
├── Sidebar (desktop xl+)
├── Content Area (view switching)
│   ├── home → HomeDashboard
│   ├── news → NewsPage
│   ├── market → MarketOverview
│   ├── alerts → AlertHub
│   ├── chat → ExpertDirectory / ChatRoom
│   └── profile → ProfileDashboard
├── Chart Detail (full-screen overlay when active)
└── Bottom Nav (mobile/tablet)
```

**Flutter equivalent**: Use a `PageView` or `IndexedStack` with a `NavigationBar` for tab switching. GoRouter is used only for deep linking.

### 2. Overlay/Sheet System

Instead of opening new screens, most interactions use **overlays** (bottom sheets, side sheets, dialogs):

```
Overlays (rendered ON TOP of current view):
├── Search (fullscreen overlay)
├── Notifications (drawer/sheet)
├── Asset Detail (drawer/sheet)
├── News Detail (drawer/sheet)
├── Alert Builder (fullscreen dialog, 3-step wizard)
├── Alert Templates (drawer/sheet)
├── Alert Detail (drawer/sheet)
├── Watchlist (drawer/sheet)
├── Risk Scanner (drawer/sheet)
├── Expert Profile (drawer/sheet)
├── Portfolio (drawer/sheet)
├── Edit Profile (bottom sheet 85vh)
├── Notification Settings (bottom sheet)
├── Display Settings (bottom sheet)
├── Security Settings (bottom sheet)
├── Subscription (bottom sheet)
├── 2FA Setup (bottom sheet)
├── Change Password (bottom sheet)
└── Auth Gate (fullscreen overlay, z-100)
```

**Flutter equivalent**: Use `showModalBottomSheet()`, `showDialog()`, `showGeneralDialog()` for fullscreen overlays.

### 3. Responsive Pattern

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Bottom nav, card layout, drawer sheets |
| Tablet | 640-1279px | Bottom nav, mixed card/table, drawer sheets |
| Desktop | ≥ 1280px (xl) | Sidebar nav, table layout, right-side sheets |

**Key responsive rules:**
- Bottom nav: visible below xl, hidden at xl+
- Sidebar: visible at xl+, hidden below xl
- Market data: Cards on mobile, Table on desktop (md+)
- Sheets: Drawer (bottom) on mobile, Sheet (right side) on desktop
- Auth gate: Always fullscreen overlay

### 4. Authentication Flow

```
Guest State:
├── Can view: home, news, market, chart-detail (PUBLIC)
├── Cannot view: alerts, chat, profile (PROTECTED)
├── Cannot open: watchlist, notification-center, portfolio, alert-builder,
│                alert-detail, alert-templates, expert-profile,
│                notification-settings, security-settings, subscription,
│                edit-profile, two-factor, change-password (PROTECTED OVERLAYS)
└── When accessing protected → Shows AuthGate overlay

Authenticated State:
├── Can view all pages
├── Can open all overlays
├── Header shows avatar + profile button
└── Logout → returns to home (guest state)
```

**Auth Gate Flow:**
```
Protected action requested
→ If guest: open AuthGate (fullscreen overlay)
  → Login / Register / Forgot Password / Verify OTP
  → On success: close AuthGate, navigate to pending view
  → On close (X button): return to previous public view
→ If authenticated: proceed normally
```

### 5. State Management (Zustand → Flutter)

Current Zustand store categories and their Flutter Riverpod equivalents:

```dart
// 1. Auth State
@riverpod
class Auth extends _$Auth {
  bool isAuthenticated = false;
  User? user;
  bool authGateOpen = false;
  ViewType? pendingView;
  // ...
}

// 2. Navigation State
@riverpod
class Navigation extends _$Navigation {
  ViewType currentView = ViewType.home;
  OverlayType? activeOverlay;
  Map<String, dynamic>? overlayData;
  // ...
}

// 3. UI State (sidebar, search, notifications)
@riverpod
class UIState extends _$UIState {
  bool sidebarCollapsed = false;
  bool mobileSidebarOpen = false;
  bool searchOpen = false;
  String searchQuery = '';
  bool notificationsOpen = false;
  int unreadCount = 3;
  // ...
}

// 4. Chat State
@riverpod
class Chat extends _$Chat {
  String? activeExpertId;
  // ...
}

// 5. Chart Detail State
@riverpod
class ChartDetail extends _$ChartDetail {
  String? symbol;
  String? assetName;
  String? assetType;
  // ...
}
```

### 6. Data Fetching Pattern

```
Component mounts
→ useEffect (on mount / dependency change)
→ fetch(`/api/endpoint?params`)
→ parse JSON response
→ setState / setProvider
→ Render UI with data

Loading state: Show skeleton/spinner
Error state: Show error with retry
Empty state: Show empty message with CTA
```

**Flutter equivalent:**
```dart
@riverpod
Future<List<Asset>> assets(AssetsRef ref, AssetType type) async {
  final response = await ref.read(apiClientProvider).get('/assets?type=$type');
  return Asset.fromJsonList(response.data['data']);
}

// Usage in widget:
final assetsAsync = ref.watch(assetsProvider(type));
assetsAsync.when(
  data: (assets) => AssetsList(assets: assets),
  loading: () => const LoadingSkeleton(),
  error: (err, _) => ErrorWidget(error: err),
);
```

### 7. Animation Pattern

The web app uses Framer Motion extensively:
- **Staggered children**: Sections fade up with 0.1s delay between each
- **List items**: Fade up with incremental delay (0.03-0.04s per item)
- **Page transitions**: Fade in from below
- **Sheet/Overlay**: Spring animation for open/close
- **Cards on tap**: `active:scale-[0.98]` press effect

**Flutter equivalent:**
```dart
// Staggered list animation
AnimationList(
  staggerDelay: const Duration(milliseconds: 50),
  children: items.map((item) => FadeInUpAnimation(
    delay: index * 50.ms,
    child: ItemCard(item: item),
  )).toList(),
);
```

### 8. Chart Architecture

The chart system is the most complex component:

```
ChartDetailView (container)
├── Header (symbol, price, OHLC values)
├── Floating OHLC Bar (crosshair data)
├── Toolbar (tools, periods, indicators)
├── Indicators Panel (toggleable)
├── ChartCanvas (main rendering)
│   ├── Price Chart (candlestick)
│   ├── Volume Chart (sub-panel)
│   ├── RSI Chart (sub-panel, toggleable)
│   ├── MACD Chart (sub-panel, toggleable)
│   ├── Drawing Tools (crosshair, hline, trendline, fib, rect)
│   └── Indicators (MA20/50/100, Bollinger Bands)
└── Footer Bar (indicator values, drawing pills)
```

**Flutter equivalent**: Use `CustomPainter` with `Canvas` API for the candlestick chart, or use `fl_chart` library with heavy customization.

### 9. API Backend

All API routes are REST endpoints returning JSON. They currently serve **mock data** (hardcoded), except:
- Auth routes use **Prisma/SQLite** for User model
- Chat route uses **ZAI SDK** for AI responses

**For Flutter**: Connect to the same API backend (Next.js server), or create a new backend.

## Database Schema

Currently minimal — only `User` model in SQLite:

```
User:
  id: String (cuid)
  email: String (unique)
  passwordHash: String
  phone: String?
  fullName: String?
  avatarUrl: String?
  plan: "free" | "pro" | "enterprise" (default: free)
  twoFactorEnabled: Boolean (default: false)
  twoFactorSecret: String?
  otpCode: String?
  otpExpiry: DateTime?
  isVerified: Boolean (default: false)
  lastLoginAt: DateTime?
  createdAt: DateTime
  updatedAt: DateTime
```

All other data (assets, alerts, news, etc.) is mock/in-memory. For production, these would need proper database models.

## Real-time Features

1. **Chat**: Socket.io for real-time messaging (not yet implemented in current version)
2. **Alerts**: Would use WebSocket for real-time alert triggering
3. **Market data**: Would use WebSocket for live price updates
4. **Notifications**: Push notifications for mobile

## Security Considerations

1. **Auth session**: Stored in `localStorage` (web) → `SharedPreferences`/`flutter_secure_storage` (Flutter)
2. **2FA**: TOTP-based with recovery codes
3. **Password requirements**: ≥8 chars, ≥1 uppercase, ≥1 digit, ≥1 special char
4. **OTP expiry**: Configurable (default short-lived)
5. **Protected routes**: Client-side gating (server should also validate)
