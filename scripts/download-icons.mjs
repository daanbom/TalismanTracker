/**
 * Downloads Talisman character portrait images from the wikidot fan wiki
 * and saves them to /public/icons/ with filenames matching the icon_key format
 * (lowercase, spaces replaced with hyphens).
 *
 * Usage: node scripts/download-icons.mjs
 */

import { createWriteStream, mkdirSync } from 'fs'
import { pipeline } from 'stream/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'icons')

mkdirSync(OUT_DIR, { recursive: true })

// All characters from the DB seed + Toad (special case)
const CHARACTERS = [
  // Base game
  'Assassin', 'Druid', 'Dwarf', 'Elf', 'Ghoul', 'Gladiator', 'Highwayman',
  'Knight', 'Mage', 'Monk', 'Priest', 'Prophetess', 'Sorceress', 'Thief',
  'Troll', 'Warrior', 'Witch', 'Wizard', 'Toad',
  // The Reaper
  'Chivalric Knight', 'Conjurer', 'Demonologist', 'Gravedigger', 'Ninja', 'Sage',
  // The Dungeon
  'Amazon', 'Halfling', 'Mercenary', 'Philosopher', 'Rogue', 'Scout',
  // The Highland
  'Clan Warrior', 'Fairy', 'Hunter', 'Mystic', 'Ranger', 'Sprite',
  // The Sacred Pool
  'Alchemist', 'Enchantress', 'Paladin', 'Shaman',
  // The Harbinger
  'Arcanist', 'Black Witch', 'Doomsayer', 'Swordsman',
  // The Frostmarch
  'Ice Queen', 'Mountaineer', 'Polar Warbear', 'Viking',
  // The Nether Realm
  'Dark Cultist', 'Gambler', 'Swashbuckler', 'Vampire Hunter',
  // The Clockwork Kingdom
  'Artificer', 'Automaton', 'Engineer', 'Steam Mage',
  // The Blood Moon
  'Lycanthrope', 'Vampire', 'Warlord', 'Zealot',
  // The City
  'Archaeologist', 'Merchant', 'Pit Fighter', 'Tavern Maid',
  // The Woodland
  'Forest Guardian', 'Satyr', 'Wood Elf',
]

function nameToKey(name) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

// Wikidot stores uploaded files at this path. Filenames are typically the
// character name as-is (with space → underscore or with exact case).
// We try a few variants per character.
function candidateUrls(name) {
  const spaceUnderscore = name.replace(/\s+/g, '_')
  const spaceHyphen = name.replace(/\s+/g, '-')
  const base = 'http://talisman.wikidot.com/local--files/character'
  return [
    `${base}/${spaceUnderscore}.png`,
    `${base}/${name}.png`,
    `${base}/${spaceHyphen}.png`,
    `${base}/${spaceUnderscore}.jpg`,
    `${base}/${name}.jpg`,
    `${base}/${spaceHyphen}.jpg`,
  ]
}

// Toad image from the GitHub issue comment
const TOAD_URL = 'https://github.com/user-attachments/assets/0843a8eb-91ce-44c3-bb2c-97951e8d2d77'

async function tryDownload(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) return false
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.startsWith('image/')) return false
  await pipeline(res.body, createWriteStream(destPath))
  return true
}

async function downloadCharacter(name) {
  const key = nameToKey(name)
  const dest = path.join(OUT_DIR, `${key}.png`)

  if (name === 'Toad') {
    const ok = await tryDownload(TOAD_URL, dest)
    console.log(ok ? `  ✓ toad` : `  ✗ toad (manual download needed)`)
    return
  }

  for (const url of candidateUrls(name)) {
    try {
      const ok = await tryDownload(url, dest)
      if (ok) {
        console.log(`  ✓ ${key}  (${url})`)
        return
      }
    } catch {
      // try next
    }
  }
  console.log(`  ✗ ${key}  — not found, add manually to public/icons/${key}.png`)
}

console.log(`Downloading ${CHARACTERS.length} character icons to public/icons/\n`)
for (const name of CHARACTERS) {
  await downloadCharacter(name)
}
console.log('\nDone. Missing icons show as "?" in the picker until files are added.')
