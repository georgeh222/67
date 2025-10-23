'use client';

import { useState } from 'react';

type Leg = { kind: 'team' | 'total' | 'player'; title: string; rationale: string };

export default function Home() {
  const [legs, setLegs] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Leg[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    try {
      setLoading(true);
      setError(null);
      setResult([]);
      // default team for now (DET). We can add a team picker later.
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: 'DET', legs }),
      });
      const data = await res.json();
      setResult(data.legs ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Picks For You</h1>
          <p className="text-neutral-400 mt-2">
            Simple 2–8 leg parlays. Clean UI now, smart AI under the hood.
          </p>
        </div>

        {/* Controls */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
          <label className="text-sm text-neutral-400">How many legs?</label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={2}
              max={8}
              value={legs}
              onChange={(e) => setLegs(parseInt(e.target.value))}
              className="w-full"
            />
            <span className="w-8 text-center text-lg font-semibold">{legs}</span>
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-neutral-100 text-neutral-900 py-2 font-medium disabled:opacity-60"
          >
            {loading ? 'Generating…' : 'Generate Parlay'}
          </button>

          {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
        </div>

        {/* Results */}
        {result.length > 0 && (
          <div className="mt-6 space-y-3">
            {result.map((leg, i) => (
              <div
                key={i}
                className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4"
              >
                <div className="text-base md:text-lg font-semibold">{leg.title}</div>
                <div className="text-sm text-neutral-400 mt-1">{leg.rationale}</div>
              </div>
            ))}
          </div>
        )}

        {/* Monetization placeholder */}
        <div className="mt-8 text-center text-xs text-neutral-500">
          For analysis/entertainment only. Not betting advice.
          {/* Future ad slot goes here */}
        </div>
      </div>
    </main>
  );
}
