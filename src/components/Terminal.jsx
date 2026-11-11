import { useEffect, useRef, useState } from 'react'
import { NAME, certifications, cyber, dev, education } from '../data/content'
import { linkList } from '../data/links'

/*
 * Interactive terminal.
 *   variant="kali" → hacker mode, styled like a Kali Linux terminal window
 *   variant="mac"  → developer mode, styled like macOS Terminal
 */

const contactLines = () =>
  linkList.length
    ? linkList.map((l) => ({ text: `${l.label.padEnd(12)} ${l.href.replace('mailto:', '')}`, href: l.href }))
    : ['contact links coming soon.']

const eduLines = () => [
  education.degree,
  `${education.school}, ${education.place}`,
  ...certifications.map((c) => `${c.name} — ${c.org}${c.year ? `, ${c.year}` : ''}`),
]

const COMMANDS = {
  kali: {
    help: () => [
      'available commands:',
      '  whoami      who is this guy',
      '  about       short bio',
      '  skills      security knowledge',
      '  research    research interests',
      '  experience  current role',
      '  education   degree & certs',
      '  contact     ways to reach me',
      '  dev         switch to developer mode',
      '  clear       clear the screen',
    ],
    whoami: () => [NAME, cyber.roles.join(' | ')],
    about: () => [cyber.about[1], cyber.about[2]],
    skills: () => cyber.knowledge.map((k) => `[${k.title}] ${k.items.join(', ')}`),
    research: () => cyber.research.map((r) => `→ ${r.title}`),
    experience: () => [`${cyber.experience.role} @ ${cyber.experience.org}`, `${cyber.experience.period} · Dept: ${cyber.experience.dept}`],
    education: eduLines,
    contact: contactLines,
    sudo: () => ['nice try. this incident will be reported. 🚨'],
    ls: () => ['about.txt  research/  experience.log  contact.sh  secrets/'],
    hack: () => ['ethical hacking only. with permission. always. 🛡️'],
  },
  mac: {
    help: () => [
      'Commands:',
      '  whoami      who I am',
      '  about       a little about me',
      '  projects    things I have built',
      '  skills      what I work with',
      '  experience  where I have worked',
      '  education   degree & certificates',
      '  contact     how to reach me',
      '  hacker      switch to hacker mode',
      '  clear       clear the screen',
    ],
    whoami: () => [NAME, dev.roles.join(' · ')],
    about: () => [dev.about[0], dev.about[2]],
    projects: () =>
      dev.projects.flatMap((p) => [
        p.url ? { text: `● ${p.title}  →  ${p.url.replace('https://', '')}`, href: p.url } : `○ ${p.title}  (${p.kind.toLowerCase()})`,
      ]),
    skills: () => dev.expertise.map((g) => `${g.title}: ${g.items.join(', ')}`),
    experience: () => dev.experience.map((e) => `${e.role}, ${e.org} — ${e.period}`),
    education: eduLines,
    contact: contactLines,
    sudo: () => ['Password: ********', 'Sorry, try again. (just kidding — say hi with "contact")'],
    ls: () => ['About.md   Projects/   Skills.json   Contact.txt'],
  },
}

const SWITCH = { kali: ['dev', 'mode', 'exit'], mac: ['hacker', 'mode', 'exit'] }
const CHIPS = { kali: ['help', 'whoami', 'contact', 'research', 'dev'], mac: ['help', 'whoami', 'projects', 'contact', 'hacker'] }

function Prompt({ variant, cmd }) {
  if (variant === 'kali') {
    return (
      <div className="term-line">
        <div>
          <span className="k-frame">┌──(</span>
          <span className="k-user">guest㉿shahzaib</span>
          <span className="k-frame">)-[</span>
          <span className="k-path">~</span>
          <span className="k-frame">]</span>
        </div>
        <div>
          <span className="k-frame">└─</span>
          <span className="k-user">$</span> {cmd}
        </div>
      </div>
    )
  }
  return (
    <div className="term-line">
      <span className="m-prompt">guest@shahzaib ~ %</span> {cmd}
    </div>
  )
}

function today() {
  const d = new Date()
  return d.toDateString() + ' ' + d.toTimeString().slice(0, 8)
}

export default function Terminal({ onToggle, variant = 'kali' }) {
  const [hist, setHist] = useState(() =>
    variant === 'kali'
      ? [{ type: 'out', text: 'shahzaib-sh v1.0 — type "help" to get started.' }]
      : [
          { type: 'out', text: `Last login: ${today()} on ttys000` },
          { type: 'out', text: 'Type "help" to see what this terminal can do.' },
        ],
  )
  const [val, setVal] = useState('')
  const [past, setPast] = useState([])
  const [pi, setPi] = useState(-1)
  const body = useRef(null)
  const input = useRef(null)

  useEffect(() => {
    if (body.current) body.current.scrollTop = body.current.scrollHeight
  }, [hist])

  const run = (cmd) => {
    const c = cmd.trim().toLowerCase()
    const base = c.split(/\s+/)[0]
    if (!base) return []
    if (base === 'clear') return null
    if (base === 'date') return [new Date().toString()]
    if (SWITCH[variant].includes(base)) {
      setTimeout(onToggle, 250)
      return [variant === 'kali' ? 'switching identity…' : 'Switching to hacker mode…']
    }
    if ((base === 'cat' || base === 'cd') && c.includes('secret')) return ['permission denied: secrets are for people who say hi first.']
    const fn = COMMANDS[variant][base === '?' ? 'help' : base === 'socials' ? 'contact' : base]
    if (fn) return fn()
    return variant === 'kali' ? [`command not found: ${base}. type "help"`] : [`zsh: command not found: ${base}`]
  }

  const exec = (cmd) => {
    const out = run(cmd)
    if (out === null) setHist([])
    else setHist((h) => [...h, { type: 'in', text: cmd }, ...out.map((o) => (typeof o === 'string' ? { type: 'out', text: o } : { type: 'out', ...o }))])
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

  const kali = variant === 'kali'
  return (
    <div className={`term ${variant}`} onClick={() => input.current && input.current.focus({ preventScroll: true })}>
      {kali ? (
        <>
          <div className="k-bar">
            <span className="k-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="4" width="19" height="16" rx="2" />
                <path d="M7 10l3 2.5L7 15M12.5 15H17" />
              </svg>
            </span>
            <span className="k-title">guest@shahzaib: ~</span>
            <span className="k-controls" aria-hidden="true">
              <i className="k-min" />
              <i className="k-max" />
              <i className="k-close" />
            </span>
          </div>
          <div className="k-menu" aria-hidden="true">
            <span>File</span>
            <span>Actions</span>
            <span>Edit</span>
            <span>View</span>
            <span>Help</span>
          </div>
        </>
      ) : (
        <div className="m-bar">
          <span className="m-lights" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="m-title">
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <path d="M1.5 3.5h5l1.5 1.5h6.5v8h-13z" fill="#7aa7e0" />
            </svg>
            guest — -zsh — 80×24
          </span>
        </div>
      )}

      <div className="term-body" ref={body}>
        {hist.map((l, i) =>
          l.type === 'in' ? (
            <Prompt key={i} variant={variant} cmd={l.text} />
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
        <div className="term-input">
          {kali ? (
            <>
              <div>
                <span className="k-frame">┌──(</span>
                <span className="k-user">guest㉿shahzaib</span>
                <span className="k-frame">)-[</span>
                <span className="k-path">~</span>
                <span className="k-frame">]</span>
              </div>
              <div className="term-input-row">
                <span className="k-frame">└─</span>
                <span className="k-user">$</span>&nbsp;
                <TermInput input={input} val={val} setVal={setVal} onKey={onKey} />
              </div>
            </>
          ) : (
            <div className="term-input-row">
              <span className="m-prompt">guest@shahzaib ~ %</span>&nbsp;
              <TermInput input={input} val={val} setVal={setVal} onKey={onKey} />
            </div>
          )}
        </div>
      </div>
      <div className="term-chips">
        {CHIPS[variant].map((c) => (
          <button key={c} onClick={(e) => (e.stopPropagation(), exec(c))}>
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}

function TermInput({ input, val, setVal, onKey }) {
  return (
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
  )
}
