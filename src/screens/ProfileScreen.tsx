import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { FadeIn } from '../components/FadeIn';

const rows: { icon: keyof typeof Ionicons.glyphMap; title: string; detail: string; accent: string }[] = [
  { icon: 'person-outline', title: 'Kişisel bilgiler', detail: 'Ad, telefon ve şehir', accent: colors.primary },
  { icon: 'card-outline', title: 'Ödeme yöntemleri', detail: 'Demo kartlar ve cüzdan', accent: colors.cyan },
  { icon: 'heart-outline', title: 'Favori berberler', detail: 'Kaydettiğin ustalar', accent: colors.red },
  { icon: 'help-circle-outline', title: 'Yardım ve destek', detail: 'Sık sorulanlar ve iletişim', accent: colors.amber },
  { icon: 'shield-checkmark-outline', title: 'Gizlilik', detail: 'Demo veri ve izinler', accent: colors.green },
];

export function ProfileScreen({
  favoriteCount,
  appointmentCount,
  notificationsEnabled,
  onNotificationsChange,
  onResetDemo,
}: {
  favoriteCount: number;
  appointmentCount: number;
  notificationsEnabled: boolean;
  onNotificationsChange: (value: boolean) => void;
  onResetDemo: () => void;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <FadeIn>
        <View style={styles.headerRow}><View><Text style={styles.title}>Profil</Text><Text style={styles.subtitle}>DraBornStyle deneyimini kişiselleştir.</Text></View><AnimatedPressable style={styles.settings}><Ionicons name="settings-outline" size={22} color={colors.white} /></AnimatedPressable></View>
      </FadeIn>

      <FadeIn delay={70}>
        <View style={styles.profileCard}>
          <View>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=85' }} style={styles.avatar} />
            <View style={styles.onlineDot} />
          </View>
          <View style={{ flex: 1 }}><Text style={styles.name}>DrabornEagle</Text><Text style={styles.phone}>+90 5•• ••• •• 26</Text><View style={styles.demoBadge}><Ionicons name="flask" size={13} color={colors.cyan} /><Text style={styles.demoBadgeText}>DEMO HESAP</Text></View></View>
          <AnimatedPressable style={styles.editButton}><Ionicons name="pencil" size={17} color={colors.white} /></AnimatedPressable>
        </View>
      </FadeIn>

      <FadeIn delay={120}>
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statValue}>{appointmentCount}</Text><Text style={styles.statLabel}>Randevu</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={styles.statValue}>{favoriteCount}</Text><Text style={styles.statLabel}>Favori</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={styles.statValue}>4.9</Text><Text style={styles.statLabel}>Ortalama</Text></View>
        </View>
      </FadeIn>

      <FadeIn delay={170}>
        <Text style={styles.sectionTitle}>Ayarlar</Text>
        <View style={styles.settingsList}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: 'rgba(108,99,255,0.13)' }]}><Ionicons name="notifications-outline" size={20} color={colors.secondary} /></View>
            <View style={{ flex: 1 }}><Text style={styles.rowTitle}>Bildirimler</Text><Text style={styles.rowDetail}>Randevu ve kampanya hatırlatmaları</Text></View>
            <Switch value={notificationsEnabled} onValueChange={onNotificationsChange} trackColor={{ false: colors.surfaceElevated, true: colors.primary }} thumbColor={colors.white} />
          </View>
          {rows.map((row) => (
            <AnimatedPressable key={row.title} style={styles.row} onPress={() => undefined}>
              <View style={[styles.rowIcon, { backgroundColor: `${row.accent}18` }]}><Ionicons name={row.icon} size={20} color={row.accent} /></View>
              <View style={{ flex: 1 }}><Text style={styles.rowTitle}>{row.title}</Text><Text style={styles.rowDetail}>{row.detail}</Text></View>
              <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
            </AnimatedPressable>
          ))}
        </View>
      </FadeIn>

      <FadeIn delay={230}>
        <View style={styles.demoPanel}>
          <View style={styles.demoPanelIcon}><Ionicons name="code-slash" size={22} color={colors.cyan} /></View>
          <View style={{ flex: 1 }}><Text style={styles.demoPanelTitle}>Yerel Demo Modu</Text><Text style={styles.demoPanelText}>Veriler yalnızca bu cihazda AsyncStorage içinde tutulur. Supabase ve harici veritabanı bağlı değildir.</Text></View>
        </View>
        <AnimatedPressable style={styles.resetButton} onPress={onResetDemo}><Ionicons name="refresh" size={18} color={colors.red} /><Text style={styles.resetText}>Demo verilerini sıfırla</Text></AnimatedPressable>
        <Text style={styles.version}>DraBornStyle v0.3 · Expo SDK 57</Text>
      </FadeIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingTop: 10, paddingBottom: 108 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.white, fontSize: 27, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 5 },
  settings: { width: 45, height: 45, borderRadius: 17, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 16, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginTop: 20 },
  avatar: { width: 72, height: 72, borderRadius: 24 },
  onlineDot: { position: 'absolute', right: -2, bottom: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.green, borderWidth: 3, borderColor: colors.card },
  name: { color: colors.white, fontSize: 19, fontWeight: '900' },
  phone: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  demoBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(45,212,255,0.1)', marginTop: 8 },
  demoBadgeText: { color: colors.cyan, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  editButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: 17, borderRadius: radii.lg, backgroundColor: colors.cardSoft, marginTop: 12 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.white, fontSize: 20, fontWeight: '900' },
  statLabel: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },
  sectionTitle: { color: colors.white, fontSize: 18, fontWeight: '900', marginTop: 24, marginBottom: 11 },
  settingsList: { gap: 8 },
  row: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  rowIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { color: colors.white, fontSize: 13, fontWeight: '800' },
  rowDetail: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  demoPanel: { flexDirection: 'row', gap: 11, padding: 14, borderRadius: radii.md, marginTop: 22, backgroundColor: 'rgba(45,212,255,0.07)', borderWidth: 1, borderColor: 'rgba(45,212,255,0.17)' },
  demoPanelIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(45,212,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  demoPanelTitle: { color: colors.white, fontSize: 13, fontWeight: '900' },
  demoPanelText: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  resetButton: { height: 48, marginTop: 12, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,94,108,0.25)', backgroundColor: 'rgba(255,94,108,0.07)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  resetText: { color: colors.red, fontSize: 12, fontWeight: '900' },
  version: { color: colors.textFaint, fontSize: 10, textAlign: 'center', marginTop: 18 },
});
