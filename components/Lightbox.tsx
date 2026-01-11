import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

export interface LightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  alt?: string;
  children?: React.ReactNode; // Voor extra knoppen (waardering/download)
}

export function Lightbox({ open, onOpenChange, imageUrl, alt, children }: LightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full flex flex-col items-center">
        <div className="w-full flex flex-col items-center">
          <div className="w-full flex items-center justify-center mb-4">
            <Image
              src={imageUrl}
              alt={alt || ""}
              width={900}
              height={600}
              className="rounded shadow-lg max-h-[70vh] object-contain"
              priority
            />
          </div>
          <div className="flex gap-4 mt-2">
            {children}
          </div>
        </div>
        <DialogClose asChild>
          <Button variant="ghost" className="absolute top-2 right-2">Sluiten</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
