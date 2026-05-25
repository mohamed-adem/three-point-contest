# 3PT Contest Stats

React app for tracking a weekly friend-group 3-point contest: player profiles, round results, elimination bracket, sudden death outcomes, zone percentages, and cumulative stats.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Validate data

Run this after adding or editing a contest:

```bash
npm run validate:data
```

## Data model

Weekly contest data lives in `src/data/contestData.js`. Add new weeks to the top of the `CONTESTS` array so the newest contest stays first:

```js
{
  id: "contest-6",
  title: "Contest 6",
  date: "May 27, 2026",
  winner: "Player Name",
  runnerUp: "Runner Up Name",
  rawData: {
    "Player Name": {
      r1: "10100",
      r2: "?????",
      r3: null,
      r4: null,
      r5: null,
      eliminated: 2,
      winner: true,
    },
    "Runner Up Name": {
      r1: { bye: true },
      r2: "01010",
      r3: null,
      r4: null,
      r5: "00111",
      eliminated: 5,
    },
  },
  suddenDeath: {},
},
```

Shot strings map to zones in order: `LC`, `LW`, `TK`, `RW`, `RC`. Use `x` for an unknown or unattempted shot in a known-zone string, `{ bye: true }` for a champion bye, and `{ score: 2, zonesKnown: false }` when only the score is known.

Round values:

- `null`: player did not reach the round.
- `"?????"`: placeholder for a reached round that still needs exact shot data.
- `"10100"`: exact zone results.
- `{ bye: true }`: automatic advancement; not counted as shots.
- `{ score: 2, zonesKnown: false }`: score is known, zones are not.

Elimination values use `1` through `5` for the round where the player went out, and `6` for the winner.
