# Optoutly — design direction

## 1. Aesthetic direction

**Optoutly is a paper-and-ink case file.** Each data broker is a folder in a dossier: cream
paper, typed labels, a rubber-stamp motif for confirming an opt-out. It leans into the idea
that you're building a personal case against the companies reselling your data — official,
slightly bureaucratic, satisfying to stamp closed. This avoids the generic dark-mode-SaaS look
and gives the "confirmed" action a physical, memorable moment (the stamp).

## 2. Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#f4f1e8` | page background — aged paper |
| `--surface-1` | `#ece7d8` | folder-tab / section background |
| `--surface-2` | `#fffdf7` | card background — bright paper |
| `--text` | `#2b2622` | body/ink text |
| `--text-muted` | `#6b6255` | secondary text, metadata |
| `--accent` | `#8a1f11` | stamp red — overdue, danger, the signature stamp |
| `--accent-support` | `#1f4d3d` | seal green — confirmed, success, links |
| `--success` | `#1f4d3d` | same as support accent |
| `--danger` | `#8a1f11` | same as accent |
| `--radius` | `3px` | sharp corners, paper edges, not rounded-app corners |
| `--shadow` | `0 1px 2px rgba(43,38,34,.12), 0 4px 10px rgba(43,38,34,.10)` | stacked-paper depth |
| spacing unit | `8px` scale (8/16/24/32/48/64) | all layout spacing |

**Type pairing**
- Display / stamps / wordmark: **Courier Prime** (monospace, typewriter) — `system-ui, monospace`
  fallback.
- Body / UI: **Lora** (serif, editorial, readable at small sizes) — `Georgia, serif` fallback.
- Type scale: 1.25 ratio — 13 / 16 / 20 / 25 / 31 / 39px.

**Motion**
- UI transitions: 160ms ease-out (folder-tab switch, hover states).
- The confirm "stamp": 90ms punch-down (scale 1.15 → 1, slight rotation) then a 60ms settle —
  reads as a rubber stamp hitting paper.

## 3. Layout intent

The hero is **the checklist itself** — a dossier of broker "case cards," each a paper card with
a typed name, category tab, opt-out link, status stamp, and recheck-due line.

- **Desktop (1440×900):** a left rail of folder-tab category filters (people-search,
  background-check, marketing, credit-marketing) plus a summary strip (confirmed / overdue
  counts), with the card grid filling the remaining ~70% of the viewport width. Cards flow in a
  responsive grid (3 columns), each with visible paper-stack shadow.
- **Phone (390×844):** folder tabs become a horizontally scrollable strip pinned under the
  header; cards stack single-column, full-width, each still reading as a distinct "folder."
- The state privacy-law reference lives in a secondary panel/section below the checklist, not
  competing with the primary hero.

## 4. Signature detail

The **stamp**: confirming a broker plays a rubber-stamp animation (an "OPTED OUT" stamp in
`--accent-support` ink slams onto the card at a slight rotation) and a soft synthesized "thump."
The wordmark "Optoutly" is set in Courier Prime with a faint red stamp-ring behind the "O",
as if it were itself stamped onto a folder tab.

## 5. Juice plan (lightweight — this is a toy-ish utility, not a game)

- **Action feedback:** clicking "Mark confirmed" triggers the stamp animation (90ms punch +
  60ms settle) and updates the recheck-due date live.
- **Impact feedback:** hovering a card lifts its shadow slightly (paper lifting off the stack);
  pressing a button visibly depresses it (1px translate + shadow reduction).
- **Sound:** WebAudio-synthesized "thump" (short low sine + noise burst) on stamp, and a soft
  "tick" on toggling a category tab. Both subtle, rate-throttled, behind a mute toggle that
  persists in `localStorage`. AudioContext is created lazily on first user gesture.
- Respect `prefers-reduced-motion`: skip the punch/rotation, keep the color/state change.

Every later build/QA pass follows this file. Changing it requires its own commit explaining why.
