import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { colors, gradients, radii, spacing } from '../theme';
import { getMasterProfile } from './state';
import { StartTransactionInput, TransactionSource, V02DemoState, V02Transaction } from './types';

type Result = { ok: boolean; message: string };

const sources: { value: TransactionSource; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'walk_in', label: 'Çat Kapı', icon: 'walk-outline' },
  { value: 'direct_call', label: 'Direkt Aradı', icon: 'call-outline' },
  { value: 'favorite_customer', label: 'Favori', icon: 'heart-outline' },
  { value: 'appointment', label: 'Randevulu', icon: 'calendar-outline' },
];

export function TransactionSheet({
  visible,
  state,
  masterUserId,
  activeTransaction,
  onClose,
  onStart,
  onFinish,
  onCancel,
  onMessage,
}: {
  visible: boolean;
  state: V02DemoState;
  masterUserId: string;
  activeTransaction: V02Transaction | null;
  onClose: () => void;
  onStart: (input: StartTransactionInput) => Result;
  onFinish: (transactionId: string, editedPriceTl: number, discountCode?: string) => Result;
  onCancel: (transactionId: string) => Result;
  onMessage: (message: string, success?: boolean) => void;
}) {
  const insets = useSafeAreaInsets();
  const profile = getMasterProfile(state, masterUserId);
  const services = useMemo(() => state.services.filter((item) => profile?.serviceIds.includes(item.id)), [profile, state.services]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const [source, setSource] = useState<TransactionSource>('walk_in');
  const [discountCode, setDiscountCode] = useState('');
  const activeService = activeTransaction ? state.services.find((item) => item.id === activeTransaction.serviceId) : undefined;
  const [finalPrice, setFinalPrice] = useState(String(activeTransaction?.listPriceTl ?? activeService?.priceTl ?? 0));

  useEffect(() => {
    if (!visible) return;
    if (activeTransaction) {
      setFinalPrice(String(activeTransaction.editedPriceTl ?? activeTransaction.listPriceTl));
      setDiscountCode(activeTransaction.discountCode ?? '');
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setServiceId(services[0]?.id ?? '');
      setSource('walk_in');
      setDiscountCode('');
    }
  }, [activeTransaction, services, visible]);

  if (!profile) return null;

  const submitStart = () => {
    const result = onStart({ masterUserId, customerName, customerPhone, serviceId, source, discountCode: discountCode || undefined });
    onMessage(result.message, result.ok);
    if (result.ok) onClose();
  };

  const submitFinish = () => {
    if (!activeTransaction) return;
    const result = onFinish(activeTransaction.id, Number(finalPrice.replace(',', '.')), discountCode || undefined);
    onMessage(result.message, result.ok);
    if (result.ok) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <Image source={{ uri: profile.image }} style={styles.avatar} />
              <View style={styles.headerInfo}>
                <Text style={styles.eyebrow}>{activeTransaction ? 'AKTİF İŞLEM' : 'HIZLI MÜŞTERİ GİRİŞİ'}</Text>
                <Text style={styles.title}>{activeTransaction ? activeTransaction.customerName : 'Tıraşa Başla'}</Text>
                <Text style={styles.subtitle}>{activeTransaction ? 'Son fiyatı kontrol edip işlemi tamamla.' : 'Randevulu veya çat kapı müşteriyi birkaç dokunuşla sisteme al.'}</Text>
              </View>
              <AnimatedPressable style={styles.close} onPress={onClose}><Ionicons name="close" size={23} color={colors.white} /></AnimatedPressable>
            </View>

            {activeTransaction ? (
              <>
                <View style={styles.activeCard}>
                  <View style={styles.activeIcon}><Ionicons name="cut" size={25} color={colors.cyan} /></View>
                  <View style={styles.activeInfo}>
                    <Text style={styles.activeTitle}>{activeService?.title ?? 'Hizmet'}</Text>
                    <Text style={styles.activeText}>{activeTransaction.customerPhone} · {sourceLabel(activeTransaction.source)}</Text>
                  </View>
                  <View style={styles.busy}><View style={styles.busyDot} /><Text style={styles.busyText}>MEŞGUL</Text></View>
                </View>

                <Text style={styles.label}>Son fiyat</Text>
                <View style={styles.inputShell}>
                  <Text style={styles.currency}>₺</Text>
                  <TextInput value={finalPrice} onChangeText={setFinalPrice} keyboardType="decimal-pad" style={styles.input} placeholderTextColor={colors.textFaint} />
                </View>

                <Text style={styles.label}>İndirim kodu (isteğe bağlı)</Text>
                <View style={styles.inputShell}>
                  <Ionicons name="pricetag-outline" size={19} color={colors.primary} />
                  <TextInput value={discountCode} onChangeText={(value: string) => setDiscountCode(value.toLocaleUpperCase('tr-TR'))} autoCapitalize="characters" style={styles.input} placeholder="ARDA15" placeholderTextColor={colors.textFaint} />
                </View>

                <View style={styles.summary}>
                  <SummaryItem label="Liste fiyatı" value={`₺${activeTransaction.listPriceTl}`} />
                  <SummaryItem label="Platform bedeli" value="İşletme ayarı" />
                  <SummaryItem label="Kayıt" value="Tamamlanınca oluşur" />
                </View>

                <AnimatedPressable onPress={submitFinish}>
                  <LinearGradient colors={gradients.hero} style={styles.primaryButton}>
                    <Ionicons name="checkmark-done-circle" size={22} color={colors.white} />
                    <Text style={styles.primaryText}>Tıraş / İşlem Bitti</Text>
                  </LinearGradient>
                </AnimatedPressable>
                <AnimatedPressable
                  style={styles.cancelButton}
                  onPress={() => {
                    const result = onCancel(activeTransaction.id);
                    onMessage(result.message, result.ok);
                    if (result.ok) onClose();
                  }}
                >
                  <Ionicons name="close-circle-outline" size={19} color={colors.red} />
                  <Text style={styles.cancelText}>Aktif işlemi iptal et</Text>
                </AnimatedPressable>
              </>
            ) : (
              <>
                <Text style={styles.label}>Müşteri adı</Text>
                <View style={styles.inputShell}><Ionicons name="person-outline" size={19} color={colors.textMuted} /><TextInput value={customerName} onChangeText={setCustomerName} style={styles.input} placeholder="Ad Soyad" placeholderTextColor={colors.textFaint} /></View>

                <Text style={styles.label}>Telefon</Text>
                <View style={styles.inputShell}><Ionicons name="call-outline" size={19} color={colors.textMuted} /><TextInput value={customerPhone} onChangeText={setCustomerPhone} keyboardType="phone-pad" style={styles.input} placeholder="05xx xxx xx xx" placeholderTextColor={colors.textFaint} /></View>

                <Text style={styles.sectionTitle}>Müşteri kaynağı</Text>
                <View style={styles.sourceGrid}>
                  {sources.map((item) => {
                    const selected = source === item.value;
                    return (
                      <AnimatedPressable key={item.value} style={[styles.sourceCard, selected && styles.sourceActive]} onPress={() => setSource(item.value)}>
                        <Ionicons name={item.icon} size={20} color={selected ? colors.white : colors.textMuted} />
                        <Text style={[styles.sourceText, selected && styles.sourceTextActive]}>{item.label}</Text>
                      </AnimatedPressable>
                    );
                  })}
                </View>

                <Text style={styles.sectionTitle}>Hizmet seç</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serviceRow}>
                  {services.map((service) => {
                    const selected = service.id === serviceId;
                    return (
                      <AnimatedPressable key={service.id} style={[styles.serviceCard, selected && { borderColor: service.accent, backgroundColor: `${service.accent}14` }]} onPress={() => setServiceId(service.id)}>
                        <View style={[styles.serviceIcon, { backgroundColor: `${service.accent}18` }]}><Ionicons name={service.icon as keyof typeof Ionicons.glyphMap} size={22} color={service.accent} /></View>
                        <Text numberOfLines={1} style={styles.serviceTitle}>{service.title}</Text>
                        <Text style={styles.serviceMeta}>{service.durationMinutes} dk · ₺{service.priceTl}</Text>
                      </AnimatedPressable>
                    );
                  })}
                </ScrollView>

                <Text style={styles.label}>İndirim kodu (isteğe bağlı)</Text>
                <View style={styles.inputShell}><Ionicons name="pricetag-outline" size={19} color={colors.primary} /><TextInput value={discountCode} onChangeText={(value: string) => setDiscountCode(value.toLocaleUpperCase('tr-TR'))} autoCapitalize="characters" style={styles.input} placeholder="Örn. ARDA15" placeholderTextColor={colors.textFaint} /></View>

                <AnimatedPressable onPress={submitStart}>
                  <LinearGradient colors={gradients.cyan} style={styles.primaryButton}>
                    <Ionicons name="play-circle" size={23} color={colors.white} />
                    <Text style={styles.primaryText}>Tıraşa / İşleme Başladım</Text>
                  </LinearGradient>
                </AnimatedPressable>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return <View style={styles.summaryItem}><Text style={styles.summaryLabel}>{label}</Text><Text style={styles.summaryValue}>{value}</Text></View>;
}

function sourceLabel(source: TransactionSource) {
  return sources.find((item) => item.value === source)?.label ?? source;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(4,6,12,0.8)' },
  sheet: { maxHeight: '94%', backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  handle: { width: 54, height: 5, borderRadius: 3, backgroundColor: colors.textFaint, alignSelf: 'center', marginTop: 10 },
  content: { paddingHorizontal: spacing.md, paddingTop: 18, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 22 },
  avatar: { width: 58, height: 58, borderRadius: 18 },
  headerInfo: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  title: { color: colors.white, fontSize: 21, fontWeight: '900', marginTop: 3 },
  subtitle: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  close: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cardSoft },
  label: { color: colors.text, fontSize: 11, fontWeight: '900', marginBottom: 7, marginTop: 13 },
  inputShell: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, color: colors.white, fontSize: 14, paddingVertical: 11 },
  currency: { color: colors.amber, fontSize: 22, fontWeight: '900' },
  sectionTitle: { color: colors.white, fontSize: 15, fontWeight: '900', marginTop: 20, marginBottom: 10 },
  sourceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sourceCard: { width: '48.7%', minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 8, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  sourceActive: { backgroundColor: 'rgba(255,77,141,0.16)', borderColor: colors.primary },
  sourceText: { color: colors.textMuted, fontSize: 10, fontWeight: '900' },
  sourceTextActive: { color: colors.white },
  serviceRow: { gap: 9, paddingBottom: 4 },
  serviceCard: { width: 145, minHeight: 126, padding: 12, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  serviceIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  serviceTitle: { color: colors.white, fontSize: 13, fontWeight: '900', marginTop: 11 },
  serviceMeta: { color: colors.textMuted, fontSize: 10, marginTop: 5 },
  activeCard: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: 'rgba(45,212,255,0.22)' },
  activeIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(45,212,255,0.12)' },
  activeInfo: { flex: 1, minWidth: 0 },
  activeTitle: { color: colors.white, fontSize: 14, fontWeight: '900' },
  activeText: { color: colors.textMuted, fontSize: 9.5, marginTop: 4 },
  busy: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,182,72,0.12)' },
  busyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.amber },
  busyText: { color: colors.amber, fontSize: 8, fontWeight: '900' },
  summary: { gap: 8, marginTop: 16, padding: 13, borderRadius: 16, backgroundColor: colors.cardSoft },
  summaryItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  summaryLabel: { color: colors.textMuted, fontSize: 10 },
  summaryValue: { color: colors.white, fontSize: 10, fontWeight: '900' },
  primaryButton: { minHeight: 56, marginTop: 17, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14 },
  primaryText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  cancelButton: { minHeight: 48, marginTop: 9, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: 'rgba(255,94,108,0.07)', borderWidth: 1, borderColor: 'rgba(255,94,108,0.18)' },
  cancelText: { color: colors.red, fontSize: 11, fontWeight: '900' },
});
