# CLAUDE.md

Ulti Grid is a single-page teaching tool for ultimate frisbee defense: place
the disc, offense and defenders on a 40×40 field and every open cell's
brightness shows how open that space is to the thrower. SvelteKit 2 / Svelte 5
on `adapter-static`, Tailwind 3, npm (not pnpm), no server and no CMS — the
build is fully static and deploys on Netlify. [README.md](README.md) explains
the openness math and the setup-string format.

What an agent working here needs to know:

- **The math is `src/lib/grid.js`** — pure, no Svelte, covered by
  `tests/grid.test.js`. `src/routes/+page.svelte` is presentation and event
  handling. Anything computational belongs in the module, where the suite can
  reach it.
- `npm test` (vitest), `npm run check` (svelte-check), `npm run build`
  (static build into `build/`), `npm run dev`. There is no CI — nothing runs
  these but you.
- **`.svelte-kit/` and `.DS_Store` are tracked, despite being in
  `.gitignore`.** The ignore rules were added after the files were committed,
  and `.gitignore` does not untrack anything, so a `svelte-kit sync` — which
  `npm run check` and `npm run dev` both perform — can show up as generated
  files in `git status`. Do not sweep them into an unrelated commit.
- **A setup string is `row,col,value;` with value `-1`/`-2`/`-3`, and anything
  else is silently ignored on load.** That is what hid a corrupt Z Trap preset
  for twenty months — see the first journal entry.

## The work journal

**Every working session appends a dated entry to `docs/workJournal.md`** — what
was done and **why**, newest at the bottom, never corrected in place. Write it
as the last act of the session, not the first act of the next one.

The journal is the history of executing the build. Code says what the system
does now; the journal says what it used to do, what it cost to change, and
which beliefs turned out to be wrong. Nearly everything expensive to rediscover
lives there and nowhere else.

An entry is headed with the date, a short title, and where it landed:

```markdown
## 2026-09-04 — Both runway stages render their final frame without JS (#51, `ce46ae0`)
```

Then prose — not a bullet list of file names, which the diff already tells you.
What to put in, in rough order of value:

- **Why, over what.** The reason a thing was done survives; the diff does not
  need restating.
- **Measured numbers, exactly.** "The comp's open mask is 2696×2352 on an 860px
  band — 2.735× the band's height, so a 390×664 phone needs ~534%" is worth
  keeping. "Fixed the hero on mobile" is not.
- **Defects, named.** What broke, what it looked like, and what made it
  invisible until it wasn't.
- **What was tried and abandoned**, and what it would take to revive it. A dead
  end nobody wrote down gets walked twice.
- **Beliefs corrected on contact.** The design assumption that turned out false
  is usually the most valuable line in the entry.
- **Honest accounting.** If a win came from somewhere other than the change
  that claimed it, say so — that is exactly what someone will otherwise
  over-invest in next.

**History is never edited to be right.** An entry that stops being true is not
rewritten; a later entry corrects it, and says which one it corrects. The
journal is a record of what was believed at the time, and that record is most
useful precisely where it was wrong. Fixing the past in place destroys the only
evidence of how the mistake was made.

The one edit an old entry may take is a **forward pointer**: one line directly
under its heading naming the entry that overturned it — `> Superseded in part by
2026-10-14 — <that entry's title>.` It asserts nothing new and retracts nothing,
so the record of what was believed survives whole; it only stops a reader who
lands on the old paragraph from leaving with the old answer. Without it the rule
above is half a mechanism: the correction exists at the bottom of the file, and
nothing points to it from where a reader actually arrives.

If a session produced nothing worth an entry, that is itself worth one line.
