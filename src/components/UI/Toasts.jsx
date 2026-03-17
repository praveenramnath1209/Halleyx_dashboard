export function Toasts({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <div className="toast-icon">{t.type === 'success' ? '✓' : '!'}</div>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}
