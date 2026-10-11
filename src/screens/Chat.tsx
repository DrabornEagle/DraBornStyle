import React, { useState, useEffect } from "react";
import { View, Linking } from "react-native";
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
} from "../components/ui";
import { colors } from "../theme";
import { clock } from "../utils/dates";
export function ConversationsScreen() {
  const { nav, role, businessId } = useApp();
  const r = useData<Row[]>(
    "conversations",
    role === "customer" ? {} : { business_id: businessId },
  );
  return (
    <Page>
      <Section title="Sohbetler" />
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
            onPress={() => nav("chat", { id: c.id, staff: c.staff_name })}
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
  const [text, setText] = useState("");
  useEffect(() => {
    if (
      r.data?.messages.some(
        (m: Row) => m.sender_id !== app.session?.user.id && !m.read_at,
      )
    )
      app.run("chat_read", { id }, "");
  }, [r.data?.messages.length]);
  async function send(body: string) {
    if (!body.trim()) return;
    const result = await app.run("message_send", { id, body: body.trim() }, "");
    if (result) setText("");
  }
  return (
    <Page>
      <Section
        title={app.route.params?.staff || "Randevu sohbeti"}
        subtitle="Yazılı mesajlar ve okundu bilgisi anlık güncellenir."
      />
      <State
        loading={r.loading && !r.data}
        error={r.error}
        onRetry={r.reload}
      />
      {r.data?.messages.map((m: Row) => {
        const own = m.sender_id === app.session?.user.id;
        return (
          <View
            key={m.id}
            style={{
              alignSelf: own ? "flex-end" : "flex-start",
              maxWidth: "87%",
              backgroundColor: own ? "#36324c" : "#1b3b43",
              borderWidth: 1,
              borderColor: own ? colors.pink + "80" : colors.cyan + "65",
              borderRadius: 22,
              borderBottomRightRadius: own ? 6 : 22,
              borderBottomLeftRadius: own ? 22 : 6,
              padding: 16,
              gap: 5,
            }}
          >
            <Txt>{m.body}</Txt>
            <Txt muted size={10}>
              {clock(m.created_at)}
              {own ? (m.read_at ? " · Okundu" : " · Gönderildi") : ""}
            </Txt>
            {!own && (
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
          </View>
        );
      })}
      <RowView style={{ flexWrap: "wrap" }}>
        {[
          "Yoldayım",
          "5 dk gecikebilirim",
          "Sizi bekliyorum",
          "Teşekkürler",
        ].map((t) => (
          <Chip key={t} label={t} onPress={() => send(t)} />
        ))}
      </RowView>
      <Field label="Mesajınız" value={text} onChange={setText} multiline />
      <Btn
        title="Mesaj Gönder"
        onPress={() => send(text)}
        disabled={!text.trim() || r.data?.blocked}
        icon="send-outline"
      />
      <Btn
        title={r.data?.blocked ? "Engeli Kaldır" : "Sohbeti Engelle"}
        outline
        tone="red"
        small
        onPress={() => app.run("chat_block", { id, blocked: !r.data?.blocked })}
      />
    </Page>
  );
}
