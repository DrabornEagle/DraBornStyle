import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii } from '../theme';
import { RootTab } from '../types';
import { AnimatedPressable } from './AnimatedPressable';

const tabs: {
  key: RootTab;
  label: string;
  compactLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'home', label: 'Ana Sayfa', compactLabel: 'Ana Sayfa', icon: 'home-outline', activeIcon: 'home' },
  { key: 'explore', label: 'Keşfet', compactLabel: 'Keşfet', icon: 'compass-outline', activeIcon: 'compass' },
  { key: 'appointments', label: 'Randevular', compactLabel: 'Randevu', icon: 'calendar-outline', activeIcon: 'calendar' },
  { key: 'rewards', label: 'Ödüller', compactLabel: 'Ödül', icon: 'gift-outline', activeIcon: 'gift' },
  { key: 'profile', label: 'Profil', compactLabel: 'Profil', icon: 'person-outline', activeIcon: 'person' },
];

export function BottomNav({ active, onChange }: { active: RootTab; onChange: (tab: RootTab) => void }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 375;

  return (
    <View style={[styles.shell, { bottom: Math.max(insets.bottom, 8) }]}>
      {tabs.map((tab) => {
        const selected = active === tab.key;
        return (
          <AnimatedPressable
            key={tab.key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.item, selected && styles.active]}
            onPress={() => onChange(tab.key)}
          >
            <Ionicons
              name={selected ? tab.activeIcon : tab.icon}
              size={compact ? 21 : 22}
              color={selected ? colors.white : colors.textFaint}
            />
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
              style={[styles.label, compact && styles.labelCompact, selected && styles.labelActive]}
            >
              {compact ? tab.compactLabel : tab.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    left: 10,
    right: 10,
    minHeight: 68,
    borderRadius: 24,
    backgroundColor: 'rgba(18,22,34,0.98)',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    zIndex: 30,
  },
  item: {
    flex: 1,
    minWidth: 0,
    height: 56,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    gap: 3,
  },
  active: { backgroundColor: 'rgba(255,77,141,0.16)' },
  label: { color: colors.textFaint, fontSize: 9.5, fontWeight: '700', textAlign: 'center' },
  labelCompact: { fontSize: 8.5 },
  labelActive: { color: colors.white, fontWeight: '900' },
});
