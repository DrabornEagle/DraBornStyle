import React from "react";
import MapView, { Marker } from "react-native-maps";
import { View, Linking } from "react-native";
import { Row } from "../types";
import { Card, Txt, Btn } from "./ui";
export function MapPanel({
  business,
  location,
}: {
  business: Row;
  location?: Row | null;
}) {
  const lat = Number(business.latitude),
    lon = Number(business.longitude);
  if (!business.latitude || !business.longitude)
    return (
      <Card>
        <Txt muted>İşletme henüz harita konumu eklemedi.</Txt>
      </Card>
    );
  return (
    <Card tone="cyan" style={{ padding: 0, overflow: "hidden" }}>
      <MapView
        style={{ height: 230 }}
        initialRegion={{
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker
          coordinate={{ latitude: lat, longitude: lon }}
          title={business.name || business.business_name}
          pinColor="#ff4ecb"
        />
        {location?.shared && location.latitude && (
          <Marker
            coordinate={{
              latitude: Number(location.latitude),
              longitude: Number(location.longitude),
            }}
            title="Müşteri"
            pinColor="#24d6ed"
          />
        )}
      </MapView>
      <View style={{ padding: 14, gap: 8 }}>
        <Txt muted>{business.address}</Txt>
        {location?.shared && (
          <Txt tone="cyan">
            Yaklaşık varış: {location.eta_minutes ?? "—"} dk · Konum
            güncellemesi:{" "}
            {new Date(location.updated_at).toLocaleTimeString("tr-TR")}
          </Txt>
        )}
        <Btn
          title="Yol Tarifi"
          small
          outline
          tone="cyan"
          onPress={() =>
            Linking.openURL(
              `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
            )
          }
        />
      </View>
    </Card>
  );
}
