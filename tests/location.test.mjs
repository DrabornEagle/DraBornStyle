import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const { outputText } = ts.transpileModule(
  fs.readFileSync(
    new URL("../src/services/location.ts", import.meta.url),
    "utf8",
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  },
);

function runtime({
  platform = "android",
  expoGo = true,
  backgroundPermission = true,
} = {}) {
  const calls = [],
    saved = new Map(),
    tasks = new Map();
  const position = { coords: { latitude: 41, longitude: 29, accuracy: 10 } };
  const background = (name) => {
    calls.push(name);
    if (expoGo || platform === "web")
      throw new Error("Background location unavailable");
  };
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    setTimeout: () => 1,
    clearTimeout() {},
    require(name) {
      if (name === "react-native") return { Platform: { OS: platform } };
      if (name === "expo") return { isRunningInExpoGo: () => expoGo };
      if (name === "expo-task-manager")
        return {
          defineTask: (name, handler) => tasks.set(name, handler),
        };
      if (name === "expo-location")
        return {
          Accuracy: { Balanced: 3 },
          requestForegroundPermissionsAsync: async () => ({ granted: true }),
          getCurrentPositionAsync: async () => position,
          watchPositionAsync: async () => ({
            remove: () => calls.push("removeWatcher"),
          }),
          requestBackgroundPermissionsAsync: async () => {
            background("backgroundPermission");
            return { granted: backgroundPermission };
          },
          hasStartedLocationUpdatesAsync: async () => {
            background("hasStarted");
            return true;
          },
          startLocationUpdatesAsync: async () => background("startBackground"),
          stopLocationUpdatesAsync: async () => background("stopBackground"),
        };
      if (name === "@react-native-async-storage/async-storage")
        return {
          getItem: async (key) => saved.get(key) || null,
          setItem: async (key, value) => saved.set(key, value),
          removeItem: async (key) => saved.delete(key),
        };
      if (name === "./api")
        return {
          command: async (action, payload) => calls.push({ action, payload }),
        };
      if (name === "../lib/supabase")
        return {
          supabase: {
            auth: {
              getSession: async () => ({
                data: { session: { user: { id: "fixture" } } },
              }),
            },
          },
        };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return { service: exports, calls, saved, tasks };
}

const appointment = {
  id: "fixture-appointment",
  latitude: 41,
  longitude: 29,
  starts_at: "2099-10-11T12:00:00Z",
  ends_at: "2099-10-11T13:00:00Z",
};

test("Expo Go foreground sharing and logout never call unavailable background APIs", async () => {
  const app = runtime();
  assert.equal(app.tasks.size, 0);
  await app.service.startSharing(appointment, assert.fail);
  await assert.rejects(app.service.enableBackgroundSharing(), /Expo Go/);
  await app.service.stopSharing();
  assert.ok(app.calls.includes("removeWatcher"));
  assert.ok(app.calls.some((call) => call.payload?.shared === true));
  assert.ok(app.calls.some((call) => call.payload?.shared === false));
  assert.ok(!app.saved.has("db_style_location_appointment"));
  assert.ok(
    !app.calls.some((call) =>
      [
        "hasStarted",
        "stopBackground",
        "startBackground",
        "backgroundPermission",
      ].includes(call),
    ),
  );
});

test("Web startup and stop do not register or inspect native background tasks", async () => {
  const app = runtime({ platform: "web", expoGo: false });
  await app.service.stopSharing();
  await assert.rejects(
    app.service.enableBackgroundSharing(),
    /development build/,
  );
  assert.equal(app.tasks.size, 0);
  assert.equal(app.calls.length, 0);
});

test("Development builds register the background task synchronously and preserve start/stop", async () => {
  const app = runtime({ expoGo: false });
  assert.equal(app.tasks.size, 1);
  await app.service.startSharing(appointment, assert.fail);
  await app.service.enableBackgroundSharing();
  await app.service.stopSharing();
  assert.ok(app.calls.includes("startBackground"));
  assert.ok(app.calls.includes("stopBackground"));
});

test("Denied background permission does not start a background task", async () => {
  const app = runtime({ expoGo: false, backgroundPermission: false });
  app.saved.set("db_style_location_appointment", JSON.stringify(appointment));
  await assert.rejects(app.service.enableBackgroundSharing(), /izni verilmedi/);
  assert.ok(!app.calls.includes("startBackground"));
});
