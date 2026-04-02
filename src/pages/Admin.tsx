import { useEffect, useState } from "react";
import { PROJECTS, WHATS_NEXT, type Project } from "../data/projects";
import { DEFAULT_CONFIG, type SiteConfig } from "../data/site-config";

const ADMIN_PASSWORD = "jadonadmin2026";

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [activeTab, setActiveTab] = useState<"projects" | "home" | "styles" | "credits">("projects");
  const [editedProjects, setEditedProjects] = useState<Project[]>(PROJECTS);
  const [editedHome, setEditedHome] = useState(DEFAULT_CONFIG.home);
  const [editedStyles, setEditedStyles] = useState(DEFAULT_CONFIG.styles);
  const [editedCredits, setEditedCredits] = useState({
    robbieDirector: PROJECTS.find((project) => project.id === "robbie")?.director ?? "Unknown",
    floridaWildDirector: PROJECTS.find((project) => project.id === "florida-wild")?.director ?? "Unknown",
    paintedDirector: PROJECTS.find((project) => project.id === "the-painted")?.director ?? "Unknown",
    yourName: "Jadon Cal Fitzpatrick",
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/data/site-config.json")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Partial<SiteConfig> | null) => {
        if (!data || cancelled) return;

        setEditedHome({
          ...DEFAULT_CONFIG.home,
          ...(data.home ?? {}),
        });
        setEditedStyles({
          ...DEFAULT_CONFIG.styles,
          ...(data.styles ?? {}),
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...editedProjects];
    updated[index] = { ...updated[index], [field]: value };
    setEditedProjects(updated);
    setSaved(false);
  };

  const updateProjectList = (
    index: number,
    field: "images" | "keyCast",
    value: string,
  ) => {
    const updated = [...editedProjects];
    updated[index] = {
      ...updated[index],
      [field]: value
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    };
    setEditedProjects(updated);
    setSaved(false);
  };

  const updateCredits = (field: string, value: string) => {
    setEditedCredits({ ...editedCredits, [field]: value });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    let ok = true;

    // Merge credits into editedProjects before saving
    const projectsToSave = editedProjects.map((p) => {
      if (p.id === "robbie") return { ...p, director: editedCredits.robbieDirector };
      if (p.id === "florida-wild") return { ...p, director: editedCredits.floridaWildDirector };
      if (p.id === "the-painted") return { ...p, director: editedCredits.paintedDirector };
      return p;
    });

    // Save projects (includes directors)
    const projectsContent = `export interface Project {
  id: string; title: string; role: string; year: string; type: string;
  description: string; director: string; color: string; accentColor: string; images: string[];
  cardImage?: string;
  keyCast?: string[];
}
export const PROJECTS: Project[] = ${JSON.stringify(projectsToSave, null, 2)};
export const WHATS_NEXT = ${JSON.stringify(WHATS_NEXT, null, 2)};
`;
    const config = { home: editedHome, styles: editedStyles };

    try {
      const [pr, cr] = await Promise.all([
        fetch("/api/admin/save-projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: projectsContent }),
        }),
        fetch("/api/admin/save-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: JSON.stringify(config, null, 2) }),
        }),
      ]);

      if (!pr.ok || !cr.ok) {
        ok = false;

        const [projectError, configError] = await Promise.all([
          pr.ok ? Promise.resolve("") : pr.text(),
          cr.ok ? Promise.resolve("") : cr.text(),
        ]);

        setSaveError(projectError || configError || "Save failed.");
      }
    } catch (err) {
      ok = false;
      setSaveError(err instanceof Error ? err.message : "Save failed.");
    }

    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        <div className="text-xs tracking-[0.5em] text-black/20 mb-8 uppercase">Admin Access</div>
        <input type="password" value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Enter password"
          className="border border-black/20 text-black text-center text-sm tracking-widest py-3 px-6 w-72 outline-none focus:border-black/60 transition-colors rounded-none"
          style={{ fontFamily: "'Cormorant Garamond', serif" }} />
        <button onClick={handleLogin}
          className="mt-4 text-xs tracking-[0.4em] text-black/40 hover:text-black transition-colors uppercase">
          Enter
        </button>
        {error && <div className="mt-4 text-xs text-red-400 tracking-widest">{error}</div>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-black/10 z-50 px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-xs tracking-[0.4em] text-black/30 uppercase">Admin</div>
          <div className="flex items-center gap-8">
            {(["projects", "home", "styles", "credits"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`text-xs tracking-[0.3em] uppercase transition-colors ${activeTab === tab ? "text-black font-bold" : "text-black/30 hover:text-black/60"}`}>
                {tab}
              </button>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving}
            className={`text-xs tracking-[0.3em] uppercase px-4 py-2 border transition-colors ${
              saved ? "border-green-400 text-green-600" : "border-black/20 text-black/40 hover:border-black hover:text-black"
            }`}>
            {saving ? "Saving..." : saved ? "Saved" : "Save All"}
          </button>
        </div>
        {saveError && (
          <div className="max-w-5xl mx-auto mt-3 text-[10px] tracking-[0.2em] text-red-500 uppercase">
            {saveError}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        {activeTab === "projects" && (
          <div className="space-y-12">
            {editedProjects.map((project, i) => (
              <div key={project.id} className="border-t border-black/10 pt-10">
                <div className="flex gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-28 rounded-sm shadow-sm" style={{ background: project.color }} />
                    <div className="mt-2 text-[9px] text-black/25 text-center">{project.id}</div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <Field label="Title" value={project.title} onChange={(v) => updateProject(i, "title", v)} large />
                    <Field label="Year" value={project.year} onChange={(v) => updateProject(i, "year", v)} />
                    <Field label="Role" value={project.role} onChange={(v) => updateProject(i, "role", v)} />
                    <Field label="Director" value={project.director} onChange={(v) => updateProject(i, "director", v)} />
                    <Field label="Type" value={project.type} onChange={(v) => updateProject(i, "type", v)} />
                    <div className="col-span-2"><Field label="Description" value={project.description} onChange={(v) => updateProject(i, "description", v)} textarea /></div>
                    <Field label="Card Color" value={project.color} onChange={(v) => updateProject(i, "color", v)} />
                    <Field label="Accent Color" value={project.accentColor} onChange={(v) => updateProject(i, "accentColor", v)} />
                    <div className="col-span-2"><Field label="Card Image Path" value={project.cardImage ?? ""} onChange={(v) => updateProject(i, "cardImage", v)} /></div>
                    <div className="col-span-2"><Field label="Key Cast (comma or new line separated)" value={(project.keyCast ?? []).join("\n")} onChange={(v) => updateProjectList(i, "keyCast", v)} textarea /></div>
                    <div className="col-span-2"><Field label="Gallery Images (comma or new line separated)" value={project.images.join("\n")} onChange={(v) => updateProjectList(i, "images", v)} textarea /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "home" && (
          <div className="space-y-8 max-w-lg">
            <div className="text-xs tracking-[0.4em] text-black/20 uppercase mb-6">Home Page Text</div>
            <Field label="Name (JADON CAL)" value={editedHome.name} onChange={(v) => setEditedHome({ ...editedHome, name: v })} />
            <Field label="Surname (FITZPATRICK)" value={editedHome.surname} onChange={(v) => setEditedHome({ ...editedHome, surname: v })} />
            <Field label="Tagline" value={editedHome.tagline} onChange={(v) => setEditedHome({ ...editedHome, tagline: v })} />
            <Field label="Click to Enter" value={editedHome.clickToEnter} onChange={(v) => setEditedHome({ ...editedHome, clickToEnter: v })} />
            <Field label="Footer" value={editedHome.footer} onChange={(v) => setEditedHome({ ...editedHome, footer: v })} />
          </div>
        )}

        {activeTab === "styles" && (
          <div className="space-y-8 max-w-lg">
            <div className="text-xs tracking-[0.4em] text-black/20 uppercase mb-6">Home Page Styles</div>
            <Field label="Name Size (e.g. 8.5rem)" value={editedStyles.nameSize} onChange={(v) => setEditedStyles({ ...editedStyles, nameSize: v })} />
            <Field label="Name Weight (100–900)" value={editedStyles.nameWeight} onChange={(v) => setEditedStyles({ ...editedStyles, nameWeight: v })} />
            <Field label="Name Letter Spacing (e.g. 0.25em)" value={editedStyles.letterSpacing} onChange={(v) => setEditedStyles({ ...editedStyles, letterSpacing: v })} />
            <Field label="Name Opacity (0–1)" value={editedStyles.nameOpacity} onChange={(v) => setEditedStyles({ ...editedStyles, nameOpacity: v })} />
            <Field label="Surname Size" value={editedStyles.surnameSize} onChange={(v) => setEditedStyles({ ...editedStyles, surnameSize: v })} />
            <Field label="Surname Opacity" value={editedStyles.surnameOpacity} onChange={(v) => setEditedStyles({ ...editedStyles, surnameOpacity: v })} />
            <Field label="Click Size" value={editedStyles.clickSize} onChange={(v) => setEditedStyles({ ...editedStyles, clickSize: v })} />
            <Field label="Click Opacity" value={editedStyles.clickOpacity} onChange={(v) => setEditedStyles({ ...editedStyles, clickOpacity: v })} />
            <Field label="Tagline Size" value={editedStyles.taglineSize} onChange={(v) => setEditedStyles({ ...editedStyles, taglineSize: v })} />
            <Field label="Tagline Opacity" value={editedStyles.taglineOpacity} onChange={(v) => setEditedStyles({ ...editedStyles, taglineOpacity: v })} />
          </div>
        )}

        {activeTab === "credits" && (
          <div className="space-y-10 max-w-lg">
            <div className="text-xs tracking-[0.4em] text-black/20 uppercase mb-6">Credit Corrections</div>
            <Field label="Director — Robbie Ain't Right No More" value={editedCredits.robbieDirector} onChange={(v) => updateCredits("robbieDirector", v)} />
            <Field label="Director — Florida Wild" value={editedCredits.floridaWildDirector} onChange={(v) => updateCredits("floridaWildDirector", v)} />
            <Field label="Director — The Painted" value={editedCredits.paintedDirector} onChange={(v) => updateCredits("paintedDirector", v)} />
            <div className="border-t border-black/10 pt-8">
              <Field label="Your Full Name" value={editedCredits.yourName} onChange={(v) => updateCredits("yourName", v)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, textarea, large }: {
  label: string; value: string;
  onChange: (v: string) => void;
  textarea?: boolean; large?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] tracking-[0.3em] text-black/30 uppercase">{label}</div>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={5}
          className="w-full border border-black/10 p-3 text-sm text-black/80 resize-none outline-none focus:border-black/40 transition-colors rounded-none"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.9rem" }} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className={`w-full border border-black/10 px-3 py-2 text-black/80 outline-none focus:border-black/40 transition-colors rounded-none ${large ? "text-lg" : "text-sm"}`}
          style={{ fontFamily: "'Cormorant Garamond', serif" }} />
      )}
    </div>
  );
}
