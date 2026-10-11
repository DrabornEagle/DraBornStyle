import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Execute the actual service with the same missing native module reported by
// Expo Go. This checks both module evaluation (startup) and button handling.
const source = fs.readFileSync(
  new URL("../src/services/notifications.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
});

function runtime({
  platform = "android",
  environment = "storeClient",
  projectId,
  nativeAvailable = false,
  permissionGranted = true,
} = {}) {
  let nativeLoads = 0;
  const saved = new Map();
  const calls = [];
  const notifications = {
    AndroidImportance: { DEFAULT: 3 },
    setNotificationHandler: () => calls.push("handler"),
    setNotificationChannelAsync: async () => calls.push("channel"),
    requestPermissionsAsync: async () => ({ granted: permissionGranted }),
    getExpoPushTokenAsync: async () => ({ data: "ExponentPushToken[test]" }),
    scheduleNotificationAsync: async () => calls.push("local"),
  };
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      if (name === "react-native") return { Platform: { OS: platform } };
      if (name === "expo-constants")
        return {
          executionEnvironment: environment,
          expoConfig: { extra: { eas: { projectId } } },
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
      if (name === "expo-notifications") {
        nativeLoads++;
        if (!nativeAvailable)
          throw new Error(
            "Cannot find native module 'ExpoTopicSubscriptionModule'",
          );
        return notifications;
      }
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return { service: exports, loads: () => nativeLoads, saved, calls };
}

test("Android Expo Go starts and handles notifications with the native module absent", async () => {
  const app = runtime();
  assert.equal(app.loads(), 0);
  assert.match(await app.service.registerNotifications(), /Uygulama içi/);
  await app.service.unregisterNotifications();
  assert.equal(app.loads(), 0);
  assert.equal(app.calls.length, 0);
});

test("Web never loads the native notification package", async () => {
  const app = runtime({ platform: "web", environment: "standalone" });
  assert.match(await app.service.registerNotifications(), /Uygulama içi/);
  assert.equal(app.loads(), 0);
});

test("Development build without EAS config fails clearly before any native load", async () => {
  const app = runtime({ environment: "bare" });
  await assert.rejects(
    app.service.registerNotifications(),
    /EAS proje kimliği/,
  );
  assert.equal(app.loads(), 0);
});

test("A missing native module in a configured build is handled without registering a token", async () => {
  const app = runtime({ environment: "bare", projectId: "test-project" });
  await assert.rejects(
    app.service.registerNotifications(),
    /Cihaz bildirimleri/,
  );
  assert.equal(app.loads(), 1);
  assert.equal(app.saved.size, 0);
  assert.equal(app.calls.length, 0);
});

test("Configured development build registers and removes its own push token", async () => {
  const app = runtime({
    environment: "bare",
    projectId: "test-project",
    nativeAvailable: true,
  });
  assert.match(await app.service.registerNotifications(), /etkinleştirildi/);
  assert.equal(app.loads(), 1);
  assert.equal(
    app.saved.get("db_style_push_device"),
    "ExponentPushToken[test]",
  );
  assert.equal(
    app.calls.find((c) => c.action === "push_token").payload.token,
    "ExponentPushToken[test]",
  );
  await app.service.unregisterNotifications();
  assert.equal(app.saved.size, 0);
  assert.equal(
    app.calls.find((c) => c.action === "push_token_remove").payload.token,
    "ExponentPushToken[test]",
  );
});
