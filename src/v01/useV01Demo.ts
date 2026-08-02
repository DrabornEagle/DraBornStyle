import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { initialV01State } from './demoData';
import {
  authenticate,
  getActiveRole,
  getUserById,
  getUserRoles,
  grantRole,
  logout,
  registerCustomer,
  resetV01Demo,
  reviewApplication,
  revokeRole,
  setMasterPresence,
  submitRoleApplication,
  switchRole,
} from './state';
import { ApplicationInput, ApplicationRole, RegisterInput, UserRole, V01DemoState } from './types';

const STORAGE_KEY = '@drabornstyle/v0.1-final/demo-state';

type Result = { ok: boolean; message: string };

export function useV01Demo() {
  const [state, setState] = useState<V01DemoState>(initialV01State);
  const stateRef = useRef(state);
  const [hydrated, setHydrated] = useState(false);

  const commit = useCallback((nextState: V01DemoState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const parsed = JSON.parse(raw) as V01DemoState;
        if (parsed.schemaVersion === 'v0.1-final') commit(parsed);
      })
      .catch(() => undefined)
      .finally(() => active && setHydrated(true));
    return () => { active = false; };
  }, [commit]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [hydrated, state]);

  const run = useCallback((factory: (current: V01DemoState) => { ok: boolean; message: string; state: V01DemoState }): Result => {
    const result = factory(stateRef.current);
    if (result.state !== stateRef.current) commit(result.state);
    return { ok: result.ok, message: result.message };
  }, [commit]);

  const login = useCallback((email: string, password: string) => run((current) => authenticate(current, email, password)), [run]);
  const register = useCallback((input: RegisterInput) => run((current) => registerCustomer(current, input)), [run]);
  const signOut = useCallback(() => run(logout), [run]);
  const changeRole = useCallback((role: UserRole) => {
    const userId = stateRef.current.sessionUserId;
    if (!userId) return { ok: false, message: 'Aktif kullanıcı bulunamadı.' };
    return run((current) => switchRole(current, userId, role));
  }, [run]);
  const applyForRole = useCallback((input: ApplicationInput) => {
    const userId = stateRef.current.sessionUserId;
    if (!userId) return { ok: false, message: 'Aktif kullanıcı bulunamadı.' };
    return run((current) => submitRoleApplication(current, userId, input));
  }, [run]);
  const decideApplication = useCallback((applicationId: string, decision: 'approved' | 'rejected') => {
    const adminUserId = stateRef.current.sessionUserId;
    if (!adminUserId) return { ok: false, message: 'Aktif admin bulunamadı.' };
    return run((current) => reviewApplication(current, applicationId, decision, adminUserId));
  }, [run]);
  const addRole = useCallback((targetUserId: string, role: ApplicationRole) => {
    const adminUserId = stateRef.current.sessionUserId;
    if (!adminUserId) return { ok: false, message: 'Aktif admin bulunamadı.' };
    return run((current) => grantRole(current, targetUserId, role, adminUserId));
  }, [run]);
  const removeRole = useCallback((targetUserId: string, role: ApplicationRole) => {
    const adminUserId = stateRef.current.sessionUserId;
    if (!adminUserId) return { ok: false, message: 'Aktif admin bulunamadı.' };
    return run((current) => revokeRole(current, targetUserId, role, adminUserId));
  }, [run]);
  const changeMasterPresence = useCallback((presence: 'available' | 'busy' | 'offline') => {
    const userId = stateRef.current.sessionUserId;
    if (!userId) return { ok: false, message: 'Aktif kullanıcı bulunamadı.' };
    return run((current) => setMasterPresence(current, userId, presence));
  }, [run]);
  const resetDemo = useCallback(async () => {
    const result = resetV01Demo();
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
    commit(result.state);
    return { ok: true, message: result.message };
  }, [commit]);

  const currentUser = getUserById(state, state.sessionUserId);
  const currentRoles = currentUser ? getUserRoles(state, currentUser.id) : [];
  const activeRole = currentUser ? getActiveRole(state, currentUser.id) : null;

  return useMemo(() => ({
    state,
    hydrated,
    currentUser,
    currentRoles,
    activeRole,
    login,
    register,
    signOut,
    changeRole,
    applyForRole,
    decideApplication,
    addRole,
    removeRole,
    changeMasterPresence,
    resetDemo,
  }), [
    state,
    hydrated,
    currentUser,
    currentRoles,
    activeRole,
    login,
    register,
    signOut,
    changeRole,
    applyForRole,
    decideApplication,
    addRole,
    removeRole,
    changeMasterPresence,
    resetDemo,
  ]);
}
