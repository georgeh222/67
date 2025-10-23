'use client';
import { useState } from 'react';

export default function Home() {
  const [legs, setLegs] = useState(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);
  const [error, setError] = useState(null);

  async function generate() {
    try {
      setLoading(true); setError(null); setResult([]);
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: 'DET', legs })
      });
      const data = await res.json();
      setResult(data.legs ?? []);
    } catch (e) { setError(e?.message || 'Something went wrong'); }
    finally { setLoading(false); }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800 }}>Picks For You</h1>
          <p style={{ color: '#aaa', marginTop: 8 }}>Simple 2–8 leg parlays. Generate with one click.</p>
        </div>

        <div style={{ background: '#121212', border: '1px solid #262626', borderRadius: 16, padding: 16 }}>
          <label style={{ fontSize: 14, color: '#bbb' }}>How many legs?</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
            <input type="range" min={2} max={8} value={legs} onChange={e => setLegs(parseInt(e.target.value))} style={{ flex: 1 }} />
            <span style={{ width: 32, textAlign: 'center', fontSize: 18, fontWeight: 700 }}>{legs}</span>
          </div>
          <button onClick={generate} disabled={loading}
            style={{ marginTop: 12, width: '100%', padding: '10px 12px', background: '#fff', color: '#000', borderRadius: 12, fontWeight: 600, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Generating…' : 'Generate Parlay'}
          </button>
          {error && <div style={{ marginTop: 8, color: '#ff7b7b', fontSize: 14 }}>{error}</div>}
        </div>

        {result.length > 0 && (
          <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
            {result.map((leg, i) => (
              <div key={i} style={{ background: '#121212', border: '1px solid #262626', borderRadius: 16, padding: 16 }}>
                <div style={{ fontWeight: 700 }}>{leg.title}</div>
                <div style={{ color: '#aaa', marginTop: 4, fontSize: 14 }}>{leg.rationale}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: 'center', color: '#777', fontSize: 12 }}>
          For analysis/entertainment only. Not betting advice.
        </div>
      </div>
    </main>
  );
}
