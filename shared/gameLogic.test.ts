import { describe, it, expect } from "vitest";
import { Tile, TileColor, Meld, RoundContext } from "./types";
import {
  createTileSet,
  shuffleTiles,
  getJokerInfo,
  isJoker,
  validateSet,
  validateRun,
  validatePair,
  validateMeld,
  calculateTileValue,
  calculateMeldValue,
  countJokersInHand,
  checkOpeningRequirement,
  calculateHandValue,
  calculateRoundScores,
} from "./gameLogic";
 
// --- Helpers ---
 
function tile(color: TileColor, number: number, id = 0): Tile {
  return { id, color, number, isFalseJoker: false };
}
 
function falseJoker(id = 100): Tile {
  return { id, color: "red", number: 0, isFalseJoker: true };
}
 
// Standard jokerInfo: indicator is red 5 → joker is red 6
const jokerInfo = { color: "red" as TileColor, number: 6 };
 
// --- Tests ---
 
describe("createTileSet", () => {
  const tiles = createTileSet();
 
  it("returns 106 tiles", () => {
    expect(tiles).toHaveLength(106);
  });
 
  it("has 104 numbered tiles + 2 false jokers", () => {
    const numbered = tiles.filter((t) => !t.isFalseJoker);
    const jokers = tiles.filter((t) => t.isFalseJoker);
    expect(numbered).toHaveLength(104);
    expect(jokers).toHaveLength(2);
  });
 
  it("has all unique ids", () => {
    const ids = new Set(tiles.map((t) => t.id));
    expect(ids.size).toBe(106);
  });
 
  it("has 2 copies of each color/number combination", () => {
    const colors: TileColor[] = ["red", "black", "blue", "yellow"];
    for (const color of colors) {
      for (let num = 1; num <= 13; num++) {
        const matching = tiles.filter(
          (t) => t.color === color && t.number === num && !t.isFalseJoker
        );
        expect(matching).toHaveLength(2);
      }
    }
  });
});
 
describe("shuffleTiles", () => {
  it("does not mutate the original array", () => {
    const original = [tile("red", 1, 0), tile("blue", 2, 1)];
    const copy = [...original];
    shuffleTiles(original);
    expect(original).toEqual(copy);
  });
 
  it("preserves length and elements", () => {
    const tiles = createTileSet();
    const shuffled = shuffleTiles(tiles);
    expect(shuffled).toHaveLength(tiles.length);
    const sortById = (a: Tile, b: Tile) => a.id - b.id;
    expect([...shuffled].sort(sortById)).toEqual([...tiles].sort(sortById));
  });
});
 
describe("getJokerInfo", () => {
  it("returns next number for normal tile", () => {
    expect(getJokerInfo(tile("red", 5))).toEqual({ color: "red", number: 6 });
  });
 
  it("wraps 13 → 1", () => {
    expect(getJokerInfo(tile("blue", 13))).toEqual({ color: "blue", number: 1 });
  });
 
  it("handles number 1 → 2", () => {
    expect(getJokerInfo(tile("yellow", 1))).toEqual({ color: "yellow", number: 2 });
  });
});
 
describe("isJoker", () => {
  it("returns true for matching color+number tile", () => {
    expect(isJoker(tile("red", 6), jokerInfo)).toBe(true);
  });
 
  it("returns true for false joker", () => {
    expect(isJoker(falseJoker(), jokerInfo)).toBe(true);
  });
 
  it("returns false for non-matching tile", () => {
    expect(isJoker(tile("red", 5), jokerInfo)).toBe(false);
    expect(isJoker(tile("blue", 6), jokerInfo)).toBe(false);
  });
});
 
describe("validateSet", () => {
  it("valid set of 3 different colors, same number", () => {
    const tiles = [tile("red", 5, 0), tile("blue", 5, 1), tile("black", 5, 2)];
    expect(validateSet(tiles, jokerInfo)).toBe(true);
  });
 
  it("valid set of 4 different colors", () => {
    const tiles = [
      tile("red", 5, 0),
      tile("blue", 5, 1),
      tile("black", 5, 2),
      tile("yellow", 5, 3),
    ];
    expect(validateSet(tiles, jokerInfo)).toBe(true);
  });
 
  it("valid set with joker replacing one tile", () => {
    const tiles = [tile("blue", 5, 0), tile("black", 5, 1), falseJoker()];
    expect(validateSet(tiles, jokerInfo)).toBe(true);
  });
 
  it("invalid: same colors", () => {
    const tiles = [tile("red", 5, 0), tile("red", 5, 1), tile("blue", 5, 2)];
    expect(validateSet(tiles, jokerInfo)).toBe(false);
  });
 
  it("invalid: less than 3 tiles", () => {
    const tiles = [tile("red", 5, 0), tile("blue", 5, 1)];
    expect(validateSet(tiles, jokerInfo)).toBe(false);
  });
 
  it("invalid: more than 4 tiles", () => {
    const tiles = [
      tile("red", 5, 0),
      tile("blue", 5, 1),
      tile("black", 5, 2),
      tile("yellow", 5, 3),
      falseJoker(),
    ];
    expect(validateSet(tiles, jokerInfo)).toBe(false);
  });
 
  it("invalid: all jokers", () => {
    // real joker (red 6) + two false jokers
    const tiles = [tile("red", 6, 0), falseJoker(100), falseJoker(101)];
    expect(validateSet(tiles, jokerInfo)).toBe(false);
  });
 
  it("invalid: different numbers", () => {
    const tiles = [tile("red", 5, 0), tile("blue", 6, 1), tile("black", 5, 2)];
    expect(validateSet(tiles, jokerInfo)).toBe(false);
  });
});
 
describe("validateRun", () => {
  it("valid run 3-4-5 same color", () => {
    const tiles = [tile("blue", 3, 0), tile("blue", 4, 1), tile("blue", 5, 2)];
    expect(validateRun(tiles, jokerInfo)).toBe(true);
  });
 
  it("valid run with joker filling gap (3-J-5)", () => {
    const tiles = [tile("blue", 3, 0), falseJoker(), tile("blue", 5, 2)];
    expect(validateRun(tiles, jokerInfo)).toBe(true);
  });
 
  it("valid run 1-2-3", () => {
    const tiles = [tile("black", 1, 0), tile("black", 2, 1), tile("black", 3, 2)];
    expect(validateRun(tiles, jokerInfo)).toBe(true);
  });
 
  it("valid run 11-12-13", () => {
    const tiles = [tile("yellow", 11, 0), tile("yellow", 12, 1), tile("yellow", 13, 2)];
    expect(validateRun(tiles, jokerInfo)).toBe(true);
  });
 
  it("valid run with joker extending at end", () => {
    const tiles = [tile("blue", 11, 0), tile("blue", 12, 1), falseJoker()];
    expect(validateRun(tiles, jokerInfo)).toBe(true);
  });
 
  it("valid run with joker extending at beginning", () => {
    const tiles = [tile("blue", 2, 0), tile("blue", 3, 1), falseJoker()];
    expect(validateRun(tiles, jokerInfo)).toBe(true);
  });
 
  it("invalid: different colors", () => {
    const tiles = [tile("blue", 3, 0), tile("red", 4, 1), tile("blue", 5, 2)];
    expect(validateRun(tiles, jokerInfo)).toBe(false);
  });
 
  it("invalid: gap too large for available jokers", () => {
    const tiles = [tile("blue", 3, 0), tile("blue", 7, 1), tile("blue", 8, 2)];
    expect(validateRun(tiles, jokerInfo)).toBe(false);
  });
 
  it("invalid: less than 3 tiles", () => {
    const tiles = [tile("blue", 3, 0), tile("blue", 4, 1)];
    expect(validateRun(tiles, jokerInfo)).toBe(false);
  });
 
  it("valid: 12-13 + 2 jokers extends to 10-11-12-13", () => {
    const tiles = [tile("blue", 12, 0), tile("blue", 13, 1), falseJoker(100), falseJoker(101)];
    expect(validateRun(tiles, jokerInfo)).toBe(true);
  });

  it("invalid: all tiles are jokers", () => {
    expect(validateRun([falseJoker(100), falseJoker(101), tile("red", 6, 0)], jokerInfo)).toBe(false);
  });
});
 
describe("validatePair", () => {
  it("valid pair: same number and color", () => {
    expect(validatePair([tile("red", 7, 0), tile("red", 7, 1)])).toBe(true);
  });
 
  it("invalid: different numbers", () => {
    expect(validatePair([tile("red", 7, 0), tile("red", 8, 1)])).toBe(false);
  });
 
  it("invalid: different colors", () => {
    expect(validatePair([tile("red", 7, 0), tile("blue", 7, 1)])).toBe(false);
  });
 
  it("invalid: false joker in pair", () => {
    expect(validatePair([falseJoker(), tile("red", 7, 1)])).toBe(false);
  });
 
  it("invalid: not 2 tiles", () => {
    expect(validatePair([tile("red", 7, 0)])).toBe(false);
    expect(validatePair([tile("red", 7, 0), tile("red", 7, 1), tile("red", 7, 2)])).toBe(false);
  });
});
 
describe("validateMeld", () => {
  it("detects pair", () => {
    const result = validateMeld([tile("red", 7, 0), tile("red", 7, 1)], jokerInfo);
    expect(result).toEqual({ valid: true, type: "pair" });
  });
 
  it("detects set", () => {
    const tiles = [tile("red", 5, 0), tile("blue", 5, 1), tile("black", 5, 2)];
    const result = validateMeld(tiles, jokerInfo);
    expect(result).toEqual({ valid: true, type: "set" });
  });
 
  it("detects run", () => {
    const tiles = [tile("blue", 3, 0), tile("blue", 4, 1), tile("blue", 5, 2)];
    const result = validateMeld(tiles, jokerInfo);
    expect(result).toEqual({ valid: true, type: "run" });
  });
 
  it("returns invalid for bad combination", () => {
    const tiles = [tile("red", 1, 0), tile("blue", 5, 1)];
    const result = validateMeld(tiles, jokerInfo);
    expect(result).toEqual({ valid: false, type: null });
  });
});
 
describe("calculateTileValue", () => {
  it("returns number for normal tile", () => {
    expect(calculateTileValue(tile("blue", 10), jokerInfo)).toBe(10);
  });
 
  it("returns jokerInfo.number for real joker", () => {
    expect(calculateTileValue(tile("red", 6), jokerInfo)).toBe(6);
  });
 
  it("returns jokerInfo.number for false joker", () => {
    expect(calculateTileValue(falseJoker(), jokerInfo)).toBe(6);
  });
});
 
describe("calculateMeldValue", () => {
  it("sums tile values", () => {
    const tiles = [tile("red", 3, 0), tile("blue", 4, 1), tile("black", 5, 2)];
    expect(calculateMeldValue(tiles, jokerInfo)).toBe(12);
  });
 
  it("counts joker as jokerInfo.number", () => {
    const tiles = [tile("red", 3, 0), falseJoker(), tile("black", 5, 2)];
    expect(calculateMeldValue(tiles, jokerInfo)).toBe(14); // 3 + 6 + 5
  });
});
 
describe("countJokersInHand", () => {
  it("returns 0 when no jokers", () => {
    expect(countJokersInHand([tile("blue", 3), tile("blue", 4)], jokerInfo)).toBe(0);
  });
 
  it("counts real joker and false joker", () => {
    const hand = [tile("red", 6, 0), falseJoker(), tile("blue", 3, 2)];
    expect(countJokersInHand(hand, jokerInfo)).toBe(2);
  });
});
 
describe("checkOpeningRequirement", () => {
  it("sets_runs: true when total value >= 101", () => {
    // Three melds summing to >= 101
    const melds: Meld[] = [
      { id: "1", tiles: [tile("red", 12, 0), tile("blue", 12, 1), tile("black", 12, 2)], type: "set", ownerId: "p1" },
      { id: "2", tiles: [tile("red", 11, 3), tile("blue", 11, 4), tile("black", 11, 5)], type: "set", ownerId: "p1" },
      { id: "3", tiles: [tile("red", 13, 6), tile("blue", 13, 7), tile("black", 13, 8)], type: "set", ownerId: "p1" },
    ];
    // 36 + 33 + 39 = 108
    expect(checkOpeningRequirement(melds, "sets_runs", jokerInfo)).toBe(true);
  });
 
  it("sets_runs: false when total value < 101", () => {
    const melds: Meld[] = [
      { id: "1", tiles: [tile("red", 1, 0), tile("blue", 1, 1), tile("black", 1, 2)], type: "set", ownerId: "p1" },
    ];
    // 3
    expect(checkOpeningRequirement(melds, "sets_runs", jokerInfo)).toBe(false);
  });
 
  it("pairs: true when >= 5 pairs", () => {
    const melds: Meld[] = Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
      tiles: [tile("red", i + 1, i * 2), tile("red", i + 1, i * 2 + 1)],
      type: "pair" as const,
      ownerId: "p1",
    }));
    expect(checkOpeningRequirement(melds, "pairs", jokerInfo)).toBe(true);
  });
 
  it("pairs: false when < 5 pairs", () => {
    const melds: Meld[] = [
      { id: "1", tiles: [tile("red", 1, 0), tile("red", 1, 1)], type: "pair", ownerId: "p1" },
    ];
    expect(checkOpeningRequirement(melds, "pairs", jokerInfo)).toBe(false);
  });
});
 
describe("calculateHandValue", () => {
  it("sums tile numbers", () => {
    const hand = [tile("red", 3), tile("blue", 10), tile("black", 1)];
    expect(calculateHandValue(hand, jokerInfo)).toBe(14);
  });
 
  it("counts joker as jokerInfo.number", () => {
    const hand = [tile("red", 3), falseJoker()];
    expect(calculateHandValue(hand, jokerInfo)).toBe(9); // 3 + 6
  });
});
 
describe("calculateRoundScores", () => {
  function makeCtx(overrides: Partial<RoundContext>): RoundContext {
    return {
      winnerId: "w",
      winnerMethod: "sets_runs",
      discardedJoker: false,
      allAtOnce: false,
      players: [
        { id: "w", hand: [], isOpened: true, meldMethod: "sets_runs" },
        { id: "p1", hand: [tile("blue", 5, 0)], isOpened: true, meldMethod: "sets_runs" },
      ],
      jokerInfo,
      ...overrides,
    };
  }
 
  it("sets_runs, no joker discard: winner -101, loser hand*1", () => {
    const scores = calculateRoundScores(makeCtx({}));
    expect(scores["w"]).toBe(-101);
    expect(scores["p1"]).toBe(5); // 5 * 1
  });
 
  it("sets_runs + joker discard: winner -202, loser hand*2", () => {
    const scores = calculateRoundScores(makeCtx({ discardedJoker: true }));
    expect(scores["w"]).toBe(-202);
    expect(scores["p1"]).toBe(10); // 5 * 2
  });
 
  it("pairs, no joker discard: winner -202, loser(sets_runs) hand*2", () => {
    const scores = calculateRoundScores(makeCtx({ winnerMethod: "pairs" }));
    expect(scores["w"]).toBe(-202);
    expect(scores["p1"]).toBe(10); // 5 * 2
  });
 
  it("pairs + joker discard: winner -404, loser(sets_runs) hand*4", () => {
    const scores = calculateRoundScores(
      makeCtx({ winnerMethod: "pairs", discardedJoker: true })
    );
    expect(scores["w"]).toBe(-404);
    expect(scores["p1"]).toBe(20); // 5 * 4
  });
 
  it("pairs multiplier applied to pairs loser", () => {
    const ctx = makeCtx({
      winnerMethod: "sets_runs",
      players: [
        { id: "w", hand: [], isOpened: true, meldMethod: "sets_runs" },
        { id: "p1", hand: [tile("blue", 5, 0)], isOpened: true, meldMethod: "pairs" },
      ],
    });
    const scores = calculateRoundScores(ctx);
    expect(scores["p1"]).toBe(10); // 5 * pairsMultiplier(2)
  });
 
  it("unopened player gets penalty", () => {
    const ctx = makeCtx({
      players: [
        { id: "w", hand: [], isOpened: true, meldMethod: "sets_runs" },
        { id: "p1", hand: [tile("blue", 5, 0)], isOpened: false, meldMethod: null },
      ],
    });
    const scores = calculateRoundScores(ctx);
    expect(scores["p1"]).toBe(202); // unopenedPenalty for sets_runs no joker
  });
 
  it("allAtOnce without joker: winner -202, losers 404", () => {
    const ctx = makeCtx({
      allAtOnce: true,
      players: [
        { id: "w", hand: [], isOpened: true, meldMethod: "sets_runs" },
        { id: "p1", hand: [tile("blue", 5, 0)], isOpened: false, meldMethod: null },
        { id: "p2", hand: [tile("red", 10, 1)], isOpened: true, meldMethod: "sets_runs" },
      ],
    });
    const scores = calculateRoundScores(ctx);
    expect(scores["w"]).toBe(-202);
    expect(scores["p1"]).toBe(404);
    expect(scores["p2"]).toBe(404);
  });
 
  it("allAtOnce with joker: winner -404, losers 808", () => {
    const ctx = makeCtx({
      allAtOnce: true,
      discardedJoker: true,
      players: [
        { id: "w", hand: [], isOpened: true, meldMethod: "sets_runs" },
        { id: "p1", hand: [], isOpened: false, meldMethod: null },
      ],
    });
    const scores = calculateRoundScores(ctx);
    expect(scores["w"]).toBe(-404);
    expect(scores["p1"]).toBe(808);
  });
 
  it("joker in hand adds 101 penalty per joker", () => {
    const ctx = makeCtx({
      players: [
        { id: "w", hand: [], isOpened: true, meldMethod: "sets_runs" },
        {
          id: "p1",
          hand: [tile("blue", 5, 0), falseJoker(100)],
          isOpened: true,
          meldMethod: "sets_runs",
        },
      ],
    });
    const scores = calculateRoundScores(ctx);
    // handValue = 5 + 6(joker) = 11, * 1 = 11, + 101 joker penalty = 112
    expect(scores["p1"]).toBe(112);
  });
 
  it("multiple jokers in hand: each adds 101", () => {
    const ctx = makeCtx({
      players: [
        { id: "w", hand: [], isOpened: true, meldMethod: "sets_runs" },
        {
          id: "p1",
          hand: [falseJoker(100), tile("red", 6, 1)], // both are jokers
          isOpened: true,
          meldMethod: "sets_runs",
        },
      ],
    });
    const scores = calculateRoundScores(ctx);
    // handValue = 6 + 6 = 12, * 1 = 12, + 2*101 = 214
    expect(scores["p1"]).toBe(214);
  });
})