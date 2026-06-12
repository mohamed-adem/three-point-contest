import {
  CONTESTS,
  CONTEST_ROUNDS,
  POWER_RANKINGS,
  PREVIOUS_POWER_RANKINGS,
  ROUND_KEYS,
} from "../src/data/contestData.js";

const VALID_SHOT_PATTERN = /^[01x]{5}$/;
const VALID_SD_STATUSES = new Set(["advanced", "eliminated", "winner", "quit"]);
const errors = [];

function addError(context, message) {
  errors.push(`${context}: ${message}`);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateRankingList(name, rankings) {
  const seen = new Set();

  rankings.forEach((player, index) => {
    if (!player || typeof player !== "string") {
      addError(name, `entry ${index + 1} must be a player name`);
      return;
    }

    if (seen.has(player)) {
      addError(name, `duplicate player "${player}"`);
    }

    seen.add(player);
  });
}

function validateRoundValue(context, value) {
  if (value === null || value === "?????") return;

  if (typeof value === "string") {
    if (!VALID_SHOT_PATTERN.test(value)) {
      addError(context, `shot string must be five characters using 0, 1, or x; got "${value}"`);
    }
    return;
  }

  if (!isPlainObject(value)) {
    addError(context, "round value must be null, a shot string, { bye: true }, or { score, zonesKnown: false }");
    return;
  }

  if (value.bye) {
    if (value.bye !== true || Object.keys(value).length !== 1) {
      addError(context, 'bye round must be exactly { bye: true }');
    }
    return;
  }

  if (!Number.isInteger(value.score) || value.score < 0 || value.score > 5) {
    addError(context, "unknown-zone round must include an integer score from 0 to 5");
  }

  if (value.zonesKnown !== false) {
    addError(context, "unknown-zone round must include zonesKnown: false");
  }
}

function validatePlayer(contest, playerName, playerData) {
  const context = `${contest.id} / ${playerName}`;

  if (!isPlainObject(playerData)) {
    addError(context, "player data must be an object");
    return;
  }

  ROUND_KEYS.forEach((roundKey) => {
    if (!(roundKey in playerData)) {
      addError(context, `missing ${roundKey}`);
      return;
    }

    validateRoundValue(`${context} / ${roundKey}`, playerData[roundKey]);
  });

  if (!Number.isInteger(playerData.eliminated) || playerData.eliminated < 1 || playerData.eliminated > ROUND_KEYS.length + 1) {
    addError(context, `eliminated must be an integer from 1 to ${ROUND_KEYS.length + 1}`);
  }
}

function validateSuddenDeath(contest, players) {
  Object.entries(contest.suddenDeath || {}).forEach(([round, entries]) => {
    const context = `${contest.id} / suddenDeath / ${round}`;

    if (!CONTEST_ROUNDS.includes(round)) {
      addError(context, `round must be one of ${CONTEST_ROUNDS.join(", ")}`);
    }

    if (!Array.isArray(entries)) {
      addError(context, "entries must be an array");
      return;
    }

    entries.forEach((entry, index) => {
      const entryContext = `${context} / entry ${index + 1}`;

      if (!isPlainObject(entry)) {
        addError(entryContext, "entry must be an object");
        return;
      }

      if (!players.has(entry.player)) {
        addError(entryContext, `unknown player "${entry.player}"`);
      }

      if ("status" in entry && !VALID_SD_STATUSES.has(entry.status)) {
        addError(entryContext, `status must be one of ${[...VALID_SD_STATUSES].join(", ")}`);
      }

      const hasSummaryFormat = typeof entry.summary === "string" && typeof entry.status === "string";
      const hasAttemptFormat = Number.isInteger(entry.attempts) && typeof entry.made === "boolean";

      if (!hasSummaryFormat && !hasAttemptFormat) {
        addError(entryContext, "entry must use { player, summary, status } or { player, attempts, made }");
      }
    });
  });
}

function validateContest(contest, index, seenIds) {
  const context = contest?.id || `contest at index ${index}`;

  if (!isPlainObject(contest)) {
    addError(`contest at index ${index}`, "contest must be an object");
    return;
  }

  ["id", "title", "date", "winner", "runnerUp"].forEach((key) => {
    if (!contest[key] || typeof contest[key] !== "string") {
      addError(context, `${key} must be a non-empty string`);
    }
  });

  if (seenIds.has(contest.id)) {
    addError(context, `duplicate contest id "${contest.id}"`);
  }
  seenIds.add(contest.id);

  if (!isPlainObject(contest.rawData)) {
    addError(context, "rawData must be an object keyed by player name");
    return;
  }

  if (!isPlainObject(contest.suddenDeath)) {
    addError(context, "suddenDeath must be an object; use {} when there were no tiebreakers");
  }

  const players = new Set(Object.keys(contest.rawData));

  if (!players.has(contest.winner)) {
    addError(context, `winner "${contest.winner}" is not in rawData`);
  }

  if (!players.has(contest.runnerUp)) {
    addError(context, `runnerUp "${contest.runnerUp}" is not in rawData`);
  }

  Object.entries(contest.rawData).forEach(([playerName, playerData]) => {
    validatePlayer(contest, playerName, playerData);
  });

  const winnerFlags = Object.entries(contest.rawData).filter(([, playerData]) => Boolean(playerData.winner));

  if (winnerFlags.length !== 1) {
    addError(context, `expected exactly one player with winner: true, found ${winnerFlags.length}`);
  } else if (winnerFlags[0][0] !== contest.winner) {
    addError(context, `winner flag is on "${winnerFlags[0][0]}", but contest winner is "${contest.winner}"`);
  }

  validateSuddenDeath(contest, players);
}

if (!Array.isArray(CONTESTS) || CONTESTS.length === 0) {
  addError("CONTESTS", "must be a non-empty array");
} else {
  const seenIds = new Set();
  CONTESTS.forEach((contest, index) => validateContest(contest, index, seenIds));
}

validateRankingList("POWER_RANKINGS", POWER_RANKINGS);
validateRankingList("PREVIOUS_POWER_RANKINGS", PREVIOUS_POWER_RANKINGS);

if (errors.length) {
  console.error(`Contest data validation failed with ${errors.length} error${errors.length === 1 ? "" : "s"}:`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Contest data validation passed for ${CONTESTS.length} contests.`);
