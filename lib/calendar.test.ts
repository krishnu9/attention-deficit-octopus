import assert from "node:assert/strict";
import test from "node:test";
import { addMinutes } from "./calendar";

test("end time stays on the same day", () => {
  assert.deepEqual(addMinutes("2026-11-09", "09:00", 15), {
    date: "2026-11-09",
    time: "09:15",
  });
});

test("end time crosses midnight into the next day", () => {
  assert.deepEqual(addMinutes("2026-11-09", "23:50", 15), {
    date: "2026-11-10",
    time: "00:05",
  });
});
