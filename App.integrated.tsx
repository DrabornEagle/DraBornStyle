import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { dkd_is_supabase_env_ready, dkd_supabase_client } from './src/dkd_config/dkd_supabase_client';
import { DkdAdminPaymentPanel, DkdTransactionPanel, useDkdTransactions } from './src/dkd_v0_2';

type Panel = 'customer' | 'business' | 'admin';
type ServiceItem = { dkd_service_id: string; dkd_service_title: string; dkd_price_cents: number; dkd_duration_minutes?: number };
type MasterItem = { dkd_master_id: string; dkd_master_name: string; dkd_master_specialty?: string | null };

function slug(value: string) {
  return value.toLowerCase().trim().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 44);
}

function cents(value: string) {
  const parsed = Number(value.replace(',', '.').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : 0;
}

function price(value: number) {
  return `${Math.round(Number(value || 0) / 100)} TL`;
}

export default function DraBornStyleIntegratedApp() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [userId, setUserId] = React.useState<string | null>(null);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [panel, setPanel] = React.useState<Panel>('customer');
  const [status, setStatus] = React.useState('DraBornStyle birleşik v0.2 hazır.');

  const [businessId, setBusinessId] = React.useState<string | null>(null);
  const [businessName, setBusinessName] = React.useState('');
  const [businessPhone, setBusinessPhone] = React.useState('');
  const [businessAddress, setBusinessAddress] = React.useState('');
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [masters, setMasters] = React.useState<MasterItem[]>([]);

  const [serviceTitle, setServiceTitle] = React.useState('');
  const [servicePrice, setServicePrice] = React.useState('');
  const [serviceDuration, setServiceDuration] = React.useState('30');
  const [masterName, setMasterName] = React.useState('');
  const [masterSpecialty, setMasterSpecialty] = React.useState('');

  const tx = useDkdTransactions(businessId, services, setStatus);

  React.useEffect(() => {
    dkd_supabase_client.auth.getSession().then((result: any) => {
      const user = result.data.session?.user ?? null;
      setUserId(user?.id ?? null);
      setUserEmail(user?.email ?? null);
      if (user?.id) loadBusinessData(user.id).catch((error) => setStatus(error.message));
    });
  }, []);

  async function loginOrSignup(mode: 'login' | 'signup') {
    if (!dkd_is_supabase_env_ready) {
      setStatus('Supabase ENV eksik. .env içine URL ve publishable key girilmeli.');
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || password.length < 6) {
      setStatus('E-posta ve en az 6 karakter şifre gir.');
      return;
    }
    const result = mode === 'login'
      ? await dkd_supabase_client.auth.signInWithPassword({ email: cleanEmail, password })
      : await dkd_supabase_client.auth.signUp({ email: cleanEmail, password });
    if (result.error) {
      setStatus(result.error.message);
      return;
    }
    const user = result.data.user ?? result.data.session?.user ?? null;
    setUserId(user?.id ?? null);
    setUserEmail(user?.email ?? cleanEmail);
    if (user?.id) await loadBusinessData(user.id);
    setStatus('Giriş başarılı. v0.1 paneller ve v0.2 işlem ekranı birlikte açıldı.');
  }

  async function logout() {
    await dkd_supabase_client.auth.signOut();
    setUserId(null);
    setUserEmail(null);
    setStatus('Çıkış yapıldı.');
  }

  async function loadBusinessData(nextUserId: string) {
    const businessResult = await dkd_supabase_client
      .from('dkd_business_profiles')
      .select('dkd_business_id, dkd_business_name, dkd_business_phone, dkd_address_text')
      .eq('dkd_owner_user_id', nextUserId)
      .order('dkd_created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const business = businessResult.data;
    const nextBusinessId = business?.dkd_business_id ?? null;
    setBusinessId(nextBusinessId);
    setBusinessName(business?.dkd_business_name ?? '');
    setBusinessPhone(business?.dkd_business_phone ?? '');
    setBusinessAddress(business?.dkd_address_text ?? '');

    if (!nextBusinessId) return;

    const serviceResult = await dkd_supabase_client
      .from('dkd_services')
      .select('dkd_service_id, dkd_service_title, dkd_price_cents, dkd_duration_minutes')
      .eq('dkd_business_id', nextBusinessId)
      .eq('dkd_is_active', true)
      .order('dkd_created_at', { ascending: false });

    const masterResult = await dkd_supabase_client
      .from('dkd_master_profiles')
      .select('dkd_master_id, dkd_master_name, dkd_master_specialty')
      .eq('dkd_business_id', nextBusinessId)
      .eq('dkd_is_active', true)
      .order('dkd_created_at', { ascending: false });

    setServices((serviceResult.data ?? []) as ServiceItem[]);
    setMasters((masterResult.data ?? []) as MasterItem[]);
  }

  async function saveBusiness() {
    if (!userId) return;
    if (businessName.trim().length < 2) {
      setStatus('Salon adını yaz.');
      return;
    }
    const payload = {
      dkd_owner_user_id: userId,
      dkd_business_name: businessName.trim(),
      dkd_business_slug: `${slug(businessName)}-${userId.slice(0, 6)}`,
      dkd_business_phone: businessPhone.trim(),
      dkd_address_text: businessAddress.trim(),
      dkd_is_active: true
    };
    const result = businessId
      ? await dkd_supabase_client.from('dkd_business_profiles').update(payload).eq('dkd_business_id', businessId).select('dkd_business_id').single()
      : await dkd_supabase_client.from('dkd_business_profiles').insert(payload).select('dkd_business_id').single();
    if (result.error) {
      setStatus(result.error.message);
      return;
    }
    setBusinessId(result.data.dkd_business_id);
    setStatus('Salon bilgileri kaydedildi.');
    await loadBusinessData(userId);
  }

  async function addService() {
    if (!businessId) {
      setStatus('Önce salonu kaydet.');
      return;
    }
    const nextPrice = cents(servicePrice);
    const duration = Number.parseInt(serviceDuration, 10) || 30;
    if (!serviceTitle.trim() || nextPrice <= 0) {
      setStatus('Hizmet adı ve fiyat gir.');
      return;
    }
    const result = await dkd_supabase_client.from('dkd_services').insert({
      dkd_business_id: businessId,
      dkd_service_title: serviceTitle.trim(),
      dkd_price_cents: nextPrice,
      dkd_duration_minutes: duration,
      dkd_is_active: true
    });
    if (result.error) {
      setStatus(result.error.message);
      return;
    }
    setServiceTitle('');
    setServicePrice('');
    await loadBusinessData(userId!);
    setStatus('Hizmet eklendi.');
  }

  async function addMaster() {
    if (!businessId) {
      setStatus('Önce salonu kaydet.');
      return;
    }
    if (masterName.trim().length < 2) {
      setStatus('Usta adını yaz.');
      return;
    }
    const result = await dkd_supabase_client.from('dkd_master_profiles').insert({
      dkd_business_id: businessId,
      dkd_master_name: masterName.trim(),
      dkd_master_specialty: masterSpecialty.trim(),
      dkd_is_active: true
    });
    if (result.error) {
      setStatus(result.error.message);
      return;
    }
    setMasterName('');
    setMasterSpecialty('');
    await loadBusinessData(userId!);
    setStatus('Usta eklendi.');
  }

  if (!userEmail) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.screen}>
            <View style={styles.hero}>
              <Text style={styles.brand}>DraBornStyle</Text>
              <Text style={styles.sub}>v0.1 Login + v0.2 İşlem/Ödeme birleşik ekran</Text>
            </View>
            <Input label="E-posta" value={email} onChangeText={setEmail} />
            <Input label="Şifre" value={password} onChangeText={setPassword} secureTextEntry />
            <TouchableOpacity style={styles.button} onPress={() => loginOrSignup('login')}><Text style={styles.buttonText}>Giriş Yap</Text></TouchableOpacity>
            <TouchableOpacity style={styles.ghostButton} onPress={() => loginOrSignup('signup')}><Text style={styles.ghostText}>Kayıt Ol</Text></TouchableOpacity>
            <Text style={styles.status}>{status}</Text>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.screen}>
          <View style={styles.hero}>
            <Text style={styles.brand}>DraBornStyle</Text>
            <Text style={styles.sub}>v0.1 paneller + v0.2 işlem ve ödeme sistemi</Text>
            <Text style={styles.user}>{userEmail}</Text>
          </View>

          <View style={styles.navRow}>
            <Nav title="Müşteri" active={panel === 'customer'} onPress={() => setPanel('customer')} />
            <Nav title="İşletme" active={panel === 'business'} onPress={() => setPanel('business')} />
            <Nav title="Admin" active={panel === 'admin'} onPress={() => setPanel('admin')} />
          </View>

          {panel === 'customer' ? <CustomerPanel /> : null}

          {panel === 'business' ? (
            <View>
              <Card title="Salon Bilgileri">
                <Input label="Salon adı" value={businessName} onChangeText={setBusinessName} />
                <Input label="Telefon" value={businessPhone} onChangeText={setBusinessPhone} />
                <Input label="Adres" value={businessAddress} onChangeText={setBusinessAddress} />
                <TouchableOpacity style={styles.button} onPress={saveBusiness}><Text style={styles.buttonText}>Salon Bilgilerini Kaydet</Text></TouchableOpacity>
              </Card>

              <Card title="Ustalar">
                <Input label="Usta adı" value={masterName} onChangeText={setMasterName} />
                <Input label="Uzmanlık" value={masterSpecialty} onChangeText={setMasterSpecialty} />
                <TouchableOpacity style={styles.button} onPress={addMaster}><Text style={styles.buttonText}>Usta Ekle</Text></TouchableOpacity>
                {masters.map((item) => <Mini key={item.dkd_master_id} title={item.dkd_master_name} sub={item.dkd_master_specialty || 'Uzmanlık eklenmedi'} />)}
              </Card>

              <Card title="Hizmetler">
                <Input label="Hizmet adı" value={serviceTitle} onChangeText={setServiceTitle} />
                <Input label="Fiyat" value={servicePrice} onChangeText={setServicePrice} keyboardType="numeric" />
                <Input label="Süre" value={serviceDuration} onChangeText={setServiceDuration} keyboardType="numeric" />
                <TouchableOpacity style={styles.button} onPress={addService}><Text style={styles.buttonText}>Hizmet Ekle</Text></TouchableOpacity>
                {services.map((item) => <Mini key={item.dkd_service_id} title={item.dkd_service_title} sub={`${price(item.dkd_price_cents)} • ${item.dkd_duration_minutes ?? 30} dk`} />)}
              </Card>

              <DkdTransactionPanel services={services} masters={masters} transactions={tx.records} debtTotal={tx.debtTotal} revenueTotal={tx.revenueTotal} onStart={tx.startTransaction} onFinish={tx.finishTransaction} />
            </View>
          ) : null}

          {panel === 'admin' ? <DkdAdminPaymentPanel adminUserId={userId} onStatus={setStatus} /> : null}

          <TouchableOpacity style={styles.ghostButton} onPress={logout}><Text style={styles.ghostText}>Çıkış Yap</Text></TouchableOpacity>
          <Text style={styles.status}>{status}</Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function CustomerPanel() {
  return (
    <Card title="Müşteri Paneli">
      <Text style={styles.body}>v0.1 müşteri alanı aktif. Randevu geçmişi, favori işletme ve boşluk talebi v0.2 devamında bağlanacak.</Text>
      <Mini title="Randevu" sub="İşletme, usta, hizmet ve saat seçimi için hazır alan." />
      <Mini title="Favoriler" sub="Favori salon ve favori usta sistemi v0.2 listesinde." />
    </Card>
  );
}

function Card(props: { title: string; children: React.ReactNode }) {
  return <View style={styles.card}><Text style={styles.title}>{props.title}</Text>{props.children}</View>;
}

function Mini(props: { title: string; sub: string }) {
  return <View style={styles.mini}><Text style={styles.miniTitle}>{props.title}</Text><Text style={styles.miniSub}>{props.sub}</Text></View>;
}

function Nav(props: { title: string; active: boolean; onPress: () => void }) {
  return <TouchableOpacity style={props.active ? styles.navActive : styles.nav} onPress={props.onPress}><Text style={props.active ? styles.navActiveText : styles.navText}>{props.title}</Text></TouchableOpacity>;
}

function Input(props: any) {
  const { label, ...rest } = props;
  return <View style={styles.inputWrap}><Text style={styles.inputLabel}>{label}</Text><TextInput {...rest} placeholderTextColor="#7B8B87" style={styles.input} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#2D3B39' },
  screen: { padding: 18, paddingBottom: 44 },
  hero: { backgroundColor: '#304944', borderRadius: 26, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: '#82978E' },
  brand: { color: '#FFF2DD', fontSize: 32, fontWeight: '900' },
  sub: { color: '#DDEBE4', fontSize: 15, lineHeight: 22, marginTop: 6, fontWeight: '700' },
  user: { color: '#F0C766', fontSize: 14, marginTop: 8, fontWeight: '900' },
  navRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  nav: { flex: 1, backgroundColor: '#243835', borderRadius: 15, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#5F786F' },
  navActive: { flex: 1, backgroundColor: '#F0C766', borderRadius: 15, padding: 12, alignItems: 'center' },
  navText: { color: '#FFF2DD', fontWeight: '900' },
  navActiveText: { color: '#243835', fontWeight: '900' },
  card: { backgroundColor: '#304944', borderRadius: 24, padding: 17, marginBottom: 13, borderWidth: 1, borderColor: '#82978E' },
  title: { color: '#FFF2DD', fontSize: 22, fontWeight: '900', marginBottom: 8 },
  body: { color: '#DDEBE4', fontSize: 15, lineHeight: 22 },
  inputWrap: { backgroundColor: '#243835', borderRadius: 16, borderWidth: 1, borderColor: '#5F786F', padding: 10, marginTop: 10 },
  inputLabel: { color: '#F0C766', fontSize: 12, fontWeight: '900', marginBottom: 5 },
  input: { color: '#FFF2DD', fontSize: 15, fontWeight: '800', paddingVertical: 4 },
  button: { backgroundColor: '#F0C766', borderRadius: 16, padding: 14, marginTop: 12, alignItems: 'center' },
  buttonText: { color: '#243835', fontSize: 15, fontWeight: '900' },
  ghostButton: { backgroundColor: '#243835', borderRadius: 16, padding: 14, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#82978E' },
  ghostText: { color: '#FFF2DD', fontSize: 15, fontWeight: '900' },
  mini: { backgroundColor: '#243835', borderRadius: 16, padding: 12, marginTop: 9, borderWidth: 1, borderColor: '#5F786F' },
  miniTitle: { color: '#FFF2DD', fontSize: 15, fontWeight: '900' },
  miniSub: { color: '#DDEBE4', fontSize: 13, lineHeight: 18, marginTop: 3 },
  status: { color: '#FFF2DD', fontSize: 14, fontWeight: '800', marginTop: 8, backgroundColor: '#243835', padding: 12, borderRadius: 14 }
});
