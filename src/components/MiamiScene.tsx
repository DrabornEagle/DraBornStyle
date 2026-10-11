import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, gradient } from "../theme";
import { useMotionEnabled, nativeAnimation } from "./motion";

// Code-native artwork keeps the Android Expo Go bundle independent of new native modules.
export function BarberPole({
  size = 38,
  animated = true,
}: {
  size?: number;
  animated?: boolean;
}) {
  const enabled = useMotionEnabled() && animated;
  const shift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled) {
      shift.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(shift, {
        toValue: 1,
        duration: 2100,
        easing: Easing.linear,
        useNativeDriver: nativeAnimation,
        isInteraction: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [enabled]);
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size * 1.65, alignItems: "center" }}
    >
      <View
        style={{
          height: size * 0.13,
          width: size * 0.66,
          borderRadius: size,
          backgroundColor: colors.gold,
        }}
      />
      <View
        style={{
          flex: 1,
          width: size * 0.55,
          overflow: "hidden",
          borderRadius: size * 0.18,
          backgroundColor: "#fff4e6",
          borderWidth: 2,
          borderColor: "#fff4e6",
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            left: -size,
            right: -size,
            top: -size * 2,
            transform: [
              {
                translateY: shift.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, size * 0.72],
                }),
              },
            ],
          }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <View
              key={i}
              style={{
                height: size * 0.18,
                marginBottom: size * 0.18,
                backgroundColor: i % 2 ? "#2fc5c7" : "#f27f9e",
                transform: [{ rotate: "-30deg" }],
              }}
            />
          ))}
        </Animated.View>
        <LinearGradient
          colors={["#ffffff85", "#ffffff00", "#18213928"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View
        style={{
          height: size * 0.13,
          width: size * 0.66,
          borderRadius: size,
          backgroundColor: colors.gold,
        }}
      />
    </View>
  );
}

export function MiamiScene({ compact = false }: { compact?: boolean }) {
  const enabled = useMotionEnabled();
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled) {
      float.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: nativeAnimation,
          isInteraction: false,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: nativeAnimation,
          isInteraction: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [enabled]);
  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ width: compact ? 128 : 180, height: compact ? 154 : 196 }}
    >
      <LinearGradient
        colors={gradient}
        style={{
          position: "absolute",
          width: compact ? 100 : 145,
          height: compact ? 100 : 145,
          borderRadius: 100,
          right: 8,
          top: 12,
        }}
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            right: 0,
            top: (compact ? 76 : 98) + i * 10,
            width: compact ? 117 : 166,
            height: 4 + i,
            backgroundColor: "#242e46",
          }}
        />
      ))}
      <View
        style={{
          position: "absolute",
          left: 5,
          top: compact ? 49 : 64,
          height: 104,
          width: 6,
          borderRadius: 5,
          backgroundColor: colors.cyan,
          transform: [{ rotate: "8deg" }],
        }}
      />
      {[
        [-20, 0, 25],
        [-20, 10, -18],
        [-8, -10, 54],
        [8, -7, -53],
        [10, 0, -18],
        [10, 9, 20],
      ].map(([left, top, rotation], i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            top: (compact ? 42 : 57) + top,
            left,
            width: compact ? 33 : 42,
            height: 6,
            borderRadius: 40,
            backgroundColor: "#64edd9",
            transform: [{ rotate: rotation + "deg" }],
          }}
        />
      ))}
      <Animated.View
        style={{
          position: "absolute",
          right: compact ? 26 : 40,
          top: compact ? 51 : 62,
          transform: [
            {
              translateY: float.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -6],
              }),
            },
            { rotate: "-9deg" },
          ],
        }}
      >
        <View
          style={{
            padding: compact ? 15 : 20,
            borderRadius: 28,
            borderWidth: 1,
            borderColor: "#fff4e67a",
            backgroundColor: "#162840e8",
            alignItems: "center",
          }}
        >
          <BarberPole size={compact ? 31 : 44} />
        </View>
      </Animated.View>
      <View
        style={{
          position: "absolute",
          right: 0,
          bottom: compact ? 2 : 9,
          padding: 8,
          borderRadius: 20,
          backgroundColor: colors.cyan,
          transform: [{ rotate: "12deg" }],
        }}
      >
        <Ionicons name="cut" size={compact ? 20 : 28} color="#18323d" />
      </View>
    </View>
  );
}
