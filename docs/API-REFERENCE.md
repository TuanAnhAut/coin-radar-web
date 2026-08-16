# API Reference

Complete REST API documentation. All endpoints return JSON.

**Base URL**: `/api` (relative path, proxied through gateway)

**Response format**:
```json
{
  "data": <object or array>,
  "total": <number>,        // optional, for list endpoints
  "unreadCount": <number>   // optional, for notifications
}
```

---

## Asset Endpoints

### GET /api/assets
List all assets with optional filtering.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | No | Filter by asset type: `stock`, `crypto`, `gold` |
| `search` | string | No | Search by symbol or name (substring match) |

**Response:**
```json
{
  "data": [
    {
      "id": "btc-001",
      "symbol": "BTC",
      "name": "Bitcoin",
      "price": 67500.00,
      "change24h": 1250.50,
      "changePercent": 1.89,
      "volume": 28500000000,
      "marketCap": 1325000000000,
      "type": "crypto",
      "logo": "/logos/btc.svg"
    }
  ],
  "total": 20
}
```

### GET /api/assets/[symbol]
Get detailed asset information with chart data and indicators.

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `symbol` | string | Asset symbol (e.g., `BTC`, `FPT`, `SJC`, `VNINDEX`) |

**Response:**
```json
{
  "data": {
    "id": "btc-001",
    "symbol": "BTC",
    "name": "Bitcoin",
    "price": 67500.00,
    "change24h": 1250.50,
    "changePercent": 1.89,
    "volume": 28500000000,
    "marketCap": 1325000000000,
    "type": "crypto",
    "logo": "/logos/btc.svg",
    "description": "Bitcoin is a decentralized digital currency...",
    "high52w": 73750.00,
    "low52w": 38500.00,
    "avgVolume30d": 25000000000,
    "priceHistory": [
      { "date": "2024-01-15", "open": 42000, "high": 43500, "low": 41500, "close": 43000, "volume": 25000000000 }
    ],
    "technicalIndicators": {
      "rsi": 65.5,
      "macd": { "macd": 250.5, "signal": 200.3, "histogram": 50.2 },
      "ma20": 66000.00,
      "ma50": 62000.00,
      "atr": 850.00,
      "volumeAvg20": 24000000000
    },
    "relatedNews": [
      { "id": "n1", "title": "Bitcoin ETF inflows surge", "summary": "...", "publishedAt": "2024-01-15", "category": "crypto" }
    ]
  }
}
```

### GET /api/assets/[symbol]/chart
Get chart data (OHLC) for a specific asset.

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `symbol` | string | Asset symbol |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `days` | number | 365 | Number of days of data (max 1825) |

**Response:**
```json
{
  "data": [
    { "date": "2024-01-15", "open": 42000, "high": 43500, "low": 41500, "close": 43000, "volume": 25000000000 }
  ],
  "meta": {
    "symbol": "BTC",
    "days": 365,
    "generatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Alert Endpoints

### GET /api/alerts
List user alerts with filtering.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | No | Filter: `active`, `triggered`, `history` |
| `type` | string | No | Filter by asset type: `stock`, `crypto`, `gold` |
| `limit` | number | No | Limit results (e.g., `5` for recent) |

**Response:**
```json
{
  "data": [
    {
      "id": "alert-001",
      "assetSymbol": "BTC",
      "assetName": "Bitcoin",
      "type": "default",
      "condition": "rsi_below_30",
      "status": "active",
      "riskLevel": "medium",
      "createdAt": "2024-01-10T08:00:00Z",
      "triggeredAt": null,
      "conditionDescription": "RSI giảm xuống dưới 30",
      "indicatorType": "RSI",
      "value": 30,
      "threshold": 30
    }
  ],
  "total": 8
}
```

### POST /api/alerts
Create a new alert.

**Request Body:**
```json
{
  "assetSymbol": "BTC",
  "assetName": "Bitcoin",
  "type": "custom",
  "condition": "price_above",
  "conditionDescription": "Giá BTC vượt 70,000 USD",
  "riskLevel": "high",
  "indicatorType": "price",
  "value": 70000,
  "threshold": 70000
}
```

**Response** (201 Created):
```json
{
  "data": {
    "id": "alert-new-001",
    "assetSymbol": "BTC",
    "assetName": "Bitcoin",
    "type": "custom",
    "condition": "price_above",
    "status": "active",
    "riskLevel": "high",
    "createdAt": "2024-01-15T10:30:00Z",
    "triggeredAt": null,
    "conditionDescription": "Giá BTC vượt 70,000 USD",
    "indicatorType": "price",
    "value": 70000,
    "threshold": 70000
  }
}
```

### GET /api/alerts/[id]
Get a single alert by ID.

**Response:** Same as single alert object in list response.

### PATCH /api/alerts/[id]
Update alert status.

**Request Body:**
```json
{
  "status": "disabled"
}
```
or
```json
{
  "status": "active"
}
```

**Response:** Updated alert object.

### DELETE /api/alerts/[id]
Delete an alert.

**Response:**
```json
{
  "success": true,
  "id": "alert-001"
}
```

### GET /api/alert-templates
List all available alert templates.

**Response:**
```json
{
  "data": [
    {
      "id": "tpl-001",
      "name": "RSI Quá bán",
      "description": "Cảnh báo khi RSI giảm xuống dưới mức 30 (quá bán)",
      "condition": "rsi_below_30",
      "indicatorType": "RSI",
      "assetType": "all",
      "riskLevel": "medium"
    }
  ]
}
```

---

## News Endpoints

### GET /api/news
List all news articles.

**Response:**
```json
{
  "data": [
    {
      "id": "news-001",
      "title": "VN-Index tăng điểm thứ 3 liên tiếp",
      "summary": "Chỉ số VN-Index tiếp tục tăng...",
      "content": "# VN-Index tăng điểm\n\nNội dung chi tiết bài viết bằng **Markdown**...",
      "source": "CafeF",
      "publishedAt": "2024-01-15T08:00:00Z",
      "category": "stock",
      "tags": ["VN-Index", "Chứng khoán"],
      "imageUrl": "/images/news/001.jpg",
      "importance": "important"
    }
  ]
}
```

---

## Expert Endpoints

### GET /api/experts
List all AI expert analysts.

**Response:**
```json
{
  "data": [
    {
      "id": "expert-001",
      "name": "Nguyễn Minh Khoa",
      "avatar": "/avatars/expert1.jpg",
      "specialty": "Phân tích chứng khoán",
      "rating": 4.8,
      "reviewCount": 156,
      "onlineStatus": "online",
      "bio": "Chuyên gia phân tích kỹ thuật với 15 năm kinh nghiệm...",
      "recentAnalysisCount": 234,
      "accuracyPercent": 85.5
    }
  ]
}
```

---

## Chat Endpoints

### GET /api/chat/[expertId]/messages
Get chat history with an expert.

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `expertId` | string | Expert ID |

**Response (new conversation):**
```json
{
  "data": [
    {
      "id": "msg-welcome",
      "role": "system",
      "content": "Chào bạn! Tôi là Nguyễn Minh Khoa, chuyên gia phân tích chứng khoán...",
      "createdAt": "2024-01-15T10:00:00Z",
      "expertId": "expert-001"
    }
  ]
}
```

### POST /api/chat/[expertId]/messages
Send a message to an expert.

**Request Body:**
```json
{
  "message": "Tình hình thị trường chứng khoán hôm nay thế nào?"
}
```

**Response:**
```json
{
  "data": {
    "userMessage": {
      "id": "msg-user-001",
      "role": "user",
      "content": "Tình hình thị trường chứng khoán hôm nay thế nào?",
      "createdAt": "2024-01-15T10:01:00Z",
      "expertId": "expert-001"
    },
    "expertMessage": {
      "id": "msg-expert-001",
      "role": "expert",
      "content": "Chào bạn! Hôm nay thị trường chứng khoán Việt Nam...",
      "createdAt": "2024-01-15T10:01:05Z",
      "expertId": "expert-001"
    }
  }
}
```

> **Note**: This endpoint uses AI (ZAI SDK) to generate expert responses in Vietnamese.

---

## Portfolio Endpoint

### GET /api/portfolio
Get user portfolio summary.

**Response:**
```json
{
  "data": {
    "totalValue": 1250000000,
    "dailyChange": 15000000,
    "dailyChangePercent": 1.22,
    "monthlyChange": 45000000,
    "monthlyChangePercent": 3.73,
    "riskScore": 42,
    "assets": [
      {
        "symbol": "FPT",
        "name": "FPT Corp",
        "type": "stock",
        "quantity": 100,
        "avgPrice": 85000,
        "currentPrice": 92000,
        "pnl": 700000,
        "pnlPercent": 8.24,
        "allocationPercent": 60
      }
    ]
  }
}
```

---

## Watchlist Endpoint

### GET /api/watchlist
Get user's watchlist.

**Response:**
```json
{
  "data": [
    {
      "id": "wl-001",
      "assetSymbol": "BTC",
      "assetName": "Bitcoin",
      "assetType": "crypto",
      "price": 67500.00,
      "change24h": 1250.50,
      "changePercent": 1.89,
      "addedAt": "2024-01-10T08:00:00Z"
    }
  ],
  "total": 5
}
```

### POST /api/watchlist
Add asset to watchlist.

**Request Body:**
```json
{
  "assetSymbol": "ETH",
  "assetName": "Ethereum",
  "assetType": "crypto",
  "price": 3500.00,
  "change24h": 50.00,
  "changePercent": 1.45
}
```

**Response** (201 Created): New WatchlistItem object.

---

## Notifications Endpoint

### GET /api/notifications
Get user notifications.

**Response:**
```json
{
  "data": [
    {
      "id": "notif-001",
      "type": "alert_triggered",
      "title": "Cảnh báo BTC kích hoạt",
      "message": "RSI của Bitcoin đã giảm xuống dưới 30",
      "read": false,
      "createdAt": "2024-01-15T09:30:00Z",
      "iconType": "alert"
    }
  ],
  "total": 5,
  "unreadCount": 3
}
```

---

## Scanner Endpoint

### GET /api/scanner
Run risk scan across all assets.

**Response:**
```json
{
  "data": {
    "totalAnomalies": 7,
    "highRisk": 2,
    "mediumRisk": 3,
    "lowRisk": 2,
    "scannedAt": "2024-01-15T10:00:00Z",
    "results": [
      {
        "assetSymbol": "VIC",
        "assetName": "Vingroup",
        "assetType": "stock",
        "price": 42000,
        "anomalyType": "rsi_oversold",
        "anomalyLabel": "RSI Quá bán",
        "anomalyDescription": "RSI đã giảm xuống mức 22.5, dưới ngưỡng quá bán 30",
        "severity": "high",
        "detectedAt": "2024-01-15T10:00:00Z",
        "currentValue": 22.5,
        "normalRange": "30 - 70"
      }
    ]
  }
}
```

---

## Auth Endpoints

### POST /api/auth/login
Authenticate user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (success):**
```json
{
  "user": {
    "id": "user-001",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "avatarUrl": null,
    "plan": "free",
    "twoFactorEnabled": false,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "jwt-token-here"
}
```

**Response (2FA required):**
```json
{
  "requireTwoFactor": true,
  "userId": "user-001",
  "email": "user@example.com"
}
```

**Error Responses:**
- `400` — Missing email or password
- `404` — User not found
- `401` — Wrong password

### POST /api/auth/register
Register new user.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "Password123!",
  "fullName": "Nguyễn Văn B",
  "phone": "0901234568"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã gửi mã xác minh đến email"
}
```

**Error Responses:**
- `400` — Missing required fields
- `409` — Email already exists

### POST /api/auth/forgot-password
Request password reset OTP.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã gửi mã xác minh đến email"
}
```

### POST /api/auth/verify-otp
Verify OTP code.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "type": "register"
}
```
> `type` can be: `register`, `forgot-password`, `login`

**Response (register/login):**
```json
{
  "user": { ... },
  "token": "jwt-token-here"
}
```

**Response (forgot-password):**
```json
{
  "success": true,
  "message": "Xác minh thành công. Bạn có thể đặt lại mật khẩu."
}
```

---

## User Profile Endpoints

### GET /api/user/profile
Get current user profile.

**Response:**
```json
{
  "id": "user-001",
  "fullName": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0901234567",
  "dateOfBirth": "1990-05-15",
  "address": "TP. Hồ Chí Minh",
  "avatarUrl": null,
  "accountId": "CR-2024-0001",
  "plan": "free",
  "createdAt": "2024-01-01T00:00:00Z",
  "twoFactorEnabled": false
}
```

### PUT /api/user/profile
Update user profile.

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A Updated",
  "phone": "0901234567",
  "dateOfBirth": "1990-05-15",
  "address": "Hà Nội"
}
```

### POST /api/user/password
Change password.

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}
```

**Validation Rules:**
- All fields required
- New password ≥ 8 characters
- ≥ 1 uppercase letter
- ≥ 1 digit
- ≥ 1 special character
- New password must match confirm
- New password must differ from current

### GET /api/user/two-factor
Get 2FA status.

**Response:**
```json
{
  "enabled": false,
  "enabledAt": null,
  "recoveryCodesRemaining": 10,
  "method": "totp"
}
```

### POST /api/user/two-factor
Setup/verify/disable 2FA.

**Setup:**
```json
{ "action": "setup" }
```
**Response:**
```json
{
  "success": true,
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "otpauth://totp/...",
  "recoveryCodes": ["abc123", "def456", ...]
}
```

**Verify:**
```json
{ "action": "verify", "code": "123456" }
```

**Disable:**
```json
{ "action": "disable" }
```
