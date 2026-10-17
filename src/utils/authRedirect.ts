export function webAuthRedirect(
  origin: string,
  basePath: string,
  reset = false,
) {
  const base = "/" + basePath.split("/").filter(Boolean).join("/");
  return new URL((base === "/" ? "" : base) + (reset ? "/reset/" : "/"), origin)
    .href;
}
