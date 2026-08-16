# Features Specification

## Module 1: Home Dashboard

### Portfolio Summary
- Display total portfolio value in VND
- Daily change: absolute value + percentage (gain/loss color)
- Monthly change: absolute value + percentage (gain/loss color)
- Risk score: progress bar 0-100 with color gradient
- 30-day sparkline area chart
- Click → opens Portfolio sheet
- **Data**: `GET /api/portfolio`

### Quick Actions
- 3 action buttons in a grid:
  1. **Quét rủi ro** (Risk Scanner) → opens scanner sheet
  2. **Tạo cảnh báo** (Create Alert) → opens alert-templates sheet
  3. **Xem thị trường** (View Market) → switches to market view
- Staggered fade-up animation

### Market Cards (Watchlist Preview)
- Horizontal scrollable card list
- Each card: symbol, name, type badge (CK/Crypto/Vàng), price, change% badge, mini sparkline
- Shows first 8 items from watchlist
- Click → opens asset-detail sheet
- **Data**: `GET /api/watchlist`

### Recent Alerts
- Shows 5 most recent active alerts
- Each: risk-colored icon, symbol, name, status badge, condition, relative time
- Click → opens alert-detail sheet (protected)
- "Xem tất cả" → switches to alerts view (protected)
- **Data**: `GET /api/alerts?status=active&limit=5`

### News Feed
- Shows 5 latest news articles
- Each: importance dot (red if important), title (2-line clamp), summary (hidden mobile), category badge, source, time
- Click → opens news-detail sheet
- "Xem tất cả" → switches to news view
- **Data**: `GET /api/news`

---

## Module 2: Market

### Market Overview
- **Tabs**: Chứng khoán / Crypto / Vàng (stock/crypto/gold)
- **Search**: Filter by symbol or name
- **Sector filters**: Horizontal scrollable pill buttons per asset type
- **Sort**: Click column headers to sort (asc/desc)
- **Desktop (md+)**: Full table with 8 columns (Mã, Tên, Giá, Thay đổi%, 24h, KLGD, Vốn hóa, Biểu đồ)
- **Mobile**: Card grid (2-column) with symbol, name, price, change%
- **Interactions**:
  - Click row/card → asset-detail sheet
  - Click chart icon → chart-detail view
  - Click Watchlist button → watchlist sheet (protected)
- **Data**: `GET /api/assets?type=...&search=...`

### Asset Detail Sheet
- Header: symbol, type badge, name, price, 24h change
- Area chart with period selector (1D/1W/1M/3M/1Y)
- Technical indicators section:
  - RSI gauge (visual needle, labels "Quá mua"/"Trung tính")
  - MACD, MA20, MA50, ATR cards
  - Volume stats
  - 52-week range bar with position indicator
- Action buttons: Xem biểu đồ, Watchlist, Tạo cảnh báo
- Related news list
- **Data**: `GET /api/assets/[symbol]`

### Watchlist Management
- List of watched assets with prices and changes
- Add new asset via search
- Remove asset
- Click → asset-detail
- **Data**: `GET /api/watchlist`, `POST /api/watchlist`

---

## Module 3: Alerts

### Alert Hub
- **Tabs**: Đang bật (active) / Đã kích hoạt (triggered) / Lịch sử (history)
- **Filters**: Asset type (Tất cả/CK/Crypto/Vàng) + Risk level (Tất cả/Cao/Vừa/Thấp)
- **Alert cards**: Left border color by risk, indicator icon, badges, relative time
- **Empty state**: Icon + message + "Tạo cảnh báo đầu tiên" button
- **FAB**: Floating + button → opens alert-templates
- **Data**: `GET /api/alerts?status=...&type=...`

### Alert Builder (3-step wizard)
- **Step 1 — Asset Selection**: Search, type filter, recent assets, asset list
- **Step 2 — Condition**: Type tabs (Technical/Price/Percentage), indicator selector, slider/input
- **Step 3 — Settings**: Risk level, summary, submit
- Prefill support from templates or chart drawings
- **Data**: `POST /api/alerts`

### Alert Templates
- Grid of pre-built templates
- Filter by category (Technical/Price/Volume/Volatility)
- "Sử dụng" → opens alert-builder with template data
- **Data**: `GET /api/alert-templates`

### Alert Detail
- Condition description with badges
- Status timeline (created → triggered/pending)
- Proximity gauge (how close to threshold)
- Risk assessment text
- Actions: Edit, Toggle enable, Create similar, Delete
- **Data**: `GET /api/alerts/[id]`, `PATCH /api/alerts/[id]`, `DELETE /api/alerts/[id]`

---

## Module 4: Charts

### Chart Detail View
- **Header**: Symbol, type badge, price, change%, OHLC values, action buttons
- **Floating OHLC Bar**: Shows date, OHLC, Volume at crosshair position
- **Toolbar**:
  - Drawing tools: Crosshair, HLine, Trendline, Fibonacci, Rectangle
  - Time periods: 1D, 1W, 1M, 3M, 1Y, ALL
  - Indicator toggles with badges
  - Clear drawings button
- **Indicators Panel**: Toggleable grid for MA20/50/100, BB, RSI, MACD, Volume
- **Chart Canvas**:
  - Candlestick chart (green/red)
  - Volume bars (sub-panel)
  - Moving average lines (overlay)
  - Bollinger Bands (overlay)
  - RSI sub-panel (toggleable)
  - MACD sub-panel with histogram (toggleable)
  - Drawing tools (click to place, drag to create)
  - Crosshair with price/date labels
  - Mouse wheel zoom, drag to pan
  - Touch: pinch to zoom, drag to pan
- **Footer**: Current indicator values, active drawing pills
- **Context menu** (right-click): Set alert at price, draw hline, clear all
- **Data**: `GET /api/assets/[symbol]` (includes priceHistory)

### Chart Calculations
- **RSI**: Wilder's smoothing method (14-period), TradingView standard
- **MACD**: 12/26/9 parameters
- **SMA**: Simple Moving Average
- **EMA**: Exponential Moving Average
- **Bollinger Bands**: 20-period SMA, 2 standard deviations
- **Fibonacci Levels**: 0%, 23.6%, 38.2%, 50%, 61.8%, 78.6%, 100% with zone colors
- **Viewport**: Asymmetric padding (5% above max, 10% below min for candles)

---

## Module 5: News

### News Page
- **Tabs**: Tin chung / Quan trọng / Quan tâm (bookmarked) / Danh mục
- **Category filters**: Tất cả, CK, Crypto, Vàng, Vĩ mô, Vi mô
- **Search**: Filter by title, summary, tags, source
- **Sort**: Newest first / Oldest first
- **Featured article**: Large card with cover, importance badge, bookmark
- **Article list**: Compact cards with badges and metadata
- **Bookmark**: Client-side toggle
- **Refresh**: Manual refresh button
- **Data**: `GET /api/news`

### News Detail
- Category badge, date, source
- Title (large), cover image
- Tag buttons (clickable → asset-detail)
- Full markdown content with styled rendering
- Share functionality (native share / clipboard)
- **Data**: `GET /api/news` (find by ID)

---

## Module 6: Chat AI

### Expert Directory
- Online count badge
- Search by name/specialty
- Category filters: Tất cả, CK, Crypto, Vàng
- Expert cards: Avatar (colored initials), status dot, name, specialty, rating, status badge
- "Chat" button → opens ChatRoom inline
- "Xem" button → opens expert-profile sheet
- **Data**: `GET /api/experts`

### Chat Room
- Header: Back button, expert avatar + status, name + specialty + rating
- Message bubbles: Expert (left, with avatar), User (right, primary bg), System (centered)
- Typing indicator (animated dots)
- Quick suggestion chips (shown when ≤3 messages):
  - Xu hướng thị trường
  - Phân tích kỹ thuật
  - Đánh giá rủi ro
  - Gợi ý cảnh báo
- Auto-growing textarea + send button
- Auto-scroll to bottom on new message
- **Data**: `GET/POST /api/chat/[expertId]/messages`
- **AI Integration**: Uses ZAI SDK for Vietnamese responses

---

## Module 7: Profile & Settings

### Profile Dashboard
- Profile card: Avatar (initials), name, email, plan badge, edit button
- Stats grid: 4 cards (Alerts, Risk avoidance %, Total value, Tracked assets)
- Account section: Edit profile, 2FA, Change password
- Settings section: Portfolio, Notifications, Display, Security, Subscription
- Logout with confirmation dialog

### Edit Profile
- Avatar with camera overlay
- Form: Full name, email (disabled), phone, DOB, address
- Account ID with copy button
- Save button

### Notification Settings
- 5 notification type toggles:
  - Cảnh báo kích hoạt
  - Tin nóng
  - Tin từ chuyên gia
  - Tin kinh tế
  - Cảnh báo giá
- Push notification toggle
- Volume slider
- Quiet hours setting
- Sound toggle
- Smart alert mode toggle

### Display Settings
- Theme: Hệ thống / Sáng / Tối (System/Light/Dark)
- Default view: Trang chủ / Tin tức / Cảnh báo / Thị trường
- Chart style: Nến / Đến / Chi tiết (Candle/Line/Detailed)
- Language: Tiếng Việt
- Font size slider

### Security Settings
- Biometric lock toggle (Face ID / Touch ID)
- Auto-lock: 1 phút / 5 phút / 15 phút / Không bao giờ
- Data encryption toggle
- Clear cache button
- Clear all data button (with confirmation)

### Subscription Plans
- **Free**: 5 features included
- **Pro** (99,000₫/tháng): 8 additional features, highlighted card
- **Enterprise** (Tùy chỉnh): 8 additional features, "Liên hệ" CTA

### 2FA Setup
- 3-step flow:
  1. Info card explaining 2FA
  2. QR code + secret key + recovery codes
  3. 6-digit verification code
- Disable with confirmation dialog

### Change Password
- 3 fields: Current, New, Confirm (all with show/hide toggle)
- Strength validation:
  - ≥ 8 characters
  - ≥ 1 uppercase
  - ≥ 1 digit
  - ≥ 1 special character
- Strength bar: Yếu / Trung bình / Mạnh / Rất mạnh
- Match indicator

---

## Module 8: Risk Scanner

### Scanner Results
- 3 summary cards: High / Medium / Low risk counts (color-coded)
- Results grouped by severity
- Each result: Icon, asset symbol (clickable), anomaly label + description
- Current value, normal range, detection time
- "Tạo cảnh báo" button per result
- Refresh button with timestamp
- **Data**: `GET /api/scanner`

### Supported Anomaly Types
- `rsi_oversold` — RSI drops below 30
- `rsi_overbought` — RSI rises above 70
- `volume_breakout` — Volume spike above average
- `trend_reversal` — Trend direction change detected
- `price_breakdown` — Price breaks below support
- `price_breakout` — Price breaks above resistance
- `macd_bullish` — MACD bullish crossover
- `macd_bearish` — MACD bearish crossover
- `volatility_spike` — ATR above normal range
- `ma_crossover` — Moving average crossover

---

## Module 9: Authentication

### Login
- Email + Password inputs (with icons)
- Password show/hide toggle
- "Quên mật khẩu?" link
- Submit button
- Google SSO button (placeholder)
- "Đăng ký ngay" link → Register
- Framer Motion staggered fade-up
- **Data**: `POST /api/auth/login`

### Register
- Full name, Email, Phone, Password, Confirm Password
- Password strength indicator (4 requirements + strength bar)
- Terms checkbox
- Submit → sends OTP
- **Data**: `POST /api/auth/register`

### Forgot Password
- Email input
- Submit → sends OTP
- **Data**: `POST /api/auth/forgot-password`

### Verify OTP
- 6 individual digit inputs
- Auto-advance on input
- Auto-backspace on empty
- Arrow key navigation
- Paste support (fills all 6)
- Countdown timer (60s)
- Resend button (after countdown)
- Submit based on type:
  - Register → login user
  - Forgot password → navigate to login
  - Login → login user
- **Data**: `POST /api/auth/verify-otp`

---

## Module 10: Notifications

### Notification Center
- List of notifications with type icons (colored circles)
- Title (bold if unread), message (2-line clamp)
- Relative time
- Unread dot indicator
- "Đọc tất cả" button (mark all as read)
- Click notification → navigate to related content (alert → alert-detail, news → news-detail)
- **Data**: `GET /api/notifications`

---

## Module 11: Global Search

### Search Overlay
- Fullscreen overlay (mobile) / Centered panel (desktop, max-w-lg)
- Search input with 300ms debounce
- Results sections:
  - "Tài sản": Asset rows (initials avatar, symbol, type badge, name, price, change%)
  - "Tin tức": News rows (icon, title, source)
- Click asset → asset-detail
- Click news → news-detail
- Escape / backdrop click → close
- **Data**: `GET /api/assets?search=...`, `GET /api/news` (client filter)

---

## Module 12: PWA / Mobile App Banner

### Smart App Banner
- Detects: iOS, Android, standalone (PWA), tablet
- Banner: App icon + name + platform badge + "Mở app" / "Tải" buttons
- "Mở app" → tries deep link, falls back to store after 1.5s
- "Tải" → opens download dialog
- Dismiss → hides for 7 days (localStorage)

### Download Dialog
- Hero gradient section with app icon
- Feature list: Push notifications, 3x faster, Mobile-optimized, Biometric lock
- CTA buttons: "Mở trong ứng dụng" + Store buttons

### Mobile Onboarding Prompt
- First visit prompt (sessionStorage)
- Bottom sheet with welcome message
