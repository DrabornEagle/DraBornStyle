import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { dkd_is_supabase_env_ready, dkd_supabase_client } from './src/dkd_config/dkd_supabase_client';

type Dkd_AuthMode = 'login' | 'signup';

export default function Dkd_DraBornStyleApp() {
  const [dkd_auth_mode, dkd_set_auth_mode] = React.useState<Dkd_AuthMode>('login');
  const [dkd_email, dkd_set_email] = React.useState('');
  const [dkd_password, dkd_set_password] = React.useState('');
  const [dkd_loading, dkd_set_loading] = React.useState(false);
  const [dkd_status_text, dkd_set_status_text] = React.useState('Supabase bağlantısı hazır. E-posta ve şifre ile devam et.');
  const [dkd_user_email, dkd_set_user_email] = React.useState<string | null>(null);

  React.useEffect(() => {
    dkd_supabase_client.auth.getSession().then((dkd_response: any) => {
      dkd_set_user_email(dkd_response.data.session?.user?.email ?? null);
    });

    const dkd_subscription_response = dkd_supabase_client.auth.onAuthStateChange((_dkd_event: string, dkd_session: any) => {
      dkd_set_user_email(dkd_session?.user?.email ?? null);
    });

    return () => {
      dkd_subscription_response.data.subscription.unsubscribe();
    };
  }, []);

  async function dkd_handle_auth() {
    const dkd_clean_email = dkd_email.trim().toLowerCase();

    if (!dkd_is_supabase_env_ready) {
      dkd_set_status_text('Supabase publishable key eksik veya hatalı.');
      return;
    }

    if (!dkd_clean_email || dkd_password.length < 6) {
      dkd_set_status_text('E-posta gir ve en az 6 karakter şifre yaz.');
      return;
    }

    dkd_set_loading(true);
    dkd_set_status_text(dkd_auth_mode === 'login' ? 'Giriş deneniyor...' : 'Kayıt oluşturuluyor...');

    const dkd_response =
      dkd_auth_mode === 'login'
        ? await dkd_supabase_client.auth.signInWithPassword({ email: dkd_clean_email, password: dkd_password })
        : await dkd_supabase_client.auth.signUp({ email: dkd_clean_email, password: dkd_password });

    dkd_set_loading(false);

    if (dkd_response.error) {
      dkd_set_status_text(dkd_response.error.message);
      return;
    }

    if (dkd_auth_mode === 'signup') {
      dkd_set_status_text('Kayıt alındı. Supabase e-posta doğrulama açıksa mailini kontrol et.');
      return;
    }

    dkd_set_status_text('Giriş başarılı. Sıradaki adım rol seçimi.');
  }

  async function dkd_handle_logout() {
    await dkd_supabase_client.auth.signOut();
    dkd_set_status_text('Çıkış yapıldı.');
  }

  return (
    <SafeAreaView style={dkd_styles.dkd_safe_area}>
      <ScrollView contentContainerStyle={dkd_styles.dkd_screen} keyboardShouldPersistTaps="handled">
        <View style={dkd_styles.dkd_card}>
          <Text style={dkd_styles.dkd_title}>DraBornStyle v0.1</Text>
          <Text style={dkd_styles.dkd_text}>Gerçek Supabase Auth ekranı.</Text>

          <View style={dkd_styles.dkd_status_box}>
            <Text style={dkd_styles.dkd_label}>Supabase .env durumu</Text>
            <Text style={dkd_is_supabase_env_ready ? dkd_styles.dkd_success : dkd_styles.dkd_warning}>
              {dkd_is_supabase_env_ready ? 'Bağlantı bilgileri hazır' : 'Publishable key eksik veya hatalı'}
            </Text>
          </View>

          {dkd_user_email ? (
            <View style={dkd_styles.dkd_signed_card}>
              <Text style={dkd_styles.dkd_label}>Aktif hesap</Text>
              <Text style={dkd_styles.dkd_success}>{dkd_user_email}</Text>
              <TouchableOpacity style={dkd_styles.dkd_secondary_button} onPress={dkd_handle_logout}>
                <Text style={dkd_styles.dkd_secondary_button_text}>Çıkış Yap</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={dkd_styles.dkd_mode_row}>
                <TouchableOpacity
                  style={dkd_auth_mode === 'login' ? dkd_styles.dkd_mode_active : dkd_styles.dkd_mode_button}
                  onPress={() => dkd_set_auth_mode('login')}
                >
                  <Text style={dkd_styles.dkd_mode_text}>Giriş Yap</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={dkd_auth_mode === 'signup' ? dkd_styles.dkd_mode_active : dkd_styles.dkd_mode_button}
                  onPress={() => dkd_set_auth_mode('signup')}
                >
                  <Text style={dkd_styles.dkd_mode_text}>Kayıt Ol</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                value={dkd_email}
                onChangeText={dkd_set_email}
                placeholder="E-posta"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                keyboardType="email-address"
                style={dkd_styles.dkd_input}
              />
              <TextInput
                value={dkd_password}
                onChangeText={dkd_set_password}
                placeholder="Şifre"
                placeholderTextColor="#64748B"
                secureTextEntry
                style={dkd_styles.dkd_input}
              />

              <TouchableOpacity style={dkd_styles.dkd_primary_button} onPress={dkd_handle_auth} disabled={dkd_loading}>
                <Text style={dkd_styles.dkd_primary_button_text}>{dkd_loading ? 'Bekle...' : dkd_auth_mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={dkd_styles.dkd_status_text}>{dkd_status_text}</Text>
          <Text style={dkd_styles.dkd_next}>Sıradaki adım: rol seçimi ekranı.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const dkd_styles = StyleSheet.create({
  dkd_safe_area: { flex: 1, backgroundColor: '#07111F' },
  dkd_screen: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  dkd_card: { borderRadius: 26, padding: 22, backgroundColor: '#111827', borderWidth: 1, borderColor: '#334155' },
  dkd_title: { color: '#F8FAFC', fontSize: 30, fontWeight: '900', marginBottom: 12 },
  dkd_text: { color: '#CBD5E1', fontSize: 16, lineHeight: 24 },
  dkd_status_box: { marginTop: 18, padding: 16, borderRadius: 18, backgroundColor: '#0B1324' },
  dkd_label: { color: '#94A3B8', fontSize: 14, fontWeight: '800', marginBottom: 8 },
  dkd_success: { color: '#86EFAC', fontSize: 17, fontWeight: '900' },
  dkd_warning: { color: '#FDE68A', fontSize: 17, fontWeight: '900' },
  dkd_signed_card: { marginTop: 18, padding: 16, borderRadius: 18, backgroundColor: '#0B1324' },
  dkd_mode_row: { flexDirection: 'row', gap: 10, marginTop: 18, marginBottom: 14 },
  dkd_mode_button: { flex: 1, padding: 12, borderRadius: 14, backgroundColor: '#0B1324', alignItems: 'center' },
  dkd_mode_active: { flex: 1, padding: 12, borderRadius: 14, backgroundColor: '#1D4ED8', alignItems: 'center' },
  dkd_mode_text: { color: '#F8FAFC', fontSize: 15, fontWeight: '900' },
  dkd_input: { marginBottom: 12, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, color: '#F8FAFC', backgroundColor: '#0B1324', borderWidth: 1, borderColor: '#334155', fontSize: 16 },
  dkd_primary_button: { marginTop: 4, padding: 16, borderRadius: 18, backgroundColor: '#38BDF8', alignItems: 'center' },
  dkd_primary_button_text: { color: '#07111F', fontSize: 16, fontWeight: '900' },
  dkd_secondary_button: { marginTop: 14, padding: 14, borderRadius: 16, backgroundColor: '#1E293B', alignItems: 'center' },
  dkd_secondary_button_text: { color: '#F8FAFC', fontSize: 15, fontWeight: '900' },
  dkd_status_text: { color: '#CBD5E1', fontSize: 14, lineHeight: 20, marginTop: 16 },
  dkd_next: { marginTop: 18, color: '#7DD3FC', fontSize: 15, lineHeight: 22, fontWeight: '800' }
});
