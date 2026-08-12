'use client'

import { motion } from 'framer-motion'
import { Shield, BellPlus, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'

const actions = [
  {
    label: 'Quét rủi ro',
    icon: Shield,
    action: 'scanner' as const,
    description: 'Phát hiện bất thường',
  },
  {
    label: 'Tạo cảnh báo',
    icon: BellPlus,
    action: 'alert-builder' as const,
    description: 'Thiết lập điều kiện',
  },
  {
    label: 'Xem thị trường',
    icon: TrendingUp,
    action: 'market' as const,
    description: 'Danh sách tài sản',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export function QuickActions() {
  const { openOverlay, setCurrentView } = useAppStore()

  function handleAction(action: typeof actions[number]) {
    if (action.action === 'market') {
      setCurrentView('market')
    } else {
      openOverlay(action.action)
    }
  }

  return (
    <motion.div
      className="grid grid-cols-3 gap-3"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <motion.div key={action.label} variants={itemVariants}>
            <Button
              variant="outline"
              className="h-auto w-full flex-col gap-2 py-4 px-3 hover:bg-accent"
              onClick={() => handleAction(action)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-semibold leading-tight text-center">
                {action.label}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight text-center">
                {action.description}
              </span>
            </Button>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
