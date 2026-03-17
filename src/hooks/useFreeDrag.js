import { useState, useRef, useEffect } from 'react'
import { COL_COUNT, ROW_H } from '../data/constants'

// ─── Collision helpers ────────────────────────────────────────────────────

function overlaps(a, b) {
  return (
    a.col < b.col + b.w &&
    a.col + a.w > b.col &&
    a.row < b.row + b.h &&
    a.row + a.h > b.row
  )
}

/**
 * compact — places every widget at the topmost row where it fits without
 * overlapping, respecting a horizontal grid boundary (colCount).
 *
 * lockedId / lockedLayout: the widget being dragged — its position is fixed.
 */
export function compact(widgets, lockedId, lockedLayout, colCount = COL_COUNT) {
  const layouts = {}
  for (const w of widgets) {
    layouts[w.id] = lockedId === w.id ? { ...lockedLayout } : { ...w.layout }
  }

  // Sort by row then col so items above-left are placed first
  const order = [...widgets].sort((a, b) => {
    const la = layouts[a.id], lb = layouts[b.id]
    return la.row !== lb.row ? la.row - lb.row : la.col - lb.col
  })

  for (const w of order) {
    if (w.id === lockedId) continue
    const l = layouts[w.id]

    // Clamp width to grid
    const clampedW = Math.min(l.w, colCount)
    const clampedCol = Math.min(l.col, colCount - clampedW)

    let row = 0
    outer: while (true) {
      const candidate = { col: clampedCol, row, w: clampedW, h: l.h }
      for (const other of order) {
        if (other.id === w.id) continue
        if (overlaps(candidate, layouts[other.id])) { row++; continue outer }
      }
      layouts[w.id] = candidate
      break
    }
  }
  return layouts
}

/**
 * resolveCollisions — computes a real-time preview layout while dragging.
 * The dragged widget is locked at `proposed`; all others are re-compacted
 * around it so nothing overlaps.
 */
function resolveCollisions(draggingId, proposed, allWidgets, colCount = COL_COUNT) {
  return compact(allWidgets, draggingId, proposed, colCount)
}

// ─── Hook ────────────────────────────────────────────────────────────────

export function useFreeDrag({ widgets, setWidgets, canvasRef, colCount = COL_COUNT }) {
  const dragState = useRef(null)
  const ghostRef  = useRef(null)

  const [ghost,      setGhostState] = useState(null)
  const [preview,    setPreview]    = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [resizingId, setResizingId] = useState(null)

  // ── keep a live col-width that always reads the real DOM width ──
  const getColWidth = () =>
    canvasRef.current ? canvasRef.current.clientWidth / colCount : 80

  const setGhost = (g) => { ghostRef.current = g; setGhostState(g) }

  // ── Internal shared move handler ──────────────────────────────────────
  const handlePointerMove = ({ clientX, clientY }) => {
    if (!dragState.current) return
    const ds = dragState.current

    if (ds.type === 'move') {
      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) return

      const cw  = canvasRef.current.clientWidth / colCount
      const px  = clientX - canvasRect.left - ds.offsetX
      const py  = clientY - canvasRect.top  - ds.offsetY

      const col = Math.max(0, Math.min(colCount - ds.w, Math.round(px / cw)))
      const row = Math.max(0, Math.round(py / ROW_H))

      const proposed = { col, row, w: ds.w, h: ds.h }
      setGhost(proposed)
      setPreview(resolveCollisions(ds.id, proposed, widgets, colCount))
    }

    if (ds.type === 'resize') {
      const dx   = clientX - ds.startX
      const dy   = clientY - ds.startY
      const newW = Math.max(1, Math.min(colCount - ds.startCol, Math.round(ds.startW + dx / ds.colW)))
      const newH = Math.max(1, Math.round(ds.startH + dy / ROW_H))
      const proposed = { col: ds.startCol, row: ds.startRow, w: newW, h: newH }
      setGhost(proposed)
      setPreview(resolveCollisions(ds.id, proposed, widgets, colCount))
    }
  }

  // ── Internal shared end handler ───────────────────────────────────────
  const handlePointerUp = () => {
    if (!dragState.current) return
    const ds = dragState.current
    const g  = ghostRef.current

    if (g) {
      if (ds.type === 'move') {
        const compacted = compact(widgets, ds.id, g, colCount)
        setWidgets(prev => prev.map(w => ({
          ...w,
          layout: { ...w.layout, ...compacted[w.id] },
        })))
      }
      if (ds.type === 'resize') {
        const compacted = compact(widgets, ds.id, g, colCount)
        setWidgets(prev => prev.map(w => ({
          ...w,
          layout: { ...w.layout, ...compacted[w.id] },
          config: w.id === ds.id
            ? { ...w.config, width: g.w, height: g.h }
            : w.config,
        })))
      }
    }

    dragState.current = null
    setDraggingId(null)
    setResizingId(null)
    setGhost(null)
    setPreview(null)
  }

  // ── start move (mouse) ────────────────────────────────────────────────
  const startDrag = (e, widget) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const rect       = e.currentTarget.closest('[data-canvas-widget]').getBoundingClientRect()
    const canvasRect = canvasRef.current.getBoundingClientRect()
    void canvasRect
    dragState.current = {
      type: 'move', id: widget.id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      w: widget.layout.w,
      h: widget.layout.h,
    }
    setDraggingId(widget.id)
    setGhost({ col: widget.layout.col, row: widget.layout.row, w: widget.layout.w, h: widget.layout.h })
  }

  // ── start move (touch) ────────────────────────────────────────────────
  const startDragTouch = (e, widget) => {
    e.stopPropagation()
    // Don't call e.preventDefault() here — let the long-press fire
    const touch      = e.touches[0]
    const rect       = e.currentTarget.closest('[data-canvas-widget]').getBoundingClientRect()
    dragState.current = {
      type: 'move', id: widget.id,
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
      w: widget.layout.w,
      h: widget.layout.h,
    }
    setDraggingId(widget.id)
    setGhost({ col: widget.layout.col, row: widget.layout.row, w: widget.layout.w, h: widget.layout.h })
  }

  // ── start resize (mouse) ──────────────────────────────────────────────
  const startResize = (e, widget) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    dragState.current = {
      type: 'resize', id: widget.id,
      startX: e.clientX, startY: e.clientY,
      startW: widget.layout.w, startH: widget.layout.h,
      startCol: widget.layout.col, startRow: widget.layout.row,
      colW: getColWidth(),
    }
    setResizingId(widget.id)
    setGhost({ col: widget.layout.col, row: widget.layout.row, w: widget.layout.w, h: widget.layout.h })
  }

  // ── start resize (touch) ──────────────────────────────────────────────
  const startResizeTouch = (e, widget) => {
    e.stopPropagation()
    const touch = e.touches[0]
    dragState.current = {
      type: 'resize', id: widget.id,
      startX: touch.clientX, startY: touch.clientY,
      startW: widget.layout.w, startH: widget.layout.h,
      startCol: widget.layout.col, startRow: widget.layout.row,
      colW: getColWidth(),
    }
    setResizingId(widget.id)
    setGhost({ col: widget.layout.col, row: widget.layout.row, w: widget.layout.w, h: widget.layout.h })
  }

  useEffect(() => {
    const onMouseMove = (e) => handlePointerMove({ clientX: e.clientX, clientY: e.clientY })
    const onMouseUp   = ()  => handlePointerUp()

    const onTouchMove = (e) => {
      if (!dragState.current) return
      e.preventDefault() // prevent page scroll while dragging
      const t = e.touches[0]
      handlePointerMove({ clientX: t.clientX, clientY: t.clientY })
    }
    const onTouchEnd = () => handlePointerUp()

    window.addEventListener('mousemove',  onMouseMove)
    window.addEventListener('mouseup',    onMouseUp)
    window.addEventListener('touchmove',  onTouchMove, { passive: false })
    window.addEventListener('touchend',   onTouchEnd)
    window.addEventListener('touchcancel',onTouchEnd)

    return () => {
      window.removeEventListener('mousemove',  onMouseMove)
      window.removeEventListener('mouseup',    onMouseUp)
      window.removeEventListener('touchmove',  onTouchMove)
      window.removeEventListener('touchend',   onTouchEnd)
      window.removeEventListener('touchcancel',onTouchEnd)
    }
  }, [widgets, setWidgets, colCount])

  return { ghost, preview, draggingId, resizingId, startDrag, startDragTouch, startResize, startResizeTouch }
}
