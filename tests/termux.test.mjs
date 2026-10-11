import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";

test("Termux startup disables the desktop DevTools installer while retaining validation", async () => {
  const require = createRequire(import.meta.url);
  const pkg = JSON.parse(
    fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  );
  const command = pkg.scripts["start:termux"];
  const assignments = [...command.matchAll(/(EXPO_\w+)=(\S+)/g)];
  const previous = new Map(
    assignments.map(([, name]) => [name, process.env[name]]),
  );
  for (const [, name, value] of assignments) process.env[name] = value;
  const Module = require("node:module"),
    originalLoad = Module._load;
  let options;
  const { EventEmitter } = require("node:events");
  const endpoint = new EventEmitter();
  endpoint.clients = new Set();
  Module._load = function (name, ...args) {
    if (name === "@react-native/dev-middleware")
      return {
        createDevMiddleware(value) {
          options = value;
          return {
            middleware() {},
            websocketEndpoints: { "/inspector/debug": endpoint },
          };
        },
      };
    return originalLoad.call(this, name, ...args);
  };
  try {
    const cliRoot = require
      .resolve("@expo/cli/package.json")
      .replace(/package\.json$/, "");
    const { createDebugMiddleware } = require(
      `${cliRoot}build/src/start/server/metro/debugging/createDebugMiddleware.js`,
    );
    const { env } = require(`${cliRoot}build/src/utils/env.js`);
    createDebugMiddleware({
      serverBaseUrl: "http://localhost:8081",
      reporter: { update() {} },
    });
    assert.equal(
      options.unstable_experiments.enableStandaloneFuseboxShell,
      false,
    );
    assert.equal(env.EXPO_NO_DEPENDENCY_VALIDATION, false);
    assert.equal(env.EXPO_NO_NEW_ARCH_COMPAT_CHECK, false);
    assert.match(command, /--go --localhost --port 8081 --clear/);
    assert.match(command, /node --dns-result-order=ipv4first/);
    assert.doesNotMatch(command, /--no-dev|--minify/);
  } finally {
    Module._load = originalLoad;
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
