import { useEffect, useState } from "react";
import {
  pickStockImage,
  categoryEmoji,
  categoryTint,
} from "../data/categoryImages";

/**
 * Renders a product image, preferring the merchant's uploaded image and
 * falling back to a category-appropriate Unsplash photo. If the URL fails
 * to load (network / 404), we render a tinted box with the category emoji
 * so the buyer never sees a broken-image icon.
 */
export function ProductImage({
  product,
  className = "",
  alt = "",
  emojiSize = "text-5xl",
}) {
  const uploaded = product?.images?.[0] ?? product?.image ?? null;
  const initialSrc = uploaded || pickStockImage(product);

  const [src, setSrc] = useState(initialSrc);
  const [failed, setFailed] = useState(false);

  // If the product (and therefore the chosen src) changes between renders,
  // re-sync local state so we don't keep a stale fallback.
  useEffect(() => {
    setSrc(initialSrc);
    setFailed(false);
  }, [initialSrc]);

  const handleError = () => {
    if (uploaded && src === uploaded) {
      // Uploaded image broke — try the category stock image next.
      const stock = pickStockImage(product);
      if (stock && stock !== src) {
        setSrc(stock);
        return;
      }
    }
    setFailed(true);
  };

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center ${categoryTint(
          product?.category
        )} ${className}`}
        aria-label={alt || product?.name || "product"}
      >
        <span className={emojiSize} role="img" aria-hidden>
          {categoryEmoji(product?.category)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || product?.name || ""}
      onError={handleError}
      loading="lazy"
      className={className}
    />
  );
}
