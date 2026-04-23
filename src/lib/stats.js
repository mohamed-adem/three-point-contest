import { ROUND_NAMES, ZONES } from "../data/contestData";

const UNKNOWN_SHOTS = "?????";

export function parseShots(str) {
  return str.split("").map(Number);
}

export function scoreRound(round) {
  if (!round || round === UNKNOWN_SHOTS) return null;
  return parseShots(round).reduce((total, shot) => total + shot, 0);
}

export function computePlayerStats(name, data) {
  const rounds = [data.r1, data.r2, data.r3, data.r4, data.r5];
  const validRounds = rounds.filter((round) => round && round !== UNKNOWN_SHOTS);

  let totalMakes = 0;
  let totalAttempts = 0;
  let zeroRounds = 0;
  const zoneStats = ZONES.map(() => ({ makes: 0, attempts: 0 }));

  validRounds.forEach((round) => {
    const shots = parseShots(round);
    let roundMakes = 0;

    shots.forEach((shot, zoneIndex) => {
      zoneStats[zoneIndex].attempts += 1;
      zoneStats[zoneIndex].makes += shot;
      totalAttempts += 1;
      totalMakes += shot;
      roundMakes += shot;
    });

    if (roundMakes === 0) zeroRounds += 1;
  });

  const roundScores = rounds.map(scoreRound);
  const knownScores = roundScores.filter((score) => score !== null);
  const avg = knownScores.length
    ? (knownScores.reduce((total, score) => total + score, 0) / knownScores.length).toFixed(2)
    : "-";

  return {
    name,
    totalMakes,
    totalAttempts,
    pct: totalAttempts ? Math.round((totalMakes / totalAttempts) * 100) : 0,
    avg,
    best: knownScores.length ? Math.max(...knownScores) : 0,
    zeroRounds,
    zoneStats,
    roundScores,
    roundsPlayed: validRounds.length,
    eliminated: data.eliminated,
    winner: Boolean(data.winner),
    sdElim: Boolean(data.sdElim),
  };
}

export function computeWeekStats(week) {
  const players = Object.entries(week.rawData).map(([name, data]) => computePlayerStats(name, data));
  const sortedByPlacement = [...players].sort((a, b) => {
    if (b.eliminated !== a.eliminated) return b.eliminated - a.eliminated;
    return b.totalMakes - a.totalMakes;
  });

  const totalMakes = players.reduce((total, player) => total + player.totalMakes, 0);
  const totalAttempts = players.reduce((total, player) => total + player.totalAttempts, 0);
  const perfectRounds = players.reduce(
    (total, player) => total + player.roundScores.filter((score) => score === 5).length,
    0,
  );
  const mostMakes = players.reduce(
    (leader, player) => (player.totalMakes > leader.totalMakes ? player : leader),
    players[0],
  );

  return {
    players,
    sortedByPlacement,
    totals: {
      players: players.length,
      totalMakes,
      totalAttempts,
      overallPct: totalAttempts ? Math.round((totalMakes / totalAttempts) * 100) : 0,
      perfectRounds,
      mostMakes,
    },
  };
}

export function computeAllTimeStats(weeks) {
  const playerMap = new Map();

  Object.values(weeks).forEach((week) => {
    const { players } = computeWeekStats(week);

    players.forEach((player) => {
      if (!playerMap.has(player.name)) {
        playerMap.set(player.name, {
          name: player.name,
          appearances: 0,
          titles: 0,
          finals: 0,
          totalMakes: 0,
          totalAttempts: 0,
          zeroRounds: 0,
          roundsPlayed: 0,
          best: 0,
          zoneStats: ZONES.map(() => ({ makes: 0, attempts: 0 })),
        });
      }

      const allTime = playerMap.get(player.name);
      allTime.appearances += 1;
      allTime.titles += player.winner ? 1 : 0;
      allTime.finals += player.eliminated >= ROUND_NAMES.length ? 1 : 0;
      allTime.totalMakes += player.totalMakes;
      allTime.totalAttempts += player.totalAttempts;
      allTime.zeroRounds += player.zeroRounds;
      allTime.roundsPlayed += player.roundsPlayed;
      allTime.best = Math.max(allTime.best, player.best);
      allTime.zoneStats = allTime.zoneStats.map((zone, index) => ({
        makes: zone.makes + player.zoneStats[index].makes,
        attempts: zone.attempts + player.zoneStats[index].attempts,
      }));
    });
  });

  return [...playerMap.values()]
    .map((player) => ({
      ...player,
      pct: player.totalAttempts ? Math.round((player.totalMakes / player.totalAttempts) * 100) : 0,
      avg: player.roundsPlayed ? (player.totalMakes / player.roundsPlayed).toFixed(2) : "-",
    }))
    .sort((a, b) => b.titles - a.titles || b.totalMakes - a.totalMakes || b.pct - a.pct);
}

export function placementLabel(player) {
  if (player.winner) return "Winner";
  if (player.eliminated === 5) return "Runner-up";
  if (player.eliminated === 4) return "Top 4";
  if (player.eliminated === 3) return "Top 6";
  if (player.eliminated === 2) return "Top 8";
  return "R1 Exit";
}
