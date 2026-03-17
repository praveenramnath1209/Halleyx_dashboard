import { useState, useEffect, useMemo } from 'react'
import { COL_COUNT, ROW_H, WIDGET_TYPES, DATE_FILTERS } from '../../data/constants'
import { compact } from '../../hooks/useFreeDrag'
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

// Responsive column count: 12 / 8 / 4
function getResponsiveCols() {
  if (typeof window === 'undefined') return COL_COUNT
  if (window.innerWidth < 640)  return 4
  if (window.innerWidth < 1024) return 8
  return COL_COUNT
}

export function DashboardPage({ savedWidgets, filteredOrders, dateFilter, setDateFilter, onConfigure }) {
  const [responsiveCols, setResponsiveCols] = useState(getResponsiveCols)

  useEffect(() => {
    const handler = () => setResponsiveCols(getResponsiveCols())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Run compact with the current responsive col count so widgets never overlap
  // at any breakpoint. We pass null as lockedId so every widget is reflowed.
  const reflowedLayouts = useMemo(() => {
    if (savedWidgets.length === 0) return {}
    return compact(savedWidgets, null, null, responsiveCols)
  }, [savedWidgets, responsiveCols])

  // Canvas height driven by the reflowed layouts (not raw saved positions)
  const canvasH = savedWidgets.length === 0
    ? 400
    : Math.max(
        Object.values(reflowedLayouts).reduce((m, l) => Math.max(m, l.row + l.h), 0) * ROW_H + ROW_H * 2,
        400
      )

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
        /* ── Widget view — absolutely positioned but reflowed per breakpoint ── */
        <div className={styles.view}>
          <div className={styles.canvasView} style={{ height: canvasH }}>
            {savedWidgets.map(w => {
              const layout = reflowedLayouts[w.id] || w.layout

              const colPct = 100 / responsiveCols
              const left   = `${layout.col * colPct}%`
              const width  = `calc(${layout.w * colPct}% - 8px)`
              const top    = layout.row * ROW_H
              const height = layout.h * ROW_H - 8

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
