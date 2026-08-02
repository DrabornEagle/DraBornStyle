import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { roleIcon, roleLabel } from './state';
import { UserRole } from './types';

const roleDescriptions: Record<UserRole, string> = {
  customer: 'İşletme ve randevu deneyiminin müşteri tarafı.',
  master: 'Usta paneli ve günlük çalışma omurgası.',
  business: 'İşletme, ekip ve hizmet yönetimi omurgası.',
  admin: 'Başvuru, kullanıcı ve rol yönetimi.',
};

export function RoleSwitcherSheet({
  visible,
  roles,
  activeRole,
  onSelect,
  onClose,
}: {
  visible: boolean;
  roles: UserRole[];
  activeRole: UserRole;
  onSelect: (role: UserRole) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <AnimatedPressable haptic={false} style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 14) + 14 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>ROL ERİŞİMLERİN</Text>
              <Text style={styles.title}>Panel seç</Text>
            </View>
            <AnimatedPressable style={styles.close} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.white} />
            </AnimatedPressable>
          </View>
          <View style={styles.list}>
            {roles.map((role) => {
              const selected = activeRole === role;
              return (
                <AnimatedPressable
                  key={role}
                  style={[styles.roleCard, selected && styles.roleCardActive]}
                  onPress={() => {
                    onSelect(role);
                    onClose();
                  }}
                >
                  <View style={[styles.icon, selected && styles.iconActive]}>
                    <Ionicons name={roleIcon(role) as keyof typeof Ionicons.glyphMap} size={22} color={selected ? colors.white : colors.primary} />
                  </View>
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleName}>{roleLabel(role)} Paneli</Text>
                    <Text style={styles.roleDescription}>{roleDescriptions[role]}</Text>
                  </View>
                  <Ionicons name={selected ? 'checkmark-circle' : 'chevron-forward'} size={21} color={selected ? colors.green : colors.textFaint} />
                </AnimatedPressable>
              );
            })}
          </View>
          <View style={styles.note}>
            <Ionicons name="information-circle-outline" size={19} color={colors.cyan} />
            <Text style={styles.noteText}>Kayıt olan kullanıcı her zaman müşteri rolünü korur. Ek roller yalnızca admin onayıyla açılır.</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: { paddingHorizontal: spacing.md, paddingTop: 10, backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, borderColor: colors.border },
  handle: { width: 54, height: 5, borderRadius: 3, backgroundColor: colors.textFaint, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 17, marginBottom: 15 },
  eyebrow: { color: colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: colors.white, fontSize: 23, fontWeight: '900', marginTop: 3 },
  close: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  list: { gap: 9 },
  roleCard: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  roleCardActive: { borderColor: 'rgba(53,225,161,0.35)', backgroundColor: 'rgba(53,225,161,0.07)' },
  icon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,77,141,0.11)' },
  iconActive: { backgroundColor: colors.green },
  roleInfo: { flex: 1, minWidth: 0 },
  roleName: { color: colors.white, fontSize: 14, fontWeight: '900' },
  roleDescription: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  note: { flexDirection: 'row', gap: 9, marginTop: 15, padding: 12, borderRadius: 16, backgroundColor: 'rgba(45,212,255,0.07)' },
  noteText: { flex: 1, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
});
