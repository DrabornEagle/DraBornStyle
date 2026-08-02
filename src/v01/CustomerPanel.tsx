import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, gradients, radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { DemoUser, RoleApplication } from './types';
import { ActionCard, MetricCard, PanelTitle, SectionHeader, StatusPill } from './PanelWidgets';

export function CustomerPanel({
  user,
  applications,
  onApplyMaster,
  onApplyBusiness,
}: {
  user: DemoUser;
  applications: RoleApplication[];
  onApplyMaster: () => void;
  onApplyBusiness: () => void;
}) {
  const pending = applications.filter((item) => item.status === 'pending').length;
  const approved = applications.filter((item) => item.status === 'approved').length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <PanelTitle
        eyebrow="MÜŞTERİ PANELİ"
        title={`Hoş geldin, ${user.fullName.split(' ')[0] ?? user.fullName}`}
        text="v0.1’de hesap, rol erişimi ve panel yönlendirme omurgası tamamlandı. Randevu akışı v0.3 yol haritasında açılacak."
      />

      <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroIcon}><Ionicons name="person-circle-outline" size={31} color={colors.white} /></View>
        <Text style={styles.heroEyebrow}>OTOMATİK ROL TANIMI</Text>
        <Text style={styles.heroTitle}>Müşteri erişimin aktif</Text>
        <Text style={styles.heroText}>Kayıt olduğunda müşteri rolün `dkd_user_role_access` yapısına otomatik olarak eklendi.</Text>
        <View style={styles.heroStatus}><View style={styles.heroDot} /><Text style={styles.heroStatusText}>Hesap ve panel omurgası hazır</Text></View>
      </LinearGradient>

      <View style={styles.metrics}>
        <MetricCard icon="shield-checkmark-outline" label="Aktif temel rol" value="Müşteri" accent={colors.green} />
        <MetricCard icon="document-text-outline" label="Bekleyen başvuru" value={String(pending)} accent={colors.amber} />
        <MetricCard icon="checkmark-done-outline" label="Onaylı ek rol" value={String(approved)} accent={colors.cyan} />
      </View>

      <SectionHeader title="Rol başvuruları" meta="Admin onaylı" />
      <View style={styles.list}>
        <ActionCard
          icon="cut-outline"
          title="Usta olmak istiyorum"
          text="Uzmanlık ve işletme bilgilerini gönder. Onaydan sonra usta paneli açılır."
          accent={colors.cyan}
          onPress={onApplyMaster}
        />
        <ActionCard
          icon="storefront-outline"
          title="İşletme sahibi olmak istiyorum"
          text="İşletme bilgilerini gönder. Admin onayı sonrası işletme paneline eriş."
          accent={colors.amber}
          onPress={onApplyBusiness}
        />
      </View>

      <SectionHeader title="Başvuru geçmişim" meta={`${applications.length} kayıt`} />
      {applications.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="file-tray-outline" size={30} color={colors.textFaint} />
          <Text style={styles.emptyTitle}>Henüz başvurun yok</Text>
          <Text style={styles.emptyText}>Usta veya işletme sahibi rolü için yukarıdaki seçeneklerden başvuru yapabilirsin.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {applications.map((application) => (
            <View key={application.id} style={styles.applicationCard}>
              <View style={styles.applicationHeader}>
                <View style={styles.applicationIcon}>
                  <Ionicons name={application.requestedRole === 'master' ? 'cut-outline' : 'storefront-outline'} size={20} color={application.requestedRole === 'master' ? colors.cyan : colors.amber} />
                </View>
                <View style={styles.applicationInfo}>
                  <Text style={styles.applicationTitle}>{application.requestedRole === 'master' ? 'Usta Başvurusu' : 'İşletme Başvurusu'}</Text>
                  <Text numberOfLines={1} style={styles.applicationDetail}>{application.businessName || application.specialty || 'Demo başvuru'}</Text>
                </View>
                <StatusPill
                  label={application.status === 'pending' ? 'Bekliyor' : application.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                  status={application.status === 'pending' ? 'warning' : application.status === 'approved' ? 'success' : 'danger'}
                />
              </View>
              <Text style={styles.applicationNote}>{application.note || 'Başvuru notu bulunmuyor.'}</Text>
            </View>
          ))}
        </View>
      )}

      <SectionHeader title="Sonraki sürümlerde" meta="Yol haritası kilitli" />
      <View style={styles.list}>
        <ActionCard icon="receipt-outline" title="İşlem ve ödeme sistemi" text="v0.2.17 kapsamında işlem, platform bedeli, QR ve indirim sistemi." accent={colors.primary} locked />
        <ActionCard icon="calendar-outline" title="Randevu ve takvim" text="v0.3 kapsamında işletme, usta, hizmet ve uygun saat seçimi." accent={colors.secondary} locked />
        <ActionCard icon="navigate-outline" title="Müşteri geliş akışı" text="Yoldayım, geldim, işlemde ve tamamlandı durumları v0.3’te." accent={colors.green} locked />
      </View>

      <AnimatedPressable style={styles.help} onPress={() => undefined} disabled>
        <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
        <Text style={styles.helpText}>Bu sürümde yalnızca v0.1 kapsamı aktiftir. Sonraki sürüm özellikleri yanlışlıkla açılmaz.</Text>
      </AnimatedPressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingTop: 10, paddingBottom: 34 },
  hero: { minHeight: 210, borderRadius: 28, padding: 19, overflow: 'hidden' },
  heroIcon: { width: 50, height: 50, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)' },
  heroEyebrow: { color: 'rgba(255,255,255,0.78)', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 18 },
  heroTitle: { color: colors.white, fontSize: 24, fontWeight: '900', marginTop: 4 },
  heroText: { color: 'rgba(255,255,255,0.82)', fontSize: 11, lineHeight: 17, marginTop: 7, maxWidth: '88%' },
  heroStatus: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: 'rgba(8,10,16,0.22)' },
  heroDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green },
  heroStatusText: { color: colors.white, fontSize: 9, fontWeight: '900' },
  metrics: { flexDirection: 'row', gap: 9, marginTop: 12 },
  list: { gap: 9 },
  empty: { padding: 26, alignItems: 'center', borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { color: colors.white, fontSize: 15, fontWeight: '900', marginTop: 10 },
  emptyText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 5 },
  applicationCard: { padding: 13, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  applicationHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  applicationIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceElevated, flexShrink: 0 },
  applicationInfo: { flex: 1, minWidth: 0 },
  applicationTitle: { color: colors.white, fontSize: 13, fontWeight: '900' },
  applicationDetail: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  applicationNote: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 11, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  help: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12, marginTop: 20, borderRadius: 16, backgroundColor: colors.card },
  helpText: { flex: 1, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
});
