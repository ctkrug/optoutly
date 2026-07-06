import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addDays,
  daysBetween,
  nextCheckDate,
  getRecheckState,
  isStale
} from "../public/js/lib/scheduler.js";

test("addDays advances across month and year boundaries", () => {
  assert.equal(addDays("2026-01-31", 1), "2026-02-01");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});

test("daysBetween is positive for a later date and negative for an earlier one", () => {
  assert.equal(daysBetween("2026-01-01", "2026-01-10"), 9);
  assert.equal(daysBetween("2026-01-10", "2026-01-01"), -9);
});

test("nextCheckDate adds the recheck interval to the last-checked date", () => {
  assert.equal(nextCheckDate("2026-01-01", 180), "2026-06-30");
});

test("getRecheckState is not-started when never checked", () => {
  assert.equal(getRecheckState(null, 180, "2026-07-06"), "not-started");
});

test("getRecheckState is ok well before the recheck date", () => {
  assert.equal(getRecheckState("2026-07-01", 180, "2026-07-06"), "ok");
});

test("getRecheckState is due-soon within 14 days of the recheck date", () => {
  assert.equal(getRecheckState("2026-01-01", 180, "2026-06-25"), "due-soon");
});

test("getRecheckState is overdue once the recheck date has passed", () => {
  assert.equal(getRecheckState("2026-01-01", 180, "2026-07-06"), "overdue");
});

test("isStale is false exactly at the threshold", () => {
  assert.equal(isStale("2026-04-07", "2026-07-06", 90), false);
});

test("isStale is true once a dataset is older than the threshold", () => {
  assert.equal(isStale("2026-01-01", "2026-07-06", 90), true);
});

test("isStale defaults to a 90-day threshold", () => {
  assert.equal(isStale("2026-01-01", "2026-07-06"), true);
  assert.equal(isStale("2026-06-01", "2026-07-06"), false);
});
