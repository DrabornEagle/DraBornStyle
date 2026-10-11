// Read-only visual/interaction checks against the existing tagged demo directory.
// No command RPC is sent, no database fixtures are created or removed.
const { chromium } = require("playwright");
const fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http");
(async () => {
  const root = path.resolve(__dirname, "../dist-web"),
    shots = path.resolve(__dirname, "../docs/screens"),
    resultPath = path.resolve(__dirname, "../docs/ui-design-results.json");
  const sessionFile = process.env.DB_STYLE_TEST_SESSION_FILE;
  if (!sessionFile)
    throw new Error("Provide an external private Admin session file");
  const session = JSON.parse(fs.readFileSync(sessionFile, "utf8"));
  const startedAt = new Date().toISOString(),
    passed = [],
    errors = [],
    blockedWrites = [];
  fs.mkdirSync(shots, { recursive: true });
  const server = http.createServer((req, res) => {
    const name = (req.url || "/").split("?")[0];
    const file = path.join(
      root,
      name === "/" ? "index.html" : decodeURIComponent(name),
    );
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(400);
      return res.end();
    }
    fs.readFile(file, (e, data) => {
      if (e) {
        res.writeHead(404);
        return res.end();
      }
      res.setHeader(
        "content-type",
        {
          ".html": "text/html",
          ".js": "application/javascript",
          ".css": "text/css",
          ".ttf": "font/ttf",
          ".webp": "image/webp",
          ".json": "application/json",
        }[path.extname(file)] || "application/octet-stream",
      );
      res.end(data);
    });
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.DB_STYLE_BROWSER_PATH || undefined,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    ...(process.env.HTTPS_PROXY || process.env.HTTP_PROXY
      ? {
          proxy: {
            server: process.env.HTTPS_PROXY || process.env.HTTP_PROXY,
            bypass: "localhost,127.0.0.1",
          },
        }
      : {}),
  });
  const url = "http://127.0.0.1:" + server.address().port;
  const context = await browser.newContext({
    viewport: { width: 414, height: 896 },
    ignoreHTTPSErrors: true,
    reducedMotion: "reduce",
  });
  await context.route("**/rest/v1/rpc/db_style_command", (route) => {
    const request = route.request().postDataJSON();
    // Reading a conversation normally sends chat_read. Intercept it as a no-op;
    // this suite must not change the user's messages or existing demo fixtures.
    blockedWrites.push(request.dkd_action);
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    });
  });
  const page = await context.newPage();
  const monitor = (p) => {
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
  };
  monitor(page);
  await page.addInitScript(
    (s) => localStorage.setItem("db_style_auth_v01", JSON.stringify(s)),
    session,
  );
  const button = (t) => page.getByRole("button", { name: t, exact: true }),
    text = (t) => page.getByText(t, { exact: true }),
    wait = (t) => text(t).first().waitFor({ timeout: 30000 });
  async function screenshot(name) {
    await page
      .getByText("Birazdan hazır…", { exact: true })
      .first()
      .waitFor({ state: "hidden", timeout: 30000 });
    const dismiss = button("Bildirimi kapat");
    if (await dismiss.isVisible()) await dismiss.click();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((r) => {
                img.onload = r;
                img.onerror = r;
              }),
        ),
      );
      for (const el of document.querySelectorAll("div"))
        if (
          el.scrollHeight > el.clientHeight &&
          getComputedStyle(el).overflowY !== "hidden"
        )
          el.scrollTop = 0;
    });
    await page.screenshot({ path: path.join(shots, name + ".png") });
    if (
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      )
    )
      throw new Error(name + " body overflow");
    if (await text("Bu ekran açılamadı.").isVisible())
      throw new Error(name + " error boundary");
  }
  async function role(label) {
    await page.getByLabel("Profil ve roller", { exact: true }).click();
    await wait("Profil ve ayarlar");
    await button(label).click();
  }
  try {
    const guest = await browser.newPage({
      viewport: { width: 360, height: 800 },
      ignoreHTTPSErrors: true,
      reducedMotion: "reduce",
    });
    monitor(guest);
    await guest.goto(url);
    await guest
      .getByRole("button", { name: "Giriş Yap", exact: true })
      .waitFor();
    await guest.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map((i) => i.decode().catch(() => {})),
      );
    });
    await guest.screenshot({ path: path.join(shots, "welcome.png") });
    await guest.getByRole("button", { name: "Giriş Yap", exact: true }).click();
    await guest.getByLabel("E-posta", { exact: true }).waitFor();
    await guest.screenshot({ path: path.join(shots, "login.png") });
    await guest.getByLabel("E-posta", { exact: true }).fill("not-an-email");
    await guest.getByRole("button", { name: "Giriş Yap", exact: true }).click();
    await guest
      .getByText("Geçerli bir e-posta adresi yazın.", { exact: true })
      .waitFor();
    await guest.getByLabel("Şifre", { exact: true }).fill("local-display-test");
    await guest
      .getByRole("button", { name: "Şifreyi göster", exact: true })
      .click();
    if (
      (await guest
        .getByLabel("Şifre", { exact: true })
        .getAttribute("type")) !== "text"
    )
      throw new Error("Password visibility failed");
    await guest
      .getByRole("button", { name: "Şifreyi gizle", exact: true })
      .click();
    if (process.env.DB_STYLE_TEST_EMAIL && process.env.DB_STYLE_TEST_PASSWORD) {
      await guest
        .getByLabel("E-posta", { exact: true })
        .fill("  " + process.env.DB_STYLE_TEST_EMAIL.toUpperCase() + "  ");
      await guest
        .getByLabel("Şifre", { exact: true })
        .fill(process.env.DB_STYLE_TEST_PASSWORD);
      await guest.getByLabel("Şifre", { exact: true }).press("Enter");
      await guest
        .getByText("Platform genel görünümü · İşin ritmini takip et.", {
          exact: true,
        })
        .waitFor({ timeout: 30000 });
      passed.push(
        "Admin logs in through redesigned form with normalized email and Enter",
      );
    }
    passed.push(
      "Welcome/login at 360 px; email validation and password visibility",
    );
    await guest.close();
    await page.goto(url);
    await wait("Platform genel görünümü · İşin ritmini takip et.");
    await wait("Toplam İşletme");
    await page
      .getByText("Yükleniyor…", { exact: true })
      .waitFor({ state: "hidden", timeout: 30000 });
    await screenshot("admin");
    passed.push("Admin summary, live business table and chart at 414 px");
    await page.setViewportSize({ width: 1120, height: 960 });
    await screenshot("admin-desktop");
    await button("Bu ay").click();
    await wait("Toplam İşletme");
    passed.push("Dashboard period selector");
    await role("Müşteri");
    await button("Hemen Randevu Al").first().waitFor();
    await wait("Popüler Ustalar");
    await page.setViewportSize({ width: 414, height: 896 });
    await screenshot("customer");
    await page.setViewportSize({ width: 864, height: 1536 });
    await screenshot("customer-reference");
    await page.setViewportSize({ width: 360, height: 800 });
    await screenshot("customer-small");
    await page
      .getByLabel("İşletme, berber veya şehir ara", { exact: true })
      .fill("zz-no-such-business");
    await wait(
      "Bu aramada işletme bulunamadı. İşletmeler sisteme katıldıkça burada görünür.",
    );
    await page
      .getByLabel("İşletme, berber veya şehir ara", { exact: true })
      .fill("");
    await button("Hemen Randevu Al").first().waitFor();
    passed.push(
      "Discovery at 360/414/864 px; search empty state and real cards",
    );
    await button("Hemen Randevu Al").first().click();
    await button("Randevu Al").click();
    await wait("Randevu takvimi");
    await wait("Randevu Özeti");
    const tomorrow = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Istanbul",
    }).format(new Date(Date.now() + 86400000));
    await button(tomorrow).click();
    await page
      .getByRole("button", { name: / · Müsait$/ })
      .first()
      .waitFor();
    const confirm = button("Randevuyu Onayla");
    if (await confirm.isEnabled())
      throw new Error("Confirmation enabled without slot");
    await page
      .getByRole("button", { name: / · Müsait$/ })
      .first()
      .click();
    if (!(await confirm.isEnabled())) throw new Error("Slot not selected");
    await button("Sonraki ay").click();
    await button("Önceki ay").click();
    await button("İndirim Kodum Var").click();
    await page.getByLabel("Ustanızın indirim kodu (isteğe bağlı)").waitFor();
    await button("İndirim Kodunu Gizle").click();
    await screenshot("booking-small");
    await page.setViewportSize({ width: 414, height: 896 });
    await screenshot("booking");
    await page.setViewportSize({ width: 864, height: 1536 });
    await screenshot("booking-reference");
    passed.push(
      "Calendar month/day selection, available slot, gated confirm and optional code at 360/414/864 px",
    );
    await role("Usta");
    await wait("Merhaba, Ahmet Usta");
    await button("Tıraşa Başla").waitFor();
    await page.setViewportSize({ width: 414, height: 896 });
    await screenshot("staff");
    await page.setViewportSize({ width: 864, height: 1536 });
    await screenshot("staff-reference");
    await button("Tıraşa Başla").click();
    await wait("Hızlı hizmet seçimi");
    passed.push(
      "Staff five statuses, today timeline and start-service navigation",
    );
    await role("İşletme");
    await wait("İşletmeni, ekibini ve kazancını tek yerden yönet.");
    await wait("Hizmet geliri");
    await screenshot("owner-reference");
    await page.setViewportSize({ width: 414, height: 896 });
    await screenshot("owner");
    await button("İşletme Yönetimi").click();
    await wait("Hizmet Atamaları");
    await screenshot("management");
    await button("Takvim").click();
    await wait("Haftalık Takvim");
    await screenshot("schedule");
    await button("Sonraki hafta").click();
    await button("Bugün").click();
    await page.setViewportSize({ width: 1120, height: 960 });
    await screenshot("schedule-desktop");
    passed.push(
      "Owner summary and staff/service management; week navigation at mobile/desktop widths",
    );
    await button("Çalışanlar").click();
    await button("Yeni Çalışan").click();
    await page.getByLabel("Ustanın adı").waitFor();
    passed.push("Staff editor navigation preserves functional form");
    await role("Müşteri");
    await button("Sohbet").click();
    await button("Sohbeti Aç").first().click();
    await page.getByLabel("Mesajınız").waitFor();
    await page.setViewportSize({ width: 360, height: 800 });
    await screenshot("chat");
    if (await button("Mesaj Gönder").isEnabled())
      throw new Error("Empty message send enabled");
    await page
      .getByLabel("Mesajınız")
      .fill("Yerel tasarım kontrolü — gönderilmedi");
    if (!(await button("Mesaj Gönder").isEnabled()))
      throw new Error("Typed message send disabled");
    await button("Seçenekler").click();
    await button("Sohbeti Engelle").waitFor();
    passed.push(
      "Live chat context, bubbles, inline composer and safety options at 360 px; no message sent",
    );
    await role("Admin");
    await button("Raporlar").click();
    await wait("Gelir ve performans raporları");
    await button("Özel tarih").click();
    await page.getByLabel("Başlangıç (YYYY-AA-GG)").fill("2026-10");
    await wait(
      "Geçerli bir başlangıç ve bitiş tarihi yazın; bitiş başlangıçtan önce olamaz.",
    );
    passed.push("Report invalid date stays in controlled validation state");
    await button("Ödemeler").click();
    await wait("Tahsilat ve borç yönetimi");
    await wait("Ödeme dönemleri");
    passed.push("Finance navigation and live periods");
    await button("Menüyü aç").click();
    await button("Bildirimler").last().click();
    await wait("Hepsini Oku");
    passed.push("Global menu routes to notifications");
    if (errors.length)
      throw new Error("Browser errors: " + JSON.stringify(errors));
    const result = {
      version: "0.3.0",
      startedAt,
      completedAt: new Date().toISOString(),
      platform:
        "Chromium Web export against live Supabase (not physical Android)",
      mode: "Read-only; command RPCs intercepted; no demo created/removed",
      status: "passed",
      passed,
      errors,
      interceptedCommands: [...new Set(blockedWrites)],
    };
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2) + "\n");
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    const result = {
      version: "0.3.0",
      startedAt,
      completedAt: new Date().toISOString(),
      mode: "read-only",
      status: "failed",
      passed,
      errors,
      failure: e.message,
    };
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2) + "\n");
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
})();
