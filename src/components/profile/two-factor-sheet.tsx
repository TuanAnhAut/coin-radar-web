'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  Copy,
  RefreshCw,
  CheckCircle2,
  QrCode,
  AlertTriangle,
  Smartphone,
  Check,
  XCircle,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'

type TwoFaStep = 'disabled' | 'scanning' | 'verifying' | 'enabled'

// Simulated QR code pattern (21x21) - realistic finder patterns + data area
const qrPattern: number[][] = [
  [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,1,0,1,0,1,0,0,0,0,0,1,0],
  [1,0,1,1,1,0,1,0,1,0,1,0,1,1,0,1,1,1,0,1,0],
  [1,0,1,1,1,0,1,0,0,1,1,0,0,1,0,1,1,1,0,0,1],
  [1,0,1,1,1,0,1,0,1,0,0,1,1,1,0,1,1,1,0,1,1],
  [1,0,0,0,0,0,1,0,0,1,1,0,0,1,0,0,0,0,0,1,0],
  [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1],
  [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0],
  [1,0,1,1,0,1,1,0,0,0,1,0,1,1,0,1,0,1,1,0,1],
  [0,1,0,0,1,0,0,1,1,0,0,1,0,0,1,0,1,0,0,1,0],
  [1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,1,0,1,1,0,1],
  [0,1,0,1,0,1,0,1,1,0,1,1,0,1,0,0,1,0,1,1,0],
  [1,1,0,0,1,0,1,0,1,1,0,0,1,0,1,1,0,0,0,0,1],
  [1,1,1,1,1,1,1,0,0,0,1,1,0,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,1,1,0,0,1,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,0,1,1,1,0,1,0,1,1,1,0,1,0],
  [1,0,1,1,1,0,1,0,1,0,0,0,1,1,0,1,0,1,1,0,1],
  [1,0,1,1,1,0,1,0,0,1,1,0,0,0,1,0,1,1,0,1,0],
  [1,0,0,0,0,0,1,0,1,0,1,1,0,1,1,0,0,0,1,0,1],
  [1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,1,0,1,0,1],
  [0,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,1,1,0,0,0],
]

const recoveryCodes = [
  'ABCD-EFGH', 'IJKL-MNOP', 'QRST-UVWX', 'YZAB-CDEF',
  'GHIJ-KLMN', 'OPQR-STUV', 'WXYZ-ABCD', 'EFGH-IJKL',
  'MNOP-QRST', 'UVWX-YZAB',
]

const authApps = [
  { name: 'Google Authenticator', color: 'bg-blue-500/10 text-blue-500' },
  { name: 'Authy', color: 'bg-red-500/10 text-red-500' },
  { name: 'Microsoft Authenticator', color: 'bg-sky-500/10 text-sky-500' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export function TwoFactorSheet() {
  const { activeOverlay, closeOverlay } = useAppStore()

  const isOpen = activeOverlay === 'two-factor'

  // State machine
  const [step, setStep] = useState<TwoFaStep>('disabled')
  const [twoFaEnabled, setTwoFaEnabled] = useState(false)

  // OTP input
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Disable 2FA
  const [disablePassword, setDisablePassword] = useState('')

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }, [otp])

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }, [otp])

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...Array(6).fill('')]
    pasted.split('').forEach((char, i) => {
      newOtp[i] = char
    })
    setOtp(newOtp)
    const focusIndex = Math.min(pasted.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }, [])

  const handleCopySecret = () => {
    navigator.clipboard.writeText('JBSWY3DPEHPK3PXP')
    toast.success('Đã sao chép mã bí mật')
  }

  const handleCopyAllCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'))
    toast.success('Đã sao chép tất cả mã khôi phục')
  }

  const handleVerify = () => {
    const code = otp.join('')
    if (code.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 số')
      return
    }
    // Simulate verification
    setStep('enabled')
    setTwoFaEnabled(true)
    toast.success('Xác thực hai yếu tố đã được bật thành công!')
  }

  const handleDisable = () => {
    setDisablePassword('')
    // Simulated: any password works
  }

  const handleConfirmDisable = () => {
    setStep('disabled')
    setTwoFaEnabled(false)
    setOtp(Array(6).fill(''))
    setDisablePassword('')
    toast.success('Đã tắt xác thực hai yếu tố')
  }

  const handleRegenerateCodes = () => {
    toast.success('Đã tạo mã khôi phục mới')
  }

  // Reset state when sheet closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeOverlay()
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] sm:max-h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Xác thực hai yếu tố</SheetTitle>
        </SheetHeader>

        <motion.div
          className="custom-scrollbar flex-1 min-h-0 overflow-y-auto pb-24 -mx-6 px-6 space-y-6 mt-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={step}
        >
          {/* ====== Header Info Card ====== */}
          <motion.div variants={itemVariants} className="rounded-xl border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Xác thực hai yếu tố (2FA)</h3>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full',
                      twoFaEnabled
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        twoFaEnabled ? 'bg-emerald-500' : 'bg-muted-foreground'
                      )}
                    />
                    {twoFaEnabled ? 'Đã bật' : 'Chưa bật'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Thêm lớp bảo mật phụ cho tài khoản của bạn. Khi bật 2FA, mỗi lần đăng nhập bạn sẽ cần nhập mã
                  từ ứng dụng xác thực trên điện thoại.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ====== DISABLED STATE ====== */}
          {!twoFaEnabled && (
            <>
              {/* Step 1 - Introduction */}
              <motion.div variants={itemVariants} className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Smartphone className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Bước 1: Cài đặt ứng dụng xác thực</h4>
                    <p className="text-xs text-muted-foreground">Tải và cài đặt một trong các ứng dụng sau</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {authApps.map((app) => (
                    <span
                      key={app.name}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                        app.color
                      )}
                    >
                      <QrCode className="h-3 w-3" />
                      {app.name}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sau khi cài đặt, hãy quét mã QR bên dưới hoặc nhập mã bí mật thủ công để thêm Coin Radar vào ứng dụng.
                </p>
              </motion.div>

              {/* Step 2 - QR Code Card */}
              <motion.div variants={itemVariants} className="rounded-xl border bg-card p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                    <QrCode className="h-4 w-4 text-violet-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Quét mã QR</h4>
                    <p className="text-xs text-muted-foreground">Mở ứng dụng xác thực và quét mã này</p>
                  </div>
                </div>

                {/* QR Code Visual */}
                <div className="flex justify-center">
                  <div className="bg-white rounded-xl p-3 inline-block">
                    <div
                      className="grid gap-[1px]"
                      style={{
                        gridTemplateColumns: `repeat(${qrPattern[0].length}, 4px)`,
                      }}
                    >
                      {qrPattern.map((row, rowIdx) =>
                        row.map((cell, colIdx) => (
                          <div
                            key={`${rowIdx}-${colIdx}`}
                            className="h-[4px] w-[4px]"
                            style={{
                              backgroundColor: cell ? '#0f172a' : '#ffffff',
                              borderRadius: '1px',
                            }}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Secret Key */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Mã bí mật để khôi phục</p>
                  <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2.5">
                    <span className="text-sm font-mono tracking-widest font-semibold">JBSW Y3DP EHPK 3PXP</span>
                    <button
                      onClick={handleCopySecret}
                      className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center transition-colors shrink-0"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Không chia sẻ mã này với ai
                  </p>
                </div>
              </motion.div>

              {/* Step 3 - Verification Code Input */}
              <motion.div variants={itemVariants} className="rounded-xl border bg-card p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Bước 2: Nhập mã xác thực</h4>
                    <p className="text-xs text-muted-foreground">Nhập mã 6 số từ ứng dụng xác thực của bạn</p>
                  </div>
                </div>

                {/* OTP Inputs */}
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="h-12 w-12 text-center text-lg font-bold tracking-tighter rounded-lg p-0"
                    />
                  ))}
                </div>

                <Button
                  className="w-full h-12"
                  onClick={handleVerify}
                  disabled={otp.join('').length !== 6}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Xác thực
                </Button>
              </motion.div>
            </>
          )}

          {/* ====== ENABLED STATE ====== */}
          {twoFaEnabled && (
            <>
              {/* Active Status Card */}
              <motion.div
                variants={itemVariants}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-emerald-500">2FA đã được bật</h4>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground">Đã kích hoạt: 15/01/2024</p>
                      <p className="text-xs text-muted-foreground">Mã khôi phục còn lại: 8/10</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Recovery Codes Section */}
              <motion.div variants={itemVariants} className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <RefreshCw className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Mã khôi phục</h4>
                    <p className="text-xs text-muted-foreground">
                      Lưu các mã này ở nơi an toàn. Mỗi mã chỉ sử dụng được một lần.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {recoveryCodes.map((code, index) => (
                    <div
                      key={index}
                      className="rounded-lg border bg-muted/30 px-3 py-2 text-center"
                    >
                      <span className="text-xs font-mono tracking-wider font-medium">{code}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-10 gap-2"
                    onClick={handleCopyAllCodes}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Sao chép tất cả
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 h-10 gap-2">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Tạo mã mới
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tạo mã khôi phục mới?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Mã khôi phục cũ sẽ không còn hiệu lực. Hãy đảm bảo bạn đã lưu mã hiện tại trước khi tạo mã mới.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRegenerateCodes}>
                          Tạo mã mới
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>

              {/* Danger Zone */}
              <motion.div
                variants={itemVariants}
                className="rounded-xl border border-destructive/50 bg-destructive/5 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-destructive">Tắt xác thực 2FA</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tài khoản của bạn sẽ kém an toàn hơn khi tắt 2FA.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Nhập mật khẩu để xác nhận
                    </label>
                    <Input
                      type="password"
                      placeholder="Nhập mật khẩu hiện tại"
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="lg"
                        className="w-full h-12"
                        disabled={!disablePassword}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Tắt xác thực 2FA
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Xác nhận tắt 2FA
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn tắt xác thực hai yếu tố? Điều này sẽ làm giảm đáng kể
                          mức độ bảo mật của tài khoản. Tác giả xấu có thể dễ dàng truy cập tài khoản
                          của bạn nếu chỉ sử dụng mật khẩu.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleConfirmDisable}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Tắt 2FA
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}
