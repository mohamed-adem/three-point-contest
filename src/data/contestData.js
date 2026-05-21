export const ZONES = ["LC", "LW", "TK", "RW", "RC"];

export const ZONE_LABELS = [
  "Left Corner",
  "Left Wing",
  "Top Key",
  "Right Wing",
  "Right Corner",
];

export const ROUND_KEYS = ["r1", "r2", "r3", "r4", "r5"];
export const ROUND_LABELS = ["R1", "R2", "R3", "R4", "Final"];
export const CONTEST_ROUNDS = ["Round 1", "Round 2", "Round 3", "Round 4", "Final"];

export const PREVIOUS_POWER_RANKINGS = [
  "Majdi",
  "Mohamed Adem",
  "Mohamed Abdisalan",
  "AhmedNur",
  "Ahmed-Suhaib",
  "Yahya",
  "Mohamed Ahmed",
  "Sebri",
  "Muhsin",
  "Mohamed Omar",
  "Abdisalan",
  "Abdiaziz",
  "Mohamed Salad",
  "Abdimanan",
  "Abdulrahman",
];

export const POWER_RANKINGS = [
  "Majdi",
  "Mohamed Abdisalan",
  "Abdisalan",
  "Mohamed Adem",
  "AhmedNur",
  "Yahya",
  "Ahmed-Suhaib",
  "Sebri",
  "Mohamed Omar",
  "Mohamed Ahmed",
  "Muhsin",
  "Mohamed Salad",
  "Abdiaziz",
  "Abdimanan",
  "Abdulrahman",
];

export const CONTESTS = [
  {
    id: "contest-5",
    title: "Contest 5",
    date: "May 20, 2026",
    winner: "Abdisalan",
    runnerUp: "Mohamed Abdisalan",
    rawData: {
      "Mohamed Abdisalan": { r1: "00111", r2: "10110", r3: null, r4: null, r5: "1100x", eliminated: 5 },
      Abdisalan: { r1: "00001", r2: "01001", r3: null, r4: null, r5: "11101", eliminated: 6, winner: true },
      "Mohamed Adem": { r1: "00001", r2: "00011", r3: null, r4: null, r5: null, eliminated: 2, sdElim: true },
      Majdi: { r1: { bye: true }, r2: "00100", r3: null, r4: null, r5: null, eliminated: 2 },
      "Ahmed-Suhaib": { r1: "10000", r2: null, r3: null, r4: null, r5: null, eliminated: 1, sdElim: true },
      "Mohamed Ahmed": { r1: "00000", r2: null, r3: null, r4: null, r5: null, eliminated: 1 },
      Yahya: { r1: "00000", r2: null, r3: null, r4: null, r5: null, eliminated: 1 },
    },
    suddenDeath: {
      "Round 1": [
        { player: "Mohamed Adem", summary: "2/4", status: "advanced" },
        { player: "Abdisalan", summary: "1/1", status: "advanced" },
        { player: "Ahmed-Suhaib", summary: "1/4", status: "eliminated" },
      ],
      "Round 2": [
        { player: "Abdisalan", summary: "1/4", status: "advanced" },
        { player: "Mohamed Adem", summary: "0/4", status: "eliminated" },
      ],
    },
  },
  {
    id: "contest-4",
    title: "Contest 4",
    date: "May 13, 2026",
    winner: "Majdi",
    runnerUp: "Yahya",
    rawData: {
      Majdi: { r1: { bye: true }, r2: "01010", r3: null, r4: null, r5: "00111", eliminated: 6, winner: true },
      Yahya: { r1: "01000", r2: "10110", r3: null, r4: null, r5: "01000", eliminated: 5 },
      "Ahmed-Suhaib": { r1: "10101", r2: "01001", r3: null, r4: null, r5: null, eliminated: 2, sdElim: true },
      Muhsin: { r1: "00000", r2: "00000", r3: null, r4: null, r5: null, eliminated: 2 },
      "Mohamed Adem": { r1: "00000", r2: null, r3: null, r4: null, r5: null, eliminated: 1, sdElim: true },
      "Mohamed Ahmed": { r1: "00000", r2: null, r3: null, r4: null, r5: null, eliminated: 1, sdElim: true },
    },
    suddenDeath: {
      "Round 1": [
        { player: "Muhsin", summary: "1/3", status: "advanced" },
        { player: "Mohamed Adem", summary: "0/3", status: "eliminated" },
        { player: "Mohamed Ahmed", summary: "0/3", status: "eliminated" },
      ],
      "Round 2": [
        { player: "Majdi", summary: "1/4", status: "advanced" },
        { player: "Ahmed-Suhaib", summary: "0/4", status: "eliminated" },
      ],
    },
  },
  {
    id: "contest-3",
    title: "Contest 3",
    date: "May 6, 2026",
    winner: "Majdi",
    runnerUp: "Mohamed Abdisalan",
    rawData: {
      Majdi: { r1: "10000", r2: "10100", r3: "10110", r4: "11001", r5: "00011", eliminated: 6, winner: true },
      "Mohamed Abdisalan": { r1: "10010", r2: "10000", r3: "11110", r4: "01101", r5: "01100", eliminated: 5, runnerUp: true },
      Muhsin: { r1: "00000", r2: null, r3: null, r4: null, r5: null, eliminated: 1 },
      "Mohamed Ahmed": { r1: "00001", r2: "01000", r3: null, r4: null, r5: null, eliminated: 2, sdElim: true },
      "Mohamed Adem": { r1: "10000", r2: "00001", r3: "00000", r4: null, r5: null, eliminated: 3, sdElim: true },
      "Ahmed-Suhaib": { r1: "00001", r2: "00010", r3: "00010", r4: "00001", r5: null, eliminated: 4, sdElim: true },
      Abdisalan: { r1: "00000", r2: null, r3: null, r4: null, r5: null, eliminated: 1 },
      Sebri: { r1: "01011", r2: "10111", r3: "11001", r4: "10001", r5: null, eliminated: 4 },
      Yahya: { r1: "01010", r2: "00100", r3: "00000", r4: null, r5: null, eliminated: 3, sdElim: true },
      AhmedNur: { r1: { bye: true }, r2: "00000", r3: null, r4: null, r5: null, eliminated: 2 },
    },
    suddenDeath: {
      "Round 2": [
        { player: "Ahmed-Suhaib", summary: "1/1", status: "advanced" },
        { player: "Mohamed Abdisalan", summary: "2/7", status: "advanced" },
        { player: "Mohamed Ahmed", summary: "1/7", status: "eliminated" },
        { player: "Yahya", summary: "1/1", status: "advanced" },
        { player: "Mohamed Adem", summary: "1/2", status: "advanced" },
      ],
      Final: [
        { player: "Mohamed Abdisalan", summary: "0/1", status: "eliminated" },
        { player: "Majdi", summary: "1/1", status: "winner" },
      ],
    },
  },
  {
    id: "contest-2",
    title: "Contest 2",
    date: "April 29, 2026",
    winner: "AhmedNur",
    runnerUp: "Mohamed Omar",
    rawData: {
      "Mohamed Omar": { r1: "00100", r2: "10100", r3: "01101", r4: "00001", r5: "00110", eliminated: 5 },
      Muhsin: { r1: "00110", r2: "10010", r3: "01001", r4: "00000", r5: null, eliminated: 4 },
      Abdisalan: { r1: "11101", r2: "10010", r3: "10001", r4: null, r5: null, eliminated: 3 },
      Majdi: { r1: "01000", r2: "01000", r3: null, r4: null, r5: null, eliminated: 2 },
      "Mohamed Adem": { r1: "00000", r2: "00100", r3: "11000", r4: "00000", r5: null, eliminated: 4, sdElim: true },
      "Mohamed Ahmed": { r1: "00001", r2: "10010", r3: "10000", r4: null, r5: null, eliminated: 3 },
      AhmedNur: { r1: "00000", r2: "01000", r3: "10101", r4: "00100", r5: "00110", eliminated: 6, winner: true, sdElim: true },
      Yahya: { r1: "00010", r2: "00000", r3: null, r4: null, r5: null, eliminated: 2 },
      "Ahmed-Suhaib": { r1: "00000", r2: null, r3: null, r4: null, r5: null, eliminated: 1, sdElim: true },
      "Mohamed Salad": { r1: "00000", r2: null, r3: null, r4: null, r5: null, eliminated: 1, sdElim: true },
    },
    suddenDeath: {
      "Round 1": [
        { player: "Mohamed Adem", summary: "2/5", status: "advanced" },
        { player: "AhmedNur", summary: "1/1", status: "advanced" },
        { player: "Ahmed-Suhaib", summary: "1/5", status: "eliminated" },
        { player: "Mohamed Salad", summary: "quit", status: "quit" },
      ],
      "Round 2": [
        { player: "Mohamed Adem", summary: "1/1", status: "advanced" },
        { player: "Majdi", summary: "1/5", status: "eliminated" },
        { player: "AhmedNur", summary: "2/5", status: "advanced" },
      ],
      "Round 3": [
        { player: "Abdisalan", summary: "0/2", status: "eliminated" },
        { player: "Mohamed Adem", summary: "1/2", status: "advanced" },
        { player: "Muhsin", summary: "1/1", status: "advanced" },
      ],
      Final: [
        { player: "Mohamed Omar", summary: "0/1", status: "eliminated" },
        { player: "AhmedNur", summary: "1/1", status: "winner" },
      ],
    },
  },
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
      Sebri: { r1: "00000", r2: null, r3: null, r4: null, r5: null, eliminated: 1 },
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
