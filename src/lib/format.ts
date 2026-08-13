'use client'

export function formatCurrency(value: number, type?: 'stock' | 'crypto' | 'gold'): string {
  if (type === 'gold' || value > 1000000) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value)
  }
  if (type === 'crypto' || value < 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + 'đ'
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value)
}

export function formatVolume(value: number): string {
  if (value >= 1_000_000_000_000) {
    return (value / 1_000_000_000_000).toFixed(1) + 'T'
  }
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1) + 'B'
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M'
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + 'K'
  }
  return value.toString()
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return sign + value.toFixed(2) + '%'
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatTimeShort(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}
