const IMAGE_COVERS = {
  'fud-ai': '/portfolio/fud-ai.webp',
  verceltics: '/portfolio/verceltics.webp',
  scowld: '/portfolio/scowld.webp',
  'browser-cookie-bridge': '/portfolio/browser-cookie-bridge.webp',
  crossposter: '/portfolio/crossposter.webp',
  abysm: '/portfolio/abysm.webp',
  'machina-cordis': '/portfolio/machina-cordis.webp',
  'helios-01': '/portfolio/helios-01.webp',
  TetherShot: '/portfolio/tethershot.webp',
  'hash-harbor': '/portfolio/hash-harbor-art.webp',
  'multi-account-gmail-mcp': '/portfolio/multi-account-gmail-mcp-art.webp',
  'macbook-24x7-agents': '/portfolio/macbook-24x7-agents-art.webp',
  'github-readme-contribution-merger': '/portfolio/github-readme-contribution-merger-art.webp',
  'dob-selector': '/portfolio/dob-selector-art.webp',
  'opengraph-studio': '/portfolio/opengraph-studio-art.webp',
}

export const FEATURED_WORK = [
  'fud-ai',
  'browser-cookie-bridge',
  'scowld',
  'crossposter',
  'abysm',
  'machina-cordis',
  'verceltics',
  'helios-01',
  'TetherShot',
]

const CATEGORY_MEMBERS = {
  AI: new Set([
    'fud-ai', 'scowld', 'macbook-24x7-agents', 'multi-account-gmail-mcp',
    'linkedin-connection-sender', 'wellfound-bot', 'karasufumi', 'daxerly', 'resume-codes',
  ]),
  'Developer tools': new Set([
    'browser-cookie-bridge', 'crossposter', 'hash-harbor', 'TetherShot', 'rekisei',
    'opengraph-studio', 'github-readme-contribution-merger', 'compress-image', 'claw-c',
    'profile', 'axentra-os-affiliate',
  ]),
  '3D & art': new Set(['machina-cordis', 'helios-01', 'doodle-beats']),
  Experiments: new Set([
    'nornlore', 'how-rich-are-you', 'billionaire-smash', 'dob-selector',
    'slot-machine-date-picker', 'Xscore', 'zyro', 'zombie-game', 'gesture-keyboard',
    'drawtica', 'peek-a-pupil', 'headshot-tracker', 'redbull', 'simon-says',
    'toggle-button', 'bmw', 'monster-energy', 'random-dog-images', 'random-cat-facts',
    'spotify-clone', 'todo-app', 'dtu-clone',
  ]),
}

const PALETTES = [
  ['#4666ff', '#dce3ff'],
  ['#ff6b57', '#ffe1db'],
  ['#52d6a2', '#d9f8ea'],
  ['#f4c84a', '#fff0b9'],
  ['#9d73ea', '#eadfff'],
  ['#36a6c8', '#d5f2f7'],
]

export const WORK_FILTERS = ['All', 'Apps', 'Browser', 'Developer tools', 'AI', 'Experiments', '3D & art']

function stableNumber(value) {
  return [...value].reduce((total, character) => total + character.charCodeAt(0), 0)
}

export function buildWorkCatalog(profile) {
  const groups = [
    ['Apps', profile.apps],
    ['Games', profile.games],
    ['Browser', profile.extensions],
    ['Projects', profile.projects],
  ]

  return groups.flatMap(([source, items]) => items.map((item) => {
    let category = source
    if (source === 'Games') category = 'Apps'
    if (source === 'Projects') {
      category = Object.entries(CATEGORY_MEMBERS).find(([, names]) => names.has(item.name))?.[0] || 'Developer tools'
    }

    const filters = new Set([category])
    if (source === 'Apps' || source === 'Games') filters.add('Apps')
    if (source === 'Browser') filters.add('Browser')
    Object.entries(CATEGORY_MEMBERS).forEach(([label, names]) => {
      if (names.has(item.name)) filters.add(label)
    })

    const palette = PALETTES[stableNumber(item.name) % PALETTES.length]
    return {
      ...item,
      source,
      category,
      filters: [...filters],
      cover: IMAGE_COVERS[item.name] || '',
      accent: palette[0],
      accentSoft: palette[1],
    }
  }))
}
