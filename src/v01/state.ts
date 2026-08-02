import { initialV01State } from './demoData';
import {
  ActionResult,
  ApplicationInput,
  ApplicationRole,
  DemoUser,
  RegisterInput,
  UserRole,
  V01DemoState,
} from './types';

const roleOrder: UserRole[] = ['customer', 'master', 'business', 'admin'];

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeEmail(email: string) {
  return email.trim().toLocaleLowerCase('tr-TR');
}

export function getUserById(state: V01DemoState, userId: string | null) {
  if (!userId) return null;
  return state.users.find((user) => user.id === userId) ?? null;
}

export function getUserRoles(state: V01DemoState, userId: string): UserRole[] {
  const unique = new Set(
    state.dkd_user_role_access
      .filter((access) => access.userId === userId && access.status === 'active')
      .map((access) => access.role),
  );
  return roleOrder.filter((role) => unique.has(role));
}

export function getActiveRole(state: V01DemoState, userId: string): UserRole {
  const roles = getUserRoles(state, userId);
  const stored = state.activeRoleByUser[userId];
  if (stored && roles.includes(stored)) return stored;
  return roles.includes('customer') ? 'customer' : roles[0] ?? 'customer';
}

export function authenticate(state: V01DemoState, email: string, password: string): ActionResult {
  const normalized = normalizeEmail(email);
  const user = state.users.find((item) => normalizeEmail(item.email) === normalized);
  if (!user || user.password !== password) {
    return { ok: false, message: 'E-posta veya şifre hatalı.', state };
  }

  const roles = getUserRoles(state, user.id);
  const preferred = state.activeRoleByUser[user.id];
  const activeRole = preferred && roles.includes(preferred)
    ? preferred
    : roles.includes('admin')
      ? 'admin'
      : roles.includes('business')
        ? 'business'
        : roles.includes('master')
          ? 'master'
          : 'customer';

  return {
    ok: true,
    message: `${user.fullName} olarak giriş yapıldı.`,
    state: {
      ...state,
      sessionUserId: user.id,
      activeRoleByUser: { ...state.activeRoleByUser, [user.id]: activeRole },
    },
  };
}

export function registerCustomer(state: V01DemoState, input: RegisterInput): ActionResult {
  const fullName = input.fullName.trim();
  const email = normalizeEmail(input.email);
  const phone = input.phone.trim();
  const password = input.password.trim();

  if (fullName.length < 3) return { ok: false, message: 'Ad soyad en az 3 karakter olmalı.', state };
  if (!email.includes('@') || !email.includes('.')) return { ok: false, message: 'Geçerli bir e-posta gir.', state };
  if (phone.replace(/\D/g, '').length < 10) return { ok: false, message: 'Geçerli bir telefon numarası gir.', state };
  if (password.length < 6) return { ok: false, message: 'Şifre en az 6 karakter olmalı.', state };
  if (state.users.some((user) => normalizeEmail(user.email) === email)) {
    return { ok: false, message: 'Bu e-posta zaten kayıtlı.', state };
  }

  const userId = randomId('user');
  const createdAt = nowIso();
  const user: DemoUser = {
    id: userId,
    fullName,
    email,
    phone,
    password,
    createdAt,
    avatarAccent: '#8B5CF6',
  };

  return {
    ok: true,
    message: 'Kayıt tamamlandı. Müşteri rolün otomatik tanımlandı.',
    state: {
      ...state,
      users: [user, ...state.users],
      dkd_user_role_access: [
        {
          id: randomId('access'),
          userId,
          role: 'customer',
          status: 'active',
          source: 'automatic_registration',
          grantedAt: createdAt,
        },
        ...state.dkd_user_role_access,
      ],
      sessionUserId: userId,
      activeRoleByUser: { ...state.activeRoleByUser, [userId]: 'customer' },
    },
  };
}

export function logout(state: V01DemoState): ActionResult {
  return { ok: true, message: 'Oturum kapatıldı.', state: { ...state, sessionUserId: null } };
}

export function switchRole(state: V01DemoState, userId: string, role: UserRole): ActionResult {
  if (!getUserRoles(state, userId).includes(role)) {
    return { ok: false, message: 'Bu role erişimin yok.', state };
  }
  return {
    ok: true,
    message: `${roleLabel(role)} paneline geçildi.`,
    state: { ...state, activeRoleByUser: { ...state.activeRoleByUser, [userId]: role } },
  };
}

export function submitRoleApplication(
  state: V01DemoState,
  userId: string,
  input: ApplicationInput,
): ActionResult {
  const roles = getUserRoles(state, userId);
  if (roles.includes(input.requestedRole)) {
    return { ok: false, message: 'Bu role zaten erişimin var.', state };
  }
  const duplicate = state.applications.find(
    (item) => item.userId === userId && item.requestedRole === input.requestedRole && item.status === 'pending',
  );
  if (duplicate) return { ok: false, message: 'Bu rol için bekleyen başvurun zaten var.', state };
  if (input.requestedRole === 'business' && input.businessName.trim().length < 2) {
    return { ok: false, message: 'İşletme adını gir.', state };
  }
  if (input.requestedRole === 'master' && input.specialty.trim().length < 2) {
    return { ok: false, message: 'Uzmanlık alanını gir.', state };
  }

  return {
    ok: true,
    message: 'Başvurun admin onayına gönderildi.',
    state: {
      ...state,
      applications: [
        {
          id: randomId('application'),
          userId,
          requestedRole: input.requestedRole,
          status: 'pending',
          businessName: input.businessName.trim(),
          specialty: input.specialty.trim(),
          experienceYears: input.experienceYears.trim(),
          note: input.note.trim(),
          createdAt: nowIso(),
        },
        ...state.applications,
      ],
    },
  };
}

export function reviewApplication(
  state: V01DemoState,
  applicationId: string,
  decision: 'approved' | 'rejected',
  adminUserId: string,
): ActionResult {
  if (!getUserRoles(state, adminUserId).includes('admin')) {
    return { ok: false, message: 'Bu işlem için admin yetkisi gerekir.', state };
  }
  const application = state.applications.find((item) => item.id === applicationId);
  if (!application || application.status !== 'pending') {
    return { ok: false, message: 'Başvuru bulunamadı veya daha önce değerlendirildi.', state };
  }

  const reviewedAt = nowIso();
  const applications = state.applications.map((item) =>
    item.id === applicationId ? { ...item, status: decision, reviewedAt, reviewedBy: adminUserId } : item,
  );

  let nextState: V01DemoState = { ...state, applications };
  if (decision === 'approved' && !getUserRoles(state, application.userId).includes(application.requestedRole)) {
    nextState = {
      ...nextState,
      dkd_user_role_access: [
        {
          id: randomId('access'),
          userId: application.userId,
          role: application.requestedRole,
          status: 'active',
          source: 'admin_approval',
          grantedAt: reviewedAt,
          grantedBy: adminUserId,
        },
        ...nextState.dkd_user_role_access,
      ],
    };
  }

  return {
    ok: true,
    message: decision === 'approved' ? 'Başvuru onaylandı ve rol erişimi açıldı.' : 'Başvuru reddedildi.',
    state: nextState,
  };
}

export function grantRole(
  state: V01DemoState,
  targetUserId: string,
  role: ApplicationRole,
  adminUserId: string,
): ActionResult {
  if (!getUserRoles(state, adminUserId).includes('admin')) {
    return { ok: false, message: 'Admin yetkisi gerekir.', state };
  }
  if (!getUserById(state, targetUserId)) return { ok: false, message: 'Kullanıcı bulunamadı.', state };
  if (getUserRoles(state, targetUserId).includes(role)) return { ok: false, message: 'Kullanıcı bu role zaten sahip.', state };

  return {
    ok: true,
    message: `${roleLabel(role)} rolü tanımlandı.`,
    state: {
      ...state,
      dkd_user_role_access: [
        {
          id: randomId('access'),
          userId: targetUserId,
          role,
          status: 'active',
          source: 'admin_manual',
          grantedAt: nowIso(),
          grantedBy: adminUserId,
        },
        ...state.dkd_user_role_access,
      ],
    },
  };
}

export function revokeRole(
  state: V01DemoState,
  targetUserId: string,
  role: ApplicationRole,
  adminUserId: string,
): ActionResult {
  if (!getUserRoles(state, adminUserId).includes('admin')) {
    return { ok: false, message: 'Admin yetkisi gerekir.', state };
  }
  if (!getUserRoles(state, targetUserId).includes(role)) {
    return { ok: false, message: 'Kullanıcı bu role sahip değil.', state };
  }

  const access = state.dkd_user_role_access.filter(
    (item) => !(item.userId === targetUserId && item.role === role),
  );
  const activeRole = state.activeRoleByUser[targetUserId] === role ? 'customer' : state.activeRoleByUser[targetUserId];

  return {
    ok: true,
    message: `${roleLabel(role)} rolü kaldırıldı.`,
    state: {
      ...state,
      dkd_user_role_access: access,
      activeRoleByUser: {
        ...state.activeRoleByUser,
        [targetUserId]: activeRole ?? 'customer',
      },
    },
  };
}

export function setMasterPresence(
  state: V01DemoState,
  userId: string,
  presence: 'available' | 'busy' | 'offline',
): ActionResult {
  if (!getUserRoles(state, userId).includes('master')) {
    return { ok: false, message: 'Usta rolü gerekir.', state };
  }
  return {
    ok: true,
    message: presence === 'available' ? 'Uygun durumuna geçildi.' : presence === 'busy' ? 'Meşgul durumuna geçildi.' : 'Çevrimdışı durumuna geçildi.',
    state: {
      ...state,
      masterPresenceByUser: { ...state.masterPresenceByUser, [userId]: presence },
    },
  };
}

export function resetV01Demo(): ActionResult {
  return {
    ok: true,
    message: 'v0.1 demo verileri sıfırlandı.',
    state: JSON.parse(JSON.stringify(initialV01State)) as V01DemoState,
  };
}

export function roleLabel(role: UserRole) {
  return role === 'customer' ? 'Müşteri' : role === 'master' ? 'Usta' : role === 'business' ? 'İşletme' : 'Admin';
}

export function roleIcon(role: UserRole) {
  return role === 'customer'
    ? 'person-outline'
    : role === 'master'
      ? 'cut-outline'
      : role === 'business'
        ? 'storefront-outline'
        : 'shield-checkmark-outline';
}
