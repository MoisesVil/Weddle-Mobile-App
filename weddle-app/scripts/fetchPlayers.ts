/**
 * Run this script once (and again each season) to regenerate data/players.json.
 *
 *   npx tsx scripts/fetchPlayers.ts
 *
 * Requires Node 18+ (uses built-in fetch).
 * Pulls active NFL players from the free Sleeper API — no API key needed.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { Player } from '../types/player';

// ---------------------------------------------------------------------------
// NFL team → conference / division lookup
// ---------------------------------------------------------------------------
const TEAM_INFO: Record<string, { conference: string; division: string }> = {
  // AFC East
  BUF: { conference: 'AFC', division: 'AFC East' },
  MIA: { conference: 'AFC', division: 'AFC East' },
  NE:  { conference: 'AFC', division: 'AFC East' },
  NYJ: { conference: 'AFC', division: 'AFC East' },
  // AFC North
  BAL: { conference: 'AFC', division: 'AFC North' },
  CIN: { conference: 'AFC', division: 'AFC North' },
  CLE: { conference: 'AFC', division: 'AFC North' },
  PIT: { conference: 'AFC', division: 'AFC North' },
  // AFC South
  HOU: { conference: 'AFC', division: 'AFC South' },
  IND: { conference: 'AFC', division: 'AFC South' },
  JAX: { conference: 'AFC', division: 'AFC South' },
  TEN: { conference: 'AFC', division: 'AFC South' },
  // AFC West
  DEN: { conference: 'AFC', division: 'AFC West' },
  KC:  { conference: 'AFC', division: 'AFC West' },
  LV:  { conference: 'AFC', division: 'AFC West' },
  LAC: { conference: 'AFC', division: 'AFC West' },
  // NFC East
  DAL: { conference: 'NFC', division: 'NFC East' },
  NYG: { conference: 'NFC', division: 'NFC East' },
  PHI: { conference: 'NFC', division: 'NFC East' },
  WAS: { conference: 'NFC', division: 'NFC East' },
  // NFC North
  CHI: { conference: 'NFC', division: 'NFC North' },
  DET: { conference: 'NFC', division: 'NFC North' },
  GB:  { conference: 'NFC', division: 'NFC North' },
  MIN: { conference: 'NFC', division: 'NFC North' },
  // NFC South
  ATL: { conference: 'NFC', division: 'NFC South' },
  CAR: { conference: 'NFC', division: 'NFC South' },
  NO:  { conference: 'NFC', division: 'NFC South' },
  TB:  { conference: 'NFC', division: 'NFC South' },
  // NFC West
  ARI: { conference: 'NFC', division: 'NFC West' },
  LAR: { conference: 'NFC', division: 'NFC West' },
  SEA: { conference: 'NFC', division: 'NFC West' },
  SF:  { conference: 'NFC', division: 'NFC West' },
};

// Positions to include — covers offense, defense, and special teams
const ALLOWED_POSITIONS = new Set([
  'QB', 'RB', 'WR', 'TE', 'K',
  'LB', 'CB', 'S', 'DE', 'DT',
]);

// ---------------------------------------------------------------------------
// Height parser — Sleeper sends height as "6'2\"" or plain inches as a string
// ---------------------------------------------------------------------------
function parseHeight(raw: string): number | null {
  const feetInches = raw.match(/^(\d+)'(\d+)"?$/);
  if (feetInches) {
    return parseInt(feetInches[1]) * 12 + parseInt(feetInches[2]);
  }
  const asNumber = parseInt(raw);
  // Sanity check: adult NFL player height in inches is between 60 (5'0") and 84 (7'0")
  if (!isNaN(asNumber) && asNumber >= 60 && asNumber <= 84) return asNumber;
  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('Fetching all NFL players from Sleeper API...');

  const res = await fetch('https://api.sleeper.app/v1/players/nfl');
  if (!res.ok) throw new Error(`Sleeper API error: ${res.status}`);

  // Sleeper returns a giant object keyed by player_id
  const raw = (await res.json()) as Record<string, Record<string, unknown>>;

  const players: Player[] = [];
  let skipped = 0;

  for (const [id, p] of Object.entries(raw)) {
    // Only active players on a known NFL team
    if (p['status'] !== 'Active') { skipped++; continue; }
    if (!p['team'] || !TEAM_INFO[p['team'] as string]) { skipped++; continue; }
    if (!p['full_name']) { skipped++; continue; }
    if (!ALLOWED_POSITIONS.has(p['position'] as string)) { skipped++; continue; }

    const height = p['height'] ? parseHeight(String(p['height'])) : null;
    const age    = p['age']    ? parseInt(String(p['age']))        : null;
    const jersey = p['number'] ? parseInt(String(p['number']))     : null;

    // Skip players missing any attribute we need for the guessing grid
    if (!height || !age || !jersey) { skipped++; continue; }

    const team = p['team'] as string;

    players.push({
      id,
      name:          p['full_name'] as string,
      team,
      conference:    TEAM_INFO[team].conference,
      division:      TEAM_INFO[team].division,
      position:      p['position'] as string,
      height,
      age,
      jerseyNumber:  jersey,
      yearsInLeague: typeof p['years_exp'] === 'number' ? p['years_exp'] : 0,
    });
  }

  // Alphabetical order so autocomplete works naturally
  players.sort((a, b) => a.name.localeCompare(b.name));

  const outDir  = join(__dirname, '../data');
  const outPath = join(outDir, 'players.json');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, JSON.stringify(players, null, 2));

  console.log(`Done!`);
  console.log(`  Included : ${players.length} active players`);
  console.log(`  Skipped  : ${skipped} (inactive / missing data / wrong position)`);
  console.log(`  Output   : data/players.json`);
}

main().catch((err) => {
  console.error('Failed to fetch players:', err);
  process.exit(1);
});
