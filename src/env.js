const mq = (q) => typeof window !== 'undefined' && window.matchMedia && window.matchMedia(q).matches

export const reducedMotion = mq('(prefers-reduced-motion: reduce)')
export const isTouch = mq('(hover: none)') || mq('(pointer: coarse)')

const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4
const memory = (typeof navigator !== 'undefined' && navigator.deviceMemory) || 4
export const lowPower = isTouch || cores <= 4 || memory <= 4

export const webglOK = (() => {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch (e) {
    return false
  }
})()

export const initialMode = (() => {
  const m = typeof document !== 'undefined' && document.documentElement.getAttribute('data-mode')
  return m === 'dev' ? 'dev' : 'hacker'
})()

export const saveMode = (m) => {
  try {
    localStorage.setItem('portfolio-mode', m)
  } catch (e) {}
}
