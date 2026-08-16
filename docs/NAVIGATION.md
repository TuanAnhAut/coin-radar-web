# Navigation & Auth

## Navigation Architecture

CoinRadar uses a **single-page application** (SPA) pattern with view switching, NOT traditional multi-page navigation.

### View Types

```typescript
type ViewType = 'home' | 'news' | 'alerts' | 'market' | 'chat' | 'profile'
```

### Navigation Components

| Component | Visible | Purpose |
|-----------|---------|---------|
| **AppHeader** | Always | Top bar with breadcrumb, search, notifications, auth, theme |
| **SidebarNav** | Desktop (xl+, ≥1280px) | Left sidebar with all nav items |
| **BottomNav** | Mobile/Tablet (<1280px) | Bottom tab bar with 6 items |

### View Switching

All navigation goes through `requireAuth(view)`:

```typescript
function requireAuth(view: ViewType) {
  if (isProtectedView(view) && !isAuthenticated) {
    openAuthGate(view)  // Show fullscreen auth overlay
    return
  }
  setCurrentView(view)  // Switch view directly
}
```

---

## Protected vs Public

### Public Views (guest accessible)
| View | Key | Description |
|------|-----|-------------|
| Home | `home` | Dashboard with portfolio, market cards, alerts, news |
| News | `news` | News feed with filters and search |
| Market | `market` | Asset list with tabs, search, sort |
| Chart Detail | `chart-detail` | Professional candlestick chart |

### Protected Views (require authentication)
| View | Key | Description |
|------|-----|-------------|
| Alerts | `alerts` | Alert management hub |
| Chat AI | `chat` | Expert directory and chat rooms |
| Profile | `profile` | User settings and account management |

### Protected Overlays (require authentication)
When a guest tries to open these, the AuthGate overlay appears instead:
- `notifications` — Notification center
- `alert-detail` — Alert detail view
- `alert-builder` — Create alert wizard
- `alert-templates` — Alert template browser
- `watchlist` — Watchlist management
- `expert-profile` — Expert profile view
- `portfolio` — Portfolio detail
- `notification-settings` — Notification preferences
- `security-settings` — Security preferences
- `subscription` — Subscription plans
- `edit-profile` — Edit profile form
- `two-factor` — 2FA setup
- `change-password` — Change password form

### Public Overlays (guest accessible)
- `search` — Global search
- `asset-detail` — Asset detail view
- `news-detail` — News article view
- `scanner` — Risk scanner results

---

## Auth Gate Flow

```
┌─────────────────────────────────────────┐
│ User clicks protected feature            │
└──────────────────┬──────────────────────┘
                   │
            ┌──────▼──────┐
            │ Authenticated?│
            └──────┬──────┘
           Yes /    \ No
               /      \
    ┌──────────▼──┐   ┌─▼───────────────────┐
    │ Execute     │   │ Open AuthGate       │
    │ action      │   │ (fullscreen overlay)  │
    └─────────────┘   │ Store pendingView   │
                      └──────┬──────────────┘
                             │
                    ┌────────▼────────┐
                    │  Auth Screen    │
                    │  (login default) │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌───────▼─────┐ ┌──────▼──────┐ ┌────▼─────────┐
     │   Login     │ │  Register  │ │Forgot Password│
     │             │ │            │ │              │
     │ Email       │ │ Full Name  │ │ Email        │
     │ Password    │ │ Email      │ │ → Send OTP   │
     │ → Submit   │ │ Phone      │ └──────┬───────┘
     └──────┬──────┘ │ Password   │        │
            │        │ Confirm    │        │
            │        │ Terms ✓    │        ▼
            │        │ → Submit   │   ┌────────────┐
            │        └──────┬─────┘   │Verify OTP   │
            │               │         │6 digits     │
            │               ▼         │→ Submit    │
            │        ┌────────────┐   └──────┬─────┘
            │        │Verify OTP   │          │
            │        │6 digits     │          │
            │        │→ Submit    │          │
            │        └──────┬─────┘          │
            │               │               │
            └───────┬───────┴───────────────┘
                    │
             ┌──────▼──────┐
             │ Auth Success │
             │ login(user) │
             └──────┬──────┘
                    │
        ┌───────────▼───────────┐
        │ Close AuthGate        │
        │ Navigate to pendingView│
        │ (or current view)     │
        └───────────────────────┘
```

### Auth Gate Close Behavior

When user clicks **X** (close) on AuthGate:
- `closeAuthGate()` → returns to the previous public view
- `pendingView` is cleared
- User stays as guest

### After Successful Login:
- AuthGate closes
- If `pendingView` was set → navigate to that view
- Otherwise → stay on current view (home)

---

## Bottom Nav / Sidebar Navigation Items

| Icon | Label (VN) | View | Protected |
|------|-----------|------|-----------|
| LayoutDashboard | Tổng quan | `home` | No |
| Newspaper | Tin tức | `news` | No |
| Bell | Cảnh báo | `alerts` | **Yes** |
| TrendingUp | Thị trường | `market` | No |
| MessageCircle | Chat AI | `chat` | **Yes** |
| User | Cá nhân | `profile` | **Yes** |

---

## Header Breadcrumb Labels

| View | Label (Vietnamese) |
|------|-------------------|
| `home` | Tổng quan |
| `news` | Tin tức |
| `market` | Thị trường |
| `alerts` | Cảnh báo |
| `chat` | Chat AI |
| `profile` | Cá nhân |
| `chart-detail` | {Asset Name} (dynamic) |

Format: `Coin Radar / {label}`

---

## Overlay Navigation Map

### From Home:
- PortfolioSummary → `portfolio` sheet
- QuickAction "Quét rủi ro" → `scanner` sheet
- QuickAction "Tạo cảnh báo" → `alert-templates` sheet
- QuickAction "Xem thị trường" → switch to `market` view
- MarketCard → `asset-detail` sheet
- RecentAlert item → `alert-detail` sheet
- RecentAlert "Xem tất cả" → switch to `alerts` view (protected)
- NewsFeed item → `news-detail` sheet
- NewsFeed "Xem tất cả" → switch to `news` view

### From Market:
- Asset row click → `asset-detail` sheet
- Chart button → `chart-detail` view (full screen)
- Watchlist button → `watchlist` sheet (protected)

### From Alerts:
- Alert card → `alert-detail` sheet (protected)
- FAB (+) → `alert-templates` sheet (protected)
- Alert detail "Chỉnh sửa" → `alert-builder` sheet (protected)
- Alert detail "Tạo tương tự" → `alert-builder` sheet with template

### From Chat:
- "Chat" button → renders ChatRoom (inline, same view)
- "Xem" button → `expert-profile` sheet (protected)
- ChatRoom back → returns to ExpertDirectory

### From Profile:
- Each menu item → corresponding sheet (protected)
- Logout → `logout()` → returns to `home` view (guest state)

### From Header:
- Search button → `search` overlay (fullscreen)
- Bell button → `notifications` overlay (protected)
- Avatar button → switch to `profile` view (protected)
- Login button (guest) → `openAuthGate()`
- Theme toggle → light/dark mode switch

### From Chart Detail:
- Back button → `closeChartDetail()` → returns to previous view
- Alert button → `alert-builder` sheet (protected)
- Watchlist button → `watchlist` sheet (protected)
- Drawing click → `alert-builder` with price prefill

---

## Deep Link Support (Future)

For Flutter, consider implementing deep links:
- `coinradar://asset/BTC` → open asset detail for BTC
- `coinradar://chart/BTC` → open chart detail for BTC
- `coinradar://alerts` → open alerts view
- `coinradar://news/{id}` → open news detail
