
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Download,
  Image as ImageIcon,
  ChevronDown,
  FileText,
  File as FileIcon,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  Video,
  Music,
  AlertCircle,
  X,
} from "lucide-react";
import { Lightbox, LightboxImage } from "@/components/Lightbox";
import { formatBytes, sortFilesChronological, shouldFilterFile, isImageFile } from "@/lib/utils";

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
  useDefaultHero?: boolean;
};

// Blokkeer opslaan via long-press (iOS) en slepen; downloads lopen altijd
// via de downloadknoppen zodat de klant het échte bestand krijgt i.p.v.
// een verkleinde preview.
const NO_SAVE_STYLE = {
  WebkitTouchCallout: "none",
  WebkitUserSelect: "none",
  userSelect: "none",
} as React.CSSProperties;

export default function DownloadGallery({ metadata, expiresAt }: { metadata: UploadMetadata; expiresAt?: string }) {
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Per-thumbnail aspect ratio (width / height); tegels behouden hun verhouding.
  const [thumbAspectRatios, setThumbAspectRatios] = useState<Record<string, number>>({});

  const [downloading, setDownloading] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const [loadingThumbnails, setLoadingThumbnails] = useState(true);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
  const [thumbnailsLoaded, setThumbnailsLoaded] = useState(0);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [heroKey, setHeroKey] = useState<string | null>(null);
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [heroObjectPosition, setHeroObjectPosition] = useState<string>("50% 35%");

  // Sticky actiebalk zodra de cover-hero uit beeld is
  const [showBar, setShowBar] = useState(false);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const bottom = heroSectionRef.current?.getBoundingClientRect().bottom ?? 0;
      setShowBar(bottom < 56);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fake loader percentage voor de intro (bewust behouden)
  const [fakePercent, setFakePercent] = useState(0);

  const introCompletedRef = useRef(false);

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
      if (!introCompletedRef.current) {
        setShowLoadingOverlay(true);
      }
      return;
    }
    introCompletedRef.current = true;
    const t = window.setTimeout(() => setShowLoadingOverlay(false), 900);
    return () => window.clearTimeout(t);
  }, [loadingThumbnails]);

  // Filter zichtbare bestanden
  const visibleFiles = useMemo(
    () => sortFilesChronological(metadata.files).filter((f) => !shouldFilterFile(f.name)),
    [metadata.files]
  );
  // Fotofunctie uit (useDefaultHero): álle bestanden als gewone bestanden tonen.
  const imageFiles = useMemo(
    () => (metadata.useDefaultHero ? [] : visibleFiles.filter((f) => isImageFile(f.name))),
    [visibleFiles, metadata.useDefaultHero]
  );
  const otherFiles = useMemo(
    () => (metadata.useDefaultHero ? visibleFiles : visibleFiles.filter((f) => !isImageFile(f.name))),
    [visibleFiles, metadata.useDefaultHero]
  );
  const totalSize = useMemo(() => visibleFiles.reduce((sum, f) => sum + (f.size || 0), 0), [visibleFiles]);

  const ROOT_FILES_FOLDER = "__ROOT__";

  // Al verkleind/geoptimaliseerd door onze eigen API — niet nóg eens door
  // Vercel Image Optimization halen.
  const isPreOptimizedApiImage = (src?: string | null) => {
    if (!src) return false;
    return src.startsWith("/api/thumbnail/");
  };

  const getThumbUrl = (key: string) => {
    return `/api/thumbnail/${metadata.slug}?key=${encodeURIComponent(key)}&w=640`;
  };

  const getLightboxUrl = (key: string) => {
    // Bewust een verkleinde webp (géén origineel) — wie dit opslaat heeft
    // hooguit een preview. Het origineel is alleen via de downloadknop
    // bereikbaar. w moet < 2000 blijven (daarboven redirect naar origineel).
    return `/api/thumbnail/${metadata.slug}?key=${encodeURIComponent(key)}&w=1920`;
  };

  const getHeroUrl = (key: string) => {
    return `/api/thumbnail/${metadata.slug}?key=${encodeURIComponent(key)}&w=2560&v=3`;
  };

  const probeImageSize = (src: string, timeoutMs = 2500) => {
    return new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new window.Image();
      let done = false;
      const t = window.setTimeout(() => {
        if (done) return;
        done = true;
        reject(new Error("probe timeout"));
      }, timeoutMs);

      img.onload = () => {
        if (done) return;
        done = true;
        window.clearTimeout(t);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        if (done) return;
        done = true;
        window.clearTimeout(t);
        reject(new Error("probe error"));
      };

      img.src = src;
    });
  };

  // Auto-choose hero if admin hasn't picked one: eerste ~3:2 foto wint.
  useEffect(() => {
    let cancelled = false;

    if (metadata.useDefaultHero) {
      setHeroKey(null);
      setHeroUrl(null);
      return () => {
        cancelled = true;
      };
    }

    const imgs = sortFilesChronological(metadata.files)
      .filter((f) => !shouldFilterFile(f.name) && isImageFile(f.name))
      .map((f) => f.key);

    if (metadata.previewImageKey) {
      setHeroKey(metadata.previewImageKey);
      setHeroUrl(getHeroUrl(metadata.previewImageKey));
      return () => {
        cancelled = true;
      };
    }

    if (imgs.length === 0) {
      setHeroKey(null);
      setHeroUrl(null);
      return () => {
        cancelled = true;
      };
    }

    const fallbackKey = imgs[0];
    setHeroKey(fallbackKey);
    setHeroUrl(getHeroUrl(fallbackKey));

    const tolerance = 0.03;
    const isClose = (value: number, target: number) => Math.abs(value - target) <= tolerance;

    (async () => {
      try {
        let firstPortraitMatch: string | null = null;
        for (const key of imgs) {
          if (cancelled) return;
          const src = `${getThumbUrl(key)}&probe=1`;
          const { width, height } = await probeImageSize(src);
          if (!width || !height) continue;
          const r = width / height;

          if (isClose(r, 3 / 2)) {
            if (!cancelled) {
              setHeroKey(key);
              setHeroUrl(getHeroUrl(key));
            }
            return;
          }

          if (!firstPortraitMatch && isClose(r, 2 / 3)) {
            firstPortraitMatch = key;
          }
        }

        if (firstPortraitMatch && !cancelled) {
          setHeroKey(firstPortraitMatch);
          setHeroUrl(getHeroUrl(firstPortraitMatch));
        }
      } catch {
        // Ignore probe failures; fallbackKey already set.
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata.slug, metadata.previewImageKey, metadata.files, metadata.useDefaultHero]);

  // Thumbnails opbouwen + intro-timing (6s vanaf geladen hero — bewust zo)
  useEffect(() => {
    if (!metadata || !metadata.files) return;
    const imgs = metadata.useDefaultHero
      ? []
      : metadata.files.filter((f) => !shouldFilterFile(f.name) && isImageFile(f.name));
    if (imgs.length === 0) {
      setThumbnailUrls({});
      setThumbnailsLoaded(0);

      const allVisible = metadata.files.filter((f) => !shouldFilterFile(f.name));
      if (allVisible.length === 0) {
        setPreviewLoaded(true);
        setLoadingThumbnails(false);
        return () => {};
      }

      setPreviewLoaded(false);
      setLoadingThumbnails(true);

      let cancelled = false;
      (async () => {
        const graceMs = 5000;
        const t0 = Date.now();
        while (!cancelled && !previewLoadedRef.current && Date.now() - t0 < graceMs) {
          await new Promise((res) => setTimeout(res, 75));
        }
        const minDelay = 6000;
        await new Promise((res) => setTimeout(res, minDelay));
        if (!cancelled) setLoadingThumbnails(false);
      })();

      return () => {
        cancelled = true;
      };
    }

    let cancelled = false;
    setPreviewLoaded(false);
    setLoadingThumbnails(true);
    setThumbnailsLoaded(0);
    const urls: Record<string, string> = {};
    let loaded = 0;

    const build = async () => {
      for (const file of imgs) {
        const url = getThumbUrl(file.key);
        urls[file.key] = url;
        loaded++;
        if (!cancelled) setThumbnailsLoaded(loaded);
      }
      if (!cancelled) setThumbnailUrls(urls);

      const finish = async () => {
        const graceMs = 4000;
        const t0 = Date.now();
        while (!cancelled && !previewLoadedRef.current && Date.now() - t0 < graceMs) {
          await new Promise((res) => setTimeout(res, 75));
        }

        const minDelay = 6000;
        await new Promise((res) => setTimeout(res, minDelay));
        if (!cancelled) setLoadingThumbnails(false);
      };
      finish();
    };

    build();
    return () => {
      cancelled = true;
    };
  }, [metadata]);

  // Achtergrond (fallback) laden als geen hero-foto
  useEffect(() => {
    if (heroKey) return;
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
      setBackgroundUrl("/default-background.svg");
    };
    checkBackground();
  }, [heroKey]);

  // Vervaldatum: rustige vaste tekst; urgentie via de banner.
  const expiryInfo = useMemo(() => {
    if (!expiresAt) return null;
    const expires = new Date(expiresAt);
    if (!Number.isFinite(expires.getTime())) return null;
    const msLeft = expires.getTime() - Date.now();
    const hoursLeft = msLeft / (1000 * 60 * 60);
    const daysLeft = Math.ceil(hoursLeft / 24);
    return { expires, hoursLeft, daysLeft };
  }, [expiresAt]);

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split(".").pop();
    const cls = "h-5 w-5 flex-shrink-0 text-neutral-400 dark:text-neutral-500";
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext || "")) return <FileArchive className={cls} />;
    if (["js", "ts", "jsx", "tsx", "html", "css", "scss", "php", "py", "java", "c", "cpp", "json"].includes(ext || ""))
      return <FileCode className={cls} />;
    if (["pdf", "doc", "docx", "txt", "rtf", "odt"].includes(ext || "")) return <FileText className={cls} />;
    if (["xls", "xlsx", "csv", "ods"].includes(ext || "")) return <FileSpreadsheet className={cls} />;
    if (["mp4", "mov", "avi", "mkv", "wmv", "flv", "webm"].includes(ext || "")) return <Video className={cls} />;
    if (["mp3", "wav", "flac", "aac", "ogg", "m4a"].includes(ext || "")) return <Music className={cls} />;
    return <FileIcon className={cls} />;
  };

  const triggerDownloadAnchor = (href: string, downloadName?: string) => {
    const a = document.createElement("a");
    a.href = href;
    if (downloadName) a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Vraagt de downloadroute eerst om JSON (zelfde origin, dus fouten zijn
  // leesbaar) en navigeert daarna pas naar de echte download-URL.
  const requestManagedDownload = async (apiPath: string, downloadName?: string): Promise<boolean> => {
    try {
      const sep = apiPath.includes("?") ? "&" : "?";
      const res = await fetch(`${apiPath}${sep}mode=json`);
      if (res.status === 429) {
        const data = await res.json().catch(() => ({} as any));
        setDownloadError(`Too many downloads. Please wait ${data.retryAfter || 60} seconds and try again.`);
        return false;
      }
      if (res.status === 202) {
        setDownloadError("Your ZIP is being prepared — please try again in a few minutes.");
        return false;
      }
      if (res.status === 410) {
        setDownloadError("This download link has expired.");
        return false;
      }
      if (!res.ok) {
        setDownloadError("Download failed. Please try again.");
        return false;
      }
      const data = await res.json().catch(() => ({} as any));
      if (data?.url) {
        triggerDownloadAnchor(data.url, downloadName);
        return true;
      }
      if (data?.stream) {
        triggerDownloadAnchor(`${apiPath}${sep}skipcount=1`, downloadName);
        return true;
      }
      setDownloadError("Download failed. Please try again.");
      return false;
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadError("Download failed. Please try again.");
      return false;
    }
  };

  // Wachtrij voor losse downloads: snelle klikken één voor één afhandelen.
  const downloadQueueRef = useRef<Promise<void>>(Promise.resolve());
  const enqueueDownload = (fn: () => Promise<void>) => {
    downloadQueueRef.current = downloadQueueRef.current
      .then(fn)
      .then(() => new Promise<void>((r) => setTimeout(r, 600)))
      .catch(() => {});
  };

  // Root-foto's ("Main") hebben geen map-pad in R2; die map-download loopt
  // via de selectie-zip-route. Boven deze grens verwijzen we naar Download all.
  const MAX_SELECTION_ZIP_BYTES = 800 * 1024 * 1024;

  const downloadKeysAsZip = async (fileKeys: string[], zipFileName: string) => {
    if (!fileKeys || fileKeys.length === 0) return;
    const totalBytes = fileKeys.reduce((acc, key) => {
      const f = metadata.files.find((mf) => mf.key === key);
      return acc + (f?.size || 0);
    }, 0);
    if (totalBytes > MAX_SELECTION_ZIP_BYTES) {
      setDownloadError("This folder is too large to zip in the browser — please use Download all instead.");
      return;
    }
    setDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch(`/api/download/${metadata.slug}/selected`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKeys }),
      });

      if (response.status === 429) {
        const data = await response.json().catch(() => ({}));
        const wait = data.retryAfter || 60;
        setDownloadError(`Too many downloads. Please wait ${wait} seconds before trying again.`);
        setDownloading(false);
        return;
      }
      if (!response.ok) {
        setDownloadError("Download failed. Please try again.");
        setDownloading(false);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = zipFileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloading(false);
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadError("Download failed. Please try again.");
      setDownloading(false);
    }
  };

  const downloadAll = () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadError(null);

    requestManagedDownload(`/api/download/${metadata.slug}/all`, `${metadata.slug}.zip`).then((started) => {
      if (!started) {
        setDownloading(false);
        return;
      }
      // Browser neemt het over; knop na korte tijd weer vrijgeven.
      setTimeout(() => setDownloading(false), 2500);
    });
  };

  const downloadSingle = async (fileKey: string, fileName: string) => {
    if (downloadingFile === fileKey) return;
    setDownloadingFile(fileKey);
    try {
      enqueueDownload(async () => {
        await requestManagedDownload(
          `/api/download/${metadata.slug}/file?key=${encodeURIComponent(fileKey)}`,
          fileName
        );
      });
    } finally {
      window.setTimeout(() => setDownloadingFile(null), 800);
    }
  };

  const downloadFolder = async (folderPath: string) => {
    setDownloadError(null);
    await requestManagedDownload(
      `/api/download/${metadata.slug}/folder?path=${encodeURIComponent(folderPath)}`,
      `${folderPath.replace(/[^a-zA-Z0-9-_]/g, "-")}.zip`
    );
  };

  // Groeperen per map
  const imagesByFolder = useMemo(() => {
    return imageFiles.reduce((acc, file) => {
      const parts = file.name.split("/");
      const folder = parts.length > 1 ? parts[0] : "Main";
      if (!acc[folder]) acc[folder] = [];
      acc[folder].push(file);
      return acc;
    }, {} as Record<string, typeof imageFiles>);
  }, [imageFiles]);
  const imageFolders = Object.keys(imagesByFolder);
  const hasImageFolders = imageFolders.length > 1 || !imagesByFolder["Main"];

  const otherFilesByFolder = useMemo(() => {
    return otherFiles.reduce((acc, file) => {
      const parts = file.name.split("/");
      const folder = parts.length > 1 ? parts[0] : ROOT_FILES_FOLDER;
      if (!acc[folder]) acc[folder] = [];
      acc[folder].push(file);
      return acc;
    }, {} as Record<string, typeof otherFiles>);
  }, [otherFiles]);
  const otherFileFolders = useMemo(() => {
    const folders = Object.keys(otherFilesByFolder);
    if (!folders.includes(ROOT_FILES_FOLDER)) return folders;
    return [ROOT_FILES_FOLDER, ...folders.filter((f) => f !== ROOT_FILES_FOLDER)];
  }, [otherFilesByFolder]);

  /** ===== Lightbox integratie ===== */

  const lightboxImages: LightboxImage[] = useMemo(
    () =>
      imageFiles.map((f) => ({
        src: getLightboxUrl(f.key),
        alt: f.name.split("/").pop() || f.name,
        thumb: thumbnailUrls[f.key] || getThumbUrl(f.key),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [imageFiles, thumbnailUrls]
  );

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

  const statsLine = [
    imageFiles.length > 0 ? `${imageFiles.length} photo${imageFiles.length === 1 ? "" : "s"}` : null,
    otherFiles.length > 0 ? `${otherFiles.length} file${otherFiles.length === 1 ? "" : "s"}` : null,
    totalSize > 0 ? formatBytes(totalSize) : null,
    expiryInfo
      ? `Available until ${expiryInfo.expires.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
      : null,
  ].filter(Boolean);

  const title = metadata.title || metadata.slug.replace(/-/g, " ");

  const downloadAllButton = (compact = false) => (
    <button
      onClick={downloadAll}
      disabled={downloading || visibleFiles.length === 0}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-full transition-opacity disabled:opacity-60 ${
        compact
          ? "h-9 px-4 text-sm bg-black text-white dark:bg-white dark:text-black hover:opacity-85"
          : "h-11 px-6 bg-white text-black hover:bg-white/90"
      }`}
    >
      <Download className="h-4 w-4" />
      {downloading ? "Preparing…" : "Download all"}
    </button>
  );

  return (
    <div
      className="min-h-screen relative bg-white text-black dark:bg-black dark:text-white"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={NO_SAVE_STYLE}
    >
      {/* Eigen top op de downloadpagina: site-header verbergen */}
      <style>{`body > header { display: none !important; }`}</style>

      <div className="relative z-10">
        {/* ===== Intro-overlay (bewust ongewijzigd) ===== */}
        {showLoadingOverlay && (
          <div
            className="fixed inset-0 z-[100] transition-opacity duration-1000"
            style={{ opacity: loadingThumbnails ? 1 : 0 }}
          >
            <div className="absolute inset-0 bg-black">
              {heroKey && heroUrl ? (
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
                    const isPortrait = img.naturalHeight > img.naturalWidth;
                    setHeroObjectPosition(isPortrait ? "50% 25%" : "50% 35%");
                  }}
                  onError={() => setPreviewLoaded(true)}
                  placeholder="empty"
                  unoptimized={heroUrl?.startsWith("http") || isPreOptimizedApiImage(heroUrl)}
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
                <div className="w-full h-full flex items-center justify-center bg-black">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 bg-gray-700 rounded-full opacity-30 animate-pulse" />
                    <ImageIcon className="absolute inset-0 m-auto h-16 w-16 text-white/40" />
                  </div>
                </div>
              )}
            </div>

            <div className="absolute left-5 top-5 sm:left-6 sm:top-6">
              <p className="text-[11px] tracking-[0.18em] text-white/70">WOUTER.DOWNLOAD</p>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                <div className="select-none text-2xl sm:text-3xl md:text-4xl tracking-tight text-white/25" aria-hidden>
                  <span className="font-bold">WOUTER</span>
                  <span className="font-bold">.</span>
                  <span className="font-normal">DOWNLOAD</span>
                </div>

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

        {/* ===== Error toast ===== */}
        {downloadError && (
          <div className="fixed bottom-20 sm:bottom-5 right-5 z-[60] max-w-sm bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm flex items-start gap-3 shadow-xl">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{downloadError}</span>
            <button
              onClick={() => setDownloadError(null)}
              className="flex-shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ===== Sticky actiebalk (na de hero) ===== */}
        <div
          className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
            showBar ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-black/85 backdrop-blur-md">
            <div className="mx-auto max-w-[1800px] px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
              <p className="truncate font-semibold">{title}</p>
              <div className="hidden sm:block flex-shrink-0">{downloadAllButton(true)}</div>
            </div>
          </div>
        </div>

        <div
          className={`transition-opacity duration-1000 ${
            loadingThumbnails ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {/* ===== Cover-hero: zelfde beeld als de intro, vloeit erin over ===== */}
          <div ref={heroSectionRef} className="relative h-[86svh] min-h-[420px] w-full overflow-hidden bg-black">
            {(heroUrl || backgroundUrl) && (
              <Image
                src={(heroUrl || backgroundUrl)!}
                alt={title}
                fill
                className="object-cover"
                style={{ objectPosition: heroObjectPosition }}
                sizes="100vw"
                priority
                unoptimized
                draggable={false}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

            <div className="absolute left-5 top-5 sm:left-8 sm:top-7">
              <p className="text-[11px] tracking-[0.2em] text-white/80 select-none">
                <span className="font-bold">WOUTER</span>.DOWNLOAD
              </p>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-10">
              <div className="mx-auto max-w-[1800px] flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                <div className="min-w-0">
                  <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white break-words">{title}</h1>
                  {statsLine.length > 0 && (
                    <p className="mt-3 text-sm sm:text-base text-white/75">{statsLine.join(" · ")}</p>
                  )}
                </div>
                <div className="hidden sm:block flex-shrink-0">{downloadAllButton()}</div>
              </div>
            </div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
              <ChevronDown className="h-5 w-5" />
            </div>
          </div>

          {/* ===== Urgentie-banner (≤14 dagen) ===== */}
          {expiryInfo && expiryInfo.daysLeft <= 14 && (
            <div className="mx-auto max-w-[1800px] px-4 sm:px-6 pt-5">
              <div
                className={`rounded-xl px-4 py-3 text-sm flex items-start gap-2.5 border ${
                  expiryInfo.daysLeft <= 3
                    ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900"
                    : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900"
                }`}
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  {expiryInfo.hoursLeft <= 0
                    ? "This link has expired"
                    : expiryInfo.hoursLeft <= 24
                    ? `This link expires today at ${expiryInfo.expires.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
                    : expiryInfo.daysLeft === 1
                    ? "This link expires tomorrow"
                    : `This link expires in ${expiryInfo.daysLeft} days`}
                  {" — download your files before then."}
                </span>
              </div>
            </div>
          )}

          {/* ===== Full-bleed masonry ===== */}
          {imageFiles.length > 0 && (
            <main className="px-1 sm:px-2 py-6 sm:py-8 pb-24 sm:pb-10">
              {imageFolders.map((folder) => (
                <section key={folder} className="mb-8">
                  {hasImageFolders && (
                    <div className="mb-3 mt-2 px-3 sm:px-4 flex items-baseline justify-between gap-3">
                      <h2 className="text-lg sm:text-xl font-semibold tracking-tight truncate">
                        {folder}
                        <span className="ml-2 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                          {imagesByFolder[folder].length}
                        </span>
                      </h2>
                      <button
                        onClick={() =>
                          folder === "Main"
                            ? downloadKeysAsZip(
                                imagesByFolder[folder].map((f) => f.key),
                                `${metadata.slug}-${folder.replace(/[^a-zA-Z0-9-_]/g, "-")}.zip`
                              )
                            : downloadFolder(folder)
                        }
                        disabled={downloading}
                        className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-600 hover:decoration-current transition-colors disabled:opacity-50"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Download folder</span>
                        <span className="sm:hidden">Folder</span>
                      </button>
                    </div>
                  )}
                  <div className="columns-2 md:columns-3 xl:columns-4 2xl:columns-5 gap-1 sm:gap-2">
                    {imagesByFolder[folder].map((file, index) => {
                      const displayName = file.name.split("/").pop() || file.name;
                      return (
                        <figure
                          key={`${file.key}-${index}`}
                          className="group relative mb-1 sm:mb-2 break-inside-avoid overflow-hidden bg-neutral-100 dark:bg-neutral-900 cursor-zoom-in"
                          style={{ aspectRatio: thumbAspectRatios[file.key] ?? 1.5, ...NO_SAVE_STYLE }}
                          onContextMenu={(e) => e.preventDefault()}
                          onDragStart={(e) => e.preventDefault()}
                          onClick={() => openLightboxAt(file.key)}
                        >
                          {thumbnailUrls[file.key] ? (
                            <Image
                              src={thumbnailUrls[file.key]}
                              alt={displayName}
                              fill
                              className="object-cover pointer-events-none transition-transform duration-500 group-hover:scale-[1.03]"
                              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
                              loading="lazy"
                              quality={75}
                              unoptimized={isPreOptimizedApiImage(thumbnailUrls[file.key])}
                              draggable={false}
                              onLoadingComplete={(img) => {
                                const w = img?.naturalWidth || 0;
                                const h = img?.naturalHeight || 0;
                                if (!w || !h) return;
                                const ratio = w / h;
                                setThumbAspectRatios((prev) => {
                                  if (prev[file.key]) return prev;
                                  return { ...prev, [file.key]: ratio };
                                });
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ImageIcon className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
                            </div>
                          )}

                          {/* Hover: subtiele gradient + downloadknop (altijd donker) */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                          <button
                            className="absolute right-2 top-2 z-10 p-2 rounded-full bg-black/35 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-black/70 backdrop-blur-sm transition-all"
                            title="Download photo"
                            aria-label="Download photo"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadSingle(file.key, displayName);
                            }}
                            disabled={downloadingFile === file.key}
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </figure>
                      );
                    })}
                  </div>
                </section>
              ))}
            </main>
          )}

          {/* ===== Bestanden ===== */}
          {otherFiles.length > 0 && (
            <section className={`mx-auto max-w-[1800px] px-4 sm:px-6 pb-24 sm:pb-14 ${imageFiles.length === 0 ? "pt-8" : ""}`}>
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight mb-4">
                Files
                <span className="ml-2 text-sm font-normal text-neutral-500 dark:text-neutral-400">{otherFiles.length}</span>
              </h2>

              <div className="space-y-4">
                {otherFileFolders.map((folder) => (
                  <div
                    key={folder}
                    className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                  >
                    {folder !== ROOT_FILES_FOLDER && (
                      <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                        <p className="font-semibold truncate">{folder}</p>
                        <button
                          onClick={() => downloadFolder(folder)}
                          className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-600 hover:decoration-current transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download folder
                        </button>
                      </div>
                    )}
                    <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {otherFilesByFolder[folder].map((file, index) => {
                        const displayName = file.name.split("/").pop() || file.name;
                        const ext = displayName.split(".").pop()?.toLowerCase();
                        return (
                          <button
                            key={`${file.key}-${index}`}
                            onClick={() => downloadSingle(file.key, displayName)}
                            disabled={downloadingFile === file.key}
                            className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors group disabled:opacity-60"
                          >
                            <span className="flex items-center gap-3 min-w-0">
                              {getFileIcon(displayName)}
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium" title={displayName}>
                                  {displayName}
                                </span>
                                <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                                  {formatBytes(file.size)} {ext && `· ${ext.toUpperCase()}`}
                                </span>
                              </span>
                            </span>
                            <Download className="h-4 w-4 flex-shrink-0 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer-regel */}
          <p className="text-center text-xs text-neutral-400 dark:text-neutral-500 pb-28 sm:pb-8 px-6">
            Photography by Wouter Vellekoop ·{" "}
            <a href="https://www.wouter.photo" className="underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-300">
              wouter.photo
            </a>
          </p>
        </div>

        {/* ===== Mobiele sticky bottom-bar: één knop ===== */}
        {!loadingThumbnails && visibleFiles.length > 0 && (
          <div className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-black/90 backdrop-blur-md px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              onClick={downloadAll}
              disabled={downloading}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-black text-white dark:bg-white dark:text-black font-medium disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {downloading ? "Preparing…" : `Download all${totalSize > 0 ? ` (${formatBytes(totalSize)})` : ""}`}
            </button>
          </div>
        )}

        {/* ===== Lightbox ===== */}
        {lightboxOpen && lightboxImages.length > 0 && (
          <Lightbox
            open={lightboxOpen}
            onOpenChange={setLightboxOpen}
            images={lightboxImages}
            index={currentIndex}
            onIndexChange={setCurrentIndex}
            enableDownload
            onDownload={(current, idx) => {
              const file = imageFiles[idx];
              if (!file) return;
              const name = (file?.name.split("/").pop() || `image-${idx + 1}`).toString();
              downloadSingle(file.key, name);
            }}
            protectImages
            protectMessage="Please use the download icon — if you save the image this way, you're only saving a low-resolution preview."
          />
        )}
      </div>
    </div>
  );
}
