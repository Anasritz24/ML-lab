import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Square,
  Upload,
  Moon,
  Sun,
  Star,
  ChevronsUpDown,
  Check,
  Mail,
  MessageSquare,
  Share2,
  Link,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";

// pdf.js (ESM build)
import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentProxy,
  PasswordResponses,
} from "pdfjs-dist/legacy/build/pdf";
// Use a dedicated Worker instance so Vite resolves the module path correctly
// Robust worker setup: use module worker when possible, fallback to asset URL for fake worker
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite handles ?url imports
import workerMjsUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
try {
  const w = new Worker(
    new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url),
    {
      type: "module",
    },
  );
  GlobalWorkerOptions.workerPort = w as unknown as Worker;
} catch {
  // Fallback for environments where module workers aren’t allowed
  GlobalWorkerOptions.workerSrc = workerMjsUrl as unknown as string;
}

// Lightweight UI primitives reused below
function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/30 bg-white/20 text-card-foreground shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/15",
        "dark:border-white/10 dark:bg-white/5",
        "before:pointer-events-none before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.2xl)-1px)] before:bg-gradient-to-br before:from-white/50 before:via-white/20 before:to-transparent before:opacity-70",
        "after:pointer-events-none after:absolute after:-right-16 after:-top-16 after:h-40 after:w-40 after:rounded-full after:bg-white/20 after:blur-2xl dark:after:bg-white/10",
        props.className,
      )}
    />
  );
}

function LogoWhisperRead() {
  return (
    <motion.div
      className="flex items-center gap-2 select-none"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-400/80 to-cyan-300/80 ring-1 ring-white/40 dark:ring-white/20 shadow">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-white/90"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" opacity=".55" />
          <path
            d="M6 12c1.5-3 3-3 4.5 0S12 15 13.5 12 15 9 18 12"
            opacity=".85"
          />
        </svg>
      </div>
      <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-primary via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
        WhisperRead
      </span>
    </motion.div>
  );
}

function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {desc ? <p className="text-sm text-muted-foreground">{desc}</p> : null}
    </div>
  );
}

// File drop/upload
export function FileDrop({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type === "application/pdf") onFile(file);
      }}
      className={cn(
        "group relative overflow-hidden flex flex-col items-center justify-center rounded-xl p-8 text-center transition",
        "backdrop-blur-xl supports-[backdrop-filter]:bg-white/10 bg-white/20 dark:supports-[backdrop-filter]:bg-transparent dark:bg-transparent",
        "border-2 border-dashed border-white/30 ring-1 ring-white/10 dark:border-white/10 dark:ring-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]",
        "before:content-[''] before:pointer-events-none before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.xl)-1px)] before:bg-gradient-to-br before:from-white/50 before:via-white/10 before:to-transparent before:opacity-70 dark:before:opacity-30",
        "after:content-[''] after:pointer-events-none after:absolute after:-right-16 after:-top-16 after:h-40 after:w-40 after:rounded-full after:bg-white/20 dark:after:bg-transparent after:blur-2xl",
        dragOver ? "border-primary/70 bg-primary/15 dark:bg-primary/20" : "",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (f) onFile(f);
          e.currentTarget.value = ""; // allow re-upload same file
        }}
      />
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Upload className="h-6 w-6" />
      </div>
      <p className="text-sm text-muted-foreground">
        Drag & drop your PDF here, or
        <Button
          type="button"
          variant="link"
          className="px-1 align-baseline"
          onClick={() => inputRef.current?.click()}
        >
          browse
        </Button>
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        We process the file locally in your browser.
      </p>
    </div>
  );
}

// PDF canvas viewer for a single page
export function PdfCanvas({
  pdf,
  pageNumber,
  onRendered,
  onLineClick,
}: {
  pdf: PDFDocumentProxy | null;
  pageNumber: number;
  onRendered?: (w: number, h: number) => void;
  onLineClick?: (startLine: number, lineTexts: string[]) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rendering, setRendering] = useState(false);
  const [overlaySize, setOverlaySize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const [lineBoxes, setLineBoxes] = useState<
    Array<{ left: number; top: number; width: number; height: number }>
  >([]);
  const [lineTexts, setLineTexts] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      if (!pdf || !canvasRef.current) return;
      setRendering(true);
      try {
        const page = await pdf.getPage(pageNumber);
        const containerWidth =
          canvasRef.current.parentElement?.clientWidth ?? 800;
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(containerWidth / viewport.width, 2);
        const scaled = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = Math.floor(scaled.width);
        canvas.height = Math.floor(scaled.height);
        await page.render({ canvasContext: ctx, viewport: scaled, canvas })
          .promise;
        if (cancelled) return;
        onRendered?.(canvas.width, canvas.height);
        setOverlaySize({ w: canvas.width, h: canvas.height });

        // Build clickable text-line overlays
        const content = await page.getTextContent();
        type Box = {
          left: number;
          top: number;
          width: number;
          height: number;
          str: string;
          yCenter: number;
        };
        const boxes: Box[] = [];

        // local helpers for transforms
        const vm = (scaled as any).transform as [
          number,
          number,
          number,
          number,
          number,
          number,
        ];
        const multiply = (m1: number[], m2: number[]) => [
          m1[0] * m2[0] + m1[1] * m2[2],
          m1[0] * m2[1] + m1[1] * m2[3],
          m1[2] * m2[0] + m1[3] * m2[2],
          m1[2] * m2[1] + m1[3] * m2[3],
          m1[4] * m2[0] + m1[5] * m2[2] + m2[4],
          m1[4] * m2[1] + m1[5] * m2[3] + m2[5],
        ];
        const scaleFactor = (scaled as any).scale ?? scale;

        for (const it of content.items as any[]) {
          if (!it || typeof it.str !== "string" || !Array.isArray(it.transform))
            continue;
          const tm = it.transform as [
            number,
            number,
            number,
            number,
            number,
            number,
          ];
          const m = multiply(vm, tm) as [
            number,
            number,
            number,
            number,
            number,
            number,
          ];
          const x = m[4];
          const y = m[5];
          const h = Math.abs(m[3]);
          const w = (it.width || 0) * scaleFactor;
          const top = (scaled.height as number) - y - h;
          const left = x;
          boxes.push({
            left,
            top,
            width: w,
            height: h || 1,
            str: it.str,
            yCenter: top + (h || 1) / 2,
          });
        }

        // Group into lines using yCenter proximity
        boxes.sort((a, b) => a.yCenter - b.yCenter);
        const tol = 4; // px tolerance to consider same line
        const lines: Array<{ y: number; boxes: Box[] }> = [];
        for (const b of boxes) {
          const g = lines.find((ln) => Math.abs(ln.y - b.yCenter) <= tol);
          if (g) {
            g.boxes.push(b);
            g.y = (g.y * (g.boxes.length - 1) + b.yCenter) / g.boxes.length;
          } else {
            lines.push({ y: b.yCenter, boxes: [b] });
          }
        }
        // sort boxes within line by x (left)
        for (const ln of lines) ln.boxes.sort((a, b) => a.left - b.left);

        // reduce to line boxes and texts
        const finalBoxes: Array<{
          left: number;
          top: number;
          width: number;
          height: number;
        }> = [];
        const finalTexts: string[] = [];
        for (const ln of lines) {
          const left = Math.min(...ln.boxes.map((b) => b.left));
          const top = Math.min(...ln.boxes.map((b) => b.top));
          const right = Math.max(...ln.boxes.map((b) => b.left + b.width));
          const bottom = Math.max(...ln.boxes.map((b) => b.top + b.height));
          finalBoxes.push({
            left,
            top,
            width: Math.max(1, right - left),
            height: Math.max(1, bottom - top),
          });
          finalTexts.push(
            ln.boxes
              .map((b) => b.str)
              .join(" ")
              .replace(/\s+/g, " ")
              .trim(),
          );
        }
        if (!cancelled) {
          setLineBoxes(finalBoxes);
          setLineTexts(finalTexts);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setRendering(false);
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber, onRendered]);

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-lg bg-muted/40 ring-1 ring-border"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <canvas
        ref={canvasRef}
        className={cn("block w-full", rendering && "opacity-90")}
      />
      {overlaySize ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ width: overlaySize.w, height: overlaySize.h }}
        >
          {lineBoxes.map((b, i) => (
            <button
              key={i}
              type="button"
              className="absolute pointer-events-auto w-full cursor-pointer rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              style={{
                left: b.left,
                top: b.top,
                width: b.width,
                height: b.height,
                background: "transparent",
              }}
              title="Click to read from here"
              onClick={(e) => {
                e.stopPropagation();
                onLineClick?.(i, lineTexts);
              }}
            />
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}

// Scrollable multi-page PDF viewer
function PdfScrollViewer({
  pdf,
  numPages,
  onVisiblePage,
  onLineClickPage,
  header,
}: {
  pdf: PDFDocumentProxy | null;
  numPages: number;
  onVisiblePage: (p: number) => void;
  onLineClickPage?: (
    pageNumber: number,
    startLine: number,
    lineTexts: string[],
  ) => void;
  header?: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const p = Number((visible.target as HTMLElement).dataset.page || "1");
          onVisiblePage(p);
        }
      },
      { root, threshold: [0.2, 0.5, 0.8] },
    );
    const targets = root.querySelectorAll("[data-page]");
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [pdf, numPages, onVisiblePage]);

  if (!pdf) return null;
  return (
    <div
      ref={containerRef}
      className="h-[72vh] overflow-auto rounded-lg bg-muted/30 p-3"
    >
      {header ? <div className="mb-3">{header}</div> : null}
      <div className="mx-auto grid max-w-full gap-6">
        {Array.from({ length: Math.max(1, numPages) }, (_, i) => i + 1).map(
          (n) => (
            <div key={n} data-page={n} className="scroll-mt-6">
              <PdfCanvas
                pdf={pdf}
                pageNumber={n}
                onLineClick={(startLine, lineTexts) =>
                  onLineClickPage?.(n, startLine, lineTexts)
                }
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
}

// Voice & speech settings
function VoiceControls({
  voice,
  voices,
  onVoice,
  rate,
  onRate,
  pitch,
  onPitch,
}: {
  voice: SpeechSynthesisVoice | null;
  voices: SpeechSynthesisVoice[];
  onVoice: (v: SpeechSynthesisVoice | null) => void;
  rate: number;
  onRate: (r: number) => void;
  pitch: number;
  onPitch: (p: number) => void;
}) {
  const [open, setOpen] = useState(false);

  const formatLang = useMemo(() => {
    const locale =
      (typeof navigator !== "undefined" && navigator.language) || "en";
    let dn: Intl.DisplayNames | null = null;
    try {
      dn = new Intl.DisplayNames([locale], { type: "language" });
    } catch {
      try {
        dn = new Intl.DisplayNames(["en"], { type: "language" });
      } catch {
        dn = null;
      }
    }
    return (code?: string | null) => {
      const c = (code || "").trim();
      if (!c) return "Unknown";
      try {
        const name = dn?.of(c);
        return name || c;
      } catch {
        return c;
      }
    };
  }, []);

  const languageEntries = useMemo(() => {
    const map = new Map<
      string,
      { code: string; label: string; voice: SpeechSynthesisVoice }
    >();
    for (const v of voices) {
      const code = v.lang || "und";
      const existing = map.get(code);
      // Prefer a non-Microsoft voice if available; otherwise keep the first seen
      const preferThis = existing
        ? /^Microsoft\b/i.test(existing.voice.name) &&
          !/^Microsoft\b/i.test(v.name)
        : true;
      if (!existing || preferThis) {
        map.set(code, { code, label: formatLang(code), voice: v });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [voices, formatLang]);

  const selectedLabel = voice ? formatLang(voice.lang) : "";
  const selectedCode = voice?.lang ?? "";

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Voice</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedCode ? (
                <span className="truncate text-left">{selectedLabel}</span>
              ) : (
                <span className="text-muted-foreground">Select a language</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Search language…" />
              <CommandList>
                <CommandEmpty>No languages found.</CommandEmpty>
                <CommandGroup>
                  {languageEntries.map((entry) => (
                    <CommandItem
                      key={entry.code}
                      value={`${entry.label} ${entry.code}`}
                      onSelect={() => {
                        onVoice(entry.voice);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCode === entry.code
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <span className="truncate">{entry.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {voice ? (
        <motion.div
          key={selectedCode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="text-xs text-muted-foreground"
        >
          Selected:{" "}
          <span className="font-medium text-foreground">{selectedLabel}</span>
        </motion.div>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="rate">Rate: {rate.toFixed(1)}x</Label>
        <input
          id="rate"
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={rate}
          onChange={(e) => onRate(parseFloat(e.target.value))}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pitch">Pitch: {pitch.toFixed(1)}</Label>
        <input
          id="pitch"
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={pitch}
          onChange={(e) => onPitch(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);
  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setDark((v) => !v)}
    >
      <motion.span
        key={String(dark)}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="grid place-items-center"
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </motion.span>
    </Button>
  );
}

export default function PdfReaderApp() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState<string>("");
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [texts, setTexts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptPage, setPromptPage] = useState<number>(1);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const { toast } = useToast();
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdValue, setPwdValue] = useState("");
  const [pwdError, setPwdError] = useState<string | null>(null);
  const pendingBufRef = useRef<ArrayBuffer | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePromptOpen, setSharePromptOpen] = useState(false);
  const [shareShowQR, setShareShowQR] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: "user" | "bot"; text: string; id: string }>
  >(() => [
    {
      sender: "bot",
      text: "Hi — I'm WhisperRead Assistant. Ask me how to upload a PDF, use the reader, or share the site.",
      id: "m0",
    },
  ]);

  function sendChat() {
    const txt = chatInput.trim();
    if (!txt) return;
    const id = `u${Date.now()}`;
    setChatMessages((s) => [...s, { sender: "user", text: txt, id }]);
    setChatInput("");
    const lower = txt.toLowerCase();
    let reply =
      'I can help with: upload PDFs, using the reader, sharing, QR codes, and voice settings. Try: "how to upload", "how to share", "what is TTS".';
    if (lower.includes("upload"))
      reply =
        "To upload a PDF, click Upload → PDF or drag & drop the file into the drop area. The file is processed locally in your browser.";
    else if (
      lower.includes("share") ||
      lower.includes("qr") ||
      lower.includes("link")
    )
      reply =
        "Click Share in the navbar to copy the site link or show a QR code. Scanning the QR opens the site URL.";
    else if (lower.includes("reader") || lower.includes("pdf"))
      reply =
        "Open the Reader to preview PDFs. Select text and click Read to use browser TTS. Use the Quick Jump to go to pages.";
    else if (lower.includes("voice") || lower.includes("tts"))
      reply =
        "Use Text-to-Speech settings in the right panel to choose voice, rate, and pitch. Click Start/Stop to control playback.";
    else if (lower.includes("download") || lower.includes("save"))
      reply =
        "You can download the QR image from the Share dialog. For PDFs, use the original app to save processed data.";
    setTimeout(() => {
      setChatMessages((s) => [
        ...s,
        { sender: "bot", text: reply, id: `b${Date.now()}` },
      ]);
      try {
        if (synth) {
          const u = new SpeechSynthesisUtterance(reply);
          u.voice = voice ?? undefined;
          u.rate = rate;
          u.pitch = pitch;
          synth.speak(u);
        }
      } catch {}
    }, 600);
  }

  // Speech synthesis
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  // Assistant ("Gemini") UI state
  const [gemQuery, setGemQuery] = useState("");
  const [gemLoading, setGemLoading] = useState(false);
  const [gemAnswer, setGemAnswer] = useState<string>("");
  const [gemError, setGemError] = useState<string | null>(null);

  function isLikelyFemale(name: string) {
    return /\b(female)\b|\b(aria|jenny|zira|sara|emma|amy|joanna|ivy|salli|olivia|natasha|zoe|natalie|susan|linda|lucy|kate|karen|kimberly|lisa|nicole|tessa|raveena)\b/i.test(
      name,
    );
  }
  function pickFemalePreferredVoice(
    vs: SpeechSynthesisVoice[],
    langRegex: RegExp,
  ) {
    const langVoices = vs.filter(
      (v) => langRegex.test(v.lang || "") || langRegex.test(v.name),
    );
    const femaleInLang = langVoices.find((v) => isLikelyFemale(v.name));
    if (femaleInLang) return femaleInLang;
    if (langVoices[0]) return langVoices[0];
    const anyFemale = vs.find((v) => isLikelyFemale(v.name));
    return anyFemale || vs[0] || null;
  }

  useEffect(() => {
    if (!synth) return;
    function loadVoices() {
      const v = synth.getVoices();
      setVoices(v);
      if (!voice && v.length)
        setVoice(v.find((x) => /English|en-/i.test(x.lang)) ?? v[0]);
    }
    loadVoices();
    synth.onvoiceschanged = loadVoices;
    return () => {
      if (synth) synth.onvoiceschanged = null;
    };
  }, [synth]);

  const greetedRef = useRef(false);
  function getISTHour() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const ist = new Date(utc + 5.5 * 3600 * 1000);
    return ist.getHours();
  }
  useEffect(() => {
    if (!synth) return;
    if (greetedRef.current) return;
    if (!voices.length) return;
    const h = getISTHour();
    let msg = "";
    if (h < 12) msg = "Good morning";
    else if (h < 17) msg = "Good afternoon";
    else msg = "Good evening";
    const u = new SpeechSynthesisUtterance(msg);
    const prefer =
      pickFemalePreferredVoice(voices, /English|en-/i) || voice || undefined;
    if (prefer) u.voice = prefer;
    u.rate = rate;
    u.pitch = pitch;
    try {
      synth.speak(u);
      greetedRef.current = true;
    } catch {}
  }, [synth, voices, voice, rate, pitch]);

  useEffect(() => {
    if (!synth) return;
    const sayBye = () => {
      try {
        const u = new SpeechSynthesisUtterance("Goodbye");
        const prefer =
          pickFemalePreferredVoice(voices, /English|en-/i) ||
          voice ||
          undefined;
        if (prefer) u.voice = prefer;
        u.rate = rate;
        u.pitch = pitch;
        synth.speak(u);
      } catch {}
    };
    const beforeUnload = () => sayBye();
    const onPageHide = () => sayBye();
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [synth, voice, voices, rate, pitch]);

  // Load PDF and extract page texts
  async function openPdf(file: File) {
    setLoading(true);
    setError(null);
    setFileName(file.name);
    setTexts([]);
    setPage(1);
    setPdf(null);
    try {
      const buf = await file.arrayBuffer();
      // Preserve an owned copy to avoid detachment when pdf.js transfers the buffer
      pendingBufRef.current = buf.slice(0);
      await tryOpenWithPassword();
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || e?.name || String(e) || "Failed to open PDF";
      setError(`Could not open PDF: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  async function tryOpenWithPassword(password?: string) {
    const base = pendingBufRef.current;
    if (!base) return;
    setPwdError(null);
    try {
      // Clone for each attempt; pdf.js may transfer and detach the buffer
      const data = base.slice(0);
      const doc = await getDocument({ data, password }).promise;
      setPdf(doc);
      setNumPages(doc.numPages);
      setPromptPage(1);
      setPromptOpen(true);
      setPwdOpen(false);
      setPwdValue("");
      // Show feedback popup for first-time users shortly after opening a PDF
      if (
        typeof window !== "undefined" &&
        !localStorage.getItem("wr_feedback_done")
      ) {
        setTimeout(() => setFeedbackOpen(true), 1200);
      }
      const textArr: string[] = new Array(doc.numPages).fill("");
      setTexts(textArr.slice());
      for (let i = 1; i <= doc.numPages; i++) {
        // eslint-disable-next-line no-await-in-loop
        const p = await doc.getPage(i);
        // eslint-disable-next-line no-await-in-loop
        const content = await p.getTextContent();
        const s = content.items
          .map((it: any) => (typeof it.str === "string" ? it.str : ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        setTexts((prev) => {
          const next = prev.slice();
          next[i - 1] = s;
          return next;
        });
      }
    } catch (e: any) {
      if (
        e?.code === PasswordResponses.NEED_PASSWORD ||
        e?.code === PasswordResponses.INCORRECT_PASSWORD
      ) {
        setPwdOpen(true);
        setPwdError(
          e?.code === PasswordResponses.INCORRECT_PASSWORD
            ? "Incorrect password. Try again."
            : null,
        );
        return;
      }
      console.error(e);
      const msg = e?.message || e?.name || String(e) || "Failed to open PDF";
      setError(`Could not open PDF: ${msg}`);
    }
  }

  async function ensureTextForRange(
    start: number,
    end: number,
  ): Promise<string> {
    if (!pdf) return "";
    const parts: string[] = [];
    for (let i = start; i <= end; i++) {
      let t = texts[i - 1];
      if (!t) {
        const p = await pdf.getPage(i);
        const content = await p.getTextContent();
        t = content.items
          .map((it: any) => (typeof it.str === "string" ? it.str : ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        setTexts((prev) => {
          const next = prev.slice();
          next[i - 1] = t;
          return next;
        });
      }
      if (t) parts.push(t);
    }
    return parts.join(" ");
  }

  // TTS controls
  function stop() {
    if (!synth) return;
    synth.cancel();
    utterRef.current = null;
    setSpeaking(false);
    setPaused(false);
  }
  function pause() {
    if (!synth) return;
    synth.pause();
    setPaused(true);
  }
  function resume() {
    if (!synth) return;
    synth.resume();
    setPaused(false);
  }
  function preprocessForSpeech(txt: string): string {
    const lang = voice?.lang || "";
    if (/^hi(?:-|$)/i.test(lang)) {
      // For Hindi, speak numbers digit-by-digit
      return txt.replace(/\d+/g, (m) => m.split("").join(" "));
    }
    return txt;
  }
  function speakText(text: string) {
    if (!synth) return;
    stop();
    const processed = preprocessForSpeech(text);
    const u = new SpeechSynthesisUtterance(processed);
    u.voice = voice ?? undefined;
    u.rate = rate;
    u.pitch = pitch;
    u.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    u.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterRef.current = u;
    setSpeaking(true);
    setPaused(false);
    synth.speak(u);
  }

  async function copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  const canPrev = page > 1;
  const canNext = page < Math.max(1, numPages);

  // Command input to jump to page and read
  const [command, setCommand] = useState("");
  function executeCommand() {
    const match =
      command.match(/(page|pg|p)\s*(\d+)/i) || command.match(/^(\d+)$/);
    if (!match) return;
    const p = parseInt(match[2] ?? match[1], 10);
    if (Number.isFinite(p)) {
      const clamped = Math.max(1, Math.min(p, Math.max(1, numPages)));
      setPage(clamped);
      const txt = texts[clamped - 1];
      if (txt) speakText(txt);
    }
  }

  const ready = !!pdf && numPages > 0;

  function naiveSummarize(text: string, maxSentences = 4): string {
    const sents = text
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);
    if (sents.length <= maxSentences) return sents.join(" ");
    const stop = new Set([
      "the",
      "is",
      "are",
      "a",
      "an",
      "and",
      "or",
      "to",
      "of",
      "in",
      "on",
      "for",
      "with",
      "as",
      "by",
      "at",
      "from",
      "that",
      "this",
      "it",
      "be",
      "was",
      "were",
      "has",
      "have",
      "had",
    ]);
    const freq = new Map<string, number>();
    for (const w of text.toLowerCase().match(/[a-zA-Z']+/g) || []) {
      if (stop.has(w)) continue;
      freq.set(w, (freq.get(w) || 0) + 1);
    }
    const scored = sents.map((s) => {
      let score = 0;
      for (const w of s.toLowerCase().match(/[a-zA-Z']+/g) || []) {
        score += freq.get(w) || 0;
      }
      return { s, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored
      .slice(0, maxSentences)
      .map((x) => x.s)
      .join(" ");
  }

  async function askGemini(prompt: string): Promise<string | null> {
    try {
      const key = (import.meta as any)?.env?.VITE_GEMINI_API_KEY as
        | string
        | undefined;
      if (!key) return null;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        },
      );
      if (!res.ok) return null;
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return typeof text === "string" ? text : null;
    } catch {
      return null;
    }
  }

  async function handleDefine() {
    const q = gemQuery.trim();
    if (!q) return;
    setGemLoading(true);
    setGemError(null);
    setGemAnswer("");
    try {
      const gemText = await askGemini(
        `Define the word "${q}" in simple terms with 1-2 examples.`,
      );
      if (gemText) {
        setGemAnswer(gemText);
        return;
      }
      const resp = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`,
      );
      if (!resp.ok) throw new Error("No definition found");
      const json = await resp.json();
      const entry = json?.[0];
      const meanings = entry?.meanings?.[0]?.definitions?.[0];
      const def = meanings?.definition || "No definition available.";
      const ex = meanings?.example ? `\nExample: ${meanings.example}` : "";
      setGemAnswer(`${def}${ex}`);
    } catch (e: any) {
      setGemError(e?.message || "Could not get meaning");
    } finally {
      setGemLoading(false);
    }
  }

  async function handleSummarize() {
    setGemLoading(true);
    setGemError(null);
    setGemAnswer("");
    try {
      const pgText = await ensureTextForRange(page, page);
      const gemText = await askGemini(
        `Summarize this text in 3-5 short bullet points:\n\n${pgText}`,
      );
      if (gemText) {
        setGemAnswer(gemText);
        return;
      }
      setGemAnswer(naiveSummarize(pgText));
    } catch (e: any) {
      setGemError(e?.message || "Could not summarize");
    } finally {
      setGemLoading(false);
    }
  }

  return (
    <div className="relative mx-auto mb-1 max-w-7xl px-4 py-6 md:py-10">
      {!ready && (
        <>
          <div className="pointer-events-none absolute -z-10 left-10 top-24 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -z-10 right-0 top-0 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        </>
      )}
      <header className="sticky top-4 z-20 mb-6 rounded-2xl border bg-background/40 backdrop-blur supports-[backdrop-filter]:bg-background/30 md:mb-8">
        <nav className="mx-4 mt-3 hidden items-center justify-between rounded-xl border bg-background/60 px-3 py-2 text-sm font-medium shadow-sm backdrop-blur md:mx-6 md:flex">
          <div className="flex items-center gap-3">
            <LogoWhisperRead />
            <motion.a
              href="/"
              className="text-foreground/80 hover:text-foreground"
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                stop();
                setPdf(null);
                setNumPages(0);
                setPage(1);
                setTexts([]);
                setFileName("");
                setError(null);
                setPromptOpen(false);
                setPwdOpen(false);
                setFeedbackOpen(false);
                pendingBufRef.current = null;
                navigate("/");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Home
            </motion.a>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="rounded-md px-3 py-1.5 text-foreground/80 hover:bg-accent"
                >
                  Upload
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuItem onClick={() => pdfInputRef.current?.click()}>
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => imageInputRef.current?.click()}
                >
                  Image
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-foreground/80 hover:bg-accent"
              onClick={() => setSharePromptOpen(true)}
            >
              <Share2 className="h-4 w-4" /> Share
            </motion.button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 6px 24px rgba(168,85,247,0.15)",
                  }}
                  whileTap={{ scale: 0.96 }}
                  className="rounded-md px-3 py-1.5 text-foreground/80 hover:bg-accent"
                >
                  Help
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuItem
                  onClick={() =>
                    toast({
                      title: "Contact us",
                      description: "We’ll get back to you shortly.",
                    })
                  }
                >
                  <Mail className="mr-2 h-4 w-4" /> Contact us
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </nav>
        {/* hidden file inputs for upload menu */}
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.currentTarget.files?.[0];
            if (f) openPdf(f);
            e.currentTarget.value = "";
          }}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            // Placeholder: image upload reserved for future features
            e.currentTarget.value = "";
          }}
        />
        {!ready && (
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center md:gap-6 md:px-6 md:py-4 px-4 py-3">
            <div>
              <h1 className="bg-gradient-to-r from-primary via-fuchsia-500 to-indigo-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent md:text-4xl">
                WhisperRead
              </h1>
              <p className="mt-1 max-w-prose text-sm text-muted-foreground md:text-base">
                Upload a PDF and let your browser read it aloud. Jump to any
                page by command or quick controls.
              </p>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4 md:p-6">
            {!ready ? (
              <FileDrop onFile={openPdf} />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {fileName}
                    </span>{" "}
                    · {numPages} pages
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={!canPrev}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="text-sm tabular-nums">
                      Pg {page} / {numPages}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={!canNext}
                      onClick={() => setPage((p) => Math.min(numPages, p + 1))}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-lg border bg-background/50 p-3">
                    <div className="mb-2 text-sm font-medium">
                      Gemini assistant
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        value={gemQuery}
                        onChange={(e) => setGemQuery(e.target.value)}
                        placeholder="Type a word to define"
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      />
                      <Button
                        variant="secondary"
                        onClick={handleDefine}
                        disabled={gemLoading || !gemQuery.trim()}
                      >
                        Define
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleSummarize}
                        disabled={gemLoading}
                      >
                        Summarize page
                      </Button>
                    </div>
                    <div className="mt-2 min-h-[3rem] whitespace-pre-wrap text-sm">
                      {gemLoading ? (
                        <span className="text-muted-foreground">Thinking…</span>
                      ) : null}
                      {gemError ? (
                        <span className="text-destructive">{gemError}</span>
                      ) : null}
                      {!gemLoading && !gemError && gemAnswer ? (
                        <span>{gemAnswer}</span>
                      ) : null}
                    </div>
                  </div>

                  <PdfScrollViewer
                    pdf={pdf}
                    numPages={numPages}
                    onVisiblePage={(p) => setPage(p)}
                    header={
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                          onClick={() =>
                            speakText(texts.slice(page - 1).join(" "))
                          }
                          disabled={!texts.some(Boolean)}
                        >
                          <Play className="mr-2 h-4 w-4" /> Start
                        </Button>
                        {speaking && !paused ? (
                          <Button variant="outline" onClick={pause}>
                            <Pause className="mr-2 h-4 w-4" /> Pause
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={resume}
                            disabled={!speaking}
                          >
                            <Play className="mr-2 h-4 w-4" /> Resume
                          </Button>
                        )}
                        <Button variant="destructive" onClick={stop}>
                          <Square className="mr-2 h-4 w-4" /> Stop
                        </Button>
                      </div>
                    }
                    onLineClickPage={(pg, startLine, lineTexts) => {
                      setPage(pg);
                      const fromThisPage = lineTexts
                        .slice(startLine)
                        .join(" ")
                        .trim();
                      const rest = texts.slice(pg).join(" ").trim();
                      const combined = [fromThisPage, rest]
                        .filter(Boolean)
                        .join(" ");
                      if (combined) speakText(combined);
                    }}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-4 md:p-6">
            <SectionTitle
              title="Text-to-Speech"
              desc="Choose a voice and fine-tune the narration."
            />
            <div className="mt-4" />
            <VoiceControls
              voice={voice}
              voices={voices}
              onVoice={setVoice}
              rate={rate}
              onRate={setRate}
              pitch={pitch}
              onPitch={setPitch}
            />
          </Card>

          {loading && (
            <Card className="p-4 md:p-6">
              <div className="animate-pulse text-sm text-muted-foreground">
                Processing PDF…
              </div>
            </Card>
          )}

          {error && <Card className="p-4 md:p-6 text-red-600">{error}</Card>}

          {ready && (
            <Card className="p-4 md:p-6">
              <SectionTitle
                title="Quick Jump"
                desc="Move to a page and start listening."
              />
              <div className="mt-4 grid grid-cols-3 gap-2">
                {Array.from(
                  { length: Math.min(numPages, 30) },
                  (_, i) => i + 1,
                ).map((n) => (
                  <motion.button
                    key={n}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    animate={{ scale: n === page ? 1.05 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    onClick={() => setPage(n)}
                    className={cn(
                      "relative rounded-md border px-2 py-2 text-sm tabular-nums transition",
                      n === page
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent",
                    )}
                  >
                    {n}
                    {n === page && (
                      <motion.span
                        layoutId="quick-jump-indicator"
                        className="pointer-events-none absolute inset-0 -z-10 rounded-md ring-2 ring-primary/60"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
      {/* Chatbot floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setChatOpen(true)}
          size="icon"
          aria-label="Open chat"
          className="rounded-full p-3 shadow-lg"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>

      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="w-[min(600px,95vw)]">
          <DialogHeader>
            <DialogTitle>WhisperRead Assistant</DialogTitle>
            <DialogDescription>
              Ask me how to upload PDFs, read text, or share the site.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col h-[60vh]">
            <div
              className="flex-1 overflow-auto space-y-3 p-3"
              id="chatMessages"
            >
              {chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.sender === "bot"
                      ? "text-sm text-left"
                      : "text-sm text-right"
                  }
                >
                  <div
                    className={
                      m.sender === "bot"
                        ? "inline-block bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2"
                        : "inline-block bg-primary text-primary-foreground rounded-xl px-3 py-2"
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                className="flex-1 rounded border px-3 py-2"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendChat();
                  }
                }}
              />
              <Button onClick={() => sendChat()}>Send</Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setChatOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>What should I read?</DialogTitle>
            <DialogDescription>
              Choose a specific page or read the entire PDF. This uses on-device
              text-to-speech.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-[auto,1fr] items-center gap-3">
              <Label htmlFor="promptPage">Custom page</Label>
              <Input
                id="promptPage"
                type="number"
                min={1}
                max={Math.max(1, numPages)}
                value={promptPage}
                onChange={(e) => setPromptPage(Number(e.target.value))}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Pages detected: {numPages}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={async () => {
                const p = Math.max(
                  1,
                  Math.min(Number(promptPage) || 1, Math.max(1, numPages)),
                );
                setPage(p);
                const txt = await ensureTextForRange(p, p);
                if (txt) speakText(txt);
                setPromptOpen(false);
              }}
            >
              Read custom page
            </Button>
            <Button
              onClick={async () => {
                const txt = await ensureTextForRange(1, Math.max(1, numPages));
                if (txt) speakText(txt);
                setPromptOpen(false);
              }}
            >
              Read entire PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={sharePromptOpen} onOpenChange={setSharePromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this website?</DialogTitle>
            <DialogDescription>
              Allow opening your device share options, or copy the link.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSharePromptOpen(false)}>
              Deny
            </Button>
            <Button
              onClick={async () => {
                const url =
                  typeof window !== "undefined" ? window.location.href : "";
                try {
                  if ((navigator as any)?.share) {
                    await (navigator as any).share({
                      title: "WhisperRead",
                      text: "Check this out",
                      url,
                    });
                    toast({
                      title: "Shared",
                      description: "Share sheet opened.",
                    });
                  } else {
                    setShareOpen(true);
                  }
                } catch {
                  setShareOpen(true);
                } finally {
                  setSharePromptOpen(false);
                }
              }}
            >
              Allow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this app</DialogTitle>
            <DialogDescription>
              Copy the link below, share it, or show a QR code for others to
              scan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={
                  typeof window !== "undefined" ? window.location.href : ""
                }
              />
              <Button
                variant="outline"
                onClick={async () => {
                  const url =
                    typeof window !== "undefined" ? window.location.href : "";
                  const ok = await copyToClipboard(url);
                  if (ok) toast({ title: "Link copied" });
                  else
                    toast({
                      title: "Copy failed",
                      variant: "destructive" as any,
                    });
                }}
              >
                <Link className="mr-2 h-4 w-4" /> Copy
              </Button>
            </div>

            {/* QR code section */}
            <div className="flex items-center gap-3">
              {/* Show QR button toggles the QR image */}
              <Button
                variant="secondary"
                onClick={() => {
                  setShareShowQR((v) => !v);
                }}
              >
                {typeof window !== "undefined" &&
                  (shareShowQR ? "Hide QR" : "Show QR")}
              </Button>

              {/* Download QR */}
              <Button
                variant="ghost"
                onClick={async () => {
                  try {
                    const url =
                      typeof window !== "undefined" ? window.location.href : "";
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(url)}`;
                    const resp = await fetch(qrUrl);
                    const blob = await resp.blob();
                    const a = document.createElement("a");
                    const objUrl = URL.createObjectURL(blob);
                    a.href = objUrl;
                    a.download = "whisperread-qr.png";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(objUrl);
                    toast({ title: "Downloaded QR" });
                  } catch {
                    toast({
                      title: "Download failed",
                      variant: "destructive" as any,
                    });
                  }
                }}
              >
                Download QR
              </Button>
            </div>

            {typeof window !== "undefined" && shareShowQR ? (
              <div className="flex items-center justify-center">
                <img
                  alt="QR code"
                  src={
                    typeof window !== "undefined"
                      ? `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(window.location.href)}`
                      : ""
                  }
                  className="h-48 w-48 rounded-md border bg-white/5 p-1"
                />
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShareOpen(false);
                setShareShowQR(false);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              We value your feedback
            </DialogTitle>
            <DialogDescription>
              How was your first experience with WhisperRead?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }, (_, i) => i + 1).map((i) => (
                <motion.button
                  key={i}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i)}
                  whileHover={{ scale: 1.15, rotate: [0, -8, 0] }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-md p-1"
                  aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
                >
                  <Star
                    className="h-7 w-7"
                    style={{
                      fill:
                        (hoverRating || rating) >= i
                          ? "hsl(var(--primary))"
                          : "transparent",
                      color:
                        (hoverRating || rating) >= i
                          ? "hsl(var(--primary))"
                          : "hsl(var(--foreground)/0.25)",
                    }}
                  />
                </motion.button>
              ))}
            </div>
            <motion.div
              key={rating || hoverRating}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: [1, 1.2, 1], opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-3xl"
            >
              {(() => {
                const r = hoverRating || rating;
                if (r <= 1) return "😠";
                if (r === 2) return "☹️";
                if (r === 3) return "😐";
                if (r === 4) return "😊";
                if (r >= 5) return "😍";
                return "🙂";
              })()}
            </motion.div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (typeof window !== "undefined")
                  localStorage.setItem("wr_feedback_done", "1");
                setFeedbackOpen(false);
                setRating(0);
              }}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent className="overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="relative inline-flex h-9 w-9 items-center justify-center">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{ scale: [0.9, 1.05, 1], opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="absolute inset-0 rounded-full bg-primary/20 blur-sm"
                />
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative grid h-9 w-9 place-items-center rounded-full bg-primary/30 text-primary ring-1 ring-primary/40"
                >
                  🔒
                </motion.span>
              </span>
              Password required
            </DialogTitle>
            <DialogDescription>
              Enter the document password to unlock.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              type="password"
              placeholder="Enter password"
              value={pwdValue}
              onChange={(e) => setPwdValue(e.target.value)}
            />
            {pwdError ? (
              <div className="text-sm text-destructive">{pwdError}</div>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              onClick={() => tryOpenWithPassword(pwdValue)}
              className="relative"
            >
              <motion.span
                initial={{ scale: 0.98 }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2"
              >
                Unlock
              </motion.span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
