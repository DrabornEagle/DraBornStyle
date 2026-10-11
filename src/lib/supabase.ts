import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Only a publishable client key. Authorization lives in db_style_admin_users + RLS.
export const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://xpdiwyxnnrmyvpcqwuyb.supabase.co";
export const publishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_cu71JQGPiRusMw_YeZzUbg_6r9r13TG";
const storage = {
  getItem: (key: string) =>
    Platform.OS === "web"
      ? AsyncStorage.getItem(key)
      : SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) => {
    if (Platform.OS === "web") await AsyncStorage.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === "web") await AsyncStorage.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  },
};
export const supabase = createClient(supabaseUrl, publishableKey, {
  auth: {
    storage,
    storageKey: "db_style_auth_v01",
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});
