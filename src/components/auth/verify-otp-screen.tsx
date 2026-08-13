'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
  type ClipboardEvent,
} from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ShieldCheck,
  Loader2,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import type { UserData } from '@/store/app-store'

// ── Constants ──
const OTP_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 60

// ── Animation helpers ──
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
}

// ── Component ──
export function VerifyOtpScreen() {
  const {
    setAuthScreen,
    login,
    pendingVerifyEmail,
    pendingVerifyType,
  } = useAppStore()

  // ── OTP state ──
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const otpValue = otp.join('')
  const isOtpComplete = otpValue.length === OTP_LENGTH

  // ── Dynamic subtitle ──
  const subtitle =
    pendingVerifyType === 'login'
      ? 'Nhập mã xác thực 2FA'
      : pendingVerifyEmail
        ? `Nhập mã 6 số đã gửi đến ${pendingVerifyEmail}`
        : 'Nhập mã 6 số đã gửi đến email của bạn'

  // ── Context-aware back navigation ──
  const handleBack = useCallback(() => {
    switch (pendingVerifyType) {
      case 'register':
        setAuthScreen('register')
        break
      case 'forgot-password':
        setAuthScreen('forgot-password')
        break
      case 'login':
        setAuthScreen('login')
        break
    }
  }, [pendingVerifyType, setAuthScreen])

  // ── Countdown timer ──
  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  // ── Resend OTP ──
  const handleResend = async () => {
    if (countdown > 0 || !pendingVerifyEmail) return

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingVerifyEmail,
          type: pendingVerifyType,
        }),
      })

      if (!res.ok) {
        throw new Error('Không thể gửi lại mã')
      }

      toast.success('Mã mới đã được gửi')
      setCountdown(RESEND_COOLDOWN_SECONDS)
      // Focus first input
      inputRefs.current[0]?.focus()
    } catch {
      toast.error('Không thể gửi lại mã, vui lòng thử lại')
    }
  }

  // ── OTP input helpers ──
  const focusInput = useCallback((index: number) => {
    if (index >= 0 && index < OTP_LENGTH) {
      inputRefs.current[index]?.focus()
    }
  }, [])

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (isLoading) return

      // Only accept single digit
      const digit = value.replace(/\D/g, '').slice(-1)

      setOtp((prev) => {
        const next = [...prev]
        next[index] = digit
        return next
      })

      // Auto-focus next
      if (digit && index < OTP_LENGTH - 1) {
        focusInput(index + 1)
      }
    },
    [isLoading, focusInput]
  )

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault()
        setOtp((prev) => {
          if (prev[index]) {
            // Clear current and stay
            const next = [...prev]
            next[index] = ''
            return next
          }
          // Move to previous and clear
          if (index > 0) {
            focusInput(index - 1)
            const next = [...prev]
            next[index - 1] = ''
            return next
          }
          return prev
        })
      } else if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault()
        focusInput(index - 1)
      } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
        e.preventDefault()
        focusInput(index + 1)
      }
    },
    [focusInput]
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      if (isLoading) return

      const pasted = e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, OTP_LENGTH)

      if (pasted.length === 0) return

      setOtp((prev) => {
        const next = [...prev]
        for (let i = 0; i < OTP_LENGTH; i++) {
          next[i] = pasted[i] || ''
        }
        return next
      })

      // Focus the next empty input, or the last one if all filled
      const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1)
      focusInput(nextIndex)
    },
    [isLoading, focusInput]
  )

  // ── Submit handler ──
  const handleSubmit = async () => {
    if (!isOtpComplete || isLoading || !pendingVerifyEmail) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingVerifyEmail,
          otp: otpValue,
          type: pendingVerifyType,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || err.message || 'Mã xác minh không hợp lệ')
      }

      const data = await res.json()

      // Handle success based on type
      switch (pendingVerifyType) {
        case 'register':
        case 'login':
          login(data.user as UserData)
          break
        case 'forgot-password':
          setAuthScreen('login')
          toast.success('Mật khẩu đã được reset, vui lòng đăng nhập')
          break
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Mã xác minh không hợp lệ'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8 pb-[env(safe-area-inset-bottom,0px)]">
      {/* ── Decorative background blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-16 bottom-24 h-64 w-64 rounded-full bg-teal-500/8 blur-3xl" />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-6"
      >
        {/* ── Back button ── */}
        <motion.div variants={fadeUp} custom={0} className="w-full">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </button>
        </motion.div>

        {/* ── Icon ── */}
        <motion.div variants={fadeUp} custom={1} className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="h-8 w-8 text-emerald-500" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">Xác minh OTP</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </motion.div>

        {/* ── OTP Card ── */}
        <motion.div
          variants={fadeUp}
          custom={2}
          className="w-full rounded-xl border bg-card/80 p-6 shadow-xl backdrop-blur-sm sm:p-8"
        >
          <div className="space-y-6">
            {/* OTP Inputs */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  disabled={isLoading}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, '').slice(-1)
                    handleChange(index, d)
                  }}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={(e) => {
                    e.currentTarget.select()
                  }}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={cn(
                    'h-14 w-14 rounded-xl border bg-background/50 text-center text-xl font-bold font-mono',
                    'text-foreground caret-primary outline-none transition-all',
                    'focus:border-primary focus:ring-2 focus:ring-primary/30',
                    'sm:h-16 sm:w-16',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    digit && 'border-primary/50'
                  )}
                />
              ))}
            </div>

            {/* Countdown / Resend */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Gửi lại mã sau{' '}
                  <span className="font-semibold text-foreground">{countdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Gửi lại mã
                </button>
              )}
            </div>

            {/* Submit */}
            <Button
              type="button"
              className="h-12 w-full"
              disabled={!isOtpComplete || isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang xác minh...</span>
                </>
              ) : (
                'Xác minh'
              )}
            </Button>
          </div>
        </motion.div>

        {/* ── Help text ── */}
        <motion.div variants={fadeUp} custom={3} className="text-center px-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Không nhận được mã? Kiểm tra thư mục spam hoặc{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || isLoading}
              className="text-primary hover:text-primary/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              gửi lại mã
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
