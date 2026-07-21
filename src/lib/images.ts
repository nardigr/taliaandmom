export function getProductImageUrl(path: string): string {
  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("/api/uploads/") ||
    path.startsWith("/uploads/")
  ) {
    return path;
  }

  // Already a site-absolute path (e.g. CMS carousel URLs)
  if (path.startsWith("/")) {
    return path;
  }

  return `/api/uploads/${path.replace(/^\/+/, "")}`;
}

export function isExternalImage(path: string): boolean {
  return path.startsWith("http://") || path.startsWith("https://");
}
