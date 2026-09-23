// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DataLabelChip from '../components/ui/DataLabelChip';
import DemoTag from '../components/ui/DemoTag';

describe('DataLabelChip & DemoTag Components', () => {
  it('renders Onchain label correctly', () => {
    render(<DataLabelChip type="onchain" />);
    expect(screen.getByText('Onchain')).toBeTruthy();
  });

  it('renders Verified offchain label correctly', () => {
    render(<DataLabelChip type="offchain" />);
    expect(screen.getByText('Verified offchain')).toBeTruthy();
  });

  it('renders Simulated label correctly', () => {
    render(<DataLabelChip type="simulated" />);
    expect(screen.getByText('Simulated')).toBeTruthy();
  });

  it('renders Pending review label correctly', () => {
    render(<DataLabelChip type="pending" />);
    expect(screen.getByText('Pending review')).toBeTruthy();
  });

  it('renders DEMO DATA tag correctly', () => {
    render(<DemoTag />);
    expect(screen.getByText('DEMO DATA')).toBeTruthy();
  });
});
