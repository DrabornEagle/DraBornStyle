import * as Linking from "expo-linking";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { webAuthRedirect } from "../utils/authRedirect";

export function authRedirect(reset = false) {
  if (Platform.OS === "web" && typeof window !== "undefined")
    return webAuthRedirect(
      window.location.origin,
      Constants.expoConfig?.experiments?.baseUrl || "",
      reset,
    );
  return Linking.createURL(reset ? "reset" : "");
}
