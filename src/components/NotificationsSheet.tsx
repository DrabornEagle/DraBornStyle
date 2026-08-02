import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

const notifications = [
  { id: '1', icon: 'calendar' as const, accent: colors.primary, title: 'Randevun yarın 16:30’da', detail: 'Blade District · Arda Yılmaz', time: '2 dk önce', unread: true },
  { id: '2', icon: 'gift' as const, accent: colors.amber, title: '120 Style Puanı kazandın', detail: 'Yeni ödülleri keşfetmeye hazırsın.', time: '1 saat önce', unread: true },
  { id: '3', icon: 'flash' as const, accent: colors.cyan, title: 'Yakınında sıra beklemeyen berber', detail: 'Gentleman Garage şu an müsait.', time: 'Dün', unread: false },
];

export function NotificationsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <AnimatedPressable haptic={false} style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View><Text style={styles.title}>Bildirimler</Text><Text style={styles.subtitle}>Demo hatırlatmalar ve fırsatlar</Text></View>
            <AnimatedPressable style={styles.close} onPress={onClose}><Ionicons name="close" size={22} color={colors.white} /></AnimatedPressable>
          </View>
          <ScrollView contentContainerStyle={styles.list}>
            {notifications.map((item) => (
              <View key={item.id} style={styles.notification}>
                <View style={[styles.icon, { backgroundColor: `${item.accent}18` }]}><Ionicons name={item.icon} size={21} color={item.accent} /></View>
                <View style={{ flex: 1 }}><Text style={styles.notificationTitle}>{item.title}</Text><Text style={styles.detail}>{item.detail}</Text><Text style={styles.time}>{item.time}</Text></View>
                {item.unread && <View style={styles.unread} />}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(4,6,12,0.72)' },
  sheet: { maxHeight: '72%', minHeight: 420, backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, borderColor: colors.border },
  handle: { width: 52, height: 5, borderRadius: 3, backgroundColor: colors.textFaint, alignSelf: 'center', marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  title: { color: colors.white, fontSize: 22, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  close: { width: 40, height: 40, borderRadius: 16, backgroundColor: colors.cardSoft, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: spacing.md, paddingBottom: 30, gap: 10 },
  notification: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  icon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  notificationTitle: { color: colors.white, fontSize: 13, fontWeight: '900' },
  detail: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  time: { color: colors.textFaint, fontSize: 9, marginTop: 6 },
  unread: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
