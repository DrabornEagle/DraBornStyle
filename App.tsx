import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  BadgeDollarSign,
  Building2,
  ChevronDown,
  ChevronRight,
  Clock3,
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
  Timer,
  UserPlus,
  UserRound,
  UsersRound
} from 'lucide-react-native';

import { dkd_is_supabase_env_ready, dkd_supabase_client } from './src/dkd_config/dkd_supabase_client';

type Dkd_AuthMode = 'login' | 'signup';
type Dkd_RoleKey = 'customer' | 'business' | 'master' | 'admin';
type Dkd_SetupSection = 'business' | 'team' | 'services';
type Dkd_Icon = React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

type Dkd_RoleOption = {
  key: Dkd_RoleKey;
  title: string;
  caption: string;
  icon: Dkd_Icon;
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
  { key: 'customer', title: 'Müşteri', caption: 'Randevu ve salon keşfi.', icon: UserRound },
  { key: 'business', title: 'İşletme Sahibi', caption: 'Salon, ekip, hizmet ve fiyat yönetimi.', icon: Building2 },
  { key: 'master', title: 'Usta', caption: 'Kendi çalışma akışı ve takvimi.', icon: Scissors },
  { key: 'admin', title: 'Admin', caption: 'Platform yönetimi ve kontrol.', icon: ShieldCheck }
];

const dkd_section_titles: Record<Dkd_SetupSection, string> = {
  business: 'Salon Bilgileri',
  team: 'Ekip / Ustalar',
  services: 'Hizmetler ve Fiyatlar'
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
  const [dkd_status, dkd_set_status] = React.useState('Hazır. Hızlı ve sade salon akışı başladı.');
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
    const dkd_response = dkd_auth_mode === 'login'
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
    dkd_set_status(dkd_response.error ? dkd_response.error.message : `${dkd_role_options.find((item) => item.key === dkd_next_role)?.title} akışı açıldı.`);
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
        <LinearGradient colors={['#E0F7FA', '#FFF1E6', '#FFE4F0']} style={dkd_styles.bg}>
          <ScrollView contentContainerStyle={dkd_styles.screen} keyboardShouldPersistTaps="handled">
            <LinearGradient colors={['#00BCD4', '#FF4FA3', '#FF9F45']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={dkd_styles.hero}>
              <View style={dkd_styles.heroTop}>
                <View style={dkd_styles.logo}><Sparkles color="#00A6B8" size={26} strokeWidth={2.8} /></View>
                <Text style={dkd_styles.heroTag}>BERBER • KUAFÖR • SALON</Text>
              </View>
              <Text style={dkd_styles.heroTitle}>DraBornStyle</Text>
              <Text style={dkd_styles.heroText}>Randevu, ekip ve hizmet yönetimini sade bir salon panelinde topla.</Text>
            </LinearGradient>

            <View style={dkd_styles.statusCard}>
              <ShieldCheck color="#00A6B8" size={24} strokeWidth={2.7} />
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
                    <LogOut color="#111827" size={18} strokeWidth={2.7} />
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
                  <DkdInput icon={Mail} value={dkd_email} onChangeText={dkd_set_email} placeholder="E-posta" />
                  <DkdInput icon={LockKeyhole} value={dkd_password} onChangeText={dkd_set_password} placeholder="Şifre" secureTextEntry />
                  <TouchableOpacity style={dkd_styles.primaryButton} onPress={dkd_auth} disabled={dkd_loading}><Text style={dkd_styles.primaryText}>{dkd_loading ? 'Bekle...' : 'Devam Et'}</Text></TouchableOpacity>
                </View>
              )}
            </View>

            {dkd_user_email ? (
              <View style={dkd_styles.card}>
                <Text style={dkd_styles.title}>Salon Akışını Seç</Text>
                <Text style={dkd_styles.body}>DraBornStyle’ı nasıl kullanacağını seç. Detaylar sadece ihtiyaç olduğunda açılır.</Text>
                {dkd_role_options.map((dkd_item) => {
                  const DkdIcon = dkd_item.icon;
                  const dkd_selected = dkd_role === dkd_item.key;
                  return (
                    <TouchableOpacity key={dkd_item.key} style={dkd_selected ? dkd_styles.listItemActive : dkd_styles.listItem} onPress={() => dkd_save_role(dkd_item.key)}>
                      <View style={dkd_styles.iconBox}><DkdIcon color="#00A6B8" size={23} strokeWidth={2.6} /></View>
                      <View style={dkd_styles.flex}>
                        <Text style={dkd_styles.itemTitle}>{dkd_item.title}</Text>
                        <Text style={dkd_styles.itemText}>{dkd_item.caption}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            {dkd_user_email && dkd_role === 'business' ? (
              <View style={dkd_styles.card}>
                <Text style={dkd_styles.title}>Salon Kurulum Menüsü</Text>
                <Text style={dkd_styles.body}>Ekranı sade tuttuk. Bir kategoriye dokun, detayını aç.</Text>
                <DkdSectionButton icon={Store} title={dkd_section_titles.business} subtitle={dkd_business_id ? 'Salon bilgileri kayıtlı' : 'Salon profilini oluştur'} active={dkd_active_section === 'business'} onPress={() => dkd_toggle_section('business')} />
                {dkd_active_section === 'business' ? (
                  <View style={dkd_styles.detailBox}>
                    <DkdPlainInput value={dkd_business_name} onChangeText={dkd_set_business_name} placeholder="Salon / işletme adı" />
                    <DkdPlainInput value={dkd_business_description} onChangeText={dkd_set_business_description} placeholder="Kısa açıklama" />
                    <DkdInput icon={Phone} value={dkd_business_phone} onChangeText={dkd_set_business_phone} placeholder="Telefon" keyboardType="phone-pad" />
                    <DkdInput icon={MapPin} value={dkd_business_address} onChangeText={dkd_set_business_address} placeholder="Adres" />
                    <DkdInput icon={Clock3} value={dkd_business_hours} onChangeText={dkd_set_business_hours} placeholder="Çalışma saatleri" />
                    <TouchableOpacity style={dkd_styles.primaryButton} onPress={dkd_save_business}><Save color="#111827" size={18} strokeWidth={2.8} /><Text style={dkd_styles.primaryText}>Salon Bilgilerini Kaydet</Text></TouchableOpacity>
                  </View>
                ) : null}

                <DkdSectionButton icon={UsersRound} title={dkd_section_titles.team} subtitle={`${dkd_masters.length} usta / çalışan`} active={dkd_active_section === 'team'} onPress={() => dkd_toggle_section('team')} />
                {dkd_active_section === 'team' ? (
                  <View style={dkd_styles.detailBox}>
                    <DkdPlainInput value={dkd_master_name} onChangeText={dkd_set_master_name} placeholder="Usta adı soyadı" />
                    <DkdInput icon={Scissors} value={dkd_master_specialty} onChangeText={dkd_set_master_specialty} placeholder="Uzmanlık" />
                    <DkdInput icon={Phone} value={dkd_master_phone} onChangeText={dkd_set_master_phone} placeholder="Telefon" keyboardType="phone-pad" />
                    <TouchableOpacity style={dkd_styles.primaryButton} onPress={dkd_save_master}><UserPlus color="#111827" size={18} strokeWidth={2.8} /><Text style={dkd_styles.primaryText}>Usta Ekle</Text></TouchableOpacity>
                    {dkd_masters.map((item) => <DkdMiniRow key={item.dkd_master_id} title={item.dkd_master_name} subtitle={item.dkd_master_specialty || 'Uzmanlık eklenmedi'} />)}
                  </View>
                ) : null}

                <DkdSectionButton icon={BadgeDollarSign} title={dkd_section_titles.services} subtitle={`${dkd_services.length} hizmet`} active={dkd_active_section === 'services'} onPress={() => dkd_toggle_section('services')} />
                {dkd_active_section === 'services' ? (
                  <View style={dkd_styles.detailBox}>
                    <DkdPlainInput value={dkd_service_title} onChangeText={dkd_set_service_title} placeholder="Hizmet adı" />
                    <DkdInput icon={BadgeDollarSign} value={dkd_service_price} onChangeText={dkd_set_service_price} placeholder="Fiyat TL" keyboardType="numeric" />
                    <DkdInput icon={Timer} value={dkd_service_duration} onChangeText={dkd_set_service_duration} placeholder="Süre dakika" keyboardType="numeric" />
                    <TouchableOpacity style={dkd_styles.primaryButton} onPress={dkd_save_service}><ListPlus color="#111827" size={18} strokeWidth={2.8} /><Text style={dkd_styles.primaryText}>Hizmet Ekle</Text></TouchableOpacity>
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

function DkdInput(dkd_props: any) {
  const Icon = dkd_props.icon;
  return (
    <View style={dkd_styles.inputShell}>
      <Icon color="#00A6B8" size={18} strokeWidth={2.6} />
      <TextInput {...dkd_props} icon={undefined} placeholderTextColor="#8A94A6" style={dkd_styles.input} />
    </View>
  );
}

function DkdPlainInput(dkd_props: any) {
  return <TextInput {...dkd_props} placeholderTextColor="#8A94A6" style={dkd_styles.plainInput} />;
}

function DkdSectionButton(dkd_props: { icon: Dkd_Icon; title: string; subtitle: string; active: boolean; onPress: () => void }) {
  const Icon = dkd_props.icon;
  return (
    <TouchableOpacity style={dkd_props.active ? dkd_styles.sectionActive : dkd_styles.section} onPress={dkd_props.onPress}>
      <View style={dkd_styles.iconBox}><Icon color="#00A6B8" size={23} strokeWidth={2.6} /></View>
      <View style={dkd_styles.flex}>
        <Text style={dkd_styles.itemTitle}>{dkd_props.title}</Text>
        <Text style={dkd_styles.itemText}>{dkd_props.subtitle}</Text>
      </View>
      {dkd_props.active ? <ChevronDown color="#111827" size={20} /> : <ChevronRight color="#64748B" size={20} />}
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
  safe: { flex: 1, backgroundColor: '#E0F7FA' },
  bg: { flex: 1 },
  screen: { padding: 18, paddingTop: 24, paddingBottom: 44 },
  hero: { borderRadius: 30, padding: 22, marginBottom: 14 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  logo: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
  heroTag: { color: 'white', fontSize: 12, fontWeight: '900', letterSpacing: 1.4, flex: 1 },
  heroTitle: { color: 'white', fontSize: 39, fontWeight: '900', marginBottom: 8 },
  heroText: { color: 'white', fontSize: 17, lineHeight: 25, fontWeight: '700' },
  card: { backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 26, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  statusCard: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.88)', borderRadius: 24, padding: 14, marginBottom: 14 },
  footer: { backgroundColor: 'rgba(255,255,255,0.82)', borderRadius: 22, padding: 14 },
  title: { color: '#111827', fontSize: 24, fontWeight: '900', marginBottom: 8 },
  body: { color: '#475569', fontSize: 15, lineHeight: 22 },
  muted: { color: '#64748B', fontSize: 13, fontWeight: '800' },
  good: { color: '#059669', fontSize: 16, fontWeight: '900' },
  warn: { color: '#B45309', fontSize: 16, fontWeight: '900' },
  accent: { color: '#00A6B8', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  flex: { flex: 1 },
  tabs: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  tab: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 16, backgroundColor: '#F8FAFC' },
  tabActive: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 16, backgroundColor: '#00B8D4' },
  tabText: { color: '#475569', fontWeight: '900' },
  tabTextActive: { color: 'white', fontWeight: '900' },
  inputShell: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#F8FAFC', borderRadius: 17, paddingHorizontal: 13, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  input: { flex: 1, color: '#111827', fontSize: 16, paddingVertical: 13 },
  plainInput: { backgroundColor: '#F8FAFC', borderRadius: 17, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 10, color: '#111827', borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16 },
  primaryButton: { flexDirection: 'row', gap: 8, backgroundColor: '#8BE9FF', borderRadius: 18, padding: 15, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryText: { color: '#111827', fontSize: 15, fontWeight: '900' },
  softButton: { flexDirection: 'row', gap: 8, backgroundColor: '#E0F2FE', borderRadius: 18, padding: 14, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  softButtonText: { color: '#111827', fontWeight: '900' },
  listItem: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 10 },
  listItemActive: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14, borderRadius: 20, backgroundColor: '#E0FDFB', borderWidth: 2, borderColor: '#00B8D4', marginTop: 10 },
  section: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 10 },
  sectionActive: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14, borderRadius: 20, backgroundColor: '#FFF7ED', borderWidth: 2, borderColor: '#FB923C', marginTop: 10 },
  iconBox: { width: 44, height: 44, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECFEFF' },
  itemTitle: { color: '#111827', fontSize: 17, fontWeight: '900' },
  itemText: { color: '#64748B', fontSize: 13, lineHeight: 18, marginTop: 2 },
  detailBox: { marginTop: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  miniRow: { padding: 12, borderRadius: 16, backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 8 },
  miniTitle: { color: '#111827', fontSize: 15, fontWeight: '900' },
  miniSub: { color: '#64748B', marginTop: 2 }
});
