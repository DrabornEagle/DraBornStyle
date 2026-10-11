import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { command } from "./api";

// The SDK 58 notifications barrel imports ExpoTopicSubscriptionModule even
// when topic subscriptions are unused. Expo Go Android does not ship it.
// Keep this import lazy and never evaluate it in the Android Expo Go path.
let nativeNotifications:
  | Promise<typeof import("expo-notifications")>
  | undefined;
function loadNativeNotifications() {
  nativeNotifications ??= import("expo-notifications")
    .then((notifications) => {
      notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      return notifications;
    })
    .catch((cause: unknown) => {
      nativeNotifications = undefined;
      throw new Error(
        "Cihaz bildirimleri bu uygulama sürümünde kullanılamıyor. Uygulama içi bildirimler çalışmaya devam eder.",
        { cause },
      );
    });
  return nativeNotifications;
}

export async function registerNotifications() {
  if (Platform.OS === "web")
    return "Uygulama içi bildirimler etkin. Android cihazda push izinlerini açabilirsiniz.";
  const expoGo = Constants.executionEnvironment === "storeClient";
  if (Platform.OS === "android" && expoGo)
    return "Uygulama içi bildirimler etkin. Bu test sürümünde cihaz bildirimleri kullanılmıyor.";

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;
  if (!expoGo && !projectId)
    throw new Error(
      "Development build için EAS proje kimliği henüz yapılandırılmadı. Uygulama içi bildirimler etkin.",
    );
  const Notifications = await loadNativeNotifications();
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync("db_style_default", {
      name: "DraBornStyle",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  const p = await Notifications.requestPermissionsAsync();
  if (!p.granted)
    throw new Error(
      "Bildirim izni verilmedi. Uygulama içi bildirimler çalışmaya devam eder.",
    );
  if (expoGo) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "DraBornStyle bildirimleri hazır",
        body: "Expo Go testinde uygulama içi ve yerel bildirimler kullanılabilir.",
      },
      trigger: null,
    });
    return "Yerel ve uygulama içi bildirimler etkin. Uzaktan push için development build gerekir.";
  }
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  await command("push_token", { token: data });
  await AsyncStorage.setItem("db_style_push_device", data);
  return "Android push bildirimleri etkinleştirildi.";
}

export async function unregisterNotifications() {
  const token = await AsyncStorage.getItem("db_style_push_device");
  if (token) {
    await command("push_token_remove", { token });
    await AsyncStorage.removeItem("db_style_push_device");
  }
}
