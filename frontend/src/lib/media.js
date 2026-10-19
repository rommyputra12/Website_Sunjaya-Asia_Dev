// Public media is served through the Cloudflare Worker CDN: {CDN}/{bucket}/{path}
const CDN = (import.meta.env.VITE_CDN_URL || "").replace(/\/+$/, "");
const SUPABASE_PUBLIC = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/i;

export const getPublicImageUrl = (bucket, path) =>
  `${CDN}/${bucket}/${String(path).replace(/^\/+/, "")}`;

// Rewrites a stored Supabase public URL to its CDN equivalent; other URLs pass through unchanged
export const toCdnUrl = (url) => {
  if (!url || !CDN) return url;
  const m = String(url).match(SUPABASE_PUBLIC);
  return m ? getPublicImageUrl(m[1], m[2]) : url;
};
