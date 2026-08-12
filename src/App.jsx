import { useEffect, useMemo, useState } from 'react'
import profile from './profileData.generated.json'
import { linkedinExperience } from './linkedinExperience'
import { linkedinEducation } from './linkedinEducation'
import { FEATURED_WORK, WORK_FILTERS, buildWorkCatalog } from './workCatalog'
import { SEO_BY_PATH, SOCIAL_IMAGE, canonicalUrl, structuredData } from './seo'

const ROUTES = new Set(['/', '/experience', '/education', '/projects', '/open-source'])

const NAME_OVERRIDES = {
  'fud-ai': 'Fud AI', freeCodeCamp: 'freeCodeCamp', tensorflow: 'TensorFlow',
  jquery: 'jQuery', jupyterlab: 'JupyterLab', springboot: 'Spring Boot',
  'spring-boot': 'Spring Boot', 'opengraph-studio': 'OpenGraph Studio',
  'github-readme-contribution-merger': 'GitHub Contribution Merger',
  'macbook-24x7-agents': 'MacBook 24×7 Agents',
  'linkedin-connection-sender': 'LinkedIn Connection Sender',
  'axentra-os-affiliate': 'Axentra OS Affiliate', iitjee: 'IIT JEE',
  Xscore: 'XScore', WeasyPrint: 'WeasyPrint', TEAMMATES: 'TEAMMATES', CodexBar: 'CodexBar',
}

const WORD_FORMS = {
  ai: 'AI', api: 'API', bmw: 'BMW', cli: 'CLI', css: 'CSS', dob: 'DOB',
  github: 'GitHub', html: 'HTML', ios: 'iOS', macos: 'macOS', mcp: 'MCP',
  os: 'OS', pr: 'PR', readme: 'README', sql: 'SQL', ui: 'UI', url: 'URL',
}

const EXPERIENCE_MARKS = {
  'Extensions for Chrome': '/identity-marks-real/chrome.png',
  'Google Play': '/identity-marks-real/google-play.png',
  'App Store': '/identity-marks-real/apple.png',
  XIRCLS: '/identity-marks-real/xircls.png',
  Outlier: '/identity-marks-real/outlier.png',
  YouTube: '/identity-marks-real/youtube.png',
}

const EDUCATION_MARKS = {
  'University of the People': '/identity-marks-real/uopeople.png',
  'Delhi Technological University (Formerly DCE)': '/identity-marks-real/dtu.png',
  'ALLEN Career Institute': '/identity-marks-real/allen.png',
  FIITJEE: '/identity-marks-real/fiitjee.png',
}

const CONTRIBUTION_LOGOS = {
  freeCodeCamp: 'freeCodeCamp', tensorflow: 'tensorflow', flutter: 'flutter', dify: 'langgenius',
  kubernetes: 'kubernetes', svelte: 'sveltejs', laravel: 'laravel', 'spring-boot': 'spring-projects',
  springboot: 'spring-projects', ansible: 'ansible', jquery: 'jquery', julia: 'JuliaLang',
  zx: 'google', core: 'dotnet', runtime: 'dotnet', luigi: 'spotify',
}

function displayName(name) {
  if (NAME_OVERRIDES[name]) return NAME_OVERRIDES[name]
  return name.split(/[-_]/).map((word) => WORD_FORMS[word.toLowerCase()] || `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(' ')
}

function currentPath() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  if (ROUTES.has(path)) return path
  window.history.replaceState({}, '', '/')
  return '/'
}

function ExternalLink({ href, children, className = '', ariaLabel, style }) {
  const isWeb = href.startsWith('http')
  return <a className={className} href={href} target={isWeb ? '_blank' : undefined} rel={isWeb ? 'noreferrer' : undefined} aria-label={ariaLabel} style={style}>{children}</a>
}

function InternalLink({ to, onNavigate, children, className = '', ariaLabel }) {
  const handleClick = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    onNavigate(to)
  }
  return <a className={className} href={to} onClick={handleClick} aria-label={ariaLabel}>{children}</a>
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
}

function StarBadge({ item }) {
  if (!item.starCount || Number.parseFloat(item.starCount.replaceAll(',', '')) <= 0) return null
  return <span className="star-count" aria-label={`${displayName(item.name)} has ${item.starCount} GitHub stars`}>★ {item.starCount}</span>
}

function Brand({ navigate }) {
  return (
    <InternalLink className="brand" to="/" onNavigate={navigate} ariaLabel="Apoorv Darshan home">
      <span className="brand-mark" aria-hidden="true">AD</span>
      <span><strong>Apoorv Darshan</strong><small>makes things on the internet</small></span>
    </InternalLink>
  )
}

function SiteHeader({ path, navigate }) {
  const nav = [['/projects', 'All work'], ['/open-source', 'Open source'], ['/experience', 'About']]
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand navigate={navigate} />
        <nav className="top-nav" aria-label="Main navigation">
          {nav.map(([to, label]) => (
            <InternalLink className={path === to || (to === '/experience' && path === '/education') ? 'active' : ''} key={to} to={to} onNavigate={navigate}>{label}</InternalLink>
          ))}
        </nav>
        <ExternalLink className="header-contact" href="mailto:ad13dtu@gmail.com">Say hello ↗</ExternalLink>
      </div>
    </header>
  )
}

function ProjectMark({ item, large = false }) {
  if (item.icon) return <img className={`project-icon${large ? ' large' : ''}`} src={item.icon} alt="" loading={large ? 'eager' : 'lazy'} />
  return <span className={`project-symbol text-mark${large ? ' large' : ''}`} aria-hidden="true" style={{ background: item.wash, color: item.accent }}>{displayName(item.name).replaceAll(' ', '').slice(0, 2).toUpperCase()}</span>
}

function FeaturedCard({ item }) {
  return (
    <ExternalLink className="featured-card" href={item.url} style={{ '--accent': item.accent, '--wash': item.wash }}>
      <span className="featured-scene">
        {item.visual
          ? <img className="featured-art" src={item.visual} alt="" loading="eager" />
          : <ProjectMark item={item} large />}
      </span>
      <span className="featured-copy">
        <span className="featured-title"><strong>{displayName(item.name)}</strong><StarBadge item={item} /></span>
        <span className="featured-description">{item.description}</span>
        <span className="featured-meta"><span>{item.source}</span><span aria-hidden="true">Open ↗</span></span>
      </span>
    </ExternalLink>
  )
}

function ProjectCard({ item }) {
  return (
    <ExternalLink className={`project-card${item.visual ? ' has-visual' : ''}`} href={item.url} style={{ '--accent': item.accent, '--wash': item.wash }}>
      {item.visual
        ? <span className="project-card-art"><img src={item.visual} alt="" loading="lazy" /></span>
        : <ProjectMark item={item} />}
      <span className="project-card-copy">
        <span className="project-card-title"><strong>{displayName(item.name)}</strong><StarBadge item={item} /></span>
        <span className="project-description">{item.description}</span>
        <span className="project-kind">{item.source === 'Projects' ? item.category : item.source}</span>
      </span>
      <span className="card-arrow" aria-hidden="true">↗</span>
    </ExternalLink>
  )
}

function SectionTitle({ children, count, action }) {
  return <div className="section-title"><h2>{children}</h2>{count != null && <span>{count}</span>}{action}</div>
}

function HomePage({ navigate, work }) {
  const featured = FEATURED_WORK.map((name) => work.find((item) => item.name === name)).filter(Boolean)
  return (
    <>
      <section className="home-lead">
        <div><h1>Things I’ve made.</h1><p>Apps, games, tiny tools, and weird internet experiments.</p></div>
        <div className="intro-links"><ExternalLink href="https://github.com/apoorvdarshan">GitHub ↗</ExternalLink><ExternalLink href="https://www.linkedin.com/in/apoorvdarshan">LinkedIn ↗</ExternalLink><ExternalLink href="https://x.com/apoorvdarshan">X ↗</ExternalLink></div>
      </section>

      <section className="home-section first-projects">
        <SectionTitle count={featured.length} action={<InternalLink className="section-action" to="/projects" onNavigate={navigate}>See all {work.length} →</InternalLink>}>Start here</SectionTitle>
        <div className="featured-grid">{featured.map((item) => <FeaturedCard key={item.name} item={item} />)}</div>
      </section>

      <section className="home-shortcuts">
        <InternalLink to="/projects" onNavigate={navigate}><strong>{work.length}</strong><span>all projects</span><b>→</b></InternalLink>
        <InternalLink to="/open-source" onNavigate={navigate}><strong>{profile.openSource.length}</strong><span>open-source contributions</span><b>→</b></InternalLink>
        <InternalLink to="/experience" onNavigate={navigate}><strong>6,376</strong><span>Fud AI downloads</span><b>→</b></InternalLink>
      </section>
    </>
  )
}

function ProjectsPage({ work }) {
  const [filter, setFilter] = useState('All')
  const visible = filter === 'All' ? work : work.filter((item) => item.filters.includes(filter))
  return (
    <>
      <section className="page-intro"><h1>Everything I’ve built.</h1><p>{work.length} apps, games, extensions, tools, experiments, and strange ideas.</p></section>
      <div className="filter-row" aria-label="Filter projects">
        {WORK_FILTERS.map((item) => <button className={filter === item ? 'active' : ''} type="button" key={item} onClick={() => setFilter(item)}>{item}</button>)}
      </div>
      <section className="project-grid all-projects" aria-live="polite">{visible.map((item) => <ProjectCard key={`${item.source}-${item.name}`} item={item} />)}</section>
    </>
  )
}

function contributionOwner(item) {
  const owner = CONTRIBUTION_LOGOS[item.name]
  if (owner) return owner
  try {
    const parts = new URL(item.url).pathname.split('/').filter(Boolean)
    return parts[0] || 'github'
  } catch { return 'github' }
}

function ContributionLogo({ item }) {
  const owner = contributionOwner(item)
  return <ExternalLink className="contribution-logo" href={item.url} ariaLabel={`${displayName(item.name)} contribution`}><img src={`https://github.com/${owner}.png?size=96`} alt="" loading="lazy" /><span>{displayName(item.name)}</span></ExternalLink>
}

function OpenSourcePage() {
  const [query, setQuery] = useState('')
  const visible = profile.openSource.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <>
      <section className="page-intro"><h1>Open source.</h1><p>{profile.openSource.length} contributions, each linked to the original pull request or contribution history.</p></section>
      <label className="search-field"><span>Search contributions</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="TensorFlow, docs, Python…" /></label>
      <section className="contribution-list" aria-live="polite">
        {visible.map((item) => {
          const owner = contributionOwner(item)
          return <ExternalLink className="contribution-row" href={item.url} key={`${item.name}-${item.url}`}><img src={`https://github.com/${owner}.png?size=96`} alt="" loading="lazy" /><span><strong>{displayName(item.name)}</strong><small>{item.description}</small></span><StarBadge item={item} /><span aria-hidden="true">↗</span></ExternalLink>
        })}
      </section>
    </>
  )
}

function Timeline({ items, marks, education = false }) {
  return <div className="timeline">{items.map((item) => {
    const title = education ? item.institution : item.role
    const subtitle = education ? item.program : item.company
    const mark = education ? marks[item.institution] : marks[item.company]
    return <article className="timeline-card" key={`${title}-${subtitle}-${item.dates}`}>{mark ? <img src={mark} alt="" loading="lazy" /> : <span className="timeline-initial" aria-hidden="true">{title.split(/\s+/).map((word) => word[0]).slice(0, 2).join('')}</span>}<div><p className="timeline-date">{item.dates}</p><h2>{title}</h2><p className="timeline-subtitle">{subtitle}</p>{education ? <p>{[item.grade, item.note].filter(Boolean).join(' · ')}</p> : <p>{item.summary}</p>}</div></article>
  })}</div>
}

function AboutPage({ navigate }) {
  return (
    <>
      <section className="page-intro about-intro"><h1>A builder who follows curiosity.</h1><p>I make software across iOS, Android, the web, browsers, AI, and 3D—then share the useful parts in public.</p></section>
      <section className="number-strip" aria-label="Profile figures">
        <span><strong>6,376</strong><small>Fud AI downloads</small></span>
        <span><strong>53</strong><small>things shipped</small></span>
        <span><strong>{profile.openSource.length}</strong><small>open-source entries</small></span>
        <span><strong>13K+</strong><small>LinkedIn community</small></span>
      </section>
      <div className="about-nav"><span>Experience</span><InternalLink to="/education" onNavigate={navigate}>Education →</InternalLink></div>
      <Timeline items={linkedinExperience} marks={EXPERIENCE_MARKS} />
      <section className="simple-split">
        <div><p className="eyebrow">Right now</p><h2>Still making.</h2></div>
        <ul>{profile.currentWork.map((item) => <li key={item.name}><strong>{item.name}</strong><span>{item.description}</span></li>)}</ul>
      </section>
      <section className="recognition"><h2>Recognition</h2><ul>{profile.recognition.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section className="around">
        <div><p className="eyebrow">Elsewhere</p><h2>Find me around the internet.</h2><p>Writing, building, learning, and occasionally posting the strange parts.</p></div>
        <div className="around-links">{profile.connect.map((item) => <ExternalLink href={item.url} key={item.name}>{item.name} ↗</ExternalLink>)}</div>
      </section>
      <section className="small-notes">
        <ExternalLink href={profile.writing.url}><span>Writing</span><strong>{profile.writing.name} ↗</strong><small>{profile.writing.description}</small></ExternalLink>
        <blockquote>{profile.philosophy}</blockquote>
        <details><summary>Five random facts</summary><ul>{profile.randomFacts.map((item) => <li key={item}>{item}</li>)}</ul></details>
      </section>
    </>
  )
}

function EducationPage({ navigate }) {
  return (
    <>
      <section className="page-intro"><h1>Education.</h1><p>Computer science, engineering, mathematics, and years of figuring things out.</p></section>
      <div className="about-nav"><InternalLink to="/experience" onNavigate={navigate}>← Experience</InternalLink><span>Education</span></div>
      <Timeline items={linkedinEducation} marks={EDUCATION_MARKS} education />
    </>
  )
}

function SiteFooter({ navigate }) {
  return (
    <footer className="site-footer">
      <Brand navigate={navigate} />
      <p>Useful software and strange internet things.</p>
      <div><ExternalLink href="mailto:ad13dtu@gmail.com">Email</ExternalLink><ExternalLink href="https://github.com/apoorvdarshan">GitHub</ExternalLink><ExternalLink href="https://www.linkedin.com/in/apoorvdarshan">LinkedIn</ExternalLink><ExternalLink href="https://x.com/apoorvdarshan">X</ExternalLink></div>
    </footer>
  )
}

function App() {
  const [path, setPath] = useState(currentPath)
  const work = useMemo(() => buildWorkCatalog(profile), [])

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
  if (path === '/projects') page = <ProjectsPage work={work} />
  else if (path === '/open-source') page = <OpenSourcePage />
  else if (path === '/education') page = <EducationPage navigate={navigate} />
  else if (path === '/experience') page = <AboutPage navigate={navigate} />
  else page = <HomePage navigate={navigate} work={work} />

  return <><a className="skip-link" href="#content">Skip to content</a><SiteHeader path={path} navigate={navigate} /><main id="content" className="page-shell"><div className="page-enter" key={path}>{page}</div></main><SiteFooter navigate={navigate} /></>
}

export default App
