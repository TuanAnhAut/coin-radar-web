import { NextResponse } from 'next/server';
import type { NewsArticle } from '@/lib/types';

const mockNews: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'VN-Index vượt mốc 1.340 điểm, thanh khoản duy trì ở mức cao',
    summary: 'Phiên giao dịch 14/01, VN-Index tăng 8,34 điểm (0,63%) lên 1.342,67 điểm. Thanh khoản toàn thị trường đạt gần 1 tỷ cổ phiếu.',
    content: `## VN-Index tiếp tục đà tăng

Phiên giao dịch ngày 14/01/2025, thị trường chứng khoán Việt Nam tiếp tục duy trì đà tăng tích cực. VN-Index đóng cửa tăng 8,34 điểm (0,63%) lên mức 1.342,67 điểm.

### Điểm nhấn phiên giao dịch

- **Thanh khoản**: Toàn thị trường đạt 982,4 triệu cổ phiếu, tăng 15% so với phiên trước
- **Nhóm dẫn dắt**: FPT tăng 2,52%, HPG tăng 2,27% là hai mã đóng góp nhiều nhất vào điểm số
- **Nhóm bank**: MBB, TCB đều tăng nhẹ, VCB nhích 0,51%
- **Áp lực**: VNM giảm 1,09%, VIC giảm 0,62%, VHM giảm 1,15%

### Nhận định

Thị trường đang trong giai đoạn điều chỉnh tích cực sau nhịp giảm đầu tháng. Dòng tiền ngoại tiếp tục ghi nhận mua ròng trên cả hai sàn. Các chuyên gia dự báo VN-Index có thể thử thách lại vùng 1.360-1.380 trong tuần tới.`,
    source: 'CafeF',
    publishedAt: '2025-01-14T15:30:00Z',
    category: 'stock',
    tags: ['VNINDEX', 'FPT', 'HPG', 'MBB'],
    imageUrl: '/images/news/vnindex-1401.jpg',
  },
  {
    id: 'news-2',
    title: 'Bitcoin tiếp tục bứt phá, chạm mốc 104.000 USD',
    summary: 'Giá Bitcoin tăng mạnh trong 24h qua, đạt mức 104.850 USD. Các nhà phân tích dự báo BTC có thể chạm 110.000 USD trước khi điều chỉnh.',
    content: `## Bitcoin bứt phá mạnh mẽ

Giá Bitcoin tiếp tục thiết lập đỉnh mới trong xu hướng tăng ngắn hạn, chạm mốc 104.850 USD trong phiên giao dịch ngày 14/01.

### Phân tích kỹ thuật

- **RSI**: Đạt mức 71,2 – vùng quá mua nhưng chưa quá extreme
- **MACD**: Đang cho tín hiệu tăng tích cực
- **Khối lượng**: Đạt 42,5 tỷ USD, cho thấy dòng tiền mạnh vào thị trường

### Nguyên nhân tăng

1. Lãi suất Fed giữ ổn định, thúc đẩy tài sản rủi ro
2. Quỹ ETF Bitcoin spot tiếp tục hút vốn
3. Tâm lý thị trường tích cực sau kỳ báo cáo lợi nhuận tốt

### Rủi ro cần lưu ý

RSI đang ở vùng quá mua, nhà đầu tư nên thận trọng với rủi ro điều chỉnh ngắn hạn. Vùng hỗ trợ quan trọng nằm tại 98.000-100.000 USD.`,
    source: 'CoinDesk Vietnam',
    publishedAt: '2025-01-14T12:00:00Z',
    category: 'crypto',
    tags: ['BTC', 'ETH', 'SOL'],
    imageUrl: '/images/news/btc-1401.jpg',
  },
  {
    id: 'news-3',
    title: 'Giá vàng SJC tiệm cận 95 triệu đồng/lượng, rủi ro điều chỉnh tăng',
    summary: 'Giá vàng trong nước tiếp tục tăng nhẹ, vàng SJC bán ra ở mức 94,5 triệu đồng/lượng. Chênh lệch giá vàng trong nước và thế giới vẫn ở mức cao.',
    content: `## Giá vàng SJC tiếp tục tăng

Trong phiên giao dịch ngày 14/01, giá vàng miếng SJC tiếp tục duy trì đà tăng, tiệm cận mức 95 triệu đồng/lượng.

### Giá vàng SJC
- **Mua vào**: 93,5 triệu đồng/lượng
- **Bán ra**: 94,5 triệu đồng/lượng
- **Biến động 24h**: +300.000 VNĐ (+0,32%)

### So sánh giá thế giới

Giá vàng thế giới đang giao dịch ở mức 2.684,5 USD/ounce. Nếu quy đổi theo tỷ giá, giá vàng thế giới tương đương khoảng 89-90 triệu đồng/lượng, chênh lệch với vàng SJC vẫn ở mức cao (4-5 triệu đồng).

### Nhận định

Ngân hàng Nhà nước cần có biện pháp quản lý thị trường vàng hiệu quả hơn để thu hẹp khoảng cách giá. Nhà đầu tư nên thận trọng khi mua vào ở mức giá cao hiện tại.`,
    source: 'DOJI',
    publishedAt: '2025-01-14T10:30:00Z',
    category: 'gold',
    tags: ['SJC', 'XAU'],
    imageUrl: '/images/news/gold-1401.jpg',
  },
  {
    id: 'news-4',
    title: 'FPT Corp công bố doanh thu kỷ lục năm 2024',
    summary: 'Tổng doanh thu năm 2024 của FPT đạt 56.800 tỷ đồng, tăng 19% so với năm trước. Lợi nhuận sau thuế đạt 8.420 tỷ đồng.',
    content: `## FPT đạt doanh thu kỷ lục

Công ty Cổ phần FPT vừa công bố kết quả kinh doanh năm 2024 với nhiều con số ấn tượng.

### Kết quả chính

| Chỉ tiêu | 2024 | 2023 | Tăng trưởng |
|----------|------|------|------------|
| Doanh thu | 56.800 tỷ | 47.700 tỷ | +19% |
| LNST | 8.420 tỷ | 7.150 tỷ | +17,8% |
| EPS | 6.580đ | 5.590đ | +17,7% |

### Phân tích theo mảng

- **Công nghệ thông tin**: Doanh thu 42.300 tỷ, tăng 22%
- **Viễn thông**: Doanh thu 10.200 tỷ, tăng 8%
- **Giáo dục**: Doanh thu 4.300 tỷ, tăng 15%

### Triển vọng 2025

FPT đặt mục tiêu doanh thu năm 2025 đạt 65.000 tỷ đồng, tập trung vào AI và cloud computing.`,
    source: 'Vietstock',
    publishedAt: '2025-01-13T16:00:00Z',
    category: 'stock',
    tags: ['FPT'],
    imageUrl: '/images/news/fpt-result.jpg',
  },
  {
    id: 'news-5',
    title: 'Fed giữ nguyên lãi suất, thị trường tài chính toàn cầu phản ứng tích cực',
    summary: 'FED quyết định giữ lãi suất ở mức 4,25-4,50% trong cuộc họp tháng 1. Thị trường chứng khoán và crypto đồng loạt tăng.',
    content: `## FED giữ nguyên lãi suất

Ngân hàng Dự trữ Liên bang Mỹ (Fed) đã quyết định giữ nguyên lãi suất quỹ liên bang ở mức 4,25-4,50% trong cuộc họp chính sách tiền tệ tháng 1/2025.

### Tuyên bố của Fed

- **Lạm phát**: Đang đi đúng hướng nhưng vẫn cần cẩn trọng
- **Thị trường lao động**: Còn mạnh nhưng có dấu hiệu hạ nhiệt
- **Chính sách**: Sẽ tiếp tục đánh giá dữ liệu trước khi điều chỉnh

### Tác động đến thị trường

- **Chứng khoán Mỹ**: S&P 500 tăng 1,2%, Nasdaq tăng 1,8%
- **VN-Index**: Tăng 0,63% trong phiên sáng sau
- **Bitcoin**: Tăng 2,28%, đạt 104.850 USD
- **Vàng**: Tăng nhẹ 0,70% lên 2.684,5 USD/ounce

### Dự báo

Thị trường kỳ vọng Fed có thể bắt đầu hạ lãi suất từ tháng 6/2025 nếu lạm phát tiếp tục hạ nhiệt.`,
    source: 'Bloomberg Vietnam',
    publishedAt: '2025-01-14T08:00:00Z',
    category: 'macro',
    tags: ['VNINDEX', 'BTC', 'XAU', 'ETH'],
    imageUrl: '/images/news/fed-rate.jpg',
  },
  {
    id: 'news-6',
    title: 'Solana tăng hơn 5%, dẫn dắt đà tăng của altcoin',
    summary: 'Solana (SOL) tăng 5,09% lên 178,92 USD trong 24h qua. Các dự án DeFi trên Solana tiếp tục thu hút dòng tiền mới.',
    content: `## Solana bứt phá mạnh

Solana tiếp tục là một trong những altcoin có diễn biến ấn tượng nhất trong tuần này.

### Biến động 24h
- **Giá SOL**: 178,92 USD (+5,09%)
- **Khối lượng**: 4,8 tỷ USD
- **Vốn hóa**: 82,5 tỷ USD

### Động lực tăng trưởng

1. TVL trên mạng lưới Solana đạt mức cao nhất kể từ tháng 3/2022
2. Các DEX trên Solana xử lý khối lượng giao dịch kỷ lục
3. Nhiều dự án AI mới ra mắt trên Solana

### Cảnh báo rủi ro

RSI SOL đã đạt 78,4, vượt xa ngưỡng quá mua 70. Nhà đầu tư ngắn hạn nên cân nhắc chốt lời một phần.`,
    source: 'The Block Vietnam',
    publishedAt: '2025-01-14T14:00:00Z',
    category: 'crypto',
    tags: ['SOL', 'BNB', 'ADA'],
    imageUrl: '/images/news/solana-1401.jpg',
  },
  {
    id: 'news-7',
    title: 'Hòa Phát Group khởi công nhà máy thép công nghệ cao tại Hải Phòng',
    summary: 'HPG chính thức khởi công nhà máy thép HPG Tech với công suất 2 triệu tấn/năm, tổng mức đầu tư 15.000 tỷ đồng.',
    content: `## HPG khởi công dự án mới

Hòa Phát Group đã chính thức khởi công nhà máy thép HPG Tech tại Khu công nghiệp Nam Đình Vũ, Hải Phòng.

### Thông tin dự án
- **Công suất**: 2 triệu tấn thép cuộn cán nóng/năm
- **Tổng đầu tư**: 15.000 tỷ đồng
- **Công nghệ**: Dây chuyền hiện đại nhất Đông Nam Á
- **Thời gian hoàn thành**: Dự kiến Q3/2026

### Tác động đến HPG

Dự án này sẽ giúp HPG tăng tổng công suất lên 10 triệu tấn/năm, củng cố vị thế nhà sản xuất thép lớn nhất Việt Nam và khu vực.

### Nhận định của các công ty chứng khoán

- **SSI**: Duy trì khuyến nghị mua, mục tiêu giá 38.000đ
- **VCSC**: Nâng định giá lên 36.500đ
- **Bao Viet**: Tích cực trong dài hạn`,
    source: 'NDH',
    publishedAt: '2025-01-13T09:00:00Z',
    category: 'stock',
    tags: ['HPG', 'VNINDEX'],
    imageUrl: '/images/news/hpg-factory.jpg',
  },
  {
    id: 'news-8',
    title: 'XRP giảm 4,6% sau tin tức bất lợi từ SEC',
    summary: 'Giá XRP giảm mạnh sau khi SEC đệ đơn kháng cáo mới trong vụ kiện với Ripple. Các nhà đầu tư lo ngại quá trình pháp lý kéo dài.',
    content: `## XRP đối mặt áp lực bán

Giá XRP đã giảm 4,62% trong 24h qua, rơi xuống mức 2,48 USD, trở thành một trong những đồng tiền giảm mạnh nhất trong ngày.

### Nguyên nhân giảm

- SEC đệ đơn kháng cáo phán quyết trước đó về vụ kiện Ripple
- Thị trường lo ngại quá trình pháp lý kéo dài
- Dòng tiền dịch chuyển sang BTC và SOL

### Phân tích kỹ thuật

- **RSI**: 29,1 – đã vào vùng quá bán
- **Hỗ trợ quan trọng**: 2,30 USD
- **Kháng cự**: 2,65 USD

### Góc nhìn

Mặc dù tin tức ngắn hạn tiêu cực, nhiều chuyên gia vẫn lạc quan về dài hạn. Nếu RSI tiếp tục ở vùng quá bán, có thể xuất hiện nhịp phục hồi kỹ thuật.`,
    source: 'CoinTelegraph Vietnam',
    publishedAt: '2025-01-14T11:00:00Z',
    category: 'crypto',
    tags: ['XRP', 'BTC', 'ETH'],
    imageUrl: '/images/news/xrp-sec.jpg',
  },
  {
    id: 'news-9',
    title: 'Ngân hàng Nhà nước yêu cầu các NHTM kiểm soát rủi ro bất động sản',
    summary: 'NHNN ban hành công văn yêu cầu các ngân hàng thương mại tăng cường kiểm soát tín dụng bất động sản, đặc biệt là các dự án condotel.',
    content: `## NHNN siết chặt tín dụng BĐS

Ngân hàng Nhà nước Việt Nam vừa ban hành công văn yêu cầu các ngân hàng thương mại tăng cường công tác quản trị rủi ro trong hoạt động cấp tín dụng bất động sản.

### Nội dung chính

1. **Kiểm soát tỷ lệ**: Tỷ lệ cấp tín dụng BĐS không vượt quá mức an toàn
2. **Đánh giá dự án**: Nâng cao chất lượng thẩm định các dự án BĐS mới
3. **Condotel**: Đặc biệt lưu ý rủi ro với các dự án condotel

### Tác động thị trường

- **VHM**: Giảm 1,15% trong phiên 14/01
- **VIC**: Giảm 0,62% trong phiên 14/01
- Nhóm cổ phiếu bất động sản chịu áp lực chung

### Nhận định

Động thái này phù hợp với xu hướng kiểm soát rủi ro hệ thống. Tuy nhiên, trong ngắn hạn có thể gây áp lực lên nhóm cổ phiếu bất động sản.`,
    source: 'VnExpress',
    publishedAt: '2025-01-13T07:00:00Z',
    category: 'macro',
    tags: ['VIC', 'VHM', 'VNINDEX'],
    imageUrl: '/images/news/nhnn-bds.jpg',
  },
  {
    id: 'news-10',
    title: 'Ethereum ETF spot ghi nhận dòng tiền ổn định, ETH duy trì trên 3.800 USD',
    summary: 'Quỹ ETF Ethereum spot tiếp tục hút vốn đều đặn trong tuần thứ 3 liên tiếp. Giá ETH đang giao dịch quanh mức 3.892 USD.',
    content: `## ETH ETF hút vốn ổn định

Các quỹ ETF Ethereum spot tại Mỹ tiếp tục ghi nhận dòng tiền dương trong tuần thứ 3 liên tiếp, cho thấy nhu cầu đầu tư vào ETH vẫn mạnh.

### Dữ liệu ETF

- **Dòng tiền tuần**: +320 triệu USD
- **Tổng tài sản quản lý (AUM)**: 58,7 tỷ USD
- **Số quỹ hoạt động**: 8 quỹ

### Phân tích kỹ thuật ETH

- **Giá hiện tại**: 3.892,45 USD (-1,71% trong 24h)
- **RSI**: 45,6 – vùng trung tính
- **Hỗ trợ**: 3.650 USD
- **Kháng cự**: 4.100 USD

### Triển vọng

Với sự hỗ trợ từ ETF và các upgrade mạng lưới Ethereum (Dencun, Pectra), ETH có cơ hội trở lại vùng 4.000 USD trong quý 1/2025.`,
    source: 'Decrypt Vietnam',
    publishedAt: '2025-01-14T16:00:00Z',
    category: 'crypto',
    tags: ['ETH', 'BTC', 'BNB'],
    imageUrl: '/images/news/eth-etf.jpg',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let filtered = [...mockNews];

  if (category) {
    filtered = filtered.filter((n) => n.category === category);
  }

  return NextResponse.json({
    data: filtered,
    total: filtered.length,
  });
}
