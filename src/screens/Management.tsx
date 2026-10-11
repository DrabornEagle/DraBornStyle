import React from "react";
import { View } from "react-native";
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
} from "../components/ui";
import { money } from "../utils/money";
import { dateTime } from "../utils/dates";
export function ManagementScreen() {
  const app = useApp();
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
      <Section title="İşletme yönetimi" />
      <BusinessPicker />
      <State loading={r.loading && !b} error={r.error} onRetry={r.reload} />
      {b && (
        <>
          <Card tone="pink">
            <Txt bold size={24}>
              {b.name}
            </Txt>
            {b.demo_batch_id && (
              <Chip label="Demo işletme" selected tone="gold" />
            )}
            <Txt muted>{b.address}</Txt>
            <RowView>
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
            </RowView>
            <Btn
              title="Çalışma Saatleri"
              small
              outline
              tone="gold"
              onPress={() =>
                app.nav("editor", { kind: "hours", business_id: b.id })
              }
            />
          </Card>
          <Section
            title="Çalışanlar"
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
          {b.staff.map((s) => (
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
                <Badge state={s.state?.status || "available"} />
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
                    app.nav("reports", { business_id: b.id, staff_id: s.id })
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
