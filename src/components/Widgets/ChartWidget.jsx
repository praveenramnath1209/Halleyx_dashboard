import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Filler, Tooltip, Legend,
} from 'chart.js'
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Filler, Tooltip, Legend)

const PIE_COLORS = ['#5b6af9','#10b981','#f59e0b','#8b5cf6','#ef4444','#3b82f6','#ec4899','#14b8a6']

// Read live CSS vars for theme-aware chart colours
function getThemeColors() {
  const s = getComputedStyle(document.documentElement)
  return {
    text3:  s.getPropertyValue('--text3').trim()  || '#9ca3af',
    border: s.getPropertyValue('--border').trim() || '#e4e7f0',
    isDark: document.documentElement.getAttribute('data-theme') === 'dark'
          || document.documentElement.getAttribute('data-theme') === 'midnight',
  }
}

function getVal(order, field) {
  const f = (field || '').toLowerCase().replace(/\s/g, '')
  if (f === 'quantity')    return order.quantity
  if (f === 'unitprice')   return order.unitPrice
  if (f === 'totalamount') return order.totalAmount
  // 'duration' — derive a stable value from orderId so it doesn't re-randomize
  if (f === 'duration') {
    const seed = order.orderId ? parseInt(order.orderId.replace(/\D/g, ''), 10) || 0 : 0
    return (seed % 29) + 1
  }
  return order.product || order.status || order.createdBy || '?'
}

export function ChartWidget({ config, orders, theme }) {
  const color = config.color || '#5b6af9'
  const tc    = getThemeColors()

  // ── Stable data: memoized on orders + config fields so theme changes
  //    never re-randomize values ──────────────────────────────────────
  const { labels, data } = useMemo(() => {
    const lbls = orders.slice(0, 8).map((o, i) => getVal(o, config.xAxis) || `#${i + 1}`)
    const vals = orders.slice(0, 8).map(o => {
      const v = getVal(o, config.yAxis)
      if (typeof v === 'number') return v
      // fallback: stable hash from orderId instead of Math.random()
      const seed = o.orderId ? parseInt(o.orderId.replace(/\D/g, ''), 10) || 0 : 0
      return (seed % 90) + 10
    })
    return { labels: lbls, data: vals }
  }, [orders, config.xAxis, config.yAxis])

  const chartStyle = { width: '100%', height: '100%' }

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tc.isDark ? '#1e2235' : '#1a1d27',
        titleColor: '#e8eaf0',
        bodyColor: '#8b8fa8',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: '600' },
        bodyFont:  { family: 'Plus Jakarta Sans', size: 11 },
      },
    },
    scales: {
      x: {
        ticks: { color: tc.text3, font: { size: 10, family: 'Plus Jakarta Sans' }, maxRotation: 0 },
        grid:  { color: tc.border, drawBorder: false },
        border: { display: false },
      },
      y: {
        ticks: { color: tc.text3, font: { size: 10, family: 'Plus Jakarta Sans' } },
        grid:  { color: tc.border, drawBorder: false },
        border: { display: false },
      },
    },
  }

  if (config.type === 'pie') {
    // Use pieField (spec) falling back to xAxis
    const pieDataField = config.pieField || config.xAxis
    return <Pie
      data={{ labels, datasets: [{ data, backgroundColor: PIE_COLORS.slice(0, data.length), borderWidth: 0, hoverOffset: 4 }] }}
      options={{
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: tc.text3, font: { size: 10, family: 'Plus Jakarta Sans' }, boxWidth: 10, padding: 12 },
          },
          tooltip: baseOptions.plugins.tooltip,
        },
      }}
      style={chartStyle}
    />
  }

  if (config.type === 'scatter') {
    return <Scatter
      data={{ datasets: [{ label: config.yAxis, data: data.map((y, i) => ({ x: i + 1, y })), backgroundColor: color + '99', pointRadius: 6, pointHoverRadius: 8 }] }}
      options={baseOptions}
      style={chartStyle}
    />
  }

  const dataset = {
    label: config.yAxis || 'Value',
    data,
    backgroundColor: config.type === 'area' ? color + '22' : color + 'cc',
    borderColor: color,
    borderWidth: 2,
    fill: config.type === 'area',
    tension: 0.4,
    pointRadius: 3,
    pointHoverRadius: 5,
    pointBackgroundColor: color,
  }

  if (config.type === 'bar') return <Bar  data={{ labels, datasets: [dataset] }} options={baseOptions} style={chartStyle} />
  return                          <Line data={{ labels, datasets: [dataset] }} options={baseOptions} style={chartStyle} />
}
