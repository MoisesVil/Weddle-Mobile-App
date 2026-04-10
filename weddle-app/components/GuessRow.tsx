import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AttributeCell } from './AttributeCell';
import type { Player } from '../types/player';
import type { GuessResult } from '../utils/comparePlayer';
import { formatHeight } from '../utils/comparePlayer';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a direction value to a visible arrow character. */
function toArrow(dir: 'higher' | 'lower' | 'exact'): '↑' | '↓' | null {
  if (dir === 'higher') return '↑';
  if (dir === 'lower')  return '↓';
  return null;
}

/**
 * Shortens "AFC West" → "AFC\nWest" so it wraps neatly inside a narrow tile.
 * The Text component with numberOfLines={2} handles the split.
 */
function shortDivision(division: string): string {
  return division.replace(' ', '\n'); // "AFC\nWest"
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  player: Player;
  result: GuessResult;
};

export function GuessRow({ player, result }: Props) {
  return (
    <View style={styles.container}>
      {/* Player name sits above the tile row */}
      <Text style={styles.name} numberOfLines={1}>
        {player.name}
      </Text>

      {/* Six attribute tiles */}
      <View style={styles.tiles}>
        <AttributeCell
          label="Team"
          value={player.team}
          result={result.team}
        />
        <AttributeCell
          label="Division"
          value={shortDivision(player.division)}
          result={result.division}
        />
        <AttributeCell
          label="Position"
          value={player.position}
          result={result.position}
        />
        <AttributeCell
          label="Height"
          value={formatHeight(player.height)}
          result={result.height.result}
          arrow={toArrow(result.height.direction)}
        />
        <AttributeCell
          label="Age"
          value={String(player.age)}
          result={result.age.result}
          arrow={toArrow(result.age.direction)}
        />
        <AttributeCell
          label="Jersey"
          value={`#${player.jerseyNumber}`}
          result={result.jersey.result}
          arrow={toArrow(result.jersey.direction)}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  name: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 3,
    marginLeft: 4,
  },
  tiles: {
    flexDirection: 'row',
  },
});
