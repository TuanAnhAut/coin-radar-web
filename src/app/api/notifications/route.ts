import { NextResponse } from 'next/server';
import type { Notification } from '@/lib/types';

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'alert_triggered',
    title: 'Cảnh báo RSI quá mua FPT',
    message: 'Chỉ số RSI của FPT đạt mức 73.8, vượt ngưỡng 70. Cổ phiếu đang ở vùng quá mua.',
    read: false,
    createdAt: '2025-01-14T09:15:00Z',
    iconType: 'alert',
  },
  {
    id: 'notif-2',
    type: 'breaking_news',
    title: 'Fed giữ nguyên lãi suất',
    message: 'FED quyết định giữ lãi suất ở mức 4,25-4,50%. Thị trường tài chính toàn cầu tăng.',
    read: false,
    createdAt: '2025-01-14T08:00:00Z',
    iconType: 'news',
  },
  {
    id: 'notif-3',
    type: 'alert_triggered',
    title: 'SOL đạt vùng quá mua',
    message: 'RSI Solana đạt 78.4, vượt ngưỡng cảnh báo 75. Rủi ro điều chỉnh cao.',
    read: false,
    createdAt: '2025-01-13T08:45:00Z',
    iconType: 'alert',
  },
  {
    id: 'notif-4',
    type: 'expert_message',
    title: 'Phân tích mới từ Nguyễn Văn An',
    message: 'Chuyên gia Nguyễn Văn An vừa đăng phân tích mới về VN-Index: "Xu hướng trung hạn vẫn tích cực"',
    read: true,
    createdAt: '2025-01-13T16:00:00Z',
    iconType: 'expert',
  },
  {
    id: 'notif-5',
    type: 'breaking_news',
    title: 'FPT công bố kết quả kinh doanh 2024',
    message: 'FPT đạt doanh thu 56.800 tỷ đồng, LNST 8.420 tỷ đồng trong năm 2024.',
    read: true,
    createdAt: '2025-01-13T14:00:00Z',
    iconType: 'news',
  },
  {
    id: 'notif-6',
    type: 'system',
    title: 'Cập nhật hệ thống hoàn tất',
    message: 'Coin Radar đã nâng cấp lên phiên bản 2.5 với tính năng scanner mới.',
    read: true,
    createdAt: '2025-01-12T20:00:00Z',
    iconType: 'system',
  },
  {
    id: 'notif-7',
    type: 'alert_triggered',
    title: 'XRP vùng quá bán',
    message: 'RSI XRP rơi xuống 29.1, dưới ngưỡng 30. Cơ hội mua vào có thể xuất hiện.',
    read: true,
    createdAt: '2025-01-11T14:20:00Z',
    iconType: 'alert',
  },
  {
    id: 'notif-8',
    type: 'expert_message',
    title: 'Cảnh báo vàng từ Lê Minh Châu',
    message: 'Chuyên gia Lê Minh Châu khuyến nghị thận trọng với vàng SJC ở mức giá hiện tại.',
    read: true,
    createdAt: '2025-01-11T10:00:00Z',
    iconType: 'expert',
  },
  {
    id: 'notif-9',
    type: 'breaking_news',
    title: 'NHNN siết chặt tín dụng BĐS',
    message: 'Ngân hàng Nhà nước yêu cầu các NHTM tăng cường kiểm soát tín dụng bất động sản.',
    read: true,
    createdAt: '2025-01-10T07:30:00Z',
    iconType: 'news',
  },
  {
    id: 'notif-10',
    type: 'system',
    title: 'Báo cáo tuần hoàn tất',
    message: 'Báo cáo hiệu suất danh mục của bạn trong tuần đã sẵn sàng. Lãi +3.2%.',
    read: true,
    createdAt: '2025-01-10T18:00:00Z',
    iconType: 'system',
  },
];

export async function GET() {
  const unread = mockNotifications.filter((n) => !n.read).length;

  return NextResponse.json({
    data: mockNotifications,
    total: mockNotifications.length,
    unreadCount: unread,
  });
}
