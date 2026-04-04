import { useState, useEffect, useRef } from "react";
import type { Project } from "../data/projects";
import type { SiteConfig } from "../data/site-config";

interface Props {
  project: Project;
  config: SiteConfig;
  onBack: () => void;
}

interface FloatState { x: number; y: number; r: number; }

// Image width: 39.1vw (92% of 42.5vw — keeps them off the center text)
// Height: 39.1vw × (9/16) = 22vw
// Spacing between images on same side: 25% of height = 5.5vw → slot = 27.5vw
// Left column rows:  0, 27.5vw, 55vw  from the initial offset
// Right column rows: staggered 13.75vw (½ slot) below left
const STILL_W = "39.1vw";
const STILLS = [
  { src: "/images/off-rip/still-07.jpg",   side: "left"  as const, topCalc: "calc(80px)",                  phase: 0.0,  depth: 18 },
  { src: "/images/off-rip/still-01.jpg",   side: "right" as const, topCalc: "calc(80px + 13.75vw)",        phase: 1.3,  depth: 22 },
  { src: "/images/off-rip/still-05.jpg",   side: "left"  as const, topCalc: "calc(80px + 27.5vw)",         phase: 2.6,  depth: 15 },
  { src: "/images/off-rip/still-03.jpg",   side: "right" as const, topCalc: "calc(80px + 41.25vw)",        phase: 3.9,  depth: 20 },
  { src: "/images/off-rip/still-08.jpg",   side: "left"  as const, topCalc: "calc(80px + 55vw)",           phase: 5.1,  depth: 17 },
  { src: "/images/off-rip/still-06.jpg",   side: "right" as const, topCalc: "calc(80px + 68.75vw)",        phase: 6.4,  depth: 21 },
  // Best Moments — same pattern continuing
  { src: "/images/off-rip/bm-5.11.1.jpg",  side: "left"  as const, topCalc: "calc(80px + 82.5vw)",         phase: 7.7,  depth: 19 },
  { src: "/images/off-rip/bm-5.182.1.jpg", side: "right" as const, topCalc: "calc(80px + 96.25vw)",        phase: 8.9,  depth: 16 },
  { src: "/images/off-rip/bm-5.242.1.jpg", side: "left"  as const, topCalc: "calc(80px + 110vw)",          phase: 10.1, depth: 21 },
  { src: "/images/off-rip/bm-5.581.1.jpg", side: "right" as const, topCalc: "calc(80px + 123.75vw)",       phase: 11.4, depth: 17 },
  { src: "/images/off-rip/bm-5.1050.1.jpg",side: "left"  as const, topCalc: "calc(80px + 137.5vw)",        phase: 12.6, depth: 20 },
];

const CREW = [
  { label: "Written & Directed by",   value: "Jadon Cal Fitzpatrick" },
  { label: "Director of Photography", value: "Jake Jalbert" },
  { label: "Edited by",               value: "Jadon Cal Fitzpatrick & Jake Jalbert" },
  { label: "Produced by",             value: "Jadon Cal Fitzpatrick, Jake Jalbert, Nicole Weider, Jim Fitzpatrick, Jeff Alpert" },
  { label: "Original Score",          value: "Iran Garcia" },
  { label: "AD / Co-Producer",             value: "Katrina Kearns" },
  { label: "Line Producer",           value: "Jodi Knotts" },
];

const CAST = [
  "Jadon Cal Fitzpatrick",
  "David Hamzik",
  "MG Barnes",
  "Nick McCallum",
  "Abi Van Andel",
  "Meghan Carrasquillo",
];

export default function OffRipDetail({ project, config, onBack }: Props) {
  // Fade-in on mount (content appears after card expansion completes)
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Staggered blur-in for stills
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 120);
    return () => clearTimeout(t);
  }, []);

  // Float + mouse parallax — same animation as the project cards
  const floatTimeRef   = useRef(0);
  const animFrameRef   = useRef<number>(0);
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const smoothMouseRef = useRef({ x: 0, y: 0 });
  const [floats, setFloats]           = useState<FloatState[]>(STILLS.map(() => ({ x: 0, y: 0, r: 0 })));
  const [smoothMouse, setSmoothMouse] = useState({ x: 0, y: 0 });
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animate = () => {
      floatTimeRef.current += 0.004;
      smoothMouseRef.current.x += (targetMouseRef.current.x - smoothMouseRef.current.x) * 0.038;
      smoothMouseRef.current.y += (targetMouseRef.current.y - smoothMouseRef.current.y) * 0.038;
      setSmoothMouse({ ...smoothMouseRef.current });
      setFloats(STILLS.map((s) => ({
        x: Math.sin(floatTimeRef.current * 0.28 + s.phase) * 3.5,
        y: Math.cos(floatTimeRef.current * 0.2  + s.phase) * 5.5,
        r: Math.sin(floatTimeRef.current * 0.16 + s.phase * 0.7) * 0.55,
      })));
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = zoneRef.current?.getBoundingClientRect();
    if (!rect) return;
    targetMouseRef.current = {
      x: (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2),
      y: (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2),
    };
  };

  return (
    <div
      className="absolute inset-0 overflow-y-auto"
      style={{
        background: "#ffffff",
        fontFamily: config.styles.fontFamily,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}
    >
      {/* ── BACK ── */}
      <button
        onClick={onBack}
        className="fixed top-10 left-10 z-50 text-xs tracking-widest"
        style={{ letterSpacing: "0.3em", color: "#000", opacity: 0.3 }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "0.3")}
      >
        ← BACK
      </button>

      {/* ── TITLE ── */}
      <div style={{ textAlign: "center", padding: "80px 24px 0" }}>
        <div style={{ fontSize: "0.72rem", letterSpacing: "0.3em", color: "rgba(0,0,0,0.4)", marginBottom: "20px" }}>
          NEW TERRAIN ENTERTAINMENT · FEATURE PRODUCTION · 2025
        </div>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
          fontSize: "clamp(4rem, 10vw, 9rem)",
          fontWeight: 300,
          letterSpacing: "0.22em",
          color: "#000",
          lineHeight: 0.92,
          margin: 0,
        }}>
          OFF RIP
        </h1>
        <div style={{
          fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
          fontSize: "clamp(0.75rem, 1.1vw, 0.95rem)",
          fontStyle: "italic",
          letterSpacing: "0.1em",
          color: "rgba(0,0,0,0.28)",
          marginTop: "16px",
        }}>
          Shred or Be Shredded
        </div>
        <div style={{ width: "1px", height: "48px", background: "rgba(0,0,0,0.08)", margin: "32px auto 0" }} />
      </div>

      {/* ── LIVING ZONE — text + floating stills ── */}
      <div
        ref={zoneRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { targetMouseRef.current = { x: 0, y: 0 }; }}
        style={{ position: "relative", minHeight: "calc(80px + 165vw)", overflowX: "hidden" }}
      >
        {/* Floating stills — flush to screen edges, 39.1vw wide */}
        {STILLS.map((still, i) => {
          const f     = floats[i] ?? { x: 0, y: 0, r: 0 };
          const px    = -smoothMouse.x * still.depth;
          const py    = -smoothMouse.y * still.depth;
          const delay = `${i * 0.15}s`;
          return (
            <div
              key={i}
              style={{
                position:  "absolute",
                top:       still.topCalc,
                ...(still.side === "left"
                  ? { left: 0 }
                  : { right: 0 }),
                width:     STILL_W,
                transform: `translate(${f.x + px}px, ${f.y + py}px) rotate(${f.r}deg)`,
                filter:    revealed ? "blur(0px)"  : "blur(18px)",
                opacity:   revealed ? 1            : 0,
                transition: `filter 2.4s ease ${delay}, opacity 1.8s ease ${delay}`,
                zIndex: 1,
                willChange: "transform",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <img
                  src={still.src}
                  alt=""
                  style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
                />
              </div>
            </div>
          );
        })}

        {/* Description — white background so it stays readable above the stills */}
        <div style={{
          maxWidth: "360px",
          margin: "0 auto",
          padding: "60px 28px 120px",
          position: "relative",
          zIndex: 3,
          background: "#ffffff",
          boxShadow: "0 0 60px 40px #ffffff",
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
            fontSize: "clamp(1.05rem, 1.45vw, 1.2rem)",
            lineHeight: 1.85,
            letterSpacing: "0.025em",
            color: "rgba(0,0,0,0.82)",
            margin: "0 0 2em 0",
          }}>
            {project.description}
          </p>

          {/* Meta */}
          <div style={{
            borderTop: "1px solid rgba(0,0,0,0.07)",
            paddingTop: "24px",
            display: "flex",
            gap: "40px",
            flexWrap: "wrap",
          }}>
            {[
              { label: "TYPE",  value: "Feature Production" },
              { label: "YEAR",  value: "2025" },
              { label: "ROLE",  value: "Writer · Director · Actor" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: "0.65rem", letterSpacing: "0.25em", color: "rgba(0,0,0,0.4)", marginBottom: "4px" }}>{label}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "0.82rem", letterSpacing: "0.04em", color: "rgba(0,0,0,0.6)" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PULL QUOTE ── */}
      <div style={{ background: "#f5f5f4", padding: "clamp(60px, 8vw, 100px) clamp(24px, 8vw, 120px)", textAlign: "center" }}>
        <div style={{ fontSize: "0.72rem", letterSpacing: "0.3em", color: "rgba(0,0,0,0.35)", marginBottom: "32px" }}>
          — A NEW TERRAIN ENTERTAINMENT PRODUCTION
        </div>
        <blockquote style={{
          fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
          fontSize: "clamp(1.3rem, 2.6vw, 2.2rem)",
          fontWeight: 300,
          fontStyle: "italic",
          letterSpacing: "0.03em",
          lineHeight: 1.55,
          color: "rgba(0,0,0,0.76)",
          maxWidth: "760px",
          margin: "0 auto 28px",
        }}>
          "For a young filmmaker to write, direct, edit and star in his own film at such a young age with a small budget is an incredible feat. Jadon Cal is a promising talent and filmmaker."
        </blockquote>
        <div style={{ fontSize: "0.82rem", letterSpacing: "0.3em", color: "rgba(0,0,0,0.5)" }}>
          — YOSHI BARRIGAS
        </div>
      </div>

      {/* ── POSTER + CREDITS ── */}
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "clamp(60px, 7vw, 90px) clamp(24px, 5vw, 60px) clamp(80px, 10vw, 120px)",
        display: "flex",
        gap: "clamp(40px, 6vw, 90px)",
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}>
        {/* Poster */}
        <div style={{ flex: "0 0 auto", width: "clamp(160px, 22vw, 280px)" }}>
          <div style={{ borderRadius: "10px", overflow: "hidden", boxShadow: "0 28px 72px rgba(0,0,0,0.16), 0 6px 20px rgba(0,0,0,0.07)" }}>
            <img src="/images/off-rip/card.jpg" alt="Off Rip poster" style={{ width: "100%", display: "block" }} />
          </div>
        </div>

        {/* Credits */}
        <div style={{ flex: 1, minWidth: "260px" }}>
          <div style={{ fontSize: "0.78rem", letterSpacing: "0.3em", color: "rgba(0,0,0,0.45)", marginBottom: "40px" }}>CREDITS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            {/* Cast */}
            <div style={{ paddingRight: "clamp(20px, 3vw, 48px)", borderRight: "1px solid rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: "0.75rem", letterSpacing: "0.28em", color: "rgba(0,0,0,0.45)", marginBottom: "20px" }}>CAST</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {CAST.map(name => (
                  <div key={name} style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "clamp(0.82rem, 1vw, 0.95rem)", letterSpacing: "0.04em", color: "rgba(0,0,0,0.65)" }}>
                    {name}
                  </div>
                ))}
              </div>
            </div>
            {/* Crew */}
            <div style={{ paddingLeft: "clamp(20px, 3vw, 48px)" }}>
              <div style={{ fontSize: "0.75rem", letterSpacing: "0.28em", color: "rgba(0,0,0,0.45)", marginBottom: "20px" }}>CREW</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {CREW.map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: "0.65rem", letterSpacing: "0.25em", color: "rgba(0,0,0,0.38)", marginBottom: "4px" }}>{label.toUpperCase()}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "clamp(0.78rem, 0.95vw, 0.9rem)", letterSpacing: "0.03em", color: "rgba(0,0,0,0.6)", lineHeight: 1.5 }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", marginTop: "48px", paddingTop: "20px", fontSize: "0.68rem", letterSpacing: "0.25em", color: "rgba(0,0,0,0.35)" }}>
            NEW TERRAIN ENTERTAINMENT · 2025
          </div>
        </div>
      </div>

      {/* ── TRAILER ── */}
      <div style={{ background: "#000", padding: "clamp(60px, 7vw, 90px) 0" }}>
        <div style={{ fontSize: "0.78rem", letterSpacing: "0.3em", color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: "40px" }}>
          TRAILER
        </div>
        <div style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "0 clamp(24px, 5vw, 60px)",
        }}>
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: "12px", overflow: "hidden" }}>
            <iframe
              src="https://www.youtube.com/embed/4jG994PpM30"
              title="Off Rip — Official Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            />
          </div>
        </div>
        <div style={{ fontSize: "0.46rem", letterSpacing: "0.38em", color: "rgba(255,255,255,0.12)", textAlign: "center", marginTop: "40px" }}>
          NEW TERRAIN ENTERTAINMENT · 2025
        </div>
      </div>
    </div>
  );
}
