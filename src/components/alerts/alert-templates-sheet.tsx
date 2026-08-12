'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, ArrowRight, BarChart3, TrendingUp, Activity, Zap, DollarSign, CalendarDays } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'
import type { AlertTemplate, AlertRiskLevel } from '@/lib/types'

const CATEGORIES = [
  { key: 'all', label: 'Tất cả' },
  { key: 'technical', label: 'Chỉ báo kỹ thuật' },
  { key: 'price', label: 'Giá' },
  { key: 'volume', label: 'Khối lượng' },
  { key: 'volatility', label: 'Biến động' },
] as const

type CategoryKey = (typeof CATEGORIES)[number]['key']

const TECHNICAL_INDICATORS = ['RSI', 'MACD', 'MA', 'ATR']
const PRICE_INDICATORS = ['price']
const VOLUME_INDICATORS = ['volume']
const VOLATILITY_INDICATORS = ['ATR', 'event']

function getCategoryForIndicator(indicator: string): CategoryKey {
  if (TECHNICAL_INDICATORS.includes(indicator)) return 'technical'
  if (PRICE_INDICATORS.includes(indicator)) return 'price'
  if (VOLUME_INDICATORS.includes(indicator)) return 'volume'
  if (VOLATILITY_INDICATORS.includes(indicator)) return 'volatility'
  return 'all'
}

function riskBadgeClass(level: AlertRiskLevel) {
  switch (level) {
    case 'high': return 'bg-destructive/10 text-destructive border-destructive/20'
    case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
    case 'low': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
  }
}

function riskLabel(level: AlertRiskLevel) {
  switch (level) {
    case 'high': return 'Cao'
    case 'medium': return 'Vừa'
    case 'low': return 'Thấp'
  }
}

function assetTypeLabel(type: string) {
  switch (type) {
    case 'stock': return 'CK'
    case 'crypto': return 'Crypto'
    case 'gold': return 'Vàng'
    default: return 'Tất cả'
  }
}

function indicatorIcon(type: string) {
  switch (type) {
    case 'RSI': return <BarChart3 className="h-3.5 w-3.5" />
    case 'MACD': return <Activity className="h-3.5 w-3.5" />
    case 'MA': return <TrendingUp className="h-3.5 w-3.5" />
    case 'ATR': return <Zap className="h-3.5 w-3.5" />
    case 'volume': return <BarChart3 className="h-3.5 w-3.5" />
    case 'price': return <DollarSign className="h-3.5 w-3.5" />
    case 'event': return <CalendarDays className="h-3.5 w-3.5" />
    default: return <Activity className="h-3.5 w-3.5" />
  }
}

function TemplateCard({
  template,
  onUse,
}: {
  template: AlertTemplate
  onUse: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/30"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-sm leading-tight">{template.name}</h4>
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        </div>
        <div className="flex-shrink-0">
          {indicatorIcon(template.indicatorType)}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
          {template.indicatorType}
        </Badge>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
          {assetTypeLabel(template.assetType)}
        </Badge>
        <Badge
          variant="outline"
          className={cn('text-[10px] px-1.5 py-0', riskBadgeClass(template.riskLevel))}
        >
          {riskLabel(template.riskLevel)}
        </Badge>
      </div>

      <div className="mt-2 text-xs font-mono text-muted-foreground bg-muted/50 rounded px-2 py-1">
        {template.condition}
      </div>

      <Button
        size="sm"
        variant="outline"
        className="mt-3 w-full gap-1.5 text-xs"
        onClick={onUse}
      >
        Sử dụng
        <ArrowRight className="h-3 w-3" />
      </Button>
    </motion.div>
  )
}

function TemplateSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-10 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-8 rounded-full" />
      </div>
      <Skeleton className="h-6 w-full rounded" />
      <Skeleton className="h-8 w-full rounded-md" />
    </div>
  )
}

export function AlertTemplatesSheet() {
  const { activeOverlay, overlayData, openOverlay, closeOverlay } = useAppStore()
  const [templates, setTemplates] = useState<AlertTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryKey>('all')

  const open = activeOverlay === 'alert-templates'

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const run = async () => {
      if (cancelled) return
      setLoading(true)
      try {
        const res = await fetch('/api/alert-templates')
        const json = await res.json()
        if (!cancelled) setTemplates(json.data ?? [])
      } catch {
        if (!cancelled) setTemplates([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [open])

  const filtered = useMemo(() => {
    let result = templates
    if (category !== 'all') {
      result = result.filter(
        (t) => getCategoryForIndicator(t.indicatorType) === category
      )
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.indicatorType.toLowerCase().includes(q)
      )
    }
    return result
  }, [templates, category, search])

  const handleUseTemplate = (template: AlertTemplate) => {
    closeOverlay()
    setTimeout(() => {
      openOverlay('alert-builder', { templateId: template.id, template })
    }, 200)
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && closeOverlay()}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Kho mẫu cảnh báo</SheetTitle>
          <SheetDescription>
            Các chuẩn rủi ro của chuyên gia
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm mẫu cảnh báo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  category === c.key
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-accent'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Template grid */}
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <TemplateSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Không tìm thấy mẫu phù hợp
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((tpl) => (
                <TemplateCard
                  key={tpl.id}
                  template={tpl}
                  onUse={() => handleUseTemplate(tpl)}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
