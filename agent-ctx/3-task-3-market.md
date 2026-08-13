# Task 3: Market Overview, Asset Detail, Risk Scanner, Watchlist, News Detail

## Files Created
- `src/lib/format.ts` - Shared formatting utilities
- `src/components/market/market-overview.tsx` - Main market view with tabs, search, filters, table/card
- `src/components/market/asset-detail-sheet.tsx` - Asset detail overlay with chart, stats, actions, news
- `src/components/market/risk-scanner-sheet.tsx` - Risk scanner overlay with severity grouping
- `src/components/market/watchlist-sheet.tsx` - Watchlist management overlay
- `src/components/market/news-detail-sheet.tsx` - News detail overlay with markdown

## Files Updated
- `src/components/layout/app-layout.tsx` - Wired in MarketOverview view and 4 overlay sheets

## API Endpoints Used
- GET /api/assets?type=stock|crypto|gold&search=query
- GET /api/assets/[symbol]
- GET /api/scanner
- GET /api/watchlist
- POST /api/watchlist
- GET /api/news

## Lint Status
All files pass ESLint with zero errors.

## Key Decisions
- Used derived loading state pattern (null check) instead of setLoading(true) in effects to satisfy React 19 lint rules
- Moved SortIcon component outside render function to satisfy static-components rule
- Used fetchIdRef pattern for cancellation instead of cancelled boolean in closures