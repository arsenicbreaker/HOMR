import React from 'react';
import { colors } from '../../theme/colors';
import { tokens } from '../../theme/tokens';

export function DemoTag({ text = 'DEMO DATA' }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 6px',
        borderRadius: tokens.radii.sm,
        fontSize: '10px',
        fontFamily: tokens.fonts.mono,
        fontWeight: 600,
        letterSpacing: '0.05em',
        color: colors.state.simulated.color,
        backgroundColor: colors.state.simulated.bg,
        border: `1px solid ${colors.state.simulated.border}`,
        lineHeight: 1.2,
      }}
    >
      {text}
    </span>
  );
}

export default DemoTag;
