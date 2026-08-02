import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import { colors, gradients, radii, spacing } from '../theme';
import { AnimatedPressable } from './AnimatedPressable';

const { width } = Dimensions.get('window');

const slides = [
  {
    icon: 'cut-outline' as const,
    eyebrow: 'TARZINI KEŞFET',
    title: 'En iyi berberler tek ekranda.',
    description: 'Yakındaki ustaları, puanlarını, hizmetlerini ve müsait saatlerini karşılaştır.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1100&q=90',
    colors: gradients.pink,
  },
  {
    icon: 'calendar-outline' as const,
    eyebrow: 'SIRASIZ RANDEVU',
    title: 'Saatini seç, koltuğun hazır olsun.',
    description: 'Hizmet, gün ve saati birkaç dokunuşla seç. Demo randevun cihazında saklansın.',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1100&q=90',
    colors: gradients.purple,
  },
  {
    icon: 'diamond-outline' as const,
    eyebrow: 'STYLE CLUB',
    title: 'Bakım yaptıkça ödül kazan.',
    description: 'Randevulardan puan topla, görevleri bitir ve özel avantajların kilidini aç.',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1100&q=90',
    colors: gradients.cyan,
  },
];

export function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const slide = slides[index] ?? slides[0];

  useEffect(() => {
    opacity.setValue(0);
    translateX.setValue(28);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, speed: 15, bounciness: 4, useNativeDriver: true }),
    ]).start();
  }, [index, opacity, translateX]);

  const next = () => {
    if (index === slides.length - 1) onFinish();
    else setIndex((current) => current + 1);
  };

  return (
    <View style={styles.root}>
      <Image source={{ uri: slide.image }} style={StyleSheet.absoluteFillObject} />
      <LinearGradient colors={['rgba(9,11,18,0.08)', 'rgba(9,11,18,0.55)', colors.background]} locations={[0, 0.47, 0.82]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.topBar}>
        <View style={styles.brand}><View style={styles.brandIcon}><Ionicons name="cut" size={19} color={colors.white} /></View><Text style={styles.brandText}>DraBornStyle</Text></View>
        <AnimatedPressable style={styles.skip} onPress={onFinish}><Text style={styles.skipText}>Geç</Text></AnimatedPressable>
      </View>
      <Animated.View style={[styles.content, { opacity, transform: [{ translateX }] }]}>
        <LinearGradient colors={slide.colors} style={styles.iconBox}><Ionicons name={slide.icon} size={28} color={colors.white} /></LinearGradient>
        <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
        <View style={styles.dots}>{slides.map((_, dotIndex) => <View key={dotIndex} style={[styles.dot, dotIndex === index && styles.dotActive]} />)}</View>
        <AnimatedPressable onPress={next}>
          <LinearGradient colors={slide.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.nextButton}>
            <Text style={styles.nextText}>{index === slides.length - 1 ? 'DraBornStyle’ı Keşfet' : 'Devam Et'}</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </LinearGradient>
        </AnimatedPressable>
      </Animated.View>
      <Text style={styles.version}>v0.3 · Yerel demo deneyimi</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  topBar: { marginTop: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  brandText: { color: colors.white, fontSize: 17, fontWeight: '900' },
  skip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: 'rgba(9,11,18,0.48)' },
  skipText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  content: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: 70 },
  iconBox: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: colors.white, fontSize: Math.min(width * 0.09, 36), lineHeight: 41, fontWeight: '900', marginTop: 8 },
  description: { color: colors.textMuted, fontSize: 14, lineHeight: 21, marginTop: 11, maxWidth: 340 },
  dots: { flexDirection: 'row', gap: 6, marginVertical: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textFaint },
  dotActive: { width: 28, backgroundColor: colors.white },
  nextButton: { height: 58, borderRadius: radii.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  nextText: { color: colors.white, fontSize: 15, fontWeight: '900' },
  version: { position: 'absolute', bottom: 28, alignSelf: 'center', color: colors.textFaint, fontSize: 10 },
});
