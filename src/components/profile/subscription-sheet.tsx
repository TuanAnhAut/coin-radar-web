'use client'

import { motion } from 'framer-motion'
import { Check, Crown, Star, Zap, Shield, MessageSquare, Brain, Headphones, ArrowRight } from 'lucide-react'
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

          {/* Plan cards */}
          <div className="space-y-4">
            {plans.map((plan, planIndex) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * planIndex }}
              >
                <div
                  className={cn(
                    'rounded-xl border p-5 transition-shadow hover:shadow-md',
                    plan.highlight
                      ? 'border-primary/50 bg-primary/5 shadow-sm'
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

                  {/* Price */}
                  <p className={cn('text-xl font-bold', plan.highlight ? 'text-primary' : '')}>
                    {plan.price}
                  </p>
                  {plan.priceNote && (
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.priceNote}</p>
                  )}

                  {/* Features */}
                  <Separator className="my-3" />
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature.label} className="flex items-center gap-2">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <span className="h-4 w-4 flex items-center justify-center shrink-0">
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

                  {/* CTA */}
                  {plan.cta && (
                    <Button
                      className={cn('w-full mt-4 gap-2', plan.ctaVariant === 'outline' ? '' : '')}
                      variant={plan.ctaVariant === 'outline' ? 'outline' : 'default'}
                      onClick={() =>
                        plan.cta === 'Liên hệ'
                          ? toast.info('Tính năng sắp ra mắt')
                          : toast.info('Tính năng sắp ra mắt')
                      }
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feature comparison table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border bg-card p-4"
          >
            <h4 className="text-sm font-semibold mb-3">So sánh chi tiết</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-4 text-xs text-muted-foreground font-medium">Tính năng</th>
                    <th className="text-center py-2 px-3 text-xs text-muted-foreground font-medium">Free</th>
                    <th className="text-center py-2 px-3 text-xs text-primary font-medium bg-primary/5 rounded-t-md">Pro</th>
                    <th className="text-center py-2 pl-3 text-xs text-muted-foreground font-medium">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    ['Cảnh báo', '5', 'Không giới hạn', 'Không giới hạn'],
                    ['Mã theo dõi', '10', 'Không giới hạn', 'Không giới hạn'],
                    ['Chat chuyên gia', '—', '✓', '✓'],
                    ['Phân tích AI', '—', '✓', '✓'],
                    ['Quét rủi ro', 'Cơ bản', 'Chuyên sâu', 'Chuyên sâu'],
                    ['Hỗ trợ', 'Email', 'Ưu tiên', '24/7'],
                  ].map(([feature, free, pro, enterprise]) => (
                    <tr key={feature as string}>
                      <td className="py-2 pr-4 text-xs">{feature as string}</td>
                      <td className="py-2 px-3 text-xs text-center text-muted-foreground">{free as string}</td>
                      <td className="py-2 px-3 text-xs text-center bg-primary/5">{pro as string}</td>
                      <td className="py-2 pl-3 text-xs text-center text-muted-foreground">{enterprise as string}</td>
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
