import { useRef, useState } from 'react'
import { COL_COUNT, ROW_H, WIDGET_TYPES } from '../../data/constants'
import { useFreeDrag } from '../../hooks/useFreeDrag'
import { CanvasWidget } from './CanvasWidget'
import styles from './DragCanvas.module.css'

export function DragCanvas({ widgets, setWidgets, onSelect, selectedId, onDelete, onDropNew, draggingNewType }) {
  const canvasRef = useRef(null)
  const { ghost, preview, draggingId, resizingId, startDrag, startResize } = useFreeDrag({ widgets, setWidgets, canvasRef })
  const [dropOver, setDropOver] = useState(false)
  const [newGhost, setNewGhost] = useState(null)

  // ── Canvas size: grow to fit widgets + live ghost ──────────────────────
  // Max row used by saved widgets
  const savedMaxRow = widgets.reduce((m, w) => Math.max(m, w.layout.row + w.layout.h), 0)
  // Max row used by any preview layout while dragging
  const previewMaxRow = preview
    ? Object.values(preview).reduce((m, l) => Math.max(m, l.row + l.h), 0)
    : 0
  // Ghost itself (move / new drop)
  const ghostMaxRow = ghost ? ghost.row + ghost.h : 0
  const newGhostMaxRow = newGhost ? newGhost.row + newGhost.h : 0

  // Canvas grows but never shrinks below 540px — extra 3 rows of breathing room
  const canvasH = Math.max(
    Math.max(savedMaxRow, previewMaxRow, ghostMaxRow, newGhostMaxRow) * ROW_H + ROW_H * 3,
    540
  )

  // ── Max col used → canvas min-width ────────────────────────────────────
  const savedMaxCol  = widgets.reduce((m, w) => Math.max(m, w.layout.col + w.layout.w), COL_COUNT)
  const previewMaxCol = preview
    ? Object.values(preview).reduce((m, l) => Math.max(m, l.col + l.w), COL_COUNT)
    : COL_COUNT
  const ghostMaxCol   = ghost ? ghost.col + ghost.w : COL_COUNT
  const effectiveCols = Math.max(savedMaxCol, previewMaxCol, ghostMaxCol, COL_COUNT)

  // ── Column width — based on the larger of: real canvas width OR effectiveCols * minColW ──
  const MIN_COL_W = 72   // px — minimum column width before canvas starts scrolling
  const cw = canvasRef.current
    ? Math.max(canvasRef.current.clientWidth / effectiveCols, MIN_COL_W)
    : 80
  const canvasW = effectiveCols > COL_COUNT ? effectiveCols * MIN_COL_W : undefined

  // ── New widget drag from panel ──────────────────────────────────────────
  const handleDragOver = e => {
    e.preventDefault()
    if (!draggingNewType || !canvasRef.current) return
    setDropOver(true)
    const rect = canvasRef.current.getBoundingClientRect()
    const colW = canvasRef.current.clientWidth / COL_COUNT
    const wt   = WIDGET_TYPES[draggingNewType]
    const col  = Math.max(0, Math.round((e.clientX - rect.left) / colW))
    const row  = Math.max(0, Math.round((e.clientY - rect.top)  / ROW_H))
    setNewGhost({ col, row, w: wt.defaultW, h: wt.defaultH })
  }
  const handleDragLeave = () => { setDropOver(false); setNewGhost(null) }
  const handleDrop = e => {
    e.preventDefault()
    setDropOver(false)
    if (!draggingNewType || !newGhost) { setNewGhost(null); return }
    onDropNew(draggingNewType, newGhost.col, newGhost.row)
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
        minWidth: canvasW,
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
            startResize={startResize}
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
