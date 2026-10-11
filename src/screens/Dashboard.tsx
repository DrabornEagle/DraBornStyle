import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { useApp } from "../app/Context";
import { useData } from "../hooks/useData";
import { Row, Business } from "../types";
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
  Badge,
  Bars,
  State,
  Field,
} from "../components/ui";
import { money } from "../utils/money";
import {
  dateRange,
  periodOptions,
  atLocal,
  localDate,
  addDays,
} from "../utils/dates";
import { AppointmentCard } from "./Appointments";
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
      {staff && staffItems && (
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
  const [period, setPeriod] = useState("today"),
    [returnMinutes, setReturnMinutes] = useState("30");
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
  const b = useData<Business>(
    "business",
    { business_id: app.businessId },
    !!app.businessId,
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
  const active = sessions.data?.find((s) => s.state === "active");
  const s = b.data?.staff.find((s) => s.id === app.staffId);
  const v = stats.data;
  return (
    <Page>
      <Hero
        title={
          admin
            ? "DraBornStyle Admin"
            : staff
              ? `Merhaba, ${s?.name || "Usta"}`
              : `Merhaba, ${b.data?.name || "İşletmen"}`
        }
        subtitle={
          admin
            ? "Platform genel görünümü · İşin ritmini takip et."
            : staff
              ? "Bugün harika saçlar, mutlu müşteriler."
              : "İşletmeni, ekibini ve kazancını tek yerden yönet."
        }
        image={b.data?.cover_url}
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
          <Card tone="green">
            <RowView>
              {s && <Avatar url={s.photo_url} />}
              <Badge state={s?.state?.status || "available"} />
            </RowView>
            <Field
              label="Mola / meşguliyet dönüş süresi (dakika)"
              value={returnMinutes}
              onChange={setReturnMinutes}
              numeric
            />
            <RowView style={{ flexWrap: "wrap" }}>
              {[
                ["available", "Müsait"],
                ["waiting", "Müşteri bekliyorum"],
                ["break", "Moladayım"],
                ["busy", "Geçici meşgul"],
                ["off", "Mesaim bitti"],
              ].map(([state, label]) => (
                <Btn
                  key={state}
                  title={label}
                  outline
                  small
                  tone={
                    state === "available"
                      ? "green"
                      : state === "off"
                        ? "purple"
                        : "gold"
                  }
                  onPress={() => {
                    if (
                      ["break", "busy"].includes(state) &&
                      (!Number.isInteger(Number(returnMinutes)) ||
                        Number(returnMinutes) < 1 ||
                        Number(returnMinutes) > 480)
                    ) {
                      app.toast(
                        "1–480 dakika arasında dönüş süresi yazın.",
                        true,
                      );
                      return;
                    }
                    return app.run("staff_status", {
                      business_id: app.businessId,
                      staff_id: app.staffId,
                      status: state,
                      ...(["break", "busy"].includes(state)
                        ? {
                            return_at: new Date(
                              Date.now() + Number(returnMinutes) * 60000,
                            ).toISOString(),
                          }
                        : {}),
                    });
                  }}
                />
              ))}
            </RowView>
            <Txt muted size={11}>
              Dönüş sürenizi belirleyerek mola veya meşguliyet başlatın.
              Randevularınız korunur, etkilenen müşterilere uyarı gönderilir.
            </Txt>
          </Card>
          <Btn
            title="Müşteri Defterim"
            outline
            small
            tone="cyan"
            onPress={() => app.nav("customers")}
          />
          {app.boot?.memberships.some(
            (m) =>
              m.business_id === app.businessId &&
              (m as Row).can_manage_services,
          ) || app.boot?.is_admin ? (
            <Btn
              title="Hizmetler ve Fiyatlar"
              outline
              small
              tone="gold"
              onPress={() => app.nav("services")}
            />
          ) : null}
          <Btn
            title="Müşteri Sırası / Talepler"
            small
            outline
            tone="cyan"
            onPress={() => app.nav("requests")}
          />
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
            {admin && (
              <>
                <Stat
                  label="Toplam işletme"
                  value={v.business_count}
                  icon="storefront-outline"
                />
                <Stat
                  label="Aktif usta"
                  value={v.staff_count}
                  icon="people-outline"
                  tone="cyan"
                />
              </>
            )}
            <Stat
              label="Tamamlanan tıraş"
              value={v.completed}
              icon="cut-outline"
              tone="gold"
            />
            <Stat
              label={admin ? "Tahakkuk eden gelir" : "Hizmet geliri"}
              value={money(admin ? v.fee_cents : v.service_cents)}
              icon="cash-outline"
              tone="green"
            />
            {!staff && (
              <>
                <Stat
                  label="Tahsil edilen platform tutarı"
                  value={money(v.collected_cents)}
                  icon="card-outline"
                  tone="pink"
                />
                <Stat
                  label="Tüm dönemlerden kalan borç"
                  value={money(
                    finance.data?.balances.reduce(
                      (n: number, b: Row) => n + Number(b.balance_cents),
                      0,
                    ) || 0,
                  )}
                  icon="time-outline"
                  tone="red"
                />
              </>
            )}
            <Stat
              label="Randevu sayısı"
              value={v.appointments}
              icon="calendar-outline"
              tone="cyan"
            />
            <Stat
              label="Ortalama işlem süresi"
              value={`${v.avg_minutes} dk`}
              icon="stopwatch-outline"
              tone="purple"
            />
          </StatsGrid>
          <Card tone="pink">
            <Section title="Günlük gelir akışı" />
            {v.daily.length ? (
              <Bars
                rows={v.daily}
                label="day"
                keyValue={admin ? "fee_cents" : "service_cents"}
                currency
              />
            ) : (
              <State empty="Seçilen dönemde tamamlanmış işlem yok." />
            )}
          </Card>
        </>
      )}
      {!admin && (
        <>
          <Section
            title="Bugünün randevu akışı"
            right={
              <Btn
                title="Tümü"
                small
                outline
                onPress={() => app.nav("appointments")}
              />
            }
          />
          {appointments.data?.slice(0, 6).map((a) => (
            <AppointmentCard
              key={a.id}
              a={a}
              owner
              onPress={() => app.nav("appointment", { id: a.id })}
            />
          ))}
          {appointments.data?.length === 0 && (
            <State empty="Bugün için henüz randevu yok." />
          )}
        </>
      )}
      {!staff && (
        <>
          <Section title="Hızlı işlemler" />
          <RowView style={{ flexWrap: "wrap" }}>
            {[
              ["management", "İşletme Yönetimi", "storefront-outline"],
              ["appointments", "Randevular", "calendar-outline"],
              ["finance", "Platform Ödemeleri", "card-outline"],
              ["customers", "Müşteri Defteri", "people-outline"],
              ["reports", "Raporlar", "bar-chart-outline"],
            ].map(([name, label, icon]) => (
              <Btn
                key={name}
                title={label}
                outline
                small
                icon={icon}
                tone="cyan"
                onPress={() => app.nav(name)}
              />
            ))}
          </RowView>
        </>
      )}
      {admin && (
        <Card tone="gold">
          <Txt bold>Demo ile tüm rolleri dene</Txt>
          <Txt muted size={12}>
            3 işletme, 9 usta, örnek müşteri, randevu, sohbet, gelir ve kısmi
            ödeme kayıtları. Demo etiketiyle ayrılır.
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
        </Card>
      )}
    </Page>
  );
}
