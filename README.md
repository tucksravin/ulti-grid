# Ulti Grid

An interactive teaching tool for ultimate frisbee defense. Place the disc, offensive
players, and defenders on a grid field; every open square's brightness shows how
available that space is to the thrower. Defenders cast shadows over the throwing
lanes behind them, so you can see at a glance what a defensive setup takes away.

## Using the board

- Pick a mode — **Disc**, **Offense**, or **Defense** — then click the field to place.
- Clicking an existing piece removes it. The disc can be moved but never removed.
- **Undo** steps back through your edits; **Clear** resets to an empty field.
- **Presets** load example setups (Vert, Ho, Sag, Z Trap).
- **Share link** copies a URL that reproduces your board; **Copy setup** copies the
  raw setup string. Paste either into the input and hit **Load** to restore a board.

Setup strings are a list of `row,col,value;` entries where value is `-1` (disc),
`-2` (offense), or `-3` (defense). Anything else is ignored on load.

## How openness is computed

Each open cell starts at a brightness that decays with distance from the disc.
A Bresenham ray is traced from the cell to the disc; if it passes through a
defender, the cell is darkened, more strongly the closer the defender is to the
cell. A 3x3 smoothing pass softens the edges. All of this lives in
[`src/lib/grid.js`](src/lib/grid.js), which is pure and covered by tests.

## Development

```sh
npm install
npm run dev        # start the dev server
npm test           # run the vitest suite
npm run build      # static build (adapter-static) into build/
npm run check      # svelte-check
```

The site is fully static — no server or CMS. Deploys on Netlify via `netlify.toml`.
