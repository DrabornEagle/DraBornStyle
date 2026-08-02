import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../theme';
import { RootTab } from '../types';
import { AnimatedPressable } from './AnimatedPressable';

const tabs: { key: RootTab; label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'home', label: 'Ana Sayfa', icon: 'home-outline', activeIcon: 'home' },
  { key: 'explore', label: 'Keşfet', icon: 'compass-outline', activeIcon: 'compass' },
  { key: 'appointments', label: 'Randevu', icon: 'calendar-outline', activeIcon: 'calendar' },
  { key: 'rewards', label: 'Ödüller', icon: 'gift-outline', activeIcon: 'gift' },
  { key: 'profile', label: 'Profil', icon: 'person-outline', activeIcon: 'person' },
];

export function BottomNav({ active, onChange }: { active: RootTab; onChange: (tab: RootTab) => void }) {
  return (
    <View style={styles.shell}>
      {tabs.map((tab) => {
        const selected = active === tab.key;
        return (
          <AnimatedPressable key={tab.key} style={[styles.item, selected && styles.active]} onPress={() => onChange(tab.key)}>
            <Ionicons name={selected ? tab.activeIcon : tab.icon} size={22} color={selected ? colors.white : colors.textFaint} />
            <Text numberOfLines={1} style={[styles.label, selected && styles.labelActive]}>{tab.label}</Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute', left: 12, right: 12, bottom: 10, height: 70, borderRadius: 24,
    backgroundColor: 'rgba(18,22,34,0.98)', borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center', padding: 6,
  },
  item: { flex: 1, height: 56, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', gap: 3 },
  active: { backgroundColor: 'rgba(255,77,141,0.16)' },
  label: { color: colors.textFaint, fontSize: 10, fontWeight: '700' },
  labelActive: { color: colors.white },
});
