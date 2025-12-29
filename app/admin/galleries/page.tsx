  // Redirect naar /admin als je niet bent ingelogd
  useEffect(() => {
    fetch('/api/admin/check-auth').then(async res => {
      if (!res.ok) {
        window.location.href = '/admin';
      }
    });
  }, []);
"use client";

import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronUp, ChevronDown, Trash2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import AdminTabs from "@/components/AdminTabs";

const CATEGORIES = ["concerts", "events", "misc"] as const;

type Category = typeof CATEGORIES[number];

type Photo = {
  id: string;
  src: string;
  alt: string;
  category: Category;
};

// Haal echte foto's op via API
async function fetchPhotos(): Promise<Record<Category, Photo[]>> {
  const res = await fetch('/api/admin/galleries')
  if (!res.ok) return { concerts: [], events: [], misc: [] }
  return res.json()
}

export default function AdminGalleries() {
    // Foto verwijderen
    const [deleteError, setDeleteError] = useState<string|null>(null);
    async function deletePhoto(cat: Category, idx: number) {
      setDeleteError(null);
      const photo = photos[cat][idx];
      if (!photo) return;
      if (!confirm('Weet je zeker dat je deze foto wilt verwijderen?')) return;
      // Verwijder uit UI
      const items = Array.from(photos[cat]);
      items.splice(idx, 1);
      setPhotos({ ...photos, [cat]: items });
      // Verwijder via API (fysiek bestand)
      try {
        const resp = await fetch('/api/admin/galleries', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: cat, id: photo.id })
        });
        let msg = '';
        let raw = '';
        try {
          const clone = resp.clone();
          raw = await clone.text();
        } catch {}
        try {
          const data = await resp.json();
          msg = data?.error ? `Verwijderen mislukt: ${data.error}` : 'Verwijderen mislukt';
          if (data?.debug) {
            msg += '\nDEBUG: ' + JSON.stringify(data.debug, null, 2);
          }
        } catch {
          msg = 'Verwijderen mislukt (raw): ' + raw;
        }
        if (!resp.ok) {
          setDeleteError(msg + (raw && !msg.includes(raw) ? '\nRAW: ' + raw : ''));
        }
      } catch (err: any) {
        setDeleteError('Verwijderen error: ' + (err?.message || err));
      }
      // Sla nieuwe volgorde op
      fetch('/api/admin/galleries/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: cat, order: items.map(p => p.id) })
      });
    }
  const [photos, setPhotos] = useState<Record<Category, Photo[]>>({
    concerts: [],
    events: [],
    misc: [],
  });
  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    fetchPhotos().then(fetched => {
      // Check uniqueness van id's
      const ids = new Set();
      let unique = true;
      for (const cat of CATEGORIES) {
        for (const p of fetched[cat]) {
          if (ids.has(p.id)) unique = false;
          ids.add(p.id);
        }
      }
      if (!unique) {
        // eslint-disable-next-line no-console
        console.warn('Niet-unieke photo.id gevonden in API-resultaat!');
      }
      setPhotos(fetched);
    });
  }, []);

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    // Bepaal welke categorie (concerts, events, misc)
    let cat: Category | null = null;
    for (const c of CATEGORIES) {
      if (photos[c].some(p => p.id === active.id)) {
        cat = c;
        break;
      }
    }
    if (!cat) return;
    const oldIndex = photos[cat].findIndex(p => p.id === active.id);
    const newIndex = photos[cat].findIndex(p => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newItems = arrayMove(photos[cat], oldIndex, newIndex);
    setPhotos({ ...photos, [cat]: newItems });
    // Sla volgorde op via API
    fetch('/api/admin/galleries/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat, order: newItems.map(p => p.id) })
    });
  }

  // Sortable item component voor dnd-kit
  function SortablePhoto({ photo, idx }: { photo: Photo, idx: number }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
    return (
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1,
          zIndex: isDragging ? 10 : undefined
        }}
        className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded shadow-sm px-2 py-1 border border-gray-200 dark:border-gray-700"
        {...attributes}
        {...listeners}
      >
        <div className="h-20 min-w-0 flex-shrink-0 flex items-center justify-center overflow-hidden rounded bg-gray-100">
          <Image
            src={photo.src}
            alt={photo.alt}
            width={120}
            height={80}
            className="h-20 w-auto object-contain"
            sizes="80px"
          />
        </div>
        <span className="flex-1 truncate text-xs">{photo.alt}</span>
        <div className="flex flex-col gap-1">
          {/* Chevron up/down als visuele drag handle, optioneel interactief */}
          <ChevronUp className="w-4 h-4 text-gray-400" aria-label="Sleep omhoog" />
          <ChevronDown className="w-4 h-4 text-gray-400" aria-label="Sleep omlaag" />
          <Button size="icon" variant="destructive" onClick={() => deletePhoto('concerts', idx)} title="Verwijder foto">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Upload state
  const [uploadingCat, setUploadingCat] = useState<Category|null>(null);
  const fileInputRefs = useRef<Record<Category, HTMLInputElement|null>>({ concerts: null, events: null, misc: null });

  const [uploadError, setUploadError] = useState<string|null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string|null>(null);
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, cat: Category) {
    setUploadError(null);
    setUploadSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCat(cat);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', cat);
    try {
      const resp = await fetch('/api/admin/galleries/upload', { method: 'POST', body: formData });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        // Toon backend error message direct, inclusief categorie-fout
        setUploadError(data?.error ? `Upload mislukt: ${data.error}` : 'Upload mislukt');
      } else {
        setUploadSuccess('Upload gelukt!');
        fetchPhotos().then(setPhotos);
      }
    } catch (err: any) {
      setUploadError('Upload error: ' + (err?.message || err));
    }
    setUploadingCat(null);
    if (fileInputRefs.current[cat]) fileInputRefs.current[cat]!.value = '';
  }

  return (
    <div className="p-4">
      <AdminTabs />
      <h1 className="text-2xl font-bold mb-6">Galleries beheer</h1>
      {deleteError && <div className="mb-4 text-red-600 text-sm font-semibold">{deleteError}</div>}
      {uploadError && <div className="mb-4 text-red-600 text-sm font-semibold">{uploadError}</div>}
      {uploadSuccess && <div className="mb-4 text-green-600 text-sm font-semibold">{uploadSuccess}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Drag & drop voor alle categorieën met dnd-kit */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {CATEGORIES.map((cat) => (
            <Card key={cat} className="w-full">
              <CardHeader>
                <CardTitle>{cat.charAt(0).toUpperCase() + cat.slice(1)}</CardTitle>
                {/* Dropzone bovenaan */}
                <div
                  className="my-2 p-4 border-2 border-dashed border-gray-300 rounded bg-gray-50 text-center cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => fileInputRefs.current[cat]?.click()}
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) {
                      const dt = new DataTransfer();
                      dt.items.add(files[0]);
                      if (fileInputRefs.current[cat]) {
                        fileInputRefs.current[cat]!.files = dt.files;
                        // Trigger change event
                        const event = new Event('change', { bubbles: true });
                        fileInputRefs.current[cat]!.dispatchEvent(event);
                      }
                    }
                  }}
                >
                  <Upload className="mx-auto mb-1 w-6 h-6 text-gray-400" />
                  <div className="text-xs text-gray-600">Sleep een foto hierheen of klik om te uploaden</div>
                  <input
                    ref={el => { fileInputRefs.current[cat] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleFileChange(e, cat)}
                    disabled={!!uploadingCat}
                  />
                  {uploadingCat === cat && <span className="text-xs text-gray-500 ml-2">Bezig met uploaden...</span>}
                </div>
              </CardHeader>
              <CardContent>
                <SortableContext items={photos[cat].map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-4 min-h-[60px]">
                    {photos[cat].length === 0 && <div className="text-gray-400">Geen foto's</div>}
                    {photos[cat].map((photo, idx) => (
                      <SortablePhoto key={photo.id} photo={photo} idx={idx} />
                    ))}
                  </div>
                </SortableContext>
              </CardContent>
            </Card>
          ))}
        </DndContext>
        {/* Oude galleries verwijderd, alles nu dnd-kit */}
      </div>
    </div>
  );
}
