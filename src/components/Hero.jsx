import { useState } from 'react'
import { NAME, cyber, dev } from '../data/content'
import Portrait from './Portrait'
import { Icon, RoleCycler, Typed } from './ui'

function HackerHero() {
  const [typed, setTyped] = useState(false)
  return (
    <div className="hero-copy hacker-hero" key="h">
      <div className="prompt">
        <span className="p-user">root@shahzaib</span>:<span className="p-path">~</span>$ <Typed text="whoami" delay={300} onDone={() => setTyped(true)} />
        {!typed && <span className="caret" />}
      </div>
      <h1 className={`hero-name ${typed ? 'in' : ''}`}>
        <span className="glitch" data-text="Muhammad Shahzaib">
          Muhammad Shahzaib
        </span>
        <span className="glitch accent" data-text="Khateeb">
          Khateeb
        </span>
      </h1>
      <div className={`hero-role ${typed ? 'in' : ''}`}>
        <span className="accent">&gt; </span>
        <RoleCycler roles={cyber.roles} />
      </div>
      <p className={`hero-tagline ${typed ? 'in' : ''}`}>{cyber.tagline}</p>
      <p className={`hero-intro ${typed ? 'in' : ''}`}>{cyber.intro[0]}</p>
      <div className={`hero-status ${typed ? 'in' : ''}`}>
        <span className="pulse" /> {cyber.status}
      </div>
      <div className={`hero-cta ${typed ? 'in' : ''}`}>
        <a href="#research" className="btn btn-primary">
          ./view_research <Icon name="arrow" size={16} />
        </a>
        <a href="#contact" className="btn btn-ghost">
          ./contact --me
        </a>
      </div>
    </div>
  )
}

function DevHero() {
  return (
    <div className="hero-copy dev-hero" key="d">
      <p className="d-kicker">{dev.roles.join(' · ')}</p>
      <h1 className="d-name">
        Muhammad Shahzaib <em>Khateeb</em>
        <span className="accent">.</span>
      </h1>
      <p className="d-lede">
        {dev.tagline} <span className="muted">{dev.lede}</span>
      </p>
      <dl className="d-now">
        <dt>Now</dt>
        <dd>Running Pixel Canvas, a small digital studio</dd>
        <dt>Also</dt>
        <dd>Teaching Python at UKIT, since Jan 2025</dd>
      </dl>
      <div className="d-links-row">
        <a href="#projects" className="d-link strong">
          Selected work ↓
        </a>
        <a href="#contact" className="d-link">
          Get in touch
        </a>
      </div>
    </div>
  )
}

export default function Hero({ mode, target }) {
  return (
    <section id="home" className="hero" aria-label={`${NAME} introduction`}>
      <div className="container hero-grid">
        {mode === 'hacker' ? <HackerHero /> : <DevHero />}
        <div className="hero-visual">
          <Portrait target={target} mode={mode} />
        </div>
      </div>
      <a href="#about" className="scroll-hint" aria-label="Scroll down">
        <span>{mode === 'hacker' ? 'scroll --down' : 'Scroll'}</span>
        <i />
      </a>
    </section>
  )
}
