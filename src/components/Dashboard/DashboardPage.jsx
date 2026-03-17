import { useState, useEffect } from 'react'
import { COL_COUNT, ROW_H, WIDGET_TYPES, DATE_FILTERS } from '../../data/constants'
import { ChartWidget } from '../Widgets/ChartWidget'
import { KPIWidget }   from '../Widgets/KPIWidget'
import { TableWidget } from '../Widgets/TableWidget'
import styles from './DashboardPage.module.css'

const TYPE_COLORS = {
  bar: 'var(--c-bar)', line: 'var(--c-line)', pie: 'var(--c-pie)',
  area: 'var(--c-area)', scatter: 'var(--c-scatter)', table: 'var(--c-table)', kpi: 'var(--c-kpi)',
}
const TYPE_COLORS_LT = {
  bar: 'var(--c-bar-lt)', line: 'var(--c-line-lt)', pie: 'var(--c-pie-lt)',
  area: 'var(--c-area-lt)', scatter: 'var(--c-scatter-lt)', table: 'var(--c-table-lt)', kpi: 'var(--c-kpi-lt)',
}

// Clamp cols for responsive breakpoints
function getResponsiveCols() {
  if (typeof window === 'undefined') return COL_COUNT
  if (window.innerWidth < 640)  return 4
  if (window.innerWidth < 1024) return 8
  return COL_COUNT
}

export function DashboardPage({ savedWidgets, filteredOrders, dateFilter, setDateFilter, onConfigure }) {
  const [responsiveCols, setResponsiveCols] = useState(getResponsiveCols)

  // Update cols on resize
  useEffect(() => {
    const handler = () => setResponsiveCols(getResponsiveCols())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Canvas height — same formula as DragCanvas
  const canvasH = savedWidgets.reduce(
    (m, w) => Math.max(m, w.layout.row + w.layout.h), 0
  ) * ROW_H + ROW_H * 2

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Dashboard</h1>
          {savedWidgets.length > 0 && (
            <div className={styles.widgetCount}>
              {savedWidgets.length} widget{savedWidgets.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div className={styles.actions}>
          <div className={styles.dateFilter}>
            <label>Show data for</label>
            <select
              className="select"
              style={{ width: 'auto' }}
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            >
              {DATE_FILTERS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={onConfigure}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Configure
          </button>
        </div>
      </div>

      {savedWidgets.length === 0 ? (
        /* ── Empty state ── */
        <div className={styles.empty}>
          <div className={styles.emptyCard}>
            <div className={styles.emptyIllustration}>
              <div className={styles.emptyBlock} style={{ height: 48, width: '60%', animationDelay: '0s' }} />
              <div className={styles.emptyBlock} style={{ height: 72, width: '35%', animationDelay: '.12s' }} />
              <div className={styles.emptyBlock} style={{ height: 32, width: '45%', animationDelay: '.24s' }} />
              <div className={styles.emptyBlock} style={{ height: 56, width: '50%', animationDelay: '.08s' }} />
            </div>
            <div className={styles.emptyText}>
              <h3>Your dashboard is empty</h3>
              <p>Drag charts, tables, and KPI cards onto the canvas to build your personalized analytics view.</p>
              <button className="btn btn-primary" onClick={onConfigure}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Start building
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Widget view — absolute positioned, 1:1 with canvas ── */
        <div className={styles.view}>
          <div className={styles.canvasView} style={{ height: Math.max(canvasH, 400) }}>
            {savedWidgets.map(w => {
              const cols = responsiveCols

              // Clamp position and size to responsive col count
              const clampedCol = Math.min(w.layout.col, cols - 1)
              const clampedW   = Math.min(w.layout.w, cols - clampedCol)

              const colPct  = 100 / cols
              const left    = `${clampedCol * colPct}%`
              const width   = `calc(${clampedW * colPct}% - 8px)`
              const top     = w.layout.row * ROW_H
              const height  = w.layout.h * ROW_H - 8

              const color   = TYPE_COLORS[w.type]    || 'var(--accent)'
              const colorLt = TYPE_COLORS_LT[w.type] || 'var(--accent-lt)'

              return (
                <div
                  key={w.id}
                  className={styles.card}
                  style={{ position: 'absolute', left, top, width, height }}
                >
                  <div className={styles.cardAccent} style={{ background: color }} />
                  <div className={styles.cardHeader}>
                    <div className={styles.cardMeta}>
                      <span className={styles.typeChip} style={{ background: colorLt, color }}>
                        {WIDGET_TYPES[w.type]?.icon} {WIDGET_TYPES[w.type]?.label}
                      </span>
                      <div className={styles.cardTitle}>{w.config.title || 'Untitled'}</div>
                      {w.config.description && <div className={styles.cardDesc}>{w.config.description}</div>}
                    </div>
                  </div>
                  <div className={styles.cardBody} style={{ height: height - 68, overflow: 'hidden' }}>
                    {w.type === 'kpi' && (
                      <KPIWidget
                        config={{ ...w.config, aggregation: w.config.valueField || w.config.aggregation }}
                        orders={filteredOrders}
                      />
                    )}
                    {w.type === 'table' && (
                      <TableWidget config={w.config} orders={filteredOrders} />
                    )}
                    {!['kpi', 'table'].includes(w.type) && (
                      <ChartWidget config={{ ...w.config, type: w.type }} orders={filteredOrders} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
