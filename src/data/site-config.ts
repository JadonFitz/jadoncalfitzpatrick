
export interface SiteConfig {
  home: {
    name: string;
    surname: string;
    tagline: string;
    footer: string;
    clickToEnter: string;
  };
  styles: {
    fontFamily: string;
    nameSize: string;
    surnameSize: string;
    clickSize: string;
    taglineSize: string;
    letterSpacing: string;
    surnameLetterSpacing: string;
    clickLetterSpacing: string;
    nameWeight: string;
    nameOpacity: string;
    surnameOpacity: string;
    clickOpacity: string;
    taglineOpacity: string;
    footerOpacity: string;
  };
}

export const DEFAULT_CONFIG: SiteConfig = {
  home: {
    name: "JADON CAL",
    surname: "FITZPATRICK",
    tagline: "WRITER · DIRECTOR · CREATOR",
    footer: "NEW TERRAIN CREATIVE",
    clickToEnter: "CLICK TO ENTER",
  },
  styles: {
    fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
    nameSize: "4.5rem",
    surnameSize: "0.875rem",
    clickSize: "0.65rem",
    taglineSize: "0.65rem",
    letterSpacing: "0.25em",
    surnameLetterSpacing: "0.5em",
    clickLetterSpacing: "0.4em",
    nameWeight: "300",
    nameOpacity: "1",
    surnameOpacity: "0.4",
    clickOpacity: "0.2",
    taglineOpacity: "0.1",
    footerOpacity: "0.05",
  },
};
