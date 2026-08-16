# Screens Specification

Detailed UI specification for every screen and overlay in CoinRadar.

---

## Main Views (6)

### 1. Home (Tổng quan) — `view: 'home'`

**Component**: `HomeDashboard`
**Auth**: Public (guest can view)
**Layout**: Vertical stack of sections with staggered fade-up animation

```
┌──────────────────────────────────────┐
│ [PortfolioSummary Card]              │ ← Click → openOverlay('portfolio')
│  Tổng giá trị theo dõi               │
│  ₫ 1,250,000,000 (large bold)        │
│  ┌──────────┐  ┌──────────┐          │
│  │ Hôm nay  │  │ Tháng này│          │
│  │ +15tr +1%│  │ +45tr +4%│          │
│  └──────────┘  └──────────┘          │
│  Risk Score: [══════░░░] 42/100      │
│  [30-day sparkline chart]            │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ [QuickActions] 3-column grid        │
│ ┌──────────┐┌──────────┐┌──────────┐│
│ │⚡ Quét   ││🔔 Tạo    ││📊 Xem   ││
│ │  rủi ro  ││  cảnh báo││  thị trường│
│ └──────────┘└──────────┘└──────────┘│
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ [MarketCards] Horizontal scroll       │
│ Danh sách theo dõi    [Xem tất cả]   │
│ ┌────────┐ ┌────────┐ ┌────────┐    │
│ │BTC     │ │FPT     │ │SJC     │    │
│ │$67,500 │ │₫92,000 │ │₫85,000 │    │
│ │+1.89%  │ │+2.3%   │ │-0.5%   │    │
│ │[chart] │ │[chart] │ │[chart] │    │
│ └────────┘ └────────┘ └────────┘    │
└──────────────────────────────────────┘

┌──────────────────────┬───────────────┐
│ [RecentAlerts]       │ [NewsFeed]    │
│ Cảnh báo gần đây     │ Tin tức       │
│ [Xem tất cả]         │ [Xem tất cả] │
│ ┌──────────────────┐ │ ┌───────────┐│
│ │● BTC RSI < 30    │ │● VN-Index  ││
│ │  Bật  2phút trước│ │  CafeF 1h  ││
│ ├──────────────────┤ │ ├───────────┤│
│ │● FPT MA cross    │ │● BTC ETF   ││
│ │  Bật  5phút trước│ │  CoinDesk  ││
│ └──────────────────┘ │ └───────────┘│
└──────────────────────┴───────────────┘
```

**PortfolioSummary Card Details:**
- Total value in VND (large, bold)
- Daily change: value + percentage with gain/loss color
- Monthly change: value + percentage with gain/loss color
- Risk score progress bar (0-100)
- 30-day sparkline (Recharts AreaChart)
- Clickable → opens portfolio sheet

**MarketCards Details:**
- Horizontal scroll with snap-x
- Each card: symbol (bold), name, type badge (CK/Crypto/Vàng), price (colored), change% badge, mini sparkline
- Click card → `openOverlay('asset-detail')`

---

### 2. News (Tin tức) — `view: 'news'`

**Component**: `NewsPage`
**Auth**: Public (guest can view)
**Layout**: Full page with filters, featured article, list

```
┌──────────────────────────────────────┐
│ Tin tức                    [Mới nhất▼]│
│ [🔍 Tìm kiếm tin tức...]            │
├──────────────────────────────────────┤
│ [Tin chung] [Quan trọng] [Quan tâm] [Danh mục]
├──────────────────────────────────────┤
│ Category: [Tất cả] [CK] [Crypto]     │
│           [Vàng] [Vĩ mô] [Vi mô]    │
├──────────────────────────────────────┤
│ Stats: 25 tin | 3 quan trọng        │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ ★ FEATURED ARTICLE               │ │
│ │ [Large cover placeholder]        │ │
│ │ ★ Quan trọng                     │ │
│ │ Title (large, 2 lines)           │ │
│ │ Summary (3 lines)                │ │
│ │ CafeF • 2 giờ trước              │ │
│ │ [#VN-Index] [#CK] [🔖 Bookmark]  │ │
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ ● VN-Index tăng điểm              │ │
│ │   CafeF • 1 giờ trước            │ │
│ │   [CK badge]                     │ │
│ ├──────────────────────────────────┤ │
│ │ ● BTC ETF inflows surge          │ │
│ │   CoinDesk • 3 giờ trước         │ │
│ │   [Crypto badge]                 │ │
│ ├──────────────────────────────────┤ │
│ │ ... more articles ...            │ │
│ └──────────────────────────────────┘ │
│ [Làm mới tin tức 🔄]                │
└──────────────────────────────────────┘
```

**Tabs**: Tin chung (all), Quan trọng (important), Quan tâm (bookmarked), Danh mục (by category)
**Interactions**: Click article → `openOverlay('news-detail')`, bookmark toggle, search, sort

---

### 3. Market (Thị trường) — `view: 'market'`

**Component**: `MarketOverview`
**Auth**: Public (guest can view)
**Layout**: Tabs + search + sector filters + table/cards

```
┌──────────────────────────────────────┐
│ Thị trường                    [🔖 Watchlist]
├──────────────────────────────────────┤
│ [Chứng khoán] [Crypto] [Vàng]       │
│ [🔍 Tìm kiếm mã, tên...]           │
├──────────────────────────────────────┤
│ [Tất cả] [Ngân hàng] [BĐS] [Công nghệ]...
├──────────────────────────────────────┤
│ DESKVIEW (md+): Table                │
│ ┌──────┬────────┬──────┬────┬────┬──┐│
│ │ Mã ↓ │ Tên    │ Giá  │%   │24h │📊││
│ ├──────┼────────┼──────┼────┼────┼──┤│
│ │FPT   │FPT Corp│92,000│+2% │+2.1│📈││
│ │MBB   │MB Bank │24,500│-0.5│-123│📈││
│ │...   │        │      │    │    │  ││
│ └──────┴────────┴──────┴────┴────┴──┘│
│                                      │
│ MOBILE VIEW: Cards grid              │
│ ┌──────────┐ ┌──────────┐           │
│ │FPT       │ │MBB       │           │
│ │FPT Corp  │ │MB Bank   │           │
│ │₫92,000   │ │₫24,500   │           │
│ │+2.3%     │ │-0.5%     │           │
│ └──────────┘ └──────────┘           │
└──────────────────────────────────────┘
```

**Sector Filters per tab:**
- Stock: Tất cả, Ngân hàng, Bất động sản, Công nghệ, Thép, Chỉ số
- Crypto: Tất cả, Layer 1, DeFi, Meme, Stablecoin
- Gold: Tất cả, Vàng miếng, Vàng thế giới

**Table columns**: Mã, Tên, Giá, Thay đổi%, 24h, KLGD (hidden mobile), Vốn hóa (hidden mobile), Biểu đồ
**Interactions**: Click row → asset-detail, chart button → chart-detail, sort columns

---

### 4. Alerts (Cảnh báo) — `view: 'alerts'`

**Component**: `AlertHub`
**Auth**: PROTECTED (requires login)
**Layout**: Tabs + dual filter + alert card list

```
┌──────────────────────────────────────┐
│ 🔔 Cảnh báo                          │
│ Quản lý và theo dõi cảnh báo thị trường│
├──────────────────────────────────────┤
│ [🔔 Đang bật] [⚡ K.Hoạt] [📋 L.Sử] │
├──────────────────────────────────────┤
│ Asset:  [Tất cả 5] [CK 3] [Crypto 1] [Vàng 1]│
│ Risk:   [Tất cả 5] [🔴 Cao 2] [🟡 Vừa 2] [🟢 Thấp 1]│
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │█ BTC Bitcoin                    │ │ ← border-l-red (high)
│ │  RSI giảm xuống dưới 30         │ │
│ │  [Cao] [Đang bật] [RSI]         │ │
│ │                          2phút  │ │
│ ├──────────────────────────────────┤ │
│ │█ FPT FPT Corp                   │ │ ← border-l-amber (medium)
│ │  MA20 cắt MA50 từ trên xuống     │ │
│ │  [Vừa] [Đang bật] [MA]          │ │
│ │                          5phút  │ │
│ ├──────────────────────────────────┤ │
│ │█ SJC Vàng SJC                   │ │ ← border-l-green (low)
│ │  Giá giảm xuống dưới 85,000     │ │
│ │  [Thấp] [Đã kích hoạt] [Giá]    │ │
│ │                          1ngày  │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
          [+ FAB button bottom-right]
```

**Alert Card**:
- Left border colored by risk level (red/amber/green)
- Icon by indicator type (RSI=bar chart, MACD=trending, MA=trending up, ATR=zap, volume=bar, price=trending)
- Custom alert gets Zap icon with primary color bg
- Badges: risk level + status + indicator type
- Relative time on right
- Click → `openOverlay('alert-detail')`

**FAB (AlertFab)**: Fixed bottom-right, opens alert-templates

---

### 5. Chat AI — `view: 'chat'`

**Component**: `ExpertDirectory` → `ChatRoom`
**Auth**: PROTECTED (requires login)

#### Expert Directory View:
```
┌──────────────────────────────────────┐
│ 🧑‍💼 Chuyên gia phân tích  [● 3 online] │
│ [🔍 Tìm chuyên gia...]              │
├──────────────────────────────────────┤
│ [Tất cả] [CK] [Crypto] [Vàng]       │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ 🟢 Nguyễn Minh Khoa              │ │
│ │    Phân tích chứng khoán         │ │
│ │    ⭐ 4.8 (156) ● Online         │ │
│ │    [💬 Chat]  [👁 Xem]           │ │
│ ├──────────────────────────────────┤ │
│ │ 🟡 Trần Thu Hà                   │ │
│ │    Crypto & DeFi                 │ │
│ │    ⭐ 4.5 (89) ● Away            │ │
│ │    [💬 Chat]  [👁 Xem]           │ │
│ ├──────────────────────────────────┤ │
│ │ ⚫ Lê Văn Hoàng                  │ │
│ │    Vàng & Hàng hóa               │ │
│ │    ⭐ 4.2 (45) ● Offline        │ │
│ │    [💬 Chat]  [👁 Xem]           │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

#### Chat Room View (when expert selected):
```
┌──────────────────────────────────────┐
│ [← Back]  🟢 Nguyễn Minh Khoa        │
│           Phân tích CK  ⭐ 4.8       │
├──────────────────────────────────────┤
│                                      │
│        ┌──────────────────┐          │
│        │ Chào bạn! Tôi là │          │
│        │ NK, chuyên gia... │  Avatar │
│        └──────────────────┘          │
│                                      │
│  ┌──────────────────┐               │
│  │ Xin chào anh Khoa │  User bubble  │
│  │ Thị trường hôm nay│  (primary bg) │
│  └──────────────────┘               │
│                                      │
│        ┌──────────────────┐          │
│        │ Chào bạn! Hôm nay │          │
│        │ VN-Index tăng...  │          │
│        └──────────────────┘          │
│                                      │
│ ┌────────────────────────────────┐   │
│ │ Suggestion chips (≤3 msgs):    │   │
│ │ [Xu hướng thị trường]          │   │
│ │ [Phân tích kỹ thuật]           │   │
│ │ [Đánh giá rủi ro]              │   │
│ │ [Gợi ý cảnh báo]               │   │
│ └────────────────────────────────┘   │
├──────────────────────────────────────┤
│ [Type message...              ] [➤]  │
└──────────────────────────────────────┘
```

---

### 6. Profile (Cá nhân) — `view: 'profile'`

**Component**: `ProfileDashboard`
**Auth**: PROTECTED (requires login)

```
┌──────────────────────────────────────┐
│ ┌──────────────────────────────────┐ │
│ │  [NA]  Nguyễn Văn A     ✏️ Edit  │ │
│ │        user@email.com           │ │
│ │        [Free badge]              │ │
│ └──────────────────────────────────┘ │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│ │12  │ │78% │ │1.25│ │ 8  │        │
│ │alert│ │avoid│ │tỷ₫ │ │track│       │
│ └────┘ └────┘ └────┘ └────┘        │
├──────────────────────────────────────┤
│ Tài khoản cá nhân                   │
│ ┌──────────────────────────────────┐ │
│ │ 👤 Chỉnh sửa hồ sơ        →     │ │
│ │ 🔐 Xác thực 2 yếu tố       →     │ │
│ │ 🔑 Đổi mật khẩu            →     │ │
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│ Cài đặt                             │
│ ┌──────────────────────────────────┐ │
│ │ 📊 Quản lý danh mục        →     │ │
│ │ 🔔 Cài đặt thông báo       →     │ │
│ │ 🎨 Giao diện               →     │ │
│ │ 🛡️ Bảo mật                 →     │ │
│ │ 💎 Gói dịch vụ             →     │ │
│ └──────────────────────────────────┘ │
│ [Đăng xuất 🚪]                       │
└──────────────────────────────────────┘
```

**Menu items** → open corresponding overlay sheets (see Overlays section below).

---

## Chart Detail View

**Component**: `ChartDetailView`
**Auth**: Public (guest can view)
**Triggered when**: `chartDetailSymbol` is set in store

```
┌──────────────────────────────────────┐
│ [←] BTC [Crypto]  $67,500 +1.89%    │
│      O:67,000 H:68,200 L:66,800 C:67,500│ (lg+)
│                    [🔖] [🔔]         │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ Floating OHLC Bar (on crosshair)│ │
│ │ 15/01/2024  O:H:L:C  Vol Alert │ │
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│ Toolbar:                            │
│ [✚] [─] [╲] [Fib] [□] │ 1D 1W 1M 3M 1Y ALL│
│                       │ [MA20][MA50][RSI]│
│ [Clear Drawings]                     │
├──────────────────────────────────────┤
│ Indicators Panel (toggleable):        │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │MA20 │ │MA50 │ │MA100│ │ BB  │   │
│ │ ON  │ │ OFF │ │ OFF │ │ OFF │   │
│ ├─────┤ ├─────┤ └─────┘ ├─────┤   │
│ │RSI  │ │MACD │          │Vol  │   │
│ │ ON  │ │ OFF │          │ ON  │   │
│ └─────┘ └─────┘          └─────┘   │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │                                  │ │
│ │   CANDLESTICK CHART              │ │
│ │   (Canvas, TradingView-style)    │ │
│ │                                  │ │
│ │   - Candlesticks (green/red)     │ │
│ │   - Volume bars (bottom)         │ │
│ │   - MA lines (overlay)          │ │
│ │   - Bollinger Bands (overlay)   │ │
│ │   - Drawing tools (hline, etc)   │ │
│ │   - Crosshair + labels           │ │
│ │                                  │ │
│ ├──────────────────────────────────┤ │
│ │ RSI sub-panel (if enabled)       │ │
│ ├──────────────────────────────────┤ │
│ │ MACD sub-panel (if enabled)      │ │
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│ Footer: RSI:65.5 │ MA20:66k │ MA50:62k │
│ [Drawing: HLine 67,500 ×]           │
└──────────────────────────────────────┘
```

**Drawing Tools**: Crosshair, Horizontal Line, Trendline, Fibonacci Retracement, Rectangle
**Time Periods**: 1D, 1W, 1M, 3M, 1Y, ALL
**Right-click context menu**: Set alert at price, draw hline, clear all drawings

---

## Overlay Sheets (20+)

### Search (Global Search)
**Type**: Fullscreen overlay (z-50)
**Backdrop**: blur-sm
- Search input with debounce (300ms)
- Two sections: "Tài sản" + "Tin tức"
- Asset rows: initials avatar, symbol, type badge, name, price, change%
- News rows: newspaper icon, title, source
- Escape or backdrop click → close

### Asset Detail Sheet
**Type**: Drawer (mobile) / Sheet from right (desktop)
```
┌──────────────────────────────────────┐
│ BTC [Crypto]  Bitcoin               │
│ $67,500.00    +$1,250.50 (+1.89%)   │
├──────────────────────────────────────┤
│ [Area chart with period selector]    │
│ 1D  1W  1M  3M  1Y                  │
├──────────────────────────────────────┤
│ Chỉ báo kỹ thuật:                    │
│ ┌──────────────────────────────────┐ │
│ │ RSI Gauge: [needle indicator]    │ │
│ │ Quá bán ← 65.5 → Quá mua        │ │
│ ├──────────────────────────────────┤ │
│ │ MACD: 250.5  Signal: 200.3      │ │
│ │ MA20: $66,000  MA50: $62,000    │ │
│ │ ATR: $850  VolAvg20: $24B        │ │
│ ├──────────────────────────────────┤ │
│ │ 52w Range: [$38,500 ━━●━━ $73,750]│
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│ [📊 Xem biểu đồ] [🔖 Watchlist] [🔔 Tạo cảnh báo]│
├──────────────────────────────────────┤
│ Tin tức liên quan:                   │
│ • Bitcoin ETF inflows surge          │
│ • BTC reaches new high               │
└──────────────────────────────────────┘
```

### News Detail Sheet
**Type**: Drawer (mobile) / Sheet from right (desktop)
- Category badge + date + source
- Title (xl/2xl bold)
- Cover image placeholder
- Tag buttons (clickable → asset-detail)
- Full markdown content (ReactMarkdown)
- Share + close buttons

### Alert Builder (3-step wizard)
**Type**: Fullscreen Dialog
```
Step indicator: ①────②────③

Step 1 - Chọn tài sản:
├── Search input
├── Type filter: [Tất cả] [CK] [Crypto] [Vàng]
├── Recent assets chips
└── Asset list

Step 2 - Chọn điều kiện:
├── Condition type tabs:
│   [Chỉ báo kỹ thuật] [Giá chạm] [Biến động %]
├── Indicator selector:
│   [RSI] [MACD] [MA] [ATR] [Volume]
└── Condition config:
    ├── Slider/input for threshold value
    └── Description (auto-generated)

Step 3 - Cài đặt:
├── Risk level: [🔴 Cao] [🟡 Vừa] [🟢 Thấp]
├── Summary card (review all settings)
└── [Tạo cảnh báo] button
```

### Alert Templates
**Type**: Drawer (mobile) / Sheet (desktop)
- Search input
- Category filters: Tất cả, Chỉ báo, Giá, Khối lượng, Biến động
- Grid of template cards:
  - Name, description
  - Indicator type badge, asset type badge, risk badge
  - "Sử dụng" button → opens alert-builder with template

### Alert Detail
**Type**: Drawer (mobile icon header) / Sheet (desktop detailed header)
```
Condition description box with badges
├── Status timeline:
│   ● Created (green dot)
│   └── ○ Triggered / Pending (amber/gray)
├── Proximity gauge:
│   [═══════░░░░░] 75% near threshold
├── Triggered info box (amber, if triggered)
├── Risk assessment (color-coded text)
├── Asset info grid
└── Actions:
    [Chỉnh sửa] [Bật/Tắt] [Tạo tương tự] [Xóa]
```

### Watchlist
**Type**: Drawer (mobile) / Sheet (desktop)
- Header with count badge + "+" button
- Animated expandable search section
- Watchlist items with remove button

### Risk Scanner
**Type**: Drawer (mobile) / Sheet (desktop)
```
┌──────────────────────────────────────┐
│ 🔍 Quét rủi ro thị trường  [🔄] [🕐] │
├──────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐          │
│ │🔴 2  │ │🟡 3  │ │🟢 2  │          │
│ │Cao   │ │Vừa   │ │Thấp  │          │
│ └──────┘ └──────┘ └──────┘          │
├──────────────────────────────────────┤
│ HIGH RISK:                           │
│ ● VIC — RSI Quá bán                  │
│   Giá: 42,000  Normal: 30-70         │
│   [Tạo cảnh báo]                      │
├──────────────────────────────────────┤
│ MEDIUM RISK:                         │
│ ● HPG — MACD Bearish                │
│   Giá: 15,200  Normal: ...           │
│   [Tạo cảnh báo]                      │
└──────────────────────────────────────┘
```

### Expert Profile
**Type**: Drawer (mobile) / Sheet (desktop)
- Large avatar with status dot
- Name, specialty, status badge
- 4-stat grid: Rating, Analyses, Accuracy, Experience
- Bio card
- Recent analyses list
- CTA: [Nhắn tin] [Theo dõi]

### Portfolio
**Type**: Bottom sheet (85vh)
- Total value card
- Daily/monthly change cards
- Risk score card
- Allocation bar (colored segments: stock=blue, crypto=amber, gold=yellow)
- Holdings table

### Auth Gate
**Type**: Fullscreen overlay (z-100)
- X close button (top-right)
- Contains: Login, Register, Forgot Password, Verify OTP screens
- Animated transitions between screens

### Profile Sub-sheets (all bottom sheets):
- **Edit Profile**: Avatar + form fields (name, email, phone, dob, address)
- **Notification Settings**: Toggle switches for 5 notification types + push + volume + quiet hours
- **Display Settings**: Theme (system/light/dark), Default view, Chart style, Language, Font size
- **Security Settings**: Biometric lock, Auto-lock, Data encryption, Clear cache
- **Subscription**: 3 plan cards (Free, Pro 99k/month, Enterprise)
- **2FA Setup**: 3-step flow (info → QR code → verification)
- **Change Password**: 3 fields with strength validation

---

## Layout Components

### AppHeader (Fixed top)
```
┌──────────────────────────────────────────────┐
│ [☰] 🔮 Coin Radar  │ Coin Radar / Tổng quan │ 🔍 🔔(3) [👤] [🌓] │
└──────────────────────────────────────────────┘
   ^hamburger      breadcrumb (md+)            ^search ^bell ^avatar ^theme
```

### BottomNav (Mobile, fixed bottom)
```
┌────────────────────────────────────────┐
│  🏠      📰      🔔      📊     💬    👤│
│ Tổng quan Tin tức Cảnh báo Thị trường Chat Cá nhân│
└────────────────────────────────────────┘
```
- Hidden at xl+ (when sidebar visible)
- 44px min touch targets
- Active: filled icon + bold text + primary color
- Alert tab has unread badge
- Safe area bottom for iOS

### Sidebar (Desktop xl+, fixed left)
```
┌──────────┐
│ 🔮 Coin  │
│   Radar  │
├──────────┤
│ 🏠 Tổng  │  ← active highlight
│   quan   │
│ 📰 Tin   │
│   tức    │
│ 🔔 Cảnh  │
│   báo    │
│ 📊 Thị   │
│   trường │
│ 💬 Chat  │
│   AI     │
│ 👤 Cá    │
│   nhân   │
├──────────┤
│ [◀▶]     │  ← collapse toggle
└──────────┘
```
- Expanded: 256px (w-64), icon + label
- Collapsed: 68px, icon only with tooltips
- Below xl: slide-in drawer with close button
