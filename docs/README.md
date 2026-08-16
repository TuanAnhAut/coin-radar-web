# CoinRadar - Documentation for Flutter Reimplementation

## Overview

CoinRadar is a **Vietnamese-language financial tracking and alerting platform** covering:
- **Stocks** (Chứng khoán VN)
- **Crypto** (Bitcoin, Ethereum, Altcoins)
- **Gold** (Vàng miếng SJC, Vàng thế giới XAU)

The app features real-time market data, smart alerts, AI-powered expert chat, professional candlestick charts with drawing tools, portfolio tracking, and a risk scanner.

## Target Platforms (Flutter)

| Platform | Status | Notes |
|----------|--------|-------|
| Android | Primary | Material 3 + Custom theme |
| iOS | Primary | Cupertino + Adaptive icons |
| Web | Secondary | Responsive (mobile/tablet/desktop) |

## Documentation Index

| File | Description |
|------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, patterns, state management |
| [DATA-MODELS.md](./DATA-MODELS.md) | All TypeScript types → Dart models |
| [API-REFERENCE.md](./API-REFERENCE.md) | Complete REST API documentation (20+ endpoints) |
| [SCREENS.md](./SCREENS.md) | All 6 main views + 20+ overlays/sheets with UI specs |
| [NAVIGATION.md](./NAVIGATION.md) | Navigation flow, auth gating, view routing |
| [THEME-DESIGN.md](./THEME-DESIGN.md) | Color system, typography, spacing, dark/light mode |
| [FEATURES.md](./FEATURES.md) | Feature specifications per module |

## Language

All user-facing text is in **Vietnamese (Tiếng Việt)**. Date/time formatting uses Vietnamese locale.

## Core Tech Stack (Current Web → Flutter Mapping)

| Current (Web) | Flutter Equivalent |
|---------------|-------------------|
| Next.js 16 App Router | Flutter GoRouter / AutoRouter |
| Zustand state management | Riverpod / Bloc /GetX |
| Framer Motion animations | Flutter Animations / Rive |
| shadcn/ui components | Custom Material/Cupertino widgets |
| HTML5 Canvas chart | `fl_chart` or custom `CustomPainter` |
| Tailwind CSS 4 | Flutter ThemeData + custom extensions |
| TanStack Query | `flutter_riverpod` + async providers |
| Prisma/SQLite | `drift` (SQLite) / `hive` (local) |
| Socket.io | `socket_io_client` for real-time |

## Quick Start for AI Agent

1. Read **DATA-MODELS.md** first to understand all data structures
2. Read **API-REFERENCE.md** to understand backend integration
3. Read **SCREENS.md** for detailed UI specifications
4. Read **NAVIGATION.md** for routing and auth flow
5. Read **THEME-DESIGN.md** for visual design system
6. Read **ARCHITECTURE.md** for architectural patterns
7. Read **FEATURES.md** for feature specifications

## Project Structure (Suggested Flutter)

```
coin_radar_flutter/
├── lib/
│   ├── main.dart
│   ├── app/
│   │   ├── router.dart          # GoRouter config
│   │   ├── theme.dart            # ThemeData light/dark
│   │   └── constants.dart        # Colors, spacing, text styles
│   ├── models/
│   │   ├── asset.dart
│   │   ├── alert.dart
│   │   ├── news.dart
│   │   ├── expert.dart
│   │   ├── chat.dart
│   │   ├── portfolio.dart
│   │   ├── notification.dart
│   │   ├── scanner.dart
│   │   └── user.dart
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── navigation_provider.dart
│   │   ├── market_provider.dart
│   │   ├── alert_provider.dart
│   │   ├── news_provider.dart
│   │   ├── chat_provider.dart
│   │   └── settings_provider.dart
│   ├── services/
│   │   ├── api_client.dart       # HTTP client (Dio)
│   │   ├── auth_service.dart
│   │   ├── market_service.dart
│   │   ├── alert_service.dart
│   │   ├── news_service.dart
│   │   ├── chat_service.dart
│   │   ├── portfolio_service.dart
│   │   └── websocket_service.dart
│   ├── screens/
│   │   ├── home/
│   │   ├── news/
│   │   ├── market/
│   │   ├── alerts/
│   │   ├── chat/
│   │   ├── profile/
│   │   ├── chart/
│   │   └── auth/
│   ├── widgets/
│   │   ├── charts/
│   │   │   ├── candlestick_chart.dart
│   │   │   ├── chart_tools.dart
│   │   │   └── indicators.dart
│   │   ├── common/
│   │   │   ├── asset_card.dart
│   │   │   ├── alert_card.dart
│   │   │   ├── news_card.dart
│   │   │   └── gain_loss_badge.dart
│   │   ├── layout/
│   │   │   ├── app_header.dart
│   │   │   ├── bottom_nav.dart
│   │   │   └── sidebar.dart
│   │   └── sheets/
│   │       ├── asset_detail_sheet.dart
│   │       ├── alert_builder_sheet.dart
│   │       └── ...
│   └── utils/
│       ├── formatters.dart
│       ├── validators.dart
│       └── helpers.dart
├── pubspec.yaml
└── README.md
```
