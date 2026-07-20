import type { Device } from '../data/inventory';

const styles: Record<Device['status'], string> = {
  online: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  offline: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  maintenance: 'bg-amber-50 text-amber-700 ring-amber-600/20',
};

export default function StatusBadge({ status }: { status: Device['status'] }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
