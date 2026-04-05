import { useState, useEffect, useRef } from "react";
import type { Project } from "../data/projects";
import type { SiteConfig } from "../data/site-config";

interface Props {
  project: Project;
  config: SiteConfig;
  onBack: () => void;
}

interface FloatState { x: number; y: number; r: number; }

const STILL_W = "39.1vw";
const STILLS = [
  { src: "/images/robbie/still-1.jpg", side: "left"  as const, topCalc: "calc(80px)",                   phase: 0.0,  depth: 18 },
  { src: "/images/robbie/still-2.jpg", side: "right" as const, topCalc: "calc(80px + 13.75vw)",         phase: 1.3,  depth: 22 },
  { src: "/images/robbie/still-3.jpg", side: "left"  as const, topCalc: "calc(80px + 27.5vw)",          phase: 2.6,  depth: 15 },
];

const CREW = [
  { label: "Directed by", value: "Kyle Perritt" },
  { label: "Genre", value: "Horror" },
];

const CAST = [
  "Madeleine McGraw",
  "Jadon Cal",
  "Jason Davis",
];

export default function RobbieDetail({ project, config, onBack }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 120);
    return () => clearTimeout(t);
  }, []);

  const floatTimeRef   = useRef(0);
  const animFrameRef   = useRef<number>(0);
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const smoothMouseRef = useRef({ x: 0, y: 0 });
  const [floats, setFloats]           = useState<FloatState[]>(STILLS.map(() => ({ x: 0, y: 0, r: 0 })));
  const [smoothMouse, setSmoothMouse] = useState({ x: 0, y: 0 });
  const zoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobile) return;
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
  }, [isMobile]);

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
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>

      <button
        onClick={onBack}
        className="fixed z-50 text-xs tracking-widest"
        style={{
          top: isMobile ? "20px" : "40px",
          left: isMobile ? "20px" : "40px",
          letterSpacing: "0.3em",
          color: "#000",
          opacity: 0.3,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "0.3")}
      >
        ← BACK
      </button>

      <div style={{ textAlign: "center", padding: isMobile ? "64px 20px 0" : "80px 24px 0" }}>
        <div style={{
          fontSize: isMobile ? "0.6rem" : "1.15rem",
          letterSpacing: isMobile ? "0.12em" : "0.3em",
          color: "rgba(0,0,0,0.4)",
          marginBottom: "20px",
          lineHeight: isMobile ? 1.6 : 1,
        }}>
          NEW TERRAIN ENTERTAINMENT · SHORT FILM · 2023
        </div>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
          fontSize: "clamp(3rem, 8vw, 7rem)",
          fontWeight: 300,
          letterSpacing: "0.15em",
          color: "#000",
          lineHeight: 0.95,
          margin: 0,
        }}>
          ROBBIE
        </h1>
        <div style={{
          fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
          fontSize: isMobile ? "0.9rem" : "clamp(1.1rem, 1.5vw, 1.4rem)",
          fontStyle: "italic",
          letterSpacing: "0.1em",
          color: "rgba(0,0,0,0.28)",
          marginTop: "16px",
        }}>
          Ain't Right No More
        </div>
        <div style={{ width: "1px", height: "48px", background: "rgba(0,0,0,0.08)", margin: "32px auto 0" }} />
      </div>

      {isMobile ? (
        <div style={{ padding: "0 24px 60px" }}>
          <div style={{ maxWidth: "560px", margin: "0 auto", padding: "48px 0 40px" }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontSize: "1.05rem",
              lineHeight: 1.85,
              letterSpacing: "0.025em",
              color: "rgba(0,0,0,0.82)",
              margin: "0 0 2em 0",
            }}>
              {project.description}
            </p>
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: "24px", display: "flex", gap: "28px", flexWrap: "wrap" }}>
              {[
                { label: "TYPE", value: "Short Film" },
                { label: "YEAR", value: "2023" },
                { label: "ROLE", value: "Lead Actor" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: "0.6rem", letterSpacing: "0.22em", color: "rgba(0,0,0,0.4)", marginBottom: "3px" }}>{label}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "0.9rem", letterSpacing: "0.04em", color: "rgba(0,0,0,0.6)" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxWidth: "560px", margin: "0 auto" }}>
            {STILLS.map((still, i) => (
              <div
                key={i}
                onClick={() => setLightbox(still.src)}
                style={{
                  cursor: "zoom-in",
                  overflow: "hidden",
                  borderRadius: "4px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
                  filter: revealed ? "blur(0px)" : "blur(12px)",
                  opacity: revealed ? 1 : 0,
                  transition: `filter 2s ease ${i * 0.1}s, opacity 1.4s ease ${i * 0.1}s`,
                }}
              >
                <img src={still.src} alt="" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={zoneRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { targetMouseRef.current = { x: 0, y: 0 }; }}
          style={{ position: "relative", minHeight: "calc(80px + 60vw)", overflowX: "hidden" }}
        >
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
                  ...(still.side === "left" ? { left: 0 } : { right: 0 }),
                  width:     STILL_W,
                  transform: `translate(${f.x + px}px, ${f.y + py}px) rotate(${f.r}deg)`,
                  filter:    revealed ? "blur(0px)"  : "blur(18px)",
                  opacity:   revealed ? 1            : 0,
                  transition: `filter 2.4s ease ${delay}, opacity 1.8s ease ${delay}`,
                  zIndex: 1,
                  willChange: "transform",
                }}
              >
                <div
                  onClick={() => setLightbox(still.src)}
                  style={{
                    overflow: "hidden",
                    cursor: "zoom-in",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.22), 0 6px 18px rgba(0,0,0,0.12)",
                    borderRadius: "4px",
                  }}
                >
                  <img src={still.src} alt="" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }} />
                </div>
              </div>
            );
          })}

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
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: "24px", display: "flex", gap: "40px", flexWrap: "wrap" }}>
              {[
                { label: "TYPE",  value: "Short Film" },
                { label: "YEAR",  value: "2023" },
                { label: "ROLE",  value: "Lead Actor" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: "1.04rem", letterSpacing: "0.25em", color: "rgba(0,0,0,0.4)", marginBottom: "4px" }}>{label}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', 'Times New Roman', serif", fontSize: "1.31rem", letterSpacing: "0.04em", color: "rgba(0,0,0,0.6)" }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: "#f5f5f4",
        padding: isMobile ? "48px 28px" : "clamp(60px, 8vw, 100px) clamp(24px, 8vw, 120px)",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: isMobile ? "0.6rem" : "1.15rem",
          letterSpacing: isMobile ? "0.12em" : "0.3em",
          color: "rgba(0,0,0,0.35)",
          marginBottom: "32px",
          lineHeight: isMobile ? 1.6 : 1,
        }}>
          — CINIFIED REVIEW
        </div>
        <blockquote style={{
          fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
          fontSize: isMobile ? "1.15rem" : "clamp(1.3rem, 2.6vw, 2.2rem)",
          fontWeight: 300,
          fontStyle: "italic",
          letterSpacing: "0.03em",
          lineHeight: 1.55,
          color: "rgba(0,0,0,0.76)",
          maxWidth: "760px",
          margin: "0 auto 28px",
        }}>
          "Jadon Cal's titular Robbie is compelling in his delivery, as he shares a tense nature to his actions and delirious presence."
        </blockquote>
        <div style={{ fontSize: "0.82rem", letterSpacing: "0.3em", color: "rgba(0,0,0,0.5)" }}>
          — CONNOR PETREY
        </div>
      </div>

      <div style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: isMobile
          ? "48px 24px 72px"
          : "clamp(60px, 7vw, 90px) clamp(24px, 5vw, 60px) clamp(80px, 10vw, 120px)",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? "36px" : "clamp(40px, 6vw, 90px)",
        alignItems: "flex-start",
      }}>
        <div style={{ flex: "0 0 auto", width: isMobile ? "140px" : "clamp(160px, 22vw, 280px)" }}>
          <div style={{ borderRadius: "10px", overflow: "hidden", boxShadow: "0 28px 72px rgba(0,0,0,0.16), 0 6px 20px rgba(0,0,0,0.07)" }}>
            <img src="/images/robbie/card.jpg" alt="Robbie poster" style={{ width: "100%", display: "block" }} />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: isMobile ? "0.7rem" : "1.25rem", letterSpacing: "0.3em", color: "rgba(0,0,0,0.45)", marginBottom: "40px" }}>CREDITS</div>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "40px" : 0,
          }}>
            <div style={isMobile ? {} : { paddingRight: "clamp(20px, 3vw, 48px)", borderRight: "1px solid rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: isMobile ? "0.65rem" : "1.2rem", letterSpacing: "0.28em", color: "rgba(0,0,0,0.45)", marginBottom: "20px" }}>CAST</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {CAST.map(name => (
                  <div key={name} style={{
                    fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
                    fontSize: isMobile ? "0.9rem" : "clamp(1.31rem, 1.6vw, 1.52rem)",
                    letterSpacing: "0.04em",
                    color: "rgba(0,0,0,0.65)",
                  }}>
                    {name}
                  </div>
                ))}
              </div>
            </div>
            <div style={isMobile ? {} : { paddingLeft: "clamp(20px, 3vw, 48px)" }}>
              <div style={{ fontSize: isMobile ? "0.65rem" : "1.2rem", letterSpacing: "0.28em", color: "rgba(0,0,0,0.45)", marginBottom: "20px" }}>CREW</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {CREW.map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: isMobile ? "0.55rem" : "1.04rem", letterSpacing: "0.25em", color: "rgba(0,0,0,0.38)", marginBottom: "4px" }}>{label.toUpperCase()}</div>
                    <div style={{
                      fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
                      fontSize: isMobile ? "0.85rem" : "clamp(1.25rem, 1.52vw, 1.44rem)",
                      letterSpacing: "0.03em",
                      color: "rgba(0,0,0,0.6)",
                      lineHeight: 1.5,
                    }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{
            borderTop: "1px solid rgba(0,0,0,0.08)",
            marginTop: "48px",
            paddingTop: "20px",
            fontSize: isMobile ? "0.55rem" : "1.09rem",
            letterSpacing: isMobile ? "0.15em" : "0.25em",
            color: "rgba(0,0,0,0.35)",
          }}>
            NEW TERRAIN ENTERTAINMENT · 2023
          </div>
        </div>
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <img
            src={lightbox}
            alt=""
            style={{
              maxWidth: "92vw",
              maxHeight: "88vh",
              objectFit: "contain",
              borderRadius: "4px",
              boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
            }}
          />
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute",
              top: "24px",
              right: "32px",
              color: "rgba(255,255,255,0.5)",
              background: "none",
              border: "none",
              fontSize: "1.2rem",
              letterSpacing: "0.3em",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
          >
            ✕ CLOSE
          </button>
        </div>
      )}
    </div>
  );
}
