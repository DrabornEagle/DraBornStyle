export type UserRole = 'customer' | 'business' | 'master' | 'admin';
export type ApplicationRole = 'business' | 'master';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type RoleGrantSource = 'automatic_registration' | 'admin_approval' | 'admin_manual' | 'seed';
export type MasterPresence = 'available' | 'busy' | 'offline';

export interface DemoUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  createdAt: string;
  avatarAccent: string;
  businessName?: string;
  specialty?: string;
}

export interface DkdUserRoleAccess {
  id: string;
  userId: string;
  role: UserRole;
  status: 'active';
  source: RoleGrantSource;
  grantedAt: string;
  grantedBy?: string;
}

export interface RoleApplication {
  id: string;
  userId: string;
  requestedRole: ApplicationRole;
  status: ApplicationStatus;
  businessName: string;
  specialty: string;
  experienceYears: string;
  note: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface V01DemoState {
  schemaVersion: 'v0.1-final';
  users: DemoUser[];
  dkd_user_role_access: DkdUserRoleAccess[];
  applications: RoleApplication[];
  sessionUserId: string | null;
  activeRoleByUser: Record<string, UserRole>;
  masterPresenceByUser: Record<string, MasterPresence>;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface ApplicationInput {
  requestedRole: ApplicationRole;
  businessName: string;
  specialty: string;
  experienceYears: string;
  note: string;
}

export interface ActionResult {
  ok: boolean;
  message: string;
  state: V01DemoState;
}
