import { access, readFile, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { fileURLToPath } from 'node:url'

const README_URL = 'https://raw.githubusercontent.com/apoorvdarshan/apoorvdarshan/main/README.md'
const README_API_URL = 'https://api.github.com/repos/apoorvdarshan/apoorvdarshan/contents/README.md?ref=main'
const OUTPUT_URL = new URL('../src/profileData.generated.json', import.meta.url)

const decode = (value = '') => value
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replaceAll('&bull;', '')
  .replaceAll('&gt;', '>')
  .replaceAll('&lt;', '<')

const plainText = (value = '') => decode(value)
  .replace(/<img[^>]*alt="([^"]*)"[^>]*>/g, (_, alt) => alt === 'Stars' ? '' : alt)
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, ' ')
  .trim()

function section(readme, start, end) {
  const startIndex = readme.indexOf(start)
  const endIndex = end ? readme.indexOf(end, startIndex + start.length) : readme.length
  return startIndex === -1 ? '' : readme.slice(startIndex, endIndex === -1 ? readme.length : endIndex)
}

function htmlEntries(readme, start, end) {
  return section(readme, start, end).split('\n').flatMap((line) => {
    const match = line.match(/<strong><a href="([^"]+)">([^<]+)<\/a><\/strong>(.*?)(?:<\/li>|<\/div>)/)
    if (!match) return []

    const prefix = line.slice(0, line.indexOf('<strong>'))
    const marker = plainText(prefix).replace(/^•\s*/, '').trim()
    const starBadgeUrl = decode(line.match(/<img alt="Stars" src="([^"]+)"/)?.[1] ?? '')
    const rawTail = plainText(match[3])
    const status = rawTail.match(/^\(([^)]+)\)/)?.[1] ?? ''
    const description = rawTail
      .replace(/^\([^)]+\)\s*/, '')
      .replace(/^\s*-\s*/, '')
      .replace(/\(by\s*\)/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    return [{
      name: plainText(match[2]),
      url: decode(match[1]),
      description,
      status,
      marker,
      starBadgeUrl,
    }]
  })
}

function markdownBullets(value) {
  return value.split('\n').flatMap((line) => {
    const match = line.match(/^-\s+(.*)$/)
    return match ? [plainText(match[1]).replaceAll('**', '')] : []
  })
}

function namedBullets(value) {
  return value.split('\n').flatMap((line) => {
    const match = line.match(/^-\s+\*\*([^*]+)\*\*\s*-\s*(.+)$/)
    return match ? [{ name: plainText(match[1]), description: plainText(match[2]) }] : []
  })
}

function badgeLinks(value) {
  return value.split('\n').flatMap((line) => {
    const match = line.match(/^\[!\[([^\]]+)\]\([^)]*\)\]\(([^)]+)\)/)
    if (!match) return []
    const sourceName = plainText(match[1]).replace(/^[-★\s]+$/, 'X')
    return [{ name: sourceName === 'Twitter' ? 'X' : sourceName, url: decode(match[2]) }]
  })
}

async function attachStarCounts(data, previousStarCounts = new Map()) {
  const queue = ['apps', 'games', 'extensions', 'projects', 'openSource']
    .flatMap((key) => data[key])
    .filter((item) => item.starBadgeUrl)

  const workers = Array.from({ length: Math.min(8, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift()
      try {
        const response = await fetch(item.starBadgeUrl, { headers: { 'User-Agent': 'apoorv-profile-build' } })
        if (!response.ok) throw new Error(`badge returned ${response.status}`)
        const svg = await response.text()
        item.starCount = svg.match(/aria-label="★:\s*([^"]+)"/)?.[1]
          || previousStarCounts.get(item.starBadgeUrl)
          || ''
      } catch (error) {
        item.starCount = previousStarCounts.get(item.starBadgeUrl) ?? ''
        console.warn(`Star count unavailable for ${item.name}: ${error.message}`)
      }
    }
  })

  await Promise.all(workers)
}

function parseReadme(readme) {
  const beforeApps = section(readme, '# Hi,', '## Apps')
  const technologyMatches = [...beforeApps.matchAll(/!\[([^\]]+)\]\(https:\/\/img\.shields\.io\/badge/g)]
  const technologies = technologyMatches.map((match) => match[1])
  const tagline = readme.split('\n').find((line) => line.includes('AI-powered builder')) ?? ''
  const statement = beforeApps.split('\n').find((line) => line.startsWith('> '))?.slice(2) ?? ''
  const activitySection = section(readme, '## GitHub Activity', '## What I\'m Doing')
  const activityImage = activitySection.match(/<img src="([^"]+)"/)?.[1] ?? ''
  const philosophySection = section(readme, '### Philosophy')
  const philosophy = philosophySection.split('\n').find((line) => line.startsWith('> '))?.slice(2) ?? ''
  const randomFactsPart = philosophySection.split('<summary>Random Facts</summary>')[1]?.split('</details>')[0] ?? ''

  return {
    source: {
      label: 'GitHub profile README',
      url: 'https://github.com/apoorvdarshan',
      rawUrl: README_URL,
    },
    intro: {
      title: "Hi, I'm Apoorv 👋",
      location: 'Delhi',
      tagline: plainText(tagline).replaceAll('**', ''),
      statement: plainText(statement),
    },
    technologies,
    apps: htmlEntries(readme, '## Apps', '## Games'),
    games: htmlEntries(readme, '## Games', '## Chrome Extensions'),
    extensions: htmlEntries(readme, '## Chrome Extensions', '## Projects'),
    projects: htmlEntries(readme, '## Projects', '### Open Source Contributions'),
    openSource: htmlEntries(readme, '### Open Source Contributions', '## GitHub Activity'),
    activityImage,
    currentWork: namedBullets(section(readme, "## What I'm Doing", '## Connect')),
    connect: badgeLinks(section(readme, '## Connect', '### Recognition')),
    recognition: markdownBullets(section(readme, '### Recognition', '### Philosophy')),
    philosophy: plainText(philosophy),
    randomFacts: markdownBullets(randomFactsPart),
  }
}

async function main() {
  let readme
  try {
    const response = await fetch(README_API_URL, {
      headers: {
        Accept: 'application/vnd.github.raw+json',
        'User-Agent': 'apoorv-profile-build',
      },
    })
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`)
    readme = await response.text()
  } catch (error) {
    try {
      await access(OUTPUT_URL, constants.R_OK)
      console.warn(`README sync skipped: ${error.message}. Using the committed snapshot.`)
      return
    } catch {
      throw error
    }
  }

  const data = parseReadme(readme)
  let previousStarCounts = new Map()
  try {
    const previous = JSON.parse(await readFile(OUTPUT_URL, 'utf8'))
    previousStarCounts = new Map(
      ['apps', 'games', 'extensions', 'projects', 'openSource']
        .flatMap((key) => previous[key] ?? [])
        .filter((item) => item.starBadgeUrl && item.starCount)
        .map((item) => [item.starBadgeUrl, item.starCount]),
    )
  } catch {
    // The first sync has no committed snapshot to fall back to.
  }
  await attachStarCounts(data, previousStarCounts)
  await writeFile(fileURLToPath(OUTPUT_URL), `${JSON.stringify(data, null, 2)}\n`)
  console.log(`Synced GitHub README: ${data.apps.length} apps, ${data.games.length} games, ${data.extensions.length} extensions, ${data.projects.length} projects, ${data.openSource.length} open-source contributions.`)
}

await main()
