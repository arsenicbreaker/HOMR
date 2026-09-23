import React from 'react';
import { colors } from '../../theme/colors';
import { tokens } from '../../theme/tokens';
import DataLabelChip from './DataLabelChip';

export function InboxRow({
  statusDotColor = colors.accent,
  title,
  subtitle,
  dataType = 'onchain',
  customRight,
  shortcutHint,
  onClick,
  isSelected = false
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        backgroundColor: isSelected ? colors.cardHover : colors.card,
        borderBottom: `1px solid ${colors.border}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: `background-color ${tokens.motion.fast}`,
        gap: tokens.spacing.md
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {statusDotColor && (
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: statusDotColor,
              flexShrink: 0
            }}
          />
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: colors.ink.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{title}</span>
            {shortcutHint && (
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: tokens.fonts.mono,
                  color: colors.ink.tertiary,
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  padding: '1px 5px',
                  borderRadius: '4px'
                }}
              >
                {shortcutHint}
              </span>
            )}
          </div>
          {subtitle && (
            <div style={{ fontSize: '12px', color: colors.ink.tertiary, marginTop: '2px' }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {customRight}
        {dataType && <DataLabelChip type={dataType} />}
      </div>
    </div>
  );
}

export default InboxRow;
