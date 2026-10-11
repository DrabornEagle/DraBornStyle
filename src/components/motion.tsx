import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  Animated,
  AppState,
  Easing,
  Platform,
  StyleProp,
  ViewStyle,
} from "react-native";

const MotionContext = createContext(false);
export const useMotionEnabled = () => useContext(MotionContext);
export const nativeAnimation = Platform.OS !== "web";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(true);
  const [active, setActive] = useState(AppState.currentState !== "background");
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (live) setReduced(value);
      })
      .catch(() => {});
    const reduce = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    const state = AppState.addEventListener("change", (value) =>
      setActive(value === "active"),
    );
    return () => {
      live = false;
      reduce.remove();
      state.remove();
    };
  }, []);
  return (
    <MotionContext.Provider value={!reduced && active}>
      {children}
    </MotionContext.Provider>
  );
}

export function Entrance({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const enabled = useMotionEnabled();
  const progress = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!enabled) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 360,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeAnimation,
      isInteraction: false,
    });
    animation.start();
    return () => animation.stop();
  }, [enabled]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
