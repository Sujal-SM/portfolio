import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { drivePreview, on } from "../lib/bus";

// In-page viewer for certificates and score reports (Google Drive preview embed).
export function DocViewer() {
  const [doc, setDoc] = useState<{ title: string; url: string; image?: string } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const back = useRef<HTMLElement | null>(null);

  useEffect(() => on("view-doc", (d) => { back.current = document.activeElement as HTMLElement; setLoaded(false); setDoc(d); }), []);
  useEffect(() => {
    if (!doc) { back.current?.focus?.({ preventScroll: true }); return; }
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setDoc(null); };
    addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [doc]);

  return (
    <AnimatePresence>
      {doc && (
        <motion.div
          className="fixed inset-0 z-[75] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) setDoc(null); }}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-label={doc.title}
            initial={{ scale: 0.97, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0 }}
            className="flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-md border border-line bg-panel"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-2.5 font-mono text-xs">
              <p className="truncate text-fg">{doc.title}</p>
              <a href={doc.url} target="_blank" rel="noreferrer" className="ml-auto shrink-0 text-dim underline underline-offset-4 hover:text-phos">{doc.url.includes("drive.google") ? "open in Drive" : "open PDF"}</a>
              <button ref={closeRef} type="button" onClick={() => setDoc(null)} className="shrink-0 rounded border border-line px-2 py-1 text-dim hover:border-phos-dim hover:text-phos">close</button>
            </div>
            <div className="relative flex-1 bg-void">
              {doc.image ? (
                // a rendered image works on every phone; the PDF is one tap away
                <div className="absolute inset-0 p-3 sm:p-5">
                  <img src={doc.image} alt={doc.title} className="h-full w-full object-contain" />
                </div>
              ) : (
                <>
                  {!loaded && <p className="absolute inset-0 grid place-items-center font-mono text-sm text-faint">loading document...</p>}
                  <iframe title={doc.title} src={drivePreview(doc.url)} onLoad={() => setLoaded(true)} className="relative h-full w-full" allow="autoplay" />
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
