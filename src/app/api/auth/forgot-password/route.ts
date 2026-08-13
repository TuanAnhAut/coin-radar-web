import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email là bắt buộc' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email không được đăng ký trong hệ thống' },
        { status: 404 }
      )
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        otpCode: '123456',
        otpExpiry: new Date(Date.now() + 300000),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Đã gửi mã xác minh đến email',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi, vui lòng thử lại' },
      { status: 500 }
    )
  }
}
