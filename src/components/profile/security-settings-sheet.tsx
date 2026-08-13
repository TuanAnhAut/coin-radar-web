'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Fingerprint, Lock, Timer, ShieldCheck, Trash2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'

type AutoLockValue = '1min' | '5min' | '15min' | 'never'

const autoLockOptions: { key: AutoLockValue; label: string }[] = [
  { key: '1min', label: '1 phút' },
  { key: '5min', label: '5 phút' },
  { key: '15min', label: '15 phút' },
  { key: 'never', label: 'Không' },
]

export function SecuritySettingsSheet() {
  const { activeOverlay, closeOverlay } = useAppStore()

  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [autoLock, setAutoLock] = useState<AutoLockValue>('5min')
  const [encryptionEnabled, setEncryptionEnabled] = useState(true)

  const isOpen = activeOverlay === 'security-settings'

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeOverlay()}>
      <SheetContent side="bottom" className="h-[85vh] sm:max-h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Bảo mật</SheetTitle>
        </SheetHeader>

        <div className="custom-scrollbar flex-1 min-h-0 overflow-y-auto pb-24 -mx-6 px-6 space-y-6 mt-4">
          {/* Biometric lock - full width, min 56px height */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center justify-between min-h-[56px]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Fingerprint className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Khóa sinh trắc học</p>
                  <p className="text-xs text-muted-foreground">Sử dụng FaceID hoặc TouchID để mở khóa</p>
                </div>
              </div>
              <Switch checked={biometricEnabled} onCheckedChange={setBiometricEnabled} className="scale-100 sm:scale-105" />
            </div>
          </motion.div>

          {/* Change PIN */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center justify-between min-h-[56px]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Thay đổi mã PIN</p>
                  <p className="text-xs text-muted-foreground">Mã PIN dùng để xác thực giao dịch</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 min-h-[44px] px-4"
                onClick={() => toast.info('Tính năng sắp ra mắt')}
              >
                Thay đổi
              </Button>
            </div>
          </motion.div>

          {/* Auto-lock */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border bg-card p-4 space-y-3"
          >
            <div className="flex items-center gap-3 min-h-[44px]">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <Timer className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Tự động khóa</p>
                <p className="text-xs text-muted-foreground">Khóa ứng dụng sau khoảng thời gian</p>
              </div>
            </div>
            {/* Segmented control - proper sizing with min 44px touch targets */}
            <div className="flex rounded-lg bg-muted p-1 gap-1">
              {autoLockOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setAutoLock(opt.key)}
                  className={cn(
                    'flex-1 py-2.5 rounded-md text-xs font-medium transition-all min-h-[44px] flex items-center justify-center',
                    autoLock === opt.key
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Data encryption */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center justify-between min-h-[56px]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Mã hóa dữ liệu</p>
                  <p className="text-xs text-muted-foreground">Bảo vệ dữ liệu cục bộ bằng mã hóa AES-256</p>
                </div>
              </div>
              <Switch checked={encryptionEnabled} onCheckedChange={setEncryptionEnabled} className="scale-100 sm:scale-105" />
            </div>
          </motion.div>

          {/* Destructive: Clear all data - full width button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-destructive/50 bg-destructive/5 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Xóa tất cả dữ liệu</p>
                <p className="text-xs text-muted-foreground">
                  Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị xóa vĩnh viễn.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="lg" className="w-full h-12">
                    Xóa tất cả dữ liệu
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa dữ liệu</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.
                      Tất cả cảnh báo, danh mục, và cài đặt sẽ bị xóa vĩnh viễn.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => toast.error('Tính năng sắp ra mắt')}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Xóa tất cả
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
