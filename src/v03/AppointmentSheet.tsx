import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { colors, gradients, radii } from '../theme';
import { DemoUser } from '../v01/types';
import { V02DemoState } from '../v02/types';
import { appointmentDateOptions, appointmentTimeOptions } from './demoData';
import { isSlotAvailable } from './state';
import { CreateAppointmentInput, V03DemoState } from './types';

type Result = { ok: boolean; message: string };

export function AppointmentSheet({
  visible,
  user,
  operationsState,
  appointmentState,
  onClose,
  onCreate,
  onMessage,
}: {
  visible: boolean;
  user: DemoUser;
  operationsState: V02DemoState;
  appointmentState: V03DemoState;
  onClose: () => void;
  onCreate: (input: CreateAppointmentInput) => Result;
  onMessage: (message: string, success?: boolean) => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const business = operationsState.businesses[0];
  const master = operationsState.masterProfiles[0];
  const services = useMemo(
    () => operationsState.services.filter((item) => item.businessId === business?.id),
    [business?.id, operationsState.services],
  );
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const [date, setDate] = useState(appointmentDateOptions[0]?.date ?? '2026-08-02');
  const [time, setTime] = useState('17:30');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!visible) return;
    setServiceId(services[0]?.id ?? '');
    setDate(appointmentDateOptions[0]?.date ?? '2026-08-02');
    setTime('17:30');
    setNote('');
  }, [services, visible]);

  if (!business || !master) return null;

  const service = services.find((item) => item.id === serviceId) ?? services[0];
  const availableTimes = appointmentTimeOptions.filter((item) =>
    isSlotAvailable(appointmentState, master.userId, date, item),
  );
  const timeWidth = Math.floor((width - 36 - 18) / 3);

  const submit = () => {
    if (!service) {
      onMessage('Hizmet seçilmedi.', false);
      return;
    }
    const response = onCreate({
      businessId: business.id,
      masterUserId: master.userId,
      customerUserId: user.id,
      customerName: user.fullName,
      customerPhone: user.phone,
      serviceId: service.id,
      date,
      time,
      durationMinutes: service.durationMinutes,
      source: 'mobile',
      note,
    });
    onMessage(response.message, response.ok);
    if (response.ok) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <AnimatedPressable haptic={false} style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Image source={{ uri: business.coverImage }} style={styles.headerImage} />
              <LinearGradient colors={['rgba(8,10,16,0.08)', 'rgba(8,10,16,0.96)']} style={StyleSheet.absoluteFillObject} />
              <AnimatedPressable style={styles.close} onPress={onClose}>
                <Ionicons name="close" size={23} color={colors.white} />
              </AnimatedPressable>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>YENİ RANDEVU</Text>
                <Text style={styles.title}>{business.name}</Text>
                <Text style={styles.subtitle}>Arda Yılmaz · {business.address}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Hizmet seç</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
              {services.map((item) => {
                const selected = item.id === serviceId;
                return (
                  <AnimatedPressable
                    key={item.id}
                    style={[styles.serviceCard, selected && { borderColor: item.accent, backgroundColor: `${item.accent}16` }]}
                    onPress={() => setServiceId(item.id)}
                  >
                    <View style={[styles.serviceIcon, { backgroundColor: `${item.accent}1C` }]}>
                      <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={22} color={item.accent} />
                    </View>
                    <Text numberOfLines={1} style={styles.serviceTitle}>{item.title}</Text>
                    <Text style={styles.serviceMeta}>{item.durationMinutes} dk · ₺{item.priceTl}</Text>
                  </AnimatedPressable>
                );
              })}
            </ScrollView>

            <Text style={styles.sectionTitle}>Gün seç</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
              {appointmentDateOptions.map((item) => {
                const selected = item.date === date;
                return (
                  <AnimatedPressable key={item.date} style={[styles.datePill, selected && styles.datePillActive]} onPress={() => setDate(item.date)}>
                    <Text style={[styles.dateLabel, selected && styles.dateLabelActive]}>{item.label}</Text>
                    <Text style={[styles.dateDay, selected && styles.dateDayActive]}>{item.day}</Text>
                  </AnimatedPressable>
                );
              })}
            </ScrollView>

            <Text style={styles.sectionTitle}>Müsait saat</Text>
            <View style={styles.timeGrid}>
              {availableTimes.map((item) => {
                const selected = item === time;
                return (
                  <AnimatedPressable key={item} style={[styles.timePill, { width: timeWidth }, selected && styles.timePillActive]} onPress={() => setTime(item)}>
                    <Text style={[styles.timeText, selected && styles.timeTextActive]}>{item}</Text>
                  </AnimatedPressable>
                );
              })}
              {availableTimes.length === 0 && <Text style={styles.emptyText}>Bu gün için müsait saat kalmadı.</Text>}
            </View>

            <Text style={styles.sectionTitle}>Ustaya not</Text>
            <View style={styles.noteShell}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Saç modeli, sakal şekli veya özel isteğini yaz"
                placeholderTextColor={colors.textFaint}
                multiline
                maxLength={240}
                style={styles.noteInput}
              />
            </View>

            <View style={styles.summary}>
              <View>
                <Text style={styles.summaryLabel}>Toplam</Text>
                <Text style={styles.summaryPrice}>₺{service?.priceTl ?? 0}</Text>
              </View>
              <View style={styles.summaryRight}>
                <Ionicons name="calendar-outline" size={18} color={colors.cyan} />
                <Text style={styles.summaryText}>{appointmentDateOptions.find((item) => item.date === date)?.label}, {time}</Text>
              </View>
            </View>

            <AnimatedPressable style={styles.submitWrap} disabled={!time || !service} onPress={submit}>
              <LinearGradient colors={gradients.hero} style={styles.submit}>
                <Text style={styles.submitText}>Randevuyu Oluştur</Text>
                <Ionicons name="checkmark-circle" size={22} color={colors.white} />
              </LinearGradient>
            </AnimatedPressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(4,6,12,0.78)' },
  sheet: { maxHeight: '94%', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  handle: { width: 54, height: 5, borderRadius: 3, backgroundColor: colors.textFaint, alignSelf: 'center', marginTop: 10, marginBottom: 8 },
  content: { paddingHorizontal: 18, paddingBottom: 24 },
  header: { height: 176, borderRadius: 24, overflow: 'hidden', marginBottom: 22 },
  headerImage: { width: '100%', height: '100%', position: 'absolute' },
  close: { position: 'absolute', right: 12, top: 12, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,10,16,0.78)' },
  headerCopy: { position: 'absolute', left: 16, right: 16, bottom: 15 },
  eyebrow: { color: colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.white, fontSize: 22, fontWeight: '900', marginTop: 4 },
  subtitle: { color: 'rgba(255,255,255,0.84)', fontSize: 11, marginTop: 4 },
  sectionTitle: { color: colors.white, fontSize: 16, fontWeight: '900', marginBottom: 11 },
  horizontalRow: { gap: 9, paddingBottom: 20, paddingRight: 4 },
  serviceCard: { width: 148, minHeight: 124, padding: 12, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  serviceIcon: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  serviceTitle: { color: colors.white, fontSize: 12, fontWeight: '900', marginTop: 10 },
  serviceMeta: { color: colors.textMuted, fontSize: 9.5, marginTop: 5 },
  datePill: { minWidth: 104, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 17, alignItems: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  datePillActive: { backgroundColor: 'rgba(255,77,141,0.16)', borderColor: colors.primary },
  dateLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '900' },
  dateLabelActive: { color: colors.white },
  dateDay: { color: colors.textFaint, fontSize: 8.5, marginTop: 3 },
  dateDayActive: { color: colors.primary },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 9, rowGap: 9, marginBottom: 21 },
  timePill: { height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  timePillActive: { backgroundColor: 'rgba(45,212,255,0.15)', borderColor: colors.cyan },
  timeText: { color: colors.textMuted, fontSize: 12, fontWeight: '900' },
  timeTextActive: { color: colors.white },
  emptyText: { color: colors.textMuted, fontSize: 11 },
  noteShell: { minHeight: 94, flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 12, borderRadius: 17, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  noteInput: { flex: 1, color: colors.white, minHeight: 68, textAlignVertical: 'top', fontSize: 12, lineHeight: 17, padding: 0 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: 15, borderRadius: 18, backgroundColor: colors.card, marginBottom: 13 },
  summaryLabel: { color: colors.textMuted, fontSize: 10 },
  summaryPrice: { color: colors.white, fontSize: 24, fontWeight: '900', marginTop: 2 },
  summaryRight: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  summaryText: { color: colors.text, fontSize: 11, fontWeight: '800', flexShrink: 1 },
  submitWrap: { width: '100%' },
  submit: { minHeight: 56, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { color: colors.white, fontSize: 15, fontWeight: '900' },
});
