import { useMemo, useState } from 'react';
import { inventory, type Client, type Device } from '../data/inventory';

export type StatusFilter = 'all' | Device['status'];

export interface FilterState {
  query: string;
  client: string | 'all';
  status: StatusFilter;
}

export interface FlatDeviceRow extends Device {
  client: string;
  location: string;
  city: string;
  state: string;
}

function flatten(data: Client[]): FlatDeviceRow[] {
  const rows: FlatDeviceRow[] = [];
  for (const c of data) {
    for (const l of c.locations) {
      for (const d of l.devices) {
        rows.push({ ...d, client: c.client, location: l.location, city: l.city, state: l.state });
      }
    }
  }
  return rows;
}

export function useInventoryFilters() {
  const [filters, setFilters] = useState<FilterState>({ query: '', client: 'all', status: 'all' });

  const allRows = useMemo(() => flatten(inventory), []);

  const clients = useMemo(() => Array.from(new Set(allRows.map((r) => r.client))), [allRows]);

  const filteredRows = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return allRows.filter((r) => {
      if (filters.client !== 'all' && r.client !== filters.client) return false;
      if (filters.status !== 'all' && r.status !== filters.status) return false;
      if (q) {
        const haystack = `${r.serial} ${r.model} ${r.location} ${r.city} ${r.client}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allRows, filters]);

  // Re-group the filtered flat rows back into client -> location, so the
  // grouped view always reflects the active filters instead of hiding
  // empty groups behind stale counts.
  const grouped = useMemo(() => {
    const byClient = new Map<string, Map<string, FlatDeviceRow[]>>();
    for (const row of filteredRows) {
      if (!byClient.has(row.client)) byClient.set(row.client, new Map());
      const byLocation = byClient.get(row.client)!;
      if (!byLocation.has(row.location)) byLocation.set(row.location, []);
      byLocation.get(row.location)!.push(row);
    }
    return Array.from(byClient.entries()).map(([client, locations]) => ({
      client,
      locations: Array.from(locations.entries()).map(([location, devices]) => ({ location, devices })),
      deviceCount: Array.from(locations.values()).reduce((sum, arr) => sum + arr.length, 0),
    }));
  }, [filteredRows]);

  return { filters, setFilters, clients, filteredRows, grouped, totalCount: allRows.length };
}
