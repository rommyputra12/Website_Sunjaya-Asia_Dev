// Public media is served through the Cloudflare Worker CDN: {CDN}/{bucket}/{path}
const CDN = (import.meta.env.VITE_CDN_URL || "").replace(/\/+$/, "");
const SUPABASE_PUBLIC = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/i;

export const getPublicImageUrl = (bucket, path) =>
  `${CDN}/${bucket}/${String(path).replace(/^\/+/, "")}`;

// srcset from backend-generated variants (meta._variants) + the original; null when none exist
export const buildSrcSet = (asset) => {
  const vs = asset?.meta?._variants;
  if (!vs?.length) return undefined;
  const parts = vs.map((v) => `${toCdnUrl(v.url)} ${v.w}w`);
  const top = Math.max(...vs.map((v) => v.w));
  if (asset.width && asset.width > top && top < 2560) parts.push(`${toCdnUrl(asset.url)} ${asset.width}w`);
  return parts.join(", ");
};

// Smallest variant at least `min` px wide (falls back to the original)
export const variantUrl = (asset, min) => {
  const vs = [...(asset?.meta?._variants || [])].sort((a, b) => a.w - b.w);
  const v = vs.find((x) => x.w >= min) || vs[vs.length - 1];
  return toCdnUrl(v?.url || asset?.url);
};

// Rewrites a stored Supabase public URL to its CDN equivalent; other URLs pass through unchanged
export const toCdnUrl = (url) => {
  if (!url || !CDN) return url;
  const m = String(url).match(SUPABASE_PUBLIC);
  return m ? getPublicImageUrl(m[1], m[2]) : url;
};
