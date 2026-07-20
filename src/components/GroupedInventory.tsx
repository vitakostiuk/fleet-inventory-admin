import { useState } from "react";
import StatusBadge from "./StatusBadge";
import type { FlatDeviceRow } from "../hooks/useInventoryFilters";

interface GroupedLocation {
  location: string;
  devices: FlatDeviceRow[];
}

interface GroupedClient {
  client: string;
  locations: GroupedLocation[];
  deviceCount: number;
}

export default function GroupedInventory({
  groups,
}: {
  groups: GroupedClient[];
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggle = (client: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(client)) next.delete(client);
      else next.add(client);
      return next;
    });
  };

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        No devices match the current filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((g) => {
        const isCollapsed = collapsed.has(g.client);
        return (
          <div
            key={g.client}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white"
          >
            <button
              onClick={() => toggle(g.client)}
              className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-slate-400 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                  aria-hidden
                >
                  ▶
                </span>
                <h3 className="font-display text-sm font-semibold text-slate-900">
                  {g.client}
                </h3>
              </div>
              <span className="font-mono text-xs text-slate-500">
                {g.locations.length} location
                {g.locations.length !== 1 ? "s" : ""} · {g.deviceCount} device
                {g.deviceCount !== 1 ? "s" : ""}
              </span>
            </button>

            {!isCollapsed && (
              <div className="divide-y divide-slate-100 border-t border-slate-100">
                {g.locations.map((loc) => (
                  <div key={loc.location} className="px-5 py-4">
                    <p className="mb-2 font-mono text-xs uppercase tracking-wide text-slate-400">
                      {loc.location}
                    </p>

                    <div className="text-sm">
                      <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,0.9fr)] gap-4 pb-2 text-left text-xs text-slate-400">
                        <span>Serial</span>
                        <span>Model</span>
                        <span>Last access</span>
                        <span>Status</span>
                      </div>
                      {loc.devices.map((d) => (
                        <div
                          key={d.id}
                          className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,0.9fr)] items-center gap-4 border-t border-slate-50 py-2"
                        >
                          <span className="truncate font-mono text-slate-700">
                            {d.serial}
                          </span>
                          <span className="truncate text-slate-700">
                            {d.model}
                          </span>
                          <span className="truncate font-mono text-slate-500">
                            {d.lastAccess}
                          </span>
                          <span>
                            <StatusBadge status={d.status} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
