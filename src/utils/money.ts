export function parseCents(text: string): number {
  const value = text
    .trim()
    .replace(/\s|₺|TL/gi, "")
    .replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(value))
    throw new Error("Tutarı 350 veya 350,50 biçiminde yazın.");
  const [whole, fraction = ""] = value.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents > 100000000)
    throw new Error("Geçersiz tutar.");
  return cents;
}
export const money = (cents: number | string | null | undefined) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(Number(cents || 0) / 100);
export const inputMoney = (cents: number | string) =>
  `${Math.floor(Number(cents) / 100)},${String(Number(cents) % 100).padStart(2, "0")}`;
