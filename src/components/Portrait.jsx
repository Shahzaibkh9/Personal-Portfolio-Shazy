import { useEffect, useRef, useState } from 'react'
import { createPortrait } from '../three/portrait'
import { isTouch, lowPower, reducedMotion, webglOK } from '../env'

const N = 46
const src = (i) => `/portrait/f${String(i).padStart(2, '0')}.webp`

export default function Portrait({ target, mode, instant = false, paused = false }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const api = useRef(null)
  const [ready, setReady] = useState(false)
  const targetRef = useRef(target)
  targetRef.current = target
  const instantRef = useRef(instant)
  instantRef.current = instant
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  useEffect(() => {
    if (!webglOK) return
    let dead = false
    const imgs = Array.from({ length: N }, (_, i) => {
      const im = new Image()
      im.decoding = 'async'
      im.src = src(i)
      return im
    })
    const wait = (im) =>
      im.decode
        ? im.decode().catch(() => {})
        : new Promise((r) => {
            im.onload = im.onerror = r
          })
    Promise.all(imgs.map(wait)).then(() => {
      if (dead) return
      try {
        api.current = createPortrait(canvasRef.current, imgs, { mode: targetRef.current, reducedMotion, lowPower })
        api.current.setPaused(pausedRef.current)
        setReady(true)
      } catch (e) {
        console.warn('Portrait shader disabled:', e)
      }
    })
    return () => {
      dead = true
      if (api.current) api.current.dispose()
      api.current = null
    }
  }, [])

  useEffect(() => {
    if (api.current) api.current.setMode(target, instantRef.current)
  }, [target])

  useEffect(() => {
    if (api.current) api.current.setPaused(paused)
  }, [paused])

  // gentle 3D tilt following the pointer
  useEffect(() => {
    if (isTouch || reducedMotion) return
    const el = wrapRef.current
    let raf = 0
    let tx = 0
    let ty = 0
    let x = 0
    let y = 0
    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2
      ty = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const tick = () => {
      raf = requestAnimationFrame(tick)
      x += (tx - x) * 0.06
      y += (ty - y) * 0.06
      el.style.setProperty('--prx', `${-y * 6}deg`)
      el.style.setProperty('--pry', `${x * 9}deg`)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    tick()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  const hacker = mode === 'hacker'
  return (
    <div className="portrait-stage">
      <div ref={wrapRef} className={`portrait-wrap ${target === 'hacker' ? 'is-hack' : 'is-dev'}`}>
        <img
          className={`portrait-fallback ${ready ? 'hide' : ''}`}
          src={src(target === 'hacker' ? N - 1 : 0)}
          alt="Muhammad Shahzaib Khateeb"
          width="600"
          height="900"
        />
        <canvas ref={canvasRef} className={`portrait-canvas ${ready ? 'show' : ''}`} aria-hidden="true" />

        {hacker ? (
          <div className="hud" key="hud" aria-hidden="true">
            <span className="hud-c tl" />
            <span className="hud-c tr" />
            <span className="hud-c bl" />
            <span className="hud-c br" />
            <span className="hud-top">ID: SHAHZAIB.K // ACCESS: GRANTED</span>
            <span className="hud-bottom">
              <i className="hud-dot" /> SIGNAL SECURE · 24.86°N 67.00°E
            </span>
          </div>
        ) : (
          <div className="chips" key="chips" aria-hidden="true">
            <span className="chip c1">&lt;/&gt; Developer</span>
            <span className="chip c2">🐍 Python</span>
            <span className="chip c3">⚛ Next.js</span>
            <span className="chip c4">✦ AI</span>
          </div>
        )}
      </div>
    </div>
  )
}
