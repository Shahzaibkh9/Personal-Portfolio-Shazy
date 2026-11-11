import { useState } from 'react'
import { certifications, cyber, education } from '../data/content'
import { linkList } from '../data/links'
import Terminal from './Terminal'
import { Icon, SectionHead, TagSphere, TiltCard, Window } from './ui'

const M = 'hacker'

function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <SectionHead mode={M} index={1} hackTitle="cat about.txt" sub="who I am & why security" />
        <div className="about-grid">
          <Window title="about.txt — bash" className="reveal">
            <p className="cmd">
              <span className="p-user">root@shahzaib</span>:<span className="p-path">~</span>$ cat about.txt
            </p>
            {cyber.about.map((p, i) => (
              <p key={i} className="out">
                {p}
              </p>
            ))}
          </Window>
          <Window title="profile.json" className="reveal json-win" style={{ transitionDelay: '120ms' }}>
            <pre className="json">
              {'{\n'}
              <J k="name" v="Muhammad Shahzaib Khateeb" />
              <J k="location" v="Karachi, Pakistan" />
              <J k="role" v="Information Security Intern" />
              <J k="org" v="Pakistan Stock Exchange" />
              <J k="education" v="BS Computer Science @ FUUAST" />
              <span className="j-k">  "focus"</span>: [{'\n'}
              {['VAPT', 'Web App Security', 'SOC', 'AI Security'].map((f, i, a) => (
                <span key={f}>
                  {'    '}
                  <span className="j-s">"{f}"</span>
                  {i < a.length - 1 ? ',' : ''}
                  {'\n'}
                </span>
              ))}
              {'  ],\n'}
              <span className="j-k">  "status"</span>: <span className="j-b">"learning_every_day"</span>
              {'\n}'}
            </pre>
          </Window>
        </div>
      </div>
    </section>
  )
}

const J = ({ k, v }) => (
  <>
    <span className="j-k">  "{k}"</span>: <span className="j-s">"{v}"</span>,{'\n'}
  </>
)

function Interests() {
  return (
    <section id="interests" className="section">
      <div className="container">
        <SectionHead mode={M} index={2} hackTitle="ls ./areas_of_interest" sub="where offense meets defense" />
        <div className="card-grid four">
          {cyber.interests.map((it, i) => (
            <TiltCard key={it.title} className="card reveal" style={{ transitionDelay: `${i * 90}ms` }}>
              <div className="card-top">
                <span className="card-idx">0{i + 1}.</span>
                <Icon name={it.icon} size={26} className="card-ico" />
              </div>
              <h3>{it.title}</h3>
              <ul className="list-arrow">
                {it.items.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}

function Experience() {
  const e = cyber.experience
  return (
    <section id="experience" className="section">
      <div className="container">
        <SectionHead mode={M} index={3} hackTitle="tail -f experience.log" sub="professional experience" />
        <TiltCard className="card exp-card reveal" max={4}>
          <div className="exp-head">
            <div>
              <div className="log-ts">[{e.period.toUpperCase()}]</div>
              <h3>
                {e.role} <span className="accent">@ {e.org}</span>
              </h3>
              <div className="muted">Department: {e.dept}</div>
            </div>
            <span className="badge live">
              <span className="pulse" /> ACTIVE
            </span>
          </div>
          <p>{e.summary}</p>
          <div className="exp-cols">
            <div>
              <div className="mini-head">// areas of learning & exposure</div>
              <ul className="list-plus">
                {e.learning.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="objective">
              <div className="mini-head">// objective</div>
              <p>{e.objective}</p>
            </div>
          </div>
        </TiltCard>
      </div>
    </section>
  )
}

function Arsenal() {
  return (
    <section id="skills" className="section">
      <div className="container">
        <SectionHead mode={M} index={4} hackTitle="nmap -sV ./skills" sub="technical knowledge" />
        <div className="skills-grid">
          <div className="scan">
            {cyber.knowledge.map((k, i) => (
              <div key={k.title} className="scan-group reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="scan-title">
                  <span className="accent">PORT {(i + 1) * 1000 + 443}/tcp</span> open — {k.title}
                </div>
                <div className="tags">
                  {k.items.map((x) => (
                    <span key={x} className="tag">
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="sphere-box reveal">
            <TagSphere tags={cyber.cloud} />
            <span className="sphere-hint">drag your cursor over the sphere</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Research() {
  const [open, setOpen] = useState(0)
  return (
    <section id="research" className="section">
      <div className="container">
        <SectionHead mode={M} index={5} hackTitle="ls ./research" sub="security research interests" />
        <div className="files">
          {cyber.research.map((r, i) => (
            <div key={r.file} className={`file reveal ${open === i ? 'open' : ''}`} style={{ transitionDelay: `${i * 80}ms` }}>
              <button className="file-head" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <Icon name="file" size={18} />
                <span className="file-name">research/{r.file}</span>
                <span className="file-title">{r.title}</span>
                <Icon name="chev" size={18} className="file-chev" />
              </button>
              <div className="file-body">
                <div>
                  <p>
                    <span className="accent"># </span>
                    {r.title}
                  </p>
                  <p className="muted">{r.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Philosophy() {
  return (
    <section className="section philosophy">
      <div className="container">
        <div className="quote reveal">
          <span className="quote-label">// security_philosophy</span>
          <blockquote className="glitch-soft">{cyber.philosophy[0]}</blockquote>
          <p className="quote-sub accent">&gt; {cyber.philosophy[1]}</p>
        </div>
      </div>
    </section>
  )
}

function EduFuture() {
  return (
    <section id="education" className="section">
      <div className="container">
        <SectionHead mode={M} index={6} hackTitle="./education && ./roadmap" sub="education, certifications & future direction" />
        <div className="two-col">
          <div className="stack">
            <TiltCard className="card reveal" max={5}>
              <div className="card-top">
                <span className="card-idx">EDU</span>
                <Icon name="cap" size={26} className="card-ico" />
              </div>
              <h3>{education.degree}</h3>
              <p className="accent">{education.school}</p>
              <p className="muted">
                {education.place} · {education.note}
              </p>
            </TiltCard>
            <TiltCard className="card reveal" max={5}>
              <div className="card-top">
                <span className="card-idx">CERT</span>
                <Icon name="award" size={26} className="card-ico" />
              </div>
              <ul className="cert-list">
                {certifications.map((c) => (
                  <li key={c.name}>
                    <strong>{c.name}</strong>
                    <span className="muted">
                      {c.org}
                      {c.year ? `, ${c.year}` : ''}
                    </span>
                  </li>
                ))}
                <li>
                  <strong>Independent learning</strong>
                  <span className="muted">InfoSec, application security & cybersecurity fundamentals</span>
                </li>
              </ul>
            </TiltCard>
          </div>
          <div className="card roadmap reveal">
            <div className="mini-head">// future_direction.roadmap</div>
            <ol>
              {cyber.future.items.map((x, i) => (
                <li key={x}>
                  <span className="rm-node">{String(i + 1).padStart(2, '0')}</span>
                  <span>{x}</span>
                </li>
              ))}
            </ol>
            <p className="muted">{cyber.future.aim}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Contact({ onToggle }) {
  return (
    <section id="contact" className="section">
      <div className="container">
        <SectionHead mode={M} index={7} hackTitle="./connect.sh" sub="let's connect" />
        <div className="contact-grid">
          <div className="reveal">
            <p className="lead">{cyber.connect}</p>
            <div className="link-list">
              {linkList.map((l) => (
                <a key={l.key} href={l.href} target="_blank" rel="noreferrer" className="btn btn-ghost">
                  ./{l.cmd} <Icon name="ext" size={14} />
                </a>
              ))}
            </div>
          </div>
          <div className="reveal">
            <Terminal variant="kali" onToggle={onToggle} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HackerSections({ onToggle }) {
  return (
    <main className="mode-content">
      <About />
      <Interests />
      <Experience />
      <Arsenal />
      <Research />
      <Philosophy />
      <EduFuture />
      <Contact onToggle={onToggle} />
    </main>
  )
}
