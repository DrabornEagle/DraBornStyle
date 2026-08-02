export type AppointmentStatus =
  | 'scheduled'
  | 'on_the_way'
  | 'customer_arrived'
  | 'arrived'
  | 'in_service'
  | 'completed'
  | 'no_show'
  | 'cancelled';

export type AppointmentSource = 'mobile' | 'walk_in' | 'direct_call' | 'favorite_customer';
export type AppointmentActor = 'customer' | 'master' | 'business' | 'admin' | 'system';

export interface V03Appointment {
  id: string;
  code: string;
  businessId: string;
  masterUserId: string;
  customerUserId?: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  date: string;
  time: string;
  durationMinutes: number;
  status: AppointmentStatus;
  source: AppointmentSource;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface V03AppointmentEvent {
  id: string;
  appointmentId: string;
  fromStatus?: AppointmentStatus;
  toStatus: AppointmentStatus;
  actor: AppointmentActor;
  note?: string;
  createdAt: string;
}

export interface V03DemoState {
  schemaVersion: 'v0.3.0-final';
  appointments: V03Appointment[];
  appointmentEvents: V03AppointmentEvent[];
}

export interface CreateAppointmentInput {
  businessId: string;
  masterUserId: string;
  customerUserId?: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  date: string;
  time: string;
  durationMinutes: number;
  source: AppointmentSource;
  note: string;
}

export interface V03ActionResult {
  ok: boolean;
  message: string;
  state: V03DemoState;
  appointment?: V03Appointment;
}

export interface AppointmentDateOption {
  label: string;
  date: string;
  day: string;
}
