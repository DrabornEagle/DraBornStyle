export function locationEligibility(
  appointment: {
    status?: string;
    starts_at?: string;
    ends_at?: string;
    latitude?: unknown;
    longitude?: unknown;
  },
  now = Date.now(),
) {
  const starts = Date.parse(appointment.starts_at || ""),
    ends = Date.parse(appointment.ends_at || "");
  if (
    !["booked", "arrived"].includes(appointment.status || "") ||
    !Number.isFinite(starts) ||
    !Number.isFinite(ends) ||
    ends < now
  )
    return {
      allowed: false,
      reason: "Bu randevu için konum paylaşımı açık değil.",
    };
  if (
    appointment.latitude == null ||
    appointment.longitude == null ||
    !Number.isFinite(Number(appointment.latitude)) ||
    !Number.isFinite(Number(appointment.longitude))
  )
    return {
      allowed: false,
      reason:
        "İşletme henüz harita konumunu eklemedi. Randevun konum paylaşmadan devam eder.",
    };
  if (starts > now + 2 * 60 * 60 * 1000)
    return {
      allowed: false,
      reason:
        "Konumunu randevuna 2 saat kala randevu detaylarından paylaşabilirsin.",
    };
  return { allowed: true, reason: null };
}
