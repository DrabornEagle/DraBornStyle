import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { dkd_is_supabase_env_ready, dkd_supabase_client } from './src/dkd_config/dkd_supabase_client';

type Dkd_AuthMode = 'login' | 'signup';
type Dkd_RoleKey = 'customer' | 'business' | 'master' | 'admin';
type Dkd_SetupSection = 'business' | 'team' | 'services';

type Dkd_RoleOption = {
  key: Dkd_RoleKey;
  title: string;
  caption: string;
  icon: string;
};

type Dkd_MasterItem = {
  dkd_master_id: string;
  dkd_master_name: string;
  dkd_master_specialty?: string | null;
  dkd_master_phone?: string | null;
};

type Dkd_ServiceItem = {
  dkd_service_id: string;
  dkd_service_title: string;
  dkd_price_cents: number;
  dkd_duration_minutes: number;
};

const dkd_role_options: Dkd_RoleOption[] = [
  { key: 'customer', title: 'Müşteri', caption: 'Randevu ve salon keşfi.', icon: '👤' },
  { key: 'business', title: 'İşletme Sahibi', caption: 'Salon, ekip, hizmet ve fiyat yönetimi.', icon: '🏪' },
  { key: 'master', title: 'Usta', caption: 'Kendi çalışma akışı ve takvimi.', icon: '✂️' },
  { key: 'admin', title: 'Admin', caption: 'Platform yönetimi ve kontrol.', icon: '🛡️' }
];

const dkd_section_meta: Record<Dkd_SetupSection, { title: string; icon: string }> = {
  business: { title: 'Salon Bilgileri', icon: '🏪' },
  team: { title: 'Ekip / Ustalar', icon: '✂️' },
  services: { title: 'Hizmetler ve Fiyatlar', icon: '₺' }
};

const dkd_permission_map: Record<Dkd_RoleKey, string[]> = {
  customer: ['Salonları görüntüleme', 'Randevu akışına hazırlık', 'Profil oturumu'],
  business: ['Salon profili yönetimi', 'Usta / çalışan ekleme', 'Hizmet, fiyat ve süre yönetimi'],
  master: ['Usta hesabı doğrulama', 'Kendi paneline yönlendirme', 'v0.2 takvim hazırlığı'],
  admin: ['Tek admin yönetim rolü', 'Platform kontrol hazırlığı', 'Ödeme/onay paneli hazırlığı']
};

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
    .slice(0, 44);
}

function dkd_price_to_cents(dkd_value: string) {
  const dkd_number = Number(dkd_value.replace(',', '.').replace(/[^0-9.]/g, ''));
  return Number.isFinite(dkd_number) && dkd_number > 0 ? Math.round(dkd_number * 100) : 0;
}

function dkd_format_price(dkd_cents: number) {
  return `${Math.round(dkd_cents / 100)} TL`;
}

export default function Dkd_DraBornStyleApp() {
  const [dkd_auth_mode, dkd_set_auth_mode] = React.useState<Dkd_AuthMode>('login');
  const [dkd_email, dkd_set_email] = React.useState('');
  const [dkd_password, dkd_set_password] = React.useState('');
  const [dkd_user_email, dkd_set_user_email] = React.useState<string | null>(null);
  const [dkd_user_id, dkd_set_user_id] = React.useState<string | null>(null);
  const [dkd_role, dkd_set_role] = React.useState<Dkd_RoleKey | null>(null);
  const [dkd_status, dkd_set_status] = React.useState('Hazır. Miami Style panel açıldı.');
  const [dkd_loading, dkd_set_loading] = React.useState(false);
  const [dkd_active_section, dkd_set_active_section] = React.useState<Dkd_SetupSection | null>('business');

  const [dkd_business_id, dkd_set_business_id] = React.useState<string | null>(null);
  const [dkd_business_name, dkd_set_business_name] = React.useState('');
  const [dkd_business_description, dkd_set_business_description] = React.useState('');
  const [dkd_business_phone, dkd_set_business_phone] = React.useState('');
  const [dkd_business_address, dkd_set_business_address] = React.useState('');
  const [dkd_business_hours, dkd_set_business_hours] = React.useState('09:00 - 20:00');

  const [dkd_masters, dkd_set_masters] = React.useState<Dkd_MasterItem[]>([]);
  const [dkd_master_name, dkd_set_master_name] = React.useState('');
  const [dkd_master_specialty, dkd_set_master_specialty] = React.useState('');
  const [dkd_master_phone, dkd_set_master_phone] = React.useState('');

  const [dkd_services, dkd_set_services] = React.useState<Dkd_ServiceItem[]>([]);
  const [dkd_service_title, dkd_set_service_title] = React.useState('');
  const [dkd_service_price, dkd_set_service_price] = React.useState('');
  const [dkd_service_duration, dkd_set_service_duration] = React.useState('30');

  React.useEffect(() => {
    dkd_supabase_client.auth.getSession().then((dkd_response: any) => {
      const dkd_user = dkd_response.data.session?.user ?? null;
      dkd_set_user_email(dkd_user?.email ?? null);
      dkd_set_user_id(dkd_user?.id ?? null);
      dkd_load_all(dkd_user?.id ?? null);
    });

    const dkd_subscription = dkd_supabase_client.auth.onAuthStateChange((_event: string, dkd_session: any) => {
      const dkd_user = dkd_session?.user ?? null;
      dkd_set_user_email(dkd_user?.email ?? null);
      dkd_set_user_id(dkd_user?.id ?? null);
      dkd_load_all(dkd_user?.id ?? null);
    });

    return () => dkd_subscription.data.subscription.unsubscribe();
  }, []);

  async function dkd_load_all(dkd_next_user_id: string | null) {
    if (!dkd_next_user_id) {
      dkd_set_role(null);
      dkd_set_business_id(null);
      dkd_set_masters([]);
      dkd_set_services([]);
      return;
    }

    const dkd_profile = await dkd_supabase_client
      .from('dkd_user_profiles')
      .select('dkd_role')
      .eq('dkd_user_id', dkd_next_user_id)
      .maybeSingle();

    const dkd_next_role = dkd_profile.data?.dkd_role as Dkd_RoleKey | undefined;
    dkd_set_role(dkd_next_role ?? null);

    const dkd_business = await dkd_supabase_client
      .from('dkd_business_profiles')
      .select('dkd_business_id, dkd_business_name, dkd_business_description, dkd_business_phone, dkd_address_text, dkd_working_hours')
      .eq('dkd_owner_user_id', dkd_next_user_id)
      .order('dkd_created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const dkd_business_data = dkd_business.data;
    const dkd_next_business_id = dkd_business_data?.dkd_business_id ?? null;
    dkd_set_business_id(dkd_next_business_id);
    dkd_set_business_name(dkd_business_data?.dkd_business_name ?? '');
    dkd_set_business_description(dkd_business_data?.dkd_business_description ?? '');
    dkd_set_business_phone(dkd_business_data?.dkd_business_phone ?? '');
    dkd_set_business_address(dkd_business_data?.dkd_address_text ?? '');
    dkd_set_business_hours(dkd_business_data?.dkd_working_hours?.dkd_summary ?? '09:00 - 20:00');

    if (dkd_next_business_id) {
      dkd_load_team(dkd_next_business_id);
      dkd_load_services(dkd_next_business_id);
    }
  }

  async function dkd_load_team(dkd_next_business_id: string) {
    const dkd_response = await dkd_supabase_client
      .from('dkd_master_profiles')
      .select('dkd_master_id, dkd_master_name, dkd_master_specialty, dkd_master_phone')
      .eq('dkd_business_id', dkd_next_business_id)
      .eq('dkd_is_active', true)
      .order('dkd_created_at', { ascending: false });
    dkd_set_masters((dkd_response.data ?? []) as Dkd_MasterItem[]);
  }

  async function dkd_load_services(dkd_next_business_id: string) {
    const dkd_response = await dkd_supabase_client
      .from('dkd_services')
      .select('dkd_service_id, dkd_service_title, dkd_price_cents, dkd_duration_minutes')
      .eq('dkd_business_id', dkd_next_business_id)
      .eq('dkd_is_active', true)
      .order('dkd_created_at', { ascending: false });
    dkd_set_services((dkd_response.data ?? []) as Dkd_ServiceItem[]);
  }

  async function dkd_auth() {
    const dkd_clean_email = dkd_email.trim().toLowerCase();
    if (!dkd_clean_email || dkd_password.length < 6) {
      dkd_set_status('E-posta ve en az 6 karakter şifre gir.');
      return;
    }
    dkd_set_loading(true);
    const dkd_response =
      dkd_auth_mode === 'login'
        ? await dkd_supabase_client.auth.signInWithPassword({ email: dkd_clean_email, password: dkd_password })
        : await dkd_supabase_client.auth.signUp({ email: dkd_clean_email, password: dkd_password });
    dkd_set_loading(false);
    dkd_set_status(dkd_response.error ? dkd_response.error.message : 'Hesap hazır. Salon akışını seç.');
  }

  async function dkd_logout() {
    await dkd_supabase_client.auth.signOut();
    dkd_set_status('Çıkış yapıldı.');
  }

  async function dkd_save_role(dkd_next_role: Dkd_RoleKey) {
    if (!dkd_user_id) return;
    dkd_set_role(dkd_next_role);
    const dkd_response = await dkd_supabase_client
      .from('dkd_user_profiles')
      .upsert({ dkd_user_id, dkd_role: dkd_next_role, dkd_display_name: dkd_user_email ?? '', dkd_is_active: true }, { onConflict: 'dkd_user_id' });
    const dkd_role_title = dkd_role_options.find((item) => item.key === dkd_next_role)?.title;
    dkd_set_status(dkd_response.error ? dkd_response.error.message : `${dkd_role_title} akışı açıldı.`);
  }

  async function dkd_save_business() {
    if (!dkd_user_id || dkd_business_name.trim().length < 2) {
      dkd_set_status('Salon adı en az 2 karakter olmalı.');
      return;
    }

    const dkd_payload = {
      dkd_owner_user_id: dkd_user_id,
      dkd_business_name: dkd_business_name.trim(),
      dkd_business_slug: `${dkd_create_slug(dkd_business_name)}-${dkd_user_id.slice(0, 6)}`,
      dkd_business_description: dkd_business_description.trim(),
      dkd_business_phone: dkd_business_phone.trim(),
      dkd_address_text: dkd_business_address.trim(),
      dkd_working_hours: { dkd_summary: dkd_business_hours.trim() },
      dkd_is_active: true
    };

    const dkd_response = dkd_business_id
      ? await dkd_supabase_client.from('dkd_business_profiles').update(dkd_payload).eq('dkd_business_id', dkd_business_id).select('dkd_business_id').single()
      : await dkd_supabase_client.from('dkd_business_profiles').insert(dkd_payload).select('dkd_business_id').single();

    if (dkd_response.error) {
      dkd_set_status(dkd_response.error.message);
      return;
    }
    dkd_set_business_id(dkd_response.data.dkd_business_id);
    dkd_set_status('Salon bilgileri kaydedildi.');
  }

  async function dkd_save_master() {
    if (!dkd_business_id || dkd_master_name.trim().length < 2) {
      dkd_set_status('Önce salonu kaydet ve usta adını yaz.');
      return;
    }
    const dkd_response = await dkd_supabase_client.from('dkd_master_profiles').insert({
      dkd_business_id,
      dkd_master_name: dkd_master_name.trim(),
      dkd_master_specialty: dkd_master_specialty.trim(),
      dkd_master_phone: dkd_master_phone.trim(),
      dkd_is_active: true
    });
    if (dkd_response.error) {
      dkd_set_status(dkd_response.error.message);
      return;
    }
    dkd_set_master_name('');
    dkd_set_master_specialty('');
    dkd_set_master_phone('');
    dkd_load_team(dkd_business_id);
    dkd_set_status('Usta / çalışan eklendi.');
  }

  async function dkd_save_service() {
    const dkd_price_cents = dkd_price_to_cents(dkd_service_price);
    const dkd_duration = Number.parseInt(dkd_service_duration, 10);
    if (!dkd_business_id || dkd_service_title.trim().length < 2 || dkd_price_cents <= 0 || !Number.isFinite(dkd_duration)) {
      dkd_set_status('Hizmet adı, fiyat ve süreyi doğru gir.');
      return;
    }
    const dkd_response = await dkd_supabase_client.from('dkd_services').insert({
      dkd_business_id,
      dkd_service_title: dkd_service_title.trim(),
      dkd_price_cents,
      dkd_duration_minutes: dkd_duration,
      dkd_is_active: true
    });
    if (dkd_response.error) {
      dkd_set_status(dkd_response.error.message);
      return;
    }
    dkd_set_service_title('');
    dkd_set_service_price('');
    dkd_set_service_duration('30');
    dkd_load_services(dkd_business_id);
    dkd_set_status('Hizmet eklendi.');
  }

  function dkd_toggle_section(dkd_section: Dkd_SetupSection) {
    dkd_set_active_section(dkd_active_section === dkd_section ? null : dkd_section);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={dkd_styles.safe}>
        <LinearGradient colors={['#0B1026', '#14225A', '#0E7490']} style={dkd_styles.bg}>
          <View style={dkd_styles.glowPink} />
          <View style={dkd_styles.glowBlue} />
          <ScrollView contentContainerStyle={dkd_styles.screen} keyboardShouldPersistTaps="handled">
            <LinearGradient colors={['#06B6D4', '#EC4899', '#F97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={dkd_styles.hero}>
              <View style={dkd_styles.heroTop}>
                <DkdIconBadge label="✂️" tone="light" />
                <Text style={dkd_styles.heroTag}>MIAMI STYLE • SALON PANEL</Text>
              </View>
              <Text style={dkd_styles.heroTitle}>DraBornStyle</Text>
              <Text style={dkd_styles.heroText}>Berber ve kuaförler için hızlı, sade ve dikkat çeken randevu yönetimi.</Text>
            </LinearGradient>

            <View style={dkd_styles.statusCard}>
              <DkdIconBadge label="✓" />
              <View style={dkd_styles.flex}>
                <Text style={dkd_styles.muted}>Supabase bağlantısı</Text>
                <Text style={dkd_is_supabase_env_ready ? dkd_styles.good : dkd_styles.warn}>{dkd_is_supabase_env_ready ? 'Hazır' : 'Key eksik'}</Text>
              </View>
            </View>

            <View style={dkd_styles.card}>
              {dkd_user_email ? (
                <View>
                  <Text style={dkd_styles.title}>Hesap</Text>
                  <Text style={dkd_styles.accent}>{dkd_user_email}</Text>
                  <Text style={dkd_styles.body}>{dkd_role ? `Aktif akış: ${dkd_role_options.find((item) => item.key === dkd_role)?.title}` : 'Henüz akış seçilmedi.'}</Text>
                  <TouchableOpacity style={dkd_styles.softButton} onPress={dkd_logout}>
                    <Text style={dkd_styles.buttonIcon}>↗</Text>
                    <Text style={dkd_styles.softButtonText}>Çıkış Yap</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Text style={dkd_styles.title}>Hesabınla Devam Et</Text>
                  <View style={dkd_styles.tabs}>
                    <TouchableOpacity style={dkd_auth_mode === 'login' ? dkd_styles.tabActive : dkd_styles.tab} onPress={() => dkd_set_auth_mode('login')}><Text style={dkd_auth_mode === 'login' ? dkd_styles.tabTextActive : dkd_styles.tabText}>Giriş</Text></TouchableOpacity>
                    <TouchableOpacity style={dkd_auth_mode === 'signup' ? dkd_styles.tabActive : dkd_styles.tab} onPress={() => dkd_set_auth_mode('signup')}><Text style={dkd_auth_mode === 'signup' ? dkd_styles.tabTextActive : dkd_styles.tabText}>Kayıt</Text></TouchableOpacity>
                  </View>
                  <DkdInput label="@" value={dkd_email} onChangeText={dkd_set_email} placeholder="E-posta" />
                  <DkdInput label="•" value={dkd_password} onChangeText={dkd_set_password} placeholder="Şifre" secureTextEntry />
                  <TouchableOpacity style={dkd_styles.primaryButton} onPress={dkd_auth} disabled={dkd_loading}><Text style={dkd_styles.primaryText}>{dkd_loading ? 'Bekle...' : 'Devam Et'}</Text></TouchableOpacity>
                </View>
              )}
            </View>

            {dkd_user_email ? (
              <View style={dkd_styles.card}>
                <Text style={dkd_styles.title}>Salon Akışını Seç</Text>
                <Text style={dkd_styles.body}>Rolünü seç; detaylar sadece ihtiyaç olduğunda açılır.</Text>
                {dkd_role_options.map((dkd_item) => {
                  const dkd_selected = dkd_role === dkd_item.key;
                  return (
                    <TouchableOpacity key={dkd_item.key} style={dkd_selected ? dkd_styles.listItemActive : dkd_styles.listItem} onPress={() => dkd_save_role(dkd_item.key)}>
                      <DkdIconBadge label={dkd_item.icon} />
                      <View style={dkd_styles.flex}>
                        <Text style={dkd_styles.itemTitle}>{dkd_item.title}</Text>
                        <Text style={dkd_styles.itemText}>{dkd_item.caption}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            {dkd_user_email && dkd_role ? (
              <View style={dkd_styles.card}>
                <Text style={dkd_styles.title}>Yetki Özeti</Text>
                <Text style={dkd_styles.body}>v0.0.24 rol bazlı ekran kontrolü.</Text>
                {dkd_permission_map[dkd_role].map((item) => <DkdMiniRow key={item} title="✓ Yetki" subtitle={item} />)}
              </View>
            ) : null}

            {dkd_user_email && dkd_role === 'business' ? (
              <View style={dkd_styles.card}>
                <Text style={dkd_styles.title}>Salon Kurulum Menüsü</Text>
                <Text style={dkd_styles.body}>Bir kategoriye dokun, sadece ihtiyacın olan form açılsın.</Text>

                <DkdSectionButton meta={dkd_section_meta.business} subtitle={dkd_business_id ? 'Salon bilgileri kayıtlı' : 'Salon profilini oluştur'} active={dkd_active_section === 'business'} onPress={() => dkd_toggle_section('business')} />
                {dkd_active_section === 'business' ? (
                  <View style={dkd_styles.detailBox}>
                    <DkdPlainInput value={dkd_business_name} onChangeText={dkd_set_business_name} placeholder="Salon / işletme adı" />
                    <DkdPlainInput value={dkd_business_description} onChangeText={dkd_set_business_description} placeholder="Kısa açıklama" />
                    <DkdInput label="☎" value={dkd_business_phone} onChangeText={dkd_set_business_phone} placeholder="Telefon" keyboardType="phone-pad" />
                    <DkdInput label="⌖" value={dkd_business_address} onChangeText={dkd_set_business_address} placeholder="Adres" />
                    <DkdInput label="◷" value={dkd_business_hours} onChangeText={dkd_set_business_hours} placeholder="Çalışma saatleri" />
                    <TouchableOpacity style={dkd_styles.primaryButton} onPress={dkd_save_business}><Text style={dkd_styles.primaryText}>Salon Bilgilerini Kaydet</Text></TouchableOpacity>
                  </View>
                ) : null}

                <DkdSectionButton meta={dkd_section_meta.team} subtitle={`${dkd_masters.length} usta / çalışan`} active={dkd_active_section === 'team'} onPress={() => dkd_toggle_section('team')} />
                {dkd_active_section === 'team' ? (
                  <View style={dkd_styles.detailBox}>
                    <DkdPlainInput value={dkd_master_name} onChangeText={dkd_set_master_name} placeholder="Usta adı soyadı" />
                    <DkdInput label="✂" value={dkd_master_specialty} onChangeText={dkd_set_master_specialty} placeholder="Uzmanlık" />
                    <DkdInput label="☎" value={dkd_master_phone} onChangeText={dkd_set_master_phone} placeholder="Telefon" keyboardType="phone-pad" />
                    <TouchableOpacity style={dkd_styles.primaryButton} onPress={dkd_save_master}><Text style={dkd_styles.primaryText}>Usta Ekle</Text></TouchableOpacity>
                    {dkd_masters.map((item) => <DkdMiniRow key={item.dkd_master_id} title={item.dkd_master_name} subtitle={item.dkd_master_specialty || 'Uzmanlık eklenmedi'} />)}
                  </View>
                ) : null}

                <DkdSectionButton meta={dkd_section_meta.services} subtitle={`${dkd_services.length} hizmet`} active={dkd_active_section === 'services'} onPress={() => dkd_toggle_section('services')} />
                {dkd_active_section === 'services' ? (
                  <View style={dkd_styles.detailBox}>
                    <DkdPlainInput value={dkd_service_title} onChangeText={dkd_set_service_title} placeholder="Hizmet adı" />
                    <DkdInput label="₺" value={dkd_service_price} onChangeText={dkd_set_service_price} placeholder="Fiyat TL" keyboardType="numeric" />
                    <DkdInput label="dk" value={dkd_service_duration} onChangeText={dkd_set_service_duration} placeholder="Süre dakika" keyboardType="numeric" />
                    <TouchableOpacity style={dkd_styles.primaryButton} onPress={dkd_save_service}><Text style={dkd_styles.primaryText}>Hizmet Ekle</Text></TouchableOpacity>
                    {dkd_services.map((item) => <DkdMiniRow key={item.dkd_service_id} title={item.dkd_service_title} subtitle={`${dkd_format_price(item.dkd_price_cents)} • ${item.dkd_duration_minutes} dk`} />)}
                  </View>
                ) : null}
              </View>
            ) : null}

            {dkd_user_email && dkd_role && dkd_role !== 'business' ? (
              <View style={dkd_styles.card}>
                <Text style={dkd_styles.title}>{dkd_role_options.find((item) => item.key === dkd_role)?.title} Paneli</Text>
                <Text style={dkd_styles.body}>Bu rolün temel hesap akışı çalışıyor. Detaylı panel v0.2+ adımlarında açılacak.</Text>
              </View>
            ) : null}

            <View style={dkd_styles.footer}><Text style={dkd_styles.body}>{dkd_status}</Text></View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function DkdIconBadge(dkd_props: { label: string; tone?: 'light' }) {
  return (
    <View style={dkd_props.tone === 'light' ? dkd_styles.iconLight : dkd_styles.iconBox}>
      <Text style={dkd_styles.iconText}>{dkd_props.label}</Text>
    </View>
  );
}

function DkdInput(dkd_props: any) {
  const { label, ...dkd_input_props } = dkd_props;
  return (
    <View style={dkd_styles.inputShell}>
      <Text style={dkd_styles.inputLabel}>{label}</Text>
      <TextInput {...dkd_input_props} placeholderTextColor="#8BA4C8" style={dkd_styles.input} />
    </View>
  );
}

function DkdPlainInput(dkd_props: any) {
  return <TextInput {...dkd_props} placeholderTextColor="#8BA4C8" style={dkd_styles.plainInput} />;
}

function DkdSectionButton(dkd_props: { meta: { title: string; icon: string }; subtitle: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={dkd_props.active ? dkd_styles.sectionActive : dkd_styles.section} onPress={dkd_props.onPress}>
      <DkdIconBadge label={dkd_props.meta.icon} />
      <View style={dkd_styles.flex}>
        <Text style={dkd_styles.itemTitle}>{dkd_props.meta.title}</Text>
        <Text style={dkd_styles.itemText}>{dkd_props.subtitle}</Text>
      </View>
      <Text style={dkd_styles.chevron}>{dkd_props.active ? '⌄' : '›'}</Text>
    </TouchableOpacity>
  );
}

function DkdMiniRow(dkd_props: { title: string; subtitle: string }) {
  return (
    <View style={dkd_styles.miniRow}>
      <Text style={dkd_styles.miniTitle}>{dkd_props.title}</Text>
      <Text style={dkd_styles.miniSub}>{dkd_props.subtitle}</Text>
    </View>
  );
}

const dkd_styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B1026' },
  bg: { flex: 1 },
  glowPink: { position: 'absolute', top: 42, right: -60, width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(236, 72, 153, 0.28)' },
  glowBlue: { position: 'absolute', top: 260, left: -80, width: 210, height: 210, borderRadius: 105, backgroundColor: 'rgba(6, 182, 212, 0.24)' },
  screen: { padding: 18, paddingTop: 24, paddingBottom: 44 },
  hero: { borderRadius: 30, padding: 22, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  heroTag: { color: '#F8FAFC', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, flex: 1 },
  heroTitle: { color: '#FFFFFF', fontSize: 38, fontWeight: '900', marginBottom: 8 },
  heroText: { color: '#F8FAFC', fontSize: 16, lineHeight: 24, fontWeight: '700' },
  card: { backgroundColor: 'rgba(15, 23, 42, 0.86)', borderRadius: 24, padding: 17, marginBottom: 13, borderWidth: 1, borderColor: 'rgba(103, 232, 249, 0.24)' },
  statusCard: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.78)', borderRadius: 22, padding: 14, marginBottom: 13, borderWidth: 1, borderColor: 'rgba(103, 232, 249, 0.18)' },
  footer: { backgroundColor: 'rgba(15, 23, 42, 0.78)', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: 'rgba(103, 232, 249, 0.16)' },
  title: { color: '#F8FAFC', fontSize: 23, fontWeight: '900', marginBottom: 8 },
  body: { color: '#CBD5E1', fontSize: 15, lineHeight: 22 },
  muted: { color: '#94A3B8', fontSize: 13, fontWeight: '800' },
  good: { color: '#86EFAC', fontSize: 16, fontWeight: '900' },
  warn: { color: '#FBBF24', fontSize: 16, fontWeight: '900' },
  accent: { color: '#67E8F9', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  flex: { flex: 1 },
  tabs: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  tab: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 15, backgroundColor: 'rgba(30, 41, 59, 0.88)' },
  tabActive: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 15, backgroundColor: '#06B6D4' },
  tabText: { color: '#CBD5E1', fontWeight: '900' },
  tabTextActive: { color: '#0B1026', fontWeight: '900' },
  inputShell: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: 'rgba(30, 41, 59, 0.88)', borderRadius: 16, paddingHorizontal: 13, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.28)' },
  inputLabel: { minWidth: 24, color: '#67E8F9', fontSize: 15, fontWeight: '900', textAlign: 'center' },
  input: { flex: 1, color: '#F8FAFC', fontSize: 16, paddingVertical: 13 },
  plainInput: { backgroundColor: 'rgba(30, 41, 59, 0.88)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 10, color: '#F8FAFC', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.28)', fontSize: 16 },
  primaryButton: { backgroundColor: '#67E8F9', borderRadius: 16, padding: 15, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryText: { color: '#0B1026', fontSize: 15, fontWeight: '900' },
  softButton: { flexDirection: 'row', gap: 8, backgroundColor: 'rgba(14, 165, 233, 0.22)', borderRadius: 16, padding: 14, alignItems: 'center', justifyContent: 'center', marginTop: 12, borderWidth: 1, borderColor: 'rgba(103, 232, 249, 0.26)' },
  buttonIcon: { color: '#F8FAFC', fontSize: 17, fontWeight: '900' },
  softButtonText: { color: '#F8FAFC', fontWeight: '900' },
  listItem: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 13, borderRadius: 18, backgroundColor: 'rgba(30, 41, 59, 0.72)', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.20)', marginTop: 9 },
  listItemActive: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 13, borderRadius: 18, backgroundColor: 'rgba(6, 182, 212, 0.20)', borderWidth: 2, borderColor: '#67E8F9', marginTop: 9 },
  section: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 13, borderRadius: 18, backgroundColor: 'rgba(30, 41, 59, 0.72)', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.20)', marginTop: 9 },
  sectionActive: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 13, borderRadius: 18, backgroundColor: 'rgba(236, 72, 153, 0.18)', borderWidth: 2, borderColor: '#F472B6', marginTop: 9 },
  iconBox: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(6, 182, 212, 0.16)', borderWidth: 1, borderColor: 'rgba(103, 232, 249, 0.24)' },
  iconLight: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.92)' },
  iconText: { fontSize: 18, fontWeight: '900', color: '#F8FAFC' },
  itemTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '900' },
  itemText: { color: '#CBD5E1', fontSize: 13, lineHeight: 18, marginTop: 2 },
  chevron: { color: '#CBD5E1', fontSize: 25, fontWeight: '900' },
  detailBox: { marginTop: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(148, 163, 184, 0.22)' },
  miniRow: { padding: 12, borderRadius: 15, backgroundColor: 'rgba(30, 41, 59, 0.66)', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.18)', marginTop: 8 },
  miniTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '900' },
  miniSub: { color: '#CBD5E1', marginTop: 2 }
});
