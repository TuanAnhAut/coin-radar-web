'use client'

import { useState, useMemo, useRef, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  Radar,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  CheckCircle,
  X,
  Check,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
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
export function RegisterScreen() {
  const { setAuthScreen, setPendingVerify } = useAppStore()

  // ── Form state ──
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  // ── Password strength (same pattern as change-password-sheet) ──
  const passwordRequirements = useMemo(
    () => [
      { label: 'Mật khẩu phải có ít nhất 8 ký tự', met: password.length >= 8 },
      { label: 'Ít nhất 1 chữ hoa', met: /[A-Z]/.test(password) },
      { label: 'Ít nhất 1 chữ số', met: /[0-9]/.test(password) },
      { label: 'Ít nhất 1 ký tự đặc biệt (!@#$%^&*)', met: /[!@#$%^&*]/.test(password) },
    ],
    [password]
  )

  const strength = passwordRequirements.filter((r) => r.met).length

  const strengthLabel =
    strength === 0
      ? 'Yếu'
      : strength === 1
        ? 'Trung bình'
        : strength === 2
          ? 'Mạnh'
          : 'Rất mạnh'

  const strengthColor =
    strength === 0
      ? 'bg-red-500'
      : strength === 1
        ? 'bg-orange-500'
        : strength === 2
          ? 'bg-yellow-500'
          : 'bg-green-500'

  const strengthTextColor =
    strength === 0
      ? 'text-red-500'
      : strength === 1
        ? 'text-orange-500'
        : strength === 2
          ? 'text-yellow-500'
          : 'text-green-500'

  const passwordsMatch = confirmPassword.length === 0 || confirmPassword === password

  // ── Form validity ──
  const isFormValid =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    password.length >= 8 &&
    passwordRequirements.every((r) => r.met) &&
    password === confirmPassword &&
    agreedToTerms

  // ── Submit handler ──
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isFormValid || isLoading) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || err.message || 'Đăng ký thất bại')
      }

      // Navigate to OTP verification
      setPendingVerify(email.trim(), 'register')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Đăng ký thất bại, vui lòng thử lại'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center overflow-hidden px-4 py-8 pb-[env(safe-area-inset-bottom,0px)]">
      {/* ── Decorative background blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-16 bottom-20 h-64 w-64 rounded-full bg-teal-500/8 blur-3xl" />
      </div>

      {/* ── Scrollable content ── */}
      <motion.div
        ref={scrollRef}
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex w-full max-w-md flex-1 flex-col items-center gap-6 overflow-y-auto custom-scrollbar"
      >
        {/* ── Logo ── */}
        <motion.div variants={fadeUp} custom={0} className="flex flex-col items-center gap-3 pt-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Radar className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">Tạo tài khoản</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Đăng ký để bắt đầu theo dõi thị trường
            </p>
          </div>
        </motion.div>

        {/* ── Register Card ── */}
        <motion.form
          variants={fadeUp}
          custom={1}
          onSubmit={handleSubmit}
          className="w-full rounded-xl border bg-card/80 p-6 shadow-xl backdrop-blur-sm sm:p-8"
        >
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="reg-name">Họ và tên</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  autoComplete="name"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="nhập email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="reg-phone">Số điện thoại</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="0901 234 567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  autoComplete="tel"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="reg-password">Mật khẩu</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="tối thiểu 8 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  autoComplete="new-password"
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

            {/* Password strength */}
            {password.length > 0 && (
              <div className="space-y-2 rounded-lg border bg-background/50 p-3">
                <div className="space-y-1.5">
                  {passwordRequirements.map((req) => (
                    <div key={req.label} className="flex items-center gap-2">
                      {req.met ? (
                        <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                      )}
                      <span
                        className={cn(
                          'text-xs',
                          req.met ? 'text-green-500' : 'text-muted-foreground'
                        )}
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Độ mạnh mật khẩu</span>
                    <span className={cn('text-xs font-medium', strengthTextColor)}>
                      {strengthLabel}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={cn('h-full rounded-full', strengthColor)}
                      initial={{ width: 0 }}
                      animate={{ width: `${(strength / 4) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="reg-confirm-password">Xác nhận mật khẩu</Label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    'pl-10 pr-10',
                    !passwordsMatch && 'border-destructive'
                  )}
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {!passwordsMatch && (
                <p className="text-xs text-destructive">Mật khẩu xác nhận không khớp</p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="reg-terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                disabled={isLoading}
                className="mt-0.5"
              />
              <Label htmlFor="reg-terms" className="text-xs leading-relaxed font-normal text-muted-foreground cursor-pointer">
                Tôi đồng ý với{' '}
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 font-medium"
                  onClick={(e) => {
                    e.preventDefault()
                    // Could open a terms dialog
                    toast.info('Điều khoản dịch vụ sắp ra mắt')
                  }}
                >
                  Điều khoản dịch vụ
                </button>{' '}
                và{' '}
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 font-medium"
                  onClick={(e) => {
                    e.preventDefault()
                    toast.info('Chính sách bảo mật sắp ra mắt')
                  }}
                >
                  Chính sách bảo mật
                </button>
              </Label>
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
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                'Tạo tài khoản'
              )}
            </Button>
          </div>
        </motion.form>

        {/* ── Login link ── */}
        <motion.div variants={fadeUp} custom={2} className="pb-4 text-center">
          <span className="text-sm text-muted-foreground">Đã có tài khoản? </span>
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
