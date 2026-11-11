import { useCallback, useEffect, useRef, useState } from 'react'
import Background from './components/Background'
import DevSections from './components/DevSections'
import { BootScreen, MatrixRain, SwitchOverlay } from './components/Effects'
import HackerSections from './components/HackerSections'
import Hero from './components/Hero'
import Nav from './components/Nav'
import { NAME } from './data/content'
import { initialMode, reducedMotion, saveMode } from './env'

const SWAP_AT = reducedMotion ? 150 : 800 // ms — content/theme swaps under the glitch
const DONE_AT = reducedMotion ? 400 : 2200

function useReveal(dep) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)')
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in')
            io.unobserve(en.target)
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [dep])
}

export default function App() {
  const [target, setTarget] = useState(initialMode) // drives 3D + portrait (instant)
  const [mode, setMode] = useState(initialMode) // drives content + theme (mid-glitch)
  const [overlay, setOverlay] = useState({ to: null, n: 0 })
  const [hint, setHint] = useState(true)
  const [boot, setBoot] = useState(() => {
    if (initialMode !== 'hacker' || reducedMotion) return false
    try {
      return !sessionStorage.getItem('booted')
    } catch (e) {
      return true
    }
  })
  const busy = useRef(false)
  const targetRef = useRef(target)
  targetRef.current = target

  const toggle = useCallback(() => {
    if (busy.current) return
    busy.current = true
    setHint(false)
    const next = targetRef.current === 'hacker' ? 'dev' : 'hacker'
    setTarget(next)
    setOverlay((o) => ({ to: next, n: o.n + 1 }))
    setTimeout(() => {
      setMode(next)
      document.documentElement.setAttribute('data-mode', next)
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', next === 'hacker' ? '#050807' : '#f6f5f2')
      saveMode(next)
    }, SWAP_AT)
    setTimeout(() => {
      busy.current = false
      setOverlay((o) => ({ ...o, to: null }))
    }, DONE_AT)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setHint(false), 9000)
    return () => clearTimeout(t)
  }, [])

  useReveal(mode)

  const endBoot = useCallback(() => {
    setBoot(false)
    try {
      sessionStorage.setItem('booted', '1')
    } catch (e) {}
  }, [])

  return (
    <>
      <div className="bg-layer" aria-hidden="true">
        <div className="bg-grid" />
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
      </div>
      <MatrixRain active={target === 'hacker'} />
      <Background target={target} />
      <div className="scanlines" aria-hidden="true" />

      <Nav mode={mode} target={target} onToggle={toggle} hint={hint && !boot} />
      <Hero mode={mode} target={target} />
      {mode === 'hacker' ? <HackerSections onToggle={toggle} /> : <DevSections onToggle={toggle} />}

      <footer className="footer">
        <div className="container footer-inner">
          <span>
            © {new Date().getFullYear()} {NAME}
          </span>
          <span className="muted">{mode === 'hacker' ? '// built with three.js · no systems were harmed' : 'Designed & built with React + Three.js'}</span>
          <button className="text-link" onClick={toggle}>
            {mode === 'hacker' ? 'switch to developer mode ☀' : 'switch to hacker mode ☾'}
          </button>
        </div>
      </footer>

      <SwitchOverlay to={overlay.to} n={overlay.n} />
      {boot && <BootScreen onDone={endBoot} />}
    </>
  )
}
