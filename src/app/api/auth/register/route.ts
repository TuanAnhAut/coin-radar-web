import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, phone } = body

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, mật khẩu và họ tên là bắt buộc' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã được đăng ký' },
        { status: 409 }
      )
    }

    await db.user.create({
      data: {
        email,
        passwordHash: password,
        fullName,
        phone: phone || null,
        otpCode: '123456',
        otpExpiry: new Date(Date.now() + 300000),
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Đã tạo tài khoản, vui lòng xác minh OTP',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi, vui lòng thử lại' },
      { status: 500 }
    )
  }
}
