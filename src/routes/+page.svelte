<script>
  import { onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import {
    SIZE,
    BALL,
    OFFENSE,
    DEFENSE,
    applyClick,
    applyGridString,
    clearGrid,
    parseGridString,
    serializeGrid,
  } from "$lib/grid.js";
  import { PRESETS } from "$lib/presets.js";

  // Prerendered HTML shows Vert; a shared ?g= link takes over at hydration.
  function initialBoard() {
    if (browser) {
      const param = new URLSearchParams(window.location.search).get("g");
      if (param && parseGridString(param).length > 0) return applyGridString(param);
    }
    return applyGridString(PRESETS.Vert);
  }

  const initial = initialBoard();
  let grid = $state(initial.grid);
  let ballRow = $state(initial.ballRow);
  let ballCol = $state(initial.ballCol);
  let mode = $state("B");
  let shareText = $state("");
  let feedback = $state("");
  /** @type {string[]} */
  let undoStack = $state([]);

  const currentString = $derived(serializeGrid(grid));

  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let feedbackTimer;
  /** @param {string} message */
  function flash(message) {
    feedback = message;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => (feedback = ""), 4000);
  }
  onDestroy(() => clearTimeout(feedbackTimer));

  /** @param {{ grid: number[][], ballRow: number, ballCol: number }} board */
  function setBoard(board) {
    grid = board.grid;
    ballRow = board.ballRow;
    ballCol = board.ballCol;
  }

  /** @param {() => void} fn */
  function withUndo(fn) {
    const before = serializeGrid(grid);
    fn();
    if (serializeGrid(grid) !== before) {
      undoStack.push(before);
      if (undoStack.length > 100) undoStack.shift();
    }
  }

  function undo() {
    const prev = undoStack.pop();
    if (prev !== undefined) setBoard(applyGridString(prev));
  }

  /**
   * @param {number} row
   * @param {number} col
   */
  function handleCell(row, col) {
    withUndo(() => {
      const ball = applyClick(grid, ballRow, ballCol, mode, row, col);
      ballRow = ball.ballRow;
      ballCol = ball.ballCol;
    });
  }

  /**
   * @param {string} str
   * @param {string} [sourceName]
   */
  function loadString(str, sourceName) {
    const cells = parseGridString(str);
    if (cells.length === 0) {
      flash("Couldn't read that setup string.");
      return;
    }
    withUndo(() => setBoard(applyGridString(str)));
    if (sourceName) flash(`Loaded ${sourceName}.`);
  }

  function handleLoad() {
    // Accept either a raw setup string or a pasted share link.
    let str = shareText.trim();
    if (parseGridString(str).length === 0) {
      const match = str.match(/[?&]g=([^&\s]*)/);
      if (match) {
        try {
          str = decodeURIComponent(match[1]);
        } catch {
          // truncated %-escape; fall through to loadString's error flash
        }
      }
    }
    loadString(str, "setup");
  }

  /**
   * @param {string} text
   * @param {string} successMessage
   */
  async function copyToClipboard(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      flash(successMessage);
    } catch {
      if (shareText.trim() === "") {
        shareText = text;
        flash("Couldn't access the clipboard — copy the text from the box below.");
      } else {
        flash("Couldn't access the clipboard.");
      }
    }
  }

  function shareLink() {
    const url = `${window.location.origin}${window.location.pathname}?g=${encodeURIComponent(currentString)}`;
    copyToClipboard(url, "Share link copied!");
  }

  /**
   * @param {number} cell
   * @param {number} row
   * @param {number} col
   */
  function cellLabel(cell, row, col) {
    let what;
    if (cell === BALL) what = "disc";
    else if (cell === OFFENSE) what = "offense";
    else if (cell === DEFENSE) what = "defender";
    else what = cell > 0.66 ? "open" : cell > 0.25 ? "contested" : "shadowed";
    return `Row ${row + 1}, column ${col + 1}: ${what}`;
  }

  // Roving tabindex: the board is one Tab stop; arrow keys move within it.
  let focusRow = $state(initial.ballRow);
  let focusCol = $state(initial.ballCol);

  /** @param {KeyboardEvent} event */
  function onGridKeydown(event) {
    // Row 0 renders at the bottom, so visually "up" increases the row index.
    /** @type {Record<string, [number, number]>} */
    const moves = { ArrowUp: [1, 0], ArrowDown: [-1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    focusRow = Math.min(SIZE - 1, Math.max(0, focusRow + move[0]));
    focusCol = Math.min(SIZE - 1, Math.max(0, focusCol + move[1]));
    /** @type {HTMLButtonElement | null} */
    const target = document.querySelector(`button[data-cell="${focusRow}-${focusCol}"]`);
    target?.focus();
  }

  const modes = [
    { key: "B", label: "Disc" },
    { key: "O", label: "Offense" },
    { key: "D", label: "Defense" },
  ];
</script>

<svelte:head>
  <title>Ulti Grid</title>
  <meta
    name="description"
    content="Interactive ultimate frisbee defense visualizer: place the disc, offense, and defenders, and see which throwing lanes the defense takes away."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-3xl flex-col gap-4 px-3 py-6">
  <header class="text-center">
    <h1 class="text-2xl font-bold">Ulti Grid</h1>
    <p class="mx-auto mt-1 max-w-xl text-sm text-gray-600">
      Brighter squares are space the thrower can attack; defenders cast shadows over the throwing
      lanes behind them. Pick what to place, then click the field. Clicking a placed player removes
      it, and in Disc mode a click moves the disc there — replacing whatever it lands on. Undo
      reverses any step. Keyboard: Tab to the field, then arrow keys and Enter.
    </p>
    <ul class="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm" aria-label="Legend">
      <li><span class="swatch" style="background-color:#e02020"></span> disc</li>
      <li><span class="swatch" style="background-color:#ffc000"></span> o — offense</li>
      <li><span class="swatch" style="background-color:#081857"></span> x — defender</li>
      <li><span class="swatch" style="background-color:#fff; border-color:#767676"></span> open space</li>
    </ul>
  </header>

  <div class="mode-row" role="group" aria-label="What to place">
    {#each modes as m}
      <button
        class="control"
        class:active-disc={m.key === "B" && mode === "B"}
        class:active-offense={m.key === "O" && mode === "O"}
        class:active-defense={m.key === "D" && mode === "D"}
        aria-pressed={mode === m.key}
        onclick={() => (mode = m.key)}
      >
        {m.label}
      </button>
    {/each}
    <span class="mx-1 w-px self-stretch bg-gray-300" role="presentation"></span>
    <button class="control" onclick={undo} disabled={undoStack.length === 0}>Undo</button>
    <button class="control" onclick={() => withUndo(() => setBoard(clearGrid()))}>Clear</button>
  </div>

  <div
    class="grid-container mx-auto w-full max-w-[min(92vw,72vh)]"
    role="grid"
    aria-label="Field: 40 by 40 grid, row 1 at the bottom"
    tabindex="-1"
    onkeydown={onGridKeydown}
  >
    {#each grid as row, i}
      <div class="row" role="row">
        {#each row as cell, j}
          <button
            class="cell"
            class:ball={cell === BALL}
            class:offense={cell === OFFENSE}
            class:defense={cell === DEFENSE}
            style={cell >= 0 ? `background-color:rgba(255,255,255,${cell})` : ""}
            onclick={() => handleCell(i, j)}
            onfocus={() => {
              focusRow = i;
              focusCol = j;
            }}
            role="gridcell"
            data-cell="{i}-{j}"
            tabindex={i === focusRow && j === focusCol ? 0 : -1}
            aria-label={cellLabel(cell, i, j)}
          >
            {cell === OFFENSE ? "o" : cell === DEFENSE ? "x" : cell === BALL ? "●" : ""}
          </button>
        {/each}
      </div>
    {/each}
  </div>

  <div class="mode-row" role="group" aria-label="Preset setups">
    {#each Object.entries(PRESETS) as [name, str]}
      <button
        class="control"
        class:active-preset={currentString === str}
        onclick={() => loadString(str, name)}
      >
        {name}{currentString === str ? " ✓" : ""}
      </button>
    {/each}
  </div>

  <div class="mode-row" role="group" aria-label="Share and load setups">
    <button class="control" onclick={shareLink}>Share link</button>
    <button class="control" onclick={() => copyToClipboard(currentString, "Setup string copied!")}>
      Copy setup
    </button>
    <input
      type="text"
      class="min-w-0 flex-1 border-2 border-black px-2 py-1"
      placeholder="Paste a setup string or share link"
      aria-label="Setup string or share link"
      bind:value={shareText}
    />
    <button class="control" onclick={handleLoad}>Load</button>
  </div>

  <p class="min-h-5 text-center text-sm text-gray-700" role="status" aria-live="polite">
    {feedback}
  </p>
</div>

<style>
  .mode-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .control {
    background-color: white;
    color: black;
    cursor: pointer;
    border: 2px solid black;
    padding: 6px 10px 4px;
  }

  .control:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .active-disc {
    background-color: #e02020;
    color: white;
  }

  .active-offense {
    background-color: #ffc000;
  }

  .active-defense {
    background-color: #081857;
    color: white;
  }

  .active-preset {
    background-color: #166534;
    color: white;
  }

  .swatch {
    display: inline-block;
    width: 0.75rem;
    height: 0.75rem;
    border: 1px solid transparent;
    vertical-align: baseline;
  }

  .grid-container {
    display: flex;
    /* Row 0 renders at the bottom so coordinates read like field position. */
    flex-direction: column-reverse;
    border: 1px solid #ccc;
    padding: 4px;
    background-color: black;
    gap: 1px;
    aspect-ratio: 1 / 1;
  }

  .row {
    display: flex;
    gap: 1px;
    flex: 1;
  }

  .cell {
    flex: 1;
    border: none;
    padding: 0;
    background-color: transparent;
    font-size: 11px;
    line-height: 1;
    color: white;
    cursor: pointer;
    touch-action: manipulation;
  }

  .cell:focus-visible {
    outline: 2px solid #e02020;
    outline-offset: -1px;
  }

  .cell.ball {
    background-color: #e02020;
    opacity: 1;
  }

  .cell.offense {
    background-color: #ffc000;
    color: black;
  }

  .cell.defense {
    background-color: #081857;
  }

  @media (hover: hover) {
    .cell:hover {
      transform: scale(1.1);
      transition: transform 0.1s ease-in-out;
    }
  }
</style>
