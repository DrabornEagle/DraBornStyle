import React from "react";
import { View, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { supabase } from "../lib/supabase";
import { useApp } from "../app/Context";
import { useData } from "../hooks/useData";
import { Row, Role } from "../types";
import {
  Page,
  Section,
  Card,
  Txt,
  Btn,
  RowView,
  Avatar,
  SegmentedControl,
  State,
  Hero,
} from "../components/ui";
import { appVersion, versionCode, colors } from "../theme";
import { dateTime } from "../utils/dates";
import {
  registerNotifications,
  unregisterNotifications,
} from "../services/notifications";
import { stopSharing } from "../services/location";

function ProfileAction({
  title,
  subtitle,
  icon,
  onPress,
  danger = false,
}: {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => any;
  danger?: boolean;
}) {
  const app = useApp();
  const [pending, setPending] = React.useState(false);
  const locked = React.useRef(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={subtitle}
      accessibilityState={{ disabled: app.busy || pending }}
      disabled={app.busy || pending}
      onPress={async () => {
        if (locked.current) return;
        locked.current = true;
        setPending(true);
        try {
          await onPress();
        } catch (error) {
          app.toast((error as Error).message, true);
        } finally {
          locked.current = false;
          setPending(false);
        }
      }}
      style={({ pressed }) => [
        profileStyles.action,
        {
          backgroundColor: pressed ? "#1a2437" : "transparent",
          opacity: app.busy || pending ? 0.5 : 1,
        },
      ]}
    >
      <View
        style={[profileStyles.icon, danger && { backgroundColor: "#ff537b12" }]}
      >
        <Ionicons
          name={icon as any}
          size={20}
          color={danger ? colors.red : "#c4b6df"}
        />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Txt bold size={14} style={danger ? { color: colors.red } : undefined}>
          {title}
        </Txt>
        <Txt muted size={11}>
          {subtitle}
        </Txt>
      </View>
      {pending ? (
        <ActivityIndicator size="small" color={colors.muted} />
      ) : (
        <Ionicons name="chevron-forward" size={17} color="#8390aa" />
      )}
    </Pressable>
  );
}

function ProfileGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 9 }}>
      <Txt bold muted size={11} style={{ paddingLeft: 4, letterSpacing: 0.7 }}>
        {title}
      </Txt>
      <Card quiet style={{ padding: 0, gap: 0, overflow: "hidden" }}>
        {React.Children.toArray(children).map((child, index) => (
          <React.Fragment
            key={
              React.isValidElement(child) && child.key != null
                ? child.key
                : index
            }
          >
            {index > 0 && <View style={profileStyles.separator} />}
            {child}
          </React.Fragment>
        ))}
      </Card>
    </View>
  );
}

export function ProfileScreen() {
  const app = useApp();
  const profile = app.boot?.profile;
  const roles: Role[] = ["customer"];
  if (
    app.boot?.is_admin ||
    app.boot?.memberships.some((m) => m.role === "staff")
  )
    roles.push("staff");
  if (
    app.boot?.is_admin ||
    app.boot?.memberships.some((m) => m.role !== "staff")
  )
    roles.push("owner");
  if (app.boot?.is_admin) roles.push("admin");
  const labels = {
    customer: "Müşteri",
    staff: "Usta",
    owner: "İşletme",
    admin: "Admin",
  };
  return (
    <Page contentStyle={{ gap: 18 }}>
      <Hero
        title="Profil ve ayarlar"
        subtitle="Hesabın, randevuların ve tercihlerin tek yerde."
        compact
        eyebrow="SANA ÖZEL ALAN"
      />
      <Card quiet>
        <RowView>
          {profile?.avatar_url ? (
            <Avatar url={profile.avatar_url} size={56} />
          ) : (
            <View style={profileStyles.avatar}>
              <Ionicons name="person-outline" size={26} color="#c4b6df" />
            </View>
          )}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt bold size={20}>
              {profile?.display_name || "Misafir"}
            </Txt>
            <Txt muted size={12}>
              {app.session?.user.email || "Giriş yaparak randevu alın."}
            </Txt>
          </View>
        </RowView>
        {app.session && (
          <ProfileAction
            title="Profilimi düzenle"
            subtitle="Adın, fotoğrafın ve iletişim bilgilerin"
            icon="person-outline"
            onPress={() =>
              app.nav("editor", { kind: "profile", item: profile })
            }
          />
        )}
      </Card>
      {app.session ? (
        <>
          <Card quiet>
            <Txt bold size={14}>
              Çalışma alanım
            </Txt>
            <SegmentedControl
              label="Çalışma alanı seçimi"
              items={roles.map((role) => ({
                value: role,
                label: labels[role],
              }))}
              value={app.role}
              onChange={(value) => app.setRole(value as Role)}
              disabled={app.busy}
            />
            <Txt muted size={11}>
              Kullanmak istediğin çalışma alanını seç. Yalnızca yetkili olduğun
              alanlar burada görünür.
            </Txt>
          </Card>
          <ProfileGroup title="RANDEVULAR VE İŞLEMLER">
            <ProfileAction
              title="Randevularım"
              subtitle="Yaklaşan ve geçmiş randevularını gör"
              icon="calendar-outline"
              onPress={() => app.nav("appointments")}
            />
            <ProfileAction
              title="Boş saat ve ek süre"
              subtitle="Bekleme listeni ve saat taleplerini takip et"
              icon="time-outline"
              onPress={() => app.nav("requests")}
            />
            <ProfileAction
              title="İşlem geçmişim"
              subtitle="Tamamlanan hizmetlerini incele"
              icon="checkmark-done-outline"
              onPress={() => app.nav("completed")}
            />
            <ProfileAction
              title="Davet ve indirim kodu"
              subtitle="Ustanın davetini veya indirim kodunu kullan"
              icon="ticket-outline"
              onPress={() => app.nav("editor", { kind: "redeem" })}
            />
          </ProfileGroup>
          <ProfileGroup title="HESAP VE İZİNLER">
            <ProfileAction
              title="Şifremi güncelle"
              subtitle="Hesabın için yeni bir şifre belirle"
              icon="lock-closed-outline"
              onPress={() => app.nav("passwordreset")}
            />
            <ProfileAction
              title="Tercih izinlerim"
              subtitle="Saklanan tercihlerin ve müşteri notların"
              icon="shield-checkmark-outline"
              onPress={() => app.nav("customers")}
            />
            <ProfileAction
              title="Bildirimleri etkinleştir"
              subtitle="Randevu ve mesaj bildirimlerini aç"
              icon="notifications-outline"
              onPress={async () => app.toast(await registerNotifications())}
            />
          </ProfileGroup>
          <ProfileGroup title="İŞLETME">
            <ProfileAction
              title="İşletmemi oluştur"
              subtitle="İşletmeni ekle ve ekibini yönetmeye başla"
              icon="storefront-outline"
              onPress={() => app.nav("editor", { kind: "business_create" })}
            />
          </ProfileGroup>
          <Card quiet style={{ padding: 0, gap: 0, overflow: "hidden" }}>
            <ProfileAction
              title="Çıkış Yap"
              subtitle="Bu cihazdaki oturumunu kapat"
              icon="log-out-outline"
              danger
              onPress={async () => {
                try {
                  await stopSharing();
                  await unregisterNotifications();
                  const { error } = await supabase.auth.signOut();
                  if (error) throw error;
                  app.nav("auth");
                } catch (e) {
                  app.toast((e as Error).message, true);
                }
              }}
            />
          </Card>
        </>
      ) : (
        <Btn title="Giriş Yap / Kayıt Ol" onPress={() => app.nav("auth")} />
      )}
      <View style={{ alignItems: "center", gap: 4, paddingVertical: 8 }}>
        <Txt muted size={11}>
          DraBornStyle v{appVersion} · Sürüm kodu {versionCode}
        </Txt>
        <Txt muted size={10}>
          Randevu, tıraş ve gelir yönetimi
        </Txt>
      </View>
    </Page>
  );
}

const profileStyles = StyleSheet.create({
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#24233a",
    alignItems: "center",
    justifyContent: "center",
  },
  action: {
    minHeight: 68,
    paddingVertical: 12,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#9d7ac914",
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    height: 1,
    backgroundColor: "#243047",
    marginLeft: 59,
    marginRight: 13,
  },
});
export function NotificationsScreen() {
  const app = useApp();
  const r = useData<Row[]>("notifications");
  return (
    <Page>
      <Section
        title="Bildirimler"
        right={
          <Btn
            title="Hepsini Oku"
            small
            outline
            onPress={() => app.run("notification_read", {})}
          />
        }
      />
      <State
        loading={r.loading && !r.data}
        error={r.error}
        onRetry={r.reload}
      />
      {r.data?.map((n) => (
        <Card key={n.id} tone={n.read_at ? "purple" : "pink"}>
          <Txt bold>{n.title}</Txt>
          <Txt>{n.body}</Txt>
          <Txt muted size={11}>
            {dateTime(n.created_at)}
          </Txt>
          {n.reference_id && (
            <Btn
              title="İlgili Ekranı Aç"
              small
              outline
              tone="cyan"
              onPress={() => {
                if (["appointment", "reminder", "busy"].includes(n.kind))
                  app.nav("appointment", { id: n.reference_id });
                else if (n.kind === "message")
                  app.nav("chat", { id: n.reference_id });
                else if (n.kind === "completed") app.nav("completed");
                else if (n.kind.startsWith("payment"))
                  app.nav("finance", { business_id: n.business_id });
                else if (["waitlist", "extra", "queue"].includes(n.kind))
                  app.nav("requests");
                else app.nav("home");
              }}
            />
          )}
          {!n.read_at && (
            <Btn
              title="Okundu İşaretle"
              small
              outline
              onPress={() => app.run("notification_read", { id: n.id }, "")}
            />
          )}
        </Card>
      ))}
      {r.data?.length === 0 && (
        <State empty="Yeni randevu, sohbet ve ödeme bildirimleri burada görünür." />
      )}
    </Page>
  );
}
