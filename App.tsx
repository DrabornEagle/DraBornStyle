import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { dkd_login_mockup_base64 } from './src/dkd_assets/dkd_login_mockup_base64';
import { dkd_is_supabase_env_ready, dkd_supabase_client } from './src/dkd_config/dkd_supabase_client';

type DkdAuthMode = 'login' | 'signup';
type DkdRole = 'customer' | 'business' | 'master' | 'admin';
type DkdSection = 'business' | 'team' | 'services' | 'master_request';
type DkdApplicationStatus = 'pending' | 'approved' | 'rejected';

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

type DkdUserProfile = {
  dkd_user_id: string;
  dkd_role: DkdRole;
  dkd_display_name?: string | null;
  dkd_is_active?: boolean | null;
};

type DkdRoleApplication = {
  dkd_application_id: string;
  dkd_requester_user_id: string;
  dkd_target_user_id?: string | null;
  dkd_target_email?: string | null;
  dkd_requested_role: 'business' | 'master';
  dkd_requested_by_business_id?: string | null;
  dkd_applicant_display_name?: string | null;
  dkd_status: DkdApplicationStatus;
  dkd_admin_note?: string | null;
  dkd_metadata?: any;
  dkd_created_at?: string;
};

const dkd_role_meta: Record<DkdRole, { title: string; icon: string; caption: string }> = {
  customer: { title: 'Müşteri', icon: '👤', caption: 'Randevu ve salon keşfi' },
  business: { title: 'İşletme Sahibi', icon: '🏪', caption: 'Salon, ekip ve fiyat yönetimi' },
  master: { title: 'Usta', icon: '✂️', caption: 'Takvim ve işlem akışı' },
  admin: { title: 'Admin', icon: '🛡️', caption: 'Platform ve rol onay yönetimi' }
};

const dkd_sections: { key: DkdSection; title: string; caption: string; code: string }[] = [
  { key: 'business', title: 'Salon Bilgileri', caption: 'Ad, adres, telefon, çalışma saati', code: '01' },
  { key: 'team', title: 'Ekip / Ustalar', caption: 'Kayıtlı usta ve çalışan listesi', code: '02' },
  { key: 'services', title: 'Hizmetler / Fiyatlar', caption: 'Fiyat ve süre yönetimi', code: '03' },
  { key: 'master_request', title: 'Usta Yetki Başvurusu', caption: 'Kayıtlı kullanıcıyı usta yapmak için admin onayı iste', code: '04' }
];

const dkd_permissions: Record<DkdRole, string[]> = {
  customer: ['Standart müşteri hesabı', 'İşletme başvurusu gönderebilir', 'Onaylanırsa işletme paneli açılır'],
  business: ['Salon profili yönetimi', 'Ekip / usta başvurusu gönderebilir', 'Hizmet, fiyat ve süre yönetimi'],
  master: ['Usta hesabı doğrulandı', 'v0.2 takvim akışına hazır', 'İşlem yönetimi için hazırlanır'],
  admin: ['Kayıtlı kullanıcıları görüntüler', 'İşletme ve usta başvurularını onaylar', 'Kullanıcı rolünü işletme veya usta yapabilir']
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
  const [businessApplicationNote, setBusinessApplicationNote] = React.useState('');

  const [masters, setMasters] = React.useState<DkdMaster[]>([]);
  const [masterName, setMasterName] = React.useState('');
  const [masterSpecialty, setMasterSpecialty] = React.useState('');
  const [masterPhone, setMasterPhone] = React.useState('');
  const [masterApplicantEmail, setMasterApplicantEmail] = React.useState('');
  const [masterApplicantName, setMasterApplicantName] = React.useState('');

  const [services, setServices] = React.useState<DkdService[]>([]);
  const [serviceTitle, setServiceTitle] = React.useState('');
  const [servicePrice, setServicePrice] = React.useState('');
  const [serviceDuration, setServiceDuration] = React.useState('30');

  const [applications, setApplications] = React.useState<DkdRoleApplication[]>([]);
  const [adminUsers, setAdminUsers] = React.useState<DkdUserProfile[]>([]);
  const [adminApplications, setAdminApplications] = React.useState<DkdRoleApplication[]>([]);

  React.useEffect(() => {
    dkd_supabase_client.auth.getSession().then((res: any) => {
      const user = res.data.session?.user ?? null;
      setUserEmail(user?.email ?? null);
      setUserId(user?.id ?? null);
      loadAll(user?.id ?? null, user?.email ?? null);
    });

    const sub = dkd_supabase_client.auth.onAuthStateChange((_event: string, session: any) => {
      const user = session?.user ?? null;
      setUserEmail(user?.email ?? null);
      setUserId(user?.id ?? null);
      loadAll(user?.id ?? null, user?.email ?? null);
    });

    return () => sub.data.subscription.unsubscribe();
  }, []);

  async function ensureProfile(nextUserId: string, nextEmail: string | null) {
    const existing = await dkd_supabase_client
      .from('dkd_user_profiles')
      .select('dkd_role')
      .eq('dkd_user_id', nextUserId)
      .maybeSingle();

    if (existing.data?.dkd_role) {
      return existing.data.dkd_role as DkdRole;
    }

    const created = await dkd_supabase_client
      .from('dkd_user_profiles')
      .upsert({ dkd_user_id: nextUserId, dkd_role: 'customer', dkd_display_name: nextEmail ?? '', dkd_is_active: true }, { onConflict: 'dkd_user_id' })
      .select('dkd_role')
      .single();

    return (created.data?.dkd_role as DkdRole | undefined) ?? 'customer';
  }

  async function loadAll(nextUserId: string | null, nextEmail?: string | null) {
    if (!nextUserId) {
      setRole(null);
      setBusinessId(null);
      setMasters([]);
      setServices([]);
      setApplications([]);
      setAdminUsers([]);
      setAdminApplications([]);
      return;
    }

    const nextRole = await ensureProfile(nextUserId, nextEmail ?? userEmail);
    setRole(nextRole);
    await loadBusiness(nextUserId);
    await loadApplications(nextUserId, nextRole);
  }

  async function loadBusiness(nextUserId: string) {
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
      await loadTeam(nextBusinessId);
      await loadServices(nextBusinessId);
    }
  }

  async function loadApplications(nextUserId: string, nextRole: DkdRole) {
    const own = await dkd_supabase_client
      .from('dkd_role_applications')
      .select('*')
      .or(`dkd_requester_user_id.eq.${nextUserId},dkd_target_user_id.eq.${nextUserId}`)
      .order('dkd_created_at', { ascending: false });
    setApplications((own.data ?? []) as DkdRoleApplication[]);

    if (nextRole === 'admin') {
      const users = await dkd_supabase_client
        .from('dkd_user_profiles')
        .select('dkd_user_id, dkd_role, dkd_display_name, dkd_is_active')
        .order('dkd_display_name', { ascending: true });
      setAdminUsers((users.data ?? []) as DkdUserProfile[]);

      const apps = await dkd_supabase_client
        .from('dkd_role_applications')
        .select('*')
        .order('dkd_created_at', { ascending: false })
        .limit(50);
      setAdminApplications((apps.data ?? []) as DkdRoleApplication[]);
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

  async function loginOrSignup(nextAuthMode: DkdAuthMode = authMode) {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || password.length < 6) {
      setStatus('E-posta ve en az 6 karakter şifre gir.');
      return;
    }
    setLoading(true);
    const res = nextAuthMode === 'login'
      ? await dkd_supabase_client.auth.signInWithPassword({ email: cleanEmail, password })
      : await dkd_supabase_client.auth.signUp({ email: cleanEmail, password });
    setLoading(false);

    if (res.error) {
      setStatus(res.error.message);
      return;
    }

    const nextUser = res.data.user ?? res.data.session?.user ?? null;
    if (nextUser?.id) {
      const nextRole = await ensureProfile(nextUser.id, nextUser.email ?? cleanEmail);
      setRole(nextRole);
      setStatus(`${dkd_role_meta[nextRole].title} hesabı açıldı.`);
      await loadAll(nextUser.id, nextUser.email ?? cleanEmail);
    } else {
      setStatus('Hesap oluşturuldu. E-posta doğrulaması açıksa gelen kutunu kontrol et.');
    }
  }

  async function logout() {
    await dkd_supabase_client.auth.signOut();
    setStatus('Çıkış yapıldı.');
  }

  async function sendBusinessApplication() {
    if (!userId) return;
    if (businessName.trim().length < 2) {
      setStatus('İşletme başvurusu için salon adını yaz.');
      return;
    }

    const res = await dkd_supabase_client.from('dkd_role_applications').insert({
      dkd_requester_user_id: userId,
      dkd_target_user_id: userId,
      dkd_target_email: userEmail,
      dkd_requested_role: 'business',
      dkd_applicant_display_name: businessName.trim(),
      dkd_metadata: {
        business_name: businessName.trim(),
        phone: businessPhone.trim(),
        address: businessAddress.trim(),
        note: businessApplicationNote.trim()
      }
    });

    if (res.error) {
      setStatus(res.error.message);
      return;
    }
    setStatus('İşletme başvurusu admin onayına gönderildi.');
    await loadApplications(userId, role ?? 'customer');
  }

  async function sendMasterApplication() {
    if (!userId || !businessId) {
      setStatus('Usta başvurusu için önce işletme paneli ve salon kaydı gerekli.');
      return;
    }
    const targetEmail = masterApplicantEmail.trim().toLowerCase();
    if (!targetEmail || masterApplicantName.trim().length < 2) {
      setStatus('Usta adını ve kayıtlı kullanıcı e-postasını yaz.');
      return;
    }

    const targetUser = adminUsers.find((item) => (item.dkd_display_name ?? '').toLowerCase() === targetEmail);
    const res = await dkd_supabase_client.from('dkd_role_applications').insert({
      dkd_requester_user_id: userId,
      dkd_target_user_id: targetUser?.dkd_user_id ?? null,
      dkd_target_email: targetEmail,
      dkd_requested_role: 'master',
      dkd_requested_by_business_id: businessId,
      dkd_applicant_display_name: masterApplicantName.trim(),
      dkd_metadata: {
        master_name: masterApplicantName.trim(),
        specialty: masterSpecialty.trim(),
        phone: masterPhone.trim(),
        business_name: businessName.trim()
      }
    });

    if (res.error) {
      setStatus(res.error.message);
      return;
    }
    setStatus('Usta yetki başvurusu admin onayına gönderildi.');
    setMasterApplicantEmail('');
    setMasterApplicantName('');
    await loadApplications(userId, role ?? 'business');
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

  async function adminSetUserRole(targetUserId: string, nextRole: DkdRole) {
    const res = await dkd_supabase_client
      .from('dkd_user_profiles')
      .update({ dkd_role: nextRole, dkd_is_active: true })
      .eq('dkd_user_id', targetUserId);
    if (res.error) {
      setStatus(res.error.message);
      return;
    }
    setStatus(`Kullanıcı ${dkd_role_meta[nextRole].title} olarak işaretlendi.`);
    if (userId) await loadApplications(userId, 'admin');
  }

  async function adminApproveApplication(app: DkdRoleApplication) {
    const targetId = app.dkd_target_user_id ?? adminUsers.find((item) => (item.dkd_display_name ?? '').toLowerCase() === (app.dkd_target_email ?? '').toLowerCase())?.dkd_user_id;
    if (!targetId) {
      setStatus('Başvurudaki kullanıcı henüz kayıtlı görünmüyor. Önce kullanıcı kayıt olmalı.');
      return;
    }

    const roleRes = await dkd_supabase_client
      .from('dkd_user_profiles')
      .update({ dkd_role: app.dkd_requested_role, dkd_is_active: true })
      .eq('dkd_user_id', targetId);
    if (roleRes.error) {
      setStatus(roleRes.error.message);
      return;
    }

    const appRes = await dkd_supabase_client
      .from('dkd_role_applications')
      .update({ dkd_status: 'approved', dkd_admin_note: 'Admin tarafından onaylandı.' })
      .eq('dkd_application_id', app.dkd_application_id);
    if (appRes.error) {
      setStatus(appRes.error.message);
      return;
    }
    setStatus('Başvuru onaylandı ve rol güncellendi.');
    if (userId) await loadApplications(userId, 'admin');
  }

  async function adminRejectApplication(app: DkdRoleApplication) {
    const res = await dkd_supabase_client
      .from('dkd_role_applications')
      .update({ dkd_status: 'rejected', dkd_admin_note: 'Admin tarafından reddedildi.' })
      .eq('dkd_application_id', app.dkd_application_id);
    if (res.error) {
      setStatus(res.error.message);
      return;
    }
    setStatus('Başvuru reddedildi.');
    if (userId) await loadApplications(userId, 'admin');
  }

  const activeRole = role ? dkd_role_meta[role] : null;

  if (!userEmail) {
    return (
      <SafeAreaProvider>
        <View style={dkd_styles.mockupRoot}>
          <ImageBackground
            source={{ uri: `data:image/jpeg;base64,${dkd_login_mockup_base64}` }}
            resizeMode="stretch"
            style={dkd_styles.mockupImage}
          >
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder=""
              style={[dkd_styles.mockupInput, dkd_styles.mockupEmailInput]}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder=""
              style={[dkd_styles.mockupInput, dkd_styles.mockupPasswordInput]}
            />
            <TouchableOpacity activeOpacity={0.8} style={[dkd_styles.mockupButton, dkd_styles.mockupLoginButton]} onPress={() => loginOrSignup('login')} disabled={loading} />
            <TouchableOpacity activeOpacity={0.8} style={[dkd_styles.mockupButton, dkd_styles.mockupSignupButton]} onPress={() => loginOrSignup('signup')} disabled={loading} />
            {status !== 'Barber Studio panel hazır.' ? <Text style={dkd_styles.mockupStatus}>{status}</Text> : null}
          </ImageBackground>
        </View>
      </SafeAreaProvider>
    );
  }

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
              <Text style={dkd_styles.heroTitle}>Herkes müşteri olarak başlar.</Text>
              <Text style={dkd_styles.heroText}>İşletme ve usta panelleri başvuru + admin onayıyla açılır. Böylece panel yetkileri kontrol altında kalır.</Text>
              <View style={dkd_styles.statRow}>
                <DkdStat value={masters.length.toString()} label="Usta" />
                <DkdStat value={services.length.toString()} label="Hizmet" />
                <DkdStat value={activeRole?.icon ?? '•'} label="Hesap" />
              </View>
            </View>

            <View style={dkd_styles.card}>
              <View>
                <View style={dkd_styles.cardTitleRow}><Text style={dkd_styles.title}>Hesap Merkezi</Text><Text style={dkd_styles.badge}>{activeRole?.icon} {activeRole?.title ?? 'Müşteri'}</Text></View>
                <Text style={dkd_styles.accent}>{userEmail}</Text>
                <Text style={dkd_styles.body}>Giriş/kayıt tek tiptir. İşletme ve usta yetkileri admin onayından sonra açılır.</Text>
                <TouchableOpacity style={dkd_styles.secondaryButton} onPress={logout}><Text style={dkd_styles.secondaryText}>Çıkış Yap</Text></TouchableOpacity>
              </View>
            </View>

            {role ? <View style={dkd_styles.cardCompact}><Text style={dkd_styles.sectionHeading}>Yetki Özeti</Text>{dkd_permissions[role].map((item) => <DkdMiniRow key={item} title="Aktif" subtitle={item} />)}</View> : null}

            {role === 'customer' ? (
              <View style={dkd_styles.card}>
                <Text style={dkd_styles.title}>İşletme Başvurusu</Text>
                <Text style={dkd_styles.body}>Salon sahibiysen başvurunu gönder. Admin onayladıktan sonra işletme panelin açılır.</Text>
                <DkdInput label="Salon" value={businessName} onChangeText={setBusinessName} placeholder="Salon adı" />
                <DkdInput label="Telefon" value={businessPhone} onChangeText={setBusinessPhone} placeholder="Telefon" keyboardType="phone-pad" />
                <DkdInput label="Adres" value={businessAddress} onChangeText={setBusinessAddress} placeholder="Adres" />
                <DkdInput label="Not" value={businessApplicationNote} onChangeText={setBusinessApplicationNote} placeholder="Kısa başvuru notu" />
                <TouchableOpacity style={dkd_styles.primaryButton} onPress={sendBusinessApplication}><Text style={dkd_styles.primaryText}>Admin Onayına Gönder</Text></TouchableOpacity>
              </View>
            ) : null}

            {applications.length > 0 ? <View style={dkd_styles.cardCompact}><Text style={dkd_styles.sectionHeading}>Başvuru Durumu</Text>{applications.map((item) => <DkdMiniRow key={item.dkd_application_id} title={`${dkd_role_meta[item.dkd_requested_role].title} • ${item.dkd_status}`} subtitle={item.dkd_applicant_display_name || item.dkd_target_email || 'Başvuru'} />)}</View> : null}

            {role === 'business' ? (
              <View style={dkd_styles.card}>
                <Text style={dkd_styles.title}>Salon Kurulumu</Text>
                <Text style={dkd_styles.body}>İşletme paneli admin onayıyla açılır. Usta yetkisi de buradan admin onayına gönderilir.</Text>
                {dkd_sections.map((section) => (
                  <View key={section.key}>
                    <DkdSectionButton section={section} active={activeSection === section.key} onPress={() => setActiveSection(activeSection === section.key ? null : section.key)} count={section.key === 'team' ? masters.length : section.key === 'services' ? services.length : section.key === 'business' ? businessId ? 1 : 0 : 0} />
                    {activeSection === section.key ? (
                      <View style={dkd_styles.detailBox}>
                        {section.key === 'business' ? <><DkdInput label="Salon" value={businessName} onChangeText={setBusinessName} placeholder="Salon adı" /><DkdInput label="Açıklama" value={businessDescription} onChangeText={setBusinessDescription} placeholder="Kısa açıklama" /><DkdInput label="Telefon" value={businessPhone} onChangeText={setBusinessPhone} placeholder="Telefon" keyboardType="phone-pad" /><DkdInput label="Adres" value={businessAddress} onChangeText={setBusinessAddress} placeholder="Adres" /><DkdInput label="Saat" value={businessHours} onChangeText={setBusinessHours} placeholder="Çalışma saatleri" /><TouchableOpacity style={dkd_styles.primaryButton} onPress={saveBusiness}><Text style={dkd_styles.primaryText}>Salon Bilgilerini Kaydet</Text></TouchableOpacity></> : null}
                        {section.key === 'team' ? <><DkdInput label="Usta" value={masterName} onChangeText={setMasterName} placeholder="Ad soyad" /><DkdInput label="Uzmanlık" value={masterSpecialty} onChangeText={setMasterSpecialty} placeholder="Saç, sakal, boya" /><DkdInput label="Telefon" value={masterPhone} onChangeText={setMasterPhone} placeholder="Telefon" keyboardType="phone-pad" /><TouchableOpacity style={dkd_styles.primaryButton} onPress={saveMaster}><Text style={dkd_styles.primaryText}>Usta Listeye Ekle</Text></TouchableOpacity>{masters.map((item) => <DkdMiniRow key={item.dkd_master_id} title={item.dkd_master_name} subtitle={item.dkd_master_specialty || 'Uzmanlık eklenmedi'} />)}</> : null}
                        {section.key === 'services' ? <><DkdInput label="Hizmet" value={serviceTitle} onChangeText={setServiceTitle} placeholder="Saç kesim" /><DkdInput label="Fiyat" value={servicePrice} onChangeText={setServicePrice} placeholder="250" keyboardType="numeric" /><DkdInput label="Süre" value={serviceDuration} onChangeText={setServiceDuration} placeholder="30" keyboardType="numeric" /><TouchableOpacity style={dkd_styles.primaryButton} onPress={saveService}><Text style={dkd_styles.primaryText}>Hizmet Ekle</Text></TouchableOpacity>{services.map((item) => <DkdMiniRow key={item.dkd_service_id} title={item.dkd_service_title} subtitle={`${dkd_price(item.dkd_price_cents)} • ${item.dkd_duration_minutes} dk`} />)}</> : null}
                        {section.key === 'master_request' ? <><DkdInput label="E-posta" value={masterApplicantEmail} onChangeText={setMasterApplicantEmail} placeholder="Usta olacak kayıtlı kullanıcı e-postası" /><DkdInput label="Ad Soyad" value={masterApplicantName} onChangeText={setMasterApplicantName} placeholder="Usta adı soyadı" /><DkdInput label="Uzmanlık" value={masterSpecialty} onChangeText={setMasterSpecialty} placeholder="Saç, sakal, boya" /><DkdInput label="Telefon" value={masterPhone} onChangeText={setMasterPhone} placeholder="Telefon" keyboardType="phone-pad" /><TouchableOpacity style={dkd_styles.primaryButton} onPress={sendMasterApplication}><Text style={dkd_styles.primaryText}>Usta Yetkisini Admin Onayına Gönder</Text></TouchableOpacity></> : null}
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            {role === 'admin' ? (
              <View style={dkd_styles.card}>
                <Text style={dkd_styles.title}>Admin Paneli</Text>
                <Text style={dkd_styles.body}>Kayıtlı kullanıcıları işletme sahibi veya usta olarak işaretle; başvuruları onayla/reddet.</Text>
                <Text style={dkd_styles.sectionHeading}>Başvurular</Text>
                {adminApplications.map((app) => <View key={app.dkd_application_id} style={dkd_styles.adminBox}><Text style={dkd_styles.miniTitle}>{dkd_role_meta[app.dkd_requested_role].icon} {dkd_role_meta[app.dkd_requested_role].title} • {app.dkd_status}</Text><Text style={dkd_styles.miniSub}>{app.dkd_applicant_display_name || app.dkd_target_email || 'Başvuru'}</Text><View style={dkd_styles.actionRow}><TouchableOpacity style={dkd_styles.smallButton} onPress={() => adminApproveApplication(app)}><Text style={dkd_styles.smallButtonText}>Onayla</Text></TouchableOpacity><TouchableOpacity style={dkd_styles.smallButtonGhost} onPress={() => adminRejectApplication(app)}><Text style={dkd_styles.smallButtonGhostText}>Reddet</Text></TouchableOpacity></View></View>)}
                <Text style={dkd_styles.sectionHeading}>Kayıtlı Kullanıcılar</Text>
                {adminUsers.map((item) => <View key={item.dkd_user_id} style={dkd_styles.adminBox}><Text style={dkd_styles.miniTitle}>{item.dkd_display_name || item.dkd_user_id}</Text><Text style={dkd_styles.miniSub}>Mevcut rol: {dkd_role_meta[item.dkd_role]?.title ?? item.dkd_role}</Text><View style={dkd_styles.actionRow}><TouchableOpacity style={dkd_styles.smallButton} onPress={() => adminSetUserRole(item.dkd_user_id, 'business')}><Text style={dkd_styles.smallButtonText}>İşletme Yap</Text></TouchableOpacity><TouchableOpacity style={dkd_styles.smallButton} onPress={() => adminSetUserRole(item.dkd_user_id, 'master')}><Text style={dkd_styles.smallButtonText}>Usta Yap</Text></TouchableOpacity></View></View>)}
              </View>
            ) : null}

            {role === 'master' ? <View style={dkd_styles.card}><Text style={dkd_styles.title}>Usta Paneli</Text><Text style={dkd_styles.body}>Usta yetkin admin tarafından açıldı. Detaylı takvim ve işlem ekranı v0.2+ adımlarında gelecek.</Text></View> : null}
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
  mockupRoot: { flex: 1, backgroundColor: '#0A0E19' },
  mockupImage: { flex: 1, width: '100%', height: '100%' },
  mockupInput: { position: 'absolute', left: '27%', width: '55%', height: '6.4%', backgroundColor: 'rgba(0,0,0,0.01)', color: '#FFFFFF', fontSize: 18, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 0 },
  mockupEmailInput: { top: '42.9%' },
  mockupPasswordInput: { top: '55.7%' },
  mockupButton: { position: 'absolute', left: '19%', width: '62%', height: '7.1%', backgroundColor: 'rgba(0,0,0,0.01)', borderRadius: 18 },
  mockupLoginButton: { top: '68.5%' },
  mockupSignupButton: { top: '77.4%' },
  mockupStatus: { position: 'absolute', left: '12%', right: '12%', bottom: '3%', color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 12, padding: 10, textAlign: 'center', fontSize: 13, fontWeight: '800', overflow: 'hidden' },
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
  section: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, backgroundColor: '#243835', borderWidth: 1, borderColor: '#5F786F', marginTop: 10 },
  sectionActive: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, backgroundColor: '#3B5E58', borderWidth: 2, borderColor: '#F0C766', marginTop: 10 },
  sectionCode: { color: '#F0C766', fontSize: 18, fontWeight: '900', width: 34 },
  sectionHeading: { color: '#FFF2DD', fontSize: 17, fontWeight: '900', marginBottom: 8, marginTop: 10 },
  sectionTitle: { color: '#FFF2DD', fontSize: 16, fontWeight: '900' },
  sectionText: { color: '#DDEBE4', fontSize: 13, marginTop: 2 },
  chevron: { color: '#F0C766', fontSize: 24, fontWeight: '900' },
  detailBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#5F786F' },
  miniRow: { padding: 12, borderRadius: 15, backgroundColor: '#243835', borderWidth: 1, borderColor: '#5F786F', marginTop: 8 },
  miniTitle: { color: '#FFF2DD', fontSize: 15, fontWeight: '900' },
  miniSub: { color: '#DDEBE4', marginTop: 2 },
  adminBox: { padding: 12, borderRadius: 16, backgroundColor: '#243835', borderWidth: 1, borderColor: '#5F786F', marginTop: 10 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  smallButton: { backgroundColor: '#F0C766', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  smallButtonText: { color: '#243835', fontWeight: '900', fontSize: 12 },
  smallButtonGhost: { backgroundColor: '#3B554F', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: '#5F786F' },
  smallButtonGhostText: { color: '#FFF2DD', fontWeight: '900', fontSize: 12 },
  footer: { backgroundColor: '#304944', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#82978E' }
});
