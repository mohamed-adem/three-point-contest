import React, { useState } from "react";

const ZONES = ["LC", "LW", "TK", "RW", "RC"];
const ZONE_LABELS = ["Left Corner", "Left Wing", "Top Key", "Right Wing", "Right Corner"];

const parseShots = (str) => str.split("").map(Number);

const rawData = {
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
};

const SD_DATA = {
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
};

function computePlayerStats(name, data) {
  const rounds = [data.r1, data.r2, data.r3, data.r4, data.r5];
  const validRounds = rounds.filter((round) => round && round !== "?????");

  let totalMakes = 0;
  let totalAttempts = 0;
  const zoneStats = ZONES.map(() => ({ makes: 0, attempts: 0 }));
  let zeros = 0;

  validRounds.forEach((round) => {
    const shots = parseShots(round);
    let roundMakes = 0;

    shots.forEach((shot, index) => {
      zoneStats[index].attempts += 1;
      zoneStats[index].makes += shot;
      totalAttempts += 1;
      totalMakes += shot;
      roundMakes += shot;
    });

    if (roundMakes === 0) zeros += 1;
  });

  const roundScores = rounds.map((round) => {
    if (!round || round === "?????") return null;
    return parseShots(round).reduce((total, shot) => total + shot, 0);
  });

  const validScores = roundScores.filter((score) => score !== null);
  const avg = validScores.length
    ? (validScores.reduce((total, score) => total + score, 0) / validScores.length).toFixed(2)
    : "-";
  const best = validScores.length ? Math.max(...validScores) : 0;
  const pct = totalAttempts ? Math.round((totalMakes / totalAttempts) * 100) : 0;

  return {
    name,
    totalMakes,
    totalAttempts,
    pct,
    avg,
    best,
    zeros,
    zoneStats,
    roundScores,
    roundsPlayed: validRounds.length,
    eliminated: data.eliminated,
    winner: data.winner || false,
    sdElim: data.sdElim || false,
  };
}

const allStats = Object.entries(rawData).map(([name, data]) => computePlayerStats(name, data));
const sortedByPlacement = [...allStats].sort((a, b) => b.eliminated - a.eliminated);

function ShotMap({ zoneStats, size = "md" }) {
  const s = size === "sm" ? 0.65 : 1;
  const w = 220 * s;
  const h = 130 * s;
  const zones = [
    { x: 10 * s, y: 50 * s, label: "LC" },
    { x: 50 * s, y: 20 * s, label: "LW" },
    { x: 95 * s, y: 8 * s, label: "TK" },
    { x: 140 * s, y: 20 * s, label: "RW" },
    { x: 180 * s, y: 50 * s, label: "RC" },
  ];

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path
        d={`M ${10 * s} ${115 * s} Q ${110 * s} ${-20 * s} ${210 * s} ${115 * s}`}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={1.5 * s}
      />
      <line x1={0} y1={115 * s} x2={w} y2={115 * s} stroke="rgba(255,255,255,0.08)" strokeWidth={s} />

      {zones.map((zone, index) => {
        const stat = zoneStats[index];
        const pct = stat.attempts ? stat.makes / stat.attempts : 0;
        const color = stat.attempts === 0
          ? "#333"
          : pct === 0
            ? "#c0392b"
            : pct < 0.4
              ? "#e67e22"
              : pct < 0.7
                ? "#f1c40f"
                : "#2ecc71";
        const r = (14 + pct * 8) * s;

        return (
          <g key={zone.label}>
            <circle cx={zone.x + 15 * s} cy={zone.y + 15 * s} r={r} fill={color} opacity={0.85} />
            <text
              x={zone.x + 15 * s}
              y={zone.y + 15 * s - 2 * s}
              textAnchor="middle"
              fill="white"
              fontSize={9 * s}
              fontWeight="700"
              fontFamily="'DM Mono', monospace"
            >
              {stat.attempts ? `${stat.makes}/${stat.attempts}` : "-"}
            </text>
            <text
              x={zone.x + 15 * s}
              y={zone.y + 15 * s + 8 * s}
              textAnchor="middle"
              fill="rgba(255,255,255,0.7)"
              fontSize={7.5 * s}
              fontFamily="'DM Mono', monospace"
            >
              {zone.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function BracketView() {
  const rounds = [
    { label: "Round 1" },
    { label: "Round 2" },
    { label: "Round 3" },
    { label: "Round 4" },
    { label: "Final" },
  ];

  const roundPlayers = {
    "Round 1": sortedByPlacement.map((player) => player.name),
    "Round 2": sortedByPlacement.filter((player) => player.eliminated >= 2).map((player) => player.name),
    "Round 3": sortedByPlacement.filter((player) => player.eliminated >= 3).map((player) => player.name),
    "Round 4": sortedByPlacement.filter((player) => player.eliminated >= 4).map((player) => player.name),
    Final: sortedByPlacement.filter((player) => player.eliminated >= 5).map((player) => player.name),
  };

  return (
    <div style={{ overflowX: "auto", paddingBottom: 12 }}>
      <div style={{ display: "flex", gap: 0, minWidth: 700 }}>
        {rounds.map((round, roundIndex) => (
          <div key={round.label} style={{ flex: 1, minWidth: 130 }}>
            <div style={{
              textAlign: "center",
              fontSize: 10,
              fontFamily: "'DM Mono', monospace",
              color: "#F97316",
              letterSpacing: 2,
              textTransform: "uppercase",
              padding: "8px 0 12px",
              borderBottom: "1px solid rgba(249,115,22,0.3)",
              marginBottom: 12,
            }}>
              {round.label}
            </div>
            {roundPlayers[round.label].map((name) => {
              const player = allStats.find((entry) => entry.name === name);
              const eliminated = player.eliminated === roundIndex + 1;
              const isWinner = player.winner && roundIndex === 4;

              return (
                <div key={name} style={{
                  margin: "4px 6px",
                  padding: "6px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontFamily: "'DM Mono', monospace",
                  background: isWinner
                    ? "rgba(249,115,22,0.25)"
                    : eliminated
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(255,255,255,0.08)",
                  color: isWinner
                    ? "#F97316"
                    : eliminated
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(255,255,255,0.85)",
                  border: isWinner
                    ? "1px solid rgba(249,115,22,0.5)"
                    : eliminated
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textDecoration: eliminated ? "line-through" : "none",
                }}>
                  <span>{isWinner ? "🏆 " : ""}{name}</span>
                  {player.roundScores[roundIndex] !== null && player.roundScores[roundIndex] !== undefined && (
                    <span style={{ color: "#F97316", opacity: 0.8, fontWeight: 700 }}>
                      {player.roundScores[roundIndex]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function OverallStats() {
  const [sortKey, setSortKey] = useState("eliminated");
  const sorted = [...allStats].sort((a, b) => {
    if (sortKey === "eliminated") return b.eliminated - a.eliminated;
    if (sortKey === "pct") return b.pct - a.pct;
    if (sortKey === "avg") return Number.parseFloat(b.avg) - Number.parseFloat(a.avg);
    if (sortKey === "best") return b.best - a.best;
    return 0;
  });

  const placementLabel = (player) => {
    if (player.winner) return "Winner";
    if (player.eliminated === 5) return "Runner-up";
    if (player.eliminated === 4) return "Top 4";
    if (player.eliminated === 3) return "Top 6";
    if (player.eliminated === 2) return "Top 8";
    return "R1 Exit";
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { key: "eliminated", label: "Round" },
          { key: "pct", label: "FG%" },
          { key: "avg", label: "Avg" },
          { key: "best", label: "Best" },
        ].map((column) => (
          <button key={column.key} onClick={() => setSortKey(column.key)} style={{
            padding: "4px 14px",
            borderRadius: 20,
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            cursor: "pointer",
            border: "1px solid",
            borderColor: sortKey === column.key ? "#F97316" : "rgba(255,255,255,0.15)",
            background: sortKey === column.key ? "rgba(249,115,22,0.15)" : "transparent",
            color: sortKey === column.key ? "#F97316" : "rgba(255,255,255,0.5)",
          }}>
            Sort: {column.label}
          </button>
        ))}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(249,115,22,0.3)" }}>
              {["#", "Player", "Finish", "Rounds", "Makes", "FG%", "Avg/Rd", "Best", "0/5s"].map((heading) => (
                <th key={heading} style={{ padding: "8px 12px", textAlign: "left", color: "rgba(255,255,255,0.4)", fontWeight: 400, fontSize: 10 }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((player, index) => (
              <tr key={player.name} style={{
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: index % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
              }}>
                <td style={{ padding: "10px 12px", color: "rgba(255,255,255,0.3)" }}>{index + 1}</td>
                <td style={{ padding: "10px 12px", color: player.winner ? "#F97316" : "white", fontWeight: player.winner ? 700 : 400 }}>
                  {player.winner ? "🏆 " : ""}{player.name}
                </td>
                <td style={{ padding: "10px 12px", color: "rgba(255,255,255,0.6)", fontSize: 10 }}>{placementLabel(player)}</td>
                <td style={{ padding: "10px 12px", color: "rgba(255,255,255,0.6)" }}>{player.roundsPlayed}</td>
                <td style={{ padding: "10px 12px", color: "rgba(255,255,255,0.6)" }}>{player.totalMakes}/{player.totalAttempts}</td>
                <td style={{ padding: "10px 12px", color: player.pct >= 50 ? "#2ecc71" : player.pct >= 30 ? "#f1c40f" : "#e74c3c", fontWeight: 700 }}>
                  {player.pct}%
                </td>
                <td style={{ padding: "10px 12px", color: "rgba(255,255,255,0.7)" }}>{player.avg}</td>
                <td style={{ padding: "10px 12px", color: "#F97316", fontWeight: 700 }}>{player.best}</td>
                <td style={{ padding: "10px 12px", color: player.zeros > 0 ? "#e74c3c" : "rgba(255,255,255,0.3)" }}>{player.zeros}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ZoneBreakdown() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(150px, 1fr))", gap: 12 }}>
      {ZONES.map((zone, zoneIndex) => {
        const zoneLeaders = allStats
          .map((player) => ({
            name: player.name,
            makes: player.zoneStats[zoneIndex].makes,
            attempts: player.zoneStats[zoneIndex].attempts,
            pct: player.zoneStats[zoneIndex].attempts
              ? Math.round((player.zoneStats[zoneIndex].makes / player.zoneStats[zoneIndex].attempts) * 100)
              : 0,
          }))
          .filter((player) => player.attempts > 0)
          .sort((a, b) => b.pct - a.pct);

        const totalMakes = zoneLeaders.reduce((total, player) => total + player.makes, 0);
        const totalAttempts = zoneLeaders.reduce((total, player) => total + player.attempts, 0);
        const overallPct = totalAttempts ? Math.round((totalMakes / totalAttempts) * 100) : 0;
        const color = overallPct >= 40 ? "#2ecc71" : overallPct >= 25 ? "#f1c40f" : "#e74c3c";

        return (
          <div key={zone} style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            padding: 16,
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 4 }}>{zone}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>{ZONE_LABELS[zoneIndex]}</div>
            <div style={{ fontSize: 26, fontFamily: "'Bebas Neue', cursive", color, marginBottom: 8 }}>{overallPct}%</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>{totalMakes}/{totalAttempts} overall</div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
              {zoneLeaders.slice(0, 3).map((player, index) => (
                <div key={player.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: index === 0 ? "#F97316" : "rgba(255,255,255,0.5)" }}>
                    {index === 0 ? "^ " : ""}{player.name.split(" ")[0]}
                  </span>
                  <span style={{ fontSize: 10, color: index === 0 ? "#F97316" : "rgba(255,255,255,0.4)" }}>{player.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlayerProfile({ player }) {
  const p = allStats.find((entry) => entry.name === player);
  if (!p) return null;

  const roundLabels = ["R1", "R2", "R3", "R4", "Final"];
  const placementLabel = () => {
    if (p.winner) return "Champion";
    if (p.eliminated === 5) return "Runner-up";
    if (p.eliminated === 4) return "Top 4";
    if (p.eliminated === 3) return "Top 6";
    if (p.eliminated === 2) return "Top 8";
    return "Round 1 Exit";
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      borderRadius: 16,
      border: p.winner ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(255,255,255,0.08)",
      padding: 24,
      height: "100%",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', cursive", letterSpacing: 2, color: p.winner ? "#F97316" : "white", lineHeight: 1 }}>
            {p.name}
          </div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: p.winner ? "#F97316" : "rgba(255,255,255,0.4)", marginTop: 4 }}>
            {placementLabel()}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 36, fontFamily: "'Bebas Neue', cursive", color: "#F97316", lineHeight: 1 }}>{p.pct}%</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>FG%</div>
        </div>
      </div>

      <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
        <ShotMap zoneStats={p.zoneStats} size="sm" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Makes", val: p.totalMakes },
          { label: "Avg/Rd", val: p.avg },
          { label: "Best", val: p.best },
          { label: "0/5s", val: p.zeros },
        ].map((stat) => (
          <div key={stat.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
            <div style={{ fontSize: 16, fontFamily: "'Bebas Neue', cursive", color: "white" }}>{stat.val}</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: 1 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 8 }}>ROUND BY ROUND</div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 50 }}>
          {p.roundScores.map((score, index) => {
            if (score === null) {
              return (
                <div key={roundLabels[index]} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2 }} />
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.15)" }}>{roundLabels[index]}</div>
                </div>
              );
            }

            const height = Math.max(4, (score / 5) * 40);
            return (
              <div key={roundLabels[index]} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 9, color: "#F97316", fontWeight: 700 }}>{score}</div>
                <div style={{
                  width: "100%",
                  height,
                  background: score === 0 ? "rgba(231,76,60,0.4)" : score >= 3 ? "rgba(249,115,22,0.7)" : "rgba(249,115,22,0.35)",
                  borderRadius: "3px 3px 0 0",
                }} />
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{roundLabels[index]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("overview");
  const [selectedPlayer, setSelectedPlayer] = useState("Mohamed Abdisalan");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "bracket", label: "Bracket" },
    { id: "zones", label: "Zones" },
    { id: "players", label: "Players" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0A",
      color: "white",
      fontFamily: "'DM Mono', monospace",
    }}>
      <div style={{
        borderBottom: "1px solid rgba(249,115,22,0.2)",
        padding: "20px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 18,
        flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: 32, fontFamily: "'Bebas Neue', cursive", letterSpacing: 4, color: "#F97316" }}>
            3PT CONTEST
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: 3 }}>WEEK 1 / 12 PLAYERS</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>CHAMPION</div>
          <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', cursive", color: "#F97316", letterSpacing: 2 }}>
            🏆 MOHAMED ABDISALAN
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 32px", overflowX: "auto" }}>
        {tabs.map((item) => (
          <button key={item.id} onClick={() => setTab(item.id)} style={{
            padding: "14px 20px",
            background: "none",
            border: "none",
            borderBottom: tab === item.id ? "2px solid #F97316" : "2px solid transparent",
            color: tab === item.id ? "#F97316" : "rgba(255,255,255,0.4)",
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: 2,
            textTransform: "uppercase",
            cursor: "pointer",
          }}>
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "28px 32px" }}>
        {tab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Total Players", val: "12", sub: "week 1" },
                {
                  label: "Overall FG%",
                  val: `${Math.round((allStats.reduce((a, b) => a + b.totalMakes, 0) / allStats.reduce((a, b) => a + b.totalAttempts, 0)) * 100)}%`,
                  sub: "all rounds",
                },
                {
                  label: "Most Makes",
                  val: `${Math.max(...allStats.map((player) => player.totalMakes))}`,
                  sub: allStats.find((player) => player.totalMakes === Math.max(...allStats.map((entry) => entry.totalMakes)))?.name,
                },
                {
                  label: "Perfect Rounds",
                  val: `${allStats.reduce((total, player) => total + player.roundScores.filter((score) => score === 5).length, 0)}`,
                  sub: "5/5 rounds",
                },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", padding: "20px 24px" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>{stat.label}</div>
                  <div style={{ fontSize: 36, fontFamily: "'Bebas Neue', cursive", color: "#F97316", lineHeight: 1 }}>{stat.val}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{stat.sub}</div>
                </div>
              ))}
            </div>
            <OverallStats />
          </div>
        )}

        {tab === "bracket" && (
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 20 }}>ELIMINATION BRACKET / WEEK 1</div>
            <BracketView />
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 16 }}>SUDDEN DEATH</div>
              {Object.entries(SD_DATA).map(([round, players]) => (
                <div key={round} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, color: "#F97316", letterSpacing: 2, marginBottom: 10 }}>{round.toUpperCase()}</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {players.map((player) => (
                      <div key={player.player} style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        fontSize: 11,
                        background: player.made ? "rgba(46,204,113,0.1)" : "rgba(231,76,60,0.1)",
                        border: `1px solid ${player.made ? "rgba(46,204,113,0.3)" : "rgba(231,76,60,0.3)"}`,
                        color: player.made ? "#2ecc71" : "#e74c3c",
                      }}>
                        {player.player} / {player.made ? `made on att. ${player.attempts}` : `missed all ${player.attempts}`}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "zones" && (
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 20 }}>ZONE BREAKDOWN / ALL PLAYERS</div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginBottom: 12 }}>FIELD OVERVIEW</div>
              <div style={{ display: "flex", justifyContent: "center", background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.06)" }}>
                <ShotMap
                  zoneStats={ZONES.map((_, zoneIndex) => ({
                    makes: allStats.reduce((total, player) => total + player.zoneStats[zoneIndex].makes, 0),
                    attempts: allStats.reduce((total, player) => total + player.zoneStats[zoneIndex].attempts, 0),
                  }))}
                />
              </div>
            </div>
            <ZoneBreakdown />
          </div>
        )}

        {tab === "players" && (
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
              {sortedByPlacement.map((player) => (
                <button key={player.name} onClick={() => setSelectedPlayer(player.name)} style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 10,
                  cursor: "pointer",
                  fontFamily: "'DM Mono', monospace",
                  border: "1px solid",
                  borderColor: selectedPlayer === player.name ? "#F97316" : "rgba(255,255,255,0.12)",
                  background: selectedPlayer === player.name ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.03)",
                  color: selectedPlayer === player.name ? "#F97316" : "rgba(255,255,255,0.5)",
                }}>
                  {player.winner ? "🏆 " : ""}{player.name}
                </button>
              ))}
            </div>
            <div style={{ maxWidth: 520 }}>
              <PlayerProfile player={selectedPlayer} />
            </div>
          </div>
        )}
      </div>

      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "16px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: 2 }}>WEEK 1 / 5 ROUNDS / 12 PLAYERS</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: 2 }}>ORANGE = HOT / YELLOW = MID / RED = COLD</div>
      </div>
    </div>
  );
}
