import { NextRequest, NextResponse } from 'next/server'

// Generate realistic OHLC data for chart
function generateOHLCData(symbol: string, days: number = 365): Array<{
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}> {
  // Base prices by asset type
  let basePrice = 50000
  let volatility = 0.02

  if (symbol === 'BTC') { basePrice = 67000; volatility = 0.03 }
  else if (symbol === 'ETH') { basePrice = 3500; volatility = 0.035 }
  else if (symbol === 'SOL') { basePrice = 145; volatility = 0.04 }
  else if (symbol === 'XAU') { basePrice = 72000000; volatility = 0.008 }
  else if (symbol === 'SJC') { basePrice = 83000000; volatility = 0.005 }
  else if (symbol === 'VCB') { basePrice = 85000; volatility = 0.015 }
  else if (symbol === 'MBB') { basePrice = 24000; volatility = 0.018 }
  else if (symbol === 'FPT') { basePrice = 125000; volatility = 0.017 }
  else if (symbol === 'HPG') { basePrice = 28000; volatility = 0.02 }
  else if (symbol === 'VIC') { basePrice = 42000; volatility = 0.016 }
  else if (symbol === 'VNINDEX') { basePrice = 1280; volatility = 0.012 }
  else if (symbol === 'TCB') { basePrice = 28000; volatility = 0.015 }
  else if (symbol === 'VHM') { basePrice = 38000; volatility = 0.018 }
  else if (symbol === 'GVR') { basePrice = 52000; volatility = 0.02 }
  else if (symbol === 'ADA') { basePrice = 0.45; volatility = 0.04 }
  else {
    // Random for unknown
    basePrice = 10000 + Math.random() * 90000
    volatility = 0.02
  }

  const data: Array<{
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
  }> = []

  let price = basePrice * (0.85 + Math.random() * 0.15)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  for (let i = 0; i < days; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)

    // Skip weekends for stocks
    if (['CK', 'stock'].some(() => {
      const day = d.getDay()
      return day === 0 || day === 6
    }) && !['BTC', 'ETH', 'SOL', 'ADA', 'XAU'].includes(symbol)) {
      // Still add data for simplicity (real broker APIs handle this)
    }

    const change = (Math.random() - 0.48) * volatility // slight upward bias
    const open = price
    const close = open * (1 + change)
    const highExtra = Math.abs(change) * Math.random() * 0.5
    const lowExtra = Math.abs(change) * Math.random() * 0.5
    const high = Math.max(open, close) * (1 + highExtra)
    const low = Math.min(open, close) * (1 - lowExtra)
    const volume = Math.round((500000 + Math.random() * 2000000) * (1 + Math.abs(change) * 10))

    const dateStr = d.toISOString().split('T')[0]
    data.push({
      date: dateStr,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    })

    price = close
  }

  return data
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
  }

  const daysParam = request.nextUrl.searchParams.get('days')
  const days = daysParam ? parseInt(daysParam, 10) : 365

  const ohlcData = generateOHLCData(symbol.toUpperCase(), Math.min(days, 1825))

  return NextResponse.json({
    data: ohlcData,
    meta: {
      symbol: symbol.toUpperCase(),
      days: ohlcData.length,
      generatedAt: new Date().toISOString(),
    },
  })
}
