import { Dialog, DialogContent, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export function SocialLightbox({ type, open, onOpenChange }: { type: 'instagram' | 'linkedin', open: boolean, onOpenChange: (open: boolean) => void }) {
  const url = type === 'instagram'
    ? 'https://instagram.com/woutervellekoop'
    : 'https://linkedin.com/in/woutervellekoop';
  const label = type === 'instagram' ? 'Instagram' : 'LinkedIn';
  const Icon = type === 'instagram' ? FaInstagram : FaLinkedin;

  // Let op: Instagram/LinkedIn blokkeren meestal iframes. Fallback: toon preview en knop.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          <Icon size={24} />
          <span className="font-semibold text-lg">{label}</span>
        </div>
        <div className="w-full flex flex-col items-center">
          <div className="w-full aspect-video bg-gray-100 flex items-center justify-center rounded mb-4">
            <span className="text-gray-500 text-sm text-center px-4">{label} kan niet in een lightbox worden getoond vanwege beveiligingsinstellingen. Klik hieronder om te openen in een nieuw tabblad.</span>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button variant="default">Open {label} in nieuw tabblad</Button>
          </a>
        </div>
        <DialogClose asChild>
          <Button variant="ghost" className="absolute top-2 right-2">Sluiten</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
