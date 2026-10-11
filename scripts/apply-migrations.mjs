import fs from "node:fs/promises";
import path from "node:path";
const project = process.env.SUPABASE_PROJECT_REF || "xpdiwyxnnrmyvpcqwuyb";
if (project !== "xpdiwyxnnrmyvpcqwuyb")
  throw new Error(
    "Bu uygulama mevcut DraBorn-Park-Garage-Series projesine bağlıdır.",
  );
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) throw new Error("SUPABASE_ACCESS_TOKEN ortam değişkeni gerekli.");
const literal = (s) => "'" + s.replaceAll("'", "''") + "'";
async function query(sql, read_only = false) {
  const r = await fetch(
    `https://api.supabase.com/v1/projects/${project}/database/query`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ query: sql, read_only }),
    },
  );
  const body = await r.json();
  if (!r.ok) throw new Error(body.message || `Migration API: ${r.status}`);
  return body;
}
const existing = await query(
  "select version,name from supabase_migrations.schema_migrations where name like 'db_style_%'",
  true,
);
const versions = new Map(existing.map((m) => [m.version, m.name]));
const directory = new URL("../supabase/migrations/", import.meta.url);
for (const file of (await fs.readdir(directory)).sort()) {
  const match = file.match(/^(\d{14})_(db_style_[a-z_]+)\.sql$/);
  if (!match)
    throw new Error("Yalnızca db_style migration dosyaları desteklenir.");
  const [, version, name] = match;
  if (versions.has(version)) {
    if (versions.get(version) !== name)
      throw new Error("Migration sürümü başka bir işlemle çakışıyor.");
    console.log(`${name}: zaten uygulandı`);
    continue;
  }
  const sql = await fs.readFile(new URL(file, directory), "utf8");
  // Do not reset/reconcile the shared project's other migration histories.
  await query(
    `begin;select pg_advisory_xact_lock(hashtextextended('db_style_migrations',0));\n${sql}\ninsert into supabase_migrations.schema_migrations(version,name,statements) values(${literal(version)},${literal(name)},array[${literal(sql)}]);commit;`,
  );
  console.log(`${name}: uygulandı`);
}
