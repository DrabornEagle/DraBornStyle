import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { dkd_supabase_client } from '../dkd_config/dkd_supabase_client';

type DkdRole = 'customer' | 'business' | 'master' | 'admin';

export type DkdV03Business = {
  dkd_business_id: string;
  dkd_business_name: string;
  dkd_address_text?: string | null;
  dkd_business_phone?: string | null;
  dkd_platform_service_fee_cents?: number | null;
};

export type DkdV03Master = {
  dkd_master_id: string;
  dkd_business_id?: string;
  dkd_master_name: string;
  dkd_master_specialty?: string | null;
};

export type DkdV03Service = {
  dkd_service_id: string;
  dkd_business_id?: string;
  dkd_service_title: string;
  dkd_price_cents: number;
  dkd_duration_minutes: number;
};

export type DkdV03Appointment = {
  dkd_appointment_id: string;
  dkd_booking_code?: string | null;
  dkd_customer_user_id?: string | null;
  dkd_business_id: string;
  dkd_master_id?: string | null;
  dkd_service_id?: string | null;
  dkd_start_at: string;
  dkd_end_at: string;
  dkd_status: string;
  dkd_source: string;
  dkd_customer_note?: string | null;
  dkd_business_note?: string | null;
  dkd_customer_name?: string | null;
  dkd_customer_phone?: string | null;
  dkd_arrival_status?: string | null;
  dkd_flow_note?: string | null;
  dkd_final_price_cents?: number | null;
  dkd_platform_fee_cents?: number | null;
  dkd_metadata?: any;
};

function dkd_today_input() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function dkd_time_input() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 60);
  return `${String(now.getHours()).padStart(2, '0')}:00`;
}

function dkd_money(cents?: number | null) {
  return `${Math.round((cents ?? 0) / 100)} TL`;
}

function dkd_when(value?: string | null) {
  if (!value) return 'Saat yok';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function dkd_status_label(status?: string | null, arrival?: string | null) {
  const map: Record<string, string> = {
    requested: 'Talep alındı',
    confirmed: 'Onaylandı',
    checked_in: 'Müşteri geldi',
    in_service: 'İşlemde',
    completed: 'Tamamlandı',
    cancelled: 'İptal',
    no_show: 'Gelmedi',
    on_the_way: 'Yolda',
    arrived: 'Kapıda',
    late: 'Gecikiyor'
  };
  if (arrival && arrival !== 'not_started' && arrival !== 'completed') return map[arrival] ?? arrival;
  return map[status ?? ''] ?? status ?? 'Durum yok';
}

function dkd_service_name(services: DkdV03Service[], id?: string | null) {
  return services.find((item) => item.dkd_service_id === id)?.dkd_service_title ?? 'Hizmet seçilmedi';
}

function dkd_master_name(masters: DkdV03Master[], id?: string | null) {
  return masters.find((item) => item.dkd_master_id === id)?.dkd_master_name ?? 'Usta fark etmez';
}

async function dkd_add_flow_event(appointmentId: string, userId: string | null, eventType: string, note?: string) {
  await dkd_supabase_client.from('dkd_appointment_flow_events').insert({
    dkd_appointment_id: appointmentId,
    dkd_actor_user_id: userId,
    dkd_event_type: eventType,
    dkd_event_note: note ?? null,
    dkd_metadata: { dkd_v: '0.3.0' }
  });
}

export function useDkdAppointments(
  userId: string | null,
  businessId: string | null,
  accessRoles: DkdRole[],
  setStatus: (value: string) => void
) {
  const [businesses, setBusinesses] = React.useState<DkdV03Business[]>([]);
  const [customerMasters, setCustomerMasters] = React.useState<DkdV03Master[]>([]);
  const [customerServices, setCustomerServices] = React.useState<DkdV03Service[]>([]);
  const [customerAppointments, setCustomerAppointments] = React.useState<DkdV03Appointment[]>([]);
  const [businessAppointments, setBusinessAppointments] = React.useState<DkdV03Appointment[]>([]);
  const [masterAppointments, setMasterAppointments] = React.useState<DkdV03Appointment[]>([]);

  const [selectedBusinessId, setSelectedBusinessId] = React.useState<string | null>(null);
  const [selectedMasterId, setSelectedMasterId] = React.useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = React.useState<string | null>(null);
  const [appointmentDate, setAppointmentDate] = React.useState(dkd_today_input());
  const [appointmentTime, setAppointmentTime] = React.useState(dkd_time_input());
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [customerNote, setCustomerNote] = React.useState('');

  async function loadBookingCatalog(nextBusinessId?: string | null) {
    if (!userId) return;
    const businessRes = await dkd_supabase_client
      .from('dkd_business_profiles')
      .select('dkd_business_id, dkd_business_name, dkd_address_text, dkd_business_phone, dkd_platform_service_fee_cents')
      .eq('dkd_is_active', true)
      .order('dkd_business_name', { ascending: true });
    const nextBusinesses = (businessRes.data ?? []) as DkdV03Business[];
    setBusinesses(nextBusinesses);

    const catalogBusinessId = nextBusinessId ?? selectedBusinessId ?? nextBusinesses[0]?.dkd_business_id ?? null;
    if (!selectedBusinessId && catalogBusinessId) setSelectedBusinessId(catalogBusinessId);
    if (!catalogBusinessId) { setCustomerMasters([]); setCustomerServices([]); return; }

    const mastersRes = await dkd_supabase_client
      .from('dkd_master_profiles')
      .select('dkd_master_id, dkd_business_id, dkd_master_name, dkd_master_specialty')
      .eq('dkd_business_id', catalogBusinessId)
      .eq('dkd_is_active', true)
      .order('dkd_master_name', { ascending: true });
    setCustomerMasters((mastersRes.data ?? []) as DkdV03Master[]);

    const servicesRes = await dkd_supabase_client
      .from('dkd_services')
      .select('dkd_service_id, dkd_business_id, dkd_service_title, dkd_price_cents, dkd_duration_minutes')
      .eq('dkd_business_id', catalogBusinessId)
      .eq('dkd_is_active', true)
      .order('dkd_service_title', { ascending: true });
    const nextServices = (servicesRes.data ?? []) as DkdV03Service[];
    setCustomerServices(nextServices);
    if (!selectedServiceId && nextServices[0]?.dkd_service_id) setSelectedServiceId(nextServices[0].dkd_service_id);
  }

  async function loadAppointments() {
    if (!userId) {
      setCustomerAppointments([]);
      setBusinessAppointments([]);
      setMasterAppointments([]);
      return;
    }

    const customerRes = await dkd_supabase_client
      .from('dkd_appointments')
      .select('*')
      .eq('dkd_customer_user_id', userId)
      .order('dkd_start_at', { ascending: true })
      .limit(40);
    setCustomerAppointments((customerRes.data ?? []) as DkdV03Appointment[]);

    if (businessId && (accessRoles.includes('business') || accessRoles.includes('admin'))) {
      const businessRes = await dkd_supabase_client
        .from('dkd_appointments')
        .select('*')
        .eq('dkd_business_id', businessId)
        .order('dkd_start_at', { ascending: true })
        .limit(80);
      setBusinessAppointments((businessRes.data ?? []) as DkdV03Appointment[]);
    } else {
      setBusinessAppointments([]);
    }

    if (accessRoles.includes('master') || accessRoles.includes('admin')) {
      const masterProfileRes = await dkd_supabase_client
        .from('dkd_master_profiles')
        .select('dkd_master_id')
        .eq('dkd_user_id', userId)
        .eq('dkd_is_active', true);
      const masterIds = (masterProfileRes.data ?? []).map((item: any) => item.dkd_master_id).filter(Boolean);
      if (masterIds.length > 0) {
        const masterRes = await dkd_supabase_client
          .from('dkd_appointments')
          .select('*')
          .in('dkd_master_id', masterIds)
          .order('dkd_start_at', { ascending: true })
          .limit(60);
        setMasterAppointments((masterRes.data ?? []) as DkdV03Appointment[]);
      } else {
        setMasterAppointments([]);
      }
    } else {
      setMasterAppointments([]);
    }
  }

  async function refreshAll() {
    await loadBookingCatalog(selectedBusinessId);
    await loadAppointments();
  }

  React.useEffect(() => { refreshAll(); }, [userId, businessId, accessRoles.join('|')]);
  React.useEffect(() => { loadBookingCatalog(selectedBusinessId); }, [selectedBusinessId]);

  async function createAppointment() {
    if (!userId) { setStatus('Randevu için önce giriş yapılmalı.'); return; }
    const selectedBusiness = businesses.find((item) => item.dkd_business_id === selectedBusinessId);
    const selectedService = customerServices.find((item) => item.dkd_service_id === selectedServiceId);
    if (!selectedBusiness || !selectedService) { setStatus('Salon ve hizmet seçimi gerekli.'); return; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) || !/^\d{2}:\d{2}$/.test(appointmentTime)) {
      setStatus('Tarih ve saati 2026-06-27 / 14:30 formatında gir.');
      return;
    }
    const start = new Date(`${appointmentDate}T${appointmentTime}:00`);
    if (Number.isNaN(start.getTime())) { setStatus('Randevu zamanı okunamadı.'); return; }
    const end = new Date(start.getTime() + selectedService.dkd_duration_minutes * 60 * 1000);

    const payload: any = {
      dkd_customer_user_id: userId,
      dkd_business_id: selectedBusiness.dkd_business_id,
      dkd_master_id: selectedMasterId || null,
      dkd_service_id: selectedService.dkd_service_id,
      dkd_start_at: start.toISOString(),
      dkd_end_at: end.toISOString(),
      dkd_status: 'requested',
      dkd_source: 'app',
      dkd_customer_note: customerNote.trim() || null,
      dkd_customer_name: customerName.trim() || null,
      dkd_customer_phone: customerPhone.trim() || null,
      dkd_final_price_cents: selectedService.dkd_price_cents,
      dkd_platform_fee_cents: selectedBusiness.dkd_platform_service_fee_cents ?? 2000,
      dkd_arrival_status: 'not_started',
      dkd_metadata: {
        dkd_v: '0.3.0',
        business_name: selectedBusiness.dkd_business_name,
        service_title: selectedService.dkd_service_title,
        duration_minutes: selectedService.dkd_duration_minutes
      }
    };

    const res = await dkd_supabase_client.from('dkd_appointments').insert(payload).select('*').single();
    if (res.error) { setStatus(res.error.message); return; }
    await dkd_add_flow_event(res.data.dkd_appointment_id, userId, 'requested', 'Müşteri randevu talebi oluşturdu.');
    setCustomerNote('');
    setStatus('Randevu talebi oluşturuldu. İşletme takvimine düştü.');
    await loadAppointments();
  }

  async function setAppointmentStatus(appointment: DkdV03Appointment, nextStatus: string, note?: string) {
    const now = new Date().toISOString();
    const payload: any = { dkd_flow_note: note ?? null };
    if (['requested', 'confirmed', 'checked_in', 'in_service', 'completed', 'cancelled', 'no_show'].includes(nextStatus)) payload.dkd_status = nextStatus;
    if (nextStatus === 'on_the_way') payload.dkd_arrival_status = 'on_the_way';
    if (nextStatus === 'arrived') { payload.dkd_arrival_status = 'arrived'; payload.dkd_arrived_at = now; }
    if (nextStatus === 'checked_in') { payload.dkd_arrival_status = 'checked_in'; payload.dkd_check_in_at = now; }
    if (nextStatus === 'late') { payload.dkd_arrival_status = 'late'; payload.dkd_late_marked_at = now; }
    if (nextStatus === 'no_show') { payload.dkd_arrival_status = 'no_show'; payload.dkd_no_show_at = now; }
    if (nextStatus === 'cancelled') { payload.dkd_arrival_status = 'cancelled'; payload.dkd_cancelled_at = now; }
    if (nextStatus === 'completed') { payload.dkd_arrival_status = 'completed'; payload.dkd_completed_at = now; }

    const res = await dkd_supabase_client
      .from('dkd_appointments')
      .update(payload)
      .eq('dkd_appointment_id', appointment.dkd_appointment_id);
    if (res.error) { setStatus(res.error.message); return; }
    await dkd_add_flow_event(appointment.dkd_appointment_id, userId, nextStatus, note);
    setStatus(`Randevu durumu güncellendi: ${dkd_status_label(nextStatus, nextStatus)}`);
    await loadAppointments();
  }

  return {
    businesses,
    customerMasters,
    customerServices,
    customerAppointments,
    businessAppointments,
    masterAppointments,
    selectedBusinessId,
    setSelectedBusinessId,
    selectedMasterId,
    setSelectedMasterId,
    selectedServiceId,
    setSelectedServiceId,
    appointmentDate,
    setAppointmentDate,
    appointmentTime,
    setAppointmentTime,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerNote,
    setCustomerNote,
    createAppointment,
    setAppointmentStatus,
    refreshAll
  };
}

function DkdV03Input(props: any) {
  const { label, ...rest } = props;
  return <View style={v03.inputWrap}><Text style={v03.inputLabel}>{label}</Text><TextInput {...rest} placeholderTextColor="#91A29C" style={v03.input} /></View>;
}

function DkdV03Choice(props: { selected?: boolean; title: string; subtitle?: string; onPress: () => void }) {
  return <TouchableOpacity activeOpacity={0.85} onPress={props.onPress} style={props.selected ? v03.choiceActive : v03.choice}><Text style={props.selected ? v03.choiceTitleActive : v03.choiceTitle}>{props.title}</Text>{props.subtitle ? <Text style={v03.choiceSub}>{props.subtitle}</Text> : null}</TouchableOpacity>;
}

function DkdV03AppointmentCard(props: any) {
  const item: DkdV03Appointment = props.item;
  const title = `#${item.dkd_booking_code ?? item.dkd_appointment_id.slice(0, 6)} • ${dkd_when(item.dkd_start_at)}`;
  const subtitle = `${item.dkd_customer_name || 'Müşteri'} • ${dkd_service_name(props.services ?? [], item.dkd_service_id)} • ${dkd_status_label(item.dkd_status, item.dkd_arrival_status)}`;
  return <View style={v03.appointmentCard}><View style={v03.rowBetween}><Text style={v03.appointmentTitle}>{title}</Text><Text style={v03.statusPill}>{dkd_status_label(item.dkd_status, item.dkd_arrival_status)}</Text></View><Text style={v03.appointmentSub}>{subtitle}</Text><Text style={v03.appointmentSub}>{dkd_master_name(props.masters ?? [], item.dkd_master_id)} • {dkd_money(item.dkd_final_price_cents)}</Text>{item.dkd_customer_note ? <Text style={v03.note}>Not: {item.dkd_customer_note}</Text> : null}<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={v03.actionRow}>{props.actions?.map((action: any) => <TouchableOpacity key={action.label} style={action.ghost ? v03.smallGhost : v03.smallButton} onPress={() => action.onPress(item)}><Text style={action.ghost ? v03.smallGhostText : v03.smallButtonText}>{action.label}</Text></TouchableOpacity>)}</ScrollView></View>;
}

export function DkdCustomerBookingPanel(props: any) {
  return <View style={v03.wrap}><Text style={v03.kicker}>v0.3 Randevu + Takvim</Text><Text style={v03.title}>Randevu Oluştur</Text><Text style={v03.body}>Salon seç, usta/hizmet belirle, tarih ve saat gir. Talep işletmenin takvimine düşer.</Text><Text style={v03.section}>Salon Seç</Text>{props.businesses.length === 0 ? <Text style={v03.empty}>Henüz aktif salon bulunamadı.</Text> : null}{props.businesses.map((item: DkdV03Business) => <DkdV03Choice key={item.dkd_business_id} selected={props.selectedBusinessId === item.dkd_business_id} title={item.dkd_business_name} subtitle={item.dkd_address_text || item.dkd_business_phone || 'Aktif salon'} onPress={() => props.setSelectedBusinessId(item.dkd_business_id)} />)}<Text style={v03.section}>Usta Seç</Text><DkdV03Choice selected={!props.selectedMasterId} title="Usta fark etmez" subtitle="İşletme uygun ustayı atayabilir" onPress={() => props.setSelectedMasterId(null)} />{props.masters.map((item: DkdV03Master) => <DkdV03Choice key={item.dkd_master_id} selected={props.selectedMasterId === item.dkd_master_id} title={item.dkd_master_name} subtitle={item.dkd_master_specialty || 'Usta'} onPress={() => props.setSelectedMasterId(item.dkd_master_id)} />)}<Text style={v03.section}>Hizmet Seç</Text>{props.services.map((item: DkdV03Service) => <DkdV03Choice key={item.dkd_service_id} selected={props.selectedServiceId === item.dkd_service_id} title={item.dkd_service_title} subtitle={`${dkd_money(item.dkd_price_cents)} • ${item.dkd_duration_minutes} dk`} onPress={() => props.setSelectedServiceId(item.dkd_service_id)} />)}<View style={v03.twoCol}><DkdV03Input label="Tarih" value={props.appointmentDate} onChangeText={props.setAppointmentDate} placeholder="2026-06-27" /><DkdV03Input label="Saat" value={props.appointmentTime} onChangeText={props.setAppointmentTime} placeholder="14:30" /></View><DkdV03Input label="Ad Soyad" value={props.customerName} onChangeText={props.setCustomerName} placeholder="Müşteri adı" /><DkdV03Input label="Telefon" value={props.customerPhone} onChangeText={props.setCustomerPhone} placeholder="Telefon" keyboardType="phone-pad" /><DkdV03Input label="Not" value={props.customerNote} onChangeText={props.setCustomerNote} placeholder="Saç modeli, gecikme notu, özel istek" /><TouchableOpacity style={v03.primary} onPress={props.createAppointment}><Text style={v03.primaryText}>Randevu Talebi Oluştur</Text></TouchableOpacity><Text style={v03.section}>Randevularım</Text>{props.appointments.length === 0 ? <Text style={v03.empty}>Henüz randevu yok.</Text> : null}{props.appointments.map((item: DkdV03Appointment) => <DkdV03AppointmentCard key={item.dkd_appointment_id} item={item} services={props.services} masters={props.masters} actions={[{ label: 'Yoldayım', onPress: (appt: DkdV03Appointment) => props.setAppointmentStatus(appt, 'on_the_way', 'Müşteri yola çıktı.') }, { label: 'Geldim', onPress: (appt: DkdV03Appointment) => props.setAppointmentStatus(appt, 'arrived', 'Müşteri salona geldi.') }, { label: 'İptal', ghost: true, onPress: (appt: DkdV03Appointment) => props.setAppointmentStatus(appt, 'cancelled', 'Müşteri iptal etti.') }]} />)}</View>;
}

export function DkdBusinessAppointmentPanel(props: any) {
  const requested = props.appointments.filter((item: DkdV03Appointment) => item.dkd_status === 'requested').length;
  const active = props.appointments.filter((item: DkdV03Appointment) => ['confirmed', 'checked_in', 'in_service'].includes(item.dkd_status)).length;
  return <View style={v03.wrap}><View style={v03.rowBetween}><View><Text style={v03.kicker}>v0.3 İşletme Takvimi</Text><Text style={v03.title}>Randevu & Müşteri Akışı</Text></View><TouchableOpacity style={v03.refresh} onPress={props.refresh}><Text style={v03.refreshText}>Yenile</Text></TouchableOpacity></View><View style={v03.stats}><View style={v03.stat}><Text style={v03.statValue}>{props.appointments.length}</Text><Text style={v03.statLabel}>Toplam</Text></View><View style={v03.stat}><Text style={v03.statValue}>{requested}</Text><Text style={v03.statLabel}>Talep</Text></View><View style={v03.stat}><Text style={v03.statValue}>{active}</Text><Text style={v03.statLabel}>Aktif</Text></View></View>{props.appointments.length === 0 ? <Text style={v03.empty}>Takvimde randevu yok. Müşteri randevuları burada görünecek.</Text> : null}{props.appointments.map((item: DkdV03Appointment) => <DkdV03AppointmentCard key={item.dkd_appointment_id} item={item} services={props.services} masters={props.masters} actions={[{ label: 'Onayla', onPress: (appt: DkdV03Appointment) => props.setAppointmentStatus(appt, 'confirmed', 'İşletme randevuyu onayladı.') }, { label: 'Geldi', onPress: (appt: DkdV03Appointment) => props.setAppointmentStatus(appt, 'checked_in', 'Müşteri salonda.') }, { label: 'İşlemde', onPress: (appt: DkdV03Appointment) => props.setAppointmentStatus(appt, 'in_service', 'İşlem başladı.') }, { label: 'Tamamlandı', onPress: (appt: DkdV03Appointment) => props.setAppointmentStatus(appt, 'completed', 'Randevu tamamlandı.') }, { label: 'Gelmedi', ghost: true, onPress: (appt: DkdV03Appointment) => props.setAppointmentStatus(appt, 'no_show', 'Müşteri gelmedi.') }]} />)}</View>;
}

export function DkdMasterAppointmentPanel(props: any) {
  return <View style={v03.wrap}><View style={v03.rowBetween}><View><Text style={v03.kicker}>v0.3 Usta Takvimi</Text><Text style={v03.title}>Bugünkü Akış</Text></View><TouchableOpacity style={v03.refresh} onPress={props.refresh}><Text style={v03.refreshText}>Yenile</Text></TouchableOpacity></View><Text style={v03.body}>Usta hesabına bağlı randevular burada görünür. Müşteri geldiğinde akışı güncelleyebilirsin.</Text>{props.appointments.length === 0 ? <Text style={v03.empty}>Bu usta hesabına bağlı randevu yok.</Text> : null}{props.appointments.map((item: DkdV03Appointment) => <DkdV03AppointmentCard key={item.dkd_appointment_id} item={item} services={props.services} masters={props.masters} actions={[{ label: 'Geldi', onPress: (appt: DkdV03Appointment) => props.setAppointmentStatus(appt, 'checked_in', 'Usta müşteriyi içeri aldı.') }, { label: 'İşlemde', onPress: (appt: DkdV03Appointment) => props.setAppointmentStatus(appt, 'in_service', 'Usta işleme başladı.') }, { label: 'Tamamlandı', onPress: (appt: DkdV03Appointment) => props.setAppointmentStatus(appt, 'completed', 'Usta randevuyu tamamladı.') }]} />)}</View>;
}

const v03 = StyleSheet.create({
  wrap: { backgroundColor: '#203432', borderRadius: 20, padding: 14, marginTop: 10, borderWidth: 1, borderColor: '#6F8D84' },
  kicker: { color: '#F0C766', fontSize: 12, fontWeight: '900', letterSpacing: 0.8, marginBottom: 4 },
  title: { color: '#FFF2DD', fontSize: 20, fontWeight: '900', marginBottom: 6 },
  body: { color: '#DDEBE4', fontSize: 14, lineHeight: 20, fontWeight: '700' },
  section: { color: '#9CF2E3', fontSize: 15, fontWeight: '900', marginTop: 14, marginBottom: 8 },
  empty: { color: '#DDEBE4', opacity: 0.8, fontSize: 13, lineHeight: 19, fontWeight: '700', backgroundColor: '#263F3C', padding: 12, borderRadius: 14 },
  choice: { backgroundColor: '#263F3C', borderRadius: 15, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#4E6A63' },
  choiceActive: { backgroundColor: '#F0C766', borderRadius: 15, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#FFF2DD' },
  choiceTitle: { color: '#FFF2DD', fontSize: 15, fontWeight: '900' },
  choiceTitleActive: { color: '#203432', fontSize: 15, fontWeight: '900' },
  choiceSub: { color: '#DDEBE4', fontSize: 12, fontWeight: '700', marginTop: 3 },
  inputWrap: { flex: 1, backgroundColor: '#263F3C', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8, borderWidth: 1, borderColor: '#4E6A63' },
  inputLabel: { color: '#F0C766', fontSize: 11, fontWeight: '900', marginBottom: 4 },
  input: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', minHeight: 32, padding: 0 },
  twoCol: { flexDirection: 'row', gap: 8 },
  primary: { backgroundColor: '#F0C766', borderRadius: 16, paddingVertical: 13, alignItems: 'center', marginTop: 6 },
  primaryText: { color: '#203432', fontSize: 15, fontWeight: '900' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  refresh: { backgroundColor: '#263F3C', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#6F8D84' },
  refreshText: { color: '#F0C766', fontSize: 12, fontWeight: '900' },
  stats: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  stat: { flex: 1, backgroundColor: '#263F3C', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#4E6A63' },
  statValue: { color: '#F0C766', fontSize: 20, fontWeight: '900' },
  statLabel: { color: '#DDEBE4', fontSize: 11, fontWeight: '800' },
  appointmentCard: { backgroundColor: '#263F3C', borderRadius: 16, padding: 12, marginTop: 8, borderWidth: 1, borderColor: '#4E6A63' },
  appointmentTitle: { color: '#FFF2DD', fontSize: 14, fontWeight: '900', flex: 1 },
  appointmentSub: { color: '#DDEBE4', fontSize: 13, lineHeight: 19, fontWeight: '700', marginTop: 4 },
  statusPill: { color: '#203432', backgroundColor: '#9CF2E3', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontWeight: '900', overflow: 'hidden' },
  note: { color: '#F0C766', fontSize: 12, lineHeight: 18, fontWeight: '800', marginTop: 6 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10, paddingRight: 8 },
  smallButton: { backgroundColor: '#F0C766', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8 },
  smallButtonText: { color: '#203432', fontSize: 12, fontWeight: '900' },
  smallGhost: { borderColor: '#F0C766', borderWidth: 1, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8 },
  smallGhostText: { color: '#F0C766', fontSize: 12, fontWeight: '900' }
});
