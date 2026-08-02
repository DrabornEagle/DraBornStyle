import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, gradients, radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { DemoUser, MasterPresence } from './types';
import { ActionCard, MetricCard, PanelTitle, SectionHeader, StatusPill } from './PanelWidgets';

type Result = { ok: boolean; message: string };

export function MasterPanel({
  user,
  presence,
  onPresence,
  onMessage,
}: {
  user: DemoUser;
  presence: MasterPresence;
  onPresence: (presence: MasterPresence) => Result;
  onMessage: (message: string, success?: boolean) => void;
}) {
  const setPresence = (next: MasterPresence) => {
    const result = onPresence(next);
    onMessage(result.message, result.ok);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <PanelTitle
        eyebrow="USTA PANELİ"
        title="Çalışma alanın hazır"
        text="v0.1 usta paneli rol onayı, yönlendirme ve temel çalışma durumunu doğrular. İşlem başlat/bitir sistemi v0.2.17’de açılacak."
      />

      <LinearGradient colors={gradients.cyan} style={styles.hero}>
        <View style={styles.heroHeader}>
          <View style={styles.heroIcon}><Ionicons name="cut" size={27} color={colors.white} /></View>
          <StatusPill
            label={presence === 'available' ? 'Uygun' : presence === 'busy' ? 'Meşgul' : 'Çevrimdışı'}
            status={presence === 'available' ? 'success' : presence === 'busy' ? 'warning' : 'neutral'}
          />
        </View>
        <Text style={styles.heroTitle}>{user.fullName}</Text>
        <Text style={styles.heroText}>{user.specialty || 'Uzmanlık bilgisi demo profilde tanımlı'} · {user.businessName || 'Bağımsız usta'}</Text>
        <Text style={styles.heroFoot}>Usta rolü admin onayı ile `dkd_user_role_access` üzerinden aktif.</Text>
      </LinearGradient>

      <SectionHeader title="Anlık durum" meta="v0.1 temel kontrol" />
      <View style={styles.presenceRow}>
        <PresenceButton icon="checkmark-circle-outline" label="Uygun" active={presence === 'available'} accent={colors.green} onPress={() => setPresence('available')} />
        <PresenceButton icon="remove-circle-outline" label="Meşgul" active={presence === 'busy'} accent={colors.amber} onPress={() => setPresence('busy')} />
        <PresenceButton icon="moon-outline" label="Kapalı" active={presence === 'offline'} accent={colors.textMuted} onPress={() => setPresence('offline')} />
      </View>

      <View style={styles.metrics}>
        <MetricCard icon="calendar-outline" label="Bugünkü randevu" value="0" accent={colors.primary} />
        <MetricCard icon="cut-outline" label="Aktif işlem" value="0" accent={colors.cyan} />
        <MetricCard icon="wallet-outline" label="Günlük kazanç" value="₺0" accent={colors.amber} />
      </View>

      <SectionHeader title="v0.1 panel omurgası" meta="Hazır" />
      <View style={styles.checklist}>
        <ChecklistItem title="Usta rol erişimi" detail="Admin onayı sonrası panele yönlendirme" done />
        <ChecklistItem title="Rol değiştirme" detail="Müşteri ve usta panelleri arasında geçiş" done />
        <ChecklistItem title="Temel profil bilgileri" detail="İşletme ve uzmanlık alanı görünümü" done />
        <ChecklistItem title="Çalışma durumu" detail="Uygun, meşgul veya çevrimdışı seçimi" done />
      </View>

      <SectionHeader title="Sonraki işlem araçları" meta="v0.2.17" />
      <View style={styles.list}>
        <ActionCard icon="play-circle-outline" title="Tıraşa / İşleme Başladım" text="Tek tuşla aktif işlem oluşturma ve ustayı meşgule alma." accent={colors.green} locked />
        <ActionCard icon="stop-circle-outline" title="İşlem Bitti" text="Son fiyat kontrolü, işlem kaydı ve platform bedeli." accent={colors.red} locked />
        <ActionCard icon="person-add-outline" title="Çat kapı müşteri ekle" text="Randevusuz veya direkt arayan müşteriyi hızlı ekleme." accent={colors.primary} locked />
        <ActionCard icon="qr-code-outline" title="QR ve indirim kodu" text="v0.2.17 QR kaynakları ve özel müşteri indirimi." accent={colors.secondary} locked />
      </View>

      <View style={styles.info}>
        <Ionicons name="information-circle-outline" size={20} color={colors.cyan} />
        <Text style={styles.infoText}>Bu ekrandaki sayaçlar v0.1 demo değerleridir. İşlem ve kazanç kayıtları v0.2.17 demo verileriyle güncellenecek.</Text>
      </View>
    </ScrollView>
  );
}

function PresenceButton({ icon, label, active, accent, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; active: boolean; accent: string; onPress: () => void }) {
  return (
    <AnimatedPressable style={[styles.presence, active && { borderColor: accent, backgroundColor: `${accent}12` }]} onPress={onPress}>
      <Ionicons name={icon} size={21} color={active ? accent : colors.textFaint} />
      <Text style={[styles.presenceText, active && { color: colors.white }]}>{label}</Text>
    </AnimatedPressable>
  );
}

function ChecklistItem({ title, detail, done }: { title: string; detail: string; done: boolean }) {
  return (
    <View style={styles.checkItem}>
      <View style={[styles.checkIcon, done && styles.checkIconDone]}>
        <Ionicons name={done ? 'checkmark' : 'time-outline'} size={18} color={done ? colors.white : colors.textFaint} />
      </View>
      <View style={styles.checkText}><Text style={styles.checkTitle}>{title}</Text><Text style={styles.checkDetail}>{detail}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingTop: 10, paddingBottom: 34 },
  hero: { minHeight: 185, borderRadius: 28, padding: 18, overflow: 'hidden' },
  heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroIcon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.16)' },
  heroTitle: { color: colors.white, fontSize: 23, fontWeight: '900', marginTop: 17 },
  heroText: { color: 'rgba(255,255,255,0.84)', fontSize: 11, marginTop: 5 },
  heroFoot: { color: 'rgba(255,255,255,0.7)', fontSize: 9, lineHeight: 14, marginTop: 15 },
  presenceRow: { flexDirection: 'row', gap: 8 },
  presence: { flex: 1, minHeight: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  presenceText: { color: colors.textMuted, fontSize: 10, fontWeight: '900' },
  metrics: { flexDirection: 'row', gap: 9, marginTop: 12 },
  checklist: { gap: 8 },
  checkItem: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  checkIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceElevated },
  checkIconDone: { backgroundColor: colors.green },
  checkText: { flex: 1, minWidth: 0 },
  checkTitle: { color: colors.white, fontSize: 12, fontWeight: '900' },
  checkDetail: { color: colors.textMuted, fontSize: 9.5, marginTop: 3 },
  list: { gap: 9 },
  info: { flexDirection: 'row', gap: 9, padding: 12, marginTop: 20, borderRadius: 16, backgroundColor: 'rgba(45,212,255,0.07)' },
  infoText: { flex: 1, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
});
