import React, { useMemo, useState } from "react";

const ZONES = ["LC", "LW", "TK", "RW", "RC"];
const ZONE_LABELS = ["Left Corner", "Left Wing", "Top Key", "Right Wing", "Right Corner"];
const ROUNDS = ["R1", "R2", "R3", "R4", "Final"];

const contests = [
  {
    id: "contest-1",
    title: "Contest 1",
    date: "April 22, 2026",
    label: "April 22, 2026 Contest 1",
    winner: "Mohamed Abdisalan",
    runnerUp: "Yahya",
    rawData: {
      Abdiaziz: { r1: "00000", r2: null, r3: null, r4: null, r5: null, eliminated: 1 },
      "Mohamed Abdisalan": { r1: "01110", r2: "01100", r3: "00111", r4: "11001", r5: "00011", eliminated: 6, winner: true },
      "Mohamed Omar": { r1: "10100", r2: "?????", r3: "00100", r4: null, r5: null, eliminated: 3 },
      "Mohamed Ahmed": { r1: "10010", r2: "10100", r3: "00000", r4: null, r5: null, eliminated: 3 },
      "Mohamed Adem": { r1: "00001", r2: null, r3: null, r4: null, r5: null, eliminated: 1, sdElim: true },
      Muhsin: { r1: "10000", r2: "00000", r3: null, r4: null, r5: null, eliminated: 2 },
      "Ahmed-Suhaib": { r1: "01000", r2: "10100", r3: "00011", r4: "10000", r5: null, eliminated: 4 },
      Abdimanan: { r1: "00000", r2: null, r3: null, r4: null, r5: null, eliminated: 1 },
      Sabre: { r1: "00000", r2: null, r3: null, r4: null, r5: null, eliminated: 1 },
      Abdisalan: { r1: "01010", r2: "11000", r3: "11010", r4: "01100", r5: null, eliminated: 4 },
      Yahya: { r1: "01000", r2: "00001", r3: "10100", r4: "11011", r5: "00010", eliminated: 5 },
      "Mohamed Salad": { r1: "10000", r2: "10000", r3: null, r4: null, r5: null, eliminated: 2, sdElim: true },
    },
    suddenDeath: {
      "Round 1": [
        { player: "Ahmed-Suhaib", attempts: 2, made: true },
        { player: "Yahya", attempts: 2, made: true },
        { player: "Mohamed Salad", attempts: 4, made: true },
        { player: "Muhsin", attempts: 14, made: true },
        { player: "Mohamed Adem", attempts: 14, made: false },
      ],
      "Round 2": [
        { player: "Yahya", attempts: 7, made: true },
        { player: "Mohamed Salad", attempts: 7, made: false },
      ],
    },
  },
];

function parseShots(str) {
  return str.split("").map(Number);
}

function computePlayerStats(name, data) {
  const rounds = [data.r1, data.r2, data.r3, data.r4, data.r5];
  const validRounds = rounds.filter((round) => round && round !== "?????");
  const zoneStats = ZONES.map(() => ({ makes: 0, attempts: 0 }));
  let totalMakes = 0;
  let totalAttempts = 0;
  let zeros = 0;

  validRounds.forEach((round) => {
    const shots = parseShots(round);
    const roundMakes = shots.reduce((total, shot, index) => {
      zoneStats[index].attempts += 1;
      zoneStats[index].makes += shot;
      totalAttempts += 1;
      totalMakes += shot;
      return total + shot;
    }, 0);
    if (roundMakes === 0) zeros += 1;
  });

  const roundScores = rounds.map((round) => {
    if (!round || round === "?????") return null;
    return parseShots(round).reduce((total, shot) => total + shot, 0);
  });
  const knownScores = roundScores.filter((score) => score !== null);

  return {
    name,
    totalMakes,
    totalAttempts,
    pct: totalAttempts ? Math.round((totalMakes / totalAttempts) * 100) : 0,
    avg: knownScores.length ? (knownScores.reduce((sum, score) => sum + score, 0) / knownScores.length).toFixed(2) : "-",
    best: knownScores.length ? Math.max(...knownScores) : 0,
    zeros,
    zoneStats,
    roundScores,
    roundsPlayed: validRounds.length,
    eliminated: data.eliminated,
    winner: Boolean(data.winner),
  };
}

function getContestStats(contest) {
  const players = Object.entries(contest.rawData).map(([name, data]) => computePlayerStats(name, data));
  const sorted = [...players].sort((a, b) => b.eliminated - a.eliminated || b.totalMakes - a.totalMakes);
  const totalMakes = players.reduce((sum, player) => sum + player.totalMakes, 0);
  const totalAttempts = players.reduce((sum, player) => sum + player.totalAttempts, 0);
  const mostMakes = players.reduce((leader, player) => (player.totalMakes > leader.totalMakes ? player : leader), players[0]);

  return {
    players,
    sorted,
    totalMakes,
    totalAttempts,
    overallPct: totalAttempts ? Math.round((totalMakes / totalAttempts) * 100) : 0,
    mostMakes,
    perfectRounds: players.reduce((sum, player) => sum + player.roundScores.filter((score) => score === 5).length, 0),
  };
}

function finishLabel(player) {
  if (player.winner) return "Winner";
  if (player.eliminated === 5) return "Runner-up";
  if (player.eliminated === 4) return "Top 4";
  if (player.eliminated === 3) return "Top 6";
  if (player.eliminated === 2) return "Top 8";
  return "R1 Exit";
}

function ShotMap({ zoneStats, size = "md" }) {
  const scale = size === "sm" ? 0.65 : 1;
  const width = 220 * scale;
  const height = 130 * scale;
  const points = [
    { x: 10 * scale, y: 50 * scale, label: "LC" },
    { x: 50 * scale, y: 20 * scale, label: "LW" },
    { x: 95 * scale, y: 8 * scale, label: "TK" },
    { x: 140 * scale, y: 20 * scale, label: "RW" },
    { x: 180 * scale, y: 50 * scale, label: "RC" },
  ];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: "100%", height: "auto" }}>
      <path d={`M ${10 * scale} ${115 * scale} Q ${110 * scale} ${-20 * scale} ${210 * scale} ${115 * scale}`} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1.5 * scale} />
      <line x1={0} y1={115 * scale} x2={width} y2={115 * scale} stroke="rgba(255,255,255,0.1)" strokeWidth={scale} />
      {points.map((point, index) => {
        const stat = zoneStats[index];
        const pct = stat.attempts ? stat.makes / stat.attempts : 0;
        const color = stat.attempts === 0 ? "#333" : pct === 0 ? "#c0392b" : pct < 0.4 ? "#e67e22" : pct < 0.7 ? "#f1c40f" : "#2ecc71";
        return (
          <g key={point.label}>
            <circle cx={point.x + 15 * scale} cy={point.y + 15 * scale} r={(14 + pct * 8) * scale} fill={color} opacity={0.88} />
            <text x={point.x + 15 * scale} y={point.y + 15 * scale - 2 * scale} textAnchor="middle" fill="white" fontSize={9 * scale} fontWeight="700">
              {stat.attempts ? `${stat.makes}/${stat.attempts}` : "-"}
            </text>
            <text x={point.x + 15 * scale} y={point.y + 15 * scale + 8 * scale} textAnchor="middle" fill="rgba(255,255,255,0.68)" fontSize={7.5 * scale}>
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={styles.card}>
      <div style={styles.eyebrow}>{label}</div>
      <div style={styles.bigNumber}>{value}</div>
      <div style={styles.muted}>{sub}</div>
    </div>
  );
}

function Home({ contestsWithStats, onOpenContest }) {
  const winnerCounts = contestsWithStats.reduce((acc, entry) => {
    acc[entry.contest.winner] = (acc[entry.contest.winner] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div style={styles.hero}>
        <div>
          <div style={styles.eyebrow}>Home</div>
          <h1 style={styles.h1}>Mohamed Adem Three Point Contest</h1>
        </div>
        <div style={styles.heroStat}>
          <span>Contests</span>
          <strong>{contestsWithStats.length}</strong>
        </div>
      </div>

      <section style={styles.panel}>
        <div style={styles.sectionHead}>
          <div>
            <div style={styles.eyebrow}>All-time results</div>
            <h2 style={styles.h2}>Winners and runner-ups</h2>
          </div>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {contestsWithStats.map(({ contest, stats }) => (
            <button key={contest.id} onClick={() => onOpenContest(contest.id)} style={styles.resultRow}>
              <span style={{ color: "rgba(255,255,255,0.55)" }}>{contest.label}</span>
              <strong>🏆 {contest.winner}</strong>
              <span>Runner-up: {contest.runnerUp}</span>
              <span>{stats.overallPct}% field / {stats.totalMakes}/{stats.totalAttempts}</span>
            </button>
          ))}
        </div>
      </section>

      <section style={styles.panel}>
        <div style={styles.sectionHead}>
          <div>
            <div style={styles.eyebrow}>Title count</div>
            <h2 style={styles.h2}>Early leaderboard</h2>
          </div>
        </div>
        <div style={styles.titleGrid}>
          {Object.entries(winnerCounts).map(([name, titles]) => (
            <div key={name} style={styles.card}>
              <div style={styles.eyebrow}>Champion</div>
              <div style={{ ...styles.h2, color: "#F97316" }}>{name}</div>
              <div style={styles.muted}>{titles} title{titles === 1 ? "" : "s"}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ContestOverview({ contest, stats }) {
  const [sortKey, setSortKey] = useState("finish");
  const sorted = [...stats.players].sort((a, b) => {
    if (sortKey === "finish") return b.eliminated - a.eliminated || b.totalMakes - a.totalMakes;
    if (sortKey === "pct") return b.pct - a.pct || b.totalMakes - a.totalMakes;
    if (sortKey === "avg") return Number.parseFloat(b.avg) - Number.parseFloat(a.avg);
    if (sortKey === "best") return b.best - a.best;
    return 0;
  });

  return (
    <div>
      <div style={styles.statGrid}>
        <StatCard label="Players" value={stats.players.length} sub={contest.title} />
        <StatCard label="Overall FG%" value={`${stats.overallPct}%`} sub={`${stats.totalMakes}/${stats.totalAttempts} all rounds`} />
        <StatCard label="Most Makes" value={stats.mostMakes.totalMakes} sub={stats.mostMakes.name} />
        <StatCard label="Perfect Rounds" value={stats.perfectRounds} sub="5/5 rounds" />
      </div>
      <section style={styles.panel}>
        <div style={styles.segmented}>
          {[
            ["finish", "Finish"],
            ["pct", "FG%"],
            ["avg", "Avg"],
            ["best", "Best"],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setSortKey(key)} style={sortKey === key ? styles.segmentActive : styles.segment}>
              Sort: {label}
            </button>
          ))}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["#", "Player", "Finish", "Rounds", "Makes", "FG%", "Avg/Rd", "Best", "0/5s"].map((heading) => <th key={heading} style={styles.th}>{heading}</th>)}
              </tr>
            </thead>
            <tbody>
              {sorted.map((player, index) => (
                <tr key={player.name}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={{ ...styles.td, color: player.winner ? "#F97316" : "white", fontWeight: 700 }}>{player.winner ? "🏆 " : ""}{player.name}</td>
                  <td style={styles.td}>{finishLabel(player)}</td>
                  <td style={styles.td}>{player.roundsPlayed}</td>
                  <td style={styles.td}>{player.totalMakes}/{player.totalAttempts}</td>
                  <td style={{ ...styles.td, color: player.pct >= 50 ? "#2ecc71" : player.pct >= 30 ? "#f1c40f" : "#e74c3c", fontWeight: 700 }}>{player.pct}%</td>
                  <td style={styles.td}>{player.avg}</td>
                  <td style={{ ...styles.td, color: "#F97316", fontWeight: 700 }}>{player.best}</td>
                  <td style={{ ...styles.td, color: player.zeros ? "#e74c3c" : "rgba(255,255,255,0.45)" }}>{player.zeros}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function BracketView({ stats, suddenDeath }) {
  const rounds = ["Round 1", "Round 2", "Round 3", "Round 4", "Final"];
  const roundPlayers = {
    "Round 1": stats.sorted.map((player) => player.name),
    "Round 2": stats.sorted.filter((player) => player.eliminated >= 2).map((player) => player.name),
    "Round 3": stats.sorted.filter((player) => player.eliminated >= 3).map((player) => player.name),
    "Round 4": stats.sorted.filter((player) => player.eliminated >= 4).map((player) => player.name),
    Final: stats.sorted.filter((player) => player.eliminated >= 5).map((player) => player.name),
  };

  return (
    <div>
      <section style={styles.panel}>
        <div style={{ overflowX: "auto" }}>
          <div style={styles.bracket}>
            {rounds.map((round, roundIndex) => (
              <div key={round}>
                <div style={styles.bracketTitle}>{round}</div>
                {roundPlayers[round].map((name) => {
                  const player = stats.players.find((entry) => entry.name === name);
                  const eliminated = player.eliminated === roundIndex + 1;
                  const isWinner = player.winner && round === "Final";
                  return (
                    <div key={name} style={{
                      ...styles.bracketPlayer,
                      color: isWinner ? "#F97316" : eliminated ? "rgba(255,255,255,0.3)" : "white",
                      borderColor: isWinner ? "rgba(249,115,22,0.55)" : "rgba(255,255,255,0.1)",
                      background: isWinner ? "rgba(249,115,22,0.18)" : "rgba(255,255,255,0.045)",
                      textDecoration: eliminated ? "line-through" : "none",
                    }}>
                      <span>{isWinner ? "🏆 " : ""}{name}</span>
                      {player.roundScores[roundIndex] !== null && <strong>{player.roundScores[roundIndex]}</strong>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={styles.panel}>
        <div style={styles.eyebrow}>Sudden death</div>
        <h2 style={styles.h2}>Tiebreakers</h2>
        {Object.entries(suddenDeath).map(([round, players]) => (
          <div key={round} style={{ marginTop: 16 }}>
            <div style={{ ...styles.eyebrow, color: "#F97316" }}>{round}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              {players.map((player) => (
                <div key={player.player} style={{
                  ...styles.sdPill,
                  color: player.made ? "#2ecc71" : "#e74c3c",
                  borderColor: player.made ? "rgba(46,204,113,0.35)" : "rgba(231,76,60,0.35)",
                }}>
                  {player.player} / {player.made ? `made on ${player.attempts}` : `0/${player.attempts}`}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function ZonesView({ stats }) {
  const combinedZones = ZONES.map((_, zoneIndex) => ({
    makes: stats.players.reduce((sum, player) => sum + player.zoneStats[zoneIndex].makes, 0),
    attempts: stats.players.reduce((sum, player) => sum + player.zoneStats[zoneIndex].attempts, 0),
  }));

  return (
    <div>
      <section style={styles.panel}>
        <div style={styles.eyebrow}>Field overview</div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <ShotMap zoneStats={combinedZones} />
        </div>
      </section>
      <div style={styles.zoneGrid}>
        {ZONES.map((zone, zoneIndex) => {
          const total = combinedZones[zoneIndex];
          const pct = total.attempts ? Math.round((total.makes / total.attempts) * 100) : 0;
          return (
            <div key={zone} style={styles.card}>
              <div style={styles.eyebrow}>{zone}</div>
              <div style={styles.muted}>{ZONE_LABELS[zoneIndex]}</div>
              <div style={{ ...styles.bigNumber, color: pct >= 40 ? "#2ecc71" : pct >= 25 ? "#f1c40f" : "#e74c3c" }}>{pct}%</div>
              <div style={styles.muted}>{total.makes}/{total.attempts} overall</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlayerCards({ stats }) {
  return (
    <div style={styles.playerGrid}>
      {stats.sorted.map((player) => (
        <div key={player.name} style={{ ...styles.card, borderColor: player.winner ? "rgba(249,115,22,0.45)" : "rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
            <div>
              <h3 style={{ ...styles.h2, color: player.winner ? "#F97316" : "white" }}>{player.winner ? "🏆 " : ""}{player.name}</h3>
              <div style={styles.eyebrow}>{finishLabel(player)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={styles.bigNumber}>{player.pct}%</div>
              <div style={styles.muted}>FG%</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <ShotMap zoneStats={player.zoneStats} size="sm" />
          </div>
          <div style={styles.miniStats}>
            <span>Makes <strong>{player.totalMakes}</strong></span>
            <span>Avg <strong>{player.avg}</strong></span>
            <span>Best <strong>{player.best}</strong></span>
            <span>0/5s <strong>{player.zeros}</strong></span>
          </div>
          <div style={styles.roundBars}>
            {player.roundScores.map((score, index) => (
              <div key={ROUNDS[index]} style={styles.roundBar}>
                <span>{score ?? "-"}</span>
                <div style={{ height: score === null ? 4 : Math.max(4, (score / 5) * 40), background: score === 0 ? "rgba(231,76,60,0.45)" : score >= 3 ? "rgba(249,115,22,0.75)" : "rgba(249,115,22,0.35)" }} />
                <small>{ROUNDS[index]}</small>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const contestsWithStats = useMemo(() => contests.map((contest) => ({ contest, stats: getContestStats(contest) })), []);
  const [mainTab, setMainTab] = useState("home");
  const [activeContestId, setActiveContestId] = useState(contests[0].id);
  const [contestTab, setContestTab] = useState("overview");
  const activeEntry = contestsWithStats.find((entry) => entry.contest.id === activeContestId) || contestsWithStats[0];

  const openContest = (contestId) => {
    setActiveContestId(contestId);
    setMainTab("contest");
    setContestTab("overview");
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <div style={styles.brand}>Home of the Mohamed Adem Three Point Contest</div>
          <div style={styles.headerSub}>Weekly 5-zone shooting stats / winners / player cards</div>
        </div>
        <div style={styles.championBadge}>
          <span>Current Champion</span>
          <strong>🏆 {activeEntry.contest.winner}</strong>
        </div>
      </header>

      <nav style={styles.tabs}>
        <button onClick={() => setMainTab("home")} style={mainTab === "home" ? styles.tabActive : styles.tab}>Home</button>
        {contestsWithStats.map(({ contest }) => (
          <button key={contest.id} onClick={() => openContest(contest.id)} style={mainTab === "contest" && activeContestId === contest.id ? styles.tabActive : styles.tab}>
            {contest.title}
          </button>
        ))}
        <button onClick={() => setMainTab("players")} style={mainTab === "players" ? styles.tabActive : styles.tab}>Player Cards</button>
      </nav>

      <main style={styles.content}>
        {mainTab === "home" && <Home contestsWithStats={contestsWithStats} onOpenContest={openContest} />}

        {mainTab === "contest" && (
          <div>
            <div style={styles.pageHead}>
              <div>
                <div style={styles.eyebrow}>{activeEntry.contest.date}</div>
                <h1 style={styles.h1}>{activeEntry.contest.title}</h1>
              </div>
              <div style={styles.weekPills}>
                {["overview", "bracket", "zones"].map((tab) => (
                  <button key={tab} onClick={() => setContestTab(tab)} style={contestTab === tab ? styles.segmentActive : styles.segment}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            {contestTab === "overview" && <ContestOverview contest={activeEntry.contest} stats={activeEntry.stats} />}
            {contestTab === "bracket" && <BracketView stats={activeEntry.stats} suddenDeath={activeEntry.contest.suddenDeath} />}
            {contestTab === "zones" && <ZonesView stats={activeEntry.stats} />}
          </div>
        )}

        {mainTab === "players" && (
          <div>
            <div style={styles.pageHead}>
              <div>
                <div style={styles.eyebrow}>{activeEntry.contest.label}</div>
                <h1 style={styles.h1}>Player cards</h1>
              </div>
            </div>
            <PlayerCards stats={activeEntry.stats} />
          </div>
        )}
      </main>

      <footer style={styles.footer}>Contest 1 / 5 rounds / 12 players / LC-LW-TK-RW-RC</footer>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "#0A0A0A",
    color: "white",
    fontFamily: "'DM Mono', monospace",
  },
  header: {
    borderBottom: "1px solid rgba(249,115,22,0.2)",
    padding: "22px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
  },
  brand: {
    fontFamily: "'Bebas Neue', cursive",
    fontSize: 38,
    color: "#F97316",
    lineHeight: 1,
  },
  headerSub: {
    marginTop: 6,
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    textTransform: "uppercase",
  },
  championBadge: {
    textAlign: "right",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "10px 14px",
    background: "rgba(255,255,255,0.04)",
  },
  tabs: {
    display: "flex",
    gap: 0,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: "0 32px",
    overflowX: "auto",
  },
  tab: {
    padding: "14px 20px",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    textTransform: "uppercase",
    cursor: "pointer",
  },
  tabActive: {
    padding: "14px 20px",
    background: "none",
    border: "none",
    borderBottom: "2px solid #F97316",
    color: "#F97316",
    fontSize: 11,
    textTransform: "uppercase",
    cursor: "pointer",
  },
  content: {
    padding: "30px 32px 42px",
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    alignItems: "end",
    marginBottom: 24,
    flexWrap: "wrap",
  },
  heroStat: {
    minWidth: 120,
    border: "1px solid rgba(249,115,22,0.25)",
    borderRadius: 8,
    padding: 14,
    color: "#F97316",
    textAlign: "right",
  },
  pageHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  h1: {
    margin: 0,
    fontFamily: "'Bebas Neue', cursive",
    fontSize: 48,
    lineHeight: 1,
    color: "white",
  },
  h2: {
    margin: "2px 0 0",
    fontFamily: "'Bebas Neue', cursive",
    fontSize: 28,
    lineHeight: 1,
    fontWeight: 400,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.38)",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  muted: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
  },
  panel: {
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 20,
    marginBottom: 18,
  },
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 18,
  },
  resultRow: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr 1fr 0.8fr",
    gap: 14,
    alignItems: "center",
    textAlign: "left",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "white",
    borderRadius: 8,
    padding: "14px 16px",
    cursor: "pointer",
  },
  titleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 18,
  },
  bigNumber: {
    marginTop: 6,
    fontFamily: "'Bebas Neue', cursive",
    color: "#F97316",
    fontSize: 38,
    lineHeight: 1,
  },
  segmented: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  weekPills: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  segment: {
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 999,
    background: "transparent",
    color: "rgba(255,255,255,0.52)",
    padding: "7px 13px",
    cursor: "pointer",
    textTransform: "uppercase",
    fontSize: 11,
  },
  segmentActive: {
    border: "1px solid rgba(249,115,22,0.55)",
    borderRadius: 999,
    background: "rgba(249,115,22,0.14)",
    color: "#F97316",
    padding: "7px 13px",
    cursor: "pointer",
    textTransform: "uppercase",
    fontSize: 11,
  },
  table: {
    width: "100%",
    minWidth: 760,
    borderCollapse: "collapse",
    fontSize: 12,
  },
  th: {
    color: "rgba(255,255,255,0.38)",
    textAlign: "left",
    padding: "8px 10px",
    borderBottom: "1px solid rgba(249,115,22,0.28)",
    fontWeight: 400,
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.68)",
  },
  bracket: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(135px, 1fr))",
    minWidth: 760,
    gap: 4,
  },
  bracketTitle: {
    color: "#F97316",
    textAlign: "center",
    padding: "8px 0 12px",
    borderBottom: "1px solid rgba(249,115,22,0.3)",
    marginBottom: 10,
    fontSize: 11,
  },
  bracketPlayer: {
    margin: "5px 6px",
    padding: "7px 9px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    justifyContent: "space-between",
    gap: 8,
    fontSize: 11,
  },
  sdPill: {
    border: "1px solid",
    borderRadius: 8,
    padding: "8px 12px",
    background: "rgba(255,255,255,0.035)",
    fontSize: 11,
  },
  zoneGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
  },
  playerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 16,
  },
  miniStats: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
    fontSize: 10,
    color: "rgba(255,255,255,0.42)",
    marginBottom: 16,
  },
  roundBars: {
    display: "flex",
    alignItems: "end",
    gap: 7,
    height: 70,
  },
  roundBar: {
    flex: 1,
    display: "grid",
    gridTemplateRows: "16px 40px 12px",
    alignItems: "end",
    textAlign: "center",
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
  },
  footer: {
    borderTop: "1px solid rgba(255,255,255,0.05)",
    padding: "16px 32px",
    color: "rgba(255,255,255,0.25)",
    fontSize: 10,
    textTransform: "uppercase",
  },
};
