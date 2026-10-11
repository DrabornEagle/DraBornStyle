import React, { useState, useEffect } from "react";
import { View, Pressable } from "react-native";
import { Txt, Icon, RowView } from "./ui";
import { colors } from "../theme";
import { localDate } from "../utils/dates";

export function Calendar({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) {
  const [month, setMonth] = useState(value.slice(0, 7));
  useEffect(() => {
    if (/^\d{4}-\d{2}/.test(value)) setMonth(value.slice(0, 7));
  }, [value]);
  const [year, m] = month.split("-").map(Number);
  const first = new Date(year, m - 1, 1);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(year, m, 0).getDate();
  function move(delta: number) {
    const next = new Date(year, m - 1 + delta, 1);
    setMonth(
      `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return (
    <View style={{ gap: 14 }}>
      <RowView style={{ justifyContent: "space-between" }}>
        <Pressable
          onPress={() => move(-1)}
          accessibilityRole="button"
          accessibilityLabel="Önceki ay"
          style={{ padding: 9 }}
        >
          <Icon name="chevron-back" tone="purple" size={22} />
        </Pressable>
        <Txt bold size={19}>
          {first.toLocaleDateString("tr-TR", {
            month: "long",
            year: "numeric",
          })}
        </Txt>
        <Pressable
          onPress={() => move(1)}
          accessibilityRole="button"
          accessibilityLabel="Sonraki ay"
          style={{ padding: 9 }}
        >
          <Icon name="chevron-forward" tone="purple" size={22} />
        </Pressable>
      </RowView>
      <View style={{ flexDirection: "row" }}>
        {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
          <View key={day} style={{ width: "14.285%", alignItems: "center" }}>
            <Txt muted size={11}>
              {day}
            </Txt>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, i) => {
          const day = i - offset + 1;
          const date = `${month}-${String(day).padStart(2, "0")}`;
          const valid = day > 0 && day <= count;
          const past = date < localDate();
          const selected = value === date;
          return (
            <View key={i} style={{ width: "14.285%", padding: 2 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={valid ? date : undefined}
                accessibilityState={{ selected, disabled: !valid || past }}
                disabled={!valid || past}
                onPress={() => onChange(date)}
                style={{
                  height: 43,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 10,
                  borderWidth: selected ? 1 : 0,
                  borderColor: colors.pink,
                  backgroundColor: selected ? "#c32cc748" : "transparent",
                  opacity: past ? 0.35 : 1,
                  shadowColor: colors.pink,
                  shadowOpacity: selected ? 0.4 : 0,
                  shadowRadius: 9,
                  shadowOffset: { width: 0, height: 0 },
                }}
              >
                <Txt bold={selected} size={14}>
                  {valid ? day : ""}
                </Txt>
                {selected && (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      backgroundColor: colors.pink,
                      borderRadius: 2,
                      marginTop: 3,
                    }}
                  />
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
