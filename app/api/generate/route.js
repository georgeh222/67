export async function POST(request) {
  const { legs = 3 } = await request.json();
  const pool = [
    { kind: 'team',   title: 'Detroit Lions to cover -3.5',  rationale: 'EPA + home/rest edge.' },
    { kind: 'total',  title: 'OVER 47.5',                    rationale: 'Pace + efficiency + weather.' },
    { kind: 'player', title: 'A. St. Brown OVER 86 recYds',  rationale: 'Usage + matchup + trend.' },
    { kind: 'player', title: 'J. Gibbs OVER 64 rushYds',     rationale: 'Role + game script.' },
  ];
  const n = Math.max(2, Math.min(8, Number(legs)));
  return new Response(JSON.stringify({ legs: pool.slice(0, n) }), { headers: { 'Content-Type': 'application/json' } });
}
