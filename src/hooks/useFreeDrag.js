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

function resolveCollisions(draggingId, proposed, allWidgets) {
  const layouts = {}
  for (const w of allWidgets) layouts[w.id] = { ...w.layout }
  layouts[draggingId] = { ...proposed }

  for (let pass = 0; pass < 40; pass++) {
    let moved = false
    for (const w of allWidgets) {
      if (w.id === draggingId) continue
      const wl = layouts[w.id]
      for (const other of allWidgets) {
        if (other.id === w.id) continue
        const ol = layouts[other.id]
        if (overlaps(wl, ol)) {
          const newRow = ol.row + ol.h
          if (newRow !== wl.row) {
            layouts[w.id] = { ...wl, row: newRow }
            moved = true
          }
        }
      }
    }
    if (!moved) break
  }
  return layouts
}

function compact(widgets, lockedId, lockedLayout) {
  const layouts = {}
  for (const w of widgets) {
    layouts[w.id] = lockedId === w.id ? { ...lockedLayout } : { ...w.layout }
  }

  const order = [...widgets].sort((a, b) => {
    const la = layouts[a.id], lb = layouts[b.id]
    return la.row !== lb.row ? la.row - lb.row : la.col - lb.col
  })

  for (const w of order) {
    if (w.id === lockedId) continue
    const l = layouts[w.id]
    let row = 0
    outer: while (true) {
      const candidate = { ...l, row }
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

// ─── Hook ────────────────────────────────────────────────────────────────

export function useFreeDrag({ widgets, setWidgets, canvasRef }) {
  const dragState = useRef(null)
  const ghostRef  = useRef(null)

  const [ghost,      setGhostState] = useState(null)
  const [preview,    setPreview]    = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [resizingId, setResizingId] = useState(null)

  // ── keep a live col-width that always reads the real DOM width ──
  const getColWidth = () =>
    canvasRef.current ? canvasRef.current.clientWidth / COL_COUNT : 80

  const setGhost = (g) => { ghostRef.current = g; setGhostState(g) }

  // ── start move ──
  const startDrag = (e, widget) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const rect       = e.currentTarget.closest('[data-canvas-widget]').getBoundingClientRect()
    const canvasRect = canvasRef.current.getBoundingClientRect()
    dragState.current = {
      type: 'move', id: widget.id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      canvasRect,
      w: widget.layout.w,
      h: widget.layout.h,
    }
    setDraggingId(widget.id)
    setGhost({ col: widget.layout.col, row: widget.layout.row, w: widget.layout.w, h: widget.layout.h })
  }

  // ── start resize ──
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

  useEffect(() => {
    const onMove = (e) => {
      if (!dragState.current) return
      const ds = dragState.current

      if (ds.type === 'move') {
        // ── Re-read canvas rect live on every move so scrolling doesn't
        //    cause drift, and so we always get the real bounds ──
        const canvasRect = canvasRef.current?.getBoundingClientRect()
        if (!canvasRect) return

        const cw  = canvasRef.current.clientWidth / COL_COUNT
        const px  = e.clientX - canvasRect.left - ds.offsetX
        const py  = e.clientY - canvasRect.top  - ds.offsetY

        // ── Key fix: only clamp LEFT edge (col >= 0), NOT the right edge.
        //    The canvas will grow rightward automatically via canvasW below. ──
        const col = Math.max(0, Math.round(px / cw))
        const row = Math.max(0, Math.round(py / ROW_H))

        const proposed = { col, row, w: ds.w, h: ds.h }
        setGhost(proposed)
        setPreview(resolveCollisions(ds.id, proposed, widgets))
      }

      if (ds.type === 'resize') {
        const dx   = e.clientX - ds.startX
        const dy   = e.clientY - ds.startY
        // ── Resize: allow growing past the original right edge too ──
        const newW = Math.max(1, Math.round(ds.startW + dx / ds.colW))
        const newH = Math.max(1, Math.round(ds.startH + dy / ROW_H))
        const proposed = { col: ds.startCol, row: ds.startRow, w: newW, h: newH }
        setGhost(proposed)
        setPreview(resolveCollisions(ds.id, proposed, widgets))
      }
    }

    const onUp = () => {
      if (!dragState.current) return
      const ds = dragState.current
      const g  = ghostRef.current

      if (g) {
        if (ds.type === 'move') {
          const compacted = compact(widgets, ds.id, g)
          setWidgets(prev => prev.map(w => ({
            ...w,
            layout: { ...w.layout, ...compacted[w.id] },
          })))
        }
        if (ds.type === 'resize') {
          const compacted = compact(widgets, ds.id, g)
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

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [widgets, setWidgets])

  return { ghost, preview, draggingId, resizingId, startDrag, startResize }
}
