import React, { useEffect, useMemo, useState } from "react";

const ZONES = ["LC", "LW", "TK", "RW", "RC"];
const ZONE_LABELS = ["Left Corner", "Left Wing", "Top Key", "Right Wing", "Right Corner"];
const ROUND_KEYS = ["r1", "r2", "r3", "r4", "r5"];
const ROUND_LABELS = ["R1", "R2", "R3", "R4", "Final"];
const CONTEST_ROUNDS = ["Round 1", "Round 2", "Round 3", "Round 4", "Final"];

const CONTESTS = [
  {
    id: "contest-1",
    title: "Contest 1",
    date: "April 22, 2026",
    winner: "Mohamed Abdisalan",
    runnerUp: "Yahya",
    rawData: {
      Abdiaziz: { r1: "00000", r2: null, r3: null, r4: null, r5: null, eliminated: 1 },
      "Mohamed Abdisalan": { r1: "01110", r2: "01100", r3: "00111", r4: "11001", r5: "00011", eliminated: 6, winner: true },
      "Mohamed Omar": { r1: "10100", r2: { score: 2, zonesKnown: false }, r3: "00100", r4: null, r5: null, eliminated: 3 },
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

function sumRound(round) {
  if (!round || round === "?????") return null;
  if (typeof round === "object") return round.score ?? null;
  return parseShots(round).reduce((total, shot) => total + shot, 0);
}

function buildRoundDetail(round) {
  if (!round || round === "?????") {
    return {
      raw: round,
      score: null,
      zoneStats: ZONES.map(() => ({ makes: 0, attempts: 0 })),
    };
  }

  if (typeof round === "object") {
    return {
      raw: null,
      score: round.score ?? null,
      zonesKnown: false,
      zoneStats: ZONES.map(() => ({ makes: 0, attempts: 0 })),
    };
  }

  const shots = parseShots(round);
  return {
    raw: round,
    score: shots.reduce((total, shot) => total + shot, 0),
    zonesKnown: true,
    zoneStats: shots.map((shot) => ({ makes: shot, attempts: 1 })),
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

function computeContestPlayerStats(name, data) {
  const rounds = ROUND_KEYS.map((key) => data[key]);
  const roundDetails = rounds.map(buildRoundDetail);
  const zoneStats = ZONES.map(() => ({ makes: 0, attempts: 0 }));
  let totalMakes = 0;
  let totalAttempts = 0;
  let zeroRounds = 0;

  rounds.forEach((round) => {
    if (!round || round === "?????") return;
    if (typeof round === "object") {
      totalAttempts += 5;
      totalMakes += round.score ?? 0;
      if ((round.score ?? 0) === 0) zeroRounds += 1;
      return;
    }
    const shots = parseShots(round);
    const roundMakes = shots.reduce((sum, shot, index) => {
      zoneStats[index].attempts += 1;
      zoneStats[index].makes += shot;
      totalAttempts += 1;
      totalMakes += shot;
      return sum + shot;
    }, 0);
    if (roundMakes === 0) zeroRounds += 1;
  });

  const roundScores = roundDetails.map((detail) => detail.score);
  const validScores = roundScores.filter((score) => score !== null);
  const roundOneDonut = rounds[0] === "00000";

  return {
    name,
    totalMakes,
    totalAttempts,
    pct: totalAttempts ? Math.round((totalMakes / totalAttempts) * 100) : 0,
    avg: validScores.length ? (validScores.reduce((sum, score) => sum + score, 0) / validScores.length).toFixed(2) : "-",
    best: validScores.length ? Math.max(...validScores) : 0,
    zeroRounds,
    zoneStats,
    roundDetails,
    roundScores,
    roundsPlayed: validScores.length,
    eliminated: data.eliminated,
    winner: Boolean(data.winner),
    runnerUp: data.eliminated === 5,
    roundOneDonut,
    firstRoundExit: data.eliminated === 1,
  };
}

function buildContestStats(contest) {
  const players = Object.entries(contest.rawData).map(([name, data]) => computeContestPlayerStats(name, data));
  const sorted = [...players].sort((a, b) => b.eliminated - a.eliminated || b.totalMakes - a.totalMakes);
  const totalMakes = players.reduce((sum, player) => sum + player.totalMakes, 0);
  const totalAttempts = players.reduce((sum, player) => sum + player.totalAttempts, 0);
  const overallPct = totalAttempts ? Math.round((totalMakes / totalAttempts) * 100) : 0;
  const perfectRounds = players.reduce((sum, player) => sum + player.roundScores.filter((score) => score === 5).length, 0);
  const mostMakes = players.reduce((leader, player) => (player.totalMakes > leader.totalMakes ? player : leader), players[0]);
  return { players, sorted, totalMakes, totalAttempts, overallPct, perfectRounds, mostMakes };
}

function buildLeagueData(contests) {
  const contestEntries = contests.map((contest) => ({
    ...contest,
    stats: buildContestStats(contest),
  }));

  const playersMap = new Map();

  contestEntries.forEach((contest) => {
    contest.stats.players.forEach((player) => {
      if (!playersMap.has(player.name)) {
        playersMap.set(player.name, {
          name: player.name,
          appearances: 0,
          wins: 0,
          runnerUps: 0,
          finalsAppearances: 0,
          firstRoundExits: 0,
          donutGangAppearances: 0,
          zeroRounds: 0,
          totalMakes: 0,
          totalAttempts: 0,
          totalRounds: 0,
          bestRound: 0,
          totalFinishScore: 0,
          zoneStats: ZONES.map(() => ({ makes: 0, attempts: 0 })),
          contests: [],
        });
      }

      const aggregate = playersMap.get(player.name);
      aggregate.appearances += 1;
      aggregate.wins += player.winner ? 1 : 0;
      aggregate.runnerUps += player.runnerUp ? 1 : 0;
      aggregate.finalsAppearances += player.eliminated >= 5 ? 1 : 0;
      aggregate.firstRoundExits += player.firstRoundExit ? 1 : 0;
      aggregate.donutGangAppearances += player.roundOneDonut ? 1 : 0;
      aggregate.zeroRounds += player.zeroRounds;
      aggregate.totalMakes += player.totalMakes;
      aggregate.totalAttempts += player.totalAttempts;
      aggregate.totalRounds += player.roundsPlayed;
      aggregate.bestRound = Math.max(aggregate.bestRound, player.best);
      aggregate.totalFinishScore += player.eliminated;
      aggregate.zoneStats = aggregate.zoneStats.map((zone, index) => ({
        makes: zone.makes + player.zoneStats[index].makes,
        attempts: zone.attempts + player.zoneStats[index].attempts,
      }));
      aggregate.contests.push({
        contestId: contest.id,
        title: contest.title,
        date: contest.date,
        winner: contest.winner,
        finish: finishLabel(player),
        eliminated: player.eliminated,
        totalMakes: player.totalMakes,
        totalAttempts: player.totalAttempts,
        pct: player.pct,
        roundDetails: player.roundDetails,
        roundScores: player.roundScores,
      });
    });
  });

  const players = [...playersMap.values()]
    .map((player) => ({
      ...player,
      fgPct: player.totalAttempts ? Math.round((player.totalMakes / player.totalAttempts) * 100) : 0,
      avgFinish: player.appearances ? (player.totalFinishScore / player.appearances).toFixed(2) : "-",
      avgRoundScore: player.totalRounds ? (player.totalMakes / player.totalRounds).toFixed(2) : "-",
    }))
    .sort((a, b) => b.wins - a.wins || b.runnerUps - a.runnerUps || b.fgPct - a.fgPct || b.totalMakes - a.totalMakes);

  const records = {
    mostWins: getRecordLeaders(players, "wins"),
    mostRunnerUps: getRecordLeaders(players, "runnerUps"),
    mostFinals: getRecordLeaders(players, "finalsAppearances"),
    highestFG: getRecordLeaders(players, "fgPct"),
    mostMakes: getRecordLeaders(players, "totalMakes"),
    bestRound: getRecordLeaders(players, "bestRound"),
    donutGang: getRecordLeaders(players, "donutGangAppearances"),
    zeroRounds: getRecordLeaders(players, "zeroRounds"),
    firstRoundExits: getRecordLeaders(players, "firstRoundExits"),
  };

  return { contests: contestEntries, players, records };
}

function getRecordLeaders(players, key) {
  const best = Math.max(...players.map((player) => player[key]));
  return {
    value: best,
    leaders: players.filter((player) => player[key] === best && best > 0),
  };
}

function useIsMobile(breakpoint = 768) {
  const getMatch = () => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= breakpoint;
  };

  const [isMobile, setIsMobile] = useState(getMatch);

  useEffect(() => {
    const handleResize = () => setIsMobile(getMatch());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

function ShotMap({ zoneStats, size = "md" }) {
  const scale = size === "sm" ? 0.65 : 1;
  const width = 220 * scale;
  const height = 130 * scale;
  const anchors = [
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
      {anchors.map((anchor, index) => {
        const stat = zoneStats[index];
        const pct = stat.attempts ? stat.makes / stat.attempts : 0;
        const color = stat.attempts === 0 ? "#333" : pct === 0 ? "#c0392b" : pct < 0.4 ? "#e67e22" : pct < 0.7 ? "#f1c40f" : "#2ecc71";
        return (
          <g key={anchor.label}>
            <circle cx={anchor.x + 15 * scale} cy={anchor.y + 15 * scale} r={(14 + pct * 8) * scale} fill={color} opacity={0.88} />
            <text x={anchor.x + 15 * scale} y={anchor.y + 15 * scale - 2 * scale} textAnchor="middle" fill="white" fontSize={9 * scale} fontWeight="700">
              {stat.attempts ? `${stat.makes}/${stat.attempts}` : "-"}
            </text>
            <text x={anchor.x + 15 * scale} y={anchor.y + 15 * scale + 8 * scale} textAnchor="middle" fill="rgba(255,255,255,0.68)" fontSize={7.5 * scale}>
              {anchor.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function SummaryStat({ label, value, sub }) {
  return (
    <div style={styles.card}>
      <div style={styles.eyebrow}>{label}</div>
      <div style={styles.bigNumber}>{value}</div>
      <div style={styles.muted}>{sub}</div>
    </div>
  );
}

function HomePage({ contests, players, records, onOpenContest, onOpenPlayer, isMobile }) {
  const latest = contests[0];
  return (
    <div>
      <section style={{ ...styles.hero, ...(isMobile ? styles.heroMobile : null) }}>
        <div>
          <div style={styles.eyebrow}>Weekly league archive</div>
          <h1 style={styles.h1}>Mohamed Adem Three Point Contest</h1>
          <div style={{ ...styles.muted, fontSize: 14, maxWidth: 680 }}>
            Weekly contest winners, all-time player history, records, zone trends, and full contest breakdowns.
          </div>
        </div>
        <div style={styles.heroPanel}>
          <div style={styles.eyebrow}>Latest winner</div>
          <div style={styles.heroWinner}>🏆 {latest.winner}</div>
          <div style={styles.muted}>{latest.date} / {latest.title}</div>
        </div>
      </section>

      <section style={styles.panel}>
        <div style={styles.sectionHead}>
          <div>
            <div style={styles.eyebrow}>Recent contests</div>
            <h2 style={styles.h2}>Weekly winners and runner-ups</h2>
          </div>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {contests.map((contest) => (
            <button key={contest.id} onClick={() => onOpenContest(contest.id)} style={{ ...styles.historyRow, ...(isMobile ? styles.historyRowMobile : null) }}>
              <span>{contest.date}</span>
              <strong>{contest.title}</strong>
              <span>🏆 {contest.winner}</span>
              <span>Runner-up: {contest.runnerUp}</span>
            </button>
          ))}
        </div>
      </section>

      <div style={{ ...styles.twoColumn, ...(isMobile ? styles.singleColumn : null) }}>
        <section style={styles.panel}>
          <div style={styles.sectionHead}>
            <div>
              <div style={styles.eyebrow}>All-time leaders</div>
              <h2 style={styles.h2}>Top players so far</h2>
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {players.slice(0, 6).map((player, index) => (
              <button key={player.name} onClick={() => onOpenPlayer(player.name)} style={styles.rankRow}>
                <span>{index + 1}</span>
                <strong>{player.name}</strong>
                <span>{player.wins} wins</span>
                <span>{player.fgPct}% FG</span>
              </button>
            ))}
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.sectionHead}>
            <div>
              <div style={styles.eyebrow}>League records</div>
              <h2 style={styles.h2}>Current marks</h2>
            </div>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            <RecordSnippet title="Most Wins" record={records.mostWins} />
            <RecordSnippet title="Highest FG%" record={records.highestFG} suffix="%" />
            <RecordSnippet title="Most Donut Gang Appearances" record={records.donutGang} />
            <RecordSnippet title="Most 0/5 Rounds" record={records.zeroRounds} />
          </div>
        </section>
      </div>
    </div>
  );
}

function ContestsPage({ contests, activeContestId, onSelectContest, isMobile }) {
  const activeContest = contests.find((contest) => contest.id === activeContestId) || contests[0];
  const [contestTab, setContestTab] = useState("overview");
  const overviewStats = activeContest.stats;

  return (
    <div>
      <div style={styles.pageHead}>
        <div>
          <div style={styles.eyebrow}>Contests</div>
          <h1 style={styles.h1}>Weekly contests</h1>
        </div>
      </div>

      <div style={{ ...styles.contestLayout, ...(isMobile ? styles.singleColumnLayout : null) }}>
        <aside style={styles.panel}>
          <div style={styles.eyebrow}>Archive</div>
          <div style={{ ...(isMobile ? styles.mobilePickerRow : styles.listStack), marginTop: 14 }}>
            {contests.map((contest) => (
              <button key={contest.id} onClick={() => onSelectContest(contest.id)} style={contest.id === activeContest.id ? styles.listActive : styles.listButton}>
                <strong>{contest.title}</strong>
                <span>{contest.date}</span>
                <span>🏆 {contest.winner}</span>
              </button>
            ))}
          </div>
        </aside>

        <div>
          <section style={styles.panel}>
            <div style={styles.pageHead}>
              <div>
                <div style={styles.eyebrow}>{activeContest.date}</div>
                <h2 style={styles.h2}>{activeContest.title}</h2>
              </div>
              <div style={styles.segmented}>
                {["overview", "bracket", "zones"].map((tab) => (
                  <button key={tab} onClick={() => setContestTab(tab)} style={contestTab === tab ? styles.segmentActive : styles.segment}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {contestTab === "overview" && <ContestOverview stats={overviewStats} isMobile={isMobile} />}
            {contestTab === "bracket" && <BracketSection contest={activeContest} />}
            {contestTab === "zones" && <ContestZones stats={overviewStats} />}
          </section>
        </div>
      </div>
    </div>
  );
}

function ContestOverview({ stats, isMobile }) {
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
        <SummaryStat label="Players" value={stats.players.length} sub="contest field" />
        <SummaryStat label="Overall FG%" value={`${stats.overallPct}%`} sub={`${stats.totalMakes}/${stats.totalAttempts} all shots`} />
        <SummaryStat label="Most Makes" value={stats.mostMakes.totalMakes} sub={stats.mostMakes.name} />
        <SummaryStat label="Perfect Rounds" value={stats.perfectRounds} sub="5/5 rounds" />
      </div>

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

      {isMobile ? (
        <div style={styles.mobileOverviewList}>
          {sorted.map((player, index) => (
            <div key={player.name} style={styles.mobileOverviewCard}>
              <div style={styles.mobileOverviewHead}>
                <div>
                  <div style={styles.eyebrow}>#{index + 1} / {finishLabel(player)}</div>
                  <strong style={{ color: player.winner ? "#F97316" : "white" }}>{player.winner ? "🏆 " : ""}{player.name}</strong>
                </div>
                <div style={{ ...styles.recordValue, fontSize: 24, color: player.pct >= 50 ? "#2ecc71" : player.pct >= 30 ? "#f1c40f" : "#e74c3c" }}>{player.pct}%</div>
              </div>
              <div style={styles.mobileOverviewStats}>
                <MiniLine label="Makes" value={`${player.totalMakes}/${player.totalAttempts}`} />
                <MiniLine label="Rounds" value={player.roundsPlayed} />
                <MiniLine label="Avg / Rd" value={player.avg} />
                <MiniLine label="Best" value={player.best} />
                <MiniLine label="0/5s" value={player.zeroRounds} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["#", "Player", "Finish", "Rounds", "Makes", "FG%", "Avg/Rd", "Best", "0/5s"].map((heading) => (
                  <th key={heading} style={styles.th}>{heading}</th>
                ))}
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
                  <td style={{ ...styles.td, color: player.zeroRounds ? "#e74c3c" : "rgba(255,255,255,0.4)" }}>{player.zeroRounds}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BracketSection({ contest }) {
  const stats = contest.stats;
  const roundPlayers = {
    "Round 1": stats.sorted.map((player) => player.name),
    "Round 2": stats.sorted.filter((player) => player.eliminated >= 2).map((player) => player.name),
    "Round 3": stats.sorted.filter((player) => player.eliminated >= 3).map((player) => player.name),
    "Round 4": stats.sorted.filter((player) => player.eliminated >= 4).map((player) => player.name),
    Final: stats.sorted.filter((player) => player.eliminated >= 5).map((player) => player.name),
  };

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <div style={styles.bracket}>
          {CONTEST_ROUNDS.map((round, roundIndex) => (
            <div key={round}>
              <div style={styles.bracketTitle}>{round}</div>
              {roundPlayers[round].map((name) => {
                const player = stats.players.find((entry) => entry.name === name);
                const eliminated = player.eliminated === roundIndex + 1;
                const isWinner = player.winner && round === "Final";
                return (
                  <div key={name} style={{
                    ...styles.bracketPlayer,
                    color: isWinner ? "#F97316" : eliminated ? "rgba(255,255,255,0.34)" : "white",
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

      <div style={{ marginTop: 22 }}>
        <div style={styles.eyebrow}>Sudden death</div>
        <h3 style={styles.h3}>Tiebreakers</h3>
        {Object.entries(contest.suddenDeath).map(([round, players]) => (
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
      </div>
    </div>
  );
}

function ContestZones({ stats }) {
  const combinedZones = ZONES.map((_, zoneIndex) => ({
    makes: stats.players.reduce((sum, player) => sum + player.zoneStats[zoneIndex].makes, 0),
    attempts: stats.players.reduce((sum, player) => sum + player.zoneStats[zoneIndex].attempts, 0),
  }));

  return (
    <div>
      <div style={styles.panelInset}>
        <div style={styles.eyebrow}>Field overview</div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <ShotMap zoneStats={combinedZones} />
        </div>
      </div>

      <div style={styles.zoneGrid}>
        {ZONES.map((zone, index) => {
          const makes = combinedZones[index].makes;
          const attempts = combinedZones[index].attempts;
          const pct = attempts ? Math.round((makes / attempts) * 100) : 0;
          return (
            <div key={zone} style={styles.card}>
              <div style={styles.eyebrow}>{zone}</div>
              <div style={styles.muted}>{ZONE_LABELS[index]}</div>
              <div style={{ ...styles.bigNumber, color: pct >= 40 ? "#2ecc71" : pct >= 25 ? "#f1c40f" : "#e74c3c" }}>{pct}%</div>
              <div style={styles.muted}>{makes}/{attempts} overall</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlayersPage({ players, activePlayerName, onOpenPlayer, isMobile }) {
  const activePlayer = players.find((player) => player.name === activePlayerName) || players[0];
  const [expandedContestId, setExpandedContestId] = useState(activePlayer?.contests[0]?.contestId ?? null);
  const primaryStats = [
    { label: "Appearances", value: activePlayer.appearances },
    { label: "Wins", value: activePlayer.wins },
    { label: "FG%", value: `${activePlayer.fgPct}%` },
  ];
  const secondaryStats = [
    { label: "Avg Finish", value: activePlayer.avgFinish, sub: "elimination round score" },
    { label: "Donut Gang", value: activePlayer.donutGangAppearances, sub: "0/5 in Round 1" },
    { label: "0/5 Rounds", value: activePlayer.zeroRounds, sub: "all rounds combined" },
  ];

  useEffect(() => {
    setExpandedContestId(activePlayer?.contests[0]?.contestId ?? null);
  }, [activePlayerName]);

  return (
    <div>
      <div style={styles.pageHead}>
        <div>
          <div style={styles.eyebrow}>Players</div>
          <h1 style={styles.h1}>Player profiles</h1>
        </div>
      </div>

      <div style={{ ...styles.playersLayout, ...(isMobile ? styles.singleColumnLayout : null) }}>
        <aside style={styles.panel}>
          <div style={styles.eyebrow}>Directory</div>
          <div style={{ ...(isMobile ? styles.mobilePlayerDirectory : styles.listStack), marginTop: 14 }}>
            {players.map((player) => (
              <button
                key={player.name}
                onClick={() => onOpenPlayer(player.name)}
                style={
                  isMobile
                    ? player.name === activePlayer.name
                      ? styles.mobilePlayerButtonActive
                      : styles.mobilePlayerButton
                    : player.name === activePlayer.name
                      ? styles.listActive
                      : styles.listButton
                }
              >
                <strong>{player.name}</strong>
                <span>{player.appearances} app / {player.fgPct}% FG</span>
                {!isMobile && <span>{player.wins} wins / {player.fgPct}% FG</span>}
              </button>
            ))}
          </div>
        </aside>

        <div>
          <section style={styles.panel}>
            <div style={styles.pageHead}>
              <div>
                <div style={styles.eyebrow}>Player page</div>
                <h2 style={styles.h2}>{activePlayer.name}</h2>
              </div>
            </div>

            {isMobile ? (
              <div style={styles.mobilePlayerHero}>
                <div style={styles.mobilePlayerHeroStats}>
                  {primaryStats.map((stat) => (
                    <div key={stat.label} style={styles.mobilePlayerChip}>
                      <div style={styles.eyebrow}>{stat.label}</div>
                      <strong style={styles.mobilePlayerChipValue}>{stat.value}</strong>
                    </div>
                  ))}
                </div>
                <div style={styles.mobileSecondaryStats}>
                  {secondaryStats.map((stat) => (
                    <div key={stat.label} style={styles.mobileSecondaryCard}>
                      <div style={styles.eyebrow}>{stat.label}</div>
                      <div style={styles.mobileSecondaryValue}>{stat.value}</div>
                      <div style={styles.muted}>{stat.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={styles.statGrid}>
                <SummaryStat label="Appearances" value={activePlayer.appearances} sub="weekly contests" />
                <SummaryStat label="Wins" value={activePlayer.wins} sub={`${activePlayer.runnerUps} runner-ups`} />
                <SummaryStat label="Career FG%" value={`${activePlayer.fgPct}%`} sub={`${activePlayer.totalMakes}/${activePlayer.totalAttempts} total`} />
                <SummaryStat label="Avg Finish" value={activePlayer.avgFinish} sub="elimination round score" />
                <SummaryStat label="Donut Gang Appearances" value={activePlayer.donutGangAppearances} sub="0/5 in Round 1" />
                <SummaryStat label="0/5 Rounds" value={activePlayer.zeroRounds} sub="all rounds combined" />
              </div>
            )}

            <div style={{ ...styles.twoColumn, ...(isMobile ? styles.singleColumn : null) }}>
              <section style={styles.panelInset}>
                <div style={styles.eyebrow}>Career zone chart</div>
                <h3 style={styles.h3}>All-time shooting zones</h3>
                <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
                  <ShotMap zoneStats={activePlayer.zoneStats} />
                </div>
              </section>

              <section style={styles.panelInset}>
                <div style={styles.eyebrow}>Career notes</div>
                <h3 style={styles.h3}>League profile</h3>
                <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                  <MiniLine label="Runner-ups" value={activePlayer.runnerUps} />
                  <MiniLine label="Finals appearances" value={activePlayer.finalsAppearances} />
                  <MiniLine label="First-round exits" value={activePlayer.firstRoundExits} />
                  <MiniLine label="Best round" value={activePlayer.bestRound} />
                  <MiniLine label="Average round score" value={activePlayer.avgRoundScore} />
                </div>
              </section>
            </div>
          </section>

          <section style={styles.panel}>
            <div style={styles.eyebrow}>Contest history</div>
            <h3 style={styles.h3}>Round-by-round by contest</h3>
            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {activePlayer.contests.map((contest) => (
                <div key={contest.contestId} style={styles.historyCard}>
                  <button onClick={() => setExpandedContestId(expandedContestId === contest.contestId ? null : contest.contestId)} style={{ ...styles.historyToggle, ...(isMobile ? styles.historyToggleMobile : null) }}>
                    <span>
                      <strong>{contest.date}</strong>
                      <span style={{ ...styles.muted, display: "block", marginTop: 4 }}>{contest.title} / {contest.finish}</span>
                    </span>
                    <span style={{ ...styles.historySummary, ...(isMobile ? styles.historySummaryMobile : null) }}>
                      <strong>{contest.totalMakes}/{contest.totalAttempts} / {contest.pct}%</strong>
                      <span style={styles.historyIndicator}>
                        <span>{expandedContestId === contest.contestId ? "Hide details" : "Show details"}</span>
                        <span style={styles.historyChevron}>{expandedContestId === contest.contestId ? "▴" : "▾"}</span>
                      </span>
                    </span>
                  </button>
                  {expandedContestId === contest.contestId && (
                    <div style={styles.historyDetail}>
                      <div style={{ ...styles.roundScoreRow, ...(isMobile ? styles.roundScoreRowMobile : null) }}>
                        {contest.roundDetails.map((detail, index) => (
                          <div key={ROUND_LABELS[index]} style={styles.roundScoreBox}>
                            <div style={styles.eyebrow}>{ROUND_LABELS[index]}</div>
                            <strong>{detail.score ?? "-"}</strong>
                          </div>
                        ))}
                      </div>
                      <div style={{ ...styles.roundMapGrid, ...(isMobile ? styles.roundMapGridMobile : null) }}>
                        {contest.roundDetails.map((detail, index) => (
                          <div key={`${contest.contestId}-${ROUND_LABELS[index]}-map`} style={styles.roundMapCard}>
                            <div style={styles.eyebrow}>{ROUND_LABELS[index]} shot map</div>
                            <div style={{ ...styles.muted, marginTop: 4 }}>
                              {detail.raw
                                ? detail.raw
                                : detail.score !== null && detail.zonesKnown === false
                                  ? `${detail.score} makes / zones unknown`
                                  : "Did not reach round"}
                            </div>
                            <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                              {detail.score !== null && detail.zonesKnown !== false ? (
                                <ShotMap zoneStats={detail.zoneStats} size="sm" />
                              ) : (
                                <div style={styles.roundMapEmpty}>
                                  {detail.score !== null ? "Shot map unavailable" : "No shot map available"}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function RecordsPage({ records, isMobile }) {
  const groups = [
    {
      title: "Winning",
      items: [
        ["Most Wins", records.mostWins],
        ["Most Runner-ups", records.mostRunnerUps],
        ["Most Finals Appearances", records.mostFinals],
      ],
    },
    {
      title: "Shooting",
      items: [
        ["Highest Career FG%", records.highestFG, "%"],
        ["Most Makes", records.mostMakes],
        ["Best Round", records.bestRound],
      ],
    },
    {
      title: "Cold / Chaos",
      items: [
        ["Most Donut Gang Appearances", records.donutGang],
        ["Most 0/5 Rounds", records.zeroRounds],
        ["Most First-round Exits", records.firstRoundExits],
      ],
    },
  ];

  return (
    <div>
      <div style={styles.pageHead}>
        <div>
          <div style={styles.eyebrow}>Records</div>
          <h1 style={styles.h1}>All-time records</h1>
        </div>
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        {groups.map((group) => (
          <section key={group.title} style={styles.panel}>
            <div style={styles.eyebrow}>{group.title}</div>
            <h2 style={styles.h2}>{group.title}</h2>
            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {group.items.map(([title, record, suffix]) => (
                <div key={title} style={{ ...styles.recordRow, ...(isMobile ? styles.recordRowMobile : null) }}>
                  <div>
                    <strong>{title}</strong>
                    <div style={styles.muted}>{record.leaders.map((leader) => leader.name).join(", ") || "No data yet"}</div>
                  </div>
                  <div style={styles.recordValue}>{record.value}{suffix || ""}</div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function MiniLine({ label, value }) {
  return (
    <div style={styles.miniLine}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RecordSnippet({ title, record, suffix = "" }) {
  return (
    <div style={styles.miniLine}>
      <span>{title}</span>
      <strong>{record.leaders.map((leader) => leader.name).join(", ") || "-"}{record.value ? ` / ${record.value}${suffix}` : ""}</strong>
    </div>
  );
}

export default function App() {
  const league = useMemo(() => buildLeagueData(CONTESTS), []);
  const isMobile = useIsMobile();
  const [page, setPage] = useState("home");
  const [activeContestId, setActiveContestId] = useState(league.contests[0]?.id ?? null);
  const [activePlayerName, setActivePlayerName] = useState(league.players[0]?.name ?? null);

  const latestContest = league.contests[0];

  const openContest = (contestId) => {
    setActiveContestId(contestId);
    setPage("contests");
  };

  const openPlayer = (playerName) => {
    setActivePlayerName(playerName);
    setPage("players");
  };

  return (
    <div style={styles.app}>
      <header style={{ ...styles.header, ...(isMobile ? styles.headerMobile : null) }}>
        <div style={isMobile ? { width: "100%" } : null}>
          <div style={{ ...styles.brand, ...(isMobile ? styles.brandMobile : null) }}>Home of the Mohamed Adem Three Point Contest</div>
          <div style={{ ...styles.headerSub, ...(isMobile ? styles.headerSubMobile : null) }}>Weekly contest archive / all-time leaders / player profiles / records</div>
        </div>
        <div style={{ ...styles.championBadge, ...(isMobile ? styles.championBadgeMobile : null) }}>
          <span>Latest Winner</span>
          <strong>🏆 {latestContest.winner}</strong>
          <small>{latestContest.date}</small>
        </div>
      </header>

      <nav style={{ ...styles.tabs, ...(isMobile ? styles.tabsMobile : null) }}>
        {[
          ["home", "Home"],
          ["contests", "Contests"],
          ["players", "Players"],
          ["records", "Records"],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setPage(key)} style={page === key ? styles.tabActive : styles.tab}>
            {label}
          </button>
        ))}
      </nav>

      <main style={{ ...styles.content, ...(isMobile ? styles.contentMobile : null) }}>
        {page === "home" && <HomePage contests={league.contests} players={league.players} records={league.records} onOpenContest={openContest} onOpenPlayer={openPlayer} isMobile={isMobile} />}
        {page === "contests" && <ContestsPage contests={league.contests} activeContestId={activeContestId} onSelectContest={setActiveContestId} isMobile={isMobile} />}
        {page === "players" && <PlayersPage players={league.players} activePlayerName={activePlayerName} onOpenPlayer={openPlayer} isMobile={isMobile} />}
        {page === "records" && <RecordsPage records={league.records} isMobile={isMobile} />}
      </main>

      <footer style={{ ...styles.footer, ...(isMobile ? styles.footerMobile : null) }}>Contest 1 loaded / future weekly contests can be added to the contest list</footer>
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
  headerMobile: {
    padding: "18px 16px",
    alignItems: "flex-start",
  },
  brand: {
    fontFamily: "'Bebas Neue', cursive",
    fontSize: 38,
    color: "#F97316",
    lineHeight: 1,
  },
  brandMobile: {
    fontSize: 28,
  },
  headerSub: {
    marginTop: 6,
    color: "rgba(255,255,255,0.36)",
    fontSize: 11,
    textTransform: "uppercase",
  },
  headerSubMobile: {
    fontSize: 10,
    lineHeight: 1.5,
    maxWidth: "100%",
  },
  championBadge: {
    display: "grid",
    gap: 4,
    minWidth: 190,
    textAlign: "right",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "10px 14px",
    background: "rgba(255,255,255,0.04)",
  },
  championBadgeMobile: {
    minWidth: "100%",
    textAlign: "left",
  },
  tabs: {
    display: "flex",
    gap: 0,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: "0 32px",
    overflowX: "auto",
  },
  tabsMobile: {
    padding: "0 12px",
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "rgba(10,10,10,0.96)",
    backdropFilter: "blur(12px)",
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
  contentMobile: {
    padding: "18px 16px 28px",
  },
  hero: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    alignItems: "end",
    marginBottom: 24,
    flexWrap: "wrap",
  },
  heroMobile: {
    alignItems: "flex-start",
  },
  heroPanel: {
    border: "1px solid rgba(249,115,22,0.25)",
    borderRadius: 8,
    padding: 16,
    minWidth: 220,
    background: "rgba(249,115,22,0.08)",
  },
  heroWinner: {
    fontFamily: "'Bebas Neue', cursive",
    fontSize: 34,
    color: "#F97316",
    lineHeight: 1,
    marginTop: 6,
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
    margin: "4px 0 0",
    fontFamily: "'Bebas Neue', cursive",
    fontSize: 30,
    lineHeight: 1,
    fontWeight: 400,
  },
  h3: {
    margin: "6px 0 0",
    fontFamily: "'Bebas Neue', cursive",
    fontSize: 24,
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
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
  },
  panel: {
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 20,
    marginBottom: 18,
  },
  panelInset: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 8,
    padding: 18,
  },
  card: {
    background: "rgba(255,255,255,0.045)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 18,
  },
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 18,
  },
  mobileStatGrid: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
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
  historyRow: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr 1fr 1fr",
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
  historyRowMobile: {
    gridTemplateColumns: "1fr",
    gap: 8,
  },
  rankRow: {
    display: "grid",
    gridTemplateColumns: "28px 1fr auto auto",
    gap: 12,
    alignItems: "center",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "white",
    borderRadius: 8,
    padding: "11px 14px",
    cursor: "pointer",
    textAlign: "left",
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 18,
  },
  singleColumn: {
    gridTemplateColumns: "1fr",
  },
  contestLayout: {
    display: "grid",
    gridTemplateColumns: "280px minmax(0, 1fr)",
    gap: 18,
    alignItems: "start",
  },
  playersLayout: {
    display: "grid",
    gridTemplateColumns: "280px minmax(0, 1fr)",
    gap: 18,
    alignItems: "start",
  },
  singleColumnLayout: {
    gridTemplateColumns: "1fr",
  },
  listStack: {
    display: "grid",
    gap: 8,
  },
  mobilePickerRow: {
    display: "grid",
    gridAutoFlow: "column",
    gridAutoColumns: "minmax(220px, 82%)",
    gap: 8,
    overflowX: "auto",
    paddingBottom: 4,
  },
  mobilePlayerDirectory: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 8,
  },
  listButton: {
    display: "grid",
    gap: 4,
    textAlign: "left",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    background: "rgba(255,255,255,0.03)",
    color: "white",
    padding: "12px 14px",
    cursor: "pointer",
  },
  listActive: {
    display: "grid",
    gap: 4,
    textAlign: "left",
    border: "1px solid rgba(249,115,22,0.45)",
    borderRadius: 8,
    background: "rgba(249,115,22,0.14)",
    color: "#F97316",
    padding: "12px 14px",
    cursor: "pointer",
  },
  mobilePlayerButton: {
    display: "grid",
    gap: 6,
    textAlign: "left",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    background: "rgba(255,255,255,0.03)",
    color: "white",
    padding: "12px 12px",
    cursor: "pointer",
    minHeight: 86,
    alignContent: "start",
    fontSize: 11,
  },
  mobilePlayerButtonActive: {
    display: "grid",
    gap: 6,
    textAlign: "left",
    border: "1px solid rgba(249,115,22,0.45)",
    borderRadius: 8,
    background: "rgba(249,115,22,0.14)",
    color: "#F97316",
    padding: "12px 12px",
    cursor: "pointer",
    minHeight: 86,
    alignContent: "start",
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
  miniLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    paddingBottom: 10,
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.72)",
  },
  historyCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    overflow: "hidden",
    background: "rgba(255,255,255,0.03)",
  },
  mobilePlayerHero: {
    display: "grid",
    gap: 12,
    marginBottom: 18,
  },
  mobilePlayerHeroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
  },
  mobilePlayerChip: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "10px 10px 12px",
    background: "rgba(255,255,255,0.04)",
  },
  mobilePlayerChipValue: {
    display: "block",
    marginTop: 6,
    color: "#F97316",
    fontSize: 28,
    lineHeight: 1,
    fontFamily: "'Bebas Neue', cursive",
  },
  mobileSecondaryStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 8,
  },
  mobileSecondaryCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "10px 10px 12px",
    background: "rgba(255,255,255,0.03)",
  },
  mobileSecondaryValue: {
    marginTop: 6,
    marginBottom: 4,
    color: "#F97316",
    fontSize: 26,
    lineHeight: 1,
    fontFamily: "'Bebas Neue', cursive",
  },
  historyToggle: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    padding: "14px 16px",
    background: "transparent",
    border: "none",
    color: "white",
    cursor: "pointer",
    textAlign: "left",
  },
  historyToggleMobile: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  historySummary: {
    display: "grid",
    gap: 8,
    justifyItems: "end",
    textAlign: "right",
  },
  historySummaryMobile: {
    width: "100%",
    justifyItems: "start",
    textAlign: "left",
  },
  historyIndicator: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#F97316",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  historyChevron: {
    fontSize: 14,
    lineHeight: 1,
  },
  historyDetail: {
    padding: "0 16px 16px",
  },
  roundScoreRow: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 8,
  },
  roundScoreRowMobile: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  roundScoreBox: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "10px 8px",
    background: "rgba(255,255,255,0.04)",
    textAlign: "center",
  },
  roundMapGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginTop: 14,
  },
  roundMapGridMobile: {
    gridTemplateColumns: "1fr",
  },
  roundMapCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 14,
    background: "rgba(255,255,255,0.025)",
  },
  roundMapEmpty: {
    width: "100%",
    minHeight: 84,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px dashed rgba(255,255,255,0.08)",
    borderRadius: 8,
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
  },
  mobileOverviewList: {
    display: "grid",
    gap: 12,
  },
  mobileOverviewCard: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 14,
    background: "rgba(255,255,255,0.03)",
  },
  mobileOverviewHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 12,
  },
  mobileOverviewStats: {
    display: "grid",
    gap: 8,
  },
  recordRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
    padding: "14px 16px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    background: "rgba(255,255,255,0.035)",
  },
  recordRowMobile: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  recordValue: {
    fontFamily: "'Bebas Neue', cursive",
    fontSize: 30,
    color: "#F97316",
    lineHeight: 1,
  },
  footer: {
    borderTop: "1px solid rgba(255,255,255,0.05)",
    padding: "16px 32px",
    color: "rgba(255,255,255,0.25)",
    fontSize: 10,
    textTransform: "uppercase",
  },
  footerMobile: {
    padding: "14px 16px",
    lineHeight: 1.5,
  },
};
