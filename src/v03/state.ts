import { initialV03State } from './demoData';
import { AppointmentActor, AppointmentStatus, CreateAppointmentInput, V03ActionResult, V03Appointment, V03DemoState } from './types';

const terminalStatuses: AppointmentStatus[] = ['completed', 'no_show', 'cancelled'];
const slotBlockingStatuses: AppointmentStatus[] = ['scheduled', 'on_the_way', 'customer_arrived', 'arrived', 'in_service'];
const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  scheduled: ['on_the_way', 'customer_arrived', 'arrived', 'cancelled', 'no_show'],
  on_the_way: ['customer_arrived', 'arrived', 'cancelled', 'no_show'],
  customer_arrived: ['arrived', 'cancelled'],
  arrived: ['in_service', 'cancelled', 'no_show'],
  in_service: ['completed', 'cancelled'],
  completed: [], no_show: [], cancelled: [],
};

function nowIso() { return new Date().toISOString(); }
function randomId(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function nextCode(state: V03DemoState) {
  const codes = state.appointments.map((item) => Number(item.code.replace(/\D/g, ''))).filter(Number.isFinite);
  return `DBS-${String(Math.max(300, ...codes) + 1).padStart(4, '0')}`;
}
function result(ok: boolean, message: string, state: V03DemoState, appointment?: V03Appointment): V03ActionResult { return { ok, message, state, appointment }; }

export function getAppointmentById(state: V03DemoState, appointmentId: string) { return state.appointments.find((item) => item.id === appointmentId) ?? null; }
export function getCustomerAppointments(state: V03DemoState, userId: string) { return [...state.appointments].filter((item) => item.customerUserId === userId).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)); }
export function getMasterAppointments(state: V03DemoState, masterUserId: string, date?: string) { return [...state.appointments].filter((item) => item.masterUserId === masterUserId && (!date || item.date === date)).sort((a, b) => a.time.localeCompare(b.time)); }
export function getBusinessAppointments(state: V03DemoState, businessId: string, date?: string) { return [...state.appointments].filter((item) => item.businessId === businessId && (!date || item.date === date)).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)); }
export function isSlotAvailable(state: V03DemoState, masterUserId: string, date: string, time: string, ignoredAppointmentId?: string) {
  return !state.appointments.some((item) => item.id !== ignoredAppointmentId && item.masterUserId === masterUserId && item.date === date && item.time === time && slotBlockingStatuses.includes(item.status));
}

export function createAppointment(state: V03DemoState, input: CreateAppointmentInput): V03ActionResult {
  const customerName = input.customerName.trim();
  const customerPhone = input.customerPhone.trim();
  if (!customerName) return result(false, 'Müşteri adı gerekli.', state);
  if (!customerPhone) return result(false, 'Müşteri telefonu gerekli.', state);
  if (!input.serviceId) return result(false, 'Hizmet seçilmedi.', state);
  if (!input.date || !input.time) return result(false, 'Randevu günü ve saati seçilmedi.', state);
  if (!isSlotAvailable(state, input.masterUserId, input.date, input.time)) return result(false, 'Seçilen saat artık müsait değil. Başka bir saat seç.', state);
  const createdAt = nowIso();
  const appointment: V03Appointment = { id: randomId('appointment'), code: nextCode(state), businessId: input.businessId, masterUserId: input.masterUserId, customerUserId: input.customerUserId, customerName, customerPhone, serviceId: input.serviceId, date: input.date, time: input.time, durationMinutes: input.durationMinutes, status: 'scheduled', source: input.source, note: input.note.trim(), createdAt, updatedAt: createdAt };
  return result(true, `${appointment.code} kodlu randevu oluşturuldu.`, { ...state, appointments: [appointment, ...state.appointments], appointmentEvents: [{ id: randomId('event'), appointmentId: appointment.id, toStatus: 'scheduled', actor: input.source === 'mobile' ? 'customer' : 'master', note: input.source === 'mobile' ? 'Müşteri randevu oluşturdu.' : 'Usta müşteriyi takvime ekledi.', createdAt }, ...state.appointmentEvents] }, appointment);
}

export function updateAppointmentStatus(state: V03DemoState, appointmentId: string, nextStatus: AppointmentStatus, actor: AppointmentActor, note?: string): V03ActionResult {
  const appointment = getAppointmentById(state, appointmentId);
  if (!appointment) return result(false, 'Randevu bulunamadı.', state);
  if (appointment.status === nextStatus) return result(true, 'Randevu durumu zaten güncel.', state, appointment);
  if (terminalStatuses.includes(appointment.status)) return result(false, 'Tamamlanmış, iptal veya gelmedi durumundaki randevu değiştirilemez.', state);
  if (!allowedTransitions[appointment.status].includes(nextStatus)) return result(false, `${statusLabel(appointment.status)} durumundan ${statusLabel(nextStatus)} durumuna geçilemez.`, state);
  const updatedAt = nowIso();
  const updated = { ...appointment, status: nextStatus, updatedAt };
  return result(true, `${appointment.code}: ${statusLabel(nextStatus)} olarak güncellendi.`, { ...state, appointments: state.appointments.map((item) => item.id === appointmentId ? updated : item), appointmentEvents: [{ id: randomId('event'), appointmentId, fromStatus: appointment.status, toStatus: nextStatus, actor, note: note?.trim() || undefined, createdAt: updatedAt }, ...state.appointmentEvents] }, updated);
}

export function rescheduleAppointment(state: V03DemoState, appointmentId: string, date: string, time: string, actor: AppointmentActor): V03ActionResult {
  const appointment = getAppointmentById(state, appointmentId);
  if (!appointment) return result(false, 'Randevu bulunamadı.', state);
  if (appointment.status === 'in_service' || terminalStatuses.includes(appointment.status)) return result(false, 'Bu randevu yeniden planlanamaz.', state);
  if (!isSlotAvailable(state, appointment.masterUserId, date, time, appointment.id)) return result(false, 'Seçilen yeni saat müsait değil.', state);
  const updatedAt = nowIso();
  const updated = { ...appointment, date, time, status: 'scheduled' as const, updatedAt };
  return result(true, `${appointment.code} randevusu ${date} ${time} olarak yeniden planlandı.`, { ...state, appointments: state.appointments.map((item) => item.id === appointmentId ? updated : item), appointmentEvents: [{ id: randomId('event'), appointmentId, fromStatus: appointment.status, toStatus: 'scheduled', actor, note: `Yeni zaman: ${date} ${time}`, createdAt: updatedAt }, ...state.appointmentEvents] }, updated);
}

export function resetV03Demo(): V03ActionResult { return result(true, 'v0.3 randevu ve takvim demo verileri sıfırlandı.', initialV03State); }
export function statusLabel(status: AppointmentStatus) { return ({ scheduled: 'Randevu oluşturuldu', on_the_way: 'Yoldayım', customer_arrived: 'Geldim', arrived: 'Geldi', in_service: 'İşlemde', completed: 'Tamamlandı', no_show: 'Gelmedi', cancelled: 'İptal' } as const)[status]; }
export function statusTone(status: AppointmentStatus): 'success' | 'warning' | 'danger' | 'neutral' { if (status === 'completed' || status === 'arrived') return 'success'; if (status === 'on_the_way' || status === 'customer_arrived' || status === 'in_service') return 'warning'; if (status === 'cancelled' || status === 'no_show') return 'danger'; return 'neutral'; }
