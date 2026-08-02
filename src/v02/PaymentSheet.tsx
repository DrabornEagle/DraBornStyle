import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { colors, gradients, radii, spacing } from '../theme';

type Result = { ok: boolean; message: string };

export function PaymentSheet({
  visible,
  businessName,
  outstandingTl,
  onClose,
  onSubmit,
  onMessage,
}: {
  visible: boolean;
  businessName: string;
  outstandingTl: number;
  onClose: () => void;
  onSubmit: (amountTl: number) => Result;
  onMessage: (message: string, success?: boolean) => void;
}) {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState(String(outstandingTl));
  useEffect(() => { if (visible) setAmount(String(outstandingTl)); }, [outstandingTl, visible]);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 14) + 12 }]}>
          <View style={styles.handle} />
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.icon}><Ionicons name="wallet-outline" size={25} color={colors.amber} /></View>
              <View style={styles.headerInfo}><Text style={styles.eyebrow}>ÖDEME BİLDİRİMİ</Text><Text style={styles.title}>{businessName}</Text><Text style={styles.subtitle}>Bildirimin admin onayından sonra borçtan düşülür.</Text></View>
              <AnimatedPressable style={styles.close} onPress={onClose}><Ionicons name="close" size={22} color={colors.white} /></AnimatedPressable>
            </View>
            <View style={styles.balance}><Text style={styles.balanceLabel}>Ödenebilir kalan borç</Text><Text style={styles.balanceValue}>₺{outstandingTl}</Text></View>
            <Text style={styles.label}>Ödediğin tutar</Text>
            <View style={styles.inputShell}><Text style={styles.currency}>₺</Text><TextInput value={amount} onChangeText={setAmount} keyboardType="number-pad" style={styles.input} placeholderTextColor={colors.textFaint} /></View>
            <AnimatedPressable onPress={() => {
              const result = onSubmit(Number(amount));
              onMessage(result.message, result.ok);
              if (result.ok) onClose();
            }}>
              <LinearGradient colors={gradients.gold} style={styles.button}><Ionicons name="paper-plane" size={20} color={colors.white} /><Text style={styles.buttonText}>Ödeme Bildir</Text></LinearGradient>
            </AnimatedPressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(4,6,12,0.8)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, borderColor: colors.border },
  handle: { width: 54, height: 5, borderRadius: 3, backgroundColor: colors.textFaint, alignSelf: 'center', marginTop: 10 },
  content: { paddingHorizontal: spacing.md, paddingTop: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  icon: { width: 50, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,182,72,0.12)' },
  headerInfo: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.amber, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.white, fontSize: 18, fontWeight: '900', marginTop: 3 },
  subtitle: { color: colors.textMuted, fontSize: 9.5, marginTop: 3 },
  close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cardSoft },
  balance: { marginTop: 18, padding: 16, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: 'rgba(255,182,72,0.2)' },
  balanceLabel: { color: colors.textMuted, fontSize: 10 },
  balanceValue: { color: colors.white, fontSize: 30, fontWeight: '900', marginTop: 5 },
  label: { color: colors.text, fontSize: 11, fontWeight: '900', marginTop: 16, marginBottom: 7 },
  inputShell: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  currency: { color: colors.amber, fontSize: 22, fontWeight: '900' },
  input: { flex: 1, color: colors.white, fontSize: 17, fontWeight: '800' },
  button: { minHeight: 56, marginTop: 16, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: '900' },
});
