import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';

export function PanelTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <View style={styles.titleWrap}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

export function MetricCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <View style={styles.metric}>
      <View style={[styles.metricIcon, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text numberOfLines={2} style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function ActionCard({
  icon,
  title,
  text,
  accent,
  locked = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  accent: string;
  locked?: boolean;
  onPress?: () => void;
}) {
  return (
    <AnimatedPressable style={[styles.action, locked && styles.actionLocked]} disabled={!onPress} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={locked ? 'lock-closed-outline' : icon} size={22} color={locked ? colors.textFaint : accent} />
      </View>
      <View style={styles.actionText}>
        <Text style={[styles.actionTitle, locked && styles.lockedText]}>{title}</Text>
        <Text style={styles.actionDetail}>{text}</Text>
      </View>
      <Ionicons name={locked ? 'hourglass-outline' : 'chevron-forward'} size={18} color={colors.textFaint} />
    </AnimatedPressable>
  );
}

export function SectionHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {meta ? <Text style={styles.sectionMeta}>{meta}</Text> : null}
    </View>
  );
}

export function StatusPill({ label, status }: { label: string; status: 'success' | 'warning' | 'danger' | 'neutral' }) {
  const accent = status === 'success' ? colors.green : status === 'warning' ? colors.amber : status === 'danger' ? colors.red : colors.textMuted;
  return (
    <View style={[styles.status, { backgroundColor: `${accent}16` }]}>
      <View style={[styles.statusDot, { backgroundColor: accent }]} />
      <Text style={[styles.statusText, { color: accent }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleWrap: { marginBottom: 18 },
  eyebrow: { color: colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: colors.white, fontSize: 28, lineHeight: 33, fontWeight: '900', marginTop: 5 },
  text: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  metric: { flex: 1, minWidth: 0, minHeight: 124, padding: 13, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  metricIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  metricValue: { color: colors.white, fontSize: 22, fontWeight: '900', marginTop: 11 },
  metricLabel: { color: colors.textMuted, fontSize: 9.5, lineHeight: 14, marginTop: 3 },
  action: { width: '100%', minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  actionLocked: { opacity: 0.72 },
  actionIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actionText: { flex: 1, minWidth: 0 },
  actionTitle: { color: colors.white, fontSize: 13, fontWeight: '900' },
  lockedText: { color: colors.textMuted },
  actionDetail: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  sectionHeader: { marginTop: 23, marginBottom: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  sectionTitle: { color: colors.white, fontSize: 18, fontWeight: '900' },
  sectionMeta: { color: colors.textMuted, fontSize: 10, fontWeight: '800' },
  status: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 9, fontWeight: '900' },
});
