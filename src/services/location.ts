import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { command } from "./api";
import { supabase } from "../lib/supabase";
import { Row } from "../types";
const task = "db_style_background_location";
const supportsBackground = Platform.OS !== "web" && !isRunningInExpoGo();
let watcher: Location.LocationSubscription | null = null;
let expiry: ReturnType<typeof setTimeout> | null = null;
let generation = 0;
function distance(a: number, b: number, c: number, d: number) {
  const rad = (x: number) => (x * Math.PI) / 180;
  const x =
    Math.sin(rad(c - a) / 2) ** 2 +
    Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(rad(d - b) / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
async function send(
  appointment: Row,
  position: Location.LocationObject,
  consent = false,
) {
  const meters = distance(
    position.coords.latitude,
    position.coords.longitude,
    Number(appointment.latitude),
    Number(appointment.longitude),
  );
  const eta = Math.min(1440, Math.max(1, Math.ceil(meters / 500)));
  await command("location_update", {
    id: appointment.id,
    shared: true,
    grant_consent: consent,
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy_meters: position.coords.accuracy,
    eta_minutes: eta,
    arrival_state:
      meters < 80
        ? "arrived"
        : meters < 500
          ? "nearby"
          : Date.now() + eta * 60000 > new Date(appointment.starts_at).getTime()
            ? "late"
            : "on_way",
  });
}
if (supportsBackground)
  TaskManager.defineTask(task, async ({ data, error }) => {
    if (error) return;
    const json = await AsyncStorage.getItem("db_style_location_appointment");
    if (!json) return;
    const appointment = JSON.parse(json);
    if (Date.now() > new Date(appointment.ends_at).getTime()) {
      await stopSharing();
      return;
    }
    const positions = (data as any)?.locations as Location.LocationObject[];
    if (positions?.length)
      await send(appointment, positions[positions.length - 1]);
  });
export async function startSharing(
  appointment: Row,
  onError: (message: string) => void,
) {
  if (appointment.latitude == null || appointment.longitude == null)
    throw new Error(
      "İşletme harita konumunu henüz tanımlamadı. Randevunuz konum paylaşmadan devam eder.",
    );
  const p = await Location.requestForegroundPermissionsAsync();
  if (!p.granted)
    throw new Error(
      "Konum izni verilmedi. Randevunuz konum paylaşmadan devam eder.",
    );
  await stopSharing();
  const current = ++generation;
  await AsyncStorage.setItem(
    "db_style_location_appointment",
    JSON.stringify(appointment),
  );
  const first = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  if (current !== generation) return;
  await send(appointment, first, true);
  watcher = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 40,
      timeInterval: 20000,
    },
    (position) => {
      if (current === generation)
        send(appointment, position).catch((e) => onError(e.message));
    },
  );
  expiry = setTimeout(
    () => {
      stopSharing();
    },
    Math.max(1000, new Date(appointment.ends_at).getTime() - Date.now()),
  );
}
export async function enableBackgroundSharing() {
  if (Platform.OS === "web")
    throw new Error("Arka plan konumu Android development build gerektirir.");
  if (!supportsBackground)
    throw new Error(
      "Arka plan konumu Expo Go içinde çalışmaz. Development build gerekir.",
    );
  if (!(await AsyncStorage.getItem("db_style_location_appointment")))
    throw new Error("Önce randevunuz için konum paylaşımını başlatın.");
  const p = await Location.requestBackgroundPermissionsAsync();
  if (!p.granted) throw new Error("Arka plan konum izni verilmedi.");
  await Location.startLocationUpdatesAsync(task, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 30000,
    distanceInterval: 50,
    foregroundService: {
      notificationTitle: "DraBornStyle · Konum paylaşımı",
      notificationBody:
        "Randevunuz için tahmini varışınızı işletmeyle paylaşıyorsunuz.",
    },
  });
}
export async function flushLocationRevocation() {
  const user = (await supabase.auth.getSession()).data.session?.user.id;
  if (!user) return;
  const pending: Row[] = JSON.parse(
    (await AsyncStorage.getItem("db_style_location_revocations")) || "[]",
  );
  const remaining: Row[] = [];
  for (const entry of pending) {
    if (entry.user_id !== user) {
      remaining.push(entry);
      continue;
    }
    try {
      await command("location_update", { id: entry.id, shared: false });
    } catch (e) {
      if (/fetch|network|timeout|connection/i.test((e as Error).message))
        remaining.push(entry);
    }
  }
  await AsyncStorage.setItem(
    "db_style_location_revocations",
    JSON.stringify(remaining),
  );
  if (remaining.some((e) => e.user_id === user))
    throw new Error("Konum kapatma isteği bağlantı bekliyor.");
}
export async function stopSharing() {
  ++generation;
  watcher?.remove();
  watcher = null;
  if (expiry) clearTimeout(expiry);
  expiry = null;
  const json = await AsyncStorage.getItem("db_style_location_appointment");
  await AsyncStorage.removeItem("db_style_location_appointment");
  if (json) {
    const id = JSON.parse(json).id,
      user_id = (await supabase.auth.getSession()).data.session?.user.id;
    const pending: Row[] = JSON.parse(
      (await AsyncStorage.getItem("db_style_location_revocations")) || "[]",
    );
    if (user_id && !pending.some((p) => p.id === id))
      pending.push({ id, user_id });
    await AsyncStorage.setItem(
      "db_style_location_revocations",
      JSON.stringify(pending),
    );
    try {
      await flushLocationRevocation();
    } catch {
      /* The durable revocation retries when connectivity returns; server expiry remains enforced. */
    }
  }
  if (
    supportsBackground &&
    (await Location.hasStartedLocationUpdatesAsync(task))
  )
    await Location.stopLocationUpdatesAsync(task);
}
