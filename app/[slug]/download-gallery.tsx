"use client";

import { useState } from "react";
import { Download, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { formatBytes } from "@/lib/utils";
import type { UploadMetadata } from "@/lib/r2";

interface Props {
  metadata: UploadMetadata;
}

export default function DownloadGallery({ metadata }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>(metadata.ratings || {});
  const { toast } = useToast();

  const imageFiles = metadata.files.filter(f => 
    f.type.startsWith('image/') || 
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|heic|heif)$/i.test(f.name)
  );
  const otherFiles = metadata.files.filter(f => !imageFiles.includes(f));

  const toggleFile = (key: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedFiles(newSelected);
  };

  const selectAll = () => {
    setSelectedFiles(new Set(metadata.files.map(f => f.key)));
  };

  const deselectAll = () => {
    setSelectedFiles(new Set());
  };

  const downloadAll = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/download/${metadata.slug}/all`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${metadata.slug}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download gestart!",
        description: "Je download begint zo",
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Download mislukt",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const downloadSelected = async () => {
    if (selectedFiles.size === 0) {
      toast({
        title: "Geen bestanden geselecteerd",
        description: "Selecteer eerst bestanden om te downloaden",
        variant: "destructive",
      });
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch(`/api/download/${metadata.slug}/selected`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKeys: Array.from(selectedFiles) }),
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${metadata.slug}-selected.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download gestart!",
        description: `${selectedFiles.size} bestanden worden gedownload`,
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Download mislukt",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const toggleRating = async (fileKey: string) => {
    const isRated = !!ratings[fileKey];
    const newRatings = { ...ratings };
    
    if (isRated) {
      delete newRatings[fileKey];
    } else {
      newRatings[fileKey] = 1;
    }
    
    setRatings(newRatings);

    try {
      await fetch(`/api/rate/${metadata.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKey, rated: !isRated }),
      });
    } catch (error) {
      console.error('Failed to save rating:', error);
    }
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const totalSize = metadata.files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {metadata.title || metadata.slug}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {metadata.files.length} bestanden • {formatBytes(totalSize)} • 
            Verloopt {formatExpiryDate(metadata.expiresAt)}
          </p>
        </div>

        {/* Download Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Button
            onClick={downloadAll}
            disabled={downloading}
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Alles
          </Button>
          
          {selectedFiles.size > 0 && (
            <Button
              onClick={downloadSelected}
              disabled={downloading}
              variant="secondary"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Geselecteerd ({selectedFiles.size})
            </Button>
          )}

          <div className="flex gap-2 ml-auto">
            <Button
              onClick={selectAll}
              variant="outline"
              size="sm"
            >
              Alles selecteren
            </Button>
            {selectedFiles.size > 0 && (
              <Button
                onClick={deselectAll}
                variant="outline"
                size="sm"
              >
                Deselecteren
              </Button>
            )}
          </div>
        </div>

        {/* Images Grid */}
        {imageFiles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Foto's ({imageFiles.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imageFiles.map((file) => {
                const isSelected = selectedFiles.has(file.key);
                const isRated = !!ratings[file.key];

                return (
                  <div
                    key={file.key}
                    className={`relative group aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                      isSelected ? 'ring-4 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                    onClick={() => toggleFile(file.key)}
                  >
                    {/* Placeholder for image - in production you'd load actual images */}
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                        {file.name}
                      </span>
                    </div>

                    {/* Selection Indicator */}
                    <div className="absolute top-2 left-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/80 dark:bg-gray-800/80 text-gray-400'
                      }`}>
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>
                    </div>

                    {/* Rating Button */}
                    {metadata.ratingsEnabled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRating(file.key);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-white/80 dark:bg-gray-800/80 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            isRated
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    )}

                    {/* File Size */}
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {formatBytes(file.size)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Files */}
        {otherFiles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Bestanden ({otherFiles.length})
            </h2>
            <div className="space-y-2">
              {otherFiles.map((file) => {
                const isSelected = selectedFiles.has(file.key);

                return (
                  <div
                    key={file.key}
                    onClick={() => toggleFile(file.key)}
                    className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
                        : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}>
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-4">
                      {formatBytes(file.size)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Custom Message */}
        {metadata.customMessage && (
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {metadata.customMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
