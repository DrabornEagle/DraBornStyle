import React from "react";
import { Linking } from "react-native";
import { Row } from "../types";
import { Card, Txt, Btn } from "./ui";
export function MapPanel({
  business,
  location,
}: {
  business: Row;
  location?: Row | null;
}) {
  return (
    <Card tone="cyan">
      <Txt bold>İşletme konumu</Txt>
      <Txt muted>{business.address}</Txt>
      {location?.shared && (
        <Txt tone="cyan">
          Müşteri: {Number(location.latitude).toFixed(5)},{" "}
          {Number(location.longitude).toFixed(5)} · Yaklaşık{" "}
          {location.eta_minutes} dakika
        </Txt>
      )}
      <Btn
        title="Haritada Aç / Yol Tarifi"
        outline
        tone="cyan"
        onPress={() =>
          Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`,
          )
        }
      />
    </Card>
  );
}
