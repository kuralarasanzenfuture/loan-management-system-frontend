import React from "react";

// Single source of truth for available themes — both ThemeSelector (header
// icon) and SettingsPage (Preferences tab) import from here so the list
// only needs to be updated in one place.
export const THEMES = [
  "meridian-light",
  "meridian-dark",

  "green",
  "mint",

  // daisyUI built-in themes
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
  "caramellatte",
  "abyss",
  "silk",
];

export const THEME_LABELS = {
  "meridian-light": "Meridian Light",
  "meridian-dark": "Meridian Dark",

  green: "Green",
  mint: "Mint",

  light: "Light",
  dark: "Dark",
  cupcake: "Cupcake",
  bumblebee: "Bumblebee",
  emerald: "Emerald",
  corporate: "Corporate",
  synthwave: "Synthwave",
  retro: "Retro",
  cyberpunk: "Cyberpunk",
  valentine: "Valentine",
  halloween: "Halloween",
  garden: "Garden",
  forest: "Forest",
  aqua: "Aqua",
  lofi: "Lo-Fi",
  pastel: "Pastel",
  fantasy: "Fantasy",
  wireframe: "Wireframe",
  black: "Black",
  luxury: "Luxury",
  dracula: "Dracula",
  cmyk: "CMYK",
  autumn: "Autumn",
  business: "Business",
  acid: "Acid",
  lemonade: "Lemonade",
  night: "Night",
  coffee: "Coffee",
  winter: "Winter",
  dim: "Dim",
  nord: "Nord",
  sunset: "Sunset",
  caramellatte: "Caramel Latte",
  abyss: "Abyss",
  silk: "Silk",
};

// Renders a 2x2 grid of that theme's actual primary/secondary/accent/neutral
// colors by scoping a nested data-theme attribute — DaisyUI resolves the
// bg-* classes against whichever theme this wrapper declares, so the swatch
// is always accurate without hardcoding hex values per theme.
export function ThemeSwatch({ theme, size = "w-5 h-5" }) {
  return (
    <div
      data-theme={theme}
      className={`grid grid-cols-2 ${size} shrink-0 overflow-hidden rounded-md ring-1 ring-base-300`}
    >
      <span className="bg-primary" />
      <span className="bg-secondary" />
      <span className="bg-accent" />
      <span className="bg-neutral" />
    </div>
  );
}
