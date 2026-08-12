'use client'

import { motion } from 'framer-motion'
import { Check, Crown, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'

interface PlanFeature {
  label: string
  included: boolean
}

interface Plan {
  name: string
  price: string
  priceNote?: string
  highlight?: boolean
  features: PlanFeature[]
  cta?: string
  ctaVariant?: 'default' | 'outline' | 'secondary'
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: 'Miễn phí',
    features: [
      { label: '5 cảnh báo cơ bản', included: true },
      { label: 'Theo dõi 10 mã', included: true },
      { label: 'Tin tức thị trường', included: true },
      { label: 'Phân tích cơ bản', included: true },
      { label: 'Cảnh báo nâng cao', included: false },
      { label: 'Chat với chuyên gia', included: false },
      { label: 'Quét rủi ro chuyên sâu', included: false },
      { label: 'Phân tích AI', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '99.000 ₫/tháng',
    priceNote: 'hoặc 899.000 ₫/năm (tiết kiệm 25%)',
    highlight: true,
    features: [
      { label: 'Cảnh báo tùy biến nâng cao', included: true },
      { label: 'Chat không giới hạn', included: true },
      { label: 'Quét rủi ro chuyên sâu', included: true },
      { label: 'Phân tích AI', included: true },
      { label: 'Ưu tiên hỗ trợ', included: true },
      { label: 'Theo dõi không giới hạn', included: true },
      { label: 'Xuất báo cáo PDF', included: true },
      { label: 'API truy cập', included: true },
    ],
    cta: 'Nâng cấp Pro',
    ctaVariant: 'default',
  },
  {
    name: 'Enterprise',
    price: 'Tùy chỉnh',
    priceNote: 'Dành cho tổ chức và đội nhóm',
    features: [
      { label: 'Tất cả tính năng Pro', included: true },
      { label: 'Quản lý đội nhóm', included: true },
      { label: 'Báo cáo tùy chỉnh', included: true },
      { label: 'Webhook & API nâng cao', included: true },
      { label: 'Hỗ trợ chuyên trách 24/7', included: true },
      { label: 'Training & Onboarding', included: true },
      { label: 'SLA cam kết', included: true },
      { label: 'Custom branding', included: true },
    ],
    cta: 'Liên hệ',
    ctaVariant: 'outline',
  },
]

const comparisonData = [
  ['Cảnh báo', '5', 'Không giới hạn', 'Không giới hạn'],
  ['Mã theo dõi', '10', 'Không giới hạn', 'Không giới hạn'],
  ['Chat chuyên gia', '—', '✓', '✓'],
  ['Phân tích AI', '—', '✓', '✓'],
  ['Quét rủi ro', 'Cơ bản', 'Chuyên sâu', 'Chuyên sâu'],
  ['Hỗ trợ', 'Email', 'Ưu tiên', '24/7'],
]

export function SubscriptionSheet() {
  const { activeOverlay, closeOverlay } = useAppStore()

  const isOpen = activeOverlay === 'subscription'

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeOverlay()}>
      <SheetContent side="bottom" className="h-[85vh] sm:max-h-[85vh] rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Gói dịch vụ</SheetTitle>
        </SheetHeader>

        <div className="custom-scrollbar overflow-y-auto pb-24 -mx-6 px-6 space-y-5 mt-4">
          {/* Current plan badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge variant="secondary" className="text-xs">
              Gói hiện tại: Free
            </Badge>
          </motion.div>

          {/* Plan cards - stack on mobile, 3 cols on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan, planIndex) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * planIndex }}
              >
                <div
                  className={cn(
                    'rounded-xl border p-4 sm:p-5 transition-shadow hover:shadow-md h-full flex flex-col',
                    plan.highlight
                      ? 'border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/20'
                      : 'bg-card'
                  )}
                >
                  {/* Plan header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {plan.highlight && (
                        <Crown className="h-5 w-5 text-amber-500" />
                      )}
                      <h3 className={cn('text-lg font-bold', plan.highlight && 'text-primary')}>
                        {plan.name}
                      </h3>
                    </div>
                    {plan.highlight && (
                      <Badge className="bg-primary text-primary-foreground text-[10px]">
                        Phổ biến
                      </Badge>
                    )}
                  </div>

                  {/* Price - large and prominent */}
                  <p className={cn('text-xl sm:text-2xl font-bold', plan.highlight ? 'text-primary' : '')}>
                    {plan.price}
                  </p>
                  {plan.priceNote && (
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.priceNote}</p>
                  )}

                  {/* Features - checkmarks properly aligned */}
                  <Separator className="my-3" />
                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.label} className="flex items-start gap-2.5">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <span className="h-4 w-4 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="h-3 w-3 rounded-full border-2 border-muted-foreground/30" />
                          </span>
                        )}
                        <span
                          className={cn(
                            'text-sm',
                            !feature.included && 'text-muted-foreground'
                          )}
                        >
                          {feature.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA - full width on mobile */}
                  {plan.cta && (
                    <Button
                      className={cn('w-full mt-4 gap-2 h-11 sm:h-12', plan.ctaVariant === 'outline' ? '' : '')}
                      variant={plan.ctaVariant === 'outline' ? 'outline' : 'default'}
                      onClick={() => toast.info('Tính năng sắp ra mắt')}
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feature comparison table - horizontal scroll on mobile with sticky first column */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border bg-card p-4"
          >
            <h4 className="text-sm font-semibold mb-3">So sánh chi tiết</h4>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-4 text-xs text-muted-foreground font-medium sticky left-0 bg-card z-10">Tính năng</th>
                    <th className="text-center py-2 px-3 text-xs text-muted-foreground font-medium min-w-[80px]">Free</th>
                    <th className="text-center py-2 px-3 text-xs text-primary font-medium bg-primary/5 rounded-t-md min-w-[100px]">Pro</th>
                    <th className="text-center py-2 pl-3 text-xs text-muted-foreground font-medium min-w-[100px]">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {comparisonData.map(([feature, free, pro, enterprise]) => (
                    <tr key={feature as string}>
                      <td className="py-2.5 pr-4 text-xs font-medium sticky left-0 bg-card z-10">{feature as string}</td>
                      <td className="py-2.5 px-3 text-xs text-center text-muted-foreground">{free as string}</td>
                      <td className="py-2.5 px-3 text-xs text-center bg-primary/5">{pro as string}</td>
                      <td className="py-2.5 pl-3 text-xs text-center text-muted-foreground">{enterprise as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
