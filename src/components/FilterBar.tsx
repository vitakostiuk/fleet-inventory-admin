import type { FilterState, StatusFilter } from '../hooks/useInventoryFilters';

interface FilterBarProps {
  filters: FilterState;
  setFilters: (updater: (prev: FilterState) => FilterState) => void;
  clients: string[];
  resultCount: number;
  totalCount: number;
}

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'maintenance', label: 'Maintenance' },
];

export default function FilterBar({ filters, setFilters, clients, resultCount, totalCount }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <input
        value={filters.query}
        onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
        placeholder="Search serial, model, location..."
        className="min-w-[220px] flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
      />

      <select
        value={filters.client}
        onChange={(e) => setFilters((prev) => ({ ...prev, client: e.target.value }))}
        className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-[var(--accent)] focus:outline-none"
      >
        <option value="all">All clients</option>
        {clients.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className="flex gap-1.5">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilters((prev) => ({ ...prev, status: opt.value }))}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              filters.status === opt.value
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <span className="ml-auto font-mono text-xs text-slate-400">
        {resultCount} / {totalCount} devices
      </span>
    </div>
  );
}
