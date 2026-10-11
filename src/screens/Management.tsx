import React, { useState } from "react";
import { View, ScrollView, Pressable, Image } from "react-native";
import { useApp } from "../app/Context";
import { useData } from "../hooks/useData";
import { Business, Row } from "../types";
import { BusinessPicker } from "./Dashboard";
import {
  Page,
  Section,
  Card,
  Txt,
  Btn,
  RowView,
  Avatar,
  Badge,
  State,
  AmountLine,
  Chip,
  Hero,
  Field,
  Chips,
  Icon,
  imageSource,
} from "../components/ui";
import { money } from "../utils/money";
import { dateTime, localDate, addDays, atLocal, clock } from "../utils/dates";
import { colors } from "../theme";
export function ManagementScreen() {
  const app = useApp();
  const [tab, setTab] = useState("staff"),
    [search, setSearch] = useState("");
  const r = useData<Business>(
    "business",
    { business_id: app.businessId },
    !!app.businessId,
  );
  const b = r.data;
  const management = useData<Row>(
    "management",
    { business_id: app.businessId },
    !!app.businessId,
  );
  return (
    <Page>
      <Hero
        title="İşletme Yönetimi"
        eyebrow="İŞLETME PANELİ"
        subtitle="Ekibini, takvimini ve hizmetlerini tek yerden yönet."
      />
      <BusinessPicker />
      <State loading={r.loading && !b} error={r.error} onRetry={r.reload} />
      {b && (
        <>
          <Card tone="pink">
            <RowView>
              <Image
                source={imageSource(b.cover_url)}
                resizeMode="cover"
                style={{ width: 82, height: 76, borderRadius: 12 }}
              />
              <View style={{ flex: 1, gap: 5 }}>
                <Txt bold size={24}>
                  {b.name}
                </Txt>
                {b.demo_batch_id && (
                  <Txt tone="gold" size={10}>
                    DEMO İŞLETME
                  </Txt>
                )}
                <Txt muted size={12}>
                  {b.address}
                </Txt>
              </View>
            </RowView>
            <RowView style={{ flexWrap: "wrap" }}>
              <Btn
                title="İşletme Ayarları"
                outline
                small
                onPress={() =>
                  app.nav("editor", {
                    kind: "business_save",
                    business_id: b.id,
                    item: b,
                  })
                }
              />
              <Btn
                title="Profil Görünümü"
                small
                outline
                tone="cyan"
                onPress={() => app.nav("business", { id: b.id })}
              />
              <Btn
                title="Çalışma Saatleri"
                small
                outline
                tone="gold"
                onPress={() =>
                  app.nav("editor", { kind: "hours", business_id: b.id })
                }
              />
            </RowView>
          </Card>
          <Chips
            items={[
              { value: "staff", label: "Çalışanlar" },
              { value: "calendar", label: "Takvim" },
            ]}
            value={tab}
            onChange={setTab}
          />
          {tab === "calendar" ? (
            <StaffSchedule business={b} />
          ) : (
            <>
              <Section
                title="Çalışanlarım"
                right={
                  <Btn
                    title="Yeni Çalışan"
                    small
                    onPress={() =>
                      app.nav("editor", { kind: "staff", business_id: b.id })
                    }
                  />
                }
              />
              <Field
                label="Çalışan ara"
                hideLabel
                placeholder="Çalışan ara…"
                value={search}
                onChange={setSearch}
              />
              {b.staff
                .filter((s) =>
                  (s.name + " " + s.specialties)
                    .toLocaleLowerCase("tr-TR")
                    .includes(search.toLocaleLowerCase("tr-TR")),
                )
                .map((s) => (
                  <Card key={s.id} tone="cyan">
                    <RowView>
                      <Avatar url={s.photo_url} size={60} />
                      <View style={{ flex: 1 }}>
                        <Txt bold size={19}>
                          {s.name}
                        </Txt>
                        <Txt muted size={12}>
                          {s.specialties}
                        </Txt>
                        <Txt tone="gold" size={12}>
                          Aylık hedef: {s.target_monthly} müşteri
                        </Txt>
                      </View>
                      <Badge
                        state={
                          s.active ? s.state?.status || "available" : "off"
                        }
                      />
                    </RowView>
                    <RowView style={{ flexWrap: "wrap" }}>
                      <Btn
                        title="Düzenle / Hesap Bağla"
                        small
                        outline
                        onPress={() =>
                          app.nav("editor", {
                            kind: "staff",
                            business_id: b.id,
                            item: s,
                            account: management.data?.accounts.find(
                              (a: Row) => a.staff_id === s.id,
                            ),
                          })
                        }
                      />
                      <Btn
                        title="Çalışma Saatleri"
                        small
                        outline
                        tone="gold"
                        onPress={() =>
                          app.nav("editor", {
                            kind: "hours",
                            business_id: b.id,
                            staff_id: s.id,
                          })
                        }
                      />
                      <Btn
                        title="Performans"
                        small
                        outline
                        tone="cyan"
                        onPress={() =>
                          app.nav("reports", {
                            business_id: b.id,
                            staff_id: s.id,
                          })
                        }
                      />
                      {app.boot?.is_admin && (
                        <Btn
                          title="Özel Bedel"
                          small
                          outline
                          onPress={() =>
                            app.nav("editor", {
                              kind: "fee",
                              business_id: b.id,
                              staff_id: s.id,
                            })
                          }
                        />
                      )}
                    </RowView>
                  </Card>
                ))}
              {b.staff.length === 0 && (
                <State empty="Henüz çalışan eklenmedi." />
              )}
            </>
          )}
          {b.staff.length > 0 && b.services.length > 0 && (
            <Card tone="purple">
              <Section title="Hizmet Atamaları" icon="cut-outline" />
              <Txt muted size={11}>
                Atamaları değiştirmek için ilgili hizmeti düzenle.
              </Txt>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ minWidth: 320 }}>
                  <RowView
                    style={{
                      paddingBottom: 12,
                      borderBottomWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Txt muted size={11} style={{ width: 120 }}>
                      Çalışan
                    </Txt>
                    {b.services
                      .filter((s) => s.active)
                      .map((s) => (
                        <Txt
                          key={s.id}
                          bold
                          size={11}
                          style={{ width: 92, textAlign: "center" }}
                        >
                          {s.name}
                        </Txt>
                      ))}
                  </RowView>
                  {b.staff
                    .filter((s) => s.active)
                    .map((s) => (
                      <RowView
                        key={s.id}
                        style={{
                          paddingVertical: 12,
                          borderBottomWidth: 1,
                          borderColor: "#ffffff10",
                        }}
                      >
                        <Txt size={12} style={{ width: 120 }}>
                          {s.name}
                        </Txt>
                        {b.services
                          .filter((v) => v.active)
                          .map((v) => (
                            <View
                              key={v.id}
                              style={{ width: 92, alignItems: "center" }}
                            >
                              <Icon
                                name={
                                  b.staff_services?.some(
                                    (x) =>
                                      x.staff_id === s.id &&
                                      x.service_id === v.id,
                                  )
                                    ? "checkmark-circle"
                                    : "ellipse-outline"
                                }
                                tone={
                                  b.staff_services?.some(
                                    (x) =>
                                      x.staff_id === s.id &&
                                      x.service_id === v.id,
                                  )
                                    ? "pink"
                                    : "purple"
                                }
                                size={21}
                              />
                            </View>
                          ))}
                      </RowView>
                    ))}
                </View>
              </ScrollView>
            </Card>
          )}
          <Section
            title="Hizmetler ve fiyatlar"
            right={
              <Btn
                title="Yeni Hizmet"
                small
                onPress={() =>
                  app.nav("editor", { kind: "service", business_id: b.id })
                }
              />
            }
          />
          {b.services.map((s) => (
            <Card key={s.id}>
              <RowView style={{ justifyContent: "space-between" }}>
                <View>
                  <Txt bold>{s.name}</Txt>
                  <Txt muted size={12}>
                    {s.duration_minutes} dk · {s.active ? "Etkin" : "Pasif"}
                  </Txt>
                </View>
                <Txt tone="gold" bold>
                  {money(s.price_cents)}
                </Txt>
              </RowView>
              <RowView>
                <Btn
                  title="Düzenle"
                  small
                  outline
                  onPress={() =>
                    app.nav("editor", {
                      kind: "service",
                      business_id: b.id,
                      item: s,
                      staff_ids: b.staff_services
                        ?.filter((x) => x.service_id === s.id)
                        .map((x) => x.staff_id),
                    })
                  }
                />
                {app.boot?.is_admin && (
                  <Btn
                    title="Hizmete Özel Bedel"
                    small
                    outline
                    tone="gold"
                    onPress={() =>
                      app.nav("editor", {
                        kind: "fee",
                        business_id: b.id,
                        service_id: s.id,
                      })
                    }
                  />
                )}
              </RowView>
            </Card>
          ))}
          <Section title="Müşteri ilişkileri" />
          <RowView style={{ flexWrap: "wrap" }}>
            <Btn
              title="Usta İndirim Kodu"
              small
              outline
              onPress={() =>
                app.nav("editor", { kind: "promo", business_id: b.id })
              }
            />
            <Btn
              title="Sadakat Programı"
              small
              outline
              tone="gold"
              onPress={() =>
                app.nav("editor", { kind: "loyalty", business_id: b.id })
              }
            />
            <Btn
              title="Boş Saat Duyurusu"
              small
              outline
              tone="cyan"
              onPress={() =>
                app.nav("editor", { kind: "campaign", business_id: b.id })
              }
            />
          </RowView>
          {management.data?.promo_codes.map((c: Row) => (
            <Card key={c.id}>
              <Txt bold>
                {c.code} · %{c.discount_bps / 100}
              </Txt>
              <Txt muted size={12}>
                Usta: {b.staff.find((s) => s.id === c.staff_id)?.name} ·
                Kullanım: {c.uses}
              </Txt>
            </Card>
          ))}
          <Btn
            title="Yeni İşletme Ekle"
            outline
            tone="cyan"
            onPress={() => app.nav("editor", { kind: "business_create" })}
          />
        </>
      )}
      {!b && !r.loading && (
        <Btn
          title="İşletmemi Oluştur"
          onPress={() => app.nav("editor", { kind: "business_create" })}
        />
      )}
    </Page>
  );
}
function StaffSchedule({ business }: { business: Business }) {
  const app = useApp(),
    [day, setDay] = useState(localDate());
  const week = addDays(
    day,
    -((new Date(day + "T12:00:00+03:00").getUTCDay() + 6) % 7),
  );
  const r = useData<Row[]>("appointments", {
    business_id: business.id,
    from: atLocal(day, "00:00"),
    to: atLocal(addDays(day, 1), "00:00"),
  });
  const rows =
    r.data?.filter((a) => !["cancelled", "no_show"].includes(a.status)) || [];
  const weekday = new Date(day + "T12:00:00+03:00").getUTCDay() || 7;
  const hours =
    business.hours?.filter((h) => h.weekday === weekday && !h.closed) || [];
  const open = Math.floor(
    Math.min(
      540,
      ...hours.map((h) => h.open_minute),
      ...rows.map((a) => Number(clock(a.starts_at).slice(0, 2)) * 60),
    ) / 60,
  );
  const close = Math.max(
    open + 1,
    Math.ceil(
      Math.max(
        1200,
        ...hours.map((h) => h.close_minute),
        ...rows.map(
          (a) =>
            Number(clock(a.starts_at).slice(0, 2)) * 60 +
            Number(a.duration_minutes),
        ),
      ) / 60,
    ),
  );
  const cell = 72,
    width = (close - open) * cell;
  return (
    <Card tone="pink">
      <Section
        title="Haftalık Takvim"
        icon="calendar-outline"
        right={
          <Btn
            title="Bugün"
            small
            outline
            onPress={() => setDay(localDate())}
          />
        }
      />
      <RowView style={{ justifyContent: "space-between" }}>
        <Btn
          title="Önceki hafta"
          small
          outline
          onPress={() => setDay(addDays(day, -7))}
        />
        <Txt size={12} bold>
          {new Date(day + "T12:00:00+03:00").toLocaleDateString("tr-TR", {
            month: "long",
            year: "numeric",
          })}
        </Txt>
        <Btn
          title="Sonraki hafta"
          small
          outline
          onPress={() => setDay(addDays(day, 7))}
        />
      </RowView>
      <RowView style={{ gap: 4 }}>
        {Array.from({ length: 7 }, (_, i) => addDays(week, i)).map((date) => (
          <Pressable
            key={date}
            accessibilityRole="button"
            accessibilityLabel={"Takvim " + date}
            accessibilityState={{ selected: day === date }}
            onPress={() => setDay(date)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: day === date ? colors.pink : "#77699150",
              backgroundColor: day === date ? "#bf2dc43a" : "#10132660",
            }}
          >
            <Txt size={10} muted>
              {new Date(date + "T12:00:00+03:00").toLocaleDateString("tr-TR", {
                weekday: "short",
              })}
            </Txt>
            <Txt size={16} bold>
              {Number(date.slice(8))}
            </Txt>
          </Pressable>
        ))}
      </RowView>
      <State loading={r.loading} error={r.error} onRetry={r.reload} />
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View>
          <RowView style={{ gap: 0 }}>
            <View style={{ width: 108 }} />
            {Array.from({ length: close - open }, (_, i) => (
              <View key={i} style={{ width: cell }}>
                <Txt size={10} muted>
                  {String(open + i).padStart(2, "0")}:00
                </Txt>
              </View>
            ))}
          </RowView>
          {business.staff
            .filter((s) => s.active)
            .map((s) => (
              <RowView key={s.id} style={{ gap: 0, marginTop: 10 }}>
                <View style={{ width: 108, gap: 5 }}>
                  <Avatar url={s.photo_url} size={38} />
                  <Txt size={11} bold>
                    {s.name}
                  </Txt>
                </View>
                <View
                  style={{
                    width,
                    height: 84,
                    flexDirection: "row",
                    backgroundColor: "#080e20aa",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  {Array.from({ length: close - open }, (_, i) => (
                    <View
                      key={i}
                      style={{
                        width: cell,
                        borderLeftWidth: 1,
                        borderColor: "#66568f40",
                      }}
                    />
                  ))}
                  {rows
                    .filter((a) => a.staff_id === s.id)
                    .map((a) => {
                      const [h, m] = clock(a.starts_at).split(":").map(Number);
                      return (
                        <Pressable
                          key={a.id}
                          accessibilityRole="button"
                          accessibilityLabel={
                            a.customer_name + " " + clock(a.starts_at)
                          }
                          onPress={() => app.nav("appointment", { id: a.id })}
                          style={{
                            position: "absolute",
                            left: (((h - open) * 60 + m) / 60) * cell,
                            width: Math.max(
                              50,
                              (Number(a.duration_minutes) / 60) * cell - 3,
                            ),
                            top: 6,
                            bottom: 6,
                            padding: 5,
                            borderWidth: 1,
                            borderColor: colors.pink,
                            backgroundColor: "#722880cf",
                            borderRadius: 8,
                          }}
                        >
                          <Txt size={10} bold>
                            {clock(a.starts_at)}
                          </Txt>
                          <Txt size={9}>{a.customer_name}</Txt>
                          <Txt size={8} muted>
                            {a.service_name}
                          </Txt>
                        </Pressable>
                      );
                    })}
                </View>
              </RowView>
            ))}
        </View>
      </ScrollView>
      {!rows.length && !r.loading && (
        <Txt muted size={12}>
          Seçili gün için randevu yok.
        </Txt>
      )}
      <Txt muted size={10}>
        Randevu ayrıntılarını görmek için takvimdeki kayda dokun.
      </Txt>
    </Card>
  );
}
export function CustomersScreen() {
  const app = useApp();
  const r = useData<Row[]>("customers", {
    business_id: app.role === "customer" ? null : app.businessId,
  });
  const own = app.role === "customer";
  return (
    <Page>
      <Section title={own ? "Müşteri tercihlerim" : "Akıllı müşteri defteri"} />
      {!own && <BusinessPicker staff={app.role === "staff"} />}
      <State
        loading={r.loading && !r.data}
        error={r.error}
        onRetry={r.reload}
      />
      {r.data?.map((c) => (
        <Card key={c.id} tone="cyan">
          <Txt bold size={21}>
            {c.name}
          </Txt>
          <RowView>
            <Chip label={`${c.visits} ziyaret`} />
            <Chip
              label={
                c.preferences_consent
                  ? "Tercih saklama izni var"
                  : "Tercih izni yok"
              }
              selected={c.preferences_consent}
              tone="green"
            />
          </RowView>
          <Txt muted>
            {c.last_visit
              ? "Son ziyaret: " + dateTime(c.last_visit)
              : "İlk ziyaret bekleniyor"}
          </Txt>
          {c.notes.map((n: Row) => (
            <Txt key={n.id} size={12}>
              • {n.note}
            </Txt>
          ))}
          {own ? (
            <Btn
              title={
                c.preferences_consent
                  ? "Tercih Saklama İznini Kaldır"
                  : "Tercihlerimin Saklanmasını Onaylıyorum"
              }
              outline
              small
              onPress={() =>
                app.run("customer_consent", {
                  customer_id: c.id,
                  consent: !c.preferences_consent,
                })
              }
            />
          ) : (
            <RowView style={{ flexWrap: "wrap" }}>
              <Btn
                title="İzinli Not Ekle"
                outline
                small
                disabled={!c.preferences_consent}
                onPress={() =>
                  app.nav("editor", {
                    kind: "note",
                    business_id: c.business_id,
                    customer_id: c.id,
                    staff_id: app.staffId,
                  })
                }
              />
              <Btn
                title="Tekrar Randevu"
                small
                outline
                tone="cyan"
                onPress={() =>
                  app.nav("booking", {
                    business_id: c.business_id,
                    staff_id: app.staffId,
                    customer_id: c.id,
                  })
                }
              />
              <Btn
                title="Özel İndirim / Fiyat"
                outline
                small
                tone="gold"
                onPress={() =>
                  app.nav("editor", {
                    kind: "discount",
                    business_id: c.business_id,
                    customer_id: c.id,
                    staff_id: app.staffId,
                  })
                }
              />
            </RowView>
          )}
        </Card>
      ))}
      {r.data?.length === 0 && (
        <State empty="Müşteriler randevu ve tıraş işlemleriyle defterinize eklenir." />
      )}
    </Page>
  );
}
export function CompletedScreen() {
  const app = useApp();
  const r = useData<Row[]>(
    "sessions",
    app.role === "customer"
      ? { mine: true }
      : {
          business_id: app.businessId,
          staff_id: app.role === "staff" ? app.staffId : null,
        },
  );
  return (
    <Page>
      <Section title="İşlem geçmişi" />
      <State
        loading={r.loading && !r.data}
        error={r.error}
        onRetry={r.reload}
      />
      {r.data
        ?.filter((s) => s.state !== "active")
        .map((s) => (
          <Card key={s.id}>
            <Txt bold>
              {s.customer_name} · {s.service_name}
            </Txt>
            <Txt muted>
              {s.staff_name} · {dateTime(s.completed_at)}
            </Txt>
            <Badge state={s.state} />
            <AmountLine label="Hizmet geliri" value={money(s.service_cents)} />
            <AmountLine label="Platform bedeli" value={money(s.fee_cents)} />
            {app.role === "customer" ? (
              s.state === "completed" &&
              !s.review_id && (
                <Btn
                  title="Ustamı Değerlendir"
                  small
                  outline
                  onPress={() =>
                    app.nav("editor", { kind: "review", id: s.id })
                  }
                />
              )
            ) : (
              <Btn
                title="İşlem Detayı"
                small
                outline
                onPress={() => app.nav("session", { id: s.id })}
              />
            )}
          </Card>
        ))}
      {r.data?.length === 0 && (
        <State empty="Tamamlanan işlemler burada görünür." />
      )}
    </Page>
  );
}
export function AuditScreen() {
  const app = useApp();
  const r = useData<Row[]>(
    "audit",
    app.role === "admin" ? {} : { business_id: app.businessId },
  );
  return (
    <Page>
      <Section title="Değiştirilemez denetim kayıtları" />
      <State
        loading={r.loading && !r.data}
        error={r.error}
        onRetry={r.reload}
      />
      {r.data?.map((a) => (
        <Card key={a.id}>
          <Txt bold>{a.action}</Txt>
          <Txt muted size={11}>
            {dateTime(a.created_at)} · #{a.id}
          </Txt>
          <Txt size={11}>{JSON.stringify(a.details)}</Txt>
        </Card>
      ))}
    </Page>
  );
}
export function ServicesScreen() {
  const app = useApp(),
    r = useData<Business>(
      "business",
      { business_id: app.businessId },
      !!app.businessId,
    ),
    b = r.data;
  return (
    <Page>
      <Section title="Hizmetler ve fiyatlar" />
      <State loading={r.loading && !b} error={r.error} onRetry={r.reload} />
      {b && (
        <>
          <Btn
            title="Yeni Hizmet"
            onPress={() =>
              app.nav("editor", { kind: "service", business_id: b.id })
            }
          />
          {b.services.map((s) => (
            <Card key={s.id}>
              <Txt bold>
                {s.name} · {s.duration_minutes} dk
              </Txt>
              <Txt tone="gold">{money(s.price_cents)}</Txt>
              <Btn
                title="Hizmeti Düzenle"
                outline
                small
                onPress={() =>
                  app.nav("editor", {
                    kind: "service",
                    business_id: b.id,
                    item: s,
                    staff_ids: b.staff_services
                      ?.filter((x) => x.service_id === s.id)
                      .map((x) => x.staff_id),
                  })
                }
              />
            </Card>
          ))}
        </>
      )}
    </Page>
  );
}
