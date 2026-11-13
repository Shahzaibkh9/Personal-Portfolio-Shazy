/*
 * Tiny synthesized sound effects (no audio files).
 * The AudioContext is created lazily on the first shot, which is always
 * a user gesture, so browsers allow it.
 */
let ctx = null
let noiseBuf = null

function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext
    if (!C) return null
    ctx = new C()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function noise(a) {
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate * 0.8, a.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  return noiseBuf
}

export const sfx = {
  enabled: true,

  laser() {
    if (!this.enabled) return
    const a = ac()
    if (!a) return
    const t = a.currentTime
    const o = a.createOscillator()
    const g = a.createGain()
    o.type = 'square'
    o.frequency.setValueAtTime(1500 + Math.random() * 200, t)
    o.frequency.exponentialRampToValueAtTime(160, t + 0.17)
    g.gain.setValueAtTime(0.05, t)
    g.gain.exponentialRampToValueAtTime(0.0008, t + 0.18)
    o.connect(g).connect(a.destination)
    o.start(t)
    o.stop(t + 0.2)
  },

  boom(size = 1) {
    if (!this.enabled) return
    const a = ac()
    if (!a) return
    const t = a.currentTime
    const src = a.createBufferSource()
    src.buffer = noise(a)
    const f = a.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.setValueAtTime(1400, t)
    f.frequency.exponentialRampToValueAtTime(120, t + 0.5)
    const g = a.createGain()
    const v = Math.min(0.16, 0.06 + size * 0.02)
    g.gain.setValueAtTime(v, t)
    g.gain.exponentialRampToValueAtTime(0.0008, t + 0.6)
    src.connect(f).connect(g).connect(a.destination)
    src.start(t)
    src.stop(t + 0.65)
  },
}
