import React, { useState, useEffect } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../app/Context";
import { useData } from "../hooks/useData";
import { Row } from "../types";
import {
  Page,
  Section,
  Card,
  Txt,
  Btn,
  Field,
  RowView,
  Chip,
  Avatar,
  State,
  Hero,
  Icon,
} from "../components/ui";
import { colors } from "../theme";
import { clock, dateTime } from "../utils/dates";
import { MapPanel } from "../components/MapPanel";
export function ConversationsScreen() {
  const { nav, role, businessId } = useApp();
  const r = useData<Row[]>(
    "conversations",
    role === "customer" ? {} : { business_id: businessId },
  );
  return (
    <Page>
      <Hero
        title="Sohbetler"
        eyebrow="DAİMA BAĞLANTIDA"
        subtitle="Randevuların ve ustalarınla tüm mesajların burada."
      />
      <State
        loading={r.loading && !r.data}
        error={r.error}
        onRetry={r.reload}
      />
      {r.data?.map((c) => (
        <Card key={c.id} tone="cyan">
          <RowView>
            <Avatar url={c.photo_url} />
            <View style={{ flex: 1 }}>
              <Txt bold>{c.staff_name}</Txt>
              <Txt muted size={12}>
                {c.business_name}
              </Txt>
              <Txt size={12}>{c.last_message || "Sohbeti başlatın."}</Txt>
            </View>
            {c.unread > 0 && <Chip label={String(c.unread)} selected />}
          </RowView>
          <Btn
            title="Sohbeti Aç"
            outline
            small
            onPress={() =>
              nav("chat", {
                id: c.id,
                staff: c.staff_name,
                photo_url: c.photo_url,
              })
            }
          />
        </Card>
      ))}
      {r.data?.length === 0 && (
        <State empty="Usta profilinden veya randevu detayından sohbet başlatın." />
      )}
    </Page>
  );
}
export function ChatScreen() {
  const app = useApp(),
    id = app.route.params?.id;
  const r = useData<Row>("messages", { id });
  const conversations = useData<Row[]>(
    "conversations",
    app.role === "customer" ? {} : { business_id: app.businessId },
  );
  const context = conversations.data?.find((c) => c.id === id);
  const appointment = useData<Row[]>(
    "appointments",
    { id: context?.appointment_id },
    !!context?.appointment_id,
  );
  const a = appointment.data?.[0];
  const [text, setText] = useState(""),
    [tools, setTools] = useState(false),
    [showMap, setShowMap] = useState(false);
  useEffect(() => {
    if (
      r.data?.messages.some(
        (m: Row) => m.sender_id !== app.session?.user.id && !m.read_at,
      )
    )
      app.run("chat_read", { id }, "");
  }, [r.data?.messages.length]);
  async function send(body: string) {
    if (!body.trim() || !r.data || r.data.blocked || app.busy) return;
    const result = await app.run("message_send", { id, body: body.trim() }, "");
    if (result) setText("");
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Page keyboardAvoiding={false}>
        <Card tone="pink">
          <RowView>
            <Avatar
              url={context?.photo_url || app.route.params?.photo_url}
              size={58}
            />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Txt bold size={19}>
                {context?.staff_name ||
                  app.route.params?.staff ||
                  "Randevu sohbeti"}
              </Txt>
              <Txt muted size={12}>
                {context?.business_name || "Randevu sohbeti"}
              </Txt>
              <Txt tone="cyan" size={10}>
                Mesajlar ve okundu bilgisi anlık güncellenir
              </Txt>
            </View>
            <Btn
              title="Seçenekler"
              small
              outline
              icon="ellipsis-horizontal"
              iconOnly
              onPress={() => setTools(!tools)}
            />
          </RowView>
        </Card>
        {a && (
          <Card tone="cyan">
            <RowView>
              <Icon name="calendar-outline" tone="cyan" />
              <View style={{ flex: 1 }}>
                <Txt bold>{dateTime(a.starts_at)}</Txt>
                <Txt muted size={12}>
                  {a.service_name} · {a.duration_minutes} dk
                </Txt>
              </View>
            </RowView>
            <RowView>
              <Btn
                title="Randevu Detayları"
                small
                outline
                onPress={() => app.nav("appointment", { id: a.id })}
              />
              <Btn
                title={showMap ? "Konumu Gizle" : "Yol Tarifi"}
                small
                outline
                tone="cyan"
                icon="navigate-outline"
                onPress={() => setShowMap(!showMap)}
              />
            </RowView>
          </Card>
        )}
        {a && showMap && (
          <MapPanel
            business={{ ...a, name: a.business_name }}
            location={app.role !== "customer" ? a.location : null}
          />
        )}
        <State
          loading={
            (r.loading && !r.data) ||
            (conversations.loading && !context) ||
            (appointment.loading && !a)
          }
          error={r.error}
          onRetry={r.reload}
        />
        {r.data?.messages.map((m: Row) => {
          const own = m.sender_id === app.session?.user.id;
          return (
            <LinearGradient
              key={m.id}
              colors={
                own ? ["#a62bd1e8", "#592797f5"] : ["#172238f2", "#11182be8"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                alignSelf: own ? "flex-end" : "flex-start",
                maxWidth: "87%",
                borderWidth: 1,
                borderColor: own ? colors.pink + "80" : colors.cyan + "65",
                borderRadius: 18,
                borderBottomRightRadius: own ? 4 : 18,
                borderBottomLeftRadius: own ? 18 : 4,
                padding: 14,
                gap: 5,
                shadowColor: own ? colors.pink : colors.cyan,
                shadowOpacity: 0.15,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 3 },
              }}
            >
              <Txt>{m.body}</Txt>
              <Txt muted size={10}>
                {clock(m.created_at)}
                {own ? (m.read_at ? " · Okundu" : " · Gönderildi") : ""}
              </Txt>
              {!own && tools && (
                <Btn
                  title="Mesajı Bildir"
                  small
                  outline
                  tone="red"
                  onPress={() =>
                    app.run("message_report", {
                      id: m.id,
                      reason: "Uygunsuz mesaj bildirimi",
                    })
                  }
                />
              )}
            </LinearGradient>
          );
        })}
        {r.data?.messages.length === 0 && (
          <State empty="İlk mesajı göndererek sohbeti başlat." />
        )}
      </Page>
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          gap: 10,
          backgroundColor: "#070e1bdb",
          borderTopWidth: 1,
          borderColor: colors.purple + "45",
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          style={{ flexGrow: 0 }}
        >
          {[
            "Yoldayım",
            "5 dk gecikebilirim",
            "Sizi bekliyorum",
            "Teşekkürler",
          ].map((t) => (
            <Chip
              key={t}
              label={t}
              onPress={
                r.data && !r.data.blocked && !app.busy
                  ? () => send(t)
                  : undefined
              }
            />
          ))}
        </ScrollView>
        <Card tone="purple" style={{ padding: 10 }}>
          <RowView style={{ alignItems: "flex-end" }}>
            <View style={{ flex: 1 }}>
              <Field
                label="Mesajınız"
                hideLabel
                placeholder={
                  r.data?.blocked ? "Bu sohbet engellendi" : "Mesajını yaz…"
                }
                value={text}
                onChange={setText}
                multiline
                compact
              />
            </View>
            <Btn
              title="Mesaj Gönder"
              small
              onPress={() => send(text)}
              disabled={!text.trim() || !r.data || r.data.blocked || app.busy}
              icon="send-outline"
              iconOnly
            />
          </RowView>
        </Card>
        {tools && (
          <Btn
            title={r.data?.blocked ? "Engeli Kaldır" : "Sohbeti Engelle"}
            outline
            tone="red"
            small
            onPress={() =>
              app.run("chat_block", { id, blocked: !r.data?.blocked })
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
