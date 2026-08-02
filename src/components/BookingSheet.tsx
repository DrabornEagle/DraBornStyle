import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { barbers, dateOptions, services, timeOptions } from '../data/mockData';
import { colors, gradients, radii } from '../theme';
import { Appointment } from '../types';
import { AnimatedPressable } from './AnimatedPressable';

const GAP = 9;
const SHEET_PADDING = 18;
const DEFAULT_DATE_LABEL = 'Bugün';
const DEFAULT_TIME = '09:00';

export function BookingSheet({
  barberId,
  visible,
  onClose,
  onConfirm,
}: {
  barberId: string | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (appointment: Appointment) => void;
}) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const barber = useMemo(() => barbers.find((item) => item.id === barberId) ?? barbers[0], [barberId]);
  const availableServices = useMemo(
    () => services.filter((service) => barber?.serviceIds.includes(service.id)),
    [barber],
  );
  const [serviceId, setServiceId] = useState<string>(availableServices[0]?.id ?? 'haircut');
  const [dateLabel, setDateLabel] = useState<string>(dateOptions[0] ?? DEFAULT_DATE_LABEL);
  const [time, setTime] = useState<string>(barber?.nextSlot ?? timeOptions[0] ?? DEFAULT_TIME);
  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (!visible) return;
    setServiceId(availableServices[0]?.id ?? 'haircut');
    setDateLabel(dateOptions[0] ?? DEFAULT_DATE_LABEL);
    setTime(barber?.nextSlot ?? timeOptions[0] ?? DEFAULT_TIME);
    translateY.setValue(height);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 19,
      bounciness: 2,
    }).start();
  }, [availableServices, barber?.id, height, translateY, visible]);

  const selectedService = services.find((service) => service.id === serviceId) ?? services[0];
  const close = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 220,
      useNativeDriver: true,
    }).start(onClose);
  };

  if (!barber || !selectedService) return null;

  const usableWidth = width - SHEET_PADDING * 2;
  const serviceCardWidth = Math.max(142, Math.min(176, usableWidth * 0.45));
  const timeCellWidth = Math.floor((usableWidth - GAP * 2) / 3);
  const narrow = width < 360;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <View style={styles.overlay}>
        <AnimatedPressable haptic={false} style={StyleSheet.absoluteFill} onPress={close} />
        <Animated.View
          style={[
            styles.sheet,
            { maxHeight: Math.min(height * 0.94, height - Math.max(insets.top, 12)), transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handle} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 18) + 18 }]}
          >
            <View style={styles.header}>
              <Image source={{ uri: barber.image }} style={styles.avatar} />
              <View style={styles.headerText}>
                <Text style={styles.eyebrow}>RANDEVU OLUŞTUR</Text>
                <Text numberOfLines={1} style={styles.title}>{barber.name}</Text>
                <Text numberOfLines={1} style={styles.subtitle}>{barber.studio} · {barber.neighborhood}</Text>
              </View>
              <AnimatedPressable style={styles.close} onPress={close}>
                <Ionicons name="close" size={24} color={colors.white} />
              </AnimatedPressable>
            </View>

            <Text style={styles.sectionTitle}>Hizmet seç</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
              {availableServices.map((service) => {
                const active = service.id === serviceId;
                return (
                  <AnimatedPressable
                    key={service.id}
                    style={[
                      styles.serviceCard,
                      { width: serviceCardWidth },
                      active && { borderColor: service.accent, backgroundColor: `${service.accent}18` },
                    ]}
                    onPress={() => setServiceId(service.id)}
                  >
                    <View style={[styles.serviceIcon, { backgroundColor: `${service.accent}20` }]}>
                      <Ionicons name={service.icon as keyof typeof Ionicons.glyphMap} color={service.accent} size={22} />
                    </View>
                    <Text numberOfLines={1} style={styles.serviceName}>{service.title}</Text>
                    <Text numberOfLines={1} style={styles.serviceMeta}>{service.duration} dk · ₺{service.price}</Text>
                  </AnimatedPressable>
                );
              })}
            </ScrollView>

            <Text style={styles.sectionTitle}>Gün seç</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
              {dateOptions.map((date) => {
                const active = date === dateLabel;
                return (
                  <AnimatedPressable
                    key={date}
                    style={[styles.choicePill, active && styles.choicePillActive]}
                    onPress={() => setDateLabel(date)}
                  >
                    <Text numberOfLines={1} style={[styles.choiceText, active && styles.choiceTextActive]}>{date}</Text>
                  </AnimatedPressable>
                );
              })}
            </ScrollView>

            <Text style={styles.sectionTitle}>Saat seç</Text>
            <View style={styles.timeGrid}>
              {timeOptions.map((item) => {
                const active = item === time;
                return (
                  <AnimatedPressable
                    key={item}
                    style={[styles.timePill, { width: timeCellWidth }, active && styles.timePillActive]}
                    onPress={() => setTime(item)}
                  >
                    <Text numberOfLines={1} style={[styles.timeText, active && styles.timeTextActive]}>{item}</Text>
                  </AnimatedPressable>
                );
              })}
            </View>

            <View style={[styles.summary, narrow && styles.summaryNarrow]}>
              <View>
                <Text style={styles.summaryLabel}>Toplam</Text>
                <Text style={styles.summaryPrice}>₺{selectedService.price}</Text>
              </View>
              <View style={styles.summaryRight}>
                <Ionicons name="time-outline" color={colors.textMuted} size={18} />
                <Text numberOfLines={1} style={styles.summaryText}>{dateLabel}, {time}</Text>
              </View>
            </View>

            <AnimatedPressable
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
                onConfirm({
                  id: `booking-${Date.now()}`,
                  barberId: barber.id,
                  serviceId: selectedService.id,
                  dateLabel,
                  time,
                  status: 'confirmed',
                  createdAt: new Date().toISOString(),
                });
                close();
              }}
            >
              <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.confirmButton}>
                <Text style={styles.confirmText}>Randevuyu Onayla</Text>
                <Ionicons name="checkmark-circle" size={22} color={colors.white} />
              </LinearGradient>
            </AnimatedPressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    width: '100%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  handle: { width: 54, height: 5, borderRadius: 3, backgroundColor: colors.textFaint, alignSelf: 'center', marginTop: 10 },
  content: { paddingHorizontal: SHEET_PADDING, paddingTop: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 24 },
  headerText: { flex: 1, minWidth: 0 },
  avatar: { width: 58, height: 58, borderRadius: 18 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.white, fontSize: 21, fontWeight: '900', marginTop: 2 },
  subtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.cardSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sectionTitle: { color: colors.white, fontSize: 16, fontWeight: '900', marginBottom: 12, marginTop: 2 },
  horizontalRow: { gap: 10, paddingBottom: 20, paddingRight: 4 },
  serviceCard: { minHeight: 128, padding: 13, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, gap: 7 },
  serviceIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  serviceName: { color: colors.white, fontSize: 14, fontWeight: '800' },
  serviceMeta: { color: colors.textMuted, fontSize: 11 },
  choicePill: { minWidth: 86, paddingHorizontal: 17, paddingVertical: 11, borderRadius: radii.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  choicePillActive: { backgroundColor: 'rgba(255,77,141,0.18)', borderColor: colors.primary },
  choiceText: { color: colors.textMuted, fontWeight: '700', fontSize: 12 },
  choiceTextActive: { color: colors.white },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: GAP, rowGap: GAP, marginBottom: 22 },
  timePill: { height: 46, borderRadius: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  timePillActive: { backgroundColor: 'rgba(45,212,255,0.16)', borderColor: colors.cyan },
  timeText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  timeTextActive: { color: colors.white },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 16, borderRadius: radii.md, backgroundColor: colors.cardSoft, marginBottom: 14 },
  summaryNarrow: { alignItems: 'flex-start', flexDirection: 'column' },
  summaryLabel: { color: colors.textMuted, fontSize: 11 },
  summaryPrice: { color: colors.white, fontSize: 24, fontWeight: '900' },
  summaryRight: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  summaryText: { color: colors.text, fontSize: 12, fontWeight: '700', flexShrink: 1 },
  confirmButton: { minHeight: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, paddingHorizontal: 16 },
  confirmText: { color: colors.white, fontSize: 16, fontWeight: '900' },
});
