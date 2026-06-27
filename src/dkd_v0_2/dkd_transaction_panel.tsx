import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export type DkdV02Service = {
  dkd_service_id: string;
  dkd_service_title: string;
  dkd_price_cents: number;
};

export type DkdV02Master = {
  dkd_master_id: string;
  dkd_master_name: string;
};

export type DkdV02Transaction = {
  id: string;
  service_title?: string | null;
  status: string;
  final_price: number;
  platform_fee_amount: number;
};

type Props = {
  services: DkdV02Service[];
  masters: DkdV02Master[];
  transactions: DkdV02Transaction[];
  debtTotal: number;
  revenueTotal: number;
  onStart: (serviceId: string, masterId?: string | null) => void;
  onFinish: (transactionId: string, extraPrice: number, discountAmount: number, note: string) => void;
};

function money(value: number) {
  return `${Math.round(Number(value || 0))} TL`;
}

function priceFromCents(value: number) {
  return money(Math.round(Number(value || 0) / 100));
}

export function DkdTransactionPanel(props: Props) {
  const [serviceId, setServiceId] = React.useState('');
  const [masterId, setMasterId] = React.useState('');
  const [activeId, setActiveId] = React.useState('');
  const [extraPrice, setExtraPrice] = React.useState('0');
  const [discountAmount, setDiscountAmount] = React.useState('0');
  const [note, setNote] = React.useState('');

  const activeTransaction = props.transactions.find((item) => item.id === activeId);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>v0.2 İşlem & Ödeme</Text>
      <View style={styles.row}>
        <Summary label="Ciro" value={money(props.revenueTotal)} />
        <Summary label="Platform Borcu" value={money(props.debtTotal)} />
      </View>

      <Text style={styles.heading}>Hizmet Seç</Text>
      {props.services.map((item) => (
        <TouchableOpacity key={item.dkd_service_id} style={styles.pick} onPress={() => setServiceId(item.dkd_service_id)}>
          <Text style={styles.pickText}>{item.dkd_service_title} • {priceFromCents(item.dkd_price_cents)}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.heading}>Usta Seç</Text>
      {props.masters.map((item) => (
        <TouchableOpacity key={item.dkd_master_id} style={styles.pick} onPress={() => setMasterId(item.dkd_master_id)}>
          <Text style={styles.pickText}>{item.dkd_master_name}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.button} onPress={() => props.onStart(serviceId || props.services[0]?.dkd_service_id, masterId || props.masters[0]?.dkd_master_id)}>
        <Text style={styles.buttonText}>İşleme Başla</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Aktif İşlem</Text>
      {props.transactions.filter((item) => item.status === 'started').map((item) => (
        <TouchableOpacity key={item.id} style={styles.pick} onPress={() => setActiveId(item.id)}>
          <Text style={styles.pickText}>{item.service_title || 'İşlem'} • {money(item.final_price)}</Text>
        </TouchableOpacity>
      ))}

      {activeTransaction ? (
        <View style={styles.box}>
          <Text style={styles.heading}>{activeTransaction.service_title || 'Aktif işlem'}</Text>
          <Input label="Ek fiyat" value={extraPrice} onChangeText={setExtraPrice} />
          <Input label="İndirim" value={discountAmount} onChangeText={setDiscountAmount} />
          <Input label="Not" value={note} onChangeText={setNote} />
          <TouchableOpacity style={styles.button} onPress={() => props.onFinish(activeTransaction.id, Number(extraPrice) || 0, Number(discountAmount) || 0, note)}>
            <Text style={styles.buttonText}>İşlem Bitti</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Text style={styles.heading}>Son İşlemler</Text>
      {props.transactions.slice(0, 10).map((item) => (
        <View key={item.id} style={styles.mini}>
          <Text style={styles.miniTitle}>{item.service_title || 'İşlem'} • {item.status}</Text>
          <Text style={styles.miniSub}>{money(item.final_price)} • Platform {money(item.platform_fee_amount)}</Text>
        </View>
      ))}
    </View>
  );
}

function Summary(props: { label: string; value: string }) {
  return <View style={styles.summary}><Text style={styles.summaryValue}>{props.value}</Text><Text style={styles.summaryLabel}>{props.label}</Text></View>;
}

function Input(props: { label: string; value: string; onChangeText: (value: string) => void }) {
  return <View style={styles.inputWrap}><Text style={styles.inputLabel}>{props.label}</Text><TextInput value={props.value} onChangeText={props.onChangeText} style={styles.input} placeholderTextColor="#7B8B87" /></View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#304944', borderRadius: 24, padding: 17, marginBottom: 13, borderWidth: 1, borderColor: '#82978E' },
  title: { color: '#FFF2DD', fontSize: 22, fontWeight: '900', marginBottom: 8 },
  heading: { color: '#FFF2DD', fontSize: 17, fontWeight: '900', marginTop: 12, marginBottom: 4 },
  row: { flexDirection: 'row', gap: 10 },
  summary: { flex: 1, backgroundColor: '#243835', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#5F786F' },
  summaryValue: { color: '#F0C766', fontSize: 20, fontWeight: '900' },
  summaryLabel: { color: '#DDEBE4', fontSize: 12, fontWeight: '800', marginTop: 2 },
  pick: { backgroundColor: '#243835', borderRadius: 14, padding: 11, marginTop: 7, borderWidth: 1, borderColor: '#5F786F' },
  pickText: { color: '#FFF2DD', fontSize: 13, fontWeight: '800' },
  button: { backgroundColor: '#F0C766', borderRadius: 16, padding: 14, marginTop: 12, alignItems: 'center' },
  buttonText: { color: '#243835', fontSize: 15, fontWeight: '900' },
  box: { backgroundColor: '#243835', borderRadius: 18, padding: 12, marginTop: 8, borderWidth: 1, borderColor: '#5F786F' },
  inputWrap: { backgroundColor: '#304944', borderRadius: 14, borderWidth: 1, borderColor: '#5F786F', padding: 10, marginTop: 10 },
  inputLabel: { color: '#F0C766', fontSize: 12, fontWeight: '900', marginBottom: 5 },
  input: { color: '#FFF2DD', fontSize: 15, fontWeight: '800', paddingVertical: 4 },
  mini: { backgroundColor: '#243835', borderRadius: 16, padding: 12, marginTop: 9, borderWidth: 1, borderColor: '#5F786F' },
  miniTitle: { color: '#FFF2DD', fontSize: 15, fontWeight: '900' },
  miniSub: { color: '#DDEBE4', fontSize: 13, lineHeight: 18, marginTop: 3 }
});
