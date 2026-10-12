const fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "../dist-web");
const shots = path.resolve(__dirname, "../docs/screens");
// Entirely local fixtures. No real credentials or account sessions are used.
const login = { email: "tasarim@example.test", password: "fixture-only" };
const user = {
  id: "00000000-0000-4000-8000-000000000001",
  email: login.email,
  aud: "authenticated",
  role: "authenticated",
  user_metadata: { display_name: "Tasarım Kullanıcısı" },
  app_metadata: { provider: "email" },
  created_at: "2026-10-11T00:00:00Z",
};
const payload = Buffer.from(
  JSON.stringify({
    sub: user.id,
    role: "authenticated",
    exp: Math.floor(Date.now() / 1000) + 3600,
  }),
).toString("base64url");
const session = {
  access_token: "eyJhbGciOiJIUzI1NiJ9." + payload + ".local-fixture",
  refresh_token: "local-fixture",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user,
};
const bootstrap = {
  profile: {
    id: user.id,
    display_name: "Tasarım Kullanıcısı",
    avatar_url: null,
  },
  is_admin: true,
  memberships: [],
  demo_batches: [],
  settings: {},
};
(async () => {
  const passed = [],
    errors = [],
    blockedWrites = [];
  const server = http.createServer((req, res) => {
    const name = (req.url || "/").split("?")[0];
    const file = path.join(
      root,
      name === "/" ? "index.html" : decodeURIComponent(name),
    );
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(400);
      res.end();
      return;
    }
    fs.readFile(file, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.setHeader(
        "content-type",
        {
          ".html": "text/html",
          ".js": "application/javascript",
          ".css": "text/css",
          ".webp": "image/webp",
          ".ttf": "font/ttf",
          ".json": "application/json",
        }[path.extname(file)] || "application/octet-stream",
      );
      res.end(data);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.DB_STYLE_CHROMIUM || undefined,
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });
    const context = await browser.newContext({
      viewport: { width: 414, height: 896 },
      ignoreHTTPSErrors: true,
      reducedMotion: "reduce",
    });
    const localUrl = "http://127.0.0.1:" + server.address().port;
    await context.route("**/*", (route) => {
      const request = route.request(),
        url = request.url();
      if (url.startsWith(localUrl + "/")) return route.continue();
      let data;
      if (url.includes("/auth/v1/token")) data = session;
      else if (url.includes("/auth/v1/user")) data = user;
      else if (url.includes("/auth/v1/logout")) data = {};
      else if (url.includes("/rest/v1/rpc/db_style_query")) {
        const resource = request.postDataJSON().dkd_resource;
        if (resource === "bootstrap") data = bootstrap;
        else if (resource === "finance")
          data = {
            balances: [],
            periods: [],
            plans: [],
            rules: [],
            claims: [
              {
                id: "fixture-payment",
                business_name: "Örnek işletme",
                amount_cents: 2000,
                state: "pending",
                method: "cash",
                paid_at: "2026-10-11T12:00:00Z",
                receipt_path: null,
              },
            ],
          };
        else if (resource === "requests")
          data = { extra: [], waitlists: [], queue: [] };
        else if (resource === "stats" || resource === "business") data = null;
        else data = [];
      } else if (url.includes("/rest/v1/rpc/db_style_command")) {
        blockedWrites.push(request.postDataJSON().dkd_action);
        data = {};
      } else return route.abort();
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(data),
      });
    });
    const page = await context.newPage();
    await page.routeWebSocket("**/*", (ws) => ws.close());
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:" + server.address().port);
    const btn = (text) => page.getByRole("button", { name: text, exact: true });
    async function ready() {
      await page.evaluate(async () => {
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
        await document.fonts.ready;
        await Promise.all(
          [...document.images].map((i) => i.decode().catch(() => {})),
        );
      });
    }
    async function scroll(y) {
      await page.evaluate((y) => {
        const candidates = [...document.querySelectorAll("div")].filter(
          (el) =>
            /auto|scroll/.test(getComputedStyle(el).overflowY) &&
            el.scrollHeight > el.clientHeight,
        );
        for (const el of candidates) el.scrollTop = y;
      }, y);
    }
    async function fits(label) {
      if (
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        )
      )
        throw Error(label + ": body overflow");
      if (
        await page.getByText("Bu ekran açılamadı.", { exact: true }).isVisible()
      )
        throw Error(label + ": error boundary");
    }
    await btn("Giriş Yap").waitFor();
    if (await page.getByTestId("login-background").count())
      throw Error("Welcome has login backdrop");
    await ready();
    const welcomeLogin = await btn("Giriş Yap").boundingBox(),
      welcomeSignup = await btn("Hesap Oluştur").boundingBox();
    if (welcomeSignup.y - welcomeLogin.y - welcomeLogin.height > 9)
      throw Error("Welcome buttons too far apart");
    await page.screenshot({ path: path.join(shots, "v04-welcome.png") });
    await btn("Giriş Yap").click();
    await page.getByLabel("E-posta", { exact: true }).waitFor();
    await page.getByTestId("login-background").waitFor();
    await ready();
    for (const width of [320, 360, 414, 1120]) {
      await page.setViewportSize({ width, height: width > 600 ? 960 : 896 });
      await scroll(0);
      const control = page.getByLabel("Giriş veya hesap oluştur", {
        exact: true,
      });
      const left = await control
        .getByRole("button", { name: "Giriş", exact: true })
        .boundingBox();
      const right = await control
        .getByRole("button", { name: "Hesap Oluştur", exact: true })
        .boundingBox();
      if (
        Math.abs(left.width - right.width) > 1 ||
        Math.abs(left.y - right.y) > 1 ||
        right.x - left.x - left.width > 5
      )
        throw Error("Login selector spacing at " + width);
      const logo = await page
        .getByLabel("DraBornStyle", { exact: true })
        .boundingBox();
      if (logo.y < 40 || logo.y + logo.height >= left.y)
        throw Error("Logo clipped or overlaps form at " + width);
      await fits("Login " + width);
      await page.screenshot({
        path: path.join(shots, "v04-login-" + width + ".png"),
      });
      passed.push(
        "Login logo, adjacent equal tabs and no horizontal overflow at " +
          width +
          " px",
      );
    }
    await page.setViewportSize({ width: 414, height: 896 });
    await scroll(180);
    await page
      .getByLabel("Giriş veya hesap oluştur", { exact: true })
      .getByRole("button", { name: "Hesap Oluştur", exact: true })
      .click();
    await page.getByLabel("Adınız", { exact: true }).waitFor();
    if (await page.getByTestId("login-background").count())
      throw Error("Signup has login backdrop");
    const signupLogo = await page
      .getByLabel("DraBornStyle", { exact: true })
      .boundingBox();
    if (signupLogo.y < 40) throw Error("Signup did not reset scroll");
    await page.screenshot({ path: path.join(shots, "v04-signup.png") });
    await btn("Giriş").click();
    await page.getByLabel("E-posta", { exact: true }).fill("not-an-email");
    await btn("Giriş Yap").click();
    await page
      .getByText("Geçerli bir e-posta adresi yazın.", { exact: true })
      .waitFor();
    await page.getByLabel("E-posta", { exact: true }).fill(login.email);
    await page.getByLabel("Şifre", { exact: true }).fill(login.password);
    await btn("Giriş Yap").click();
    await page
      .getByText("Platform genel görünümü · İşin ritmini takip et.", {
        exact: true,
      })
      .waitFor({ timeout: 30000 });
    passed.push(
      "Mode switch resets scroll, signup name field works, validation and simulated login navigate correctly",
    );
    const dismiss = btn("Bildirimi kapat");
    if (await dismiss.isVisible()) await dismiss.click();
    await page.getByLabel("Profil ve roller", { exact: true }).click();
    await page.getByText("Profil ve ayarlar", { exact: true }).waitFor();
    if (
      (await page.getByTestId("login-background").count()) ||
      (await page.locator('img[src*="miami-calm"]').count())
    )
      throw Error("Profile has decorative background");
    for (const width of [320, 360, 414, 1120]) {
      await page.setViewportSize({ width, height: width > 600 ? 960 : 896 });
      await scroll(0);
      await ready();
      await fits("Profile " + width);
      const brand = await page
        .getByLabel("DraBornStyle", { exact: true })
        .boundingBox();
      const bell = await page
        .getByRole("button", { name: "Bildirimler", exact: true })
        .boundingBox();
      if (brand.x + brand.width > bell.x - 3)
        throw Error("Header brand overlaps notifications at " + width);
      await page.screenshot({
        path: path.join(shots, "v04-profile-" + width + ".png"),
      });
      for (const title of [
        "RANDEVULAR VE İŞLEMLER",
        "HESAP VE İZİNLER",
        "İŞLETME",
      ])
        if ((await page.getByText(title, { exact: true }).count()) !== 1)
          throw Error("Missing group " + title);
      passed.push(
        "Grouped profile, four work areas and no horizontal overflow at " +
          width +
          " px",
      );
    }
    await page.setViewportSize({ width: 414, height: 896 });
    await scroll(9999);
    await page.screenshot({ path: path.join(shots, "v04-profile-bottom.png") });
    for (const [button, target] of [
      ["Profilimi düzenle", "Profilim"],
      ["Şifremi güncelle", "Yeni başlangıç"],
      ["Randevularım", "Randevu akışı"],
      ["Boş saat ve ek süre", "Talepler ve müşteri sırası"],
      ["İşlem geçmişim", "İşlem geçmişi"],
      ["Davet ve indirim kodu", "Ustanın kodunu kullan"],
      ["Tercih izinlerim", "Akıllı müşteri defteri"],
      ["İşletmemi oluştur", "İşletmeni oluştur"],
    ]) {
      await btn(button).click();
      await page.getByText(target, { exact: true }).first().waitFor();
      await fits(button);
      await page.getByLabel("Profil ve roller", { exact: true }).click();
      await page.getByText("Profil ve ayarlar", { exact: true }).waitFor();
      passed.push("Profile navigation opens: " + button);
    }
    await btn("Bildirimleri etkinleştir").click();
    await page
      .getByText(
        "Uygulama içi bildirimler etkin. Android cihazda push izinlerini açabilirsiniz.",
        { exact: true },
      )
      .waitFor();
    await btn("Bildirimi kapat").click();
    passed.push(
      "Notification action gives the web fallback without a native module error",
    );
    await btn("Ödemeler").click();
    await page
      .getByText("Tahsilat ve borç yönetimi", { exact: true })
      .waitFor();
    await btn("Tahsilatı Onayla").waitFor();
    await fits("Pending payment card");
    await page.getByLabel("Profil ve roller", { exact: true }).click();
    await page.getByText("Profil ve ayarlar", { exact: true }).waitFor();
    passed.push(
      "Reported payment card renders with a pending claim fixture; no payment action invoked",
    );
    const controls = page.getByLabel("Çalışma alanı seçimi", { exact: true });
    await controls
      .getByRole("button", { name: "Müşteri", exact: true })
      .click();
    await page.getByLabel("Profil ve roller", { exact: true }).click();
    await page.getByText("Profil ve ayarlar", { exact: true }).waitFor();
    const selected = await page
      .getByLabel("Çalışma alanı seçimi", { exact: true })
      .getByRole("button", { name: "Müşteri", exact: true })
      .getAttribute("aria-pressed");
    if (selected !== "true") throw Error("Work area selection state failed");
    passed.push("Work area switches to customer and remains selected");
    await scroll(9999);
    await page
      .getByText("DraBornStyle v0.4.0 · Sürüm kodu 1", { exact: true })
      .waitFor();
    await btn("Çıkış Yap").click();
    await page.getByLabel("E-posta", { exact: true }).waitFor();
    await page
      .getByLabel("Giriş veya hesap oluştur", { exact: true })
      .waitFor();
    passed.push(
      "Logout returns to login and clears the simulated account session",
    );
    passed.push(
      "Restored salon backdrop is visible only on login; signup, welcome and profile stay plain",
    );

    const organic = await browser.newContext({
      viewport: { width: 414, height: 896 },
      reducedMotion: "reduce",
      permissions: ["geolocation"],
      geolocation: { latitude: 36.85, longitude: 30.74, accuracy: 10 },
    });
    const starts = new Date(
      Math.ceil((Date.now() + 30 * 60000) / 900000) * 900000,
    ).toISOString();
    const ends = new Date(Date.parse(starts) + 45 * 60000).toISOString();
    const staff = {
      id: "fixture-staff",
      name: "Örnek Usta",
      active: true,
      photo_url: null,
      specialties: "Saç kesimi",
    };
    const service = {
      id: "fixture-service",
      name: "Saç",
      active: true,
      price_cents: 35000,
      duration_minutes: 45,
    };
    const business = {
      id: "fixture-business",
      name: "Gerçek İşletme",
      city: "Antalya",
      address: "Örnek adres",
      latitude: 36.85,
      longitude: 30.74,
      active: true,
      published: true,
      cover_url: null,
      demo_batch_id: null,
      rating: 0,
      review_count: 0,
      min_price_cents: 35000,
      staff: [staff],
      services: [service],
      staff_services: [{ staff_id: staff.id, service_id: service.id }],
      branches: [],
      hours: [],
      reviews: [],
    };
    const appointment = {
      id: "fixture-appointment",
      business_id: business.id,
      staff_id: staff.id,
      service_id: service.id,
      customer_user_id: user.id,
      business_name: business.name,
      staff_name: staff.name,
      staff_photo: null,
      service_name: service.name,
      customer_name: "Tasarım Kullanıcısı",
      status: "booked",
      starts_at: starts,
      ends_at: ends,
      duration_minutes: 45,
      address: business.address,
      latitude: business.latitude,
      longitude: business.longitude,
      quoted_service_cents: 35000,
      quoted_fee_cents: 2000,
      location: null,
    };
    const organicCommands = [];
    await organic.route("**/*", (route) => {
      const request = route.request(),
        url = request.url();
      if (url.startsWith(localUrl + "/")) return route.continue();
      let data;
      if (url.includes("/auth/v1/token")) data = session;
      else if (url.includes("/auth/v1/user")) data = user;
      else if (url.includes("/rest/v1/rpc/db_style_query")) {
        const resource = request.postDataJSON().dkd_resource;
        data =
          resource === "bootstrap"
            ? { ...bootstrap, is_admin: false }
            : resource === "directory"
              ? [business]
              : resource === "business"
                ? business
                : resource === "appointments"
                  ? [appointment]
                  : [];
      } else if (url.includes("/rest/v1/rpc/db_style_slots")) {
        data = [
          {
            starts_at: starts,
            ends_at: ends,
            available: true,
            reason: "Müsait",
          },
        ];
      } else if (url.includes("/rest/v1/rpc/db_style_quote")) {
        data = {
          base_cents: 35000,
          discount_cents: 0,
          service_cents: 35000,
          fee_cents: 2000,
          total_cents: 37000,
        };
      } else if (url.includes("/rest/v1/rpc/db_style_command")) {
        const command = request.postDataJSON();
        organicCommands.push(command);
        data = { id: appointment.id };
        if (command.dkd_action === "location_update")
          appointment.location = { ...command.dkd_payload };
      } else return route.abort();
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(data),
      });
    });
    const customer = await organic.newPage();
    await customer.routeWebSocket("**/*", (ws) => ws.close());
    customer.on("pageerror", (e) => errors.push(e.message));
    await customer.goto(localUrl);
    const customerButton = (title) =>
      customer.getByRole("button", { name: title, exact: true });
    await customerButton("Giriş Yap").click();
    await customer.getByLabel("E-posta", { exact: true }).fill(login.email);
    await customer.getByLabel("Şifre", { exact: true }).fill(login.password);
    await customerButton("Giriş Yap").click();
    await customerButton("Hemen Randevu Al").first().waitFor();
    if (
      (await customer.getByText(/DEMO VERİLER ETKİN/).count()) ||
      (await customer.getByText("Demo Modunu Aç", { exact: true }).count())
    )
      throw Error("Normal account has Admin demo controls");
    await customerButton("Hemen Randevu Al").first().click();
    await customerButton("Randevu Al").click();
    await customer
      .getByRole("button", { name: / · Müsait$/ })
      .first()
      .click();
    await customerButton("Randevuyu Onayla").click();
    const consent = customer.getByTestId("location-consent");
    await consent.waitFor();
    if (organicCommands.some((c) => c.dkd_action === "location_update"))
      throw Error("Location shared without consent");
    await customer.evaluate(async () => {
      await Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation.playState === "running")
          .map((animation) => animation.finished.catch(() => {})),
      );
    });
    await customer.waitForFunction(() => {
      let element = document.querySelector('[data-testid="location-consent"]');
      if (!element) return false;
      while (element) {
        if (Number(getComputedStyle(element).opacity) < 0.99) return false;
        element = element.parentElement;
      }
      return true;
    });
    await customer.screenshot({
      path: path.join(shots, "v04-location-consent.png"),
    });
    await consent
      .getByRole("button", { name: "Daha Sonra", exact: true })
      .click();
    await consent.waitFor({ state: "hidden" });
    await customerButton("Konumumu Paylaşmayı Onaylıyorum").click();
    await consent.waitFor();
    await consent
      .getByRole("button", {
        name: "Konumumu Paylaşmayı Onaylıyorum",
        exact: true,
      })
      .click();
    await consent.waitFor({ state: "hidden" });
    const grant = organicCommands.find(
      (c) => c.dkd_action === "location_update" && c.dkd_payload.shared,
    );
    if (!grant?.dkd_payload.grant_consent)
      throw Error("Explicit location consent was not sent");
    await customerButton("Konum Paylaşımını Durdur").waitFor();
    passed.push(
      "Normal account sees organic directory and no Admin demo controls",
    );
    passed.push(
      "Booking automatically opens location consent; Later dismisses it and manual action reopens it",
    );
    passed.push(
      "Location is sent only after approval using simulated browser geolocation",
    );
    await organic.close();
    if (errors.length) throw Error(errors.join("; "));
    const report = {
      version: "0.4.0",
      versionCode: 1,
      date: new Date().toISOString(),
      passed,
      errors,
      blockedWrites,
      scope:
        "Local exported web UI with simulated account and API fixtures; all external HTTP and WebSocket requests intercepted. No live account access, no physical Android test.",
      liveLogin:
        "Not verified; automatic approval review rejected real-account access because task authorization was not established.",
    };
    fs.writeFileSync(
      path.resolve(__dirname, "../docs/ui-v04-results.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
    process.exit(process.exitCode || 0);
  }
})();
