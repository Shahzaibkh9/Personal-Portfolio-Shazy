import { useEffect, useRef, useState } from 'react'
import { lowPower, reducedMotion } from '../env'

/* ───────────── Matrix code rain (hacker mode only) ───────────── */
export function MatrixRain({ active }) {
  const ref = useRef(null)
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    if (reducedMotion) return
    const c = ref.current
    const ctx = c.getContext('2d')
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>/{}$#@*'
    const fs = lowPower ? 18 : 16
    let cols = 0
    let drops = []
    const resize = () => {
      c.width = window.innerWidth
      c.height = window.innerHeight
      cols = Math.ceil(c.width / fs)
      drops = Array.from({ length: cols }, () => Math.random() * -60)
      ctx.fillStyle = '#050807'
      ctx.fillRect(0, 0, c.width, c.height)
    }
    resize()
    window.addEventListener('resize', resize)
    let raf = 0
    let last = 0
    const interval = 1000 / (lowPower ? 14 : 22)
    const draw = (now) => {
      raf = requestAnimationFrame(draw)
      if (!activeRef.current || now - last < interval) return
      last = now
      ctx.fillStyle = 'rgba(5, 8, 7, 0.1)'
      ctx.fillRect(0, 0, c.width, c.height)
      ctx.font = `${fs}px "JetBrains Mono", monospace`
      for (let i = 0; i < cols; i++) {
        const y = drops[i] * fs
        if (y > 0) {
          ctx.fillStyle = Math.random() > 0.96 ? '#d6ffe9' : '#00ff88'
          ctx.fillText(chars[(Math.random() * chars.length) | 0], i * fs, y)
        }
        if (y > c.height && Math.random() > 0.975) drops[i] = 0
        drops[i] += 1
      }
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className={`matrix ${active ? 'on' : ''}`} aria-hidden="true" />
}

/* ───────────── Mode-switch glitch overlay ───────────── */
export function SwitchOverlay({ to, n }) {
  if (!to) return null
  return (
    <div key={n} className={`switch-overlay to-${to}`} aria-hidden="true">
      <div className="so-flash" />
      <div className="so-bars">
        {Array.from({ length: 7 }, (_, i) => (
          <i key={i} style={{ top: `${8 + i * 13 + ((i * 37) % 9)}%`, animationDelay: `${(i * 70) % 300}ms` }} />
        ))}
      </div>
      <div className="so-text">{to === 'hacker' ? '> initiating stealth mode…' : '> compiling developer profile…'}</div>
    </div>
  )
}

/* ───────────── Boot screen (first visit in hacker mode) ───────────── */
const BOOT = [
  '[ OK ] Initializing secure shell…',
  '[ OK ] Loading kernel modules: recon, vapt, soc',
  '[ OK ] Mounting /home/shahzaib',
  '[ OK ] Establishing encrypted channel (TLS 1.3)',
  '[ OK ] Bypassing boredom… done',
  '>> ACCESS GRANTED',
]

export function BootScreen({ onDone }) {
  const [lines, setLines] = useState(0)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    let i = 0
    const t = setInterval(() => {
      i++
      setLines(i)
      if (i >= BOOT.length) {
        clearInterval(t)
        setTimeout(() => setLeaving(true), 350)
        setTimeout(onDone, 900)
      }
    }, 230)
    return () => clearInterval(t)
  }, [])
  return (
    <div className={`boot ${leaving ? 'leave' : ''}`} onClick={onDone} role="presentation">
      <div className="boot-inner">
        {BOOT.slice(0, lines).map((l, i) => (
          <div key={i} className={l.startsWith('>>') ? 'boot-granted' : ''}>
            {l}
          </div>
        ))}
        <span className="blink">█</span>
      </div>
      <span className="boot-skip">click to skip</span>
    </div>
  )
}
