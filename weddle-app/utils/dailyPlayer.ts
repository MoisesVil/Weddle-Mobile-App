import type { Player } from '../types/player';

/**
 * Returns the same player for every user on the same calendar day.
 * No server required — the selection is purely deterministic from the date.
 *
 * How it works:
 *   1. Get today's date as a numeric seed (YYYYMMDD → e.g. 20260403)
 *   2. Use modulo to pick an index in the players array
 *
 * As long as every client has the same players.json, they will all pick the
 * same player on the same day.
 */
export function getDailyPlayer(players: Player[]): Player {
  if (players.length === 0) throw new Error('Player list is empty');

  const today  = new Date().toISOString().slice(0, 10); // "2026-04-03"
  const seed   = parseInt(today.replace(/-/g, ''), 10); // 20260403
  const index  = seed % players.length;

  return players[index];
}

/**
 * Returns today's date string in YYYY-MM-DD format.
 * Used to detect when the app needs to reset to a new puzzle.
 */
export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
