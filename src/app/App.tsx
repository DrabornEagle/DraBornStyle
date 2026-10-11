import React, { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StatusBar,
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppProvider, useApp } from "./Context";
import { useData } from "../hooks/useData";
import { colors } from "../theme";
import { Row } from "../types";
import { Txt, RowView, Chip } from "../components/ui";
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
      <View style={styles.frame}>
        <View style={styles.header}>
          <RowView>
            {name !== "home" && (
              <Pressable onPress={app.back} accessibilityLabel="Geri">
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </Pressable>
            )}
            <View style={styles.logo}>
              <Ionicons name="cut" size={29} color={colors.pink} />
            </View>
            <View>
              <Text style={styles.wordmark}>
                DraBorn<Text style={{ color: colors.pink }}>Style</Text>
              </Text>
              <Txt size={8} muted style={{ letterSpacing: 2.1 }}>
                TARZININ YENİ ADRESİ
              </Txt>
            </View>
          </RowView>
          <RowView>
            {app.session && (
              <Pressable
                onPress={() => app.nav("notifications")}
                accessibilityLabel="Bildirimler"
                style={{ position: "relative" }}
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
            >
              <Ionicons
                name="person-circle-outline"
                size={29}
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
            style={[
              styles.toast,
              { borderColor: app.message.error ? colors.red : colors.green },
            ]}
          >
            <Txt size={12} tone={app.message.error ? "red" : "green"}>
              {app.message.text}
            </Txt>
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
              style={{
                flex: 1,
                alignItems: "center",
                gap: 4,
                paddingVertical: 12,
              }}
            >
              <Ionicons
                name={icon as any}
                size={22}
                color={name === target ? colors.pink : colors.muted}
              />
              <Text
                style={{
                  fontSize: 10,
                  color: name === target ? colors.pink : colors.muted,
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
      <AppProvider>
        <Shell />
      </AppProvider>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  frame: { flex: 1, maxWidth: 680, width: "100%", alignSelf: "center" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#29233d",
  },
  logo: {
    width: 39,
    height: 39,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.pink + "85",
    backgroundColor: "#292040",
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    fontWeight: "800",
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.8,
  },
  notification: {
    position: "absolute",
    top: -5,
    right: -6,
    backgroundColor: colors.pink,
    borderRadius: 12,
    minWidth: 17,
    height: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  tabs: {
    flexDirection: "row",
    borderTopColor: "#342b4b",
    borderTopWidth: 1,
    backgroundColor: "#0d1229",
  },
  toast: {
    position: "absolute",
    bottom: 80,
    left: 14,
    right: 14,
    borderWidth: 1,
    borderRadius: 15,
    padding: 14,
    backgroundColor: "#14192af5",
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
