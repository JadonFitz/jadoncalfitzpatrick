export interface Project {
  id: string; title: string; role: string; year: string; type: string;
  description: string; director: string; color: string; accentColor: string; images: string[];
  cardImage?: string;
  keyCast?: string[];
  logline?: string;
  externalLink?: string;
  buttonLabel?: string;
}
export const PROJECTS: Project[] = [
  {
    "id": "off-rip",
    "title": "Off Rip",
    "role": "Writer / Director / Lead Actor",
    "year": "2024",
    "type": "Feature Film",
    "director": "Jadon Cal",
    "color": "#1a1a1a",
    "accentColor": "#333333",
    "description": "A raw, intimate portrait of surf culture and young love dissolving under pressure. Set against the humid Florida coastline, Off Rip explores what happens when passion and violence collide in the life of a twenty-something skimboarder chasing something he can't name. Written, directed, and performed with an rawness that blurs the line between character and confession.",
    "images": [
      "/images/off-rip/still-01.jpg",
      "/images/off-rip/still-02.jpg",
      "/images/off-rip/still-03.jpg",
      "/images/off-rip/still-04.jpg",
      "/images/off-rip/still-05.jpg",
      "/images/off-rip/still-06.jpg",
      "/images/off-rip/still-07.jpg",
      "/images/off-rip/still-08.jpg"
    ],
    "cardImage": "/images/off-rip/card.jpg",
    "keyCast": [
      "Jadon Cal Fitzpatrick"
    ],
    "logline": "A young skimboarder drifts toward love, violence, and the edge of himself on the Florida coast.",
    "buttonLabel": "View Project"
  },
  {
    "id": "robbie",
    "title": "Robbie Ain't Right No More",
    "role": "Lead Actor",
    "year": "2023",
    "type": "Short Film",
    "director": "Unknown",
    "color": "#2d1f1f",
    "accentColor": "#4a2020",
    "description": "A dark sci-fi character study. When Sarah visits her brother Robbie after years of silence, she finds him altered — guarded, distant, speaking in careful fragments about things she doesn't understand. A meditation on estrangement, identity, and the terrifying possibility that the person you loved has been replaced by something wearing their face. Jadon disappears into the role entirely.",
    "images": [
      "/images/projects/robbie.jpg"
    ],
    "cardImage": "/images/projects/robbie.jpg",
    "keyCast": [
      "Jadon Cal Fitzpatrick"
    ],
    "logline": "A sister returns to find her brother changed in ways she cannot explain.",
    "buttonLabel": "View Project"
  },
  {
    "id": "florida-wild",
    "title": "Florida Wild",
    "role": "Lead Actor",
    "year": "2024",
    "type": "Feature Film",
    "director": "Unknown",
    "color": "#1a2a1a",
    "accentColor": "#2d4a2d",
    "description": "A Florida nature documentary merged with human drama — following the people who live in the spaces between the state's iconic wildness and its quiet, strange communities. Jadon plays a central figure caught between the land and whatever he's running from. A performance of controlled stillness and sudden, surprising warmth.",
    "images": [
      "/images/projects/florida-wild.jpg"
    ],
    "cardImage": "/images/projects/florida-wild.jpg",
    "keyCast": [
      "Jadon Cal Fitzpatrick"
    ],
    "logline": "Human drama and Florida wilderness blur into the same haunted landscape.",
    "buttonLabel": "View Project"
  },
  {
    "id": "bot-or-not",
    "title": "Bot or Not",
    "role": "Co-Director / Editor / Lead Actor / Producer",
    "year": "2023",
    "type": "Feature Film",
    "director": "Jadon Cal & Meghan Carrasquillo",
    "color": "#1a1a2d",
    "accentColor": "#2d2d4a",
    "description": "Co-directed, co-edited, co-produced, and starred in with Meghan Carrasquillo — a deeply personal collision of relationship and art. A film about intimacy, artificial intelligence, and the question of whether the people we love are truly distinguishable from the versions of them we construct in our own minds. Shot on a fragmentary timeline, edited in stolen hours between life and work. A true creative partnership made manifest.",
    "images": [
      "/images/projects/bot-or-not.jpg"
    ],
    "cardImage": "/images/projects/bot-or-not.jpg",
    "keyCast": [
      "Jadon Cal Fitzpatrick",
      "Meghan Carrasquillo"
    ],
    "logline": "A fractured love story asks whether intimacy survives in a world of constructed selves.",
    "buttonLabel": "View Project"
  },
  {
    "id": "the-painted",
    "title": "The Painted",
    "role": "Lead Actor",
    "year": "2022",
    "type": "Feature Film",
    "director": "Unknown",
    "color": "#2d1f1a",
    "accentColor": "#4a3020",
    "description": "A psychological drama built around ritual, memory, and the stories we paint over the people we become. Jadon stars as a man caught in the aftermath of a life defined by a single, defining act — performing with fierce physical and emotional commitment that brings genuine weight to the film's darkest moments.",
    "images": [
      "/images/projects/the-painted.jpg"
    ],
    "cardImage": "/images/projects/the-painted.jpg",
    "keyCast": [
      "Jadon Cal Fitzpatrick"
    ],
    "logline": "Memory, ritual, and guilt collapse into a single defining act.",
    "buttonLabel": "View Project"
  },
  {
    "id": "stream",
    "title": "Stream",
    "role": "Actor",
    "year": "2023",
    "type": "Short Film",
    "director": "Fuzz on the Lens",
    "color": "#1a2020",
    "accentColor": "#2d3a3a",
    "description": "Directed by Fuzz on the Lens — a short that moves like water, precise and formless at once. Jadon appears as a presence caught mid-current, reacting to a world slightly out of phase with itself. A study in tension without resolution, movement without destination.",
    "images": [
      "/images/projects/stream.jpg"
    ],
    "cardImage": "/images/projects/stream.jpg",
    "keyCast": [
      "Jadon Cal Fitzpatrick"
    ],
    "logline": "A figure moves through a world that feels only slightly out of phase.",
    "buttonLabel": "View Project"
  }
];
export const WHATS_NEXT = {
  "title": "What's Next",
  "description": "Currently developing a slate of projects that sit at the intersection of Florida's specific light and the universal weight of becoming an adult in a country that makes it increasingly difficult. Several features are in active pre-production — including a return to the skimboard world, a psychological horror built around performance and identity, and a documentary-essay about the mythology of the American coast.\n\nNew Terrain Creative continues to grow as a home for work that refuses easy categorization: film, but also immersive experiences, written work, and collaborations with artists across disciplines.\n\nThe next chapter is the one being written right now."
};
