import { useState } from 'react'
import { WidgetPanel } from '../Canvas/WidgetPanel'
import { DragCanvas }  from '../Canvas/DragCanvas'
import { ConfigPanel } from '../Canvas/ConfigPanel'
import { WIDGET_TYPES, genId, COL_COUNT } from '../../data/constants'
import styles from './ConfigPage.module.css'

export function ConfigPage({ widgets, setWidgets, onSave, onCancel }) {
  const [selectedWidget,   setSelectedWidget]   = useState(null)
  const [draggingNewType,  setDraggingNewType]  = useState(null)

  const handleDropNew = (type, col, row) => {
    const wt = WIDGET_TYPES[type]
    const newWidget = {
      id: genId(),
      type,
      layout: { col: Math.min(col, COL_COUNT - wt.defaultW), row: Math.max(0, row), w: wt.defaultW, h: wt.defaultH },
      config: { title: 'Untitled', width: wt.defaultW, height: wt.defaultH, color: '#5b6af9', headerBg: '#54bd95', fontSize: 14, dataFormat: 'Number', decimalPrecision: 0, aggregation: 'Count' },
    }
    setWidgets(prev => [...prev, newWidget])
  }

  const handleDelete = (id) => {
    setWidgets(prev => prev.filter(w => w.id !== id))
    if (selectedWidget?.id === id) setSelectedWidget(null)
  }

  const handleUpdate = (updated) => {
    setWidgets(prev => prev.map(w => {
      if (w.id !== updated.id) return w
      return { ...updated, layout: { ...w.layout, w: updated.config.width || w.layout.w, h: updated.config.height || w.layout.h } }
    }))
    setSelectedWidget(null)
  }

  const currentSelected = selectedWidget ? widgets.find(w => w.id === selectedWidget.id) : null

  return (
    <div className={styles.page}>
      {/* Left — widget library */}
      <WidgetPanel setDraggingNewType={setDraggingNewType} />

      {/* Center — canvas */}
      <div className={styles.canvasArea}>
        <div className={styles.toolbar}>
          <div className={styles.toolbarInfo}>
            <div className={styles.dot} />
            <span><strong>{widgets.length}</strong> widget{widgets.length !== 1 ? 's' : ''}</span>
            <span className={styles.hint}>· drag header to move · corner ↘ to resize</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={onSave}>Save Configuration</button>
          </div>
        </div>
        <div className={styles.scroll}>
          <DragCanvas
            widgets={widgets}
            setWidgets={setWidgets}
            onSelect={w => setSelectedWidget(w)}
            selectedId={selectedWidget?.id}
            onDelete={handleDelete}
            onDropNew={handleDropNew}
            draggingNewType={draggingNewType}
          />
        </div>
      </div>

      {/* Right — config panel */}
      <div className={`${styles.panel} ${currentSelected ? styles.panelOpen : ''}`}>
        {currentSelected && (
          <ConfigPanel
            widget={currentSelected}
            onUpdate={handleUpdate}
            onClose={() => setSelectedWidget(null)}
          />
        )}
      </div>
    </div>
  )
}
