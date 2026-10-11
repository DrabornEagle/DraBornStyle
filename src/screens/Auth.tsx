import React, { useRef, useState } from "react";
import * as AppLinking from "expo-linking";
import { View, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Brand } from "../components/Brand";
import { supabase } from "../lib/supabase";
import { useApp } from "../app/Context";
import {
  Page,
  Hero,
  Card,
  Txt,
  Btn,
  Field,
  RowView,
  Icon,
  SegmentedControl,
  imageSource,
} from "../components/ui";
import { appVersion, colors } from "../theme";
import { authErrorMessage, normalizeEmail, validEmail } from "../utils/auth";

export function AuthScreen() {
  const { nav, toast, route } = useApp();
  const [mode, setMode] = useState<"welcome" | "login" | "signup" | "reset">(
    route.name === "auth" ? "login" : "welcome",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const submitting = useRef(false);
  function switchMode(next: typeof mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }
  async function submit() {
    if (submitting.current) return;
    setError(null);
    setNotice(null);
    if (!validEmail(email)) {
      setError("Geçerli bir e-posta adresi yazın.");
      return;
    }
    if (mode !== "reset" && password.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }
    submitting.current = true;
    setPending(true);
    try {
      const address = normalizeEmail(email);
      setEmail(address);
      const result =
        mode === "signup"
          ? await supabase.auth.signUp({
              email: address,
              password,
              options: {
                data: { display_name: name.trim() || address.split("@")[0] },
              },
            })
          : mode === "reset"
            ? await supabase.auth.resetPasswordForEmail(address, {
                redirectTo: AppLinking.createURL("reset"),
              })
            : await supabase.auth.signInWithPassword({
                email: address,
                password,
              });
      if (result.error) throw result.error;
      if (
        mode === "signup" &&
        !("session" in result.data && result.data.session)
      )
        setNotice(
          "Hesabınızı etkinleştirmek için e-postanıza gelen bağlantıyı açın.",
        );
      if (mode === "reset")
        setNotice("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
      if (mode === "login")
        toast("Hoş geldiniz. Çalışma alanınız hazırlanıyor.");
    } catch (e) {
      setError(
        authErrorMessage(
          e as { code?: string; message?: string; status?: number },
        ),
      );
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }
  if (mode === "welcome")
    return (
      <Page key={mode}>
        <View style={{ height: 340, margin: -14, marginBottom: -8 }}>
          <Image
            accessible={false}
            source={imageSource("asset:backdrop")}
            resizeMode="cover"
            style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
          />
          <LinearGradient
            pointerEvents="none"
            colors={["#040b1800", "#040b1800", "#040b18"]}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={{
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              alignItems: "center",
            }}
          >
            <Brand large />
          </View>
        </View>
        <Txt muted size={14} style={{ textAlign: "center" }}>
          Akıllı Berber ve Kuaför Yönetim Platformu
        </Txt>
        <RowView style={{ gap: 8, alignItems: "stretch" }}>
          {[
            ["people", "Müşteri", "Randevu al", "cyan"],
            ["cut", "Usta / Çalışan", "İşini yönet", "purple"],
            ["storefront-outline", "İşletme", "Ekibini yönet", "gold"],
          ].map(([icon, title, subtitle, tone]) => (
            <Card
              key={title}
              tone={tone as any}
              style={{
                flex: 1,
                padding: 10,
                gap: 6,
                alignItems: "center",
                borderRadius: 14,
              }}
            >
              <Icon name={icon} tone={tone as any} size={26} />
              <Txt bold size={11} style={{ textAlign: "center" }}>
                {title}
              </Txt>
              <Txt muted size={10} style={{ textAlign: "center" }}>
                {subtitle}
              </Txt>
            </Card>
          ))}
        </RowView>
        <View style={{ gap: 8 }}>
          <Btn
            title="Giriş Yap"
            icon="log-in-outline"
            onPress={() => switchMode("login")}
          />
          <Btn
            title="Hesap Oluştur"
            icon="person-add-outline"
            outline
            onPress={() => switchMode("signup")}
          />
        </View>
        <RowView
          style={{ justifyContent: "center", flexWrap: "wrap", gap: 12 }}
        >
          <Btn
            title="Şifremi Unuttum"
            icon="lock-closed-outline"
            outline
            small
            tone="purple"
            onPress={() => switchMode("reset")}
          />
          <Btn
            title="Misafir Olarak Keşfet"
            icon="eye-outline"
            outline
            small
            onPress={() => nav("discover")}
          />
        </RowView>
        <RowView style={{ justifyContent: "space-around", marginTop: 8 }}>
          {[
            ["calendar-outline", "Randevu"],
            ["chatbubble-outline", "Sohbet"],
            ["card-outline", "Finans"],
            ["bar-chart-outline", "Yönetim"],
          ].map(([icon, label]) => (
            <View key={label} style={{ alignItems: "center", gap: 7 }}>
              <Icon name={icon} />
              <Txt muted size={10}>
                {label}
              </Txt>
            </View>
          ))}
        </RowView>
        <Txt
          muted
          size={9}
          style={{ textAlign: "center", letterSpacing: 1.2, marginTop: 12 }}
        >
          DAHA GÜZEL İNSANLAR, DAHA GÜÇLÜ İŞLETMELER
        </Txt>
        <Txt muted size={9} style={{ textAlign: "center" }}>
          v{appVersion}
        </Txt>
      </Page>
    );
  return (
    <Page key={mode} contentStyle={{ gap: 16 }}>
      <View style={{ alignItems: "center", paddingTop: 40, paddingBottom: 14 }}>
        <Brand large />
      </View>
      <Card quiet style={{ gap: 18 }}>
        <View style={{ gap: 5 }}>
          <Txt size={25} bold style={{ letterSpacing: -0.8 }}>
            {mode === "login"
              ? "Giriş Yap"
              : mode === "signup"
                ? "Hesap Oluştur"
                : "Şifremi Unuttum"}
          </Txt>
          <Txt muted size={12}>
            {mode === "login"
              ? "Randevuların, işletmen ve stilin tek yerde."
              : mode === "signup"
                ? "Tek hesapla randevularını ve işini yönet."
                : "Hesabına dönebilmen için bir bağlantı gönderelim."}
          </Txt>
        </View>
        {mode !== "reset" && (
          <SegmentedControl
            label="Giriş veya hesap oluştur"
            items={[
              { value: "login", label: "Giriş" },
              { value: "signup", label: "Hesap Oluştur" },
            ]}
            value={mode}
            onChange={(value) => switchMode(value as typeof mode)}
            disabled={pending}
          />
        )}
        {mode === "signup" && (
          <Field
            label="Adınız"
            value={name}
            onChange={setName}
            icon="person-outline"
            placeholder="Size nasıl hitap edelim?"
          />
        )}
        <Field
          label="E-posta"
          value={email}
          onChange={setEmail}
          placeholder="ornek@eposta.com"
          email
          icon="mail-outline"
          onSubmit={mode === "reset" ? submit : undefined}
        />
        {mode !== "reset" && (
          <Field
            label="Şifre"
            value={password}
            onChange={setPassword}
            secure
            icon="lock-closed-outline"
            placeholder="En az 8 karakter"
            onSubmit={submit}
          />
        )}
        {error && (
          <View
            accessibilityLiveRegion="polite"
            style={{
              borderLeftWidth: 3,
              borderLeftColor: colors.red,
              paddingLeft: 12,
            }}
          >
            <Txt tone="red" size={12}>
              {error}
            </Txt>
          </View>
        )}
        {notice && (
          <View accessibilityLiveRegion="polite">
            <Txt tone="green" size={12}>
              {notice}
            </Txt>
          </View>
        )}
        <Btn
          title={
            pending
              ? "Lütfen bekleyin…"
              : mode === "login"
                ? "Giriş Yap"
                : mode === "signup"
                  ? "Hesap Oluştur"
                  : "Sıfırlama Bağlantısı Gönder"
          }
          onPress={submit}
          icon="arrow-forward-outline"
          disabled={pending}
        />
        {mode === "login" ? (
          <Btn
            title="Şifremi unuttum"
            outline
            tone="cyan"
            small
            onPress={() => switchMode("reset")}
            disabled={pending}
          />
        ) : (
          <Btn
            title="Girişe dön"
            outline
            tone="cyan"
            small
            onPress={() => switchMode("login")}
            disabled={pending}
          />
        )}
      </Card>
      <Btn
        title="Karşılama Ekranı"
        outline
        small
        tone="purple"
        icon="chevron-back"
        onPress={() => switchMode("welcome")}
      />
      <Btn
        title="Misafir Olarak Keşfet"
        outline
        tone="gold"
        icon="compass-outline"
        onPress={() => nav("discover")}
      />
      <RowView style={{ justifyContent: "center", gap: 16 }}>
        {[
          ["calendar-outline", "Randevu"],
          ["cut-outline", "Usta"],
          ["storefront-outline", "İşletme"],
        ].map(([icon, label]) => (
          <RowView key={label} style={{ gap: 5 }}>
            <Icon name={icon} tone="cyan" size={15} />
            <Txt muted size={10}>
              {label}
            </Txt>
          </RowView>
        ))}
      </RowView>
      <Txt muted size={10} style={{ textAlign: "center" }}>
        DraBornStyle · v{appVersion}
      </Txt>
    </Page>
  );
}

export function ResetPasswordScreen() {
  const { toast, nav } = useApp();
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit() {
    if (pending) return;
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await supabase.auth.updateUser({ password });
      if (result.error) throw result.error;
      toast("Şifreniz değiştirildi.");
      nav("home");
    } catch (e) {
      setError(authErrorMessage(e as Error));
    } finally {
      setPending(false);
    }
  }
  return (
    <Page>
      <Hero
        title="Yeni başlangıç"
        subtitle="Yeni şifrenle hesabına güvenle dön."
        compact
      />
      <Card tone="cyan">
        <Field
          label="Yeni şifre (en az 8 karakter)"
          value={password}
          onChange={setPassword}
          secure
          icon="lock-closed-outline"
          onSubmit={submit}
        />
        {error && (
          <Txt tone="red" size={12}>
            {error}
          </Txt>
        )}
        <Btn
          title={pending ? "Kaydediliyor…" : "Şifremi Değiştir"}
          onPress={submit}
          disabled={pending}
        />
      </Card>
    </Page>
  );
}
