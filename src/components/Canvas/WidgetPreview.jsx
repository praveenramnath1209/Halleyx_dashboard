const BARS = [40, 65, 50, 80, 55, 70]

const TYPE_COLOR = {
  bar: '#5b6af9', line: '#10b981', pie: '#f59e0b',
  area: '#8b5cf6', scatter: '#ef4444', table: '#3b82f6', kpi: '#06b6d4',
}
const PIE_COLORS = ['#5b6af9', '#10b981', '#f59e0b', '#8b5cf6']

export function WidgetPreview({ type }) {
  const c = TYPE_COLOR[type] || '#5b6af9'
  const cAlpha = c + '22'
  const cBar   = c + 'cc'

  if (type === 'kpi') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '0 8px' }}>
        <div style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>Total Revenue</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: c, fontFamily: 'JetBrains Mono', letterSpacing: '-1px', lineHeight: 1 }}>$12,480</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#10b981', fontWeight: 600 }}>
          <span>↑ 12.4%</span><span style={{ color: 'var(--text3)', fontWeight: 400 }}>vs last period</span>
        </div>
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div style={{ width: '100%', fontSize: 9, padding: '0 6px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, marginBottom: 3 }}>
          {['Product', 'Qty', 'Total'].map(h => (
            <div key={h} style={{ background: c, color: '#fff', padding: '3px 5px', fontWeight: 700, borderRadius: 3 }}>{h}</div>
          ))}
        </div>
        {[['Laptop', '2', '$2,400'], ['Monitor', '1', '$400'], ['Keyboard', '3', '$180']].map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, marginBottom: 2 }}>
            {r.map((cell, j) => (
              <div key={j} style={{ color: j === 2 ? c : 'var(--text2)', padding: '3px 5px', borderBottom: '1px solid var(--border)', fontWeight: j === 2 ? 600 : 400 }}>{cell}</div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (type === 'pie') {
    const pct = [35, 25, 20, 20]
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
        <svg viewBox="0 0 60 60" style={{ width: 50, height: 50, flexShrink: 0 }}>
          {pct.map((p, i) => {
            const start = pct.slice(0, i).reduce((s, v) => s + v, 0) / 100 * 2 * Math.PI - Math.PI / 2
            const end   = start + p / 100 * 2 * Math.PI
            const x1 = 30 + 25 * Math.cos(start), y1 = 30 + 25 * Math.sin(start)
            const x2 = 30 + 25 * Math.cos(end),   y2 = 30 + 25 * Math.sin(end)
            return <path key={i} d={`M30,30 L${x1},${y1} A25,25 0 ${p > 50 ? 1 : 0},1 ${x2},${y2} Z`} fill={PIE_COLORS[i]} />
          })}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {['Laptop', 'Monitor', 'Keyboard', 'Mouse'].map((l, i) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: 'var(--text2)' }}>
              <div style={{ width: 6, height: 6, borderRadius: 2, background: PIE_COLORS[i], flexShrink: 0 }} />
              {l}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <svg viewBox="0 0 130 52" style={{ width: 'calc(100% - 12px)', height: 52, margin: '0 6px' }}>
      {type === 'line' || type === 'area' ? (
        <>
          {type === 'area' && (
            <polygon points={BARS.map((h, i) => `${i * 24 + 4},${54 - h * 0.57}`).join(' ') + ' 124,54 4,54'} fill={cAlpha} />
          )}
          <polyline points={BARS.map((h, i) => `${i * 24 + 4},${54 - h * 0.57}`).join(' ')} fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" />
          {BARS.map((h, i) => <circle key={i} cx={i * 24 + 4} cy={54 - h * 0.57} r="3" fill={c} />)}
        </>
      ) : type === 'scatter' ? (
        BARS.map((h, i) => <circle key={i} cx={i * 24 + 4} cy={54 - h * 0.57} r="5" fill={c + '66'} stroke={c} strokeWidth="1.5" />)
      ) : (
        BARS.map((h, i) => (
          <g key={i}>
            <rect x={i * 20 + 4} y={54 - h * 0.57} width="13" height={h * 0.57} fill={cBar} rx="2" />
            <rect x={i * 20 + 4} y={54 - h * 0.57} width="13" height="3" fill={c} rx="2" />
          </g>
        ))
      )}
      {/* Axis line */}
      <line x1="2" y1="54" x2="128" y2="54" stroke="var(--border)" strokeWidth="1" />
    </svg>
  )
}
