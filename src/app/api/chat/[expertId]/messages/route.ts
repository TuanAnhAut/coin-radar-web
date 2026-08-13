import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import type { ChatMessage } from '@/lib/types'

// In-memory conversation storage per expert
const conversations = new Map<string, { messages: { role: string; content: string }[] }>()

// Expert profiles for AI system prompts
const expertProfiles: Record<string, { name: string; specialty: string; bio: string }> = {
  'expert-1': {
    name: 'Nguyễn Văn An',
    specialty: 'Chứng khoán phái sinh',
    bio: 'Chuyên gia phân tích kỹ thuật với 12 năm kinh nghiệm. Từng làm việc tại SSI và VCSC. Chuyên sâu về phân tích phái sinh và quản trị rủi ro.',
  },
  'expert-2': {
    name: 'Trần Thị Bình',
    specialty: 'Crypto & DeFi',
    bio: 'Blockchain researcher và crypto analyst. Đội ngũ founder tại một dự án DeFi lớn. Chuyên phân tích fundamental và on-chain data.',
  },
  'expert-3': {
    name: 'Lê Minh Châu',
    specialty: 'Vàng & Hàng hóa',
    bio: 'Chuyên gia thị trường vàng với 15 năm kinh nghiệm. Cố vấn cho nhiều công ty vàng lớn tại Việt Nam.',
  },
  'expert-4': {
    name: 'Phạm Đức Dũng',
    specialty: 'Chứng khoán cơ bản',
    bio: 'Chuyên gia phân tích cơ bản tại công ty chứng khoán BaoViet. Chuyên theo dõi các cổ phiếu bluechip và nhóm ngân hàng.',
  },
  'expert-5': {
    name: 'Hoàng Thị Ember',
    specialty: 'Macro Economics',
    bio: 'Tiến sĩ kinh tế vĩ mô. Chuyên phân tích tác động của chính sách tiền tệ và tỷ giá đến thị trường tài chính Việt Nam.',
  },
  'expert-6': {
    name: 'Võ Hoàng Giang',
    specialty: 'Crypto Trading',
    bio: 'Full-time crypto trader với 6 năm kinh nghiệm. Chuyên giao dịch spot và futures trên Binance.',
  },
  'expert-7': {
    name: 'Đặng Minh Hiếu',
    specialty: 'Chứng khoán kỹ thuật',
    bio: 'Kỹ sư phần mềm chuyển sang phân tích kỹ thuật. Chuyên sử dụng AI và machine learning trong phân tích biểu đồ chứng khoán.',
  },
  'expert-8': {
    name: 'Bùi Thu Hương',
    specialty: 'NFT & Web3',
    bio: 'NFT collector và Web3 enthusiast. Đánh giá các dự án NFT và GameFi mới.',
  },
}

function buildSystemPrompt(expertId: string): string {
  const expert = expertProfiles[expertId] || {
    name: 'Chuyên gia Coin Radar',
    specialty: 'Tài chính',
    bio: 'Chuyên gia phân tích thị trường tài chính.',
  }

  return `Bạn là ${expert.name}, chuyên gia ${expert.specialty} trên nền tảng Coin Radar.

${expert.bio}

QUY TẮC QUAN TRỌNG:
1. Luôn trả lời bằng TIẾNG VIỆT
2. Giữ câu trả lời NGẮN GỌN (3-5 câu tối đa), dễ hiểu cho người mới
3. Nếu được hỏi về khuyến nghị đầu tư, luôn nhắc nhở: "Đây chỉ là góc nhìn phân tích, không phải lời khuyên đầu tư."
4. Sử dụng kiến thức chuyên môn của bạn (${expert.specialty}) để trả lời
5. Có thể đề cập đến các chỉ báo kỹ thuật (RSI, MACD, MA, ATR) nếu liên quan
6. Thể hiện phong cách chuyên nghiệp nhưng thân thiện
7. KHÔNG đề xuất mua/bán cụ thể - chỉ phân tích xu hướng
8. Nếu người dùng hỏi về chủ đề không liên quan đến tài chính, lịch sự hướng họ trở lại chủ đề phân tích thị trường

NGỮ CẢNH: Bạn đang chat với một người dùng trên Coin Radar - nền tảng theo dõi giá CK/Crypto/Vàng và đặt cảnh báo. Người dùng có thể hỏi về:
- Xu hướng thị trường
- Phân tích kỹ thuật
- Đánh giá rủi ro
- Cách đặt cảnh báo hiệu quả
- Tình hình kinh tế vĩ mô tác động đến thị trường`
}

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Get or create conversation for an expert
function getConversation(expertId: string) {
  if (!conversations.has(expertId)) {
    conversations.set(expertId, {
      messages: [
        { role: 'assistant', content: buildSystemPrompt(expertId) },
      ],
    })
  }
  return conversations.get(expertId)!
}

// GET: Fetch chat history
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ expertId: string }> }
) {
  const { expertId } = await params

  // Validate expert exists
  if (!expertProfiles[expertId]) {
    return NextResponse.json(
      { error: 'Không tìm thấy chuyên gia' },
      { status: 404 }
    )
  }

  // Return welcome message for new conversations
  const conversation = getConversation(expertId)
  const userMessageCount = conversation.messages.filter(m => m.role === 'user').length

  if (userMessageCount === 0) {
    const expert = expertProfiles[expertId]
    const now = new Date().toISOString()
    const welcomeMessage: ChatMessage = {
      id: generateId(),
      role: 'system',
      content: `Xin chào! Tôi là ${expert.name}, chuyên gia ${expert.specialty}.\n\nTôi có thể giúp bạn phân tích xu hướng thị trường, giải thích các chỉ báo kỹ thuật, hoặc tư vấn cách đặt cảnh báo hiệu quả. Bạn muốn hỏi gì?`,
      createdAt: now,
      expertId,
    }

    // Store welcome message
    conversation.messages.push({ role: 'assistant', content: welcomeMessage.content })

    return NextResponse.json({
      data: [welcomeMessage],
    })
  }

  // Return message history (exclude system prompt)
  const historyMessages: ChatMessage[] = conversation.messages
    .filter((_, i) => i > 0) // skip system prompt
    .map((m, i) => ({
      id: `msg-history-${i}`,
      role: m.role === 'assistant' ? 'expert' as const : 'user' as const,
      content: m.content,
      createdAt: new Date(Date.now() - (conversation.messages.length - i) * 60000).toISOString(),
      expertId,
    }))

  return NextResponse.json({
    data: historyMessages,
  })
}

// POST: Send message and get AI response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ expertId: string }> }
) {
  const { expertId } = await params

  // Validate expert exists
  if (!expertProfiles[expertId]) {
    return NextResponse.json(
      { error: 'Không tìm thấy chuyên gia' },
      { status: 404 }
    )
  }

  try {
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tin nhắn không được để trống' },
        { status: 400 }
      )
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Tin nhắn quá dài (tối đa 500 ký tự)' },
        { status: 400 }
      )
    }

    const conversation = getConversation(expertId)
    const now = new Date().toISOString()

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: message.trim(),
      createdAt: now,
      expertId,
    }
    conversation.messages.push({ role: 'user', content: message.trim() })

    // Call AI for response
    let aiResponseText: string
    try {
      const zai = await ZAI.create()

      // Keep conversation context manageable (max 20 messages)
      const contextMessages = conversation.messages.slice(-20)

      const completion = await zai.chat.completions.create({
        messages: contextMessages,
        thinking: { type: 'disabled' },
      })

      aiResponseText = completion.choices[0]?.message?.content?.trim() || 'Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại sau.'

      // Ensure response is not too long
      if (aiResponseText.length > 1000) {
        aiResponseText = aiResponseText.slice(0, 1000) + '...'
      }
    } catch {
      // Fallback response if AI fails
      const fallbacks = [
        'Cảm ơn câu hỏi của bạn. Dựa trên phân tích hiện tại, thị trường đang cho thấy các dấu hiệu thú vị. Bạn có muốn tôi đi sâu vào chỉ báo cụ thể nào không?',
        'Đó là một câu hỏi hay. Tôi khuyên bạn nên theo dõi các chỉ báo kỹ thuật chính và đặt cảnh báo ở các mức quan trọng. Bạn đã thiết lập cảnh báo nào chưa?',
        'Tôi hiểu lo lắng của bạn. Hãy nhớ rằng thị trường luôn biến động, quan trọng là có chiến lược quản trị rủi ro rõ ràng.',
      ]
      aiResponseText = fallbacks[Math.floor(Math.random() * fallbacks.length)]
    }

    // Add AI response to conversation
    conversation.messages.push({ role: 'assistant', content: aiResponseText })

    const expertMessage: ChatMessage = {
      id: generateId(),
      role: 'expert',
      content: aiResponseText,
      createdAt: new Date().toISOString(),
      expertId,
    }

    return NextResponse.json({
      data: {
        userMessage,
        expertMessage,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Có lỗi xảy ra, vui lòng thử lại' },
      { status: 500 }
    )
  }
}
