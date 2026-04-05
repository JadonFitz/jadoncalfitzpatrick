import { useState, useEffect, useRef } from "react";
import { PROJECTS, type Project } from "../data/projects";
import { DEFAULT_CONFIG, type SiteConfig } from "../data/site-config";
import ProjectCard from "../components/ProjectCard";
import DetailView from "../components/DetailView";

interface FloatState { x: number; y: number; r: number; }

// Card expansion animation state
type ExpandPhase = "pre" | "expanding" | "open" | "closing";
interface ExpandState {
  project: Project;
  cardRect: DOMRect;
  phase: ExpandPhase;
}

const PARALLAX_DEPTHS = [22, 14, 28, 18, 24, 12];

function parseHash(): { phase: "home" | "projects"; projectId: string | null } {
  const hash = window.location.hash.replace("#", "");
  if (hash.startsWith("projects/")) return { phase: "projects", projectId: hash.slice(9) };
  if (hash === "projects") return { phase: "projects", projectId: null };
  return { phase: "home", projectId: null };
}

export default function Home() {
  const initial = parseHash();
  const [phase, setPhase] = useState<"home" | "projects">(initial.phase);
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [nameShake, setNameShake] = useState({ x: 0, y: 0 });
  const [blurProgress, setBlurProgress] = useState(1);
  const [floats, setFloats] = useState<FloatState[]>(PROJECTS.map(() => ({ x: 0, y: 0, r: 0 })));
  const [smoothMouse, setSmoothMouse] = useState({ x: 0, y: 0 });
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageVisible, setPageVisible] = useState(true);

  // If refreshed directly on a project, open it immediately (no card animation)
  const initialProject = initial.projectId ? PROJECTS.find(p => p.id === initial.projectId) ?? null : null;
  const [expand, setExpand] = useState<ExpandState | null>(
    initialProject
      ? { project: initialProject, cardRect: new DOMRect(0, 0, window.innerWidth, window.innerHeight), phase: "open" }
      : null
  );

  const floatTimeRef   = useRef(0);
  const animFrameRef   = useRef<number>(0);
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const smoothMouseRef = useRef({ x: 0, y: 0 });

  // Load site config
  useEffect(() => {
    fetch("/data/site-config.json")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setConfig({
          ...DEFAULT_CONFIG,
          ...data,
          home:   { ...DEFAULT_CONFIG.home,   ...(data.home   || {}) },
          styles: { ...DEFAULT_CONFIG.styles, ...(data.styles || {}) },
        });
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

  // Float + mouse parallax loop — runs in projects phase
  useEffect(() => {
    if (phase !== "projects") return;
    const animate = () => {
      floatTimeRef.current += 0.004;
      smoothMouseRef.current.x += (targetMouseRef.current.x - smoothMouseRef.current.x) * 0.038;
      smoothMouseRef.current.y += (targetMouseRef.current.y - smoothMouseRef.current.y) * 0.038;
      setSmoothMouse({ ...smoothMouseRef.current });
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
      targetMouseRef.current = { x: 0, y: 0 };
      smoothMouseRef.current = { x: 0, y: 0 };
    };
  }, [phase]);

  const handleHomeMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== "home") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    setNameShake({
      x: -((e.clientX - cx) / (window.innerWidth  / 2)) * 4,
      y: -((e.clientY - cy) / (window.innerHeight / 2)) * 4,
    });
  };

  const handleProjectsMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    targetMouseRef.current = {
      x: (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2),
      y: (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2),
    };
  };

  // Sync hash → state on browser back/forward
  useEffect(() => {
    const onPop = () => {
      const { phase: p, projectId } = parseHash();
      setPhase(p);
      if (projectId) {
        const project = PROJECTS.find(pr => pr.id === projectId);
        if (project) {
          setExpand({ project, cardRect: new DOMRect(0, 0, window.innerWidth, window.innerHeight), phase: "open" });
        }
      } else {
        setExpand(null);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const changePage = (next: number) => {
    setPageVisible(false);
    setTimeout(() => { setPageIndex(next); setPageVisible(true); }, 220);
  };

  const enterProjects = () => {
    setPhase("projects");
    setPageIndex(0);
    history.pushState(null, "", "#projects");
  };

  const goHome = () => {
    setPhase("home");
    history.pushState(null, "", "#");
  };

  // Open project: animate card → fullscreen
  const openProject = (project: Project, cardRect: DOMRect) => {
    history.pushState(null, "", `#projects/${project.id}`);
    setExpand({ project, cardRect, phase: "pre" });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExpand(prev => prev ? { ...prev, phase: "expanding" } : null);
      });
    });
  };

  // Back: collapse overlay
  const handleBack = () => {
    history.pushState(null, "", "#projects");
    setExpand(prev => prev ? { ...prev, phase: "closing" } : null);
  };

  const handleOverlayTransitionEnd = () => {
    setExpand(prev => {
      if (!prev) return null;
      if (prev.phase === "expanding") return { ...prev, phase: "open" };
      if (prev.phase === "closing")   return null;
      return prev;
    });
  };

  const { home: h, styles: s } = config;
  const totalPages     = Math.ceil(PROJECTS.length / 3);
  const visibleProjects = PROJECTS.slice(pageIndex * 3, pageIndex * 3 + 3);

  // Clip-path values for the expansion overlay
  const cardClip = expand
    ? `inset(${expand.cardRect.top}px ${window.innerWidth - expand.cardRect.right}px ${window.innerHeight - expand.cardRect.bottom}px ${expand.cardRect.left}px round 20px)`
    : "inset(0px 0px 0px 0px round 0px)";

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none"
      style={{ background: "#ffffff", fontFamily: s.fontFamily }}
      onMouseMove={handleHomeMouseMove}
      onMouseLeave={() => phase === "home" && setNameShake({ x: 0, y: 0 })}
    >
      {/* ── HOME ── */}
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
            <div className="text-black" style={{ fontSize: s.nameSize, fontWeight: s.nameWeight, letterSpacing: s.letterSpacing, opacity: parseFloat(s.nameOpacity), lineHeight: 1 }}>
              {h.name}
            </div>
            <div className="text-black mt-3" style={{ fontSize: s.surnameSize, letterSpacing: s.surnameLetterSpacing, opacity: parseFloat(s.surnameOpacity) }}>
              {h.surname}
            </div>
            <div className="text-black mt-6" style={{ fontSize: s.clickSize, letterSpacing: s.clickLetterSpacing, opacity: parseFloat(s.clickOpacity) }}>
              {h.clickToEnter}
            </div>
          </div>
          <div className="absolute bottom-10 text-black" style={{ fontSize: s.taglineSize, letterSpacing: s.letterSpacing, opacity: parseFloat(s.taglineOpacity) }}>
            {h.tagline}
          </div>
          <div className="absolute bottom-6 right-8 text-black" style={{ fontSize: "0.6rem", letterSpacing: "0.3em", opacity: parseFloat(s.footerOpacity) }}>
            {h.footer}
          </div>
        </div>
      )}

      {/* ── PROJECTS ── */}
      {phase === "projects" && (
        <div
          className="absolute inset-0 flex flex-col"
          style={{ background: "#f5f5f4" }}
          onMouseMove={handleProjectsMouseMove}
          onMouseLeave={() => { targetMouseRef.current = { x: 0, y: 0 }; }}
        >
          {/* Nav */}
          <div className="flex justify-between items-center px-10 pt-10 pb-4 flex-shrink-0">
            <button onClick={goHome} className="text-black text-xs tracking-widest opacity-30 hover:opacity-80 transition-opacity" style={{ letterSpacing: "0.3em" }}>
              ← BACK
            </button>
            <div className="text-black text-xs tracking-widest opacity-20" style={{ letterSpacing: "0.4em" }}>SELECTED WORK</div>
            <a href="https://newterraincreative.com" target="_blank" rel="noopener noreferrer" className="text-black text-xs tracking-widest opacity-20 hover:opacity-80 transition-opacity" style={{ letterSpacing: "0.3em" }}>
              NEW TERRAIN CREATIVE ↗
            </a>
          </div>

          {/* Cards + arrows */}
          <div className="flex-1 flex items-center justify-center relative px-20 pb-10">
            <button
              onClick={() => changePage(pageIndex - 1)}
              disabled={pageIndex === 0}
              className="absolute left-6 z-20 transition-all"
              style={{ opacity: pageIndex === 0 ? 0 : 0.3, pointerEvents: pageIndex === 0 ? "none" : "auto", fontSize: "22px", color: "#000", background: "none", border: "none", cursor: "pointer", padding: "12px" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={e => (e.currentTarget.style.opacity = pageIndex === 0 ? "0" : "0.3")}
            >←</button>

            <div className="flex items-center justify-center w-full h-full gap-8" style={{ opacity: pageVisible ? 1 : 0, transition: "opacity 0.22s ease" }}>
              {visibleProjects.map((project) => {
                const i = PROJECTS.findIndex(p => p.id === project.id);
                const depth = PARALLAX_DEPTHS[i] ?? 16;
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    float={floats[i] ?? { x: 0, y: 0, r: 0 }}
                    parallaxOffset={{ x: -smoothMouse.x * depth, y: -smoothMouse.y * depth }}
                    isHovered={hoveredProject === project.id}
                    isDeemphasized={hoveredProject !== null && hoveredProject !== project.id}
                    onHover={setHoveredProject}
                    onClick={openProject}
                  />
                );
              })}
            </div>

            <button
              onClick={() => changePage(pageIndex + 1)}
              disabled={pageIndex >= totalPages - 1}
              className="absolute right-6 z-20 transition-all"
              style={{ opacity: pageIndex >= totalPages - 1 ? 0 : 0.3, pointerEvents: pageIndex >= totalPages - 1 ? "none" : "auto", fontSize: "22px", color: "#000", background: "none", border: "none", cursor: "pointer", padding: "12px" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={e => (e.currentTarget.style.opacity = pageIndex >= totalPages - 1 ? "0" : "0.3")}
            >→</button>
          </div>

          {/* Page dots */}
          <div className="flex justify-center gap-2 pb-8 flex-shrink-0">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => changePage(i)}
                style={{ width: i === pageIndex ? "20px" : "6px", height: "6px", borderRadius: "3px", background: i === pageIndex ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.15)", border: "none", cursor: "pointer", transition: "all 0.3s ease", padding: 0 }}
              />
            ))}
          </div>

          <a href="/admin" target="_blank" className="absolute bottom-6 right-8 text-black text-[10px] tracking-widest opacity-50 hover:opacity-100 transition-opacity" style={{ letterSpacing: "0.3em" }}>
            ADMIN ↗
          </a>
        </div>
      )}

      {/* ── EXPANSION OVERLAY ── */}
      {expand && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "#ffffff",
            overflow: "hidden",
            clipPath: expand.phase === "pre" ? cardClip : "inset(0px 0px 0px 0px round 0px)",
            opacity: expand.phase === "closing" ? 0 : 1,
            transition: expand.phase === "pre"
              ? "none"
              : expand.phase === "closing"
                ? "opacity 0.45s ease"
                : "clip-path 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
          onTransitionEnd={handleOverlayTransitionEnd}
        >
          {/* Detail content — fades in once expansion is complete */}
          {expand.phase === "open" && (
            <DetailView
              project={expand.project}
              config={config}
              onBack={handleBack}
            />
          )}
        </div>
      )}
    </div>
  );
}
