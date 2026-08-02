import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, gradients, radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { getUserRoles, roleLabel } from './state';
import { ApplicationRole, V01DemoState } from './types';
import { MetricCard, PanelTitle, SectionHeader, StatusPill } from './PanelWidgets';

type Result = { ok: boolean; message: string };

export function AdminPanel({
  state,
  adminUserId,
  onDecision,
  onGrantRole,
  onRevokeRole,
  onResetDemo,
  onMessage,
}: {
  state: V01DemoState;
  adminUserId: string;
  onDecision: (applicationId: string, decision: 'approved' | 'rejected') => Result;
  onGrantRole: (userId: string, role: ApplicationRole) => Result;
  onRevokeRole: (userId: string, role: ApplicationRole) => Result;
  onResetDemo: () => Promise<Result>;
  onMessage: (message: string, success?: boolean) => void;
}) {
  const [tab, setTab] = useState<'applications' | 'users'>('applications');
  const [query, setQuery] = useState('');
  const pending = state.applications.filter((item) => item.status === 'pending');
  const businessCount = state.users.filter((user) => getUserRoles(state, user.id).includes('business')).length;
  const masterCount = state.users.filter((user) => getUserRoles(state, user.id).includes('master')).length;
  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr-TR');
    if (!normalized) return state.users;
    return state.users.filter((user) => `${user.fullName} ${user.email} ${user.phone}`.toLocaleLowerCase('tr-TR').includes(normalized));
  }, [query, state.users]);

  const act = (result: Result) => onMessage(result.message, result.ok);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <PanelTitle
        eyebrow="ADMIN PANELİ"
        title="Rol ve başvuru merkezi"
        text="v0.1 admin omurgası; işletme/usta başvurularını onaylar, kullanıcı rollerini yönetir ve doğru panele erişimi açar."
      />

      <LinearGradient colors={gradients.purple} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}><Ionicons name="shield-checkmark" size={29} color={colors.white} /></View>
          <StatusPill label="Admin Yetkisi Aktif" status="success" />
        </View>
        <Text style={styles.heroTitle}>DraBornStyle Yönetim</Text>
        <Text style={styles.heroText}>Test hesabı: draborneagle@gmail.com</Text>
        <View style={styles.heroSchema}><Text style={styles.heroSchemaText}>Rol kaynağı: dkd_user_role_access</Text></View>
      </LinearGradient>

      <View style={styles.metrics}>
        <MetricCard icon="people-outline" label="Toplam kullanıcı" value={String(state.users.length)} accent={colors.cyan} />
        <MetricCard icon="hourglass-outline" label="Bekleyen başvuru" value={String(pending.length)} accent={colors.amber} />
        <MetricCard icon="storefront-outline" label="İşletme / Usta" value={`${businessCount}/${masterCount}`} accent={colors.primary} />
      </View>

      <View style={styles.tabs}>
        <AnimatedPressable style={[styles.tab, tab === 'applications' && styles.tabActive]} onPress={() => setTab('applications')}>
          <Ionicons name="document-text-outline" size={18} color={tab === 'applications' ? colors.white : colors.textMuted} />
          <Text style={[styles.tabText, tab === 'applications' && styles.tabTextActive]}>Başvurular</Text>
          {pending.length > 0 && <View style={styles.countBadge}><Text style={styles.countText}>{pending.length}</Text></View>}
        </AnimatedPressable>
        <AnimatedPressable style={[styles.tab, tab === 'users' && styles.tabActive]} onPress={() => setTab('users')}>
          <Ionicons name="people-outline" size={18} color={tab === 'users' ? colors.white : colors.textMuted} />
          <Text style={[styles.tabText, tab === 'users' && styles.tabTextActive]}>Kullanıcılar</Text>
        </AnimatedPressable>
      </View>

      {tab === 'applications' ? (
        <>
          <SectionHeader title="Bekleyen başvurular" meta={`${pending.length} değerlendirme`} />
          {pending.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-done-circle-outline" size={35} color={colors.green} />
              <Text style={styles.emptyTitle}>Bekleyen başvuru yok</Text>
              <Text style={styles.emptyText}>Yeni usta veya işletme başvuruları burada görünecek.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {pending.map((application) => {
                const user = state.users.find((item) => item.id === application.userId);
                if (!user) return null;
                return (
                  <View key={application.id} style={styles.applicationCard}>
                    <View style={styles.applicationHeader}>
                      <View style={[styles.applicationIcon, { backgroundColor: application.requestedRole === 'master' ? 'rgba(45,212,255,0.12)' : 'rgba(255,182,72,0.12)' }]}>
                        <Ionicons name={application.requestedRole === 'master' ? 'cut-outline' : 'storefront-outline'} size={22} color={application.requestedRole === 'master' ? colors.cyan : colors.amber} />
                      </View>
                      <View style={styles.applicationInfo}>
                        <Text numberOfLines={1} style={styles.applicationUser}>{user.fullName}</Text>
                        <Text numberOfLines={1} style={styles.applicationEmail}>{user.email}</Text>
                      </View>
                      <StatusPill label={application.requestedRole === 'master' ? 'Usta' : 'İşletme'} status="warning" />
                    </View>
                    <View style={styles.applicationDetails}>
                      <DetailRow icon="business-outline" label="İşletme" value={application.businessName || 'Belirtilmedi'} />
                      <DetailRow icon="ribbon-outline" label="Uzmanlık" value={application.specialty || 'Belirtilmedi'} />
                      <DetailRow icon="time-outline" label="Deneyim" value={application.experienceYears ? `${application.experienceYears} yıl` : 'Belirtilmedi'} />
                    </View>
                    <Text style={styles.applicationNote}>{application.note || 'Başvuru notu yok.'}</Text>
                    <View style={styles.decisionRow}>
                      <AnimatedPressable style={styles.reject} onPress={() => act(onDecision(application.id, 'rejected'))}>
                        <Ionicons name="close-circle-outline" size={18} color={colors.red} />
                        <Text style={styles.rejectText}>Reddet</Text>
                      </AnimatedPressable>
                      <AnimatedPressable style={styles.approve} onPress={() => act(onDecision(application.id, 'approved'))}>
                        <Ionicons name="checkmark-circle-outline" size={18} color={colors.white} />
                        <Text style={styles.approveText}>Onayla ve Rolü Aç</Text>
                      </AnimatedPressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <SectionHeader title="Son değerlendirmeler" meta="Demo geçmiş" />
          <View style={styles.list}>
            {state.applications.filter((item) => item.status !== 'pending').slice(0, 5).map((application) => {
              const user = state.users.find((item) => item.id === application.userId);
              return (
                <View key={application.id} style={styles.historyCard}>
                  <View style={styles.historyInfo}>
                    <Text numberOfLines={1} style={styles.historyTitle}>{user?.fullName ?? 'Kullanıcı'} · {roleLabel(application.requestedRole)}</Text>
                    <Text style={styles.historyText}>{application.businessName || application.specialty || 'Rol başvurusu'}</Text>
                  </View>
                  <StatusPill label={application.status === 'approved' ? 'Onaylandı' : 'Reddedildi'} status={application.status === 'approved' ? 'success' : 'danger'} />
                </View>
              );
            })}
          </View>
        </>
      ) : (
        <>
          <SectionHeader title="Kullanıcı ve roller" meta={`${filteredUsers.length} sonuç`} />
          <View style={styles.searchBox}>
            <Ionicons name="search" size={19} color={colors.textMuted} />
            <TextInput value={query} onChangeText={setQuery} placeholder="Ad, e-posta veya telefon ara" placeholderTextColor={colors.textFaint} style={styles.searchInput} />
            {query.length > 0 && (
              <AnimatedPressable haptic={false} onPress={() => setQuery('')}><Ionicons name="close-circle" size={20} color={colors.textMuted} /></AnimatedPressable>
            )}
          </View>
          <View style={styles.list}>
            {filteredUsers.map((user) => {
              const roles = getUserRoles(state, user.id);
              const isProtectedAdmin = user.id === adminUserId || roles.includes('admin');
              return (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userHeader}>
                    <View style={[styles.userAvatar, { backgroundColor: user.avatarAccent }]}><Text style={styles.userAvatarText}>{initials(user.fullName)}</Text></View>
                    <View style={styles.userInfo}>
                      <Text numberOfLines={1} style={styles.userName}>{user.fullName}</Text>
                      <Text numberOfLines={1} style={styles.userEmail}>{user.email}</Text>
                    </View>
                    {isProtectedAdmin && <Ionicons name="shield-checkmark" size={20} color={colors.primary} />}
                  </View>
                  <View style={styles.roleChips}>
                    {roles.map((role) => (
                      <View key={role} style={styles.roleChip}><Text style={styles.roleChipText}>{roleLabel(role)}</Text></View>
                    ))}
                  </View>
                  {!isProtectedAdmin && (
                    <View style={styles.roleActions}>
                      <RoleAction
                        label="Usta"
                        active={roles.includes('master')}
                        accent={colors.cyan}
                        onPress={() => act(roles.includes('master') ? onRevokeRole(user.id, 'master') : onGrantRole(user.id, 'master'))}
                      />
                      <RoleAction
                        label="İşletme"
                        active={roles.includes('business')}
                        accent={colors.amber}
                        onPress={() => act(roles.includes('business') ? onRevokeRole(user.id, 'business') : onGrantRole(user.id, 'business'))}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </>
      )}

      <SectionHeader title="Demo yönetimi" meta="Yerel veri" />
      <AnimatedPressable
        style={styles.reset}
        onPress={async () => {
          const result = await onResetDemo();
          onMessage(result.message, result.ok);
        }}
      >
        <Ionicons name="refresh" size={20} color={colors.red} />
        <View style={styles.resetInfo}><Text style={styles.resetTitle}>v0.1 demo verilerini sıfırla</Text><Text style={styles.resetText}>Kullanıcı, rol, başvuru ve oturum verilerini ilk haline döndürür.</Text></View>
      </AnimatedPressable>
    </ScrollView>
  );
}

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function RoleAction({ label, active, accent, onPress }: { label: string; active: boolean; accent: string; onPress: () => void }) {
  return (
    <AnimatedPressable style={[styles.roleAction, active && { borderColor: accent, backgroundColor: `${accent}10` }]} onPress={onPress}>
      <Ionicons name={active ? 'remove-circle-outline' : 'add-circle-outline'} size={17} color={active ? colors.red : accent} />
      <Text style={[styles.roleActionText, active && { color: colors.white }]}>{active ? `${label} rolünü kaldır` : `${label} rolü ekle`}</Text>
    </AnimatedPressable>
  );
}

function initials(fullName: string) {
  return fullName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase('tr-TR')).join('');
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingTop: 10, paddingBottom: 34 },
  hero: { minHeight: 190, borderRadius: 28, padding: 18, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroIcon: { width: 50, height: 50, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.16)' },
  heroTitle: { color: colors.white, fontSize: 24, fontWeight: '900', marginTop: 18 },
  heroText: { color: 'rgba(255,255,255,0.82)', fontSize: 11, marginTop: 5 },
  heroSchema: { alignSelf: 'flex-start', marginTop: 16, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: 'rgba(8,10,16,0.2)' },
  heroSchemaText: { color: colors.white, fontSize: 9, fontWeight: '900' },
  metrics: { flexDirection: 'row', gap: 9, marginTop: 12 },
  tabs: { flexDirection: 'row', gap: 6, padding: 5, marginTop: 22, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 14 },
  tabActive: { backgroundColor: colors.surfaceElevated },
  tabText: { color: colors.textMuted, fontSize: 11, fontWeight: '900' },
  tabTextActive: { color: colors.white },
  countBadge: { minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  countText: { color: colors.white, fontSize: 9, fontWeight: '900' },
  list: { gap: 9 },
  empty: { padding: 28, alignItems: 'center', borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { color: colors.white, fontSize: 15, fontWeight: '900', marginTop: 10 },
  emptyText: { color: colors.textMuted, fontSize: 10, textAlign: 'center', marginTop: 5 },
  applicationCard: { padding: 14, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  applicationHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  applicationIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  applicationInfo: { flex: 1, minWidth: 0 },
  applicationUser: { color: colors.white, fontSize: 14, fontWeight: '900' },
  applicationEmail: { color: colors.textMuted, fontSize: 9.5, marginTop: 3 },
  applicationDetails: { gap: 7, marginTop: 13, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  detailRow: { minHeight: 24, flexDirection: 'row', alignItems: 'center', gap: 7 },
  detailLabel: { width: 58, color: colors.textFaint, fontSize: 9 },
  detailValue: { flex: 1, color: colors.text, fontSize: 10, fontWeight: '800' },
  applicationNote: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 11, padding: 11, borderRadius: 14, backgroundColor: colors.surface },
  decisionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  reject: { flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, backgroundColor: 'rgba(255,94,108,0.08)', borderWidth: 1, borderColor: 'rgba(255,94,108,0.18)' },
  rejectText: { color: colors.red, fontSize: 11, fontWeight: '900' },
  approve: { flex: 1.7, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, backgroundColor: colors.green },
  approveText: { color: colors.white, fontSize: 11, fontWeight: '900' },
  historyCard: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  historyInfo: { flex: 1, minWidth: 0 },
  historyTitle: { color: colors.white, fontSize: 12, fontWeight: '900' },
  historyText: { color: colors.textMuted, fontSize: 9.5, marginTop: 3 },
  searchBox: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 13, marginBottom: 11, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, color: colors.white, fontSize: 13, paddingVertical: 11 },
  userCard: { padding: 13, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  userHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userAvatar: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userAvatarText: { color: colors.white, fontSize: 13, fontWeight: '900' },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { color: colors.white, fontSize: 13, fontWeight: '900' },
  userEmail: { color: colors.textMuted, fontSize: 9.5, marginTop: 3 },
  roleChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 11 },
  roleChip: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: radii.pill, backgroundColor: colors.surfaceElevated },
  roleChipText: { color: colors.text, fontSize: 9, fontWeight: '900' },
  roleActions: { flexDirection: 'row', gap: 7, marginTop: 11 },
  roleAction: { flex: 1, minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 8, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  roleActionText: { color: colors.textMuted, fontSize: 9, fontWeight: '800', textAlign: 'center', flexShrink: 1 },
  reset: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: radii.md, backgroundColor: 'rgba(255,94,108,0.07)', borderWidth: 1, borderColor: 'rgba(255,94,108,0.18)' },
  resetInfo: { flex: 1, minWidth: 0 },
  resetTitle: { color: colors.red, fontSize: 12, fontWeight: '900' },
  resetText: { color: colors.textMuted, fontSize: 9.5, lineHeight: 14, marginTop: 3 },
});
