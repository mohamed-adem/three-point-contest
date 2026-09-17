export const CHARM_EXCLUDED_CONTESTS = new Set();

export function calculateCharms(contests, name) {
  const valid = contests.filter(c => !CHARM_EXCLUDED_CONTESTS.has(c.id));
  const names = [...new Set(valid.flatMap(c => Object.keys(c.rawData)))];
  const performances = valid.filter(c => c.rawData[name]).map(c => {
    const entries = Object.entries(c.rawData);
    const finish = c.rawData[name].eliminated;
    const below = entries.filter(([, p]) => p.eliminated < finish).length;
    const tied = entries.filter(([n, p]) => n !== name && p.eliminated === finish).length;
    return { contest: c, score: entries.length > 1 ? 100 * (below + tied / 2) / (entries.length - 1) : 100 };
  });
  const mean = values => values.reduce((sum, p) => sum + p.score, 0) / values.length;
  const pairs = names.filter(n => n !== name).flatMap(other => {
    const together = performances.filter(p => p.contest.rawData[other]);
    const apart = performances.filter(p => !p.contest.rawData[other]);
    if (together.length < 3 || apart.length < 3) return [];
    const withScore = mean(together);
    const withoutScore = mean(apart);
    const n = Math.min(together.length, apart.length);
    return [{ name: other, withScore, withoutScore, together: together.length,
      apart: apart.length, delta: withScore - withoutScore,
      adjusted: (withScore - withoutScore) * n / (n + 5) }];
  }).sort((a, b) => b.adjusted - a.adjusted || a.name.localeCompare(b.name));
  const best = pairs[0]?.adjusted;
  const worst = pairs.at(-1)?.adjusted;
  return {
    eligible: pairs.length,
    lucky: pairs.filter(p => p.adjusted > 1e-9 && Math.abs(p.adjusted - best) < 1e-9),
    jinx: pairs.filter(p => p.adjusted < -1e-9 && Math.abs(p.adjusted - worst) < 1e-9),
  };
}
