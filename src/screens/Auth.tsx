import React, { useRef, useState } from "react";
import * as AppLinking from "expo-linking";
import { View } from "react-native";
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
  Chip,
} from "../components/ui";
import { appVersion, colors } from "../theme";
import { authErrorMessage, normalizeEmail, validEmail } from "../utils/auth";

export function AuthScreen() {
  const { nav, toast } = useApp();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
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
  return (
    <Page>
      <Hero
        title="Tarzın. Zamanın. Senin."
        subtitle="Berberinle aynı ritimde. Randevudan son dokunuşa."
        eyebrow="TARZININ YENİ ADRESİ"
        compact
      />
      <Card tone="pink" style={{ gap: 18 }}>
        <View style={{ gap: 5 }}>
          <Txt size={25} bold style={{ letterSpacing: -0.8 }}>
            {mode === "login"
              ? "İyi görünmek burada başlar."
              : mode === "signup"
                ? "Yeni tarzına merhaba."
                : "Yeniden buluşalım."}
          </Txt>
          <Txt muted size={12}>
            {mode === "login"
              ? "Hesabına gir, günün ritmini yakala."
              : mode === "signup"
                ? "Tek hesapla randevularını ve işini yönet."
                : "Hesabına dönebilmen için bir bağlantı gönderelim."}
          </Txt>
        </View>
        {mode !== "reset" && (
          <RowView style={{ gap: 8 }}>
            {[
              ["login", "Giriş"],
              ["signup", "Hesap oluştur"],
            ].map(([value, label]) => (
              <View key={value} style={{ flex: 1 }}>
                <Chip
                  label={label}
                  selected={mode === value}
                  onPress={() => !pending && switchMode(value as typeof mode)}
                  tone={value === "login" ? "pink" : "cyan"}
                />
              </View>
            ))}
          </RowView>
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
                  ? "Kayıt Ol"
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
