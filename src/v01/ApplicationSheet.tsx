import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { ApplicationInput, ApplicationRole } from './types';

type Result = { ok: boolean; message: string };

export function ApplicationSheet({
  visible,
  initialRole,
  onClose,
  onSubmit,
  onMessage,
}: {
  visible: boolean;
  initialRole: ApplicationRole;
  onClose: () => void;
  onSubmit: (input: ApplicationInput) => Result;
  onMessage: (message: string, success?: boolean) => void;
}) {
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<ApplicationRole>(initialRole);
  const [businessName, setBusinessName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!visible) return;
    setRole(initialRole);
    setBusinessName('');
    setSpecialty('');
    setExperienceYears('');
    setNote('');
  }, [initialRole, visible]);

  const submit = () => {
    const result = onSubmit({ requestedRole: role, businessName, specialty, experienceYears, note });
    onMessage(result.message, result.ok);
    if (result.ok) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AnimatedPressable haptic={false} style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.handle} />
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>ADMIN ONAYLI ROL BAŞVURUSU</Text>
                <Text style={styles.title}>Yeni başvuru</Text>
              </View>
              <AnimatedPressable style={styles.close} onPress={onClose}><Ionicons name="close" size={22} color={colors.white} /></AnimatedPressable>
            </View>

            <Text style={styles.sectionLabel}>Başvuru türü</Text>
            <View style={styles.roleRow}>
              <RoleOption role="master" selected={role === 'master'} onPress={() => setRole('master')} />
              <RoleOption role="business" selected={role === 'business'} onPress={() => setRole('business')} />
            </View>

            <View style={styles.form}>
              <Field
                label="İşletme adı"
                icon="storefront-outline"
                placeholder={role === 'business' ? 'İşletmenin adı' : 'Çalıştığın işletme'}
                value={businessName}
                onChangeText={setBusinessName}
              />
              <Field
                label={role === 'master' ? 'Uzmanlık alanı' : 'İşletme türü'}
                icon={role === 'master' ? 'cut-outline' : 'briefcase-outline'}
                placeholder={role === 'master' ? 'Örn. Fade, sakal, boya' : 'Örn. Erkek kuaförü, güzellik salonu'}
                value={specialty}
                onChangeText={setSpecialty}
              />
              <Field
                label="Deneyim yılı"
                icon="ribbon-outline"
                placeholder="Örn. 5"
                value={experienceYears}
                onChangeText={setExperienceYears}
                keyboardType="number-pad"
              />
              <View>
                <Text style={styles.label}>Başvuru notu</Text>
                <View style={[styles.inputShell, styles.noteShell]}>
                  <Ionicons name="document-text-outline" size={19} color={colors.textMuted} style={styles.noteIcon} />
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholder="Adminin değerlendirmesi için kısa bilgi"
                    placeholderTextColor={colors.textFaint}
                    style={[styles.input, styles.noteInput]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.info}>
              <Ionicons name="shield-checkmark-outline" size={21} color={colors.green} />
              <Text style={styles.infoText}>Başvuru gönderildiğinde rol hemen açılmaz. Admin onayından sonra `dkd_user_role_access` kaydı oluşturulur.</Text>
            </View>

            <AnimatedPressable onPress={submit}>
              <LinearGradient colors={gradients.hero} style={styles.submit}>
                <Text style={styles.submitText}>Başvuruyu Gönder</Text>
                <Ionicons name="send" size={18} color={colors.white} />
              </LinearGradient>
            </AnimatedPressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function RoleOption({ role, selected, onPress }: { role: ApplicationRole; selected: boolean; onPress: () => void }) {
  const isMaster = role === 'master';
  return (
    <AnimatedPressable style={[styles.roleOption, selected && styles.roleOptionActive]} onPress={onPress}>
      <View style={[styles.roleIcon, selected && styles.roleIconActive]}>
        <Ionicons name={isMaster ? 'cut-outline' : 'storefront-outline'} size={23} color={selected ? colors.white : colors.primary} />
      </View>
      <Text style={styles.roleName}>{isMaster ? 'Usta' : 'İşletme Sahibi'}</Text>
      <Text style={styles.roleDetail}>{isMaster ? 'Kendi usta paneline eriş' : 'İşletme panelini yönet'}</Text>
      {selected && <Ionicons name="checkmark-circle" size={20} color={colors.green} style={styles.selectedIcon} />}
    </AnimatedPressable>
  );
}

function Field({ label, icon, ...props }: React.ComponentProps<typeof TextInput> & { label: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputShell}>
        <Ionicons name={icon} size={19} color={colors.textMuted} />
        <TextInput {...props} placeholderTextColor={colors.textFaint} style={styles.input} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: { maxHeight: '94%', backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  handle: { width: 54, height: 5, borderRadius: 3, backgroundColor: colors.textFaint, alignSelf: 'center', marginTop: 10 },
  content: { padding: spacing.md, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  eyebrow: { color: colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  title: { color: colors.white, fontSize: 24, fontWeight: '900', marginTop: 3 },
  close: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  sectionLabel: { color: colors.text, fontSize: 11, fontWeight: '900', marginBottom: 9 },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleOption: { flex: 1, minHeight: 132, padding: 13, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  roleOptionActive: { borderColor: colors.primary, backgroundColor: 'rgba(255,77,141,0.07)' },
  roleIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,77,141,0.1)' },
  roleIconActive: { backgroundColor: colors.primary },
  roleName: { color: colors.white, fontSize: 13, fontWeight: '900', marginTop: 11 },
  roleDetail: { color: colors.textMuted, fontSize: 9.5, lineHeight: 14, marginTop: 3 },
  selectedIcon: { position: 'absolute', right: 10, top: 10 },
  form: { gap: 13, marginTop: 18 },
  label: { color: colors.text, fontSize: 11, fontWeight: '800', marginBottom: 7 },
  inputShell: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, color: colors.white, fontSize: 14, paddingVertical: 12 },
  noteShell: { minHeight: 110, alignItems: 'flex-start' },
  noteIcon: { marginTop: 14 },
  noteInput: { minHeight: 94 },
  info: { flexDirection: 'row', gap: 9, marginTop: 16, marginBottom: 14, padding: 12, borderRadius: 16, backgroundColor: 'rgba(53,225,161,0.07)', borderWidth: 1, borderColor: 'rgba(53,225,161,0.18)' },
  infoText: { flex: 1, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
  submit: { minHeight: 55, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { color: colors.white, fontSize: 14, fontWeight: '900' },
});
