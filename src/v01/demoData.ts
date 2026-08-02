import { DkdUserRoleAccess, RoleApplication, V01DemoState } from './types';

const createdAt = '2026-08-02T10:00:00.000Z';

const roleAccess: DkdUserRoleAccess[] = [
  { id: 'access-admin-customer', userId: 'user-admin', role: 'customer', status: 'active', source: 'seed', grantedAt: createdAt },
  { id: 'access-admin-admin', userId: 'user-admin', role: 'admin', status: 'active', source: 'seed', grantedAt: createdAt },
  { id: 'access-business-customer', userId: 'user-business', role: 'customer', status: 'active', source: 'seed', grantedAt: createdAt },
  { id: 'access-business-business', userId: 'user-business', role: 'business', status: 'active', source: 'seed', grantedAt: createdAt, grantedBy: 'user-admin' },
  { id: 'access-master-customer', userId: 'user-master', role: 'customer', status: 'active', source: 'seed', grantedAt: createdAt },
  { id: 'access-master-master', userId: 'user-master', role: 'master', status: 'active', source: 'seed', grantedAt: createdAt, grantedBy: 'user-admin' },
  { id: 'access-customer-customer', userId: 'user-customer', role: 'customer', status: 'active', source: 'automatic_registration', grantedAt: createdAt },
  { id: 'access-applicant-customer', userId: 'user-applicant', role: 'customer', status: 'active', source: 'automatic_registration', grantedAt: createdAt },
];

const applications: RoleApplication[] = [
  {
    id: 'application-pending-master',
    userId: 'user-applicant',
    requestedRole: 'master',
    status: 'pending',
    businessName: 'Gentleman Garage',
    specialty: 'Fade ve sakal tasarımı',
    experienceYears: '6',
    note: 'Kepez şubesinde aktif çalışıyorum. Usta panelini kullanmak istiyorum.',
    createdAt: '2026-08-02T11:10:00.000Z',
  },
  {
    id: 'application-approved-business',
    userId: 'user-business',
    requestedRole: 'business',
    status: 'approved',
    businessName: 'Blade District',
    specialty: 'Erkek bakım salonu',
    experienceYears: '9',
    note: 'İşletme sahibi demo başvurusu.',
    createdAt: '2026-08-01T09:00:00.000Z',
    reviewedAt: '2026-08-01T10:00:00.000Z',
    reviewedBy: 'user-admin',
  },
];

export const initialV01State: V01DemoState = {
  schemaVersion: 'v0.1-final',
  users: [
    {
      id: 'user-admin',
      fullName: 'DrabornEagle Admin',
      email: 'draborneagle@gmail.com',
      phone: '+90 555 000 00 01',
      password: '123456',
      createdAt,
      avatarAccent: '#FF4D8D',
    },
    {
      id: 'user-business',
      fullName: 'Selim Arslan',
      email: 'isletme@demo.com',
      phone: '+90 555 000 00 02',
      password: '123456',
      createdAt,
      avatarAccent: '#FFB648',
      businessName: 'Blade District',
    },
    {
      id: 'user-master',
      fullName: 'Arda Yılmaz',
      email: 'usta@demo.com',
      phone: '+90 555 000 00 03',
      password: '123456',
      createdAt,
      avatarAccent: '#2DD4FF',
      businessName: 'Blade District',
      specialty: 'Fade ve saç-sakal tasarımı',
    },
    {
      id: 'user-customer',
      fullName: 'Mert Demir',
      email: 'musteri@demo.com',
      phone: '+90 555 000 00 04',
      password: '123456',
      createdAt,
      avatarAccent: '#6C63FF',
    },
    {
      id: 'user-applicant',
      fullName: 'Kaan Demir',
      email: 'basvuru@demo.com',
      phone: '+90 555 000 00 05',
      password: '123456',
      createdAt,
      avatarAccent: '#35E1A1',
      businessName: 'Gentleman Garage',
      specialty: 'Fade ve sakal tasarımı',
    },
  ],
  dkd_user_role_access: roleAccess,
  applications,
  sessionUserId: null,
  activeRoleByUser: {
    'user-admin': 'admin',
    'user-business': 'business',
    'user-master': 'master',
    'user-customer': 'customer',
    'user-applicant': 'customer',
  },
  masterPresenceByUser: {
    'user-master': 'available',
  },
};

export const demoAccounts = [
  { label: 'Müşteri', email: 'musteri@demo.com', password: '123456', icon: 'person-outline' as const },
  { label: 'Usta', email: 'usta@demo.com', password: '123456', icon: 'cut-outline' as const },
  { label: 'İşletme', email: 'isletme@demo.com', password: '123456', icon: 'storefront-outline' as const },
  { label: 'Admin', email: 'draborneagle@gmail.com', password: '123456', icon: 'shield-checkmark-outline' as const },
];
