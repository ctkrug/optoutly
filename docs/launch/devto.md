---
title: "Building Stampout: a data-broker opt-out tracker with no backend"
published: false
tags: javascript, webdev, privacy, testing
---

A while back I went down the rabbit hole of removing myself from data brokers: Spokeo,
Whitepages, BeenVerified, and about forty others that scrape public records and sell a profile of
you. Two things made it miserable. Every broker has its own opt-out form, and several of them put
you back on the list a few months later once they pull fresh data. It is not a one-time chore, it
is a recurring one, and there is nothing to tell you when to go back.

The paid services (DeleteMe, Incogni) file the opt-outs for you, but you have to give them the
exact personal data you are trying to protect, forever, for a monthly fee. I wanted the checklist
without the subscription. So I built [Stampout](https://apps.charliekrug.com/optoutly/): a static
page that tracks which brokers you have opted out of and schedules a recheck for the ones known to
re-list. Your progress lives in `localStorage`; nothing touches a server.

It is vanilla JavaScript ES modules, no framework and no bundler, with a static JSON dataset. Two
build decisions turned out to be more interesting than I expected.

## Date math you can actually trust

The recheck feature is entirely date arithmetic: given the day you confirmed an opt-out and how
fast a broker re-lists, when is the next check due, and is it overdue today? The trap is that
JavaScript's `Date` is too forgiving. `new Date("2026-02-30")` does not throw. It silently rolls
forward to March 2nd. If a corrupt or hand-edited value slips into storage, you get a plausible
wrong date instead of an error.

So the validity check round-trips the string:

```js
export function isValidISODate(iso) {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const date = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && toISODate(date) === iso;
}
```

If parsing then reformatting does not return the original string, the date was never real. I
pinned this and the overdue/due-soon boundaries with property-based tests: generate random valid
dates, assert the invariants hold for all of them, rather than hoping I picked the right three
examples by hand.

## Testing a DOM app with no browser in CI

I wanted real tests on the rendering, not just the pure logic, but I did not want to pull Chromium
into CI for a page this small. The render layer builds DOM nodes, so I run it against
[`linkedom`](https://github.com/WebReflection/linkedom), a lightweight DOM in pure JavaScript, and
assert on the output of each render function directly under `node:test`.

That covers rendering, but the boot path in `app.js` wires everything together, and here I hit a
wall: booting the full app under `node:test` with `linkedom` in the same process reliably ran the
runner out of memory. Rather than fight it, I moved the boot-and-confirm smoke test into a
separate script that the test spawns as a subprocess. The integration test asserts on the child's
exit code and output. The app boots in a clean process, the runner stays healthy, and I still get
end-to-end coverage of the wiring.

For final confidence I drove the built page in a real Chromium at widths from 320 to 1440 pixels,
which is how I caught a mobile bug: a `1fr` grid column whose automatic minimum refused to shrink,
laying two 299px cards side by side on a 390px phone and blowing past the viewport. The fix was
`minmax(0, 1fr)`, so the column is actually allowed to get narrow.

## Treating localStorage as hostile

The last thing I did was assume every stored value is garbage until proven otherwise. Corrupt
JSON, an array where an object should be, an entry missing its `status` field: each one degrades
to a sensible default instead of throwing and bricking the page on reload. It is a small amount of
defensive code that makes the difference between a tool you trust with your privacy tracking and
one that loses your progress the first time something goes sideways.

The code is on [GitHub](https://github.com/ctkrug/optoutly) and the live page is
[here](https://apps.charliekrug.com/optoutly/). If you have been meaning to get off the
data-broker sites, it is a decent place to start.
