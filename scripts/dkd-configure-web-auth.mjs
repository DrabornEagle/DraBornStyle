import path from "node:path";
import { pathToFileURL } from "node:url";

const project = "xpdiwyxnnrmyvpcqwuyb";
export const redirects = [
  "https://www.draborneagle.com/DraBornStyle/",
  "https://www.draborneagle.com/DraBornStyle/reset/",
];
const entries = (value) =>
  (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export async function configureWebAuth(token, fetcher = fetch) {
  if (!token)
    throw new Error("SUPABASE_ACCESS_TOKEN is required in deployment CI.");
  if (
    process.env.SUPABASE_PROJECT_REF &&
    process.env.SUPABASE_PROJECT_REF !== project
  )
    throw new Error(
      "DraBornStyle Auth deployment is restricted to its existing project.",
    );
  async function request(method = "GET", body) {
    const response = await fetcher(
      `https://api.supabase.com/v1/projects/${project}/config/auth`,
      {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
    );
    // Auth config can contain provider secrets. Never log its body or headers.
    if (!response.ok)
      throw new Error(`Auth URL configuration failed: HTTP ${response.status}`);
    return response.json();
  }
  const before = await request();
  if (
    before.uri_allow_list != null &&
    typeof before.uri_allow_list !== "string"
  )
    throw new Error("Unexpected Auth allow-list format; no settings changed.");
  const previous = entries(before.uri_allow_list);
  const merged = [...new Set([...previous, ...redirects])];
  if (redirects.some((url) => !previous.includes(url)))
    await request("PATCH", { uri_allow_list: merged.join(",") });
  const after = await request();
  const verified = entries(after.uri_allow_list);
  if (
    !merged.every((url) => verified.includes(url)) ||
    after.site_url !== before.site_url
  )
    throw new Error(
      "Auth redirect verification failed; existing project configuration must be preserved.",
    );
  return { project, status: "verified", redirects };
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
)
  configureWebAuth(process.env.SUPABASE_ACCESS_TOKEN)
    .then((result) => console.log(JSON.stringify(result)))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
