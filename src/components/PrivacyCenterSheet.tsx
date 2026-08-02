import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

const PRIVACY_POLICY_URL = 'https://raw.githubusercontent.com/DrabornEagle/DraBornStyle/main/PRIVACY_POLICY.md';
const ACCOUNT_DELETION_URL = 'https://raw.githubusercontent.com/DrabornEagle/DraBornStyle/main/ACCOUNT_DELETION.md';

type Props = {
  visible: boolean;
  onClose: () => void;
  onDeleteLocalData: () => Promise<void>;
};

export function PrivacyCenterSheet({ visible, onClose, onDeleteLocalData }: Props) {
  const [deleting, setDeleting] = useState(false);

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Bağlantı açılamadı', 'İnternet bağlantınızı kontrol edip yeniden deneyin.');
    });
  };

  const confirmDeletion = () => {
    Alert.alert(
      'Yerel hesabı ve verileri sil',
      'Cihazdaki kullanıcı tarafından oluşturulmuş demo hesapları, randevular, işlemler ve ödeme kayıtları temizlenecek. Başlangıç demo verileri yeniden yüklenecek.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await onDeleteLocalData();
            } catch {
              Alert.alert('Silme tamamlanamadı', 'Yerel veriler temizlenirken bir sorun oluştu.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <View style={styles.iconBox}>
                <Ionicons name="shield-checkmark" size={22} color={colors.green} />
              </View>
              <View style={styles.titleText}>
                <Text style={styles.title}>Gizlilik ve Veri</Text>
                <Text style={styles.subtitle}>DraBornStyle 0.4.0 · Çevrimdışı demo</Text>
              </View>
            </View>
            <AnimatedPressable accessibilityLabel="Gizlilik merkezini kapat" style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.white} />
            </AnimatedPressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.infoCard}>
              <Ionicons name="phone-portrait-outline" size={21} color={colors.cyan} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Veriler cihazda kalır</Text>
                <Text style={styles.infoBody}>
                  Ad, e-posta, telefon, randevu ve işlem demo kayıtları yalnızca uygulamanın yerel depolama alanında tutulur; sunucuya veya reklam ağına gönderilmez.
                </Text>
              </View>
            </View>

            <AnimatedPressable style={styles.actionButton} onPress={() => openUrl(PRIVACY_POLICY_URL)}>
              <View style={styles.actionIcon}><Ionicons name="document-text-outline" size={20} color={colors.cyan} /></View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Gizlilik politikasını aç</Text>
                <Text style={styles.actionSubtitle}>Toplanan, saklanan ve paylaşılmayan verileri incele</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={colors.textMuted} />
            </AnimatedPressable>

            <AnimatedPressable style={styles.actionButton} onPress={() => openUrl(ACCOUNT_DELETION_URL)}>
              <View style={styles.actionIcon}><Ionicons name="information-circle-outline" size={20} color={colors.amber} /></View>
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Hesap ve veri silme açıklaması</Text>
                <Text style={styles.actionSubtitle}>Yerel verilerin nasıl kaldırıldığını görüntüle</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={colors.textMuted} />
            </AnimatedPressable>

            <View style={styles.warningCard}>
              <Ionicons name="key-outline" size={20} color={colors.amber} />
              <Text style={styles.warningText}>
                Bu sürüm gerçek kimlik doğrulama hizmeti değildir. Demo parola alanında gerçek hesap parolanızı kullanmayın.
              </Text>
            </View>

            <AnimatedPressable
              accessibilityLabel="Yerel hesabımı ve verilerimi sil"
              disabled={deleting}
              style={styles.deleteButton}
              onPress={confirmDeletion}
            >
              {deleting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Ionicons name="trash-outline" size={20} color={colors.white} />
              )}
              <Text style={styles.deleteText}>{deleting ? 'Yerel veriler siliniyor…' : 'Yerel hesabımı ve verilerimi sil'}</Text>
            </AnimatedPressable>

            <Text style={styles.footerText}>
              Uygulamayı Android ayarlarından kaldırmak da DraBornStyle uygulamasına ait yerel depolama alanını siler.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: { maxHeight: '88%', backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, borderColor: colors.border },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.textFaint, marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: spacing.md, paddingVertical: 15 },
  titleGroup: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(53,225,161,0.10)', borderWidth: 1, borderColor: 'rgba(53,225,161,0.20)' },
  titleText: { flex: 1, minWidth: 0 },
  title: { color: colors.white, fontSize: 17, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 9.5, marginTop: 3 },
  closeButton: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  content: { paddingHorizontal: spacing.md, paddingBottom: 30, gap: 10 },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 11, padding: 14, borderRadius: 19, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  infoText: { flex: 1 },
  infoTitle: { color: colors.white, fontSize: 12, fontWeight: '900' },
  infoBody: { color: colors.textMuted, fontSize: 10, lineHeight: 16, marginTop: 5 },
  actionButton: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  actionIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceElevated },
  actionText: { flex: 1, minWidth: 0 },
  actionTitle: { color: colors.white, fontSize: 11, fontWeight: '900' },
  actionSubtitle: { color: colors.textMuted, fontSize: 9, lineHeight: 13, marginTop: 3 },
  warningCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 13, borderRadius: 18, backgroundColor: 'rgba(255,182,72,0.08)', borderWidth: 1, borderColor: 'rgba(255,182,72,0.18)' },
  warningText: { flex: 1, color: colors.textMuted, fontSize: 9.5, lineHeight: 15 },
  deleteButton: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 14, borderRadius: 18, backgroundColor: colors.red },
  deleteText: { color: colors.white, fontSize: 11, fontWeight: '900' },
  footerText: { color: colors.textFaint, fontSize: 8.5, lineHeight: 13, textAlign: 'center', paddingHorizontal: 10, marginTop: 2 },
});
