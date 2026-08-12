import { NextResponse } from 'next/server';
import type { Asset } from '@/lib/types';

const mockAssets: Asset[] = [
  // Stocks
  {
    id: 'vnindex',
    symbol: 'VNINDEX',
    name: 'VN-Index',
    price: 1342.67,
    change24h: 8.34,
    changePercent: 0.63,
    volume: 982_450_000,
    marketCap: 0,
    type: 'stock',
    logo: '/logos/vnindex.png',
  },
  {
    id: 'fpt',
    symbol: 'FPT',
    name: 'FPT Corp',
    price: 142500,
    change24h: 3500,
    changePercent: 2.52,
    volume: 3_240_000,
    marketCap: 437_250_000_000_000,
    type: 'stock',
    logo: '/logos/fpt.png',
  },
  {
    id: 'vnm',
    symbol: 'VNM',
    name: 'Vinamilk',
    price: 72500,
    change24h: -800,
    changePercent: -1.09,
    volume: 1_890_000,
    marketCap: 168_410_000_000_000,
    type: 'stock',
    logo: '/logos/vnm.png',
  },
  {
    id: 'vic',
    symbol: 'VIC',
    name: 'Vingroup',
    price: 48200,
    change24h: -300,
    changePercent: -0.62,
    volume: 5_670_000,
    marketCap: 432_790_000_000_000,
    type: 'stock',
    logo: '/logos/vic.png',
  },
  {
    id: 'hpg',
    symbol: 'HPG',
    name: 'Hòa Phát Group',
    price: 31500,
    change24h: 700,
    changePercent: 2.27,
    volume: 7_120_000,
    marketCap: 144_700_000_000_000,
    type: 'stock',
    logo: '/logos/hpg.png',
  },
  {
    id: 'mbb',
    symbol: 'MBB',
    name: 'Ngân hàng TMCP Quân đội',
    price: 25800,
    change24h: 200,
    changePercent: 0.78,
    volume: 8_450_000,
    marketCap: 361_200_000_000_000,
    type: 'stock',
    logo: '/logos/mbb.png',
  },
  {
    id: 'vcb',
    symbol: 'VCB',
    name: 'Ngân hàng Vietcombank',
    price: 98500,
    change24h: 500,
    changePercent: 0.51,
    volume: 2_340_000,
    marketCap: 361_200_000_000_000,
    type: 'stock',
    logo: '/logos/vcb.png',
  },
  {
    id: 'vhm',
    symbol: 'VHM',
    name: 'Vinhomes',
    price: 38600,
    change24h: -450,
    changePercent: -1.15,
    volume: 4_560_000,
    marketCap: 279_690_000_000_000,
    type: 'stock',
    logo: '/logos/vhm.png',
  },
  {
    id: 'tcb',
    symbol: 'TCB',
    name: 'Ngân hàng Techcombank',
    price: 31200,
    change24h: 350,
    changePercent: 1.13,
    volume: 3_890_000,
    marketCap: 236_500_000_000_000,
    type: 'stock',
    logo: '/logos/tcb.png',
  },
  {
    id: 'gvr',
    symbol: 'GVR',
    name: 'Tập đoàn Vinacapital',
    price: 52300,
    change24h: -600,
    changePercent: -1.13,
    volume: 2_150_000,
    marketCap: 195_600_000_000_000,
    type: 'stock',
    logo: '/logos/gvr.png',
  },
  // Crypto
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 104850.5,
    change24h: 2340.3,
    changePercent: 2.28,
    volume: 42_500_000_000,
    marketCap: 2_060_000_000_000,
    type: 'crypto',
    logo: '/logos/btc.png',
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3892.45,
    change24h: -67.8,
    changePercent: -1.71,
    volume: 18_200_000_000,
    marketCap: 468_000_000_000,
    type: 'crypto',
    logo: '/logos/eth.png',
  },
  {
    id: 'bnb',
    symbol: 'BNB',
    name: 'BNB',
    price: 712.8,
    change24h: 15.4,
    changePercent: 2.21,
    volume: 2_100_000_000,
    marketCap: 103_000_000_000,
    type: 'crypto',
    logo: '/logos/bnb.png',
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    price: 178.92,
    change24h: 8.67,
    changePercent: 5.09,
    volume: 4_800_000_000,
    marketCap: 82_500_000_000,
    type: 'crypto',
    logo: '/logos/sol.png',
  },
  {
    id: 'xrp',
    symbol: 'XRP',
    name: 'XRP',
    price: 2.48,
    change24h: -0.12,
    changePercent: -4.62,
    volume: 3_600_000_000,
    marketCap: 142_000_000_000,
    type: 'crypto',
    logo: '/logos/xrp.png',
  },
  {
    id: 'ada',
    symbol: 'ADA',
    name: 'Cardano',
    price: 0.982,
    change24h: 0.034,
    changePercent: 3.59,
    volume: 1_200_000_000,
    marketCap: 34_800_000_000,
    type: 'crypto',
    logo: '/logos/ada.png',
  },
  // Gold
  {
    id: 'gold-sjc',
    symbol: 'SJC',
    name: 'Vàng SJC',
    price: 94500000,
    change24h: 300000,
    changePercent: 0.32,
    volume: 0,
    marketCap: 0,
    type: 'gold',
    logo: '/logos/sjc.png',
  },
  {
    id: 'gold-world',
    symbol: 'XAU',
    name: 'Vàng thế giới',
    price: 2684.5,
    change24h: 18.7,
    changePercent: 0.70,
    volume: 0,
    marketCap: 0,
    type: 'gold',
    logo: '/logos/xau.png',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const search = searchParams.get('search');

  let filtered = [...mockAssets];

  if (type) {
    filtered = filtered.filter((a) => a.type === type);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.symbol.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    data: filtered,
    total: filtered.length,
  });
}
