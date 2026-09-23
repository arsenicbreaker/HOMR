import React from 'react';
import { colors } from '../../theme/colors';
import { tokens } from '../../theme/tokens';

export function DataLabelChip({ type = 'onchain', label }) {
  const config = colors.state[type] || colors.state.onchain;
  const displayLabel = label || config.label;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '2px 8px',
        borderRadius: tokens.radii.sm,
        fontSize: '11px',
        fontFamily: tokens.fonts.mono,
        fontWeight: 500,
        letterSpacing: '0.02em',
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        lineHeight: 1.4,
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: config.color,
          display: 'inline-block'
        }}
      />
      {displayLabel}
    </span>
  );
}

export default DataLabelChip;
