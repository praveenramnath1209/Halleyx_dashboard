import styles from './KPIWidget.module.css'
import { NUMERIC_FIELDS } from '../../data/constants'

function computeValue(orders, metric, aggregation, dataFormat, decimalPrecision) {
  const prec = Math.max(0, decimalPrecision ?? 0)
  const m = (metric || '').toLowerCase().replace(/\s/g, '')

  const getField = o => {
    if (m === 'totalamount') return o.totalAmount
    if (m === 'unitprice')   return o.unitPrice
    if (m === 'quantity')    return o.quantity
    return null
  }

  const agg = aggregation || 'Count'
  const isNum = NUMERIC_FIELDS.includes(metric)

  if (!isNum || agg === 'Count') {
    return orders.length.toFixed(prec)
  }
  if (agg === 'Sum') {
    const sum = orders.reduce((s, o) => s + (getField(o) || 0), 0)
    return dataFormat === 'Currency' ? sum.toFixed(2) : sum.toFixed(prec)
  }
  if (agg === 'Average') {
    const avg = orders.length ? orders.reduce((s,o) => s + (getField(o)||0), 0) / orders.length : 0
    return dataFormat === 'Currency' ? avg.toFixed(2) : avg.toFixed(prec)
  }
  return orders.length.toFixed(prec)
}

export function KPIWidget({ config, orders }) {
  const value = computeValue(
    orders,
    config.metric || config.valueField || config.aggregation,
    config.aggregation,
    config.dataFormat,
    config.decimalPrecision
  )
  const color  = config.color || 'var(--accent)'
  const prefix = config.dataFormat === 'Currency' ? '$' : (config.prefix || '')
  const suffix = config.suffix || ''

  return (
    <div className={styles.kpi}>
      <div className={styles.label}>{config.title || 'Untitled'}</div>
      <div className={styles.value} style={{ color }}>
        <span className={styles.affix}>{prefix}</span>
        {value}
        <span className={styles.affix}>{suffix}</span>
      </div>
      {config.description && <div className={styles.desc}>{config.description}</div>}
    </div>
  )
}
