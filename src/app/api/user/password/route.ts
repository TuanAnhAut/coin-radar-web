import { NextRequest, NextResponse } from 'next/server'

// POST /api/user/password — Change password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword, confirmPassword } = body

    // Validate inputs
    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Vui lòng nhập mật khẩu hiện tại' },
        { status: 400 }
      )
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: 'Vui lòng nhập mật khẩu mới' },
        { status: 400 }
      )
    }

    // Validate password requirements
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 8 ký tự' },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 1 chữ hoa' },
        { status: 400 }
      )
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 1 chữ số' },
        { status: 400 }
      )
    }

    if (!/[!@#$%^&*]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Mật khẩu xác nhận không khớp' },
        { status: 400 }
      )
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'Mật khẩu mới phải khác mật khẩu hiện tại' },
        { status: 400 }
      )
    }

    // Simulate password change
    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật mật khẩu thành công',
      changedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      { error: 'Không thể thay đổi mật khẩu' },
      { status: 500 }
    )
  }
}
