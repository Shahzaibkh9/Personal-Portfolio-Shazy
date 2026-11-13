import { certifications, dev, education } from '../data/content'
import { links, linkList } from '../data/links'
import ProjectArt from './ProjectArt'
import Terminal from './Terminal'
import { Icon, SectionHead, SocialLinks, TagSphere, TiltCard } from './ui'

const M = 'dev'

function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <SectionHead mode={M} index={1} title="About" sub="Code, AI and product thinking." />
        <div className="about-grid">
          <div className="about-text reveal">
            {dev.about.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="belief">“{dev.belief}”</p>
          </div>
          <TiltCard className="card pc-card reveal" max={8}>
            <div className="pc-logo">
              <Icon name="layers" size={30} />
            </div>
            <span className="eyebrow">Founder</span>
            <h3>Pixel Canvas</h3>
            <p>{dev.pixelCanvas}</p>
            <div className="tags">
              {['Software', 'AI', 'Automation', 'Digital Experiences'].map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
            {links.pixelcanvas && (
              <a href={links.pixelcanvas} target="_blank" rel="noreferrer" className="text-link">
                Visit Pixel Canvas <Icon name="ext" size={14} />
              </a>
            )}
          </TiltCard>
        </div>
      </div>
    </section>
  )
}

function Skills() {
  return (
    <section id="skills" className="section">
      <div className="container">
        <SectionHead mode={M} index={2} title="Expertise" sub="The tools I build with." />
        <div className="skills-grid">
          <div className="card-grid two">
            {dev.expertise.map((g, i) => (
              <TiltCard key={g.title} className="card skill-card reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="skill-ico">
                  <Icon name={g.icon} size={22} />
                </div>
                <h3>{g.title}</h3>
                <div className="tags">
                  {g.items.map((x) => (
                    <span key={x} className="tag">
                      {x}
                    </span>
                  ))}
                </div>
              </TiltCard>
            ))}
          </div>
          <div className="sphere-box reveal">
            <TagSphere tags={dev.cloud} />
            <span className="sphere-hint">Hover to spin</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Projects() {
  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionHead mode={M} index={3} title="Selected Projects" sub="Ideas turned into working products." />
        <div className="projects">
          {dev.projects.map((p, i) => (
            <TiltCard key={p.title} className={`card project reveal art-${p.art}`} max={6} style={{ transitionDelay: `${(i % 2) * 100}ms` }}>
              <div className="project-art">
                <ProjectArt type={p.art} />
                <span className={`kind ${p.url ? 'live' : ''}`}>
                  {p.url && <span className="pulse" />} {p.kind}
                </span>
              </div>
              <div className="project-body">
                <span className="project-num">0{i + 1}</span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <ul className="feat">
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <div className="tags">
                  {p.tech.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                {p.url && (
                  <a href={p.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                    Visit live site <Icon name="ext" size={14} />
                  </a>
                )}
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}

function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container">
        <SectionHead mode={M} index={4} title="Experience" sub="Building, founding and teaching." />
        <div className="timeline">
          {dev.experience.map((e, i) => (
            <div key={e.role + e.org} className="tl-item reveal" style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="tl-dot" />
              <TiltCard className="card" max={4}>
                <span className="eyebrow">{e.period}</span>
                <h3>
                  {e.role} <span className="muted">· {e.org}</span>
                </h3>
                <p>{e.summary}</p>
                {e.points.length > 0 && (
                  <ul className="feat">
                    {e.points.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                )}
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Approach() {
  const icons = ['target', 'tools', 'bulb']
  return (
    <section className="section">
      <div className="container">
        <SectionHead mode={M} index={5} title="My Approach" sub="Three priorities behind everything I build." />
        <div className="card-grid three">
          {dev.approach.map((a, i) => (
            <TiltCard key={a.title} className="card approach reveal" style={{ transitionDelay: `${i * 100}ms` }}>
              <span className="approach-num">{i + 1}</span>
              <div className="skill-ico">
                <Icon name={icons[i]} size={22} />
              </div>
              <h3>{a.title}</h3>
              <p>{a.body}</p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}

function Education() {
  return (
    <section id="education" className="section">
      <div className="container">
        <SectionHead mode={M} index={6} title="Education" sub="Education & certifications." />
        <div className="card-grid two">
          <TiltCard className="card reveal" max={5}>
            <div className="skill-ico">
              <Icon name="cap" size={22} />
            </div>
            <h3>{education.degree}</h3>
            <p className="accent">{education.school}</p>
            <p className="muted">
              {education.place} · {education.note}
            </p>
          </TiltCard>
          <TiltCard className="card reveal" max={5}>
            <div className="skill-ico">
              <Icon name="award" size={22} />
            </div>
            <h3>Certifications</h3>
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
            </ul>
          </TiltCard>
        </div>
      </div>
    </section>
  )
}

function Contact({ onToggle }) {
  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="cta-card has-term reveal">
          <div className="cta-copy">
            <span className="eyebrow">07 — Contact</span>
            <h2>Let's work together.</h2>
            <p>{dev.connect}</p>
            <p className="cta-line">{dev.connectLine}</p>
            <SocialLinks links={linkList} mode="dev" />
          </div>
          <Terminal variant="mac" onToggle={onToggle} />
        </div>
      </div>
    </section>
  )
}

export default function DevSections({ onToggle }) {
  return (
    <main className="mode-content">
      <About />
      <Skills />
      <Projects />
      <Experience />
      <Approach />
      <Education />
      <Contact onToggle={onToggle} />
    </main>
  )
}
