import { V02DemoState } from './types';

export const initialV02State: V02DemoState = {
  schemaVersion: 'v0.2.17-final',
  businesses: [
    {
      id: 'business-blade',
      ownerUserId: 'user-business',
      name: 'Blade District',
      address: 'Konyaaltı, Antalya',
      coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=85',
      logoImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=500&q=85',
      platformFeeTl: 20,
      paymentCycle: 'weekly',
      paymentDay: 'Her Pazartesi',
    },
  ],
  masterProfiles: [
    {
      userId: 'user-master',
      businessId: 'business-blade',
      title: 'Fade ve Saç-Sakal Uzmanı',
      image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=700&q=85',
      serviceIds: ['service-haircut', 'service-beard', 'service-combo', 'service-care'],
    },
  ],
  services: [
    { id: 'service-haircut', businessId: 'business-blade', title: 'Saç Kesimi', durationMinutes: 40, priceTl: 450, icon: 'cut-outline', accent: '#FF4D8D' },
    { id: 'service-beard', businessId: 'business-blade', title: 'Sakal Tasarım', durationMinutes: 25, priceTl: 280, icon: 'sparkles-outline', accent: '#6C63FF' },
    { id: 'service-combo', businessId: 'business-blade', title: 'Saç + Sakal', durationMinutes: 65, priceTl: 650, icon: 'diamond-outline', accent: '#2DD4FF' },
    { id: 'service-care', businessId: 'business-blade', title: 'Cilt Bakımı', durationMinutes: 35, priceTl: 380, icon: 'water-outline', accent: '#35E1A1' },
  ],
  discountCodes: [
    { id: 'discount-arda15', businessId: 'business-blade', masterUserId: 'user-master', code: 'ARDA15', percent: 15, active: true, usageCount: 3 },
    { id: 'discount-sadakat10', businessId: 'business-blade', masterUserId: 'user-master', code: 'SADAKAT10', percent: 10, active: true, usageCount: 7 },
  ],
  qrSources: [
    { id: 'qr-business', businessId: 'business-blade', label: 'İşletme Müşteri Kaydı', purpose: 'customer_registration', code: 'DBS-BLADE-001', scans: 42 },
    { id: 'qr-master', businessId: 'business-blade', masterUserId: 'user-master', label: 'Arda Usta Profili', purpose: 'master_profile', code: 'DBS-ARDA-001', scans: 28 },
    { id: 'qr-quick', businessId: 'business-blade', masterUserId: 'user-master', label: 'Hızlı İşlem Girişi', purpose: 'quick_transaction', code: 'DBS-FAST-001', scans: 16 },
  ],
  transactions: [
    {
      id: 'transaction-completed-1', businessId: 'business-blade', masterUserId: 'user-master', customerName: 'Mert Demir', customerPhone: '+90 555 000 00 04', serviceId: 'service-combo', source: 'favorite_customer', status: 'completed', startedAt: '2026-08-02T08:40:00.000Z', completedAt: '2026-08-02T09:42:00.000Z', listPriceTl: 650, editedPriceTl: 650, discountCode: 'ARDA15', discountPercent: 15, finalPriceTl: 553, platformFeeTl: 20,
    },
    {
      id: 'transaction-completed-2', businessId: 'business-blade', masterUserId: 'user-master', customerName: 'Burak Kaya', customerPhone: '+90 555 111 22 33', serviceId: 'service-haircut', source: 'walk_in', status: 'completed', startedAt: '2026-08-02T10:05:00.000Z', completedAt: '2026-08-02T10:44:00.000Z', listPriceTl: 450, editedPriceTl: 450, discountPercent: 0, finalPriceTl: 450, platformFeeTl: 20,
    },
    {
      id: 'transaction-completed-3', businessId: 'business-blade', masterUserId: 'user-master', customerName: 'Emre Şahin', customerPhone: '+90 555 333 44 55', serviceId: 'service-beard', source: 'direct_call', status: 'completed', startedAt: '2026-08-01T13:20:00.000Z', completedAt: '2026-08-01T13:48:00.000Z', listPriceTl: 280, editedPriceTl: 300, discountPercent: 0, finalPriceTl: 300, platformFeeTl: 20,
    },
  ],
  paymentNotices: [
    { id: 'payment-approved-1', businessId: 'business-blade', amountTl: 20, status: 'approved', createdAt: '2026-08-01T18:00:00.000Z', reviewedAt: '2026-08-01T19:00:00.000Z', reviewedBy: 'user-admin' },
  ],
};
