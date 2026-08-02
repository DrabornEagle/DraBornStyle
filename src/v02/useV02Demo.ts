import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { initialV02State } from './demoData';
import {
  cancelTransaction,
  createDiscountCode,
  finishTransaction,
  notifyPayment,
  registerQrScan,
  resetV02Demo,
  reviewPayment,
  startTransaction,
  toggleDiscountCode,
  updatePlatformFee,
  updateServicePrice,
} from './state';
import { StartTransactionInput, V02ActionResult, V02DemoState } from './types';

const STORAGE_KEY = '@drabornstyle/v0.2.17-final/demo-state';
type Result = { ok: boolean; message: string };

export function useV02Demo() {
  const [state, setState] = useState<V02DemoState>(initialV02State);
  const stateRef = useRef(state);
  const [hydrated, setHydrated] = useState(false);

  const commit = useCallback((next: V02DemoState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const parsed = JSON.parse(raw) as V02DemoState;
        if (parsed.schemaVersion === 'v0.2.17-final') commit(parsed);
      })
      .catch(() => undefined)
      .finally(() => active && setHydrated(true));
    return () => { active = false; };
  }, [commit]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [hydrated, state]);

  const run = useCallback((factory: (current: V02DemoState) => V02ActionResult): Result => {
    const action = factory(stateRef.current);
    if (action.state !== stateRef.current) commit(action.state);
    return { ok: action.ok, message: action.message };
  }, [commit]);

  const start = useCallback((input: StartTransactionInput) => run((current) => startTransaction(current, input)), [run]);
  const finish = useCallback((transactionId: string, editedPriceTl: number, discountCode?: string) => run((current) => finishTransaction(current, transactionId, editedPriceTl, discountCode)), [run]);
  const cancel = useCallback((transactionId: string) => run((current) => cancelTransaction(current, transactionId)), [run]);
  const setServicePrice = useCallback((businessId: string, serviceId: string, priceTl: number) => run((current) => updateServicePrice(current, businessId, serviceId, priceTl)), [run]);
  const setPlatformFee = useCallback((businessId: string, feeTl: number) => run((current) => updatePlatformFee(current, businessId, feeTl)), [run]);
  const sendPaymentNotice = useCallback((businessId: string, amountTl: number) => run((current) => notifyPayment(current, businessId, amountTl)), [run]);
  const decidePayment = useCallback((paymentId: string, decision: 'approved' | 'rejected', adminUserId: string) => run((current) => reviewPayment(current, paymentId, decision, adminUserId)), [run]);
  const addDiscountCode = useCallback((masterUserId: string, code: string, percent: number) => run((current) => createDiscountCode(current, masterUserId, code, percent)), [run]);
  const toggleDiscount = useCallback((discountId: string) => run((current) => toggleDiscountCode(current, discountId)), [run]);
  const scanQr = useCallback((qrId: string) => run((current) => registerQrScan(current, qrId)), [run]);
  const reset = useCallback(async () => {
    const action = resetV02Demo();
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
    commit(action.state);
    return { ok: true, message: action.message };
  }, [commit]);

  return useMemo(() => ({
    state,
    hydrated,
    start,
    finish,
    cancel,
    setServicePrice,
    setPlatformFee,
    sendPaymentNotice,
    decidePayment,
    addDiscountCode,
    toggleDiscount,
    scanQr,
    reset,
  }), [state, hydrated, start, finish, cancel, setServicePrice, setPlatformFee, sendPaymentNotice, decidePayment, addDiscountCode, toggleDiscount, scanQr, reset]);
}
