import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, type } = body

    if (!email || !otp || !type) {
      return NextResponse.json(
        { error: 'Email, mã OTP và loại xác minh là bắt buộc' },
        { status: 400 }
      )
    }

    if (!['register', 'forgot-password', 'login'].includes(type)) {
      return NextResponse.json(
        { error: 'Loại xác minh không hợp lệ' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Tài khoản không tồn tại' },
        { status: 404 }
      )
    }

    if (user.otpCode !== otp || !user.otpExpiry || user.otpExpiry <= new Date()) {
      return NextResponse.json(
        { error: 'Mã xác minh không hợp lệ hoặc đã hết hạn' },
        { status: 400 }
      )
    }

    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
    }

    if (type === 'register') {
      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: {
          otpCode: null,
          otpExpiry: null,
          isVerified: true,
          lastLoginAt: new Date(),
        },
      })

      return NextResponse.json({
        user: userData,
        token: 'demo-token',
      })
    }

    if (type === 'login') {
      await db.user.update({
        where: { id: user.id },
        data: {
          otpCode: null,
          otpExpiry: null,
          lastLoginAt: new Date(),
        },
      })

      return NextResponse.json({
        user: userData,
        token: 'demo-token',
      })
    }

    // forgot-password
    await db.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiry: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Xác minh thành công',
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi, vui lòng thử lại' },
      { status: 500 }
    )
  }
}
