import { useState, useEffect } from 'react'
import { WIDGET_TYPES, ORDER_FIELDS, TABLE_COLUMNS, KPI_METRICS, NUMERIC_FIELDS } from '../../data/constants'
import styles from './ConfigPanel.module.css'

function SectionLabel({ children, open, onClick }) {
  return (
    <div className="section-label" onClick={onClick}>
      <span style={{ fontSize: 8, transition: 'transform .2s', display: 'inline-block', transform: open ? 'rotate(90deg)' : 'rotate(0)' }}>▶</span>
      {children}
    </div>
  )
}

// Pie chart data options (spec-defined)
const PIE_FIELDS = ['Product','Quantity','Unit price','Total amount','Status','Created by']

export function ConfigPanel({ widget, onUpdate, onClose }) {
  const [cfg, setCfg]     = useState({ ...widget.config })
  const [errors, setErrors] = useState({})
  const [open, setOpen]   = useState({ size: true, data: true, style: true })
  const [filters, setFilters] = useState(cfg.filters || [])

  useEffect(() => {
    setCfg({ ...widget.config })
    setErrors({})
    setFilters(widget.config.filters || [])
  }, [widget.id])

  const isChart = ['bar', 'line', 'area', 'scatter'].includes(widget.type)
  const isPie   = widget.type === 'pie'
  const isTable = widget.type === 'table'
  const isKpi   = widget.type === 'kpi'

  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }))
  const tog = k => setOpen(o => ({ ...o, [k]: !o[k] }))

  // KPI: only numeric metrics can have Sum/Average; all get Count
  const isNumericMetric = NUMERIC_FIELDS.includes(cfg.metric)
  const aggOptions = isNumericMetric ? ['Sum','Average','Count'] : ['Count']

  const validate = () => {
    const e = {}
    if (!cfg.title?.trim())            e.title  = 'Please fill the field'
    if (!cfg.width  || cfg.width  < 1) e.width  = 'Value not less than 1'
    if (!cfg.height || cfg.height < 1) e.height = 'Value not less than 1'
    if (isChart && !cfg.xAxis)         e.xAxis  = 'Please fill the field'
    if (isChart && !cfg.yAxis)         e.yAxis  = 'Please fill the field'
    if (isPie   && !cfg.pieField)      e.pieField = 'Please fill the field'
    if (isKpi   && !cfg.metric)        e.metric   = 'Please fill the field'
    if (isKpi   && !cfg.aggregation)   e.aggregation = 'Please fill the field'
    if (isTable && (!cfg.columns || cfg.columns.length === 0)) e.columns = 'Select at least one column'
    if (cfg.color && !/^#[0-9A-Fa-f]{6}$/.test(cfg.color)) e.color = 'Must be a valid HEX code'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = () => {
    if (!validate()) return
    onUpdate({ ...widget, config: { ...cfg, filters } })
    onClose()
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerTitle}>Configure Widget</div>
        <button className="btn-icon" onClick={onClose}>✕</button>
      </div>

      <div className={styles.body}>

        {/* ── Title ── */}
        <div className="field">
          <label>Widget title <span className="req">*</span></label>
          <input className={`input ${errors.title ? 'error' : ''}`} value={cfg.title || ''} onChange={e => set('title', e.target.value)} />
          {errors.title && <span className="error-msg">{errors.title}</span>}
        </div>

        {/* ── Type readonly ── */}
        <div className="field">
          <label>Widget type</label>
          <input className="input" readOnly value={WIDGET_TYPES[widget.type]?.label || ''} />
        </div>

        {/* ── Description ── */}
        <div className="field">
          <label>Description</label>
          <textarea className="input" rows={2} value={cfg.description || ''} onChange={e => set('description', e.target.value)} />
        </div>

        {/* ── SIZE ── */}
        <SectionLabel open={open.size} onClick={() => tog('size')}>Widget Size</SectionLabel>
        {open.size && (
          <div className="field-row">
            <div className="field">
              <label>Width (cols) <span className="req">*</span></label>
              <input className={`input ${errors.width ? 'error' : ''}`} type="number" min={1} max={12}
                value={cfg.width || ''} onChange={e => set('width', parseInt(e.target.value) || '')} />
              {errors.width && <span className="error-msg">{errors.width}</span>}
            </div>
            <div className="field">
              <label>Height (rows) <span className="req">*</span></label>
              <input className={`input ${errors.height ? 'error' : ''}`} type="number" min={1}
                value={cfg.height || ''} onChange={e => set('height', parseInt(e.target.value) || '')} />
              {errors.height && <span className="error-msg">{errors.height}</span>}
            </div>
          </div>
        )}

        {/* ── CHART DATA (bar/line/area/scatter) ── */}
        {isChart && (
          <>
            <SectionLabel open={open.data} onClick={() => tog('data')}>Data Settings</SectionLabel>
            {open.data && (
              <>
                <div className="field">
                  <label>Choose X-Axis data <span className="req">*</span></label>
                  <select className={`select ${errors.xAxis ? 'error' : ''}`} value={cfg.xAxis || ''} onChange={e => set('xAxis', e.target.value)}>
                    <option value="">Select field</option>
                    {ORDER_FIELDS.map(f => <option key={f}>{f}</option>)}
                  </select>
                  {errors.xAxis && <span className="error-msg">{errors.xAxis}</span>}
                </div>
                <div className="field">
                  <label>Choose Y-Axis data <span className="req">*</span></label>
                  <select className={`select ${errors.yAxis ? 'error' : ''}`} value={cfg.yAxis || ''} onChange={e => set('yAxis', e.target.value)}>
                    <option value="">Select field</option>
                    {ORDER_FIELDS.map(f => <option key={f}>{f}</option>)}
                  </select>
                  {errors.yAxis && <span className="error-msg">{errors.yAxis}</span>}
                </div>
              </>
            )}
            <SectionLabel open={open.style} onClick={() => tog('style')}>Styling</SectionLabel>
            {open.style && (
              <>
                <div className="field">
                  <label>Chart color</label>
                  <div className="color-input-row">
                    <div className="color-swatch"><input type="color" value={cfg.color || '#5b6af9'} onChange={e => set('color', e.target.value)} /></div>
                    <input className={`input ${errors.color ? 'error' : ''}`} value={cfg.color || '#5b6af9'} onChange={e => set('color', e.target.value)} placeholder="#5b6af9" />
                  </div>
                  {errors.color && <span className="error-msg">{errors.color}</span>}
                </div>
                <label className="checkbox-row">
                  <input type="checkbox" checked={!!cfg.showLabel} onChange={e => set('showLabel', e.target.checked)} />
                  <span className="checkbox-label">Show data label</span>
                </label>
              </>
            )}
          </>
        )}

        {/* ── PIE CHART DATA ── */}
        {isPie && (
          <>
            <SectionLabel open={open.data} onClick={() => tog('data')}>Data Settings</SectionLabel>
            {open.data && (
              <div className="field">
                <label>Choose chart data <span className="req">*</span></label>
                <select className={`select ${errors.pieField ? 'error' : ''}`} value={cfg.pieField || ''} onChange={e => set('pieField', e.target.value)}>
                  <option value="">Select field</option>
                  {PIE_FIELDS.map(f => <option key={f}>{f}</option>)}
                </select>
                {errors.pieField && <span className="error-msg">{errors.pieField}</span>}
              </div>
            )}
            <SectionLabel open={open.style} onClick={() => tog('style')}>Styling</SectionLabel>
            {open.style && (
              <label className="checkbox-row">
                <input type="checkbox" checked={!!cfg.showLegend} onChange={e => set('showLegend', e.target.checked)} />
                <span className="checkbox-label">Show legend</span>
              </label>
            )}
          </>
        )}

        {/* ── KPI DATA ── */}
        {isKpi && (
          <>
            <SectionLabel open={open.data} onClick={() => tog('data')}>Data Settings</SectionLabel>
            {open.data && (
              <>
                {/* Select metric */}
                <div className="field">
                  <label>Select metric <span className="req">*</span></label>
                  <select className={`select ${errors.metric ? 'error' : ''}`} value={cfg.metric || ''} onChange={e => {
                    const m = e.target.value
                    set('metric', m)
                    // if switching to non-numeric, force Count
                    if (!NUMERIC_FIELDS.includes(m)) set('aggregation', 'Count')
                  }}>
                    <option value="">Select metric</option>
                    {KPI_METRICS.map(f => <option key={f}>{f}</option>)}
                  </select>
                  {errors.metric && <span className="error-msg">{errors.metric}</span>}
                </div>
                {/* Aggregation */}
                <div className="field">
                  <label>Aggregation <span className="req">*</span></label>
                  <select className={`select ${errors.aggregation ? 'error' : ''}`} value={cfg.aggregation || ''} onChange={e => set('aggregation', e.target.value)}>
                    <option value="">Select…</option>
                    {aggOptions.map(a => <option key={a}>{a}</option>)}
                  </select>
                  {errors.aggregation && <span className="error-msg">{errors.aggregation}</span>}
                  {!isNumericMetric && cfg.metric && (
                    <span style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Only Count available for non-numeric fields</span>
                  )}
                </div>
                {/* Data format */}
                <div className="field">
                  <label>Data format <span className="req">*</span></label>
                  <select className="select" value={cfg.dataFormat || 'Number'} onChange={e => set('dataFormat', e.target.value)}>
                    <option>Number</option>
                    <option>Currency</option>
                  </select>
                </div>
                {/* Decimal precision */}
                <div className="field">
                  <label>Decimal precision</label>
                  <input className="input" type="number" min={0} value={cfg.decimalPrecision ?? 0}
                    onChange={e => set('decimalPrecision', Math.max(0, parseInt(e.target.value) || 0))} />
                </div>
              </>
            )}
            <SectionLabel open={open.style} onClick={() => tog('style')}>Styling</SectionLabel>
            {open.style && (
              <div className="field">
                <label>Value color</label>
                <div className="color-input-row">
                  <div className="color-swatch"><input type="color" value={cfg.color || '#5b6af9'} onChange={e => set('color', e.target.value)} /></div>
                  <input className="input" value={cfg.color || '#5b6af9'} onChange={e => set('color', e.target.value)} />
                </div>
              </div>
            )}
          </>
        )}

        {/* ── TABLE DATA ── */}
        {isTable && (
          <>
            <SectionLabel open={open.data} onClick={() => tog('data')}>Data Settings</SectionLabel>
            {open.data && (
              <>
                <div className="field">
                  <label>Choose columns <span className="req">*</span></label>
                  <div className="multiselect">
                    {TABLE_COLUMNS.map(c => (
                      <label key={c} className="multiselect-option">
                        <input type="checkbox" checked={(cfg.columns || []).includes(c)}
                          onChange={e => set('columns', e.target.checked ? [...(cfg.columns || []), c] : (cfg.columns || []).filter(x => x !== c))} />
                        {c}
                      </label>
                    ))}
                  </div>
                  {errors.columns && <span className="error-msg">{errors.columns}</span>}
                </div>
                <div className="field">
                  <label>Sort by</label>
                  <select className="select" value={cfg.sortBy || ''} onChange={e => set('sortBy', e.target.value)}>
                    <option value="">None</option>
                    {['Ascending','Descending','Order date'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Pagination</label>
                  <select className="select" value={cfg.pagination || ''} onChange={e => set('pagination', e.target.value)}>
                    <option value="">None</option>
                    {['5','10','15'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <label className="checkbox-row">
                  <input type="checkbox" checked={!!cfg.applyFilter} onChange={e => set('applyFilter', e.target.checked)} />
                  <span className="checkbox-label">Apply filter</span>
                </label>
                {cfg.applyFilter && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                    {filters.map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <select className="select" value={f.field || ''} onChange={e => { const nf=[...filters]; nf[i]={...nf[i],field:e.target.value}; setFilters(nf) }} style={{ flex:1, fontSize:12 }}>
                          <option value="">Field</option>
                          {TABLE_COLUMNS.map(c => <option key={c}>{c}</option>)}
                        </select>
                        <select className="select" value={f.op || ''} onChange={e => { const nf=[...filters]; nf[i]={...nf[i],op:e.target.value}; setFilters(nf) }} style={{ flex:1, fontSize:12 }}>
                          <option value="">Op</option>
                          {['=','!=','>','<','contains'].map(o => <option key={o}>{o}</option>)}
                        </select>
                        <input className="input" value={f.val || ''} onChange={e => { const nf=[...filters]; nf[i]={...nf[i],val:e.target.value}; setFilters(nf) }} placeholder="Value" style={{ flex:1, fontSize:12 }} />
                        <button className="btn-icon danger" onClick={() => setFilters(filters.filter((_,j)=>j!==i))}>✕</button>
                      </div>
                    ))}
                    <button onClick={() => setFilters([...filters,{field:'',op:'',val:''}])}
                      style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, color:'var(--accent)', cursor:'pointer', padding:'4px 0', background:'none', border:'none', fontFamily:'inherit', fontWeight:600 }}>
                      + Add filter
                    </button>
                  </div>
                )}
              </>
            )}
            <SectionLabel open={open.style} onClick={() => tog('style')}>Styling</SectionLabel>
            {open.style && (
              <>
                <div className="field">
                  <label>Font size <span style={{ color:'var(--text3)', fontWeight:400 }}>(12–18)</span></label>
                  <input className="input" type="number" min={12} max={18} value={cfg.fontSize || 14}
                    onChange={e => set('fontSize', Math.min(18, Math.max(12, parseInt(e.target.value) || 14)))} />
                </div>
                <div className="field">
                  <label>Header background</label>
                  <div className="color-input-row">
                    <div className="color-swatch"><input type="color" value={cfg.headerBg || '#54bd95'} onChange={e => set('headerBg', e.target.value)} /></div>
                    <input className="input" value={cfg.headerBg || '#54bd95'} onChange={e => set('headerBg', e.target.value)} />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className={styles.footer}>
        <button className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" style={{ flex:1 }} onClick={save}>Apply</button>
      </div>
    </>
  )
}
