import React from "react";
import { View } from "react-native";
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
  Chip,
  State,
  Hero,
} from "../components/ui";
import { appVersion } from "../theme";
import { dateTime } from "../utils/dates";
import {
  registerNotifications,
  unregisterNotifications,
} from "../services/notifications";
import { stopSharing } from "../services/location";
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
    <Page>
      <Hero
        title="Profil ve ayarlar"
        subtitle="Tarzın da çalışma alanın da sana ait."
        compact
        eyebrow="SANA ÖZEL ALAN"
      />
      <Card tone="pink">
        <RowView>
          <Avatar url={profile?.avatar_url} size={72} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Txt bold size={23}>
              {profile?.display_name || "Misafir"}
            </Txt>
            <Txt muted>
              {app.session?.user.email || "Giriş yaparak randevu alın."}
            </Txt>
          </View>
        </RowView>
        {app.session && (
          <Btn
            title="Profilimi Düzenle"
            outline
            onPress={() =>
              app.nav("editor", { kind: "profile", item: profile })
            }
          />
        )}
      </Card>
      {app.session ? (
        <>
          <Card tone="cyan">
            <Txt bold>Çalışma alanım</Txt>
            <RowView style={{ flexWrap: "wrap" }}>
              {roles.map((role) => (
                <Chip
                  key={role}
                  label={labels[role]}
                  selected={app.role === role}
                  onPress={() => app.setRole(role)}
                />
              ))}
            </RowView>
            <Txt muted size={11}>
              Roller sunucu yetkileriyle korunur. Demo yüklendiğinde Admin tüm
              rol ekranlarını deneyebilir.
            </Txt>
          </Card>
          <Btn
            title="Randevularım"
            outline
            onPress={() => app.nav("appointments")}
          />
          <Btn
            title="Boş Saat / Ekstra Saat Taleplerim"
            outline
            tone="gold"
            onPress={() => app.nav("requests")}
          />
          <Btn
            title="Şifremi Güncelle"
            outline
            tone="cyan"
            onPress={() => app.nav("passwordreset")}
          />
          <Btn
            title="Tamamlanan İşlemlerim"
            outline
            tone="cyan"
            onPress={() => app.nav("completed")}
          />
          <Btn
            title="Usta Davet / İndirim Kodu Kullan"
            outline
            tone="gold"
            onPress={() => app.nav("editor", { kind: "redeem" })}
          />
          <Btn
            title="Tercih Saklama İzinlerim"
            outline
            onPress={() => app.nav("customers")}
          />
          <Btn
            title="Bildirimleri Etkinleştir"
            outline
            tone="cyan"
            onPress={async () => {
              try {
                app.toast(await registerNotifications());
              } catch (e) {
                app.toast((e as Error).message, true);
              }
            }}
          />
          <Btn
            title="İşletmemi Oluştur"
            outline
            tone="gold"
            onPress={() => app.nav("editor", { kind: "business_create" })}
          />
          <Btn
            title="Çıkış Yap"
            outline
            tone="red"
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
        </>
      ) : (
        <Btn title="Giriş Yap / Kayıt Ol" onPress={() => app.nav("auth")} />
      )}
      <Card>
        <Txt bold>DraBornStyle v{appVersion}</Txt>
        <Txt muted size={12}>
          Randevu, tıraş ve gelir yönetimi · Android / Expo Go test sürümü
        </Txt>
      </Card>
    </Page>
  );
}
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
