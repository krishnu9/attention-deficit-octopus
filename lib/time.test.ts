import assert from "node:assert/strict";
import test from "node:test";
import {
  addDays,
  currentMonday,
  localDateInZone,
  zonedMidnightToUtc,
} from "./time";

test("local date follows the user zone", () => {
  const instant = new Date("2026-11-08T20:00:00.000Z");
  assert.equal(localDateInZone(instant, "Asia/Kolkata"), "2026-11-09");
  assert.equal(localDateInZone(instant, "UTC"), "2026-11-08");
});

test("local midnight becomes the right UTC instant", () => {
  assert.equal(
    zonedMidnightToUtc("2026-11-09", "Asia/Kolkata").toISOString(),
    "2026-11-08T18:30:00.000Z",
  );
  assert.equal(
    zonedMidnightToUtc("2026-11-09", "UTC").toISOString(),
    "2026-11-09T00:00:00.000Z",
  );
});

test("current Monday uses the user zone", () => {
  const wednesday = new Date("2026-11-11T00:30:00.000Z");
  assert.equal(currentMonday("Asia/Kolkata", wednesday), "2026-11-09");
  assert.equal(currentMonday("UTC", wednesday), "2026-11-09");
});

test("addDays crosses month and year", () => {
  assert.equal(addDays("2026-11-09", 7), "2026-11-16");
  assert.equal(addDays("2026-12-28", 7), "2027-01-04");
});
