import { test } from "node:test";
import assert from "node:assert/strict";
import {
  deriveBrokerView,
  deriveAllBrokerViews,
  summarize,
  filterByCategory,
  sortByRecheckUrgency
} from "../public/js/lib/brokers.js";

const SPOKEO = { id: "spokeo", name: "Spokeo", category: "people-search", recheckDays: 180 };
const RADARIS = { id: "radaris", name: "Radaris", category: "people-search", recheckDays: 120 };
const ACXIOM = { id: "acxiom", name: "Acxiom", category: "marketing", recheckDays: 365 };

test("deriveBrokerView defaults to not-started with no stored status", () => {
  const view = deriveBrokerView(SPOKEO, {}, "2026-07-06");
  assert.equal(view.status, "not-started");
  assert.equal(view.recheckState, "not-started");
});

test("deriveBrokerView computes recheckState only once confirmed", () => {
  const statuses = { spokeo: { status: "requested", lastChecked: null } };
  const view = deriveBrokerView(SPOKEO, statuses, "2026-07-06");
  assert.equal(view.status, "requested");
  assert.equal(view.recheckState, "not-started");
});

test("deriveBrokerView flags an overdue recheck for a confirmed broker", () => {
  const statuses = { spokeo: { status: "confirmed", lastChecked: "2026-01-01" } };
  const view = deriveBrokerView(SPOKEO, statuses, "2026-07-06");
  assert.equal(view.recheckState, "overdue");
});

test("deriveAllBrokerViews maps every broker in the dataset", () => {
  const views = deriveAllBrokerViews([SPOKEO, RADARIS], {}, "2026-07-06");
  assert.equal(views.length, 2);
  assert.deepEqual(views.map((v) => v.id), ["spokeo", "radaris"]);
});

test("summarize counts by status and overdue rechecks", () => {
  const statuses = {
    spokeo: { status: "confirmed", lastChecked: "2026-01-01" },
    radaris: { status: "requested", lastChecked: null }
  };
  const views = deriveAllBrokerViews([SPOKEO, RADARIS, ACXIOM], statuses, "2026-07-06");
  assert.deepEqual(summarize(views), {
    total: 3,
    confirmed: 1,
    requested: 1,
    notStarted: 1,
    overdue: 1
  });
});

test("filterByCategory narrows to the requested category", () => {
  const views = deriveAllBrokerViews([SPOKEO, RADARIS, ACXIOM], {}, "2026-07-06");
  const filtered = filterByCategory(views, "marketing");
  assert.deepEqual(filtered.map((v) => v.id), ["acxiom"]);
});

test("filterByCategory returns everything for 'all' or no category", () => {
  const views = deriveAllBrokerViews([SPOKEO, RADARIS], {}, "2026-07-06");
  assert.equal(filterByCategory(views, "all").length, 2);
  assert.equal(filterByCategory(views, undefined).length, 2);
});

test("sortByRecheckUrgency puts overdue before due-soon before ok before not-started", () => {
  const statuses = {
    spokeo: { status: "confirmed", lastChecked: "2026-01-01" }, // overdue (180d)
    radaris: { status: "confirmed", lastChecked: "2026-07-01" } // ok (120d)
  };
  const views = deriveAllBrokerViews([RADARIS, ACXIOM, SPOKEO], statuses, "2026-07-06");
  const sorted = sortByRecheckUrgency(views);
  assert.deepEqual(sorted.map((v) => v.id), ["spokeo", "radaris", "acxiom"]);
});
