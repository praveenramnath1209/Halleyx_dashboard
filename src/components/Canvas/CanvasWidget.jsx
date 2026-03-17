import { WIDGET_TYPES } from '../../data/constants'
import { WidgetPreview } from './WidgetPreview'
import styles from './CanvasWidget.module.css'

export function CanvasWidget({ widget, isSelected, isDragging, isPushed, onSelect, onDelete, startDrag, startDragTouch, startResize, startResizeTouch, style }) {
  return (
    <div
      data-canvas-widget="true"
      className={[
        styles.widget,
        isSelected  ? styles.selected  : '',
        isDragging  ? styles.dragging  : '',
        isPushed    ? styles.pushed    : '',
      ].join(' ')}
      style={style}
      onClick={e => { e.stopPropagation(); onSelect(widget) }}
    >
      {/* Drag handle — covers header area */}
      <div
        className={styles.dragHandle}
        onMouseDown={e => startDrag(e, widget)}
        onTouchStart={e => startDragTouch(e, widget)}
        style={{ touchAction: 'none' }}
      />

      {/* Hover action buttons */}
      <div className={styles.overlay}>
        <button
          className="btn-icon primary"
          title="Settings"
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onSelect(widget) }}
        >⚙</button>
        <button
          className="btn-icon danger"
          title="Delete"
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onDelete(widget.id) }}
        >🗑</button>
      </div>

      <div className={styles.header}>
        <div className={styles.title}>{widget.config.title || 'Untitled'}</div>
        <div className={styles.meta}>
          {WIDGET_TYPES[widget.type]?.icon} {WIDGET_TYPES[widget.type]?.label} · {widget.layout.w}×{widget.layout.h}
        </div>
      </div>

      <div className={styles.body}>
        <WidgetPreview type={widget.type} />
      </div>

      {/* Resize grip */}
      <div
        className={styles.resizeHandle}
        onMouseDown={e => startResize(e, widget)}
        onTouchStart={e => startResizeTouch(e, widget)}
        style={{ touchAction: 'none' }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M9 1L1 9M9 5L5 9M9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  )
}
