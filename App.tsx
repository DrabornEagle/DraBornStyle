import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PrivacyCenterSheet } from './src/components/PrivacyCenterSheet';
import { colors } from './src/theme';
import { ApplicationSheet } from './src/v01/ApplicationSheet';
import { AuthScreen } from './src/v01/AuthScreen';
import { PanelShell } from './src/v01/PanelShell';
import { RoleSwitcherSheet } from './src/v01/RoleSwitcherSheet';
import { ApplicationRole } from './src/v01/types';
import { useV01Demo } from './src/v01/useV01Demo';
import { PaymentSheet } from './src/v02/PaymentSheet';
import { getActiveTransaction, getBusinessFinancials, getBusinessForOwner } from './src/v02/state';
import { TransactionSheet } from './src/v02/TransactionSheet';
import { StartTransactionInput } from './src/v02/types';
import { useV02Demo } from './src/v02/useV02Demo';
import { AppointmentSheet } from './src/v03/AppointmentSheet';
import { V03CustomerPanel } from './src/v03/CustomerPanel';
import { V03AdminPanel, V03BusinessPanel, V03MasterPanel } from './src/v03/RolePanels';
import { V03Appointment } from './src/v03/types';
import { useV03Demo } from './src/v03/useV03Demo';

type ToastState = { message: string; success: boolean } | null;
type Result = { ok: boolean; message: string };

function DraBornStyleV04() {
  const access = useV01Demo();
  const operations = useV02Demo();
  const appointments = useV03Demo();
  const [roleSheetVisible, setRoleSheetVisible] = useState(false);
  const [applicationVisible, setApplicationVisible] = useState(false);
  const [applicationRole, setApplicationRole] = useState<ApplicationRole>('master');
  const [transactionVisible, setTransactionVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [appointmentVisible, setAppointmentVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const toastY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (!toast) return;
    toastY.setValue(-100);
    Animated.sequence([
      Animated.spring(toastY, { toValue: 0, useNativeDriver: true, speed: 22, bounciness: 3 }),
      Animated.delay(2400),
      Animated.timing(toastY, { toValue: -100, duration: 220, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [toast, toastY]);

  const showMessage = (message: string, success = true) => setToast({ message, success });

  if (!access.hydrated || !operations.hydrated || !appointments.hydrated) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadingIcon}><Ionicons name="shield-checkmark" size={31} color={colors.white} /></View>
        <Text style={styles.loadingTitle}>DraBornStyle</Text>
        <Text style={styles.loadingText}>v0.4 gizlilik, randevu ve işlem merkezi hazırlanıyor…</Text>
      </View>
    );
  }

  const user = access.currentUser;
  const activeRole = access.activeRole;
  const activeTransaction = user && activeRole === 'master' ? getActiveTransaction(operations.state, user.id) : null;
  const ownerBusiness = user && activeRole === 'business' ? getBusinessForOwner(operations.state, user.id) : null;
  const ownerFinancials = ownerBusiness ? getBusinessFinancials(operations.state, ownerBusiness.id) : null;

  const startTransaction = (input: StartTransactionInput): Result => {
    const response = operations.start(input);
    if (response.ok) access.changeMasterPresence('busy');
    return response;
  };

  const startAppointment = (appointment: V03Appointment): Result => {
    const response = startTransaction({
      masterUserId: appointment.masterUserId,
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone,
      serviceId: appointment.serviceId,
      source: 'appointment',
    });
    if (!response.ok) return response;
    const statusResponse = appointments.setStatus(appointment.id, 'in_service', 'master', 'Usta tek tuşla işlemi başlattı.');
    if (!statusResponse.ok) return statusResponse;
    return { ok: true, message: `${appointment.customerName} için işlem başlatıldı ve randevu İşlemde oldu.` };
  };

  const finishTransaction = (transactionId: string, editedPriceTl: number, discountCode?: string): Result => {
    const response = operations.finish(transactionId, editedPriceTl, discountCode);
    if (!response.ok) return response;
    access.changeMasterPresence('available');
    const transaction = operations.state.transactions.find((item) => item.id === transactionId);
    const linked = appointments.state.appointments.find(
      (item) => item.status === 'in_service' && item.masterUserId === transaction?.masterUserId && item.customerPhone === transaction?.customerPhone,
    );
    if (linked) appointments.setStatus(linked.id, 'completed', 'master', 'İşlem tamamlandı ve v0.2 işlem kaydına yansıdı.');
    return response;
  };

  const cancelTransaction = (transactionId: string): Result => {
    const response = operations.cancel(transactionId);
    if (!response.ok) return response;
    access.changeMasterPresence('available');
    const transaction = operations.state.transactions.find((item) => item.id === transactionId);
    const linked = appointments.state.appointments.find(
      (item) => item.status === 'in_service' && item.masterUserId === transaction?.masterUserId && item.customerPhone === transaction?.customerPhone,
    );
    if (linked) appointments.setStatus(linked.id, 'cancelled', 'master', 'Aktif işlem iptal edildi.');
    return response;
  };

  const deleteLocalData = async () => {
    await appointments.reset();
    await operations.reset();
    await access.resetDemo();
    setPrivacyVisible(false);
    showMessage('Yerel hesap ve kullanıcı verileri silindi; başlangıç demo durumu geri yüklendi.', true);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {!user || !activeRole ? (
        <AuthScreen onLogin={access.login} onRegister={access.register} onMessage={showMessage} />
      ) : (
        <PanelShell
          user={user}
          roles={access.currentRoles}
          activeRole={activeRole}
          onRolePress={() => setRoleSheetVisible(true)}
          onPrivacyPress={() => setPrivacyVisible(true)}
          onLogout={() => {
            const response = access.signOut();
            showMessage(response.message, response.ok);
          }}
        >
          {activeRole === 'customer' && (
            <V03CustomerPanel
              user={user}
              applications={access.state.applications.filter((item) => item.userId === user.id)}
              operationsState={operations.state}
              appointmentState={appointments.state}
              onOpenAppointment={() => setAppointmentVisible(true)}
              onStatus={(appointmentId, status) => appointments.setStatus(appointmentId, status, 'customer')}
              onApplyMaster={() => {
                setApplicationRole('master');
                setApplicationVisible(true);
              }}
              onApplyBusiness={() => {
                setApplicationRole('business');
                setApplicationVisible(true);
              }}
              onScanQr={operations.scanQr}
              onMessage={showMessage}
            />
          )}

          {activeRole === 'master' && (
            <V03MasterPanel
              operationsProps={{
                user,
                presence: access.state.masterPresenceByUser[user.id] ?? 'offline',
                state: operations.state,
                onPresence: access.changeMasterPresence,
                onOpenTransaction: () => setTransactionVisible(true),
                onAddDiscount: (code, percent) => operations.addDiscountCode(user.id, code, percent),
                onToggleDiscount: operations.toggleDiscount,
                onScanQr: operations.scanQr,
                onMessage: showMessage,
              }}
              appointmentState={appointments.state}
              operationsState={operations.state}
              onStatus={(appointmentId, status) => appointments.setStatus(appointmentId, status, 'master')}
              onStartAppointment={startAppointment}
              onMessage={showMessage}
            />
          )}

          {activeRole === 'business' && (
            <V03BusinessPanel
              operationsProps={{
                user,
                state: operations.state,
                onChangeServicePrice: operations.setServicePrice,
                onOpenPayment: () => setPaymentVisible(true),
                onScanQr: operations.scanQr,
                onMessage: showMessage,
              }}
              appointmentState={appointments.state}
              operationsState={operations.state}
            />
          )}

          {activeRole === 'admin' && (
            <V03AdminPanel
              operationsProps={{
                v01State: access.state,
                v02State: operations.state,
                adminUserId: user.id,
                onApplicationDecision: access.decideApplication,
                onGrantRole: access.addRole,
                onRevokeRole: access.removeRole,
                onResetV01: access.resetDemo,
                onPaymentDecision: operations.decidePayment,
                onPlatformFee: operations.setPlatformFee,
                onResetV02: operations.reset,
                onMessage: showMessage,
              }}
              appointmentState={appointments.state}
              operationsState={operations.state}
              onResetV03={appointments.reset}
              onMessage={showMessage}
            />
          )}
        </PanelShell>
      )}

      {user && activeRole && (
        <>
          <RoleSwitcherSheet
            visible={roleSheetVisible}
            roles={access.currentRoles}
            activeRole={activeRole}
            onSelect={(role) => {
              const response = access.changeRole(role);
              showMessage(response.message, response.ok);
            }}
            onClose={() => setRoleSheetVisible(false)}
          />
          <ApplicationSheet
            visible={applicationVisible}
            initialRole={applicationRole}
            onClose={() => setApplicationVisible(false)}
            onSubmit={access.applyForRole}
            onMessage={showMessage}
          />
        </>
      )}

      {user && activeRole === 'customer' && (
        <AppointmentSheet
          visible={appointmentVisible}
          user={user}
          operationsState={operations.state}
          appointmentState={appointments.state}
          onClose={() => setAppointmentVisible(false)}
          onCreate={appointments.create}
          onMessage={showMessage}
        />
      )}

      {user && activeRole === 'master' && (
        <TransactionSheet
          visible={transactionVisible}
          state={operations.state}
          masterUserId={user.id}
          activeTransaction={activeTransaction}
          onClose={() => setTransactionVisible(false)}
          onStart={startTransaction}
          onFinish={finishTransaction}
          onCancel={cancelTransaction}
          onMessage={showMessage}
        />
      )}

      {ownerBusiness && ownerFinancials && (
        <PaymentSheet
          visible={paymentVisible}
          businessName={ownerBusiness.name}
          outstandingTl={ownerFinancials.outstandingTl}
          onClose={() => setPaymentVisible(false)}
          onSubmit={(amountTl) => operations.sendPaymentNotice(ownerBusiness.id, amountTl)}
          onMessage={showMessage}
        />
      )}

      <PrivacyCenterSheet
        visible={privacyVisible}
        onClose={() => setPrivacyVisible(false)}
        onDeleteLocalData={deleteLocalData}
      />

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
      <DraBornStyleV04 />
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
