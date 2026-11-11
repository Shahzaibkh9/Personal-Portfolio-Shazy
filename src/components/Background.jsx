import { useEffect, useRef } from 'react'
import { createParticles } from '../three/particles'
import { lowPower, reducedMotion, webglOK } from '../env'

export default function Background({ target }) {
  const ref = useRef(null)
  const api = useRef(null)
  const targetRef = useRef(target)
  targetRef.current = target

  useEffect(() => {
    if (!webglOK) return
    let dead = false
    const start = async () => {
      try {
        if (document.fonts && document.fonts.load) await document.fonts.load('700 200px "JetBrains Mono"')
      } catch (e) {}
      if (dead) return
      try {
        api.current = createParticles(ref.current, {
          mode: targetRef.current,
          lowPower,
          reducedMotion,
          anchor: () => document.querySelector('.portrait-wrap'),
        })
      } catch (e) {
        console.warn('3D background disabled:', e)
      }
    }
    start()
    return () => {
      dead = true
      if (api.current) api.current.dispose()
      api.current = null
    }
  }, [])

  useEffect(() => {
    if (api.current) api.current.setMode(target)
  }, [target])

  return <canvas ref={ref} className="bg-canvas" aria-hidden="true" />
}
