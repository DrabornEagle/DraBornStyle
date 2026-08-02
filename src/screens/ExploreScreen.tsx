import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { barbers } from '../data/mockData';
import { colors, radii, spacing } from '../theme';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { BarberCard } from '../components/BarberCard';
import { FadeIn } from '../components/FadeIn';

const filters = ['Tümü', 'En Yakın', 'En Yüksek Puan', 'Sıra Yok', 'Favoriler'];

export function ExploreScreen({ favorites, onToggleFavorite, onBook }: { favorites: string[]; onToggleFavorite: (id: string) => void; onBook: (id: string) => void; }) {
  const [filter, setFilter] = useState('Tümü');
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr-TR');
    let list = barbers.filter((item) => !normalized || `${item.name} ${item.studio} ${item.neighborhood} ${item.tags.join(' ')}`.toLocaleLowerCase('tr-TR').includes(normalized));
    if (filter === 'En Yakın') list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);
    if (filter === 'En Yüksek Puan') list = [...list].sort((a, b) => b.rating - a.rating);
    if (filter === 'Sıra Yok') list = list.filter((item) => item.queue === 0);
    if (filter === 'Favoriler') list = list.filter((item) => favorites.includes(item.id));
    return list;
  }, [favorites, filter, query]);

  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><FadeIn><Text style={styles.title}>Berberleri Keşfet</Text><Text style={styles.subtitle}>Tarzına, konumuna ve zamanına en uygun ustayı bul.</Text></FadeIn><FadeIn delay={70}><View style={styles.searchBox}><Ionicons name="search" size={20} color={colors.textMuted} /><TextInput value={query} onChangeText={setQuery} placeholder="İsim, stüdyo veya semt ara" placeholderTextColor={colors.textFaint} style={styles.input} />{query.length > 0 && <AnimatedPressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={20} color={colors.textMuted} /></AnimatedPressable>}</View></FadeIn><FadeIn delay={120}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{filters.map((item) => { const active = filter === item; return <AnimatedPressable key={item} style={[styles.filter, active && styles.filterActive]} onPress={() => setFilter(item)}>{item === 'Favoriler' && <Ionicons name="heart" size={14} color={active ? colors.white : colors.primary} />}<Text style={[styles.filterText, active && styles.filterTextActive]}>{item}</Text></AnimatedPressable>; })}</ScrollView></FadeIn><FadeIn delay={170}><View style={styles.resultHeader}><Text style={styles.resultTitle}>{results.length} berber bulundu</Text><View style={styles.mapPill}><Ionicons name="map-outline" size={15} color={colors.cyan} /><Text style={styles.mapText}>Demo Harita</Text></View></View><View style={styles.list}>{results.map((barber) => <BarberCard key={barber.id} barber={barber} compact favorite={favorites.includes(barber.id)} onFavorite={() => onToggleFavorite(barber.id)} onPress={() => onBook(barber.id)} />)}{results.length === 0 && <View style={styles.empty}><Ionicons name="cut-outline" size={34} color={colors.textFaint} /><Text style={styles.emptyTitle}>Sonuç bulunamadı</Text><Text style={styles.emptyText}>Filtreyi değiştirerek diğer demo berberleri görebilirsin.</Text></View>}</View></FadeIn></ScrollView>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingTop: 10, paddingBottom: 108 }, title: { color: colors.white, fontSize: 27, fontWeight: '900' }, subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 18 }, searchBox: { height: 54, paddingHorizontal: 15, borderRadius: radii.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 10 }, input: { flex: 1, color: colors.white, fontSize: 14 }, filters: { gap: 9, paddingVertical: 15 }, filter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }, filterActive: { backgroundColor: colors.primary, borderColor: colors.primary }, filterText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' }, filterTextActive: { color: colors.white }, resultHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }, resultTitle: { color: colors.white, fontSize: 15, fontWeight: '900' }, mapPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(45,212,255,0.1)' }, mapText: { color: colors.cyan, fontSize: 10, fontWeight: '800' }, list: { gap: 11 }, empty: { padding: 34, alignItems: 'center', borderRadius: radii.lg, backgroundColor: colors.card }, emptyTitle: { color: colors.white, fontSize: 16, fontWeight: '900', marginTop: 10 }, emptyText: { color: colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 5 },
});
