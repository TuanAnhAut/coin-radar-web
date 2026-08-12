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
      return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Hoạt động</Badge>
    case 'triggered':
      return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Đã kích hoạt</Badge>
    case 'disabled':
      return <Badge variant="outline" className="text-[10px] px-1.5 py-0">Tắt</Badge>
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
  const { openOverlay, setCurrentView } = useAppStore()

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
        <Skeleton className="h-5 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
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
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Cảnh báo gần đây</h2>
        <button
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setCurrentView('alerts')}
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
              className="flex items-center gap-3 rounded-lg border bg-card p-3 cursor-pointer transition-colors hover:bg-accent/50"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => openOverlay('alert-detail', { id: alert.id })}
            >
              <div className={cn('flex-shrink-0', getRiskColor(alert.riskLevel))}>
                <RiskIcon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{alert.assetSymbol}</span>
                  {getStatusBadge(alert.status)}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {alert.condition}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[10px] text-muted-foreground">
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
