import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Crypto from "expo-crypto";
import { File } from "expo-file-system";
import { Platform } from "react-native";
import { supabase } from "../lib/supabase";
async function upload(
  bucket: string,
  prefix: string,
  uri: string,
  mime: string,
) {
  const ext =
    mime === "application/pdf" ? "pdf" : mime === "image/png" ? "png" : "jpg";
  const path = `${prefix}/${Crypto.randomUUID()}.${ext}`;
  const body =
    Platform.OS === "web"
      ? await (await fetch(uri)).arrayBuffer()
      : await new File(uri).arrayBuffer();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, body, { contentType: mime, upsert: false });
  if (error) throw new Error(error.message);
  return bucket === "db_style_media"
    ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
    : path;
}
export async function pickMedia(prefix: string) {
  const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!p.granted) throw new Error("Görsel seçmek için galeri izni gerekli.");
  const r = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
  });
  if (r.canceled) return null;
  return upload(
    "db_style_media",
    prefix,
    r.assets[0].uri,
    r.assets[0].mimeType || "image/jpeg",
  );
}
export async function pickReceipt(business: string) {
  const r = await DocumentPicker.getDocumentAsync({
    type: ["image/jpeg", "image/png", "application/pdf"],
    copyToCacheDirectory: true,
  });
  if (r.canceled) return null;
  return upload(
    "db_style_receipts",
    business,
    r.assets[0].uri,
    r.assets[0].mimeType || "application/pdf",
  );
}
export async function receiptUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("db_style_receipts")
    .createSignedUrl(path, 300);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
