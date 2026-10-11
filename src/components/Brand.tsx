import React from "react";
import { View, Image, Text, useWindowDimensions } from "react-native";
import { colors } from "../theme";

export function Brand({
  large = false,
  compact = false,
}: {
  large?: boolean;
  compact?: boolean;
}) {
  const { width } = useWindowDimensions();
  const narrow = compact && width < 360;
  const medium = compact && width < 380;
  return (
    <View
      accessibilityLabel="DraBornStyle"
      style={{ alignItems: large ? "center" : "flex-start", gap: 7 }}
    >
      <View
        style={{
          flexDirection: large ? "column" : "row",
          alignItems: "center",
          gap: large ? 0 : 6,
        }}
      >
        <Image
          source={require("../../assets/art/neon-logo.webp")}
          resizeMode="contain"
          style={{
            width: large ? 82 : narrow ? 22 : medium ? 26 : compact ? 28 : 35,
            height: large ? 88 : narrow ? 27 : medium ? 30 : compact ? 32 : 41,
          }}
        />
        <Text
          allowFontScaling={false}
          style={{
            fontWeight: "800",
            fontStyle: "italic",
            fontSize: large
              ? 37
              : narrow
                ? 16
                : medium
                  ? 18
                  : compact
                    ? 21
                    : 26,
            letterSpacing: -1.2,
            color: "#fff",
            textShadowColor: "#000",
            textShadowRadius: 12,
          }}
        >
          DraBorn
          <Text
            style={{
              color: colors.pink,
              fontFamily: "DraBornScript",
              fontWeight: "400",
              fontStyle: "normal",
              fontSize: large
                ? 54
                : narrow
                  ? 25
                  : medium
                    ? 28
                    : compact
                      ? 32
                      : 39,
              letterSpacing: 0,
              textShadowColor: colors.pink,
              textShadowRadius: 12,
            }}
          >
            Style
          </Text>
        </Text>
      </View>
      {large && (
        <Text
          allowFontScaling={false}
          style={{
            fontSize: 9,
            letterSpacing: 2.2,
            fontWeight: "600",
            color: "#ddd9ef",
          }}
        >
          BERBER · KUAFÖR · DAİMA DAHA FAZLASI
        </Text>
      )}
    </View>
  );
}
