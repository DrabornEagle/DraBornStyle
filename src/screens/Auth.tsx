import React, { useState } from "react";
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
} from "../components/ui";
export function AuthScreen() {
  const { nav, toast } = useApp();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [pending, setPending] = useState(false);
  async function submit() {
    if (!email.includes("@")) {
      toast("Geçerli bir e-posta adresi yazın.", true);
      return;
    }
    if (mode !== "reset" && password.length < 8) {
      toast("Şifre en az 8 karakter olmalı.", true);
      return;
    }
    setPending(true);
    try {
      const result =
        mode === "signup"
          ? await supabase.auth.signUp({
              email: email.trim(),
              password,
              options: { data: { display_name: name || email.split("@")[0] } },
            })
          : mode === "reset"
            ? await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: AppLinking.createURL("reset"),
              })
            : await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
              });
      if (result.error) throw result.error;
      if (
        mode === "signup" &&
        !("session" in result.data && result.data.session)
      )
        toast(
          "Hesabınızı etkinleştirmek için e-postanıza gelen bağlantıyı açın.",
        );
      if (mode === "reset")
        toast("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setPending(false);
    }
  }
  return (
    <Page>
      <Hero
        title="Tarzın. Zamanın. Senin."
        subtitle="Berberinle aynı ritimde. Randevudan son dokunuşa."
      />
      <Card tone="pink">
        <Txt bold size={27}>
          DraBorn
          <Txt bold size={27} tone="pink">
            Style
          </Txt>
        </Txt>
        <Txt muted>Akıllı Berber ve Kuaför Yönetim Platformu</Txt>
        <RowView style={{ justifyContent: "space-between" }}>
          {[
            ["people-outline", "Müşteri"],
            ["cut-outline", "Usta"],
            ["storefront-outline", "İşletme"],
          ].map(([icon, label]) => (
            <View key={label} style={{ alignItems: "center", gap: 6 }}>
              <Icon name={icon} size={30} />
              <Txt size={12}>{label}</Txt>
            </View>
          ))}
        </RowView>
        {mode === "signup" && (
          <Field label="Adınız" value={name} onChange={setName} />
        )}
        <Field
          label="E-posta"
          value={email}
          onChange={setEmail}
          placeholder="ornek@eposta.com"
        />
        {mode !== "reset" && (
          <Field label="Şifre" value={password} onChange={setPassword} secure />
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
          icon="log-in-outline"
          disabled={pending}
        />
        <Btn
          title={mode === "login" ? "Hesap oluştur" : "Girişe dön"}
          outline
          onPress={() => setMode(mode === "login" ? "signup" : "login")}
        />
        {mode === "login" && (
          <Btn
            title="Şifremi unuttum"
            outline
            tone="cyan"
            small
            onPress={() => setMode("reset")}
          />
        )}
        <Btn
          title="Misafir Olarak Keşfet"
          outline
          tone="gold"
          icon="eye-outline"
          onPress={() => nav("discover")}
        />
      </Card>
      <Txt muted size={11}>
        v0.1.1 · Randevu, sohbet ve işletme yönetimi
      </Txt>
    </Page>
  );
}
export function ResetPasswordScreen() {
  const { toast, nav } = useApp();
  const [password, setPassword] = useState("");
  return (
    <Page>
      <SectionFallback />
      <Card>
        <Field
          label="Yeni şifre (en az 8 karakter)"
          value={password}
          onChange={setPassword}
          secure
        />
        <Btn
          title="Şifremi Değiştir"
          onPress={async () => {
            if (password.length < 8) {
              toast("Şifre en az 8 karakter olmalı.", true);
              return;
            }
            const { error } = await supabase.auth.updateUser({ password });
            if (error) toast(error.message, true);
            else {
              toast("Şifreniz değiştirildi.");
              nav("home");
            }
          }}
        />
      </Card>
    </Page>
  );
}
function SectionFallback() {
  return (
    <Txt bold size={26}>
      Yeni başlangıç
    </Txt>
  );
}
