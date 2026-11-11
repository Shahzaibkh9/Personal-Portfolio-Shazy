import { useEffect, useRef, useState } from 'react'
import { NAME, cyber, education } from '../data/content'
import { linkList } from '../data/links'

const HELP = [
  'available commands:',
  '  whoami      — who is this guy',
  '  about       — short bio',
  '  skills      — security knowledge',
  '  research    — research interests',
  '  experience  — current role',
  '  education   — degree & certs',
  '  contact     — ways to reach me',
  '  dev         — switch to developer mode',
  '  clear       — clear the screen',
]

function run(cmd, onToggle) {
  const c = cmd.trim().toLowerCase()
  const [base] = c.split(/\s+/)
  switch (base) {
    case '':
      return []
    case 'help':
    case '?':
      return HELP
    case 'whoami':
      return [NAME, cyber.roles.join(' | ')]
    case 'about':
      return [cyber.about[1], cyber.about[2]]
    case 'skills':
      return cyber.knowledge.map((k) => `[${k.title}] ${k.items.join(', ')}`)
    case 'research':
      return cyber.research.map((r) => `→ ${r.title}`)
    case 'experience':
      return ['Information Security Intern @ Pakistan Stock Exchange (PSX)', 'October 2026 – Present · Dept: Information Security']
    case 'education':
      return [`${education.degree}`, `${education.school}, ${education.place}`, 'Cisco Python Essentials 1 · Python Basics (Aptech, 2022)']
    case 'contact':
    case 'socials':
      return linkList.length ? linkList.map((l) => ({ text: `${l.label.padEnd(12)} ${l.href.replace('mailto:', '')}`, href: l.href })) : ['contact links coming soon.']
    case 'dev':
    case 'mode':
    case 'exit':
      setTimeout(onToggle, 250)
      return ['switching identity…']
    case 'clear':
      return null
    case 'sudo':
      return ['nice try. this incident will be reported. 🚨']
    case 'ls':
      return ['about.txt  research/  experience.log  contact.sh  secrets/']
    case 'cd':
    case 'cat':
      if (c.includes('secret')) return ['permission denied: secrets are for people who say hi first.']
      return [`${base}: try "help" for the list of commands`]
    case 'hack':
      return ['ethical hacking only. with permission. always. 🛡️']
    case 'date':
      return [new Date().toString()]
    default:
      return [`command not found: ${base}. type "help"`]
  }
}

export default function Terminal({ onToggle }) {
  const [hist, setHist] = useState([
    { type: 'out', text: 'shahzaib-sh v1.0 — type "help" to get started.' },
  ])
  const [val, setVal] = useState('')
  const [past, setPast] = useState([])
  const [pi, setPi] = useState(-1)
  const body = useRef(null)
  const input = useRef(null)

  useEffect(() => {
    if (body.current) body.current.scrollTop = body.current.scrollHeight
  }, [hist])

  const exec = (cmd) => {
    const out = run(cmd, onToggle)
    if (out === null) {
      setHist([])
    } else {
      setHist((h) => [...h, { type: 'in', text: cmd }, ...out.map((o) => (typeof o === 'string' ? { type: 'out', text: o } : { type: 'out', ...o }))])
    }
    if (cmd.trim()) setPast((p) => [cmd, ...p].slice(0, 30))
    setPi(-1)
    setVal('')
  }

  const onKey = (e) => {
    if (e.key === 'Enter') exec(val)
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const n = Math.min(pi + 1, past.length - 1)
      if (past[n] !== undefined) {
        setPi(n)
        setVal(past[n])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const n = pi - 1
      setPi(n)
      setVal(n >= 0 ? past[n] : '')
    }
  }

  return (
    <div className="term" onClick={() => input.current && input.current.focus({ preventScroll: true })}>
      <div className="window-bar">
        <span className="dot r" />
        <span className="dot y" />
        <span className="dot g" />
        <span className="window-title">contact.sh — shahzaib@kali</span>
      </div>
      <div className="term-body" ref={body}>
        {hist.map((l, i) =>
          l.type === 'in' ? (
            <div key={i} className="term-line">
              <span className="p-user">guest@shahzaib</span>:<span className="p-path">~</span>$ {l.text}
            </div>
          ) : l.href ? (
            <a key={i} className="term-out term-link" href={l.href} target="_blank" rel="noreferrer">
              {l.text}
            </a>
          ) : (
            <div key={i} className="term-out">
              {l.text}
            </div>
          ),
        )}
        <div className="term-line term-input">
          <span className="p-user">guest@shahzaib</span>:<span className="p-path">~</span>$&nbsp;
          <input
            ref={input}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={onKey}
            spellCheck="false"
            autoComplete="off"
            autoCapitalize="off"
            aria-label="Terminal command"
          />
        </div>
      </div>
      <div className="term-chips">
        {['help', 'whoami', 'contact', 'research', 'dev'].map((c) => (
          <button key={c} onClick={(e) => (e.stopPropagation(), exec(c))}>
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
