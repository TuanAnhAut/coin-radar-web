'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ChevronRight, AlertTriangle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import type { Alert } from '@/lib/types'

function getStatusBadge(status: Alert['status']) {
  switch (status) {
    case 'active':
      return <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">Hoạt động</Badge>
    case 'triggered':
      return <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0">Đã kích hoạt</Badge>
    case 'disabled':
      return <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">Tắt</Badge>
  }
}

function getRiskIcon(riskLevel: Alert['riskLevel']) {
  if (riskLevel === 'high') return AlertTriangle
  return AlertCircle
}

function getRiskColor(riskLevel: Alert['riskLevel']): string {
  switch (riskLevel) {
    case 'high': return 'text-loss'
    case 'medium': return 'text-amber-500'
    case 'low': return 'text-gain'
  }
}

export function RecentAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { openOverlay, requireAuth } = useAppStore()

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch('/api/alerts?status=active&limit=5')
        const json = await res.json()
        // The API doesn't support limit, so we slice client-side
        setAlerts((json.data as Alert[]).slice(0, 5))
      } catch {
        setError('Không thể tải cảnh báo')
      } finally {
        setLoading(false)
      }
    }
    fetchAlerts()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-36" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[56px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error || alerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Section header + "View all" button */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-semibold">Cảnh báo gần đây</h2>
        <button
          className="text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[32px] px-2 rounded-md hover:bg-accent/50"
          onClick={() => requireAuth('alerts')}
        >
          Xem tất cả
        </button>
      </div>

      <div className="space-y-2">
        {alerts.map((alert, index) => {
          const RiskIcon = getRiskIcon(alert.riskLevel)
          return (
            <motion.div
              key={alert.id}
              className={cn(
                'flex items-center gap-2.5 sm:gap-3 rounded-lg border bg-card',
                'cursor-pointer transition-colors hover:bg-accent/50 active:bg-accent/70',
                // Proper padding and min-height for touch
                'p-2.5 sm:p-3 min-h-[48px]'
              )}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => openOverlay('alert-detail', { id: alert.id })}
            >
              {/* Risk indicator icon */}
              <div className={cn(
                'flex-shrink-0 flex items-center justify-center',
                'w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted/50',
                getRiskColor(alert.riskLevel)
              )}>
                <RiskIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>

              {/* Content - flex with min-w-0 to prevent overflow */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{alert.assetSymbol}</span>
                  {getStatusBadge(alert.status)}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5 leading-relaxed">
                  {alert.condition}
                </p>
              </div>

              {/* Time + chevron */}
              <div className="flex flex-col items-center justify-center gap-0.5 flex-shrink-0 ml-1">
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(alert.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
