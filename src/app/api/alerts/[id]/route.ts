import { NextResponse } from 'next/server';
import type { Alert } from '@/lib/types';

const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    assetSymbol: 'FPT',
    assetName: 'FPT Corp',
    type: 'default',
    condition: 'RSI > 70',
    status: 'active',
    riskLevel: 'high',
    createdAt: '2025-01-10T08:00:00Z',
    triggeredAt: null,
    conditionDescription: 'Chỉ số RSI của FPT vượt mức 70, cảnh báo vùng quá mua',
    indicatorType: 'RSI',
    value: 73.8,
    threshold: 70,
  },
  {
    id: 'alert-2',
    assetSymbol: 'BTC',
    assetName: 'Bitcoin',
    type: 'custom',
    condition: 'Giá > 105,000 USD',
    status: 'active',
    riskLevel: 'medium',
    createdAt: '2025-01-08T14:30:00Z',
    triggeredAt: null,
    conditionDescription: 'Giá Bitcoin vượt mức 105,000 USD',
    indicatorType: 'price',
    value: 104850.5,
    threshold: 105000,
  },
  {
    id: 'alert-3',
    assetSymbol: 'VNINDEX',
    assetName: 'VN-Index',
    type: 'default',
    condition: 'MACD cắt xuống tín hiệu',
    status: 'triggered',
    riskLevel: 'high',
    createdAt: '2025-01-06T09:15:00Z',
    triggeredAt: '2025-01-12T10:30:00Z',
    conditionDescription: 'Đường MACD cắt xuống đường tín hiệu, tín hiệu bán',
    indicatorType: 'MACD',
  },
  {
    id: 'alert-4',
    assetSymbol: 'SJC',
    assetName: 'Vàng SJC',
    type: 'custom',
    condition: 'Giá > 95,000,000 VNĐ',
    status: 'active',
    riskLevel: 'medium',
    createdAt: '2025-01-09T11:00:00Z',
    triggeredAt: null,
    conditionDescription: 'Giá vàng SJC vượt 95 triệu đồng/lượng',
    indicatorType: 'price',
    value: 94500000,
    threshold: 95000000,
  },
  {
    id: 'alert-5',
    assetSymbol: 'SOL',
    assetName: 'Solana',
    type: 'default',
    condition: 'RSI > 75',
    status: 'triggered',
    riskLevel: 'high',
    createdAt: '2025-01-07T16:00:00Z',
    triggeredAt: '2025-01-13T08:45:00Z',
    conditionDescription: 'RSI Solana ở mức 78.4, vùng quá mua mạnh',
    indicatorType: 'RSI',
    value: 78.4,
    threshold: 75,
  },
  {
    id: 'alert-6',
    assetSymbol: 'VIC',
    assetName: 'Vingroup',
    type: 'default',
    condition: 'Giá cắt mất MA20',
    status: 'active',
    riskLevel: 'medium',
    createdAt: '2025-01-11T09:00:00Z',
    triggeredAt: null,
    conditionDescription: 'Giá VIC hiện dưới đường trung bình động 20 ngày',
    indicatorType: 'MA',
  },
  {
    id: 'alert-7',
    assetSymbol: 'ETH',
    assetName: 'Ethereum',
    type: 'custom',
    condition: 'Khối lượng > 20,000,000,000',
    status: 'disabled',
    riskLevel: 'low',
    createdAt: '2025-01-05T13:00:00Z',
    triggeredAt: null,
    conditionDescription: 'Khối lượng giao dịch ETH vượt 20 tỷ USD trong 24h',
    indicatorType: 'volume',
    value: 18200000000,
    threshold: 20000000000,
  },
  {
    id: 'alert-8',
    assetSymbol: 'HPG',
    assetName: 'Hòa Phát Group',
    type: 'default',
    condition: 'ATR dãn rộng bùng nổ biến động',
    status: 'active',
    riskLevel: 'high',
    createdAt: '2025-01-12T07:30:00Z',
    triggeredAt: null,
    conditionDescription: 'ATR HPG dãn rộng đáng kể, dự báo biến động mạnh sắp tới',
    indicatorType: 'ATR',
  },
  {
    id: 'alert-9',
    assetSymbol: 'XRP',
    assetName: 'XRP',
    type: 'default',
    condition: 'RSI < 30',
    status: 'triggered',
    riskLevel: 'medium',
    createdAt: '2025-01-04T10:00:00Z',
    triggeredAt: '2025-01-11T14:20:00Z',
    conditionDescription: 'RSI XRP rơi xuống 29.1, vùng quá bán',
    indicatorType: 'RSI',
    value: 29.1,
    threshold: 30,
  },
  {
    id: 'alert-10',
    assetSymbol: 'MBB',
    assetName: 'Ngân hàng TMCP Quân đội',
    type: 'custom',
    condition: 'Giá < 25,000 VNĐ',
    status: 'disabled',
    riskLevel: 'low',
    createdAt: '2025-01-03T15:00:00Z',
    triggeredAt: null,
    conditionDescription: 'Giá MBB giảm xuống dưới 25,000 VNĐ/CP',
    indicatorType: 'price',
    value: 25800,
    threshold: 25000,
  },
];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const alert = mockAlerts.find((a) => a.id === id);

  if (!alert) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
  }

  return NextResponse.json({ data: alert });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const alertIndex = mockAlerts.findIndex((a) => a.id === id);

  if (alertIndex === -1) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
  }

  const updated = {
    ...mockAlerts[alertIndex],
    ...body,
    id: mockAlerts[alertIndex].id,
    createdAt: mockAlerts[alertIndex].createdAt,
  };

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const alertIndex = mockAlerts.findIndex((a) => a.id === id);

  if (alertIndex === -1) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, id });
}
