import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { initialV03State } from './demoData';
import {
  createAppointment,
  resetV03Demo,
  rescheduleAppointment,
  updateAppointmentStatus,
} from './state';
import {
  AppointmentActor,
  AppointmentStatus,
  CreateAppointmentInput,
  V03ActionResult,
  V03DemoState,
} from './types';

const STORAGE_KEY = '@drabornstyle/v0.3.0-final/demo-state';
type Result = { ok: boolean; message: string };

export function useV03Demo() {
  const [state, setState] = useState<V03DemoState>(initialV03State);
  const stateRef = useRef(state);
  const [hydrated, setHydrated] = useState(false);

  const commit = useCallback((nextState: V03DemoState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const parsed = JSON.parse(raw) as V03DemoState;
        if (parsed.schemaVersion === 'v0.3.0-final') commit(parsed);
      })
      .catch(() => undefined)
      .finally(() => active && setHydrated(true));
    return () => { active = false; };
  }, [commit]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [hydrated, state]);

  const run = useCallback((factory: (current: V03DemoState) => V03ActionResult): Result => {
    const action = factory(stateRef.current);
    if (action.state !== stateRef.current) commit(action.state);
    return { ok: action.ok, message: action.message };
  }, [commit]);

  const create = useCallback((input: CreateAppointmentInput) => run((current) => createAppointment(current, input)), [run]);
  const setStatus = useCallback((appointmentId: string, status: AppointmentStatus, actor: AppointmentActor, note?: string) => run((current) => updateAppointmentStatus(current, appointmentId, status, actor, note)), [run]);
  const reschedule = useCallback((appointmentId: string, date: string, time: string, actor: AppointmentActor) => run((current) => rescheduleAppointment(current, appointmentId, date, time, actor)), [run]);
  const reset = useCallback(async () => {
    const action = resetV03Demo();
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
    commit(action.state);
    return { ok: true, message: action.message };
  }, [commit]);

  return useMemo(() => ({ state, hydrated, create, setStatus, reschedule, reset }), [state, hydrated, create, setStatus, reschedule, reset]);
}
