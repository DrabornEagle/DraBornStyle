import React, { useRef, useEffect } from "react";
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
import { colors, gradient, statusNames } from "../theme";
import { Tone, Row } from "../types";
import { useApp } from "../app/Context";
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
          lineHeight: size * 1.42,
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
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);
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
        <Animated.View style={{ opacity, gap: 16 }}>{children}</Animated.View>
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
    <RowView style={{ justifyContent: "space-between", marginTop: 6 }}>
      <View style={{ flex: 1 }}>
        <Txt bold size={19}>
          {title}
        </Txt>
        {subtitle && (
          <Txt muted size={12}>
            {subtitle}
          </Txt>
        )}
      </View>
      {right}
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
    <View style={[styles.card, { borderColor: colors[tone] + "60" }, style]}>
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled || busy}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      style={({ pressed }) => ({
        opacity: disabled ? 0.35 : pressed ? 0.75 : 1,
        flexShrink: 1,
      })}
    >
      {outline ? (
        <View
          style={[
            styles.button,
            {
              paddingVertical: small ? 10 : 15,
              borderColor: colors[tone] + "80",
              backgroundColor: colors[tone] + "12",
            },
          ]}
        >
          {icon && <Icon name={icon} tone={tone} size={small ? 17 : 22} />}
          <Txt tone={tone} bold size={small ? 12 : 15}>
            {title}
          </Txt>
        </View>
      ) : (
        <LinearGradient
          colors={
            tone === "pink" ? gradient : [colors[tone], colors[tone] + "b0"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            { paddingVertical: small ? 11 : 16, borderColor: colors[tone] },
          ]}
        >
          {icon && (
            <Ionicons name={icon as any} size={small ? 17 : 24} color="#fff" />
          )}
          <Text
            style={{
              color: "#fff",
              fontWeight: "800",
              fontSize: small ? 13 : 17,
              textAlign: "center",
            }}
          >
            {title}
          </Text>
        </LinearGradient>
      )}
    </Pressable>
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
      style={[
        styles.chip,
        {
          borderColor: selected ? colors[tone] : colors.border,
          backgroundColor: selected ? colors[tone] + "25" : "#14172c",
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  numeric?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Txt muted size={12}>
        {label}
      </Txt>
      <TextInput
        accessibilityLabel={label}
        style={[
          styles.input,
          multiline && { minHeight: 90, textAlignVertical: "top" },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#676f96"
        secureTextEntry={secure}
        keyboardType={numeric ? "decimal-pad" : "default"}
        autoCapitalize="none"
        multiline={multiline}
      />
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
    <Card tone={tone} style={{ flex: 1, minWidth: 140, padding: 14 }}>
      <RowView>
        <Icon name={icon} tone={tone} />
        <Txt muted size={11} style={{ flex: 1 }}>
          {label}
        </Txt>
      </RowView>
      <Txt bold size={25}>
        {value}
      </Txt>
      <View
        style={{
          height: 3,
          width: 34,
          borderRadius: 2,
          backgroundColor: colors[tone],
        }}
      />
    </Card>
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
    <Image
      source={imageSource(url, fallback)}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: colors.gold,
      }}
    />
  );
}
export function Hero({
  title,
  subtitle,
  image,
  children,
}: {
  title: string;
  subtitle: string;
  image?: string;
  children?: React.ReactNode;
}) {
  return (
    <ImageBackground
      source={imageSource(image)}
      style={{
        minHeight: 210,
        borderRadius: 23,
        overflow: "hidden",
        justifyContent: "flex-end",
      }}
    >
      <LinearGradient
        colors={["#070d2010", "#070d20ed"]}
        style={{ padding: 20, paddingTop: 70, gap: 7 }}
      >
        <Txt size={10} tone="cyan" bold style={{ letterSpacing: 3 }}>
          DRA BORN STYLE
        </Txt>
        <Txt bold size={30}>
          {title}
        </Txt>
        <Txt size={13} muted>
          {subtitle}
        </Txt>
        {children}
      </LinearGradient>
    </ImageBackground>
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
      <View style={{ padding: 36, alignItems: "center", gap: 8 }}>
        <ActivityIndicator color={colors.pink} />
        <Txt muted>Yükleniyor…</Txt>
      </View>
    );
  if (error)
    return (
      <Card tone="red">
        <Txt tone="red">{error}</Txt>
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
      <Card tone="cyan">
        <Icon name="sparkles-outline" tone="cyan" size={28} />
        <Txt muted>{empty}</Txt>
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
        paddingVertical: total ? 10 : 3,
        borderTopWidth: total ? 1 : 0,
        borderTopColor: colors.border,
      }}
    >
      <Txt muted={!total} bold={total}>
        {label}
      </Txt>
      <Txt bold tone={total ? "gold" : undefined} size={total ? 23 : 15}>
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
    <View style={{ gap: 12 }}>
      {rows.map((r, i) => (
        <View key={r.id || i} style={{ gap: 5 }}>
          <RowView style={{ justifyContent: "space-between" }}>
            <Txt size={12}>{String(r[label])}</Txt>
            <Txt size={12} muted>
              {currency
                ? money(r[keyValue])
                : Number(r[keyValue]).toLocaleString("tr-TR")}
            </Txt>
          </RowView>
          <View
            style={{ height: 8, borderRadius: 5, backgroundColor: "#22263e" }}
          >
            <LinearGradient
              colors={gradient}
              style={{
                height: 8,
                borderRadius: 5,
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
  page: { padding: 16, paddingBottom: 28 },
  card: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderRadius: 20,
    padding: 17,
    gap: 12,
  },
  button: {
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    minHeight: 42,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1,
    borderRadius: 13,
    alignSelf: "flex-start",
  },
  input: {
    backgroundColor: "#11172f",
    borderWidth: 1,
    borderColor: "#40445f",
    borderRadius: 13,
    padding: 14,
    color: colors.text,
    fontSize: 15,
  },
});
