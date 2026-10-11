export const localDate = (value: Date | string = new Date()) =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
export const clock = (value: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
export const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    weekday: "short",
  }).format(new Date(value));
export const dateTime = (value: string) =>
  `${dateLabel(value)} · ${clock(value)}`;
export function validDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(date + "T12:00:00+03:00");
  return !Number.isNaN(d.getTime()) && localDate(d) === date;
}
export function addDays(date: string, n: number) {
  const d = new Date(date + "T12:00:00+03:00");
  d.setUTCDate(d.getUTCDate() + n);
  return localDate(d);
}
export function atLocal(date: string, time: string) {
  if (!validDate(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    throw new Error("Tarih YYYY-AA-GG, saat SS:DD biçiminde olmalı.");
  return new Date(date + "T" + time + ":00+03:00").toISOString();
}
export const periodOptions = [
  ["today", "Bugün"],
  ["yesterday", "Dün"],
  ["week", "Bu hafta"],
  ["month", "Bu ay"],
  ["lastmonth", "Geçen ay"],
  ["year", "Bu yıl"],
  ["all", "Tümü"],
  ["custom", "Özel tarih"],
] as const;
export function dateRange(period: string, from?: string, to?: string) {
  const today = localDate();
  const d = new Date(today + "T12:00:00+03:00");
  let start = today,
    end = addDays(today, 1);
  if (period === "yesterday") {
    start = addDays(today, -1);
    end = today;
  }
  if (period === "week") {
    start = addDays(today, -((d.getUTCDay() + 6) % 7));
  }
  if (period === "month") {
    start = today.slice(0, 7) + "-01";
  }
  if (period === "lastmonth") {
    const x = new Date(today.slice(0, 7) + "-01T12:00:00+03:00");
    x.setUTCMonth(x.getUTCMonth() - 1);
    start = localDate(x);
    end = today.slice(0, 7) + "-01";
  }
  if (period === "year") start = today.slice(0, 4) + "-01-01";
  if (period === "all") return {};
  if (period === "custom") {
    if (!validDate(from || "") || !validDate(to || "") || from! > to!)
      throw new Error(
        "Geçerli bir başlangıç ve bitiş tarihi yazın; bitiş başlangıçtan önce olamaz.",
      );
    start = from!;
    end = addDays(to!, 1);
  }
  return { from: atLocal(start, "00:00"), to: atLocal(end, "00:00") };
}
