'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Key, CheckCircle, X, Check, Loader2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'

export function ChangePasswordSheet() {
  const { activeOverlay, closeOverlay } = useAppStore()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const isOpen = activeOverlay === 'change-password'

  const passwordRequirements = useMemo(
    () => [
      { label: 'Mật khẩu phải có ít nhất 8 ký tự', met: newPassword.length >= 8 },
      { label: 'Ít nhất 1 chữ hoa', met: /[A-Z]/.test(newPassword) },
      { label: 'Ít nhất 1 chữ số', met: /[0-9]/.test(newPassword) },
      { label: 'Ít nhất 1 ký tự đặc biệt (!@#$%^&*)', met: /[!@#$%^&*]/.test(newPassword) },
    ],
    [newPassword]
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

  const isFormValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    passwordRequirements.every((r) => r.met) &&
    newPassword === confirmPassword

  const handleSubmit = () => {
    if (!isFormValid || isSaving) return
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Đã cập nhật mật khẩu thành công')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      closeOverlay()
    }, 1500)
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeOverlay()}>
      <SheetContent side="bottom" className="h-[85vh] sm:max-h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Đổi mật khẩu</SheetTitle>
        </SheetHeader>

        <div className="custom-scrollbar flex-1 min-h-0 overflow-y-auto pb-24 -mx-6 px-6 space-y-6 mt-4">
          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Đổi mật khẩu</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Định kỳ thay đổi mật khẩu để bảo vệ tài khoản của bạn
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Lần thay đổi gần nhất: <span className="text-foreground font-medium">15 ngày trước</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Password Requirements Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl border bg-card p-4"
          >
            <p className="text-sm font-medium mb-3">Yêu cầu mật khẩu</p>
            <div className="space-y-2.5">
              {passwordRequirements.map((req) => (
                <div key={req.label} className="flex items-center gap-2">
                  {req.met ? (
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
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

            {/* Strength bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Độ mạnh mật khẩu</span>
                <span className={cn('text-xs font-medium', strengthTextColor)}>
                  {newPassword.length > 0 ? strengthLabel : ''}
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
          </motion.div>

          {/* Current Password */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <Label className="text-sm font-medium">Mật khẩu hiện tại</Label>
            </div>
            <div className="relative">
              <Input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu hiện tại"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </motion.div>

          {/* New Password */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <Label className="text-sm font-medium">Mật khẩu mới</Label>
            </div>
            <div className="relative">
              <Input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Confirm New Password */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <Label className="text-sm font-medium">Xác nhận mật khẩu mới</Label>
            </div>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  'pr-10',
                  confirmPassword.length > 0 && confirmPassword !== newPassword && 'border-destructive'
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {confirmPassword.length > 0 && confirmPassword !== newPassword && (
              <p className="text-xs text-destructive mt-1">Mật khẩu xác nhận không khớp</p>
            )}
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="pt-2"
          >
            <Button
              className="w-full h-12"
              disabled={!isFormValid || isSaving}
              onClick={handleSubmit}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Cập nhật mật khẩu'
              )}
            </Button>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
