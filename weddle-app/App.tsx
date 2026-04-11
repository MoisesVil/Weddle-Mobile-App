import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import playersData from './data/players_easy.json';
import type { Player } from './types/player';
import { useGameStore, MAX_GUESSES } from './store/gameStore';
import { GuessRow } from './components/GuessRow';
import { PlayerSearch } from './components/PlayerSearch';
import { ResultModal } from './components/ResultModal';

// Cast the imported JSON to our typed Player array
const players = playersData as Player[];

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const { targetPlayer, guesses, gameStatus, initGame, submitGuess } =
    useGameStore();

  const [modalVisible, setModalVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Pick today's player on first load
  useEffect(() => {
    initGame(players);
  }, []);

  // Show the result modal shortly after the game ends so the final
  // tile has a moment to render before the overlay appears
  useEffect(() => {
    if (gameStatus === 'won' || gameStatus === 'lost') {
      const timer = setTimeout(() => setModalVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, [gameStatus]);

  // Keep the scroll view pinned to the bottom as new rows are added
  const handleContentSizeChange = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  // Build a Set of already-guessed IDs so PlayerSearch can exclude them
  const guessedIds = useMemo(
    () => new Set(guesses.map((g) => g.player.id)),
    [guesses]
  );

  const remaining = MAX_GUESSES - guesses.length;
  const isGameOver = gameStatus !== 'playing';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.title}>WEDDLE</Text>
          <Text style={styles.subtitle}>
            {isGameOver
              ? gameStatus === 'won'
                ? '🏈 You got it!'
                : '😔 Game over'
              : `${remaining} guess${remaining === 1 ? '' : 'es'} remaining`}
          </Text>
        </View>

        {/* ── Column headers (only visible once guesses exist) ───────────── */}
        {guesses.length > 0 && (
          <View style={styles.colHeaders}>
            {['Team', 'Division', 'Pos', 'Height', 'Age', 'Jersey'].map(
              (label) => (
                <Text key={label} style={styles.colHeader}>
                  {label}
                </Text>
              )
            )}
          </View>
        )}

        {/* ── Guess history ──────────────────────────────────────────────── */}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={handleContentSizeChange}
          keyboardShouldPersistTaps="handled"
        >
          {guesses.map(({ player, result }) => (
            <GuessRow key={player.id} player={player} result={result} />
          ))}

          {/* Empty placeholder rows so the user can see how many guesses are left */}
          {!isGameOver &&
            Array.from({ length: remaining }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.emptyRow} />
            ))}
        </ScrollView>

        {/* ── Player search input ────────────────────────────────────────── */}
        <PlayerSearch
          players={players}
          guessedIds={guessedIds}
          onSelect={submitGuess}
          disabled={isGameOver}
        />
      </KeyboardAvoidingView>

      {/* ── Win / Loss modal ───────────────────────────────────────────── */}
      {targetPlayer && (
        <ResultModal
          visible={modalVisible}
          status={gameStatus}
          targetPlayer={targetPlayer}
          guessCount={guesses.length}
          onClose={() => setModalVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#121213',
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3a3a3c',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 6,
  },
  subtitle: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
  },

  // Column headers
  colHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 2,
  },
  colHeader: {
    flex: 1,
    color: '#555',
    fontSize: 9,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Guess list
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  // Empty placeholder row
  emptyRow: {
    height: 58,
    marginVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderStyle: 'dashed',
  },
});
