import test from "node:test";
import assert from "node:assert/strict";
import { isWebRecoveryUrl, webAuthRedirect } from "../src/utils/authRedirect.ts";
import {
  configureWebAuth,
  redirects,
} from "../scripts/dkd-configure-web-auth.mjs";

test("Recovery survives a consumed fragment and a callback page reload", () => {
  for (const value of [
    "https://www.draborneagle.com/DraBornStyle/reset/",
    "https://preview.example.test/DraBornStyle/reset",
    "http://localhost:8081/reset/?code=fixture",
    "https://www.draborneagle.com/DraBornStyle/#type=recovery",
  ])
    assert.equal(isWebRecoveryUrl(value), true, value);
  for (const value of [
    "https://www.draborneagle.com/DraBornStyle/",
    "https://www.draborneagle.com/DraBornStyle/#type=signup",
    "https://www.draborneagle.com/DraBornStyle/resetting/",
    "drabornstyle://reset",
    "invalid",
  ])
    assert.equal(isWebRecoveryUrl(value), false, value);
});

test("Auth URL deployment preserves other apps and native links, and is idempotent", async () => {
  let config = {
    site_url: "https://existing.example.test/",
    uri_allow_list:
      "drabornstyle://**,https://www.draborneagle.com/DraBornBuy/**",
  };
  const patches = [];
  const mock = async (url, options) => {
    assert.equal(
      url,
      "https://api.supabase.com/v1/projects/xpdiwyxnnrmyvpcqwuyb/config/auth",
    );
    if (options.method === "PATCH") {
      const patch = JSON.parse(options.body);
      assert.deepEqual(Object.keys(patch), ["uri_allow_list"]);
      patches.push(patch);
      config = { ...config, ...patch };
    }
    return { ok: true, json: async () => ({ ...config }) };
  };
  await configureWebAuth("fixture-token", mock);
  assert.equal(patches.length, 1);
  assert.deepEqual(config.uri_allow_list.split(","), [
    "drabornstyle://**",
    "https://www.draborneagle.com/DraBornBuy/**",
    ...redirects,
  ]);
  await configureWebAuth("fixture-token", mock);
  assert.equal(patches.length, 1);
  assert.equal(config.site_url, "https://existing.example.test/");
});

test("Auth config errors never expose tokens or server config contents", async () => {
  await assert.rejects(
    configureWebAuth("fixture-private-token", async () => ({
      ok: false,
      status: 403,
      json: async () => ({ secret: "private-provider-key" }),
    })),
    { message: "Auth URL configuration failed: HTTP 403" },
  );
});

test("Web auth links remain in this app's folder on custom, preview and local hosts", () => {
  for (const origin of [
    "https://www.draborneagle.com",
    "https://preview.vercel.app",
    "http://localhost:8081",
  ]) {
    assert.equal(
      webAuthRedirect(origin, "/DraBornStyle"),
      origin + "/DraBornStyle/",
    );
    assert.equal(
      webAuthRedirect(origin, "/DraBornStyle/", true),
      origin + "/DraBornStyle/reset/",
    );
    assert.equal(webAuthRedirect(origin, "", true), origin + "/reset/");
  }
});
