import { useEffect, useRef, useState } from 'react'
import { isTouch, reducedMotion } from '../env'

/* ───────────── Icons ───────────── */
const P = {
  sword: 'M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 018 0v4M12 15v2',
  ai: 'M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2M7 5h10v14H7zM10 10h4v4h-4z',
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16',
  db: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',
  tools: 'M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  ext: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  file: 'M14 3H6v18h12V7zM14 3v4h4',
  chev: 'M9 6l6 6-6 6',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
  cap: 'M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5M22 9v6',
  award: 'M12 15a6 6 0 100-12 6 6 0 000 12zM8.5 14L7 22l5-3 5 3-1.5-8',
  target: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01',
  menu: 'M4 7h16M4 12h16M4 17h16',
  x: 'M6 6l12 12M18 6L6 18',
  sun: 'M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  moon: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
  rocket: 'M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 15l-3-3c1-4 4-8 9-9 1 0 2 0 3 1 1 1 1 2 1 3-1 5-5 8-9 9zM14 10a1 1 0 100-2 1 1 0 000 2z',
  bulb: 'M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z',
  layers: 'M12 2l10 5-10 5L2 7zM2 12l10 5 10-5M2 17l10 5 10-5',
  linkedin: 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zM8 10.5V17M8 7.2v.01M12 17v-6.5M12 13.6c0-1.9 1.1-3.1 2.7-3.1 1.5 0 2.3 1 2.3 2.8V17',
  instagram: 'M7.5 3h9A4.5 4.5 0 0121 7.5v9a4.5 4.5 0 01-4.5 4.5h-9A4.5 4.5 0 013 16.5v-9A4.5 4.5 0 017.5 3zM12 16a4 4 0 100-8 4 4 0 000 8zM17.2 6.8v.01',
}

/* ───────────── Social icon links (for people who skip the terminal) ───────────── */
const SOCIAL_ICON = { email: 'mail', linkedin: 'linkedin', instagram: 'instagram', github: 'code' }

export function SocialLinks({ links, mode }) {
  if (!links.length) return null
  return (
    <div className={`socials ${mode}`}>
      {links.map((l) => (
        <a
          key={l.key}
          className="social"
          href={l.href}
          {...(l.key === 'email' ? {} : { target: '_blank', rel: 'noreferrer' })}
          aria-label={l.key === 'email' ? `Email ${l.href.replace('mailto:', '')}` : `${l.label} profile`}
          title={l.key === 'email' ? l.href.replace('mailto:', '') : l.label}
        >
          <Icon name={SOCIAL_ICON[l.key] || 'link'} size={22} />
          <span>{mode === 'hacker' ? l.label.toLowerCase() : l.label}</span>
        </a>
      ))}
    </div>
  )
}

export function Icon({ name, size = 22, className = '', stroke = 1.8 }) {
  return (
    <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[name] || P.code} />
    </svg>
  )
}

/* ───────────── Section heading ───────────── */
export function SectionHead({ mode, index, title, hackTitle, sub }) {
  if (mode === 'hacker') {
    return (
      <div className="sec-head reveal">
        <span className="sec-label">[0x{String(index).padStart(2, '0')}]</span>
        <h2 className="sec-title">
          {hackTitle || title}
          <span className="blink">_</span>
        </h2>
        {sub && <p className="sec-sub">{'// '}{sub}</p>}
      </div>
    )
  }
  return (
    <div className="sec-head reveal">
      <span className="sec-label">
        {String(index).padStart(2, '0')} — {title}
      </span>
      <h2 className="sec-title">{sub || title}</h2>
    </div>
  )
}

/* ───────────── 3D tilt card ───────────── */
export function TiltCard({ className = '', children, max = 10, style, ...rest }) {
  const ref = useRef(null)
  const onMove = (e) => {
    if (isTouch || reducedMotion) return
    const el = ref.current
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--rx', `${(0.5 - y) * max}deg`)
    el.style.setProperty('--ry', `${(x - 0.5) * max}deg`)
    el.style.setProperty('--gx', `${x * 100}%`)
    el.style.setProperty('--gy', `${y * 100}%`)
  }
  const onLeave = () => {
    const el = ref.current
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }
  return (
    <div ref={ref} className={`tilt ${className}`} onPointerMove={onMove} onPointerLeave={onLeave} style={style} {...rest}>
      <div className="tilt-inner">{children}</div>
      <div className="tilt-glare" aria-hidden="true" />
    </div>
  )
}

/* ───────────── 3D rotating tag sphere ───────────── */
export function TagSphere({ tags, className = '' }) {
  const wrap = useRef(null)
  const items = useRef([])
  useEffect(() => {
    const el = wrap.current
    const n = tags.length
    const pts = tags.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = Math.PI * (3 - Math.sqrt(5)) * i
      return [Math.cos(th) * r, y, Math.sin(th) * r]
    })
    let ax = 0.002
    let ay = 0.004
    let tx = ax
    let ty = ay
    let visible = true
    let raf = 0
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      ty = ((e.clientX - r.left) / r.width - 0.5) * 0.02
      tx = -((e.clientY - r.top) / r.height - 0.5) * 0.02
    }
    const onLeave = () => {
      tx = 0.002
      ty = 0.004
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (!visible) return
      const R = el.clientWidth * 0.4
      ax += (tx - ax) * 0.05
      ay += (ty - ay) * 0.05
      const sx = Math.sin(reducedMotion ? 0 : ax)
      const cx = Math.cos(reducedMotion ? 0 : ax)
      const sy = Math.sin(reducedMotion ? 0 : ay)
      const cy = Math.cos(reducedMotion ? 0 : ay)
      for (let i = 0; i < n; i++) {
        let [x, y, z] = pts[i]
        const y1 = y * cx - z * sx
        const z1 = y * sx + z * cx
        const x2 = x * cy + z1 * sy
        const z2 = -x * sy + z1 * cy
        pts[i] = [x2, y1, z2]
        const s = (z2 + 2) / 3
        const node = items.current[i]
        if (node) {
          node.style.transform = `translate(-50%, -50%) translate3d(${x2 * R}px, ${y1 * R}px, 0) scale(${s})`
          node.style.opacity = String(0.25 + ((z2 + 1) / 2) * 0.75)
          node.style.zIndex = String(Math.round(z2 * 100) + 100)
        }
      }
    }
    tick()
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [tags])
  return (
    <div ref={wrap} className={`tag-sphere ${className}`} aria-label="Skills">
      {tags.map((t, i) => (
        <span key={t} ref={(n) => (items.current[i] = n)} className="tag-sphere-item">
          {t}
        </span>
      ))}
    </div>
  )
}

/* ───────────── Typing effects ───────────── */
export function Typed({ text, speed = 55, delay = 0, onDone, className = '' }) {
  const [n, setN] = useState(reducedMotion ? text.length : 0)
  useEffect(() => {
    if (reducedMotion) return
    let i = 0
    let t
    const start = setTimeout(function step() {
      i++
      setN(i)
      if (i < text.length) t = setTimeout(step, speed)
      else onDone && onDone()
    }, delay)
    return () => {
      clearTimeout(start)
      clearTimeout(t)
    }
  }, [text])
  return <span className={className}>{text.slice(0, n)}</span>
}

export function RoleCycler({ roles, className = '' }) {
  const [txt, setTxt] = useState(reducedMotion ? roles[0] : '')
  useEffect(() => {
    if (reducedMotion) return
    let r = 0
    let i = 0
    let del = false
    let t
    const step = () => {
      const full = roles[r]
      if (!del) {
        i++
        setTxt(full.slice(0, i))
        if (i === full.length) {
          del = true
          t = setTimeout(step, 1800)
          return
        }
        t = setTimeout(step, 55)
      } else {
        i--
        setTxt(full.slice(0, i))
        if (i === 0) {
          del = false
          r = (r + 1) % roles.length
          t = setTimeout(step, 300)
          return
        }
        t = setTimeout(step, 25)
      }
    }
    t = setTimeout(step, 600)
    return () => clearTimeout(t)
  }, [roles])
  return (
    <span className={className}>
      {txt}
      <span className="caret" aria-hidden="true" />
    </span>
  )
}

/* ───────────── Terminal window frame ───────────── */
export function Window({ title, children, className = '', style }) {
  return (
    <div className={`window ${className}`} style={style}>
      <div className="window-bar">
        <span className="dot r" />
        <span className="dot y" />
        <span className="dot g" />
        <span className="window-title">{title}</span>
      </div>
      <div className="window-body">{children}</div>
    </div>
  )
}
