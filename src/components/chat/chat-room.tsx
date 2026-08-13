'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Send,
  Sparkles,
  Star,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import type { ChatMessage, Expert, ChatMessageRole } from '@/lib/types'

// Quick suggestion chips
const QUICK_SUGGESTIONS = [
  { icon: TrendingUp, label: 'Xu hướng thị trường' },
  { icon: BarChart3, label: 'Phân tích kỹ thuật' },
  { icon: AlertTriangle, label: 'Đánh giá rủi ro' },
  { icon: Sparkles, label: 'Gợi ý cảnh báo' },
]

function getAvatarColor(id: string): string {
  const colors = [
    'bg-emerald-500',
    'bg-amber-500',
    'bg-violet-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-pink-500',
  ]
  const idx = parseInt(id.split('-')[1] || '1', 10)
  return colors[(idx - 1) % colors.length]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(-2)
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
}

function getStatusDot(status: Expert['onlineStatus']) {
  switch (status) {
    case 'online': return 'bg-green-500'
    case 'away': return 'bg-amber-500'
    case 'offline': return 'bg-gray-400'
  }
}

function getStatusLabel(status: Expert['onlineStatus']) {
  switch (status) {
    case 'online': return 'Trực tuyến'
    case 'away': return 'Nghỉ'
    case 'offline': return 'Ngoại tuyến'
  }
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`

  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-end gap-2"
    >
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-sm bg-muted max-w-[80%]">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-muted-foreground/50"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">Đang soạn...</span>
      </div>
    </motion.div>
  )
}

function MessageBubble({
  message,
  expertName,
  expertId,
}: {
  message: ChatMessage
  expertName: string
  expertId: string
}) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center my-4"
      >
        <div className="mx-auto max-w-[85%] sm:max-w-[70%] rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div
              className={cn(
                'h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold',
                getAvatarColor(expertId)
              )}
            >
              {getInitials(expertName)}
            </div>
            <span className="text-xs font-semibold text-primary">{expertName}</span>
          </div>
          {message.content.split('\n').map((line, i) => (
            <p key={i} className="text-sm text-muted-foreground leading-relaxed">
              {line || '\u00A0'}
            </p>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground mt-1.5">
          {formatTime(message.createdAt)}
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-end gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar for expert messages */}
      {!isUser && (
        <div
          className={cn(
            'shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold',
            getAvatarColor(expertId)
          )}
        >
          {getInitials(expertName)}
        </div>
      )}

      <div className={cn('flex flex-col max-w-[80%] sm:max-w-[70%]', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted rounded-bl-sm'
          )}
        >
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line || '\u00A0'}
              {i < message.content.split('\n').length - 1 && '\n'}
            </span>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground mt-1 px-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </motion.div>
  )
}

function ChatSkeleton() {
  return (
    <div className="flex-1 space-y-4 px-4 py-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className={cn('flex gap-2', i % 2 === 0 ? 'flex-row-reverse' : '')}>
          {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
          <div className="space-y-1.5">
            <Skeleton className="h-10 w-48 rounded-2xl" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ChatRoom() {
  const {
    activeChatExpertId,
    setActiveChatExpertId,
    setCurrentView,
  } = useAppStore()

  const [expert, setExpert] = useState<Expert | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const expertId = activeChatExpertId

  // Fetch expert info and chat history
  useEffect(() => {
    if (!expertId) return

    setLoading(true)
    Promise.all([
      fetch('/api/experts').then(r => r.json()),
      fetch(`/api/chat/${expertId}/messages`).then(r => r.json()),
    ])
      .then(([expertsJson, chatJson]) => {
        const found = (expertsJson.data || []).find((e: Expert) => e.id === expertId)
        setExpert(found || null)
        setMessages(chatJson.data || [])
      })
      .catch(() => {
        // silently fail
      })
      .finally(() => setLoading(false))
  }, [expertId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])

  // Handle back button
  const handleBack = useCallback(() => {
    setActiveChatExpertId(null)
    // Stay on chat view (directory)
  }, [setActiveChatExpertId])

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !expertId || isSending) return

    const text = inputValue.trim()
    setInputValue('')
    setIsSending(true)

    // Optimistic: add user message immediately
    const optimisticUserMsg: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
      expertId,
    }
    setMessages(prev => [...prev, optimisticUserMsg])

    // Show typing indicator
    setIsTyping(true)

    try {
      const res = await fetch(`/api/chat/${expertId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (res.ok) {
        const json = await res.json()
        // Replace optimistic user message with server version and add expert response
        setMessages(prev => {
          const filtered = prev.filter(m => !m.id.startsWith('optimistic-'))
          return [
            ...filtered,
            json.data.userMessage,
            json.data.expertMessage,
          ]
        })
      }
    } catch {
      // Keep optimistic message, just remove typing
    } finally {
      setIsTyping(false)
      setIsSending(false)
      // Re-focus input
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [inputValue, expertId, isSending])

  // Handle quick suggestion click
  const handleQuickSuggestion = useCallback((label: string) => {
    setInputValue(label)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  // Handle keyboard submit
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  // Auto-resize textarea
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    // Reset height, then auto-grow
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [])

  if (!expertId) return null

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] sm:h-[calc(100vh-3.5rem)]">
      {/* Chat Header */}
      <header className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center gap-3 px-3 sm:px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 -ml-1"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {loading ? (
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ) : expert ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative shrink-0">
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm',
                    getAvatarColor(expert.id)
                  )}
                >
                  {getInitials(expert.name)}
                </div>
                <span
                  className={cn(
                    'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background',
                    getStatusDot(expert.onlineStatus)
                  )}
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{expert.name}</h3>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      getStatusDot(expert.onlineStatus)
                    )}
                  />
                  <span className="text-xs text-muted-foreground">
                    {getStatusLabel(expert.onlineStatus)} · {expert.specialty}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-auto shrink-0">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium">{expert.rating}</span>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-4 py-3 space-y-3"
      >
        {loading ? (
          <ChatSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div
              className={cn(
                'h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3',
                getAvatarColor(expertId)
              )}
            >
              {expert ? getInitials(expert.name) : '?'}
            </div>
            <p className="text-muted-foreground text-sm">
              Bắt đầu cuộc trò chuyện với chuyên gia
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  expertName={expert?.name ?? 'Chuyên gia'}
                  expertId={expertId}
                />
              ))}
            </AnimatePresence>

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick Suggestions (only show when few messages) */}
      {!loading && messages.length <= 3 && (
        <div className="shrink-0 px-3 sm:px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion.label}
                onClick={() => handleQuickSuggestion(suggestion.label)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full border bg-card text-xs font-medium whitespace-nowrap hover:bg-muted transition-colors min-h-[36px]"
              >
                <suggestion.icon className="h-3.5 w-3.5 text-primary" />
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="shrink-0 border-t bg-background safe-bottom">
        <div className="flex items-end gap-2 px-3 sm:px-4 py-3">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={
              expert?.onlineStatus === 'offline'
                ? `${expert.name} hiện ngoại tuyến...`
                : 'Nhập tin nhắn...'
            }
            disabled={isSending}
            rows={1}
            className="flex-1 resize-none rounded-xl border bg-card px-4 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 max-h-[120px] min-h-[44px]"
          />
          <Button
            size="icon"
            className="shrink-0 h-[44px] w-[44px] rounded-xl"
            disabled={!inputValue.trim() || isSending}
            onClick={handleSend}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
