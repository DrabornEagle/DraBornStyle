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
  Animated,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { money } from "../utils/money";
import { colors, gradient, surface, statusNames } from "../theme";
import { Tone, Row } from "../types";
import { useApp } from "../app/Context";
import { Entrance, useMotionEnabled, nativeAnimation } from "./motion";

export const art: Record<string, any> = {
  hero: require("../../assets/art/miami-hero.webp"),
  backdrop: require("../../assets/art/miami-calm-v04.webp"),
  logo: require("../../assets/art/neon-logo.webp"),
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
export function Page({
  children,
  keyboardAvoiding = true,
  contentStyle,
}: {
  children: React.ReactNode;
  keyboardAvoiding?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={
        keyboardAvoiding && Platform.OS === "ios" ? "padding" : undefined
      }
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.page, contentStyle]}
      >
        {React.Children.toArray(children).map((child, i) => (
          <Entrance
            key={
              React.isValidElement(child) && child.key != null ? child.key : i
            }
            delay={Math.min(i, 5) * 35}
            style={{ gap: 20 }}
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
  icon,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  icon?: string;
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
        <RowView style={{ gap: 9 }}>
          <Icon
            name={
              icon ||
              (/usta|çalışan|müşteri/i.test(title)
                ? "people"
                : /hizmet|tıraş/i.test(title)
                  ? "cut"
                  : /randevu|takvim/i.test(title)
                    ? "calendar-outline"
                    : /gelir|ödeme|finans/i.test(title)
                      ? "bar-chart"
                      : "sparkles-outline")
            }
            size={23}
          />
          <Txt bold size={20} style={{ letterSpacing: -0.4 }}>
            {title}
          </Txt>
        </RowView>
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
  quiet = false,
  style,
}: {
  children: React.ReactNode;
  tone?: Tone;
  quiet?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <LinearGradient
      colors={
        quiet
          ? ["#10192b", "#0b1424"]
          : [colors[tone] + "22", "#0a1022f5", "#060d19fa"]
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[
        styles.card,
        { borderColor: colors[tone] + "85", shadowColor: colors[tone] },
        quiet && { borderColor: "#29334a", shadowOpacity: 0 },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}
export function SegmentedControl({
  items,
  value,
  onChange,
  disabled = false,
  label,
}: {
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <View accessibilityLabel={label} style={styles.segmented}>
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <Pressable
            key={item.value}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected, disabled }}
            {...(Platform.OS === "web"
              ? { "aria-pressed": selected, "aria-disabled": disabled }
              : {})}
            disabled={disabled}
            onPress={() => onChange(item.value)}
            style={({ pressed }) => [
              styles.segment,
              {
                backgroundColor: selected
                  ? "#342140"
                  : pressed
                    ? "#172238"
                    : "transparent",
                borderColor: selected ? "#be5baf" : "transparent",
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          >
            <Txt
              size={12}
              bold={selected}
              style={{
                textAlign: "center",
                color: selected ? "#fff" : colors.muted,
              }}
            >
              {item.label}
            </Txt>
          </Pressable>
        );
      })}
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
  iconOnly = false,
}: {
  title: string;
  onPress: () => any;
  tone?: Tone;
  outline?: boolean;
  icon?: string;
  small?: boolean;
  disabled?: boolean;
  iconOnly?: boolean;
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
  const body = (
    <>
      {icon && (
        <Ionicons
          name={icon as any}
          size={small ? 18 : 21}
          color={outline ? colors[tone] : "#fff"}
        />
      )}
      {!iconOnly && (
        <Text
          style={{
            color: "#fff",
            fontWeight: "700",
            fontSize: small ? 12 : 15,
            lineHeight: small ? 17 : 21,
            textAlign: "center",
            flexShrink: 1,
          }}
        >
          {title}
        </Text>
      )}
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
                minWidth: iconOnly ? 44 : undefined,
                paddingHorizontal: iconOnly ? 12 : 16,
                paddingVertical: small ? 11 : 14,
                borderColor: colors[tone] + (hovered ? "dd" : "85"),
                backgroundColor: colors[tone] + (hovered ? "28" : "10"),
              },
            ]}
          >
            {body}
          </View>
        ) : (
          <LinearGradient
            colors={
              tone === "pink"
                ? gradient
                : [
                    colors[tone] + "cc",
                    tone === "purple" ? "#7010ed" : colors[tone] + "80",
                  ]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.button,
              {
                minHeight: small ? 42 : 52,
                minWidth: iconOnly ? 44 : undefined,
                paddingHorizontal: iconOnly ? 12 : 16,
                paddingVertical: small ? 11 : 15,
                borderColor: hovered ? "#fff4e6" : "#ffb2ee98",
                shadowColor: colors[tone],
                shadowOpacity: 0.45,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 0 },
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
          borderColor: selected ? colors[tone] : colors.border,
          backgroundColor: selected ? colors[tone] + "30" : surface.input,
          shadowColor: colors[tone],
          shadowOpacity: selected ? 0.3 : 0,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
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
  hideLabel = false,
  compact = false,
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
  hideLabel?: boolean;
  compact?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ gap: 7 }}>
      {!hideLabel && (
        <Txt muted bold size={12}>
          {label}
        </Txt>
      )}
      <View
        testID="field-control"
        style={[
          styles.inputBox,
          {
            borderColor: focused ? colors.pink : colors.border,
            backgroundColor: focused ? "#17132eeb" : surface.input,
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
          testID="text-field"
          accessibilityLabel={label}
          underlineColorAndroid="transparent"
          style={[
            styles.input,
            multiline && {
              minHeight: compact ? 52 : 100,
              maxHeight: compact ? 100 : undefined,
              textAlignVertical: "top",
            },
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
    <LinearGradient
      colors={[colors[tone] + "2e", "#0a1024", "#050d18"]}
      style={[
        styles.stat,
        { borderColor: colors[tone] + "aa", shadowColor: colors[tone] },
      ]}
    >
      <RowView style={{ gap: 9, alignItems: "flex-start" }}>
        <Icon name={icon} tone={tone} size={26} />
        <Txt muted size={11} style={{ flex: 1, minHeight: 30 }}>
          {label}
        </Txt>
      </RowView>
      <Txt bold size={26} style={{ letterSpacing: -0.7 }}>
        {value}
      </Txt>
    </LinearGradient>
  );
}
export function StatsGrid({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const columns = width < 600 ? 2 : 3;
  function flatten(nodes: React.ReactNode): React.ReactNode[] {
    return React.Children.toArray(nodes).flatMap((child) =>
      React.isValidElement<{ children?: React.ReactNode }>(child) &&
      child.type === React.Fragment
        ? flatten(child.props.children)
        : [child],
    );
  }
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "stretch",
      }}
    >
      {flatten(children).map((child, i) => (
        <View
          key={i}
          style={{
            width: `${100 / columns - (columns === 2 ? 1.4 : 1)}%`,
            flexGrow: 1,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}
export function Columns({ children }: { children: React.ReactNode }) {
  const wide = useWindowDimensions().width >= 760;
  return (
    <View
      style={{
        flexDirection: wide ? "row" : "column",
        gap: 14,
        alignItems: "stretch",
      }}
    >
      {React.Children.toArray(children).map((child, i) => (
        <View
          key={i}
          style={{ flex: wide ? 1 : undefined, minWidth: 0, gap: 14 }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}
export function ColumnChart({
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
  const max = Math.max(1, ...rows.map((r) => Number(r[keyValue]) || 0));
  return (
    <View style={{ gap: 10 }}>
      <RowView style={{ justifyContent: "space-between" }}>
        <Txt muted size={11}>
          Seçilen dönem
        </Txt>
        <Txt tone="pink" bold size={18}>
          {currency
            ? money(rows.reduce((n, r) => n + Number(r[keyValue] || 0), 0))
            : rows.reduce((n, r) => n + Number(r[keyValue] || 0), 0)}
        </Txt>
      </RowView>
      <View
        style={{
          height: 148,
          flexDirection: "row",
          gap: 8,
          alignItems: "flex-end",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: 5,
        }}
      >
        {rows.slice(-12).map((r, i) => (
          <View
            key={r.id || i}
            style={{
              flex: 1,
              alignItems: "center",
              gap: 7,
              height: "100%",
              justifyContent: "flex-end",
            }}
          >
            <LinearGradient
              colors={
                i === rows.slice(-12).length - 1
                  ? ["#ffb462", "#ff30c9"]
                  : ["#dd3cff", "#7712d4"]
              }
              style={{
                width: "85%",
                maxWidth: 42,
                height: Math.max(4, (Number(r[keyValue]) / max) * 118),
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
              }}
            />
            <Txt muted size={9}>
              {String(r[label]).slice(-5)}
            </Txt>
          </View>
        ))}
      </View>
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
  fallback,
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
      {url || fallback ? (
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
      ) : (
        <View
          style={{
            flex: 1,
            borderRadius: size / 2,
            backgroundColor: colors.bg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name="person-outline"
            tone="purple"
            size={Math.round(size * 0.48)}
          />
        </View>
      )}
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
    <View
      style={{
        padding: image ? 22 : 6,
        gap: 8,
        paddingTop: image ? 120 : 24,
        paddingBottom: image ? 22 : 22,
      }}
    >
      <Txt
        size={10}
        bold
        style={{
          letterSpacing: 2.7,
          color: "#e4dff2",
          textShadowColor: "#000",
          textShadowRadius: 8,
        }}
      >
        {eyebrow}
      </Txt>
      <Txt
        bold
        size={compact ? 28 : 35}
        style={{
          letterSpacing: -0.8,
          lineHeight: compact ? 34 : 40,
          textShadowColor: "#000",
          textShadowRadius: 14,
        }}
      >
        {title}
      </Txt>
      <Txt
        muted
        size={13}
        style={{
          lineHeight: 20,
          textShadowColor: "#000",
          textShadowRadius: 10,
        }}
      >
        {subtitle}
      </Txt>
      {children}
    </View>
  );
  return image ? (
    <View
      style={{
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.pink + "85",
      }}
    >
      <Image
        accessible={false}
        source={imageSource(image)}
        resizeMode="cover"
        style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["#040b1870", "#040b18f5"]}
        style={StyleSheet.absoluteFill}
      />
      {content}
    </View>
  ) : (
    content
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
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors[tone] + "85",
          backgroundColor: colors[tone] + "12",
          shadowColor: colors[tone],
          shadowOpacity: 0.15,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
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
              colors={[colors.purple, colors.pink, colors.gold]}
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
  page: { padding: 14, paddingBottom: 28, gap: 20 },
  segmented: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#29334a",
    backgroundColor: "#070f1f",
  },
  segment: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 7,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 14,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.17,
    shadowRadius: 8,
  },
  button: {
    borderRadius: 14,
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
    borderRadius: 12,
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
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  stat: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderRadius: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
