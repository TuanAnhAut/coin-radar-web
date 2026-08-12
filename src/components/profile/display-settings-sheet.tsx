'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor, Type, DollarSign, CandlestickChart, Home, BarChart3, BellRing } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string; icon?: React.ElementType }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex rounded-lg bg-muted p-1 gap-1">
      {options.map((opt) => {
        const Icon = opt.icon
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all',
              value === opt.key
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

type ThemeValue = 'light' | 'dark' | 'auto'
type FontSizeValue = 'small' | 'medium' | 'large'
type CurrencyValue = 'vnd' | 'usd'
type ChartStyleValue = 'candle' | 'line' | 'area'
type DefaultTabValue = 'home' | 'market' | 'alerts'

export function DisplaySettingsSheet() {
  const { activeOverlay, closeOverlay } = useAppStore()

  const [theme, setTheme] = useState<ThemeValue>('auto')
  const [fontSize, setFontSize] = useState<FontSizeValue>('medium')
  const [currency, setCurrency] = useState<CurrencyValue>('vnd')
  const [chartStyle, setChartStyle] = useState<ChartStyleValue>('candle')
  const [defaultTab, setDefaultTab] = useState<DefaultTabValue>('home')

  const isOpen = activeOverlay === 'display-settings'

  function handleSave() {
    toast.success('Đã lưu cài đặt giao diện')
    closeOverlay()
  }

  const fontSizePreview: Record<FontSizeValue, string> = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeOverlay()}>
      <SheetContent side="bottom" className="h-[85vh] sm:max-h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Giao diện & Hiển thị</SheetTitle>
        </SheetHeader>

        <div className="custom-scrollbar overflow-y-auto pb-24 -mx-6 px-6 space-y-6 mt-4">
          {/* Theme */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border bg-card p-4 space-y-3"
          >
            <h4 className="text-sm font-semibold">Giao diện</h4>
            <SegmentedControl
              options={[
                { key: 'light' as ThemeValue, label: 'Sáng', icon: Sun },
                { key: 'dark' as ThemeValue, label: 'Tối', icon: Moon },
                { key: 'auto' as ThemeValue, label: 'Tự động', icon: Monitor },
              ]}
              value={theme}
              onChange={setTheme}
            />
          </motion.div>

          {/* Font size */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl border bg-card p-4 space-y-3"
          >
            <h4 className="text-sm font-semibold">Cỡ chữ</h4>
            <SegmentedControl
              options={[
                { key: 'small' as FontSizeValue, label: 'Nhỏ' },
                { key: 'medium' as FontSizeValue, label: 'Trung' },
                { key: 'large' as FontSizeValue, label: 'Lớn' },
              ]}
              value={fontSize}
              onChange={setFontSize}
            />
            {/* Preview */}
            <div className={cn('rounded-lg bg-muted/50 p-3 mt-2', fontSizePreview[fontSize])}>
              <p className="text-muted-foreground">
                VN-Index hôm nay tăng mạnh với khối lượng giao dịch vượt trung bình 20 ngày.
              </p>
            </div>
          </motion.div>

          {/* Currency */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border bg-card p-4 space-y-3"
          >
            <h4 className="text-sm font-semibold">Đơn vị tiền tệ</h4>
            <SegmentedControl
              options={[
                { key: 'vnd' as CurrencyValue, label: 'VNĐ' },
                { key: 'usd' as CurrencyValue, label: 'USD' },
              ]}
              value={currency}
              onChange={setCurrency}
            />
          </motion.div>

          {/* Chart style */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border bg-card p-4 space-y-3"
          >
            <h4 className="text-sm font-semibold">Kiểu biểu đồ</h4>
            <SegmentedControl
              options={[
                { key: 'candle' as ChartStyleValue, label: 'Nến', icon: CandlestickChart },
                { key: 'line' as ChartStyleValue, label: 'Đường' },
                { key: 'area' as ChartStyleValue, label: 'Area' },
              ]}
              value={chartStyle}
              onChange={setChartStyle}
            />
          </motion.div>

          {/* Default tab */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border bg-card p-4 space-y-3"
          >
            <h4 className="text-sm font-semibold">Tab mặc định khi mở app</h4>
            <SegmentedControl
              options={[
                { key: 'home' as DefaultTabValue, label: 'Trang chủ', icon: Home },
                { key: 'market' as DefaultTabValue, label: 'Thị trường', icon: BarChart3 },
                { key: 'alerts' as DefaultTabValue, label: 'Cảnh báo', icon: BellRing },
              ]}
              value={defaultTab}
              onChange={setDefaultTab}
            />
          </motion.div>

          {/* Save button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Button className="w-full" onClick={handleSave}>
              Áp dụng
            </Button>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
