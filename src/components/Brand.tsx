import React from "react";
import { View, Image, Text } from "react-native";
import { colors } from "../theme";

export function Brand({
  large = false,
  compact = false,
}: {
  large?: boolean;
  compact?: boolean;
}) {
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
            width: large ? 82 : compact ? 28 : 35,
            height: large ? 88 : compact ? 32 : 41,
          }}
        />
        <Text
          style={{
            fontWeight: "800",
            fontStyle: "italic",
            fontSize: large ? 37 : compact ? 21 : 26,
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
              fontSize: large ? 54 : compact ? 32 : 39,
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
