import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { colors, gradients, radii, spacing } from '../theme';
import { DemoUser, MasterPresence } from '../v01/types';
import { MetricCard, SectionHeader, StatusPill } from '../v01/PanelWidgets';
import { getActiveTransaction, getMasterProfile } from './state';
import { V02DemoState } from './types';

type Result = { ok: boolean; message: string };

export function V02MasterPanel({
  user,
  presence,
  state,
  onPresence,
  onOpenTransaction,
  onAddDiscount,
  onToggleDiscount,
  onScanQr,
  onMessage,
}: {
  user: DemoUser;
  presence: MasterPresence;
  state: V02DemoState;
  onPresence: (presence: MasterPresence) => Result;
  onOpenTransaction: () => void;
  onAddDiscount: (code: string, percent: number) => Result;
  onToggleDiscount: (discountId: string) => Result;
  onScanQr: (qrId: string) => Result;
  onMessage: (message: string, success?: boolean) => void;
}) {
  const profile = getMasterProfile(state, user.id);
  const business = state.businesses.find((item) => item.id === profile?.businessId);
  const active = getActiveTransaction(state, user.id);
  const completed = useMemo(() => state.transactions.filter((item) => item.masterUserId === user.id && item.status === 'completed'), [state.transactions, user.id]);
  const gross = completed.reduce((sum, item) => sum + (item.finalPriceTl ?? 0), 0);
  const todayCount = completed.filter((item) => item.completedAt?.slice(0, 10) === '2026-08-02').length;
  const discounts = state.discountCodes.filter((item) => item.masterUserId === user.id);
  const qrs = state.qrSources.filter((item) => item.masterUserId === user.id);
  const [code, setCode] = useState('');
  const [percent, setPercent] = useState('15');

  if (!profile || !business) {
    return <View style={styles.empty}><Text style={styles.emptyText}>Usta operasyon profili bulunamadı.</Text></View>;
  }

  const act = (result: Result) => onMessage(result.message, result.ok);

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Image source={{ uri: business.coverImage }} style={styles.heroImage} />
        <LinearGradient colors={['rgba(8,10,16,0.05)', 'rgba(8,10,16,0.55)', 'rgba(8,10,16,0.98)']} locations={[0, 0.48, 1]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroTop}>
          <View style={styles.heroBadge}><Ionicons name="cut" size={15} color={colors.cyan} /><Text style={styles.heroBadgeText}>USTA OPERASYON</Text></View>
          <StatusPill label={active ? 'İşlemde' : presence === 'available' ? 'Uygun' : presence === 'busy' ? 'Meşgul' : 'Çevrimdışı'} status={active || presence === 'busy' ? 'warning' : presence === 'available' ? 'success' : 'neutral'} />
        </View>
        <View style={styles.heroBottom}>
          <Image source={{ uri: profile.image }} style={styles.masterImage} />
          <View style={styles.heroInfo}>
            <Text numberOfLines={1} style={styles.heroTitle}>{user.fullName}</Text>
            <Text numberOfLines={1} style={styles.heroText}>{profile.title} · {business.name}</Text>
          </View>
        </View>
      </View>

      <AnimatedPressable style={[styles.mainAction, active && styles.mainActionBusy]} onPress={onOpenTransaction}>
        <LinearGradient colors={active ? gradients.pink : gradients.cyan} style={styles.mainActionIcon}>
          <Ionicons name={active ? 'stop-circle' : 'play-circle'} size={30} color={colors.white} />
        </LinearGradient>
        <View style={styles.mainActionInfo}>
          <Text style={styles.mainActionEyebrow}>{active ? 'AKTİF MÜŞTERİ' : 'TEK TUŞ İŞLEM'}</Text>
          <Text style={styles.mainActionTitle}>{active ? `${active.customerName} · İşlemi Bitir` : 'Tıraşa / İşleme Başladım'}</Text>
          <Text style={styles.mainActionText}>{active ? 'Son fiyatı kontrol et, kaydı ve platform bedelini oluştur.' : 'Çat kapı, direkt arayan veya favori müşteriyi hızlıca sisteme al.'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.white} />
      </AnimatedPressable>

      <View style={styles.metrics}>
        <MetricCard icon="cut-outline" label="Bugünkü işlem" value={String(todayCount)} accent={colors.primary} />
        <MetricCard icon="wallet-outline" label="Toplam kazanç" value={`₺${gross}`} accent={colors.amber} />
        <MetricCard icon="receipt-outline" label="Platform bedeli" value={`₺${completed.reduce((sum, item) => sum + (item.platformFeeTl ?? 0), 0)}`} accent={colors.cyan} />
      </View>

      <SectionHeader title="Anlık çalışma durumu" meta={active ? 'İşlem sırasında kilitli' : 'Değiştirilebilir'} />
      <View style={styles.presenceRow}>
        <PresenceButton label="Uygun" icon="checkmark-circle-outline" accent={colors.green} active={!active && presence === 'available'} disabled={Boolean(active)} onPress={() => act(onPresence('available'))} />
        <PresenceButton label="Meşgul" icon="remove-circle-outline" accent={colors.amber} active={Boolean(active) || presence === 'busy'} disabled={Boolean(active)} onPress={() => act(onPresence('busy'))} />
        <PresenceButton label="Kapalı" icon="moon-outline" accent={colors.textMuted} active={!active && presence === 'offline'} disabled={Boolean(active)} onPress={() => act(onPresence('offline'))} />
      </View>

      <SectionHeader title="Son işlemler" meta={`${completed.length} tamamlandı`} />
      <View style={styles.list}>
        {completed.slice(0, 5).map((transaction) => {
          const service = state.services.find((item) => item.id === transaction.serviceId);
          return (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={[styles.transactionIcon, { backgroundColor: `${service?.accent ?? colors.cyan}18` }]}><Ionicons name={(service?.icon ?? 'cut-outline') as keyof typeof Ionicons.glyphMap} size={21} color={service?.accent ?? colors.cyan} /></View>
              <View style={styles.transactionInfo}><Text numberOfLines={1} style={styles.transactionTitle}>{transaction.customerName}</Text><Text numberOfLines={1} style={styles.transactionText}>{service?.title ?? 'Hizmet'} · {sourceLabel(transaction.source)}</Text></View>
              <View style={styles.transactionPrice}><Text style={styles.transactionValue}>₺{transaction.finalPriceTl}</Text><Text style={styles.feeText}>Fee ₺{transaction.platformFeeTl}</Text></View>
            </View>
          );
        })}
      </View>

      <SectionHeader title="Özel müşteri indirimleri" meta="Usta kodları" />
      <View style={styles.discountCreate}>
        <View style={styles.codeInput}><Ionicons name="pricetag-outline" size={18} color={colors.primary} /><TextInput value={code} onChangeText={(value: string) => setCode(value.toLocaleUpperCase('tr-TR'))} placeholder="YENİKOD" placeholderTextColor={colors.textFaint} autoCapitalize="characters" style={styles.input} /></View>
        <View style={styles.percentInput}><TextInput value={percent} onChangeText={setPercent} keyboardType="number-pad" style={styles.percentText} /><Text style={styles.percentSymbol}>%</Text></View>
        <AnimatedPressable style={styles.addButton} onPress={() => {
          const result = onAddDiscount(code, Number(percent));
          act(result);
          if (result.ok) setCode('');
        }}><Ionicons name="add" size={22} color={colors.white} /></AnimatedPressable>
      </View>
      <View style={styles.list}>
        {discounts.map((discount) => (
          <AnimatedPressable key={discount.id} style={styles.discountCard} onPress={() => act(onToggleDiscount(discount.id))}>
            <View style={[styles.discountIcon, { backgroundColor: discount.active ? 'rgba(255,77,141,0.14)' : colors.surfaceElevated }]}><Ionicons name="ticket-outline" size={22} color={discount.active ? colors.primary : colors.textFaint} /></View>
            <View style={styles.discountInfo}><Text style={styles.discountCode}>{discount.code}</Text><Text style={styles.discountText}>%{discount.percent} indirim · {discount.usageCount} kullanım</Text></View>
            <StatusPill label={discount.active ? 'Aktif' : 'Pasif'} status={discount.active ? 'success' : 'neutral'} />
          </AnimatedPressable>
        ))}
      </View>

      <SectionHeader title="QR kaynaklarım" meta="v0.2.17" />
      <View style={styles.qrGrid}>
        {qrs.map((qr) => (
          <AnimatedPressable key={qr.id} style={styles.qrCard} onPress={() => act(onScanQr(qr.id))}>
            <MiniQr seed={qr.code} />
            <Text numberOfLines={2} style={styles.qrTitle}>{qr.label}</Text>
            <Text style={styles.qrMeta}>{qr.scans} tarama · Demo tara</Text>
          </AnimatedPressable>
        ))}
      </View>
    </ScrollView>
  );
}

function PresenceButton({ label, icon, accent, active, disabled, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; accent: string; active: boolean; disabled: boolean; onPress: () => void }) {
  return <AnimatedPressable disabled={disabled} style={[styles.presence, active && { borderColor: accent, backgroundColor: `${accent}12` }]} onPress={onPress}><Ionicons name={icon} size={21} color={active ? accent : colors.textFaint} /><Text style={[styles.presenceText, active && { color: colors.white }]}>{label}</Text></AnimatedPressable>;
}

function MiniQr({ seed }: { seed: string }) {
  const cells = Array.from({ length: 36 }, (_, index) => ((seed.charCodeAt(index % seed.length) + index * 7) % 3) !== 0);
  return <View style={styles.qrBox}>{cells.map((filled, index) => <View key={String(index)} style={[styles.qrCell, filled && styles.qrCellFilled]} />)}</View>;
}

function sourceLabel(source: string) {
  return source === 'walk_in' ? 'Çat Kapı' : source === 'direct_call' ? 'Direkt Aradı' : source === 'favorite_customer' ? 'Favori' : 'Randevulu';
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingTop: 8, paddingBottom: 34 },
  hero: { height: 282, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  heroTop: { position: 'absolute', left: 14, right: 14, top: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(8,10,16,0.78)' },
  heroBadgeText: { color: colors.white, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  heroBottom: { position: 'absolute', left: 16, right: 16, bottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  masterImage: { width: 62, height: 62, borderRadius: 20, borderWidth: 2, borderColor: colors.white },
  heroInfo: { flex: 1, minWidth: 0 },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: '900' },
  heroText: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  mainAction: { minHeight: 100, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, marginTop: 13, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: 'rgba(45,212,255,0.24)' },
  mainActionBusy: { borderColor: 'rgba(255,77,141,0.3)' },
  mainActionIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  mainActionInfo: { flex: 1, minWidth: 0 },
  mainActionEyebrow: { color: colors.cyan, fontSize: 8.5, fontWeight: '900', letterSpacing: 0.9 },
  mainActionTitle: { color: colors.white, fontSize: 14, fontWeight: '900', marginTop: 3 },
  mainActionText: { color: colors.textMuted, fontSize: 9.5, lineHeight: 14, marginTop: 4 },
  metrics: { flexDirection: 'row', gap: 8, marginTop: 12 },
  presenceRow: { flexDirection: 'row', gap: 8 },
  presence: { flex: 1, minHeight: 59, alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  presenceText: { color: colors.textMuted, fontSize: 9.5, fontWeight: '900' },
  list: { gap: 8 },
  transactionCard: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  transactionIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  transactionInfo: { flex: 1, minWidth: 0 },
  transactionTitle: { color: colors.white, fontSize: 12, fontWeight: '900' },
  transactionText: { color: colors.textMuted, fontSize: 9.5, marginTop: 3 },
  transactionPrice: { alignItems: 'flex-end' },
  transactionValue: { color: colors.white, fontSize: 14, fontWeight: '900' },
  feeText: { color: colors.cyan, fontSize: 8.5, marginTop: 3 },
  discountCreate: { flexDirection: 'row', gap: 8, marginBottom: 9 },
  codeInput: { flex: 1, minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderRadius: 15, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, color: colors.white, fontSize: 12, fontWeight: '800' },
  percentInput: { width: 68, minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  percentText: { color: colors.white, fontSize: 13, fontWeight: '900', minWidth: 25, textAlign: 'right' },
  percentSymbol: { color: colors.textMuted, fontSize: 12, marginLeft: 2 },
  addButton: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  discountCard: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  discountIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  discountInfo: { flex: 1, minWidth: 0 },
  discountCode: { color: colors.white, fontSize: 13, fontWeight: '900', letterSpacing: 0.8 },
  discountText: { color: colors.textMuted, fontSize: 9.5, marginTop: 3 },
  qrGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  qrCard: { width: '48.6%', minHeight: 196, padding: 13, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  qrBox: { width: 86, height: 86, flexDirection: 'row', flexWrap: 'wrap', padding: 7, borderRadius: 14, backgroundColor: colors.white },
  qrCell: { width: 12, height: 12 },
  qrCellFilled: { backgroundColor: '#090B12' },
  qrTitle: { color: colors.white, fontSize: 11, lineHeight: 15, fontWeight: '900', marginTop: 10 },
  qrMeta: { color: colors.textMuted, fontSize: 8.5, marginTop: 5 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textMuted },
});
