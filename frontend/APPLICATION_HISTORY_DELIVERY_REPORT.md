# Borrower application history

The borrower previously submitted applications without reading them back from the credit database. Property and Activity now display saved requests for the connected wallet, newest first. Successful submission refreshes the list. Pending requests advance the financing workflow to credit assessment.

Design read: borrower financing records in the existing restrained Superhuman dashboard. ENERGY 1 / RHYTHM 1 / MOTION 1. Existing panels and separated rows group requests; principal and review status lead each row. Status dots indicate pending or approved decisions. Long identifiers wrap, and narrow screens stack the status below the request details. No new animation or visual assets.

## Verified checks

- PASS, R-26: component tests click Property, Activity, submit, and refresh; each produces its intended view or state.
- PASS, R-27: tests cover loading, empty, saved records, fetch failure with retry, and failed submission retaining the form.
- PASS, C-5: production records come from the existing API; test fixtures stay in tests and demo mode explicitly reports that submissions are not saved.
- PASS, wallet changes: tests discard a late response for a previous wallet, filter addresses case-insensitively, and clear visible records on disconnect.
- PASS, persistence read: tests reload API history after submission and component remount; no browser storage is used for application history.
- PASS, build: `npm run build` completed. Existing dependency directive and bundle-size warnings remain.
- PASS, regression checks: 16 tests passed across `LiveDashboard`, `DashboardNavigation`, and `ApplicationApi`.

## Verification limits

Browser automation reported no available browsers, so visual inspection and real-browser wallet interactions were not performed. Click-through evidence above is from DOM component tests with mocked API responses. Responsive wrapping and keyboard-accessible native buttons were checked in source; no claim of visual or full accessibility certification is made. The deployed applications endpoint returned successfully during diagnosis; no test application was written to it.
