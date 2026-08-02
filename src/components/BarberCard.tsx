import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
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
  if (compact) {
    return (
      <AnimatedPressable style={styles.compactCard} onPress={onPress}>
        <Image source={{ uri: barber.image }} style={styles.compactImage} />
        <View style={styles.compactInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.compactName}>{barber.name}</Text>
            {barber.verified && <Ionicons name="checkmark-circle" color={colors.cyan} size={15} />}
          </View>
          <Text style={styles.studio}>{barber.studio} · {barber.neighborhood}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="star" color={colors.amber} size={14} />
            <Text style={styles.metaStrong}>{barber.rating}</Text>
            <Text style={styles.meta}>({barber.reviewCount})</Text>
            <View style={styles.dot} />
            <Text style={styles.meta}>{barber.distanceKm} km</Text>
          </View>
        </View>
        <AnimatedPressable haptic={false} style={styles.heartButton} onPress={(event) => { event.stopPropagation(); onFavorite(); }}>
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} color={favorite ? colors.primary : colors.white} size={20} />
        </AnimatedPressable>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: barber.cover }} style={styles.cover} />
      <LinearGradient colors={['transparent', 'rgba(6,7,12,0.96)']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.topRow}>
        <View style={styles.liveBadge}>
          <View style={[styles.liveDot, { backgroundColor: barber.queue === 0 ? colors.green : colors.amber }]} />
          <Text style={styles.liveText}>{barber.queue === 0 ? 'Sıra yok' : `${barber.queue} kişi sırada`}</Text>
        </View>
        <AnimatedPressable haptic={false} style={styles.floatingHeart} onPress={(event) => { event.stopPropagation(); onFavorite(); }}>
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={favorite ? colors.primary : colors.white} />
        </AnimatedPressable>
      </View>
      <View style={styles.bottomContent}>
        <View style={styles.profileRow}>
          <Image source={{ uri: barber.image }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{barber.name}</Text>
              {barber.verified && <Ionicons name="checkmark-circle" color={colors.cyan} size={17} />}
            </View>
            <Text style={styles.studio}>{barber.studio} · {barber.neighborhood}</Text>
          </View>
          <View style={styles.slotBadge}>
            <Text style={styles.slotLabel}>İlk boş</Text>
            <Text style={styles.slotTime}>{barber.nextSlot}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="star" color={colors.amber} size={15} />
          <Text style={styles.metaStrong}>{barber.rating}</Text>
          <Text style={styles.meta}>({barber.reviewCount} yorum)</Text>
          <View style={styles.dot} />
          <Ionicons name="location-outline" color={colors.textMuted} size={15} />
          <Text style={styles.meta}>{barber.distanceKm} km</Text>
        </View>
        <View style={styles.tagRow}>
          {barber.tags.map((tag) => <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>)}
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
  card: { height: 330, borderRadius: radii.lg, overflow: 'hidden', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  cover: { width: '100%', height: '100%' },
  topRow: { position: 'absolute', left: 14, right: 14, top: 14, flexDirection: 'row', justifyContent: 'space-between' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 8, borderRadius: radii.pill, backgroundColor: 'rgba(8,10,16,0.78)' },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  floatingHeart: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,10,16,0.72)' },
  bottomContent: { position: 'absolute', left: 16, right: 16, bottom: 15, gap: 11 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: { width: 50, height: 50, borderRadius: 18, borderWidth: 2, borderColor: colors.white },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { color: colors.white, fontWeight: '900', fontSize: 20 },
  studio: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  slotBadge: { alignItems: 'flex-end' },
  slotLabel: { color: colors.textMuted, fontSize: 10 },
  slotTime: { color: colors.green, fontSize: 18, fontWeight: '900' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meta: { color: colors.textMuted, fontSize: 12 },
  metaStrong: { color: colors.white, fontSize: 12, fontWeight: '800' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textFaint, marginHorizontal: 3 },
  tagRow: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  tag: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: radii.pill, backgroundColor: 'rgba(255,255,255,0.09)' },
  tagText: { color: colors.text, fontSize: 10, fontWeight: '700' },
  reservePill: { marginLeft: 'auto', borderRadius: radii.pill, paddingHorizontal: 13, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 },
  reserveText: { color: colors.white, fontWeight: '800', fontSize: 11 },
  compactCard: { flexDirection: 'row', padding: 12, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', gap: 12 },
  compactImage: { width: 68, height: 68, borderRadius: 18 },
  compactInfo: { flex: 1 },
  compactName: { color: colors.white, fontWeight: '900', fontSize: 16 },
  heartButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.cardSoft, alignItems: 'center', justifyContent: 'center' },
});
