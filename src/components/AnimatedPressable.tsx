import * as Haptics from 'expo-haptics';
import React, { PropsWithChildren, useRef } from 'react';
import {
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

type Props = PropsWithChildren<
  Omit<PressableProps, 'style'> & {
    style?: StyleProp<ViewStyle>;
    pressedScale?: number;
    haptic?: boolean;
  }
>;

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

export function AnimatedPressable({
  children,
  style,
  pressedScale = 0.97,
  haptic = true,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 30,
      bounciness: 3,
    }).start();
  };

  return (
    <AnimatedPressableBase
      {...props}
      disabled={disabled}
      onPressIn={(event) => {
        if (!disabled) {
          animate(pressedScale);
          if (haptic) Haptics.selectionAsync().catch(() => undefined);
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animate(1);
        onPressOut?.(event);
      }}
      style={[
        style,
        { transform: [{ scale }], opacity: disabled ? 0.55 : 1 },
      ]}
    >
      {children}
    </AnimatedPressableBase>
  );
}
