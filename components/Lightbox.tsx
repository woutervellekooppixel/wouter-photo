
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";

export type LightboxImage = {
  src: string;
  alt?: string;
  /** Optionele thumbnail (voor sneller tonen in fade) */
  thumb?: string;
};

type LightboxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Lijst met afbeeldingen */
  images: LightboxImage[];
  /** Huidige index in images (prop-gedreven, geen interne state) */
  index: number;
  /** Wijzig de huidige index */
  onIndexChange: (index: number) => void;

  /** Downloadknop tonen */
  enableDownload?: boolean;
  /** Eigen download handler (anders standaard link met download attribuut) */
  onDownload?: (current: LightboxImage, index: number) => void;

  /** Extra className op outer container */
  className?: string;
};

export function Lightbox({
  open,
  onOpenChange,
  images,
  index,
  onIndexChange,
  enableDownload = true,
  onDownload,
  className = "",
}: LightboxProps) {
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragDx = useRef(0);

  // Alleen renderen als we in de browser zitten (portal)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const goNext = () => {
    const nextIndex = (index + 1) % images.length;
    onIndexChange(nextIndex);
  };

  const goPrev = () => {
    const prevIndex = (index - 1 + images.length) % images.length;
    onIndexChange(prevIndex);
  };

  // Keyboard controls + focus — let op: afhankelijk van index/images.length
  // zodat de handler altijd de actuele index gebruikt (geen stale closure)
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);

    // Focus close button bij openen (eenvoudige focus trap)
    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);

    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, index, images.length, onOpenChange, onIndexChange]);

  // Preload naastgelegen images
  useEffect(() => {
    if (!open || images.length === 0) return;
    const next = images[(index + 1) % images.length]?.src;
    const prev = images[(index - 1 + images.length) % images.length]?.src;
    if (next) {
      const i = new Image();
      i.src = next;
    }
    if (prev) {
      const i = new Image();
      i.src = prev;
    }
  }, [open, index, images]);

  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onOpenChange(false);
    }
  };

  // Touch/drag swipe
  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragDx.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    dragDx.current = e.clientX - dragStartX.current;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    const dx = dragDx.current;
    const threshold = 50; // px
    if (dx > threshold) goPrev();
    else if (dx < -threshold) goNext();
  };

  if (!mounted || !open || images.length === 0) return null;

  const current = images[index];

  const content = (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Afbeelding viewer"
      className={`fixed inset-0 z-[100] bg-black/90 flex items-center justify-center ${className}`}
      onClick={onBackdropClick}
    >
      {/* Close button */}
      <button
        ref={closeBtnRef}
        aria-label="Sluiten"
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white focus:outline-none focus-visible:ring focus-visible:ring-white/40"
        onClick={() => onOpenChange(false)}
      >
        <X className="h-6 w-6" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/80 text-sm select-none">
        {index + 1} / {images.length}
      </div>

      {/* Prev/Next */}
      {images.length > 1 && (
        <>
          <button
            aria-label="Vorige"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white focus:outline-none focus-visible:ring focus-visible:ring-white/40"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button
            aria-label="Volgende"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white focus:outline-none focus-visible:ring focus-visible:ring-white/40"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        </>
      )}

      {/* Download */}
      {enableDownload && (
        <button
          aria-label="Download"
          className="absolute bottom-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white focus:outline-none focus-visible:ring focus-visible:ring-white/40"
          onClick={(e) => {
            e.stopPropagation();
            if (onDownload) {
              onDownload(current, index);
            } else {
              // Standaard: forceer download
              const a = document.createElement("a");
              a.href = current.src;
              a.download = current.alt || `image-${index + 1}`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
          }}
        >
          <Download className="h-6 w-6" />
        </button>
      )}

      {/* Image area */}
      <div
        className="relative w-[92vw] h-[84vh] max-w-[1600px] select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* afbeelding met object-contain */}
        <img
          src={current.src}
          alt={current.alt ?? ""}
          className="absolute inset-0 m-auto max-w-full max-h-full object-contain drop-shadow-lg transition-opacity duration-300"
          draggable={false}
        />
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
