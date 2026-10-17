import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = path.resolve(root, process.argv[2] || "dist-site");
if (output === root || root.startsWith(output + path.sep))
  throw new Error("Use a separate export directory");
const base = "/DraBornStyle";
execFileSync(
  process.execPath,
  [
    path.join(root, "node_modules/expo/bin/cli"),
    "export",
    "--platform",
    "web",
    "--output-dir",
    output,
  ],
  {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, DKD_WEB_BASE_URL: base },
  },
);
let html = fs.readFileSync(path.join(output, "index.html"), "utf8");
// Metro does not rewrite package CSS url(images/...) references yet.
const cssDir = path.join(output, "_expo/static/css");
for (const name of fs.existsSync(cssDir) ? fs.readdirSync(cssDir) : []) {
  if (!name.endsWith(".css")) continue;
  const filename = path.join(cssDir, name);
  const css = fs
    .readFileSync(filename, "utf8")
    .replace(/url\(["']?images\/([a-z0-9-]+\.png)["']?\)/g, (_, asset) => {
      const bytes = fs.readFileSync(
        path.join(root, "node_modules/leaflet/dist/images", asset),
      );
      return `url(data:image/png;base64,${bytes.toString("base64")})`;
    });
  fs.writeFileSync(filename, css);
}
if (!html.includes(`${base}/_expo/`))
  throw new Error("Export is missing its /DraBornStyle asset prefix");
html = html
  .replace(/<html[^>]*>/, '<html lang="tr">')
  .replace(
    /<title>.*?<\/title>/s,
    "<title>DraBornStyle | Berber ve Kuaför Yönetimi</title>",
  )
  .replace(
    /<meta name="viewport"[^>]*>/,
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
  )
  .replace(
    "</head>",
    `<meta name="theme-color" content="#050d19"><meta name="description" content="Berber ve kuaför randevularınız, sohbetleriniz ve işletmeniz Android ile aynı hesapta."><meta name="referrer" content="strict-origin-when-cross-origin"><link rel="canonical" href="https://www.draborneagle.com${base}/"><link rel="icon" type="image/webp" href="${base}/icon.webp"><link rel="manifest" href="${base}/manifest.webmanifest"><style>html,body,#root{background:#050d19;color-scheme:dark}body{overscroll-behavior-y:none}button,input,textarea{font:inherit}</style></head>`,
  );
fs.writeFileSync(path.join(output, "index.html"), html);
// Static recovery URLs work on Vercel AND Pages without rewriting missing
// scripts or another project's routes to this app's HTML.
fs.mkdirSync(path.join(output, "reset"), { recursive: true });
fs.writeFileSync(
  path.join(output, "reset/index.html"),
  html.replace(
    '<link rel="canonical"',
    '<meta name="robots" content="noindex"><link rel="canonical"',
  ),
);
fs.copyFileSync(
  path.join(root, "assets/art/neon-logo.webp"),
  path.join(output, "icon.webp"),
);
fs.writeFileSync(
  path.join(output, "manifest.webmanifest"),
  JSON.stringify(
    {
      id: base + "/",
      name: "DraBornStyle",
      short_name: "DraBornStyle",
      lang: "tr",
      start_url: base + "/",
      scope: base + "/",
      display: "standalone",
      background_color: "#050d19",
      theme_color: "#050d19",
      icons: [{ src: base + "/icon.webp", type: "image/webp", sizes: "any" }],
    },
    null,
    2,
  ) + "\n",
);
const commit = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: root,
  encoding: "utf8",
}).trim();
fs.writeFileSync(
  path.join(output, "DKD-SOURCE.json"),
  JSON.stringify(
    {
      repository: "DrabornEagle/DraBornStyle",
      commit,
      version: JSON.parse(fs.readFileSync(path.join(root, "package.json")))
        .version,
      basePath: base,
      backend: "xpdiwyxnnrmyvpcqwuyb",
      source:
        "Same Expo components, RPCs, Auth, Storage and Realtime as Android",
    },
    null,
    2,
  ) + "\n",
);
fs.copyFileSync(path.join(root, "docs/WEB.md"), path.join(output, "README.md"));
fs.writeFileSync(path.join(output, ".nojekyll"), "");
console.log(
  `DraBornStyle website exported to ${output}; Android source ${commit}`,
);
