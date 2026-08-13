'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useAppStore } from '@/store/app-store'

export function AlertFab() {
  const { currentView, openOverlay } = useAppStore()

  if (currentView !== 'alerts') return null

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
      onClick={() => openOverlay('alert-templates')}
      className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-110 active:scale-95 md:bottom-6 md:right-6"
      aria-label="Tạo cảnh báo mới"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-20" />
      <Plus className="relative h-6 w-6" />
    </motion.button>
  )
}
