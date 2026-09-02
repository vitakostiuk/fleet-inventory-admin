import { useInventoryFilters } from './hooks/useInventoryFilters';
import FilterBar from './components/FilterBar';
import GroupedInventory from './components/GroupedInventory';
import AskFleet from './components/AskFleet';

export default function App() {
  const { filters, setFilters, clients, grouped, filteredRows, totalCount, allRows } = useInventoryFilters();

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-24">
      <header className="mx-auto max-w-5xl px-6 pt-14">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Portfolio piece / grouped admin data
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold leading-tight text-[var(--text)] sm:text-5xl">
          Fleet Inventory Admin
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-muted)]">
          A client &rarr; location &rarr; device inventory explorer, built around the same grouping shape as a
          production Lambda job that reconciles equipment records across gym locations. Search, filter by client or
          status, and the grouped view stays in sync instead of hiding empty groups behind stale counts.
        </p>
      </header>

      <main className="mx-auto mt-10 max-w-5xl px-6">
        <AskFleet devices={allRows} />
        <div className="mt-6">
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            clients={clients}
            resultCount={filteredRows.length}
            totalCount={totalCount}
          />
        </div>
        <div className="mt-6">
          <GroupedInventory groups={grouped} />
        </div>
      </main>

      <section className="mx-auto mt-16 max-w-5xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
          What this demonstrates
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="font-display text-sm font-semibold text-[var(--text)]">Filter-aware grouping</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              Filtering happens on the flat device list first, then the result is re-grouped into client &rarr;
              location. That keeps group headers and counts always accurate to what's actually visible, instead of
              filtering rows inside a group built from the unfiltered data.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <h3 className="font-display text-sm font-semibold text-[var(--text)]">Three-level data shape</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              Mirrors a real reconciliation job: organization names get consolidated, location names get
              normalized (e.g. "Club #14"), and individual device serials get associated with a location &mdash;
              with a spreadsheet as the source of truth over the underlying ERP export.
            </p>
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-16 max-w-5xl border-t border-[var(--border)] px-6 pt-6 font-mono text-xs text-[var(--text-muted)]">
        Built with React, TypeScript and Tailwind CSS. Try searching a serial number or toggling a status filter to
        see the grouped counts update.
      </footer>
    </div>
  );
}
