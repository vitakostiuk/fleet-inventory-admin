import { useState } from 'react';
import type { FormEvent } from 'react';
import type { FlatDeviceRow } from '../hooks/useInventoryFilters';

interface ToolCallLog {
  name: string;
  input: Record<string, unknown>;
  resultCount?: number;
}

interface AskFleetResponse {
  answer: string;
  toolCalls: ToolCallLog[];
}

type Status = 'idle' | 'loading' | 'error';

export default function AskFleet({ devices }: { devices: FlatDeviceRow[] }) {
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<AskFleetResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || status === 'loading') return;

    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/ask-fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, devices }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');

      setResult(data);
      setStatus('idle');
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  function handleClear() {
    setQuestion('');
    setResult(null);
    setError('');
    setStatus('idle');
  }

  const canClear = question !== '' || result !== null || status === 'error';

  return (
    <div className="rounded-lg border border-[var(--border)] border-t-2 border-t-[var(--ai)] bg-[var(--surface)] p-5">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--ai)] opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--ai)]" />
        </span>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ai)]">
          AI-powered &middot; ask the fleet directly
        </p>
      </div>
      <h3 className="font-display mt-2 text-sm font-semibold text-[var(--text)]">
        Ask a question about the inventory in plain English
      </h3>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
        Backed by Claude with three tools &mdash;{' '}
        <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">filter_devices</code>,{' '}
        <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">get_status_summary</code>, and{' '}
        <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">get_locations_for_client</code>{' '}
        &mdash; the model decides on its own which, if any, it needs to call before answering.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap gap-2">
        <label htmlFor="fleet-question" className="sr-only">
          Question about the fleet
        </label>
        <div className="relative min-w-[220px] flex-1">
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[var(--ai)]"
          >
            &#10095;
          </span>
          <input
            id="fleet-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="How many Equinox devices are offline?"
            disabled={status === 'loading'}
            className="w-full rounded-md border border-slate-200 py-2 pl-7 pr-3 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:border-[var(--ai)] focus:outline-none focus:ring-2 focus:ring-[var(--ai)]/20 disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading' || !question.trim()}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--ai)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--ai)]/90 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {status === 'loading' && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
          )}
          {status === 'loading' ? 'Thinking…' : 'Ask'}
        </button>
        {canClear && (
          <button
            type="button"
            onClick={handleClear}
            disabled={status === 'loading'}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </form>

      {status === 'error' && (
        <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-inset ring-red-600/20">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-4 space-y-3">
          <p className="whitespace-pre-wrap rounded-md bg-[var(--bg)] px-4 py-3 text-sm leading-relaxed text-[var(--text)]">
            {result.answer}
          </p>

          {result.toolCalls.length > 0 && (
            <details className="group text-xs">
              <summary className="cursor-pointer select-none font-mono uppercase tracking-wide text-[var(--ai)]/70 hover:text-[var(--ai)]">
                How the model got this &middot; {result.toolCalls.length} tool call
                {result.toolCalls.length !== 1 ? 's' : ''}
              </summary>
              <ul className="mt-2 space-y-1.5">
                {result.toolCalls.map((call, i) => (
                  <li
                    key={i}
                    className="rounded-md border border-[var(--ai)]/15 bg-[var(--ai)]/5 px-3 py-1.5 font-mono text-slate-600"
                  >
                    {call.name}({JSON.stringify(call.input)})
                    {call.resultCount !== undefined && ` → ${call.resultCount} device${call.resultCount !== 1 ? 's' : ''}`}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
