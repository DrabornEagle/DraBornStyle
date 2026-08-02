import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppointmentsScreen } from './src/screens/AppointmentsScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { RewardsScreen } from './src/screens/RewardsScreen';
import { BookingSheet } from './src/components/BookingSheet';
import { BottomNav } from './src/components/BottomNav';
import { GlowOrbs } from './src/components/GlowOrbs';
import { NotificationsSheet } from './src/components/NotificationsSheet';
import { Onboarding } from './src/components/Onboarding';
import { usePersistentDemo } from './src/hooks/usePersistentDemo';
import { colors } from './src/theme';
import { RootTab } from './src/types';

function DraBornStyleApp() {
  const { state, hydrated, update, toggleFavorite, addAppointment, cancelAppointment, resetDemo } = usePersistentDemo();
  const [tab, setTab] = useState<RootTab>('home');
  const [bookingBarberId, setBookingBarberId] = useState<string | null>(null);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTranslate = useRef(new Animated.Value(-90)).current;
  const pageOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!toastVisible) return;
    Animated.sequence([
      Animated.spring(toastTranslate, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 5 }),
      Animated.delay(1900),
      Animated.timing(toastTranslate, { toValue: -90, duration: 240, useNativeDriver: true }),
    ]).start(() => setToastVisible(false));
  }, [toastTranslate, toastVisible]);

  const changeTab = (nextTab: RootTab) => {
    if (nextTab === tab) return;
    Animated.timing(pageOpacity, { toValue: 0, duration: 110, useNativeDriver: true }).start(() => {
      setTab(nextTab);
      Animated.timing(pageOpacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadingLogo}><Ionicons name="cut" size={32} color={colors.white} /></View>
        <Text style={styles.loadingTitle}>DraBornStyle</Text>
        <Text style={styles.loadingText}>Demo deneyimi hazırlanıyor…</Text>
      </View>
    );
  }

  if (!state.onboardingCompleted) {
    return <Onboarding onFinish={() => update({ onboardingCompleted: true })} />;
  }

  const commonProps = {
    favorites: state.favoriteBarberIds,
    onToggleFavorite: toggleFavorite,
    onBook: (id: string) => setBookingBarberId(id),
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <GlowOrbs />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.View style={[styles.page, { opacity: pageOpacity }]}>
          {tab === 'home' && (
            <HomeScreen
              {...commonProps}
              onTab={changeTab}
              onNotifications={() => setNotificationsVisible(true)}
            />
          )}
          {tab === 'explore' && <ExploreScreen {...commonProps} />}
          {tab === 'appointments' && (
            <AppointmentsScreen
              appointments={state.appointments}
              onCancel={cancelAppointment}
              onBookNew={() => setBookingBarberId('arda')}
            />
          )}
          {tab === 'rewards' && <RewardsScreen points={state.rewardPoints} />}
          {tab === 'profile' && (
            <ProfileScreen
              favoriteCount={state.favoriteBarberIds.length}
              appointmentCount={state.appointments.length}
              notificationsEnabled={state.notificationsEnabled}
              onNotificationsChange={(value) => update({ notificationsEnabled: value })}
              onResetDemo={resetDemo}
            />
          )}
        </Animated.View>
      </SafeAreaView>

      <BottomNav active={tab} onChange={changeTab} />

      <BookingSheet
        barberId={bookingBarberId}
        visible={bookingBarberId !== null}
        onClose={() => setBookingBarberId(null)}
        onConfirm={(appointment) => {
          addAppointment(appointment);
          setTab('appointments');
          setToastVisible(true);
        }}
      />
      <NotificationsSheet visible={notificationsVisible} onClose={() => setNotificationsVisible(false)} />

      {toastVisible && (
        <Animated.View style={[styles.toast, { transform: [{ translateY: toastTranslate }] }]}>
          <View style={styles.toastIcon}><Ionicons name="checkmark" size={18} color={colors.white} /></View>
          <View><Text style={styles.toastTitle}>Randevun oluşturuldu</Text><Text style={styles.toastText}>120 Style Puanı hesabına eklendi.</Text></View>
        </Animated.View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DraBornStyleApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1 },
  page: { flex: 1 },
  loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  loadingLogo: { width: 76, height: 76, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  loadingTitle: { color: colors.white, fontSize: 26, fontWeight: '900', marginTop: 16 },
  loadingText: { color: colors.textMuted, fontSize: 12, marginTop: 5 },
  toast: { position: 'absolute', top: 54, left: 18, right: 18, minHeight: 66, padding: 12, borderRadius: 19, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: 'rgba(53,225,161,0.3)', flexDirection: 'row', alignItems: 'center', gap: 11 },
  toastIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  toastTitle: { color: colors.white, fontSize: 13, fontWeight: '900' },
  toastText: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
});
