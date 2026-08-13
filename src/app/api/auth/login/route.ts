import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và mật khẩu là bắt buộc' },
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

    if (user.passwordHash !== password) {
      return NextResponse.json(
        { error: 'Mật khẩu không chính xác' },
        { status: 401 }
      )
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({
        requireTwoFactor: true,
        userId: user.id,
        email: user.email,
      })
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

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

    return NextResponse.json({
      user: userData,
      token: 'demo-token',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi, vui lòng thử lại' },
      { status: 500 }
    )
  }
}
