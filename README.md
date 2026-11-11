# Muhammad Shahzaib Khateeb — Portfolio

A dual-identity portfolio. The day/night toggle switches between:

- 🌙 **Hacker mode** — cybersecurity profile, terminal UI, matrix rain, 3D network globe
- ☀️ **Developer mode** — software projects, clean modern UI, 3D `</>` particle symbol

On switch, the portrait plays a suit → hoodie transformation (GPU shader with glitch/pixelate effects),
and 6,000 particles explode and rebuild into the other shape.

Built with **React + Vite + Three.js + GSAP**. Automatically lowers quality on phones / low-end devices
and respects `prefers-reduced-motion`.

## Run locally

```bash
npm install
npm run dev
```

## Edit content

| What | File |
|---|---|
| Contact links (email, LinkedIn, GitHub, resume…) | `src/data/links.js` |
| All text, projects, skills, experience | `src/data/content.js` |
| Portrait frames (suit → hoodie) | `public/portrait/f00.webp … f45.webp` |

## Deploy

```bash
npm run build
```

Upload the `dist/` folder, or import the GitHub repo in **Vercel** / **Netlify**
(framework: Vite, build command `npm run build`, output `dist`).
