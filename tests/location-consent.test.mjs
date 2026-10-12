import test from "node:test";
import assert from "node:assert/strict";
import { locationEligibility } from "../src/utils/locationConsent.ts";

const now = Date.parse("2026-10-12T09:00:00Z");
const appointment = {
  status: "booked",
  starts_at: "2026-10-12T10:30:00Z",
  ends_at: "2026-10-12T11:15:00Z",
  latitude: 36.85,
  longitude: 30.74,
};
test("A new appointment can show consent immediately while future sharing stays gated", () => {
  assert.equal(locationEligibility(appointment, now).allowed, true);
  const tomorrow = locationEligibility(
    {
      ...appointment,
      starts_at: "2026-10-13T10:30:00Z",
      ends_at: "2026-10-13T11:15:00Z",
    },
    now,
  );
  assert.equal(tomorrow.allowed, false);
  assert.match(tomorrow.reason, /2 saat/);
});
test("Consent never enables ended, cancelled or unmapped appointments", () => {
  assert.equal(
    locationEligibility({ ...appointment, status: "cancelled" }, now).allowed,
    false,
  );
  assert.equal(
    locationEligibility(appointment, Date.parse("2026-10-12T12:00:00Z"))
      .allowed,
    false,
  );
  assert.equal(
    locationEligibility({ ...appointment, latitude: null }, now).allowed,
    false,
  );
  assert.equal(
    locationEligibility({ ...appointment, longitude: "invalid" }, now).allowed,
    false,
  );
});
test("Exact two-hour boundary and zero coordinates remain valid", () => {
  assert.equal(
    locationEligibility(
      {
        ...appointment,
        starts_at: "2026-10-12T11:00:00Z",
        latitude: 0,
        longitude: 0,
      },
      now,
    ).allowed,
    true,
  );
});
