import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { colors, gradients, radii, spacing } from '../theme';
import { AdminPanel as V01AdminPanel } from '../v01/AdminPanel';
import { ApplicationRole, V01DemoState } from '../v01/types';
import { MetricCard, SectionHeader, StatusPill } from '../v01/PanelWidgets';
import { getBusinessFinancials } from './state';
import { V02DemoState } from './types';

type Result = { ok: boolean; message: string };

export function V02AdminPanel({
  v01State,
  v02State,
  adminUserId,
  onApplicationDecision,
  onGrantRole,
  onRevokeRole,
  onResetV01,
  onPaymentDecision,
  onPlatformFee,
  onResetV02,
  onMessage,
}: {
  v01State: V01DemoState;
  v02State: V02DemoState;
  adminUserId: string;
  onApplicationDecision: (applicationId: string, decision: 'approved' | 'rejected') => Result;
  onGrantRole: (userId: string, role: ApplicationRole) => Result;
  onRevokeRole: (userId: string, role: ApplicationRole) => Result;
  onResetV01: () => Promise<Result>;
  onPaymentDecision: (paymentId: string, decision: 'approved' | 'rejected', adminUserId: string) => Result;
  onPlatformFee: (businessId: string, feeTl: number) => Result;
  onResetV02: () => Promise<Result>;
  onMessage: (message: string, success?: boolean) => void;
}) {
  const [area, setArea] = useState<'finance' | 'access'>('finance');
  const pendingPayments = v02State.paymentNotices.filter((item) => item.status === 'pending');
  const completed = v02State.transactions.filter((item) => item.status === 'completed');
  const totalFees = completed.reduce((sum, item) => sum + (item.platformFeeTl ?? 0), 0);
  const approvedRevenue = v02State.paymentNotices.filter((item) => item.status === 'approved').reduce((sum, item) => sum + item.amountTl, 0);
  const act = (result: Result) => onMessage(result.message, result.ok);

  const businessReports = useMemo(() => v02State.businesses.map((business) => ({ business, financials: getBusinessFinancials(v02State, business.id) })), [v02State]);

  return (
    <View style={styles.root}>
      <View style={styles.tabs}>
        <AnimatedPressable style={[styles.tab, area === 'finance' && styles.tabActive]} onPress={() => setArea('finance')}>
          <Ionicons name="analytics-outline" size={18} color={area === 'finance' ? colors.white : colors.textMuted} />
          <Text style={[styles.tabText, area === 'finance' && styles.tabTextActive]}>İşlem & Ödeme</Text>
          {pendingPayments.length > 0 && <View style={styles.count}><Text style={styles.countText}>{pendingPayments.length}</Text></View>}
        </AnimatedPressable>
        <AnimatedPressable style={[styles.tab, area === 'access' && styles.tabActive]} onPress={() => setArea('access')}>
          <Ionicons name="shield-checkmark-outline" size={18} color={area === 'access' ? colors.white : colors.textMuted} />
          <Text style={[styles.tabText, area === 'access' && styles.tabTextActive]}>Rol & Başvuru</Text>
        </AnimatedPressable>
      </View>

      {area === 'access' ? (
        <V01AdminPanel
          state={v01State}
          adminUserId={adminUserId}
          onDecision={onApplicationDecision}
          onGrantRole={onGrantRole}
          onRevokeRole={onRevokeRole}
          onResetDemo={onResetV01}
          onMessage={onMessage}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=85' }} style={styles.heroImage} />
            <LinearGradient colors={['rgba(7,9,15,0.08)', 'rgba(7,9,15,0.65)', 'rgba(7,9,15,0.98)']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFillObject} />
            <View style={styles.heroBadge}><Ionicons name="shield-checkmark" size={15} color={colors.primary} /><Text style={styles.heroBadgeText}>ADMIN FİNANS MERKEZİ</Text></View>
            <View style={styles.heroBottom}><Text style={styles.heroTitle}>İşlem, ücret ve ödeme kontrolü</Text><Text style={styles.heroText}>İşletme bazlı platform bedellerini yönet, ödeme bildirimlerini onayla ve sistem gelirini takip et.</Text></View>
          </View>

          <View style={styles.metrics}>
            <MetricCard icon="cut-outline" label="Tamamlanan işlem" value={String(completed.length)} accent={colors.primary} />
            <MetricCard icon="cash-outline" label="Oluşan platform geliri" value={`₺${totalFees}`} accent={colors.cyan} />
            <MetricCard icon="checkmark-done-outline" label="Onaylı tahsilat" value={`₺${approvedRevenue}`} accent={colors.green} />
          </View>

          <SectionHeader title="Bekleyen ödeme bildirimleri" meta={`${pendingPayments.length} onay`} />
          {pendingPayments.length === 0 ? (
            <View style={styles.empty}><Ionicons name="checkmark-done-circle-outline" size={34} color={colors.green} /><Text style={styles.emptyTitle}>Bekleyen ödeme yok</Text><Text style={styles.emptyText}>İşletmeler ödeme bildirdiğinde burada görünecek.</Text></View>
          ) : (
            <View style={styles.list}>
              {pendingPayments.map((notice) => {
                const business = v02State.businesses.find((item) => item.id === notice.businessId);
                return (
                  <View key={notice.id} style={styles.paymentCard}>
                    <View style={styles.paymentHeader}>
                      <View style={styles.paymentIcon}><Ionicons name="card-outline" size={23} color={colors.amber} /></View>
                      <View style={styles.paymentInfo}><Text style={styles.paymentBusiness}>{business?.name ?? 'İşletme'}</Text><Text style={styles.paymentDate}>Bildirim: {new Date(notice.createdAt).toLocaleDateString('tr-TR')}</Text></View>
                      <Text style={styles.paymentAmount}>₺{notice.amountTl}</Text>
                    </View>
                    <View style={styles.paymentActions}>
                      <AnimatedPressable style={styles.reject} onPress={() => act(onPaymentDecision(notice.id, 'rejected', adminUserId))}><Ionicons name="close-circle-outline" size={18} color={colors.red} /><Text style={styles.rejectText}>Reddet</Text></AnimatedPressable>
                      <AnimatedPressable style={styles.approve} onPress={() => act(onPaymentDecision(notice.id, 'approved', adminUserId))}><Ionicons name="checkmark-circle-outline" size={18} color={colors.white} /><Text style={styles.approveText}>Onayla ve Borçtan Düş</Text></AnimatedPressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <SectionHeader title="İşletme bazlı platform bedeli" meta="Varsayılan ₺20" />
          <View style={styles.list}>
            {businessReports.map(({ business, financials }) => (
              <View key={business.id} style={styles.businessCard}>
                <Image source={{ uri: business.logoImage }} style={styles.businessImage} />
                <View style={styles.businessInfo}>
                  <Text style={styles.businessName}>{business.name}</Text>
                  <Text style={styles.businessText}>{financials.completedCount} işlem · Borç ₺{financials.outstandingTl}</Text>
                  <StatusPill label={financials.paymentStatus === 'paid' ? 'Ödendi' : financials.paymentStatus === 'partial' ? 'Kısmi Ödeme' : 'Ödeme Bekliyor'} status={financials.paymentStatus === 'paid' ? 'success' : financials.paymentStatus === 'partial' ? 'warning' : 'danger'} />
                </View>
                <View style={styles.feeControl}>
                  <AnimatedPressable style={styles.feeButton} onPress={() => act(onPlatformFee(business.id, Math.max(0, business.platformFeeTl - 5)))}><Ionicons name="remove" size={17} color={colors.textMuted} /></AnimatedPressable>
                  <View style={styles.feeValue}><Text style={styles.feeLabel}>İşlem başı</Text><Text style={styles.feeText}>₺{business.platformFeeTl}</Text></View>
                  <AnimatedPressable style={styles.feeButton} onPress={() => act(onPlatformFee(business.id, business.platformFeeTl + 5))}><Ionicons name="add" size={17} color={colors.white} /></AnimatedPressable>
                </View>
              </View>
            ))}
          </View>

          <SectionHeader title="Sistem genel raporu" meta="v0.2.17 demo" />
          <View style={styles.reportGrid}>
            <ReportCard icon="storefront-outline" label="Aktif işletme" value={String(v02State.businesses.length)} accent={colors.amber} />
            <ReportCard icon="people-outline" label="Aktif usta" value={String(v02State.masterProfiles.length)} accent={colors.cyan} />
            <ReportCard icon="qr-code-outline" label="QR taraması" value={String(v02State.qrSources.reduce((sum, item) => sum + item.scans, 0))} accent={colors.secondary} />
            <ReportCard icon="ticket-outline" label="Kod kullanımı" value={String(v02State.discountCodes.reduce((sum, item) => sum + item.usageCount, 0))} accent={colors.primary} />
          </View>

          <SectionHeader title="Demo yönetimi" meta="Yerel kayıt" />
          <AnimatedPressable style={styles.reset} onPress={async () => {
            const result = await onResetV02();
            onMessage(result.message, result.ok);
          }}><Ionicons name="refresh" size={20} color={colors.red} /><View style={styles.resetInfo}><Text style={styles.resetTitle}>v0.2.17 işlem verilerini sıfırla</Text><Text style={styles.resetText}>İşlem, ödeme, QR, indirim ve fiyat verilerini başlangıç haline döndürür.</Text></View></AnimatedPressable>
        </ScrollView>
      )}
    </View>
  );
}

function ReportCard({ icon, label, value, accent }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; accent: string }) {
  return <View style={styles.reportCard}><View style={[styles.reportIcon, { backgroundColor: `${accent}18` }]}><Ionicons name={icon} size={21} color={accent} /></View><Text style={styles.reportValue}>{value}</Text><Text style={styles.reportLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabs: { flexDirection: 'row', gap: 6, padding: 5, marginHorizontal: spacing.md, marginBottom: 2, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14 },
  tabActive: { backgroundColor: colors.surfaceElevated },
  tabText: { color: colors.textMuted, fontSize: 10.5, fontWeight: '900' },
  tabTextActive: { color: colors.white },
  count: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  countText: { color: colors.white, fontSize: 9, fontWeight: '900' },
  content: { paddingHorizontal: spacing.md, paddingTop: 8, paddingBottom: 34 },
  hero: { height: 255, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  heroBadge: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(8,10,16,0.78)' },
  heroBadgeText: { color: colors.white, fontSize: 8.5, fontWeight: '900', letterSpacing: 0.8 },
  heroBottom: { position: 'absolute', left: 18, right: 18, bottom: 18 },
  heroTitle: { color: colors.white, fontSize: 24, lineHeight: 29, fontWeight: '900' },
  heroText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 6 },
  metrics: { flexDirection: 'row', gap: 8, marginTop: 12 },
  list: { gap: 9 },
  empty: { padding: 28, alignItems: 'center', borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { color: colors.white, fontSize: 14, fontWeight: '900', marginTop: 9 },
  emptyText: { color: colors.textMuted, fontSize: 9.5, marginTop: 4 },
  paymentCard: { padding: 13, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: 'rgba(255,182,72,0.22)' },
  paymentHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  paymentIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,182,72,0.12)' },
  paymentInfo: { flex: 1, minWidth: 0 },
  paymentBusiness: { color: colors.white, fontSize: 13, fontWeight: '900' },
  paymentDate: { color: colors.textMuted, fontSize: 9, marginTop: 3 },
  paymentAmount: { color: colors.white, fontSize: 20, fontWeight: '900' },
  paymentActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  reject: { flex: 1, minHeight: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, backgroundColor: 'rgba(255,94,108,0.08)', borderWidth: 1, borderColor: 'rgba(255,94,108,0.18)' },
  rejectText: { color: colors.red, fontSize: 10, fontWeight: '900' },
  approve: { flex: 1.7, minHeight: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, backgroundColor: colors.green },
  approveText: { color: colors.white, fontSize: 10, fontWeight: '900' },
  businessCard: { minHeight: 120, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  businessImage: { width: 62, height: 82, borderRadius: 18 },
  businessInfo: { flex: 1, minWidth: 0 },
  businessName: { color: colors.white, fontSize: 13, fontWeight: '900' },
  businessText: { color: colors.textMuted, fontSize: 9, marginTop: 4, marginBottom: 7 },
  feeControl: { alignItems: 'center', gap: 5 },
  feeButton: { width: 32, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceElevated },
  feeValue: { alignItems: 'center' },
  feeLabel: { color: colors.textFaint, fontSize: 7.5 },
  feeText: { color: colors.white, fontSize: 15, fontWeight: '900', marginTop: 1 },
  reportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  reportCard: { width: '48.6%', minHeight: 126, padding: 13, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  reportIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  reportValue: { color: colors.white, fontSize: 22, fontWeight: '900', marginTop: 10 },
  reportLabel: { color: colors.textMuted, fontSize: 9, marginTop: 3 },
  reset: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radii.md, backgroundColor: 'rgba(255,94,108,0.07)', borderWidth: 1, borderColor: 'rgba(255,94,108,0.2)' },
  resetInfo: { flex: 1, minWidth: 0 },
  resetTitle: { color: colors.red, fontSize: 11.5, fontWeight: '900' },
  resetText: { color: colors.textMuted, fontSize: 8.5, lineHeight: 13, marginTop: 3 },
});
