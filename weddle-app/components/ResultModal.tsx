import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { Player } from '../types/player';
import { formatHeight } from '../utils/comparePlayer';
import type { GameStatus } from '../store/gameStore';
import { MAX_GUESSES } from '../store/gameStore';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  visible: boolean;
  status: GameStatus;
  targetPlayer: Player;
  guessCount: number;
  /** Hides the modal — the game stays in its ended state until tomorrow. */
  onClose: () => void;
};

export function ResultModal({
  visible,
  status,
  targetPlayer,
  guessCount,
  onClose,
}: Props) {
  const won = status === 'won';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Emoji + headline */}
          <Text style={styles.emoji}>{won ? '🏈' : '😔'}</Text>
          <Text style={styles.headline}>{won ? 'Touchdown!' : 'Game Over'}</Text>
          <Text style={styles.subheadline}>
            {won
              ? `You got it in ${guessCount} of ${MAX_GUESSES} guess${guessCount === 1 ? '' : 'es'}!`
              : 'Better luck tomorrow!'}
          </Text>

          {/* Answer reveal */}
          <View style={styles.answerBox}>
            <Text style={styles.answerLabel}>Today's player was</Text>
            <Text style={styles.answerName}>{targetPlayer.name}</Text>
            <Text style={styles.answerMeta}>
              {targetPlayer.team} · {targetPlayer.position}
              {'  |  '}
              {formatHeight(targetPlayer.height)} · Age {targetPlayer.age}
              {'  |  '}
              #{targetPlayer.jerseyNumber}
            </Text>
          </View>

          {/* Close button */}
          <TouchableOpacity
            style={[styles.button, won ? styles.buttonGreen : styles.buttonGrey]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1a1a1b',
    borderRadius: 18,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3c',
  },
  emoji: {
    fontSize: 52,
    marginBottom: 12,
  },
  headline: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  subheadline: {
    color: '#aaa',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 22,
  },
  answerBox: {
    backgroundColor: '#121213',
    borderRadius: 12,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2e2e2e',
  },
  answerLabel: {
    color: '#666',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  answerName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  answerMeta: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 40,
  },
  buttonGreen: {
    backgroundColor: '#538d4e',
  },
  buttonGrey: {
    backgroundColor: '#3a3a3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
