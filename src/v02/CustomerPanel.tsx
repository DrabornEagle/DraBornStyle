import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { colors, gradients, radii, spacing } from '../theme';
import { DemoUser, RoleApplication } from '../v01/types';
import { SectionHeader, StatusPill } from '../v01/PanelWidgets';
import { V02DemoState } from './types';

type Result = { ok: boolean; message: string };

export function V02CustomerPanel({
  user,
  applications,
  state,
  onApplyMaster,
  onApplyBusiness,
  onScanQr,
  onMessage,
}: {
  user: DemoUser;
  applications: RoleApplication[];
  state: V02DemoState;
  onApplyMaster: () => void;
  onApplyBusiness: () => void;
  onScanQr: (qrId: string) => Result;
  onMessage: (message: string, success?: boolean) => void;
}) {
  const business = state.businesses[0];
  const master = state.masterProfiles[0];
  const services = state.services.filter((item) => item.businessId === business?.id);
  const qrs = state.qrSources.filter((item) => item.purpose !== 'quick_transaction');
  const activeApplication = applications.find((item) => item.status === 'pending');
  const act = (result: Result) => onMessage(result.message, result.ok);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Image source={{ uri: business?.coverImage }} style={styles.heroImage} />
        <LinearGradient colors={['rgba(7,9,15,0.03)', 'rgba(7,9,15,0.7)', 'rgba(7,9,15,0.98)']} locations={[0, 0.54, 1]} style={StyleSheet.absoluteFill} />
        <View style={styles.heroBadge}><Ionicons name="sparkles" size={14} color={colors.primary} /><Text style={styles.heroBadgeText}>DRABORNSTYLE v0.2.17</Text></View>
        <View style={styles.heroBottom}>
          <Text style={styles.greeting}>Merhaba, {user.fullName.split(' ')[0]}</Text>
          <Text style={styles.heroTitle}>Tarzını belirle,{`\n`}ustana bağlan.</Text>
          <Text style={styles.heroText}>İşletme, hizmet, QR ve özel indirimleri görüntüle. Randevu akışı v0.3’te bu tasarımın üzerine eklenecek.</Text>
        </View>
      </View>

      {business && master && (
        <View style={styles.masterCard}>
          <Image source={{ uri: master.image }} style={styles.masterImage} />
          <View style={styles.masterInfo}>
            <View style={styles.masterNameRow}><Text style={styles.masterName}>Arda Yılmaz</Text><Ionicons name="checkmark-circle" size={16} color={colors.cyan} /></View>
            <Text style={styles.masterText}>{business.name} · {business.address}</Text>
            <View style={styles.masterMeta}><Ionicons name="star" size={14} color={colors.amber} /><Text style={styles.masterMetaStrong}>4.9</Text><Text style={styles.masterMetaText}>· Özel kod: ARDA15</Text></View>
          </View>
          <View style={styles.available}><View style={styles.availableDot} /><Text style={styles.availableText}>Uygun</Text></View>
        </View>
      )}

      <SectionHeader title="Hizmetler ve fiyatlar" meta={`${services.length} hizmet`} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serviceRow}>
        {services.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <View style={[styles.serviceIcon, { backgroundColor: `${service.accent}18` }]}><Ionicons name={service.icon as keyof typeof Ionicons.glyphMap} size={24} color={service.accent} /></View>
            <Text numberOfLines={1} style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.serviceMeta}>{service.durationMinutes} dk</Text>
            <Text style={styles.servicePrice}>₺{service.priceTl}</Text>
          </View>
        ))}
      </ScrollView>

      <SectionHeader title="QR ile bağlan" meta="Demo akış" />
      <View style={styles.qrList}>
        {qrs.map((qr) => (
          <AnimatedPressable key={qr.id} style={styles.qrCard} onPress={() => act(onScanQr(qr.id))}>
            <MiniQr seed={qr.code} />
            <View style={styles.qrInfo}><Text style={styles.qrTitle}>{qr.label}</Text><Text style={styles.qrText}>{qr.purpose === 'customer_registration' ? 'İşletmeye müşteri olarak bağlan' : 'Usta profilini ve özel kodları aç'}</Text><Text style={styles.qrCode}>{qr.code}</Text></View>
            <Ionicons name="scan-outline" size={21} color={colors.cyan} />
          </AnimatedPressable>
        ))}
      </View>

      <SectionHeader title="Özel müşteri avantajları" meta="İndirim kodları" />
      <View style={styles.discountGrid}>
        {state.discountCodes.filter((item) => item.active).map((discount) => (
          <View key={discount.id} style={styles.discountCard}>
            <LinearGradient colors={gradients.hero} style={styles.discountIcon}><Ionicons name="ticket" size={24} color={colors.white} /></LinearGradient>
            <Text style={styles.discountCode}>{discount.code}</Text>
            <Text style={styles.discountValue}>%{discount.percent} indirim</Text>
            <Text style={styles.discountText}>İşlem sonunda usta tarafından uygulanabilir.</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="Rol başvuruları" meta={activeApplication ? 'Beklemede' : 'Açık'} />
      {activeApplication ? (
        <View style={styles.applicationCard}>
          <View style={styles.applicationIcon}><Ionicons name={activeApplication.requestedRole === 'master' ? 'cut-outline' : 'storefront-outline'} size={23} color={colors.amber} /></View>
          <View style={styles.applicationInfo}><Text style={styles.applicationTitle}>{activeApplication.requestedRole === 'master' ? 'Usta başvurusu' : 'İşletme başvurusu'}</Text><Text style={styles.applicationText}>Admin değerlendirmesi bekleniyor. Onay sonrası yeni panel erişimi açılır.</Text></View>
          <StatusPill label="Bekliyor" status="warning" />
        </View>
      ) : (
        <View style={styles.applicationActions}>
          <AnimatedPressable style={styles.applicationButton} onPress={onApplyMaster}><Ionicons name="cut-outline" size={22} color={colors.cyan} /><Text style={styles.applicationButtonTitle}>Usta Başvurusu</Text><Text style={styles.applicationButtonText}>Usta paneli erişimi iste</Text></AnimatedPressable>
          <AnimatedPressable style={styles.applicationButton} onPress={onApplyBusiness}><Ionicons name="storefront-outline" size={22} color={colors.amber} /><Text style={styles.applicationButtonTitle}>İşletme Başvurusu</Text><Text style={styles.applicationButtonText}>İşletme paneli erişimi iste</Text></AnimatedPressable>
        </View>
      )}

      <View style={styles.lockedCard}>
        <View style={styles.lockedIcon}><Ionicons name="calendar-outline" size={25} color={colors.primary} /></View>
        <View style={styles.lockedInfo}><Text style={styles.lockedTitle}>Randevu + Takvim + Müşteri Akışı</Text><Text style={styles.lockedText}>Bu alan v0.3’te açılacak. v0.2 işlem, ödeme, QR ve indirim omurgası tamamlandıktan sonra geliştirilecek.</Text></View>
        <Ionicons name="lock-closed" size={18} color={colors.textFaint} />
      </View>
    </ScrollView>
  );
}

function MiniQr({ seed }: { seed: string }) {
  const cells = Array.from({ length: 36 }, (_, index) => ((seed.charCodeAt(index % seed.length) + index * 11) % 4) !== 0);
  return <View style={styles.qrBox}>{cells.map((filled, index) => <View key={String(index)} style={[styles.qrCell, filled && styles.qrCellFilled]} />)}</View>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingTop: 8, paddingBottom: 34 },
  hero: { height: 300, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  heroBadge: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(8,10,16,0.78)' },
  heroBadgeText: { color: colors.white, fontSize: 8.5, fontWeight: '900', letterSpacing: 0.8 },
  heroBottom: { position: 'absolute', left: 18, right: 18, bottom: 18 },
  greeting: { color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  heroTitle: { color: colors.white, fontSize: 29, lineHeight: 34, fontWeight: '900', marginTop: 5 },
  heroText: { color: colors.textMuted, fontSize: 10.5, lineHeight: 16, marginTop: 7 },
  masterCard: { minHeight: 94, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, marginTop: 13, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  masterImage: { width: 68, height: 68, borderRadius: 20 },
  masterInfo: { flex: 1, minWidth: 0 },
  masterNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  masterName: { color: colors.white, fontSize: 15, fontWeight: '900' },
  masterText: { color: colors.textMuted, fontSize: 9.5, marginTop: 4 },
  masterMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7 },
  masterMetaStrong: { color: colors.white, fontSize: 10, fontWeight: '900' },
  masterMetaText: { color: colors.textMuted, fontSize: 9 },
  available: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(53,225,161,0.11)' },
  availableDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  availableText: { color: colors.green, fontSize: 8.5, fontWeight: '900' },
  serviceRow: { gap: 9, paddingBottom: 3 },
  serviceCard: { width: 132, minHeight: 152, padding: 12, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  serviceIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  serviceTitle: { color: colors.white, fontSize: 12, fontWeight: '900', marginTop: 11 },
  serviceMeta: { color: colors.textMuted, fontSize: 9, marginTop: 4 },
  servicePrice: { color: colors.white, fontSize: 17, fontWeight: '900', marginTop: 8 },
  qrList: { gap: 9 },
  qrCard: { minHeight: 114, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  qrBox: { width: 78, height: 78, flexDirection: 'row', flexWrap: 'wrap', padding: 6, borderRadius: 13, backgroundColor: colors.white },
  qrCell: { width: 11, height: 11 },
  qrCellFilled: { backgroundColor: '#090B12' },
  qrInfo: { flex: 1, minWidth: 0 },
  qrTitle: { color: colors.white, fontSize: 12, fontWeight: '900' },
  qrText: { color: colors.textMuted, fontSize: 9, lineHeight: 13, marginTop: 4 },
  qrCode: { color: colors.cyan, fontSize: 8.5, fontWeight: '900', letterSpacing: 0.5, marginTop: 6 },
  discountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  discountCard: { width: '48.6%', minHeight: 170, padding: 13, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  discountIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  discountCode: { color: colors.white, fontSize: 15, fontWeight: '900', letterSpacing: 0.8, marginTop: 11 },
  discountValue: { color: colors.primary, fontSize: 12, fontWeight: '900', marginTop: 4 },
  discountText: { color: colors.textMuted, fontSize: 8.5, lineHeight: 13, marginTop: 5 },
  applicationCard: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  applicationIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,182,72,0.12)' },
  applicationInfo: { flex: 1, minWidth: 0 },
  applicationTitle: { color: colors.white, fontSize: 12, fontWeight: '900' },
  applicationText: { color: colors.textMuted, fontSize: 9, lineHeight: 13, marginTop: 3 },
  applicationActions: { flexDirection: 'row', gap: 9 },
  applicationButton: { flex: 1, minHeight: 122, padding: 13, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  applicationButtonTitle: { color: colors.white, fontSize: 12, fontWeight: '900', marginTop: 12 },
  applicationButtonText: { color: colors.textMuted, fontSize: 9, lineHeight: 13, marginTop: 4 },
  lockedCard: { minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginTop: 22, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  lockedIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,77,141,0.12)' },
  lockedInfo: { flex: 1, minWidth: 0 },
  lockedTitle: { color: colors.white, fontSize: 11.5, fontWeight: '900' },
  lockedText: { color: colors.textMuted, fontSize: 8.5, lineHeight: 13, marginTop: 4 },
});
