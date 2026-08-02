import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, gradients, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { DemoUser, UserRole } from './types';
import { roleIcon, roleLabel } from './state';

export function PanelShell({
  user,
  roles,
  activeRole,
  onRolePress,
  onLogout,
  children,
}: {
  user: DemoUser;
  roles: UserRole[];
  activeRole: UserRole;
  onRolePress: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.orbPink} />
      <View style={styles.orbCyan} />
      <View style={styles.header}>
        <View style={styles.identity}>
          <LinearGradient colors={gradients.hero} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user.fullName)}</Text>
          </LinearGradient>
          <View style={styles.identityText}>
            <Text numberOfLines={1} style={styles.name}>{user.fullName}</Text>
            <Text numberOfLines={1} style={styles.email}>{user.email}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <AnimatedPressable style={styles.roleButton} onPress={onRolePress}>
            <Ionicons name={roleIcon(activeRole) as keyof typeof Ionicons.glyphMap} size={17} color={colors.white} />
            <Text numberOfLines={1} style={styles.roleText}>{roleLabel(activeRole)}</Text>
            {roles.length > 1 && <Ionicons name="chevron-down" size={14} color={colors.textMuted} />}
          </AnimatedPressable>
          <AnimatedPressable style={styles.logout} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.red} />
          </AnimatedPressable>
        </View>
      </View>
      <View style={styles.versionRow}>
        <View style={styles.versionBadge}>
          <View style={styles.versionDot} />
          <Text style={styles.versionText}>v0.1 Final · Demo Modu</Text>
        </View>
        <Text style={styles.schema}>dkd_user_role_access</Text>
      </View>
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

function initials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase('tr-TR'))
    .join('');
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  orbPink: { position: 'absolute', width: 210, height: 210, borderRadius: 105, backgroundColor: 'rgba(255,77,141,0.08)', right: -120, top: 10 },
  orbCyan: { position: 'absolute', width: 170, height: 170, borderRadius: 85, backgroundColor: 'rgba(45,212,255,0.06)', left: -100, top: 240 },
  header: { minHeight: 72, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  identity: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 46, height: 46, borderRadius: 17, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  identityText: { flex: 1, minWidth: 0 },
  name: { color: colors.white, fontSize: 15, fontWeight: '900' },
  email: { color: colors.textMuted, fontSize: 9.5, marginTop: 3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 0 },
  roleButton: { maxWidth: 132, minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, borderRadius: 15, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  roleText: { color: colors.white, fontSize: 10, fontWeight: '900', flexShrink: 1 },
  logout: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,94,108,0.08)', borderWidth: 1, borderColor: 'rgba(255,94,108,0.18)' },
  versionRow: { paddingHorizontal: spacing.md, paddingBottom: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  versionBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  versionDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green },
  versionText: { color: colors.textMuted, fontSize: 9, fontWeight: '800' },
  schema: { color: colors.textFaint, fontSize: 8.5, fontWeight: '700' },
  body: { flex: 1 },
});
