import { useState, useEffect, useRef } from "react";
import { PROJECTS, WHATS_NEXT, type Project } from "../data/projects";
import { DEFAULT_CONFIG, type SiteConfig } from "../data/site-config";

interface FloatState { x: number; y: number; r: number; }

const CARD_FLOAT_CLASSES = [
  "floatCard1",
  "floatCard2",
  "floatCard3",
  "floatCard4",
  "floatCard5",
  "floatCard6",
];

export default function Home() {
  const [phase, setPhase] = useState<"home" | "projects" | "detail">("home");
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [nameShake, setNameShake] = useState({ x: 0, y: 0 });
  const [blurProgress, setBlurProgress] = useState(1);
  const [floats, setFloats] = useState<FloatState[]>(PROJECTS.map(() => ({ x: 0, y: 0, r: 0 })));
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const floatTimeRef = useRef(0);
  const animFrameRef = useRef<number>(0);

  // Load site config
  useEffect(() => {
    fetch("/data/site-config.json")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setConfig({ ...DEFAULT_CONFIG, ...data, home: { ...DEFAULT_CONFIG.home, ...(data.home || {}) }, styles: { ...DEFAULT_CONFIG.styles, ...(data.styles || {}) } });
      })
      .catch(() => {});
  }, []);

  // Blur-to-focus on mount
  useEffect(() => {
    const start = performance.now();
    const duration = 1800;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setBlurProgress(1 - eased);
      if (t < 1) requestAnimationFrame(animate);
    };
    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Float animation
  useEffect(() => {
    if (phase !== "projects") return;
    const animate = () => {
      floatTimeRef.current += 0.006;
      setFloats(PROJECTS.map((_, i) => ({
        x: Math.sin(floatTimeRef.current * 0.4 + i * 1.3) * 5,
        y: Math.cos(floatTimeRef.current * 0.3 + i * 0.9) * 7,
        r: Math.sin(floatTimeRef.current * 0.25 + i * 0.7) * 1.5,
      })));
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase === "home") {
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);
      setNameShake({ x: -dx * 4, y: -dy * 4 });
    }
  };

  const enterProjects = () => { setPhase("projects"); setSelectedProject(null); };
  const goHome = () => { setPhase("home"); setSelectedProject(null); };
  const openProject = (p: Project) => { setSelectedProject(p); setPhase("detail"); };

  const { home: h, styles: s } = config;

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none"
      style={{ background: "#ffffff", fontFamily: s.fontFamily }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => phase === "home" && setNameShake({ x: 0, y: 0 })}
    >
      {/* HOME STATE */}
      {phase === "home" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            onClick={enterProjects}
            className="cursor-pointer text-center"
            style={{
              transform: `translate(${nameShake.x}px, ${nameShake.y}px)`,
              transition: "transform 0.12s ease-out",
              filter: `blur(${blurProgress * 24}px)`,
              opacity: 1 - blurProgress * 0.3,
            }}
          >
            <div
              className="text-black"
              style={{
                fontSize: s.nameSize,
                fontWeight: s.nameWeight,
                letterSpacing: s.letterSpacing,
                opacity: parseFloat(s.nameOpacity),
                lineHeight: 1,
              }}
            >
              {h.name}
            </div>
            <div
              className="text-black mt-3"
              style={{
                fontSize: s.surnameSize,
                letterSpacing: s.surnameLetterSpacing,
                opacity: parseFloat(s.surnameOpacity),
              }}
            >
              {h.surname}
            </div>
            <div
              className="text-black mt-6"
              style={{
                fontSize: s.clickSize,
                letterSpacing: s.clickLetterSpacing,
                opacity: parseFloat(s.clickOpacity),
              }}
            >
              {h.clickToEnter}
            </div>
          </div>
          <div
            className="absolute bottom-10 text-black"
            style={{ fontSize: s.taglineSize, letterSpacing: s.letterSpacing, opacity: parseFloat(s.taglineOpacity) }}
          >
            {h.tagline}
          </div>
          <div
            className="absolute bottom-6 right-8 text-black"
            style={{ fontSize: "0.6rem", letterSpacing: "0.3em", opacity: parseFloat(s.footerOpacity) }}
          >
            {h.footer}
          </div>
        </div>
      )}

      {/* PROJECTS STATE */}
      {phase === "projects" && (
        <div className="absolute inset-0 flex flex-col">
          <div className="flex justify-between items-center px-10 pt-10 pb-6">
            <button onClick={goHome} className="text-black text-xs tracking-widest opacity-30 hover:opacity-80 transition-opacity" style={{ letterSpacing: "0.3em" }}>
              ← BACK
            </button>
            <div className="text-black text-xs tracking-widest opacity-20" style={{ letterSpacing: "0.4em" }}>
              SELECTED WORK
            </div>
            <a
              href="https://newterraincreative.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black text-xs tracking-widest opacity-20 hover:opacity-80 transition-opacity"
              style={{ letterSpacing: "0.3em" }}
            >
              NEW TERRAIN CREATIVE ↗
            </a>
          </div>

          {/* Grid: 2 rows × 3 cols, centered */}
          <div className="flex-1 flex items-center justify-center px-16">
            <div className="grid grid-cols-3 gap-x-16 gap-y-16 w-full max-w-4xl">
              {PROJECTS.map((project, i) => (
                <div
                  key={project.id}
                  onClick={() => openProject(project)}
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                  className={`cursor-pointer ${CARD_FLOAT_CLASSES[i]} ${hoveredProject === project.id ? "animate-pause" : ""}`}
                  style={{
                    opacity: hoveredProject && hoveredProject !== project.id ? 0.35 : 1,
                    transform: hoveredProject === project.id ? "scale(1.06)" : "scale(1)",
                    transition: "all 0.3s ease",
                    zIndex: hoveredProject === project.id ? 10 : 1,
                  }}
                >
                  <div
                    className="rounded-sm p-4 flex flex-col items-center"
                    style={{
                      background: project.color,
                      boxShadow: hoveredProject === project.id ? "0 16px 48px rgba(0,0,0,0.2)" : "0 6px 20px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div className="w-16 h-10 rounded-sm mb-2 overflow-hidden">
                      <div className="w-full h-full" style={{ background: project.accentColor }} />
                    </div>
                    <div className="text-white text-xs font-bold text-center leading-tight tracking-wider" style={{ letterSpacing: "0.08em" }}>
                      {project.title}
                    </div>
                    <div className="text-white/40 text-[9px] mt-2 text-center leading-tight">
                      {project.role.split(" / ").map((r, idx) => (
                        <div key={idx}>{r}</div>
                      ))}
                    </div>
                    <div className="text-white/20 text-[8px] mt-2 tracking-widest">{project.year}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ADMIN link — bottom right */}
          <a
            href="/admin"
            target="_blank"
            className="absolute bottom-6 right-8 text-black text-[10px] tracking-widest opacity-50 hover:opacity-100 transition-opacity"
            style={{ letterSpacing: "0.3em" }}
          >
            ADMIN ↗
          </a>
        </div>
      )}

      {/* DETAIL STATE */}
      {phase === "detail" && selectedProject && (
        <DetailView project={selectedProject} config={config} onBack={() => setPhase("projects")} />
      )}
    </div>
  );
}

function DetailView({ project, config, onBack }: { project: Project; config: SiteConfig; onBack: () => void }) {
  const { home: h } = config;
  const paragraphs = project.description.split("\n\n").filter(Boolean);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#ffffff", fontFamily: config.styles.fontFamily }}>
      {/* Top nav */}
      <div className="flex justify-between items-center px-10 pt-10">
        <button onClick={onBack} className="text-black text-xs tracking-widest opacity-30 hover:opacity-80 transition-opacity" style={{ letterSpacing: "0.3em" }}>
          ← BACK
        </button>
        <div className="text-black text-xs tracking-widest opacity-20" style={{ letterSpacing: "0.4em" }}>
          {project.year}
        </div>
        <div className="w-16" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-16 py-8">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div>
            <div className="text-black text-[10px] tracking-widest opacity-30 mb-3" style={{ letterSpacing: "0.4em" }}>
              {project.type.toUpperCase()}
            </div>
            <h1 className="text-black text-4xl font-bold tracking-wider" style={{ letterSpacing: "0.15em" }}>
              {project.title}
            </h1>
            <div className="text-black/40 text-xs mt-3 tracking-widest" style={{ letterSpacing: "0.25em" }}>
              {project.role}
            </div>
            {project.director && project.director !== "Unknown" && (
              <div className="text-black/20 text-[10px] mt-1 tracking-widest" style={{ letterSpacing: "0.3em" }}>
                DIR. {project.director}
              </div>
            )}
          </div>

          <div className="space-y-5">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-black text-sm leading-relaxed" style={{ fontFamily: config.styles.fontFamily, opacity: i === 0 ? 0.85 : 0.65 }}>
                {para}
              </p>
            ))}
          </div>

          <div className="pt-4">
            <div className="text-black/20 text-[10px] tracking-widest" style={{ letterSpacing: "0.4em" }}>
              {project.year}
            </div>
          </div>
        </div>
      </div>

      {/* What's Next — only on last project */}
      {project.id === "stream" && (
        <div className="border-t border-black/5 px-16 py-12">
          <div className="max-w-2xl">
            <div className="text-black text-[10px] tracking-widest opacity-20 mb-4" style={{ letterSpacing: "0.4em" }}>
              WHAT'S NEXT
            </div>
            <div className="space-y-5">
              {WHATS_NEXT.description.split("\n\n").map((para, i) => (
                <p key={i} className="text-black text-sm leading-relaxed" style={{ fontFamily: config.styles.fontFamily, opacity: i === 0 ? 0.85 : 0.65 }}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
