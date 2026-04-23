import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Brackets,
  ChevronDown,
  Flame,
  Trophy,
  Users,
} from "lucide-react";
import { ROUND_LABELS, ROUND_NAMES, WEEKS, ZONE_LABELS, ZONES } from "./data/contestData";
import { computeAllTimeStats, computeWeekStats, placementLabel } from "./lib/stats";

function cls(...classes) {
  return classes.filter(Boolean).join(" ");
}

function StatTile({ label, value, sub }) {
  return (
    <div className="stat-tile">
      <div className="eyebrow">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

function ShotMap({ zoneStats, size = "md" }) {
  const scale = size === "sm" ? 0.7 : 1;
  const width = 220 * scale;
  const height = 132 * scale;
  const zones = [
    { x: 10 * scale, y: 52 * scale, label: "LC" },
    { x: 50 * scale, y: 22 * scale, label: "LW" },
    { x: 95 * scale, y: 9 * scale, label: "TK" },
    { x: 140 * scale, y: 22 * scale, label: "RW" },
    { x: 180 * scale, y: 52 * scale, label: "RC" },
  ];

  return (
    <svg className="shot-map" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img">
      <path
        d={`M ${10 * scale} ${116 * scale} Q ${110 * scale} ${-20 * scale} ${210 * scale} ${116 * scale}`}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1.5 * scale}
      />
      <line
        x1={0}
        y1={116 * scale}
        x2={width}
        y2={116 * scale}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={scale}
      />
      {zones.map((zone, index) => {
        const stat = zoneStats[index];
        const pct = stat.attempts ? stat.makes / stat.attempts : 0;
        const color = stat.attempts === 0
          ? "#303030"
          : pct === 0
            ? "#c0392b"
            : pct < 0.4
              ? "#e67e22"
              : pct < 0.7
                ? "#f1c40f"
                : "#2ecc71";
        const radius = (14 + pct * 8) * scale;

        return (
          <g key={zone.label}>
            <circle cx={zone.x + 15 * scale} cy={zone.y + 15 * scale} r={radius} fill={color} opacity={0.9} />
            <text
              x={zone.x + 15 * scale}
              y={zone.y + 15 * scale - 2 * scale}
              textAnchor="middle"
              fill="white"
              fontSize={9 * scale}
              fontWeight="700"
            >
              {stat.attempts ? `${stat.makes}/${stat.attempts}` : "-"}
            </text>
            <text
              x={zone.x + 15 * scale}
              y={zone.y + 15 * scale + 8 * scale}
              textAnchor="middle"
              fill="rgba(255,255,255,0.72)"
              fontSize={7.5 * scale}
            >
              {zone.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function OverallStats({ players }) {
  const [sortKey, setSortKey] = useState("finish");
  const sorted = useMemo(() => {
    return [...players].sort((a, b) => {
      if (sortKey === "finish") return b.eliminated - a.eliminated || b.totalMakes - a.totalMakes;
      if (sortKey === "pct") return b.pct - a.pct || b.totalMakes - a.totalMakes;
      if (sortKey === "avg") return Number.parseFloat(b.avg) - Number.parseFloat(a.avg);
      if (sortKey === "best") return b.best - a.best;
      return 0;
    });
  }, [players, sortKey]);

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <div className="eyebrow">Leaderboard</div>
          <h2>Week standings</h2>
        </div>
        <div className="segmented">
          {[
            ["finish", "Finish"],
            ["pct", "FG%"],
            ["avg", "Avg"],
            ["best", "Best"],
          ].map(([key, label]) => (
            <button key={key} className={cls(sortKey === key && "active")} onClick={() => setSortKey(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {["#", "Player", "Finish", "Rounds", "Makes", "FG%", "Avg/Rd", "Best", "0/5s"].map((heading) => (
                <th key={heading}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((player, index) => (
              <tr key={player.name}>
                <td>{index + 1}</td>
                <td className={cls("player-cell", player.winner && "winner")}>
                  {player.winner && <Trophy size={14} />}
                  {player.name}
                </td>
                <td>{placementLabel(player)}</td>
                <td>{player.roundsPlayed}</td>
                <td>{player.totalMakes}/{player.totalAttempts}</td>
                <td className={cls("pct", player.pct >= 50 ? "hot" : player.pct >= 30 ? "warm" : "cold")}>{player.pct}%</td>
                <td>{player.avg}</td>
                <td className="accent">{player.best}</td>
                <td className={player.zeroRounds ? "cold" : ""}>{player.zeroRounds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BracketView({ players }) {
  const roundPlayers = {
    "Round 1": players.map((player) => player.name),
    "Round 2": players.filter((player) => player.eliminated >= 2).map((player) => player.name),
    "Round 3": players.filter((player) => player.eliminated >= 3).map((player) => player.name),
    "Round 4": players.filter((player) => player.eliminated >= 4).map((player) => player.name),
    Final: players.filter((player) => player.eliminated >= 5).map((player) => player.name),
  };

  return (
    <div className="bracket-scroll">
      <div className="bracket-grid">
        {ROUND_NAMES.map((round, roundIndex) => (
          <div className="bracket-round" key={round}>
            <div className="bracket-title">{round}</div>
            {roundPlayers[round].map((name) => {
              const player = players.find((entry) => entry.name === name);
              const eliminated = player.eliminated === roundIndex + 1;
              const isWinner = player.winner && round === "Final";

              return (
                <div
                  key={name}
                  className={cls("bracket-player", eliminated && "eliminated", isWinner && "winner")}
                >
                  <span>{name}</span>
                  {player.roundScores[roundIndex] !== null && <strong>{player.roundScores[roundIndex]}</strong>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function SuddenDeath({ suddenDeath }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <div className="eyebrow">Sudden death</div>
          <h2>Tiebreakers</h2>
        </div>
      </div>
      <div className="sd-list">
        {Object.entries(suddenDeath).map(([round, players]) => (
          <div className="sd-round" key={round}>
            <div className="sd-title">{round}</div>
            <div className="sd-pills">
              {players.map((player) => (
                <div className={cls("sd-pill", player.made ? "made" : "missed")} key={player.player}>
                  <span>{player.player}</span>
                  <strong>{player.made ? `made on ${player.attempts}` : `0/${player.attempts}`}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ZoneBreakdown({ players }) {
  const combinedZones = ZONES.map((_, zoneIndex) => ({
    makes: players.reduce((total, player) => total + player.zoneStats[zoneIndex].makes, 0),
    attempts: players.reduce((total, player) => total + player.zoneStats[zoneIndex].attempts, 0),
  }));

  return (
    <div className="zones-layout">
      <section className="panel court-panel">
        <div className="panel-head">
          <div>
            <div className="eyebrow">Field overview</div>
            <h2>Shot zones</h2>
          </div>
        </div>
        <div className="court-wrap">
          <ShotMap zoneStats={combinedZones} />
        </div>
      </section>
      <div className="zone-grid">
        {ZONES.map((zone, zoneIndex) => {
          const leaders = players
            .map((player) => ({
              name: player.name,
              makes: player.zoneStats[zoneIndex].makes,
              attempts: player.zoneStats[zoneIndex].attempts,
              pct: player.zoneStats[zoneIndex].attempts
                ? Math.round((player.zoneStats[zoneIndex].makes / player.zoneStats[zoneIndex].attempts) * 100)
                : 0,
            }))
            .filter((player) => player.attempts > 0)
            .sort((a, b) => b.pct - a.pct || b.makes - a.makes);
          const totalMakes = leaders.reduce((total, player) => total + player.makes, 0);
          const totalAttempts = leaders.reduce((total, player) => total + player.attempts, 0);
          const overallPct = totalAttempts ? Math.round((totalMakes / totalAttempts) * 100) : 0;

          return (
            <section className="zone-card" key={zone}>
              <div className="zone-code">{zone}</div>
              <div className="zone-label">{ZONE_LABELS[zoneIndex]}</div>
              <div className={cls("zone-pct", overallPct >= 40 ? "hot" : overallPct >= 25 ? "warm" : "cold")}>
                {overallPct}%
              </div>
              <div className="stat-sub">{totalMakes}/{totalAttempts} overall</div>
              <div className="mini-list">
                {leaders.slice(0, 3).map((player, index) => (
                  <div key={player.name}>
                    <span>{index === 0 && <Flame size={12} />}{player.name.split(" ")[0]}</span>
                    <strong>{player.pct}%</strong>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function PlayerProfile({ player }) {
  return (
    <section className={cls("profile panel", player.winner && "winner")}>
      <div className="profile-head">
        <div>
          <h2>{player.name}</h2>
          <div className="eyebrow">{player.winner ? "Champion" : placementLabel(player)}</div>
        </div>
        <div className="profile-pct">
          <strong>{player.pct}%</strong>
          <span>FG%</span>
        </div>
      </div>
      <div className="profile-map">
        <ShotMap zoneStats={player.zoneStats} size="sm" />
      </div>
      <div className="profile-stats">
        {[
          ["Makes", player.totalMakes],
          ["Avg/Rd", player.avg],
          ["Best", player.best],
          ["0/5s", player.zeroRounds],
        ].map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="round-bars">
        {player.roundScores.map((score, index) => {
          const height = score === null ? 4 : Math.max(5, (score / 5) * 44);
          return (
            <div className="round-bar" key={ROUND_LABELS[index]}>
              <span>{score ?? "-"}</span>
              <div style={{ height }} className={cls(score === 0 && "zero", score >= 3 && "high")} />
              <small>{ROUND_LABELS[index]}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PlayersView({ players }) {
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]?.name ?? "");
  const player = players.find((entry) => entry.name === selectedPlayer) ?? players[0];

  return (
    <div className="players-layout">
      <div className="player-list">
        {players.map((entry) => (
          <button
            key={entry.name}
            className={cls(selectedPlayer === entry.name && "active", entry.winner && "winner")}
            onClick={() => setSelectedPlayer(entry.name)}
          >
            {entry.winner && <Trophy size={13} />}
            {entry.name}
          </button>
        ))}
      </div>
      {player && <PlayerProfile player={player} />}
    </div>
  );
}

function AllTimeView({ allTimeStats }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <div className="eyebrow">All time</div>
          <h2>Cumulative leaderboard</h2>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {["#", "Player", "Weeks", "Titles", "Finals", "Makes", "FG%", "Avg/Rd", "Best", "0/5s"].map((heading) => (
                <th key={heading}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allTimeStats.map((player, index) => (
              <tr key={player.name}>
                <td>{index + 1}</td>
                <td className={cls("player-cell", player.titles > 0 && "winner")}>
                  {player.titles > 0 && <Trophy size={14} />}
                  {player.name}
                </td>
                <td>{player.appearances}</td>
                <td className="accent">{player.titles}</td>
                <td>{player.finals}</td>
                <td>{player.totalMakes}/{player.totalAttempts}</td>
                <td className={cls("pct", player.pct >= 50 ? "hot" : player.pct >= 30 ? "warm" : "cold")}>{player.pct}%</td>
                <td>{player.avg}</td>
                <td>{player.best}</td>
                <td>{player.zeroRounds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function App() {
  const weekIds = Object.keys(WEEKS).map(Number);
  const [activeWeek, setActiveWeek] = useState(weekIds[0]);
  const [tab, setTab] = useState("overview");
  const week = WEEKS[activeWeek];
  const weekStats = useMemo(() => computeWeekStats(week), [week]);
  const allTimeStats = useMemo(() => computeAllTimeStats(WEEKS), []);
  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "bracket", label: "Bracket", icon: Brackets },
    { id: "zones", label: "Zones", icon: BarChart3 },
    { id: "players", label: "Players", icon: Users },
    { id: "all-time", label: "All Time", icon: Trophy },
  ];

  return (
    <main>
      <header className="app-header">
        <div>
          <div className="brand">3PT Contest</div>
          <div className="header-sub">{week.label} / {weekStats.totals.players} players</div>
        </div>
        <div className="header-actions">
          <label className="week-select">
            <span>Week</span>
            <select value={activeWeek} onChange={(event) => setActiveWeek(Number(event.target.value))}>
              {weekIds.map((weekId) => (
                <option key={weekId} value={weekId}>{WEEKS[weekId].label}</option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>
          <div className="champion">
            <span>Champion</span>
            <strong><Trophy size={16} /> {week.champion}</strong>
          </div>
        </div>
      </header>

      <nav className="tabs" aria-label="Primary">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={cls(tab === item.id && "active")} onClick={() => setTab(item.id)}>
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="content">
        {tab === "overview" && (
          <>
            <section className="stat-grid">
              <StatTile label="Total Players" value={weekStats.totals.players} sub={week.label.toLowerCase()} />
              <StatTile label="Overall FG%" value={`${weekStats.totals.overallPct}%`} sub="all rounds" />
              <StatTile
                label="Most Makes"
                value={weekStats.totals.mostMakes.totalMakes}
                sub={weekStats.totals.mostMakes.name}
              />
              <StatTile label="Perfect Rounds" value={weekStats.totals.perfectRounds} sub="5/5 rounds" />
            </section>
            <OverallStats players={weekStats.players} />
          </>
        )}

        {tab === "bracket" && (
          <>
            <section className="panel">
              <div className="panel-head">
                <div>
                  <div className="eyebrow">Elimination bracket</div>
                  <h2>{week.label} path</h2>
                </div>
              </div>
              <BracketView players={weekStats.sortedByPlacement} />
            </section>
            <SuddenDeath suddenDeath={week.suddenDeath} />
          </>
        )}

        {tab === "zones" && <ZoneBreakdown players={weekStats.players} />}

        {tab === "players" && <PlayersView players={weekStats.sortedByPlacement} />}

        {tab === "all-time" && <AllTimeView allTimeStats={allTimeStats} />}
      </div>

      <footer>
        <span>{week.label} / 5 rounds / {weekStats.totals.players} players</span>
        <span>Hot 50%+ / Warm 30%+ / Cold below 30%</span>
      </footer>
    </main>
  );
}
