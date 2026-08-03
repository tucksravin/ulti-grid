// Pure grid math for the ulti-grid board. Cells hold either a marker
// (BALL/OFFENSE/DEFENSE) or a computed "openness" brightness in [0, 1].
export const SIZE = 40;
export const BALL = -1;
export const OFFENSE = -2;
export const DEFENSE = -3;
export const DEFAULT_BALL = { row: 4, col: 20 };

// Distances beyond this render fully dark; must stay clamped or the shadow
// falloff turns into Math.pow(negative, 1.5) = NaN.
const MAX_DISTANCE = Math.sqrt(2) * SIZE * 0.75;

/** @returns {number[][]} */
export function createGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(1));
}

/**
 * @param {number} r1
 * @param {number} c1
 * @param {number} r2
 * @param {number} c2
 */
function distance(r1, c1, r2, c2) {
  return Math.hypot(r2 - r1, c2 - c1);
}

// Walks the Bresenham line from a cell to the ball and returns the distance
// from the cell to the nearest defender on that line, or -1 if the lane is clear.
/**
 * @param {number[][]} grid
 * @param {number} row
 * @param {number} col
 * @param {number} ballRow
 * @param {number} ballCol
 */
function shadowDistance(grid, row, col, ballRow, ballCol) {
  let r = row;
  let c = col;
  const dr = Math.abs(ballRow - r);
  const dc = Math.abs(ballCol - c);
  const sr = r < ballRow ? 1 : -1;
  const sc = c < ballCol ? 1 : -1;
  let err = dc - dr;
  let minDist = Infinity;

  while (true) {
    if (grid[r][c] === DEFENSE) {
      minDist = Math.min(minDist, distance(row, col, r, c));
    }
    if (r === ballRow && c === ballCol) break;
    const e2 = 2 * err;
    if (e2 > -dr) {
      err -= dr;
      c += sc;
    }
    if (e2 < dc) {
      err += dc;
      r += sr;
    }
  }

  return minDist === Infinity ? -1 : minDist;
}

/** @param {number[][]} grid */
function smoothGrid(grid) {
  const snapshot = grid.map((row) => [...row]);

  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (snapshot[i][j] < 0) continue;

      let sum = 0;
      let count = 0;
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          const ni = i + di;
          const nj = j + dj;
          if (ni >= 0 && ni < SIZE && nj >= 0 && nj < SIZE && snapshot[ni][nj] >= 0) {
            sum += snapshot[ni][nj];
            count++;
          }
        }
      }
      if (count > 0) {
        grid[i][j] = sum / count;
      }
    }
  }
}

// Recomputes every open cell's brightness: distance decay from the ball,
// darkened where a defender blocks the throwing lane. Mutates and returns grid.
/**
 * @param {number[][]} grid
 * @param {number} ballRow
 * @param {number} ballCol
 */
export function calcGrid(grid, ballRow, ballCol) {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (grid[i][j] < 0) continue;

      const distToBall = distance(i, j, ballRow, ballCol);
      let brightness = 1 - distToBall / MAX_DISTANCE;

      const distToBlocker = shadowDistance(grid, i, j, ballRow, ballCol);
      if (distToBlocker >= 0) {
        const shadowIntensity = Math.pow(Math.max(0, 1 - distToBlocker / MAX_DISTANCE), 1.5);
        brightness *= 1 - shadowIntensity;
      }

      const eased = 1 - Math.pow(1 - brightness, 2);
      grid[i][j] = Math.min(1, Math.max(0, eased));
    }
  }

  smoothGrid(grid);
  return grid;
}

// Serializes only marker cells as "row,col,value;" — never computed brightness,
// which is how corrupted floats once got baked into a shared preset.
/** @param {number[][]} grid */
export function serializeGrid(grid) {
  let out = "";
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const v = grid[i][j];
      if (v === BALL || v === OFFENSE || v === DEFENSE) {
        out += `${i},${j},${v};`;
      }
    }
  }
  return out;
}

// Tolerant parser: returns valid marker cells, silently dropping anything
// malformed, out of bounds, or carrying a non-marker value.
/**
 * @param {string} str
 * @returns {{ row: number, col: number, value: number }[]}
 */
export function parseGridString(str) {
  if (typeof str !== "string") return [];
  /** @type {{ row: number, col: number, value: number }[]} */
  const cells = [];
  for (const entry of str.split(";")) {
    if (!entry.trim()) continue;
    const parts = entry.split(",");
    if (parts.length !== 3) continue;
    const row = Number(parts[0]);
    const col = Number(parts[1]);
    const value = Number(parts[2]);
    if (!Number.isInteger(row) || !Number.isInteger(col)) continue;
    if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) continue;
    if (value !== BALL && value !== OFFENSE && value !== DEFENSE) continue;
    cells.push({ row, col, value });
  }
  return cells;
}

// Nearest cell (Chebyshev rings outward) not occupied by a marker.
/**
 * @param {number[][]} grid
 * @param {number} row
 * @param {number} col
 */
function findFreeCell(grid, row, col) {
  if (grid[row][col] >= 0) return { row, col };
  for (let radius = 1; radius < SIZE; radius++) {
    for (let r = Math.max(0, row - radius); r <= Math.min(SIZE - 1, row + radius); r++) {
      for (let c = Math.max(0, col - radius); c <= Math.min(SIZE - 1, col + radius); c++) {
        if (Math.max(Math.abs(r - row), Math.abs(c - col)) !== radius) continue;
        if (grid[r][c] >= 0) return { row: r, col: c };
      }
    }
  }
  return { row, col };
}

// Builds a fresh computed board from a serialized string. Duplicate entries for
// a cell resolve last-writer-wins. The board always has a ball: the last
// surviving ball entry wins, extra ball cells become open space, and a
// ball-less string gets one at (or nearest to) DEFAULT_BALL so there is never
// an invisible light source.
/** @param {string} str */
export function applyGridString(str) {
  const grid = createGrid();

  /** @type {Map<number, number>} */
  const finalValues = new Map();
  let lastBallKey = -1;
  for (const { row, col, value } of parseGridString(str)) {
    const key = row * SIZE + col;
    finalValues.set(key, value);
    if (value === BALL) lastBallKey = key;
  }

  let ballRow = -1;
  let ballCol = -1;
  if (lastBallKey >= 0 && finalValues.get(lastBallKey) === BALL) {
    ballRow = Math.floor(lastBallKey / SIZE);
    ballCol = lastBallKey % SIZE;
  }

  for (const [key, value] of finalValues) {
    const row = Math.floor(key / SIZE);
    const col = key % SIZE;
    if (value === BALL && (row !== ballRow || col !== ballCol)) continue;
    grid[row][col] = value;
  }

  if (ballRow < 0) {
    ({ row: ballRow, col: ballCol } = findFreeCell(grid, DEFAULT_BALL.row, DEFAULT_BALL.col));
    grid[ballRow][ballCol] = BALL;
  }

  calcGrid(grid, ballRow, ballCol);
  return { grid, ballRow, ballCol };
}

// Applies one board click. The ball can move but never be erased — O/D clicks
// on the ball cell are no-ops, so ballRow/ballCol can never go stale.
/**
 * @param {number[][]} grid
 * @param {number} ballRow
 * @param {number} ballCol
 * @param {string} mode
 * @param {number} row
 * @param {number} col
 */
export function applyClick(grid, ballRow, ballCol, mode, row, col) {
  if (mode === "B") {
    if (row !== ballRow || col !== ballCol) {
      grid[ballRow][ballCol] = 1;
      grid[row][col] = BALL;
      ballRow = row;
      ballCol = col;
    }
  } else if (grid[row][col] === BALL) {
    // keep the light source
  } else if (grid[row][col] < 0) {
    grid[row][col] = 1;
  } else {
    grid[row][col] = mode === "O" ? OFFENSE : DEFENSE;
  }

  calcGrid(grid, ballRow, ballCol);
  return { ballRow, ballCol };
}

export function clearGrid() {
  const grid = createGrid();
  grid[DEFAULT_BALL.row][DEFAULT_BALL.col] = BALL;
  calcGrid(grid, DEFAULT_BALL.row, DEFAULT_BALL.col);
  return { grid, ballRow: DEFAULT_BALL.row, ballCol: DEFAULT_BALL.col };
}
