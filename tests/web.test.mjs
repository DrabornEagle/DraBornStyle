import test from "node:test";
import assert from "node:assert/strict";
import { webAuthRedirect } from "../src/utils/authRedirect.ts";

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
