import React from 'react';
import { useDemoMode } from '../../context/DemoModeContext';
import { useProtocolQuery } from '../../hooks/useProtocol';

const dashboardData = {
  investor: { resource: 'vault', personal: true, title: 'investor', detail: 'Membaca posisi vault terbaru.' },
  borrower: { resource: 'auction', personal: true, title: 'borrower', detail: 'Membaca fase lelang terbaru.' },
  admin: { resource: 'auction', personal: true, title: 'admin', detail: 'Membaca status lelang terbaru.' }
};

export default function DashboardEntry({ role, children }) {
  const { isDemoMode } = useDemoMode();
  const { resource, personal, title, detail } = dashboardData[role];
  const { isPending } = useProtocolQuery(resource, personal);

  if (isDemoMode || !isPending) return children;

  return (
    <main className="dashboard-entry" aria-busy="true">
      <div className="dashboard-entry__content" role="status" aria-live="polite">
        <span className="dashboard-entry__brand">HOUSD.</span>
        <h1>Menyiapkan dashboard {title}</h1>
        <p>{detail}</p>
        <div className="dashboard-entry__track" aria-hidden="true"><span /></div>
      </div>
    </main>
  );
}
