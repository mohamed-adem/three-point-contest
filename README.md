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

## Data model

Weekly contest data lives in `src/data/contestData.js`. Add new weeks to the `WEEKS` object with the same shape as week 1:

```js
2: {
  label: "Week 2",
  champion: "Player Name",
  rawData: {
    "Player Name": { r1: "10100", r2: "?????", r3: null, r4: null, r5: null, eliminated: 2 },
  },
  suddenDeath: {},
}
```

Shot strings map to zones in order: `LC`, `LW`, `TK`, `RW`, `RC`.
