import * as Haptics from 'expo-haptics';
import React, { PropsWithChildren, useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

type Props = PropsWithChildren<PressableProps & {
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
  haptic?: boolean;
}>;

export function AnimatedPressable({
  children,
  style,
  pressedScale = 0.96,
  haptic = true,
  onPressIn,
  onPressOut,
  ...props
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 28,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        {...props}
        onPressIn={(event) => {
          animate(pressedScale);
          if (haptic) Haptics.selectionAsync().catch(() => undefined);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          animate(1);
          onPressOut?.(event);
        }}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
