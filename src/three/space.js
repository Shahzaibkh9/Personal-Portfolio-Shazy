import * as THREE from 'three'
import gsap from 'gsap'
import { sfx } from './sfx'

/*
 * Landing scene: first-person flight through an asteroid field.
 * - procedural nebula sky with a huge light beam ahead (backlights the rocks)
 * - instanced, noise-displaced asteroids streaming toward the camera
 * - space-dust streaks whose length grows with speed
 * - warp(): accelerates into a light-speed jump
 */

const skyVert = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = p.xyww;
  }
`

const skyFrag = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3 uLightDir;
  uniform float uWarp;
  varying vec3 vDir;

  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    vec3 d = normalize(vDir);
    float t = uTime * 0.02;

    // nebula clouds
    float n = fbm(d * 2.6 + vec3(t, 0.0, -t));
    float n2 = fbm(d * 6.0 - vec3(0.0, t * 2.0, 0.0));
    vec3 col = mix(vec3(0.004, 0.01, 0.03), vec3(0.03, 0.09, 0.2), smoothstep(0.35, 0.85, n));
    col += vec3(0.02, 0.07, 0.14) * smoothstep(0.55, 0.9, n2) * 0.8;

    // the light source ahead + volumetric-looking rays around it
    float c = max(dot(d, uLightDir), 0.0);
    vec3 axisA = normalize(cross(uLightDir, vec3(0.0, 1.0, 0.0)));
    vec3 axisB = cross(axisA, uLightDir);
    float ang = atan(dot(d, axisB), dot(d, axisA));
    float rays = fbm(vec3(ang * 3.2, t * 3.0, 0.0)) * fbm(vec3(ang * 9.0, -t * 2.0, 4.0));
    col += vec3(0.55, 0.78, 1.0) * pow(c, 90.0) * 3.0;
    col += vec3(0.35, 0.6, 1.0) * pow(c, 14.0) * 0.9;
    col += vec3(0.2, 0.45, 0.9) * pow(c, 4.0) * 0.35;
    col += vec3(0.4, 0.65, 1.0) * pow(c, 6.0) * smoothstep(0.35, 0.8, rays) * 1.4;

    // stars
    vec3 sp = d * 420.0;
    float s = hash(floor(sp));
    float star = step(0.9975, s) * (0.5 + 0.5 * sin(uTime * 2.0 + s * 80.0));
    col += vec3(0.75, 0.85, 1.0) * star * 0.9;

    col *= 1.0 + uWarp * 1.5;
    gl_FragColor = vec4(col, 1.0);
  }
`

function makeRock(seed, detail) {
  const g = new THREE.IcosahedronGeometry(1, detail)
  const p = g.attributes.position
  const v = new THREE.Vector3()
  const s1 = seed * 1.7
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const n =
      Math.sin(v.x * 2.1 + s1) * Math.cos(v.y * 2.4 - s1) * 0.22 +
      Math.sin(v.z * 3.3 + s1 * 2.0) * 0.12 +
      Math.sin((v.x + v.y + v.z) * 6.0 + s1) * 0.05
    v.multiplyScalar(1 + n)
    v.y *= 0.82 + (seed % 3) * 0.06
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

export function createSpace(canvas, { lowPower, reducedMotion, isTouch = false, onScore }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })
  const maxPR = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5)
  let pr = maxPR
  renderer.setPixelRatio(pr)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x040a16, 0.0105)
  const camera = new THREE.PerspectiveCamera(72, 1, 0.1, 900)
  camera.rotation.order = 'YXZ'
  scene.add(camera) // guns are children of the camera

  const lightDir = new THREE.Vector3(-0.28, 0.42, -1).normalize()

  // sky
  const skyU = { uTime: { value: 7 }, uLightDir: { value: lightDir }, uWarp: { value: 0 } }
  const bakeScene = new THREE.Scene()
  const bakeMesh = new THREE.Mesh(
    new THREE.SphereGeometry(500, 32, 16),
    new THREE.ShaderMaterial({ vertexShader: skyVert, fragmentShader: skyFrag, uniforms: skyU, side: THREE.BackSide, depthWrite: false }),
  )
  bakeScene.add(bakeMesh)
  const cubeRT = new THREE.WebGLCubeRenderTarget(lowPower ? 384 : 768, { generateMipmaps: false })
  const cubeCam = new THREE.CubeCamera(1, 1000, cubeRT)
  cubeCam.update(renderer, bakeScene)
  bakeMesh.geometry.dispose()
  bakeMesh.material.dispose()
  const skyDraw = { uCube: { value: cubeRT.texture }, uWarp: { value: 0 } }
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(500, 24, 12),
    new THREE.ShaderMaterial({
      uniforms: skyDraw,
      vertexShader: skyVert,
      fragmentShader: `
        uniform samplerCube uCube;
        uniform float uWarp;
        varying vec3 vDir;
        void main() {
          gl_FragColor = vec4(textureCube(uCube, normalize(vDir)).rgb * (1.0 + uWarp * 1.5), 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    }),
  )
  scene.add(sky)

  // lighting — strong back/rim light from the beam, faint cold fill
  const key = new THREE.DirectionalLight(0x9fcbff, 3.2)
  key.position.copy(lightDir).multiplyScalar(100)
  scene.add(key)
  scene.add(new THREE.HemisphereLight(0x3b5f94, 0x07090d, 1.25))
  const fill = new THREE.DirectionalLight(0x6f8fbf, 1.1)
  fill.position.set(0.5, -0.2, 1)
  scene.add(fill)

  // asteroids
  const COUNT = lowPower ? 64 : 170
  const VARIANTS = 4
  const per = Math.ceil(COUNT / VARIANTS)
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x6f7784, roughness: 0.96, metalness: 0.04, flatShading: true })
  const meshes = []
  const rocks = []
  const NEAR = 12
  const FAR = -320
  const spawn = (r, anywhere) => {
    r.gen = (r.gen || 0) + 1 // invalidates bolts aimed at the old rock
    const big = Math.random() < 0.06
    r.s = big ? 6 + Math.random() * 9 : 0.35 + Math.pow(Math.random(), 2.2) * 3.2
    let x
    let y
    do {
      x = (Math.random() - 0.5) * 120
      y = (Math.random() - 0.5) * 72
    } while (Math.abs(x) < 6 + r.s && Math.abs(y) < 4 + r.s) // keep a flight corridor clear
    r.x = x
    r.y = y
    r.z = anywhere ? FAR + Math.random() * (NEAR - FAR) : FAR - Math.random() * 60
    r.rx = Math.random() * 6
    r.ry = Math.random() * 6
    r.vx = (Math.random() - 0.5) * 0.9
    r.vy = (Math.random() - 0.5) * 0.9
    r.drift = (Math.random() - 0.5) * 1.2
  }
  for (let v = 0; v < VARIANTS; v++) {
    const m = new THREE.InstancedMesh(makeRock(v + 1, 1), rockMat, per)
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    m.frustumCulled = false
    scene.add(m)
    meshes.push(m)
    for (let i = 0; i < per; i++) {
      const r = { m: v, i }
      spawn(r, true)
      rocks.push(r)
    }
  }

  // space dust (line streaks)
  const DUST = lowPower ? 120 : 300
  const dustPos = new Float32Array(DUST * 6)
  const dust = []
  const respawnDust = (d, anywhere) => {
    d.x = (Math.random() - 0.5) * 70
    d.y = (Math.random() - 0.5) * 44
    d.z = anywhere ? -200 + Math.random() * 210 : -200 - Math.random() * 20
  }
  for (let i = 0; i < DUST; i++) {
    const d = {}
    respawnDust(d, true)
    dust.push(d)
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dustMat = new THREE.LineBasicMaterial({ color: 0xbcd6ff, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
  const dustLines = new THREE.LineSegments(dustGeo, dustMat)
  dustLines.frustumCulled = false
  scene.add(dustLines)

  const state = { speed: reducedMotion ? 6 : 26, warp: 0, fov: 72, baseFov: 72 }

  /* ═════════════  LASER CANNONS  ═════════════ */
  const glowTex = (() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const g = c.getContext('2d')
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grd.addColorStop(0, 'rgba(255,255,255,1)')
    grd.addColorStop(0.25, 'rgba(255,190,140,0.9)')
    grd.addColorStop(0.55, 'rgba(255,80,40,0.35)')
    grd.addColorStop(1, 'rgba(255,40,20,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 64, 64)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  })()
  const gunMat = new THREE.MeshStandardMaterial({ color: 0x6b7683, metalness: 0.7, roughness: 0.34, emissive: 0x141a22 })
  const coilMat = new THREE.MeshBasicMaterial({ color: 0xff5040, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
  const gunGeos = [
    new THREE.BoxGeometry(0.46, 0.34, 1.15),
    new THREE.CylinderGeometry(0.075, 0.1, 1.6, 14),
    new THREE.TorusGeometry(0.12, 0.028, 8, 20),
    new THREE.BoxGeometry(0.2, 0.5, 0.5),
  ]
  const makeGun = (side) => {
    const g = new THREE.Group()
    const housing = new THREE.Mesh(gunGeos[0], gunMat)
    housing.position.z = 0.05
    const barrel = new THREE.Mesh(gunGeos[1], gunMat)
    barrel.rotation.x = Math.PI / 2
    barrel.position.z = 1.25
    const c1 = new THREE.Mesh(gunGeos[2], coilMat)
    c1.position.z = 0.85
    const c2 = new THREE.Mesh(gunGeos[2], coilMat)
    c2.position.z = 1.2
    const mount = new THREE.Mesh(gunGeos[3], gunMat)
    mount.position.set(side * 0.3, -0.25, -0.2)
    const tip = new THREE.Object3D()
    tip.position.z = 2.1
    const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff6a4a, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true }))
    flash.position.z = 2.15
    flash.scale.setScalar(0)
    const body = new THREE.Group()
    body.add(housing, barrel, c1, c2, mount, tip, flash)
    g.add(body)
    camera.add(g)
    return { g, body, tip, flash, recoil: 0, flashT: 0 }
  }
  const guns = [makeGun(-1), makeGun(1)]
  let viewBottom = -0.3 // NDC y of the dashboard's top edge (set from the DOM)
  const placeGuns = () => {
    const d = 4
    const halfH = d * Math.tan(THREE.MathUtils.degToRad(state.baseFov / 2))
    const halfW = halfH * camera.aspect
    const portrait = camera.aspect < 0.8
    const x = halfW * (portrait ? 0.6 : 0.72)
    // sit clearly above the panel (gun body extends ~0.15 NDC below its pivot)
    const y = Math.min(-0.04, viewBottom + (portrait ? 0.44 : 0.22)) * halfH
    guns[0].g.position.set(-x, y, -d)
    guns[1].g.position.set(x, y, -d)
    const sc = portrait ? 1.2 : 1
    guns.forEach((gn) => gn.g.scale.setScalar(sc))
  }

  // aim (normalized device coords)
  const aim = new THREE.Vector2(0, 0.3)
  const ray = new THREE.Raycaster()
  const aimPoint = new THREE.Vector3()
  const tmpV = new THREE.Vector3()
  const tmpC = new THREE.Vector3()

  /* ═════════════  BOLTS  ═════════════ */
  const boltGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 6)
  boltGeo.translate(0, 0.5, 0)
  const boltCore = new THREE.MeshBasicMaterial({ color: 0xffe2d8, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false })
  const boltGlow = new THREE.MeshBasicMaterial({ color: 0xff3020, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.55, depthWrite: false, fog: false })
  const BOLT_LEN = 5
  const BOLT_SPEED = 420
  const bolts = []
  for (let i = 0; i < 16; i++) {
    const m = new THREE.Group()
    const core = new THREE.Mesh(boltGeo, boltCore)
    const glow = new THREE.Mesh(boltGeo, boltGlow)
    glow.scale.set(3.2, 1, 3.2)
    m.add(core, glow)
    m.visible = false
    scene.add(m)
    bolts.push({ m, live: false, start: new THREE.Vector3(), dir: new THREE.Vector3(), dist: 0, travelled: 0, rock: null, gen: 0 })
  }
  const yAxis = new THREE.Vector3(0, 1, 0)

  /* ═════════════  EXPLOSIONS  ═════════════ */
  const CH = lowPower ? 60 : 120
  const chunkMesh = new THREE.InstancedMesh(new THREE.TetrahedronGeometry(1, 0), rockMat, CH)
  chunkMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  chunkMesh.frustumCulled = false
  scene.add(chunkMesh)
  const chunks = Array.from({ length: CH }, () => ({ life: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), rx: 0, ry: 0, sx: 0, sy: 0, size: 0 }))
  let chunkIdx = 0
  const SP = lowPower ? 160 : 360
  const sparkPos = new Float32Array(SP * 3)
  const sparkCol = new Float32Array(SP * 3)
  const sparks = Array.from({ length: SP }, () => ({ life: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), c: new THREE.Color() }))
  let sparkIdx = 0
  const sparkGeo = new THREE.BufferGeometry()
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3))
  sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkCol, 3))
  const sparkMat = new THREE.PointsMaterial({ size: 0.45, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true, map: glowTex, fog: false })
  const sparkPts = new THREE.Points(sparkGeo, sparkMat)
  sparkPts.frustumCulled = false
  scene.add(sparkPts)
  const flashes = Array.from({ length: 6 }, () => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb070, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }))
    sp.visible = false
    scene.add(sp)
    return { sp, life: 0, size: 1 }
  })
  let flashIdx = 0
  const boomLight = new THREE.PointLight(0xff8a50, 0, 60, 1.6)
  scene.add(boomLight)

  let score = 0
  const sparkPalette = [new THREE.Color('#fff2d0'), new THREE.Color('#ffb060'), new THREE.Color('#ff6030'), new THREE.Color('#9fcbff')]

  const explode = (r) => {
    const pos = new THREE.Vector3(r.x, r.y, r.z)
    const big = r.s > 3.2
    const nChunks = Math.min(14, 5 + Math.round(r.s * 2.2))
    for (let i = 0; i < nChunks; i++) {
      const c = chunks[chunkIdx++ % CH]
      c.life = 1
      c.p.copy(pos).addScaledVector(tmpV.randomDirection(), r.s * 0.4)
      c.v.copy(tmpV.randomDirection()).multiplyScalar(4 + Math.random() * 10 * Math.sqrt(r.s))
      c.v.z += 6
      c.size = r.s * (0.12 + Math.random() * 0.22)
      c.rx = Math.random() * 6
      c.ry = Math.random() * 6
      c.sx = (Math.random() - 0.5) * 8
      c.sy = (Math.random() - 0.5) * 8
    }
    const nSparks = Math.min(70, 24 + Math.round(r.s * 10))
    for (let i = 0; i < nSparks; i++) {
      const sk = sparks[sparkIdx++ % SP]
      sk.life = 1
      sk.p.copy(pos)
      sk.v.copy(tmpV.randomDirection()).multiplyScalar(6 + Math.random() * 22)
      sk.c.copy(sparkPalette[(Math.random() * sparkPalette.length) | 0])
    }
    const f = flashes[flashIdx++ % flashes.length]
    f.sp.position.copy(pos)
    f.size = 4 + r.s * 3.2
    f.life = 1
    f.sp.visible = true
    boomLight.position.copy(pos)
    boomLight.intensity = 60 + r.s * 30
    sfx.boom(r.s)
    score++
    if (onScore) onScore(score)
    // big rocks break into a smaller rock first; small ones are destroyed
    if (big) {
      r.s *= 0.5
      r.gen++
      r.vx *= 3
      r.vy *= 3
    } else {
      spawn(r, false)
    }
  }

  let lastShot = 0
  let gunTurn = 0
  const shoot = () => {
    if (state.warp > 0.02) return
    const now = performance.now()
    if (now - lastShot < 140) return
    lastShot = now

    ray.setFromCamera(aim, camera)
    const o = ray.ray.origin
    const d = ray.ray.direction
    // nearest rock along the aim ray (sphere test; touch gets a little aim assist)
    const assist = isTouch ? 1.45 : 1.12
    let best = null
    let bestT = Infinity
    for (const r of rocks) {
      tmpC.set(r.x, r.y, r.z).sub(o)
      const tc = tmpC.dot(d)
      if (tc < 3) continue
      const d2 = tmpC.lengthSq() - tc * tc
      const R = r.s * assist
      if (d2 > R * R) continue
      const th = tc - Math.sqrt(R * R - d2)
      if (th < bestT) {
        bestT = th
        best = r
      }
    }
    const target = new THREE.Vector3().copy(o).addScaledVector(d, best ? bestT : 300)

    const gun = guns[gunTurn++ % 2]
    gun.tip.getWorldPosition(tmpV)
    const b = bolts.find((x) => !x.live) || bolts[0]
    b.live = true
    b.start.copy(tmpV)
    b.dir.copy(target).sub(tmpV)
    b.dist = b.dir.length()
    b.dir.normalize()
    b.travelled = 0
    b.rock = best
    b.gen = best ? best.gen : 0
    b.m.visible = true
    b.m.quaternion.setFromUnitVectors(yAxis, b.dir)
    gun.recoil = 1
    gun.flashT = 1
    sfx.laser()
  }

  let w = 1
  let h = 1
  const resize = () => {
    w = window.innerWidth
    h = window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // portrait phones need a wider vertical field so the scene isn't cramped
    state.baseFov = w / h < 0.8 ? 92 : 72
    camera.updateProjectionMatrix()
    placeGuns()
  }
  resize()
  window.addEventListener('resize', resize)

  const mouse = { x: 0, y: 0 }
  const onMove = (e) => {
    mouse.x = (e.clientX / w - 0.5) * 2
    mouse.y = (e.clientY / h - 0.5) * 2
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  const dummy = new THREE.Object3D()
  let raf = 0
  let last = performance.now()
  let t = 0
  let slowFrames = 0
  let fastFrames = 0
  const loop = (now) => {
    raf = requestAnimationFrame(loop)
    const rawDt = (now - last) / 1000
    const dt = Math.min(rawDt, 0.05)
    last = now
    t += dt
    if (!document.hidden && rawDt < 0.25) {
      if (rawDt > 1 / 45) slowFrames++
      else if (rawDt < 1 / 57) fastFrames++
      if (slowFrames > 40 && pr > 0.6) {
        pr = Math.max(0.6, pr - 0.2)
        renderer.setPixelRatio(pr)
        renderer.setSize(w, h, false)
        slowFrames = fastFrames = 0
      } else if (fastFrames > 240 && pr < maxPR) {
        pr = Math.min(maxPR, pr + 0.1)
        renderer.setPixelRatio(pr)
        renderer.setSize(w, h, false)
        slowFrames = fastFrames = 0
      }
    }
    skyDraw.uWarp.value = state.warp

    const sp = state.speed
    // asteroids
    for (const r of rocks) {
      r.z += sp * dt
      r.x += r.drift * dt
      r.rx += r.vx * dt
      r.ry += r.vy * dt
      if (r.z > NEAR + r.s) spawn(r, false)
      dummy.position.set(r.x, r.y, r.z)
      dummy.rotation.set(r.rx, r.ry, 0)
      dummy.scale.setScalar(r.s)
      dummy.updateMatrix()
      meshes[r.m].setMatrixAt(r.i, dummy.matrix)
    }
    for (const m of meshes) m.instanceMatrix.needsUpdate = true

    // dust streaks: length grows with speed
    const len = 0.25 + sp * 0.03
    for (let i = 0; i < DUST; i++) {
      const d = dust[i]
      d.z += sp * 1.25 * dt
      if (d.z > 4) respawnDust(d, false)
      const o = i * 6
      dustPos[o] = d.x
      dustPos[o + 1] = d.y
      dustPos[o + 2] = d.z
      dustPos[o + 3] = d.x
      dustPos[o + 4] = d.y
      dustPos[o + 5] = d.z - len
    }
    dustGeo.attributes.position.needsUpdate = true
    dustMat.opacity = 0.35 + state.warp * 0.6

    // gentle banking + steering toward the pointer
    const calm = 1 - state.warp
    camera.rotation.z = (Math.sin(t * 0.35) * 0.04 - mouse.x * 0.05) * calm
    camera.rotation.y += ((-mouse.x * 0.05) * calm - camera.rotation.y) * 0.04
    camera.rotation.x += ((-mouse.y * 0.03 + Math.sin(t * 0.5) * 0.01) * calm - camera.rotation.x) * 0.04
    camera.position.y = Math.sin(t * 0.9) * 0.08 * calm
    camera.fov = state.baseFov + (state.fov - 72)
    camera.updateProjectionMatrix()

    // ── guns follow the aim, with recoil + muzzle flash
    ray.setFromCamera(aim, camera)
    aimPoint.copy(ray.ray.origin).addScaledVector(ray.ray.direction, 140)
    for (const gn of guns) {
      gn.g.lookAt(aimPoint)
      gn.recoil = Math.max(0, gn.recoil - dt * 7)
      gn.body.position.z = -gn.recoil * 0.35
      gn.flashT = Math.max(0, gn.flashT - dt * 12)
      gn.flash.scale.setScalar(gn.flashT * 1.6)
    }

    // ── bolts
    for (const b of bolts) {
      if (!b.live) continue
      b.travelled += BOLT_SPEED * dt
      const head = Math.min(b.travelled, b.dist)
      const tail = Math.max(0, head - BOLT_LEN)
      b.m.position.copy(b.start).addScaledVector(b.dir, tail)
      b.m.scale.set(1, Math.max(0.01, head - tail), 1)
      if (b.travelled >= b.dist) {
        b.live = false
        b.m.visible = false
        if (b.rock && b.rock.gen === b.gen) explode(b.rock)
      }
    }

    // ── rock chunks
    for (let i = 0; i < CH; i++) {
      const c = chunks[i]
      if (c.life > 0) {
        c.life -= dt * 0.9
        c.p.addScaledVector(c.v, dt)
        c.p.z += sp * dt * 0.6
        c.rx += c.sx * dt
        c.ry += c.sy * dt
        dummy.position.copy(c.p)
        dummy.rotation.set(c.rx, c.ry, 0)
        dummy.scale.setScalar(Math.max(0, c.size * Math.min(1, c.life * 2)))
      } else {
        dummy.scale.setScalar(0)
      }
      dummy.updateMatrix()
      chunkMesh.setMatrixAt(i, dummy.matrix)
    }
    chunkMesh.instanceMatrix.needsUpdate = true

    // ── sparks
    for (let i = 0; i < SP; i++) {
      const sk = sparks[i]
      const o = i * 3
      if (sk.life > 0) {
        sk.life -= dt * 1.6
        sk.v.multiplyScalar(1 - dt * 1.8)
        sk.p.addScaledVector(sk.v, dt)
        const k = Math.max(0, sk.life)
        sparkPos[o] = sk.p.x
        sparkPos[o + 1] = sk.p.y
        sparkPos[o + 2] = sk.p.z
        sparkCol[o] = sk.c.r * k
        sparkCol[o + 1] = sk.c.g * k
        sparkCol[o + 2] = sk.c.b * k
      } else if (sparkCol[o] || sparkCol[o + 1] || sparkCol[o + 2]) {
        sparkCol[o] = sparkCol[o + 1] = sparkCol[o + 2] = 0
      }
    }
    sparkGeo.attributes.position.needsUpdate = true
    sparkGeo.attributes.color.needsUpdate = true

    // ── flashes + light
    for (const f of flashes) {
      if (!f.sp.visible) continue
      f.life -= dt * 3.2
      if (f.life <= 0) {
        f.sp.visible = false
        continue
      }
      f.sp.scale.setScalar(f.size * (1.4 - f.life * 0.6))
      f.sp.material.opacity = f.life
    }
    boomLight.intensity *= Math.max(0, 1 - dt * 7)

    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(loop)

  return {
    setAim(nx, ny) {
      aim.set(nx, ny)
    },
    setViewBottom(ndcY) {
      viewBottom = ndcY
      placeGuns()
    },
    fire(nx, ny) {
      if (nx !== undefined) aim.set(nx, ny)
      shoot()
    },
    warp(duration = 1.6) {
      gsap.to(state, { speed: 950, duration, ease: 'power3.in' })
      gsap.to(state, { warp: 1, duration, ease: 'power2.in' })
      gsap.to(state, { fov: 112, duration, ease: 'power3.in' })
    },
    dispose() {
      cancelAnimationFrame(raf)
      gsap.killTweensOf(state)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      meshes.forEach((m) => m.geometry.dispose())
      rockMat.dispose()
      gunGeos.forEach((g) => g.dispose())
      gunMat.dispose()
      coilMat.dispose()
      boltGeo.dispose()
      boltCore.dispose()
      boltGlow.dispose()
      chunkMesh.geometry.dispose()
      sparkGeo.dispose()
      sparkMat.dispose()
      glowTex.dispose()
      dustGeo.dispose()
      dustMat.dispose()
      sky.geometry.dispose()
      sky.material.dispose()
      cubeRT.dispose()
      renderer.dispose()
    },
  }
}
