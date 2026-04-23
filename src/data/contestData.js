export const ZONES = ["LC", "LW", "TK", "RW", "RC"];

export const ZONE_LABELS = [
  "Left Corner",
  "Left Wing",
  "Top Key",
  "Right Wing",
  "Right Corner",
];

export const ROUND_LABELS = ["R1", "R2", "R3", "R4", "Final"];

export const ROUND_NAMES = ["Round 1", "Round 2", "Round 3", "Round 4", "Final"];

export const WEEKS = {
  1: {
    label: "Week 1",
    champion: "Mobuckets",
    rawData: {
      Abdiaziz: { r1: "00000", r2: null, r3: null, r4: null, r5: null, eliminated: 1 },
      Mobuckets: { r1: "01110", r2: "01100", r3: "00111", r4: "11001", r5: "00011", eliminated: 6, winner: true },
      "Mohamed Omar": { r1: "10100", r2: "?????", r3: "00100", r4: null, r5: null, eliminated: 3 },
      Tbaby: { r1: "10010", r2: "10100", r3: "00000", r4: null, r5: null, eliminated: 3 },
      "Mohamed Adem": { r1: "00001", r2: null, r3: null, r4: null, r5: null, eliminated: 1, sdElim: true },
      Muhsin: { r1: "10000", r2: "00000", r3: null, r4: null, r5: null, eliminated: 2 },
      "Ahmed-Suhaib": { r1: "01000", r2: "10100", r3: "00011", r4: "10000", r5: null, eliminated: 4 },
      Abdimanan: { r1: "00000", r2: null, r3: null, r4: null, r5: null, eliminated: 1 },
      Sabre: { r1: "00000", r2: null, r3: null, r4: null, r5: null, eliminated: 1 },
      Abdisalam: { r1: "01010", r2: "11000", r3: "11010", r4: "01100", r5: null, eliminated: 4 },
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
};
