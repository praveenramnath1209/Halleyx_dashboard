export function ConfirmDialog({ dialog, onClose }) {
  if (!dialog) return null
  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <div style={{ padding: '28px 22px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px' }}>{dialog.msg}</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>{dialog.sub}</div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={dialog.onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}
