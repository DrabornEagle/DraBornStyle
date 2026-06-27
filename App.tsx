import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { dkd_is_supabase_env_ready, dkd_supabase_client } from './src/dkd_config/dkd_supabase_client';

type Dkd_AuthMode = 'login' | 'signup';
type Dkd_RoleKey = 'customer' | 'business' | 'master' | 'admin';

type Dkd_RoleOption = {
  dkd_key: Dkd_RoleKey;
  dkd_title: string;
  dkd_caption: string;
  dkd_icon: string;
};

const dkd_role_options: Dkd_RoleOption[] = [
  {
    dkd_key: 'customer',
    dkd_title: 'Müşteri',
    dkd_caption: 'Randevu al, işletmeleri keşfet, hizmetleri görüntüle.',
    dkd_icon: '🌴'
  },
  {
    dkd_key: 'business',
    dkd_title: 'İşletme Sahibi',
    dkd_caption: 'Salon profilini, ustaları, hizmetleri ve fiyatları yönet.',
    dkd_icon: '🏙️'
  },
  {
    dkd_key: 'master',
    dkd_title: 'Usta',
    dkd_caption: 'Takvimini, işlemlerini ve günlük akışını takip et.',
    dkd_icon: '✂️'
  },
  {
    dkd_key: 'admin',
    dkd_title: 'Admin',
    dkd_caption: 'Tüm yönetim, onay ve platform kontrolünü tek panelde topla.',
    dkd_icon: '🦅'
  }
];

export default function Dkd_DraBornStyleApp() {
  const [dkd_auth_mode, dkd_set_auth_mode] = React.useState<Dkd_AuthMode>('login');
  const [dkd_email, dkd_set_email] = React.useState('');
  const [dkd_password, dkd_set_password] = React.useState('');
  const [dkd_loading, dkd_set_loading] = React.useState(false);
  const [dkd_status_text, dkd_set_status_text] = React.useState('Supabase bağlantısı hazır. E-posta ve şifre ile devam et.');
  const [dkd_user_email, dkd_set_user_email] = React.useState<string | null>(null);
  const [dkd_user_id, dkd_set_user_id] = React.useState<string | null>(null);
  const [dkd_saved_role, dkd_set_saved_role] = React.useState<Dkd_RoleKey | null>(null);
  const [dkd_role_loading, dkd_set_role_loading] = React.useState(false);

  async function dkd_load_user_role(dkd_next_user_id: string | null) {
    if (!dkd_next_user_id) {
      dkd_set_saved_role(null);
      return;
    }

    const dkd_role_response = await dkd_supabase_client
      .from('dkd_user_profiles')
      .select('dkd_role')
      .eq('dkd_user_id', dkd_next_user_id)
      .maybeSingle();

    if (dkd_role_response.data?.dkd_role) {
      dkd_set_saved_role(dkd_role_response.data.dkd_role as Dkd_RoleKey);
    } else {
      dkd_set_saved_role(null);
    }
  }

  React.useEffect(() => {
    dkd_supabase_client.auth.getSession().then((dkd_response: any) => {
      const dkd_session_user = dkd_response.data.session?.user ?? null;
      dkd_set_user_email(dkd_session_user?.email ?? null);
      dkd_set_user_id(dkd_session_user?.id ?? null);
      dkd_load_user_role(dkd_session_user?.id ?? null);
    });

    const dkd_subscription_response = dkd_supabase_client.auth.onAuthStateChange((_dkd_event: string, dkd_session: any) => {
      const dkd_next_user = dkd_session?.user ?? null;
      dkd_set_user_email(dkd_next_user?.email ?? null);
      dkd_set_user_id(dkd_next_user?.id ?? null);
      dkd_load_user_role(dkd_next_user?.id ?? null);
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
      dkd_set_status_text('Kayıt alındı. Hesap açıksa rolünü seçebilirsin. Doğrulama açıksa mailini kontrol et.');
      return;
    }

    dkd_set_status_text('Giriş başarılı. Miami rol seçimi ekranından devam et.');
  }

  async function dkd_handle_logout() {
    await dkd_supabase_client.auth.signOut();
    dkd_set_saved_role(null);
    dkd_set_status_text('Çıkış yapıldı.');
  }

  async function dkd_save_role(dkd_role: Dkd_RoleKey) {
    if (!dkd_user_id) {
      dkd_set_status_text('Rol seçmek için önce giriş yapmalısın.');
      return;
    }

    dkd_set_role_loading(true);
    dkd_set_status_text('Rol kaydediliyor...');

    const dkd_profile_response = await dkd_supabase_client
      .from('dkd_user_profiles')
      .upsert(
        {
          dkd_user_id,
          dkd_role: dkd_role,
          dkd_display_name: dkd_user_email ?? '',
          dkd_is_active: true
        },
        { onConflict: 'dkd_user_id' }
      );

    dkd_set_role_loading(false);

    if (dkd_profile_response.error) {
      dkd_set_status_text(dkd_profile_response.error.message);
      return;
    }

    dkd_set_saved_role(dkd_role);
    dkd_set_status_text('Rol kaydedildi. Sıradaki adım role göre panel yönlendirmesi.');
  }

  const dkd_saved_role_title = dkd_role_options.find((dkd_role) => dkd_role.dkd_key === dkd_saved_role)?.dkd_title;

  return (
    <SafeAreaView style={dkd_styles.dkd_safe_area}>
      <ScrollView contentContainerStyle={dkd_styles.dkd_screen} keyboardShouldPersistTaps="handled">
        <View style={dkd_styles.dkd_hero_card}>
          <Text style={dkd_styles.dkd_overline}>MIAMI STYLE • SMART BOOKING</Text>
          <Text style={dkd_styles.dkd_title}>DraBornStyle</Text>
          <Text style={dkd_styles.dkd_text}>Modern salon, usta ve müşteri yönetimi için v0.1 temel rol sistemi.</Text>

          <View style={dkd_styles.dkd_status_box}>
            <Text style={dkd_styles.dkd_label}>Supabase .env durumu</Text>
            <Text style={dkd_is_supabase_env_ready ? dkd_styles.dkd_success : dkd_styles.dkd_warning}>
              {dkd_is_supabase_env_ready ? 'Bağlantı bilgileri hazır' : 'Publishable key eksik veya hatalı'}
            </Text>
          </View>
        </View>

        <View style={dkd_styles.dkd_card}>
          {dkd_user_email ? (
            <View>
              <Text style={dkd_styles.dkd_section_title}>Aktif hesap</Text>
              <Text style={dkd_styles.dkd_account_text}>{dkd_user_email}</Text>
              <Text style={dkd_styles.dkd_status_text}>{dkd_saved_role_title ? `Seçili rol: ${dkd_saved_role_title}` : 'Henüz rol seçilmedi.'}</Text>
              <TouchableOpacity style={dkd_styles.dkd_secondary_button} onPress={dkd_handle_logout}>
                <Text style={dkd_styles.dkd_secondary_button_text}>Çıkış Yap</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={dkd_styles.dkd_mode_row}>
                <TouchableOpacity style={dkd_auth_mode === 'login' ? dkd_styles.dkd_mode_active : dkd_styles.dkd_mode_button} onPress={() => dkd_set_auth_mode('login')}>
                  <Text style={dkd_styles.dkd_mode_text}>Giriş Yap</Text>
                </TouchableOpacity>
                <TouchableOpacity style={dkd_auth_mode === 'signup' ? dkd_styles.dkd_mode_active : dkd_styles.dkd_mode_button} onPress={() => dkd_set_auth_mode('signup')}>
                  <Text style={dkd_styles.dkd_mode_text}>Kayıt Ol</Text>
                </TouchableOpacity>
              </View>

              <TextInput value={dkd_email} onChangeText={dkd_set_email} placeholder="E-posta" placeholderTextColor="#64748B" autoCapitalize="none" keyboardType="email-address" style={dkd_styles.dkd_input} />
              <TextInput value={dkd_password} onChangeText={dkd_set_password} placeholder="Şifre" placeholderTextColor="#64748B" secureTextEntry style={dkd_styles.dkd_input} />

              <TouchableOpacity style={dkd_styles.dkd_primary_button} onPress={dkd_handle_auth} disabled={dkd_loading}>
                <Text style={dkd_styles.dkd_primary_button_text}>{dkd_loading ? 'Bekle...' : dkd_auth_mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {dkd_user_email ? (
          <View style={dkd_styles.dkd_card}>
            <Text style={dkd_styles.dkd_section_title}>Rolünü seç</Text>
            <Text style={dkd_styles.dkd_text}>Admin tek yönetim rolüdür. Super Admin ayrımı v0.1 MVP içinde kullanılmaz.</Text>
            {dkd_role_options.map((dkd_role) => {
              const dkd_is_selected = dkd_saved_role === dkd_role.dkd_key;
              return (
                <TouchableOpacity key={dkd_role.dkd_key} style={dkd_is_selected ? dkd_styles.dkd_role_card_selected : dkd_styles.dkd_role_card} onPress={() => dkd_save_role(dkd_role.dkd_key)} disabled={dkd_role_loading}>
                  <Text style={dkd_styles.dkd_role_icon}>{dkd_role.dkd_icon}</Text>
                  <View style={dkd_styles.dkd_role_content}>
                    <Text style={dkd_styles.dkd_role_title}>{dkd_role.dkd_title}</Text>
                    <Text style={dkd_styles.dkd_role_caption}>{dkd_role.dkd_caption}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        <View style={dkd_styles.dkd_card_footer}>
          <Text style={dkd_styles.dkd_status_text}>{dkd_status_text}</Text>
          <Text style={dkd_styles.dkd_next}>Sıradaki adım: role göre panel yönlendirmesi ve işletme profili akışı.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const dkd_styles = StyleSheet.create({
  dkd_safe_area: { flex: 1, backgroundColor: '#06101F' },
  dkd_screen: { flexGrow: 1, padding: 20, paddingTop: 34, paddingBottom: 46 },
  dkd_hero_card: { borderRadius: 32, padding: 24, backgroundColor: '#101827', borderWidth: 1, borderColor: '#334155', marginBottom: 16 },
  dkd_card: { borderRadius: 28, padding: 20, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#263B5E', marginBottom: 16 },
  dkd_card_footer: { borderRadius: 24, padding: 18, backgroundColor: '#08111F', borderWidth: 1, borderColor: '#1E3A5F' },
  dkd_overline: { color: '#FB7185', fontSize: 12, fontWeight: '900', letterSpacing: 1.8, marginBottom: 10 },
  dkd_title: { color: '#F8FAFC', fontSize: 38, fontWeight: '900', marginBottom: 10 },
  dkd_text: { color: '#CBD5E1', fontSize: 16, lineHeight: 24 },
  dkd_status_box: { marginTop: 18, padding: 16, borderRadius: 20, backgroundColor: '#081225', borderWidth: 1, borderColor: '#172554' },
  dkd_label: { color: '#94A3B8', fontSize: 14, fontWeight: '800', marginBottom: 8 },
  dkd_success: { color: '#86EFAC', fontSize: 17, fontWeight: '900' },
  dkd_warning: { color: '#FDE68A', fontSize: 17, fontWeight: '900' },
  dkd_section_title: { color: '#F8FAFC', fontSize: 24, fontWeight: '900', marginBottom: 10 },
  dkd_account_text: { color: '#67E8F9', fontSize: 19, fontWeight: '900', marginBottom: 10 },
  dkd_mode_row: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  dkd_mode_button: { flex: 1, padding: 13, borderRadius: 16, backgroundColor: '#081225', alignItems: 'center', borderWidth: 1, borderColor: '#1E3A5F' },
  dkd_mode_active: { flex: 1, padding: 13, borderRadius: 16, backgroundColor: '#0EA5E9', alignItems: 'center' },
  dkd_mode_text: { color: '#F8FAFC', fontSize: 15, fontWeight: '900' },
  dkd_input: { marginBottom: 12, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, color: '#F8FAFC', backgroundColor: '#081225', borderWidth: 1, borderColor: '#334155', fontSize: 16 },
  dkd_primary_button: { marginTop: 4, padding: 16, borderRadius: 20, backgroundColor: '#22D3EE', alignItems: 'center' },
  dkd_primary_button_text: { color: '#06101F', fontSize: 16, fontWeight: '900' },
  dkd_secondary_button: { marginTop: 14, padding: 14, borderRadius: 18, backgroundColor: '#1E293B', alignItems: 'center' },
  dkd_secondary_button_text: { color: '#F8FAFC', fontSize: 15, fontWeight: '900' },
  dkd_role_card: { flexDirection: 'row', gap: 14, alignItems: 'center', marginTop: 12, padding: 16, borderRadius: 22, backgroundColor: '#081225', borderWidth: 1, borderColor: '#1E3A5F' },
  dkd_role_card_selected: { flexDirection: 'row', gap: 14, alignItems: 'center', marginTop: 12, padding: 16, borderRadius: 22, backgroundColor: '#164E63', borderWidth: 1, borderColor: '#67E8F9' },
  dkd_role_icon: { fontSize: 30 },
  dkd_role_content: { flex: 1 },
  dkd_role_title: { color: '#F8FAFC', fontSize: 18, fontWeight: '900', marginBottom: 4 },
  dkd_role_caption: { color: '#CBD5E1', fontSize: 14, lineHeight: 20 },
  dkd_status_text: { color: '#CBD5E1', fontSize: 14, lineHeight: 20 },
  dkd_next: { marginTop: 12, color: '#7DD3FC', fontSize: 15, lineHeight: 22, fontWeight: '800' }
});
