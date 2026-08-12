import { useEffect, useMemo, useState } from 'react'
import profile from './profileData.generated.json'
import { linkedinExperience } from './linkedinExperience'
import { linkedinEducation } from './linkedinEducation'
import { FEATURED_WORK, WORK_FILTERS, buildWorkCatalog } from './workCatalog'
import { SEO_BY_PATH, SOCIAL_IMAGE, canonicalUrl, structuredData } from './seo'

const ROUTES = new Set(['/', '/experience', '/education', '/projects', '/open-source'])

const NAME_OVERRIDES = {
  'fud-ai': 'Fud AI',
  freeCodeCamp: 'freeCodeCamp',
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

const ACTIVITY_COLORS = '4666ff,52d6a2'
let activitySvgPromise

function activityUrl(background) {
  const url = new URL(profile.activityImage)
  url.searchParams.set('colors', ACTIVITY_COLORS)
  url.searchParams.set('bg', background)
  return url.toString()
}

function prepareActivitySvg(svg, theme) {
  const colors = theme === 'dark'
    ? { text: '#f8f4ea', empty: '#242426', originalText: '#c9d1d9', originalEmpty: '#161b22' }
    : { text: '#10192d', empty: '#dfe5f1', originalText: '#24292f', originalEmpty: '#ebedf0' }

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

function ExternalLink({ href, children, className = '', ariaLabel, style }) {
  const isWeb = href.startsWith('http')
  return (
    <a className={className} href={href} target={isWeb ? '_blank' : undefined} rel={isWeb ? 'noreferrer' : undefined} aria-label={ariaLabel} style={style}>
      {children}
    </a>
  )
}

function InternalLink({ to, onNavigate, children, className = '', ariaLabel }) {
  const handleClick = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    onNavigate(to)
  }
  return <a className={className} href={to} onClick={handleClick} aria-label={ariaLabel}>{children}</a>
}

const EXPERIENCE_MARKS = {
  'Extensions for Chrome': '/portfolio/marks/extensions-chrome.webp',
  'Google Play': '/portfolio/marks/google-play.webp',
  'App Store': '/portfolio/marks/app-store.webp',
  XIRCLS: '/portfolio/marks/xircls.webp',
  'Soul AI': '/portfolio/marks/soul-ai.webp',
  Outlier: '/portfolio/marks/outlier.webp',
  YouTube: '/portfolio/marks/youtube.webp',
}

const EDUCATION_MARKS = {
  'University of the People': '/portfolio/marks/uopeople.webp',
  'Delhi Technological University (Formerly DCE)': '/portfolio/marks/dtu.webp',
  'ALLEN Career Institute': '/portfolio/marks/allen.webp',
  FIITJEE: '/portfolio/marks/fiitjee.webp',
  'SSG Coaching, Shaktinagar': '/portfolio/marks/ssg.webp',
  'Dhruva Public School Jai Vihar - New Delhi': '/portfolio/marks/school.webp',
  'Jyoti School Jayant - MP': '/portfolio/marks/school.webp',
}

const NETWORK_MARKS = {
  Profile: '◎', Email: '@', Twitter: 'X', LinkedIn: 'in', GitHub: 'GH', YouTube: '▶',
  Twitch: '◈', Instagram: 'IG', 'Product Hunt': 'P', TrustMRR: '$', Bluesky: 'BS',
  Mastodon: 'M', Peerlist: 'PL', 'Dev.to': 'DEV', Credly: 'C', Grokipedia: 'G',
  'Support me on Ko-Fi': '☕', Schedule: 'CAL', Dribbble: 'D', Pinterest: 'P',
  'Hacker News': 'Y', Nostr: 'N',
}

const TECHNOLOGY_GROUPS = [
  {
    name: 'App craft',
    note: 'Native products and platform work',
    accent: '#ff6b57',
    items: ['Swift', 'SwiftUI', 'Kotlin', 'Jetpack Compose', 'Xcode', 'HealthKit', 'AVFoundation', 'Android Studio', 'macOS'],
  },
  {
    name: 'Web & browser',
    note: 'Interfaces, sites, and browser tooling',
    accent: '#52d6a2',
    items: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Astro', 'TailwindCSS', 'Three.js', 'Playwright', 'Chrome Extensions'],
  },
  {
    name: 'Backend & systems',
    note: 'Services, data, protocols, and low-level work',
    accent: '#f4c84a',
    items: ['Node.js', 'Python', 'Go', 'C', 'MongoDB', 'PostgreSQL', 'OAuth 2.0', 'OpenAPI', 'Shell/Bash', 'CLI'],
  },
  {
    name: 'Infra & creative',
    note: 'Shipping, automation, source, and 3D',
    accent: '#66d9c1',
    items: ['Docker', 'Cloudflare', 'Git', 'Blender'],
  },
  {
    name: 'AI workbench',
    note: 'Agents, coding partners, and protocols',
    accent: '#9d73ea',
    items: ['Claude', 'Codex', 'MCP'],
  },
]

const TECH_GLYPHS = {
  JavaScript: 'JS', TypeScript: 'TS', 'Next.js': 'N', 'Node.js': 'N', 'Three.js': '3',
  'OAuth 2.0': 'O', 'Jetpack Compose': 'JC', 'Chrome Extensions': 'CE',
  'Android Studio': 'AS', 'Shell/Bash': '$_', PostgreSQL: 'PG', MongoDB: 'M',
}

function technologyGlyph(name) {
  if (TECH_GLYPHS[name]) return TECH_GLYPHS[name]
  const words = name.split(/[\s/.]+/).filter(Boolean)
  return words.length > 1 ? words.map((word) => word[0]).join('').slice(0, 2).toUpperCase() : name.slice(0, 2).toUpperCase()
}

function IdentityMark({ src, alt }) {
  return <img className="identity-mark" src={src} alt={alt} loading="lazy" />
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
}

function StarBadge({ item }) {
  if (!item.starCount) return null
  return <span className="star-count" aria-label={`${displayName(item.name)} has ${item.starCount} GitHub stars`}>★ {item.starCount}</span>
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

function WorkCard({ item, featured = false }) {
  const style = { '--card-accent': item.accent, '--card-soft': item.accentSoft }
  return (
    <ExternalLink className={`work-card${featured ? ' work-card-featured' : ''}`} href={item.url} style={style}>
      <span className={`work-cover${item.cover ? ' has-image' : ''}${item.customCover ? '' : ' category-cover'}`}>
        {item.cover ? (
          <>
            <img src={item.cover} alt="" loading="lazy" />
            {!item.customCover && <span className="category-cover-name" aria-hidden="true">{displayName(item.name)}</span>}
          </>
        ) : (
          <>
            <span className="cover-orbit" aria-hidden="true" />
            <span className="cover-marker" aria-hidden="true">{item.marker || '✦'}</span>
            <span className="cover-name" aria-hidden="true">{displayName(item.name)}</span>
          </>
        )}
      </span>
      <span className="work-card-body">
        <span className="work-meta">
          <span>{item.category}</span>
          <StarBadge item={item} />
        </span>
        <strong>{displayName(item.name)}</strong>
        <span className="work-description">{item.description}</span>
        <span className="work-card-footer">
          <span>{item.status || item.source}</span>
          <ArrowIcon />
        </span>
      </span>
    </ExternalLink>
  )
}

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  )
}

function PageHeading({ eyebrow, title, children }) {
  return (
    <section className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{children}</p>
    </section>
  )
}

function ExperienceCards({ limit }) {
  const items = typeof limit === 'number' ? linkedinExperience.slice(0, limit) : linkedinExperience
  return (
    <div className="timeline-list">
      {items.map((item) => (
        <article className="timeline-card" key={`${item.role}-${item.company}-${item.dates}`}>
          <span className="timeline-date">{item.dates}</span>
          <div className="timeline-main">
            <IdentityMark src={EXPERIENCE_MARKS[item.company]} alt={`${item.company} themed mark`} />
            <div><h3>{item.role}</h3><p className="timeline-company">{item.company}</p><p>{item.summary}</p></div>
          </div>
        </article>
      ))}
    </div>
  )
}

function EducationCards({ limit }) {
  const items = typeof limit === 'number' ? linkedinEducation.slice(0, limit) : linkedinEducation
  return (
    <div className="timeline-list">
      {items.map((item) => (
        <article className="timeline-card" key={`${item.institution}-${item.program}-${item.dates}`}>
          <span className="timeline-date">{item.dates}</span>
          <div className="timeline-main">
            <IdentityMark src={EDUCATION_MARKS[item.institution]} alt={`${item.institution} themed mark`} />
            <div>
              <h3>{item.institution}</h3>
              <p className="timeline-company">{item.program}</p>
              {(item.grade || item.note) && <p>{[item.grade, item.note].filter(Boolean).join(' · ')}</p>}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function ToolBench() {
  const known = new Set(TECHNOLOGY_GROUPS.flatMap((group) => group.items))
  const additional = profile.technologies.filter((technology) => !known.has(technology))
  const groups = additional.length
    ? [...TECHNOLOGY_GROUPS, { name: 'Also exploring', note: 'New additions to the bench', accent: '#4666ff', items: additional }]
    : TECHNOLOGY_GROUPS

  return (
    <section className="section-block tool-bench" aria-labelledby="tool-bench-title">
      <header className="tool-bench-header">
        <div>
          <span className="eyebrow">The tool bench</span>
          <h2 id="tool-bench-title">The instruments behind the work.</h2>
        </div>
        <p><strong>{profile.technologies.length}</strong> technologies across native apps, the web, infrastructure, creative tooling, and AI.</p>
      </header>
      <div className="tool-drawers">
        {groups.map((group, groupIndex) => (
          <section className="tool-drawer" key={group.name} style={{ '--tool-accent': group.accent }}>
            <header>
              <span className="drawer-index" aria-hidden="true">0{groupIndex + 1}</span>
              <div><h3>{group.name}</h3><p>{group.note}</p></div>
              <span className="drawer-count">{group.items.length}</span>
            </header>
            <ul>
              {group.items.map((technology) => (
                <li key={technology}><span aria-hidden="true">{technologyGlyph(technology)}</span><strong>{technology}</strong></li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="tool-bench-note"><span aria-hidden="true">✦</span> I pick tools for the problem, not the other way around.</p>
    </section>
  )
}

function HomePage({ navigate, work }) {
  const featured = FEATURED_WORK.map((name) => work.find((item) => item.name === name)).filter(Boolean)
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>I make useful software and <em>strange</em> internet things.</h1>
          <p>Mobile apps, AI agents, browser tools, open source, 3D machines, and experiments—built from an idea all the way to shipping.</p>
          <div className="hero-actions">
            <InternalLink className="button button-primary" to="/projects" onNavigate={navigate}>Explore all work <ArrowIcon /></InternalLink>
            <ExternalLink className="button button-secondary" href="mailto:ad13dtu@gmail.com">Say hello</ExternalLink>
          </div>
        </div>
        <figure className="hero-art">
          <img src="/portfolio/maker-workbench.webp" alt="An illustrated maker workbench connecting apps, AI, a mechanical heart, an orrery, a diver, and a camera" />
          <figcaption>One workbench, many rabbit holes.</figcaption>
        </figure>
      </section>

      <section className="maker-index" aria-label="Areas of work">
        <span>Mobile apps</span><i />
        <span>AI agents</span><i />
        <span>Browser tools</span><i />
        <span>Open source</span><i />
        <span>3D machines</span><i />
        <span>Experiments</span>
      </section>

      <ToolBench />

      <section className="section-block featured-work">
        <div className="featured-board">
          <header className="featured-intro">
            <span className="brass-label">Maker portfolio</span>
            <span className="eyebrow">The project shelf</span>
            <h2>Selected<br />work.</h2>
            <p>A curated wall of internet artifacts—built, shipped, and carefully iterated.</p>
            <span className="pointing-hand" aria-hidden="true">☞</span>
            <InternalLink className="featured-all-link" to="/projects" onNavigate={navigate}>
              View all {work.length} projects <ArrowIcon />
            </InternalLink>
          </header>
          <div className="featured-grid">
            {featured.slice(0, 6).map((item) => <WorkCard key={item.name} item={item} featured />)}
          </div>
        </div>
      </section>

      <section className="section-block split-section">
        <div>
          <SectionHeading eyebrow="Now & before" title="Experience" />
          <ExperienceCards limit={3} />
          <InternalLink className="text-action below-action" to="/experience" onNavigate={navigate}>All {linkedinExperience.length} roles <ArrowIcon /></InternalLink>
        </div>
        <div>
          <SectionHeading eyebrow="The long route" title="Education" />
          <EducationCards limit={3} />
          <InternalLink className="text-action below-action" to="/education" onNavigate={navigate}>All {linkedinEducation.length} entries <ArrowIcon /></InternalLink>
        </div>
      </section>

      <section className="section-block open-source-teaser">
        <div className="open-source-copy">
          <span className="eyebrow">Borrowed codebases, real fixes</span>
          <h2>Open source is where I learn in public.</h2>
          <p>Contributions across TensorFlow, Kubernetes, Flutter, freeCodeCamp, .NET, Svelte, jQuery, and dozens more.</p>
          <InternalLink className="button button-primary" to="/open-source" onNavigate={navigate}>Browse contributions <ArrowIcon /></InternalLink>
        </div>
        <div className="logo-cloud" aria-label="Selected open-source projects">
          {profile.openSource.slice(0, 15).map((item) => (
            <ExternalLink key={`${item.name}-${item.url}`} href={item.url} ariaLabel={`${displayName(item.name)} contribution`}>
              <span aria-hidden="true">{item.marker || '◆'}</span>{displayName(item.name)}
            </ExternalLink>
          ))}
        </div>
      </section>

      <section className="section-block activity-section">
        <SectionHeading eyebrow="Across GitHub" title="Activity" />
        <GitHubActivity />
      </section>

      <section className="section-block field-notes" aria-label="Profile figures">
        <p><strong>6,376</strong><span>Fud AI downloads</span></p>
        <p><strong>{work.length}</strong><span>shipped things</span></p>
        <p><strong>{profile.openSource.length}</strong><span>open-source entries</span></p>
        <p><strong>13K+</strong><span>LinkedIn community</span></p>
      </section>

      <section className="section-block profile-notes">
        <div className="note-panel">
          <SectionHeading eyebrow="Current threads" title="What I’m doing" />
          <ul>{profile.currentWork.map((item) => <li key={item.name}><strong>{item.name}</strong><span>{item.description}</span></li>)}</ul>
        </div>
        <div className="note-panel recognition-panel">
          <SectionHeading eyebrow="Milestones" title="Recognition" />
          <ul>{profile.recognition.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className="section-block connect-board">
        <div>
          <span className="eyebrow">Elsewhere</span>
          <h2>Find me around the internet.</h2>
          <p>{profile.intro.statement}</p>
        </div>
        <div className="connect-links">
          {profile.connect.map((item) => <ExternalLink key={`${item.name}-${item.url}`} href={item.url}><span className="connect-label"><span className="network-mark" aria-hidden="true">{NETWORK_MARKS[item.name] || item.name.charAt(0)}</span>{item.name}</span><ArrowIcon /></ExternalLink>)}
        </div>
      </section>

      <section className="section-block last-notes">
        <div className="writing-note">
          <IdentityMark src="/portfolio/marks/medium.webp" alt="Themed writing medallion" />
          <div>
            <span className="eyebrow">Writing</span>
            <h2><ExternalLink href={profile.writing.url}>{profile.writing.name} <ArrowIcon /></ExternalLink></h2>
            <p>{profile.writing.description}</p>
          </div>
        </div>
        <blockquote>{profile.philosophy}</blockquote>
        <details className="random-facts">
          <summary>Five random facts</summary>
          <ul>{profile.randomFacts.map((item) => <li key={item}>{item}</li>)}</ul>
        </details>
      </section>
    </>
  )
}

function ProjectsPage({ work }) {
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const visible = work.filter((item) => {
    const matchesFilter = filter === 'All' || item.filters.includes(filter)
    const haystack = `${item.name} ${item.description} ${item.category}`.toLowerCase()
    return matchesFilter && haystack.includes(query.toLowerCase())
  })

  return (
    <>
      <PageHeading eyebrow="The complete index" title="Everything I’ve built.">Apps, games, browser extensions, developer tools, AI experiments, 3D work, and the stranger ideas in between.</PageHeading>
      <div className="catalog-controls">
        <label className="search-field"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try AI, macOS, browser…" /></label>
        <div className="filter-row" aria-label="Filter projects">
          {WORK_FILTERS.map((item) => <button className={filter === item ? 'active' : ''} type="button" key={item} onClick={() => setFilter(item)}>{item}</button>)}
        </div>
      </div>
      <p className="result-count">Showing {visible.length} of {work.length}</p>
      <section className="work-grid" aria-live="polite">
        {visible.map((item) => <WorkCard key={`${item.source}-${item.name}`} item={item} />)}
      </section>
      {!visible.length && <p className="empty-state">Nothing matches that search yet. Try another word or category.</p>}
    </>
  )
}

function ExperiencePage() {
  return <><PageHeading eyebrow="Work" title="Experience">All {linkedinExperience.length} roles, from building products and software to AI training and content.</PageHeading><ExperienceCards /></>
}

function EducationPage() {
  return <><PageHeading eyebrow="Learning" title="Education">Computer science, engineering, mathematics, and the long habit of figuring things out.</PageHeading><EducationCards /></>
}

function OpenSourcePage() {
  const [query, setQuery] = useState('')
  const visible = profile.openSource.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <>
      <PageHeading eyebrow="Contributions" title="Open source, project by project.">Merged fixes and contributions across {profile.openSource.length} entries. Every row links to the original pull request or contribution history.</PageHeading>
      <label className="search-field open-source-search"><span>Find a project</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="TensorFlow, Python, docs…" /></label>
      <section className="contribution-list" aria-live="polite">
        {visible.map((item) => (
          <ExternalLink className="contribution-row" href={item.url} key={`${item.name}-${item.url}`}>
            <span className="contribution-marker" aria-hidden="true">{item.marker || '◆'}</span>
            <span><strong>{displayName(item.name)}</strong><span>{item.description}</span></span>
            <StarBadge item={item} />
            <ArrowIcon />
          </ExternalLink>
        ))}
      </section>
      {!visible.length && <p className="empty-state">No contribution matches that search.</p>}
    </>
  )
}

function Sidebar({ path, navigate, dark, setDark }) {
  const nav = [['/', 'Home'], ['/projects', 'All work'], ['/open-source', 'Open source'], ['/experience', 'Experience'], ['/education', 'Education']]
  return (
    <aside className="sidebar">
      <div className="identity">
        <InternalLink className="monogram" to="/" onNavigate={navigate} ariaLabel="Apoorv Darshan home">AD</InternalLink>
        <div><InternalLink className="identity-name" to="/" onNavigate={navigate}>Apoorv Darshan</InternalLink><p>Developer, founder &amp;<br />open-source builder.</p></div>
      </div>
      <nav className="side-nav" aria-label="Main navigation">
        {nav.map(([to, label], index) => <InternalLink className={path === to ? 'active' : ''} key={to} to={to} onNavigate={navigate}><span><b>0{index + 1}</b>{label}</span><ArrowIcon /></InternalLink>)}
      </nav>
      <div className="sidebar-footer">
        <p className="availability"><span /> Building from Delhi</p>
        <div className="social-links">
          <ExternalLink href="https://github.com/apoorvdarshan">GitHub</ExternalLink>
          <ExternalLink href="https://www.linkedin.com/in/apoorvdarshan">LinkedIn</ExternalLink>
          <ExternalLink href="https://x.com/apoorvdarshan">X</ExternalLink>
          <ExternalLink href="mailto:ad13dtu@gmail.com">Email</ExternalLink>
        </div>
        <button className="theme-button" type="button" onClick={() => setDark(!dark)} aria-pressed={dark}><span>{dark ? 'Light' : 'Dark'} mode</span><span aria-hidden="true">{dark ? '☀' : '☾'}</span></button>
      </div>
    </aside>
  )
}

function MobileHeader({ path, navigate, dark, setDark }) {
  return (
    <header className="mobile-header">
      <InternalLink className="mobile-brand" to="/" onNavigate={navigate}>AD</InternalLink>
      <span>{path === '/' ? 'Apoorv Darshan' : SEO_BY_PATH[path]?.title.split(' — ')[0]}</span>
      <button type="button" onClick={() => setDark(!dark)} aria-label={`Use ${dark ? 'light' : 'dark'} mode`}>{dark ? '☀' : '☾'}</button>
    </header>
  )
}

function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('apoorv-theme-v3')
    return saved ? saved === 'dark' : true
  })
  const [path, setPath] = useState(currentPath)
  const work = useMemo(() => buildWorkCatalog(profile), [])

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('apoorv-theme-v3', dark ? 'dark' : 'light')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0b0b0c' : '#f6f4ed')
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
    const setMeta = (selector, attribute, value) => document.head.querySelector(selector)?.setAttribute(attribute, value)
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
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  let page
  if (path === '/experience') page = <ExperiencePage />
  else if (path === '/education') page = <EducationPage />
  else if (path === '/projects') page = <ProjectsPage work={work} />
  else if (path === '/open-source') page = <OpenSourcePage />
  else page = <HomePage navigate={navigate} work={work} />

  return (
    <div className="site-shell">
      <a className="skip-link" href="#content">Skip to content</a>
      <Sidebar path={path} navigate={navigate} dark={dark} setDark={setDark} />
      <MobileHeader path={path} navigate={navigate} dark={dark} setDark={setDark} />
      <main className="main-canvas" id="content"><div className="page-enter" key={path}>{page}</div></main>
      <footer className="mobile-nav" aria-label="Mobile navigation">
        <InternalLink className={path === '/' ? 'active' : ''} to="/" onNavigate={navigate}>Home</InternalLink>
        <InternalLink className={path === '/projects' ? 'active' : ''} to="/projects" onNavigate={navigate}>Work</InternalLink>
        <InternalLink className={path === '/open-source' ? 'active' : ''} to="/open-source" onNavigate={navigate}>OSS</InternalLink>
        <InternalLink className={path === '/experience' || path === '/education' ? 'active' : ''} to="/experience" onNavigate={navigate}>About</InternalLink>
      </footer>
    </div>
  )
}

export default App
