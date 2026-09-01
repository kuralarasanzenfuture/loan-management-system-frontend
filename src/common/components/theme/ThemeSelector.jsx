// import React, { useState, useRef, useEffect } from "react";
// import { Palette, Check } from "lucide-react";

// const THEMES = [
//   "meridian-light",
//   "meridian-dark",
//   "light",
//   "dark",
//   "cupcake",
//   "corporate",
//   "business",
//   "night",
//   "forest",
//   "luxury",
//   "dracula",
//   "winter",
//   "dim",
//   "nord",
// ];

// export default function ThemeSelector() {
//   const [open, setOpen] = useState(false);
//   const [theme, setTheme] = useState(
//     () => localStorage.getItem("meridian-theme") || "meridian-light",
//   );
//   const rootRef = useRef(null);

//   useEffect(() => {
//     document.documentElement.setAttribute("data-theme", theme);
//     localStorage.setItem("meridian-theme", theme);
//   }, [theme]);

//   useEffect(() => {
//     if (!open) return;
//     const handleClick = (e) => {
//       if (rootRef.current && !rootRef.current.contains(e.target))
//         setOpen(false);
//     };
//     const handleEsc = (e) => e.key === "Escape" && setOpen(false);
//     document.addEventListener("mousedown", handleClick);
//     document.addEventListener("keydown", handleEsc);
//     return () => {
//       document.removeEventListener("mousedown", handleClick);
//       document.removeEventListener("keydown", handleEsc);
//     };
//   }, [open]);

//   return (
//     <div ref={rootRef} className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen((v) => !v)}
//         className="btn btn-ghost btn-sm btn-circle hover:bg-base-200 transition-colors"
//         aria-label="Change theme"
//         aria-expanded={open}
//         title="Change theme"
//       >
//         <Palette size={18} className="text-base-content/70" />
//       </button>

//       {open && (
//         <ul className="absolute right-0 top-full mt-2 w-48 max-h-80 overflow-y-auto rounded-2xl bg-base-100 border border-base-300 shadow-dropdown p-2 gap-0.5 z-50">
//           {THEMES.map((t) => (
//             <li key={t}>
//               <button
//                 onClick={() => {
//                   setTheme(t);
//                   setOpen(false);
//                 }}
//                 className="flex items-center justify-between w-full text-xs font-medium py-2 px-3 rounded-lg text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors capitalize"
//               >
//                 {t.replace("meridian-", "")}
//                 {theme === t && <Check size={13} className="text-primary" />}
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
// import React, { useEffect, useRef, useState } from "react";
// import { Palette, Check } from "lucide-react";

// const THEMES = [
//   "meridian-light",
//   "meridian-dark",

//   "green",
//   "mint",

//   // daisyUI themes
//   "light",
//   "dark",
//   "cupcake",
//   "bumblebee",
//   "emerald",
//   "corporate",
//   "synthwave",
//   "retro",
//   "cyberpunk",
//   "valentine",
//   "halloween",
//   "garden",
//   "forest",
//   "aqua",
//   "lofi",
//   "pastel",
//   "fantasy",
//   "wireframe",
//   "black",
//   "luxury",
//   "dracula",
//   "cmyk",
//   "autumn",
//   "business",
//   "acid",
//   "lemonade",
//   "night",
//   "coffee",
//   "winter",
//   "dim",
//   "nord",
//   "sunset",
//   "caramellatte",
//   "abyss",
//   "silk",
// ];

// const THEME_LABELS = {
//   "meridian-light": "Meridian Light",
//   "meridian-dark": "Meridian Dark",

//   green: "Green",
//   mint: "Mint",

//   light: "Light",
//   dark: "Dark",
//   cupcake: "Cupcake",
//   bumblebee: "Bumblebee",
//   emerald: "Emerald",
//   corporate: "Corporate",
//   synthwave: "Synthwave",
//   retro: "Retro",
//   cyberpunk: "Cyberpunk",
//   valentine: "Valentine",
//   halloween: "Halloween",
//   garden: "Garden",
//   forest: "Forest",
//   aqua: "Aqua",
//   lofi: "Lo-Fi",
//   pastel: "Pastel",
//   fantasy: "Fantasy",
//   wireframe: "Wireframe",
//   black: "Black",
//   luxury: "Luxury",
//   dracula: "Dracula",
//   cmyk: "CMYK",
//   autumn: "Autumn",
//   business: "Business",
//   acid: "Acid",
//   lemonade: "Lemonade",
//   night: "Night",
//   coffee: "Coffee",
//   winter: "Winter",
//   dim: "Dim",
//   nord: "Nord",
//   sunset: "Sunset",
//   caramellatte: "Caramel Latte",
//   abyss: "Abyss",
//   silk: "Silk",
// };

// function ThemeSwatch({ theme }) {
//   return (
//     <div
//       data-theme={theme}
//       className="
//         grid grid-cols-2
//         w-5 h-5
//         shrink-0
//         overflow-hidden
//         rounded-md
//         ring-1 ring-base-300
//       "
//     >
//       <span className="bg-primary" />
//       <span className="bg-secondary" />
//       <span className="bg-accent" />
//       <span className="bg-neutral" />
//     </div>
//   );
// }

// export default function ThemeSelector() {
//   const [open, setOpen] = useState(false);

//   const [theme, setTheme] = useState(() => {
//     return localStorage.getItem("meridian-theme") || "meridian-light";
//   });

//   const rootRef = useRef(null);

//   // Apply theme
//   useEffect(() => {
//     document.documentElement.setAttribute("data-theme", theme);
//     localStorage.setItem("meridian-theme", theme);
//   }, [theme]);

//   // Close when clicking outside / Escape
//   useEffect(() => {
//     if (!open) return;

//     const handleClickOutside = (event) => {
//       if (
//         rootRef.current &&
//         !rootRef.current.contains(event.target)
//       ) {
//         setOpen(false);
//       }
//     };

//     const handleEscape = (event) => {
//       if (event.key === "Escape") {
//         setOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     document.addEventListener("keydown", handleEscape);

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleClickOutside
//       );

//       document.removeEventListener(
//         "keydown",
//         handleEscape
//       );
//     };
//   }, [open]);

//   const handleThemeChange = (selectedTheme) => {
//     setTheme(selectedTheme);
//     setOpen(false);
//   };

//   return (
//     <div ref={rootRef} className="relative">
//       {/* Theme Button */}
//       <button
//         type="button"
//         onClick={() => setOpen((value) => !value)}
//         className="
//           btn
//           btn-ghost
//           btn-sm
//           btn-circle
//           hover:bg-base-200
//           transition-colors
//         "
//         aria-label="Change theme"
//         aria-haspopup="menu"
//         aria-expanded={open}
//         title="Change theme"
//       >
//         <Palette
//           size={18}
//           className="text-base-content/70"
//         />
//       </button>

//       {/* Theme Dropdown */}
//       {open && (
//         <div
//           className="
//             absolute
//             right-0
//             top-full
//             mt-2
//             w-60
//             max-h-[420px]
//             rounded-2xl
//             bg-base-100
//             border
//             border-base-300
//             shadow-xl
//             z-50
//             overflow-hidden
//           "
//         >
//           {/* Header */}
//           <div className="px-4 py-3 border-b border-base-300">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-semibold text-base-content">
//                   Appearance
//                 </p>

//                 <p className="text-[11px] text-base-content/40 mt-0.5">
//                   Choose your preferred theme
//                 </p>
//               </div>

//               <ThemeSwatch theme={theme} />
//             </div>
//           </div>

//           {/* Theme List */}
//           <div
//             className="
//               max-h-[350px]
//               overflow-y-auto
//               p-2
//               scrollbar-thin
//             "
//           >
//             <div className="space-y-0.5">
//               {THEMES.map((item) => {
//                 const isActive = theme === item;

//                 return (
//                   <button
//                     key={item}
//                     type="button"
//                     onClick={() => handleThemeChange(item)}
//                     className={`
//                       flex
//                       items-center
//                       gap-3
//                       w-full
//                       rounded-xl
//                       px-3
//                       py-2.5
//                       text-left
//                       transition-all
//                       duration-150

//                       ${
//                         isActive
//                           ? "bg-primary/10 text-primary"
//                           : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
//                       }
//                     `}
//                   >
//                     {/* Preview */}
//                     <ThemeSwatch theme={item} />

//                     {/* Name */}
//                     <span
//                       className={`
//                         flex-1
//                         text-sm
//                         font-medium
//                         truncate
//                         ${
//                           isActive
//                             ? "text-primary"
//                             : "text-base-content/80"
//                         }
//                       `}
//                     >
//                       {THEME_LABELS[item] || item}
//                     </span>

//                     {/* Selected */}
//                     {isActive && (
//                       <span
//                         className="
//                           flex
//                           items-center
//                           justify-center
//                           w-5
//                           h-5
//                           rounded-full
//                           bg-primary
//                           text-primary-content
//                           shrink-0
//                         "
//                       >
//                         <Check size={12} strokeWidth={3} />
//                       </span>
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

/* ==================================*/

import React, { useEffect, useRef, useState } from "react";
import { Palette, Check } from "lucide-react";
import { THEMES, THEME_LABELS, ThemeSwatch } from "../../../config/Themeconfig.jsx";

export default function ThemeSelector() {
  const [open, setOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("meridian-theme") || "cm-micro-blue";
  });

  const rootRef = useRef(null);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("meridian-theme", theme);
  }, [theme]);

  // Close when clicking outside / Escape
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      {/* Theme Button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="btn btn-ghost btn-sm btn-circle hover:bg-base-200 transition-colors"
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Change theme"
      >
        <Palette size={18} className="text-base-content/70" />
      </button>

      {/* Theme Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 max-h-[420px] rounded-2xl bg-base-100 border border-base-300 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-base-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-base-content">
                  Appearance
                </p>
                <p className="text-[11px] text-base-content/40 mt-0.5">
                  Choose your preferred theme
                </p>
              </div>
              <ThemeSwatch theme={theme} />
            </div>
          </div>

          {/* Theme List */}
          <div className="max-h-[350px] overflow-y-auto p-2 scrollbar-thin">
            <div className="space-y-0.5">
              {THEMES.map((item) => {
                const isActive = theme === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleThemeChange(item)}
                    className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                    }`}
                  >
                    <ThemeSwatch theme={item} />
                    <span
                      className={`flex-1 text-sm font-medium truncate ${
                        isActive ? "text-primary" : "text-base-content/80"
                      }`}
                    >
                      {THEME_LABELS[item] || item}
                    </span>
                    {isActive && (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-content shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
