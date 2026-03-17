import { useRef, useState, useEffect } from 'react'
import { COL_COUNT, ROW_H, WIDGET_TYPES } from '../../data/constants'
import { useFreeDrag } from '../../hooks/useFreeDrag'
import { CanvasWidget } from './CanvasWidget'
import styles from './DragCanvas.module.css'

// Responsive column count matching the dashboard viewer rules
function getResponsiveCols() {
  if (typeof window === 'undefined') return COL_COUNT
  if (window.innerWidth < 640)  return 4
  if (window.innerWidth < 1024) return 8
  return COL_COUNT
}

export function DragCanvas({ widgets, setWidgets, onSelect, selectedId, onDelete, onDropNew, draggingNewType }) {
  const canvasRef = useRef(null)
  const [responsiveCols, setResponsiveCols] = useState(getResponsiveCols)

  // Keep responsiveCols in sync on window resize
  useEffect(() => {
    const handler = () => setResponsiveCols(getResponsiveCols())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const colCount = responsiveCols

  const { ghost, preview, draggingId, resizingId, startDrag, startDragTouch, startResize, startResizeTouch } =
    useFreeDrag({ widgets, setWidgets, canvasRef, colCount })

  const [dropOver, setDropOver] = useState(false)
  const [newGhost, setNewGhost] = useState(null)

  // ── Canvas size: grow to fit widgets + live ghost ──────────────────────
  const savedMaxRow   = widgets.reduce((m, w) => Math.max(m, w.layout.row + w.layout.h), 0)
  const previewMaxRow = preview
    ? Object.values(preview).reduce((m, l) => Math.max(m, l.row + l.h), 0)
    : 0
  const ghostMaxRow    = ghost    ? ghost.row    + ghost.h    : 0
  const newGhostMaxRow = newGhost ? newGhost.row + newGhost.h : 0

  const canvasH = Math.max(
    Math.max(savedMaxRow, previewMaxRow, ghostMaxRow, newGhostMaxRow) * ROW_H + ROW_H * 3,
    540
  )

  // ── Column width — based on real canvas width ──────────────────────────
  const cw = canvasRef.current
    ? canvasRef.current.clientWidth / colCount
    : 80

  // ── New widget drag from panel ──────────────────────────────────────────
  const handleDragOver = e => {
    e.preventDefault()
    if (!draggingNewType || !canvasRef.current) return
    setDropOver(true)
    const rect = canvasRef.current.getBoundingClientRect()
    const colW = canvasRef.current.clientWidth / colCount
    const wt   = WIDGET_TYPES[draggingNewType]
    // Clamp default size to current grid column count
    const defaultW = Math.min(wt.defaultW, colCount)
    const defaultH = wt.defaultH
    const col  = Math.max(0, Math.min(colCount - defaultW, Math.round((e.clientX - rect.left) / colW)))
    const row  = Math.max(0, Math.round((e.clientY - rect.top)  / ROW_H))
    setNewGhost({ col, row, w: defaultW, h: defaultH })
  }
  const handleDragLeave = () => { setDropOver(false); setNewGhost(null) }
  const handleDrop = e => {
    e.preventDefault()
    setDropOver(false)
    if (!draggingNewType || !newGhost) { setNewGhost(null); return }
    onDropNew(draggingNewType, newGhost.col, newGhost.row, newGhost.w, newGhost.h)
    setNewGhost(null)
  }

  // ── Layout resolver ─────────────────────────────────────────────────────
  const getLayout = (w) => (preview && preview[w.id]) ? preview[w.id] : w.layout
  const isDraggingAny = !!(draggingId || resizingId)

  return (
    <div
      ref={canvasRef}
      className={`${styles.canvas} ${dropOver ? styles.dragActive : ''}`}
      style={{
        height: canvasH,
        backgroundSize: `${cw}px ${ROW_H}px`,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onSelect(null)}
    >
      {/* Empty state */}
      {widgets.length === 0 && !dropOver && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⬚</div>
          <p>Drag widgets from the panel onto the canvas</p>
        </div>
      )}

      {/* Ghost: new widget drop from panel */}
      {newGhost && (
        <div
          className={styles.ghost}
          style={{
            left:   newGhost.col * cw,
            top:    newGhost.row * ROW_H,
            width:  newGhost.w * cw - 8,
            height: newGhost.h * ROW_H - 8,
          }}
        >
          {WIDGET_TYPES[draggingNewType]?.label}
        </div>
      )}

      {/* Ghost: drop target for move / resize */}
      {ghost && isDraggingAny && (
        <div
          className={styles.dropTarget}
          style={{
            left:   ghost.col * cw,
            top:    ghost.row * ROW_H,
            width:  ghost.w * cw - 8,
            height: ghost.h * ROW_H - 8,
          }}
        />
      )}

      {/* Widgets */}
      {widgets.map(w => {
        const layout         = getLayout(w)
        const isBeingDragged = draggingId === w.id || resizingId === w.id
        const isPushed       = isDraggingAny && !isBeingDragged && preview?.[w.id]?.row !== w.layout.row

        return (
          <CanvasWidget
            key={w.id}
            widget={w}
            isSelected={selectedId === w.id}
            isDragging={isBeingDragged}
            isPushed={isPushed}
            onSelect={onSelect}
            onDelete={onDelete}
            startDrag={startDrag}
            startDragTouch={startDragTouch}
            startResize={startResize}
            startResizeTouch={startResizeTouch}
            style={{
              left:   layout.col * cw,
              top:    layout.row * ROW_H,
              width:  layout.w   * cw - 8,
              height: layout.h   * ROW_H - 8,
              transition: isBeingDragged
                ? 'none'
                : 'left .18s cubic-bezier(.22,1,.36,1), top .18s cubic-bezier(.22,1,.36,1), width .18s, height .18s',
            }}
          />
        )
      })}
    </div>
  )
}
