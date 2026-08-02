import { initialV02State } from './demoData';
import {
  StartTransactionInput,
  V02ActionResult,
  V02DemoState,
  V02PaymentNotice,
  V02Transaction,
} from './types';

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function result(ok: boolean, message: string, state: V02DemoState): V02ActionResult {
  return { ok, message, state };
}

export function getMasterProfile(state: V02DemoState, userId: string) {
  return state.masterProfiles.find((item) => item.userId === userId) ?? null;
}

export function getBusinessForOwner(state: V02DemoState, ownerUserId: string) {
  return state.businesses.find((item) => item.ownerUserId === ownerUserId) ?? null;
}

export function getBusinessById(state: V02DemoState, businessId: string) {
  return state.businesses.find((item) => item.id === businessId) ?? null;
}

export function getActiveTransaction(state: V02DemoState, masterUserId: string) {
  return state.transactions.find((item) => item.masterUserId === masterUserId && item.status === 'active') ?? null;
}

export function getCompletedTransactions(state: V02DemoState, businessId?: string) {
  return state.transactions.filter((item) => item.status === 'completed' && (!businessId || item.businessId === businessId));
}

export function getBusinessFinancials(state: V02DemoState, businessId: string) {
  const completed = getCompletedTransactions(state, businessId);
  const grossRevenueTl = completed.reduce((sum, item) => sum + (item.finalPriceTl ?? 0), 0);
  const totalPlatformFeeTl = completed.reduce((sum, item) => sum + (item.platformFeeTl ?? 0), 0);
  const approvedPaymentsTl = state.paymentNotices
    .filter((item) => item.businessId === businessId && item.status === 'approved')
    .reduce((sum, item) => sum + item.amountTl, 0);
  const pendingPaymentsTl = state.paymentNotices
    .filter((item) => item.businessId === businessId && item.status === 'pending')
    .reduce((sum, item) => sum + item.amountTl, 0);
  const outstandingTl = Math.max(0, totalPlatformFeeTl - approvedPaymentsTl);
  const paymentStatus = outstandingTl === 0 ? 'paid' : approvedPaymentsTl > 0 ? 'partial' : 'pending';
  return { completedCount: completed.length, grossRevenueTl, totalPlatformFeeTl, approvedPaymentsTl, pendingPaymentsTl, outstandingTl, paymentStatus };
}

export function startTransaction(state: V02DemoState, input: StartTransactionInput): V02ActionResult {
  const customerName = input.customerName.trim();
  const customerPhone = input.customerPhone.trim();
  if (!customerName) return result(false, 'Müşteri adı gerekli.', state);
  if (!customerPhone) return result(false, 'Müşteri telefonu gerekli.', state);
  if (getActiveTransaction(state, input.masterUserId)) return result(false, 'Bu usta için zaten aktif bir işlem var.', state);
  const profile = getMasterProfile(state, input.masterUserId);
  if (!profile) return result(false, 'Usta profili bulunamadı.', state);
  const service = state.services.find((item) => item.id === input.serviceId && item.businessId === profile.businessId);
  if (!service) return result(false, 'Geçerli hizmet seçilmedi.', state);
  const code = input.discountCode?.trim().toLocaleUpperCase('tr-TR');
  if (code) {
    const discount = state.discountCodes.find((item) => item.code === code && item.masterUserId === input.masterUserId && item.active);
    if (!discount) return result(false, 'İndirim kodu geçerli değil.', state);
  }
  const transaction: V02Transaction = {
    id: id('transaction'),
    businessId: profile.businessId,
    masterUserId: input.masterUserId,
    customerName,
    customerPhone,
    serviceId: service.id,
    source: input.source,
    status: 'active',
    startedAt: nowIso(),
    listPriceTl: service.priceTl,
    discountCode: code || undefined,
    discountPercent: 0,
  };
  return result(true, `${customerName} için işlem başlatıldı. Usta meşgul durumuna geçti.`, {
    ...state,
    transactions: [transaction, ...state.transactions],
  });
}

export function finishTransaction(state: V02DemoState, transactionId: string, editedPriceTl: number, discountCode?: string): V02ActionResult {
  const transaction = state.transactions.find((item) => item.id === transactionId && item.status === 'active');
  if (!transaction) return result(false, 'Aktif işlem bulunamadı.', state);
  if (!Number.isFinite(editedPriceTl) || editedPriceTl <= 0) return result(false, 'Son fiyat sıfırdan büyük olmalı.', state);
  const business = getBusinessById(state, transaction.businessId);
  if (!business) return result(false, 'İşletme ayarı bulunamadı.', state);
  const normalizedCode = (discountCode ?? transaction.discountCode ?? '').trim().toLocaleUpperCase('tr-TR');
  const discount = normalizedCode
    ? state.discountCodes.find((item) => item.code === normalizedCode && item.masterUserId === transaction.masterUserId && item.active)
    : undefined;
  if (normalizedCode && !discount) return result(false, 'İndirim kodu geçerli değil.', state);
  const discountPercent = discount?.percent ?? 0;
  const finalPriceTl = Math.round(editedPriceTl * (1 - discountPercent / 100));
  const transactions = state.transactions.map((item) => item.id === transactionId ? {
    ...item,
    status: 'completed' as const,
    completedAt: nowIso(),
    editedPriceTl,
    discountCode: discount?.code,
    discountPercent,
    finalPriceTl,
    platformFeeTl: business.platformFeeTl,
  } : item);
  const discountCodes = discount
    ? state.discountCodes.map((item) => item.id === discount.id ? { ...item, usageCount: item.usageCount + 1 } : item)
    : state.discountCodes;
  return result(true, `İşlem tamamlandı. Net tutar ₺${finalPriceTl}, platform bedeli ₺${business.platformFeeTl}.`, {
    ...state,
    transactions,
    discountCodes,
  });
}

export function cancelTransaction(state: V02DemoState, transactionId: string): V02ActionResult {
  const exists = state.transactions.some((item) => item.id === transactionId && item.status === 'active');
  if (!exists) return result(false, 'İptal edilecek aktif işlem bulunamadı.', state);
  return result(true, 'Aktif işlem iptal edildi.', {
    ...state,
    transactions: state.transactions.map((item) => item.id === transactionId ? { ...item, status: 'cancelled' as const, completedAt: nowIso() } : item),
  });
}

export function updateServicePrice(state: V02DemoState, businessId: string, serviceId: string, priceTl: number): V02ActionResult {
  if (!Number.isFinite(priceTl) || priceTl <= 0) return result(false, 'Hizmet fiyatı sıfırdan büyük olmalı.', state);
  const exists = state.services.some((item) => item.businessId === businessId && item.id === serviceId);
  if (!exists) return result(false, 'Hizmet bulunamadı.', state);
  return result(true, 'Hizmet fiyatı güncellendi.', {
    ...state,
    services: state.services.map((item) => item.id === serviceId ? { ...item, priceTl: Math.round(priceTl) } : item),
  });
}

export function updatePlatformFee(state: V02DemoState, businessId: string, feeTl: number): V02ActionResult {
  if (!Number.isFinite(feeTl) || feeTl < 0) return result(false, 'Platform bedeli geçerli değil.', state);
  return result(true, `İşletme platform bedeli ₺${Math.round(feeTl)} olarak güncellendi.`, {
    ...state,
    businesses: state.businesses.map((item) => item.id === businessId ? { ...item, platformFeeTl: Math.round(feeTl) } : item),
  });
}

export function notifyPayment(state: V02DemoState, businessId: string, amountTl: number): V02ActionResult {
  const financials = getBusinessFinancials(state, businessId);
  if (!Number.isFinite(amountTl) || amountTl <= 0) return result(false, 'Ödeme tutarı sıfırdan büyük olmalı.', state);
  if (amountTl > financials.outstandingTl) return result(false, `Bildirim tutarı kalan borçtan yüksek olamaz. Kalan ₺${financials.outstandingTl}.`, state);
  const notice: V02PaymentNotice = { id: id('payment'), businessId, amountTl: Math.round(amountTl), status: 'pending', createdAt: nowIso() };
  return result(true, `₺${notice.amountTl} ödeme bildirimi admine gönderildi.`, { ...state, paymentNotices: [notice, ...state.paymentNotices] });
}

export function reviewPayment(state: V02DemoState, paymentId: string, decision: 'approved' | 'rejected', adminUserId: string): V02ActionResult {
  const notice = state.paymentNotices.find((item) => item.id === paymentId && item.status === 'pending');
  if (!notice) return result(false, 'Bekleyen ödeme bildirimi bulunamadı.', state);
  return result(true, decision === 'approved' ? 'Ödeme onaylandı ve borçtan düşüldü.' : 'Ödeme bildirimi reddedildi.', {
    ...state,
    paymentNotices: state.paymentNotices.map((item) => item.id === paymentId ? { ...item, status: decision, reviewedAt: nowIso(), reviewedBy: adminUserId } : item),
  });
}

export function createDiscountCode(state: V02DemoState, masterUserId: string, code: string, percent: number): V02ActionResult {
  const normalized = code.trim().toLocaleUpperCase('tr-TR');
  if (normalized.length < 4) return result(false, 'İndirim kodu en az 4 karakter olmalı.', state);
  if (!Number.isFinite(percent) || percent < 1 || percent > 80) return result(false, 'İndirim oranı %1 ile %80 arasında olmalı.', state);
  if (state.discountCodes.some((item) => item.code === normalized)) return result(false, 'Bu indirim kodu zaten kullanılıyor.', state);
  const profile = getMasterProfile(state, masterUserId);
  if (!profile) return result(false, 'Usta profili bulunamadı.', state);
  return result(true, `${normalized} kodu %${Math.round(percent)} indirimle oluşturuldu.`, {
    ...state,
    discountCodes: [{ id: id('discount'), businessId: profile.businessId, masterUserId, code: normalized, percent: Math.round(percent), active: true, usageCount: 0 }, ...state.discountCodes],
  });
}

export function toggleDiscountCode(state: V02DemoState, discountId: string): V02ActionResult {
  const code = state.discountCodes.find((item) => item.id === discountId);
  if (!code) return result(false, 'İndirim kodu bulunamadı.', state);
  return result(true, `${code.code} kodu ${code.active ? 'pasif' : 'aktif'} yapıldı.`, {
    ...state,
    discountCodes: state.discountCodes.map((item) => item.id === discountId ? { ...item, active: !item.active } : item),
  });
}

export function registerQrScan(state: V02DemoState, qrId: string): V02ActionResult {
  const qr = state.qrSources.find((item) => item.id === qrId);
  if (!qr) return result(false, 'QR kaynağı bulunamadı.', state);
  return result(true, `${qr.label} için demo tarama kaydedildi.`, {
    ...state,
    qrSources: state.qrSources.map((item) => item.id === qrId ? { ...item, scans: item.scans + 1 } : item),
  });
}

export function resetV02Demo(): V02ActionResult {
  return result(true, 'v0.2.17 demo verileri sıfırlandı.', initialV02State);
}
