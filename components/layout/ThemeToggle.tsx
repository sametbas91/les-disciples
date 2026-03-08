'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains('light'))
  }, [])

  const toggle = () => {
    const next = !isLight
    setIsLight(next)
    if (next) {
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
    } else {
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    }
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 w-full bg-card border border-border rounded-xl px-4 py-3 text-sm hover:bg-card-hover transition-colors"
    >
      {isLight ? (
        <>
          <Moon size={16} className="text-primary" />
          <span>Passer en mode sombre</span>
        </>
      ) : (
        <>
          <Sun size={16} className="text-primary" />
          <span>Passer en mode clair</span>
        </>
      )}
    </button>
  )
}
