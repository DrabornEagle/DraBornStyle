import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export function HomeBackdrop() {
  return (
    <View
      testID="home-background"
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      <Image
        accessible={false}
        source={require("../../assets/art/miami-home-v04.webp")}
        resizeMode="stretch"
        style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
      />
      <LinearGradient
        colors={["#040b1820", "#040b1845", "#040b1860"]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
