import styles from './MobileNav.module.css'

export function MobileNav({ tab, setTab, onClose }) {
  const go = (t) => { setTab(t); onClose() }
  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <nav className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerLogo}>
            <div className={styles.mark}>HX</div>
            <span className={styles.name}>Halleyx</span>
          </div>
        </div>
        <button className={`${styles.item} ${tab === 'dashboard' ? styles.active : ''}`} onClick={() => go('dashboard')}>
          <span className={styles.icon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </span>
          Dashboard
        </button>
        <button className={`${styles.item} ${tab === 'orders' ? styles.active : ''}`} onClick={() => go('orders')}>
          <span className={styles.icon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
          </span>
          Customer Orders
        </button>
      </nav>
    </>
  )
}
