'use client'

import { LoginScreen } from './login-screen'
import { RegisterScreen } from './register-screen'
import { ForgotPasswordScreen } from './forgot-password-screen'
import { VerifyOtpScreen } from './verify-otp-screen'
import { useAppStore } from '@/store/app-store'
import { AnimatePresence, motion } from 'framer-motion'

export function AuthGate() {
  const { authScreen } = useAppStore()

  return (
    <div className="h-screen supports-[height:100dvh]:h-dvh bg-background flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={authScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
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
