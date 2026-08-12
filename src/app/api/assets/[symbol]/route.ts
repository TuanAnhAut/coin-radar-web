import { NextResponse } from 'next/server';
import type { AssetDetail, OHLCData, TechnicalIndicators, RelatedNews } from '@/lib/types';

function generateOHLC(basePrice: number, days: number, volatility: number): OHLCData[] {
  const data: OHLCData[] = [];
  let price = basePrice * (1 - volatility * 0.05 * days / 20);
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const change = (Math.random() - 0.48) * volatility * price;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * price * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * price * 0.5;
    const volume = Math.floor(Math.random() * 5_000_000 + 500_000);

    data.push({
      date: dateStr,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });

    price = close;
  }
  return data;
}

function generateRelatedNews(symbol: string, name: string): RelatedNews[] {
  const newsPool: Record<string, RelatedNews[]> = {
    default: [
      {
        id: 'n1',
        title: `${name} tăng mạnh trong phiên giao dịch sáng`,
        summary: `Khối lượng giao dịch ${symbol} tăng đột biến trong phiên sáng nay.`,
        publishedAt: '2025-01-14T09:30:00Z',
        category: 'stock',
      },
      {
        id: 'n2',
        title: `Phân tích kỹ thuật ${symbol}: Đang ở vùng quá mua?`,
        summary: `Các chỉ báo kỹ thuật cho thấy ${symbol} có thể cần điều chỉnh trong ngắn hạn.`,
        publishedAt: '2025-01-13T14:00:00Z',
        category: 'micro',
      },
      {
        id: 'n3',
        title: `${name} công bố kết quả kinh doanh quý 4/2024`,
        summary: `Doanh thu và lợi nhuận của ${name} đều vượt kỳ vọng của thị trường.`,
        publishedAt: '2025-01-12T16:00:00Z',
        category: 'micro',
      },
    ],
  };
  return newsPool.default;
}

const assetDetails: Record<string, Omit<AssetDetail, 'priceHistory' | 'technicalIndicators' | 'relatedNews'>> = {
  VNINDEX: {
    id: 'vnindex', symbol: 'VNINDEX', name: 'VN-Index', price: 1342.67,
    change24h: 8.34, changePercent: 0.63, volume: 982_450_000, marketCap: 0,
    type: 'stock', logo: '/logos/vnindex.png', high52w: 1420.35, low52w: 1156.78,
    avgVolume30d: 850_000_000,
    description: 'VN-Index là chỉ số đại diện cho thị trường chứng khoán Việt Nam, được tính toán dựa trên giá trị vốn hóa thị trường của các cổ phiếu niêm yết trên cả hai sàn HOSE và HNX.',
  },
  FPT: {
    id: 'fpt', symbol: 'FPT', name: 'FPT Corp', price: 142500,
    change24h: 3500, changePercent: 2.52, volume: 3_240_000, marketCap: 437_250_000_000_000,
    type: 'stock', logo: '/logos/fpt.png', high52w: 158000, low52w: 98700,
    avgVolume30d: 2_800_000,
    description: 'Công ty Cổ phần FPT là tập đoàn công nghệ hàng đầu Việt Nam với các mảng công nghệ thông tin, viễn thông và giáo dục.',
  },
  BTC: {
    id: 'btc', symbol: 'BTC', name: 'Bitcoin', price: 104850.5,
    change24h: 2340.3, changePercent: 2.28, volume: 42_500_000_000, marketCap: 2_060_000_000_000,
    type: 'crypto', logo: '/logos/btc.png', high52w: 109500, low52w: 52400,
    avgVolume30d: 35_000_000_000,
    description: 'Bitcoin là loại tiền kỹ thuật số phi tập trung đầu tiên và lớn nhất thế giới, được tạo ra bởi Satoshi Nakamoto vào năm 2009.',
  },
  ETH: {
    id: 'eth', symbol: 'ETH', name: 'Ethereum', price: 3892.45,
    change24h: -67.8, changePercent: -1.71, volume: 18_200_000_000, marketCap: 468_000_000_000,
    type: 'crypto', logo: '/logos/eth.png', high52w: 4200, low52w: 2100,
    avgVolume30d: 15_000_000_000,
    description: 'Ethereum là nền tảng blockchain hỗ trợ smart contract và ứng dụng phi tập trung (dApps), với đồng tiền mã hóa ETH là token native.',
  },
  SJC: {
    id: 'gold-sjc', symbol: 'SJC', name: 'Vàng SJC', price: 94500000,
    change24h: 300000, changePercent: 0.32, volume: 0, marketCap: 0,
    type: 'gold', logo: '/logos/sjc.png', high52w: 98000000, low52w: 72000000,
    avgVolume30d: 0,
    description: 'Vàng miếng SJC là sản phẩm vàng trang sức do Công ty TNHH Vàng bạc Đá quý SJC sản xuất, được giao dịch rộng rãi tại Việt Nam.',
  },
};

function getTechnicalIndicators(symbol: string): TechnicalIndicators {
  const rsiMap: Record<string, number> = {
    VNINDEX: 62.4, FPT: 73.8, VNM: 41.2, VIC: 38.5, HPG: 68.1,
    MBB: 55.3, VCB: 58.7, VHM: 35.2, TCB: 61.4, GVR: 42.8,
    BTC: 71.2, ETH: 45.6, BNB: 66.3, SOL: 78.4, XRP: 29.1, ADA: 64.5,
    SJC: 58.9, XAU: 62.1,
  };

  const rsi = rsiMap[symbol] ?? 50;
  const macdVal = (Math.random() - 0.3) * 10;
  const signal = (Math.random() - 0.3) * 10;

  return {
    rsi,
    macd: {
      macd: parseFloat(macdVal.toFixed(2)),
      signal: parseFloat(signal.toFixed(2)),
      histogram: parseFloat((macdVal - signal).toFixed(2)),
    },
    ma20: 0,
    ma50: 0,
    atr: 0,
    volumeAvg20: 0,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const key = symbol.toUpperCase();
  const base = assetDetails[key];

  if (!base) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  const volatility = base.type === 'crypto' ? 0.04 : base.type === 'gold' ? 0.015 : 0.025;
  const priceHistory = generateOHLC(base.price, 30, volatility);
  const technicalIndicators = getTechnicalIndicators(key);
  technicalIndicators.ma20 = priceHistory.slice(-20).reduce((s, d) => s + d.close, 0) / 20;
  technicalIndicators.ma50 = base.price * (0.95 + Math.random() * 0.08);
  technicalIndicators.atr = base.price * volatility * (0.8 + Math.random() * 0.4);
  technicalIndicators.volumeAvg20 = Math.floor(priceHistory.slice(-20).reduce((s, d) => s + d.volume, 0) / 20);
  const relatedNews = generateRelatedNews(key, base.name);

  return NextResponse.json({
    data: {
      ...base,
      priceHistory,
      technicalIndicators,
      relatedNews,
    },
  });
}
