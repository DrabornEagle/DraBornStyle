import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, gradients, radii, spacing } from '../theme';
import { DemoUser } from './types';
import { ActionCard, MetricCard, PanelTitle, SectionHeader, StatusPill } from './PanelWidgets';

export function BusinessPanel({ user }: { user: DemoUser }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <PanelTitle
        eyebrow="İŞLETME PANELİ"
        title="İşletme omurgası hazır"
        text="v0.1 işletme rolünü, panel yönlendirmesini ve temel yönetim iskeletini doğrular. Hizmet, işlem ve ödeme kayıtları v0.2.17’de açılacak."
      />

      <LinearGradient colors={gradients.gold} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}><Ionicons name="storefront" size={27} color={colors.white} /></View>
          <StatusPill label="Onaylı İşletme" status="success" />
        </View>
        <Text style={styles.heroTitle}>{user.businessName || 'DraBornStyle Demo Salon'}</Text>
        <Text style={styles.heroText}>İşletme sahibi: {user.fullName}</Text>
        <View style={styles.heroCode}><Text style={styles.heroCodeText}>İşletme erişimi admin tarafından onaylandı</Text></View>
      </LinearGradient>

      <View style={styles.metrics}>
        <MetricCard icon="people-outline" label="Tanımlı usta" value="1" accent={colors.cyan} />
        <MetricCard icon="layers-outline" label="Hizmet taslağı" value="4" accent={colors.primary} />
        <MetricCard icon="receipt-outline" label="Platform borcu" value="₺0" accent={colors.amber} />
      </View>

      <SectionHeader title="v0.1 kurulum kontrolü" meta="4 / 4 hazır" />
      <View style={styles.checklist}>
        <SetupItem icon="checkmark-circle" title="İşletme rol erişimi" text="Admin onayı sonrası işletme paneline yönlendirme" accent={colors.green} />
        <SetupItem icon="business" title="İşletme profili" text="İşletme adı ve sahip bilgileri demo kaydında hazır" accent={colors.amber} />
        <SetupItem icon="people" title="Usta yönetimi omurgası" text="Ekip ekranı sonraki sürüm verilerine hazır" accent={colors.cyan} />
        <SetupItem icon="shield-checkmark" title="Rol izolasyonu" text="Müşteri, usta, işletme ve admin panelleri ayrıldı" accent={colors.secondary} />
      </View>

      <SectionHeader title="İşletme yönetimi" meta="Sonraki sürüm hazırlığı" />
      <View style={styles.list}>
        <ActionCard icon="create-outline" title="İşletme bilgilerini yönet" text="Adres, iletişim, çalışma saatleri ve salon detayları." accent={colors.amber} locked />
        <ActionCard icon="people-outline" title="Ustaları yönet" text="Usta daveti, onay, görev ve çalışma durumu." accent={colors.cyan} locked />
        <ActionCard icon="pricetags-outline" title="Hizmet ve fiyat listesi" text="Hizmet ekleme, süre, fiyat ve usta eşleştirme." accent={colors.primary} locked />
        <ActionCard icon="analytics-outline" title="İşlem ve kazanç raporları" text="Günlük, haftalık ve aylık işletme raporları." accent={colors.green} locked />
      </View>

      <SectionHeader title="v0.2.17 para sistemi" meta="Kilitli" />
      <View style={styles.financeCard}>
        <View style={styles.financeHeader}>
          <View style={styles.financeIcon}><Ionicons name="wallet-outline" size={24} color={colors.amber} /></View>
          <View style={styles.financeInfo}>
            <Text style={styles.financeTitle}>Platform hizmet bedeli</Text>
            <Text style={styles.financeText}>Varsayılan demo karar: tamamlanan işlem başına ₺20.</Text>
          </View>
          <Ionicons name="lock-closed" size={20} color={colors.textFaint} />
        </View>
        <View style={styles.financeRows}>
          <FinanceRow label="Tamamlanan işlem" value="0" />
          <FinanceRow label="Platform bedeli" value="₺0" />
          <FinanceRow label="Ödeme durumu" value="v0.2.17’de" />
        </View>
      </View>

      <View style={styles.info}>
        <Ionicons name="information-circle-outline" size={20} color={colors.cyan} />
        <Text style={styles.infoText}>Bu sürümde işletme paneli yalnızca rol ve panel omurgasını test eder. Gerçek hizmet, işlem ve ödeme demo verileri v0.2.17’ye geçildiğinde eklenecek.</Text>
      </View>
    </ScrollView>
  );
}

function SetupItem({ icon, title, text, accent }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string; accent: string }) {
  return (
    <View style={styles.setupItem}>
      <View style={[styles.setupIcon, { backgroundColor: `${accent}16` }]}><Ionicons name={icon} size={21} color={accent} /></View>
      <View style={styles.setupText}><Text style={styles.setupTitle}>{title}</Text><Text style={styles.setupDetail}>{text}</Text></View>
      <Ionicons name="checkmark-circle" size={20} color={colors.green} />
    </View>
  );
}

function FinanceRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.financeRow}>
      <Text style={styles.financeLabel}>{label}</Text>
      <Text style={styles.financeValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingTop: 10, paddingBottom: 34 },
  hero: { minHeight: 190, borderRadius: 28, padding: 18, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroIcon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.16)' },
  heroTitle: { color: colors.white, fontSize: 24, fontWeight: '900', marginTop: 18 },
  heroText: { color: 'rgba(255,255,255,0.84)', fontSize: 11, marginTop: 5 },
  heroCode: { alignSelf: 'flex-start', marginTop: 16, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: 'rgba(8,10,16,0.18)' },
  heroCodeText: { color: colors.white, fontSize: 9, fontWeight: '900' },
  metrics: { flexDirection: 'row', gap: 9, marginTop: 12 },
  checklist: { gap: 8 },
  setupItem: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  setupIcon: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  setupText: { flex: 1, minWidth: 0 },
  setupTitle: { color: colors.white, fontSize: 12, fontWeight: '900' },
  setupDetail: { color: colors.textMuted, fontSize: 9.5, lineHeight: 14, marginTop: 3 },
  list: { gap: 9 },
  financeCard: { padding: 14, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  financeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  financeIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,182,72,0.12)' },
  financeInfo: { flex: 1, minWidth: 0 },
  financeTitle: { color: colors.white, fontSize: 13, fontWeight: '900' },
  financeText: { color: colors.textMuted, fontSize: 9.5, lineHeight: 14, marginTop: 3 },
  financeRows: { marginTop: 14, borderTopWidth: 1, borderTopColor: colors.border },
  financeRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
  financeLabel: { color: colors.textMuted, fontSize: 10 },
  financeValue: { color: colors.white, fontSize: 11, fontWeight: '900' },
  info: { flexDirection: 'row', gap: 9, padding: 12, marginTop: 20, borderRadius: 16, backgroundColor: 'rgba(45,212,255,0.07)' },
  infoText: { flex: 1, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
});
