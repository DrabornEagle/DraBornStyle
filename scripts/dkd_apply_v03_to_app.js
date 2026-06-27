const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'App.tsx');
let src = fs.readFileSync(appPath, 'utf8');
let changed = false;

const V03_HOOK = '  const dkd_v03_appts = useDkdAppointments(userId, businessId, accessRoles, setStatus);';

function markChanged(nextSrc) {
  if (nextSrc !== src) {
    src = nextSrc;
    changed = true;
  }
}

function replaceOnce(search, replace) {
  if (src.includes(search)) {
    src = src.replace(search, replace);
    changed = true;
    return true;
  }
  return false;
}

function replaceIfMissing(marker, search, replace) {
  if (!src.includes(marker) && src.includes(search)) {
    src = src.replace(search, replace);
    changed = true;
    return true;
  }
  return false;
}

function cleanupDuplicateHook() {
  const lines = src.split('\n');
  let seen = false;
  const cleaned = lines.filter((line) => {
    if (line.trim() !== V03_HOOK.trim()) return true;
    if (seen) return false;
    seen = true;
    return true;
  }).join('\n');
  markChanged(cleaned);
}

function replaceAssetLoginWithNativeLogin() {
  replaceOnce(
    "import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';",
    "import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';"
  );

  const nativeLogin = `  if (!userEmail) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={dkd_styles.safe}>
          <LinearGradient colors={['#111C1B', '#304944', '#71857E']} style={dkd_styles.bg}>
            <ScrollView contentContainerStyle={dkd_styles.screen} keyboardShouldPersistTaps="handled">
              <View style={dkd_styles.heroCard}>
                <View style={dkd_styles.poleRow}><View style={dkd_styles.poleRed} /><View style={dkd_styles.poleCream} /><View style={dkd_styles.poleBlue} /></View>
                <Text style={dkd_styles.heroLabel}>DRABORNSTYLE</Text>
                <Text style={dkd_styles.heroTitle}>Barber Studio OS</Text>
                <Text style={dkd_styles.heroText}>Randevu, usta takvimi, müşteri akışı ve salon yönetimi tek panelde.</Text>
              </View>
              <View style={dkd_styles.card}>
                <Text style={dkd_styles.title}>Giriş Yap</Text>
                <Text style={dkd_styles.body}>Tek hesapla müşteri, işletme, usta ve admin panellerine giriş yap.</Text>
                <DkdInput label="E-posta" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="ornek@mail.com" />
                <DkdInput label="Şifre" value={password} onChangeText={setPassword} secureTextEntry placeholder="En az 6 karakter" />
                <TouchableOpacity style={dkd_styles.primaryButton} onPress={() => loginOrSignup('login')} disabled={loading}><Text style={dkd_styles.primaryText}>{loading ? 'Kontrol ediliyor...' : 'Giriş Yap'}</Text></TouchableOpacity>
                <TouchableOpacity style={dkd_styles.secondaryButton} onPress={() => loginOrSignup('signup')} disabled={loading}><Text style={dkd_styles.secondaryText}>Yeni Hesap Oluştur</Text></TouchableOpacity>
                {status !== 'Barber Studio panel hazır.' ? <Text style={dkd_styles.body}>{status}</Text> : null}
              </View>
            </ScrollView>
          </LinearGradient>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }`;

  const loginRegex = /  if \(!userEmail\) \{\n    return <SafeAreaProvider><View style=\{dkd_styles\.mockupRoot\}>[\s\S]*?<\/SafeAreaProvider>;\n  \}/;
  markChanged(src.replace(loginRegex, nativeLogin));
}

replaceAssetLoginWithNativeLogin();

if (!src.includes("./src/dkd_v0_3")) {
  replaceOnce(
    "import { dkd_is_supabase_env_ready, dkd_supabase_client } from './src/dkd_config/dkd_supabase_client';",
    "import { dkd_is_supabase_env_ready, dkd_supabase_client } from './src/dkd_config/dkd_supabase_client';\nimport { DkdBusinessAppointmentPanel, DkdCustomerBookingPanel, DkdMasterAppointmentPanel, useDkdAppointments } from './src/dkd_v0_3';"
  );
}

replaceOnce(
  "type DkdSection = 'business' | 'team' | 'services' | 'transactions' | 'master_request';",
  "type DkdSection = 'business' | 'team' | 'services' | 'appointments' | 'transactions' | 'master_request';"
);
replaceOnce(
  "type DkdSection = 'business' | 'team' | 'services' | 'master_request';",
  "type DkdSection = 'business' | 'team' | 'services' | 'appointments' | 'master_request';"
);

replaceOnce(
  "  { key: 'services', title: 'Hizmetler / Fiyatlar', caption: 'Fiyat ve süre yönetimi', code: '03' },\n  { key: 'transactions', title: 'İşlem & Ödeme', caption: 'İşleme başla, son fiyat gir, platform borcunu takip et', code: '04' },\n  { key: 'master_request', title: 'Usta Yetki Başvurusu', caption: 'Kayıtlı kullanıcıyı usta yapmak için admin onayı iste', code: '05' }",
  "  { key: 'services', title: 'Hizmetler / Fiyatlar', caption: 'Fiyat ve süre yönetimi', code: '03' },\n  { key: 'appointments', title: 'Randevu & Takvim', caption: 'Müşteri randevuları, usta takvimi ve geliş akışı', code: '04' },\n  { key: 'transactions', title: 'İşlem & Ödeme', caption: 'İşleme başla, son fiyat gir, platform borcunu takip et', code: '05' },\n  { key: 'master_request', title: 'Usta Yetki Başvurusu', caption: 'Kayıtlı kullanıcıyı usta yapmak için admin onayı iste', code: '06' }"
);
replaceOnce(
  "  { key: 'services', title: 'Hizmetler / Fiyatlar', caption: 'Fiyat ve süre yönetimi', code: '03' },\n  { key: 'master_request', title: 'Usta Yetki Başvurusu', caption: 'Kayıtlı kullanıcıyı usta yapmak için admin onayı iste', code: '04' }",
  "  { key: 'services', title: 'Hizmetler / Fiyatlar', caption: 'Fiyat ve süre yönetimi', code: '03' },\n  { key: 'appointments', title: 'Randevu & Takvim', caption: 'Müşteri randevuları, usta takvimi ve geliş akışı', code: '04' },\n  { key: 'master_request', title: 'Usta Yetki Başvurusu', caption: 'Kayıtlı kullanıcıyı usta yapmak için admin onayı iste', code: '05' }"
);

cleanupDuplicateHook();
if (!src.includes(V03_HOOK)) {
  const insertedAfterV02 = replaceOnce(
    "  const dkd_v02_tx = useDkdTransactions(businessId, services, setStatus);",
    "  const dkd_v02_tx = useDkdTransactions(businessId, services, setStatus);\n" + V03_HOOK
  );
  if (!insertedAfterV02) {
    replaceOnce(
      "  const [serviceDuration, setServiceDuration] = React.useState('30');",
      "  const [serviceDuration, setServiceDuration] = React.useState('30');\n\n" + V03_HOOK
    );
  }
}
cleanupDuplicateHook();

if (!src.includes('v03Appts={dkd_v03_appts}')) {
  replaceOnce(
    "sendSelfMasterApplication={sendSelfMasterApplication} /> : null}",
    "sendSelfMasterApplication={sendSelfMasterApplication} v03Appts={dkd_v03_appts} /> : null}"
  );
  replaceOnce(
    "sendMasterApplication={sendMasterApplication} v02Tx={dkd_v02_tx} /> : null}",
    "sendMasterApplication={sendMasterApplication} v02Tx={dkd_v02_tx} v03Appts={dkd_v03_appts} /> : null}"
  );
  replaceOnce(
    "sendMasterApplication={sendMasterApplication} /> : null}",
    "sendMasterApplication={sendMasterApplication} v03Appts={dkd_v03_appts} /> : null}"
  );
}

replaceOnce(
  "subtitle=\"Salon, ekip, hizmet, işlem ve ödeme yönetimi\"",
  "subtitle=\"Salon, ekip, hizmet, randevu, işlem ve ödeme yönetimi\""
);
replaceOnce(
  "subtitle=\"Takvim, işlem ve performans hazırlığı\"",
  "subtitle=\"Randevu takvimi, müşteri akışı ve işlem yönetimi\""
);

replaceOnce(
  "count={section.key === 'team' ? props.masters.length : section.key === 'services' ? props.services.length : section.key === 'transactions' ? props.v02Tx.records.length : section.key === 'business' ? props.businessId ? 1 : 0 : 0}",
  "count={section.key === 'team' ? props.masters.length : section.key === 'services' ? props.services.length : section.key === 'appointments' ? props.v03Appts.businessAppointments.length : section.key === 'transactions' ? props.v02Tx.records.length : section.key === 'business' ? props.businessId ? 1 : 0 : 0}"
);
replaceOnce(
  "count={section.key === 'team' ? props.masters.length : section.key === 'services' ? props.services.length : section.key === 'business' ? props.businessId ? 1 : 0 : 0}",
  "count={section.key === 'team' ? props.masters.length : section.key === 'services' ? props.services.length : section.key === 'appointments' ? props.v03Appts.businessAppointments.length : section.key === 'business' ? props.businessId ? 1 : 0 : 0}"
);

if (!src.includes("section.key === 'appointments' ? <DkdBusinessAppointmentPanel")) {
  const insertedBeforeTransactions = replaceOnce(
    "{section.key === 'transactions' ? <DkdTransactionPanel services={props.services} masters={props.masters} transactions={props.v02Tx.records} debtTotal={props.v02Tx.debtTotal} revenueTotal={props.v02Tx.revenueTotal} onStart={props.v02Tx.startTransaction} onFinish={props.v02Tx.finishTransaction} /> : null}{section.key === 'master_request' ? <>",
    "{section.key === 'appointments' ? <DkdBusinessAppointmentPanel appointments={props.v03Appts.businessAppointments} services={props.services} masters={props.masters} refresh={props.v03Appts.refreshAll} setAppointmentStatus={props.v03Appts.setAppointmentStatus} /> : null}{section.key === 'transactions' ? <DkdTransactionPanel services={props.services} masters={props.masters} transactions={props.v02Tx.records} debtTotal={props.v02Tx.debtTotal} revenueTotal={props.v02Tx.revenueTotal} onStart={props.v02Tx.startTransaction} onFinish={props.v02Tx.finishTransaction} /> : null}{section.key === 'master_request' ? <>"
  );
  if (!insertedBeforeTransactions && !src.includes("section.key === 'appointments' ? <DkdBusinessAppointmentPanel")) {
    replaceOnce(
      "{section.key === 'master_request' ? <>",
      "{section.key === 'appointments' ? <DkdBusinessAppointmentPanel appointments={props.v03Appts.businessAppointments} services={props.services} masters={props.masters} refresh={props.v03Appts.refreshAll} setAppointmentStatus={props.v03Appts.setAppointmentStatus} /> : null}{section.key === 'master_request' ? <>"
    );
  }
}

replaceIfMissing(
  '<DkdCustomerBookingPanel appointments={props.v03Appts.customerAppointments}',
  "<Text style={dkd_styles.body}>Müşteri hesabın hazır. İşletme veya usta yetkisi için admin onayına başvuru gönderebilirsin.</Text>",
  "<Text style={dkd_styles.body}>Müşteri hesabın hazır. İşletme veya usta yetkisi için admin onayına başvuru gönderebilirsin.</Text><DkdCustomerBookingPanel appointments={props.v03Appts.customerAppointments} businesses={props.v03Appts.businesses} masters={props.v03Appts.customerMasters} services={props.v03Appts.customerServices} selectedBusinessId={props.v03Appts.selectedBusinessId} setSelectedBusinessId={props.v03Appts.setSelectedBusinessId} selectedMasterId={props.v03Appts.selectedMasterId} setSelectedMasterId={props.v03Appts.setSelectedMasterId} selectedServiceId={props.v03Appts.selectedServiceId} setSelectedServiceId={props.v03Appts.setSelectedServiceId} appointmentDate={props.v03Appts.appointmentDate} setAppointmentDate={props.v03Appts.setAppointmentDate} appointmentTime={props.v03Appts.appointmentTime} setAppointmentTime={props.v03Appts.setAppointmentTime} customerName={props.v03Appts.customerName} setCustomerName={props.v03Appts.setCustomerName} customerPhone={props.v03Appts.customerPhone} setCustomerPhone={props.v03Appts.setCustomerPhone} customerNote={props.v03Appts.customerNote} setCustomerNote={props.v03Appts.setCustomerNote} createAppointment={props.v03Appts.createAppointment} setAppointmentStatus={props.v03Appts.setAppointmentStatus} />"
);

replaceOnce(
  "{activePanel === 'master' && canMaster ? <View style={dkd_styles.card}><Text style={dkd_styles.title}>Usta Paneli</Text><Text style={dkd_styles.body}>Usta yetkin aktif. v0.2 içinde takvim, işlem başlatma, işlem bitirme ve performans ekranları buraya eklenecek.</Text><DkdMiniRow title=\"Takvim\" subtitle=\"v0.2 hazırlığı: günlük randevu listesi\" /><DkdMiniRow title=\"İşlem Akışı\" subtitle=\"v0.2 hazırlığı: işleme başla / işlem bitti\" /><DkdMiniRow title=\"Performans\" subtitle=\"v0.2 hazırlığı: hizmet sayısı ve kazanç özeti\" /></View> : null}",
  "{activePanel === 'master' && canMaster ? <View style={dkd_styles.card}><Text style={dkd_styles.title}>Usta Paneli</Text><DkdMasterAppointmentPanel appointments={dkd_v03_appts.masterAppointments} services={services} masters={masters} refresh={dkd_v03_appts.refreshAll} setAppointmentStatus={dkd_v03_appts.setAppointmentStatus} /></View> : null}"
);

if (changed) {
  fs.writeFileSync(appPath, src);
  console.log('DraBornStyle v0.3 patched into App.tsx');
} else {
  console.log('DraBornStyle v0.3 patch already applied');
}
