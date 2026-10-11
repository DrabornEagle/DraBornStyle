import React, { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { useApp } from "../app/Context";
import { useData } from "../hooks/useData";
import { Business, Row } from "../types";
import { slots, quote } from "../services/api";
import {
  Page,
  Section,
  Card,
  Txt,
  Btn,
  Field,
  RowView,
  Chips,
  Chip,
  State,
  AmountLine,
  Avatar,
} from "../components/ui";
import { localDate, addDays, clock, dateLabel } from "../utils/dates";
import { money } from "../utils/money";
export function BookingScreen() {
  const app = useApp(),
    p = app.route.params || {};
  const business = useData<Business>("business", {
    business_id: p.business_id,
  });
  const b = business.data;
  const [staff, setStaff] = useState<string | null>(p.staff_id || null),
    [service, setService] = useState<string | null>(p.service_id || null),
    [date, setDate] = useState(
      localDate(p.appointment?.starts_at || new Date()),
    ),
    [time, setTime] = useState<string | null>(null);
  const [slotData, setSlots] = useState<Row[]>([]),
    [price, setPrice] = useState<Row | null>(null),
    [code, setCode] = useState(""),
    [appliedCode, setAppliedCode] = useState(""),
    [loading, setLoading] = useState(false),
    [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!b) return;
    setStaff((s) => s || b.staff.find((s) => s.active)?.id || null);
    setService((s) => s || b.services.find((s) => s.active)?.id || null);
  }, [b?.id]);
  const services =
    b?.services.filter(
      (s) =>
        s.active &&
        b.staff_services?.some(
          (x) => x.staff_id === staff && x.service_id === s.id,
        ),
    ) || [];
  useEffect(() => {
    if (
      b &&
      staff &&
      services.length &&
      !services.some((s) => s.id === service)
    )
      setService(services[0].id);
  }, [staff, b?.id]);
  useEffect(() => {
    let active = true;
    if (!staff || !service) return;
    setLoading(true);
    setError(null);

    Promise.all([
      slots(staff, service, date),
      quote(p.business_id, staff, service, appliedCode, p.customer_id),
    ])
      .then(([slots, price]) => {
        if (active) {
          setSlots(slots);
          setTime((t) =>
            slots.some((s) => s.starts_at === t && s.available) ? t : null,
          );
          setPrice(
            p.appointment
              ? {
                  base_cents: p.appointment.quoted_base_cents,
                  discount_cents: p.appointment.quoted_discount_cents,
                  service_cents: p.appointment.quoted_service_cents,
                  fee_cents: p.appointment.quoted_fee_cents,
                  total_cents:
                    p.appointment.quoted_service_cents +
                    Number(p.appointment.quoted_fee_cents),
                }
              : price,
          );
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [staff, service, date, app.revision, appliedCode]);
  async function submit() {
    if (!time || !staff || !service) return;
    const result = await app.run(
      p.appointment ? "reschedule" : "book",
      {
        business_id: p.business_id,
        staff_id: staff,
        service_id: service,
        starts_at: time,
        expected_service_cents: price?.service_cents,
        expected_fee_cents: price?.fee_cents,
        customer_id: p.customer_id,
        ...(p.appointment ? { id: p.appointment.id } : { code: appliedCode }),
      },
      p.appointment ? "Randevunuz değiştirildi." : "Randevunuz oluşturuldu.",
    );
    if (result) app.nav("appointment", { id: result.id });
    else app.refresh();
  }
  useEffect(() => setTime(null), [staff, service, date]);
  const pickedStaff = b?.staff.find((s) => s.id === staff);
  return (
    <Page>
      <Section
        title={p.appointment ? "Randevunu değiştir" : "Randevu takvimi"}
        subtitle={b?.name || "Hizmet, usta ve uygun saatini seç."}
      />
      <State
        loading={business.loading && !b}
        error={business.error}
        onRetry={business.reload}
      />
      {b && (
        <>
          <Card tone="pink">
            <Txt muted size={11}>
              1 · HİZMETİNİ SEÇ
            </Txt>
            <Chips
              items={services.map((s) => ({
                value: s.id,
                label: s.name + " · " + s.duration_minutes + " dk",
              }))}
              value={service}
              onChange={setService}
            />
            <Txt muted size={11}>
              2 · USTANI SEÇ
            </Txt>
            <Chips
              items={b.staff
                .filter((s) => s.active)
                .map((s) => ({ value: s.id, label: s.name }))}
              value={staff}
              onChange={setStaff}
            />
            {pickedStaff && (
              <RowView>
                <Avatar url={pickedStaff.photo_url} />
                <View>
                  <Txt bold>{pickedStaff.name}</Txt>
                  <Txt muted size={11}>
                    {pickedStaff.specialties}
                  </Txt>
                </View>
              </RowView>
            )}
          </Card>
          <Card tone="cyan">
            <Txt muted size={11}>
              3 · TARİH VE SAAT
            </Txt>
            <Field label="Tarih (YYYY-AA-GG)" value={date} onChange={setDate} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {Array.from({ length: 10 }, (_, i) =>
                addDays(localDate(), i),
              ).map((d) => (
                <Chip
                  key={d}
                  label={dateLabel(d + "T12:00:00+03:00")}
                  selected={date === d}
                  onPress={() => setDate(d)}
                />
              ))}
            </ScrollView>
            <State loading={loading} error={error} />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {!loading &&
                slotData.map((s) => (
                  <Chip
                    key={s.starts_at}
                    label={`${clock(s.starts_at)} · ${s.available ? "Müsait" : s.reason}`}
                    selected={time === s.starts_at}
                    tone={s.available ? "cyan" : "red"}
                    onPress={
                      s.available ? () => setTime(s.starts_at) : undefined
                    }
                  />
                ))}
            </View>
            {!loading && !error && !slotData.length && (
              <Txt muted>
                Bu gün çalışma saati yok. Başka gün seçin veya ekstra saat talep
                edin.
              </Txt>
            )}
          </Card>
          {!p.appointment && (
            <Card>
              <Field
                label="Ustanızın indirim kodu (isteğe bağlı)"
                value={code}
                onChange={setCode}
                placeholder="MEHMET15"
              />
              <Btn
                title="Kodu Uygula"
                outline
                small
                onPress={() => setAppliedCode(code)}
              />
            </Card>
          )}
          {price && (
            <Card tone="gold">
              <Txt bold>Randevu özeti</Txt>
              <AmountLine
                label="Normal hizmet fiyatı"
                value={money(price.base_cents)}
              />
              <AmountLine
                label="İndirim"
                value={"−" + money(price.discount_cents)}
              />
              <AmountLine
                label="Hizmet tutarı"
                value={money(price.service_cents)}
              />
              <AmountLine
                label="Platform hizmet bedeli"
                value={money(price.fee_cents)}
              />
              <AmountLine
                label="Toplam"
                value={money(price.total_cents)}
                total
              />
              <Txt muted size={11}>
                Ödeme işletmede yapılır. Nihai tutar işlem sonunda gösterilir.
              </Txt>
            </Card>
          )}
          <Btn
            title={p.appointment ? "Yeni Saati Onayla" : "Randevuyu Onayla"}
            onPress={submit}
            disabled={!time || loading || !!error}
            icon="calendar-outline"
          />
          {!p.appointment && (
            <RowView>
              <Btn
                title="Boş saat bildirimi"
                outline
                tone="cyan"
                small
                onPress={() =>
                  app.nav("editor", {
                    kind: "waitlist",
                    business_id: b.id,
                    staff_id: staff,
                    service_id: service,
                    date,
                  })
                }
              />
              <Btn
                title="Ekstra saat talebi"
                outline
                tone="gold"
                small
                onPress={() =>
                  app.nav("editor", {
                    kind: "extra",
                    business_id: b.id,
                    staff_id: staff,
                    service_id: service,
                    date,
                  })
                }
              />
            </RowView>
          )}
        </>
      )}
    </Page>
  );
}
