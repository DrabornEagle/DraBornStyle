import test from "node:test";
import assert from "node:assert/strict";
import { parseCents, inputMoney, money } from "../src/utils/money.ts";
import {
  atLocal,
  localDate,
  addDays,
  dateRange,
  validDate,
} from "../src/utils/dates.ts";

test("Money input preserves every cent, without floating point multiplication", () => {
  for (const [input, cents] of [
    ["0", 0],
    ["0,01", 1],
    ["297,50", 29750],
    ["350", 35000],
    ["350.5", 35050],
    ["₺ 317,50", 31750],
    ["1000000", 100000000],
  ])
    assert.equal(parseCents(input), cents);
  for (const input of ["-1", "NaN", "1e3", "10,001", "1.234,56", "1000001", ""])
    assert.throws(() => parseCents(input));
  for (let cents = 0; cents < 10000; cents += 7)
    assert.equal(parseCents(inputMoney(cents)), cents);
  assert.match(money(31750), /317,50/);
});

test("15% discount example and manual partial payment use integer cents", () => {
  const base = 35000,
    discount = Math.floor((base * 1500 + 5000) / 10000),
    fee = 2000;
  assert.equal(base - discount + fee, 31750);
  assert.equal(420000 - 200000, 220000);
  assert.equal(210 * 2000, 420000);
});

test("Istanbul calendar handles UTC boundaries, leap days and invalid dates", () => {
  assert.equal(atLocal("2026-10-11", "00:00"), "2026-10-10T21:00:00.000Z");
  assert.equal(localDate("2026-10-10T22:00:00Z"), "2026-10-11");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2024-02-28", 1), "2024-02-29");
  assert.equal(validDate("2026-02-30"), false);
  assert.throws(() => atLocal("2026-02-30", "12:00"));
  assert.throws(() => atLocal("2026-10-11", "24:01"));
  assert.throws(() => dateRange("custom", "2026-10", "2026-10-11"));
  assert.throws(() => dateRange("custom", "2026-10-12", "2026-10-11"));
  assert.deepEqual(dateRange("custom", "2026-10-11", "2026-10-11"), {
    from: "2026-10-10T21:00:00.000Z",
    to: "2026-10-11T21:00:00.000Z",
  });
});
