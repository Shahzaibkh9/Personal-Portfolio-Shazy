import { useEffect, useRef, useState } from 'react'
import { createSpace } from '../three/space'
import { sfx } from '../three/sfx'
import { isTouch, lowPower, reducedMotion, webglOK } from '../env'

/*
 * Landing: a starfighter cockpit flying through an asteroid field.
 * Two physical push-buttons on the instrument panel pick the destination →
 * light-speed jump → the site opens in that mode.
 * (Original design — not based on any existing game's cockpit.)
 */

const T = reducedMotion
  ? { jump: 150, choose: 550, out: 600, done: 1000 }
  : { jump: 650, choose: 2250, out: 2350, done: 3050 }

const DEST = {
  dev: { sector: 'DEVELOPER SECTOR', desc: 'Hire me, outsource a project, or collaborate on a product.' },
  hacker: { sector: 'CYBER SECTOR', desc: 'Security research, VAPT, SOC and my hacking portfolio.' },
}

const SWITCHES = [
  { label: 'PWR', on: true },
  { label: 'NAV', on: true },
  { label: 'SND', on: true },
  { label: 'SHLD', on: true },
]

function Dial({ label, value, slow }) {
  return (
    <div className="ln-dial">
      <div className="ln-dial-bezel">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" className="ln-dial-face" />
          {Array.from({ length: 11 }, (_, i) => {
            const a = ((-135 + i * 27) * Math.PI) / 180
            return <line key={i} x1={50 + Math.sin(a) * 33} y1={50 - Math.cos(a) * 33} x2={50 + Math.sin(a) * 41} y2={50 - Math.cos(a) * 41} className="ln-dial-tick" />
          })}
          <path d="M20 74 A40 40 0 0 1 80 74" className="ln-dial-arc" />
          <g className={`ln-needle ${slow ? 'slow' : ''}`}>
            <line x1="50" y1="50" x2="50" y2="17" />
          </g>
          <circle cx="50" cy="50" r="5" className="ln-dial-hub" />
        </svg>
      </div>
      <span className="ln-plate-sm">
        {label} <b>{value}</b>
      </span>
    </div>
  )
}

function Toggle({ label, on, onFlip }) {
  return (
    <button type="button" className={`ln-toggle ${on ? 'on' : ''}`} onClick={onFlip} aria-pressed={on} aria-label={`${label} switch`}>
      <span className="ln-toggle-led" />
      <span className="ln-toggle-base">
        <span className="ln-toggle-lever" />
      </span>
      <span className="ln-toggle-label">{label}</span>
    </button>
  )
}

function PushButton({ kind, glyph, title, sub, pressed, onPress, onHover }) {
  return (
    <button
      type="button"
      className={`ln-push ${kind} ${pressed ? 'pressed' : ''}`}
      onClick={onPress}
      onPointerEnter={() => onHover(kind === 'dev' ? 'dev' : 'hacker')}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(kind === 'dev' ? 'dev' : 'hacker')}
      onBlur={() => onHover(null)}
      aria-label={`${title}: ${sub}`}
    >
      <span className="ln-push-housing">
        <i className="ln-screw s1" />
        <i className="ln-screw s2" />
        <i className="ln-screw s3" />
        <i className="ln-screw s4" />
        <span className="ln-push-ring">
          <span className="ln-push-cap">
            <span className="ln-push-glyph">{glyph}</span>
          </span>
        </span>
      </span>
      <span className="ln-push-plate">
        <b>{title}</b>
        <small>{sub}</small>
      </span>
    </button>
  )
}

function FireButton({ onFire, disabled }) {
  const timer = useRef(null)
  const stop = () => {
    clearInterval(timer.current)
    timer.current = null
  }
  useEffect(() => stop, [])
  return (
    <button
      type="button"
      className="ln-push fire"
      disabled={disabled}
      aria-label="Fire lasers"
      onPointerDown={(e) => {
        e.preventDefault()
        onFire()
        stop()
        timer.current = setInterval(onFire, 150)
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onClick={(e) => {
        if (e.detail === 0) onFire() // keyboard Enter
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="ln-push-housing">
        <i className="ln-screw s1" />
        <i className="ln-screw s2" />
        <i className="ln-screw s3" />
        <i className="ln-screw s4" />
        <span className="ln-push-ring">
          <span className="ln-push-cap">
            <span className="ln-push-glyph">✶</span>
          </span>
        </span>
      </span>
      <span className="ln-push-plate">
        <b>Fire</b>
        <small>{isTouch ? 'hold' : 'space'}</small>
      </span>
    </button>
  )
}

export default function Launch({ onChoose, onDone }) {
  const canvas = useRef(null)
  const api = useRef(null)
  const timers = useRef([])
  const [phase, setPhase] = useState('idle') // idle → plotting → jump → out
  const [choice, setChoice] = useState(null)
  const [hover, setHover] = useState(null)
  const [sw, setSw] = useState(SWITCHES.map((s) => s.on))
  const [hits, setHits] = useState(0)
  const [shot, setShot] = useState(false)
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const aimEl = useRef(null)

  // SND switch really mutes the lasers + explosions
  useEffect(() => {
    sfx.enabled = sw[2]
  }, [sw])

  const fire = (nx, ny) => {
    if (phaseRef.current !== 'idle' || !api.current) return
    api.current.fire(nx, ny)
    setShot(true)
  }

  // Spacebar fires (and never "presses" a focused button)
  useEffect(() => {
    const isSpace = (e) => e.code === 'Space' || e.key === ' '
    const down = (e) => {
      if (!isSpace(e)) return
      e.preventDefault()
      fire() // holding SPACE auto-fires (rate-limited in the scene)
    }
    const up = (e) => {
      if (isSpace(e)) e.preventDefault()
    }
    window.addEventListener('keydown', down, true)
    window.addEventListener('keyup', up, true)
    return () => {
      window.removeEventListener('keydown', down, true)
      window.removeEventListener('keyup', up, true)
    }
  }, [])

  // mouse aims the cannons; clicking / tapping open space fires at that point
  const toNdc = (e) => [(e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1]
  const moveAim = (e) => {
    if (aimEl.current) aimEl.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
  }
  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const overPanel = e.target.closest && e.target.closest('.ln-panel')
    if (aimEl.current) aimEl.current.classList.toggle('hidden', !!overPanel)
    if (overPanel) return
    moveAim(e)
    const [nx, ny] = toNdc(e)
    if (api.current) api.current.setAim(nx, ny)
  }
  const onPointerDown = (e) => {
    if (e.target.closest && e.target.closest('button, .ln-panel')) return
    moveAim(e)
    if (aimEl.current) {
      aimEl.current.classList.remove('hidden')
      aimEl.current.classList.remove('pulse')
      void aimEl.current.offsetWidth
      aimEl.current.classList.add('pulse')
    }
    const [nx, ny] = toNdc(e)
    fire(nx, ny)
  }

  useEffect(() => {
    if (!webglOK) return
    try {
      api.current = createSpace(canvas.current, { lowPower, reducedMotion, isTouch, onScore: setHits })
    } catch (e) {
      console.warn('Landing scene disabled:', e)
    }
    // keep the cannons just above the dashboard, whatever the screen size
    const shield = document.querySelector('.ln-shield')
    const measure = () => {
      if (!shield || !api.current) return
      const top = shield.getBoundingClientRect().top
      api.current.setViewBottom(1 - (top / window.innerHeight) * 2)
    }
    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    if (ro && shield) ro.observe(shield.parentElement)
    window.addEventListener('resize', measure)
    return () => {
      if (ro) ro.disconnect()
      window.removeEventListener('resize', measure)
      timers.current.forEach(clearTimeout)
      if (api.current) api.current.dispose()
      api.current = null
    }
  }, [])

  const go = (m) => {
    if (phase !== 'idle') return
    if (navigator.vibrate) navigator.vibrate(18)
    setChoice(m)
    setPhase('plotting')
    setSw(SWITCHES.map(() => true)) // all systems on for the jump
    const at = (ms, fn) => timers.current.push(setTimeout(fn, ms))
    at(T.jump, () => {
      setPhase('jump')
      if (api.current) api.current.warp(reducedMotion ? 0.4 : 1.55)
    })
    at(T.choose, () => onChoose(m))
    at(T.out, () => setPhase('out'))
    at(T.done, onDone)
  }

  const tone = choice || hover
  const focus = choice || hover
  let line1 = 'NAV-COM // SELECT DESTINATION'
  let line2 = 'Two sectors in range. Press a button to set course.'
  if (choice && phase === 'plotting') {
    line1 = `COURSE PLOTTED · ${DEST[choice].sector}`
    line2 = 'Spooling hyperdrive…'
  } else if (choice) {
    line1 = 'JUMP'
    line2 = `Destination: ${DEST[choice].sector}`
  } else if (focus) {
    line1 = DEST[focus].sector
    line2 = DEST[focus].desc
  }

  return (
    <div
      className={`launch phase-${phase} ${tone ? `tone-${tone}` : ''} ${isTouch ? 'touch' : 'mouse'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Choose a portfolio: developer or cybersecurity"
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
    >
      <canvas ref={canvas} className="ln-canvas" aria-hidden="true" />
      <div className="ln-glass" aria-hidden="true" />

      {/* canopy frame */}
      <svg className="ln-canopy" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="lnStrutL" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#010203" />
            <stop offset="0.65" stopColor="#0b1017" />
            <stop offset="0.92" stopColor="#1c2531" />
            <stop offset="1" stopColor="#2b3746" />
          </linearGradient>
          <linearGradient id="lnStrutR" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#010203" />
            <stop offset="0.65" stopColor="#0b1017" />
            <stop offset="0.92" stopColor="#1c2531" />
            <stop offset="1" stopColor="#2b3746" />
          </linearGradient>
          <linearGradient id="lnBrow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#010203" />
            <stop offset="0.8" stopColor="#0e141c" />
            <stop offset="1" stopColor="#273242" />
          </linearGradient>
        </defs>
        <polygon className="ln-strut-l" points="0,0 62,0 22,300 110,1000 0,1000" fill="url(#lnStrutL)" />
        <polygon className="ln-strut-r" points="1000,0 938,0 978,300 890,1000 1000,1000" fill="url(#lnStrutR)" />
        <polygon points="0,0 1000,0 1000,20 640,44 360,44 0,20" fill="url(#lnBrow)" />
        <polyline points="62,0 22,300 110,1000" className="ln-edge" />
        <polyline points="938,0 978,300 890,1000" className="ln-edge" />
        <polyline points="0,20 360,44 640,44 1000,20" className="ln-edge" />
      </svg>
      <div className="ln-bolts" aria-hidden="true">
        <i style={{ left: '1.6%', top: '12%' }} />
        <i style={{ left: '1.2%', top: '38%' }} />
        <i style={{ left: '3.2%', top: '58%' }} />
        <i style={{ right: '1.6%', top: '12%' }} />
        <i style={{ right: '1.2%', top: '38%' }} />
        <i style={{ right: '3.2%', top: '58%' }} />
      </div>

      {/* HUD projected on the glass */}
      <div className="ln-hud">
        <div className="ln-hud-top">
          <span>NAV-COM · ONLINE</span>
          <span className="ln-hud-r">SHIELDS 100% · HULL OK</span>
        </div>
        <div className="ln-title">
          <p className="ln-kicker">Pilot · Muhammad Shahzaib Khateeb</p>
          <h1 className="ln-name">Choose your journey</h1>
        </div>
        <div className="ln-score" aria-live="polite">
          <span>HITS</span>
          <b>{String(hits).padStart(2, '0')}</b>
        </div>
        {!shot && <div className="ln-hint">{isTouch ? 'Tap space or hold FIRE to blast the rocks' : 'Aim with the mouse · press SPACE (or click) to fire'}</div>}
        <div className="ln-reticle" aria-hidden="true">
          <i className="ln-ring" />
          <i className="ln-ring inner" />
          <i className="ln-tick t" />
          <i className="ln-tick b" />
          <i className="ln-tick l" />
          <i className="ln-tick r" />
          <i className="ln-ladder l" />
          <i className="ln-ladder r" />
        </div>
      </div>

      {/* instrument panel */}
      <div className="ln-cockpit">
        <div className="ln-shield" aria-hidden="true" />
        <div className="ln-panel">
          <i className="ln-screw p1" aria-hidden="true" />
          <i className="ln-screw p2" aria-hidden="true" />

          <div className="ln-sec ln-left">
            <div className="ln-dials">
              <Dial label="THR" value="74%" />
              <Dial label="PWR" value="98%" slow />
            </div>
            <div className="ln-switches">
              {SWITCHES.map((s, i) => (
                <Toggle key={s.label} label={s.label} on={sw[i]} onFlip={() => setSw((a) => a.map((v, j) => (j === i ? !v : v)))} />
              ))}
            </div>
          </div>

          <div className="ln-sec ln-mid">
            <div className="ln-screen" aria-live="polite">
              <div className="ln-screen-l1">
                <span className="ln-screen-dot" />
                {line1}
              </div>
              <div className="ln-screen-l2">{line2}</div>
            </div>
            <div className="ln-buttons">
              <PushButton kind="dev" glyph="</>" title="Developer" sub="Hire & Collaborate" pressed={choice === 'dev'} onPress={() => go('dev')} onHover={(h) => phase === 'idle' && setHover(h)} />
              <PushButton kind="cyber" glyph=">_" title="Cybersecurity" sub="Enter the Lab" pressed={choice === 'hacker'} onPress={() => go('hacker')} onHover={(h) => phase === 'idle' && setHover(h)} />
            </div>
            <p className="ln-note">Switch between day ☀ and night ☾ anytime from the top bar.</p>
          </div>

          <div className="ln-sec ln-right">
            <div className="ln-lights" aria-hidden="true">
              {Array.from({ length: 12 }, (_, i) => (
                <i key={i} style={{ animationDelay: `${(i * 373) % 1900}ms`, animationDuration: `${1.2 + ((i * 7) % 5) * 0.35}s` }} />
              ))}
            </div>
            <div className="ln-readout">
              <span>SPD</span>
              <b>{phase === 'jump' || phase === 'out' ? 'LIGHT' : '0.26c'}</b>
              <span>HITS</span>
              <b>{hits}</b>
            </div>
            <FireButton onFire={() => fire()} disabled={phase !== 'idle'} />
            <div className="ln-throttle" aria-hidden="true">
              <span className="ln-throttle-slot" />
              <span className="ln-throttle-handle" />
              <span className="ln-plate-sm">THROTTLE</span>
            </div>
          </div>
        </div>
      </div>

      <div ref={aimEl} className="ln-aim hidden" aria-hidden="true">
        <i />
      </div>
      <div className="ln-flash" aria-hidden="true" />
    </div>
  )
}
