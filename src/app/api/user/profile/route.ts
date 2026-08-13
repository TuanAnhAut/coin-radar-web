import { NextRequest, NextResponse } from 'next/server'

// GET /api/user/profile — Fetch current user profile
export async function GET() {
  return NextResponse.json({
    id: 'usr_001',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    phone: '0901 234 567',
    dateOfBirth: '1990-05-15',
    address: 'TP. Hồ Chí Minh',
    avatarUrl: null,
    accountId: 'CR-2024-001',
    plan: 'free',
    createdAt: '2024-01-15T08:00:00Z',
    twoFactorEnabled: false,
  })
}

// PUT /api/user/profile — Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, phone, dateOfBirth, address } = body

    // Validate required fields
    if (!fullName?.trim()) {
      return NextResponse.json(
        { error: 'Vui lòng nhập họ và tên' },
        { status: 400 }
      )
    }

    // Simulate update
    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật thông tin thành công',
      data: {
        fullName: fullName || 'Nguyễn Văn A',
        phone: phone || '0901 234 567',
        dateOfBirth: dateOfBirth || '1990-05-15',
        address: address || 'TP. Hồ Chí Minh',
        updatedAt: new Date().toISOString(),
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Không thể cập nhật thông tin' },
      { status: 500 }
    )
  }
}
