import { useState, useRef, useEffect } from 'react'
import { THEMES } from '../../hooks/useTheme'
import styles from './ThemeSwitcher.module.css'

export function ThemeSwitcher({ theme, setTheme }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = THEMES.find(t => t.id === theme) || THEMES[0]

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(v => !v)}
        title="Switch theme"
        aria-label="Switch theme"
      >
        <span className={styles.triggerIcon}>{current.icon}</span>
        <span className={styles.triggerLabel}>{current.label}</span>
        <svg
          width="10" height="10" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>Theme</div>
          {THEMES.map(t => (
            <button
              key={t.id}
              className={`${styles.option} ${t.id === theme ? styles.optionActive : ''}`}
              onClick={() => { setTheme(t.id); setOpen(false) }}
            >
              <span className={styles.optionIcon}>{t.icon}</span>
              <span className={styles.optionLabel}>{t.label}</span>
              {t.id === theme && (
                <svg className={styles.check} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
              <div className={styles.optionPreview} data-theme-preview={t.id} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
