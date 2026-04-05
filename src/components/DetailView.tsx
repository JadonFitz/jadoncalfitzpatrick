import type { Project } from "../data/projects";
import type { SiteConfig } from "../data/site-config";
import { WHATS_NEXT } from "../data/projects";
import OffRipDetail from "./OffRipDetail";
import RobbieDetail from "./RobbieDetail";

interface Props {
  project: Project;
  config: SiteConfig;
  onBack: () => void;
}

export default function DetailView({ project, config, onBack }: Props) {
  if (project.id === "off-rip") {
    return <OffRipDetail project={project} config={config} onBack={onBack} />;
  }
  if (project.id === "robbie") {
    return <RobbieDetail project={project} config={config} onBack={onBack} />;
  }

  const paragraphs = project.description.split("\n\n").filter(Boolean);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#ffffff", fontFamily: config.styles.fontFamily }}>
      {/* Top nav */}
      <div className="flex justify-between items-center px-10 pt-10">
        <button
          onClick={onBack}
          className="text-black text-xs tracking-widest opacity-30 hover:opacity-80 transition-opacity"
          style={{ letterSpacing: "0.3em" }}
        >
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
            <div
              className="text-black text-[10px] tracking-widest opacity-30 mb-3"
              style={{ letterSpacing: "0.4em" }}
            >
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
              <p
                key={i}
                className="text-black text-sm leading-relaxed"
                style={{ fontFamily: config.styles.fontFamily, opacity: i === 0 ? 0.85 : 0.65 }}
              >
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
            <div
              className="text-black text-[10px] tracking-widest opacity-20 mb-4"
              style={{ letterSpacing: "0.4em" }}
            >
              WHAT'S NEXT
            </div>
            <div className="space-y-5">
              {WHATS_NEXT.description.split("\n\n").map((para, i) => (
                <p
                  key={i}
                  className="text-black text-sm leading-relaxed"
                  style={{ fontFamily: config.styles.fontFamily, opacity: i === 0 ? 0.85 : 0.65 }}
                >
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
