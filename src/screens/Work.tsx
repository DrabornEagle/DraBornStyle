import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApp } from "../app/Context";
import { useData } from "../hooks/useData";
import { Business, Row } from "../types";
import {
  Page,
  Section,
  Card,
  Txt,
  Btn,
  Field,
  RowView,
  Chips,
  State,
  Avatar,
  AmountLine,
  Badge,
} from "../components/ui";
import { BusinessPicker } from "./Dashboard";
import { money, inputMoney, parseCents } from "../utils/money";
import { clock } from "../utils/dates";
export function StartScreen() {
  const app = useApp();
  const b = useData<Business>(
    "business",
    { business_id: app.businessId },
    !!app.businessId,
  );
  const customers = useData<Row[]>(
    "customers",
    { business_id: app.businessId },
    !!app.businessId,
  );
  const [service, setService] = useState<string | null>(null),
    [customer, setCustomer] = useState<string>("guest"),
    [name, setName] = useState("");
  const available =
    b.data?.services.filter(
      (s) =>
        s.active &&
        b.data?.staff_services?.some(
          (x) => x.staff_id === app.staffId && x.service_id === s.id,
        ),
    ) || [];
  useEffect(() => {
    if (!app.staffId) return;
    AsyncStorage.getItem("db_style_last_service_" + app.staffId).then((id) =>
      setService(
        available.some((s) => s.id === id) ? id : available[0]?.id || null,
      ),
    );
  }, [b.data?.id, app.staffId]);
  const picked = available.find((s) => s.id === service);
  return (
    <Page>
      <Section
        title="Tıraşa başla"
        subtitle="Kayıtlı müşteri veya misafir. Birkaç dokunuş yeterli."
      />
      <BusinessPicker staff />
      <State loading={b.loading} error={b.error} onRetry={b.reload} />
      <Card tone="pink">
        <Txt bold>Hızlı hizmet seçimi</Txt>
        <Chips
          items={available.map((s) => ({
            value: s.id,
            label: s.name + " · " + s.duration_minutes + " dk",
          }))}
          value={service}
          onChange={setService}
        />
        <Txt bold>Müşteri</Txt>
        <Chips
          items={[
            { value: "guest", label: "Misafir müşteri" },
            ...(customers.data?.map((c) => ({ value: c.id, label: c.name })) ||
              []),
          ]}
          value={customer}
          onChange={setCustomer}
        />
        {customer === "guest" && (
          <Field
            label="Misafir adı (isteğe bağlı)"
            value={name}
            onChange={setName}
            placeholder="Misafir Müşteri"
          />
        )}
        {picked && (
          <Txt tone="gold">
            {money(picked.price_cents)} hizmet · {picked.duration_minutes}{" "}
            dakika
          </Txt>
        )}
        <Txt muted size={12}>
          Platform hizmet bedeli, çat kapı müşteriler dahil her tamamlanan
          işlemde kaydedilir.
        </Txt>
        <Btn
          title="Tıraşa Başla"
          icon="cut-outline"
          disabled={!service || !app.staffId}
          onPress={async () => {
            const result = await app.run("start_session", {
              business_id: app.businessId,
              staff_id: app.staffId,
              service_id: service,
              ...(customer === "guest"
                ? { customer_name: name }
                : { customer_id: customer }),
            });
            if (result) {
              await AsyncStorage.setItem(
                "db_style_last_service_" + app.staffId,
                service!,
              );
              app.nav("session", { id: result.id });
            }
          }}
        />
      </Card>
    </Page>
  );
}
export function SessionScreen() {
  const app = useApp();
  const r = useData<Row[]>("sessions", { id: app.route.params?.id });
  const s = r.data?.[0];
  const [now, setNow] = useState(Date.now()),
    [price, setPrice] = useState(""),
    [reason, setReason] = useState(""),
    [paid, setPaid] = useState("paid"),
    [method, setMethod] = useState("cash"),
    [confirm, setConfirm] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (s) setPrice(inputMoney(s.service_cents ?? s.quoted_service_cents));
  }, [s?.id]);
  const seconds = s
    ? Math.max(
        0,
        Math.floor(
          ((s.completed_at ? new Date(s.completed_at).getTime() : now) -
            new Date(s.started_at).getTime()) /
            1000,
        ),
      )
    : 0;
  let cents = 0;
  try {
    cents = parseCents(price);
  } catch {}
  const active = s?.state === "active";
  return (
    <Page>
      <Section title={active ? "Tıraş devam ediyor" : "İşlem kaydı"} />
      <State loading={r.loading && !s} error={r.error} onRetry={r.reload} />
      {s && (
        <>
          <Card tone="cyan">
            <Txt bold size={23}>
              {s.customer_name}
            </Txt>
            <Txt muted>
              {s.staff_name} · {s.service_name}
            </Txt>
            <Badge state={s.state} />
            <Txt
              bold
              size={60}
              tone="cyan"
              style={{ textAlign: "center", fontVariant: ["tabular-nums"] }}
            >
              {String(Math.floor(seconds / 60)).padStart(2, "0")}:
              {String(seconds % 60).padStart(2, "0")}
            </Txt>
            <RowView style={{ justifyContent: "space-between" }}>
              <Txt muted>Başlangıç {clock(s.started_at)}</Txt>
              <Txt muted>Tahmini bitiş {clock(s.expected_end_at)}</Txt>
            </RowView>
            {active && now > new Date(s.expected_end_at).getTime() && (
              <Txt tone="gold">
                Tahmini süre aşıldı. Sonraki randevuları kontrol ederek süreyi
                uzatın.
              </Txt>
            )}
            {active && (
              <RowView>
                <Btn
                  title="+15 dakika"
                  outline
                  tone="cyan"
                  small
                  onPress={() =>
                    app.run("extend_session", { id: s.id, minutes: 15 })
                  }
                />
                <Btn
                  title="+30 dakika"
                  outline
                  tone="gold"
                  small
                  onPress={() =>
                    app.run("extend_session", { id: s.id, minutes: 30 })
                  }
                />
              </RowView>
            )}
          </Card>
          <Card tone="gold">
            {active ? (
              <>
                <Field
                  label="Nihai hizmet tutarı (TL)"
                  value={price}
                  onChange={(v) => {
                    setPrice(v);
                    setConfirm(false);
                  }}
                  numeric
                />
                <Field
                  label="Fiyat değişikliği nedeni"
                  value={reason}
                  onChange={setReason}
                />
                <Txt muted size={11}>
                  Randevuda gösterilen hizmet: {money(s.quoted_service_cents)}.
                  Değişiklik müşteriye açıkça gösterilerek kesinleştirilir.
                </Txt>
              </>
            ) : (
              <AmountLine
                label="Nihai hizmet tutarı"
                value={money(s.service_cents)}
              />
            )}
            <AmountLine
              label="Normal hizmet fiyatı"
              value={money(s.normal_price_cents)}
            />
            <AmountLine
              label="Uygulanan indirim"
              value={
                "−" +
                money(
                  active
                    ? Math.max(0, Number(s.normal_price_cents) - cents)
                    : s.discount_cents,
                )
              }
            />
            <AmountLine
              label="Platform hizmet bedeli"
              value={money(s.fee_cents ?? s.quoted_fee_cents)}
            />
            <AmountLine
              label="Müşteri toplamı"
              value={money(
                active ? cents + Number(s.quoted_fee_cents) : s.total_cents,
              )}
              total
            />
            {active && (
              <>
                <Chips
                  items={[
                    { value: "paid", label: "Müşteri ödedi" },
                    { value: "unpaid", label: "Henüz ödenmedi" },
                  ]}
                  value={paid}
                  onChange={setPaid}
                />
                <Chips
                  items={[
                    { value: "cash", label: "Nakit" },
                    { value: "card", label: "Kart" },
                    { value: "transfer", label: "Havale" },
                  ]}
                  value={method}
                  onChange={setMethod}
                />
                <Btn
                  title={
                    confirm
                      ? "Fiyatı Kesinleştir ve İşlemi Tamamla"
                      : "İşlemi Tamamla"
                  }
                  icon="checkmark-circle-outline"
                  onPress={async () => {
                    if (!confirm) {
                      setConfirm(true);
                      app.toast(
                        "Nihai tutarı müşteriyle kontrol edin. Onay butonuna tekrar dokunun.",
                      );
                      return;
                    }
                    try {
                      await app.run(
                        "finish_session",
                        {
                          id: s.id,
                          service_cents: parseCents(price),
                          reason,
                          paid: paid === "paid",
                          payment_method: method,
                        },
                        "İşlem ve platform hizmet bedeli kaydedildi.",
                      );
                    } catch (e) {
                      app.toast((e as Error).message, true);
                    }
                  }}
                />
              </>
            )}
            {!active && (
              <>
                <Txt muted>
                  Hizmet tahsilatı:{" "}
                  {s.service_payment_status === "paid"
                    ? "Ödendi"
                    : "Ödeme bekleniyor"}
                </Txt>
                {s.service_payment_status !== "paid" &&
                  s.state === "completed" && (
                    <Btn
                      title="Müşteri Ödemesini Kaydet"
                      outline
                      tone="green"
                      onPress={() =>
                        app.run("service_paid", {
                          id: s.id,
                          payment_method: "cash",
                        })
                      }
                    />
                  )}
                <Btn title="Yeni İşlem" onPress={() => app.nav("start")} />
                <Btn
                  title="Sonraki Randevuyu Oluştur"
                  outline
                  tone="cyan"
                  onPress={() =>
                    app.nav("booking", {
                      business_id: s.business_id,
                      staff_id: s.staff_id,
                      service_id: s.service_id,
                      customer_id: s.customer_id,
                    })
                  }
                />
                {s.state === "completed" &&
                  (app.role === "owner" || app.role === "admin") && (
                    <Btn
                      title="Hatalı İşlem / İade Ters Kaydı"
                      outline
                      tone="red"
                      small
                      onPress={() =>
                        app.nav("editor", { kind: "reverse", id: s.id })
                      }
                    />
                  )}
              </>
            )}
          </Card>
        </>
      )}
    </Page>
  );
}
