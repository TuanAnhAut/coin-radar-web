'use client'

import { useState, useEffect } from 'react'
import { LoginScreen } from './login-screen'
import { RegisterScreen } from './register-screen'
import { ForgotPasswordScreen } from './forgot-password-screen'
import { VerifyOtpScreen } from './verify-otp-screen'
import { useAppStore } from '@/store/app-store'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function AuthGate() {
  const { authScreen, closeAuthGate } = useAppStore()
  // Wait for client mount before enabling animations to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="relative h-full flex flex-col">
      {/* Close button — allows guest to go back to public content */}
      <div className="absolute top-3 right-3 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted transition-colors"
          onClick={closeAuthGate}
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={authScreen}
          initial={mounted ? { opacity: 0, x: 20 } : false}
          animate={{ opacity: 1, x: 0 }}
          exit={mounted ? { opacity: 0, x: -20 } : undefined}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {authScreen === 'login' && <LoginScreen />}
          {authScreen === 'register' && <RegisterScreen />}
          {authScreen === 'forgot-password' && <ForgotPasswordScreen />}
          {authScreen === 'verify-otp' && <VerifyOtpScreen />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
