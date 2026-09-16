import { useEffect, useState } from 'react'
import './LeftPanel.css'

export interface LeftPanelProps {
  activeIdx?: number
  scrollRatio?: number
  onSelectProject?: (index: number) => void
  [key: string]: unknown
}

const SKILLS = [
  { label: 'AI Agent Systems', level: 96 },
  { label: 'Python',           level: 93 },
  { label: 'AI / Machine Learning', level: 90 },
  { label: 'Web Development', level: 88 },
  { label: 'Java',             level: 82 },
]

const STATS = [
  { label: 'Specialty',     value: 'AI Agent Expert' },
  { label: 'Focus',         value: 'Autonomous Systems' },
  { label: 'Experience',    value: '3+ Years' },
  { label: 'Projects Live', value: '5 Deployed' },
]

const PROJECTS = [
  { idx: '01', label: 'Horizon AI' },
  { idx: '02', label: 'JARVIS v2.2' },
  { idx: '03', label: 'Protron X' },
  { idx: '04', label: 'ZEOX Protocol' },
  { idx: '05', label: 'Heptron AI' },
]

export const LeftPanel = ({
  activeIdx = 0,
  scrollRatio = 0,
  onSelectProject,
}: LeftPanelProps = {}) => {
  const [animatedLevels, setAnimatedLevels] = useState(SKILLS.map(() => 0))
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setIsVisible(true)
      SKILLS.forEach((skill, i) => {
        setTimeout(() => {
          setAnimatedLevels(prev => {
            const next = [...prev]
            next[i] = skill.level
            return next
          })
        }, i * 100)
      })
    }, 300)
    return () => clearTimeout(t)
  }, [])

  const progressHeight = `${Math.round(scrollRatio * 100)}%`

  return (
    <aside className="left-panel" id="left-panel">

      {/* Scroll rail */}
      <div className="lp-scroll-rail" aria-hidden="true">
        <div className="lp-scroll-fill" style={{ height: progressHeight }} />
      </div>

      {/* Nav */}
      <nav className="lp-nav" aria-label="Portfolio navigation">
        <span className="lp-nav-logo">Pradeep</span>
        <div className="lp-nav-status">
          <span className="lp-status-dot" aria-hidden="true" />
          <span className="lp-status-text">Open to work</span>
        </div>
      </nav>

      {/* Content */}
      <div className={`lp-content ${isVisible ? 'lp-content--visible' : ''}`}>

        {/* Identity */}
        <div className="lp-identity">
          <h1 className="lp-name">Pradeep</h1>
          <p className="lp-role">AI Agent Expert &amp; Developer</p>
          <p className="lp-bio">
            I build autonomous systems, multi-agent pipelines, and
            high-performance interfaces — the kind of software that thinks.
          </p>
        </div>

        <div className="lp-divider" aria-hidden="true" />

        {/* Skills */}
        <section className="lp-skills-section" aria-label="Skills">
          <h2 className="lp-section-heading">Skills</h2>
          <div className="lp-skills-list">
            {SKILLS.map((skill, i) => (
              <div key={skill.label} className="lp-skill-item">
                <div className="lp-skill-header">
                  <span className="lp-skill-name">{skill.label}</span>
                  <span className="lp-skill-pct">{animatedLevels[i]}%</span>
                </div>
                <div className="lp-skill-track">
                  <div
                    className="lp-skill-bar"
                    style={{
                      width: `${animatedLevels[i]}%`,
                      transitionDelay: `${i * 0.1}s`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="lp-divider" aria-hidden="true" />

        {/* Stats */}
        <section className="lp-stats-section" aria-label="About">
          <h2 className="lp-section-heading">About</h2>
          <div className="lp-stats-list">
            {STATS.map(s => (
              <div key={s.label} className="lp-stat">
                <span className="lp-stat-label">{s.label}</span>
                <span className="lp-stat-value">{s.value}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="lp-divider" aria-hidden="true" />

        {/* Projects */}
        <section className="lp-projects-section" aria-label="Projects">
          <h2 className="lp-section-heading">Projects</h2>
          <div className="lp-project-list" role="list">
            {PROJECTS.map((p, i) => (
              <button
                key={p.idx}
                className={`lp-project-item ${activeIdx === i ? 'lp-project-item--active' : ''}`}
                onClick={() => onSelectProject?.(i)}
                aria-pressed={activeIdx === i}
                role="listitem"
                id={`lp-project-${p.idx}`}
              >
                <span className="lp-project-idx">{p.idx}</span>
                <span className="lp-project-name">{p.label}</span>
                <span className="lp-project-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>

        <div className="lp-divider" aria-hidden="true" />

        {/* Contact */}
        <section className="lp-contact-section" aria-label="Contact">
          <h2 className="lp-section-heading">Contact</h2>
          <a
            href="mailto:pradeep@example.com"
            className="lp-contact-email"
            id="lp-email-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m2 7 10 7 10-7"/>
            </svg>
            pradeep@example.com
          </a>
          <div className="lp-social-row">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="lp-social-btn" id="lp-github-btn">GitHub</a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="lp-social-btn" id="lp-linkedin-btn">LinkedIn</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="lp-social-btn" id="lp-twitter-btn">X</a>
          </div>
        </section>

      </div>

      {/* Bottom bar */}
      <div className="lp-bottom-bar" aria-hidden="true">
        <div className="lp-bottom-location">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          India
        </div>
        <span className="lp-bottom-year">© 2025</span>
      </div>

    </aside>
  )
}

export default LeftPanel
