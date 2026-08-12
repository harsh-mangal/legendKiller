import { useState } from "react";
import { ImageOff } from "lucide-react";

export default function ProductImage({ src, alt, className = "", fallbackClassName = "", loading = "lazy" }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`${alt || "Product"} image unavailable`}
        className={`flex items-center justify-center bg-slate-100 text-slate-400 ${fallbackClassName || className}`}
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center text-xs font-medium">
          <ImageOff size={22} aria-hidden="true" />
          <span>Image unavailable</span>
        </div>
      </div>
    );
  }

  return <img src={src} alt={alt || "Product"} loading={loading} onError={() => setFailed(true)} className={className} />;
}
