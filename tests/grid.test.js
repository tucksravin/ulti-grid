import { describe, test, expect } from "vitest";
import {
  SIZE,
  BALL,
  OFFENSE,
  DEFENSE,
  DEFAULT_BALL,
  createGrid,
  calcGrid,
  serializeGrid,
  parseGridString,
  applyGridString,
  applyClick,
  clearGrid,
} from "../src/lib/grid.js";
import { PRESETS } from "../src/lib/presets.js";

/**
 * Every cell must be a marker (-1/-2/-3) or a finite brightness in [0,1].
 * @param {number[][]} grid
 */
function expectGridSane(grid) {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const v = grid[i][j];
      if (v < 0) {
        expect([BALL, OFFENSE, DEFENSE]).toContain(v);
      } else {
        expect(Number.isFinite(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  }
}

describe("createGrid", () => {
  test("makes a 40x40 grid of full brightness", () => {
    const grid = createGrid();
    expect(grid.length).toBe(SIZE);
    expect(grid[0].length).toBe(SIZE);
    expect(grid.every((row) => row.every((v) => v === 1))).toBe(true);
  });
});

describe("calcGrid", () => {
  test("corner ball with adjacent defender never yields NaN or out-of-range cells", () => {
    // Regression: distances beyond maxDistance made Math.pow(negative, 1.5) = NaN,
    // which slipped through the </> clamps and rendered white in deep shadow.
    const grid = createGrid();
    grid[5][0] = BALL;
    grid[5][1] = DEFENSE;
    calcGrid(grid, 5, 0);
    expectGridSane(grid);
  });

  test("far corner cell gets a real value with ball at opposite corner", () => {
    const grid = createGrid();
    grid[0][0] = BALL;
    calcGrid(grid, 0, 0);
    expect(Number.isFinite(grid[39][39])).toBe(true);
    expect(grid[39][39]).toBeGreaterThanOrEqual(0);
  });

  test("diagonal defender at extreme blocker distance never yields NaN", () => {
    // Ball at (0,0) with a defender at (1,1) sits on the exact Bresenham
    // diagonal from (39,39): blocker distance 38*sqrt(2) far exceeds
    // MAX_DISTANCE for over a hundred cells, the old NaN condition.
    const grid = createGrid();
    grid[0][0] = BALL;
    grid[1][1] = DEFENSE;
    calcGrid(grid, 0, 0);
    expect(Number.isFinite(grid[39][39])).toBe(true);
    expectGridSane(grid);
  });

  test("a defender on the throwing lane darkens the cell behind it", () => {
    const open = createGrid();
    open[20][20] = BALL;
    calcGrid(open, 20, 20);

    const guarded = createGrid();
    guarded[20][20] = BALL;
    guarded[20][25] = DEFENSE;
    calcGrid(guarded, 20, 20);

    expect(guarded[20][30]).toBeLessThan(open[20][30]);
  });
});

describe("serializeGrid", () => {
  test("emits only marker cells, never computed brightness", () => {
    const grid = createGrid();
    grid[4][20] = BALL;
    grid[10][10] = OFFENSE;
    grid[12][12] = DEFENSE;
    calcGrid(grid, 4, 20); // fills the rest with fractional brightness
    const str = serializeGrid(grid);
    const entries = str.split(";").filter(Boolean);
    expect(entries.length).toBe(3);
    for (const e of entries) {
      const value = Number(e.split(",")[2]);
      expect([BALL, OFFENSE, DEFENSE]).toContain(value);
    }
  });

  test("round-trips through parseGridString", () => {
    const grid = createGrid();
    grid[4][20] = BALL;
    grid[10][10] = OFFENSE;
    grid[12][12] = DEFENSE;
    const str = serializeGrid(grid);
    const cells = parseGridString(str);
    expect(cells).toEqual([
      { row: 4, col: 20, value: BALL },
      { row: 10, col: 10, value: OFFENSE },
      { row: 12, col: 12, value: DEFENSE },
    ]);
  });
});

describe("parseGridString", () => {
  test("does not throw on garbage input", () => {
    // Regression: loadFromString crashed with a TypeError after wiping the board.
    expect(parseGridString("hello")).toEqual([]);
    expect(parseGridString("")).toEqual([]);
    expect(parseGridString("https://example.com?g=1,2")).toEqual([]);
  });

  test("drops out-of-bounds and non-integer coordinates", () => {
    expect(parseGridString("45,2,-3;")).toEqual([]);
    expect(parseGridString("-1,2,-3;")).toEqual([]);
    expect(parseGridString("2.5,2,-3;")).toEqual([]);
  });

  test("drops values that are not exactly -1, -2, or -3", () => {
    // Regression: the shipped Z Trap preset contained ~120 serialized brightness
    // artifacts like "22,39,-0.0055..." that froze cells forever.
    const corrupted = "3,1,-3;22,39,-0.005555555555555758;24,38,-0.002777777777777546;5,0,-1;";
    expect(parseGridString(corrupted)).toEqual([
      { row: 3, col: 1, value: DEFENSE },
      { row: 5, col: 0, value: BALL },
    ]);
  });
});

describe("applyGridString", () => {
  test("places cells and computes brightness", () => {
    const { grid, ballRow, ballCol } = applyGridString("4,20,-1;10,10,-2;12,12,-3;");
    expect(grid[4][20]).toBe(BALL);
    expect(grid[10][10]).toBe(OFFENSE);
    expect(grid[12][12]).toBe(DEFENSE);
    expect(ballRow).toBe(4);
    expect(ballCol).toBe(20);
    expect(grid[39][39]).toBeLessThan(1); // brightness was computed, not left uniform
    expectGridSane(grid);
  });

  test("a ball-less string still gets a ball at the default spot", () => {
    // Regression: loading a string without a -1 entry left a phantom light
    // source at (0,0) with no ball rendered anywhere.
    const { grid, ballRow, ballCol } = applyGridString("10,10,-2;");
    expect(ballRow).toBe(DEFAULT_BALL.row);
    expect(ballCol).toBe(DEFAULT_BALL.col);
    expect(grid[ballRow][ballCol]).toBe(BALL);
    expectGridSane(grid);
  });

  test("last ball entry wins when a string has several", () => {
    const { grid, ballRow, ballCol } = applyGridString("2,2,-1;8,8,-1;");
    expect(ballRow).toBe(8);
    expect(ballCol).toBe(8);
    expect(grid[8][8]).toBe(BALL);
    expect(grid[2][2]).not.toBe(BALL);
  });

  test("a later entry for the same cell wins, even over a relocated ball", () => {
    // "5,5,-1;5,5,-3;9,9,-1": the defender written over the first ball's cell
    // must survive the ball's relocation to (9,9).
    const { grid, ballRow, ballCol } = applyGridString("5,5,-1;5,5,-3;9,9,-1;");
    expect(grid[5][5]).toBe(DEFENSE);
    expect(grid[9][9]).toBe(BALL);
    expect(ballRow).toBe(9);
    expect(ballCol).toBe(9);
  });

  test("a ball-less string with a piece on the default spot keeps the piece", () => {
    const { grid, ballRow, ballCol } = applyGridString(`${DEFAULT_BALL.row},${DEFAULT_BALL.col},-3;`);
    expect(grid[DEFAULT_BALL.row][DEFAULT_BALL.col]).toBe(DEFENSE);
    expect(grid[ballRow][ballCol]).toBe(BALL);
    expect(ballRow === DEFAULT_BALL.row && ballCol === DEFAULT_BALL.col).toBe(false);
    expectGridSane(grid);
  });
});

describe("applyClick", () => {
  function boardWithBall() {
    const grid = createGrid();
    grid[4][20] = BALL;
    calcGrid(grid, 4, 20);
    return grid;
  }

  test("places and toggles an offensive player", () => {
    const grid = boardWithBall();
    let ball = applyClick(grid, 4, 20, "O", 10, 10);
    expect(grid[10][10]).toBe(OFFENSE);
    ball = applyClick(grid, ball.ballRow, ball.ballCol, "O", 10, 10);
    expect(grid[10][10]).toBeGreaterThanOrEqual(0); // toggled back to open space
    expectGridSane(grid);
  });

  test("O/D clicks on the ball cell are no-ops", () => {
    // Regression: erasing the ball left stale ball coordinates, a phantom
    // light source, and later deleted whichever piece sat at the old spot.
    const grid = boardWithBall();
    const ball = applyClick(grid, 4, 20, "D", 4, 20);
    expect(grid[4][20]).toBe(BALL);
    expect(ball).toEqual({ ballRow: 4, ballCol: 20 });
  });

  test("moving the ball clears the old cell and updates coordinates", () => {
    const grid = boardWithBall();
    const ball = applyClick(grid, 4, 20, "B", 15, 15);
    expect(grid[15][15]).toBe(BALL);
    expect(grid[4][20]).toBeGreaterThanOrEqual(0);
    expect(ball).toEqual({ ballRow: 15, ballCol: 15 });
    expectGridSane(grid);
  });

  test("moving the ball onto a piece replaces it", () => {
    const grid = boardWithBall();
    applyClick(grid, 4, 20, "D", 15, 15);
    const ball = applyClick(grid, 4, 20, "B", 15, 15);
    expect(grid[15][15]).toBe(BALL);
    expect(ball).toEqual({ ballRow: 15, ballCol: 15 });
  });

  test("clicking the ball cell in Ball mode keeps the ball there", () => {
    const grid = boardWithBall();
    const ball = applyClick(grid, 4, 20, "B", 4, 20);
    expect(grid[4][20]).toBe(BALL);
    expect(ball).toEqual({ ballRow: 4, ballCol: 20 });
  });
});

describe("clearGrid", () => {
  test("returns a computed board with the ball at the default spot", () => {
    // Regression: Clear left every cell at uniform full brightness because
    // calcGrid was never called.
    const { grid, ballRow, ballCol } = clearGrid();
    expect(ballRow).toBe(DEFAULT_BALL.row);
    expect(ballCol).toBe(DEFAULT_BALL.col);
    expect(grid[ballRow][ballCol]).toBe(BALL);
    expect(grid[39][39]).toBeLessThan(1); // distance decay is visible immediately
    expectGridSane(grid);
  });
});

describe("PRESETS", () => {
  test("every preset contains only valid markers and exactly one ball", () => {
    // Regression: the shipped Z Trap string carried ~120 corrupted entries.
    expect(Object.keys(PRESETS).length).toBeGreaterThanOrEqual(4);
    for (const [name, str] of Object.entries(PRESETS)) {
      const cells = parseGridString(str);
      expect(cells.length, `${name} parses`).toBeGreaterThan(0);
      const rawEntries = str.split(";").filter(Boolean);
      expect(rawEntries.length, `${name} has no junk entries`).toBe(cells.length);
      const balls = cells.filter((c) => c.value === BALL);
      expect(balls.length, `${name} has one ball`).toBe(1);
    }
  });

  test("presets round-trip so the active-preset highlight can compare strings", () => {
    for (const [name, str] of Object.entries(PRESETS)) {
      const { grid } = applyGridString(str);
      expect(serializeGrid(grid), `${name} round-trips`).toBe(str);
    }
  });
});
