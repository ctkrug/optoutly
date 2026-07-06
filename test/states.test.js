import { test } from "node:test";
import assert from "node:assert/strict";
import { ALL_US_STATES, resolveStateLaw } from "../public/js/lib/states.js";

test("ALL_US_STATES covers all 50 states plus DC", () => {
  assert.equal(ALL_US_STATES.length, 51);
  assert.ok(ALL_US_STATES.some((s) => s.code === "DC"));
});

test("ALL_US_STATES has no duplicate codes", () => {
  const codes = ALL_US_STATES.map((s) => s.code);
  assert.equal(new Set(codes).size, codes.length);
});

test("resolveStateLaw finds a matching state by code", () => {
  const states = [{ code: "CA", law: "CCPA" }];
  assert.deepEqual(resolveStateLaw(states, "CA"), { code: "CA", law: "CCPA" });
});

test("resolveStateLaw returns null for a state with no enacted law", () => {
  const states = [{ code: "CA", law: "CCPA" }];
  assert.equal(resolveStateLaw(states, "WY"), null);
});
