
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Download,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  FileText,
  File as FileIcon,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  Video,
  Music,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lightbox, LightboxImage } from "@/components/Lightbox";
import { formatBytes, formatDate, sortFilesChronological } from "@/lib/utils";

/** ====== Minimaal benodigde types (vervang door je projecttypes indien gewenst) ====== */
type UploadFile = {
  key: string;
  name: string;
  size: number;
  type?: string;
  takenAt?: string;
};

type UploadMetadata = {
  slug: string;
  title?: string;
  createdAt?: string;
  previewImageKey?: string;
  files: UploadFile[];
  ratingsEnabled?: boolean;
  ratings?: Record<string, boolean>;
};
/** ===================================================================================== */

export default function DownloadGallery({ metadata }: { metadata: UploadMetadata }) {
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Track mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind sm: 640px
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [loadingThumbnails, setLoadingThumbnails] = useState(true);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
  const [thumbnailsLoaded, setThumbnailsLoaded] = useState(0);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [ratings, setRatings] = useState<Record<string, boolean>>({});

  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [heroObjectPosition, setHeroObjectPosition] = useState<string>("50% 35%");

  // Fake loader percentage voor hero (kan gebruikt worden voor animaties)
  const [fakePercent, setFakePercent] = useState(0);

  const previewLoadedRef = useRef(previewLoaded);
  useEffect(() => {
    previewLoadedRef.current = previewLoaded;
  }, [previewLoaded]);

  useEffect(() => {
    if (!loadingThumbnails) {
      setFakePercent(100);
      return;
    }

    // Keep the timer at 0 until the hero image has actually loaded.
    if (!previewLoaded) {
      setFakePercent(0);
      return;
    }

    setFakePercent(0);
    const start = performance.now();
    let raf = 0 as unknown as number;
    const duration = 6000;
    const animate = () => {
      const elapsed = performance.now() - start;
      const t = Math.min(1, elapsed / duration);
      // Easing for a more premium / less linear feel
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const percent = Math.min(100, eased * 100);
      setFakePercent(percent);
      if (t < 1 && loadingThumbnails) {
        raf = requestAnimationFrame(animate) as unknown as number;
      }
    };
    raf = requestAnimationFrame(animate) as unknown as number;
    return () => cancelAnimationFrame(raf as unknown as number);
  }, [loadingThumbnails, previewLoaded]);
  // Houd overlay kort in DOM voor fade-out animatie
  useEffect(() => {
    if (loadingThumbnails) {
      setShowLoadingOverlay(true);
      return;
    }
    const t = window.setTimeout(() => setShowLoadingOverlay(false), 900);
    return () => window.clearTimeout(t);
  }, [loadingThumbnails]);

  // Helpers
  const shouldFilterFile = (filename: string) => {
    const name = filename.toLowerCase();
    return [".ds_store", ".xmp", "thumbs.db", "desktop.ini"].some((p) => name.includes(p)) || name.startsWith(".");
  };
  const isImage = (filename: string) => {
    const ext = filename.toLowerCase().split(".").pop();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic", "heif"].includes(ext || "");
  };

  // Filter zichtbare bestanden
  const visibleFiles = useMemo(
    () => sortFilesChronological(metadata.files).filter((f) => !shouldFilterFile(f.name)),
    [metadata.files]
  );
  const imageFiles = useMemo(() => visibleFiles.filter((f) => isImage(f.name)), [visibleFiles]);
  const otherFiles = useMemo(() => visibleFiles.filter((f) => !isImage(f.name)), [visibleFiles]);

  // API helper voor image url
  const getFullImageUrl = (key: string) => {
    return `/api/photos/by-key?key=${encodeURIComponent(key)}`;
  };

  const getThumbUrl = (key: string) => {
    // Serve real resized thumbnails (webp) to keep the page light.
    return `/api/thumbnail/${metadata.slug}?key=${encodeURIComponent(key)}&w=640`;
  };

  const getHeroUrl = (key: string) => {
    // Hero is full-bleed on most screens; use a much larger rendition than the grid thumbnails.
    // This avoids the hero looking blurry after selecting it in /admin.
    return `/api/thumbnail/${metadata.slug}?key=${encodeURIComponent(key)}&w=3840`;
  };

  // Thumbnails "opbouwen" (geen echte fetch nodig; URLs naar je API)
  useEffect(() => {
    if (!metadata || !metadata.files) return;
    const imgs = metadata.files.filter((f) => !shouldFilterFile(f.name) && isImage(f.name));
    if (imgs.length === 0) {
      setThumbnailUrls({});
      setLoadingThumbnails(false);
      setThumbnailsLoaded(0);
      return;
    }

    let cancelled = false;
    setPreviewLoaded(false);
    setLoadingThumbnails(true);
    setThumbnailsLoaded(0);
    const urls: Record<string, string> = {};
    let loaded = 0;

    // Hero/preview URL: keep separate so the grid can stay on small thumbnails.
    if (metadata.previewImageKey) setHeroUrl(getHeroUrl(metadata.previewImageKey));
    else setHeroUrl(null);

    const build = async () => {
      for (const file of imgs) {
        const url = getThumbUrl(file.key);
        urls[file.key] = url;
        loaded++;
        if (!cancelled) setThumbnailsLoaded(loaded);
      }
      if (!cancelled) setThumbnailUrls(urls);

      // Minimaal 6s overlay zichtbaar houden
      const minDelay = 6000;
      const start = Date.now();
      const finish = async () => {
        const elapsed = Date.now() - start;
        if (elapsed < minDelay) {
          await new Promise((res) => setTimeout(res, minDelay - elapsed));
        }

        // Don't dismiss the overlay until the hero image is loaded.
        // Safety: if the hero never loads, continue after a short grace period.
        const graceMs = 4000;
        const t0 = Date.now();
        while (!cancelled && !previewLoadedRef.current && Date.now() - t0 < graceMs) {
          await new Promise((res) => setTimeout(res, 75));
        }
        if (!cancelled) setLoadingThumbnails(false);
      };
      finish();
    };

    build();
    return () => {
      cancelled = true;
    };
  }, [metadata]);

  // Ratings laden
  useEffect(() => {
    if (metadata.ratings) setRatings(metadata.ratings);
  }, [metadata.ratings]);

  // Achtergrond (fallback) laden als geen preview
  useEffect(() => {
    if (metadata.previewImageKey) return;
    const checkBackground = async () => {
      try {
        const url = "/api/background/default-background";
        const resp = await fetch(url, { method: "HEAD" });
        if (resp.ok) {
          setBackgroundUrl(url);
          return;
        }
      } catch {
        // ignore
      }
      const localUrl = "/default-background.svg";
      setBackgroundUrl(localUrl);
    };
    checkBackground();
  }, [metadata.previewImageKey]);

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split(".").pop();

    if (["zip", "rar", "7z", "tar", "gz"].includes(ext || "")) {
      return <FileArchive className="h-5 w-5 text-purple-600 flex-shrink-0" />;
    }
    if (["js", "ts", "jsx", "tsx", "html", "css", "scss", "php", "py", "java", "c", "cpp", "json"].includes(ext || "")) {
      return <FileCode className="h-5 w-5 text-green-600 flex-shrink-0" />;
    }
    if (["pdf", "doc", "docx", "txt", "rtf", "odt"].includes(ext || "")) {
      return <FileText className="h-5 w-5 text-red-600 flex-shrink-0" />;
    }
    if (["xls", "xlsx", "csv", "ods"].includes(ext || "")) {
      return <FileSpreadsheet className="h-5 w-5 text-green-600 flex-shrink-0" />;
    }
    if (["mp4", "mov", "avi", "mkv", "wmv", "flv", "webm"].includes(ext || "")) {
      return <Video className="h-5 w-5 text-pink-600 flex-shrink-0" />;
    }
    if (["mp3", "wav", "flac", "aac", "ogg", "m4a"].includes(ext || "")) {
      return <Music className="h-5 w-5 text-blue-600 flex-shrink-0" />;
    }
    return <FileIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />;
  };

  const toggleSelectFile = (fileKey: string) => {
    setSelectedFiles((prev) => {
      const ns = new Set(prev);
      if (ns.has(fileKey)) ns.delete(fileKey);
      else ns.add(fileKey);
      return ns;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === imageFiles.length) setSelectedFiles(new Set());
    else setSelectedFiles(new Set(imageFiles.map((f) => f.key)));
  };

  const toggleRating = async (fileKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newRating = !ratings[fileKey];
    setRatings((prev) => ({ ...prev, [fileKey]: newRating }));
    try {
      await fetch(`/api/rate/${metadata.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey, rated: newRating }),
      });
    } catch (error) {
      console.error("Failed to save rating:", error);
      setRatings((prev) => ({ ...prev, [fileKey]: !newRating }));
    }
  };

  const downloadAll = async () => {
    setDownloading(true);
    setDownloadProgress(0);
    const progressInterval = setInterval(() => {
      setDownloadProgress((p) => {
        if (p >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return p + 5;
      });
    }, 150);
    try {
      const a = document.createElement("a");
      a.href = `/api/download/${metadata.slug}/all`;
      a.download = `${metadata.slug}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        setDownloadProgress(100);
        setTimeout(() => {
          clearInterval(progressInterval);
          setDownloading(false);
          setDownloadProgress(0);
        }, 500);
      }, 2000);
    } catch (error) {
      console.error("Download failed:", error);
      clearInterval(progressInterval);
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const downloadSingle = async (fileKey: string, fileName: string) => {
    setDownloadingFile(fileKey);
    try {
      const response = await fetch(`/api/download/${metadata.slug}/file?key=${encodeURIComponent(fileKey)}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloadingFile(null);
    }
  };

  const downloadSelected = async () => {
    if (selectedFiles.size === 0) return;
    setDownloading(true);
    setDownloadProgress(0);
    const progressInterval = setInterval(() => {
      setDownloadProgress((p) => {
        if (p >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return p + 5;
      });
    }, 150);

    try {
      if (selectedFiles.size === 1) {
        const fileKey = Array.from(selectedFiles)[0];
        const file = metadata.files.find((f) => f.key === fileKey);
        if (file) {
          const displayName = file.name.split("/").pop() || file.name;
          clearInterval(progressInterval);
          setDownloading(false);
          setDownloadProgress(0);
          await downloadSingle(file.key, displayName);
        }
      } else {
        const response = await fetch(`/api/download/${metadata.slug}/selected`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileKeys: Array.from(selectedFiles) }),
        });
        if (!response.ok) throw new Error("Download failed");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${metadata.slug}-selected.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setDownloadProgress(100);
        setTimeout(() => {
          clearInterval(progressInterval);
          setDownloading(false);
          setDownloadProgress(0);
        }, 500);
      }
    } catch (error) {
      console.error("Download failed:", error);
      clearInterval(progressInterval);
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const downloadFolder = async (folderPath: string) => {
    try {
      const response = await fetch(
        `/api/download/${metadata.slug}/folder?path=${encodeURIComponent(folderPath)}`
      );
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${folderPath}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Folder download failed:", error);
    }
  };

  // Groeperen per map
  const imagesByFolder = useMemo(() => {
    return imageFiles.reduce((acc, file) => {
      const parts = file.name.split("/");
      const folder = parts.length > 1 ? parts[0] : "Hoofd";
      if (!acc[folder]) acc[folder] = [];
      acc[folder].push(file);
      return acc;
    }, {} as Record<string, typeof imageFiles>);
  }, [imageFiles]);
  const imageFolders = Object.keys(imagesByFolder);
  const hasImageFolders = imageFolders.length > 1 || !imagesByFolder["Hoofd"];
  // Count "folders" including the root bucket ("Hoofd").
  // If there are images but no subfolders, we still show 1 folder.
  const folderCount = imageFiles.length === 0 ? 0 : imageFolders.length;

  const otherFilesByFolder = useMemo(() => {
    return otherFiles.reduce((acc, file) => {
      const parts = file.name.split("/");
      const folder = parts.length > 1 ? parts[0] : "Root";
      if (!acc[folder]) acc[folder] = [];
      acc[folder].push(file);
      return acc;
    }, {} as Record<string, typeof otherFiles>);
  }, [otherFiles]);
  const otherFileFolders = Object.keys(otherFilesByFolder);

  const toggleFolder = (folder: string) => {
    setCollapsedFolders((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  /** ===== Lightbox integratie ===== */

  // Volledige resolutie in Lightbox
  const lightboxImages: LightboxImage[] = useMemo(
    () =>
      imageFiles.map((f) => ({
        src: getFullImageUrl(f.key),
        alt: f.name.split("/").pop() || f.name,
        thumb: thumbnailUrls[f.key] || getThumbUrl(f.key),
      })),
    [imageFiles, thumbnailUrls]
  );

  // Map van fileKey -> index (handig bij klikken op thumb)
  const keyToIndex = useMemo(() => {
    const m = new Map<string, number>();
    imageFiles.forEach((f, idx) => m.set(f.key, idx));
    return m;
  }, [imageFiles]);

  const openLightboxAt = (fileKey: string) => {
    const idx = keyToIndex.get(fileKey);
    if (idx == null) return;
    setCurrentIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen relative bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Fullscreen loading overlay */}
        {showLoadingOverlay && (
          <div
            className="fixed inset-0 z-[100] transition-opacity duration-1000"
            style={{ opacity: loadingThumbnails ? 1 : 0 }}
          >
            {/* Fullscreen hero image */}
            <div className="absolute inset-0 bg-gray-900">
              {metadata.previewImageKey && heroUrl ? (
                <Image
                  src={heroUrl}
                  alt="Hero preview"
                  fill
                  className="object-cover animate-in fade-in duration-700"
                  style={{ objectPosition: heroObjectPosition }}
                  sizes="100vw"
                  priority
                  onLoadingComplete={(img) => {
                    setPreviewLoaded(true);
                    // Keep 'spread' but bias crop slightly upwards for portraits
                    const isPortrait = img.naturalHeight > img.naturalWidth;
                    setHeroObjectPosition(isPortrait ? "50% 25%" : "50% 35%");
                  }}
                  onError={() => setPreviewLoaded(true)}
                  placeholder="empty"
                  unoptimized={heroUrl?.startsWith("http")}
                />
              ) : backgroundUrl ? (
                <Image
                  src={backgroundUrl}
                  alt="Loading preview"
                  fill
                  className="object-cover animate-in fade-in duration-700"
                  style={{ objectPosition: heroObjectPosition }}
                  sizes="100vw"
                  priority
                  onLoadingComplete={(img) => {
                    setPreviewLoaded(true);
                    const isPortrait = img.naturalHeight > img.naturalWidth;
                    setHeroObjectPosition(isPortrait ? "50% 25%" : "50% 35%");
                  }}
                  onError={() => setPreviewLoaded(true)}
                  placeholder="empty"
                  unoptimized={backgroundUrl?.startsWith("http")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 bg-gray-700 rounded-full opacity-30 animate-pulse" />
                    <ImageIcon className="absolute inset-0 m-auto h-16 w-16 text-white/40" />
                  </div>
                </div>
              )}
            </div>

            {/* Subtle label */}
            <div className="absolute left-5 top-5 sm:left-6 sm:top-6">
              <p className="text-[11px] tracking-[0.18em] text-white/70">WOUTER.DOWNLOAD</p>
            </div>

            {/* Center logo/wordmark with fill animation */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Base wordmark (subtle) */}
                <div className="select-none text-2xl sm:text-3xl md:text-4xl tracking-tight text-white/25" aria-hidden>
                  <span className="font-bold">WOUTER</span>
                  <span className="font-bold">.</span>
                  <span className="font-normal">DOWNLOAD</span>
                </div>

                {/* Fill (reveals from left to right) */}
                <div className="absolute inset-0 overflow-hidden" aria-hidden>
                  <div className="absolute left-0 top-0 bottom-0 overflow-hidden" style={{ width: `${fakePercent}%` }}>
                    <div className="select-none text-2xl sm:text-3xl md:text-4xl tracking-tight text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.35)]">
                      <span className="font-bold">WOUTER</span>
                      <span className="font-bold">.</span>
                      <span className="font-normal">DOWNLOAD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thin progress line at the bottom */}
            <div className="absolute left-0 right-0 bottom-0 p-4 sm:p-5">
              <div className="h-[3px] w-full rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full w-full origin-left rounded-full bg-white will-change-transform"
                  style={{ transform: `scaleX(${fakePercent / 100})` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-white/60">
                <span>
                  {Math.min(thumbnailsLoaded, imageFiles.length)} / {imageFiles.length}
                </span>
                <span className="tabular-nums">{Math.round(fakePercent)}%</span>
              </div>
            </div>
          </div>
        )}

        <div
          className={`container mx-auto p-6 max-w-6xl transition-opacity duration-1000 ${
            loadingThumbnails ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {/* Titel + stats */}
          <div className="mb-8 mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] text-left">
              {metadata.title || metadata.slug.replace(/-/g, " ")}
            </h1>

            <div className="text-xs sm:text-sm text-gray-600 sm:text-right whitespace-nowrap">
              <span>
                {metadata.createdAt ? formatDate(new Date(metadata.createdAt)) : ""}
              </span>
              <span className="mx-2 text-gray-400">|</span>
              <span>
                {imageFiles.length} foto{imageFiles.length === 1 ? "" : "'s"}
              </span>
              <span className="mx-2 text-gray-400">|</span>
              <span>
                {folderCount} map{folderCount === 1 ? "" : "pen"}
              </span>
            </div>
          </div>

          {/* Foto’s */}
          {imageFiles.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                {!downloading ? (
                  <Button
                    onClick={isSelectMode && selectedFiles.size > 0 ? downloadSelected : downloadAll}
                    variant="outline"
                    size="sm"
                    disabled={isSelectMode && selectedFiles.size === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isSelectMode && selectedFiles.size > 0 ? (
                      <>
                        <span className="hidden sm:inline">Download {selectedFiles.size}</span>
                        <span className="sm:hidden">Download {selectedFiles.size}</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Download All</span>
                        <span className="sm:hidden">Download</span>
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="relative w-40 h-9 bg-[hsl(var(--muted))] rounded-md overflow-hidden border border-[hsl(var(--border))]">
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-300 dark:to-gray-600 transition-all duration-300 ease-out flex items-center justify-center"
                      style={{ width: `${downloadProgress}%` }}
                    >
                      {downloadProgress > 10 && (
                        <span className="text-white dark:text-black text-xs font-semibold">{downloadProgress}%</span>
                      )}
                    </div>
                    {downloadProgress <= 10 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-300 text-xs font-semibold">
                          {downloadProgress}%
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <Button
                  onClick={() => {
                    setIsSelectMode(!isSelectMode);
                    if (isSelectMode) setSelectedFiles(new Set());
                  }}
                  variant="outline"
                  size="sm"
                >
                  {isSelectMode ? "Cancel" : "Select"}
                </Button>
              </div>

              {isSelectMode && (
                <div className="mb-4 flex items-center gap-4">
                  <Button onClick={toggleSelectAll} variant="outline" size="sm">
                    {selectedFiles.size === imageFiles.length ? "Deselect all" : "Select all"}
                  </Button>
                  {selectedFiles.size > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedFiles.size} photo{selectedFiles.size !== 1 ? "s" : ""} selected
                    </span>
                  )}
                </div>
              )}

              {imageFolders.map((folder) => (
                <div key={folder} className="mb-8">
                  {hasImageFolders && (
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      {folder}
                      <span className="text-sm font-normal text-gray-500">({imagesByFolder[folder].length})</span>
                    </h3>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagesByFolder[folder].map((file, index) => {
                      const displayName = file.name.split("/").pop() || file.name;
                      const isSelected = selectedFiles.has(file.key);
                      return (
                        <div
                          key={`${file.key}-${index}`}
                          className="group relative bg-[hsl(var(--card))] rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
                        >
                          {/* Checkbox */}
                          {isSelectMode && (
                            <div className="absolute top-2 left-2 z-10">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectFile(file.key)}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </div>
                          )}

                          {/* Ster-rating */}
                          {!isSelectMode && metadata.ratingsEnabled && (
                            <button
                              onClick={(e) => toggleRating(file.key, e)}
                              className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-all duration-200 group/star"
                              title="Favorite"
                              aria-label="Toggle favorite"
                            >
                              <Star
                                className={`h-4 w-4 transition-all duration-200 ${
                                  ratings[file.key]
                                    ? "fill-white text-white"
                                    : "text-white group-hover/star:fill-white/50"
                                }`}
                              />
                            </button>
                          )}

                          {/* Thumbnail */}
                          <div
                            className={`aspect-square bg-[hsl(var(--muted))] flex items-center justify-center overflow-hidden relative select-none ${
                              isSelectMode ? "cursor-pointer" : "cursor-zoom-in"
                            }`}
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                            onClick={() => {
                              if (isSelectMode) {
                                toggleSelectFile(file.key);
                              } else {
                                openLightboxAt(file.key);
                              }
                            }}
                          >
                            {thumbnailUrls[file.key] ? (
                              <Image
                                src={thumbnailUrls[file.key]}
                                alt={file.name}
                                fill
                                className="object-cover pointer-events-none transition-transform duration-300 group-hover:scale-110"
                                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                loading="lazy"
                                quality={75}
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                              />
                            ) : (
                              <ImageIcon className="h-12 w-12 text-gray-300" />
                            )}

                            {/* Hover overlay met file info (altijd donker, geen dark: overrides) */}
                            {!isSelectMode && (
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                                <p className="text-white text-sm font-medium truncate">{displayName}</p>
                                <p className="text-white/80 text-xs">{formatBytes(file.size)}</p>
                              </div>
                            )}
                          </div>

                          {/* Direct download knop (thumb) */}
                          {!isSelectMode && (
                            <button
                              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm transition-all duration-200 group/download transform hover:scale-110 focus:scale-110 active:scale-95"
                              title="Download image"
                              aria-label="Download image"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadSingle(file.key, displayName);
                              }}
                              disabled={downloadingFile === file.key}
                            >
                              <Download className="h-5 w-5 text-white drop-shadow" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bestanden-sectie */}
          {otherFiles.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-6 flex items-center gap-2">
                📁 Files
                <span className="text-sm font-normal text-gray-500">({otherFiles.length})</span>
              </h2>

              <div className="space-y-4">
                {otherFileFolders.map((folder) => (
                  <div
                    key={folder}
                    className="bg-[hsl(var(--card))] rounded-lg shadow-sm border border-[hsl(var(--border))]"
                  >
                    <div className="p-4 flex items-center justify-between border-b border-[hsl(var(--border))]">
                      <button
                        onClick={() => toggleFolder(folder)}
                        className="flex items-center gap-3 flex-1 text-left hover:bg-gray-50 -m-2 p-2 rounded transition-colors"
                      >
                        {collapsedFolders[folder] ? (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-[hsl(var(--foreground))]">{folder}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {otherFilesByFolder[folder].length} file
                            {otherFilesByFolder[folder].length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </button>
                      <Button size="sm" variant="outline" className="ml-4" onClick={() => downloadFolder(folder)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download folder
                      </Button>
                    </div>

                    {!collapsedFolders[folder] && (
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {otherFilesByFolder[folder].map((file, index) => {
                          const displayName = file.name.split("/").pop() || file.name;
                          const ext = displayName.split(".").pop()?.toLowerCase();
                          return (
                            <div
                              key={`${file.key}-${index}`}
                              className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {getFileIcon(displayName)}
                                <div className="min-w-0 flex-1">
                                  <p
                                    className="text-sm font-medium text-[hsl(var(--foreground))] truncate"
                                    title={displayName}
                                  >
                                    {displayName}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatBytes(file.size)} {ext && `• ${ext.toUpperCase()}`}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => downloadSingle(file.key, displayName)}
                                disabled={downloadingFile === file.key}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
            <p>© Wouter.Photo</p>
          </div>

          {/* Lightbox mount */}
          {lightboxOpen && lightboxImages.length > 0 && (
            <Lightbox
              open={lightboxOpen}
              onOpenChange={setLightboxOpen}
              images={lightboxImages}
              index={currentIndex}
              onIndexChange={setCurrentIndex}
              enableDownload
              onDownload={(current, idx) => {
                // Download via raw URL (of pas aan naar je eigen API)
                const file = imageFiles[idx];
                const name = (file?.name.split("/").pop() || `image-${idx + 1}`).toString();
                const a = document.createElement("a");
                a.href = current.src;
                a.download = name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
