const IMAGE_COVERS = {
  'fud-ai': '/portfolio/fud-ai-art-v2.webp',
  verceltics: '/portfolio/verceltics.webp',
  scowld: '/portfolio/scowld-art-v2.webp',
  'browser-cookie-bridge': '/portfolio/browser-cookie-bridge-art-v2.webp',
  crossposter: '/portfolio/crossposter-art-v2.webp',
  abysm: '/portfolio/abysm-art-v2.webp',
  'machina-cordis': '/portfolio/machina-cordis-art-v2.webp',
  'helios-01': '/portfolio/helios-01.webp',
  TetherShot: '/portfolio/tethershot.webp',
  'hash-harbor': '/portfolio/hash-harbor-art.webp',
  'multi-account-gmail-mcp': '/portfolio/multi-account-gmail-mcp-art.webp',
  'macbook-24x7-agents': '/portfolio/macbook-24x7-agents-art.webp',
  'github-readme-contribution-merger': '/portfolio/github-readme-contribution-merger-art.webp',
  'dob-selector': '/portfolio/dob-selector-art.webp',
  'opengraph-studio': '/portfolio/opengraph-studio-art.webp',
  'quit-all': '/portfolio/projects/quit-all.webp',
  iitjee: '/portfolio/projects/iitjee.webp',
  'x-country-filter': '/portfolio/projects/x-country-filter.webp',
  'newest-youtube-search': '/portfolio/projects/newest-youtube-search.webp',
  'streaming-autopause': '/portfolio/projects/streaming-autopause.webp',
  'streaming-indian-filter': '/portfolio/projects/streaming-indian-filter.webp',
  profile: '/portfolio/projects/profile.webp',
  'linkedin-connection-sender': '/portfolio/projects/linkedin-connection-sender.webp',
  rekisei: '/portfolio/projects/rekisei.webp',
  nornlore: '/portfolio/projects/nornlore.webp',
  'how-rich-are-you': '/portfolio/projects/how-rich-are-you.webp',
  'billionaire-smash': '/portfolio/projects/billionaire-smash.webp',
  daxerly: '/portfolio/projects/daxerly.webp',
  'doodle-beats': '/portfolio/projects/doodle-beats.webp',
  'slot-machine-date-picker': '/portfolio/projects/slot-machine-date-picker.webp',
  'wellfound-bot': '/portfolio/projects/wellfound-bot.webp',
  karasufumi: '/portfolio/projects/karasufumi.webp',
  Xscore: '/portfolio/projects/Xscore.webp',
  zyro: '/portfolio/projects/zyro.webp',
  'axentra-os-affiliate': '/portfolio/projects/axentra-os-affiliate.webp',
  'claw-c': '/portfolio/projects/claw-c.webp',
  'resume-codes': '/portfolio/projects/resume-codes.webp',
  'zombie-game': '/portfolio/projects/zombie-game.webp',
  'gesture-keyboard': '/portfolio/projects/gesture-keyboard.webp',
  drawtica: '/portfolio/projects/drawtica.webp',
  'peek-a-pupil': '/portfolio/projects/peek-a-pupil.webp',
  'headshot-tracker': '/portfolio/projects/headshot-tracker.webp',
  'compress-image': '/portfolio/projects/compress-image.webp',
  'dtu-clone': '/portfolio/projects/dtu-clone.webp',
  redbull: '/portfolio/projects/redbull.webp',
  'simon-says': '/portfolio/projects/simon-says.webp',
  'toggle-button': '/portfolio/projects/toggle-button.webp',
  bmw: '/portfolio/projects/bmw.webp',
  'monster-energy': '/portfolio/projects/monster-energy.webp',
  'random-dog-images': '/portfolio/projects/random-dog-images.webp',
  'random-cat-facts': '/portfolio/projects/random-cat-facts.webp',
  'todo-app': '/portfolio/projects/todo-app.webp',
  'spotify-clone': '/portfolio/projects/spotify-clone.webp',
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
      cover: IMAGE_COVERS[item.name],
      customCover: Boolean(IMAGE_COVERS[item.name]),
      accent: palette[0],
      accentSoft: palette[1],
    }
  }))
}
