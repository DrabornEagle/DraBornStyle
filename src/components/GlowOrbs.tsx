import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

export function GlowOrbs() {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 5200, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 5200, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [drift]);

  const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [-12, 18] });
  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [0, 24] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.orb, styles.pink, { transform: [{ translateX }, { translateY }] }]} />
      <Animated.View style={[styles.orb, styles.blue, { transform: [{ translateX: Animated.multiply(translateX, -1) }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute', width: 210, height: 210, borderRadius: 105, opacity: 0.13 },
  pink: { top: -70, right: -90, backgroundColor: colors.primary },
  blue: { top: 280, left: -130, backgroundColor: colors.cyan },
});
