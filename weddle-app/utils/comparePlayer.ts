import type { Player } from '../types/player';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Result for a single attribute tile */
export type TileResult = 'correct' | 'close' | 'wrong';

/**
 * For numeric attributes (height, age, jersey) we also expose a direction hint
 * so the UI can show an up/down arrow alongside the colour.
 */
export type NumericResult = {
  result: TileResult;
  direction: 'higher' | 'lower' | 'exact';
};

/** Full breakdown of one guess against the target player */
export type GuessResult = {
  // string attributes
  team:     TileResult;
  division: TileResult;
  position: TileResult;
  // numeric attributes — include direction for arrows in the UI
  height:   NumericResult;
  age:      NumericResult;
  jersey:   NumericResult;
};

// ---------------------------------------------------------------------------
// Thresholds for "close" on numeric attributes
// ---------------------------------------------------------------------------
const CLOSE_HEIGHT_INCHES = 2;   // ±2 inches
const CLOSE_AGE_YEARS     = 2;   // ±2 years
const CLOSE_JERSEY_NUM    = 5;   // ±5 jersey numbers

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function numericResult(
  guessVal: number,
  targetVal: number,
  closeThreshold: number,
): NumericResult {
  if (guessVal === targetVal) {
    return { result: 'correct', direction: 'exact' };
  }
  const diff      = Math.abs(guessVal - targetVal);
  const direction = targetVal > guessVal ? 'higher' : 'lower';
  return {
    result:    diff <= closeThreshold ? 'close' : 'wrong',
    direction,
  };
}

// ---------------------------------------------------------------------------
// Core comparison function
// ---------------------------------------------------------------------------

/**
 * Compares a guessed player against the secret target player and returns
 * color + direction feedback for every attribute shown in the grid.
 *
 * Green  (correct) — exact match
 * Yellow (close)   — same division / conference, or within numeric threshold
 * Grey   (wrong)   — no match
 */
export function comparePlayer(guess: Player, target: Player): GuessResult {
  // --- Team ---
  // Correct = same team, Close = same division (but different team)
  const team: TileResult =
    guess.team === target.team           ? 'correct' :
    guess.division === target.division   ? 'close'   : 'wrong';

  // --- Division ---
  // Correct = same division, Close = same conference (but different division)
  const division: TileResult =
    guess.division === target.division     ? 'correct' :
    guess.conference === target.conference ? 'close'   : 'wrong';

  // --- Position ---
  // Binary — either the same position or not
  const position: TileResult =
    guess.position === target.position ? 'correct' : 'wrong';

  return {
    team,
    division,
    position,
    height: numericResult(guess.height,      target.height,      CLOSE_HEIGHT_INCHES),
    age:    numericResult(guess.age,          target.age,         CLOSE_AGE_YEARS),
    jersey: numericResult(guess.jerseyNumber, target.jerseyNumber, CLOSE_JERSEY_NUM),
  };
}

// ---------------------------------------------------------------------------
// Helper: did this guess win the game?
// ---------------------------------------------------------------------------
export function isCorrectGuess(result: GuessResult): boolean {
  return (
    result.team     === 'correct' &&
    result.division === 'correct' &&
    result.position === 'correct' &&
    result.height.result === 'correct' &&
    result.age.result    === 'correct' &&
    result.jersey.result === 'correct'
  );
}

// ---------------------------------------------------------------------------
// Helper: human-readable height string for display ("6'2\"")
// ---------------------------------------------------------------------------
export function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12);
  const rem  = inches % 12;
  return `${feet}'${rem}"`;
}
