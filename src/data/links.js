// ─────────────────────────────────────────────────────────────
//  YOUR CONTACT LINKS — fill these in before deploying.
//  Leave a value as '' to hide that link everywhere on the site.
// ─────────────────────────────────────────────────────────────
export const links = {
  email: '',        // e.g. 'you@example.com'
  linkedin: '',     // e.g. 'https://www.linkedin.com/in/your-handle'
  github: '',       // e.g. 'https://github.com/your-handle'
  tryhackme: '',    // optional
  hackthebox: '',   // optional
  pixelcanvas: '',  // optional — Pixel Canvas website
  resume: '',       // optional — e.g. '/resume.pdf' (put the file in /public)
}

export const linkList = [
  { key: 'email', label: 'Email', cmd: 'mail' },
  { key: 'linkedin', label: 'LinkedIn', cmd: 'linkedin' },
  { key: 'github', label: 'GitHub', cmd: 'github' },
  { key: 'tryhackme', label: 'TryHackMe', cmd: 'thm' },
  { key: 'hackthebox', label: 'HackTheBox', cmd: 'htb' },
  { key: 'pixelcanvas', label: 'Pixel Canvas', cmd: 'pixelcanvas' },
  { key: 'resume', label: 'Resume', cmd: 'resume' },
]
  .filter((l) => links[l.key])
  .map((l) => ({ ...l, href: l.key === 'email' ? `mailto:${links.email}` : links[l.key] }))
