import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { barbers, services } from '../data/mockData';
import { colors, gradients, radii, spacing } from '../theme';
import { Appointment } from '../types';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { FadeIn } from '../components/FadeIn';

export function AppointmentsScreen({
  appointments,
  onCancel,
  onBookNew,
}: {
  appointments: Appointment[];
  onCancel: (id: string) => void;
  onBookNew: () => void;
}) {
  const { width } = useWindowDimensions();
  const narrow = width < 360;
  const [segment, setSegment] = useState<'upcoming' | 'past'>('upcoming');
  const visible = useMemo(
    () => appointments.filter((item) => (segment === 'upcoming' ? item.status === 'confirmed' : item.status !== 'confirmed')),
    [appointments, segment],
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <FadeIn>
        <Text style={styles.title}>Randevularım</Text>
        <Text style={styles.subtitle}>Yaklaşan randevularını yönet, geçmiş stillerini yeniden seç.</Text>
      </FadeIn>

      <FadeIn delay={70}>
        <View style={styles.segment}>
          <AnimatedPressable style={[styles.segmentButton, segment === 'upcoming' && styles.segmentActive]} onPress={() => setSegment('upcoming')}>
            <Text style={[styles.segmentText, segment === 'upcoming' && styles.segmentTextActive]}>Yaklaşan</Text>
          </AnimatedPressable>
          <AnimatedPressable style={[styles.segmentButton, segment === 'past' && styles.segmentActive]} onPress={() => setSegment('past')}>
            <Text style={[styles.segmentText, segment === 'past' && styles.segmentTextActive]}>Geçmiş</Text>
          </AnimatedPressable>
        </View>
      </FadeIn>

      <View style={styles.list}>
        {visible.map((appointment, index) => {
          const barber = barbers.find((item) => item.id === appointment.barberId);
          const service = services.find((item) => item.id === appointment.serviceId);
          if (!barber || !service) return null;
          const active = appointment.status === 'confirmed';

          return (
            <FadeIn key={appointment.id} delay={120 + index * 60}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Image source={{ uri: barber.image }} style={styles.avatar} />
                  <View style={styles.barberInfo}>
                    <Text numberOfLines={1} style={styles.barberName}>{barber.name}</Text>
                    <Text numberOfLines={1} style={styles.studio}>{barber.studio} · {barber.neighborhood}</Text>
                  </View>
                  <View style={[styles.status, { backgroundColor: active ? 'rgba(53,225,161,0.12)' : 'rgba(154,163,184,0.12)' }]}>
                    <View style={[styles.statusDot, { backgroundColor: active ? colors.green : colors.textMuted }]} />
                    <Text numberOfLines={1} style={[styles.statusText, { color: active ? colors.green : colors.textMuted }]}>
                      {appointment.status === 'confirmed' ? 'Onaylandı' : appointment.status === 'completed' ? 'Tamamlandı' : 'İptal'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailGrid}>
                  <View style={styles.detail}>
                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                    <View style={styles.detailText}><Text style={styles.detailLabel}>Tarih</Text><Text numberOfLines={1} style={styles.detailValue}>{appointment.dateLabel}</Text></View>
                  </View>
                  <View style={styles.detail}>
                    <Ionicons name="time-outline" size={20} color={colors.cyan} />
                    <View style={styles.detailText}><Text style={styles.detailLabel}>Saat</Text><Text numberOfLines={1} style={styles.detailValue}>{appointment.time}</Text></View>
                  </View>
                  <View style={styles.detail}>
                    <Ionicons name={service.icon as keyof typeof Ionicons.glyphMap} size={20} color={service.accent} />
                    <View style={styles.detailText}><Text style={styles.detailLabel}>Hizmet</Text><Text numberOfLines={1} style={styles.detailValue}>{service.title}</Text></View>
                  </View>
                  <View style={styles.detail}>
                    <Ionicons name="cash-outline" size={20} color={colors.amber} />
                    <View style={styles.detailText}><Text style={styles.detailLabel}>Tutar</Text><Text numberOfLines={1} style={styles.detailValue}>₺{service.price}</Text></View>
                  </View>
                </View>

                {active ? (
                  <View style={[styles.actions, narrow && styles.actionsNarrow]}>
                    <AnimatedPressable style={styles.secondaryAction} onPress={() => onCancel(appointment.id)}>
                      <Text numberOfLines={1} style={styles.secondaryText}>İptal Et</Text>
                    </AnimatedPressable>
                    <AnimatedPressable style={styles.primaryAction} onPress={onBookNew}>
                      <Text numberOfLines={1} style={styles.primaryText}>Yeniden Planla</Text>
                      <Ionicons name="calendar" size={16} color={colors.white} />
                    </AnimatedPressable>
                  </View>
                ) : (
                  <AnimatedPressable onPress={onBookNew}>
                    <LinearGradient colors={gradients.purple} style={styles.rebook}>
                      <Text numberOfLines={1} style={styles.rebookText}>Bu stili tekrar randevula</Text>
                      <Ionicons name="repeat" size={17} color={colors.white} />
                    </LinearGradient>
                  </AnimatedPressable>
                )}
              </View>
            </FadeIn>
          );
        })}
      </View>

      {visible.length === 0 && (
        <FadeIn delay={150}>
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Ionicons name="calendar-outline" size={34} color={colors.primary} /></View>
            <Text style={styles.emptyTitle}>{segment === 'upcoming' ? 'Yaklaşan randevun yok' : 'Geçmiş kaydı yok'}</Text>
            <Text style={styles.emptyText}>Demo berberlerden birini seçerek birkaç dokunuşta randevu oluştur.</Text>
            <AnimatedPressable onPress={onBookNew}>
              <LinearGradient colors={gradients.pink} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Randevu Bul</Text>
                <Ionicons name="arrow-forward" size={17} color={colors.white} />
              </LinearGradient>
            </AnimatedPressable>
          </View>
        </FadeIn>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingTop: 10, paddingBottom: 126 },
  title: { color: colors.white, fontSize: 27, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 18 },
  segment: { flexDirection: 'row', padding: 5, borderRadius: 17, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 16, gap: 5 },
  segmentButton: { flex: 1, minWidth: 0, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  segmentActive: { backgroundColor: colors.surfaceElevated },
  segmentText: { color: colors.textMuted, fontWeight: '800', fontSize: 13 },
  segmentTextActive: { color: colors.white },
  list: { gap: 13 },
  card: { padding: 15, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 50, height: 50, borderRadius: 17, flexShrink: 0 },
  barberInfo: { flex: 1, minWidth: 0 },
  barberName: { color: colors.white, fontSize: 16, fontWeight: '900' },
  studio: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  status: { maxWidth: 104, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 999, flexShrink: 0 },
  statusDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  statusText: { fontSize: 9, fontWeight: '900', flexShrink: 1 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 },
  detail: { width: '50%', minWidth: 0, paddingRight: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { flex: 1, minWidth: 0 },
  detailLabel: { color: colors.textFaint, fontSize: 9 },
  detailValue: { color: colors.text, fontSize: 12, fontWeight: '800', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 16 },
  actionsNarrow: { flexDirection: 'column' },
  secondaryAction: { flex: 1, minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  secondaryText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  primaryAction: { flex: 1.5, minHeight: 46, borderRadius: 14, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 12 },
  primaryText: { color: colors.white, fontSize: 12, fontWeight: '900' },
  rebook: { minHeight: 46, borderRadius: 14, marginTop: 16, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  rebookText: { color: colors.white, fontSize: 12, fontWeight: '900', flexShrink: 1 },
  empty: { marginTop: 28, padding: 28, borderRadius: radii.lg, alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  emptyIcon: { width: 70, height: 70, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,77,141,0.12)' },
  emptyTitle: { color: colors.white, fontSize: 18, fontWeight: '900', marginTop: 16, textAlign: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 6, marginBottom: 17 },
  emptyButton: { minHeight: 46, paddingHorizontal: 20, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 8 },
  emptyButtonText: { color: colors.white, fontSize: 12, fontWeight: '900' },
});
