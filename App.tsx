import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppointmentsScreen } from './src/screens/AppointmentsScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { RewardsScreen } from './src/screens/RewardsScreen';
import { BookingSheet } from './src/components/BookingSheet';
import { BottomNav } from './src/components/BottomNav';
import { GlowOrbs } from './src/components/GlowOrbs';
import { initialAppointments } from './src/data/mockData';
import { colors } from './src/theme';
import { Appointment, RootTab } from './src/types';

function DemoApp() {
  const [tab, setTab] = useState<RootTab>('home');
  const [favorites, setFavorites] = useState<string[]>(['arda']);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [points, setPoints] = useState(660);
  const [bookingBarberId, setBookingBarberId] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(1)).current;

  const changeTab = (next: RootTab) => {
    Animated.timing(opacity, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
      setTab(next);
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  const toggleFavorite = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const common = { favorites, onToggleFavorite: toggleFavorite, onBook: (id: string) => setBookingBarberId(id) };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <GlowOrbs />
      <SafeAreaView edges={['top']} style={styles.safe}>
        <Animated.View style={[styles.page, { opacity }]}>
          {tab === 'home' && <HomeScreen {...common} onTab={changeTab} onNotifications={() => undefined} />}
          {tab === 'explore' && <ExploreScreen {...common} />}
          {tab === 'appointments' && <AppointmentsScreen appointments={appointments} onCancel={(id) => setAppointments((current) => current.map((item) => item.id === id ? { ...item, status: 'cancelled' } : item))} onBookNew={() => setBookingBarberId('arda')} />}
          {tab === 'rewards' && <RewardsScreen points={points} />}
          {tab === 'profile' && <View style={styles.placeholder}><View style={styles.placeholderIcon}><Ionicons name="person-outline" size={32} color={colors.primary} /></View><Text style={styles.placeholderTitle}>Profil v0.3’te geliyor</Text><Text style={styles.placeholderText}>Bildirim tercihleri, yerel kayıt ve demo sıfırlama sonraki sürümde tamamlanacak.</Text><Text style={styles.version}>DraBornStyle v0.2 · Expo SDK 57</Text></View>}
        </Animated.View>
      </SafeAreaView>
      <BottomNav active={tab} onChange={changeTab} />
      <BookingSheet barberId={bookingBarberId} visible={bookingBarberId !== null} onClose={() => setBookingBarberId(null)} onConfirm={(appointment) => { setAppointments((current) => [appointment, ...current]); setPoints((current) => current + 120); setTab('appointments'); }} />
    </View>
  );
}

export default function App() { return <SafeAreaProvider><DemoApp /></SafeAreaProvider>; }

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  page: { flex: 1 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 38 },
  placeholderIcon: { width: 78, height: 78, borderRadius: 27, backgroundColor: 'rgba(255,77,141,0.12)', alignItems: 'center', justifyContent: 'center' },
  placeholderTitle: { color: colors.white, fontSize: 20, fontWeight: '900', marginTop: 17 },
  placeholderText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 7 },
  version: { color: colors.textFaint, fontSize: 10, marginTop: 18 },
});
