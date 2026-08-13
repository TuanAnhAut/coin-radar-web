'use client'

import { useState, useRef, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  Radar,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import type { UserData } from '@/store/app-store'

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
export function LoginScreen() {
  const { setAuthScreen, login } = useAppStore()

  // ── Form state ──
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)

  const isFormValid = email.trim().length > 0 && password.length > 0

  // ── Submit handler ──
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isFormValid || isLoading) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || err.message || 'Đăng nhập thất bại')
      }

      const data = await res.json()
      login(data.user as UserData)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Đăng nhập thất bại, vui lòng thử lại'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // ── Google login (placeholder) ──
  const handleGoogleLogin = () => {
    toast.info('Đăng nhập Google sắp ra mắt')
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8 pb-[env(safe-area-inset-bottom,0px)]">
      {/* ── Decorative background blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-32 h-80 w-80 rounded-full bg-teal-500/8 blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-40 w-40 rounded-full bg-cyan-500/5 blur-2xl" />
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex w-full max-w-md flex-col items-center gap-6"
      >
        {/* ── Logo & Branding ── */}
        <motion.div variants={fadeUp} custom={0} className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Radar className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Coin Radar
          </h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi thị trường tài chính thông minh
          </p>
        </motion.div>

        {/* ── Login Card ── */}
        <motion.div
          variants={fadeUp}
          custom={1}
          className="w-full rounded-xl border bg-card/80 p-6 shadow-xl backdrop-blur-sm sm:p-8"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">Đăng nhập</h2>
            <p className="mt-1 text-sm text-muted-foreground">Chào mừng bạn trở lại!</p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Mật khẩu</Label>
                <button
                  type="button"
                  onClick={() => setAuthScreen('forgot-password')}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
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
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">hoặc</span>
            <Separator className="flex-1" />
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full"
            onClick={handleGoogleLogin}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Đăng nhập với Google
          </Button>
        </motion.div>

        {/* ── Register link ── */}
        <motion.div variants={fadeUp} custom={2} className="text-center">
          <span className="text-sm text-muted-foreground">Chưa có tài khoản? </span>
          <button
            type="button"
            onClick={() => setAuthScreen('register')}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            Đăng ký ngay
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
