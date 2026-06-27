import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  Building2,
  Clock3,
  ImagePlus,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  Scissors,
  ShieldCheck,
  Sparkles,
  Store,
  UserPlus,
  UserRound,
  UsersRound
} from 'lucide-react-native';

import { dkd_is_supabase_env_ready, dkd_supabase_client } from './src/dkd_config/dkd_supabase_client';

type Dkd_AuthMode = 'login' | 'signup';
type Dkd_RoleKey = 'customer' | 'business' | 'master' | 'admin';
type Dkd_IconComponent = React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

type Dkd_RoleOption = {
  dkd_key: Dkd_RoleKey;
  dkd_title: string;
  dkd_caption: string;
  dkd_icon: Dkd_IconComponent;
};

type Dkd_MasterItem = {
  dkd_master_id: string;
  dkd_master_name: string;
  dkd_master_specialty?: string | null;
  dkd_master_phone?: string | null;
  dkd_bio?: string | null;
};

const dkd_role_options: Dkd_RoleOption[] = [
  { dkd_key: 'customer', dkd_title: 'Müşteri', dkd_caption: 'Randevu al, işletmeleri keşfet, hizmetleri görüntüle.', dkd_icon: UserRound },
  { dkd_key: 'business', dkd_title: 'İşletme Sahibi', dkd_caption: 'Salon profilini, ustaları, hizmetleri ve fiyatları yönet.', dkd_icon: Building2 },
  { dkd_key: 'master', dkd_title: 'Usta', dkd_caption: 'Takvimini, işlemlerini ve günlük akışını takip et.', dkd_icon: Scissors },
  { dkd_key: 'admin', dkd_title: 'Admin', dkd_caption: 'Tüm yönetim, onay ve platform kontrolünü tek panelde topla.', dkd_icon: ShieldCheck }
];

function dkd_create_slug(dkd_value: string) {
  return dkd_value
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 46);
}

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

  const [dkd_business_id, dkd_set_business_id] = React.useState<string | null>(null);
  const [dkd_business_name, dkd_set_business_name] = React.useState('');
  const [dkd_business_description, dkd_set_business_description] = React.useState('');
  const [dkd_business_phone, dkd_set_business_phone] = React.useState('');
  const [dkd_business_address, dkd_set_business_address] = React.useState('');
  const [dkd_business_hours, dkd_set_business_hours] = React.useState('Hafta içi 09:00 - 20:00');
  const [dkd_business_loading, dkd_set_business_loading] = React.useState(false);

  const [dkd_master_team, dkd_set_master_team] = React.useState<Dkd_MasterItem[]>([]);
  const [dkd_master_name, dkd_set_master_name] = React.useState('');
  const [dkd_master_specialty, dkd_set_master_specialty] = React.useState('');
  const [dkd_master_phone, dkd_set_master_phone] = React.useState('');
  const [dkd_master_bio, dkd_set_master_bio] = React.useState('');
  const [dkd_master_loading, dkd_set_master_loading] = React.useState(false);

  async function dkd_load_master_team(dkd_next_business_id: string | null) {
    if (!dkd_next_business_id) {
      dkd_set_master_team([]);
      return;
    }

    const dkd_master_response = await dkd_supabase_client
      .from('dkd_master_profiles')
      .select('dkd_master_id, dkd_master_name, dkd_master_specialty, dkd_master_phone, dkd_bio')
      .eq('dkd_business_id', dkd_next_business_id)
      .eq('dkd_is_active', true)
      .order('dkd_created_at', { ascending: false });

    if (!dkd_master_response.error) {
      dkd_set_master_team((dkd_master_response.data ?? []) as Dkd_MasterItem[]);
    }
  }

  async function dkd_load_business_profile(dkd_next_user_id: string | null) {
    if (!dkd_next_user_id) {
      dkd_set_business_id(null);
      dkd_set_master_team([]);
      return;
    }

    const dkd_business_response = await dkd_supabase_client
      .from('dkd_business_profiles')
      .select('dkd_business_id, dkd_business_name, dkd_business_description, dkd_business_phone, dkd_address_text, dkd_working_hours')
      .eq('dkd_owner_user_id', dkd_next_user_id)
      .order('dkd_created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (dkd_business_response.data) {
      const dkd_loaded_business_id = dkd_business_response.data.dkd_business_id ?? null;
      dkd_set_business_id(dkd_loaded_business_id);
      dkd_set_business_name(dkd_business_response.data.dkd_business_name ?? '');
      dkd_set_business_description(dkd_business_response.data.dkd_business_description ?? '');
      dkd_set_business_phone(dkd_business_response.data.dkd_business_phone ?? '');
      dkd_set_business_address(dkd_business_response.data.dkd_address_text ?? '');
      dkd_set_business_hours(dkd_business_response.data.dkd_working_hours?.dkd_summary ?? 'Hafta içi 09:00 - 20:00');
      dkd_load_master_team(dkd_loaded_business_id);
    } else {
      dkd_set_business_id(null);
      dkd_set_master_team([]);
    }
  }

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
      dkd_load_business_profile(dkd_session_user?.id ?? null);
    });

    const dkd_subscription_response = dkd_supabase_client.auth.onAuthStateChange((_dkd_event: string, dkd_session: any) => {
      const dkd_next_user = dkd_session?.user ?? null;
      dkd_set_user_email(dkd_next_user?.email ?? null);
      dkd_set_user_id(dkd_next_user?.id ?? null);
      dkd_load_user_role(dkd_next_user?.id ?? null);
      dkd_load_business_profile(dkd_next_user?.id ?? null);
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

    dkd_set_status_text(dkd_auth_mode === 'signup' ? 'Kayıt alındı. Rolünü seçip devam edebilirsin.' : 'Giriş başarılı. Miami panelinden devam et.');
  }

  async function dkd_handle_logout() {
    await dkd_supabase_client.auth.signOut();
    dkd_set_saved_role(null);
    dkd_set_business_id(null);
    dkd_set_master_team([]);
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
      .upsert({ dkd_user_id, dkd_role, dkd_display_name: dkd_user_email ?? '', dkd_is_active: true }, { onConflict: 'dkd_user_id' });

    dkd_set_role_loading(false);

    if (dkd_profile_response.error) {
      dkd_set_status_text(dkd_profile_response.error.message);
      return;
    }

    dkd_set_saved_role(dkd_role);
    dkd_set_status_text(dkd_role === 'business' ? 'İşletme sahibi rolü kaydedildi. Şimdi salon profilini oluştur.' : 'Rol kaydedildi. Sıradaki adım role göre panel yönlendirmesi.');
  }

  async function dkd_save_business_profile() {
    if (!dkd_user_id) {
      dkd_set_status_text('İşletme profili için önce giriş yapmalısın.');
      return;
    }

    const dkd_clean_name = dkd_business_name.trim();
    if (dkd_clean_name.length < 2) {
      dkd_set_status_text('İşletme adı en az 2 karakter olmalı.');
      return;
    }

    dkd_set_business_loading(true);
    dkd_set_status_text('İşletme profili kaydediliyor...');

    const dkd_business_payload = {
      dkd_owner_user_id: dkd_user_id,
      dkd_business_name: dkd_clean_name,
      dkd_business_slug: `${dkd_create_slug(dkd_clean_name)}-${dkd_user_id.slice(0, 6)}`,
      dkd_business_description: dkd_business_description.trim(),
      dkd_business_phone: dkd_business_phone.trim(),
      dkd_address_text: dkd_business_address.trim(),
      dkd_working_hours: { dkd_summary: dkd_business_hours.trim() },
      dkd_is_active: true
    };

    const dkd_business_response = dkd_business_id
      ? await dkd_supabase_client.from('dkd_business_profiles').update(dkd_business_payload).eq('dkd_business_id', dkd_business_id).select('dkd_business_id').single()
      : await dkd_supabase_client.from('dkd_business_profiles').insert(dkd_business_payload).select('dkd_business_id').single();

    dkd_set_business_loading(false);

    if (dkd_business_response.error) {
      dkd_set_status_text(dkd_business_response.error.message);
      return;
    }

    dkd_set_business_id(dkd_business_response.data.dkd_business_id);
    dkd_load_master_team(dkd_business_response.data.dkd_business_id);
    dkd_set_status_text('İşletme profili kaydedildi. Şimdi usta/çalışan ekleyebilirsin.');
  }

  async function dkd_save_master_profile() {
    if (!dkd_business_id) {
      dkd_set_status_text('Usta eklemek için önce işletme profilini kaydet.');
      return;
    }

    const dkd_clean_master_name = dkd_master_name.trim();
    if (dkd_clean_master_name.length < 2) {
      dkd_set_status_text('Usta adı en az 2 karakter olmalı.');
      return;
    }

    dkd_set_master_loading(true);
    dkd_set_status_text('Usta / çalışan kaydediliyor...');

    const dkd_master_response = await dkd_supabase_client
      .from('dkd_master_profiles')
      .insert({
        dkd_business_id,
        dkd_master_name: dkd_clean_master_name,
        dkd_master_specialty: dkd_master_specialty.trim(),
        dkd_master_phone: dkd_master_phone.trim(),
        dkd_bio: dkd_master_bio.trim(),
        dkd_is_active: true
      })
      .select('dkd_master_id')
      .single();

    dkd_set_master_loading(false);

    if (dkd_master_response.error) {
      dkd_set_status_text(dkd_master_response.error.message);
      return;
    }

    dkd_set_master_name('');
    dkd_set_master_specialty('');
    dkd_set_master_phone('');
    dkd_set_master_bio('');
    dkd_load_master_team(dkd_business_id);
    dkd_set_status_text('Usta / çalışan kaydedildi. Sıradaki adım hizmet fiyat ve süre ekranı.');
  }

  const dkd_saved_role_title = dkd_role_options.find((dkd_role) => dkd_role.dkd_key === dkd_saved_role)?.dkd_title;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={dkd_styles.dkd_safe_area}>
        <LinearGradient colors={['#8BE9FF', '#FDE68A', '#FF7AB6', '#38BDF8']} style={dkd_styles.dkd_gradient}>
          <View style={dkd_styles.dkd_sun_blob} />
          <View style={dkd_styles.dkd_ocean_blob} />
          <ScrollView contentContainerStyle={dkd_styles.dkd_screen} keyboardShouldPersistTaps="handled">
            <LinearGradient colors={['#06B6D4', '#EC4899', '#FB923C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={dkd_styles.dkd_hero_card}>
              <View style={dkd_styles.dkd_brand_row}>
                <View style={dkd_styles.dkd_logo_bubble}>
                  <Sparkles color="#0891B2" size={27} strokeWidth={2.8} />
                </View>
                <Text style={dkd_styles.dkd_overline}>MIAMI SALON • SMART STYLE</Text>
              </View>
              <Text style={dkd_styles.dkd_title}>DraBornStyle</Text>
              <Text style={dkd_styles.dkd_hero_text}>Berber, kuaför ve salonlar için canlı, hızlı ve profesyonel randevu yönetimi.</Text>

              <View style={dkd_styles.dkd_mini_row}>
                <View style={dkd_styles.dkd_mini_pill}><Scissors color="#0F172A" size={16} strokeWidth={2.8} /><Text style={dkd_styles.dkd_mini_text}>Salon</Text></View>
                <View style={dkd_styles.dkd_mini_pill}><Clock3 color="#0F172A" size={16} strokeWidth={2.8} /><Text style={dkd_styles.dkd_mini_text}>Randevu</Text></View>
                <View style={dkd_styles.dkd_mini_pill}><Sparkles color="#0F172A" size={16} strokeWidth={2.8} /><Text style={dkd_styles.dkd_mini_text}>Premium</Text></View>
              </View>
            </LinearGradient>

            <View style={dkd_styles.dkd_status_banner}>
              <View style={dkd_styles.dkd_status_icon}><ShieldCheck color="#06B6D4" size={23} strokeWidth={2.8} /></View>
              <View style={dkd_styles.dkd_role_content}>
                <Text style={dkd_styles.dkd_label_dark}>Supabase .env durumu</Text>
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
                  <Text style={dkd_styles.dkd_status_text_dark}>{dkd_saved_role_title ? `Seçili rol: ${dkd_saved_role_title}` : 'Henüz rol seçilmedi.'}</Text>
                  <TouchableOpacity style={dkd_styles.dkd_secondary_button} onPress={dkd_handle_logout}>
                    <LogOut color="#0F172A" size={18} strokeWidth={2.7} />
                    <Text style={dkd_styles.dkd_secondary_button_text}>Çıkış Yap</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={dkd_styles.dkd_mode_row}>
                    <TouchableOpacity style={dkd_auth_mode === 'login' ? dkd_styles.dkd_mode_active : dkd_styles.dkd_mode_button} onPress={() => dkd_set_auth_mode('login')}>
                      <Text style={dkd_auth_mode === 'login' ? dkd_styles.dkd_mode_text_active : dkd_styles.dkd_mode_text}>Giriş Yap</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={dkd_auth_mode === 'signup' ? dkd_styles.dkd_mode_active : dkd_styles.dkd_mode_button} onPress={() => dkd_set_auth_mode('signup')}>
                      <Text style={dkd_auth_mode === 'signup' ? dkd_styles.dkd_mode_text_active : dkd_styles.dkd_mode_text}>Kayıt Ol</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={dkd_styles.dkd_input_shell}><Mail color="#06B6D4" size={19} strokeWidth={2.6} /><TextInput value={dkd_email} onChangeText={dkd_set_email} placeholder="E-posta" placeholderTextColor="#64748B" autoCapitalize="none" keyboardType="email-address" style={dkd_styles.dkd_input} /></View>
                  <View style={dkd_styles.dkd_input_shell}><LockKeyhole color="#06B6D4" size={19} strokeWidth={2.6} /><TextInput value={dkd_password} onChangeText={dkd_set_password} placeholder="Şifre" placeholderTextColor="#64748B" secureTextEntry style={dkd_styles.dkd_input} /></View>

                  <TouchableOpacity style={dkd_styles.dkd_primary_button} onPress={dkd_handle_auth} disabled={dkd_loading}>
                    <Text style={dkd_styles.dkd_primary_button_text}>{dkd_loading ? 'Bekle...' : dkd_auth_mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {dkd_user_email ? (
              <View style={dkd_styles.dkd_card}>
                <Text style={dkd_styles.dkd_section_title}>Rolünü seç</Text>
                <Text style={dkd_styles.dkd_text_dark}>Admin tek yönetim rolüdür. Super Admin ayrımı v0.1 MVP içinde kullanılmaz.</Text>
                {dkd_role_options.map((dkd_role) => {
                  const DkdIcon = dkd_role.dkd_icon;
                  const dkd_is_selected = dkd_saved_role === dkd_role.dkd_key;
                  return (
                    <TouchableOpacity key={dkd_role.dkd_key} style={dkd_is_selected ? dkd_styles.dkd_role_card_selected : dkd_styles.dkd_role_card} onPress={() => dkd_save_role(dkd_role.dkd_key)} disabled={dkd_role_loading}>
                      <View style={dkd_is_selected ? dkd_styles.dkd_icon_tile_selected : dkd_styles.dkd_icon_tile}>
                        <DkdIcon color={dkd_is_selected ? '#0F172A' : '#06B6D4'} size={25} strokeWidth={2.7} />
                      </View>
                      <View style={dkd_styles.dkd_role_content}>
                        <Text style={dkd_styles.dkd_role_title}>{dkd_role.dkd_title}</Text>
                        <Text style={dkd_styles.dkd_role_caption}>{dkd_role.dkd_caption}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            {dkd_user_email && dkd_saved_role === 'business' ? (
              <View>
                <View style={dkd_styles.dkd_card}>
                  <View style={dkd_styles.dkd_form_header_row}>
                    <View style={dkd_styles.dkd_logo_bubble_small}><Store color="#EC4899" size={22} strokeWidth={2.7} /></View>
                    <View style={dkd_styles.dkd_role_content}>
                      <Text style={dkd_styles.dkd_section_title}>İşletme profili</Text>
                      <Text style={dkd_styles.dkd_status_text_dark}>Salonunu Miami vitrini gibi hazırla.</Text>
                    </View>
                  </View>

                  <View style={dkd_styles.dkd_upload_row}>
                    <View style={dkd_styles.dkd_upload_box}><ImagePlus color="#EC4899" size={26} strokeWidth={2.7} /><Text style={dkd_styles.dkd_upload_text}>Logo</Text></View>
                    <View style={dkd_styles.dkd_upload_box_wide}><ImagePlus color="#06B6D4" size={26} strokeWidth={2.7} /><Text style={dkd_styles.dkd_upload_text}>Kapak görseli</Text></View>
                  </View>

                  <TextInput value={dkd_business_name} onChangeText={dkd_set_business_name} placeholder="İşletme adı" placeholderTextColor="#64748B" style={dkd_styles.dkd_plain_input} />
                  <TextInput value={dkd_business_description} onChangeText={dkd_set_business_description} placeholder="Kısa açıklama" placeholderTextColor="#64748B" multiline style={dkd_styles.dkd_plain_input_tall} />
                  <View style={dkd_styles.dkd_input_shell}><Phone color="#06B6D4" size={19} strokeWidth={2.6} /><TextInput value={dkd_business_phone} onChangeText={dkd_set_business_phone} placeholder="Telefon" placeholderTextColor="#64748B" keyboardType="phone-pad" style={dkd_styles.dkd_input} /></View>
                  <View style={dkd_styles.dkd_input_shell}><MapPin color="#06B6D4" size={19} strokeWidth={2.6} /><TextInput value={dkd_business_address} onChangeText={dkd_set_business_address} placeholder="Adres ve konum bilgisi" placeholderTextColor="#64748B" style={dkd_styles.dkd_input} /></View>
                  <View style={dkd_styles.dkd_input_shell}><Clock3 color="#06B6D4" size={19} strokeWidth={2.6} /><TextInput value={dkd_business_hours} onChangeText={dkd_set_business_hours} placeholder="Çalışma saatleri" placeholderTextColor="#64748B" style={dkd_styles.dkd_input} /></View>

                  <TouchableOpacity style={dkd_styles.dkd_primary_button} onPress={dkd_save_business_profile} disabled={dkd_business_loading}>
                    <Save color="#0F172A" size={18} strokeWidth={2.8} />
                    <Text style={dkd_styles.dkd_primary_button_text}>{dkd_business_loading ? 'Kaydediliyor...' : dkd_business_id ? 'İşletmeyi Güncelle' : 'İşletmeyi Oluştur'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={dkd_styles.dkd_card}>
                  <View style={dkd_styles.dkd_form_header_row}>
                    <View style={dkd_styles.dkd_logo_bubble_small}><UsersRound color="#06B6D4" size={22} strokeWidth={2.7} /></View>
                    <View style={dkd_styles.dkd_role_content}>
                      <Text style={dkd_styles.dkd_section_title}>Usta / çalışan ekle</Text>
                      <Text style={dkd_styles.dkd_status_text_dark}>Takvim ve hizmet ataması için ekibini oluştur.</Text>
                    </View>
                  </View>

                  {!dkd_business_id ? <Text style={dkd_styles.dkd_warning_note}>Önce işletme profilini kaydet, sonra usta ekleyebilirsin.</Text> : null}

                  <TextInput value={dkd_master_name} onChangeText={dkd_set_master_name} placeholder="Usta adı soyadı" placeholderTextColor="#64748B" style={dkd_styles.dkd_plain_input} />
                  <View style={dkd_styles.dkd_input_shell}><Scissors color="#06B6D4" size={19} strokeWidth={2.6} /><TextInput value={dkd_master_specialty} onChangeText={dkd_set_master_specialty} placeholder="Uzmanlık: saç kesim, sakal, boya..." placeholderTextColor="#64748B" style={dkd_styles.dkd_input} /></View>
                  <View style={dkd_styles.dkd_input_shell}><Phone color="#06B6D4" size={19} strokeWidth={2.6} /><TextInput value={dkd_master_phone} onChangeText={dkd_set_master_phone} placeholder="Telefon" placeholderTextColor="#64748B" keyboardType="phone-pad" style={dkd_styles.dkd_input} /></View>
                  <TextInput value={dkd_master_bio} onChangeText={dkd_set_master_bio} placeholder="Kısa not / bio" placeholderTextColor="#64748B" multiline style={dkd_styles.dkd_plain_input_tall} />

                  <TouchableOpacity style={dkd_styles.dkd_primary_button} onPress={dkd_save_master_profile} disabled={dkd_master_loading}>
                    <UserPlus color="#0F172A" size={18} strokeWidth={2.8} />
                    <Text style={dkd_styles.dkd_primary_button_text}>{dkd_master_loading ? 'Kaydediliyor...' : 'Usta / Çalışan Ekle'}</Text>
                  </TouchableOpacity>

                  {dkd_master_team.length > 0 ? (
                    <View style={dkd_styles.dkd_team_list}>
                      <Text style={dkd_styles.dkd_team_title}>Ekibin</Text>
                      {dkd_master_team.map((dkd_master_item) => (
                        <View key={dkd_master_item.dkd_master_id} style={dkd_styles.dkd_team_card}>
                          <View style={dkd_styles.dkd_icon_tile}><Scissors color="#06B6D4" size={21} strokeWidth={2.7} /></View>
                          <View style={dkd_styles.dkd_role_content}>
                            <Text style={dkd_styles.dkd_role_title}>{dkd_master_item.dkd_master_name}</Text>
                            <Text style={dkd_styles.dkd_role_caption}>{dkd_master_item.dkd_master_specialty || 'Uzmanlık eklenmedi'}{dkd_master_item.dkd_master_phone ? ` • ${dkd_master_item.dkd_master_phone}` : ''}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            ) : null}

            <View style={dkd_styles.dkd_footer_card}>
              <Text style={dkd_styles.dkd_status_text_dark}>{dkd_status_text}</Text>
              <Text style={dkd_styles.dkd_next}>Sıradaki adım: hizmet ekleme, hizmet fiyatı ve hizmet süresi ekranı.</Text>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const dkd_styles = StyleSheet.create({
  dkd_safe_area: { flex: 1, backgroundColor: '#8BE9FF' },
  dkd_gradient: { flex: 1 },
  dkd_sun_blob: { position: 'absolute', top: 24, right: -50, width: 170, height: 170, borderRadius: 85, backgroundColor: 'rgba(251, 146, 60, 0.35)' },
  dkd_ocean_blob: { position: 'absolute', top: 230, left: -80, width: 210, height: 210, borderRadius: 105, backgroundColor: 'rgba(6, 182, 212, 0.28)' },
  dkd_screen: { flexGrow: 1, padding: 20, paddingTop: 30, paddingBottom: 46 },
  dkd_hero_card: { borderRadius: 36, padding: 25, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.65)' },
  dkd_card: { borderRadius: 30, padding: 20, backgroundColor: 'rgba(255, 255, 255, 0.92)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.82)', marginBottom: 16 },
  dkd_footer_card: { borderRadius: 26, padding: 18, backgroundColor: 'rgba(255, 255, 255, 0.84)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.78)' },
  dkd_brand_row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  dkd_logo_bubble: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  dkd_logo_bubble_small: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FED7AA' },
  dkd_overline: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 1.8, flex: 1 },
  dkd_title: { color: '#FFFFFF', fontSize: 42, fontWeight: '900', marginBottom: 10 },
  dkd_hero_text: { color: '#F8FAFC', fontSize: 18, lineHeight: 27, fontWeight: '700' },
  dkd_mini_row: { flexDirection: 'row', gap: 9, flexWrap: 'wrap', marginTop: 18 },
  dkd_mini_pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.86)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  dkd_mini_text: { color: '#0F172A', fontSize: 13, fontWeight: '900' },
  dkd_status_banner: { flexDirection: 'row', gap: 12, alignItems: 'center', borderRadius: 28, padding: 16, backgroundColor: 'rgba(255,255,255,0.90)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.78)', marginBottom: 16 },
  dkd_status_icon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECFEFF' },
  dkd_label_dark: { color: '#64748B', fontSize: 14, fontWeight: '900', marginBottom: 6 },
  dkd_success: { color: '#059669', fontSize: 17, fontWeight: '900' },
  dkd_warning: { color: '#B45309', fontSize: 17, fontWeight: '900' },
  dkd_warning_note: { color: '#B45309', fontSize: 14, lineHeight: 20, fontWeight: '800', marginBottom: 12 },
  dkd_section_title: { color: '#0F172A', fontSize: 25, fontWeight: '900', marginBottom: 7 },
  dkd_account_text: { color: '#0891B2', fontSize: 19, fontWeight: '900', marginBottom: 10 },
  dkd_text_dark: { color: '#334155', fontSize: 16, lineHeight: 24 },
  dkd_status_text_dark: { color: '#475569', fontSize: 14, lineHeight: 20 },
  dkd_mode_row: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  dkd_mode_button: { flex: 1, padding: 13, borderRadius: 18, backgroundColor: '#F8FAFC', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  dkd_mode_active: { flex: 1, padding: 13, borderRadius: 18, backgroundColor: '#0EA5E9', alignItems: 'center' },
  dkd_mode_text: { color: '#334155', fontSize: 15, fontWeight: '900' },
  dkd_mode_text_active: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  dkd_input_shell: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, borderRadius: 18, paddingHorizontal: 14, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  dkd_input: { flex: 1, paddingVertical: 14, color: '#0F172A', fontSize: 16 },
  dkd_plain_input: { marginBottom: 12, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, color: '#0F172A', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16 },
  dkd_plain_input_tall: { minHeight: 90, textAlignVertical: 'top', marginBottom: 12, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, color: '#0F172A', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16 },
  dkd_primary_button: { flexDirection: 'row', gap: 9, marginTop: 4, padding: 16, borderRadius: 20, backgroundColor: '#22D3EE', alignItems: 'center', justifyContent: 'center' },
  dkd_primary_button_text: { color: '#0F172A', fontSize: 16, fontWeight: '900' },
  dkd_secondary_button: { flexDirection: 'row', gap: 9, marginTop: 14, padding: 14, borderRadius: 18, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' },
  dkd_secondary_button_text: { color: '#0F172A', fontSize: 15, fontWeight: '900' },
  dkd_role_card: { flexDirection: 'row', gap: 14, alignItems: 'center', marginTop: 12, padding: 16, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  dkd_role_card_selected: { flexDirection: 'row', gap: 14, alignItems: 'center', marginTop: 12, padding: 16, borderRadius: 24, backgroundColor: '#CCFBF1', borderWidth: 2, borderColor: '#06B6D4' },
  dkd_icon_tile: { width: 48, height: 48, borderRadius: 19, backgroundColor: '#ECFEFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#A5F3FC' },
  dkd_icon_tile_selected: { width: 48, height: 48, borderRadius: 19, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#67E8F9' },
  dkd_role_content: { flex: 1 },
  dkd_role_title: { color: '#0F172A', fontSize: 18, fontWeight: '900', marginBottom: 4 },
  dkd_role_caption: { color: '#475569', fontSize: 14, lineHeight: 20 },
  dkd_form_header_row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  dkd_upload_row: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  dkd_upload_box: { width: 104, height: 94, borderRadius: 24, backgroundColor: '#FFF1F2', borderWidth: 1, borderColor: '#FDA4AF', alignItems: 'center', justifyContent: 'center' },
  dkd_upload_box_wide: { flex: 1, height: 94, borderRadius: 24, backgroundColor: '#ECFEFF', borderWidth: 1, borderColor: '#67E8F9', alignItems: 'center', justifyContent: 'center' },
  dkd_upload_text: { marginTop: 8, color: '#334155', fontSize: 13, fontWeight: '900' },
  dkd_team_list: { marginTop: 18 },
  dkd_team_title: { color: '#0F172A', fontSize: 18, fontWeight: '900', marginBottom: 10 },
  dkd_team_card: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 13, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  dkd_next: { marginTop: 12, color: '#0E7490', fontSize: 15, lineHeight: 22, fontWeight: '900' }
});
