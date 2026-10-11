import React, { useState } from "react";
import { View, Image, Pressable, Linking, ScrollView } from "react-native";
import { useApp } from "../app/Context";
import { useData } from "../hooks/useData";
import { Business, Row } from "../types";
import {
  Page,
  Hero,
  Section,
  Field,
  Card,
  Txt,
  Btn,
  RowView,
  Avatar,
  Chip,
  Chips,
  Icon,
  State,
  imageSource,
} from "../components/ui";
import { money } from "../utils/money";
import { MapPanel } from "../components/MapPanel";
export function DiscoverScreen() {
  const { nav } = useApp();
  const [search, setSearch] = useState("");
  const result = useData<Business[]>("directory", { search });
  return (
    <Page>
      <Hero
        title="Yeni tarzın burada."
        subtitle="Sana uyan ustayı keşfet. Zamanını sen seç."
      />
      <Field
        label="İşletme, berber veya şehir ara"
        value={search}
        onChange={setSearch}
        placeholder="Antalya, Ahmet Berber…"
      />
      <Section
        title="Tarzına en yakın"
        subtitle="Fiyatlar ve müsaitlik, işletmenin güncel kayıtlarından."
      />
      <State
        loading={result.loading && !result.data}
        error={result.error}
        onRetry={result.reload}
      />
      {result.data?.map((b) => (
        <BusinessCard
          key={b.id}
          business={b}
          onPress={() => nav("business", { id: b.id })}
        />
      ))}
      {result.data?.length === 0 && (
        <State empty="Bu aramada işletme bulunamadı. İşletmeler sisteme katıldıkça burada görünür." />
      )}
    </Page>
  );
}
export function BusinessCard({
  business: b,
  onPress,
}: {
  business: Row;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={b.name}
    >
      <Card tone="pink" style={{ padding: 0, overflow: "hidden" }}>
        <Image
          source={imageSource(b.cover_url)}
          style={{ height: 185, width: "100%" }}
        />
        <View style={{ padding: 17, gap: 11 }}>
          <RowView style={{ justifyContent: "space-between" }}>
            <Txt bold size={22}>
              {b.name}
            </Txt>
            {b.demo_batch_id && <Chip label="DEMO" tone="gold" selected />}
          </RowView>
          <RowView>
            <Icon name="location-outline" tone="cyan" size={17} />
            <Txt muted size={12}>
              {b.city} · {b.address}
            </Txt>
          </RowView>
          {b.rating !== undefined && (
            <Txt tone="gold" size={12}>
              ★{" "}
              {Number(b.rating) > 0
                ? Number(b.rating).toFixed(1)
                : "Yeni işletme"}{" "}
              · {b.review_count || 0} değerlendirme
            </Txt>
          )}
          <RowView style={{ flexWrap: "wrap" }}>
            {b.min_price_cents != null && (
              <Chip label={"Hizmetler " + money(b.min_price_cents) + "’den"} />
            )}
            <Chip label={`${b.staff?.length || 0} uzman usta`} tone="cyan" />
          </RowView>
          <Btn
            title="Hemen Randevu Al"
            icon="calendar-outline"
            onPress={onPress}
          />
        </View>
      </Card>
    </Pressable>
  );
}
export function BusinessScreen() {
  const { route, nav, run, session } = useApp();
  const result = useData<Business>("business", {
    business_id: route.params?.id,
  });
  const b = result.data;
  if (!b)
    return (
      <Page>
        <State
          loading={result.loading}
          error={result.error || "İşletme bulunamadı."}
          onRetry={result.reload}
        />
      </Page>
    );
  return (
    <Page>
      <Hero title={b.name} subtitle={b.address || b.city} image={b.cover_url}>
        {b.demo_batch_id && <Chip label="Demo işletme" selected tone="gold" />}
      </Hero>
      <RowView>
        <Btn
          title="Randevu Al"
          onPress={() =>
            session ? nav("booking", { business_id: b.id }) : nav("auth")
          }
          icon="calendar-outline"
        />
        <Btn
          title="Favori"
          onPress={() =>
            run(
              "favorite",
              { business_id: b.id, enabled: true },
              "Favorilerinize eklendi.",
            )
          }
          outline
          icon="heart-outline"
          small
        />
      </RowView>
      <RowView>
        {b.logo_url && (
          <Image
            source={imageSource(b.logo_url)}
            style={{ width: 64, height: 64, borderRadius: 18 }}
          />
        )}
        <Txt muted style={{ flex: 1 }}>
          {b.description}
        </Txt>
      </RowView>
      {Array.isArray(b.gallery) && b.gallery.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        >
          {b.gallery.map((url: string) => (
            <Image
              key={url}
              source={imageSource(url)}
              style={{ width: 240, height: 170, borderRadius: 18 }}
            />
          ))}
        </ScrollView>
      )}
      <Section title="Uzman ustalar" />
      {b.staff
        .filter((s) => s.active)
        .map((s) => (
          <Card key={s.id} tone="cyan">
            <RowView>
              <Avatar url={s.photo_url} size={62} />
              <View style={{ flex: 1 }}>
                <Txt bold size={17}>
                  {s.name}
                </Txt>
                <Txt muted size={12}>
                  {s.specialties}
                </Txt>
                <Txt tone="green" size={12}>
                  {s.state?.status === "in_progress"
                    ? "Tıraş devam ediyor"
                    : s.state?.status === "busy"
                      ? "Geçici meşgul"
                      : s.state?.status === "off"
                        ? "Mesaisi bitti"
                        : "Takvimden müsaitlik seçin"}
                </Txt>
              </View>
            </RowView>
            <RowView>
              <Btn
                title="Ustayı seç"
                small
                onPress={() =>
                  session
                    ? nav("booking", { business_id: b.id, staff_id: s.id })
                    : nav("auth")
                }
              />
              <Btn
                title="Profil"
                small
                outline
                tone="cyan"
                onPress={() =>
                  nav("staffprofile", { business_id: b.id, staff_id: s.id })
                }
              />
            </RowView>
          </Card>
        ))}
      <Section title="Hizmetler ve fiyatlar" />
      {b.services
        .filter((s) => s.active)
        .map((s) => (
          <Card key={s.id}>
            <RowView style={{ justifyContent: "space-between" }}>
              <View>
                <Txt bold>{s.name}</Txt>
                <Txt muted size={12}>
                  {s.duration_minutes} dakika
                </Txt>
              </View>
              <Txt bold tone="gold">
                {money(s.price_cents)}
              </Txt>
            </RowView>
            <Txt muted size={11}>
              Platform hizmet bedeli, randevu özetinde ayrıca gösterilir.
            </Txt>
            <Btn
              title="Bu hizmeti seç"
              small
              outline
              onPress={() =>
                session
                  ? nav("booking", { business_id: b.id, service_id: s.id })
                  : nav("auth")
              }
            />
          </Card>
        ))}
      <Section title="İşletmenin konumu" />
      <MapPanel business={b} />
      {b.phone && (
        <Btn
          title="İşletmeyi ara"
          outline
          tone="cyan"
          icon="call-outline"
          onPress={() => Linking.openURL("tel:" + b.phone)}
        />
      )}
      <Section title="Çalışma saatleri" />
      <Card>
        {b.hours
          ?.filter((h) => !h.staff_id)
          .map((h) => (
            <RowView key={h.id} style={{ justifyContent: "space-between" }}>
              <Txt>
                {
                  [
                    "",
                    "Pazartesi",
                    "Salı",
                    "Çarşamba",
                    "Perşembe",
                    "Cuma",
                    "Cumartesi",
                    "Pazar",
                  ][h.weekday]
                }
              </Txt>
              <Txt muted>
                {h.closed
                  ? "Kapalı"
                  : `${minutes(h.open_minute)} – ${minutes(h.close_minute)}`}
              </Txt>
            </RowView>
          ))}
      </Card>
      <Section title="Müşteri yorumları" />
      {b.reviews?.length ? (
        b.reviews.map((r: Row) => (
          <Card key={r.id} tone="gold">
            <Txt tone="gold">{"★".repeat(r.rating)}</Txt>
            <Txt>{r.comment || "Yorum eklenmemiş."}</Txt>
          </Card>
        ))
      ) : (
        <State empty="Bu işletme henüz değerlendirilmedi." />
      )}
    </Page>
  );
}
const minutes = (n: number) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
export function StaffProfileScreen() {
  const { route, nav, session, run } = useApp();
  const {
    data: b,
    loading,
    error,
    reload,
  } = useData<Business>("business", { business_id: route.params?.business_id });
  const s = b?.staff.find((x) => x.id === route.params?.staff_id);
  return (
    <Page>
      <State loading={loading} error={error} onRetry={reload} />
      {s && (
        <>
          <Hero title={s.name} subtitle={s.specialties} image={b?.cover_url} />
          <Card tone="cyan">
            <RowView>
              <Avatar url={s.photo_url} size={100} />
              <View>
                <Txt bold size={22}>
                  {s.name}
                </Txt>
                <Txt muted>{b?.name}</Txt>
              </View>
            </RowView>
            <Btn
              title="Bu ustadan randevu al"
              onPress={() =>
                session
                  ? nav("booking", { business_id: b?.id, staff_id: s.id })
                  : nav("auth")
              }
            />
            <Btn
              title="Ustayla sohbet et"
              outline
              tone="cyan"
              onPress={async () => {
                if (!session) {
                  nav("auth");
                  return;
                }
                const r = await run(
                  "chat_open",
                  { business_id: b?.id, staff_id: s.id },
                  "",
                );
                if (r) nav("chat", { id: r.id, staff: s.name });
              }}
            />
          </Card>
          <Section title="Hizmetler" />
          {b?.services
            .filter(
              (v) =>
                v.active &&
                b.staff_services?.some(
                  (x) => x.staff_id === s.id && x.service_id === v.id,
                ),
            )
            .map((v) => (
              <Card key={v.id}>
                <RowView style={{ justifyContent: "space-between" }}>
                  <Txt>
                    {v.name} · {v.duration_minutes} dk
                  </Txt>
                  <Txt tone="gold">{money(v.price_cents)}</Txt>
                </RowView>
              </Card>
            ))}
        </>
      )}
    </Page>
  );
}
export function FavoritesScreen() {
  const { nav, run, session } = useApp();
  const r = useData<Row[]>("favorites", {}, !!session);
  return (
    <Page>
      <Section title="Favori işletmelerim" />
      <State loading={r.loading} error={r.error} onRetry={r.reload} />
      {r.data?.map((b) => (
        <View key={b.id} style={{ gap: 8 }}>
          <BusinessCard
            business={b}
            onPress={() => nav("business", { id: b.id })}
          />
          <Btn
            title="Favorilerden kaldır"
            outline
            tone="red"
            small
            onPress={() =>
              run("favorite", { business_id: b.id, enabled: false })
            }
          />
        </View>
      ))}
      {r.data?.length === 0 && (
        <State empty="Beğendiğiniz işletmeleri favorilerinize ekleyin." />
      )}
    </Page>
  );
}
