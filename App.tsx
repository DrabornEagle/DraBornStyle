import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/theme';
import { AuthScreen } from './src/v01/AuthScreen';
import { ApplicationSheet } from './src/v01/ApplicationSheet';
import { AdminPanel } from './src/v01/AdminPanel';
import { BusinessPanel } from './src/v01/BusinessPanel';
import { CustomerPanel } from './src/v01/CustomerPanel';
import { MasterPanel } from './src/v01/MasterPanel';
import { PanelShell } from './src/v01/PanelShell';
import { RoleSwitcherSheet } from './src/v01/RoleSwitcherSheet';
import { ApplicationRole } from './src/v01/types';
import { useV01Demo } from './src/v01/useV01Demo';

type ToastState = { message: string; success: boolean } | null;

function DraBornStyleV01() {
  const demo = useV01Demo();
  const [roleSheetVisible, setRoleSheetVisible] = useState(false);
  const [applicationVisible, setApplicationVisible] = useState(false);
  const [applicationRole, setApplicationRole] = useState<ApplicationRole>('master');
  const [toast, setToast] = useState<ToastState>(null);
  const toastY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (!toast) return;
    toastY.setValue(-100);
    Animated.sequence([
      Animated.spring(toastY, { toValue: 0, useNativeDriver: true, speed: 22, bounciness: 3 }),
      Animated.delay(2200),
      Animated.timing(toastY, { toValue: -100, duration: 220, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [toast, toastY]);

  const showMessage = (message: string, success = true) => setToast({ message, success });

  if (!demo.hydrated) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadingIcon}><Ionicons name="cut" size={31} color={colors.white} /></View>
        <Text style={styles.loadingTitle}>DraBornStyle</Text>
        <Text style={styles.loadingText}>v0.1 rol ve panel omurgası hazırlanıyor…</Text>
      </View>
    );
  }

  const user = demo.currentUser;
  const activeRole = demo.activeRole;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {!user || !activeRole ? (
        <AuthScreen onLogin={demo.login} onRegister={demo.register} onMessage={showMessage} />
      ) : (
        <PanelShell
          user={user}
          roles={demo.currentRoles}
          activeRole={activeRole}
          onRolePress={() => setRoleSheetVisible(true)}
          onLogout={() => {
            const result = demo.signOut();
            showMessage(result.message, result.ok);
          }}
        >
          {activeRole === 'customer' && (
            <CustomerPanel
              user={user}
              applications={demo.state.applications.filter((item) => item.userId === user.id)}
              onApplyMaster={() => {
                setApplicationRole('master');
                setApplicationVisible(true);
              }}
              onApplyBusiness={() => {
                setApplicationRole('business');
                setApplicationVisible(true);
              }}
            />
          )}

          {activeRole === 'master' && (
            <MasterPanel
              user={user}
              presence={demo.state.masterPresenceByUser[user.id] ?? 'offline'}
              onPresence={demo.changeMasterPresence}
              onMessage={showMessage}
            />
          )}

          {activeRole === 'business' && <BusinessPanel user={user} />}

          {activeRole === 'admin' && (
            <AdminPanel
              state={demo.state}
              adminUserId={user.id}
              onDecision={demo.decideApplication}
              onGrantRole={demo.addRole}
              onRevokeRole={demo.removeRole}
              onResetDemo={demo.resetDemo}
              onMessage={showMessage}
            />
          )}
        </PanelShell>
      )}

      {user && activeRole && (
        <>
          <RoleSwitcherSheet
            visible={roleSheetVisible}
            roles={demo.currentRoles}
            activeRole={activeRole}
            onSelect={(role) => {
              const result = demo.changeRole(role);
              showMessage(result.message, result.ok);
            }}
            onClose={() => setRoleSheetVisible(false)}
          />
          <ApplicationSheet
            visible={applicationVisible}
            initialRole={applicationRole}
            onClose={() => setApplicationVisible(false)}
            onSubmit={demo.applyForRole}
            onMessage={showMessage}
          />
        </>
      )}

      {toast && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            toast.success ? styles.toastSuccess : styles.toastError,
            { transform: [{ translateY: toastY }] },
          ]}
        >
          <View style={[styles.toastIcon, { backgroundColor: toast.success ? colors.green : colors.red }]}>
            <Ionicons name={toast.success ? 'checkmark' : 'alert'} size={18} color={colors.white} />
          </View>
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DraBornStyleV01 />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  loadingIcon: { width: 76, height: 76, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  loadingTitle: { color: colors.white, fontSize: 25, fontWeight: '900', marginTop: 15 },
  loadingText: { color: colors.textMuted, fontSize: 11, marginTop: 5 },
  toast: { position: 'absolute', top: 52, left: 14, right: 14, zIndex: 100, minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 11, borderRadius: 18, backgroundColor: colors.surfaceElevated, borderWidth: 1 },
  toastSuccess: { borderColor: 'rgba(53,225,161,0.32)' },
  toastError: { borderColor: 'rgba(255,94,108,0.32)' },
  toastIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  toastText: { flex: 1, color: colors.white, fontSize: 11, lineHeight: 16, fontWeight: '800' },
});
