'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Bell, BellOff, Volume2, AlertTriangle, Newspaper, MessageSquare, TrendingUp, Settings } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAppStore } from '@/store/app-store'

const notificationCategories = [
  {
    key: 'alerts',
    label: 'Cảnh báo kích hoạt',
    description: 'Khi cảnh báo của bạn được kích hoạt',
    icon: AlertTriangle,
    defaultEnabled: true,
  },
  {
    key: 'breaking',
    label: 'Tin nóng',
    description: 'Tin tức quan trọng affecting thị trường',
    icon: Newspaper,
    defaultEnabled: true,
  },
  {
    key: 'expert',
    label: 'Tin từ chuyên gia',
    description: 'Phân tích và nhận định mới từ chuyên gia',
    icon: MessageSquare,
    defaultEnabled: true,
  },
  {
    key: 'market',
    label: 'Cập nhật thị trường',
    description: 'Biến động giá và khối lượng đáng chú ý',
    icon: TrendingUp,
    defaultEnabled: false,
  },
  {
    key: 'system',
    label: 'Thông báo hệ thống',
    description: 'Cập nhật ứng dụng và bảo trì',
    icon: Settings,
    defaultEnabled: true,
  },
]

export function NotificationSettingsSheet() {
  const { activeOverlay, closeOverlay } = useAppStore()

  const [pushEnabled, setPushEnabled] = useState(true)
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true)
  const [quietStart, setQuietStart] = useState('22:00')
  const [quietEnd, setQuietEnd] = useState('07:00')
  const [exceptHighRisk, setExceptHighRisk] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolume] = useState([70])
  const [categories, setCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationCategories.map((c) => [c.key, c.defaultEnabled]))
  )

  const isOpen = activeOverlay === 'notification-settings'

  function toggleCategory(key: string) {
    setCategories((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeOverlay()}>
      <SheetContent side="bottom" className="h-[85vh] sm:max-h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Cài đặt thông báo</SheetTitle>
        </SheetHeader>

        <div className="custom-scrollbar overflow-y-auto pb-24 -mx-6 px-6 space-y-6 mt-4">
          {/* Push notifications */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Thông báo đẩy</p>
                  <p className="text-xs text-muted-foreground">Nhận thông báo trên thiết bị</p>
                </div>
              </div>
              <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
            </div>
          </motion.div>

          {/* Quiet hours */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl border bg-card p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Moon className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Giờ yên tĩnh</p>
                  <p className="text-xs text-muted-foreground">Tắt thông báo trong khoảng thời gian</p>
                </div>
              </div>
              <Switch checked={quietHoursEnabled} onCheckedChange={setQuietHoursEnabled} />
            </div>

            {quietHoursEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 pl-[3.25rem]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Bắt đầu</Label>
                    <input
                      type="time"
                      value={quietStart}
                      onChange={(e) => setQuietStart(e.target.value)}
                      className="mt-1 block w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Kết thúc</Label>
                    <input
                      type="time"
                      value={quietEnd}
                      onChange={(e) => setQuietEnd(e.target.value)}
                      className="mt-1 block w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="except-high-risk"
                    checked={exceptHighRisk}
                    onCheckedChange={(checked) => setExceptHighRisk(checked === true)}
                  />
                  <Label htmlFor="except-high-risk" className="text-xs text-muted-foreground">
                    Trừ rủi ro cực cao
                  </Label>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Sound settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border bg-card p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Volume2 className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Âm thanh</p>
                  <p className="text-xs text-muted-foreground">Âm báo khi có thông báo</p>
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>

            {soundEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pl-[3.25rem]"
              >
                <div className="flex items-center gap-3">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {volume[0]}%
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Notification categories */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border bg-card p-4 space-y-1"
          >
            <h4 className="text-sm font-semibold mb-3">Loại thông báo</h4>
            {notificationCategories.map((cat, index) => (
              <div key={cat.key}>
                <div className="flex items-center gap-3 py-3">
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <cat.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{cat.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                  </div>
                  <Switch
                    checked={categories[cat.key]}
                    onCheckedChange={() => toggleCategory(cat.key)}
                  />
                </div>
                {index < notificationCategories.length - 1 && <Separator />}
              </div>
            ))}
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
