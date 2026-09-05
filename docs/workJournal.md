# Ulti Grid — Work Journal

Running log of build work: what was done, why, and where it landed.
Chronological — newest entry at the bottom. [README.md](../README.md) says what
the tool does and how the openness math works; this is the history of getting
it there.

The convention is in [CLAUDE.md](../CLAUDE.md) under "The work journal". In
short: every working session appends a dated entry, prose over bullets, why
over what, and history is never edited to be right — a later entry corrects an
earlier one and says so.

---

## 2026-09-05 — Journal opened, eight commits of history summarised rather than reconstructed (`chore/work-journal`)

The journal starts today, so this first entry is a **backfill**: written from
the commit log, not from memory. Detail below this line is trustworthy; detail
above it is not, and nothing here should be cited as though someone wrote it
down at the time. The commit log remains the record for anything before
2026-09-05.

**What this repo is.** A single-page teaching tool for ultimate frisbee
defense — a 40×40 field where you place the disc, offense and defenders, and
each open cell's brightness shows how available that space is to the thrower;
defenders cast shadows down the lanes behind them. SvelteKit 2 / Svelte 5 on
`adapter-static`, Tailwind 3, no server or CMS, deployed on Netlify.

**Two eras, and that is all.** Eight commits — five inside thirty-eight
minutes on 2024-12-28 and three inside sixteen seconds on 2026-08-02 — one
evening, then one session twenty months later.

December 2024 starts by copying the old Reddoor Prismic wireframer wholesale
(`dcb0e6a`'s README is still titled "Reddoor Wireframer and Site Scaffold")
and building the tool *inside* it: 374 lines of state and markup in
`src/routes/[[preview=preview]]/+page.svelte`, the starter's Prismic route,
with the four preset boards pasted in as string literals and a
`//TODO: export sharable links` at the top. The three commits after it —
`copy /load`, `size change`, `d` — are one line each.

August 2026 undoes that hosting decision and hardens the tool. `925e846`
lifts the math into `src/lib/grid.js` (259 lines, pure) behind a 280-line
vitest suite; `58dd75e` rewrites the page around it with a legend, undo, share
links and keyboard placement; `c6bb47c` deletes the starter — 110 files and
12,063 lines, taking Prismic, the custom types and the component library with
them.

**Two things the rewrite found that are worth keeping.** The Z Trap preset had
been silently corrupt since 2024: serializing a board captured *computed
brightnesses* as if they were markers, so 115 of its entries were negative
fractions like `-0.0555` rather than the `-1/-2/-3` the format allows (the
note in `presets.js` says 114; the off-by-one was not worth chasing). It
loaded without complaint and drew the wrong board. And `MAX_DISTANCE` in
`grid.js` carries a comment that earns its place: the falloff must stay clamped
or it evaluates `Math.pow(negative, 1.5)` and the grid fills with NaN.

**State as of this entry.** `chore/work-journal` off `main` at `c6bb47c`, tree
clean, nothing in flight. There is no CI — `npm test`, `npm run check` and
`npm run build` are run by hand.
