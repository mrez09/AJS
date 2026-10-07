import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function getImageSource(image) {
  if (image?.startsWith("/uploads/") && API_BASE_URL) {
    return `${API_BASE_URL.replace(/\/$/, "")}${image}`;
  }
  return image;
}

function getInitials(name) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "AJS"
  );
}

function CommodityImage({
  image,
  name,
  grade,
  className = "",
  fallbackClassName = "",
}) {
  const [failedImage, setFailedImage] = useState("");
  const imageSource = getImageSource(image);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-100 via-blue-100 to-slate-200 ${className}`}
    >
      <div className="absolute -right-8 -top-12 size-36 rounded-full border border-white/60" />
      <div className="absolute -bottom-12 -left-8 size-36 rounded-full border border-white/60" />
      <span
        className={`relative grid size-16 place-items-center rounded-2xl border border-white/70 bg-white/40 text-xl font-semibold tracking-wide text-[#16455d] shadow-sm backdrop-blur-sm ${fallbackClassName}`}
      >
        {getInitials(name)}
      </span>
      {imageSource && failedImage !== imageSource && (
        <img
          src={imageSource}
          alt={name || "Seafood commodity"}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailedImage(imageSource)}
        />
      )}
      {grade && (
        <span className="absolute left-4 top-4 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#174c62] backdrop-blur">
          {grade}
        </span>
      )}
    </div>
  );
}

export default CommodityImage;
