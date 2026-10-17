export function webAuthRedirect(
  origin: string,
  basePath: string,
  reset = false,
) {
  const base = "/" + basePath.split("/").filter(Boolean).join("/");
  return new URL((base === "/" ? "" : base) + (reset ? "/reset/" : "/"), origin)
    .href;
}

export function isWebRecoveryUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    // Supabase can consume the recovery fragment before fonts finish loading
    // and AppProvider subscribes. The callback path survives that and reloads.
    return (
      /\/reset\/?$/.test(url.pathname) ||
      new URLSearchParams(url.hash.slice(1)).get("type") === "recovery"
    );
  } catch {
    return false;
  }
}
