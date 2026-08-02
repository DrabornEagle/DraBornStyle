export type TransactionSource = 'walk_in' | 'direct_call' | 'favorite_customer' | 'appointment';
export type TransactionStatus = 'active' | 'completed' | 'cancelled';
export type PaymentNoticeStatus = 'pending' | 'approved' | 'rejected';
export type PaymentCycle = 'weekly' | 'monthly';

export interface V02Business {
  id: string;
  ownerUserId: string;
  name: string;
  address: string;
  coverImage: string;
  logoImage: string;
  platformFeeTl: number;
  paymentCycle: PaymentCycle;
  paymentDay: string;
}

export interface V02MasterProfile {
  userId: string;
  businessId: string;
  title: string;
  image: string;
  serviceIds: string[];
}

export interface V02Service {
  id: string;
  businessId: string;
  title: string;
  durationMinutes: number;
  priceTl: number;
  icon: string;
  accent: string;
}

export interface V02DiscountCode {
  id: string;
  businessId: string;
  masterUserId: string;
  code: string;
  percent: number;
  active: boolean;
  usageCount: number;
}

export interface V02QrSource {
  id: string;
  businessId: string;
  masterUserId?: string;
  label: string;
  purpose: 'customer_registration' | 'master_profile' | 'quick_transaction';
  code: string;
  scans: number;
  scanCount?: number;
}

export interface V02Transaction {
  id: string;
  businessId: string;
  masterUserId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  source: TransactionSource;
  status: TransactionStatus;
  startedAt: string;
  completedAt?: string;
  listPriceTl: number;
  editedPriceTl?: number;
  discountCode?: string;
  discountPercent: number;
  finalPriceTl?: number;
  platformFeeTl?: number;
}

export interface V02PaymentNotice {
  id: string;
  businessId: string;
  amountTl: number;
  status: PaymentNoticeStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface V02DemoState {
  schemaVersion: 'v0.2.17-final';
  businesses: V02Business[];
  masterProfiles: V02MasterProfile[];
  services: V02Service[];
  discountCodes: V02DiscountCode[];
  qrSources: V02QrSource[];
  transactions: V02Transaction[];
  paymentNotices: V02PaymentNotice[];
}

export interface StartTransactionInput {
  masterUserId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  source: TransactionSource;
  discountCode?: string;
}

export interface V02ActionResult {
  ok: boolean;
  message: string;
  state: V02DemoState;
}
