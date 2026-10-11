import React, { useState } from "react";
import { Linking, View } from "react-native";
import { useApp } from "../app/Context";
import { useData } from "../hooks/useData";
import { Row, Business } from "../types";
import {
  Page,
  Section,
  Card,
  Txt,
  Btn,
  RowView,
  Chips,
  Stat,
  StatsGrid,
  State,
  AmountLine,
  Badge,
  Field,
  Bars,
  Chip,
} from "../components/ui";
import { money } from "../utils/money";
import { dateTime, dateRange, periodOptions, localDate } from "../utils/dates";
import { receiptUrl } from "../services/files";
export function paymentState(p: Row) {
  const debt = Number(p.charge_cents) - Number(p.paid_cents);
  if (debt <= 0 && Number(p.charge_cents) > 0) return "Ödendi";
  if (Number(p.pending_cents) > 0)
    return Number(p.pending_cents) < debt
      ? "Kısmi Ödeme Bildirildi"
      : "Ödeme Kontrol Ediliyor";
  if (new Date(p.due_at).getTime() < Date.now() && debt > 0) return "Gecikti";
  if (Number(p.paid_cents) > 0) return "Kısmen Ödendi";
  if (Number(p.rejected_count) > 0)
    return "Ödeme Reddedildi / Düzeltme Bekleniyor";
  return new Date(p.due_at).getTime() > Date.now()
    ? "Henüz Vadesi Gelmedi"
    : "Ödeme Bekleniyor";
}
export function FinanceScreen() {
  const app = useApp(),
    admin = app.role === "admin";
  const business =
    app.route.params?.business_id || (!admin ? app.businessId : null);
  const r = useData<Row>("finance", { business_id: business });
  const [status, setStatus] = useState("all");
  const data = r.data;
  return (
    <Page>
      <Section
        title={admin ? "Tahsilat ve borç yönetimi" : "Platform ödemeleri"}
        subtitle="Müşteri hizmet ödemeleriyle platform tahsilatları ayrı tutulur."
      />
      <State loading={r.loading && !data} error={r.error} onRetry={r.reload} />
      {data && (
        <>
          <StatsGrid>
            <Stat
              label="Tahakkuk eden platform bedeli"
              value={money(
                data.balances.reduce(
                  (n: number, b: Row) => n + Number(b.accrued_cents),
                  0,
                ),
              )}
              icon="cash-outline"
              tone="green"
            />
            <Stat
              label="Onaylı tahsilat"
              value={money(
                data.balances.reduce(
                  (n: number, b: Row) => n + Number(b.collected_cents),
                  0,
                ),
              )}
              icon="card-outline"
            />
            <Stat
              label="Kalan borç / alacak"
              value={money(
                data.balances.reduce(
                  (n: number, b: Row) => n + Number(b.balance_cents),
                  0,
                ),
              )}
              icon="time-outline"
              tone="gold"
            />
          </StatsGrid>
          {!admin && (
            <Card tone="cyan">
              <Txt bold>Havale / EFT bilgileri</Txt>
              <Txt>
                {app.boot?.settings.payment_instructions?.recipient ||
                  "Alıcı henüz tanımlanmadı."}
              </Txt>
              <Txt tone="cyan">
                {app.boot?.settings.payment_instructions?.iban ||
                  "IBAN henüz Admin tarafından eklenmedi."}
              </Txt>
              <Txt muted>{app.boot?.settings.payment_instructions?.note}</Txt>
              <Btn
                title="Haftalık / Aylık Ödeme Planım"
                outline
                tone="cyan"
                onPress={() =>
                  app.nav("editor", { kind: "plan", business_id: business })
                }
              />
            </Card>
          )}
          <Section title="İşletme gelir detayları" />
          {data.balances.map((b: Row) => (
            <Card key={b.business_id} tone="pink">
              <RowView>
                <Txt bold size={18}>
                  {b.business_name}
                </Txt>
                {b.demo_batch_id && <Chip label="DEMO" selected tone="gold" />}
              </RowView>
              <AmountLine
                label="Toplam hizmet bedeli tahakkuku"
                value={money(b.accrued_cents)}
              />
              <AmountLine
                label="Gerçekleşen platform tahsilatı"
                value={money(b.collected_cents)}
              />
              <AmountLine
                label="Kalan borç / alacak"
                value={money(b.balance_cents)}
                total
              />
              {admin && (
                <RowView>
                  <Btn
                    title="İşletme Detayları"
                    small
                    outline
                    onPress={() =>
                      app.nav("finance", { business_id: b.business_id })
                    }
                  />
                  <Btn
                    title="Özel Hizmet Bedeli"
                    small
                    outline
                    tone="gold"
                    onPress={() =>
                      app.nav("editor", {
                        kind: "fee",
                        business_id: b.business_id,
                      })
                    }
                  />
                </RowView>
              )}
            </Card>
          ))}
          <Section title="Ödeme dönemleri" />
          {data.periods.map((p: Row) => (
            <Card
              key={p.id}
              tone={paymentState(p) === "Gecikti" ? "red" : "gold"}
            >
              <Txt bold>{p.business_name}</Txt>
              <Txt bold>
                {dateTime(p.starts_at)} — {dateTime(p.ends_at)}
              </Txt>
              <Txt tone="gold">{paymentState(p)}</Txt>
              <Txt muted>Vade: {dateTime(p.due_at)}</Txt>
              <AmountLine
                label="Dönem platform hizmet bedeli"
                value={money(p.charge_cents)}
              />
              <AmountLine label="Onaylı ödeme" value={money(p.paid_cents)} />
              <AmountLine
                label="Kontrol bekleyen bildirim"
                value={money(p.pending_cents)}
              />
              <AmountLine
                label="Kalan borç"
                value={money(Number(p.charge_cents) - Number(p.paid_cents))}
                total
              />
              {Number(p.charge_cents) > Number(p.paid_cents) && (
                <Btn
                  title="Ödeme Yaptım / Bildir"
                  onPress={() =>
                    app.nav("editor", {
                      kind: "payment_claim",
                      business_id: p.business_id,
                      period_id: p.id,
                    })
                  }
                />
              )}
            </Card>
          ))}
          {!data.periods.length && (
            <State empty="Tamamlanan işlemlerin platform bedelleri burada dönemlere ayrılır." />
          )}
          <Section title="Ödeme bildirimleri" />
          <Chips
            items={[
              { value: "all", label: "Tümü" },
              { value: "pending", label: "Kontrol bekliyor" },
              { value: "approved", label: "Onaylandı" },
              { value: "rejected", label: "Reddedildi" },
            ]}
            value={status}
            onChange={setStatus}
          />
          {data.claims
            .filter((c: Row) => status === "all" || c.state === status)
            .map((c: Row) => (
              <Card
                key={c.id}
                tone={
                  c.state === "approved"
                    ? "green"
                    : c.state === "rejected"
                      ? "red"
                      : "pink"
                }
              >
                <RowView style={{ justifyContent: "space-between" }}>
                  <Txt bold>{c.business_name}</Txt>
                  <Badge state={c.state} />
                </RowView>
                <Txt bold size={26} tone="gold">
                  {money(c.amount_cents)}
                </Txt>
                <Txt muted>
                  {c.method === "cash" ? "Nakit" : "Havale / EFT"} ·{" "}
                  {dateTime(c.paid_at)}
                </Txt>
                {c.explanation && <Txt>{c.explanation}</Txt>}
                {c.review_reason && <Txt tone="red">{c.review_reason}</Txt>}
                {c.receipt_path && (
                  <Btn
                    title="Dekontu Görüntüle"
                    outline
                    small
                    tone="cyan"
                    onPress={async () => {
                      try {
                        await Linking.openURL(await receiptUrl(c.receipt_path));
                      } catch (e) {
                        app.toast((e as Error).message, true);
                      }
                    }}
                  />
                )}{" "}
                {admin && c.state === "pending" && (
                  <>
                    <Txt muted size={12}>
                      Banka hareketini veya nakit tahsilatı kontrol ettikten
                      sonra onaylayın.
                    </Txt>
                    <RowView>
                      <Btn
                        title="Tahsilatı Onayla"
                        tone="green"
                        small
                        onPress={() =>
                          app.run(
                            "payment_approve",
                            { id: c.id },
                            "Ödeme doğrulandı; borç güncellendi.",
                          )
                        }
                      />
                      <Btn
                        title="Reddet / Düzeltme İste"
                        outline
                        tone="red"
                        small
                        onPress={() =>
                          app.nav("editor", {
                            kind: "payment_reject",
                            id: c.id,
                          })
                        }
                      />
                    </RowView>
                  </>
                )}
              </Card>
            ))}
          <Section title="Ödeme planları" />
          {data.plans.map((p: Row) => (
            <Card key={p.business_id}>
              <Txt bold>{p.business_name}</Txt>
              <Txt>
                {p.cadence === "weekly" ? "Haftalık" : "Aylık"} · Gün{" "}
                {p.day_number} ·{" "}
                {p.approved ? "Onaylandı" : "Admin onayı bekleniyor"}
              </Txt>
              {admin && !p.approved && (
                <Btn
                  title="Planı Onayla"
                  outline
                  tone="green"
                  small
                  onPress={() =>
                    app.run("plan_approve", { business_id: p.business_id })
                  }
                />
              )}
              <Btn
                title="Planı Düzenle"
                outline
                small
                onPress={() =>
                  app.nav("editor", {
                    kind: "plan",
                    business_id: p.business_id,
                  })
                }
              />
            </Card>
          ))}
          {admin && (
            <>
              <Section title="Hizmet bedeli geçmişi" />
              {data.rules.map((p: Row) => (
                <Card key={p.id}>
                  <Txt>
                    İşletme{" "}
                    {p.business_id
                      ? data.balances.find(
                          (b: Row) => b.business_id === p.business_id,
                        )?.business_name || p.business_id
                      : "Genel varsayılan"}
                  </Txt>
                  <Txt tone="gold">
                    {money(p.fee_cents)}
                    {p.fee_bps ? ` + %${p.fee_bps / 100}` : ""}
                  </Txt>
                  <Txt muted>Başlangıç: {dateTime(p.valid_from)}</Txt>
                </Card>
              ))}
            </>
          )}
        </>
      )}
    </Page>
  );
}
export function ReportsScreen() {
  const app = useApp(),
    p = app.route.params || {},
    admin = app.role === "admin";
  const [period, setPeriod] = useState("month"),
    [from, setFrom] = useState(localDate()),
    [to, setTo] = useState(localDate());
  const [chosenBusiness, setChosenBusiness] = useState<string | null>(
      p.business_id || null,
    ),
    [chosenStaff, setChosenStaff] = useState<string | null>(p.staff_id || null),
    [chosenService, setChosenService] = useState<string | null>(null);
  const directory = useData<Business[]>("directory", {}, admin);
  const business = admin ? chosenBusiness : app.businessId;
  const b = useData<Business>(
    "business",
    { business_id: business },
    !!business,
  );
  let range: Row = {},
    dateError: string | null = null;
  try {
    range = dateRange(period, from, to);
  } catch (e) {
    dateError = (e as Error).message;
  }
  const r = useData<Row>(
    "stats",
    {
      ...range,
      period,
      business_id: business,
      staff_id: app.role === "staff" ? app.staffId : chosenStaff,
      service_id: chosenService,
    },
    !dateError,
  );
  const data = dateError ? null : r.data;
  const selectBusiness = (id: string) => {
    setChosenBusiness(id === "all" ? null : id);
    setChosenStaff(null);
    setChosenService(null);
  };
  return (
    <Page>
      <Section
        title={
          app.role === "staff"
            ? "Usta performansım"
            : "Gelir ve performans raporları"
        }
      />
      <Chips
        items={periodOptions.map(([value, label]) => ({ value, label }))}
        value={period}
        onChange={setPeriod}
      />
      {period === "custom" && (
        <Card>
          <Field
            label="Başlangıç (YYYY-AA-GG)"
            value={from}
            onChange={setFrom}
          />
          <Field label="Bitiş (YYYY-AA-GG)" value={to} onChange={setTo} />
        </Card>
      )}
      {admin && (
        <Chips
          items={[
            { value: "all", label: "Tüm işletmeler" },
            ...(directory.data?.map((b) => ({ value: b.id, label: b.name })) ||
              []),
          ]}
          value={chosenBusiness || "all"}
          onChange={selectBusiness}
        />
      )}
      {b.data && (
        <Card tone="cyan">
          {app.role !== "staff" && (
            <>
              <Txt muted size={11}>
                Usta filtresi
              </Txt>
              <Chips
                items={[
                  { value: "all", label: "Tüm ustalar" },
                  ...b.data.staff.map((s) => ({ value: s.id, label: s.name })),
                ]}
                value={chosenStaff || "all"}
                onChange={(id) => setChosenStaff(id === "all" ? null : id)}
              />
            </>
          )}
          <Txt muted size={11}>
            Hizmet filtresi
          </Txt>
          <Chips
            items={[
              { value: "all", label: "Tüm hizmetler" },
              ...b.data.services.map((s) => ({ value: s.id, label: s.name })),
            ]}
            value={chosenService || "all"}
            onChange={(id) => setChosenService(id === "all" ? null : id)}
          />
        </Card>
      )}
      <State
        loading={r.loading && !data}
        error={dateError || r.error}
        onRetry={r.reload}
      />
      {data && (
        <>
          <StatsGrid>
            <Stat
              label="Tamamlanan işlem"
              value={data.completed}
              icon="cut-outline"
              tone="gold"
            />
            <Stat
              label="Net hizmet geliri"
              value={money(data.service_cents)}
              icon="cash-outline"
              tone="green"
            />
            <Stat
              label="Platform tahakkuku"
              value={money(data.fee_cents)}
              icon="card-outline"
            />
            {app.role !== "staff" && (
              <Stat
                label="İşletme platform tahsilatı"
                value={money(data.collected_cents)}
                icon="checkmark-circle-outline"
                tone="cyan"
              />
            )}
            <Stat
              label="Tekil müşteri"
              value={data.unique_customers}
              icon="people-outline"
            />
            <Stat
              label="Yeni müşteri"
              value={data.new_customers}
              icon="person-add-outline"
              tone="green"
            />
            <Stat
              label="Tekrar gelen müşteri"
              value={data.returning_customers}
              icon="repeat-outline"
              tone="cyan"
            />
            <Stat
              label="Çat kapı işlemi"
              value={data.walkin_count}
              icon="walk-outline"
              tone="gold"
            />
            <Stat
              label="Ortalama süre"
              value={`${data.avg_minutes} dk`}
              icon="time-outline"
              tone="purple"
            />
            <Stat
              label="İptal"
              value={data.cancelled}
              icon="close-circle-outline"
              tone="red"
            />
            <Stat
              label="Gelmeyen müşteri"
              value={data.no_show}
              icon="alert-circle-outline"
              tone="gold"
            />
            <Stat
              label={chosenService ? "Bu hizmetle doluluk" : "Çalışma doluluğu"}
              value={`%${data.occupancy_percent}`}
              icon="speedometer-outline"
              tone="cyan"
            />
            <Stat
              label="Hizmette geçen süre"
              value={`${Math.round((data.busy_minutes / 60) * 10) / 10} sa`}
              icon="timer-outline"
            />
            <Stat
              label="Planlanan boş süre"
              value={`${Math.round((data.idle_minutes / 60) * 10) / 10} sa`}
              icon="hourglass-outline"
              tone="purple"
            />
          </StatsGrid>
          <Txt muted size={11}>
            Doluluk güncel çalışma saatleri ve kayıtlı tamamlanmış işlemlerle
            hesaplanır; uzun aralıklarda son 366 gün kullanılır. Platform
            tahsilatı işletme düzeyindedir; usta/hizmet filtresine bölünmez.
          </Txt>
          {data.previous && (
            <Card tone="purple">
              <Txt bold>Önceki dönemle karşılaştır</Txt>
              <AmountLine
                label="Önceki dönem tamamlanan işlem"
                value={String(data.previous.completed)}
              />
              <AmountLine
                label="Önceki dönem net hizmet geliri"
                value={money(data.previous.service_cents)}
              />
              <Txt tone="cyan">
                İşlem farkı:{" "}
                {Number(data.completed) - Number(data.previous.completed)} ·
                Gelir farkı:{" "}
                {money(
                  Number(data.service_cents) -
                    Number(data.previous.service_cents),
                )}
              </Txt>
            </Card>
          )}
          {admin && (
            <>
              <Section title="İşletme bazında platform geliri" />
              {data.businesses.map((b: Row) => (
                <Card key={b.id} tone="pink">
                  <RowView>
                    <Txt bold size={19}>
                      {b.name}
                    </Txt>
                    {b.demo_batch_id && (
                      <Chip label="DEMO" selected tone="gold" />
                    )}
                  </RowView>
                  <AmountLine
                    label="Tamamlanan işlem"
                    value={String(b.completed)}
                  />
                  <AmountLine
                    label="Uygulamadan gelen işlem"
                    value={String(b.app_count)}
                  />
                  <AmountLine
                    label="Seçilen dönem platform bedeli"
                    value={money(b.fee_cents)}
                  />
                  <AmountLine
                    label="Seçilen dönemde onaylı tahsilat"
                    value={money(b.collected_cents)}
                  />
                  <AmountLine
                    label="Tüm dönemlerden kalan borç"
                    value={money(b.balance_cents)}
                    total
                  />
                  <RowView>
                    <Btn
                      title="Usta Kırılımı"
                      outline
                      small
                      tone="cyan"
                      onPress={() => selectBusiness(b.id)}
                    />
                    <Btn
                      title="Ödeme Durumu"
                      outline
                      small
                      tone="gold"
                      onPress={() => app.nav("finance", { business_id: b.id })}
                    />
                  </RowView>
                </Card>
              ))}
            </>
          )}
          <Section title="Çalışan bazında kırılım" />
          {data.staff.map((s: Row) => (
            <Card key={s.id} tone="cyan">
              <Txt bold size={20}>
                {s.name}
              </Txt>
              <AmountLine
                label="Tamamlanan tıraş"
                value={String(s.completed)}
              />
              <AmountLine
                label="Net hizmet geliri"
                value={money(s.service_cents)}
              />
              <AmountLine label="Platform bedeli" value={money(s.fee_cents)} />
              <AmountLine
                label="Ortalama süre"
                value={`${s.avg_minutes} dakika`}
              />
              <AmountLine
                label="Uygulamadan gelen işlem"
                value={String(s.app_customers)}
              />
              <AmountLine
                label="Memnuniyet"
                value={
                  Number(s.rating) > 0
                    ? `${s.rating} / 5`
                    : "Henüz değerlendirme yok"
                }
              />
              <AmountLine
                label="Bu ayın müşteri hedefi"
                value={`${s.month_completed} / ${s.target_monthly} · %${s.target_monthly ? Math.round((100 * s.month_completed) / s.target_monthly) : 0}`}
              />
            </Card>
          ))}
          <Section title="Hizmet dağılımı" />
          {data.services.map((s: Row) => (
            <Card key={s.id}>
              <Txt bold>
                {s.name} · {s.count} işlem
              </Txt>
              <Txt tone="gold">{money(s.service_cents)}</Txt>
            </Card>
          ))}
          <Section title="Günlük gelir akışı" />
          <Card>
            {data.daily.length ? (
              <Bars
                rows={data.daily}
                label="day"
                keyValue="service_cents"
                currency
              />
            ) : (
              <State empty="Bu dönemde gelir hareketi yok." />
            )}
          </Card>
          <Section title="En yoğun saatler" />
          <Card>
            {data.hours.length ? (
              <Bars
                rows={data.hours.map((h: Row) => ({
                  ...h,
                  label: String(h.hour).padStart(2, "0") + ":00",
                }))}
                label="label"
                keyValue="count"
              />
            ) : (
              <State empty="Saat dağılımı için tamamlanmış işlem bekleniyor." />
            )}
          </Card>
        </>
      )}
    </Page>
  );
}
