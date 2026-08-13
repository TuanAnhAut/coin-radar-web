'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Check,
  Loader2,
  Copy,
  ShieldCheck,
  Crown,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export function EditProfileSheet() {
  const { activeOverlay, closeOverlay } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isOpen = activeOverlay === 'edit-profile'

  const [fullName, setFullName] = useState('Nguyễn Văn A')
  const [email] = useState('nguyenvana@email.com')
  const [phone, setPhone] = useState('0901 234 567')
  const [dateOfBirth, setDateOfBirth] = useState('1990-05-15')
  const [address, setAddress] = useState('TP. Hồ Chí Minh')
  const [isSaving, setIsSaving] = useState(false)
  const [avatarInitials] = useState('NA')
  const [avatarChanged, setAvatarChanged] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSaving(false)
    toast.success('Đã cập nhật thông tin thành công')
    closeOverlay()
  }

  const handleAvatarClick = () => {
    toast.info('Chọn ảnh từ thư viện')
    setAvatarChanged(true)
    setTimeout(() => setAvatarChanged(false), 2000)
  }

  const handleCopyAccountId = () => {
    navigator.clipboard.writeText('CR-2024-001')
    toast.success('Đã sao chép mã tài khoản')
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeOverlay()}>
      <SheetContent side="bottom" className="h-[85vh] sm:max-h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Chỉnh sửa hồ sơ</SheetTitle>
        </SheetHeader>

        <div className="custom-scrollbar flex-1 min-h-0 overflow-y-auto pb-24 -mx-6 px-6 space-y-6 mt-4">
          {/* Avatar Section */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center gap-3"
          >
            <div className="relative">
              <div
                className={cn(
                  'h-24 w-24 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg',
                  'bg-gradient-to-br from-emerald-400 to-teal-600',
                  avatarChanged && 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-background'
                )}
              >
                {avatarInitials}
              </div>
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md border-2 border-background hover:bg-primary/90 transition-colors min-h-[32px] min-w-[32px]"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={() => {}}
              />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base sm:text-lg">{fullName}</h3>
              <p className="text-xs text-muted-foreground">Nhấn vào ảnh để thay đổi</p>
            </div>
          </motion.div>

          {/* Full Name */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.05 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Họ và tên
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="h-10"
                />
              </div>
            </div>
          </motion.div>

          {/* Email (read-only) */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.1 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Email
                </label>
                <Input
                  value={email}
                  disabled
                  className="h-10 opacity-60"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Email không thể thay đổi
                </p>
              </div>
            </div>
          </motion.div>

          {/* Phone */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.15 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Số điện thoại
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="h-10"
                />
              </div>
            </div>
          </motion.div>

          {/* Date of Birth */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.2 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Ngày sinh
                </label>
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
          </motion.div>

          {/* Address */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.25 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Địa chỉ
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ"
                  className="h-10"
                />
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Account Info */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-semibold text-muted-foreground">Thông tin tài khoản</h4>

            {/* Account ID */}
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mã tài khoản</p>
                    <p className="text-sm font-medium font-mono">CR-2024-001</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={handleCopyAccountId}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Registration Date & Plan */}
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày đăng ký</p>
                    <p className="text-sm font-medium">15/01/2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-medium">
                    Free
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.35 }}
          >
            <Button
              className="w-full h-12 text-sm font-semibold"
              onClick={handleSave}
              disabled={isSaving || !fullName.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
