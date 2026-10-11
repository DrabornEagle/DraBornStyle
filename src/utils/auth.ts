export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function authErrorMessage(error: {
  code?: string;
  message?: string;
  status?: number;
}) {
  if (error.code === "invalid_credentials")
    return "E-posta veya şifre yanlış. Şifreyi göstererek kontrol edebilir ya da sıfırlayabilirsiniz.";
  if (error.code === "email_not_confirmed")
    return "Hesabınızı etkinleştirmek için e-postanıza gelen onay bağlantısını açın.";
  if (error.status === 429 || error.code?.includes("rate_limit"))
    return "Çok fazla deneme yapıldı. Biraz bekleyip yeniden deneyin.";
  if (error.code === "weak_password" || error.code === "same_password")
    return "En az 8 karakterden oluşan farklı bir şifre seçin.";
  if (/network|fetch|timeout/i.test(error.message || ""))
    return "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip yeniden deneyin.";
  return error.message || "Giriş tamamlanamadı. Lütfen yeniden deneyin.";
}
