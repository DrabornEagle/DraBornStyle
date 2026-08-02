import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { colors, gradients, radii, spacing } from '../theme';
import { DemoUser, RoleApplication } from '../v01/types';
import { SectionHeader, StatusPill } from '../v01/PanelWidgets';
import { V02DemoState } from '../v02/types';
import { getCustomerAppointments, statusLabel, statusTone } from './state';
import { AppointmentStatus, V03DemoState } from './types';

type Result = { ok: boolean; message: string };

export function V03CustomerPanel({ user, applications, operationsState, appointmentState, onOpenAppointment, onStatus, onApplyMaster, onApplyBusiness, onScanQr, onMessage }: {
  user: DemoUser;
  applications: RoleApplication[];
  operationsState: V02DemoState;
  appointmentState: V03DemoState;
  onOpenAppointment: () => void;
  onStatus: (appointmentId: string, status: AppointmentStatus) => Result;
  onApplyMaster: () => void;
  onApplyBusiness: () => void;
  onScanQr: (qrId: string) => Result;
  onMessage: (message: string, success?: boolean) => void;
}) {
  const business = operationsState.businesses[0];
  const master = operationsState.masterProfiles[0];
  const services = operationsState.services.filter((item) => item.businessId === business?.id);
  const appointments = getCustomerAppointments(appointmentState, user.id);
  const upcoming = appointments.filter((item) => !['completed', 'cancelled', 'no_show'].includes(item.status));
  const history = appointments.filter((item) => ['completed', 'cancelled', 'no_show'].includes(item.status));
  const act = (result: Result) => onMessage(result.message, result.ok);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Image source={{ uri: business?.coverImage }} resizeMode="cover" style={styles.heroImage} />
        <LinearGradient colors={['rgba(4,6,11,0.12)', 'rgba(4,6,11,0.62)', 'rgba(4,6,11,0.98)']} locations={[0, 0.42, 1]} style={StyleSheet.absoluteFillObject} />
        <View style={styles.heroBadge}><Ionicons name="sparkles" size={14} color={colors.primary} /><Text style={styles.heroBadgeText}>DRABORNSTYLE v0.3.0</Text></View>
        <View style={styles.heroCopyCard}>
          <Text style={styles.greeting}>Merhaba, {user.fullName.split(' ')[0]}</Text>
          <Text style={styles.heroTitle}>Randevunu seç,{`\n`}akışını canlı takip et.</Text>
          <Text style={styles.heroText}>Usta, hizmet, gün ve saat seç. Yoldayım ve Geldim durumlarını tek dokunuşla bildir.</Text>
          <AnimatedPressable onPress={onOpenAppointment}>
            <LinearGradient colors={gradients.hero} style={styles.heroButton}><Ionicons name="calendar" size={18} color={colors.white} /><Text style={styles.heroButtonText}>Yeni Randevu Al</Text><Ionicons name="arrow-forward" size={17} color={colors.white} /></LinearGradient>
          </AnimatedPressable>
        </View>
      </View>

      {business && master && (
        <View style={styles.masterCard}>
          <Image source={{ uri: master.image }} style={styles.masterImage} />
          <View style={styles.masterInfo}><View style={styles.nameRow}><Text numberOfLines={1} style={styles.masterName}>Arda Yılmaz</Text><Ionicons name="checkmark-circle" size={17} color={colors.cyan} /></View><Text numberOfLines={1} style={styles.masterText}>{business.name} · {business.address}</Text><Text style={styles.masterMeta}>★ 4.9 · Özel kod: ARDA15</Text></View>
          <View style={styles.available}><View style={styles.availableDot} /><Text style={styles.availableText}>Uygun</Text></View>
        </View>
      )}

      <SectionHeader title="Yaklaşan randevular" meta={`${upcoming.length} aktif`} />
      {upcoming.length === 0 ? (
        <View style={styles.empty}><Ionicons name="calendar-outline" size={32} color={colors.primary} /><Text style={styles.emptyTitle}>Aktif randevun yok</Text><AnimatedPressable style={styles.emptyButton} onPress={onOpenAppointment}><Text style={styles.emptyButtonText}>Randevu oluştur</Text></AnimatedPressable></View>
      ) : upcoming.map((appointment) => {
        const service = services.find((item) => item.id === appointment.serviceId);
        return (
          <View key={appointment.id} style={styles.appointmentCard}>
            <View style={styles.appointmentTop}><Text style={styles.code}>{appointment.code}</Text><StatusPill label={statusLabel(appointment.status)} status={statusTone(appointment.status)} /></View>
            <View style={styles.appointmentMain}><View style={[styles.serviceIcon, { backgroundColor: `${service?.accent ?? colors.primary}18` }]}><Ionicons name={(service?.icon ?? 'cut-outline') as keyof typeof Ionicons.glyphMap} size={22} color={service?.accent ?? colors.primary} /></View><View style={styles.appointmentInfo}><Text style={styles.appointmentTitle}>{service?.title ?? 'Hizmet'}</Text><Text style={styles.appointmentTime}>{appointment.date} · {appointment.time} · {appointment.durationMinutes} dk</Text>{!!appointment.note && <Text numberOfLines={2} style={styles.note}>{appointment.note}</Text>}</View></View>
            <View style={styles.track}>{['scheduled', 'on_the_way', 'customer_arrived', 'arrived', 'in_service', 'completed'].map((status, index) => { const order = ['scheduled', 'on_the_way', 'customer_arrived', 'arrived', 'in_service', 'completed']; return <View key={status} style={[styles.trackDot, order.indexOf(appointment.status) >= index && !['cancelled', 'no_show'].includes(appointment.status) && styles.trackDotActive]} />; })}</View>
            <View style={styles.actions}>
              {appointment.status === 'scheduled' && <AnimatedPressable style={styles.secondary} onPress={() => act(onStatus(appointment.id, 'on_the_way'))}><Ionicons name="navigate-outline" size={16} color={colors.cyan} /><Text style={styles.secondaryText}>Yoldayım</Text></AnimatedPressable>}
              {appointment.status === 'on_the_way' && <AnimatedPressable style={styles.primary} onPress={() => act(onStatus(appointment.id, 'customer_arrived'))}><Ionicons name="location" size={16} color={colors.white} /><Text style={styles.primaryText}>Geldim</Text></AnimatedPressable>}
              {['scheduled', 'on_the_way'].includes(appointment.status) && <AnimatedPressable style={styles.cancel} onPress={() => act(onStatus(appointment.id, 'cancelled'))}><Text style={styles.cancelText}>İptal</Text></AnimatedPressable>}
              {appointment.status === 'customer_arrived' && <View style={styles.waiting}><Ionicons name="time-outline" size={16} color={colors.amber} /><Text style={styles.waitingText}>Ustanın “Geldi” onayı bekleniyor</Text></View>}
              {appointment.status === 'arrived' && <View style={styles.waiting}><Ionicons name="checkmark-circle" size={16} color={colors.green} /><Text style={styles.waitingText}>İşlem sırası hazır</Text></View>}
              {appointment.status === 'in_service' && <View style={styles.waiting}><Ionicons name="cut" size={16} color={colors.primary} /><Text style={styles.waitingText}>Usta şu anda işlemde</Text></View>}
            </View>
          </View>
        );
      })}

      <SectionHeader title="Hizmetler ve fiyatlar" meta={`${services.length} hizmet`} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serviceRow}>{services.map((service) => <View key={service.id} style={styles.serviceCard}><View style={[styles.serviceLargeIcon, { backgroundColor: `${service.accent}18` }]}><Ionicons name={service.icon as keyof typeof Ionicons.glyphMap} size={23} color={service.accent} /></View><Text numberOfLines={1} style={styles.serviceTitle}>{service.title}</Text><Text style={styles.serviceDuration}>{service.durationMinutes} dk</Text><Text style={styles.servicePrice}>₺{service.priceTl}</Text></View>)}</ScrollView>

      <SectionHeader title="QR ile bağlan" meta="Demo akış" />
      <View style={styles.qrGrid}>{operationsState.qrSources.filter((item) => item.purpose !== 'quick_transaction').map((qr) => <AnimatedPressable key={qr.id} style={styles.qrCard} onPress={() => act(onScanQr(qr.id))}><Ionicons name="qr-code" size={28} color={colors.cyan} /><Text style={styles.qrTitle}>{qr.label}</Text><Text style={styles.qrText}>Tarama: {qr.scanCount}</Text></AnimatedPressable>)}</View>

      <SectionHeader title="Rol başvuruları" meta={applications.find((item) => item.status === 'pending') ? 'Beklemede' : 'Açık'} />
      <View style={styles.applicationRow}><AnimatedPressable style={styles.applicationButton} onPress={onApplyMaster}><Ionicons name="cut-outline" size={21} color={colors.cyan} /><Text style={styles.applicationText}>Usta Başvurusu</Text></AnimatedPressable><AnimatedPressable style={styles.applicationButton} onPress={onApplyBusiness}><Ionicons name="storefront-outline" size={21} color={colors.amber} /><Text style={styles.applicationText}>İşletme Başvurusu</Text></AnimatedPressable></View>

      {history.length > 0 && <><SectionHeader title="Geçmiş" meta={`${history.length} kayıt`} />{history.map((item) => <View key={item.id} style={styles.historyRow}><Text style={styles.historyTitle}>{item.code} · {statusLabel(item.status)}</Text><Text style={styles.historyText}>{item.date} · {item.time}</Text></View>)}</>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingTop: 8, paddingBottom: 36 },
  hero: { height: 360, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }, heroImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroBadge: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(4,6,11,0.9)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }, heroBadgeText: { color: colors.white, fontSize: 8.5, fontWeight: '900', letterSpacing: 0.8 },
  heroCopyCard: { position: 'absolute', left: 14, right: 14, bottom: 14, padding: 15, borderRadius: 20, backgroundColor: 'rgba(4,6,11,0.9)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.13)' }, greeting: { color: '#FF78AA', fontSize: 11, fontWeight: '900' }, heroTitle: { color: '#FFFFFF', fontSize: 27, lineHeight: 32, fontWeight: '900', marginTop: 5, textShadowColor: '#000', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }, heroText: { color: 'rgba(255,255,255,0.94)', fontSize: 11, lineHeight: 17, marginTop: 7 }, heroButton: { minHeight: 44, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, borderRadius: 15, marginTop: 12 }, heroButtonText: { color: colors.white, fontSize: 11.5, fontWeight: '900' },
  masterCard: { minHeight: 94, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, marginTop: 13, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, masterImage: { width: 68, height: 68, borderRadius: 20 }, masterInfo: { flex: 1, minWidth: 0 }, nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 }, masterName: { color: colors.white, fontSize: 15, fontWeight: '900', flexShrink: 1 }, masterText: { color: colors.textMuted, fontSize: 9.5, marginTop: 4 }, masterMeta: { color: colors.amber, fontSize: 9.5, marginTop: 7, fontWeight: '800' }, available: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(53,225,161,0.11)' }, availableDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green }, availableText: { color: colors.green, fontSize: 8.5, fontWeight: '900' },
  appointmentCard: { padding: 13, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 10 }, appointmentTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, code: { color: colors.secondary, fontSize: 10, fontWeight: '900' }, appointmentMain: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 12 }, serviceIcon: { width: 50, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, appointmentInfo: { flex: 1, minWidth: 0 }, appointmentTitle: { color: colors.white, fontSize: 14, fontWeight: '900' }, appointmentTime: { color: colors.cyan, fontSize: 10, fontWeight: '800', marginTop: 4 }, note: { color: colors.textMuted, fontSize: 9, lineHeight: 13, marginTop: 5 }, track: { flexDirection: 'row', gap: 5, marginTop: 12 }, trackDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.surfaceElevated }, trackDotActive: { backgroundColor: colors.primary }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }, secondary: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, borderRadius: 14, backgroundColor: 'rgba(45,212,255,0.1)', borderWidth: 1, borderColor: 'rgba(45,212,255,0.2)' }, secondaryText: { color: colors.cyan, fontSize: 10, fontWeight: '900' }, primary: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, borderRadius: 14, backgroundColor: colors.primary }, primaryText: { color: colors.white, fontSize: 10, fontWeight: '900' }, cancel: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 13, borderRadius: 14, backgroundColor: 'rgba(255,94,108,0.08)' }, cancelText: { color: colors.red, fontSize: 10, fontWeight: '900' }, waiting: { flex: 1, minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, borderRadius: 14, backgroundColor: 'rgba(255,182,72,0.08)' }, waitingText: { flex: 1, color: colors.amber, fontSize: 9.5, fontWeight: '800' },
  empty: { alignItems: 'center', padding: 24, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, emptyTitle: { color: colors.white, fontSize: 14, fontWeight: '900', marginTop: 10 }, emptyButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 14, backgroundColor: colors.primary, marginTop: 12 }, emptyButtonText: { color: colors.white, fontSize: 10, fontWeight: '900' },
  serviceRow: { gap: 9, paddingBottom: 3 }, serviceCard: { width: 132, minHeight: 152, padding: 12, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, serviceLargeIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, serviceTitle: { color: colors.white, fontSize: 12, fontWeight: '900', marginTop: 11 }, serviceDuration: { color: colors.textMuted, fontSize: 9, marginTop: 4 }, servicePrice: { color: colors.white, fontSize: 17, fontWeight: '900', marginTop: 8 },
  qrGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, qrCard: { width: '48.6%', minHeight: 112, padding: 13, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, qrTitle: { color: colors.white, fontSize: 11, fontWeight: '900', marginTop: 9 }, qrText: { color: colors.textMuted, fontSize: 9, marginTop: 4 }, applicationRow: { flexDirection: 'row', gap: 9 }, applicationButton: { flex: 1, minHeight: 82, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, applicationText: { color: colors.white, fontSize: 10.5, fontWeight: '900', textAlign: 'center' }, historyRow: { padding: 11, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 8 }, historyTitle: { color: colors.white, fontSize: 11, fontWeight: '900' }, historyText: { color: colors.textMuted, fontSize: 9, marginTop: 3 },
});
