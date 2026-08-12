const REAL_ICONS = new Set([
  'TetherShot', 'abysm', 'bmw', 'browser-cookie-bridge', 'compress-image',
  'crossposter', 'daxerly', 'dob-selector', 'doodle-beats', 'drawtica', 'dtu-clone',
  'fud-ai', 'gesture-keyboard', 'hash-harbor',
  'headshot-tracker', 'helios-01', 'iitjee', 'karasufumi',
  'machina-cordis', 'nornlore', 'opengraph-studio',
  'peek-a-pupil', 'profile', 'quit-all', 'random-cat-facts', 'random-dog-images',
  'redbull', 'resume-codes', 'scowld', 'simon-says', 'slot-machine-date-picker',
  'spotify-clone', 'streaming-autopause', 'toggle-button', 'verceltics',
  'x-country-filter', 'zombie-game', 'zyro',
])

const REAL_VISUALS = new Set([
  'fud-ai', 'verceltics', 'scowld', 'abysm', 'browser-cookie-bridge',
  'crossposter', 'TetherShot', 'machina-cordis', 'helios-01',
])

export const FEATURED_WORK = [
  'fud-ai',
  'browser-cookie-bridge',
  'scowld',
  'crossposter',
  'abysm',
  'machina-cordis',
  'verceltics',
  'TetherShot',
]

const CATEGORY_MEMBERS = {
  AI: new Set([
    'fud-ai', 'scowld', 'multi-account-gmail-mcp',
    'linkedin-connection-sender', 'karasufumi', 'daxerly', 'resume-codes',
  ]),
  'Developer tools': new Set([
    'browser-cookie-bridge', 'crossposter', 'hash-harbor', 'TetherShot', 'rekisei',
    'opengraph-studio', 'compress-image', 'claw-c',
    'profile', 'axentra-os-affiliate',
  ]),
  '3D & art': new Set(['machina-cordis', 'helios-01', 'doodle-beats']),
  Experiments: new Set([
    'nornlore', 'billionaire-smash', 'dob-selector',
    'slot-machine-date-picker', 'Xscore', 'zyro', 'zombie-game', 'gesture-keyboard',
    'drawtica', 'peek-a-pupil', 'headshot-tracker', 'redbull', 'simon-says',
    'toggle-button', 'bmw', 'monster-energy', 'random-dog-images', 'random-cat-facts',
    'spotify-clone', 'todo-app', 'dtu-clone',
  ]),
}

const COLOR_PAIRS = [
  ['#ff6b57', '#2a1110'],
  ['#ffd54a', '#2a2105'],
  ['#5dd6a7', '#0b2119'],
  ['#70a5ff', '#101c34'],
  ['#be8cff', '#21142f'],
  ['#ff8fc6', '#2c1422'],
]

export const WORK_FILTERS = ['All', 'Apps', 'Games', 'Extensions', 'Developer tools', 'AI', 'Experiments', '3D & art']

function stableNumber(value) {
  return [...value].reduce((total, character) => total + character.charCodeAt(0), 0)
}

export function buildWorkCatalog(profile) {
  const groups = [
    ['Apps', profile.apps],
    ['Games', profile.games],
    ['Extensions', profile.extensions],
    ['Projects', profile.projects],
  ]

  return groups.flatMap(([source, items]) => items.map((item) => {
    let category = source
    if (source === 'Projects') {
      category = Object.entries(CATEGORY_MEMBERS).find(([, names]) => names.has(item.name))?.[0] || 'Developer tools'
    }

    const filters = new Set([source, category])
    Object.entries(CATEGORY_MEMBERS).forEach(([label, names]) => {
      if (names.has(item.name)) filters.add(label)
    })

    const colorPair = COLOR_PAIRS[stableNumber(item.name) % COLOR_PAIRS.length]
    return {
      ...item,
      source,
      category,
      filters: [...filters],
      icon: REAL_ICONS.has(item.name) ? `/project-icons/${item.name}.webp` : null,
      visual: REAL_VISUALS.has(item.name) ? `/project-visuals/${item.name}.webp` : null,
      accent: colorPair[0],
      wash: colorPair[1],
    }
  }))
}
