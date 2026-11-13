// ─────────────────────────────────────────────────────────────
//  YOUR CONTACT LINKS — fill these in before deploying.
//  Leave a value as '' to hide that link everywhere on the site.
// ─────────────────────────────────────────────────────────────
export const links = {
  email: 'shahzaibkhateeb1@gmail.com',
  linkedin: 'https://www.linkedin.com/in/muhammad-shahzaib-khateeb/',
  instagram: 'https://www.instagram.com/shahzaibkh9/',
  github: '',       // e.g. 'https://github.com/your-handle'
  tryhackme: '',    // optional
  hackthebox: '',   // optional
  pixelcanvas: '',  // optional — Pixel Canvas website
  resume: '',       // optional — e.g. '/resume.pdf' (put the file in /public)
}

export const linkList = [
  { key: 'email', label: 'Email', cmd: 'mail' },
  { key: 'linkedin', label: 'LinkedIn', cmd: 'linkedin' },
  { key: 'instagram', label: 'Instagram', cmd: 'instagram' },
  { key: 'github', label: 'GitHub', cmd: 'github' },
  { key: 'tryhackme', label: 'TryHackMe', cmd: 'thm' },
  { key: 'hackthebox', label: 'HackTheBox', cmd: 'htb' },
  { key: 'pixelcanvas', label: 'Pixel Canvas', cmd: 'pixelcanvas' },
  { key: 'resume', label: 'Resume', cmd: 'resume' },
]
  .filter((l) => links[l.key])
  .map((l) => ({ ...l, href: l.key === 'email' ? `mailto:${links.email}` : links[l.key] }))
