import { create } from 'zustand';
import type { Player } from '../types/player';
import type { GuessResult } from '../utils/comparePlayer';
import { comparePlayer, isCorrectGuess } from '../utils/comparePlayer';
import { getDailyPlayer, getTodayKey } from '../utils/dailyPlayer';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const MAX_GUESSES = 8;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GuessEntry = {
  player: Player;
  result: GuessResult;
};

export type GameStatus = 'playing' | 'won' | 'lost';

type GameState = {
  targetPlayer: Player | null;
  guesses: GuessEntry[];
  gameStatus: GameStatus;
  dateKey: string;

  /** Call once on app load — picks today's player and resets state. */
  initGame: (players: Player[]) => void;

  /** Submit a guessed player. No-op if the game is already over. */
  submitGuess: (player: Player) => void;
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGameStore = create<GameState>((set, get) => ({
  targetPlayer: null,
  guesses: [],
  gameStatus: 'playing',
  dateKey: '',

  initGame: (players) => {
    const today = getTodayKey();
    const target = getDailyPlayer(players);
    set({
      targetPlayer: target,
      guesses: [],
      gameStatus: 'playing',
      dateKey: today,
    });
  },

  submitGuess: (player) => {
    const { targetPlayer, guesses, gameStatus } = get();
    if (!targetPlayer || gameStatus !== 'playing') return;

    const result = comparePlayer(player, targetPlayer);
    const newGuesses: GuessEntry[] = [...guesses, { player, result }];

    let newStatus: GameStatus = 'playing';
    if (isCorrectGuess(result)) {
      newStatus = 'won';
    } else if (newGuesses.length >= MAX_GUESSES) {
      newStatus = 'lost';
    }

    set({ guesses: newGuesses, gameStatus: newStatus });
  },
}));
