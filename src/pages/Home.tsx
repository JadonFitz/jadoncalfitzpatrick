import { useState, useEffect, useRef } from "react";
import { PROJECTS, WHATS_NEXT, type Project } from "../data/projects";
import { DEFAULT_CONFIG, type SiteConfig } from "../data/site-config";

interface FloatState { x: number; y: number; r: number; }

// Each card gets a different parallax depth so they feel layered
const PARALLAX_DEPTHS = [22, 14, 28, 18, 24, 12];

export default function Home() {
  const [phase, setPhase] = useState<"home" | "projects" | "detail">("home");
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [nameShake, setNameShake] = useState({ x: 0, y: 0 });
  const [blurProgress, setBlurProgress] = useState(1);
  const [floats, setFloats] = useState<FloatState[]>(PROJECTS.map(() => ({ x: 0, y: 0, r: 0 })));
  const [smoothMouse, setSmoothMouse] = useState({ x: 0, y: 0 });
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageVisible, setPageVisible] = useState(true);

  const floatTimeRef = useRef(0);
  const animFrameRef = useRef<number>(0);
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const smoothMouseRef = useRef({ x: 0, y: 0 });

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

  // Float + mouse parallax animation loop
  useEffect(() => {
    if (phase !== "projects") return;
    const animate = () => {
      floatTimeRef.current += 0.004;

      // Smooth lerp mouse toward target (fluid, water-like lag)
      smoothMouseRef.current.x += (targetMouseRef.current.x - smoothMouseRef.current.x) * 0.038;
      smoothMouseRef.current.y += (targetMouseRef.current.y - smoothMouseRef.current.y) * 0.038;
      setSmoothMouse({ x: smoothMouseRef.current.x, y: smoothMouseRef.current.y });

      // Gentle balloon float — slow, low amplitude
      setFloats(PROJECTS.map((_, i) => ({
        x: Math.sin(floatTimeRef.current * 0.3 + i * 1.4) * 3.5,
        y: Math.cos(floatTimeRef.current * 0.22 + i * 1.0) * 5,
        r: Math.sin(floatTimeRef.current * 0.18 + i * 0.8) * 0.5,
      })));

      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      // Reset mouse when leaving projects
      targetMouseRef.current = { x: 0, y: 0 };
      smoothMouseRef.current = { x: 0, y: 0 };
    };
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

  const handleProjectsMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Normalize to -1..1
    targetMouseRef.current = {
      x: (e.clientX - cx) / (rect.width / 2),
      y: (e.clientY - cy) / (rect.height / 2),
    };
  };

  const handleProjectsMouseLeave = () => {
    targetMouseRef.current = { x: 0, y: 0 };
  };

  const changePage = (next: number) => {
    setPageVisible(false);
    setTimeout(() => {
      setPageIndex(next);
      setPageVisible(true);
    }, 220);
  };

  const enterProjects = () => { setPhase("projects"); setSelectedProject(null); setPageIndex(0); };
  const goHome = () => { setPhase("home"); setSelectedProject(null); };
  const openProject = (p: Project) => { setSelectedProject(p); setPhase("detail"); };

  const { home: h, styles: s } = config;
  const totalPages = Math.ceil(PROJECTS.length / 3);
  const visibleProjects = PROJECTS.slice(pageIndex * 3, pageIndex * 3 + 3);

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
        <div
          className="absolute inset-0 flex flex-col"
          style={{ background: "#f5f5f4" }}
          onMouseMove={handleProjectsMouseMove}
          onMouseLeave={handleProjectsMouseLeave}
        >
          {/* Nav */}
          <div className="flex justify-between items-center px-10 pt-10 pb-4 flex-shrink-0">
            <button
              onClick={goHome}
              className="text-black text-xs tracking-widest opacity-30 hover:opacity-80 transition-opacity"
              style={{ letterSpacing: "0.3em" }}
            >
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

          {/* Cards + arrows */}
          <div className="flex-1 flex items-center justify-center relative px-20 pb-10">

            {/* Left arrow */}
            <button
              onClick={() => changePage(pageIndex - 1)}
              disabled={pageIndex === 0}
              className="absolute left-6 z-20 flex items-center justify-center transition-all"
              style={{
                opacity: pageIndex === 0 ? 0 : 0.3,
                pointerEvents: pageIndex === 0 ? "none" : "auto",
                fontSize: "22px",
                color: "#000",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "12px",
                letterSpacing: "0",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={e => (e.currentTarget.style.opacity = pageIndex === 0 ? "0" : "0.3")}
            >
              ←
            </button>

            {/* Cards row */}
            <div
              className="flex items-center justify-center w-full h-full gap-8"
              style={{
                opacity: pageVisible ? 1 : 0,
                transition: "opacity 0.22s ease",
              }}
            >
              {visibleProjects.map((project) => {
                const i = PROJECTS.findIndex(p => p.id === project.id);
                const f = floats[i] ?? { x: 0, y: 0, r: 0 };
                const depth = PARALLAX_DEPTHS[i] ?? 16;
                // Anti-magnet: move opposite to mouse direction
                const px = -smoothMouse.x * depth;
                const py = -smoothMouse.y * depth;
                const isHovered = hoveredProject === project.id;
                const isDeemphasized = hoveredProject !== null && !isHovered;

                return (
                  <div
                    key={project.id}
                    onClick={() => openProject(project)}
                    onMouseEnter={() => setHoveredProject(project.id)}
                    onMouseLeave={() => setHoveredProject(null)}
                    className="cursor-pointer flex-shrink-0"
                    style={{
                      width: "28vw",
                      maxWidth: "380px",
                      minWidth: "220px",
                      transform: `translate(${f.x + px}px, ${f.y + py}px) rotate(${f.r}deg)`,
                      scale: isHovered ? "1.03" : "1",
                      // Only transition opacity + scale — never transition transform (JS lerp owns it)
                      transition: "opacity 0.6s ease, scale 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      opacity: isDeemphasized ? 0.32 : 1,
                      zIndex: isHovered ? 10 : 1,
                      willChange: "transform",
                    }}
                  >
                    {/* Card */}
                    <div
                      style={{
                        borderRadius: "20px",
                        overflow: "hidden",
                        background: "#ffffff",
                        border: "1px solid rgba(0,0,0,0.055)",
                        boxShadow: isHovered
                          ? "0 40px 100px rgba(0,0,0,0.15), 0 16px 40px rgba(0,0,0,0.08)"
                          : "0 16px 56px rgba(0,0,0,0.09), 0 4px 16px rgba(0,0,0,0.05)",
                        transition: "box-shadow 0.5s ease",
                      }}
                    >
                      {/* Poster / image area — ~72% of card height */}
                      <div
                        style={{
                          height: "52vh",
                          minHeight: "280px",
                          maxHeight: "480px",
                          position: "relative",
                          background: project.cardImage
                            ? `url(${project.cardImage}) center/cover no-repeat`
                            : `linear-gradient(168deg, ${project.color}18 0%, ${project.color}50 55%, ${project.color}90 100%)`,
                          overflow: "hidden",
                        }}
                      >
                        {/* Fog melt into white */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0, left: 0, right: 0,
                            height: "80px",
                            background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.9))",
                          }}
                        />
                      </div>

                      {/* Text — Times New Roman */}
                      <div
                        style={{
                          padding: "14px 20px 20px",
                          textAlign: "center",
                          background: "#ffffff",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: '"Times New Roman", Times, serif',
                            fontSize: "15px",
                            letterSpacing: "0.04em",
                            color: "rgba(0,0,0,0.82)",
                            lineHeight: 1.3,
                            marginBottom: "6px",
                          }}
                        >
                          {project.title}
                        </div>
                        <div
                          style={{
                            fontFamily: '"Times New Roman", Times, serif',
                            fontSize: "11px",
                            letterSpacing: "0.02em",
                            color: "rgba(0,0,0,0.32)",
                            fontStyle: "italic",
                          }}
                        >
                          ({project.type} / {project.year})
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => changePage(pageIndex + 1)}
              disabled={pageIndex >= totalPages - 1}
              className="absolute right-6 z-20 transition-all"
              style={{
                opacity: pageIndex >= totalPages - 1 ? 0 : 0.3,
                pointerEvents: pageIndex >= totalPages - 1 ? "none" : "auto",
                fontSize: "22px",
                color: "#000",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "12px",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={e => (e.currentTarget.style.opacity = pageIndex >= totalPages - 1 ? "0" : "0.3")}
            >
              →
            </button>
          </div>

          {/* Page dots */}
          <div className="flex justify-center gap-2 pb-8 flex-shrink-0">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => changePage(i)}
                style={{
                  width: i === pageIndex ? "20px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background: i === pageIndex ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.15)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* Admin link */}
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
