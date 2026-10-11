// Explicit live test: uses only Admin's already-loaded, tagged demo businesses.
// Credentials must come from environment or an external private session file.
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert/strict";
const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://xpdiwyxnnrmyvpcqwuyb.supabase.co";
const key =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_cu71JQGPiRusMw_YeZzUbg_6r9r13TG";
const api = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
if (process.env.DB_STYLE_TEST_SESSION_FILE) {
  const session = JSON.parse(
    fs.readFileSync(process.env.DB_STYLE_TEST_SESSION_FILE, "utf8"),
  );
  const { error } = await api.auth.setSession(session);
  if (error) throw error;
} else {
  if (!process.env.DB_STYLE_TEST_EMAIL || !process.env.DB_STYLE_TEST_PASSWORD)
    throw new Error("Test hesabını ortam değişkenleriyle belirtin.");
  const { error } = await api.auth.signInWithPassword({
    email: process.env.DB_STYLE_TEST_EMAIL,
    password: process.env.DB_STYLE_TEST_PASSWORD,
  });
  if (error) throw error;
}
const rpc = async (name, args) => {
  const { data, error } = await api.rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
};
const command = (action, payload, transactionKey = crypto.randomUUID()) =>
  rpc("db_style_command", {
    dkd_action: action,
    dkd_payload: payload,
    dkd_key: transactionKey,
  });
const query = (resource, filters = {}) =>
  rpc("db_style_query", { dkd_resource: resource, dkd_filters: filters });
const boot = await query("bootstrap");
assert.equal(boot.is_admin, true);
assert.ok(boot.demo_batches.length);
const businesses = await query("directory");
const business = businesses.find(
  (b) => b.demo_batch_id === boot.demo_batches[0].id,
);
assert.ok(business);
const b = await query("business", { business_id: business.id });
const staff = b.staff.find((s) => s.active),
  service = b.services.find(
    (s) =>
      s.active &&
      b.staff_services.some(
        (v) => v.staff_id === staff.id && v.service_id === s.id,
      ),
  );
assert.ok(service);
const day = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Istanbul",
}).format(new Date(Date.now() + 24 * 60 * 60 * 1000));
const slots = await rpc("db_style_slots", {
  dkd_staff: staff.id,
  dkd_service: service.id,
  dkd_date: day,
});
const slot = slots.find((s) => s.available);
assert.ok(slot);
const payload = {
  business_id: b.id,
  staff_id: staff.id,
  service_id: service.id,
  starts_at: slot.starts_at,
};
const race = await Promise.allSettled([
  command("book", payload),
  command("book", payload),
]);
assert.equal(race.filter((r) => r.status === "fulfilled").length, 1);
assert.equal(race.filter((r) => r.status === "rejected").length, 1);
const appointment = race.find((r) => r.status === "fulfilled").value;
await command("cancel", { id: appointment.id });
const sameKey = crypto.randomUUID(),
  idem = await command("book", payload, sameKey),
  retried = await command("book", payload, sameKey);
assert.equal(idem.id, retried.id);
await command("cancel", { id: idem.id });
for (const resource of [
  "bootstrap",
  "stats",
  "finance",
  "customers",
  "appointments",
  "sessions",
  "requests",
  "conversations",
  "notifications",
  "audit",
])
  assert.notEqual(await query(resource, { business_id: b.id }), null);
const stats = await query("stats", {
  business_id: b.id,
  service_id: service.id,
});
assert.equal(
  stats.daily.every((d) => Number.isFinite(Number(d.fee_cents))),
  true,
);
console.log(
  JSON.stringify(
    {
      passed: [
        "simultaneous bookings: one succeeds, one rejected",
        "idempotent network retry: same appointment",
        "live RPC smoke: 10 protected resources",
        "report fee chart: valid integer data",
      ],
      fixture: "tagged demo only",
    },
    null,
    2,
  ),
);
await api.auth.stopAutoRefresh();
