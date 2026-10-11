import React, { useState, useEffect } from "react";
import { View, Image, ScrollView } from "react-native";
import { useApp } from "../app/Context";
import { useData } from "../hooks/useData";
import { Business, Row } from "../types";
import {
  Page,
  Section,
  Card,
  Field,
  Btn,
  Txt,
  Chips,
  Chip,
  RowView,
  State,
  imageSource,
} from "../components/ui";
import { parseCents, inputMoney } from "../utils/money";
import { localDate, atLocal } from "../utils/dates";
import { pickMedia, pickReceipt } from "../services/files";
type Spec = { title: string; fields: [string, string, string?][] };
const specs: Record<string, Spec> = {
  business_create: {
    title: "İşletmeni oluştur",
    fields: [
      ["name", "İşletme adı"],
      ["description", "İşletme açıklaması"],
      ["address", "Açık adres"],
      ["city", "Şehir"],
      ["phone", "İletişim telefonu"],
      ["latitude", "Enlem"],
      ["longitude", "Boylam"],
    ],
  },
  business_save: {
    title: "İşletme ayarları",
    fields: [
      ["name", "İşletme adı"],
      ["description", "İşletme açıklaması"],
      ["address", "Açık adres"],
      ["city", "Şehir"],
      ["phone", "İletişim telefonu"],
      ["latitude", "Enlem"],
      ["longitude", "Boylam"],
      ["price_limit", "Usta fiyat düzenleme limiti (%)", "20"],
    ],
  },
  staff: {
    title: "Çalışan yönetimi",
    fields: [
      ["name", "Ustanın adı"],
      ["specialties", "Uzmanlık alanları", "Saç & sakal"],
      ["member_email", "Çalışan hesabının e-postası (isteğe bağlı)"],
      ["target_monthly", "Aylık müşteri hedefi", "150"],
    ],
  },
  service: {
    title: "Hizmet ve fiyat",
    fields: [
      ["name", "Hizmet adı"],
      ["price", "Hizmet fiyatı (TL)", "350"],
      ["duration_minutes", "Hizmet süresi (dakika)", "45"],
    ],
  },
  hours: {
    title: "Çalışma saatleri",
    fields: [
      ["open", "Açılış saati (SS:DD)", "09:00"],
      ["close", "Kapanış saati (SS:DD)", "20:00"],
      ["break_start", "Mola başlangıcı (isteğe bağlı)"],
      ["break_end", "Mola bitişi (isteğe bağlı)"],
    ],
  },
  waitlist: {
    title: "Boş saat bildirimi",
    fields: [
      ["date", "Tarih (YYYY-AA-GG)"],
      ["start", "Başlangıç saati", "15:00"],
      ["end", "Bitiş saati", "18:00"],
    ],
  },
  extra: {
    title: "Ekstra saat iste",
    fields: [
      ["date", "Tarih (YYYY-AA-GG)"],
      ["start", "İstediğiniz saat", "19:00"],
      ["message", "Ustanıza mesajınız"],
    ],
  },
  extra_offer: {
    title: "Alternatif saat öner",
    fields: [
      ["date", "Tarih (YYYY-AA-GG)"],
      ["start", "Önerilen saat", "19:00"],
    ],
  },
  queue: {
    title: "Sıraya müşteri ekle",
    fields: [["name", "Müşteri adı (misafir için isteğe bağlı)"]],
  },
  promo: {
    title: "Usta indirim kodu",
    fields: [
      ["code", "İndirim kodu"],
      ["discount", "İndirim oranı (%)", "15"],
      ["expires", "Geçerlilik son günü (isteğe bağlı)"],
      ["max_uses", "En fazla kullanım (isteğe bağlı)"],
    ],
  },
  discount: {
    title: "Kişiye özel fiyat",
    fields: [
      ["discount", "İndirim oranı (%)", "15"],
      ["fixed_price", "Sabit hizmet fiyatı (TL, isteğe bağlı)"],
    ],
  },
  note: {
    title: "Müşteri tercihi notu",
    fields: [["note", "İzin verilen hizmet / saç tercihi notunuz"]],
  },
  review: {
    title: "Deneyimini değerlendir",
    fields: [["comment", "Yorumunuz (isteğe bağlı)"]],
  },
  payment_claim: {
    title: "Platform ödemesi bildir",
    fields: [
      ["amount", "Yaptığınız ödeme (TL)"],
      ["date", "Ödeme tarihi (YYYY-AA-GG)"],
      ["explanation", "İşletme açıklaması"],
    ],
  },
  payment_reject: {
    title: "Ödeme reddi / düzeltme",
    fields: [["reason", "Red nedeni"]],
  },
  plan: {
    title: "Ödeme planı",
    fields: [["day_number", "Haftanın günü (1–7) / ayın günü (1–28)", "1"]],
  },
  fee: {
    title: "Platform hizmet bedeli",
    fields: [
      ["fee", "Sabit bedel (TL)", "20"],
      ["fee_percent", "Yüzde bedeli (%, isteğe bağlı)", "0"],
      ["date", "Geçerlilik başlangıcı (YYYY-AA-GG)"],
    ],
  },
  settings: {
    title: "Platform tahsilat ayarları",
    fields: [
      ["iban", "Platform IBAN"],
      ["recipient", "Hesap sahibi / alıcı"],
      ["note", "Ödeme açıklaması"],
    ],
  },
  profile: {
    title: "Profilim",
    fields: [
      ["name", "Görünen adınız"],
      ["phone", "Telefon (isteğe bağlı)"],
    ],
  },
  redeem: {
    title: "Ustanın kodunu kullan",
    fields: [["code", "Davet / indirim kodu"]],
  },
  reverse: {
    title: "Hatalı işlem için ters kayıt",
    fields: [["reason", "Düzeltme / iade nedeni"]],
  },
  campaign: {
    title: "Boş saat duyurusu",
    fields: [
      ["title", "Duyuru başlığı"],
      ["message", "Müşterilerinize mesaj"],
    ],
  },
  loyalty: {
    title: "Sadakat programı",
    fields: [
      ["visits_required", "Ödül için ziyaret sayısı", "10"],
      ["reward_percent", "Ödül indirimi (%)", "10"],
    ],
  },
};
const minute = (s: string) => {
  if (s === "24:00") return 1440;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s))
    throw new Error("Saati SS:DD biçiminde yazın.");
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
};
export function EditorScreen() {
  const app = useApp(),
    p = app.route.params || {},
    kind = p.kind || "profile",
    spec = specs[kind];
  const businessId = p.business_id || app.businessId;
  const bResult = useData<Business>(
    "business",
    { business_id: businessId },
    !!businessId,
  );
  const b = bResult.data;
  const [values, setValues] = useState<Row>(() => {
    const item = p.item || {};
    const defaults: Row = {
      date: p.date || localDate(),
      name: item.name || item.display_name || "",
      price: item.price_cents != null ? inputMoney(item.price_cents) : "350",
      discount: "15",
      fee: "20",
      fee_percent: "0",
      price_limit:
        item.price_edit_limit_bps != null
          ? String(item.price_edit_limit_bps / 100)
          : "20",
    };
    if (p.account) defaults.member_email = p.account.email;
    spec?.fields.forEach(([key, , defaultValue]) => {
      defaults[key] = defaults[key] ?? item[key] ?? defaultValue ?? "";
    });
    return defaults;
  });
  const [staff, setStaff] = useState<string | null>(
      p.staff_id || p.item?.id || app.staffId,
    ),
    [service, setService] = useState<string | null>(p.service_id || null),
    [selectedStaff, setSelectedStaff] = useState<string[]>(p.staff_ids || []),
    [weekday, setWeekday] = useState("1"),
    [rating, setRating] = useState("5"),
    [method, setMethod] = useState("transfer"),
    [cadence, setCadence] = useState("monthly"),
    [photo, setPhoto] = useState<string | null>(
      p.item?.photo_url || p.item?.cover_url || p.item?.avatar_url || null,
    ),
    [receipt, setReceipt] = useState<string | null>(null),
    [editPrices, setEditPrices] = useState(p.account?.can_edit_prices ?? false),
    [manageServices, setManageServices] = useState(
      p.account?.can_manage_services ?? false,
    ),
    [viewFinance, setViewFinance] = useState(
      p.account?.can_view_finance ?? false,
    ),
    [closed, setClosed] = useState(false),
    [enabled, setEnabled] = useState(p.item?.active ?? true);
  useEffect(() => {
    if (b) {
      if (!staff) setStaff(b.staff.find((s) => s.active)?.id || null);
      if (!service) setService(b.services.find((s) => s.active)?.id || null);
      if (kind === "service" && !p.item && !selectedStaff.length)
        setSelectedStaff(b.staff.filter((s) => s.active).map((s) => s.id));
    }
    if (kind === "profile" && app.boot?.profile)
      setValues((v) => ({
        ...v,
        name: app.boot!.profile!.display_name,
        phone: app.boot!.profile!.phone || "",
      }));
    if (kind === "settings")
      setValues((v) => ({ ...v, ...app.boot?.settings?.payment_instructions }));
  }, [b?.id, app.boot?.profile?.user_id]);
  const [logo, setLogo] = useState<string | null>(p.item?.logo_url || null),
    [gallery, setGallery] = useState<string[]>(p.item?.gallery || []),
    [reasonRequired, setReasonRequired] = useState(
      p.item?.price_reason_required ?? true,
    ),
    [discountScope, setDiscountScope] = useState("service");
  const set = (key: string, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));
  async function submit() {
    try {
      let action = kind,
        payload: Row = { business_id: businessId };
      const num = (key: string) => {
        const x = Number(values[key]);
        if (!Number.isFinite(x)) throw new Error("Geçerli bir sayı yazın.");
        return x;
      };
      switch (kind) {
        case "business_create":
        case "business_save":
          payload = {
            ...values,
            cover_url: photo || undefined,
            logo_url: logo || undefined,
            gallery,
            price_reason_required: reasonRequired,
            price_edit_limit_bps: Math.round(num("price_limit") * 100),
            business_id: kind === "business_save" ? businessId : undefined,
          };
          if (kind === "business_create") delete payload.price_edit_limit_bps;
          break;
        case "staff":
          action = "staff_save";
          payload = {
            ...payload,
            ...values,
            staff_id: p.item?.id || undefined,
            target_monthly: num("target_monthly"),
            photo_url: photo || undefined,
            can_edit_prices: editPrices,
            can_manage_services: manageServices,
            can_view_finance: viewFinance,
            active: enabled,
          };
          break;
        case "service":
          action = "service_save";
          payload = {
            ...payload,
            name: values.name,
            price_cents: parseCents(values.price),
            duration_minutes: num("duration_minutes"),
            service_id: p.item?.id || undefined,
            staff_ids: selectedStaff,
            active: enabled,
          };
          break;
        case "hours":
          action = "hours_save";
          payload = {
            ...payload,
            staff_id: p.staff_id || null,
            weekday: Number(weekday),
            open_minute: minute(values.open),
            close_minute: minute(values.close),
            break_start: values.break_start ? minute(values.break_start) : null,
            break_end: values.break_end ? minute(values.break_end) : null,
            closed,
          };
          break;
        case "waitlist":
          action = "waitlist_join";
          payload = {
            ...payload,
            staff_id: staff,
            service_id: service,
            starts_at: atLocal(values.date, values.start),
            ends_at: atLocal(values.date, values.end),
          };
          break;
        case "extra":
          action = "extra_request";
          payload = {
            ...payload,
            staff_id: staff,
            service_id: service,
            starts_at: atLocal(values.date, values.start),
            message: values.message,
          };
          break;
        case "extra_offer":
          payload = { id: p.id, starts_at: atLocal(values.date, values.start) };
          break;
        case "queue":
          action = "queue_add";
          payload = {
            ...payload,
            staff_id: staff,
            service_id: service,
            name: values.name,
          };
          break;
        case "promo":
          action = "promo_save";
          payload = {
            ...payload,
            staff_id: staff,
            code: values.code,
            applies_to: discountScope,
            discount_bps: parseCents(values.discount),
            max_uses: values.max_uses ? num("max_uses") : null,
            expires_at: values.expires
              ? atLocal(values.expires, "23:59")
              : null,
          };
          break;
        case "discount":
          action = "customer_discount";
          payload = {
            ...payload,
            staff_id: staff,
            customer_id: p.customer_id,
            discount_bps: parseCents(values.discount),
            fixed_price_cents: values.fixed_price
              ? parseCents(values.fixed_price)
              : null,
          };
          break;
        case "note":
          action = "customer_note";
          payload = {
            ...payload,
            staff_id: staff,
            customer_id: p.customer_id,
            note: values.note,
          };
          break;
        case "review":
          payload = {
            id: p.id,
            rating: Number(rating),
            comment: values.comment,
          };
          break;
        case "payment_claim":
          payload = {
            ...payload,
            period_id: p.period_id,
            amount_cents: parseCents(values.amount),
            paid_at: atLocal(values.date, "12:00"),
            method,
            receipt_path: receipt || undefined,
            explanation: values.explanation,
          };
          break;
        case "payment_reject":
          payload = { id: p.id, reason: values.reason };
          break;
        case "plan":
          action = "payment_plan";
          payload = { ...payload, cadence, day_number: num("day_number") };
          break;
        case "fee":
          action = "fee_rule";
          payload = {
            ...payload,
            staff_id: p.staff_id || null,
            service_id: p.service_id || null,
            fee_cents: parseCents(values.fee),
            fee_bps: parseCents(values.fee_percent),
            valid_from: atLocal(values.date, "00:00"),
          };
          break;
        case "settings":
          action = "settings_save";
          payload = {
            key: "payment_instructions",
            value: {
              iban: values.iban,
              recipient: values.recipient,
              note: values.note,
            },
          };
          break;
        case "profile":
          action = "profile_save";
          payload = {
            name: values.name,
            phone: values.phone,
            avatar_url: photo || undefined,
          };
          break;
        case "redeem":
          action = "promo_redeem";
          payload = { code: values.code };
          break;
        case "reverse":
          action = "reverse_session";
          payload = { id: p.id, reason: values.reason };
          break;
        case "campaign":
          payload = {
            ...payload,
            title: values.title,
            message: values.message,
          };
          break;
        case "loyalty":
          action = "loyalty_save";
          payload = {
            ...payload,
            visits_required: num("visits_required"),
            reward_bps: Math.round(num("reward_percent") * 100),
            active: enabled,
          };
          break;
        default:
          throw new Error("Bu form kullanılamıyor.");
      }
      const result = await app.run(action, payload);
      if (result) {
        if (kind === "business_create") {
          app.setBusinessId(result.id);
          app.setRole("owner");
          app.nav("home");
        } else app.back();
      }
    } catch (e) {
      app.toast((e as Error).message, true);
    }
  }
  if (!spec)
    return (
      <Page>
        <State error="Form bulunamadı." />
      </Page>
    );
  const withStaff = ["queue", "promo", "discount", "note"].includes(kind);
  return (
    <Page>
      <Section title={spec.title} />
      <Card tone="pink">
        {spec.fields.map(([key, label]) => (
          <Field
            key={key}
            label={label}
            value={String(values[key] ?? "")}
            onChange={(v) => set(key, v)}
            multiline={["note", "message", "description", "reason"].includes(
              key,
            )}
          />
        ))}
        {withStaff && (
          <>
            <Txt muted>Usta</Txt>
            <Chips
              items={
                b?.staff.map((s) => ({ value: s.id, label: s.name })) || []
              }
              value={staff}
              onChange={setStaff}
            />
          </>
        )}
        {kind === "queue" && (
          <Chips
            items={
              b?.services
                .filter((s) => s.active)
                .map((s) => ({ value: s.id, label: s.name })) || []
            }
            value={service}
            onChange={setService}
          />
        )}
        {kind === "service" && (
          <>
            <Txt muted>Bu hizmeti veren ustalar</Txt>
            <RowView style={{ flexWrap: "wrap" }}>
              {b?.staff.map((s) => (
                <Chip
                  key={s.id}
                  label={s.name}
                  selected={selectedStaff.includes(s.id)}
                  onPress={() =>
                    setSelectedStaff((v) =>
                      v.includes(s.id)
                        ? v.filter((x) => x !== s.id)
                        : [...v, s.id],
                    )
                  }
                />
              ))}
            </RowView>
          </>
        )}
        {kind === "hours" && (
          <>
            <Chips
              items={["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(
                (label, i) => ({ value: String(i + 1), label }),
              )}
              value={weekday}
              onChange={setWeekday}
            />
            <Chip
              label={closed ? "Kapalı" : "Açık"}
              selected={!closed}
              onPress={() => setClosed(!closed)}
            />
            <Txt muted size={11}>
              Mevcut randevular silinmez. Yeni saatler sonraki rezervasyonlarda
              kullanılır.
            </Txt>
          </>
        )}
        {kind === "review" && (
          <Chips
            items={Array.from({ length: 5 }, (_, i) => ({
              value: String(i + 1),
              label: "★".repeat(i + 1),
            }))}
            value={rating}
            onChange={setRating}
          />
        )}
        {kind === "staff" && (
          <Txt muted size={12}>
            Çalışan uygulamada kendi hesabını oluşturduktan sonra e-postasıyla
            bağlanır. Pasif çalışan hesabının işletme erişimi kapatılır.
          </Txt>
        )}
        {kind === "staff" && (
          <RowView style={{ flexWrap: "wrap" }}>
            <Chip
              label="Fiyat düzenleyebilir"
              selected={editPrices}
              onPress={() => setEditPrices(!editPrices)}
            />
            <Chip
              label="Hizmetleri yönetebilir"
              selected={manageServices}
              onPress={() => setManageServices(!manageServices)}
            />
            <Chip
              label="İşletme finansını görebilir"
              selected={viewFinance}
              onPress={() => setViewFinance(!viewFinance)}
            />
          </RowView>
        )}
        {["staff", "service", "loyalty"].includes(kind) && (
          <Chip
            label={enabled ? "Etkin" : "Pasif"}
            selected={enabled}
            onPress={() => setEnabled(!enabled)}
          />
        )}
        {["staff", "profile", "business_create", "business_save"].includes(
          kind,
        ) && (
          <Btn
            title={photo ? "Görseli Değiştir" : "Mockup / Fotoğraf Yükle"}
            outline
            tone="cyan"
            onPress={async () => {
              try {
                const url = await pickMedia(
                  ["profile", "business_create"].includes(kind)
                    ? app.session!.user.id
                    : businessId,
                );
                if (url) setPhoto(url);
              } catch (e) {
                app.toast((e as Error).message, true);
              }
            }}
          />
        )}
        {kind === "promo" && (
          <>
            <Txt muted>İndirimin uygulandığı tutar</Txt>
            <Chips
              items={[
                { value: "service", label: "Hizmet tutarı" },
                { value: "total", label: "Müşteri toplamı" },
              ]}
              value={discountScope}
              onChange={setDiscountScope}
            />
          </>
        )}
        {kind === "business_save" && (
          <>
            <Chip
              label="Fiyat değişikliğinde gerekçe zorunlu"
              selected={reasonRequired}
              onPress={() => setReasonRequired(!reasonRequired)}
            />
            <Btn
              title="İşletme Logosu Yükle"
              small
              outline
              tone="gold"
              onPress={async () => {
                try {
                  const url = await pickMedia(businessId);
                  if (url) setLogo(url);
                } catch (e) {
                  app.toast((e as Error).message, true);
                }
              }}
            />
            {logo && (
              <Image
                source={imageSource(logo)}
                style={{ width: 70, height: 70, borderRadius: 16 }}
              />
            )}
            <Btn
              title="Galeriye Fotoğraf Ekle"
              small
              outline
              tone="cyan"
              onPress={async () => {
                try {
                  const url = await pickMedia(businessId);
                  if (url) setGallery((g) => [...g, url].slice(0, 12));
                } catch (e) {
                  app.toast((e as Error).message, true);
                }
              }}
            />
            <ScrollView horizontal contentContainerStyle={{ gap: 12 }}>
              {gallery.map((url, i) => (
                <View key={url}>
                  <Image
                    source={imageSource(url)}
                    style={{ width: 120, height: 100, borderRadius: 14 }}
                  />
                  <Btn
                    title="Kaldır"
                    small
                    outline
                    tone="red"
                    onPress={() =>
                      setGallery((g) => g.filter((_, j) => j !== i))
                    }
                  />
                </View>
              ))}
            </ScrollView>
          </>
        )}
        {kind === "payment_claim" && (
          <>
            <Chips
              items={[
                { value: "transfer", label: "Havale / EFT" },
                { value: "cash", label: "Nakit" },
              ]}
              value={method}
              onChange={setMethod}
            />
            <Btn
              title={
                receipt
                  ? "Dekont eklendi · Değiştir"
                  : "Dekont Ekle (isteğe bağlı)"
              }
              outline
              tone="cyan"
              onPress={async () => {
                try {
                  setReceipt(await pickReceipt(businessId));
                } catch (e) {
                  app.toast((e as Error).message, true);
                }
              }}
            />
            <Txt muted size={12}>
              Bu bildirim borcu kapatmaz. Admin banka / nakit tahsilatı
              doğruladığında borcunuz düşer.
            </Txt>
          </>
        )}
        {kind === "plan" && (
          <Chips
            items={[
              { value: "weekly", label: "Haftalık" },
              { value: "monthly", label: "Aylık" },
            ]}
            value={cadence}
            onChange={setCadence}
          />
        )}
        <Btn
          title="Kaydet ve Devam Et"
          onPress={submit}
          icon="checkmark-circle-outline"
        />
      </Card>
    </Page>
  );
}
