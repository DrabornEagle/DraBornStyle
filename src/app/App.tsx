import React, { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StatusBar,
  ActivityIndicator,
  BackHandler,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppProvider, useApp } from "./Context";
import { useData } from "../hooks/useData";
import { colors } from "../theme";
import { Row } from "../types";
import { Txt, RowView } from "../components/ui";
import { BarberPole } from "../components/MiamiScene";
import { MotionProvider } from "../components/motion";
import { AuthScreen, ResetPasswordScreen } from "../screens/Auth";
import {
  DiscoverScreen,
  BusinessScreen,
  StaffProfileScreen,
  FavoritesScreen,
} from "../screens/Discover";
import { BookingScreen } from "../screens/Booking";
import {
  AppointmentsScreen,
  AppointmentScreen,
  RequestsScreen,
} from "../screens/Appointments";
import { ConversationsScreen, ChatScreen } from "../screens/Chat";
import { DashboardScreen } from "../screens/Dashboard";
import { StartScreen, SessionScreen } from "../screens/Work";
import { EditorScreen } from "../screens/Editor";
import { FinanceScreen, ReportsScreen } from "../screens/Finance";
import {
  ManagementScreen,
  CustomersScreen,
  CompletedScreen,
  AuditScreen,
  ServicesScreen,
} from "../screens/Management";
import { ProfileScreen, NotificationsScreen } from "../screens/Profile";
import "../services/location";
class Boundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    return this.state.error ? (
      <View style={{ padding: 28, gap: 18 }}>
        <Txt bold>Bu ekran açılamadı.</Txt>
        <Txt muted>{this.state.error}</Txt>
        <Pressable onPress={() => this.setState({ error: null })}>
          <Txt tone="pink">Yeniden dene</Txt>
        </Pressable>
      </View>
    ) : (
      this.props.children
    );
  }
}
function Shell() {
  const app = useApp();
  const notifications = useData<Row[]>("notifications", {}, !!app.session);
  const unread = notifications.data?.filter((n) => !n.read_at).length || 0;
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (app.route.name === "home") return false;
      app.back();
      return true;
    });
    return () => sub.remove();
  }, [app.route.name]);
  let Screen: React.ComponentType = DiscoverScreen;
  const name = app.route.name;
  const screens: Record<string, React.ComponentType> = {
    auth: AuthScreen,
    discover: DiscoverScreen,
    business: BusinessScreen,
    staffprofile: StaffProfileScreen,
    favorites: FavoritesScreen,
    booking: BookingScreen,
    appointments: AppointmentsScreen,
    appointment: AppointmentScreen,
    requests: RequestsScreen,
    conversations: ConversationsScreen,
    chat: ChatScreen,
    start: StartScreen,
    session: SessionScreen,
    editor: EditorScreen,
    finance: FinanceScreen,
    reports: ReportsScreen,
    management: ManagementScreen,
    services: ServicesScreen,
    customers: CustomersScreen,
    completed: CompletedScreen,
    audit: AuditScreen,
    profile: ProfileScreen,
    notifications: NotificationsScreen,
    passwordreset: ResetPasswordScreen,
  };
  if (name === "home")
    Screen = !app.session
      ? AuthScreen
      : app.role === "customer"
        ? DiscoverScreen
        : DashboardScreen;
  else Screen = screens[name] || DiscoverScreen;
  if (
    !app.session &&
    ![
      "home",
      "auth",
      "discover",
      "business",
      "staffprofile",
      "profile",
    ].includes(name)
  )
    Screen = AuthScreen;
  const tabs =
    app.role === "customer"
      ? [
          ["home", "Keşfet", "home-outline"],
          ["appointments", "Randevular", "calendar-outline"],
          ["conversations", "Sohbet", "chatbubbles-outline"],
          ["favorites", "Favoriler", "heart-outline"],
          ["profile", "Profil", "person-outline"],
        ]
      : app.role === "staff"
        ? [
            ["home", "Çalışma", "cut-outline"],
            ["appointments", "Randevular", "calendar-outline"],
            ["conversations", "Sohbet", "chatbubbles-outline"],
            ["reports", "Performans", "bar-chart-outline"],
            ["profile", "Profil", "person-outline"],
          ]
        : [
            [
              "home",
              app.role === "admin" ? "Platform" : "Kontrol",
              "grid-outline",
            ],
            ["management", "Yönetim", "storefront-outline"],
            [
              app.role === "admin" ? "reports" : "appointments",
              app.role === "admin" ? "Raporlar" : "Randevular",
              app.role === "admin" ? "bar-chart-outline" : "calendar-outline",
            ],
            ["finance", "Ödemeler", "card-outline"],
            ["profile", "Profil", "person-outline"],
          ];
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top", "bottom"]}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#252b47", colors.bg, "#15363b"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.frame}>
        <View style={styles.header}>
          <RowView>
            {name !== "home" && (
              <Pressable
                onPress={app.back}
                accessibilityLabel="Geri"
                accessibilityRole="button"
                style={styles.headerButton}
              >
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </Pressable>
            )}
            <BarberPole size={25} animated={false} />
            <View>
              <Text style={styles.wordmark}>
                DraBorn<Text style={{ color: colors.pink }}>Style</Text>
              </Text>
              <Txt size={8} tone="cyan" style={{ letterSpacing: 1.8 }}>
                BERBER · KUAFÖR · STİL
              </Txt>
            </View>
          </RowView>
          <RowView>
            {app.session && (
              <Pressable
                onPress={() => app.nav("notifications")}
                accessibilityLabel="Bildirimler"
                style={styles.headerButton}
                accessibilityRole="button"
              >
                <Ionicons
                  name="notifications-outline"
                  size={23}
                  color={colors.text}
                />
                {unread > 0 && (
                  <View style={styles.notification}>
                    <Text style={{ color: "#fff", fontSize: 9 }}>
                      {unread > 9 ? "9+" : unread}
                    </Text>
                  </View>
                )}
              </Pressable>
            )}
            <Pressable
              onPress={() => app.nav("profile")}
              accessibilityLabel="Profil ve roller"
              accessibilityRole="button"
              style={styles.headerButton}
            >
              <Ionicons
                name="person-circle-outline"
                size={23}
                color={colors.cyan}
              />
            </Pressable>
          </RowView>
        </View>
        {app.boot?.demo_batches.length ? (
          <View
            style={{
              backgroundColor: "#362230",
              paddingHorizontal: 16,
              paddingVertical: 5,
            }}
          >
            <Txt size={10} tone="gold">
              DEMO VERİLER ETKİN · Demo işlemler rapor toplamlarına dahildir.
            </Txt>
          </View>
        ) : null}
        {!app.online && (
          <View style={{ backgroundColor: "#62293a", padding: 9 }}>
            <Txt size={12}>
              İnternet bağlantısı yok. Randevu ve ödeme işlemleri için yeniden
              bağlanın.
            </Txt>
          </View>
        )}
        {app.loading ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <ActivityIndicator color={colors.pink} />
          </View>
        ) : (
          <Boundary key={name + JSON.stringify(app.route.params || {})}>
            <Screen key={name + JSON.stringify(app.route.params || {})} />
          </Boundary>
        )}
        {app.message && (
          <View
            accessibilityLiveRegion="polite"
            style={[
              styles.toast,
              { borderColor: app.message.error ? colors.red : colors.green },
            ]}
          >
            <RowView>
              <Txt
                size={12}
                tone={app.message.error ? "red" : "green"}
                style={{ flex: 1 }}
              >
                {app.message.text}
              </Txt>
              <Pressable
                onPress={app.dismissMessage}
                accessibilityRole="button"
                accessibilityLabel="Bildirimi kapat"
                style={{
                  minWidth: 38,
                  minHeight: 38,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close-outline" size={22} color={colors.muted} />
              </Pressable>
            </RowView>
          </View>
        )}
        {app.busy && (
          <View style={styles.busy}>
            <ActivityIndicator color={colors.pink} />
            <Txt size={12}>Kaydediliyor…</Txt>
          </View>
        )}
        <View style={styles.tabs}>
          {tabs.map(([target, label, icon]) => (
            <Pressable
              key={target}
              onPress={() => app.nav(target)}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{
                selected:
                  name === target || (target === "home" && name === "discover"),
              }}
              style={{
                flex: 1,
                alignItems: "center",
                gap: 5,
                paddingVertical: 9,
                borderRadius: 18,
                backgroundColor:
                  name === target || (target === "home" && name === "discover")
                    ? colors.cyan + "18"
                    : "transparent",
              }}
            >
              <Ionicons
                name={icon as any}
                size={22}
                color={
                  name === target || (target === "home" && name === "discover")
                    ? colors.cyan
                    : colors.muted
                }
              />
              <Text
                style={{
                  fontSize: 10,
                  color:
                    name === target ||
                    (target === "home" && name === "discover")
                      ? colors.cyan
                      : colors.muted,
                  fontWeight: name === target ? "700" : "400",
                }}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <MotionProvider>
        <AppProvider>
          <Shell />
        </AppProvider>
      </MotionProvider>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  frame: { flex: 1, maxWidth: 720, width: "100%", alignSelf: "center" },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border + "65",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    fontWeight: "800",
    fontSize: 20,
    color: colors.text,
    letterSpacing: -1,
  },
  notification: {
    position: "absolute",
    top: -5,
    right: -6,
    backgroundColor: "#b84266",
    borderRadius: 12,
    minWidth: 17,
    height: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  tabs: {
    flexDirection: "row",
    gap: 2,
    padding: 6,
    marginHorizontal: 14,
    marginBottom: 8,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 25,
    backgroundColor: "#172238fa",
  },
  toast: {
    position: "absolute",
    bottom: 80,
    left: 14,
    right: 14,
    borderWidth: 1,
    borderRadius: 15,
    padding: 14,
    backgroundColor: "#172238fa",
  },
  busy: {
    position: "absolute",
    top: 75,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 13,
    borderRadius: 16,
    backgroundColor: "#1b2037ee",
  },
});
