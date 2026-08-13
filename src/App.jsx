import { useEffect, useState } from 'react'
import profile from './profileData.generated.json'
import { linkedinExperience } from './linkedinExperience'
import { linkedinEducation } from './linkedinEducation'
import { SEO_BY_PATH, SOCIAL_IMAGE, canonicalUrl, structuredData } from './seo'

const ROUTES = new Set(['/', '/experience', '/education', '/projects', '/open-source'])

const NAME_OVERRIDES = {
  'fud-ai': 'Fud AI',
  'freeCodeCamp': 'freeCodeCamp',
  tensorflow: 'TensorFlow',
  jquery: 'jQuery',
  jupyterlab: 'JupyterLab',
  springboot: 'Spring Boot',
  'spring-boot': 'Spring Boot',
  'opengraph-studio': 'OpenGraph Studio',
  'github-readme-contribution-merger': 'GitHub README Contribution Merger',
  'macbook-24x7-agents': 'MacBook 24×7 Agents',
  'linkedin-connection-sender': 'LinkedIn Connection Sender',
  'axentra-os-affiliate': 'Axentra OS Affiliate',
  iitjee: 'IIT JEE',
  Xscore: 'XScore',
  WeasyPrint: 'WeasyPrint',
  TEAMMATES: 'TEAMMATES',
  CodexBar: 'CodexBar',
}

const WORD_FORMS = {
  ai: 'AI', api: 'API', bmw: 'BMW', cli: 'CLI', css: 'CSS', dob: 'DOB',
  github: 'GitHub', html: 'HTML', ios: 'iOS', macos: 'macOS', mcp: 'MCP',
  os: 'OS', pr: 'PR', readme: 'README', sql: 'SQL', ui: 'UI', url: 'URL',
}

const ACTIVITY_COLORS = '9b7548,718a69'
let activitySvgPromise

function activityUrl(background) {
  const url = new URL(profile.activityImage)
  url.searchParams.set('colors', ACTIVITY_COLORS)
  url.searchParams.set('bg', background)
  return url.toString()
}

function prepareActivitySvg(svg, theme) {
  const colors = theme === 'dark'
    ? { text: '#f0eee6', empty: '#302e2b', originalText: '#c9d1d9', originalEmpty: '#161b22' }
    : { text: '#1f1e1d', empty: '#dedbd2', originalText: '#24292f', originalEmpty: '#ebedf0' }

  const camouflaged = svg
    .replace(/<rect width="[^"]+" height="[^"]+" fill="#[0-9a-fA-F]{6}" rx="6" ry="6"\s*\/>/, '')
    .replaceAll(colors.originalText, colors.text)
    .replaceAll(colors.originalEmpty, colors.empty)

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(camouflaged)}`
}

function loadActivitySvgs() {
  if (!activitySvgPromise) {
    activitySvgPromise = Promise.all([
      fetch(activityUrl('light')).then((response) => {
        if (!response.ok) throw new Error(`Activity graph returned ${response.status}`)
        return response.text()
      }),
      fetch(activityUrl('dark')).then((response) => {
        if (!response.ok) throw new Error(`Activity graph returned ${response.status}`)
        return response.text()
      }),
    ]).then(([light, dark]) => ({
      light: prepareActivitySvg(light, 'light'),
      dark: prepareActivitySvg(dark, 'dark'),
    }))
  }

  return activitySvgPromise
}

function displayName(name) {
  if (NAME_OVERRIDES[name]) return NAME_OVERRIDES[name]
  return name
    .split(/[-_]/)
    .map((word) => WORD_FORMS[word.toLowerCase()] || `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ')
}

function currentPath() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  if (ROUTES.has(path)) return path
  window.history.replaceState({}, '', '/')
  return '/'
}

function ExternalLink({ href, children, className = '' }) {
  const isWeb = href.startsWith('http')
  return <a className={className} href={href} target={isWeb ? '_blank' : undefined} rel={isWeb ? 'noreferrer' : undefined}>{children}</a>
}

function InternalLink({ to, onNavigate, children, className = '' }) {
  const handleClick = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    onNavigate(to)
  }

  return <a className={className} href={to} onClick={handleClick}>{children}</a>
}

function StarBadge({ item }) {
  if (!item.starBadgeUrl) return null
  return (
    <span className="star-count" aria-label={`${displayName(item.name)} has ${item.starCount || 'an unavailable number of'} GitHub stars`}>
      <span aria-hidden="true">★ {item.starCount}</span>
    </span>
  )
}

function EntryList({ items, limit }) {
  const visible = typeof limit === 'number' ? items.slice(0, limit) : items
  return (
    <ul className="bullet-list entry-list">
      {visible.map((item) => (
        <li key={`${item.name}-${item.url}`}>
          <ExternalLink href={item.url}>{displayName(item.name)}</ExternalLink>
          <StarBadge item={item} />
          {item.status && <span className="item-status">({item.status})</span>}
          {item.description && <span className="entry-summary"> — {item.description}</span>}
        </li>
      ))}
    </ul>
  )
}

function DetailList({ items }) {
  return (
    <ul className="bullet-list detail-list">
      {items.map((item) => (
        <li key={`${item.name}-${item.url}`}>
          <ExternalLink href={item.url}>{displayName(item.name)}</ExternalLink>
          <StarBadge item={item} />
          {item.status && <span className="item-status">({item.status})</span>}
          {item.description && <span className="entry-summary"> — {item.description}</span>}
        </li>
      ))}
    </ul>
  )
}

function PageHeading({ title, children }) {
  return (
    <section className="page-heading">
      <h1>{title}</h1>
      <p>{children}</p>
    </section>
  )
}

function GitHubActivity() {
  const [graphs, setGraphs] = useState(null)

  useEffect(() => {
    let active = true
    loadActivitySvgs()
      .then((result) => { if (active) setGraphs(result) })
      .catch(() => { if (active) setGraphs({ light: activityUrl('light'), dark: activityUrl('dark') }) })
    return () => { active = false }
  }, [])

  return (
    <ExternalLink className="activity-link" href={activityUrl('light')}>
      {graphs ? (
        <>
          <img className="activity-graph activity-graph-light" src={graphs.light} alt="Apoorv Darshan's merged GitHub contribution graph" />
          <img className="activity-graph activity-graph-dark" src={graphs.dark} alt="Apoorv Darshan's merged GitHub contribution graph" />
        </>
      ) : <span className="activity-placeholder" aria-label="Loading Apoorv Darshan's GitHub contribution graph" role="img" />}
    </ExternalLink>
  )
}

function ReadmeDetails() {
  return (
    <>
      <section>
        <h2>What I’m doing</h2>
        <ul className="bullet-list">
          {profile.currentWork.map((item) => <li key={item.name}><strong>{item.name}</strong><span className="entry-summary"> — {item.description}</span></li>)}
        </ul>
      </section>

      <section>
        <h2>Writing</h2>
        <ul className="bullet-list"><li><ExternalLink href={profile.writing.url}>{profile.writing.name}</ExternalLink><span className="entry-summary"> — {profile.writing.description}</span></li></ul>
      </section>

      <section>
        <h2>Connect</h2>
        <ul className="bullet-list link-columns">{profile.connect.map((item) => <li key={item.name}><ExternalLink href={item.url}>{item.name}</ExternalLink></li>)}</ul>
      </section>

      <section>
        <h2>Recognition</h2>
        <ul className="bullet-list">{profile.recognition.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section>
        <h2>Philosophy</h2>
        <blockquote>{profile.philosophy}</blockquote>
      </section>

      <section className="random-facts">
        <details>
          <summary>Random facts</summary>
          <ul className="bullet-list">{profile.randomFacts.map((item) => <li key={item}>{item}</li>)}</ul>
        </details>
      </section>
    </>
  )
}

function ExperienceList({ limit }) {
  const visible = typeof limit === 'number' ? linkedinExperience.slice(0, limit) : linkedinExperience
  return (
    <ul className="bullet-list experience-list">
      {visible.map((item) => (
        <li key={`${item.role}-${item.company}-${item.dates}`}>
          <strong>{item.role}</strong> · {item.company}
          <span className="item-status">({item.dates})</span>
          <span className="entry-summary"> — {item.summary}</span>
        </li>
      ))}
    </ul>
  )
}

function ExperienceSection({ navigate }) {
  return (
    <section>
      <h2>Experience</h2>
      <ExperienceList limit={4} />
      <p className="after-list"><InternalLink to="/experience" onNavigate={navigate}>View all {linkedinExperience.length} experiences →</InternalLink></p>
    </section>
  )
}

function EducationList({ limit }) {
  const visible = typeof limit === 'number' ? linkedinEducation.slice(0, limit) : linkedinEducation
  return (
    <ul className="bullet-list education-list">
      {visible.map((item) => (
        <li key={`${item.institution}-${item.program}-${item.dates}`}>
          <strong>{item.institution}</strong>
          <span className="item-status">({item.dates})</span>
          <span className="entry-summary"> — {item.program}{item.grade && `; ${item.grade}`}{item.note && `; ${item.note}`}</span>
        </li>
      ))}
    </ul>
  )
}

function EducationSection({ navigate }) {
  return (
    <section>
      <h2>Education</h2>
      <EducationList limit={3} />
      <p className="after-list"><InternalLink to="/education" onNavigate={navigate}>View all {linkedinEducation.length} education entries →</InternalLink></p>
    </section>
  )
}

function HomePage({ navigate }) {
  return (
    <>
      <section className="intro">
        <p>Apoorv Darshan is an AI-powered builder in Delhi, building web apps, mobile apps, bots, APIs, and everything in between.</p>
        <p className="intro-deck">{profile.intro.statement}</p>
      </section>

      <ExperienceSection navigate={navigate} />

      <EducationSection navigate={navigate} />

      <section>
        <h2>Apps</h2>
        <EntryList items={profile.apps} />
      </section>

      <section>
        <h2>Games</h2>
        <EntryList items={profile.games} />
      </section>

      <section>
        <h2>Chrome extensions</h2>
        <EntryList items={profile.extensions} />
      </section>

      <section>
        <h2>Projects</h2>
        <EntryList items={profile.projects} limit={8} />
        <p className="after-list"><InternalLink to="/projects" onNavigate={navigate}>View all {profile.projects.length} projects →</InternalLink></p>
      </section>

      <section>
        <h2>Open source</h2>
        <EntryList items={profile.openSource} limit={8} />
        <p className="after-list"><InternalLink to="/open-source" onNavigate={navigate}>View all {profile.openSource.length} contributions →</InternalLink></p>
      </section>

      <section>
        <h2>GitHub activity</h2>
        <GitHubActivity />
      </section>

      <ReadmeDetails />
    </>
  )
}

function ProjectsPage() {
  return (
    <>
      <PageHeading title="Projects">Every project listed in Apoorv’s GitHub profile README. Each title opens the project or its live site.</PageHeading>
      <section className="detail-section">
        <DetailList items={profile.projects} />
      </section>
    </>
  )
}

function ExperiencePage() {
  return (
    <>
      <PageHeading title="Experience">All {linkedinExperience.length} roles from Apoorv’s LinkedIn experience profile.</PageHeading>
      <section className="detail-section">
        <ExperienceList />
      </section>
    </>
  )
}

function EducationPage() {
  return (
    <>
      <PageHeading title="Education">All {linkedinEducation.length} education entries from Apoorv’s LinkedIn profile.</PageHeading>
      <section className="detail-section">
        <EducationList />
      </section>
    </>
  )
}

function OpenSourcePage() {
  return (
    <>
      <PageHeading title="Open source">All {profile.openSource.length} contributions from Apoorv’s GitHub profile README. Select any project to open the pull request or contribution history.</PageHeading>
      <section className="detail-section">
        <DetailList items={profile.openSource} />
      </section>
    </>
  )
}

function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('apoorv-theme-v2')
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [path, setPath] = useState(currentPath)

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('apoorv-theme-v2', dark ? 'dark' : 'light')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#1f1e1d' : '#f0eee6')
  }, [dark])

  useEffect(() => {
    const handlePopState = () => setPath(currentPath())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const seo = SEO_BY_PATH[path] || SEO_BY_PATH['/']
    const canonical = canonicalUrl(path)
    document.title = seo.title

    const setMeta = (selector, attribute, value) => {
      const element = document.head.querySelector(selector)
      if (element) element.setAttribute(attribute, value)
    }

    setMeta('meta[name="description"]', 'content', seo.description)
    setMeta('meta[property="og:title"]', 'content', seo.title)
    setMeta('meta[property="og:description"]', 'content', seo.description)
    setMeta('meta[property="og:url"]', 'content', canonical)
    setMeta('meta[property="og:image"]', 'content', SOCIAL_IMAGE)
    setMeta('meta[name="twitter:title"]', 'content', seo.title)
    setMeta('meta[name="twitter:description"]', 'content', seo.description)
    setMeta('meta[name="twitter:image"]', 'content', SOCIAL_IMAGE)

    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical)
    const schema = document.querySelector('script[type="application/ld+json"]')
    if (schema) schema.textContent = JSON.stringify(structuredData(path))
  }, [path])

  const navigate = (to) => {
    if (to === path) return
    window.history.pushState({}, '', to)
    setPath(to)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  let page
  if (path === '/experience') page = <ExperiencePage />
  else if (path === '/education') page = <EducationPage />
  else if (path === '/projects') page = <ProjectsPage />
  else if (path === '/open-source') page = <OpenSourcePage />
  else page = <HomePage navigate={navigate} />

  return (
    <div className="page-wrapper">
      <a className="skip-link" href="#content">Skip to content</a>

      <header className="header">
        <div className="container header-container">
          <InternalLink className="header-name" to="/" onNavigate={navigate}>Apoorv Darshan</InternalLink>
          <div className="header-actions">
            {path !== '/' && <InternalLink className="home-link" to="/" onNavigate={navigate}>Home</InternalLink>}
            <button className="toggle-switch" type="button" onClick={() => setDark(!dark)} aria-label={`Use ${dark ? 'light' : 'dark'} color mode`} aria-pressed={dark}>
              <span className="toggle-knob"></span>
            </button>
          </div>
        </div>
      </header>

      <main className="page-main" id="content">
        <article className="container page-enter" key={path}>
          {page}
        </article>
      </main>
    </div>
  )
}

export default App
