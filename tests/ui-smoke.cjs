// Explicit live UI test; mutates only already-loaded demo data.
// Run after export:web with an external Admin test session and Playwright Chromium.
const { chromium } = require("playwright"),
  fs = require("fs"),
  path = require("path"),
  http = require("http"),
  crypto = require("crypto");
(async () => {
  const projectRoot = path.resolve(__dirname, "..");
  const root = path.join(projectRoot, "dist-web");
  const resultPath =
    process.env.DB_STYLE_UI_RESULT_FILE ||
    path.join(projectRoot, "docs/ui-test-results.json");
  const screenshotRoot = path.join(projectRoot, "docs/screens");
  fs.mkdirSync(screenshotRoot, { recursive: true });
  const sessionFile = process.env.DB_STYLE_TEST_SESSION_FILE;
  if (!sessionFile)
    throw new Error(
      "Set DB_STYLE_TEST_SESSION_FILE to an external private test session file. Never commit it.",
    );
  const session = JSON.parse(fs.readFileSync(sessionFile, "utf8"));
  const startedAt = new Date().toISOString();
  let createdDemoBatch = null;
  const server = http.createServer((req, res) => {
    const f = path.join(
      root,
      decodeURIComponent(
        (req.url || "/").split("?")[0] === "/"
          ? "/index.html"
          : (req.url || "/").split("?")[0],
      ),
    );
    fs.readFile(f, (e, d) => {
      if (e) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.setHeader(
        "Content-Type",
        {
          ".html": "text/html",
          ".js": "application/javascript",
          ".webp": "image/webp",
          ".ttf": "font/ttf",
          ".css": "text/css",
          ".json": "application/json",
        }[path.extname(f)] || "application/octet-stream",
      );
      res.end(d);
    });
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.DB_STYLE_BROWSER_PATH
      ? { executablePath: process.env.DB_STYLE_BROWSER_PATH }
      : {}),
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    ...(process.env.HTTPS_PROXY || process.env.HTTP_PROXY
      ? {
          proxy: {
            server: process.env.HTTPS_PROXY || process.env.HTTP_PROXY,
            bypass: "127.0.0.1,localhost",
          },
        }
      : {}),
  });
  const page = await browser.newPage({
      ignoreHTTPSErrors: true,
      viewport: { width: 414, height: 896 },
    }),
    errors = [],
    passed = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/ERR_INTERNET_DISCONNECTED/.test(m.text()))
      errors.push(m.text());
  });
  await page.addInitScript(
    (s) => localStorage.setItem("db_style_auth_v01", JSON.stringify(s)),
    session,
  );
  const button = (t) => page.getByRole("button", { name: t, exact: true });
  const text = (t) => page.getByText(t, { exact: true });
  const wait = (t) => text(t).first().waitFor({ timeout: 30000 });
  const screenshot = async (name) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const dismiss = button("Bildirimi kapat");
    if (await dismiss.isVisible()) await dismiss.click();
    await page.evaluate(() => {
      for (const el of document.querySelectorAll("div"))
        if (el.scrollHeight > el.clientHeight) el.scrollTop = 0;
    });
    await page.screenshot({ path: path.join(screenshotRoot, name + ".png") });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    );
    if (overflow) throw new Error(name + " horizontal overflow");
  };
  async function rpc(name, args) {
    const s = JSON.parse(
      await page.evaluate(() => localStorage.getItem("db_style_auth_v01")),
    );
    const r = await fetch(
      "https://xpdiwyxnnrmyvpcqwuyb.supabase.co/rest/v1/rpc/" + name,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          apikey: "sb_publishable_cu71JQGPiRusMw_YeZzUbg_6r9r13TG",
          authorization: "Bearer " + s.access_token,
        },
        body: JSON.stringify(args),
      },
    );
    const json = await r.json();
    if (!r.ok) throw new Error(json.message);
    return json;
  }
  try {
    const loginPage = await browser.newPage({
      ignoreHTTPSErrors: true,
      viewport: { width: 360, height: 800 },
    });
    loginPage.on("pageerror", (e) => errors.push(e.message));
    await loginPage.emulateMedia({ reducedMotion: "reduce" });
    await loginPage.goto("http://127.0.0.1:" + server.address().port, {
      waitUntil: "networkidle",
    });
    await loginPage
      .getByRole("button", { name: "Giriş Yap", exact: true })
      .waitFor();
    await loginPage.screenshot({
      path: path.join(screenshotRoot, "welcome.png"),
    });
    await loginPage
      .getByRole("button", { name: "Giriş Yap", exact: true })
      .click();
    await loginPage.getByLabel("E-posta", { exact: true }).waitFor();
    await loginPage.screenshot({
      path: path.join(screenshotRoot, "login.png"),
    });
    await loginPage
      .getByLabel("E-posta", { exact: true })
      .fill("invalid-email");
    await loginPage
      .getByRole("button", { name: "Giriş Yap", exact: true })
      .click();
    await loginPage
      .getByText("Geçerli bir e-posta adresi yazın.", { exact: true })
      .waitFor();
    passed.push("Login validates invalid email without submitting credentials");
    if (process.env.DB_STYLE_TEST_EMAIL && process.env.DB_STYLE_TEST_PASSWORD) {
      await loginPage
        .getByLabel("E-posta", { exact: true })
        .fill("  " + process.env.DB_STYLE_TEST_EMAIL.toUpperCase() + "  ");
      await loginPage
        .getByLabel("Şifre", { exact: true })
        .fill(process.env.DB_STYLE_TEST_PASSWORD);
      await loginPage
        .getByRole("button", { name: "Şifreyi göster", exact: true })
        .click();
      if (
        (await loginPage
          .getByLabel("Şifre", { exact: true })
          .getAttribute("type")) !== "text"
      )
        throw new Error("Password visibility control failed");
      await loginPage
        .getByRole("button", { name: "Şifreyi gizle", exact: true })
        .click();
      await loginPage.getByLabel("Şifre", { exact: true }).press("Enter");
      await loginPage
        .getByText("Platform genel görünümü · İşin ritmini takip et.", {
          exact: true,
        })
        .waitFor({ timeout: 30000 });
      passed.push(
        "Admin logs in through actual form and Enter with padded uppercase email",
      );
    }
    await loginPage.close();
    await page.goto("http://127.0.0.1:" + server.address().port, {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await wait("Platform genel görünümü · İşin ritmini takip et.");
    const initialBoot = await rpc("db_style_query", {
      dkd_resource: "bootstrap",
      dkd_filters: {},
    });
    const initialDirectory = await rpc("db_style_query", {
      dkd_resource: "directory",
      dkd_filters: {},
    });
    if (
      !initialBoot.is_admin ||
      initialDirectory.length ||
      initialBoot.demo_batches.length
    )
      throw new Error(
        "This mutating UI fixture test requires Admin and an empty directory with no existing demo. Use ui-design.cjs for read-only checks of existing data.",
      );
    if (!initialBoot.demo_batches.length) {
      await button("Demo Verileri Yükle").click();
      await button("Demo Verileri Kaldır").waitFor();
      const loaded = await rpc("db_style_query", {
        dkd_resource: "bootstrap",
        dkd_filters: {},
      });
      createdDemoBatch = loaded.demo_batches[0]?.id;
      passed.push("Admin demo load button creates tagged live fixtures");
    }
    await wait(
      "DEMO VERİLER ETKİN · Demo işlemler rapor toplamlarına dahildir.",
    );
    await text("3").first().waitFor({ timeout: 15000 });
    await screenshot("admin");
    passed.push("Admin dashboard renders live data");
    await button("Raporlar").first().click();
    await wait("Gelir ve performans raporları");
    await wait("Net hizmet geliri");
    await text("Özel tarih").click();
    await page.getByLabel("Başlangıç (YYYY-AA-GG)").fill("2026-10");
    await wait(
      "Geçerli bir başlangıç ve bitiş tarihi yazın; bitiş başlangıçtan önce olamaz.",
    );
    await text("Bu ay").click();
    passed.push("Invalid custom report date is handled without crash");
    await button("Ödemeler").click();
    await wait("Tahsilat ve borç yönetimi");
    await wait("Ödeme dönemleri");
    passed.push("Finance displays periods and claims");
    await page.getByLabel("Profil ve roller").click();
    await wait("Profil ve ayarlar");
    await text("Müşteri").click();
    await button("Hemen Randevu Al").first().waitFor();
    await wait("Ahmet Berber");
    await screenshot("customer");
    passed.push("Customer discovery role renders");
    await button("Hemen Randevu Al").first().click();
    await button("Randevu Al").click();
    await wait("Randevu takvimi");
    await wait("Randevu Özeti");
    await screenshot("booking");
    const tomorrow = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Istanbul",
    }).format(new Date(Date.now() + 24 * 60 * 60 * 1000));
    await page.getByRole("button", { name: tomorrow, exact: true }).click();
    await page
      .getByRole("button", { name: / · Müsait$/ })
      .first()
      .click();
    await button("Randevuyu Onayla").click();
    await wait("Randevu detayları");
    passed.push("Customer creates appointment through quote and slot UI");
    await button("İptal Et").click();
    await button("İptali Onayla").click();
    await wait("İptal edildi");
    passed.push("Customer cancels reservation through UI");
    await page.getByLabel("Profil ve roller").click();
    await text("Usta", { exact: true }).click();
    await wait("Bugün harika saçlar, mutlu müşteriler.");
    await wait("Merhaba, Ahmet Usta");
    await button("Tıraşa Başla").waitFor({ timeout: 15000 });
    await screenshot("staff");
    passed.push("Staff role quick work panel renders");
    await button("Tıraşa Başla").click();
    await wait("Hızlı hizmet seçimi");
    await button("Tıraşa Başla").click();
    await wait("Tıraş devam ediyor");
    await button("İşlemi Tamamla").click();
    await button("Fiyatı Kesinleştir ve İşlemi Tamamla").click();
    await wait("İşlem kaydı");
    passed.push("Walk-in starts and finishes through UI");
    await page.getByLabel("Profil ve roller").click();
    await text("İşletme", { exact: true }).click();
    await wait("İşletmeni, ekibini ve kazancını tek yerden yönet.");
    await wait("Hizmet geliri");
    await screenshot("owner");
    passed.push("Owner dashboard renders");
    await button("İşletme Yönetimi").click();
    await wait("İşletme Yönetimi");
    await wait("Hizmet Atamaları");
    await screenshot("management");
    await button("Takvim").click();
    await wait("Haftalık Takvim");
    await screenshot("schedule");
    await button("Sonraki hafta").click();
    await button("Bugün").click();
    await button("Çalışanlar").click();
    passed.push(
      "Owner staff tabs, assignment matrix and weekly schedule render real appointments",
    );
    await button("Yeni Çalışan").click();
    await page.getByLabel("Ustanın adı").fill("E2E Demo Usta");
    await button("Kaydet ve Devam Et").click();
    await wait("E2E Demo Usta");
    passed.push("Owner creates staff through validated form");
    await page.getByLabel("Profil ve roller").click();
    await text("Müşteri", { exact: true }).click();
    await button("Sohbet").click();
    await button("Sohbeti Aç").first().click();
    await page.getByLabel("Mesajınız").waitFor();
    const convs = await rpc("db_style_query", {
        dkd_resource: "conversations",
        dkd_filters: {},
      }),
      conversation = convs[0];
    const marker =
      "Gerçek zamanlı bağlantı testi " + crypto.randomUUID().slice(0, 8);
    await rpc("db_style_command", {
      dkd_action: "message_send",
      dkd_payload: { id: conversation.id, body: marker },
      dkd_key: crypto.randomUUID(),
    });
    await wait(marker);
    passed.push(
      "External live message arrives via Supabase Realtime without navigation",
    );
    const reconnectMarker =
      "Yeniden bağlantı testi " + crypto.randomUUID().slice(0, 8);
    await page.context().setOffline(true);
    await page.evaluate(() => {
      Object.defineProperty(navigator, "onLine", {
        value: false,
        configurable: true,
      });
      window.dispatchEvent(new Event("offline"));
      navigator.connection?.dispatchEvent(new Event("change"));
    });
    await wait(
      "İnternet bağlantısı yok. Randevu ve ödeme işlemleri için yeniden bağlanın.",
    );
    await page.getByLabel("Mesajınız").fill(reconnectMarker);
    await button("Mesaj Gönder").click();
    await wait("Bağlantı yok. İnternete bağlandıktan sonra yeniden deneyin.");
    await page.context().setOffline(false);
    await page.evaluate(() => {
      Object.defineProperty(navigator, "onLine", {
        value: true,
        configurable: true,
      });
      window.dispatchEvent(new Event("online"));
      navigator.connection?.dispatchEvent(new Event("change"));
    });
    await page
      .getByText(
        "İnternet bağlantısı yok. Randevu ve ödeme işlemleri için yeniden bağlanın.",
        { exact: true },
      )
      .waitFor({ state: "hidden", timeout: 30000 });
    await button("Mesaj Gönder").click();
    await page
      .locator("div[dir=auto]")
      .filter({ hasText: new RegExp("^" + reconnectMarker + "$") })
      .first()
      .waitFor({ timeout: 20000 });
    const sent = await rpc("db_style_query", {
      dkd_resource: "messages",
      dkd_filters: { id: conversation.id },
    });
    if (sent.messages.filter((m) => m.body === reconnectMarker).length !== 1)
      throw new Error("Reconnect did not produce exactly one message");
    passed.push("Offline mutation blocked; reconnect sends one message");
    await page.setViewportSize({ width: 360, height: 800 });
    await screenshot("chat");
    passed.push("360 and 414 px layouts have no body overflow");
    await page.getByLabel("Profil ve roller").click();
    await text("Admin").click();
    await button("Demo Verileri Kaldır").click();
    await button("Demo Verileri Yükle").waitFor();
    const cleanedDirectory = await rpc("db_style_query", {
      dkd_resource: "directory",
      dkd_filters: {},
    });
    const cleanedStats = await rpc("db_style_query", {
      dkd_resource: "stats",
      dkd_filters: {},
    });
    if (
      cleanedDirectory.length ||
      Number(cleanedStats.fee_cents) ||
      Number(cleanedStats.service_cents)
    )
      throw new Error(
        "Demo removal did not clear business and report fixtures",
      );
    passed.push(
      "Admin demo remove button clears fixtures and financial report data",
    );
    if (errors.length)
      throw new Error("Browser errors: " + JSON.stringify(errors));
    const result = {
      startedAt,
      completedAt: new Date().toISOString(),
      platform: "Chromium web export (not physical Android)",
      status: "passed",
      passed,
      errors,
    };
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2) + "\n");
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    const result = {
      startedAt,
      completedAt: new Date().toISOString(),
      platform: "Chromium web export (not physical Android)",
      status: "failed",
      passed,
      errors,
      failure: e.message,
    };
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2) + "\n");
    console.log(JSON.stringify(result, null, 2));
    throw e;
  } finally {
    if (createdDemoBatch) {
      try {
        const boot = await rpc("db_style_query", {
          dkd_resource: "bootstrap",
          dkd_filters: {},
        });
        if (boot.demo_batches.some((b) => b.id === createdDemoBatch)) {
          await rpc("db_style_command", {
            dkd_action: "demo_remove",
            dkd_payload: { id: createdDemoBatch },
            dkd_key: crypto.randomUUID(),
          });
        }
      } catch (cleanupError) {
        console.error(
          "Tagged UI fixture cleanup failed: " + cleanupError.message,
        );
        process.exitCode = 1;
      }
    }
    await browser.close();
    server.close();
  }
})();
