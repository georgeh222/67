import { NextRequest, NextResponse } from 'next/server';

// --- Types
type TeamId = 'DET' | 'GB' | 'KC' | 'BUF' | 'PHI' | 'DAL' | 'SF' | 'MIA';
type LegType = 'player' | 'team' | 'total';
type StatType = 'passYds' | 'rushYds' | 'recYds' | 'receptions' | 'rushAtt' | 'passTD' | 'rushTD' | 'recTD';

interface Team {
  id: TeamId; name: string; city: string; oppNext: TeamId;
  spread: number; total: number; paceRank: number;
  offEPA: number; defEPA: number; redZoneTD: number;
  passRate: number; rushRate: number; home: boolean; restDays: number;
  weather: 'indoor' | 'clear' | 'windy' | 'rain' | 'snow';
}
interface Player {
  id: string; team: TeamId; name: string; pos: 'QB'|'RB'|'WR'|'TE';
  usage: number; vsPosRank: number; baseLine: Partial<Record<StatType, number>>;
}
interface Injury { playerId: string; status: 'out'|'doubtful'|'questionable'|'probable'|'healthy'; impact: number; }
interface Leg { kind: LegType; title: string; rationale: string; }

// --- Mock data
const TEAMS: Record<TeamId, Team> = {
  DET: { id: 'DET', name: 'Lions', city: 'Detroit', oppNext: 'GB', spread: -3.5, total: 47.5, paceRank: 10, offEPA: 0.12, defEPA: -0.04, redZoneTD: 0.62, passRate: 0.56, rushRate: 0.44, home: true, restDays: 7, weather: 'indoor' },
  GB:  { id: 'GB',  name: 'Packers', city: 'Green Bay', oppNext: 'DET', spread:  3.5, total: 47.5, paceRank: 18, offEPA: 0.05, defEPA:  0.02, redZoneTD: 0.55, passRate: 0.58, rushRate: 0.42, home: false, restDays: 7, weather: 'clear' },
  KC:  { id: 'KC',  name: 'Chiefs',  city: 'Kansas City', oppNext: 'BUF', spread: -2.5, total: 51.0, paceRank:  6, offEPA: 0.15, defEPA: -0.02, redZoneTD: 0.64, passRate: 0.61, rushRate: 0.39, home: true,  restDays: 8, weather: 'windy' },
  BUF: { id: 'BUF', name: 'Bills',   city: 'Buffalo',     oppNext: 'KC',  spread:  2.5, total: 51.0, paceRank:  8, offEPA: 0.13, defEPA:  0.00, redZoneTD: 0.60, passRate: 0.60, rushRate: 0.40, home: false, restDays: 8, weather: 'windy' },
  PHI: { id: 'PHI', name: 'Eagles',  city: 'Philadelphia', oppNext: 'DAL', spread: -1.5, total: 48.0, paceRank: 14, offEPA: 0.10, defEPA: -0.01, redZoneTD: 0.59, passRate: 0.55, rushRate: 0.45, home: true,  restDays: 6, weather: 'rain' },
  DAL: { id: 'DAL', name: 'Cowboys', city: 'Dallas',       oppNext: 'PHI', spread:  1.5, total: 48.0, paceRank: 12, offEPA: 0.11, defEPA: -0.03, redZoneTD: 0.61, passRate: 0.57, rushRate: 0.43, home: false, restDays: 6, weather: 'rain' },
  SF:  { id: 'SF',  name: '49ers',   city: 'San Francisco',oppNext: 'MIA', spread: -4.0, total: 49.5, paceRank: 16, offEPA: 0.14, defEPA: -0.05, redZoneTD: 0.66, passRate: 0.53, rushRate: 0.47, home: true,  restDays: 9, weather: 'clear' },
  MIA: { id: 'MIA', name: 'Dolphins',city: 'Miami',        oppNext: 'SF',  spread:  4.0, total: 49.5, paceRank:  3, offEPA: 0.16, defEPA:  0.01, redZoneTD: 0.63, passRate: 0.59, rushRate: 0.41, home: false, restDays: 9, weather: 'clear' },
};

const PLAYERS: Player[] = [
  { id: 'gibbs',    team: 'DET', name: 'J. Gibbs',      pos: 'RB', usage: 0.64, vsPosRank: 8,  baseLine: { rushYds: 64, recYds: 28, rushAtt: 15, recTD: 0.2 } },
  { id: 'stbrown',  team: 'DET', name: 'A. St. Brown',  pos: 'WR', usage: 0.30, vsPosRank: 10, baseLine: { recYds: 86, receptions: 7.1, recTD: 0.45 } },
  { id: 'love',     team: 'GB',  name: 'J. Love',       pos: 'QB', usage: 1.00, vsPosRank: 20, baseLine: { passYds: 246, passTD: 1.7 } },
  { id: 'pacheco',  team: 'KC',  name: 'I. Pacheco',    pos: 'RB', usage: 0.62, vsPosRank: 12, baseLine: { rushYds: 68, rushAtt: 17, rushTD: 0.6 } },
  { id: 'kelce',    team: 'KC',  name: 'T. Kelce',      pos: 'TE', usage: 0.26, vsPosRank: 4,  baseLine: { recYds: 74, receptions: 7.3, recTD: 0.5 } },
  { id: 'allen',    team: 'BUF', name: 'J. Allen',      pos: 'QB', usage: 1.00, vsPosRank: 18, baseLine: { passYds: 272, passTD: 2.0, rushYds: 34 } },
  { id: 'lamb',     team: 'DAL', name: 'C. Lamb',       pos: 'WR', usage: 0.32, vsPosRank: 6,  baseLine: { recYds: 92, receptions: 7.5, recTD: 0.55 } },
  { id: 'ajb',      team: 'PHI', name: 'A. J. Brown',   pos: 'WR', usage: 0.29, vsPosRank: 9,  baseLine: { recYds: 88, receptions: 6.8, recTD: 0.52 } },
  { id: 'cmc',      team: 'SF',  name: 'C. McCaffrey',  pos: 'RB', usage: 0.70, vsPosRank: 14, baseLine: { rushYds: 84, recYds: 34, rushTD: 0.7, recTD: 0.2 } },
  { id: 'waddle',   team: 'MIA', name: 'J. Waddle',     pos: 'WR', usage: 0.24, vsPosRank: 7,  baseLine: { recYds: 76, receptions: 5.8, recTD: 0.45 } },
];

const INJURIES: Injury[] = [
  { playerId: 'stbrown', status: 'probable',     impact: 0.2 },
  { playerId: 'love',    status: 'questionable', impact: -0.6 },
];

// --- Helpers
function injuryAdj(player: Player): number {
  const inj = INJURIES.find(i => i.playerId === player.id);
  if (!inj) return 0;
  const weight = { out: -2, doubtful: -1, questionable: -0.5, probable: 0.25, healthy: 0 }[inj.status];
  return (inj.impact + (weight ?? 0)) * 0.5; // dampen
}
function envAdj(team: Team, stat: StatType): number {
  const wx = team.weather; let adj = 0;
  if (wx === 'windy' && /pass|rec/.test(stat)) adj -= 0.08;
  if (wx === 'rain' || wx === 'snow') adj -= 0.05;
  if (team.weather === 'indoor') adj += 0.05;
  if (team.home) adj += 0.03;
  adj += Math.max(-0.03, Math.min(0.05, (10 - team.paceRank) * 0.003));
  adj += Math.min(0.04, (team.restDays - 6) * 0.01);
  return adj;
}
function vsDefenseAdj(player: Player): number { return (16 - player.vsPosRank) / 80; }

function project(player: Player, stat: StatType): number {
  const t = TEAMS[player.team];
  const base = player.baseLine[stat] ?? 0;
  const adj = injuryAdj(player) + envAdj(t, stat) + vsDefenseAdj(player);
  return Math.max(0, Math.round(base * (1 + adj)));
}

function teamSpreadSuggestion(team: Team) {
  const opp = TEAMS[team.oppNext];
  const edge = (team.offEPA - opp.defEPA) - (opp.offEPA - team.defEPA) + (team.home ? 0.5 : -0.25) + (team.restDays - 6) * 0.1;
  return { line: team.spread, side: edge >= 0 ? 'cover' : 'opp', conf: Math.max(0.05, Math.min(0.9, 0.5 + edge)) };
}
function totalSuggestion(team: Team) {
  const opp = TEAMS[team.oppNext];
  const paceEdge = (12 - (team.paceRank + opp.paceRank) / 2) * 0.3;
  const epaSum = team.offEPA + opp.offEPA - (team.defEPA + opp.defEPA);
  const weatherHit = team.weather === 'windy' ? -1 : (team.weather === 'rain' || team.weather === 'snow') ? -0.6 : 0.2;
  const score = paceEdge + epaSum * 10 + weatherHit;
  return { line: team.total, side: score >= 0 ? 'over' : 'under', conf: Math.max(0.05, Math.min(0.9, 0.5 + score / 10)) };
}

// --- Route
export async function POST(req: NextRequest) {
  const { teamId, legs } = await req.json();
  const id: TeamId = (teamId && TEAMS[teamId as TeamId]) ? teamId : 'DET';
  const n = Math.max(2, Math.min(8, Number(legs ?? 3)));

  const team = TEAMS[id];
  const pool = PLAYERS.filter(p => p.team === id);

  const out: Leg[] = [];

  // 1) Team leg
  const tSide = teamSpreadSuggestion(team);
  out.push({
    kind: 'team',
    title: `${team.city} ${team.name} ${tSide.side === 'cover' ? 'to cover' : 'opponent to cover'} ${tSide.line}`,
    rationale: `EPA+home/rest edge. Confidence ${(tSide.conf * 100).toFixed(0)}%.`,
  });

  // 2) Total leg
  const tot = totalSuggestion(team);
  out.push({
    kind: 'total',
    title: `${tot.side.toUpperCase()} ${tot.line.toFixed(1)}`,
    rationale: `Pace + combined EPA + weather → ${(tot.conf * 100).toFixed(0)}%.`,
  });

  // 3) Player legs
  const stats: StatType[] = ['recYds','receptions','rushYds','passYds','rushAtt','passTD','rushTD','recTD'];
  for (const p of pool.sort((a, b) => b.usage - a.usage)) {
    if (out.length >= n) break;
    let best: { stat: StatType; value: number; delta: number } | null = null;
    for (const s of stats) {
      const v = project(p, s);
      const base = p.baseLine[s] ?? 0;
      const delta = v - base;
      if (!best || delta > best.delta) best = { stat: s, value: v, delta };
    }
    if (!best) continue;
    const dir = best.delta >= 0 ? 'OVER' : 'UNDER';
    out.push({
      kind: 'player',
      title: `${p.name} ${dir} ${best.value} ${best.stat}`,
      rationale: `Usage ${(p.usage * 100).toFixed(0)}%, vs-pos ${(vsDefenseAdj(p) * 100).toFixed(0)}bp, env ${(envAdj(team, best.stat) * 100).toFixed(0)}bp.`,
    });
  }

  return NextResponse.json({ legs: out });
}
