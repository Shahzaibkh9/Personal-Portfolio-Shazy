import { useEffect, useState } from 'react'
import { Icon } from './ui'

const NAV = {
  hacker: [
    { id: 'about', label: 'about' },
    { id: 'interests', label: 'interests' },
    { id: 'experience', label: 'experience' },
    { id: 'skills', label: 'arsenal' },
    { id: 'research', label: 'research' },
    { id: 'contact', label: 'contact' },
  ],
  dev: [
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Work' },
    { id: 'skills', label: 'Toolbox' },
    { id: 'experience', label: 'Experience' },
    { id: 'contact', label: 'Contact' },
  ],
}

export function ModeToggle({ target, onToggle, hint }) {
  const night = target === 'hacker'
  return (
    <div className="toggle-wrap">
      {hint && <span className="toggle-hint">{night ? 'switch to dev mode →' : 'switch to hacker mode →'}</span>}
      <button
        className={`mode-toggle ${night ? 'night' : 'day'}`}
        onClick={onToggle}
        aria-label={night ? 'Switch to developer (day) mode' : 'Switch to hacker (night) mode'}
        title={night ? 'Day mode — Developer' : 'Night mode — Hacker'}
      >
        <span className="mt-track">
          <span className="mt-ico mt-moon">
            <Icon name="moon" size={14} />
          </span>
          <span className="mt-ico mt-sun">
            <Icon name="sun" size={14} />
          </span>
          <span className="mt-thumb">
            <Icon name={night ? 'moon' : 'sun'} size={14} />
          </span>
        </span>
        <span className="mt-label">{night ? 'HACKER' : 'DEVELOPER'}</span>
      </button>
    </div>
  )
}

export default function Nav({ mode, target, onToggle, hint }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const hacker = mode === 'hacker'
  const links = NAV[mode]
  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''} ${open ? 'open' : ''}`}>
      <div className="nav-inner">
        <a href="#home" className="logo" onClick={() => setOpen(false)}>
          {hacker ? (
            <>
              <span className="accent">~/</span>shahzaib<span className="blink">_</span>
            </>
          ) : (
            <span className="d-logo">Shahzaib Khateeb</span>
          )}
        </a>
        <nav className="nav-links" aria-label="Sections">
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={() => setOpen(false)}>
              {hacker ? `./${l.label}` : l.label}
            </a>
          ))}
        </nav>
        <div className="nav-right">
          <ModeToggle target={target} onToggle={onToggle} hint={hint} />
          <button className="menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <Icon name={open ? 'x' : 'menu'} />
          </button>
        </div>
      </div>
    </header>
  )
}
