import { useState } from 'react'
import { WIDGET_GROUPS, WIDGET_TYPES } from '../../data/constants'
import styles from './WidgetPanel.module.css'

export function WidgetPanel({ setDraggingNewType }) {
  const [open, setOpen] = useState({ Charts: true, Tables: true, KPIs: true })

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>Widget Library</div>
      {WIDGET_GROUPS.map(g => (
        <div key={g.key} className={styles.group}>
          <div className={styles.groupLabel} onClick={() => setOpen(o => ({ ...o, [g.key]: !o[g.key] }))}>
            <span className={`${styles.arrow} ${open[g.key] ? styles.arrowOpen : ''}`}>▶</span>
            {g.key}
          </div>
          {open[g.key] && g.widgets.map(wt => (
            <div
              key={wt}
              className={styles.item}
              draggable
              onDragStart={e => { setDraggingNewType(wt); e.dataTransfer.effectAllowed = 'copy' }}
              onDragEnd={() => setDraggingNewType(null)}
            >
              <div className={styles.itemIcon}>{WIDGET_TYPES[wt].icon}</div>
              <span className={styles.itemLabel}>{WIDGET_TYPES[wt].label}</span>
            </div>
          ))}
        </div>
      ))}
    </aside>
  )
}
