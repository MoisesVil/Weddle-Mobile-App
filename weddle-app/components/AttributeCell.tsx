import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TileResult } from '../utils/comparePlayer';

// ---------------------------------------------------------------------------
// Colour mapping — green / yellow / grey
// ---------------------------------------------------------------------------

export const TILE_COLORS: Record<TileResult, string> = {
  correct: '#538d4e', // green
  close:   '#b59f3b', // yellow
  wrong:   '#3a3a3c', // dark grey
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  /** Short column label shown below the value, e.g. "Team" */
  label: string;
  /** The guessed value to display, e.g. "KC" or "6'2\"" */
  value: string;
  /** Tile colour based on comparison result */
  result: TileResult;
  /** Optional up/down arrow for numeric attributes (height, age, jersey) */
  arrow?: '↑' | '↓' | null;
};

export function AttributeCell({ label, value, result, arrow }: Props) {
  return (
    <View style={[styles.cell, { backgroundColor: TILE_COLORS[result] }]}>
      <Text style={styles.value} numberOfLines={2} adjustsFontSizeToFit>
        {value}
        {arrow != null ? ` ${arrow}` : ''}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    margin: 2,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  value: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 8,
    textAlign: 'center',
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
