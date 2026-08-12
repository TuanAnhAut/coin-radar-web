import { NextResponse } from 'next/server';
import type { WatchlistItem } from '@/lib/types';

const mockWatchlist: WatchlistItem[] = [
  {
    id: 'wl-1',
    assetSymbol: 'FPT',
    assetName: 'FPT Corp',
    assetType: 'stock',
    price: 142_500,
    change24h: 3_500,
    changePercent: 2.52,
    addedAt: '2025-01-02T08:00:00Z',
  },
  {
    id: 'wl-2',
    assetSymbol: 'BTC',
    assetName: 'Bitcoin',
    assetType: 'crypto',
    price: 104_850.5,
    change24h: 2_340.3,
    changePercent: 2.28,
    addedAt: '2025-01-03T10:00:00Z',
  },
  {
    id: 'wl-3',
    assetSymbol: 'SJC',
    assetName: 'Vàng SJC',
    assetType: 'gold',
    price: 94_500_000,
    change24h: 300_000,
    changePercent: 0.32,
    addedAt: '2025-01-05T09:30:00Z',
  },
  {
    id: 'wl-4',
    assetSymbol: 'HPG',
    assetName: 'Hòa Phát Group',
    assetType: 'stock',
    price: 31_500,
    change24h: 700,
    changePercent: 2.27,
    addedAt: '2025-01-07T14:00:00Z',
  },
  {
    id: 'wl-5',
    assetSymbol: 'SOL',
    assetName: 'Solana',
    assetType: 'crypto',
    price: 178.92,
    change24h: 8.67,
    changePercent: 5.09,
    addedAt: '2025-01-09T11:00:00Z',
  },
  {
    id: 'wl-6',
    assetSymbol: 'VNM',
    assetName: 'Vinamilk',
    assetType: 'stock',
    price: 72_500,
    change24h: -800,
    changePercent: -1.09,
    addedAt: '2025-01-10T08:30:00Z',
  },
];

export async function GET() {
  return NextResponse.json({
    data: mockWatchlist,
    total: mockWatchlist.length,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const newItem: WatchlistItem = {
    id: `wl-${Date.now()}`,
    assetSymbol: body.assetSymbol,
    assetName: body.assetName,
    assetType: body.assetType,
    price: body.price ?? 0,
    change24h: body.change24h ?? 0,
    changePercent: body.changePercent ?? 0,
    addedAt: new Date().toISOString(),
  };

  return NextResponse.json({ data: newItem }, { status: 201 });
}
