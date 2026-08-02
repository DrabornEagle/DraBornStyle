import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colors, gradients, radii } from '../theme';
import { Barber } from '../types';
import { AnimatedPressable } from './AnimatedPressable';

export function BarberCard({
  barber,
  favorite,
  compact = false,
  onFavorite,
  onPress,
}: {
  barber: Barber;
  favorite: boolean;
  compact?: boolean;
  onFavorite: () => void;
  onPress: () => void;
}) {
  const { width } = useWindowDimensions();
  const narrow = width < 370;

  if (compact) {
    return (
      <AnimatedPressable style={styles.compactCard} onPress={onPress}>
        <Image source={{ uri: barber.image }} style={styles.compactImage} />
        <View style={styles.compactInfo}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.compactName}>{barber.name}</Text>
            {barber.verified && <Ionicons name="checkmark-circle" color={colors.cyan} size={15} />}
          </View>
          <Text numberOfLines={1} style={styles.studio}>{barber.studio} · {barber.neighborhood}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="star" color={colors.amber} size={14} />
            <Text style={styles.metaStrong}>{barber.rating}</Text>
            <Text numberOfLines={1} style={styles.meta}>({barber.reviewCount}) · {barber.distanceKm} km</Text>
          </View>
        </View>
        <AnimatedPressable
          haptic={false}
          style={styles.heartButton}
          onPress={(event) => {
            event.stopPropagation();
            onFavorite();
          }}
        >
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} color={favorite ? colors.primary : colors.white} size={20} />
        </AnimatedPressable>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable style={[styles.card, narrow && styles.cardNarrow]} onPress={onPress}>
      <Image source={{ uri: barber.cover }} resizeMode="cover" style={styles.cover} />
      <LinearGradient
        colors={['rgba(6,7,12,0.02)', 'rgba(6,7,12,0.52)', 'rgba(6,7,12,0.98)']}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topRow}>
        <View style={styles.liveBadge}>
          <View style={[styles.liveDot, { backgroundColor: barber.queue === 0 ? colors.green : colors.amber }]} />
          <Text numberOfLines={1} style={styles.liveText}>{barber.queue === 0 ? 'Sıra yok' : `${barber.queue} kişi sırada`}</Text>
        </View>
        <AnimatedPressable
          haptic={false}
          style={styles.floatingHeart}
          onPress={(event) => {
            event.stopPropagation();
            onFavorite();
          }}
        >
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={favorite ? colors.primary : colors.white} />
        </AnimatedPressable>
      </View>

      <View style={styles.bottomContent}>
        <View style={styles.profileRow}>
          <Image source={{ uri: barber.image }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={styles.name}>{barber.name}</Text>
              {barber.verified && <Ionicons name="checkmark-circle" color={colors.cyan} size={17} />}
            </View>
            <Text numberOfLines={1} style={styles.studio}>{barber.studio} · {barber.neighborhood}</Text>
          </View>
          <View style={styles.slotBadge}>
            <Text style={styles.slotLabel}>İlk boş</Text>
            <Text style={styles.slotTime}>{barber.nextSlot}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="star" color={colors.amber} size={15} />
          <Text style={styles.metaStrong}>{barber.rating}</Text>
          <Text numberOfLines={1} style={styles.meta}>({barber.reviewCount} yorum) · {barber.distanceKm} km</Text>
        </View>

        <View style={styles.tagRow}>
          <View style={styles.tagsWrap}>
            {barber.tags.slice(0, narrow ? 1 : 2).map((tag) => (
              <View key={tag} style={styles.tag}><Text numberOfLines={1} style={styles.tagText}>{tag}</Text></View>
            ))}
          </View>
          <LinearGradient colors={gradients.pink} style={styles.reservePill}>
            <Text style={styles.reserveText}>Randevu Al</Text>
            <Ionicons name="arrow-forward" color={colors.white} size={15} />
          </LinearGradient>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: { height: 320, borderRadius: radii.lg, overflow: 'hidden', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  cardNarrow: { height: 306 },
  cover: { width: '100%', height: '100%' },
  topRow: { position: 'absolute', left: 14, right: 14, top: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveBadge: { maxWidth: '72%', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 8, borderRadius: radii.pill, backgroundColor: 'rgba(8,10,16,0.82)' },
  liveDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  liveText: { color: colors.white, fontSize: 12, fontWeight: '700', flexShrink: 1 },
  floatingHeart: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,10,16,0.76)', flexShrink: 0 },
  bottomContent: { position: 'absolute', left: 15, right: 15, bottom: 14, gap: 10 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  profileInfo: { flex: 1, minWidth: 0 },
  avatar: { width: 50, height: 50, borderRadius: 18, borderWidth: 2, borderColor: colors.white, flexShrink: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 0 },
  name: { color: colors.white, fontWeight: '900', fontSize: 20, flexShrink: 1 },
  studio: { color: colors.textMuted, fontSize: 12, marginTop: 2, flexShrink: 1 },
  slotBadge: { alignItems: 'flex-end', flexShrink: 0, minWidth: 54 },
  slotLabel: { color: colors.textMuted, fontSize: 10 },
  slotTime: { color: colors.green, fontSize: 18, fontWeight: '900' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 0 },
  meta: { color: colors.textMuted, fontSize: 12, flexShrink: 1 },
  metaStrong: { color: colors.white, fontSize: 12, fontWeight: '800' },
  tagRow: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'space-between' },
  tagsWrap: { flex: 1, minWidth: 0, flexDirection: 'row', gap: 6, overflow: 'hidden' },
  tag: { maxWidth: 112, paddingHorizontal: 9, paddingVertical: 6, borderRadius: radii.pill, backgroundColor: 'rgba(255,255,255,0.10)' },
  tagText: { color: colors.text, fontSize: 10, fontWeight: '700' },
  reservePill: { borderRadius: radii.pill, paddingHorizontal: 13, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  reserveText: { color: colors.white, fontWeight: '800', fontSize: 11 },
  compactCard: { width: '100%', minHeight: 94, flexDirection: 'row', padding: 12, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: 12 },
  compactImage: { width: 68, height: 68, borderRadius: 18, flexShrink: 0 },
  compactInfo: { flex: 1, minWidth: 0 },
  compactName: { color: colors.white, fontWeight: '900', fontSize: 16, flexShrink: 1 },
  heartButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.cardSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
