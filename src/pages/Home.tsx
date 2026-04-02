import { useEffect, useMemo, useState } from "react";
import { PROJECTS, WHATS_NEXT, type Project } from "../data/projects";
import { DEFAULT_CONFIG, type SiteConfig } from "../data/site-config";

interface PointerState {
  x: number;
  y: number;
}

const CARD_FLOAT_CLASSES = [
  "floatCard0",
  "floatCard1",
  "floatCard2",
  "floatCard3",
  "floatCard4",
  "floatCard5",
];

export default function Home() {
  const [phase, setPhase] = useState<"home" | "projects" | "detail">("home");
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [nameShake, setNameShake] = useState({ x: 0, y: 0 });
  const [blurProgress, setBlurProgress] = useState(1);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [projectPointer, setProjectPointer] = useState<PointerState>({ x: 0, y: 0 });

  useEffect(() => {
    fetch("/data/site-config.json")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) return;
        setConfig({
          ...DEFAULT_CONFIG,
          ...data,
          home: { ...DEFAULT_CONFIG.home, ...(data.home ?? {}) },
          styles: { ...DEFAULT_CONFIG.styles, ...(data.styles ?? {}) },
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const start = performance.now();
    const duration = 1800;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setBlurProgress(1 - eased);
      if (t < 1) requestAnimationFrame(animate);
    };
    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const selectedProjectIndex = useMemo(
    () => PROJECTS.findIndex((project) => project.id === selectedProjectId),
    [selectedProjectId],
  );

  const selectedProject =
    selectedProjectIndex >= 0 ? PROJECTS[selectedProjectIndex] : null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== "home") return;

    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (window.innerWidth / 2);
    const dy = (e.clientY - cy) / (window.innerHeight / 2);
    setNameShake({ x: -dx * 4, y: -dy * 4 });
  };

  const enterProjects = () => {
    setPhase("projects");
    setSelectedProjectId(null);
  };

  const goHome = () => {
    setPhase("home");
    setSelectedProjectId(null);
    setHoveredProject(null);
    setProjectPointer({ x: 0, y: 0 });
  };

  const openProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setPhase("detail");
  };

  const navigateProject = (direction: -1 | 1) => {
    if (selectedProjectIndex < 0) return;
    const nextIndex =
      (selectedProjectIndex + direction + PROJECTS.length) % PROJECTS.length;
    setSelectedProjectId(PROJECTS[nextIndex].id);
  };

  return (
    <div
      className="relative h-screen w-screen overflow-hidden select-none"
      style={{ background: "#ffffff", fontFamily: config.styles.fontFamily }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => phase === "home" && setNameShake({ x: 0, y: 0 })}
    >
      {phase === "home" && (
        <OpeningShot
          config={config}
          blurProgress={blurProgress}
          nameShake={nameShake}
          onEnter={enterProjects}
        />
      )}

      {phase === "projects" && (
        <ProjectsCloud
          config={config}
          hoveredProject={hoveredProject}
          onHoverProject={setHoveredProject}
          onOpenProject={openProject}
          onPointerChange={setProjectPointer}
          onResetPointer={() => {
            setProjectPointer({ x: 0, y: 0 });
            setHoveredProject(null);
          }}
          projectPointer={projectPointer}
          onGoHome={goHome}
        />
      )}

      {phase === "detail" && selectedProject && (
        <DetailView
          project={selectedProject}
          projectIndex={selectedProjectIndex}
          config={config}
          onBack={() => setPhase("projects")}
          onNavigateProject={navigateProject}
        />
      )}
    </div>
  );
}

function OpeningShot({
  config,
  blurProgress,
  nameShake,
  onEnter,
}: {
  config: SiteConfig;
  blurProgress: number;
  nameShake: { x: number; y: number };
  onEnter: () => void;
}) {
  const { home, styles } = config;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div
        onClick={onEnter}
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
            fontSize: styles.nameSize,
            fontWeight: styles.nameWeight,
            letterSpacing: styles.letterSpacing,
            opacity: parseFloat(styles.nameOpacity),
            lineHeight: 1,
          }}
        >
          {home.name}
        </div>
        <div
          className="mt-3 text-black"
          style={{
            fontSize: styles.surnameSize,
            letterSpacing: styles.surnameLetterSpacing,
            opacity: parseFloat(styles.surnameOpacity),
          }}
        >
          {home.surname}
        </div>
        <div
          className="mt-6 text-black"
          style={{
            fontSize: styles.clickSize,
            letterSpacing: styles.clickLetterSpacing,
            opacity: parseFloat(styles.clickOpacity),
          }}
        >
          {home.clickToEnter}
        </div>
      </div>

      <div
        className="absolute bottom-10 text-black"
        style={{
          fontSize: styles.taglineSize,
          letterSpacing: styles.letterSpacing,
          opacity: parseFloat(styles.taglineOpacity),
        }}
      >
        {home.tagline}
      </div>
      <div
        className="absolute bottom-6 right-8 text-black"
        style={{
          fontSize: "0.6rem",
          letterSpacing: "0.3em",
          opacity: parseFloat(styles.footerOpacity),
        }}
      >
        {home.footer}
      </div>
    </div>
  );
}

function ProjectsCloud({
  config,
  hoveredProject,
  onHoverProject,
  onOpenProject,
  onPointerChange,
  onResetPointer,
  projectPointer,
  onGoHome,
}: {
  config: SiteConfig;
  hoveredProject: string | null;
  onHoverProject: (id: string | null) => void;
  onOpenProject: (id: string) => void;
  onPointerChange: (pointer: PointerState) => void;
  onResetPointer: () => void;
  projectPointer: PointerState;
  onGoHome: () => void;
}) {
  const handleProjectsPointer = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    onPointerChange({ x, y });
  };

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center justify-between px-10 pt-10 pb-6">
        <button
          onClick={onGoHome}
          className="text-xs tracking-widest text-black opacity-30 transition-opacity hover:opacity-80"
          style={{ letterSpacing: "0.3em" }}
        >
          ← BACK
        </button>
        <div
          className="text-xs tracking-widest text-black opacity-20"
          style={{ letterSpacing: "0.4em" }}
        >
          SELECTED WORK
        </div>
        <a
          href="https://newterraincreative.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs tracking-widest text-black opacity-20 transition-opacity hover:opacity-80"
          style={{ letterSpacing: "0.3em" }}
        >
          NEW TERRAIN CREATIVE ↗
        </a>
      </div>

      <div
        className="project-atmosphere flex-1 px-6 pb-20 md:px-10"
        onMouseMove={handleProjectsPointer}
        onMouseLeave={onResetPointer}
      >
        <div className="project-atmosphere__veil" />
        <div className="project-atmosphere__grain" />
        <div className="project-atmosphere__halo" />

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project, index) => {
            const isHovered = hoveredProject === project.id;
            const hasOtherHover = hoveredProject && !isHovered;

            return (
              <div
                key={project.id}
                className="project-card-shell"
                style={{
                  transform: `translate3d(${projectPointer.x * (8 + index * 1.5)}px, ${projectPointer.y * (10 + index * 1.5)}px, 0)`,
                }}
              >
                <div
                  onClick={() => onOpenProject(project.id)}
                  onMouseEnter={() => onHoverProject(project.id)}
                  onMouseLeave={() => onHoverProject(null)}
                  className={`project-card cursor-pointer ${CARD_FLOAT_CLASSES[index]} ${isHovered ? "animate-pause" : ""}`}
                  style={{
                    opacity: hasOtherHover ? 0.3 : 1,
                    transform: `rotate(${projectPointer.x * (index % 2 === 0 ? -1.8 : 1.8)}deg) translateY(${isHovered ? "-14px" : "0px"}) scale(${isHovered ? 1.05 : 1})`,
                    transition: "transform 0.35s ease, opacity 0.35s ease",
                    zIndex: isHovered ? 10 : 1,
                  }}
                >
                  <div
                    className="group overflow-hidden rounded-[28px] border border-white/30 bg-white/12 backdrop-blur-md"
                    style={{
                      boxShadow: isHovered
                        ? "0 34px 110px rgba(22,24,29,0.28)"
                        : "0 22px 70px rgba(22,24,29,0.18)",
                    }}
                  >
                    <div
                      className="relative h-[24rem] w-full overflow-hidden"
                      style={{
                        background: `linear-gradient(160deg, ${project.color}, ${project.accentColor})`,
                      }}
                    >
                      {project.cardImage ? (
                        <img
                          src={project.cardImage}
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                        />
                      ) : (
                        <div
                          className="h-full w-full"
                          style={{
                            background: `linear-gradient(160deg, ${project.color}, ${project.accentColor})`,
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/18 to-transparent" />
                      <div className="absolute inset-0 project-card__glow" />
                      <div className="absolute inset-x-5 top-4 h-14 rounded-full bg-white/18 blur-2xl" />
                      <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[10px] tracking-[0.28em] text-white/80 backdrop-blur-sm">
                        {project.year}
                      </div>

                      <div
                        className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
                      >
                        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                          <div className="text-[10px] tracking-[0.36em] text-white/65">
                            {project.type.toUpperCase()}
                          </div>
                          <div className="mt-2 text-2xl font-semibold leading-none tracking-[0.08em]">
                            {project.title}
                          </div>
                          {project.logline && (
                            <div className="mt-3 max-w-xs text-xs leading-relaxed text-white/72">
                              {project.logline}
                            </div>
                          )}
                          <div className="mt-4 text-[11px] uppercase tracking-[0.28em] text-white/60">
                            Details
                          </div>
                          <div className="mt-3 space-y-1 text-sm leading-relaxed text-white/78">
                            <div>
                              {project.director !== "Unknown"
                                ? `Dir. ${project.director}`
                                : project.role}
                            </div>
                            <div>
                              {project.keyCast?.length
                                ? `Cast: ${project.keyCast.join(", ")}`
                                : project.role}
                            </div>
                            <div>
                              {project.year} / {project.type}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 bg-white/72 p-5 backdrop-blur-md">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] tracking-[0.35em] text-black/45">
                          {project.title.toUpperCase()}
                        </div>
                        <div className="text-[10px] tracking-[0.28em] text-black/30">
                          {project.buttonLabel ?? "OPEN"}
                        </div>
                      </div>
                      <div className="text-[11px] leading-relaxed text-black/58">
                        {project.logline ?? project.role}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <a
          href="/admin"
          target="_blank"
          className="absolute bottom-6 right-8 text-[10px] tracking-widest text-black opacity-50 transition-opacity hover:opacity-100"
          style={{ letterSpacing: "0.3em" }}
        >
          ADMIN ↗
        </a>
      </div>
    </div>
  );
}

function DetailView({
  project,
  projectIndex,
  config,
  onBack,
  onNavigateProject,
}: {
  project: Project;
  projectIndex: number;
  config: SiteConfig;
  onBack: () => void;
  onNavigateProject: (direction: -1 | 1) => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const paragraphs = project.description.split("\n\n").filter(Boolean);
  const galleryImages =
    project.images.length > 0
      ? project.images
      : project.cardImage
        ? [project.cardImage]
        : [];
  const activeVisual = galleryImages[activeImage] ?? project.cardImage;

  useEffect(() => {
    setActiveImage(0);
  }, [project.id]);

  useEffect(() => {
    if (galleryImages.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % galleryImages.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [galleryImages.length, project.id]);

  return (
    <div
      className="detail-atmosphere absolute inset-0 overflow-y-auto"
      style={{ background: "#f8f5f0", fontFamily: config.styles.fontFamily }}
    >
      <div
        className="detail-atmosphere__halo"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${project.accentColor}33, transparent 38%), radial-gradient(circle at 80% 18%, ${project.color}22, transparent 34%), radial-gradient(circle at 50% 70%, rgba(255,255,255,0.88), transparent 58%)`,
        }}
      />

      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 bg-white/85 px-6 py-6 backdrop-blur-sm md:px-10">
        <button
          onClick={onBack}
          className="text-xs tracking-widest text-black opacity-30 transition-opacity hover:opacity-80"
          style={{ letterSpacing: "0.3em" }}
        >
          ← BACK
        </button>
        <div
          className="text-xs tracking-widest text-black opacity-20"
          style={{ letterSpacing: "0.4em" }}
        >
          {String(projectIndex + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateProject(-1)}
            className="rounded-full border border-black/10 px-3 py-2 text-[10px] tracking-[0.28em] text-black/45 transition-colors hover:border-black/30 hover:text-black/75"
          >
            PREV
          </button>
          <button
            onClick={() => onNavigateProject(1)}
            className="rounded-full border border-black/10 px-3 py-2 text-[10px] tracking-[0.28em] text-black/45 transition-colors hover:border-black/30 hover:text-black/75"
          >
            NEXT
          </button>
        </div>
      </div>

      <div className="px-6 py-8 md:px-10 md:py-12">
        <div className="mx-auto max-w-5xl">
          {activeVisual && (
            <div className="detail-hero-panel overflow-hidden rounded-[36px] border border-white/40 bg-white/55 shadow-[0_28px_120px_rgba(0,0,0,0.14)] backdrop-blur-sm">
              <img
                src={activeVisual}
                alt={project.title}
                className="block h-[46vh] w-full object-cover md:h-[62vh]"
              />
            </div>
          )}

          <div className="mx-auto -mt-8 max-w-3xl rounded-[34px] border border-white/40 bg-white/72 p-8 text-center shadow-[0_22px_90px_rgba(0,0,0,0.09)] backdrop-blur-md md:p-10">
            <div
              className="mb-3 text-[10px] tracking-widest text-black/30"
              style={{ letterSpacing: "0.4em" }}
            >
              {project.type.toUpperCase()}
            </div>
            <h1
              className="text-4xl font-bold tracking-wider text-black md:text-5xl"
              style={{ letterSpacing: "0.12em" }}
            >
              {project.title}
            </h1>
            <div className="mt-4 grid grid-cols-1 gap-4 border-y border-black/5 py-5 text-center md:grid-cols-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-black/25">
                  Director
                </div>
                <div className="mt-2 text-sm text-black/72">
                  {project.director !== "Unknown" ? project.director : "TBA"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-black/25">
                  Key Cast
                </div>
                <div className="mt-2 text-sm text-black/72">
                  {project.keyCast?.join(", ") ?? "Jadon Cal Fitzpatrick"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-black/25">
                  Year / Format
                </div>
                <div className="mt-2 text-sm text-black/72">
                  {project.year} / {project.type}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-5 text-left">
              <div className="text-center text-[10px] uppercase tracking-[0.3em] text-black/25">
                Storyline
              </div>
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-sm leading-relaxed text-black md:text-[15px]"
                  style={{
                    fontFamily: config.styles.fontFamily,
                    opacity: index === 0 ? 0.9 : 0.68,
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-7 text-[11px] uppercase tracking-[0.3em] text-black/30">
              {project.role}
            </div>

            {project.externalLink && (
              <div className="mt-6">
                <a
                  href={project.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-black/10 px-4 py-3 text-[10px] tracking-[0.32em] text-black/55 transition-colors hover:border-black/30 hover:text-black/80"
                >
                  {project.buttonLabel ?? "OPEN LINK"} ↗
                </a>
              </div>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="mt-10 space-y-6">
              <div
                className="text-center text-[10px] uppercase tracking-[0.36em] text-black/25"
              >
                Floating Stills
              </div>
              <div className="detail-stills-cloud">
                {galleryImages.map((image, index) => {
                  const offset = index - activeImage;
                  const absOffset = Math.abs(offset);
                  const clampedOffset = Math.max(-2, Math.min(2, offset));
                  const translateX = clampedOffset * 9.5;
                  const translateY = absOffset === 0 ? 0 : 1.25 + absOffset * 0.65;
                  const rotate = clampedOffset * 5;
                  const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.9 : 0.8;
                  const opacity = absOffset > 2 ? 0 : absOffset === 0 ? 1 : absOffset === 1 ? 0.8 : 0.45;

                  return (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`detail-still-card detail-still-card--floating overflow-hidden rounded-[24px] border bg-white/60 text-left transition-all ${
                        activeImage === index
                          ? "border-black/30 shadow-[0_22px_70px_rgba(0,0,0,0.18)]"
                          : "border-black/10"
                      }`}
                      style={{
                        animationDelay: `${index * 0.35}s`,
                        transform: `translate3d(${translateX}rem, ${translateY}rem, 0) rotate(${rotate}deg) scale(${scale})`,
                        opacity,
                        zIndex: 10 - absOffset,
                      }}
                    >
                      <img
                        src={image}
                        alt={`${project.title} still ${index + 1}`}
                        className="block h-56 w-56 object-cover"
                      />
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-2">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Go to still ${index + 1}`}
                    onClick={() => setActiveImage(index)}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      activeImage === index ? "bg-black/55 scale-110" : "bg-black/15"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {project.id === "stream" && (
            <div className="mx-auto mt-14 max-w-3xl border-t border-black/5 pt-10 text-center">
              <div
                className="mb-4 text-[10px] tracking-widest text-black/20"
                style={{ letterSpacing: "0.4em" }}
              >
                WHAT'S NEXT
              </div>
              <div className="space-y-5 text-left">
                {WHATS_NEXT.description.split("\n\n").map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-sm leading-relaxed text-black md:text-[15px]"
                    style={{
                      fontFamily: config.styles.fontFamily,
                      opacity: index === 0 ? 0.85 : 0.65,
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
