import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  DkdAdminPaymentApproval,
  dkdApprovePayment,
  dkdLoadPaymentApprovals,
  dkdRejectPayment
} from './dkd_admin_payment_api';

type Props = {
  adminUserId: string | null;
  onStatus: (message: string) => void;
};

function money(value: number) {
  return `${Math.round(Number(value || 0))} TL`;
}

export function DkdAdminPaymentPanel(props: Props) {
  const [approvals, setApprovals] = React.useState<DkdAdminPaymentApproval[]>([]);

  async function refresh() {
    const nextApprovals = await dkdLoadPaymentApprovals();
    setApprovals(nextApprovals);
  }

  React.useEffect(() => {
    refresh().catch((error) => props.onStatus(error.message));
  }, []);

  async function approve(id: string) {
    if (!props.adminUserId) {
      props.onStatus('Admin kullanıcı bilgisi bulunamadı.');
      return;
    }

    await dkdApprovePayment(id, props.adminUserId);
    props.onStatus('Ödeme onaylandı.');
    await refresh();
  }

  async function reject(id: string) {
    await dkdRejectPayment(id);
    props.onStatus('Ödeme reddedildi.');
    await refresh();
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>v0.2 Admin Ödeme Onayı</Text>
      <Text style={styles.body}>İşletmelerden gelen ödeme bildirimlerini onayla veya reddet.</Text>

      {approvals.length === 0 ? (
        <View style={styles.rowBox}>
          <Text style={styles.rowTitle}>Bekleyen ödeme yok</Text>
          <Text style={styles.rowSub}>Yeni ödeme bildirimleri burada görünecek.</Text>
        </View>
      ) : null}

      {approvals.map((item) => (
        <View key={item.id} style={styles.rowBox}>
          <Text style={styles.rowTitle}>{money(item.amount)} • {item.status}</Text>
          <Text style={styles.rowSub}>İşletme: {item.business_id}</Text>
          <Text style={styles.rowSub}>Yöntem: {item.payment_method || 'Belirtilmedi'}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={() => approve(item.id)}>
              <Text style={styles.buttonText}>Onayla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostButton} onPress={() => reject(item.id)}>
              <Text style={styles.ghostText}>Reddet</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#304944', borderRadius: 24, padding: 17, marginBottom: 13, borderWidth: 1, borderColor: '#82978E' },
  title: { color: '#FFF2DD', fontSize: 22, fontWeight: '900', marginBottom: 8 },
  body: { color: '#DDEBE4', fontSize: 15, lineHeight: 22 },
  rowBox: { backgroundColor: '#243835', borderRadius: 16, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#5F786F' },
  rowTitle: { color: '#FFF2DD', fontSize: 15, fontWeight: '900' },
  rowSub: { color: '#DDEBE4', fontSize: 13, lineHeight: 18, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  button: { backgroundColor: '#F0C766', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 9 },
  buttonText: { color: '#243835', fontSize: 12, fontWeight: '900' },
  ghostButton: { backgroundColor: '#304944', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 9, borderWidth: 1, borderColor: '#82978E' },
  ghostText: { color: '#FFF2DD', fontSize: 12, fontWeight: '900' }
});
