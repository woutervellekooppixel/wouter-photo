"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Copy, Trash2, LogOut, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface Upload {
  slug: string;
  title?: string;
  createdAt: string;
  expiresAt: string;
  files: Array<{
    key: string;
    name: string;
    size: number;
    type: string;
  }>;
  downloads: number;
  clientEmail?: string;
  customMessage?: string;
  ratingsEnabled?: boolean;
}

export default function AdminDashboard() {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [expiryDays, setExpiryDays] = useState(7);
  const [clientEmail, setClientEmail] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [ratingsEnabled, setRatingsEnabled] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadUploads();
  }, []);

  const loadUploads = async () => {
    const res = await fetch("/api/admin/uploads");
    if (res.ok) {
      const data = await res.json();
      setUploads(data);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const filesArray = Array.from(fileList);
    setFiles((prev) => [...prev, ...filesArray]);

    // Generate slug from first file if empty
    if (!slug && filesArray.length > 0) {
      const name = filesArray[0].name.split('.')[0].toLowerCase().replace(/[^a-z0-9-]/g, '-');
      setSlug(name);
    }

    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!slug || files.length === 0) {
      toast({
        title: "Fout",
        description: "Vul een slug in en selecteer bestanden",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedFiles: Array<{key: string; name: string; size: number; type: string}> = [];
      let totalBytes = 0;
      let uploadedBytes = 0;

      files.forEach(file => totalBytes += file.size);

      // Upload each file
      for (const file of files) {
        // Get presigned URL
        const presignedRes = await fetch('/api/admin/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            fileName: file.name,
            fileType: file.type,
          }),
        });

        if (!presignedRes.ok) {
          throw new Error('Failed to get upload URL');
        }

        const { presignedUrl, key } = await presignedRes.json();

        // Upload file with progress tracking
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
          expiryDays,
          clientEmail: clientEmail.trim() || undefined,
          customMessage: customMessage.trim() || undefined,
          ratingsEnabled,
        }),
      });

      if (!metadataRes.ok) {
        throw new Error('Failed to save metadata');
      }

      toast({
        title: "Upload succesvol!",
        description: `${files.length} bestanden geüpload`,
      });

      // Reset form
      setFiles([]);
      setTitle("");
      setSlug("");
      setClientEmail("");
      setCustomMessage("");
      setRatingsEnabled(false);
      setUploadProgress(0);

      loadUploads();
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

  const deleteUpload = async (uploadSlug: string) => {
    if (!confirm(`Weet je zeker dat je "${uploadSlug}" wilt verwijderen?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/uploads/${uploadSlug}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({
          title: "Verwijderd!",
          description: "Upload is verwijderd",
        });
        loadUploads();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Verwijderen mislukt",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Wouter.Photo Download Portal
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Uitloggen
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Nieuwe Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Titel (optioneel)
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Bijv: Bruiloft Jan & Marie"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Slug (URL)
                </label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="bruiloft-jan-marie"
                  required
                />
                {slug && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    → wouter.photo/{slug}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Verloopt over
                </label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Math.max(1, Math.min(365, parseInt(e.target.value) || 7)))}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">dagen</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Client Email (optioneel)
                </label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Persoonlijk bericht (optioneel)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Hi, hierbij de foto's..."
                  rows={3}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ratings"
                  checked={ratingsEnabled}
                  onChange={(e) => setRatingsEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="ratings" className="text-sm font-medium">
                  Foto waardering inschakelen
                </label>
              </div>

              <div className="border-2 border-dashed rounded-lg p-6 text-center border-gray-300 bg-white dark:bg-gray-900">
                <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Selecteer bestanden om te uploaden
                </p>
                <input
                  type="file"
                  id="file-input"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  Selecteer Bestanden
                </Button>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{files.length} bestanden</span>
                    <span className="text-gray-600 dark:text-gray-400">{formatBytes(totalSize)}</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm"
                      >
                        <span className="truncate flex-1">{file.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400 text-xs">
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
                  <div className="relative w-full h-10 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-600 dark:to-gray-700 transition-all duration-300 ease-out flex items-center justify-center"
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
                        <span className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
                          {uploadProgress}%
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Bestanden uploaden...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploads List */}
          <Card>
            <CardHeader>
              <CardTitle>Recente Uploads ({uploads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {uploads.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Nog geen uploads
                  </p>
                ) : (
                  uploads.map((upload) => (
                    <div
                      key={upload.slug}
                      className="border rounded-lg p-4 space-y-2 bg-white dark:bg-gray-900"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          {upload.title && (
                            <h3 className="font-semibold text-base">{upload.title}</h3>
                          )}
                          <p className={`text-sm ${upload.title ? 'text-gray-500 dark:text-gray-400' : 'font-semibold'}`}>
                            {upload.slug}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {upload.files.length} bestand(en) •{" "}
                            {formatBytes(
                              upload.files.reduce((acc, f) => acc + f.size, 0)
                            )}
                          </p>
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
                            onClick={() => copyLink(upload.slug)}
                            title="Kopieer link"
                          >
                            {copiedSlug === upload.slug ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteUpload(upload.slug)}
                            title="Verwijder upload"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <p>Aangemaakt: {formatDate(new Date(upload.createdAt))}</p>
                        <p>Verloopt: {formatDate(new Date(upload.expiresAt))}</p>
                        <p>Downloads: {upload.downloads}×</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
