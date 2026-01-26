"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Copy, Trash2, LogOut, Check, ExternalLink, Star, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes, formatDate, sortFilesChronological } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useAutoLogout } from "@/lib/useAutoLogout";
import { MAX_UPLOAD_FILE_SIZE_BYTES } from "@/lib/validation";
import AdminTabs from '@/components/AdminTabs';

interface FileWithPreview extends File {
  preview?: string;
}

interface Upload {
  slug: string;
  title?: string;
  createdAt: string;
  files: { key: string; name: string; size: number; type: string }[];
  downloads: number;
  downloadHistory?: {
    timestamp: string;
    type: 'all' | 'single' | 'selected';
    files?: string[];
    ip?: string;
    userAgent?: string;
  }[];
  previewImageKey?: string;
  backgroundImageKey?: string;
  ratings?: Record<string, boolean>;
  ratingsEnabled?: boolean;
}

export default function AdminDashboard() {
  // Redirect naar /admin als je niet bent ingelogd
  useEffect(() => {
    fetch('/api/admin/check-auth').then(async res => {
      if (!res.ok) {
        window.location.href = '/admin';
      }
    });
  }, []);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugToken, setSlugToken] = useState<string>("");
  // Removed expiryDays state and logic
  const [ratingsEnabled, setRatingsEnabled] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [orphanedUploads, setOrphanedUploads] = useState<string[]>([]);
  const [showOrphaned, setShowOrphaned] = useState(false);
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);
  const [selectedUploads, setSelectedUploads] = useState<Set<string>>(new Set());
  const [recomputingExifSlug, setRecomputingExifSlug] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [monthlyCost, setMonthlyCost] = useState<any>(null);
    const [uploadsError, setUploadsError] = useState<string | null>(null);
  const [expandedUpload, setExpandedUpload] = useState<string | null>(null);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [defaultBackgroundFile, setDefaultBackgroundFile] = useState<File | null>(null);
  const [defaultBackgroundPreview, setDefaultBackgroundPreview] = useState<string>("/default-background.svg");
  const [showStatisticsDialog, setShowStatisticsDialog] = useState(false);
  const [isDropzoneDragActive, setIsDropzoneDragActive] = useState(false);
  const dropzoneDragDepth = useRef(0);
  const { toast } = useToast();
  const router = useRouter();

  const slugifyForUrl = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const generateUrlToken = (bytes = 6) => {
    // 6 bytes => 12 hex chars (~48 bits). Short but effectively unguessable.
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const buildSecretSlug = (base: string, token: string) => {
    if (!base) return "";
    const safeToken = token || generateUrlToken();
    return `${base}-${safeToken}`;
  };

  // Load current background image
  useEffect(() => {
    const loadCurrentBackground = async () => {
      try {
        const url = '/api/background/default-background';
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          setDefaultBackgroundPreview(url);
          return;
        }
      } catch (error) {
        // Use fallback
      }
      
      // Fallback to SVG
      setDefaultBackgroundPreview('/default-background.svg');
    };
    
    loadCurrentBackground();
  }, []);



  // Auto logout after 5 hours of inactivity
  useAutoLogout({ 
    timeout: 5 * 60 * 60 * 1000, // 5 hours
    onLogout: () => {
      toast({
        title: "Automatisch uitgelogd",
        description: "Je bent automatisch uitgelogd vanwege inactiviteit.",
      });
    }
  });

  useEffect(() => {
    loadUploads();
    checkOrphanedUploads();
    loadMonthlyCost();
  }, []);

  // Load thumbnails when upload is expanded
  useEffect(() => {
    const loadThumbnailsForUpload = async () => {
      if (!expandedUpload) return;
      
      const upload = uploads.find(u => u.slug === expandedUpload);
      if (!upload) return;
      
      const imageFiles = upload.files.filter(f => isImage(f.name));
      
      for (const file of imageFiles) {
        // Skip if already loaded
        if (thumbnailUrls[file.key]) continue;

        const thumbUrl = `/api/thumbnail/${upload.slug}?key=${encodeURIComponent(file.key)}&w=480`;
        setThumbnailUrls(prev => ({ ...prev, [file.key]: thumbUrl }));
      }
    };
    
    loadThumbnailsForUpload();
  }, [expandedUpload, uploads]);

  const loadUploads = async () => {
    setUploadsError(null);
    try {
      const res = await fetch("/api/admin/uploads");
      if (res.ok) {
        const data = await res.json();
        setUploads(data);
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Onbekende fout' }));
        setUploadsError(errorData.error || 'Fout bij laden van uploads');
        setUploads([]);
      }
    } catch (err) {
      setUploadsError(err instanceof Error ? err.message : 'Netwerkfout bij laden van uploads');
      setUploads([]);
    }
  };

  const checkOrphanedUploads = async () => {
    try {
      const res = await fetch("/api/admin/cleanup");
      if (res.ok) {
        const data = await res.json();
        setOrphanedUploads(data.orphaned);
      }
    } catch (error) {
      console.error("Failed to check orphaned uploads:", error);
    }
  };

  const loadMonthlyCost = async () => {
    try {
      const res = await fetch("/api/admin/costs");
      if (res.ok) {
        const data = await res.json();
        setMonthlyCost(data);
      }
    } catch (error) {
      console.error("Failed to load monthly costs:", error);
    }
  };

  const cleanupOrphanedUpload = async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/cleanup?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({
          title: "Opgeruimd!",
          description: `Incomplete upload "${slug}" is verwijderd`,
        });
        await checkOrphanedUploads();
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Cleanup failed:', errorData);
        toast({
          title: "Fout",
          description: errorData.error || "Opruimen mislukt",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Opruimen mislukt",
        variant: "destructive",
      });
    }
  };

  const isSystemFile = (fileName: string): boolean => {
    const systemFiles = ['.DS_Store', 'Thumbs.db', 'desktop.ini', '.gitkeep'];
    const fileName_lower = fileName.toLowerCase();
    
    // Check exact matches
    if (systemFiles.some(sf => fileName.endsWith(sf))) return true;
    
    // Check for hidden files starting with .
    const name = fileName.split('/').pop() || '';
    if (name.startsWith('.') && name !== '.gitignore') return true;
    
    return false;
  };

  const addSelectedFiles = (incomingFiles: File[]) => {
    const filteredFiles = incomingFiles.filter((file) => !isSystemFile(file.name));

    setFiles((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const newFiles = filteredFiles.filter((f) => !existing.has(`${f.name}-${f.size}`));
      return [...prev, ...newFiles];
    });

    if (filteredFiles.length > 0 && !slug) {
      generateSlugSuggestions(filteredFiles[0].name);
    }
  };

  const getFilesFromDataTransfer = async (dt: DataTransfer): Promise<File[]> => {
    const items = Array.from(dt.items || []);
    const hasEntryApi = items.some((i) => typeof (i as any).webkitGetAsEntry === "function");

    if (!hasEntryApi) {
      return Array.from(dt.files || []).filter((f): f is File => f instanceof File);
    }

    const readEntriesOnce = (reader: any): Promise<any[]> =>
      new Promise((resolve, reject) => reader.readEntries(resolve, reject));

    const readAllEntries = async (reader: any): Promise<any[]> => {
      const all: any[] = [];
      // readEntries may return partial results; keep reading until empty
      while (true) {
        const batch = await readEntriesOnce(reader);
        if (!batch || batch.length === 0) break;
        all.push(...batch);
      }
      return all;
    };

    const fileFromEntry = async (
      entry: any,
      currentPath: string,
      rootToStrip?: string
    ): Promise<File | null> => {
      const file: File = await new Promise((resolve, reject) => entry.file(resolve, reject));

      const fullPath = `${currentPath}${file.name}`;
      const relativePath = rootToStrip && fullPath.startsWith(`${rootToStrip}/`)
        ? fullPath.slice(rootToStrip.length + 1)
        : fullPath;

      if (isSystemFile(relativePath) || isSystemFile(file.name)) return null;

      return new File([file], relativePath, {
        type: file.type,
        lastModified: file.lastModified,
      });
    };

    const walkEntry = async (
      entry: any,
      currentPath: string,
      rootToStrip?: string
    ): Promise<File[]> => {
      if (!entry) return [];
      if (entry.isFile) {
        const f = await fileFromEntry(entry, currentPath, rootToStrip);
        return f ? [f] : [];
      }
      if (entry.isDirectory) {
        const reader = entry.createReader();
        const entries = await readAllEntries(reader);
        const nextPath = `${currentPath}${entry.name}/`;
        const nextRootToStrip = rootToStrip ?? entry.name;
        const nested = await Promise.all(entries.map((e: any) => walkEntry(e, nextPath, nextRootToStrip)));
        return nested.flat();
      }
      return [];
    };

    const topEntries = items
      .map((i) => (i as any).webkitGetAsEntry?.())
      .filter(Boolean);

    const nestedFiles = await Promise.all(topEntries.map((e: any) => walkEntry(e, "")));
    return nestedFiles.flat();
  };

  const handleDropzoneDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dropzoneDragDepth.current += 1;
    setIsDropzoneDragActive(true);
  };

  const handleDropzoneDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dropzoneDragDepth.current -= 1;
    if (dropzoneDragDepth.current <= 0) {
      dropzoneDragDepth.current = 0;
      setIsDropzoneDragActive(false);
    }
  };

  const handleDropzoneDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.dataTransfer.dropEffect = "copy";
    } catch {
      // ignore
    }
  };

  const handleDropzoneDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dropzoneDragDepth.current = 0;
    setIsDropzoneDragActive(false);

    try {
      const droppedFiles = await getFilesFromDataTransfer(e.dataTransfer);

      if (droppedFiles.length === 0) {
        toast({
          title: "Geen bestanden gevonden",
          description: "Tip: map-slepen werkt het best in Chrome/Edge/Safari.",
          variant: "destructive",
        });
        return;
      }

      addSelectedFiles(droppedFiles);
    } catch (err) {
      console.error("Failed to process drop:", err);
      toast({
        title: "Fout",
        description: "Kon de gesleepte map/bestanden niet verwerken.",
        variant: "destructive",
      });
    }
  };

  const handleDropzoneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploading) return;

    const openFolder = e.shiftKey || e.altKey;
    const targetId = openFolder ? "folder-input" : "file-input";
    document.getElementById(targetId)?.click();
  };

  const handleDropzoneKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (uploading) return;
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();

    const openFolder = e.shiftKey || e.altKey;
    const targetId = openFolder ? "folder-input" : "file-input";
    document.getElementById(targetId)?.click();
  };

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const filesArray = Array.from(fileList);
    const allFiles: File[] = [];

    for (const file of filesArray) {
      // webkitRelativePath bevat het volledige pad vanaf de geselecteerde folder
      const relativePath = (file as any).webkitRelativePath || file.name;
      
      // Skip system files
      if (isSystemFile(relativePath) || isSystemFile(file.name)) {
        continue;
      }
      
      // Verwijder de root folder naam om alleen subfolders te behouden
      const pathParts = relativePath.split('/');
      const nameWithoutRoot = pathParts.length > 1 ? pathParts.slice(1).join('/') : pathParts[0];
      
      const newFile = new File([file], nameWithoutRoot, { type: file.type });
      allFiles.push(newFile);
    }

    addSelectedFiles(allFiles);

    // Reset input
    e.target.value = '';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const filesArray = Array.from(fileList);
    addSelectedFiles(filesArray);

    // Reset input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isImageFilename = (name: string) => {
    const ext = name.toLowerCase().split('.').pop();
    return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "heic", "heif", "tif", "tiff"].includes(ext || "");
  };

  const getTakenAtFromFile = async (file: File): Promise<string | undefined> => {
    if (!(file.type?.startsWith('image/') || isImageFilename(file.name))) return undefined;

    try {
      const exifr = await import('exifr');
      const data: any = await exifr.parse(file, {
        pick: [
          'DateTimeOriginal',
          'CreateDate',
          'MediaCreateDate',
          'TrackCreateDate',
          'ModifyDate',
        ],
      });

      const d: unknown =
        data?.DateTimeOriginal ??
        data?.CreateDate ??
        data?.MediaCreateDate ??
        data?.TrackCreateDate ??
        data?.ModifyDate;

      if (d instanceof Date && Number.isFinite(d.getTime())) return d.toISOString();
      return undefined;
    } catch {
      return undefined;
    }
  };

  const handleUpload = async () => {
    if (!slug || files.length === 0) {
      toast({
        title: "Fout",
        description: "Vul een titel/slug in en selecteer bestanden",
        variant: "destructive",
      });
      return;
    }

    const oversizedFile = files.find((file) => file.size > MAX_UPLOAD_FILE_SIZE_BYTES);
    if (oversizedFile) {
      toast({
        title: "Bestand te groot",
        description: `${oversizedFile.name} is groter dan ${formatBytes(MAX_UPLOAD_FILE_SIZE_BYTES)}`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const withExif = await Promise.all(
        files.map(async (file) => ({
          file,
          name: file.name,
          key: file.name,
          takenAt: await getTakenAtFromFile(file),
        }))
      );
      const sortedWithExif = sortFilesChronological(withExif);
      const sortedFiles = sortedWithExif.map((w) => w.file);
      const takenAtByName = new Map(sortedWithExif.map((w) => [w.name, w.takenAt] as const));

      const uploadedFiles: Array<{key: string; name: string; size: number; type: string; takenAt?: string}> = [];
      let totalBytes = 0;
      let uploadedBytes = 0;

      // Calculate total bytes
      sortedFiles.forEach(file => totalBytes += file.size);

      // Upload each file directly to R2
      for (const file of sortedFiles) {
        // Get presigned URL
        const presignedRes = await fetch('/api/admin/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        });

        if (!presignedRes.ok) {
          throw new Error('Failed to get upload URL');
        }

        const { presignedUrl, key } = await presignedRes.json();

        // Upload file directly to R2 with progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const fileProgress = uploadedBytes + e.loaded;
              const percentComplete = Math.round((fileProgress / totalBytes) * 100);
              setUploadProgress(percentComplete);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              uploadedBytes += file.size;
              resolve();
            } else {
              reject(new Error(`Upload failed for ${file.name}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error(`Upload failed for ${file.name}`));
          });

          xhr.open('PUT', presignedUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
        });

        uploadedFiles.push({
          key,
          name: file.name,
          size: file.size,
          type: file.type,
          takenAt: takenAtByName.get(file.name),
        });
      }

      // Save metadata
      const metadataRes = await fetch('/api/admin/save-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          title: title.trim() || undefined,
          files: uploadedFiles,
          ratingsEnabled,
        }),
      });

      if (!metadataRes.ok) {
        throw new Error('Failed to save metadata');
      }

      toast({
        title: "Succes!",
        description: `Upload succesvol: ${title || slug}`,
      });

      // Reset form
      setFiles([]);
      setTitle("");
      setSlug("");
      setSlugManuallyEdited(false);
      setSlugToken("");
      setRatingsEnabled(false);
      
      // Reload uploads list
      await loadUploads();
      
      // Reset progress after list is refreshed
      setUploadProgress(0);
    } catch (error) {
      toast({
        title: "Fout",
        description: error instanceof Error ? error.message : "Upload mislukt",
        variant: "destructive",
      });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const copyLink = (uploadSlug: string) => {
    const link = `${window.location.origin}/${uploadSlug}`;
    navigator.clipboard.writeText(link);
    setCopiedSlug(uploadSlug);
    setTimeout(() => setCopiedSlug(null), 2000);
    toast({
      title: "Gekopieerd!",
      description: "Link staat in je klembord",
    });
  };

  const updatePreviewImage = async (uploadSlug: string, fileKey: string) => {
    try {
      const res = await fetch('/api/admin/update-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: uploadSlug, previewImageKey: fileKey }),
      });

      if (res.ok) {
        toast({
          title: "Preview ingesteld!",
          description: "De preview foto is bijgewerkt",
        });
        loadUploads();
      } else {
        throw new Error('Failed to update preview');
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Preview bijwerken mislukt",
        variant: "destructive",
      });
    }
  };
  
  // Helper function to check if file is an image
  const isImage = (filename: string) => {
    const ext = filename.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic', 'heif'].includes(ext || '');
  };

  const deleteUpload = async (uploadSlug: string) => {
    if (!confirm(`Weet je zeker dat je ${uploadSlug} wilt verwijderen?`)) return;

    const res = await fetch(`/api/admin/uploads/${uploadSlug}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast({
        title: "Verwijderd",
        description: `${uploadSlug} is verwijderd`,
      });
      loadUploads();
    }
  };

  const toggleSelectUpload = (uploadSlug: string) => {
    setSelectedUploads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(uploadSlug)) {
        newSet.delete(uploadSlug);
      } else {
        newSet.add(uploadSlug);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUploads.size === uploads.length) {
      setSelectedUploads(new Set());
    } else {
      setSelectedUploads(new Set(uploads.map(u => u.slug)));
    }
  };

  const deleteSelected = async () => {
    if (selectedUploads.size === 0) return;

    if (!confirm(`Weet je zeker dat je ${selectedUploads.size} uploads wilt verwijderen?`)) {
      return;
    }

    setDeleting(true);
    let successCount = 0;

    for (const uploadSlug of selectedUploads) {
      try {
        const res = await fetch(`/api/admin/uploads/${uploadSlug}`, {
          method: "DELETE",
        });
        if (res.ok) successCount++;
      } catch (error) {
        console.error(`Failed to delete ${uploadSlug}:`, error);
      }
    }

    setDeleting(false);
    setSelectedUploads(new Set());
    
    toast({
      title: "Batch verwijderd",
      description: `${successCount} van ${selectedUploads.size} uploads verwijderd`,
    });

    loadUploads();
  };



  const generateSlugSuggestions = (fileName: string) => {
    const name = fileName.toLowerCase()
      .replace(/\.(jpg|jpeg|png|gif|webp|pdf|zip|mp4|mov)$/i, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const now = new Date();
    const month = now.toLocaleDateString('nl-NL', { month: 'short' });
    const year = now.getFullYear();

    const token = slugToken || generateUrlToken();
    if (!slugToken) setSlugToken(token);
    
    const suggestions = [
      buildSecretSlug(name, token),
      buildSecretSlug(`${name}-${month}-${year}`, token),
      buildSecretSlug(`${name}-${year}`, token),
      buildSecretSlug(`${name}-${now.getDate()}-${month}`, token),
    ].filter(s => s.length > 0 && s !== '-');
    
    setSlugSuggestions(suggestions.slice(0, 3));
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  // ratingsEnabled aan/uit voor bestaande upload
  const updateRatingsEnabledForUpload = async (uploadSlug: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/uploads/${encodeURIComponent(uploadSlug)}/ratings-enabled`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error(await res.text());

      await loadUploads(); // of optimistisch updaten
      toast({
        title: "Bijgewerkt",
        description: `Foto waardering is ${enabled ? "ingeschakeld" : "uitgeschakeld"}.`,
      });
    } catch (e) {
      console.error(e);
      toast({ title: "Fout", description: "Kon waardering niet bijwerken", variant: "destructive" });
    }
  };

  // per-foto rating togglen (admin)
  const togglePhotoRatingAdmin = async (uploadSlug: string, fileKey: string, nextRated: boolean) => {
    try {
      const res = await fetch(`/api/admin/rate/${encodeURIComponent(uploadSlug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey, rated: nextRated }),
      });
      if (!res.ok) throw new Error(await res.text());

      // Optimistisch bijwerken in uploads state:
      setUploads(prev =>
        prev.map(u => {
          if (u.slug !== uploadSlug) return u;
          const next = { ...(u.ratings || {}) };
          if (nextRated) next[fileKey] = true; else delete next[fileKey];
          return { ...u, ratings: next };
        })
      );
    } catch (e) {
      console.error(e);
      toast({ title: "Fout", description: "Kon foto waardering niet opslaan", variant: "destructive" });
    }
  };

  // (optioneel) alle ratings wissen
  const clearAllRatings = async (uploadSlug: string) => {
    if (!confirm("Weet je zeker dat je alle waarderingen wilt verwijderen?")) return;
    try {
      const res = await fetch(`/api/admin/ratings/${encodeURIComponent(uploadSlug)}/clear`, { method: "POST" });
      if (!res.ok) throw new Error(await res.text());

      setUploads(prev => prev.map(u => (u.slug === uploadSlug ? { ...u, ratings: {} } : u)));
      toast({ title: "Opgeschoond", description: "Alle waarderingen zijn verwijderd." });
    } catch (e) {
      console.error(e);
      toast({ title: "Fout", description: "Kon waarderingen niet wissen", variant: "destructive" });
    }
  };

  const recomputeExifForUpload = async (uploadSlug: string) => {
    setRecomputingExifSlug(uploadSlug);
    try {
      const res = await fetch('/api/admin/recompute-exif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: uploadSlug }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to recompute EXIF');

      toast({
        title: 'EXIF bijgewerkt',
        description: `${data.updated ?? 0} foto(‘s) voorzien van datum (van ${data.images ?? 0} images).`,
      });

      await loadUploads();
    } catch (e) {
      console.error(e);
      toast({ title: 'Fout', description: 'Kon EXIF datums niet bijwerken', variant: 'destructive' });
    } finally {
      setRecomputingExifSlug(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Upload en beheer je foto downloads</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowStatisticsDialog(true)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistieken
            </Button>
            <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Instellingen
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Uitloggen
            </Button>
          </div>
        </div>

        <AdminTabs />

        {/* Compact Summary */}
        {uploads.length > 0 && (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {uploads.length} uploads • {uploads.reduce((acc, u) => acc + u.files.length, 0)} bestanden • {uploads.reduce((acc, u) => acc + u.downloads, 0)} downloads
              </span>
              <Button 
                variant="link" 
                size="sm"
                onClick={() => setShowStatisticsDialog(true)}
                className="text-blue-600"
              >
                Zie alle statistieken →
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Nieuwe Upload</CardTitle>
              <CardDescription>Upload foto's voor een nieuwe klant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Transfer titel *
                </label>
                <Input
                  placeholder="Fotoshoot Emma & Tom"
                  value={title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setTitle(newTitle);
                    // Auto-generate slug from title (titel-slug-randomtoken)
                    if (!newTitle) {
                      if (!slugManuallyEdited) {
                        setSlug("");
                        setSlugToken("");
                      }
                      return;
                    }

                    if (!slugManuallyEdited) {
                      const base = slugifyForUrl(newTitle);
                      const token = slugToken || generateUrlToken();
                      if (!slugToken) setSlugToken(token);
                      setSlug(buildSecretSlug(base, token));
                    }
                  }}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Custom URL
                </label>
                <Input
                  placeholder="fotoshoot-emma-tom-1a2b3c4d5e6f"
                  value={slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    const next = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                    setSlug(next);

                    const last = next.split("-").pop() || "";
                    if (/^[a-f0-9]{10,}$/i.test(last)) {
                      setSlugToken(last.toLowerCase());
                    }
                  }}
                />
                {slug && (
                  <p className="text-xs text-blue-600 mt-1">
                    → wouter.photo/{slug}
                  </p>
                )}
              </div>

              {/* Expiry UI removed: no vervaldatum/expiry fields shown */}

              <div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ratingsEnabled}
                    onChange={(e) => setRatingsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Foto waardering inschakelen</span>
                </label>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer select-none ${isDropzoneDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}`}
                onDragEnter={handleDropzoneDragEnter}
                onDragLeave={handleDropzoneDragLeave}
                onDragOver={handleDropzoneDragOver}
                onDrop={handleDropzoneDrop}
                onClick={handleDropzoneClick}
                onKeyDown={handleDropzoneKeyDown}
                role="button"
                tabIndex={0}
                aria-label="Upload bestanden of map"
              >
                <input
                  type="file"
                  id="file-input"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <input
                  type="file"
                  id="folder-input"
                  {...({ webkitdirectory: "", mozdirectory: "", directory: "" } as any)}
                  multiple
                  onChange={handleFolderSelect}
                  className="hidden"
                />
                <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-3">
                  Sleep bestanden of een map hierheen
                </p>
                <p className="text-xs text-gray-400">
                  Klik om te kiezen (Shift/⌥ = folder)
                </p>
                {isDropzoneDragActive && (
                  <p className="text-xs text-blue-600 mb-3">
                    Submappen worden automatisch meegenomen
                  </p>
                )}
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{files.length} bestanden</span>
                    <span className="text-gray-600">{formatBytes(totalSize)}</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                      >
                        <span className="truncate flex-1">{file.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs">
                            {formatBytes(file.size)}
                          </span>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button with Progress Bar */}
              {!uploading ? (
                <Button
                  onClick={handleUpload}
                  disabled={!slug || files.length === 0}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Bestanden
                </Button>
              ) : (
                <div className="w-full space-y-2">
                  <div className="relative w-full h-10 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 transition-all duration-300 ease-out flex items-center justify-center"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress > 10 && (
                        <span className="text-white text-sm font-semibold">
                          {uploadProgress}%
                        </span>
                      )}
                    </div>
                    {uploadProgress <= 10 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-semibold">
                          {uploadProgress}%
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-center text-gray-500">
                    Bestanden uploaden...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploads List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Actieve Downloads</CardTitle>
                <CardDescription>Beheer bestaande uploads</CardDescription>
              </div>
              {uploads.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleSelectAll}
                  >
                    {selectedUploads.size === uploads.length ? "Deselecteer alles" : "Selecteer alles"}
                  </Button>
                  {selectedUploads.size > 0 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={deleteSelected}
                      disabled={deleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleting ? "Bezig..." : `Verwijder (${selectedUploads.size})`}
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {uploadsError ? (
                  <p className="text-center text-red-500 py-8 font-semibold">Fout: {uploadsError}</p>
                ) : uploads.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nog geen uploads</p>
                ) : (
                  uploads.map((upload) => {
                    const imageFiles = upload.files.filter(f => isImage(f.name));
                    const isExpanded = expandedUpload === upload.slug;
                    
                    return (
                    <div
                      key={upload.slug}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedUploads.has(upload.slug)}
                          onChange={() => toggleSelectUpload(upload.slug)}
                          className="mt-1 h-4 w-4 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          {upload.title && (
                            <h3 className="font-semibold text-base">{upload.title}</h3>
                          )}
                          <p className={`text-sm ${upload.title ? 'text-gray-500' : 'font-semibold'}`}>
                            {upload.slug}
                          </p>
                          <p className="text-xs text-gray-500">
                            {upload.files.length} bestand(en) •{" "}
                            {formatBytes(
                              upload.files.reduce((acc, f) => acc + f.size, 0)
                            )}
                          </p>
                          {imageFiles.length > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setExpandedUpload(isExpanded ? null : upload.slug)}
                              className="mt-1 h-6 text-xs px-2"
                            >
                              {isExpanded ? '▼' : '▶'} {imageFiles.length} foto's - Kies preview
                            </Button>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/${upload.slug}`, '_blank')}
                            title="Bekijk download pagina"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => recomputeExifForUpload(upload.slug)}
                            disabled={recomputingExifSlug === upload.slug}
                            title="Sorteer / vul EXIF datums aan"
                          >
                            <span className="text-[10px] font-semibold">
                              {recomputingExifSlug === upload.slug ? '…' : 'EXIF'}
                            </span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyLink(upload.slug)}
                            title="Kopieer link"
                          >
                            {copiedSlug === upload.slug ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteUpload(upload.slug)}
                            title="Verwijder"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Aangemaakt: {formatDate(new Date(upload.createdAt))}</p>
                        {/* Geen vervaldatum meer */}
                        <div className="flex items-center gap-2">
                          <p>Downloads: {upload.downloads}×</p>
                          {upload.downloadHistory && upload.downloadHistory.length > 0 && (
                            <button
                              onClick={() => setExpandedUpload(expandedUpload === upload.slug ? null : upload.slug)}
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {expandedUpload === upload.slug ? 'Verberg details' : 'Bekijk details'}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={!!upload.ratingsEnabled}
                              onChange={(e) => updateRatingsEnabledForUpload(upload.slug, e.target.checked)}
                            />
                            <span>Foto waardering</span>
                          </label>
                          {upload.ratings && Object.keys(upload.ratings).length > 0 && (
                            <button
                              onClick={() => clearAllRatings(upload.slug)}
                              className="text-xs text-red-600 hover:text-red-800 underline"
                              title="Wis alle waarderingen voor deze upload"
                            >
                              Reset waardering
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Photo grid for preview selection */}
                      {isExpanded && imageFiles.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-medium mb-3">Selecteer een preview foto voor het loading screen:</p>
                          <div className="grid grid-cols-4 gap-2">
                            {imageFiles.map((file) => {
                              const isPreview = upload.previewImageKey === file.key;
                              const isRated = upload.ratings?.[file.key];
                              const thumbnailUrl = thumbnailUrls[file.key];
                              
                              return (
                                <button
                                  key={file.key}
                                  onClick={() => updatePreviewImage(upload.slug, file.key)}
                                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                    isPreview 
                                      ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2' 
                                      : 'border-gray-200 hover:border-blue-300'
                                  }`}
                                  title={file.name}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const next = !isRated;
                                      togglePhotoRatingAdmin(upload.slug, file.key, next);
                                    }}
                                    className="absolute top-1 right-1 z-10 p-1 rounded-full bg-black/40 hover:bg-black/60"
                                    title={isRated ? "Waardering verwijderen" : "Markeer als favoriet"}
                                  >
                                    <Star
                                      className={`h-4 w-4 transition-colors ${
                                        isRated ? "fill-yellow-400 text-yellow-400" : "text-white"
                                      }`}
                                    />
                                  </button>
                                  {thumbnailUrl ? (
                                    <img
                                      src={thumbnailUrl}
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        // Hide broken images
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                                    </div>
                                  )}
                                  {isPreview && (
                                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                      <Check className="h-8 w-8 text-white drop-shadow" />
                                    </div>
                                  )}
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                    <p className="text-white text-xs truncate">{file.name.split('/').pop()}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
          </Card>
        </div>

        {/* Orphaned Uploads Warning */}
        {orphanedUploads.length > 0 && (
          <Card className="mt-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-orange-900">
                    ⚠️ Incomplete Uploads ({orphanedUploads.length})
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    Deze uploads zijn niet afgerond maar staan wel op de server
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowOrphaned(!showOrphaned)}
                >
                  {showOrphaned ? "Verberg" : "Bekijk"}
                </Button>
              </div>
            </CardHeader>
            {showOrphaned && (
              <CardContent>
                <div className="space-y-2">
                  {orphanedUploads.map((slug) => (
                    <div
                      key={slug}
                      className="flex items-center justify-between bg-white p-3 rounded border border-orange-200"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{slug}</p>
                        <p className="text-xs text-gray-500">
                          Upload gestopt voordat metadata kon worden opgeslagen
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cleanupOrphanedUpload(slug)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Opruimen
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}



      {/* Settings Dialog */}
      {showSettingsDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Instellingen</h2>
                <button
                  onClick={() => setShowSettingsDialog(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Default Background */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Standaard Achtergrond</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload een afbeelding die als standaard achtergrond wordt gebruikt op alle download pagina's.
                </p>
                
                {/* Current Background Preview */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Huidige achtergrond:</p>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={defaultBackgroundPreview}
                      alt="Huidige achtergrond"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload nieuwe achtergrond:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setDefaultBackgroundFile(file);
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setDefaultBackgroundPreview(e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Aanbevolen: minimaal 1920x1080px voor beste resultaat
                  </p>
                </div>

                {defaultBackgroundFile && (
                  <Button
                    onClick={async () => {
                      const formData = new FormData();
                      formData.append('file', defaultBackgroundFile);
                      
                      try {
                        const res = await fetch('/api/admin/upload-default-background', {
                          method: 'POST',
                          body: formData,
                        });
                        
                        if (res.ok) {
                          const data = await res.json();
                          toast({
                            title: "Opgeslagen!",
                            description: "Standaard achtergrond is bijgewerkt",
                          });
                          setDefaultBackgroundFile(null);
                          // Update preview with the uploaded image URL
                          if (data.url) {
                            setDefaultBackgroundPreview(`${data.url}?v=${Date.now()}`);
                          }
                        } else {
                          throw new Error('Upload failed');
                        }
                      } catch (error) {
                        toast({
                          title: "Fout",
                          description: "Uploaden mislukt",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="w-full"
                  >
                    Achtergrond Opslaan
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSettingsDialog(false);
                  setDefaultBackgroundFile(null);
                }}
                className="flex-1"
              >
                Sluiten
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Dialog */}
      {showStatisticsDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">📊 Statistieken</h2>
                <button
                  onClick={() => setShowStatisticsDialog(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Overview Stats */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Overzicht</h3>
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {uploads.length}
                      </div>
                      <p className="text-xs text-gray-500">Actieve Uploads</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {uploads.reduce((acc, u) => acc + u.files.length, 0)}
                      </div>
                      <p className="text-xs text-gray-500">Totaal Bestanden</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {uploads.reduce((acc, u) => acc + u.downloads, 0)}
                      </div>
                      <p className="text-xs text-gray-500">Totaal Downloads</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {uploads.reduce((acc, u) => acc + (u.downloadHistory?.length || 0), 0)} events
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {formatBytes(uploads.reduce((acc, u) => 
                          acc + u.files.reduce((sum, f) => sum + f.size, 0), 0
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">Totale Storage</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Download Activity */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Download Activiteit (laatste 7 dagen)</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {(() => {
                    const activeUploads = uploads;
                    const last7Days = activeUploads.reduce((acc, u) => {
                      const recentDownloads = u.downloadHistory?.filter(d => {
                        const downloadDate = new Date(d.timestamp);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return downloadDate > weekAgo;
                      }) || [];
                      
                      return {
                        all: acc.all + recentDownloads.filter(d => d.type === 'all').length,
                        single: acc.single + recentDownloads.filter(d => d.type === 'single').length,
                        selected: acc.selected + recentDownloads.filter(d => d.type === 'selected').length,
                      };
                    }, { all: 0, single: 0, selected: 0 });

                    return (
                      <>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-xl font-bold text-gray-900">📦 {last7Days.all}</div>
                            <p className="text-xs text-gray-500">Alle bestanden downloads</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-xl font-bold text-gray-900">📄 {last7Days.single}</div>
                            <p className="text-xs text-gray-500">Enkele foto downloads</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-xl font-bold text-gray-900">📋 {last7Days.selected}</div>
                            <p className="text-xs text-gray-500">Selectie downloads</p>
                          </CardContent>
                        </Card>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Monthly Costs */}
              {monthlyCost && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    💰 Maandelijkse Kosten ({monthlyCost.month})
                  </h3>
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-gray-900">
                          ${monthlyCost.total.toFixed(4)}
                        </div>
                        <p className="text-xs text-gray-500">Totaal deze maand</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-lg font-semibold text-gray-800">
                          {monthlyCost.storage.toFixed(2)} GB
                        </div>
                        <p className="text-xs text-gray-500">Storage</p>
                        <p className="text-xs text-gray-400">${(monthlyCost.storage * 0.015).toFixed(4)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-lg font-semibold text-gray-800">
                          {(monthlyCost.operations.listFiles + monthlyCost.operations.putFile + monthlyCost.operations.deleteFile).toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500">Class A Operations</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-lg font-semibold text-gray-800">
                          {formatBytes(monthlyCost.bandwidth)}
                        </div>
                        <p className="text-xs text-gray-500">Bandwidth</p>
                        <p className="text-xs text-green-600">gratis!</p>
                      </CardContent>
                    </Card>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    💡 Kosten resetten automatisch elke maand
                  </p>
                </div>
              )}

              {/* Per Upload Stats */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Per Upload</h3>
                <div className="space-y-3">
                  {uploads.map(upload => (
                    <Card key={upload.slug}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{upload.title || upload.slug}</h4>
                            <p className="text-xs text-gray-500">
                              {upload.files.length} bestanden • {formatBytes(upload.files.reduce((acc, f) => acc + f.size, 0))}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{upload.downloads}</div>
                            <p className="text-xs text-gray-500">downloads</p>
                          </div>
                        </div>

                        {upload.downloadHistory && upload.downloadHistory.length > 0 && (
                          <div className="pt-3 border-t">
                            <p className="text-xs font-medium text-gray-600 mb-2">
                              Recente downloads:
                            </p>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {upload.downloadHistory.slice().reverse().slice(0, 5).map((download, idx) => (
                                <div key={idx} className="text-xs text-gray-600 flex items-center justify-between">
                                  <span>
                                    {download.type === 'all' && '📦 Alle bestanden'}
                                    {download.type === 'single' && '📄 Enkel bestand'}
                                    {download.type === 'selected' && `📋 ${download.files?.length || 0} geselecteerd`}
                                  </span>
                                  <span className="text-gray-400">
                                    {new Date(download.timestamp).toLocaleString('nl-NL', {
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 sticky bottom-0">
              <Button
                variant="outline"
                onClick={() => setShowStatisticsDialog(false)}
                className="w-full"
              >
                Sluiten
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
