import React, { useState, useEffect } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useApp } from "../app/Context";
import { useData } from "../hooks/useData";
import { Row, Business, Tone } from "../types";
import {
  Page,
  Hero,
  Section,
  Card,
  Txt,
  Btn,
  Stat,
  StatsGrid,
  RowView,
  Chips,
  Avatar,
  Bars,
  State,
  Field,
  QuickAction,
  Columns,
  ColumnChart,
  Icon,
  Chip,
} from "../components/ui";
import { money } from "../utils/money";
import {
  dateRange,
  periodOptions,
  atLocal,
  localDate,
  addDays,
  clock,
} from "../utils/dates";
import { colors } from "../theme";

export function BusinessPicker({ staff = false }: { staff?: boolean }) {
  const app = useApp();
  const directory = useData<Business[]>("directory", {}, app.boot?.is_admin);
  const allowed = app.boot?.is_admin
    ? directory.data?.map((b) => ({ value: b.id, label: b.name }))
    : app.boot?.memberships.map((m) => ({
        value: m.business_id,
        label: m.business_name,
      }));
  const b = useData<Business>(
    "business",
    { business_id: app.businessId },
    !!app.businessId,
  );
  useEffect(() => {
    if (!app.businessId && allowed?.length) app.setBusinessId(allowed[0].value);
  }, [allowed?.length, app.businessId]);
  useEffect(() => {
    if (staff && b.data && !b.data.staff.some((s) => s.id === app.staffId)) {
      const member = app.boot?.memberships.find(
        (m) => m.business_id === app.businessId && m.staff_id,
      );
      app.setStaffId(member?.staff_id || b.data.staff[0]?.id || null);
    }
  }, [b.data?.id, app.businessId]);
  const staffItems = b.data?.staff
    .filter(
      (s) =>
        s.active &&
        (app.boot?.is_admin ||
          app.boot?.memberships.some(
            (m) => m.business_id === app.businessId && m.role !== "staff",
          ) ||
          app.boot?.memberships.some((m) => m.staff_id === s.id)),
    )
    .map((s) => ({ value: s.id, label: s.name }));
  return (
    <View style={{ gap: 4 }}>
      {allowed && allowed.length > 1 && (
        <Chips
          items={allowed}
          value={app.businessId}
          onChange={(v) => {
            app.setBusinessId(v);
            app.setStaffId(null);
          }}
        />
      )}
      {staff && staffItems && staffItems.length > 1 && (
        <Chips
          items={staffItems}
          value={app.staffId}
          onChange={app.setStaffId}
        />
      )}
    </View>
  );
}

export function DashboardScreen() {
  const app = useApp();
  const [period, setPeriod] = useState("today");
  const [returnMinutes, setReturnMinutes] = useState("30");
  const admin = app.role === "admin",
    staff = app.role === "staff";
  const filters = {
    ...dateRange(period),
    period,
    ...(admin
      ? {}
      : { business_id: app.businessId, staff_id: staff ? app.staffId : null }),
  };
  const stats = useData<Row>("stats", filters, admin || !!app.businessId);
  const business = useData<Business>(
    "business",
    { business_id: app.businessId },
    !admin && !!app.businessId,
  );
  const sessions = useData<Row[]>(
    "sessions",
    { business_id: app.businessId, staff_id: staff ? app.staffId : null },
    !admin && !!app.businessId,
  );
  const appointments = useData<Row[]>(
    "appointments",
    {
      business_id: app.businessId,
      staff_id: staff ? app.staffId : null,
      from: atLocal(localDate(), "00:00"),
      to: atLocal(addDays(localDate(), 1), "00:00"),
    },
    !admin && !!app.businessId,
  );
  const finance = useData<Row>(
    "finance",
    admin ? {} : { business_id: app.businessId },
    !staff && (admin || !!app.businessId),
  );
  const alerts = useData<Row[]>("notifications", {}, admin);
  const active = sessions.data?.find((s) => s.state === "active");
  const b = business.data,
    s = b?.staff.find((s) => s.id === app.staffId),
    v = stats.data;
  const debt =
    finance.data?.balances.reduce(
      (n: number, b: Row) => n + Number(b.balance_cents),
      0,
    ) || 0;
  const entries: {
    label: string;
    value: string | number;
    icon: string;
    tone: Tone;
  }[] = !v
    ? []
    : admin
      ? [
          {
            label: "Toplam İşletme",
            value: v.business_count,
            icon: "storefront-outline",
            tone: "pink",
          },
          {
            label: "Aktif Usta",
            value: v.staff_count,
            icon: "people-outline",
            tone: "cyan",
          },
          {
            label: "Tamamlanan İşlem",
            value: v.completed,
            icon: "calendar-outline",
            tone: "gold",
          },
          {
            label: "Tahakkuk Eden Gelir",
            value: money(v.fee_cents),
            icon: "cash-outline",
            tone: "green",
          },
          {
            label: "Tahsil Edilen",
            value: money(v.collected_cents),
            icon: "card-outline",
            tone: "pink",
          },
          {
            label: "Bekleyen Alacak",
            value: money(debt),
            icon: "time-outline",
            tone: "red",
          },
        ]
      : staff
        ? [
            {
              label: "Tamamlanan Tıraş",
              value: v.completed,
              icon: "people-outline",
              tone: "pink",
            },
            {
              label: "Hizmet geliri",
              value: money(v.service_cents),
              icon: "cash-outline",
              tone: "cyan",
            },
            {
              label: "Ortalama Süre",
              value: v.avg_minutes + " dk",
              icon: "time-outline",
              tone: "gold",
            },
          ]
        : [
            {
              label: "Toplam Müşteri",
              value: v.unique_customers,
              icon: "people-outline",
              tone: "pink",
            },
            {
              label: "Tamamlanan Tıraş",
              value: v.completed,
              icon: "cut-outline",
              tone: "cyan",
            },
            {
              label: "Randevu Sayısı",
              value: v.appointments,
              icon: "calendar-outline",
              tone: "gold",
            },
            {
              label: "İptal",
              value: v.cancelled,
              icon: "close-circle-outline",
              tone: "red",
            },
            {
              label: "Hizmet geliri",
              value: money(v.service_cents),
              icon: "cash-outline",
              tone: "green",
            },
            {
              label: "Platforma Ödenecek",
              value: money(v.fee_cents),
              icon: "card-outline",
              tone: "purple",
            },
          ];
  function status(next: string) {
    if (
      ["break", "busy"].includes(next) &&
      (!Number.isInteger(Number(returnMinutes)) ||
        Number(returnMinutes) < 1 ||
        Number(returnMinutes) > 480)
    ) {
      app.toast("1–480 dakika arasında dönüş süresi yazın.", true);
      return;
    }
    return app.run("staff_status", {
      business_id: app.businessId,
      staff_id: app.staffId,
      status: next,
      ...(["break", "busy"].includes(next)
        ? {
            return_at: new Date(
              Date.now() + Number(returnMinutes) * 60000,
            ).toISOString(),
          }
        : {}),
    });
  }
  const flow = (
    <Card tone="pink">
      <Section
        title="Bugünün Randevu Akışı"
        right={
          <Btn
            title="Tümü"
            small
            outline
            onPress={() => app.nav("appointments")}
          />
        }
      />
      {appointments.data?.slice(0, 5).map((a) => (
        <Pressable
          key={a.id}
          onPress={() => app.nav("appointment", { id: a.id })}
          accessibilityRole="button"
          accessibilityLabel={a.customer_name + " randevusu"}
          style={{
            borderWidth: 1,
            borderColor: colors.purple + "65",
            borderRadius: 13,
            padding: 12,
            backgroundColor: "#0b1024cf",
          }}
        >
          <RowView>
            <Txt bold size={21} style={{ width: 58 }}>
              {clock(a.starts_at)}
            </Txt>
            <View
              style={{
                width: 3,
                alignSelf: "stretch",
                backgroundColor: colors.pink,
                borderRadius: 3,
              }}
            />
            <View style={{ flex: 1 }}>
              <Txt bold>{a.customer_name}</Txt>
              <Txt muted size={11}>
                {a.service_name} · {a.staff_name}
              </Txt>
            </View>
            <Icon name="chevron-forward" size={18} tone="purple" />
          </RowView>
        </Pressable>
      ))}
      {appointments.data?.length === 0 && (
        <Txt muted size={12}>
          Bugün için henüz randevu yok.
        </Txt>
      )}
      <State error={appointments.error} onRetry={appointments.reload} />
    </Card>
  );
  return (
    <Page>
      <Hero
        title={
          admin
            ? "DraBornStyle Admin"
            : staff
              ? `Merhaba, ${s?.name || "Usta"}`
              : `Merhaba, ${b?.name || "İşletmen"}`
        }
        subtitle={
          admin
            ? "Platform genel görünümü · İşin ritmini takip et."
            : staff
              ? "Bugün harika saçlar, mutlu müşteriler."
              : "İşletmeni, ekibini ve kazancını tek yerden yönet."
        }
        eyebrow={
          admin
            ? "PLATFORM GENEL GÖRÜNÜMÜ"
            : staff
              ? new Date()
                  .toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    weekday: "long",
                  })
                  .toLocaleUpperCase("tr-TR")
              : "İŞLETME PANELİ"
        }
      />
      {!admin && <BusinessPicker staff={staff} />}
      {!admin && !app.businessId && (
        <Card>
          <Txt>İşletme panelini kullanmak için işletmeni oluştur.</Txt>
          <Btn
            title="İşletmemi Oluştur"
            onPress={() => app.nav("editor", { kind: "business_create" })}
          />
        </Card>
      )}
      {staff && app.businessId && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 9, paddingVertical: 6 }}
          >
            {[
              ["available", "Müsait", "checkmark-circle", "green"],
              ["waiting", "Müşteri Bekliyorum", "people-outline", "purple"],
              ["break", "Moladayım", "cafe-outline", "gold"],
              ["busy", "Geçici Meşgul", "remove-circle-outline", "pink"],
              ["off", "Mesaim Bitti", "moon-outline", "purple"],
            ].map(([state, label, icon, tone]) => (
              <Pressable
                key={state}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{
                  selected: (s?.state?.status || "available") === state,
                }}
                onPress={() => status(state)}
                style={{
                  width: 98,
                  minHeight: 94,
                  gap: 9,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor:
                    colors[tone as Tone] +
                    ((s?.state?.status || "available") === state ? "ff" : "70"),
                  borderRadius: 14,
                  backgroundColor:
                    colors[tone as Tone] +
                    ((s?.state?.status || "available") === state ? "2c" : "0f"),
                  shadowColor: colors[tone as Tone],
                  shadowRadius: 8,
                  shadowOpacity:
                    (s?.state?.status || "available") === state ? 0.35 : 0,
                  shadowOffset: { width: 0, height: 0 },
                }}
              >
                <Icon name={icon} size={28} tone={tone as Tone} />
                <Txt
                  bold
                  size={11}
                  style={{ textAlign: "center", maxWidth: 88 }}
                >
                  {label}
                </Txt>
              </Pressable>
            ))}
          </ScrollView>
          {["break", "busy"].includes(s?.state?.status) && (
            <Card tone="gold">
              <Field
                label="Mola / meşguliyet dönüş süresi (dakika)"
                numeric
                value={returnMinutes}
                onChange={setReturnMinutes}
              />
              <Btn
                title="Dönüş Süresini Güncelle"
                small
                outline
                tone="gold"
                onPress={() => status(s?.state?.status)}
              />
            </Card>
          )}
          <Btn
            title={active ? "Devam Eden Tıraşı Aç" : "Tıraşa Başla"}
            icon="cut-outline"
            onPress={() =>
              app.nav(
                active ? "session" : "start",
                active ? { id: active.id } : {},
              )
            }
          />
          {flow}
        </>
      )}
      <Chips
        items={periodOptions
          .filter((x) => x[0] !== "custom")
          .map(([value, label]) => ({ value, label }))}
        value={period}
        onChange={setPeriod}
      />
      <State
        loading={stats.loading && !v}
        error={stats.error}
        onRetry={stats.reload}
      />
      {v && (
        <>
          <StatsGrid>
            {entries.map((entry) => (
              <Stat key={entry.label} {...entry} />
            ))}
          </StatsGrid>
          {admin && (
            <Card tone="purple">
              <Section
                title="İşletme Gelir Detayları"
                right={
                  <Btn
                    title="Tümünü Gör"
                    small
                    outline
                    onPress={() => app.nav("finance")}
                  />
                }
              />
              {!v.businesses?.length ? (
                <Txt muted size={12}>
                  Platforma katılan işletmeler burada görünür.
                </Txt>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ minWidth: 560, gap: 10 }}>
                    <RowView
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                        paddingBottom: 10,
                      }}
                    >
                      {[
                        "İŞLETME",
                        "İŞLEM",
                        "PLATFORM GELİRİ",
                        "ÖDEME DURUMU",
                      ].map((text, i) => (
                        <Txt
                          key={text}
                          muted
                          size={10}
                          style={{ width: i === 0 ? 170 : i === 3 ? 160 : 110 }}
                        >
                          {text}
                        </Txt>
                      ))}
                    </RowView>
                    {v.businesses.map((row: Row) => (
                      <Pressable
                        key={row.id}
                        onPress={() =>
                          app.nav("finance", { business_id: row.id })
                        }
                        accessibilityRole="button"
                        accessibilityLabel={row.name + " gelir detayları"}
                        style={{
                          paddingVertical: 9,
                          borderBottomWidth: 1,
                          borderBottomColor: "#3232466f",
                        }}
                      >
                        <RowView>
                          <Txt bold size={13} style={{ width: 170 }}>
                            {row.name}
                          </Txt>
                          <Txt size={12} style={{ width: 110 }}>
                            {row.completed} işlem
                          </Txt>
                          <Txt bold size={13} style={{ width: 110 }}>
                            {money(row.fee_cents)}
                          </Txt>
                          <Chip
                            label={
                              Number(row.balance_cents) <= 0
                                ? "Ödendi"
                                : Number(row.collected_cents) > 0
                                  ? "Kısmen Ödendi"
                                  : "Ödeme Bekleniyor"
                            }
                            selected
                            tone={
                              Number(row.balance_cents) <= 0 ? "green" : "gold"
                            }
                          />
                        </RowView>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              )}
            </Card>
          )}
          <Columns>
            <Card tone="purple">
              <Section
                title={
                  admin
                    ? "Günlük Gelir Grafiği"
                    : staff
                      ? "Kazanç Grafiği"
                      : "Gelir ve Doluluk"
                }
              />
              {!admin && !staff && (
                <View style={{ gap: 4 }}>
                  <Txt bold tone="pink" size={31}>
                    %{v.occupancy_percent || 0}
                  </Txt>
                  <Txt muted size={11}>
                    Seçilen dönemin doluluk oranı
                  </Txt>
                </View>
              )}
              {v.daily?.length ? (
                <ColumnChart
                  rows={v.daily}
                  label="day"
                  keyValue={admin ? "fee_cents" : "service_cents"}
                  currency
                />
              ) : (
                <Txt muted size={12}>
                  Seçilen dönemde tamamlanmış işlem yok.
                </Txt>
              )}
            </Card>
            {admin ? (
              <Card tone="pink">
                <Section
                  title="Platform Uyarıları"
                  right={
                    <Btn
                      title="Tümü"
                      small
                      outline
                      onPress={() => app.nav("notifications")}
                    />
                  }
                />
                {alerts.data?.slice(0, 4).map((a) => (
                  <View
                    key={a.id}
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: "#34334f",
                      paddingBottom: 12,
                    }}
                  >
                    <RowView style={{ alignItems: "flex-start" }}>
                      <Icon name="notifications-outline" tone="purple" />
                      <View style={{ flex: 1 }}>
                        <Txt bold size={13}>
                          {a.title}
                        </Txt>
                        <Txt muted size={11}>
                          {a.body}
                        </Txt>
                      </View>
                    </RowView>
                  </View>
                ))}
                {!alerts.data?.length && (
                  <Txt muted size={12}>
                    Yeni platform uyarısı yok.
                  </Txt>
                )}
              </Card>
            ) : staff ? (
              <Card tone="pink">
                <Section title="Hızlı Hizmet Şablonları" />
                {b?.services
                  .filter(
                    (service) =>
                      service.active &&
                      b.staff_services?.some(
                        (a) =>
                          a.staff_id === app.staffId &&
                          a.service_id === service.id,
                      ),
                  )
                  .map((service) => (
                    <RowView
                      key={service.id}
                      style={{
                        justifyContent: "space-between",
                        borderWidth: 1,
                        borderColor: colors.purple + "50",
                        padding: 9,
                        borderRadius: 12,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Txt bold size={12}>
                          {service.name}
                        </Txt>
                        <Txt muted size={10}>
                          {service.duration_minutes} dk ·{" "}
                          {money(service.price_cents)}
                        </Txt>
                      </View>
                      <Btn
                        title="Başla"
                        icon="play"
                        small
                        onPress={() =>
                          app.nav("start", { service_id: service.id })
                        }
                      />
                    </RowView>
                  ))}
              </Card>
            ) : (
              <Card tone="pink">
                <Section title="En Yoğun Saatler" />
                {v.hours?.length ? (
                  <Bars
                    rows={v.hours.map((h: Row) => ({
                      ...h,
                      label: String(h.hour).padStart(2, "0") + ":00",
                    }))}
                    keyValue="count"
                    label="label"
                  />
                ) : (
                  <Txt muted size={12}>
                    Tamamlanan işlemlerden saat dağılımı oluşur.
                  </Txt>
                )}
              </Card>
            )}
          </Columns>
          {!admin && !staff && (
            <Columns>
              <Card tone="purple">
                <Section
                  title="Hizmet ve Fiyatlar"
                  right={
                    <Btn
                      title="Tümü"
                      small
                      outline
                      onPress={() => app.nav("services")}
                    />
                  }
                />
                {b?.services
                  .filter((s) => s.active)
                  .slice(0, 5)
                  .map((service) => (
                    <RowView
                      key={service.id}
                      style={{
                        justifyContent: "space-between",
                        borderBottomWidth: 1,
                        borderBottomColor: "#34334f",
                        paddingBottom: 9,
                      }}
                    >
                      <Icon name="cut-outline" tone="pink" />
                      <View style={{ flex: 1 }}>
                        <Txt bold size={12}>
                          {service.name}
                        </Txt>
                        <Txt muted size={10}>
                          {service.duration_minutes} dk
                        </Txt>
                      </View>
                      <Txt bold size={12}>
                        {money(service.price_cents)}
                      </Txt>
                    </RowView>
                  ))}
              </Card>
              <Card tone="pink">
                <Section title="Çalışan Performansı" />
                {v.staff?.slice(0, 5).map((employee: Row) => (
                  <RowView key={employee.id}>
                    <Avatar url={employee.photo_url} />
                    <View style={{ flex: 1 }}>
                      <Txt bold size={13}>
                        {employee.name}
                      </Txt>
                      <Txt muted size={11}>
                        {employee.completed} tıraş ·{" "}
                        {money(employee.service_cents)}
                      </Txt>
                    </View>
                    <Btn
                      title="Detay"
                      small
                      outline
                      onPress={() =>
                        app.nav("reports", {
                          business_id: app.businessId,
                          staff_id: employee.id,
                        })
                      }
                    />
                  </RowView>
                ))}
              </Card>
            </Columns>
          )}
        </>
      )}
      {!admin && !staff && flow}
      {!staff && (
        <>
          <Section title="Hızlı İşlemler" />
          <RowView style={{ flexWrap: "wrap" }}>
            {[
              ["management", "İşletme Yönetimi", "storefront-outline", "pink"],
              ["appointments", "Randevular", "calendar-outline", "cyan"],
              ["finance", "Platform Ödemeleri", "card-outline", "gold"],
              ["customers", "Müşteri Defteri", "people-outline", "purple"],
            ].map(([target, title, icon, tone]) => (
              <QuickAction
                key={target}
                title={title}
                icon={icon}
                tone={tone as Tone}
                onPress={() => app.nav(target)}
              />
            ))}
          </RowView>
        </>
      )}
      {staff && (
        <RowView style={{ flexWrap: "wrap" }}>
          <Btn
            title="Müşteri Defterim"
            outline
            small
            tone="cyan"
            onPress={() => app.nav("customers")}
          />
          <Btn
            title="Müşteri Sırası / Talepler"
            outline
            small
            onPress={() => app.nav("requests")}
          />
          {(app.boot?.is_admin ||
            app.boot?.memberships.some(
              (m) =>
                m.business_id === app.businessId &&
                (m as Row).can_manage_services,
            )) && (
            <Btn
              title="Hizmetler ve Fiyatlar"
              small
              outline
              tone="gold"
              onPress={() => app.nav("services")}
            />
          )}
        </RowView>
      )}
      {admin && (
        <Card tone="gold">
          <Section title="Platform Araçları" icon="settings-outline" />
          <Txt muted size={12}>
            Demo verileriyle müşteri, usta ve işletme akışlarını deneyebilirsin.
          </Txt>
          <Btn
            title={
              app.boot?.demo_batches.length
                ? "Demo Verileri Kaldır"
                : "Demo Verileri Yükle"
            }
            tone={app.boot?.demo_batches.length ? "red" : "pink"}
            onPress={() =>
              app.run(
                app.boot?.demo_batches.length ? "demo_remove" : "demo_load",
                {},
                app.boot?.demo_batches.length
                  ? "Demo verileri kaldırıldı."
                  : "Demo verileri yüklendi.",
              )
            }
          />
          <RowView style={{ flexWrap: "wrap" }}>
            <Btn
              title="Tahsilat / Sistem Ayarları"
              outline
              tone="gold"
              small
              onPress={() => app.nav("editor", { kind: "settings" })}
            />
            <Btn
              title="Denetim Kayıtları"
              outline
              small
              onPress={() => app.nav("audit")}
            />
          </RowView>
        </Card>
      )}
    </Page>
  );
}
