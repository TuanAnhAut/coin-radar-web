'use client'

import { useState, useRef, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Mail,
  Lock,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAppStore } from '@/store/app-store'

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
export function ForgotPasswordScreen() {
  const { setAuthScreen, setPendingVerify } = useAppStore()

  // ── Form state ──
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isFormValid = email.trim().length > 0

  // ── Submit handler ──
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isFormValid || isLoading) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || err.message || 'Gửi mã thất bại')
      }

      // Navigate to OTP verification
      setPendingVerify(email.trim(), 'forgot-password')
      toast.success('Mã xác minh đã được gửi đến email của bạn')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Không thể gửi mã, vui lòng thử lại'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8 pb-[env(safe-area-inset-bottom,0px)]">
      {/* ── Decorative background blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-16 top-32 h-64 w-64 rounded-full bg-amber-500/8 blur-3xl" />
        <div className="absolute -right-20 bottom-28 h-72 w-72 rounded-full bg-orange-500/6 blur-3xl" />
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
            onClick={() => setAuthScreen('login')}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </button>
        </motion.div>

        {/* ── Icon ── */}
        <motion.div variants={fadeUp} custom={1} className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 shadow-lg shadow-amber-500/10">
            <Lock className="h-8 w-8 text-amber-500" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">Quên mật khẩu</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Nhập email đã đăng ký để nhận mã xác minh
            </p>
          </div>
        </motion.div>

        {/* ── Form Card ── */}
        <motion.div
          variants={fadeUp}
          custom={2}
          className="w-full rounded-xl border bg-card/80 p-6 shadow-xl backdrop-blur-sm sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email đăng ký</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="nhập email đã đăng ký"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="h-12 w-full"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                'Gửi mã xác minh'
              )}
            </Button>
          </form>
        </motion.div>

        {/* ── Login link ── */}
        <motion.div variants={fadeUp} custom={3} className="text-center">
          <span className="text-sm text-muted-foreground">Nhớ mật khẩu? </span>
          <button
            type="button"
            onClick={() => setAuthScreen('login')}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            Đăng nhập
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
