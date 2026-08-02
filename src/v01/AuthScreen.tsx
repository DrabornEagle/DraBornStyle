import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { colors, gradients, radii, spacing } from '../theme';
import { demoAccounts } from './demoData';
import { RegisterInput } from './types';

type Result = { ok: boolean; message: string };
type FieldProps = React.ComponentProps<typeof TextInput> & { icon: keyof typeof Ionicons.glyphMap; label: string };

export function AuthScreen({
  onLogin,
  onRegister,
  onMessage,
}: {
  onLogin: (email: string, password: string) => Result;
  onRegister: (input: RegisterInput) => Result;
  onMessage: (message: string, success?: boolean) => void;
}) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('musteri@demo.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const submit = () => {
    if (mode === 'login') {
      const response = onLogin(email, password);
      onMessage(response.message, response.ok);
      return;
    }
    if (password !== confirmPassword) {
      onMessage('Şifreler birbiriyle eşleşmiyor.', false);
      return;
    }
    const response = onRegister({ fullName, email, phone, password });
    onMessage(response.message, response.ok);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <LinearGradient colors={gradients.hero} style={styles.logo}>
            <Ionicons name="cut" size={25} color={colors.white} />
          </LinearGradient>
          <View style={styles.brandCopy}>
            <Text style={styles.brand}>DraBornStyle</Text>
            <Text style={styles.version}>v0.2.17 Final · İşlem ve Ödeme Sistemi</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=85' }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(7,9,15,0.06)', 'rgba(7,9,15,0.58)', 'rgba(7,9,15,0.98)']}
            locations={[0, 0.48, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={14} color={colors.primary} />
            <Text style={styles.heroBadgeText}>PROFESYONEL SALON OPERASYONU</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>{mode === 'login' ? 'Tek panel, doğru rol.' : 'DraBornStyle’a katıl.'}</Text>
            <Text style={styles.heroText}>İlk tasarımdaki premium fotoğraflı görünüm; rol, işlem, ödeme, QR ve indirim sistemiyle birlikte çalışıyor.</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          <AnimatedPressable style={[styles.tab, mode === 'login' && styles.tabActive]} onPress={() => setMode('login')}>
            <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Giriş Yap</Text>
          </AnimatedPressable>
          <AnimatedPressable style={[styles.tab, mode === 'register' && styles.tabActive]} onPress={() => setMode('register')}>
            <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Kayıt Ol</Text>
          </AnimatedPressable>
        </View>

        <View style={styles.formCard}>
          {mode === 'register' && (
            <Field icon="person-outline" label="Ad Soyad" placeholder="Adın ve soyadın" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
          )}
          <Field icon="mail-outline" label="E-posta" placeholder="ornek@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          {mode === 'register' && (
            <Field icon="call-outline" label="Telefon" placeholder="05xx xxx xx xx" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          )}

          <View>
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.inputShell}>
              <Ionicons name="lock-closed-outline" size={19} color={colors.textMuted} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="En az 6 karakter"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
                autoCapitalize="none"
              />
              <AnimatedPressable haptic={false} onPress={() => setShowPassword((current) => !current)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
              </AnimatedPressable>
            </View>
          </View>

          {mode === 'register' && (
            <Field icon="checkmark-circle-outline" label="Şifre Tekrar" placeholder="Şifreni tekrar gir" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} autoCapitalize="none" />
          )}

          {mode === 'register' && (
            <View style={styles.roleInfo}>
              <View style={styles.roleInfoIcon}><Ionicons name="person-add" size={20} color={colors.cyan} /></View>
              <View style={styles.roleInfoCopy}>
                <Text style={styles.roleInfoTitle}>Otomatik müşteri rolü</Text>
                <Text style={styles.roleInfoText}>Kayıt sonrası müşteri erişimi `dkd_user_role_access` içinde otomatik açılır.</Text>
              </View>
            </View>
          )}

          <AnimatedPressable onPress={submit}>
            <LinearGradient colors={gradients.hero} style={styles.submit}>
              <Text style={styles.submitText}>{mode === 'login' ? 'Panele Giriş Yap' : 'Müşteri Hesabını Oluştur'}</Text>
              <Ionicons name="arrow-forward" size={19} color={colors.white} />
            </LinearGradient>
          </AnimatedPressable>
        </View>

        {mode === 'login' && (
          <View style={styles.demoSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionCopy}>
                <Text style={styles.sectionTitle}>Demo hesapları</Text>
                <Text style={styles.sectionText}>Dört paneli tek dokunuşla test et.</Text>
              </View>
              <View style={styles.passwordBadge}><Text style={styles.passwordText}>Şifre 123456</Text></View>
            </View>
            <View style={styles.demoGrid}>
              {demoAccounts.map((account) => (
                <AnimatedPressable
                  key={account.email}
                  style={styles.demoCard}
                  onPress={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                    const response = onLogin(account.email, account.password);
                    onMessage(response.message, response.ok);
                  }}
                >
                  <View style={styles.demoIcon}><Ionicons name={account.icon} size={21} color={colors.white} /></View>
                  <Text style={styles.demoLabel}>{account.label}</Text>
                  <Text numberOfLines={1} style={styles.demoEmail}>{account.email}</Text>
                </AnimatedPressable>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.footer}>v0.2.17 demo verileri cihazda tutulur · Supabase sonraki gerçek veri aşamasında bağlanacak.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ icon, label, ...props }: FieldProps) {
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
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingTop: 18, paddingBottom: 34 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 16 },
  logo: { width: 50, height: 50, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  brandCopy: { flex: 1, minWidth: 0 },
  brand: { color: colors.white, fontSize: 21, fontWeight: '900' },
  version: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  hero: { height: 245, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  heroBadge: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: 'rgba(8,10,16,0.78)' },
  heroBadgeText: { color: colors.white, fontSize: 8.5, fontWeight: '900', letterSpacing: 0.75 },
  heroCopy: { position: 'absolute', left: 18, right: 18, bottom: 18 },
  heroTitle: { color: colors.white, fontSize: 28, lineHeight: 33, fontWeight: '900' },
  heroText: { color: colors.textMuted, fontSize: 10.5, lineHeight: 16, marginTop: 7 },
  tabs: { flexDirection: 'row', gap: 6, padding: 5, marginTop: 16, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  tab: { flex: 1, minHeight: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.surfaceElevated },
  tabText: { color: colors.textMuted, fontSize: 13, fontWeight: '800' },
  tabTextActive: { color: colors.white },
  formCard: { gap: 14, marginTop: 14, padding: 16, borderRadius: radii.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.text, fontSize: 11, fontWeight: '800', marginBottom: 7 },
  inputShell: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, color: colors.white, fontSize: 14, paddingVertical: 11 },
  roleInfo: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 16, backgroundColor: 'rgba(45,212,255,0.08)', borderWidth: 1, borderColor: 'rgba(45,212,255,0.18)' },
  roleInfoIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(45,212,255,0.12)' },
  roleInfoCopy: { flex: 1, minWidth: 0 },
  roleInfoTitle: { color: colors.white, fontSize: 12, fontWeight: '900' },
  roleInfoText: { color: colors.textMuted, fontSize: 9.5, lineHeight: 14, marginTop: 3 },
  submit: { minHeight: 55, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  demoSection: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  sectionCopy: { flex: 1, minWidth: 0 },
  sectionTitle: { color: colors.white, fontSize: 18, fontWeight: '900' },
  sectionText: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  passwordBadge: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: radii.pill, backgroundColor: 'rgba(53,225,161,0.1)' },
  passwordText: { color: colors.green, fontSize: 9, fontWeight: '900' },
  demoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  demoCard: { width: '48.5%', minHeight: 112, padding: 13, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  demoIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceElevated },
  demoLabel: { color: colors.white, fontSize: 13, fontWeight: '900', marginTop: 10 },
  demoEmail: { color: colors.textMuted, fontSize: 9, marginTop: 4 },
  footer: { color: colors.textFaint, fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 22 },
});
