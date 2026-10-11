import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  ImageBackground,
  Animated,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { money } from "../utils/money";
import { colors, gradient, surface, statusNames } from "../theme";
import { Tone, Row } from "../types";
import { useApp } from "../app/Context";
import { MiamiScene } from "./MiamiScene";
import { Entrance, useMotionEnabled, nativeAnimation } from "./motion";

export const art: Record<string, any> = {
  hero: require("../../assets/art/miami-hero.webp"),
  barber: require("../../assets/art/miami-hero.webp"),
  salon: require("../../assets/art/salon.webp"),
  elite: require("../../assets/art/elite.webp"),
  ahmet: require("../../assets/art/ahmet.webp"),
  mehmet: require("../../assets/art/mehmet.webp"),
  ali: require("../../assets/art/ali.webp"),
};
export const imageSource = (url?: string | null, fallback = "hero") =>
  url?.startsWith("asset:")
    ? art[url.slice(6)] || art[fallback]
    : url
      ? { uri: url }
      : art[fallback];
export function Icon({
  name,
  size = 22,
  tone = "pink",
}: {
  name: string;
  size?: number;
  tone?: Tone;
}) {
  return <Ionicons name={name as any} size={size} color={colors[tone]} />;
}
export function Txt({
  children,
  muted = false,
  bold = false,
  size = 14,
  tone,
  style,
}: {
  children: React.ReactNode;
  muted?: boolean;
  bold?: boolean;
  size?: number;
  tone?: Tone;
  style?: any;
}) {
  return (
    <Text
      style={[
        {
          color: tone ? colors[tone] : muted ? colors.muted : colors.text,
          fontSize: size,
          fontWeight: bold ? "700" : "400",
          lineHeight: size * 1.4,
          flexShrink: 1,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function RowView({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.row, style]}>{children}</View>;
}
export function Page({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
      >
        {React.Children.toArray(children).map((child, i) => (
          <Entrance
            key={
              React.isValidElement(child) && child.key != null ? child.key : i
            }
            delay={Math.min(i, 5) * 35}
            style={{ gap: 18 }}
          >
            {child}
          </Entrance>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export function Section({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <RowView
      style={{
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginTop: 8,
        gap: 12,
      }}
    >
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <View
          style={{
            width: 22,
            height: 3,
            borderRadius: 3,
            backgroundColor: colors.cyan,
            marginBottom: 3,
          }}
        />
        <Txt bold size={22} style={{ letterSpacing: -0.7 }}>
          {title}
        </Txt>
        {subtitle && (
          <Txt muted size={12}>
            {subtitle}
          </Txt>
        )}
      </View>
      {right && <View style={{ maxWidth: "44%" }}>{right}</View>}
    </RowView>
  );
}
export function Card({
  children,
  tone = "purple",
  style,
}: {
  children: React.ReactNode;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, { borderColor: colors[tone] + "35" }, style]}>
      {children}
    </View>
  );
}
export function Btn({
  title,
  onPress,
  tone = "pink",
  outline = false,
  icon,
  small = false,
  disabled = false,
}: {
  title: string;
  onPress: () => any;
  tone?: Tone;
  outline?: boolean;
  icon?: string;
  small?: boolean;
  disabled?: boolean;
}) {
  const { busy } = useApp();
  const enabled = useMotionEnabled();
  const scale = useRef(new Animated.Value(1)).current;
  const [hovered, setHovered] = useState(false);
  const inactive = disabled || busy;
  const press = (value: number) => {
    scale.stopAnimation();
    if (!enabled) {
      scale.setValue(1);
      return;
    }
    Animated.spring(scale, {
      toValue: value,
      damping: 18,
      stiffness: 270,
      mass: 0.7,
      useNativeDriver: nativeAnimation,
    }).start();
  };
  const darkText = !outline;
  const body = (
    <>
      {icon && (
        <Ionicons
          name={icon as any}
          size={small ? 18 : 21}
          color={darkText ? surface.ink : colors[tone]}
        />
      )}
      <Text
        style={{
          color: darkText ? surface.ink : colors[tone],
          fontWeight: "700",
          fontSize: small ? 12 : 15,
          lineHeight: small ? 17 : 21,
          textAlign: "center",
          flexShrink: 1,
        }}
      >
        {title}
      </Text>
    </>
  );
  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        flexShrink: 1,
        opacity: inactive ? 0.4 : 1,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: inactive }}
        disabled={inactive}
        onPress={(event) => {
          event.stopPropagation();
          onPress();
        }}
        onPressIn={() => press(0.97)}
        onPressOut={() => press(1)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        {outline ? (
          <View
            style={[
              styles.button,
              {
                minHeight: small ? 42 : 52,
                paddingVertical: small ? 11 : 14,
                borderColor: colors[tone] + (hovered ? "bb" : "55"),
                backgroundColor: colors[tone] + (hovered ? "1c" : "0c"),
              },
            ]}
          >
            {body}
          </View>
        ) : (
          <LinearGradient
            colors={tone === "pink" ? gradient : [colors[tone], colors[tone]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.button,
              {
                minHeight: small ? 42 : 52,
                paddingVertical: small ? 11 : 15,
                borderColor: hovered ? "#fff4e6" : "#ffffff28",
              },
            ]}
          >
            {body}
          </LinearGradient>
        )}
      </Pressable>
    </Animated.View>
  );
}
export function Chip({
  label,
  selected = false,
  onPress,
  tone = "pink",
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: Tone;
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityState={onPress ? { selected } : undefined}
      style={({ pressed }) => [
        styles.chip,
        {
          minHeight: onPress ? 44 : 31,
          borderColor: selected ? colors[tone] + "90" : colors.border,
          backgroundColor: selected ? colors[tone] + "20" : surface.input,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Txt size={12} bold={selected} tone={selected ? tone : undefined}>
        {label}
      </Txt>
    </Pressable>
  );
}
export function Chips({
  items,
  value,
  onChange,
}: {
  items: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
    >
      {items.map((i) => (
        <Chip
          key={i.value}
          label={i.label}
          selected={value === i.value}
          onPress={() => onChange(i.value)}
        />
      ))}
    </ScrollView>
  );
}
export function Field({
  label,
  value,
  onChange,
  placeholder,
  secure = false,
  numeric = false,
  multiline = false,
  email = false,
  icon,
  onSubmit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  numeric?: boolean;
  multiline?: boolean;
  email?: boolean;
  icon?: string;
  onSubmit?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ gap: 7 }}>
      <Txt muted bold size={12}>
        {label}
      </Txt>
      <View
        style={[
          styles.inputBox,
          {
            borderColor: focused ? colors.cyan : colors.border,
            backgroundColor: focused ? "#18263c" : surface.input,
          },
          multiline && { alignItems: "flex-start" },
        ]}
      >
        {icon && (
          <View style={{ paddingTop: multiline ? 12 : 0 }}>
            <Icon name={icon} tone={focused ? "cyan" : "purple"} size={20} />
          </View>
        )}
        <TextInput
          accessibilityLabel={label}
          style={[
            styles.input,
            multiline && { minHeight: 100, textAlignVertical: "top" },
          ]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#93a0b9"
          secureTextEntry={secure && !visible}
          keyboardType={
            numeric ? "decimal-pad" : email ? "email-address" : "default"
          }
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={
            email ? "email" : secure ? "current-password" : undefined
          }
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmit}
          returnKeyType={onSubmit ? "go" : "next"}
        />
        {secure && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? "Şifreyi gizle" : "Şifreyi göster"}
            onPress={() => setVisible((v) => !v)}
            style={{
              width: 44,
              minHeight: 48,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={visible ? "eye-off-outline" : "eye-outline"}
              tone="cyan"
              size={21}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}
export function Stat({
  label,
  value,
  icon,
  tone = "pink",
}: {
  label: string;
  value: string | number;
  icon: string;
  tone?: Tone;
}) {
  return (
    <View style={[styles.stat, { borderColor: colors[tone] + "38" }]}>
      <RowView style={{ justifyContent: "space-between" }}>
        <View
          style={{
            padding: 8,
            borderRadius: 13,
            backgroundColor: colors[tone] + "16",
          }}
        >
          <Icon name={icon} tone={tone} size={20} />
        </View>
        <View
          style={{
            width: 18,
            height: 3,
            borderRadius: 3,
            backgroundColor: colors[tone],
          }}
        />
      </RowView>
      <Txt bold size={28} style={{ letterSpacing: -1.2 }}>
        {value}
      </Txt>
      <Txt muted size={11}>
        {label}
      </Txt>
    </View>
  );
}
export function StatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {children}
    </View>
  );
}
export function Badge({ state }: { state: string }) {
  const tone: Tone = [
    "completed",
    "available",
    "approved",
    "arrived",
    "accepted",
  ].includes(state)
    ? "green"
    : ["cancelled", "no_show", "rejected", "reversed"].includes(state)
      ? "red"
      : ["active", "in_progress", "on_way"].includes(state)
        ? "cyan"
        : "gold";
  return <Chip label={statusNames[state] || state} selected tone={tone} />;
}
export function Avatar({
  url,
  size = 46,
  fallback = "ahmet",
}: {
  url?: string;
  size?: number;
  fallback?: string;
}) {
  return (
    <LinearGradient
      colors={[colors.cyan, colors.pink]}
      style={{ width: size, height: size, borderRadius: size / 2, padding: 2 }}
    >
      <Image
        source={imageSource(url, fallback)}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: colors.bg,
        }}
      />
    </LinearGradient>
  );
}
export function Hero({
  title,
  subtitle,
  image,
  children,
  eyebrow = "BERBERİNLE AYNI RİTİMDE",
  compact = false,
}: {
  title: string;
  subtitle: string;
  image?: string;
  children?: React.ReactNode;
  eyebrow?: string;
  compact?: boolean;
}) {
  const content = (
    <>
      {image ? (
        <LinearGradient
          colors={["#0c122225", "#0c1222f5"]}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <>
          <LinearGradient
            colors={["#242c49", "#253e4e", "#182638"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={{
              position: "absolute",
              right: 8,
              top: compact ? 0 : 16,
              width: 112,
              height: 154,
              transform: [{ scale: 0.86 }],
            }}
          >
            <MiamiScene compact />
          </View>
        </>
      )}
      <View
        style={{
          padding: 22,
          gap: 9,
          paddingTop: image ? 84 : compact ? 20 : 25,
        }}
      >
        <RowView
          style={{
            marginBottom: image ? 25 : compact ? 18 : 32,
            maxWidth: image ? "100%" : "62%",
            gap: 6,
          }}
        >
          <View
            style={{
              width: 5,
              height: 5,
              backgroundColor: colors.cyan,
              borderRadius: 3,
            }}
          />
          <Txt size={9} tone="cyan" bold style={{ letterSpacing: 1.5 }}>
            {eyebrow}
          </Txt>
        </RowView>
        <Txt
          bold
          size={compact ? 27 : 34}
          style={{
            letterSpacing: -1.4,
            lineHeight: compact ? 33 : 39,
            maxWidth: image ? "100%" : "60%",
          }}
        >
          {title}
        </Txt>
        <Txt size={13} muted style={{ maxWidth: "96%", lineHeight: 20 }}>
          {subtitle}
        </Txt>
        {children}
      </View>
      <LinearGradient
        colors={[colors.cyan, colors.pink, colors.gold]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 3 }}
      />
    </>
  );
  const style: ViewStyle = {
    minHeight: compact ? 198 : 252,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#739eaa45",
    justifyContent: "space-between",
  };
  return image ? (
    <ImageBackground source={imageSource(image)} style={style}>
      {content}
    </ImageBackground>
  ) : (
    <View style={style}>{content}</View>
  );
}
export function QuickAction({
  title,
  subtitle,
  icon,
  tone = "cyan",
  onPress,
}: {
  title: string;
  subtitle?: string;
  icon: string;
  tone?: Tone;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          minWidth: 130,
          padding: 16,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: colors[tone] + "3f",
          backgroundColor: surface.raised,
          gap: 12,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <RowView style={{ justifyContent: "space-between" }}>
        <Icon name={icon} tone={tone} size={25} />
        <Icon name="arrow-forward-outline" tone={tone} size={17} />
      </RowView>
      <View style={{ gap: 3 }}>
        <Txt bold size={14}>
          {title}
        </Txt>
        {subtitle && (
          <Txt muted size={11}>
            {subtitle}
          </Txt>
        )}
      </View>
    </Pressable>
  );
}
export function State({
  loading,
  error,
  empty,
  onRetry,
}: {
  loading?: boolean;
  error?: string | null;
  empty?: string;
  onRetry?: () => void;
}) {
  if (loading)
    return (
      <Card tone="cyan" style={{ alignItems: "center", paddingVertical: 30 }}>
        <ActivityIndicator
          color={colors.cyan}
          accessibilityLabel="Yükleniyor"
        />
        <Txt muted size={12}>
          Birazdan hazır…
        </Txt>
      </Card>
    );
  if (error)
    return (
      <Card tone="red">
        <RowView>
          <Icon name="alert-circle-outline" tone="red" />
          <Txt bold tone="red">
            Bir sorun oluştu
          </Txt>
        </RowView>
        <Txt muted>{error}</Txt>
        {onRetry && (
          <Btn
            title="Yeniden dene"
            onPress={onRetry}
            outline
            tone="red"
            small
          />
        )}
      </Card>
    );
  if (empty)
    return (
      <Card tone="cyan" style={{ paddingVertical: 24 }}>
        <RowView style={{ alignItems: "flex-start" }}>
          <View
            style={{
              backgroundColor: colors.cyan + "14",
              padding: 11,
              borderRadius: 17,
            }}
          >
            <Icon name="cut-outline" tone="cyan" size={26} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Txt bold>Yeni bir başlangıç</Txt>
            <Txt muted size={13}>
              {empty}
            </Txt>
          </View>
        </RowView>
      </Card>
    );
  return null;
}
export function AmountLine({
  label,
  value,
  total = false,
}: {
  label: string;
  value: string;
  total?: boolean;
}) {
  return (
    <RowView
      style={{
        justifyContent: "space-between",
        paddingVertical: total ? 14 : 4,
        gap: 14,
        borderTopWidth: total ? 1 : 0,
        borderTopColor: colors.border,
      }}
    >
      <Txt muted={!total} bold={total} style={{ flex: 1 }}>
        {label}
      </Txt>
      <Txt
        bold
        tone={total ? "gold" : undefined}
        size={total ? 25 : 15}
        style={{ maxWidth: "57%", textAlign: "right" }}
      >
        {value}
      </Txt>
    </RowView>
  );
}
export function Bars({
  rows,
  keyValue,
  label,
  currency = false,
}: {
  rows: Row[];
  keyValue: string;
  label: string;
  currency?: boolean;
}) {
  const max = Math.max(1, ...rows.map((r) => Number(r[keyValue])));
  return (
    <View style={{ gap: 14 }}>
      {rows.map((r, i) => (
        <View key={r.id || i} style={{ gap: 7 }}>
          <RowView style={{ justifyContent: "space-between" }}>
            <Txt size={12}>{String(r[label])}</Txt>
            <Txt size={12} tone="cyan">
              {currency
                ? money(r[keyValue])
                : Number(r[keyValue]).toLocaleString("tr-TR")}
            </Txt>
          </RowView>
          <View
            style={{
              height: 7,
              borderRadius: 8,
              backgroundColor: surface.input,
            }}
          >
            <LinearGradient
              colors={[colors.cyan, colors.purple, colors.pink]}
              style={{
                height: 7,
                borderRadius: 8,
                width: `${Math.max(2, (100 * Number(r[keyValue])) / max)}%`,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  page: { padding: 18, paddingBottom: 30, gap: 18 },
  card: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderRadius: 25,
    padding: 19,
    gap: 14,
  },
  button: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 25,
    alignSelf: "flex-start",
    justifyContent: "center",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingLeft: 14,
    minHeight: 54,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 14,
    paddingHorizontal: 10,
    color: colors.text,
    fontSize: 15,
  },
  stat: {
    flex: 1,
    minWidth: 135,
    padding: 17,
    borderWidth: 1,
    borderRadius: 24,
    gap: 9,
    backgroundColor: colors.panel,
  },
});
