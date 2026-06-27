import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import App from './App';
import { dkd_supabase_client } from './src/dkd_config/dkd_supabase_client';
import { DkdTransactionPanel, useDkdTransactions } from './src/dkd_v0_2';

type ServiceItem = {
  dkd_service_id: string;
  dkd_service_title: string;
  dkd_price_cents: number;
};

type MasterItem = {
  dkd_master_id: string;
  dkd_master_name: string;
};

export default function DkdV02App() {
  const [mode, setMode] = React.useState<'main' | 'v02'>('v02');
  const [status, setStatus] = React.useState('v0.2 test ekranı hazır.');
  const [businessId, setBusinessId] = React.useState<string | null>(null);
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [masters, setMasters] = React.useState<MasterItem[]>([]);

  const tx = useDkdTransactions(businessId, services, setStatus);

  async function loadV02Data() {
    const sessionResult = await dkd_supabase_client.auth.getSession();
    const userId = sessionResult.data.session?.user?.id;

    if (!userId) {
      setStatus('Önce ana ekrandan giriş yap.');
      return;
    }

    const businessResult = await dkd_supabase_client
      .from('dkd_business_profiles')
      .select('dkd_business_id')
      .eq('dkd_owner_user_id', userId)
      .order('dkd_created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextBusinessId = businessResult.data?.dkd_business_id ?? null;
    setBusinessId(nextBusinessId);

    if (!nextBusinessId) {
      setStatus('Bu hesapta işletme kaydı bulunamadı.');
      return;
    }

    const servicesResult = await dkd_supabase_client
      .from('dkd_services')
      .select('dkd_service_id, dkd_service_title, dkd_price_cents')
      .eq('dkd_business_id', nextBusinessId)
      .eq('dkd_is_active', true)
      .order('dkd_created_at', { ascending: false });

    const mastersResult = await dkd_supabase_client
      .from('dkd_master_profiles')
      .select('dkd_master_id, dkd_master_name')
      .eq('dkd_business_id', nextBusinessId)
      .eq('dkd_is_active', true)
      .order('dkd_created_at', { ascending: false });

    setServices((servicesResult.data ?? []) as ServiceItem[]);
    setMasters((mastersResult.data ?? []) as MasterItem[]);
    setStatus('v0.2 verileri yüklendi.');
  }

  React.useEffect(() => {
    loadV02Data().catch((error) => setStatus(error.message));
  }, []);

  if (mode === 'main') return <App />;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.screen}>
          <View style={styles.header}>
            <Text style={styles.brand}>DraBornStyle v0.2</Text>
            <Text style={styles.text}>İşlem başlat / bitir test ekranı</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => setMode('main')}>
            <Text style={styles.buttonText}>Ana Uygulamaya Dön</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonGhost} onPress={() => loadV02Data().catch((error) => setStatus(error.message))}>
            <Text style={styles.buttonGhostText}>Verileri Yenile</Text>
          </TouchableOpacity>

          <DkdTransactionPanel
            services={services}
            masters={masters}
            transactions={tx.records}
            debtTotal={tx.debtTotal}
            revenueTotal={tx.revenueTotal}
            onStart={tx.startTransaction}
            onFinish={tx.finishTransaction}
          />

          <Text style={styles.status}>{status}</Text>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#2D3B39' },
  screen: { padding: 18, paddingBottom: 40 },
  header: { backgroundColor: '#304944', borderRadius: 24, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#82978E' },
  brand: { color: '#FFF2DD', fontSize: 26, fontWeight: '900' },
  text: { color: '#DDEBE4', fontSize: 15, marginTop: 6, fontWeight: '700' },
  button: { backgroundColor: '#F0C766', borderRadius: 16, padding: 14, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#243835', fontSize: 15, fontWeight: '900' },
  buttonGhost: { backgroundColor: '#243835', borderRadius: 16, padding: 14, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#82978E' },
  buttonGhostText: { color: '#FFF2DD', fontSize: 15, fontWeight: '900' },
  status: { color: '#FFF2DD', fontSize: 14, fontWeight: '800', marginTop: 8, backgroundColor: '#243835', padding: 12, borderRadius: 14 }
});
