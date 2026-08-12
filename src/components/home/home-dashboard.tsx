'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { PortfolioSummary } from './portfolio-summary'
import { QuickActions } from './quick-actions'
import { MarketCards } from './market-cards'
import { RecentAlerts } from './recent-alerts'
import { NewsFeed } from './news-feed'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export function HomeDashboard() {
  return (
    <motion.div
      className={cn(
        // Wider spacing on larger screens
        'space-y-5 sm:space-y-6 md:space-y-8',
        // Constrain max-width for readability
        'max-w-4xl mx-auto'
      )}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={sectionVariants}>
        <PortfolioSummary />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <QuickActions />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <MarketCards />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <RecentAlerts />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <NewsFeed />
      </motion.div>
    </motion.div>
  )
}
