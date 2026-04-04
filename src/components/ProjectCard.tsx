import { useRef } from "react";
import type { Project } from "../data/projects";

interface Props {
  project: Project;
  float: { x: number; y: number; r: number };
  parallaxOffset: { x: number; y: number };
  isHovered: boolean;
  isDeemphasized: boolean;
  onHover: (id: string | null) => void;
  onClick: (project: Project, rect: DOMRect) => void;
}

export default function ProjectCard({
  project,
  float,
  parallaxOffset,
  isHovered,
  isDeemphasized,
  onHover,
  onClick,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      onClick={() => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (rect) onClick(project, rect);
      }}
      onMouseEnter={() => onHover(project.id)}
      onMouseLeave={() => onHover(null)}
      className="cursor-pointer flex-shrink-0"
      style={{
        width: "28vw",
        maxWidth: "380px",
        minWidth: "220px",
        transform: `translate(${float.x + parallaxOffset.x}px, ${float.y + parallaxOffset.y}px) rotate(${float.r}deg)`,
        scale: isHovered ? "1.03" : "1",
        transition: "opacity 0.6s ease, scale 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        opacity: isDeemphasized ? 0.32 : 1,
        zIndex: isHovered ? 10 : 1,
        willChange: "transform",
      }}
    >
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
        {/* Poster / image area */}
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
              bottom: 0,
              left: 0,
              right: 0,
              height: "80px",
              background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.9))",
            }}
          />
        </div>

        {/* Text */}
        <div style={{ padding: "14px 20px 20px", textAlign: "center", background: "#ffffff" }}>
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
}
