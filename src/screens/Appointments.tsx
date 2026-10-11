import React, { useState } from "react";
import { View } from "react-native";
import { useApp } from "../app/Context";
import { useData } from "../hooks/useData";
import { Row } from "../types";
import {
  Page,
  Section,
  Card,
  Txt,
  Btn,
  RowView,
  Badge,
  Avatar,
  State,
  AmountLine,
  Chips,
  Chip,
} from "../components/ui";
import { dateTime, localDate, addDays, atLocal } from "../utils/dates";
import { money } from "../utils/money";
import { MapPanel } from "../components/MapPanel";
import {
  startSharing,
  stopSharing,
  enableBackgroundSharing,
} from "../services/location";
export function AppointmentsScreen() {
  const { role, businessId, staffId, nav, route } = useApp();
  const [tab, setTab] = useState("upcoming");
  const owner = role !== "customer";
  const p = route.params || {};
  const r = useData<Row[]>("appointments", {
    ...(owner
      ? {
          business_id: p.business_id || businessId,
          staff_id: role === "staff" ? staffId : null,
        }
      : { mine: true }),
  });
  const rows =
    r.data?.filter((a) =>
      tab === "upcoming"
        ? ["booked", "arrived", "in_progress"].includes(a.status)
        : true,
    ) || [];
  return (
    <Page>
      <Section
        title={owner ? "Randevu akışı" : "Randevularım"}
        subtitle="Takvimdeki değişiklikler anlık olarak güncellenir."
      />
      <Chips
        items={[
          { value: "upcoming", label: "Yaklaşan" },
          { value: "all", label: "Tüm randevular" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <State
        loading={r.loading && !r.data}
        error={r.error}
        onRetry={r.reload}
      />
      {rows.map((a) => (
        <AppointmentCard
          key={a.id}
          a={a}
          onPress={() => nav("appointment", { id: a.id })}
          owner={owner}
        />
      ))}
      {r.data && !rows.length && <State empty="Gösterilecek randevu yok." />}
      {!owner && (
        <Btn title="Yeni Randevu Al" onPress={() => nav("discover")} />
      )}
    </Page>
  );
}
export function AppointmentCard({
  a,
  onPress,
  owner = false,
}: {
  a: Row;
  onPress: () => void;
  owner?: boolean;
}) {
  return (
    <Card tone="cyan">
      <RowView>
        <Avatar url={a.staff_photo} />
        <View style={{ flex: 1 }}>
          <Txt bold>{owner ? a.customer_name : a.business_name}</Txt>
          <Txt muted size={12}>
            {a.staff_name} · {a.service_name}
          </Txt>
        </View>
        <Badge state={a.status} />
      </RowView>
      <RowView style={{ justifyContent: "space-between" }}>
        <Txt tone="cyan" bold>
          {dateTime(a.starts_at)}
        </Txt>
        <Txt tone="gold">
          {money(Number(a.quoted_service_cents) + Number(a.quoted_fee_cents))}
        </Txt>
      </RowView>
      {a.location?.shared && (
        <Txt tone="green" size={12}>
          Müşteri yolda · Yaklaşık {a.location.eta_minutes} dk
        </Txt>
      )}
      <Btn title="Randevu Detayları" outline small onPress={onPress} />
    </Card>
  );
}
export function AppointmentScreen() {
  const app = useApp();
  const r = useData<Row[]>("appointments", { id: app.route.params?.id });
  const a = r.data?.[0];
  const [confirmCancel, setConfirmCancel] = useState(false),
    [sharing, setSharing] = useState(false);
  const owner = app.role !== "customer";
  const own = a?.customer_user_id === app.session?.user.id;
  async function chat() {
    if (!a) return;
    const result = await app.run("chat_open", { appointment_id: a.id }, "");
    if (result) app.nav("chat", { id: result.id, staff: a.staff_name });
  }
  return (
    <Page>
      <Section title="Randevu detayları" />
      <State loading={r.loading && !a} error={r.error} onRetry={r.reload} />
      {a && (
        <>
          <Card tone="pink">
            <RowView>
              <Avatar url={a.staff_photo} size={65} />
              <View style={{ flex: 1 }}>
                <Txt bold size={21}>
                  {a.business_name}
                </Txt>
                <Txt muted>
                  {a.staff_name} · {a.service_name}
                </Txt>
              </View>
            </RowView>
            <Badge state={a.status} />
            <Txt bold size={24} tone="gold">
              {dateTime(a.starts_at)}
            </Txt>
            <Txt muted>
              {a.customer_name} · {a.duration_minutes} dakika
            </Txt>
            <AmountLine
              label="Hizmet bedeli"
              value={money(a.quoted_service_cents)}
            />
            <AmountLine
              label="Platform hizmet bedeli"
              value={money(a.quoted_fee_cents)}
            />
            <AmountLine
              label="Toplam"
              value={money(
                Number(a.quoted_service_cents) + Number(a.quoted_fee_cents),
              )}
              total
            />
          </Card>
          <MapPanel
            business={{ ...a, name: a.business_name }}
            location={owner ? a.location : null}
          />
          <Btn
            title={owner ? "Müşteriyle Sohbet Et" : "Ustayla Sohbet Et"}
            icon="chatbubble-outline"
            onPress={chat}
          />
          {["booked", "arrived"].includes(a.status) && (
            <>
              <RowView>
                <Btn
                  title="Randevuyu Değiştir"
                  small
                  outline
                  onPress={() =>
                    app.nav("booking", {
                      business_id: a.business_id,
                      staff_id: a.staff_id,
                      service_id: a.service_id,
                      appointment: a,
                    })
                  }
                />
                <Btn
                  title={confirmCancel ? "İptali Onayla" : "İptal Et"}
                  outline
                  tone="red"
                  small
                  onPress={async () => {
                    if (!confirmCancel) {
                      setConfirmCancel(true);
                      return;
                    }
                    const result = await app.run(
                      "cancel",
                      { id: a.id },
                      "Randevunuz iptal edildi.",
                    );
                    if (result) {
                      await stopSharing();
                      setSharing(false);
                    }
                  }}
                />
              </RowView>
              {own && (
                <Card tone="cyan">
                  <Txt bold>Varışını paylaş</Txt>
                  <Txt muted size={12}>
                    Açık onayınızla, randevuya 2 saat kala konumunuz yalnızca
                    işletme ve ilgili usta tarafından görülür. Varış süresi
                    mesafeden yaklaşık hesaplanır.
                  </Txt>
                  <Btn
                    title={
                      sharing || a.location?.shared
                        ? "Konum Paylaşımını Durdur"
                        : "Konumumu Paylaşmayı Onaylıyorum"
                    }
                    outline
                    tone="cyan"
                    onPress={async () => {
                      try {
                        if (sharing || a.location?.shared) {
                          await stopSharing();
                          await app.run(
                            "location_update",
                            { id: a.id, shared: false },
                            "Konum paylaşımı durduruldu.",
                          );
                          setSharing(false);
                        } else {
                          await startSharing(a, (m) => app.toast(m, true));
                          setSharing(true);
                          app.toast(
                            "Uygulama açıkken konumunuz güncellenecek.",
                          );
                        }
                      } catch (e) {
                        app.toast((e as Error).message, true);
                      }
                    }}
                  />
                  {sharing && (
                    <Btn
                      title="Arka plan paylaşımını etkinleştir"
                      small
                      outline
                      tone="gold"
                      onPress={async () => {
                        try {
                          await enableBackgroundSharing();
                          app.toast("Arka plan konumu etkin.");
                        } catch (e) {
                          app.toast((e as Error).message, true);
                        }
                      }}
                    />
                  )}
                  <Btn
                    title="İşletmeye Geldim"
                    small
                    outline
                    tone="green"
                    onPress={() =>
                      app.run(
                        "arrived",
                        { id: a.id },
                        "İşletmeye varışınız bildirildi.",
                      )
                    }
                  />
                </Card>
              )}
              {owner && (
                <Card tone="gold">
                  <Txt bold>Usta işlemleri</Txt>
                  <Btn
                    title="Bu Müşterinin Tıraşına Başla"
                    icon="cut-outline"
                    onPress={async () => {
                      const result = await app.run("start_session", {
                        appointment_id: a.id,
                      });
                      if (result) app.nav("session", { id: result.id });
                    }}
                  />
                  <Btn
                    title="Müşteri Gelmedi"
                    outline
                    tone="red"
                    small
                    onPress={() => app.run("no_show", { id: a.id })}
                  />
                </Card>
              )}
            </>
          )}
        </>
      )}
    </Page>
  );
}
export function RequestsScreen() {
  const app = useApp();
  const owner = app.role !== "customer";
  const r = useData<Row>(
    "requests",
    owner
      ? {
          business_id: app.businessId,
          staff_id: app.role === "staff" ? app.staffId : null,
        }
      : {},
  );
  return (
    <Page>
      <Section
        title={owner ? "Talepler ve müşteri sırası" : "Saat taleplerim"}
      />
      <State loading={r.loading} error={r.error} onRetry={r.reload} />
      <Section title="Ekstra saat talepleri" />
      {r.data?.extra.map((x: Row) => (
        <Card key={x.id}>
          <Badge state={x.state} />
          <Txt bold>{dateTime(x.requested_at)}</Txt>
          <Txt>{x.message}</Txt>
          {x.offered_at && (
            <Txt tone="gold">Önerilen: {dateTime(x.offered_at)}</Txt>
          )}
          {owner && ["pending", "offered"].includes(x.state) ? (
            <RowView>
              <Btn
                title="Saat öner"
                small
                onPress={() =>
                  app.nav("editor", { kind: "extra_offer", id: x.id })
                }
              />
              <Btn
                title="Reddet"
                outline
                tone="red"
                small
                onPress={() => app.run("extra_reject", { id: x.id })}
              />
            </RowView>
          ) : (
            x.state === "offered" && (
              <Btn
                title="Önerilen Saati Kabul Et"
                onPress={async () => {
                  const result = await app.run("extra_accept", { id: x.id });
                  if (result) app.nav("appointment", { id: result.id });
                }}
              />
            )
          )}
        </Card>
      ))}
      {!r.data?.extra?.length && (
        <State empty="Henüz ekstra saat talebi yok." />
      )}
      <Section title="Boş saat bekleyenler" />
      {r.data?.waitlists.map((x: Row) => (
        <Card key={x.id} tone="cyan">
          <Badge state={x.state} />
          <Txt>
            {dateTime(x.range_start)} — {dateTime(x.range_end)}
          </Txt>
          {!owner && x.state === "notified" && (
            <Btn
              title="Açılan Saatleri Gör"
              small
              onPress={() =>
                app.nav("booking", {
                  business_id: x.business_id,
                  staff_id: x.staff_id,
                  service_id: x.service_id,
                })
              }
            />
          )}
        </Card>
      ))}
      {owner && (
        <>
          <Section title="Çat kapı müşteri sırası" />
          {r.data?.queue.map((x: Row, i: number) => (
            <Card key={x.id} tone="gold">
              <RowView>
                <Chip label={String(i + 1)} selected tone="gold" />
                <View>
                  <Txt bold>{x.customer_name}</Txt>
                  <Txt muted>
                    {x.service_name} · Önünde yaklaşık{" "}
                    {r
                      .data!.queue.slice(0, i)
                      .reduce(
                        (n: number, v: Row) => n + v.duration_minutes,
                        0,
                      )}{" "}
                    dk
                  </Txt>
                </View>
              </RowView>
              <RowView>
                <Btn
                  title="Çağır"
                  small
                  outline
                  onPress={() => app.run("queue_call", { id: x.id })}
                />
                <Btn
                  title="Tıraşa Başla"
                  small
                  onPress={async () => {
                    const result = await app.run("queue_start", { id: x.id });
                    if (result) app.nav("session", { id: result.id });
                  }}
                />
                <Btn
                  title="Sıradan Çıkar"
                  small
                  outline
                  tone="red"
                  onPress={() => app.run("queue_cancel", { id: x.id })}
                />
              </RowView>
            </Card>
          ))}
          <Btn
            title="Sıraya Müşteri Ekle"
            outline
            tone="gold"
            onPress={() =>
              app.nav("editor", {
                kind: "queue",
                business_id: app.businessId,
                staff_id: app.staffId,
              })
            }
          />
        </>
      )}
    </Page>
  );
}
