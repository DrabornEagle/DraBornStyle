import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Pressable,
  Linking,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
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
  QuickAction,
} from "../components/ui";
import { money } from "../utils/money";
import { MapPanel } from "../components/MapPanel";
import { colors } from "../theme";
import { slots } from "../services/api";
import { localDate, clock } from "../utils/dates";
export function DiscoverScreen() {
  const { nav, session } = useApp();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const result = useData<Business[]>("directory", { search });
  const rows = (result.data || []).filter((b) => !city || b.city === city);
  const featured = rows[featuredIndex % Math.max(1, rows.length)];
  const masters: (Row & { business: Business })[] = rows.flatMap((b) =>
    (b.staff || []).filter((s) => s.active).map((s) => ({ ...s, business: b })),
  );
  const { width } = useWindowDimensions();
  const cardWidth = width < 600 ? 180 : 270;
  return (
    <Page>
      <RowView style={{ justifyContent: "space-between", paddingVertical: 8 }}>
        <Txt bold size={24}>
          Keşfet
        </Txt>
        <Chip
          label={city || "Tüm şehirler"}
          selected
          onPress={() => setFiltersOpen(!filtersOpen)}
        />
      </RowView>
      <RowView style={{ gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Field
            label="İşletme, berber veya şehir ara"
            hideLabel
            value={search}
            onChange={setSearch}
            placeholder="Berber, semt veya şehir ara…"
            icon="search-outline"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Şehir filtreleri"
          onPress={() => setFiltersOpen(!filtersOpen)}
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: colors.purple,
            borderRadius: 14,
            backgroundColor: "#101026ca",
          }}
        >
          <Icon name="options-outline" tone="purple" />
        </Pressable>
      </RowView>
      {filtersOpen && (
        <Chips
          items={[
            { value: "", label: "Tüm şehirler" },
            ...Array.from(new Set((result.data || []).map((b) => b.city)))
              .filter(Boolean)
              .map((city) => ({ value: city, label: city })),
          ]}
          value={city}
          onChange={setCity}
        />
      )}
      <State
        loading={result.loading && !result.data}
        error={result.error}
        onRetry={result.reload}
      />
      {featured && (
        <View style={{ gap: 10 }}>
          <View
            style={{
              borderRadius: 20,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: colors.pink,
              height: width < 600 ? 256 : 330,
              shadowColor: colors.pink,
              shadowRadius: 10,
              shadowOpacity: 0.4,
              shadowOffset: { width: 0, height: 0 },
            }}
          >
            <Image
              source={imageSource(featured.cover_url)}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["#030915f0", "#03091594", "#03091510"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
            <View
              style={{
                padding: 18,
                gap: 10,
                flex: 1,
                justifyContent: "center",
                alignItems: "flex-start",
                maxWidth: width < 600 ? "85%" : "65%",
              }}
            >
              <Chip
                label={
                  featured.demo_batch_id
                    ? "★ Öne çıkan · DEMO"
                    : "★ Öne çıkan işletme"
                }
                tone="gold"
                selected
              />
              <Txt bold size={width < 600 ? 26 : 40}>
                {featured.name}
              </Txt>
              <Txt size={12} tone="gold">
                ★{" "}
                {Number(featured.rating) > 0
                  ? Number(featured.rating).toFixed(1)
                  : "Yeni işletme"}{" "}
                <Txt muted size={11}>
                  ({featured.review_count || 0} değerlendirme)
                </Txt>
              </Txt>
              <RowView style={{ gap: 4 }}>
                <Icon name="location" tone="purple" size={16} />
                <Txt size={12}>{featured.city}</Txt>
              </RowView>
              <RowView style={{ gap: 6, flexWrap: "wrap" }}>
                {featured.services?.slice(0, 2).map((s) => (
                  <View
                    key={s.id}
                    style={{
                      backgroundColor: "#101726d9",
                      padding: 7,
                      borderRadius: 9,
                      borderWidth: 1,
                      borderColor: "#9a93a96f",
                    }}
                  >
                    <Txt size={10}>{s.name}</Txt>
                    <Txt bold size={12}>
                      {money(s.price_cents)}
                    </Txt>
                  </View>
                ))}
              </RowView>
              <Btn
                title="Hemen Randevu Al"
                small
                icon="arrow-forward"
                onPress={() => nav("business", { id: featured.id })}
              />
            </View>
          </View>
          {rows.length > 1 && (
            <RowView style={{ justifyContent: "center", gap: 7 }}>
              {rows.map((b, i) => (
                <Pressable
                  key={b.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Öne çıkan işletme ${i + 1}`}
                  accessibilityState={{ selected: featured.id === b.id }}
                  onPress={() => setFeaturedIndex(i)}
                  style={{
                    width: featured.id === b.id ? 20 : 7,
                    height: 7,
                    borderRadius: 5,
                    backgroundColor:
                      featured.id === b.id ? colors.pink : "#878092",
                  }}
                />
              ))}
            </RowView>
          )}
        </View>
      )}
      {rows.length > 0 && (
        <>
          <Section
            title="İşletmeler"
            icon="location"
            right={
              <Txt muted size={11}>
                {rows.length} işletme
              </Txt>
            }
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
          >
            {rows.map((b) => (
              <View key={b.id} style={{ width: cardWidth }}>
                <BusinessCard
                  business={b}
                  compact
                  onPress={() => nav("business", { id: b.id })}
                />
              </View>
            ))}
          </ScrollView>
          <Section title="Popüler Ustalar" icon="ribbon" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
          >
            {masters.slice(0, 12).map((s) => (
              <Card
                key={s.id}
                tone="purple"
                style={{
                  width: width < 600 ? 146 : 185,
                  padding: 12,
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Avatar url={s.photo_url} size={74} />
                <Txt bold size={14} style={{ textAlign: "center" }}>
                  {s.name}
                </Txt>
                <Txt muted size={11} style={{ textAlign: "center" }}>
                  {s.business.name}
                </Txt>
                <Btn
                  title="Profili Gör"
                  small
                  tone="purple"
                  onPress={() =>
                    nav("staffprofile", {
                      business_id: s.business.id,
                      staff_id: s.id,
                    })
                  }
                />
              </Card>
            ))}
          </ScrollView>
          {featured && (
            <DiscoverySlots
              business={featured}
              onPick={(staff, service, starts_at) =>
                session
                  ? nav("booking", {
                      business_id: featured.id,
                      staff_id: staff,
                      service_id: service,
                      starts_at,
                    })
                  : nav("auth")
              }
            />
          )}
        </>
      )}
      {result.data && rows.length === 0 && (
        <State empty="Bu aramada işletme bulunamadı. İşletmeler sisteme katıldıkça burada görünür." />
      )}
    </Page>
  );
}
function DiscoverySlots({
  business,
  onPick,
}: {
  business: Business;
  onPick: (staff: string, service: string, starts_at: string) => void;
}) {
  const { data: b } = useData<Business>("business", {
    business_id: business.id,
  });
  const [available, setAvailable] = useState<Row[]>([]);
  const [error, setError] = useState(false);
  const assignment = b?.staff_services?.find(
    (x) =>
      b.staff.some((s) => s.id === x.staff_id && s.active) &&
      b.services.some((s) => s.id === x.service_id && s.active),
  );
  useEffect(() => {
    let live = true;
    setAvailable([]);
    setError(false);
    if (assignment)
      slots(assignment.staff_id, assignment.service_id, localDate())
        .then((rows) => {
          if (live) setAvailable(rows.filter((s) => s.available).slice(0, 8));
        })
        .catch(() => {
          if (live) setError(true);
        });
    return () => {
      live = false;
    };
  }, [assignment?.staff_id, assignment?.service_id]);
  if (!assignment || error || !available.length) return null;
  return (
    <View style={{ gap: 12 }}>
      <Section
        title="Bugün Uygun Saatler"
        icon="time-outline"
        subtitle={
          business.name +
          " · " +
          b?.staff.find((s) => s.id === assignment.staff_id)?.name
        }
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {available.map((s) => (
          <Chip
            key={s.starts_at}
            label={clock(s.starts_at) + " · Müsait"}
            tone="green"
            selected
            onPress={() =>
              onPick(assignment.staff_id, assignment.service_id, s.starts_at)
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}
export function BusinessCard({
  business: b,
  onPress,
  compact = false,
}: {
  business: Row;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={b.name}
    >
      <Card tone="pink" style={{ padding: 0, overflow: "hidden", gap: 0 }}>
        <View style={{ height: compact ? 110 : 203 }}>
          <Image
            source={imageSource(b.cover_url)}
            style={{ height: "100%", width: "100%" }}
          />
          <LinearGradient
            colors={["#0c122208", "#0c1222eb"]}
            style={{
              position: "absolute",
              inset: 0,
              justifyContent: "flex-end",
              padding: compact ? 10 : 18,
            }}
          >
            <RowView
              style={{
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <View style={{ flex: 1, gap: 4 }}>
                {!compact && (
                  <Txt tone="cyan" size={9} bold style={{ letterSpacing: 1.6 }}>
                    YENİ TARZININ ADRESİ
                  </Txt>
                )}
                {!compact && (
                  <Txt bold size={25} style={{ letterSpacing: -0.8 }}>
                    {b.name}
                  </Txt>
                )}
              </View>
              {!compact && (
                <View
                  style={{
                    padding: 10,
                    borderRadius: 15,
                    backgroundColor: colors.cyan,
                  }}
                >
                  <Ionicons
                    name="arrow-forward-outline"
                    size={19}
                    color="#172238"
                  />
                </View>
              )}
            </RowView>
          </LinearGradient>
          {b.demo_batch_id && (
            <View style={{ position: "absolute", top: 13, left: 13 }}>
              <Chip label="DEMO" tone="gold" selected />
            </View>
          )}
        </View>
        <View style={{ padding: compact ? 11 : 18, gap: compact ? 7 : 12 }}>
          {compact && (
            <Txt bold size={16}>
              {b.name}
            </Txt>
          )}
          <RowView>
            <Icon name="location-outline" tone="cyan" size={17} />
            <Txt muted size={12}>
              {compact ? b.city : b.city + " · " + b.address}
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
            {!compact && (
              <Chip label={`${b.staff?.length || 0} uzman usta`} tone="cyan" />
            )}
          </RowView>
          {!compact && (
            <Btn
              title="Hemen Randevu Al"
              icon="calendar-outline"
              onPress={onPress}
            />
          )}
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
              <View style={{ flex: 1 }}>
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
              <View style={{ flex: 1 }}>
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
