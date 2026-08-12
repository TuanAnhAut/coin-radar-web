'use client'

import { motion } from 'framer-motion'
import {
  Briefcase,
  Bell,
  Palette,
  Shield,
  Crown,
  Edit2,
  ShieldCheck,
  Eye,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAppStore, type OverlayType } from '@/store/app-store'

const statCards = [
  {
    icon: Bell,
    label: 'Cảnh báo đang bật',
    value: '12',
    color: 'text-orange-500',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
  },
  {
    icon: ShieldCheck,
    label: 'Tỷ lệ tránh rủi ro',
    value: '78%',
    color: 'text-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    icon: Eye,
    label: 'Tổng giá trị theo dõi',
    value: '1.25 tỷ ₫',
    color: 'text-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    icon: Briefcase,
    label: 'Mã theo dõi',
    value: '8',
    color: 'text-violet-500',
    bg: 'bg-violet-100 dark:bg-violet-900/30',
  },
]

const settingsItems = [
  {
    key: 'portfolio',
    icon: Briefcase,
    label: 'Quản lý danh mục theo dõi',
    description: 'Theo dõi giá và biến động các tài sản',
  },
  {
    key: 'notification-settings',
    icon: Bell,
    label: 'Cài đặt thông báo',
    description: 'Tùy chỉnh thông báo đẩy và âm thanh',
  },
  {
    key: 'display-settings',
    icon: Palette,
    label: 'Giao diện & Hiển thị',
    description: 'Giao diện, cỡ chữ, biểu đồ',
  },
  {
    key: 'security-settings',
    icon: Shield,
    label: 'Bảo mật',
    description: 'Khóa sinh trắc học, mã PIN, mã hóa',
  },
  {
    key: 'subscription',
    icon: Crown,
    label: 'Gói dịch vụ',
    description: 'Quản lý gói đăng ký và tính năng',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export function ProfileDashboard() {
  const { openOverlay } = useAppStore()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4 sm:space-y-6"
    >
      {/* Profile card */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Avatar - smaller on mobile, larger on desktop */}
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg shrink-0">
                NA
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base sm:text-lg lg:text-xl truncate">Nguyễn Văn A</h3>
                  <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 text-[10px] sm:text-xs font-medium shrink-0">
                    Free
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  nguyenvana@email.com
                </p>
              </div>

              {/* Edit button - hide text on small mobile */}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 shrink-0"
                onClick={() => toast.info('Tính năng sắp ra mắt')}
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Chỉnh sửa</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats grid - 2 cols on mobile, 4 cols on desktop */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', stat.bg)}>
                  <stat.icon className={cn('h-4 w-4', stat.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                    {stat.label}
                  </p>
                  <p className="text-sm font-bold truncate">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Settings list */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {settingsItems.map((item, index) => (
              <div key={item.key}>
                <button
                  className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 min-h-[60px] hover:bg-muted/50 transition-colors text-left"
                  onClick={() => openOverlay(item.key as OverlayType)}
                >
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                  <svg
                    className="h-4 w-4 text-muted-foreground shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                {index < settingsItems.length - 1 && (
                  <Separator className="ml-[3.75rem] sm:ml-[4.5rem]" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
