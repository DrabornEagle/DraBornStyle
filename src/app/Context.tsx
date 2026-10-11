import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { AppState, Platform, Linking } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { query, command } from "../services/api";
import { flushLocationRevocation } from "../services/location";
import { Bootstrap, Route, Role, Row } from "../types";
type AppContextType = {
  session: Session | null;
  boot: Bootstrap | null;
  loading: boolean;
  role: Role;
  setRole: (r: Role) => void;
  businessId: string | null;
  setBusinessId: (s: string | null) => void;
  staffId: string | null;
  setStaffId: (s: string | null) => void;
  revision: number;
  refresh: () => void;
  reloadBoot: () => Promise<void>;
  route: Route;
  nav: (name: string, params?: Row) => void;
  back: () => void;
  online: boolean;
  toast: (message: string, error?: boolean) => void;
  message: { text: string; error: boolean } | null;
  busy: boolean;
  run: (action: string, payload?: Row, success?: string) => Promise<any>;
};
const Context = createContext<AppContextType>(null!);
export const useApp = () => useContext(Context);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null),
    [boot, setBoot] = useState<Bootstrap | null>(null),
    [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>("customer"),
    [businessId, setBusinessId] = useState<string | null>(null),
    [staffId, setStaffId] = useState<string | null>(null),
    [revision, setRevision] = useState(0);
  const [history, setHistory] = useState<Route[]>([{ name: "home" }]),
    [online, setOnline] = useState(true),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState<{ text: string; error: boolean } | null>(
      null,
    );
  const recoveryRequested = useRef(false);
  const pending = useRef(false),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useCallback((text: string, error = false) => {
    setMessage({ text, error });
  }, []);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 6000);
    return () => clearTimeout(t);
  }, [message]);
  const refresh = useCallback(() => setRevision((v) => v + 1), []);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "PASSWORD_RECOVERY") {
        recoveryRequested.current = true;
        setHistory([{ name: "passwordreset" }]);
      }
      if (event === "SIGNED_OUT") recoveryRequested.current = false;
      setSession(s);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    async function open(url: string | null | undefined) {
      if (!url || !/^(drabornstyle|exp|exps):\/\//.test(url)) return;
      try {
        const parsed = new URL(url),
          params = new URLSearchParams((parsed.hash || parsed.search).slice(1));
        if (
          params.get("type") === "recovery" ||
          parsed.pathname.includes("reset") ||
          parsed.hostname === "reset"
        )
          recoveryRequested.current = true;
        if (params.get("access_token") && params.get("refresh_token")) {
          const { error } = await supabase.auth.setSession({
            access_token: params.get("access_token")!,
            refresh_token: params.get("refresh_token")!,
          });
          if (error) throw error;
        } else if (params.get("code")) {
          const { error } = await supabase.auth.exchangeCodeForSession(
            params.get("code")!,
          );
          if (error) throw error;
        }
        if (recoveryRequested.current) setHistory([{ name: "passwordreset" }]);
      } catch (e) {
        toast((e as Error).message, true);
      }
    }
    Linking.getInitialURL().then(open);
    const sub = Linking.addEventListener("url", (e) => open(e.url));
    return () => sub.remove();
  }, [toast]);
  useEffect(() => {
    if (online && session)
      flushLocationRevocation().catch(() =>
        toast(
          "Konum paylaşımını kapatma isteği bağlantı geldiğinde yeniden denenecek.",
          true,
        ),
      );
  }, [online, session?.user.id]);
  useEffect(
    () =>
      NetInfo.addEventListener((s) =>
        setOnline(
          s.isConnected !== false &&
            (Platform.OS === "web" || s.isInternetReachable !== false),
        ),
      ),
    [],
  );
  const reloadBoot = useCallback(async () => {
    if (!session) {
      setBoot(null);
      return;
    }
    const b = await query<Bootstrap>("bootstrap");
    setBoot(b);
  }, [session?.user.id]);
  useEffect(() => {
    let live = true;
    if (!session) {
      setBoot(null);
      setRole("customer");
      return;
    }
    setLoading(true);
    (async () => {
      try {
        let b = await query<Bootstrap>("bootstrap");
        if (!b.profile) {
          await command("profile_save", {
            name:
              session.user.user_metadata?.display_name ||
              session.user.email?.split("@")[0] ||
              "Yeni Müşteri",
            preferred_role: "customer",
          });
          b = await query<Bootstrap>("bootstrap");
        }
        if (live) {
          setBoot(b);
          setRole(
            b.is_admin
              ? "admin"
              : b.memberships.some((m) => m.role !== "staff")
                ? "owner"
                : b.memberships.length
                  ? "staff"
                  : "customer",
          );
          setBusinessId(b.memberships[0]?.business_id || null);
          setStaffId(b.memberships.find((m) => m.staff_id)?.staff_id || null);
          setHistory([
            { name: recoveryRequested.current ? "passwordreset" : "home" },
          ]);
        }
      } catch (e) {
        toast((e as Error).message, true);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [session?.user.id]);
  const liveRoute = history[history.length - 1];
  const liveBusiness =
    role === "customer"
      ? liveRoute.params?.business_id ||
        (liveRoute.name === "business" ? liveRoute.params?.id : null)
      : businessId;
  useEffect(() => {
    if (!session) return;
    const change = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(refresh, 350);
    };
    let channel = supabase.channel("db_style_live_" + session.user.id);
    const userTables = ["db_style_notifications"];
    const businessTables = [
      "db_style_appointments",
      "db_style_service_sessions",
      "db_style_staff_status",
      "db_style_chat_messages",
      "db_style_extra_slot_requests",
      "db_style_waitlists",
      "db_style_walkin_queue",
      "db_style_appointment_locations",
      "db_style_payment_claims",
    ];
    userTables.forEach((table) => {
      channel = channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "db_style",
          table,
          filter: "user_id=eq." + session.user.id,
        },
        change,
      );
    });
    businessTables.forEach((table) => {
      if (
        role === "customer" &&
        table === "db_style_staff_status" &&
        !liveBusiness
      )
        return;
      if (role === "customer" && table === "db_style_payment_claims") return;
      const filter =
        role === "customer" && table === "db_style_appointments"
          ? "customer_user_id=eq." + session.user.id
          : role === "customer" &&
              [
                "db_style_waitlists",
                "db_style_extra_slot_requests",
                "db_style_appointment_locations",
              ].includes(table)
            ? "user_id=eq." + session.user.id
            : liveBusiness
              ? "business_id=eq." + liveBusiness
              : null;
      channel = channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "db_style",
          table,
          ...(filter ? { filter } : {}),
        },
        change,
      );
    });
    if (liveBusiness) {
      for (const table of [
        "db_style_businesses",
        "db_style_staff",
        "db_style_services",
        "db_style_staff_services",
        "db_style_working_hours",
      ])
        channel = channel.on(
          "postgres_changes",
          {
            event: "*",
            schema: "db_style",
            table,
            filter:
              (table === "db_style_businesses" ? "id" : "business_id") +
              "=eq." +
              liveBusiness,
          },
          change,
        );
    }
    channel.subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
        toast(
          "Canlı bağlantı yeniden kuruluyor. Ekranı tekrar açarak güncel kayıtları görebilirsiniz.",
          true,
        );
    });
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        supabase.auth.startAutoRefresh();
        refresh();
      } else if (Platform.OS !== "web") supabase.auth.stopAutoRefresh();
    });
    return () => {
      supabase.removeChannel(channel);
      sub.remove();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [session?.user.id, liveBusiness, role, refresh]);
  const nav = useCallback(
    (name: string, params?: Row) => setHistory((h) => [...h, { name, params }]),
    [],
  );
  const back = useCallback(
    () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h)),
    [],
  );
  const run = useCallback(
    async (
      action: string,
      payload: Row = {},
      success = "İşlem kaydedildi.",
    ) => {
      if (pending.current) return;
      if (!online) {
        toast(
          "Bağlantı yok. İnternete bağlandıktan sonra yeniden deneyin.",
          true,
        );
        return;
      }
      pending.current = true;
      setBusy(true);
      try {
        const result = await command(action, payload);
        refresh();
        if (
          [
            "demo_load",
            "demo_remove",
            "business_create",
            "profile_save",
          ].includes(action)
        )
          await reloadBoot();
        if (success) toast(success);
        return result;
      } catch (e) {
        toast((e as Error).message, true);
        return undefined;
      } finally {
        pending.current = false;
        setBusy(false);
      }
    },
    [online, refresh, reloadBoot, toast],
  );
  return (
    <Context.Provider
      value={{
        session,
        boot,
        loading,
        role,
        setRole: (r) => {
          setRole(r);
          setHistory([{ name: "home" }]);
        },
        businessId,
        setBusinessId,
        staffId,
        setStaffId,
        revision,
        refresh,
        reloadBoot,
        route: history[history.length - 1],
        nav,
        back,
        online,
        toast,
        message,
        busy,
        run,
      }}
    >
      {children}
    </Context.Provider>
  );
}
