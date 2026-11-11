import { certifications, dev, education } from '../data/content'
import { links, linkList } from '../data/links'

const Label = ({ n, children }) => (
  <div className="d-label">
    <span>{n}</span>
    {children}
  </div>
)

const host = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

function About() {
  return (
    <section id="about" className="d-sec">
      <div className="container d-grid">
        <Label n="01">About</Label>
        <div className="d-body reveal">
          <p className="d-big">{dev.about[0]}</p>
          <div className="d-cols">
            {dev.about.slice(1).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <aside className="d-aside">
            <div>
              <div className="d-mono">Founder</div>
              <h3>Pixel Canvas</h3>
            </div>
            <div>
              <p>{dev.pixelCanvas}</p>
              <p className="d-mono">Software · AI · Automation · Branding</p>
              {links.pixelcanvas && (
                <a href={links.pixelcanvas} target="_blank" rel="noreferrer" className="d-link">
                  Visit Pixel Canvas ↗
                </a>
              )}
            </div>
          </aside>
          <p className="d-pull">{dev.belief}</p>
        </div>
      </div>
    </section>
  )
}

function Work() {
  return (
    <section id="projects" className="d-sec">
      <div className="container d-grid">
        <Label n="02">Selected work</Label>
        <div className="d-body">
          <h2 className="d-h2 reveal">
            A few things I’ve <em>built</em> lately.
          </h2>
          <div className="d-projects">
            {dev.projects.map((p, i) => (
              <article key={p.title} className="d-project reveal">
                <div className="d-p-num">{String(i + 1).padStart(2, '0')}</div>
                <div>
                  <div className="d-p-meta d-mono">
                    <span className={`d-status ${p.url ? 'live' : ''}`}>{p.kind}</span>
                  </div>
                  <h3 className="d-p-title">{p.title}</h3>
                  <p>{p.desc}</p>
                  <ul className="d-p-feat">
                    {p.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className="d-p-side">
                  <div className="d-p-stack">
                    {p.tech.map((t) => (
                      <div key={t}>{t}</div>
                    ))}
                  </div>
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noreferrer" className="d-link strong">
                      {host(p.url)} ↗
                    </a>
                  ) : (
                    <span className="d-note">Not public yet</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Toolbox() {
  return (
    <section id="skills" className="d-sec">
      <div className="container d-grid">
        <Label n="03">Toolbox</Label>
        <div className="d-body">
          <h2 className="d-h2 reveal">
            What I reach for <em>most days.</em>
          </h2>
          <div className="d-tools reveal">
            {dev.expertise.map((g) => (
              <div key={g.title}>
                <h4>{g.title}</h4>
                <ul>
                  {g.items.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Experience() {
  return (
    <section id="experience" className="d-sec">
      <div className="container d-grid">
        <Label n="04">Experience</Label>
        <div className="d-body">
          <h2 className="d-h2 reveal">
            Building, running a studio, and <em>teaching.</em>
          </h2>
          <div className="d-rows">
            {dev.experience.map((e) => (
              <div key={e.role + e.org} className="d-row reveal">
                <div className="d-when">{e.period}</div>
                <div>
                  <h3>
                    {e.role}, <span>{e.org}</span>
                  </h3>
                  <p>{e.summary}</p>
                  {e.points.length > 0 && <p className="d-sub">{e.points.join(' · ')}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Approach() {
  return (
    <section className="d-sec">
      <div className="container d-grid">
        <Label n="05">How I work</Label>
        <div className="d-body">
          <div className="d-approach reveal">
            {dev.approach.map((a, i) => (
              <div key={a.title}>
                <span className="n">{i + 1}.</span>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Education() {
  return (
    <section id="education" className="d-sec">
      <div className="container d-grid">
        <Label n="06">Education</Label>
        <div className="d-body">
          <div className="d-rows">
            <div className="d-row reveal">
              <div className="d-when">BSCS · 4 years</div>
              <div>
                <h3>
                  {education.degree}, <span>FUUAST</span>
                </h3>
                <p>
                  {education.school}, {education.place}.
                </p>
              </div>
            </div>
            {certifications.map((c) => (
              <div key={c.name} className="d-row reveal">
                <div className="d-when">Certificate{c.year ? ` · ${c.year}` : ''}</div>
                <div>
                  <h3>
                    {c.name}, <span>{c.org}</span>
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="d-contact">
      <div className="container">
        <Label n="07">Contact</Label>
        <h2 className="d-huge reveal">
          Got an idea that needs building? <em>Let’s talk.</em>
        </h2>
        <p className="reveal">{dev.connect}</p>
        {linkList.length > 0 && (
          <div className="d-contact-links reveal">
            {linkList.map((l) => (
              <a key={l.key} href={l.href} target="_blank" rel="noreferrer" className={`d-link ${l.key === 'email' ? 'strong' : ''}`}>
                {l.key === 'email' ? links.email : l.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default function DevSections() {
  return (
    <main className="mode-content">
      <About />
      <Work />
      <Toolbox />
      <Experience />
      <Approach />
      <Education />
      <Contact />
    </main>
  )
}
