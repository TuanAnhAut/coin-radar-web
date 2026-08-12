import { NextResponse } from 'next/server';
import type { Portfolio } from '@/lib/types';

const mockPortfolio: Portfolio = {
  totalValue: 523_450_000,
  dailyChange: 8_750_000,
  dailyChangePercent: 1.70,
  monthlyChange: 32_180_000,
  monthlyChangePercent: 6.55,
  riskScore: 58,
  assets: [
    {
      symbol: 'FPT',
      name: 'FPT Corp',
      type: 'stock',
      quantity: 200,
      avgPrice: 125_000,
      currentPrice: 142_500,
      pnl: 3_500_000,
      pnlPercent: 14.0,
      allocationPercent: 5.4,
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      type: 'crypto',
      quantity: 0.15,
      avgPrice: 95_000,
      currentPrice: 104_850.5,
      pnl: 1_477.58,
      pnlPercent: 10.37,
      allocationPercent: 30.0,
    },
    {
      symbol: 'HPG',
      name: 'Hòa Phát Group',
      type: 'stock',
      quantity: 300,
      avgPrice: 29_500,
      currentPrice: 31_500,
      pnl: 600_000,
      pnlPercent: 6.78,
      allocationPercent: 18.1,
    },
    {
      symbol: 'VCB',
      name: 'Ngân hàng Vietcombank',
      type: 'stock',
      quantity: 50,
      avgPrice: 102_000,
      currentPrice: 98_500,
      pnl: -175_000,
      pnlPercent: -3.43,
      allocationPercent: 9.4,
    },
    {
      symbol: 'SJC',
      name: 'Vàng SJC',
      type: 'gold',
      quantity: 0.5,
      avgPrice: 88_000_000,
      currentPrice: 94_500_000,
      pnl: 3_250_000,
      pnlPercent: 7.39,
      allocationPercent: 9.0,
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      type: 'crypto',
      quantity: 0.8,
      avgPrice: 4_100,
      currentPrice: 3_892.45,
      pnl: -166.04,
      pnlPercent: -5.06,
      allocationPercent: 28.1,
    },
  ],
};

export async function GET() {
  return NextResponse.json({ data: mockPortfolio });
}
