import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { barbers, dateOptions, services, timeOptions } from '../data/mockData';
import { colors, gradients, radii, spacing } from '../theme';
import { Appointment } from '../types';
import { AnimatedPressable } from './AnimatedPressable';

export function BookingSheet({ barberId, visible, onClose, onConfirm }: { barberId: string | null; visible: boolean; onClose: () => void; onConfirm: (appointment: Appointment) => void; }) {
  const barber = useMemo(() => barbers.find((item) => item.id === barberId) ?? barbers[0], [barberId]);
  const availableServices = services.filter((service) => barber?.serviceIds.includes(service.id));
  const [serviceId, setServiceId] = useState(availableServices[0]?.id ?? 'haircut');
  const [dateLabel, setDateLabel] = useState(dateOptions[0]);
  const [time, setTime] = useState(barber?.nextSlot ?? timeOptions[0]);
  const translateY = useRef(new Animated.Value(700)).current;

  useEffect(() => {
    if (!visible) return;
    setServiceId(availableServices[0]?.id ?? 'haircut');
    setDateLabel(dateOptions[0]);
    setTime(barber?.nextSlot ?? timeOptions[0]);
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 3 }).start();
  }, [visible, barber?.id]);

  const selectedService = services.find((service) => service.id === serviceId) ?? services[0];
  const close = () => Animated.timing(translateY, { toValue: 700, duration: 220, useNativeDriver: true }).start(onClose);
  if (!barber || !selectedService) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.overlay}>
        <AnimatedPressable haptic={false} style={StyleSheet.absoluteFill} onPress={close} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <Image source={{ uri: barber.image }} style={styles.avatar} />
              <View style={{ flex: 1 }}><Text style={styles.eyebrow}>RANDEVU OLUŞTUR</Text><Text style={styles.title}>{barber.name}</Text><Text style={styles.subtitle}>{barber.studio} · {barber.neighborhood}</Text></View>
              <AnimatedPressable style={styles.close} onPress={close}><Ionicons name="close" size={22} color={colors.white} /></AnimatedPressable>
            </View>
            <Text style={styles.sectionTitle}>Hizmet seç</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
              {availableServices.map((service) => { const active = service.id === serviceId; return <AnimatedPressable key={service.id} style={[styles.serviceCard, active && { borderColor: service.accent, backgroundColor: `${service.accent}18` }]} onPress={() => setServiceId(service.id)}><View style={[styles.serviceIcon, { backgroundColor: `${service.accent}20` }]}><Ionicons name={service.icon as keyof typeof Ionicons.glyphMap} color={service.accent} size={21} /></View><Text style={styles.serviceName}>{service.title}</Text><Text style={styles.serviceMeta}>{service.duration} dk · ₺{service.price}</Text></AnimatedPressable>; })}
            </ScrollView>
            <Text style={styles.sectionTitle}>Gün seç</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>{dateOptions.map((date) => { const active = date === dateLabel; return <AnimatedPressable key={date} style={[styles.choicePill, active && styles.choicePillActive]} onPress={() => setDateLabel(date)}><Text style={[styles.choiceText, active && styles.choiceTextActive]}>{date}</Text></AnimatedPressable>; })}</ScrollView>
            <Text style={styles.sectionTitle}>Saat seç</Text>
            <View style={styles.timeGrid}>{timeOptions.map((item) => { const active = item === time; return <AnimatedPressable key={item} style={[styles.timePill, active && styles.timePillActive]} onPress={() => setTime(item)}><Text style={[styles.timeText, active && styles.timeTextActive]}>{item}</Text></AnimatedPressable>; })}</View>
            <View style={styles.summary}><View><Text style={styles.summaryLabel}>Toplam</Text><Text style={styles.summaryPrice}>₺{selectedService.price}</Text></View><View style={styles.summaryRight}><Ionicons name="time-outline" color={colors.textMuted} size={17} /><Text style={styles.summaryText}>{dateLabel}, {time}</Text></View></View>
            <AnimatedPressable onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined); onConfirm({ id: `booking-${Date.now()}`, barberId: barber.id, serviceId: selectedService.id, dateLabel, time, status: 'confirmed', createdAt: new Date().toISOString() }); close(); }}><LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.confirmButton}><Text style={styles.confirmText}>Randevuyu Onayla</Text><Ionicons name="checkmark-circle" size={22} color={colors.white} /></LinearGradient></AnimatedPressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }, sheet: { maxHeight: '92%', backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, borderColor: colors.border }, handle: { width: 54, height: 5, borderRadius: 3, backgroundColor: colors.textFaint, alignSelf: 'center', marginTop: 10 }, content: { padding: spacing.lg, paddingBottom: 38 }, header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }, avatar: { width: 58, height: 58, borderRadius: 18 }, eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 }, title: { color: colors.white, fontSize: 21, fontWeight: '900', marginTop: 2 }, subtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 }, close: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardSoft, alignItems: 'center', justifyContent: 'center' }, sectionTitle: { color: colors.white, fontSize: 15, fontWeight: '900', marginBottom: 12, marginTop: 2 }, horizontalRow: { gap: 10, paddingBottom: 20 }, serviceCard: { width: 145, padding: 13, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, gap: 7 }, serviceIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, serviceName: { color: colors.white, fontSize: 14, fontWeight: '800' }, serviceMeta: { color: colors.textMuted, fontSize: 11 }, choicePill: { paddingHorizontal: 17, paddingVertical: 11, borderRadius: radii.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, choicePillActive: { backgroundColor: 'rgba(255,77,141,0.18)', borderColor: colors.primary }, choiceText: { color: colors.textMuted, fontWeight: '700', fontSize: 12 }, choiceTextActive: { color: colors.white }, timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 22 }, timePill: { width: '23%', paddingVertical: 11, borderRadius: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }, timePillActive: { backgroundColor: 'rgba(45,212,255,0.16)', borderColor: colors.cyan }, timeText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' }, timeTextActive: { color: colors.white }, summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: radii.md, backgroundColor: colors.cardSoft, marginBottom: 14 }, summaryLabel: { color: colors.textMuted, fontSize: 11 }, summaryPrice: { color: colors.white, fontSize: 24, fontWeight: '900' }, summaryRight: { flexDirection: 'row', alignItems: 'center', gap: 6 }, summaryText: { color: colors.text, fontSize: 12, fontWeight: '700' }, confirmButton: { height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 }, confirmText: { color: colors.white, fontSize: 16, fontWeight: '900' },
});
