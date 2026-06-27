import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { dkd_is_supabase_env_ready, dkd_supabase_client } from './src/dkd_config/dkd_supabase_client';

type DkdAuthMode = 'login' | 'signup';
type DkdRole = 'customer' | 'business' | 'master' | 'admin';
type DkdPublicRole = 'customer' | 'business';
type DkdSection = 'business' | 'team' | 'services';

type DkdMaster = {
  dkd_master_id: string;
  dkd_master_name: string;
  dkd_master_specialty?: string | null;
  dkd_master_phone?: string | null;
};

type DkdService = {
  dkd_service_id: string;
  dkd_service_title: string;
  dkd_price_cents: number;
  dkd_duration_minutes: number;
};

const dkd_roles: Record<DkdRole, { title: string; caption: string; icon: string }> = {
  customer: { title: 'Müşteri', caption: 'Randevu al, salon keşfet', icon: '👤' },
  business: { title: 'İşletme Sahibi', caption: 'Salonunu ve ekibini yönet', icon: '🏪' },
  master: { title: 'Usta', caption: 'Takvim ve işlem akışı', icon: '✂️' },
  admin: { title: 'Admin', caption: 'Platform yönetimi', icon: '🛡️' }
};

const dkd_public_roles: DkdPublicRole[] = ['customer', 'business'];

const dkd_sections: { key: DkdSection; title: string; caption: string; code: string }[] = [
  { key: 'business', title: 'Salon Bilgileri', caption: 'Ad, adres, telefon, çalışma saati', code: '01' },
  { key: 'team', title: 'Ekip / Ustalar', caption: 'Usta ve çalışan listesi', code: '02' },
  { key: 'services', title: 'Hizmetler / Fiyatlar', caption: 'Fiyat ve süre yönetimi', code: '03' }
];

const dkd_permissions: Record<DkdRole, string[]> = {
  customer: ['Müşteri hesabı doğrulandı', 'Randevu akışına hazır', 'Salon keşfi v0.2 için hazır'],
  business: ['Salon profil yönetimi', 'Ekip / usta yönetimi', 'Hizmet, fiyat ve süre yönetimi'],
  master: ['Usta hesabı doğrulandı', 'Takvim altyapısına hazır', 'v0.2 işlem akışına hazır'],
  admin: ['Tek admin rolü aktif', 'Platform kontrolüne hazır', 'Ödeme/onay altyapısı hazır']
};

function dkd_slug(value: string) {
  return value
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

function dkd_price_to_cents(value: string) {
  const parsed = Number(value.replace(',', '.').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : 0;
}

function dkd_price(cents: number) {
  return `${Math.round(cents / 100)} TL`;
}

export default function DkdDraBornStyleApp() {
  const [authMode, setAuthMode] = React.useState<DkdAuthMode>('login');
  const [authRole, setAuthRole] = React.useState<DkdPublicRole>('customer');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [role, setRole] = React.useState<DkdRole | null>(null);
  const [status, setStatus] = React.useState('Barber Studio panel hazır.');
  const [loading, setLoading] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<DkdSection | null>('business');

  const [businessId, setBusinessId] = React.useState<string | null>(null);
  const [businessName, setBusinessName] = React.useState('');
  const [businessDescription, setBusinessDescription] = React.useState('');
  const [businessPhone, setBusinessPhone] = React.useState('');
  const [businessAddress, setBusinessAddress] = React.useState('');
  const [businessHours, setBusinessHours] = React.useState('09:00 - 20:00');

  const [masters, setMasters] = React.useState<DkdMaster[]>([]);
  const [masterName, setMasterName] = React.useState('');
  const [masterSpecialty, setMasterSpecialty] = React.useState('');
  const [masterPhone, setMasterPhone] = React.useState('');

  const [services, setServices] = React.useState<DkdService[]>([]);
  const [serviceTitle, setServiceTitle] = React.useState('');
  const [servicePrice, setServicePrice] = React.useState('');
  const [serviceDuration, setServiceDuration] = React.useState('30');

  React.useEffect(() => {
    dkd_supabase_client.auth.getSession().then((res: any) => {
      const user = res.data.session?.user ?? null;
      setUserEmail(user?.email ?? null);
      setUserId(user?.id ?? null);
      loadAll(user?.id ?? null);
    });

    const sub = dkd_supabase_client.auth.onAuthStateChange((_event: string, session: any) => {
      const user = session?.user ?? null;
      setUserEmail(user?.email ?? null);
      setUserId(user?.id ?? null);
      loadAll(user?.id ?? null);
    });

    return () => sub.data.subscription.unsubscribe();
  }, []);

  async function loadAll(nextUserId: string | null) {
    if (!nextUserId) {
      setRole(null);
      setBusinessId(null);
      setMasters([]);
      setServices([]);
      return;
    }

    const profile = await dkd_supabase_client.from('dkd_user_profiles').select('dkd_role').eq('dkd_user_id', nextUserId).maybeSingle();
    setRole((profile.data?.dkd_role as DkdRole | undefined) ?? null);

    const business = await dkd_supabase_client
      .from('dkd_business_profiles')
      .select('dkd_business_id, dkd_business_name, dkd_business_description, dkd_business_phone, dkd_address_text, dkd_working_hours')
      .eq('dkd_owner_user_id', nextUserId)
      .order('dkd_created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const data = business.data;
    const nextBusinessId = data?.dkd_business_id ?? null;
    setBusinessId(nextBusinessId);
    setBusinessName(data?.dkd_business_name ?? '');
    setBusinessDescription(data?.dkd_business_description ?? '');
    setBusinessPhone(data?.dkd_business_phone ?? '');
    setBusinessAddress(data?.dkd_address_text ?? '');
    setBusinessHours(data?.dkd_working_hours?.dkd_summary ?? '09:00 - 20:00');

    if (nextBusinessId) {
      loadTeam(nextBusinessId);
      loadServices(nextBusinessId);
    }
  }

  async function loadTeam(nextBusinessId: string) {
    const res = await dkd_supabase_client
      .from('dkd_master_profiles')
      .select('dkd_master_id, dkd_master_name, dkd_master_specialty, dkd_master_phone')
      .eq('dkd_business_id', nextBusinessId)
      .eq('dkd_is_active', true)
      .order('dkd_created_at', { ascending: false });
    setMasters((res.data ?? []) as DkdMaster[]);
  }

  async function loadServices(nextBusinessId: string) {
    const res = await dkd_supabase_client
      .from('dkd_services')
      .select('dkd_service_id, dkd_service_title, dkd_price_cents, dkd_duration_minutes')
      .eq('dkd_business_id', nextBusinessId)
      .eq('dkd_is_active', true)
      .order('dkd_created_at', { ascending: false });
    setServices((res.data ?? []) as DkdService[]);
  }

  async function saveProfileRole(nextUserId: string, nextRole: DkdRole, nextEmail: string | null) {
    const res = await dkd_supabase_client
      .from('dkd_user_profiles')
      .upsert({ dkd_user_id: nextUserId, dkd_role: nextRole, dkd_display_name: nextEmail ?? '', dkd_is_active: true }, { onConflict: 'dkd_user_id' });
    if (!res.error) {
      setRole(nextRole);
    }
    return res;
  }

  async function loginOrSignup() {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || password.length < 6) {
      setStatus('E-posta ve en az 6 karakter şifre gir.');
      return;
    }
    setLoading(true);
    const res = authMode === 'login'
      ? await dkd_supabase_client.auth.signInWithPassword({ email: cleanEmail, password })
      : await dkd_supabase_client.auth.signUp({ email: cleanEmail, password });
    setLoading(false);

    if (res.error) {
      setStatus(res.error.message);
      return;
    }

    const nextUser = res.data.user ?? res.data.session?.user ?? null;
    if (nextUser?.id) {
      const roleRes = await saveProfileRole(nextUser.id, authRole, nextUser.email ?? cleanEmail);
      setStatus(roleRes.error ? roleRes.error.message : `${dkd_roles[authRole].title} hesabı açıldı.`);
    } else {
      setStatus('Hesap oluşturuldu. E-posta doğrulaması açıksa gelen kutunu kontrol et.');
    }
  }

  async function logout() {
    await dkd_supabase_client.auth.signOut();
    setStatus('Çıkış yapıldı.');
  }

  async function saveBusiness() {
    if (!userId || businessName.trim().length < 2) {
      setStatus('Salon adı en az 2 karakter olmalı.');
      return;
    }
    const payload = {
      dkd_owner_user_id: userId,
      dkd_business_name: businessName.trim(),
      dkd_business_slug: `${dkd_slug(businessName)}-${userId.slice(0, 6)}`,
      dkd_business_description: businessDescription.trim(),
      dkd_business_phone: businessPhone.trim(),
      dkd_address_text: businessAddress.trim(),
      dkd_working_hours: { dkd_summary: businessHours.trim() },
      dkd_is_active: true
    };
    const res = businessId
      ? await dkd_supabase_client.from('dkd_business_profiles').update(payload).eq('dkd_business_id', businessId).select('dkd_business_id').single()
      : await dkd_supabase_client.from('dkd_business_profiles').insert(payload).select('dkd_business_id').single();
    if (res.error) {
      setStatus(res.error.message);
      return;
    }
    setBusinessId(res.data.dkd_business_id);
    setStatus('Salon bilgileri kaydedildi.');
  }

  async function saveMaster() {
    if (!businessId || masterName.trim().length < 2) {
      setStatus('Önce salonu kaydet ve usta adını yaz.');
      return;
    }
    const res = await dkd_supabase_client.from('dkd_master_profiles').insert({
      dkd_business_id: businessId,
      dkd_master_name: masterName.trim(),
      dkd_master_specialty: masterSpecialty.trim(),
      dkd_master_phone: masterPhone.trim(),
      dkd_is_active: true
    });
    if (res.error) {
      setStatus(res.error.message);
      return;
    }
    setMasterName('');
    setMasterSpecialty('');
    setMasterPhone('');
    loadTeam(businessId);
    setStatus('Usta / çalışan eklendi.');
  }

  async function saveService() {
    const priceCents = dkd_price_to_cents(servicePrice);
    const duration = Number.parseInt(serviceDuration, 10);
    if (!businessId || serviceTitle.trim().length < 2 || priceCents <= 0 || !Number.isFinite(duration)) {
      setStatus('Hizmet adı, fiyat ve süreyi doğru gir.');
      return;
    }
    const res = await dkd_supabase_client.from('dkd_services').insert({
      dkd_business_id: businessId,
      dkd_service_title: serviceTitle.trim(),
      dkd_price_cents: priceCents,
      dkd_duration_minutes: duration,
      dkd_is_active: true
    });
    if (res.error) {
      setStatus(res.error.message);
      return;
    }
    setServiceTitle('');
    setServicePrice('');
    setServiceDuration('30');
    loadServices(businessId);
    setStatus('Hizmet eklendi.');
  }

  const activeRole = role ? dkd_roles[role] : null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={dkd_styles.safe}>
        <LinearGradient colors={['#71857E', '#465E58', '#2D3B39']} style={dkd_styles.bg}>
          <ScrollView contentContainerStyle={dkd_styles.screen} keyboardShouldPersistTaps="handled">
            <View style={dkd_styles.topBar}>
              <View>
                <Text style={dkd_styles.brand}>DraBornStyle</Text>
                <Text style={dkd_styles.brandSub}>Barber & Booking Studio</Text>
              </View>
              <View style={dkd_styles.onlinePill}><Text style={dkd_styles.onlineText}>{dkd_is_supabase_env_ready ? 'ONLINE' : 'ENV'}</Text></View>
            </View>

            <View style={dkd_styles.heroCard}>
              <View style={dkd_styles.poleRow}><View style={dkd_styles.poleRed} /><View style={dkd_styles.poleCream} /><View style={dkd_styles.poleBlue} /></View>
              <Text style={dkd_styles.heroLabel}>AKILLI SALON RANDEVU SİSTEMİ</Text>
              <Text style={dkd_styles.heroTitle}>Müşteri ile salonu aynı panelde buluştur.</Text>
              <Text style={dkd_styles.heroText}>Müşteri randevu alır, işletme salonunu yönetir. DraBornStyle v0.1 temel akışı hazır.</Text>
              <View style={dkd_styles.statRow}>
                <DkdStat value={masters.length.toString()} label="Usta" />
                <DkdStat value={services.length.toString()} label="Hizmet" />
                <DkdStat value={activeRole?.icon ?? '•'} label="Hesap" />
              </View>
            </View>

            <View style={dkd_styles.card}>
              {userEmail ? (
                <View>
                  <View style={dkd_styles.cardTitleRow}><Text style={dkd_styles.title}>Hesap Merkezi</Text><Text style={dkd_styles.badge}>{activeRole?.icon} {activeRole?.title ?? 'Rol yok'}</Text></View>
                  <Text style={dkd_styles.accent}>{userEmail}</Text>
                  <Text style={dkd_styles.body}>Bu hesap {activeRole?.title ?? 'seçilmemiş'} paneliyle açıldı. Hesap tipini değiştirmek için çıkış yapıp giriş ekranından seçim yap.</Text>
                  <TouchableOpacity style={dkd_styles.secondaryButton} onPress={logout}><Text style={dkd_styles.secondaryText}>Çıkış Yap</Text></TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Text style={dkd_styles.title}>Nasıl devam edeceksin?</Text>
                  <Text style={dkd_styles.body}>Giriş veya kayıt öncesi hesap tipini seç. Sonradan tekrar rol seçimi çıkmaz.</Text>
                  <View style={dkd_styles.authRoleRow}>
                    {dkd_public_roles.map((item) => (
                      <TouchableOpacity key={item} style={authRole === item ? dkd_styles.authRoleActive : dkd_styles.authRoleCard} onPress={() => setAuthRole(item)}>
                        <Text style={dkd_styles.authRoleIcon}>{dkd_roles[item].icon}</Text>
                        <Text style={dkd_styles.authRoleTitle}>{dkd_roles[item].title}</Text>
                        <Text style={dkd_styles.authRoleText}>{item === 'customer' ? 'Randevu almak istiyorum' : 'Salonumu yönetmek istiyorum'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={dkd_styles.tabs}>
                    <TouchableOpacity style={authMode === 'login' ? dkd_styles.tabActive : dkd_styles.tab} onPress={() => setAuthMode('login')}><Text style={authMode === 'login' ? dkd_styles.tabActiveText : dkd_styles.tabText}>Giriş</Text></TouchableOpacity>
                    <TouchableOpacity style={authMode === 'signup' ? dkd_styles.tabActive : dkd_styles.tab} onPress={() => setAuthMode('signup')}><Text style={authMode === 'signup' ? dkd_styles.tabActiveText : dkd_styles.tabText}>Kayıt</Text></TouchableOpacity>
                  </View>
                  <DkdInput label="E-posta" value={email} onChangeText={setEmail} placeholder="ornek@mail.com" />
                  <DkdInput label="Şifre" value={password} onChangeText={setPassword} placeholder="En az 6 karakter" secureTextEntry />
                  <TouchableOpacity style={dkd_styles.primaryButton} onPress={loginOrSignup} disabled={loading}><Text style={dkd_styles.primaryText}>{loading ? 'Bekle...' : `${dkd_roles[authRole].title} Olarak Devam Et`}</Text></TouchableOpacity>
                  <Text style={dkd_styles.smallNote}>Usta ve Admin hesapları v0.1 içinde yönetim/davet akışına hazırlanır; halka açık girişte müşteri ve işletme seçimi gösterilir.</Text>
                </View>
              )}
            </View>

            {userEmail && role ? <View style={dkd_styles.cardCompact}><Text style={dkd_styles.sectionHeading}>Yetki Özeti</Text>{dkd_permissions[role].map((item) => <DkdMiniRow key={item} title="Aktif" subtitle={item} />)}</View> : null}

            {userEmail && role === 'business' ? (
              <View style={dkd_styles.card}>
                <Text style={dkd_styles.title}>Salon Kurulumu</Text>
                <Text style={dkd_styles.body}>Liste şeklinde sade kurulum. Bir bölümü aç, işlemi tamamla.</Text>
                {dkd_sections.map((section) => <View key={section.key}><DkdSectionButton section={section} active={activeSection === section.key} onPress={() => setActiveSection(activeSection === section.key ? null : section.key)} count={section.key === 'team' ? masters.length : section.key === 'services' ? services.length : businessId ? 1 : 0} />{activeSection === section.key ? <View style={dkd_styles.detailBox}>{section.key === 'business' ? <><DkdInput label="Salon" value={businessName} onChangeText={setBusinessName} placeholder="Salon adı" /><DkdInput label="Açıklama" value={businessDescription} onChangeText={setBusinessDescription} placeholder="Kısa açıklama" /><DkdInput label="Telefon" value={businessPhone} onChangeText={setBusinessPhone} placeholder="Telefon" keyboardType="phone-pad" /><DkdInput label="Adres" value={businessAddress} onChangeText={setBusinessAddress} placeholder="Adres" /><DkdInput label="Saat" value={businessHours} onChangeText={setBusinessHours} placeholder="Çalışma saatleri" /><TouchableOpacity style={dkd_styles.primaryButton} onPress={saveBusiness}><Text style={dkd_styles.primaryText}>Salon Bilgilerini Kaydet</Text></TouchableOpacity></> : null}{section.key === 'team' ? <><DkdInput label="Usta" value={masterName} onChangeText={setMasterName} placeholder="Ad soyad" /><DkdInput label="Uzmanlık" value={masterSpecialty} onChangeText={setMasterSpecialty} placeholder="Saç, sakal, boya" /><DkdInput label="Telefon" value={masterPhone} onChangeText={setMasterPhone} placeholder="Telefon" keyboardType="phone-pad" /><TouchableOpacity style={dkd_styles.primaryButton} onPress={saveMaster}><Text style={dkd_styles.primaryText}>Usta Ekle</Text></TouchableOpacity>{masters.map((item) => <DkdMiniRow key={item.dkd_master_id} title={item.dkd_master_name} subtitle={item.dkd_master_specialty || 'Uzmanlık eklenmedi'} />)}</> : null}{section.key === 'services' ? <><DkdInput label="Hizmet" value={serviceTitle} onChangeText={setServiceTitle} placeholder="Saç kesim" /><DkdInput label="Fiyat" value={servicePrice} onChangeText={setServicePrice} placeholder="250" keyboardType="numeric" /><DkdInput label="Süre" value={serviceDuration} onChangeText={setServiceDuration} placeholder="30" keyboardType="numeric" /><TouchableOpacity style={dkd_styles.primaryButton} onPress={saveService}><Text style={dkd_styles.primaryText}>Hizmet Ekle</Text></TouchableOpacity>{services.map((item) => <DkdMiniRow key={item.dkd_service_id} title={item.dkd_service_title} subtitle={`${dkd_price(item.dkd_price_cents)} • ${item.dkd_duration_minutes} dk`} />)}</> : null}</View> : null}</View>)}
              </View>
            ) : null}

            {userEmail && role === 'customer' ? <View style={dkd_styles.card}><Text style={dkd_styles.title}>Müşteri Paneli</Text><Text style={dkd_styles.body}>Müşteri hesabı hazır. Salon keşfi, hizmet seçimi ve randevu alma ekranı v0.2 adımlarında açılacak.</Text></View> : null}
            {userEmail && role && role !== 'business' && role !== 'customer' ? <View style={dkd_styles.card}><Text style={dkd_styles.title}>{activeRole?.title} Paneli</Text><Text style={dkd_styles.body}>Bu rolün temel hesap akışı çalışıyor. Detaylı panel v0.2+ adımlarında açılacak.</Text></View> : null}
            <View style={dkd_styles.footer}><Text style={dkd_styles.body}>{status}</Text></View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function DkdStat(props: { value: string; label: string }) {
  return <View style={dkd_styles.statBox}><Text style={dkd_styles.statValue}>{props.value}</Text><Text style={dkd_styles.statLabel}>{props.label}</Text></View>;
}

function DkdInput(props: any) {
  const { label, ...inputProps } = props;
  return <View style={dkd_styles.inputWrap}><Text style={dkd_styles.inputLabel}>{label}</Text><TextInput {...inputProps} placeholderTextColor="#7B8B87" style={dkd_styles.input} /></View>;
}

function DkdSectionButton(props: { section: { key: DkdSection; title: string; caption: string; code: string }; active: boolean; count: number; onPress: () => void }) {
  return <TouchableOpacity style={props.active ? dkd_styles.sectionActive : dkd_styles.section} onPress={props.onPress}><Text style={dkd_styles.sectionCode}>{props.section.code}</Text><View style={dkd_styles.flex}><Text style={dkd_styles.sectionTitle}>{props.section.title}</Text><Text style={dkd_styles.sectionText}>{props.section.caption} • {props.count}</Text></View><Text style={dkd_styles.chevron}>{props.active ? '—' : '+'}</Text></TouchableOpacity>;
}

function DkdMiniRow(props: { title: string; subtitle: string }) {
  return <View style={dkd_styles.miniRow}><Text style={dkd_styles.miniTitle}>{props.title}</Text><Text style={dkd_styles.miniSub}>{props.subtitle}</Text></View>;
}

const dkd_styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#71857E' },
  bg: { flex: 1 },
  screen: { padding: 18, paddingTop: 24, paddingBottom: 44 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  brand: { color: '#FFF2DD', fontSize: 24, fontWeight: '900' },
  brandSub: { color: '#DDEBE4', fontSize: 13, fontWeight: '800', marginTop: 2 },
  onlinePill: { backgroundColor: '#213432', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#82978E' },
  onlineText: { color: '#F0C766', fontSize: 12, fontWeight: '900' },
  heroCard: { backgroundColor: '#243835', borderRadius: 28, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: '#82978E' },
  poleRow: { flexDirection: 'row', height: 8, borderRadius: 999, overflow: 'hidden', marginBottom: 18 },
  poleRed: { flex: 1, backgroundColor: '#C65B4D' },
  poleCream: { flex: 1, backgroundColor: '#FFF2DD' },
  poleBlue: { flex: 1, backgroundColor: '#43A0A8' },
  heroLabel: { color: '#F0C766', fontSize: 12, fontWeight: '900', letterSpacing: 1.2, marginBottom: 10 },
  heroTitle: { color: '#FFF2DD', fontSize: 30, fontWeight: '900', lineHeight: 36, marginBottom: 8 },
  heroText: { color: '#DDEBE4', fontSize: 16, lineHeight: 23, fontWeight: '700' },
  statRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  statBox: { flex: 1, backgroundColor: '#334B46', borderRadius: 18, padding: 12, borderWidth: 1, borderColor: '#5F786F' },
  statValue: { color: '#F0C766', fontSize: 22, fontWeight: '900' },
  statLabel: { color: '#DDEBE4', fontSize: 12, fontWeight: '800', marginTop: 2 },
  card: { backgroundColor: '#304944', borderRadius: 24, padding: 17, marginBottom: 13, borderWidth: 1, borderColor: '#82978E' },
  cardCompact: { backgroundColor: '#304944', borderRadius: 22, padding: 15, marginBottom: 13, borderWidth: 1, borderColor: '#82978E' },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  title: { color: '#FFF2DD', fontSize: 22, fontWeight: '900', marginBottom: 8 },
  body: { color: '#DDEBE4', fontSize: 15, lineHeight: 22 },
  accent: { color: '#9CF2E3', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  badge: { color: '#243835', backgroundColor: '#F0C766', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, fontWeight: '900', overflow: 'hidden' },
  flex: { flex: 1 },
  authRoleRow: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 12 },
  authRoleCard: { flex: 1, backgroundColor: '#243835', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#5F786F', minHeight: 134 },
  authRoleActive: { flex: 1, backgroundColor: '#3B5E58', borderRadius: 20, padding: 14, borderWidth: 2, borderColor: '#F0C766', minHeight: 134 },
  authRoleIcon: { fontSize: 26, marginBottom: 10 },
  authRoleTitle: { color: '#FFF2DD', fontSize: 16, fontWeight: '900', marginBottom: 5 },
  authRoleText: { color: '#DDEBE4', fontSize: 13, lineHeight: 18 },
  tabs: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  tab: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 15, backgroundColor: '#3B554F' },
  tabActive: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 15, backgroundColor: '#F0C766' },
  tabText: { color: '#DDEBE4', fontWeight: '900' },
  tabActiveText: { color: '#243835', fontWeight: '900' },
  inputWrap: { backgroundColor: '#243835', borderRadius: 16, paddingHorizontal: 13, paddingVertical: 9, marginBottom: 10, borderWidth: 1, borderColor: '#5F786F' },
  inputLabel: { color: '#F0C766', fontSize: 12, fontWeight: '900', marginBottom: 3 },
  input: { color: '#FFF2DD', fontSize: 16, paddingVertical: 5 },
  primaryButton: { backgroundColor: '#F0C766', borderRadius: 16, padding: 15, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryText: { color: '#243835', fontSize: 15, fontWeight: '900' },
  secondaryButton: { backgroundColor: '#3B554F', borderRadius: 16, padding: 14, alignItems: 'center', justifyContent: 'center', marginTop: 12, borderWidth: 1, borderColor: '#5F786F' },
  secondaryText: { color: '#FFF2DD', fontWeight: '900' },
  smallNote: { color: '#BFD0CA', fontSize: 12, lineHeight: 18, marginTop: 10 },
  section: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, backgroundColor: '#243835', borderWidth: 1, borderColor: '#5F786F', marginTop: 10 },
  sectionActive: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, backgroundColor: '#3B5E58', borderWidth: 2, borderColor: '#F0C766', marginTop: 10 },
  sectionCode: { color: '#F0C766', fontSize: 18, fontWeight: '900', width: 34 },
  sectionHeading: { color: '#FFF2DD', fontSize: 17, fontWeight: '900', marginBottom: 8 },
  sectionTitle: { color: '#FFF2DD', fontSize: 16, fontWeight: '900' },
  sectionText: { color: '#DDEBE4', fontSize: 13, marginTop: 2 },
  chevron: { color: '#F0C766', fontSize: 24, fontWeight: '900' },
  detailBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#5F786F' },
  miniRow: { padding: 12, borderRadius: 15, backgroundColor: '#243835', borderWidth: 1, borderColor: '#5F786F', marginTop: 8 },
  miniTitle: { color: '#FFF2DD', fontSize: 15, fontWeight: '900' },
  miniSub: { color: '#DDEBE4', marginTop: 2 },
  footer: { backgroundColor: '#304944', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#82978E' }
});
