import React, { useEffect, useRef } from "react";
import { Linking, View } from "react-native";
import "leaflet/dist/leaflet.css";
import { Row } from "../types";
import { Card, Txt, Btn } from "./ui";
function point(latitude: unknown, longitude: unknown): [number, number] | null {
  if (latitude == null || longitude == null) return null;
  const lat = Number(latitude),
    lon = Number(longitude);
  return Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180
    ? [lat, lon]
    : null;
}
function WebMap({
  business,
  location,
}: {
  business: Row;
  location?: Row | null;
}) {
  const element = useRef<HTMLDivElement>(null);
  const lat = Number(business.latitude),
    lon = Number(business.longitude);
  const customer = location?.shared
    ? point(location.latitude, location.longitude)
    : null;
  useEffect(() => {
    let disposed = false;
    let map: import("leaflet").Map | undefined;
    let observer: ResizeObserver | undefined;
    import("leaflet").then((L) => {
      if (disposed || !element.current) return;
      map = L.map(element.current, { scrollWheelZoom: false }).setView(
        [lat, lon],
        14,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
      }).addTo(map);
      const label = document.createElement("span");
      label.textContent = business.name || business.business_name || "İşletme";
      L.circleMarker([lat, lon], {
        radius: 9,
        color: "#fff",
        weight: 2,
        fillColor: "#ff4ecb",
        fillOpacity: 1,
      })
        .addTo(map)
        .bindTooltip(label);
      if (customer) {
        L.circleMarker(customer, {
          radius: 8,
          color: "#fff",
          weight: 2,
          fillColor: "#24d6ed",
          fillOpacity: 1,
        })
          .addTo(map)
          .bindTooltip("Müşteri");
        map.fitBounds(L.latLngBounds([[lat, lon], customer]), {
          padding: [30, 30],
          maxZoom: 15,
        });
      }
      observer = new ResizeObserver(() => map?.invalidateSize());
      observer.observe(element.current);
    });
    return () => {
      disposed = true;
      observer?.disconnect();
      map?.remove();
    };
  }, [
    lat,
    lon,
    business.name,
    business.business_name,
    customer?.[0],
    customer?.[1],
  ]);
  return (
    <div
      ref={element}
      role="region"
      aria-label="İşletme ve paylaşılan müşteri konumu"
      style={{
        height: 230,
        width: "100%",
        isolation: "isolate",
        zIndex: 0,
        background: "#101827",
      }}
    />
  );
}
export function MapPanel({
  business,
  location,
}: {
  business: Row;
  location?: Row | null;
}) {
  const destination = point(business.latitude, business.longitude);
  if (!destination)
    return (
      <Card>
        <Txt muted>İşletme henüz harita konumu eklemedi.</Txt>
      </Card>
    );
  return (
    <Card tone="cyan" style={{ padding: 0, overflow: "hidden" }}>
      <WebMap business={business} location={location} />
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
              `https://www.google.com/maps/dir/?api=1&destination=${destination.join(",")}`,
            )
          }
        />
      </View>
    </Card>
  );
}
