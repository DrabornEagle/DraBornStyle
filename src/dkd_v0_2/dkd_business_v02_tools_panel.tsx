import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { dkd_supabase_client } from '../dkd_config/dkd_supabase_client';

type Props = {
  businessId: string | null;
  onStatus: (message: string) => void;
};

type DiscountCode = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  used_count: number;
  is_active: boolean;
};

type QrSource = {
  id: string;
  qr_code: string;
  title: string;
  scan_count: number;
  is_active: boolean;
};

function makeCode(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function DkdBusinessV02ToolsPanel(props: Props) {
  const [discounts, setDiscounts] = React.useState<DiscountCode[]>([]);
  const [qrSources, setQrSources] = React.useState<QrSource[]>([]);
  const [discountCode, setDiscountCode] = React.useState('');
  const [discountValue, setDiscountValue] = React.useState('50');
  const [qrTitle, setQrTitle] = React.useState('İşletme QR');

  async function refresh() {
    if (!props.businessId) return;

    const discountResult = await dkd_supabase_client
      .from('dkd_discount_codes')
      .select('id, code, discount_type, discount_value, used_count, is_active')
      .eq('business_id', props.businessId)
      .order('created_at', { ascending: false })
      .limit(20);

    const qrResult = await dkd_supabase_client
      .from('dkd_qr_sources')
      .select('id, qr_code, title, scan_count, is_active')
      .eq('business_id', props.businessId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (discountResult.error) throw discountResult.error;
    if (qrResult.error) throw qrResult.error;

    setDiscounts((discountResult.data ?? []) as DiscountCode[]);
    setQrSources((qrResult.data ?? []) as QrSource[]);
  }

  React.useEffect(() => {
    refresh().catch((error) => props.onStatus(error.message));
  }, [props.businessId]);

  async function createDiscount() {
    if (!props.businessId) {
      props.onStatus('Önce salon kaydı gerekli.');
      return;
    }

    const code = (discountCode.trim() || makeCode('USTA')).toUpperCase();
    const value = Number(discountValue.replace(',', '.')) || 0;

    const result = await dkd_supabase_client.from('dkd_discount_codes').insert({
      business_id: props.businessId,
      code,
      title: 'Usta özel indirim kodu',
      discount_type: 'fixed',
      discount_value: value,
      is_active: true
    });

    if (result.error) {
      props.onStatus(result.error.message);
      return;
    }

    setDiscountCode('');
    props.onStatus('İndirim kodu oluşturuldu.');
    await refresh();
  }

  async function createQr() {
    if (!props.businessId) {
      props.onStatus('Önce salon kaydı gerekli.');
      return;
    }

    const qrCode = makeCode('QR');
    const result = await dkd_supabase_client.from('dkd_qr_sources').insert({
      business_id: props.businessId,
      qr_code: qrCode,
      title: qrTitle.trim() || 'İşletme QR',
      source_type: 'business_qr',
      is_active: true
    });

    if (result.error) {
      props.onStatus(result.error.message);
      return;
    }

    props.onStatus('QR kaynak oluşturuldu.');
    await refresh();
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>v0.2 QR & İndirim</Text>
      <Text style={styles.body}>Usta özel indirim kodu ve işletme QR kaynaklarını yönet.</Text>

      <Text style={styles.heading}>İndirim Kodu</Text>
      <Input label="Kod" value={discountCode} onChangeText={setDiscountCode} placeholder="Boş bırakılırsa otomatik" />
      <Input label="Tutar" value={discountValue} onChangeText={setDiscountValue} placeholder="50" keyboardType="numeric" />
      <TouchableOpacity style={styles.button} onPress={createDiscount}>
        <Text style={styles.buttonText}>İndirim Kodu Oluştur</Text>
      </TouchableOpacity>

      {discounts.map((item) => (
        <Mini key={item.id} title={`${item.code} • ${Math.round(item.discount_value)} TL`} sub={`Kullanım: ${item.used_count} • ${item.is_active ? 'Aktif' : 'Kapalı'}`} />
      ))}

      <Text style={styles.heading}>QR Kaynak</Text>
      <Input label="QR Başlığı" value={qrTitle} onChangeText={setQrTitle} placeholder="İşletme QR" />
      <TouchableOpacity style={styles.button} onPress={createQr}>
        <Text style={styles.buttonText}>QR Kaynak Oluştur</Text>
      </TouchableOpacity>

      {qrSources.map((item) => (
        <Mini key={item.id} title={`${item.title} • ${item.qr_code}`} sub={`Tarama: ${item.scan_count} • ${item.is_active ? 'Aktif' : 'Kapalı'}`} />
      ))}
    </View>
  );
}

function Input(props: any) {
  const { label, ...inputProps } = props;
  return <View style={styles.inputWrap}><Text style={styles.inputLabel}>{label}</Text><TextInput {...inputProps} placeholderTextColor="#7B8B87" style={styles.input} /></View>;
}

function Mini(props: { title: string; sub: string }) {
  return <View style={styles.mini}><Text style={styles.miniTitle}>{props.title}</Text><Text style={styles.miniSub}>{props.sub}</Text></View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#304944', borderRadius: 24, padding: 17, marginBottom: 13, borderWidth: 1, borderColor: '#82978E' },
  title: { color: '#FFF2DD', fontSize: 22, fontWeight: '900', marginBottom: 8 },
  body: { color: '#DDEBE4', fontSize: 15, lineHeight: 22 },
  heading: { color: '#FFF2DD', fontSize: 17, fontWeight: '900', marginTop: 12, marginBottom: 4 },
  inputWrap: { backgroundColor: '#243835', borderRadius: 16, borderWidth: 1, borderColor: '#5F786F', padding: 10, marginTop: 10 },
  inputLabel: { color: '#F0C766', fontSize: 12, fontWeight: '900', marginBottom: 5 },
  input: { color: '#FFF2DD', fontSize: 15, fontWeight: '800', paddingVertical: 4 },
  button: { backgroundColor: '#F0C766', borderRadius: 16, padding: 14, marginTop: 12, alignItems: 'center' },
  buttonText: { color: '#243835', fontSize: 15, fontWeight: '900' },
  mini: { backgroundColor: '#243835', borderRadius: 16, padding: 12, marginTop: 9, borderWidth: 1, borderColor: '#5F786F' },
  miniTitle: { color: '#FFF2DD', fontSize: 15, fontWeight: '900' },
  miniSub: { color: '#DDEBE4', fontSize: 13, lineHeight: 18, marginTop: 3 }
});
