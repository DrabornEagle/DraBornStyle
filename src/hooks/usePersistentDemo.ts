import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { initialAppointments } from '../data/mockData';
import { Appointment, DemoState } from '../types';

const STORAGE_KEY = '@drabornstyle/demo-state/v0.3';

const initialState: DemoState = {
  onboardingCompleted: false,
  favoriteBarberIds: ['arda'],
  appointments: initialAppointments,
  rewardPoints: 780,
  notificationsEnabled: true,
  selectedCity: 'Antalya',
};

export function usePersistentDemo() {
  const [state, setState] = useState<DemoState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const parsed = JSON.parse(raw) as Partial<DemoState>;
        setState((current) => ({ ...current, ...parsed }));
      })
      .catch(() => undefined)
      .finally(() => active && setHydrated(true));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [hydrated, state]);

  const update = useCallback((patch: Partial<DemoState>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  const toggleFavorite = useCallback((barberId: string) => {
    setState((current) => ({
      ...current,
      favoriteBarberIds: current.favoriteBarberIds.includes(barberId)
        ? current.favoriteBarberIds.filter((id) => id !== barberId)
        : [...current.favoriteBarberIds, barberId],
    }));
  }, []);

  const addAppointment = useCallback((appointment: Appointment) => {
    setState((current) => ({
      ...current,
      appointments: [appointment, ...current.appointments],
      rewardPoints: current.rewardPoints + 120,
    }));
  }, []);

  const cancelAppointment = useCallback((appointmentId: string) => {
    setState((current) => ({
      ...current,
      appointments: current.appointments.map((item) =>
        item.id === appointmentId ? { ...item, status: 'cancelled' as const } : item,
      ),
    }));
  }, []);

  const resetDemo = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
    setState({ ...initialState, onboardingCompleted: true });
  }, []);

  return useMemo(() => ({
    state,
    hydrated,
    update,
    toggleFavorite,
    addAppointment,
    cancelAppointment,
    resetDemo,
  }), [state, hydrated, update, toggleFavorite, addAppointment, cancelAppointment, resetDemo]);
}
