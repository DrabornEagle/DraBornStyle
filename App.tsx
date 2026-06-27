import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { dkd_is_supabase_env_ready, dkd_supabase_client } from './src/dkd_config/dkd_supabase_client';

type DkdAuthMode = 'login' | 'signup';
type DkdRole = 'customer' | 'business' | 'master' | 'admin';
type DkdPanel = 'home' | 'customer' | 'business' | 'master' | 'admin';
type DkdSection = 'business' | 'team' | 'services' | 'master_request';
type DkdApplicationStatus = 'pending' | 'approved' | 'rejected';

type DkdMaster = { dkd_master_id: string; dkd_master_name: string; dkd_master_specialty?: string | null; dkd_master_phone?: string | null };
type DkdService = { dkd_service_id: string; dkd_service_title: string; dkd_price_cents: number; dkd_duration_minutes: number };
type DkdUserProfile = { dkd_user_id: string; dkd_display_name?: string | null; dkd_is_active?: boolean | null };
type DkdRoleApplication = { dkd_application_id: string; dkd_requester_user_id: string; dkd_target_user_id?: string | null; dkd_target_email?: string | null; dkd_requested_role: 'business' | 'master'; dkd_requested_by_business_id?: string | null; dkd_applicant_display_name?: string | null; dkd_status: DkdApplicationStatus; dkd_admin_note?: string | null; dkd_metadata?: any };

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

function dkd_slug(value: string) {
  return value.toLowerCase().trim().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 44);
}
function dkd_price_to_cents(value: string) { const parsed = Number(value.replace(',', '.').replace(/[^0-9.]/g, '')); return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : 0; }
function dkd_price(cents: number) { return `${Math.round(cents / 100)} TL`; }
function dkd_pick_primary_role(roles: DkdRole[]): DkdRole { if (roles.includes('admin')) return 'admin'; if (roles.includes('business')) return 'business'; if (roles.includes('master')) return 'master'; return 'customer'; }

export default function DkdDraBornStyleApp() {
  const [authMode, setAuthMode] = React.useState<DkdAuthMode>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [primaryRole, setPrimaryRole] = React.useState<DkdRole>('customer');
  const [accessRoles, setAccessRoles] = React.useState<DkdRole[]>(['customer']);
  const [activePanel, setActivePanel] = React.useState<DkdPanel>('home');
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
  const [selfMasterNote, setSelfMasterNote] = React.useState('');

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

  function dkd_has_role(nextRole: DkdRole) { return accessRoles.includes('admin') || accessRoles.includes(nextRole); }

  async function ensureProfile(nextUserId: string, nextEmail: string | null) {
    const existing = await dkd_supabase_client.from('dkd_user_profiles').select('dkd_user_id').eq('dkd_user_id', nextUserId).maybeSingle();
    if (!existing.data?.dkd_user_id) {
      await dkd_supabase_client.from('dkd_user_profiles').upsert({ dkd_user_id: nextUserId, dkd_display_name: nextEmail ?? '', dkd_is_active: true }, { onConflict: 'dkd_user_id' });
    }
    await dkd_supabase_client.rpc('dkd_ensure_customer_access', { dkd_target_user_id: nextUserId });
  }

  async function loadRoleAccess(nextUserId: string) {
    const response = await dkd_supabase_client.from('dkd_user_role_access').select('dkd_role').eq('dkd_user_id', nextUserId).eq('dkd_is_active', true);
    const roles = Array.from(new Set(['customer', ...((response.data ?? []).map((item: any) => item.dkd_role as DkdRole))]));
    const safeRoles = roles.filter((item): item is DkdRole => ['customer', 'business', 'master', 'admin'].includes(item));
    setAccessRoles(safeRoles);
    setPrimaryRole(dkd_pick_primary_role(safeRoles));
    setActivePanel('home');
    return safeRoles;
  }

  async function loadAll(nextUserId: string | null, nextEmail?: string | null) {
    if (!nextUserId) {
      setPrimaryRole('customer'); setAccessRoles(['customer']); setActivePanel('home'); setBusinessId(null); setMasters([]); setServices([]); setApplications([]); setAdminUsers([]); setAdminApplications([]); return;
    }
    await ensureProfile(nextUserId, nextEmail ?? userEmail);
    const roles = await loadRoleAccess(nextUserId);
    await loadBusiness(nextUserId);
    await loadApplications(nextUserId, roles);
  }

  async function loadBusiness(nextUserId: string) {
    const business = await dkd_supabase_client.from('dkd_business_profiles').select('dkd_business_id, dkd_business_name, dkd_business_description, dkd_business_phone, dkd_address_text, dkd_working_hours').eq('dkd_owner_user_id', nextUserId).order('dkd_created_at', { ascending: false }).limit(1).maybeSingle();
    const data = business.data;
    const nextBusinessId = data?.dkd_business_id ?? null;
    setBusinessId(nextBusinessId);
    setBusinessName(data?.dkd_business_name ?? '');
    setBusinessDescription(data?.dkd_business_description ?? '');
    setBusinessPhone(data?.dkd_business_phone ?? '');
    setBusinessAddress(data?.dkd_address_text ?? '');
    setBusinessHours(data?.dkd_working_hours?.dkd_summary ?? '09:00 - 20:00');
    if (nextBusinessId) { await loadTeam(nextBusinessId); await loadServices(nextBusinessId); }
  }

  async function loadApplications(nextUserId: string, roles: DkdRole[]) {
    const own = await dkd_supabase_client.from('dkd_role_applications').select('*').or(`dkd_requester_user_id.eq.${nextUserId},dkd_target_user_id.eq.${nextUserId}`).order('dkd_created_at', { ascending: false });
    setApplications((own.data ?? []) as DkdRoleApplication[]);
    if (roles.includes('admin')) {
      const users = await dkd_supabase_client.from('dkd_user_profiles').select('dkd_user_id, dkd_display_name, dkd_is_active').order('dkd_display_name', { ascending: true });
      setAdminUsers((users.data ?? []) as DkdUserProfile[]);
      const apps = await dkd_supabase_client.from('dkd_role_applications').select('*').order('dkd_created_at', { ascending: false }).limit(50);
      setAdminApplications((apps.data ?? []) as DkdRoleApplication[]);
    }
  }

  async function loadTeam(nextBusinessId: string) {
    const res = await dkd_supabase_client.from('dkd_master_profiles').select('dkd_master_id, dkd_master_name, dkd_master_specialty, dkd_master_phone').eq('dkd_business_id', nextBusinessId).eq('dkd_is_active', true).order('dkd_created_at', { ascending: false });
    setMasters((res.data ?? []) as DkdMaster[]);
  }
  async function loadServices(nextBusinessId: string) {
    const res = await dkd_supabase_client.from('dkd_services').select('dkd_service_id, dkd_service_title, dkd_price_cents, dkd_duration_minutes').eq('dkd_business_id', nextBusinessId).eq('dkd_is_active', true).order('dkd_created_at', { ascending: false });
    setServices((res.data ?? []) as DkdService[]);
  }

  async function loginOrSignup(nextAuthMode: DkdAuthMode = authMode) {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || password.length < 6) { setStatus('E-posta ve en az 6 karakter şifre gir.'); return; }
    setLoading(true);
    const res = nextAuthMode === 'login' ? await dkd_supabase_client.auth.signInWithPassword({ email: cleanEmail, password }) : await dkd_supabase_client.auth.signUp({ email: cleanEmail, password });
    setLoading(false);
    if (res.error) { setStatus(res.error.message); return; }
    const nextUser = res.data.user ?? res.data.session?.user ?? null;
    if (nextUser?.id) { await loadAll(nextUser.id, nextUser.email ?? cleanEmail); setStatus('Hesap açıldı. Yetkiler yüklendi.'); }
    else { setStatus('Hesap oluşturuldu. E-posta doğrulaması açıksa gelen kutunu kontrol et.'); }
  }

  async function logout() { await dkd_supabase_client.auth.signOut(); setStatus('Çıkış yapıldı.'); }

  async function sendBusinessApplication() {
    if (!userId) return;
    if (businessName.trim().length < 2) { setStatus('İşletme başvurusu için salon adını yaz.'); return; }
    const res = await dkd_supabase_client.from('dkd_role_applications').insert({ dkd_requester_user_id: userId, dkd_target_user_id: userId, dkd_target_email: userEmail, dkd_requested_role: 'business', dkd_applicant_display_name: businessName.trim(), dkd_metadata: { business_name: businessName.trim(), phone: businessPhone.trim(), address: businessAddress.trim(), note: businessApplicationNote.trim() } });
    if (res.error) { setStatus(res.error.message); return; }
    setStatus('İşletme başvurusu admin onayına gönderildi.');
    await loadApplications(userId, accessRoles);
  }
  async function sendSelfMasterApplication() {
    if (!userId) return;
    const displayName = masterApplicantName.trim() || userEmail || 'Usta adayı';
    const res = await dkd_supabase_client.from('dkd_role_applications').insert({ dkd_requester_user_id: userId, dkd_target_user_id: userId, dkd_target_email: userEmail, dkd_requested_role: 'master', dkd_applicant_display_name: displayName, dkd_metadata: { master_name: displayName, specialty: masterSpecialty.trim(), phone: masterPhone.trim(), note: selfMasterNote.trim() } });
    if (res.error) { setStatus(res.error.message); return; }
    setStatus('Usta başvurusu admin onayına gönderildi.');
    await loadApplications(userId, accessRoles);
  }
  async function sendMasterApplication() {
    if (!userId || !businessId) { setStatus('Usta başvurusu için önce işletme paneli ve salon kaydı gerekli.'); return; }
    const targetEmail = masterApplicantEmail.trim().toLowerCase();
    if (!targetEmail || masterApplicantName.trim().length < 2) { setStatus('Usta adını ve kayıtlı kullanıcı e-postasını yaz.'); return; }
    const res = await dkd_supabase_client.from('dkd_role_applications').insert({ dkd_requester_user_id: userId, dkd_target_email: targetEmail, dkd_requested_role: 'master', dkd_requested_by_business_id: businessId, dkd_applicant_display_name: masterApplicantName.trim(), dkd_metadata: { master_name: masterApplicantName.trim(), specialty: masterSpecialty.trim(), phone: masterPhone.trim(), business_name: businessName.trim() } });
    if (res.error) { setStatus(res.error.message); return; }
    setStatus('Usta yetki başvurusu admin onayına gönderildi.');
    setMasterApplicantEmail(''); setMasterApplicantName('');
    await loadApplications(userId, accessRoles);
  }

  async function saveBusiness() {
    if (!userId || businessName.trim().length < 2) { setStatus('Salon adı en az 2 karakter olmalı.'); return; }
    const payload = { dkd_owner_user_id: userId, dkd_business_name: businessName.trim(), dkd_business_slug: `${dkd_slug(businessName)}-${userId.slice(0, 6)}`, dkd_business_description: businessDescription.trim(), dkd_business_phone: businessPhone.trim(), dkd_address_text: businessAddress.trim(), dkd_working_hours: { dkd_summary: businessHours.trim() }, dkd_is_active: true };
    const res = businessId ? await dkd_supabase_client.from('dkd_business_profiles').update(payload).eq('dkd_business_id', businessId).select('dkd_business_id').single() : await dkd_supabase_client.from('dkd_business_profiles').insert(payload).select('dkd_business_id').single();
    if (res.error) { setStatus(res.error.message); return; }
    setBusinessId(res.data.dkd_business_id);
    setStatus('Salon bilgileri kaydedildi.');
  }
  async function saveMaster() {
    if (!businessId || masterName.trim().length < 2) { setStatus('Önce salonu kaydet ve usta adını yaz.'); return; }
    const res = await dkd_supabase_client.from('dkd_master_profiles').insert({ dkd_business_id: businessId, dkd_master_name: masterName.trim(), dkd_master_specialty: masterSpecialty.trim(), dkd_master_phone: masterPhone.trim(), dkd_is_active: true });
    if (res.error) { setStatus(res.error.message); return; }
    setMasterName(''); setMasterSpecialty(''); setMasterPhone(''); loadTeam(businessId); setStatus('Usta / çalışan eklendi.');
  }
  async function saveService() {
    const priceCents = dkd_price_to_cents(servicePrice); const duration = Number.parseInt(serviceDuration, 10);
    if (!businessId || serviceTitle.trim().length < 2 || priceCents <= 0 || !Number.isFinite(duration)) { setStatus('Hizmet adı, fiyat ve süreyi doğru gir.'); return; }
    const res = await dkd_supabase_client.from('dkd_services').insert({ dkd_business_id: businessId, dkd_service_title: serviceTitle.trim(), dkd_price_cents: priceCents, dkd_duration_minutes: duration, dkd_is_active: true });
    if (res.error) { setStatus(res.error.message); return; }
    setServiceTitle(''); setServicePrice(''); setServiceDuration('30'); loadServices(businessId); setStatus('Hizmet eklendi.');
  }

  async function adminSetUserRole(targetUserId: string, nextRole: DkdRole) {
    const res = await dkd_supabase_client.rpc('dkd_admin_grant_role', { dkd_target_user_id: targetUserId, dkd_next_role: nextRole });
    if (res.error) { setStatus(res.error.message); return; }
    setStatus(`Kullanıcıya ${dkd_role_meta[nextRole].title} yetkisi verildi.`);
    if (userId) await loadAll(userId, userEmail);
  }
  async function adminApproveApplication(app: DkdRoleApplication) {
    const res = await dkd_supabase_client.rpc('dkd_admin_approve_role_application', { dkd_application_id_input: app.dkd_application_id });
    if (res.error) { setStatus(res.error.message); return; }
    setStatus('Başvuru onaylandı ve çoklu yetki güncellendi.');
    if (userId) await loadAll(userId, userEmail);
  }
  async function adminRejectApplication(app: DkdRoleApplication) {
    const res = await dkd_supabase_client.from('dkd_role_applications').update({ dkd_status: 'rejected', dkd_admin_note: 'Admin tarafından reddedildi.' }).eq('dkd_application_id', app.dkd_application_id);
    if (res.error) { setStatus(res.error.message); return; }
    setStatus('Başvuru reddedildi.');
    if (userId) await loadAll(userId, userEmail);
  }

  const activeRole = dkd_role_meta[primaryRole];
  const canBusiness = dkd_has_role('business');
  const canMaster = dkd_has_role('master');
  const canAdmin = dkd_has_role('admin');

  if (!userEmail) {
    return <SafeAreaProvider><View style={dkd_styles.mockupRoot}><ImageBackground source={require('./src/dkd_assets/login_barber_miami.png')} resizeMode="stretch" style={dkd_styles.mockupImage}><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="" style={[dkd_styles.mockupInput, dkd_styles.mockupEmailInput]} /><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="" style={[dkd_styles.mockupInput, dkd_styles.mockupPasswordInput]} /><TouchableOpacity activeOpacity={0.8} style={[dkd_styles.mockupButton, dkd_styles.mockupLoginButton]} onPress={() => loginOrSignup('login')} disabled={loading} /><TouchableOpacity activeOpacity={0.8} style={[dkd_styles.mockupButton, dkd_styles.mockupSignupButton]} onPress={() => loginOrSignup('signup')} disabled={loading} />{status !== 'Barber Studio panel hazır.' ? <Text style={dkd_styles.mockupStatus}>{status}</Text> : null}</ImageBackground></View></SafeAreaProvider>;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={dkd_styles.safe}>
        <LinearGradient colors={['#71857E', '#465E58', '#2D3B39']} style={dkd_styles.bg}>
          <ScrollView contentContainerStyle={dkd_styles.screen} keyboardShouldPersistTaps="handled">
            <View style={dkd_styles.topBar}><View><Text style={dkd_styles.brand}>DraBornStyle</Text><Text style={dkd_styles.brandSub}>Barber & Booking Studio</Text></View><View style={dkd_styles.onlinePill}><Text style={dkd_styles.onlineText}>{dkd_is_supabase_env_ready ? 'ONLINE' : 'ENV'}</Text></View></View>
            <View style={dkd_styles.heroCard}><View style={dkd_styles.poleRow}><View style={dkd_styles.poleRed} /><View style={dkd_styles.poleCream} /><View style={dkd_styles.poleBlue} /></View><Text style={dkd_styles.heroLabel}>PANEL KATEGORİLERİ</Text><Text style={dkd_styles.heroTitle}>Yetkini seç, ayrı panele gir.</Text><Text style={dkd_styles.heroText}>İşletme, Usta ve Admin ekranları ayrı kategori kartlarıyla açılır. Böylece her şey tek sayfada karışmaz.</Text><View style={dkd_styles.statRow}><DkdStat value={masters.length.toString()} label="Usta" /><DkdStat value={services.length.toString()} label="Hizmet" /><DkdStat value={accessRoles.length.toString()} label="Yetki" /></View></View>
            <View style={dkd_styles.card}><View style={dkd_styles.cardTitleRow}><Text style={dkd_styles.title}>Hesap Merkezi</Text><Text style={dkd_styles.badge}>{activeRole.icon} {activeRole.title}</Text></View><Text style={dkd_styles.accent}>{userEmail}</Text><Text style={dkd_styles.body}>Aktif yetkiler: {accessRoles.map((item) => `${dkd_role_meta[item].icon} ${dkd_role_meta[item].title}`).join('  •  ')}</Text><TouchableOpacity style={dkd_styles.secondaryButton} onPress={logout}><Text style={dkd_styles.secondaryText}>Çıkış Yap</Text></TouchableOpacity></View>

            {activePanel === 'home' ? <PanelCategories canBusiness={canBusiness} canMaster={canMaster} canAdmin={canAdmin} setActivePanel={setActivePanel} /> : <View style={dkd_styles.cardCompact}><View style={dkd_styles.cardTitleRow}><Text style={dkd_styles.sectionHeading}>{dkd_role_meta[activePanel as DkdRole]?.icon} {dkd_role_meta[activePanel as DkdRole]?.title} Paneli</Text><TouchableOpacity style={dkd_styles.backButton} onPress={() => setActivePanel('home')}><Text style={dkd_styles.backButtonText}>← Kategoriler</Text></TouchableOpacity></View></View>}

            {applications.length > 0 ? <View style={dkd_styles.cardCompact}><Text style={dkd_styles.sectionHeading}>Başvuru Durumu</Text>{applications.map((item) => <DkdMiniRow key={item.dkd_application_id} title={`${dkd_role_meta[item.dkd_requested_role].title} • ${item.dkd_status}`} subtitle={item.dkd_applicant_display_name || item.dkd_target_email || 'Başvuru'} />)}</View> : null}

            {activePanel === 'customer' ? <CustomerPanel canBusiness={canBusiness} canMaster={canMaster} businessName={businessName} setBusinessName={setBusinessName} businessPhone={businessPhone} setBusinessPhone={setBusinessPhone} businessAddress={businessAddress} setBusinessAddress={setBusinessAddress} businessApplicationNote={businessApplicationNote} setBusinessApplicationNote={setBusinessApplicationNote} sendBusinessApplication={sendBusinessApplication} masterApplicantName={masterApplicantName} setMasterApplicantName={setMasterApplicantName} masterSpecialty={masterSpecialty} setMasterSpecialty={setMasterSpecialty} masterPhone={masterPhone} setMasterPhone={setMasterPhone} selfMasterNote={selfMasterNote} setSelfMasterNote={setSelfMasterNote} sendSelfMasterApplication={sendSelfMasterApplication} /> : null}
            {activePanel === 'business' && canBusiness ? <BusinessPanel activeSection={activeSection} setActiveSection={setActiveSection} businessId={businessId} masters={masters} services={services} businessName={businessName} setBusinessName={setBusinessName} businessDescription={businessDescription} setBusinessDescription={setBusinessDescription} businessPhone={businessPhone} setBusinessPhone={setBusinessPhone} businessAddress={businessAddress} setBusinessAddress={setBusinessAddress} businessHours={businessHours} setBusinessHours={setBusinessHours} saveBusiness={saveBusiness} masterName={masterName} setMasterName={setMasterName} masterSpecialty={masterSpecialty} setMasterSpecialty={setMasterSpecialty} masterPhone={masterPhone} setMasterPhone={setMasterPhone} saveMaster={saveMaster} serviceTitle={serviceTitle} setServiceTitle={setServiceTitle} servicePrice={servicePrice} setServicePrice={setServicePrice} serviceDuration={serviceDuration} setServiceDuration={setServiceDuration} saveService={saveService} masterApplicantEmail={masterApplicantEmail} setMasterApplicantEmail={setMasterApplicantEmail} masterApplicantName={masterApplicantName} setMasterApplicantName={setMasterApplicantName} sendMasterApplication={sendMasterApplication} /> : null}
            {activePanel === 'master' && canMaster ? <View style={dkd_styles.card}><Text style={dkd_styles.title}>Usta Paneli</Text><Text style={dkd_styles.body}>Usta yetkin aktif. v0.2 içinde takvim, işlem başlatma, işlem bitirme ve performans ekranları buraya eklenecek.</Text><DkdMiniRow title="Takvim" subtitle="v0.2 hazırlığı: günlük randevu listesi" /><DkdMiniRow title="İşlem Akışı" subtitle="v0.2 hazırlığı: işleme başla / işlem bitti" /><DkdMiniRow title="Performans" subtitle="v0.2 hazırlığı: hizmet sayısı ve kazanç özeti" /></View> : null}
            {activePanel === 'admin' && canAdmin ? <AdminPanel adminApplications={adminApplications} adminUsers={adminUsers} adminApproveApplication={adminApproveApplication} adminRejectApplication={adminRejectApplication} adminSetUserRole={adminSetUserRole} /> : null}
            <View style={dkd_styles.footer}><Text style={dkd_styles.body}>{status}</Text></View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function PanelCategories(props: { canBusiness: boolean; canMaster: boolean; canAdmin: boolean; setActivePanel: (panel: DkdPanel) => void }) {
  return <View style={dkd_styles.card}><Text style={dkd_styles.title}>Panel Kategorileri</Text><Text style={dkd_styles.body}>Yetkin olan paneller ayrı kart olarak görünür. Hangi işlemi yapmak istiyorsan o kategoriye gir.</Text><DkdCategoryCard icon="👤" title="Müşteri Paneli" subtitle="Randevu ve başvuru işlemleri" onPress={() => props.setActivePanel('customer')} />{props.canBusiness ? <DkdCategoryCard icon="🏪" title="İşletme Paneli" subtitle="Salon, ekip, hizmet ve fiyat yönetimi" onPress={() => props.setActivePanel('business')} /> : null}{props.canMaster ? <DkdCategoryCard icon="✂️" title="Usta Paneli" subtitle="Takvim, işlem ve performans hazırlığı" onPress={() => props.setActivePanel('master')} /> : null}{props.canAdmin ? <DkdCategoryCard icon="🛡️" title="Admin Paneli" subtitle="Başvuru onayı ve kullanıcı yetkileri" onPress={() => props.setActivePanel('admin')} /> : null}</View>;
}

function DkdCategoryCard(props: { icon: string; title: string; subtitle: string; onPress: () => void }) {
  return <TouchableOpacity style={dkd_styles.categoryCard} onPress={props.onPress} activeOpacity={0.85}><Text style={dkd_styles.categoryIcon}>{props.icon}</Text><View style={dkd_styles.flex}><Text style={dkd_styles.categoryTitle}>{props.title}</Text><Text style={dkd_styles.categorySub}>{props.subtitle}</Text></View><Text style={dkd_styles.categoryArrow}>Gir →</Text></TouchableOpacity>;
}

function CustomerPanel(props: any) {
  return <View style={dkd_styles.card}><Text style={dkd_styles.title}>Müşteri Paneli</Text><Text style={dkd_styles.body}>Müşteri hesabın hazır. İşletme veya usta yetkisi için admin onayına başvuru gönderebilirsin.</Text>{!props.canBusiness ? <><Text style={dkd_styles.sectionHeading}>İşletme Başvurusu</Text><DkdInput label="Salon" value={props.businessName} onChangeText={props.setBusinessName} placeholder="Salon adı" /><DkdInput label="Telefon" value={props.businessPhone} onChangeText={props.setBusinessPhone} placeholder="Telefon" keyboardType="phone-pad" /><DkdInput label="Adres" value={props.businessAddress} onChangeText={props.setBusinessAddress} placeholder="Adres" /><DkdInput label="Not" value={props.businessApplicationNote} onChangeText={props.setBusinessApplicationNote} placeholder="Kısa başvuru notu" /><TouchableOpacity style={dkd_styles.primaryButton} onPress={props.sendBusinessApplication}><Text style={dkd_styles.primaryText}>İşletme Başvurusunu Gönder</Text></TouchableOpacity></> : <DkdMiniRow title="İşletme yetkisi" subtitle="Bu hesapta işletme paneli erişimi aktif." />}{!props.canMaster ? <><Text style={dkd_styles.sectionHeading}>Usta Başvurusu</Text><DkdInput label="Ad Soyad" value={props.masterApplicantName} onChangeText={props.setMasterApplicantName} placeholder="Ad soyad" /><DkdInput label="Uzmanlık" value={props.masterSpecialty} onChangeText={props.setMasterSpecialty} placeholder="Saç, sakal, boya" /><DkdInput label="Telefon" value={props.masterPhone} onChangeText={props.setMasterPhone} placeholder="Telefon" keyboardType="phone-pad" /><DkdInput label="Not" value={props.selfMasterNote} onChangeText={props.setSelfMasterNote} placeholder="Kısa başvuru notu" /><TouchableOpacity style={dkd_styles.primaryButton} onPress={props.sendSelfMasterApplication}><Text style={dkd_styles.primaryText}>Usta Başvurusunu Gönder</Text></TouchableOpacity></> : <DkdMiniRow title="Usta yetkisi" subtitle="Bu hesapta usta paneli erişimi aktif." />}</View>;
}

function BusinessPanel(props: any) {
  return <View style={dkd_styles.card}><Text style={dkd_styles.title}>İşletme Paneli</Text><Text style={dkd_styles.body}>İşletme yetkin aktif. Salon bilgisi, usta listesi, hizmet fiyatı ve süre yönetimi burada.</Text>{dkd_sections.map((section) => <View key={section.key}><DkdSectionButton section={section} active={props.activeSection === section.key} onPress={() => props.setActiveSection(props.activeSection === section.key ? null : section.key)} count={section.key === 'team' ? props.masters.length : section.key === 'services' ? props.services.length : section.key === 'business' ? props.businessId ? 1 : 0 : 0} />{props.activeSection === section.key ? <View style={dkd_styles.detailBox}>{section.key === 'business' ? <><DkdInput label="Salon" value={props.businessName} onChangeText={props.setBusinessName} placeholder="Salon adı" /><DkdInput label="Açıklama" value={props.businessDescription} onChangeText={props.setBusinessDescription} placeholder="Kısa açıklama" /><DkdInput label="Telefon" value={props.businessPhone} onChangeText={props.setBusinessPhone} placeholder="Telefon" keyboardType="phone-pad" /><DkdInput label="Adres" value={props.businessAddress} onChangeText={props.setBusinessAddress} placeholder="Adres" /><DkdInput label="Saat" value={props.businessHours} onChangeText={props.setBusinessHours} placeholder="Çalışma saatleri" /><TouchableOpacity style={dkd_styles.primaryButton} onPress={props.saveBusiness}><Text style={dkd_styles.primaryText}>Salon Bilgilerini Kaydet</Text></TouchableOpacity></> : null}{section.key === 'team' ? <><DkdInput label="Usta" value={props.masterName} onChangeText={props.setMasterName} placeholder="Ad soyad" /><DkdInput label="Uzmanlık" value={props.masterSpecialty} onChangeText={props.setMasterSpecialty} placeholder="Saç, sakal, boya" /><DkdInput label="Telefon" value={props.masterPhone} onChangeText={props.setMasterPhone} placeholder="Telefon" keyboardType="phone-pad" /><TouchableOpacity style={dkd_styles.primaryButton} onPress={props.saveMaster}><Text style={dkd_styles.primaryText}>Usta Listeye Ekle</Text></TouchableOpacity>{props.masters.map((item: DkdMaster) => <DkdMiniRow key={item.dkd_master_id} title={item.dkd_master_name} subtitle={item.dkd_master_specialty || 'Uzmanlık eklenmedi'} />)}</> : null}{section.key === 'services' ? <><DkdInput label="Hizmet" value={props.serviceTitle} onChangeText={props.setServiceTitle} placeholder="Saç kesim" /><DkdInput label="Fiyat" value={props.servicePrice} onChangeText={props.setServicePrice} placeholder="250" keyboardType="numeric" /><DkdInput label="Süre" value={props.serviceDuration} onChangeText={props.setServiceDuration} placeholder="30" keyboardType="numeric" /><TouchableOpacity style={dkd_styles.primaryButton} onPress={props.saveService}><Text style={dkd_styles.primaryText}>Hizmet Ekle</Text></TouchableOpacity>{props.services.map((item: DkdService) => <DkdMiniRow key={item.dkd_service_id} title={item.dkd_service_title} subtitle={`${dkd_price(item.dkd_price_cents)} • ${item.dkd_duration_minutes} dk`} />)}</> : null}{section.key === 'master_request' ? <><DkdInput label="E-posta" value={props.masterApplicantEmail} onChangeText={props.setMasterApplicantEmail} placeholder="Usta olacak kayıtlı kullanıcı e-postası" /><DkdInput label="Ad Soyad" value={props.masterApplicantName} onChangeText={props.setMasterApplicantName} placeholder="Usta adı soyadı" /><DkdInput label="Uzmanlık" value={props.masterSpecialty} onChangeText={props.setMasterSpecialty} placeholder="Saç, sakal, boya" /><DkdInput label="Telefon" value={props.masterPhone} onChangeText={props.setMasterPhone} placeholder="Telefon" keyboardType="phone-pad" /><TouchableOpacity style={dkd_styles.primaryButton} onPress={props.sendMasterApplication}><Text style={dkd_styles.primaryText}>Usta Yetkisini Admin Onayına Gönder</Text></TouchableOpacity></> : null}</View> : null}</View>)}</View>;
}

function AdminPanel(props: any) {
  return <View style={dkd_styles.card}><Text style={dkd_styles.title}>Admin Paneli</Text><Text style={dkd_styles.body}>Kayıtlı kullanıcıları işletme sahibi veya usta olarak işaretle; başvuruları onayla/reddet.</Text><Text style={dkd_styles.sectionHeading}>Başvurular</Text>{props.adminApplications.length === 0 ? <DkdMiniRow title="Başvuru yok" subtitle="Yeni başvurular burada listelenecek." /> : null}{props.adminApplications.map((app: DkdRoleApplication) => <View key={app.dkd_application_id} style={dkd_styles.adminBox}><Text style={dkd_styles.miniTitle}>{dkd_role_meta[app.dkd_requested_role].icon} {dkd_role_meta[app.dkd_requested_role].title} • {app.dkd_status}</Text><Text style={dkd_styles.miniSub}>{app.dkd_applicant_display_name || app.dkd_target_email || 'Başvuru'}</Text><View style={dkd_styles.actionRow}><TouchableOpacity style={dkd_styles.smallButton} onPress={() => props.adminApproveApplication(app)}><Text style={dkd_styles.smallButtonText}>Onayla</Text></TouchableOpacity><TouchableOpacity style={dkd_styles.smallButtonGhost} onPress={() => props.adminRejectApplication(app)}><Text style={dkd_styles.smallButtonGhostText}>Reddet</Text></TouchableOpacity></View></View>)}<Text style={dkd_styles.sectionHeading}>Kayıtlı Kullanıcılar</Text>{props.adminUsers.map((item: DkdUserProfile) => <View key={item.dkd_user_id} style={dkd_styles.adminBox}><Text style={dkd_styles.miniTitle}>{item.dkd_display_name || item.dkd_user_id}</Text><Text style={dkd_styles.miniSub}>Rol kaynağı: dkd_user_role_access</Text><View style={dkd_styles.actionRow}><TouchableOpacity style={dkd_styles.smallButton} onPress={() => props.adminSetUserRole(item.dkd_user_id, 'business')}><Text style={dkd_styles.smallButtonText}>İşletme Yetkisi Ver</Text></TouchableOpacity><TouchableOpacity style={dkd_styles.smallButton} onPress={() => props.adminSetUserRole(item.dkd_user_id, 'master')}><Text style={dkd_styles.smallButtonText}>Usta Yetkisi Ver</Text></TouchableOpacity><TouchableOpacity style={dkd_styles.smallButtonGhost} onPress={() => props.adminSetUserRole(item.dkd_user_id, 'admin')}><Text style={dkd_styles.smallButtonGhostText}>Admin Yetkisi Ver</Text></TouchableOpacity></View></View>)}</View>;
}

function DkdStat(props: { value: string; label: string }) { return <View style={dkd_styles.statBox}><Text style={dkd_styles.statValue}>{props.value}</Text><Text style={dkd_styles.statLabel}>{props.label}</Text></View>; }
function DkdInput(props: any) { const { label, ...inputProps } = props; return <View style={dkd_styles.inputWrap}><Text style={dkd_styles.inputLabel}>{label}</Text><TextInput {...inputProps} placeholderTextColor="#7B8B87" style={dkd_styles.input} /></View>; }
function DkdSectionButton(props: { section: { key: DkdSection; title: string; caption: string; code: string }; active: boolean; count: number; onPress: () => void }) { return <TouchableOpacity style={props.active ? dkd_styles.sectionActive : dkd_styles.section} onPress={props.onPress}><Text style={dkd_styles.sectionCode}>{props.section.code}</Text><View style={dkd_styles.flex}><Text style={dkd_styles.sectionTitle}>{props.section.title}</Text><Text style={dkd_styles.sectionText}>{props.section.caption} • {props.count}</Text></View><Text style={dkd_styles.chevron}>{props.active ? '—' : '+'}</Text></TouchableOpacity>; }
function DkdMiniRow(props: { title: string; subtitle: string }) { return <View style={dkd_styles.miniRow}><Text style={dkd_styles.miniTitle}>{props.title}</Text><Text style={dkd_styles.miniSub}>{props.subtitle}</Text></View>; }

const dkd_styles = StyleSheet.create({
  mockupRoot: { flex: 1, backgroundColor: '#0A0E19' },
  mockupImage: { flex: 1, width: '100%', height: '100%' },
  mockupInput: { position: 'absolute', left: '27%', width: '55%', height: '6.4%', backgroundColor: 'rgba(0,0,0,0.01)', color: '#FFFFFF', fontSize: 18, lineHeight: 22, fontWeight: '800', paddingHorizontal: 8, paddingTop: 8, paddingBottom: 0, textAlignVertical: 'center' },
  mockupEmailInput: { top: '48.8%' },
  mockupPasswordInput: { top: '58.6%' },
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
  categoryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 20, backgroundColor: '#243835', borderWidth: 1, borderColor: '#5F786F', marginTop: 12 },
  categoryIcon: { fontSize: 28, width: 36, textAlign: 'center' },
  categoryTitle: { color: '#FFF2DD', fontSize: 17, fontWeight: '900' },
  categorySub: { color: '#DDEBE4', fontSize: 13, lineHeight: 18, marginTop: 3 },
  categoryArrow: { color: '#F0C766', fontSize: 13, fontWeight: '900' },
  backButton: { backgroundColor: '#F0C766', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8 },
  backButtonText: { color: '#243835', fontSize: 12, fontWeight: '900' },
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
