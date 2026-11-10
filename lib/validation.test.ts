import assert from "node:assert/strict";
import test from "node:test";
import { isDate, isOneOf, isUuid } from "./validation";

test("dates must be real calendar dates", () => {
  assert.equal(isDate("2026-11-09"), true);
  assert.equal(isDate("2026-02-30"), false);
  assert.equal(isDate("2026-13-01"), false);
  assert.equal(isDate("09-11-2026"), false);
  assert.equal(isDate(null), false);
});

test("enum and uuid checks", () => {
  assert.equal(isOneOf("someday", ["inbox", "someday"]), true);
  assert.equal(isOneOf("later", ["inbox", "someday"]), false);
  assert.equal(isUuid("2f1c1f6e-6a1a-4a3f-9c3d-9d0c6f0b2a11"), true);
  assert.equal(isUuid("nope"), false);
});
