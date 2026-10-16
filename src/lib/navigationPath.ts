export function navigationSection(path: string) {
  const normalized = path === "/" ? path : path.replace(/\/+$/, "");
  if (
    normalized === "/waitlist" ||
    normalized.startsWith("/projects/ahutong/")
  ) {
    return "/projects/ahutong";
  }
  return normalized;
}
