import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { command } from "./api";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
export async function registerNotifications() {
  if (Platform.OS === "web")
    return "Uygulama içi bildirimler etkin. Android cihazda push izinlerini açabilirsiniz.";
  await Notifications.setNotificationChannelAsync("db_style_default", {
    name: "DraBornStyle",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  const p = await Notifications.requestPermissionsAsync();
  if (!p.granted)
    throw new Error(
      "Bildirim izni verilmedi. Uygulama içi bildirimler çalışmaya devam eder.",
    );
  if (Constants.executionEnvironment === "storeClient") {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "DraBornStyle bildirimleri hazır",
        body: "Expo Go testinde uygulama içi ve yerel bildirimler kullanılabilir.",
      },
      trigger: null,
    });
    return "Yerel ve uygulama içi bildirimler etkin. Uzaktan push için development build gerekir.";
  }
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;
  if (!projectId)
    throw new Error(
      "Development build için EAS proje kimliği henüz yapılandırılmadı. Uygulama içi bildirimler etkin.",
    );
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
