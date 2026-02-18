"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaInstagram, FaLinkedin, FaWhatsapp, FaEnvelope } from "react-icons/fa";

export default function MobileFloatingContactButton() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<null | 'success' | 'error' | 'loading'>(null);
  const [message, setMessage] = useState('');

  async function getErrorMessage(res: Response) {
    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const data = await res.json().catch(() => null);
      if (data && typeof data.error === 'string') return data.error;
    }
    return 'Something went wrong. Please try again.';
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const msg = formData.get('message');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message: msg }),
      });
      if (res.ok) {
        setStatus('success');
        setMessage('Message sent! I’ll get back to you soon.');
        form.reset();
      } else {
        setStatus('error');
        setMessage(await getErrorMessage(res));
      }
    } catch (err) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed z-50 bottom-6 right-6 bg-black text-white rounded-full shadow-lg p-4 flex items-center justify-center md:hidden hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-black"
        aria-label="Contact"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
      >
        <FaEnvelope size={22} />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md w-full flex flex-col items-center gap-4">
          <div className="w-full flex flex-col items-center gap-2 mb-2">
            <div className="flex gap-4 mt-1">
              <a href="https://instagram.com/woutervellekoop" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-700 hover:text-pink-500 text-xl"><FaInstagram /></a>
              <a href="https://linkedin.com/in/woutervellekoop" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-700 hover:text-blue-700 text-xl"><FaLinkedin /></a>
              <a href="https://wa.me/31616290418?text=Hello%20Wouter%2C%20I%20am%20interested%20in%20your%20photography%20services" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-gray-700 hover:text-green-600 text-xl"><FaWhatsapp /></a>
              <a href="mailto:hello@wouter.photo" aria-label="E-mail" className="text-gray-700 hover:text-red-600 text-xl"><FaEnvelope /></a>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              <div>hello@wouter.photo</div>
              <div>+31 6 16290418</div>
            </div>
          </div>
          {status === 'success' ? (
            <div className="w-full text-center py-2 rounded bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm flex flex-col items-center gap-1">
              <span>Message sent! I’ll get back to you soon.</span>
              <span className="text-xs text-gray-400">Or email <a href="mailto:hello@wouter.photo" className="underline">hello@wouter.photo</a></span>
            </div>
          ) : (
            <form className="w-full flex flex-col gap-3" onSubmit={handleSubmit}>
              <input name="name" type="text" required placeholder="Name" className="border rounded px-3 py-2 w-full" />
              <input name="email" type="email" required placeholder="Email" className="border rounded px-3 py-2 w-full" />
              <textarea name="message" required placeholder="Your message" className="border rounded px-3 py-2 w-full min-h-[80px]" />
              <Button type="submit" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending...' : 'Send'}
              </Button>
              {status === 'error' && (
                <div className="w-full text-center text-xs mt-2 rounded bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 p-2">
                  Oops, something went wrong. Try again or <a href="mailto:hello@wouter.photo" className="underline">email me directly</a>!
                </div>
              )}
            </form>
          )}
          <DialogClose asChild>
            <Button variant="ghost" className="absolute top-2 right-2 p-2" aria-label="Close">
              <X size={20} />
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
