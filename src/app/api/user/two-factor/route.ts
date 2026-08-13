import { NextRequest, NextResponse } from 'next/server'

// GET /api/user/two-factor — Get 2FA status
export async function GET() {
  return NextResponse.json({
    enabled: false,
    enabledAt: null,
    recoveryCodesRemaining: 10,
    method: 'totp',
  })
}

// POST /api/user/two-factor/setup — Start 2FA setup (get secret + QR)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'setup') {
      // Generate simulated 2FA secret
      return NextResponse.json({
        success: true,
        secret: 'JBSWY3DPEHPK3PXP',
        qrCodeUrl: 'otpauth://totp/CoinRadar:nguyenvana@email.com?secret=JBSWY3DPEHPK3PXP&issuer=CoinRadar',
        recoveryCodes: [
          'ABCD-EFGH', 'IJKL-MNOP', 'QRST-UVWX', 'YZAB-CDEF',
          'GHIJ-KLMN', 'OPQR-STUV', 'WXYZ-ABCD', 'EFGH-IJKL',
          'MNOP-QRST', 'UVWX-YZAB',
        ],
      })
    }

    if (action === 'verify') {
      const { code } = body
      if (!code || code.length !== 6) {
        return NextResponse.json(
          { error: 'Mã xác thực phải có 6 chữ số' },
          { status: 400 }
        )
      }

      // Simulate verification (accept any 6-digit code for demo)
      return NextResponse.json({
        success: true,
        message: 'Xác thực thành công',
        enabledAt: new Date().toISOString(),
      })
    }

    if (action === 'disable') {
      const { currentPassword } = body
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Vui lòng nhập mật khẩu để tắt 2FA' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Đã tắt xác thực hai yếu tố',
        disabledAt: new Date().toISOString(),
      })
    }

    if (action === 'regenerate-codes') {
      return NextResponse.json({
        success: true,
        message: 'Đã tạo mã khôi phục mới',
        recoveryCodes: [
          'NEW1-CODE1', 'NEW2-CODE2', 'NEW3-CODE3', 'NEW4-CODE4',
          'NEW5-CODE5', 'NEW6-CODE6', 'NEW7-CODE7', 'NEW8-CODE8',
          'NEW9-CODE9', 'NEWA-CODEA',
        ],
      })
    }

    return NextResponse.json(
      { error: 'Hành động không hợp lệ' },
      { status: 400 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Không thể thực hiện thao tác' },
      { status: 500 }
    )
  }
}
