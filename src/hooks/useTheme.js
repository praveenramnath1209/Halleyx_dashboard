import { useState, useEffect } from 'react'

export const THEMES = [
  { id: 'light', label: 'Light', icon: '☀️' },
  { id: 'dark',  label: 'Dark',  icon: '🌙' },
  { id: 'warm',  label: 'Warm',  icon: '🍂' },
]

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('hx-theme') || 'light'
    // migrate midnight → dark
    return saved === 'midnight' ? 'dark' : saved
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('hx-theme', theme)
  }, [theme])

  useEffect(() => {
    const saved = localStorage.getItem('hx-theme') || 'light'
    const resolved = saved === 'midnight' ? 'dark' : saved
    document.documentElement.setAttribute('data-theme', resolved)
  }, [])

  return { theme, setTheme: setThemeState }
}
