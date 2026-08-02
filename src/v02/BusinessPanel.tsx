import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { colors, radii, spacing } from '../theme';
import { DemoUser } from '../v01/types';
import { MetricCard, SectionHeader, StatusPill } from '../v01/PanelWidgets';
import { getBusinessFinancials, getBusinessForOwner } from './state';
import { V02DemoState } from './types';

type Result = { ok: boolean; message: string };

export function V02BusinessPanel({
  user,
  state,
  onChangeServicePrice,
  onOpenPayment,
  onScanQr,
  onMessage,
}: {
  user: DemoUser;
  state: V02DemoState;
  onChangeServicePrice: (businessId: string, serviceId: string, priceTl: number) => Result;
  onOpenPayment: () => void;
  onScanQr: (qrId: string) => Result;
  onMessage: (message: string, success?: boolean) => void;
}) {
  const business = getBusinessForOwner(state, user.id);
  if (!business) return <View style={styles.empty}><Text style={styles.emptyText}>İşletme operasyon kaydı bulunamadı.</Text></View>;
  const financials = getBusinessFinancials(state, business.id);
  const services = state.services.filter((item) => item.businessId === business.id);
  const transactions = state.transactions.filter((item) => item.businessId === business.id && item.status === 'completed');
  const qrs = state.qrSources.filter((item) => item.businessId === business.id);
  const paymentLabel = financials.paymentStatus === 'paid' ? 'Ödendi' : financials.paymentStatus === 'partial' ? 'Kısmi Ödeme' : 'Ödeme Bekliyor';
  const paymentStatus = financials.paymentStatus === 'paid' ? 'success' : financials.paymentStatus === 'partial' ? 'warning' : 'danger';
  const act = (result: Result) => onMessage(result.message, result.ok);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Image source={{ uri: business.coverImage }} style={styles.heroImage} />
        <LinearGradient colors={['rgba(7,9,15,0.02)', 'rgba(7,9,15,0.62)', 'rgba(7,9,15,0.98)']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroTop}>
          <View style={styles.heroBadge}><Ionicons name="storefront" size={15} color={colors.amber} /><Text style={styles.heroBadgeText}>İŞLETME MERKEZİ</Text></View>
          <StatusPill label={paymentLabel} status={paymentStatus} />
        </View>
        <View style={styles.heroBottom}>
          <Image source={{ uri: business.logoImage }} style={styles.logo} />
          <View style={styles.heroInfo}><Text numberOfLines={1} style={styles.heroTitle}>{business.name}</Text><Text numberOfLines={1} style={styles.heroText}>{business.address} · {business.paymentDay}</Text></View>
        </View>
      </View>

      <View style={styles.metrics}>
        <MetricCard icon="cut-outline" label="Tamamlanan işlem" value={String(financials.completedCount)} accent={colors.primary} />
        <MetricCard icon="cash-outline" label="Toplam kazanç" value={`₺${financials.grossRevenueTl}`} accent={colors.green} />
        <MetricCard icon="receipt-outline" label="Platform borcu" value={`₺${financials.outstandingTl}`} accent={colors.amber} />
      </View>

      <View style={[styles.paymentCard, financials.outstandingTl === 0 && styles.paymentCardPaid]}>
        <View style={styles.paymentIcon}><Ionicons name={financials.outstandingTl === 0 ? 'checkmark-done-circle' : 'card-outline'} size={26} color={financials.outstandingTl === 0 ? colors.green : colors.amber} /></View>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentEyebrow}>{business.paymentCycle === 'weekly' ? 'HAFTALIK ÖDEME DÖNGÜSÜ' : 'AYLIK ÖDEME DÖNGÜSÜ'}</Text>
          <Text style={styles.paymentTitle}>{financials.outstandingTl === 0 ? 'Platform borcu kapalı' : `Ödenecek tutar ₺${financials.outstandingTl}`}</Text>
          <Text style={styles.paymentText}>İşlem başı ücret ₺{business.platformFeeTl} · Bekleyen bildirim ₺{financials.pendingPaymentsTl}</Text>
        </View>
        {financials.outstandingTl > 0 && <AnimatedPressable style={styles.paymentButton} onPress={onOpenPayment}><Text style={styles.paymentButtonText}>Ödeme Bildir</Text><Ionicons name="arrow-forward" size={16} color={colors.white} /></AnimatedPressable>}
      </View>

      <SectionHeader title="Hizmet ve fiyat listesi" meta="Anında güncellenir" />
      <View style={styles.list}>
        {services.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <View style={[styles.serviceIcon, { backgroundColor: `${service.accent}18` }]}><Ionicons name={service.icon as keyof typeof Ionicons.glyphMap} size={23} color={service.accent} /></View>
            <View style={styles.serviceInfo}><Text style={styles.serviceTitle}>{service.title}</Text><Text style={styles.serviceText}>{service.durationMinutes} dk · İşlem kaydında kullanılacak</Text></View>
            <View style={styles.priceControls}>
              <AnimatedPressable style={styles.priceButton} onPress={() => act(onChangeServicePrice(business.id, service.id, Math.max(10, service.priceTl - 10)))}><Ionicons name="remove" size={17} color={colors.textMuted} /></AnimatedPressable>
              <Text style={styles.price}>₺{service.priceTl}</Text>
              <AnimatedPressable style={styles.priceButton} onPress={() => act(onChangeServicePrice(business.id, service.id, service.priceTl + 10))}><Ionicons name="add" size={17} color={colors.white} /></AnimatedPressable>
            </View>
          </View>
        ))}
      </View>

      <SectionHeader title="Usta ve işlem performansı" meta="Demo rapor" />
      <View style={styles.masterCard}>
        <Image source={{ uri: state.masterProfiles[0]?.image }} style={styles.masterImage} />
        <View style={styles.masterInfo}><Text style={styles.masterName}>Arda Yılmaz</Text><Text style={styles.masterText}>{transactions.length} işlem · ₺{transactions.reduce((sum, item) => sum + (item.finalPriceTl ?? 0), 0)} kazanç</Text></View>
        <View style={styles.rank}><Ionicons name="trophy" size={18} color={colors.amber} /><Text style={styles.rankText}>#1</Text></View>
      </View>

      <SectionHeader title="Son hizmet işlemleri" meta={`${transactions.length} kayıt`} />
      <View style={styles.list}>
        {transactions.slice(0, 6).map((transaction) => {
          const service = services.find((item) => item.id === transaction.serviceId);
          return (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={[styles.transactionIcon, { backgroundColor: `${service?.accent ?? colors.cyan}18` }]}><Ionicons name={(service?.icon ?? 'cut-outline') as keyof typeof Ionicons.glyphMap} size={20} color={service?.accent ?? colors.cyan} /></View>
              <View style={styles.transactionInfo}><Text numberOfLines={1} style={styles.transactionTitle}>{transaction.customerName}</Text><Text numberOfLines={1} style={styles.transactionText}>{service?.title} · {transaction.discountPercent > 0 ? `%${transaction.discountPercent} indirim` : 'Standart fiyat'}</Text></View>
              <View style={styles.transactionRight}><Text style={styles.transactionPrice}>₺{transaction.finalPriceTl}</Text><Text style={styles.transactionFee}>Platform ₺{transaction.platformFeeTl}</Text></View>
            </View>
          );
        })}
      </View>

      <SectionHeader title="QR kaynakları" meta={`${qrs.reduce((sum, item) => sum + item.scans, 0)} toplam tarama`} />
      <View style={styles.qrList}>
        {qrs.map((qr) => (
          <AnimatedPressable key={qr.id} style={styles.qrRow} onPress={() => act(onScanQr(qr.id))}>
            <View style={styles.qrIcon}><Ionicons name="qr-code" size={25} color={colors.white} /></View>
            <View style={styles.qrInfo}><Text style={styles.qrTitle}>{qr.label}</Text><Text style={styles.qrText}>{qr.code} · {qr.scans} tarama</Text></View>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </AnimatedPressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingTop: 8, paddingBottom: 34 },
  hero: { height: 280, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  heroTop: { position: 'absolute', top: 14, left: 14, right: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(8,10,16,0.78)' },
  heroBadgeText: { color: colors.white, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  heroBottom: { position: 'absolute', left: 16, right: 16, bottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 62, height: 62, borderRadius: 20, borderWidth: 2, borderColor: colors.white },
  heroInfo: { flex: 1, minWidth: 0 },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: '900' },
  heroText: { color: colors.textMuted, fontSize: 10.5, marginTop: 4 },
  metrics: { flexDirection: 'row', gap: 8, marginTop: 12 },
  paymentCard: { minHeight: 108, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, marginTop: 13, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: 'rgba(255,182,72,0.24)' },
  paymentCardPaid: { borderColor: 'rgba(53,225,161,0.22)' },
  paymentIcon: { width: 50, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceElevated },
  paymentInfo: { flex: 1, minWidth: 0 },
  paymentEyebrow: { color: colors.amber, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  paymentTitle: { color: colors.white, fontSize: 13, fontWeight: '900', marginTop: 4 },
  paymentText: { color: colors.textMuted, fontSize: 9, lineHeight: 14, marginTop: 3 },
  paymentButton: { minHeight: 42, paddingHorizontal: 10, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.amber },
  paymentButtonText: { color: colors.white, fontSize: 9.5, fontWeight: '900' },
  list: { gap: 8 },
  serviceCard: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  serviceIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  serviceInfo: { flex: 1, minWidth: 0 },
  serviceTitle: { color: colors.white, fontSize: 12, fontWeight: '900' },
  serviceText: { color: colors.textMuted, fontSize: 9, marginTop: 3 },
  priceControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priceButton: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceElevated },
  price: { minWidth: 44, color: colors.white, fontSize: 12, fontWeight: '900', textAlign: 'center' },
  masterCard: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  masterImage: { width: 58, height: 58, borderRadius: 18 },
  masterInfo: { flex: 1, minWidth: 0 },
  masterName: { color: colors.white, fontSize: 14, fontWeight: '900' },
  masterText: { color: colors.textMuted, fontSize: 9.5, marginTop: 4 },
  rank: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,182,72,0.12)' },
  rankText: { color: colors.amber, fontSize: 9, fontWeight: '900', marginTop: 1 },
  transactionCard: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  transactionIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  transactionInfo: { flex: 1, minWidth: 0 },
  transactionTitle: { color: colors.white, fontSize: 12, fontWeight: '900' },
  transactionText: { color: colors.textMuted, fontSize: 9, marginTop: 3 },
  transactionRight: { alignItems: 'flex-end' },
  transactionPrice: { color: colors.white, fontSize: 13, fontWeight: '900' },
  transactionFee: { color: colors.cyan, fontSize: 8, marginTop: 3 },
  qrList: { gap: 8 },
  qrRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  qrIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondary },
  qrInfo: { flex: 1, minWidth: 0 },
  qrTitle: { color: colors.white, fontSize: 11.5, fontWeight: '900' },
  qrText: { color: colors.textMuted, fontSize: 8.5, marginTop: 3 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textMuted },
});
