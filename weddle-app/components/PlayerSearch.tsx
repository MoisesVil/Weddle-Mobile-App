import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import type { Player } from '../types/player';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  /** Full list of all players (from players.json) */
  players: Player[];
  /** IDs of players that have already been guessed — excluded from suggestions */
  guessedIds: Set<string>;
  /** Called when the user taps a suggestion */
  onSelect: (player: Player) => void;
  /** When true, the input is greyed out and non-interactive */
  disabled: boolean;
};

export function PlayerSearch({ players, guessedIds, onSelect, disabled }: Props) {
  const [query, setQuery] = useState('');

  // Filter the player list as the user types.
  // Only start suggesting after 2 characters to avoid an overwhelming list.
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    return players
      .filter(
        (p) =>
          !guessedIds.has(p.id) &&
          p.name.toLowerCase().includes(q)
      )
      .slice(0, 8); // cap dropdown at 8 rows
  }, [query, players, guessedIds]);

  const handleSelect = (player: Player) => {
    Keyboard.dismiss();
    setQuery('');
    onSelect(player);
  };

  return (
    <View style={styles.wrapper}>
      {/* Suggestion dropdown — floats above the input */}
      {suggestions.length > 0 && (
        <View style={styles.suggestions}>
          <FlatList
            data={suggestions}
            keyExtractor={(p) => p.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.row}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowMeta}>
                  {item.team} · {item.position}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Text input */}
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        placeholder={disabled ? 'Game over — see you tomorrow!' : 'Search for a player…'}
        placeholderTextColor="#5a5a5a"
        value={query}
        onChangeText={setQuery}
        editable={!disabled}
        autoCorrect={false}
        autoCapitalize="words"
        returnKeyType="search"
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#3a3a3c',
  },
  suggestions: {
    backgroundColor: '#1a1a1b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3a3c',
    marginBottom: 8,
    maxHeight: 260,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2e2e2e',
  },
  rowName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  rowMeta: {
    color: '#888',
    fontSize: 13,
  },
  input: {
    backgroundColor: '#1a1a1b',
    color: '#fff',
    fontSize: 15,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3a3c',
  },
  inputDisabled: {
    opacity: 0.4,
  },
});
