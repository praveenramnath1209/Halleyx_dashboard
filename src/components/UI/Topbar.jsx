import { ThemeSwitcher } from './ThemeSwitcher'
import styles from './Topbar.module.css'

export function Topbar({ tab, setTab, orderCount, widgetCount, onMenuToggle, menuOpen, theme, setTheme }) {
  return (
    <header className={styles.topbar}>
      {/* Mobile hamburger */}
      <button className={styles.hamburger} onClick={onMenuToggle} aria-label="Menu">
        <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
        <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
        <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
      </button>

      <div className={styles.logo}>
        <div className={styles.logoMark}>HX</div>
        <span className={styles.logoText}>Halle<span>yx</span></span>
      </div>

      {/* Desktop nav */}
      <nav className={styles.nav}>
        <button
          className={`${styles.navTab} ${tab === 'dashboard' ? styles.active : ''}`}
          onClick={() => setTab('dashboard')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          Dashboard
        </button>
        <button
          className={`${styles.navTab} ${tab === 'orders' ? styles.active : ''}`}
          onClick={() => setTab('orders')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <path d="M9 12h6M9 16h4"/>
          </svg>
          Orders
        </button>
      </nav>

      <div className={styles.right}>
        <div className={styles.statsPills}>
          <span className={styles.pill}>{widgetCount} <span>widgets</span></span>
          <span className={styles.pillDiv} />
          <span className={styles.pill}>{orderCount} <span>orders</span></span>
        </div>

        {/* Theme switcher */}
        <ThemeSwitcher theme={theme} setTheme={setTheme} />

        <div className={styles.avatar}>U</div>
      </div>
    </header>
  )
}
