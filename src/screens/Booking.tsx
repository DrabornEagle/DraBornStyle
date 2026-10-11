import React, { useState, useEffect } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useApp } from "../app/Context";
import { useData } from "../hooks/useData";
import { Business, Row } from "../types";
import { slots, quote } from "../services/api";
import {
  Page,
  Hero,
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
  Columns,
  Icon,
} from "../components/ui";
import { Calendar } from "../components/Calendar";
import { localDate, clock, dateLabel } from "../utils/dates";
import { money } from "../utils/money";
import { colors } from "../theme";

export function BookingScreen() {
  const app = useApp(),
    p = app.route.params || {};
  const business = useData<Business>("business", {
    business_id: p.business_id,
  });
  const b = business.data;
  const [staff, setStaff] = useState<string | null>(p.staff_id || null),
    [service, setService] = useState<string | null>(p.service_id || null);
  const [date, setDate] = useState(
      localDate(p.appointment?.starts_at || p.starts_at || new Date()),
    ),
    [time, setTime] = useState<string | null>(p.starts_at || null);
  const [slotData, setSlots] = useState<Row[]>([]),
    [price, setPrice] = useState<Row | null>(null),
    [code, setCode] = useState(""),
    [appliedCode, setAppliedCode] = useState(""),
    [showCode, setShowCode] = useState(false),
    [loading, setLoading] = useState(false),
    [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!b) return;
    const assignment = b.staff_services?.find(
      (x) =>
        b.staff.some((s) => s.id === x.staff_id && s.active) &&
        b.services.some((s) => s.id === x.service_id && s.active) &&
        (!service || x.service_id === service),
    );
    setStaff((s) => s || assignment?.staff_id || null);
    setService((s) => s || assignment?.service_id || null);
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
    if (b && staff && !services.some((s) => s.id === service))
      setService(services[0]?.id || null);
  }, [staff, b?.id]);
  useEffect(() => {
    let active = true;
    if (!staff || !service) {
      setSlots([]);
      setPrice(null);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      slots(staff, service, date),
      quote(p.business_id, staff, service, appliedCode, p.customer_id),
    ])
      .then(([available, quotation]) => {
        if (!active) return;
        setSlots(available);
        setTime((t) =>
          available.some((s) => s.starts_at === t && s.available) ? t : null,
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
            : quotation,
        );
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
  function chooseStaff(id: string) {
    setTime(null);
    setStaff(id);
  }
  function chooseService(id: string) {
    setTime(null);
    setService(id);
  }
  function chooseDate(day: string) {
    setTime(null);
    setDate(day);
  }
  async function submit() {
    if (!time || !staff || !service || !price) return;
    const result = await app.run(
      p.appointment ? "reschedule" : "book",
      {
        business_id: p.business_id,
        staff_id: staff,
        service_id: service,
        starts_at: time,
        expected_service_cents: price.service_cents,
        expected_fee_cents: price.fee_cents,
        customer_id: p.customer_id,
        ...(p.appointment ? { id: p.appointment.id } : { code: appliedCode }),
      },
      p.appointment ? "Randevunuz değiştirildi." : "Randevunuz oluşturuldu.",
    );
    if (result) app.nav("appointment", { id: result.id });
    else app.refresh();
  }
  const pickedStaff = b?.staff.find((s) => s.id === staff),
    pickedService = b?.services.find((s) => s.id === service);
  return (
    <Page>
      <Hero
        title={p.appointment ? "Randevunu değiştir" : "Randevu takvimi"}
        eyebrow="MÜŞTERİ RANDEVU"
        subtitle={b?.name || "Hizmet, usta ve uygun saatini seç."}
      />
      <State
        loading={business.loading && !b}
        error={business.error}
        onRetry={business.reload}
      />
      {b && (
        <>
          <RowView style={{ justifyContent: "space-between" }}>
            {["Hizmet", "Usta", "Tarih & Saat"].map((label, i) => (
              <RowView key={label} style={{ gap: 6 }}>
                <View
                  style={{
                    width: 27,
                    height: 27,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.pink,
                    backgroundColor: "#aa26aa5c",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Txt bold size={12}>
                    {i + 1}
                  </Txt>
                </View>
                <Txt bold size={11}>
                  {label}
                </Txt>
              </RowView>
            ))}
          </RowView>
          <Columns>
            <Card tone="pink">
              <Section title="Hizmetini Seç" icon="cut-outline" />
              <Chips
                items={services.map((s) => ({
                  value: s.id,
                  label: s.name + " · " + s.duration_minutes + " dk",
                }))}
                value={service}
                onChange={chooseService}
              />
              {services.length === 0 && (
                <Txt muted>Bu ustaya henüz hizmet atanmamış.</Txt>
              )}
            </Card>
            <Card tone="purple">
              <Section title="Ustanı Seç" icon="person-outline" />
              <Chips
                items={b.staff
                  .filter((s) => s.active)
                  .map((s) => ({ value: s.id, label: s.name }))}
                value={staff}
                onChange={chooseStaff}
              />
              {pickedStaff && (
                <RowView>
                  <Avatar url={pickedStaff.photo_url} size={44} />
                  <View style={{ flex: 1 }}>
                    <Txt bold>{pickedStaff.name}</Txt>
                    <Txt muted size={11}>
                      {pickedStaff.specialties}
                    </Txt>
                  </View>
                  <Icon name="checkmark-circle" tone="pink" />
                </RowView>
              )}
            </Card>
          </Columns>
          <Columns>
            <Card tone="pink">
              <Calendar value={date} onChange={chooseDate} />
            </Card>
            <Card tone="cyan">
              <Section
                title="Uygun Saatler"
                icon="time-outline"
                subtitle={dateLabel(date + "T12:00:00+03:00")}
              />
              <State loading={loading} error={error} />
              <ScrollView
                style={{ maxHeight: 330 }}
                contentContainerStyle={{ gap: 9 }}
                nestedScrollEnabled
              >
                {!loading &&
                  slotData.map((s) => {
                    const selected = time === s.starts_at,
                      tone = s.available ? colors.cyan : colors.red;
                    return (
                      <Pressable
                        key={s.starts_at}
                        disabled={!s.available}
                        accessibilityRole="button"
                        accessibilityLabel={`${clock(s.starts_at)} · ${s.available ? "Müsait" : s.reason}`}
                        accessibilityState={{
                          selected,
                          disabled: !s.available,
                        }}
                        onPress={() => setTime(s.starts_at)}
                        style={{
                          borderWidth: 1,
                          borderColor: selected ? colors.pink : tone + "85",
                          backgroundColor: selected ? "#9f229b40" : tone + "10",
                          borderRadius: 12,
                          padding: 13,
                          opacity: s.available ? 1 : 0.65,
                        }}
                      >
                        <RowView>
                          <Txt bold size={18}>
                            {clock(s.starts_at)}
                          </Txt>
                          <Txt size={12} style={{ flex: 1, color: tone }}>
                            {s.available ? "Müsait" : s.reason}
                          </Txt>
                          <Icon
                            name={
                              selected
                                ? "checkmark-circle"
                                : s.available
                                  ? "ellipse-outline"
                                  : "lock-closed-outline"
                            }
                            size={22}
                            tone={
                              selected ? "pink" : s.available ? "cyan" : "red"
                            }
                          />
                        </RowView>
                      </Pressable>
                    );
                  })}
              </ScrollView>
              {!loading && !error && !slotData.length && (
                <Txt muted>
                  Bu gün uygun saat yok. Başka gün seçebilir veya ekstra saat
                  talep edebilirsin.
                </Txt>
              )}
            </Card>
          </Columns>
          {price && (
            <Card tone="gold">
              <Section title="Randevu Özeti" icon="receipt-outline" />
              <RowView>
                <Avatar url={pickedStaff?.photo_url} size={50} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt bold>
                    {pickedStaff?.name} · {pickedService?.name}
                  </Txt>
                  <Txt muted size={12}>
                    {dateLabel(date + "T12:00:00+03:00")}
                    {time ? " · " + clock(time) : " · Saat seçilmedi"} ·{" "}
                    {pickedService?.duration_minutes} dk
                  </Txt>
                </View>
              </RowView>
              <AmountLine
                label="Normal hizmet fiyatı"
                value={money(price.base_cents)}
              />
              {Number(price.discount_cents) > 0 && (
                <AmountLine
                  label="İndirim"
                  value={"−" + money(price.discount_cents)}
                />
              )}
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
          {!p.appointment && (
            <>
              <Btn
                title={showCode ? "İndirim Kodunu Gizle" : "İndirim Kodum Var"}
                outline
                small
                icon="pricetag-outline"
                onPress={() => setShowCode(!showCode)}
              />
              {showCode && (
                <Card>
                  <Field
                    label="Ustanızın indirim kodu (isteğe bağlı)"
                    value={code}
                    onChange={setCode}
                    placeholder="İndirim kodu"
                  />
                  <Btn
                    title="Kodu Uygula"
                    outline
                    small
                    onPress={() => setAppliedCode(code)}
                  />
                </Card>
              )}
              <Columns>
                <Btn
                  title="Boş saat bildirimi"
                  outline
                  tone="cyan"
                  small
                  icon="notifications-outline"
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
                  icon="time-outline"
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
              </Columns>
            </>
          )}
          <Btn
            title={p.appointment ? "Yeni Saati Onayla" : "Randevuyu Onayla"}
            onPress={submit}
            disabled={!time || !price || loading || !!error}
            icon="checkmark-circle-outline"
          />
        </>
      )}
    </Page>
  );
}
