import React from "react";
import { useAssets } from "../context/AssetContext";

/**
 * AssetImg — renders a CMS-managed image by its camelCase key.
 * Applies the focal point + zoom set in the CMS (/admin → Images),
 * using object-fit: cover + object-position + scale so any source
 * size always fills the layout slot neatly.
 */
const AssetImg = ({ k, className = "", style = {}, alt, ...rest }) => {
  const { byKey, ready } = useAssets();
  const asset = byKey[k] || {};
  const fx = asset.focal_x ?? 50;
  const fy = asset.focal_y ?? 50;
  const zoom = asset.zoom ?? 1;

  const focalStyle = {
    objectPosition: `${fx}% ${fy}%`,
    ...(zoom !== 1
      ? { transform: `scale(${zoom})`, transformOrigin: `${fx}% ${fy}%` }
      : {}),
  };

  // Wait for CMS data so the crop/zoom is applied from the first frame (no fallback-then-jump)
  if (!ready) return <span className={className} style={style} aria-hidden="true" />;

  return (
    <img
      src={asset.url}
      alt={alt || asset.alt || k}
      className={className}
      style={{ ...focalStyle, ...style }}
      loading={rest.loading || "lazy"}
      {...rest}
    />
  );
};

export default AssetImg;
