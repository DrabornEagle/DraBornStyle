import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { supabase } from "../lib/supabase";
import { Row } from "../types";
export async function query<T = any>(
  resource: string,
  filters: Row = {},
): Promise<T> {
  const { data, error } = await supabase.rpc("db_style_query", {
    dkd_resource: resource,
    dkd_filters: filters,
  });
  if (error) throw new Error(error.message);
  return data as T;
}
const inflight = new Map<string, Promise<any>>();
export async function command<T = Row>(
  action: string,
  payload: Row = {},
): Promise<T> {
  const user = (await supabase.auth.getSession()).data.session?.user.id;
  if (!user) throw new Error("Bu işlem için giriş yapın.");
  const signature = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    JSON.stringify({ user, action, payload }),
  );
  if (inflight.has(signature)) return inflight.get(signature)!;
  const run = (async () => {
    const storageKey = "db_style_pending_" + signature;
    let key = await AsyncStorage.getItem(storageKey);
    if (!key) {
      key = Crypto.randomUUID();
      await AsyncStorage.setItem(storageKey, key);
    }
    const { data, error } = await supabase.rpc("db_style_command", {
      dkd_action: action,
      dkd_payload: payload,
      dkd_key: key,
    });
    if (error) {
      if (!/fetch|network|timeout|connection/i.test(error.message))
        await AsyncStorage.removeItem(storageKey);
      throw new Error(error.message);
    }
    await AsyncStorage.removeItem(storageKey);
    return data as T;
  })();
  inflight.set(signature, run);
  try {
    return await run;
  } finally {
    inflight.delete(signature);
  }
}
export async function slots(staff: string, service: string, date: string) {
  const { data, error } = await supabase.rpc("db_style_slots", {
    dkd_staff: staff,
    dkd_service: service,
    dkd_date: date,
  });
  if (error) throw new Error(error.message);
  return data as Row[];
}
export async function quote(
  business: string,
  staff: string,
  service: string,
  code: string,
  customer?: string,
) {
  const { data, error } = await supabase.rpc(
    customer ? "db_style_quote_customer" : "db_style_quote",
    {
      dkd_business: business,
      dkd_staff: staff,
      dkd_service: service,
      dkd_code: code || null,
      ...(customer ? { dkd_customer: customer } : {}),
    },
  );
  if (error) throw new Error(error.message);
  return data as Row;
}
