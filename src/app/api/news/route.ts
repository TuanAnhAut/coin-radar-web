import { NextResponse } from 'next/server';
import type { NewsArticle } from '@/lib/types';

const mockNews: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'VN-Index vượt mốc 1.340 điểm, thanh khoản duy trì ở mức cao',
    summary: 'Phiên giao dịch 14/01, VN-Index tăng 8,34 điểm (0,63%) lên 1.342,67 điểm. Thanh khoản toàn thị trường đạt gần 1 tỷ cổ phiếu.',
    content: `## VN-Index tiếp tục đà tăng\n\nPhiên giao dịch ngày 14/01/2025, thị trường chứng khoán Việt Nam tiếp tục duy trì đà tăng tích cực. VN-Index đóng cửa tăng 8,34 điểm (0,63%) lên mức 1.342,67 điểm.\n\n### Điểm nhấn phiên giao dịch\n\n- **Thanh khoản**: Toàn thị trường đạt 982,4 triệu cổ phiếu, tăng 15% so với phiên trước\n- **Nhóm dẫn dắt**: FPT tăng 2,52%, HPG tăng 2,27% là hai mã đóng góp nhiều nhất vào điểm số\n- **Nhóm bank**: MBB, TCB đều tăng nhẹ, VCB nhích 0,51%\n- **Áp lực**: VNM giảm 1,09%, VIC giảm 0,62%, VHM giảm 1,15%\n\n### Nhận định\n\nThị trường đang trong giai đoạn điều chỉnh tích cực sau nhịp giảm đầu tháng. Dòng tiền ngoại tiếp tục ghi nhận mua ròng trên cả hai sàn. Các chuyên gia dự báo VN-Index có thể thử thách lại vùng 1.360-1.380 trong tuần tới.`,
    source: 'CafeF',
    publishedAt: '2025-01-14T15:30:00Z',
    category: 'stock',
    tags: ['VNINDEX', 'FPT', 'HPG', 'MBB'],
    imageUrl: '/images/news/vnindex-1401.jpg',
    importance: 'normal',
  },
  {
    id: 'news-2',
    title: 'Bitcoin tiếp tục bứt phá, chạm mốc 104.000 USD',
    summary: 'Giá Bitcoin tăng mạnh trong 24h qua, đạt mức 104.850 USD. Các nhà phân tích dự báo BTC có thể chạm 110.000 USD trước khi điều chỉnh.',
    content: `## Bitcoin bứt phá mạnh mẽ\n\nGiá Bitcoin tiếp tục thiết lập đỉnh mới trong xu hướng tăng ngắn hạn, chạm mốc 104.850 USD trong phiên giao dịch ngày 14/01.\n\n### Phân tích kỹ thuật\n\n- **RSI**: Đạt mức 71,2 – vùng quá mua nhưng chưa quá extreme\n- **MACD**: Đang cho tín hiệu tăng tích cực\n- **Khối lượng**: Đạt 42,5 tỷ USD, cho thấy dòng tiền mạnh vào thị trường\n\n### Nguyên nhân tăng\n\n1. Lãi suất Fed giữ ổn định, thúc đẩy tài sản rủi ro\n2. Quỹ ETF Bitcoin spot tiếp tục hút vốn\n3. Tâm lý thị trường tích cực sau kỳ báo cáo lợi nhuận tốt\n\n### Rủi ro cần lưu ý\n\nRSI đang ở vùng quá mua, nhà đầu tư nên thận trọng với rủi ro điều chỉnh ngắn hạn. Vùng hỗ trợ quan trọng nằm tại 98.000-100.000 USD.`,
    source: 'CoinDesk Vietnam',
    publishedAt: '2025-01-14T12:00:00Z',
    category: 'crypto',
    tags: ['BTC', 'ETH', 'SOL'],
    imageUrl: '/images/news/btc-1401.jpg',
    importance: 'important',
  },
  {
    id: 'news-3',
    title: 'Giá vàng SJC tiệm cận 95 triệu đồng/lượng, rủi ro điều chỉnh tăng',
    summary: 'Giá vàng trong nước tiếp tục tăng nhẹ, vàng SJC bán ra ở mức 94,5 triệu đồng/lượng. Chênh lệch giá vàng trong nước và thế giới vẫn ở mức cao.',
    content: `## Giá vàng SJC tiếp tục tăng\n\nTrong phiên giao dịch ngày 14/01, giá vàng miếng SJC tiếp tục duy trì đà tăng, tiệm cận mức 95 triệu đồng/lượng.\n\n### Giá vàng SJC\n- **Mua vào**: 93,5 triệu đồng/lượng\n- **Bán ra**: 94,5 triệu đồng/lượng\n- **Biến động 24h**: +300.000 VNĐ (+0,32%)\n\n### So sánh giá thế giới\n\nGiá vàng thế giới đang giao dịch ở mức 2.684,5 USD/ounce. Nếu quy đổi theo tỷ giá, giá vàng thế giới tương đương khoảng 89-90 triệu đồng/lượng, chênh lệch với vàng SJC vẫn ở mức cao (4-5 triệu đồng).\n\n### Nhận định\n\nNgân hàng Nhà nước cần có biện pháp quản lý thị trường vàng hiệu quả hơn để thu hẹp khoảng cách giá. Nhà đầu tư nên thận trọng khi mua vào ở mức giá cao hiện tại.`,
    source: 'DOJI',
    publishedAt: '2025-01-14T10:30:00Z',
    category: 'gold',
    tags: ['SJC', 'XAU'],
    imageUrl: '/images/news/gold-1401.jpg',
    importance: 'normal',
  },
  {
    id: 'news-4',
    title: 'FPT Corp công bố doanh thu kỷ lục năm 2024',
    summary: 'Tổng doanh thu năm 2024 của FPT đạt 56.800 tỷ đồng, tăng 19% so với năm trước. Lợi nhuận sau thuế đạt 8.420 tỷ đồng.',
    content: `## FPT đạt doanh thu kỷ lục\n\nCông ty Cổ phần FPT vừa công bố kết quả kinh doanh năm 2024 với nhiều con số ấn tượng.\n\n### Kết quả chính\n\n| Chỉ tiêu | 2024 | 2023 | Tăng trưởng |\n|----------|------|------|------------|\n| Doanh thu | 56.800 tỷ | 47.700 tỷ | +19% |\n| LNST | 8.420 tỷ | 7.150 tỷ | +17,8% |\n| EPS | 6.580đ | 5.590đ | +17,7% |\n\n### Phân tích theo mảng\n\n- **Công nghệ thông tin**: Doanh thu 42.300 tỷ, tăng 22%\n- **Viễn thông**: Doanh thu 10.200 tỷ, tăng 8%\n- **Giáo dục**: Doanh thu 4.300 tỷ, tăng 15%\n\n### Triển vọng 2025\n\nFPT đặt mục tiêu doanh thu năm 2025 đạt 65.000 tỷ đồng, tập trung vào AI và cloud computing.`,
    source: 'Vietstock',
    publishedAt: '2025-01-13T16:00:00Z',
    category: 'stock',
    tags: ['FPT'],
    imageUrl: '/images/news/fpt-result.jpg',
    importance: 'normal',
  },
  {
    id: 'news-5',
    title: 'Fed giữ nguyên lãi suất, thị trường tài chính toàn cầu phản ứng tích cực',
    summary: 'FED quyết định giữ lãi suất ở mức 4,25-4,50% trong cuộc họp tháng 1. Thị trường chứng khoán và crypto đồng loạt tăng.',
    content: `## FED giữ nguyên lãi suất\n\nNgân hàng Dự trữ Liên bang Mỹ (Fed) đã quyết định giữ nguyên lãi suất quỹ liên bang ở mức 4,25-4,50% trong cuộc họp chính sách tiền tệ tháng 1/2025.\n\n### Tuyên bố của Fed\n\n- **Lạm phát**: Đang đi đúng hướng nhưng vẫn cần cẩn trọng\n- **Thị trường lao động**: Còn mạnh nhưng có dấu hiệu hạ nhiệt\n- **Chính sách**: Sẽ tiếp tục đánh giá dữ liệu trước khi điều chỉnh\n\n### Tác động đến thị trường\n\n- **Chứng khoán Mỹ**: S&P 500 tăng 1,2%, Nasdaq tăng 1,8%\n- **VN-Index**: Tăng 0,63% trong phiên sáng sau\n- **Bitcoin**: Tăng 2,28%, đạt 104.850 USD\n- **Vàng**: Tăng nhẹ 0,70% lên 2.684,5 USD/ounce\n\n### Dự báo\n\nThị trường kỳ vọng Fed có thể bắt đầu hạ lãi suất từ tháng 6/2025 nếu lạm phát tiếp tục hạ nhiệt.`,
    source: 'Bloomberg Vietnam',
    publishedAt: '2025-01-14T08:00:00Z',
    category: 'macro',
    tags: ['VNINDEX', 'BTC', 'XAU', 'ETH'],
    imageUrl: '/images/news/fed-rate.jpg',
    importance: 'important',
  },
  {
    id: 'news-6',
    title: 'Solana tăng hơn 5%, dẫn dắt đà tăng của altcoin',
    summary: 'Solana (SOL) tăng 5,09% lên 178,92 USD trong 24h qua. Các dự án DeFi trên Solana tiếp tục thu hút dòng tiền mới.',
    content: `## Solana bứt phá mạnh\n\nSolana tiếp tục là một trong những altcoin có diễn biến ấn tượng nhất trong tuần này.\n\n### Biến động 24h\n- **Giá SOL**: 178,92 USD (+5,09%)\n- **Khối lượng**: 4,8 tỷ USD\n- **Vốn hóa**: 82,5 tỷ USD\n\n### Động lực tăng trưởng\n\n1. TVL trên mạng lưới Solana đạt mức cao nhất kể từ tháng 3/2022\n2. Các DEX trên Solana xử lý khối lượng giao dịch kỷ lục\n3. Nhiều dự án AI mới ra mắt trên Solana\n\n### Cảnh báo rủi ro\n\nRSI SOL đã đạt 78,4, vượt xa ngưỡng quá mua 70. Nhà đầu tư ngắn hạn nên cân nhắc chốt lời một phần.`,
    source: 'The Block Vietnam',
    publishedAt: '2025-01-14T14:00:00Z',
    category: 'crypto',
    tags: ['SOL', 'BNB', 'ADA'],
    imageUrl: '/images/news/solana-1401.jpg',
    importance: 'normal',
  },
  {
    id: 'news-7',
    title: 'Hòa Phát Group khởi công nhà máy thép công nghệ cao tại Hải Phòng',
    summary: 'HPG chính thức khởi công nhà máy thép HPG Tech với công suất 2 triệu tấn/năm, tổng mức đầu tư 15.000 tỷ đồng.',
    content: `## HPG khởi công dự án mới\n\nHòa Phát Group đã chính thức khởi công nhà máy thép HPG Tech tại Khu công nghiệp Nam Đình Vũ, Hải Phòng.\n\n### Thông tin dự án\n- **Công suất**: 2 triệu tấn thép cuộn cán nóng/năm\n- **Tổng đầu tư**: 15.000 tỷ đồng\n- **Công nghệ**: Dây chuyền hiện đại nhất Đông Nam Á\n- **Thời gian hoàn thành**: Dự kiến Q3/2026\n\n### Tác động đến HPG\n\nDự án này sẽ giúp HPG tăng tổng công suất lên 10 triệu tấn/năm, củng cố vị thế nhà sản xuất thép lớn nhất Việt Nam và khu vực.`,
    source: 'NDH',
    publishedAt: '2025-01-13T09:00:00Z',
    category: 'stock',
    tags: ['HPG', 'VNINDEX'],
    imageUrl: '/images/news/hpg-factory.jpg',
    importance: 'minor',
  },
  {
    id: 'news-8',
    title: 'XRP giảm 4,6% sau tin tức bất lợi từ SEC',
    summary: 'Giá XRP giảm mạnh sau khi SEC đệ đơn kháng cáo mới trong vụ kiện với Ripple. Các nhà đầu tư lo ngại quá trình pháp lý kéo dài.',
    content: `## XRP đối mặt áp lực bán\n\nGiá XRP đã giảm 4,62% trong 24h qua, rơi xuống mức 2,48 USD, trở thành một trong những đồng tiền giảm mạnh nhất trong ngày.\n\n### Nguyên nhân giảm\n\n- SEC đệ đơn kháng cáo phán quyết trước đó về vụ kiện Ripple\n- Thị trường lo ngại quá trình pháp lý kéo dài\n- Dòng tiền dịch chuyển sang BTC và SOL\n\n### Phân tích kỹ thuật\n\n- **RSI**: 29,1 – đã vào vùng quá bán\n- **Hỗ trợ quan trọng**: 2,30 USD\n- **Kháng cự**: 2,65 USD`,
    source: 'CoinTelegraph Vietnam',
    publishedAt: '2025-01-14T11:00:00Z',
    category: 'crypto',
    tags: ['XRP', 'BTC', 'ETH'],
    imageUrl: '/images/news/xrp-sec.jpg',
    importance: 'important',
  },
  {
    id: 'news-9',
    title: 'Ngân hàng Nhà nước yêu cầu các NHTM kiểm soát rủi ro bất động sản',
    summary: 'NHNN ban hành công văn yêu cầu các ngân hàng thương mại tăng cường kiểm soát tín dụng bất động sản, đặc biệt là các dự án condotel.',
    content: `## NHNN siết chặt tín dụng BĐS\n\nNgân hàng Nhà nước Việt Nam vừa ban hành công văn yêu cầu các ngân hàng thương mại tăng cường công tác quản trị rủi ro trong hoạt động cấp tín dụng bất động sản.\n\n### Nội dung chính\n\n1. **Kiểm soát tỷ lệ**: Tỷ lệ cấp tín dụng BĐS không vượt quá mức an toàn\n2. **Đánh giá dự án**: Nâng cao chất lượng thẩm định các dự án BĐS mới\n3. **Condotel**: Đặc biệt lưu ý rủi ro với các dự án condotel\n\n### Tác động thị trường\n\n- **VHM**: Giảm 1,15% trong phiên 14/01\n- **VIC**: Giảm 0,62% trong phiên 14/01\n- Nhóm cổ phiếu bất động sản chịu áp lực chung`,
    source: 'VnExpress',
    publishedAt: '2025-01-13T07:00:00Z',
    category: 'macro',
    tags: ['VIC', 'VHM', 'VNINDEX'],
    imageUrl: '/images/news/nhnn-bds.jpg',
    importance: 'important',
  },
  {
    id: 'news-10',
    title: 'Ethereum ETF spot ghi nhận dòng tiền ổn định, ETH duy trì trên 3.800 USD',
    summary: 'Quỹ ETF Ethereum spot tiếp tục hút vốn đều đặn trong tuần thứ 3 liên tiếp. Giá ETH đang giao dịch quanh mức 3.892 USD.',
    content: `## ETH ETF hút vốn ổn định\n\nCác quỹ ETF Ethereum spot tại Mỹ tiếp tục ghi nhận dòng tiền dương trong tuần thứ 3 liên tiếp, cho thấy nhu cầu đầu tư vào ETH vẫn mạnh.\n\n### Dữ liệu ETF\n\n- **Dòng tiền tuần**: +320 triệu USD\n- **Tổng tài sản quản lý (AUM)**: 58,7 tỷ USD\n- **Số quỹ hoạt động**: 8 quỹ\n\n### Phân tích kỹ thuật ETH\n\n- **Giá hiện tại**: 3.892,45 USD (-1,71% trong 24h)\n- **RSI**: 45,6 – vùng trung tính\n- **Hỗ trợ**: 3.650 USD\n- **Kháng cự**: 4.100 USD`,
    source: 'Decrypt Vietnam',
    publishedAt: '2025-01-14T16:00:00Z',
    category: 'crypto',
    tags: ['ETH', 'BTC', 'BNB'],
    imageUrl: '/images/news/eth-etf.jpg',
    importance: 'normal',
  },
  {
    id: 'news-11',
    title: 'DOGE tăng 18% sau sự chú ý của Elon Musk',
    summary: 'Dogecoin tăng vọt sau một loạt bài đăng của Elon Musk trên X. Dòng tiền đổ mạnh vào memecoin khiến khối lượng giao dịch tăng gấp 3 lần.',
    content: `## DOGE tăng vọt\n\nDogecoin (DOGE) đã tăng hơn 18% trong 24h qua sau khi Elon Musk liên tục đăng bài nhắc đến DOGE trên mạng xã hội X.\n\n### Biến động\n- **Giá DOGE**: 0,182 USD (+18,2%)\n- **Khối lượng**: 6,2 tỷ USD (tăng 300%)\n- **Vốn hóa**: 26,1 tỷ USD\n\n### Góc nhìn\n\nNhà đầu tư nên thận trọng với memecoin vì biến động thường rất lớn và khó dự báo. Dòng tiền có thể rút ra nhanh chóng.`,
    source: 'CoinMarketCap',
    publishedAt: '2025-01-14T18:00:00Z',
    category: 'crypto',
    tags: ['DOGE', 'BTC'],
    imageUrl: '/images/news/doge-pump.jpg',
    importance: 'minor',
  },
  {
    id: 'news-12',
    title: 'Tỷ giá USD/VND tiếp tục neo cao, dự báo sẽ duy trì đến Q2/2025',
    summary: 'Tỷ giá USD/VND giao dịch quanh mức 25.450, gần mức trần. NHNN dự kiến sẽ duy trì chính sách tỷ giá ổn định trong ngắn hạn.',
    content: `## Tỷ giá USD/VND neo cao\n\nTỷ giá USD/VND tiếp tục giao dịch quanh mức 25.450-25.470, gần sát mức trần giá mua của NHNN.\n\n### Diễn biến\n- **Mua vào**: 25.380 VND/USD\n- **Bán ra**: 25.470 VND/USD\n- **Biến động tuần**: +0,35%\n\n### Nguyên nhân\n\n1. Lãi suất Fed duy trì ở mức cao\n2. Nhu cầu USD tăng từ doanh nghiệp nhập khẩu\n3. Chênh lệch lãi suất USD-VND thu hẹp\n\n### Dự báo\n\nChuyên gia dự báo tỷ giá sẽ duy trì neo cao đến ít nhất Q2/2025 khi Fed có thể bắt đầu hạ lãi suất.`,
    source: 'SBV',
    publishedAt: '2025-01-14T09:00:00Z',
    category: 'macro',
    tags: ['USD', 'VND'],
    imageUrl: '/images/news/usd-vnd.jpg',
    importance: 'normal',
  },
  {
    id: 'news-13',
    title: 'VIC Group công bố chiến lược chuyển đổi số toàn diện',
    summary: 'Tập đoàn Vingroup công bố chiến lược VinFast, VinAI và VinBigData sẽ được tích hợp chặt chẽ hơn để thúc đẩy hệ sinh thái thông minh.',
    content: `## Vingroup công bố chiến lược mới\n\nTập đoàn Vingroup vừa công bố chiến lược chuyển đổi số toàn diện cho giai đoạn 2025-2030, tập trung vào việc tích hợp các mảng công nghệ.\n\n### Điểm nhấn\n\n1. **VinFast**: Tích hợp AI vào hệ thống tự lái\n2. **VinAI**: Phát triển mô hình ngôn ngữ lớn tiếng Việt\n3. **VinBigData**: Mở rộng giải pháp quản lý thông minh\n\n### Tác động cổ phiếu VIC\n- **VIC**: +1,82% trong phiên giao dịch gần nhất\n- **VHM**: Phục hồi +0,95% sau áp lực BĐS`,
    source: 'Vietnambiz',
    publishedAt: '2025-01-13T14:00:00Z',
    category: 'stock',
    tags: ['VIC', 'VHM', 'FPT'],
    imageUrl: '/images/news/vin-digital.jpg',
    importance: 'normal',
  },
  {
    id: 'news-14',
    title: 'CẢNH BÁO: BTC phân kỳ giảm trên RSI, rủi ro sập mạnh trong ngắn hạn',
    summary: 'RSI 4H của Bitcoin đang phân kỳ giảm rõ rệt. Nếu phá vỡ hỗ trợ 100.000 USD, BTC có thể giảm sâu về vùng 92.000-95.000 USD.',
    content: `## CẢNH BÁO RỦI RO\n\nPhân tích kỹ thuật cho thấy Bitcoin đang có dấu hiệu phân kỳ giảm (bearish divergence) mạnh trên khung 4H.\n\n### Dấu hiệu cảnh báo\n\n1. **RSI phân kỳ**: Giá tạo đỉnh mới nhưng RSI không xác nhận\n2. **Volume giảm**: Khối lượng giao dịch giảm 30% so với đỉnh\n3. **RSI 4H**: 71,2 → 65,8 trong khi giá vẫn tăng\n\n### Kịch bản\n\n- **Kịch bản tích cực**: Giữ hỗ trợ 100.000 USD, tiếp tục tăng về 110.000 USD\n- **Kịch bản tiêu cực**: Phá 100.000 USD, giảm về 92.000-95.000 USD\n\n### Khuyến nghị\n\nNhà đầu tư ngắn hạn nên cân nhắc: chốt lời một phần, đặt stop-loss tại 99.500 USD, chờ đợi pullback trước khi mua thêm.`,
    source: 'CoinRadar Analysis',
    publishedAt: '2025-01-14T19:00:00Z',
    category: 'crypto',
    tags: ['BTC', 'ETH', 'SOL'],
    imageUrl: '/images/news/btc-warning.jpg',
    importance: 'important',
  },
  {
    id: 'news-15',
    title: 'Bảo hiểm tiền gửi nâng mức tối đa lên 125 triệu đồng',
    summary: 'Từ ngày 01/02/2025, mức bảo hiểm tiền gửi tại các ngân hàng sẽ được nâng từ 75 triệu lên 125 triệu đồng mỗi khách hàng.',
    content: `## Mức bảo hiểm tiền gửi tăng\n\nTheo Nghị định mới, mức trả bảo hiểm tiền gửi tối đa sẽ được nâng lên 125 triệu đồng, tăng 67% so với mức trước đây.\n\n### Chi tiết\n\n- **Mức cũ**: 75 triệu đồng\n- **Mức mới**: 125 triệu đồng\n- **Ngày hiệu lực**: 01/02/2025\n\n### Tác động\n\n- Tăng niềm tin của người gửi tiền vào hệ thống ngân hàng\n- Đặc biệt có lợi cho khách hàng cá nhân có khoản gửi dưới 125 triệu\n- Các ngân hàng cần đóng phí bảo hiểm cao hơn`,
    source: 'Bảo Việt',
    publishedAt: '2025-01-12T08:00:00Z',
    category: 'macro',
    tags: ['TCB', 'VCB', 'MBB'],
    imageUrl: '/images/news/bao-hiem-tien-gui.jpg',
    importance: 'normal',
  },
  {
    id: 'news-16',
    title: 'BNB Chain ra mắt tính năng opBNB Layer-2, cạnh tranh trực tiếp với Arbitrum',
    summary: 'Binance Smart Chain chính thức ra mắt opBNB - giải pháp Layer-2 tối ưu gas fee, hoạt động song song với Ethereum L2.',
    content: `## BNB Chain ra mắt opBNB\n\nBNB Chain đã chính thức ra mắt opBNB, giải pháp Layer-2 sử dụng Optimistic Rollup để giảm phí giao dịch và tăng tốc độ.\n\n### Ưu điểm opBNB\n\n- **Gas fee**: Chỉ khoảng 0,001 USD/giao dịch\n- **TPS**: Có thể xử lý lên đến 4.000 giao dịch/giây\n- **EVM compatible**: Hoàn toàn tương thích với Ethereum\n\n### So sánh với đối thủ\n\n| Tiêu chí | opBNB | Arbitrum | Optimism |\n|----------|-------|----------|----------|\n| Gas fee | ~0,001 USD | ~0,03 USD | ~0,02 USD |\n| TPS | 4.000 | 2.000 | 2.500 |`,
    source: 'Binance Vietnam',
    publishedAt: '2025-01-14T17:00:00Z',
    category: 'crypto',
    tags: ['BNB', 'ETH', 'SOL'],
    imageUrl: '/images/news/opbnb.jpg',
    importance: 'minor',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const importance = searchParams.get('importance');
  const bookmarked = searchParams.get('bookmarked');

  let filtered = [...mockNews];

  if (category) {
    filtered = filtered.filter((n) => n.category === category);
  }

  if (importance) {
    filtered = filtered.filter((n) => n.importance === importance);
  }

  if (bookmarked === 'true') {
    filtered = filtered.filter((n) => n.bookmarked === true);
  }

  return NextResponse.json({
    data: filtered,
    total: filtered.length,
  });
}
