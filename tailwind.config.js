// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
//   theme: {
//     extend: {
//       fontFamily: {
//         display: ["Fraunces", "Georgia", "serif"],
//         sans: ["Inter", "-apple-system", "sans-serif"],
//         mono: ["IBM Plex Mono", "SFMono-Regular", "Menlo", "monospace"],
//       },
//       boxShadow: {
//         card: "0 20px 60px -20px rgba(14, 31, 51, 0.35)",
//         dropdown: "0 12px 32px -8px rgba(0, 0, 0, 0.45)",
//       },
//       borderRadius: {
//         sm: "6px",
//         md: "10px",
//         lg: "18px",
//       },
//     },
//   },
//   daisyui: {
//     themes: [
//       {
//         "meridian-light": {
//           primary: "#C7A248",
//           "primary-content": "#ffffff",

//           secondary: "#1F3F60",
//           "secondary-content": "#ffffff",

//           accent: "#4C9A6A",
//           "accent-content": "#ffffff",

//           neutral: "#F3F4F6",
//           "neutral-content": "#1F2937",

//           "base-100": "#FFFFFF",
//           "base-200": "#F8FAFC",
//           "base-300": "#EEF2F7",
//           "base-content": "#111827",

//           info: "#3B82F6",
//           success: "#22C55E",
//           warning: "#F59E0B",
//           error: "#EF4444",

//           "--rounded-box": "1rem",
//           "--rounded-btn": "0.5rem",
//           "--rounded-badge": "1.9rem",
//         },

//         "meridian-dark": {
//           primary: "#C7A248",
//           "primary-content": "#0B1622",

//           secondary: "#1F3F60",
//           "secondary-content": "#F7F5F1",

//           accent: "#4C9A6A",
//           "accent-content": "#0B1622",

//           neutral: "#101A2C",
//           "neutral-content": "#F7F5F1",

//           "base-100": "#0B1622",
//           "base-200": "#101A2C",
//           "base-300": "#16233A",
//           "base-content": "#F7F5F1",

//           info: "#4A7FB5",
//           success: "#4C9A6A",
//           warning: "#D8A13A",
//           error: "#B3483F",

//           "--rounded-box": "1rem",
//           "--rounded-btn": "0.5rem",
//           "--rounded-badge": "1.9rem",
//         },
//       },

//       "light",
//       "dark",
//       "cupcake",
//       "corporate",
//       "business",
//       "night",
//       "forest",
//       "luxury",
//       "dracula",
//       "winter",
//       "dim",
//       "nord",
//     ],

//     darkTheme: "meridian-dark",
//     base: true,
//     styled: true,
//     utils: true,
//   },
//   plugins: [require("daisyui")],
// };

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "-apple-system", "sans-serif"],
        mono: ["IBM Plex Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 20px 60px -20px rgba(14, 31, 51, 0.35)",
        dropdown: "0 12px 32px -8px rgba(0, 0, 0, 0.45)",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "18px",
      },
    },
  },
  plugins: [require("daisyui")], // MUST be initialized here
  daisyui: {
    themes: [
      {
        "meridian-light": {
          primary: "#C7A248",
          "primary-content": "#ffffff",
          secondary: "#1F3F60",
          "secondary-content": "#ffffff",
          accent: "#4C9A6A",
          "accent-content": "#ffffff",
          neutral: "#F3F4F6",
          "neutral-content": "#1F2937",
          "base-100": "#FFFFFF",
          "base-200": "#F8FAFC",
          "base-300": "#EEF2F7",
          "base-content": "#111827",
          info: "#3B82F6",
          success: "#22C55E",
          warning: "#F59E0B",
          error: "#EF4444",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1.9rem",
        },
      },
      {
        "meridian-dark": {
          primary: "#C7A248",
          "primary-content": "#0B1622",
          secondary: "#1F3F60",
          "secondary-content": "#F7F5F1",
          accent: "#4C9A6A",
          "accent-content": "#0B1622",
          neutral: "#101A2C",
          "neutral-content": "#F7F5F1",
          "base-100": "#0B1622", // <-- Card Background (Dark Navy)
          "base-200": "#101A2C", // <-- Layout Background
          "base-300": "#16233A", // <-- Borders
          "base-content": "#F7F5F1",
          info: "#4A7FB5",
          success: "#4C9A6A",
          warning: "#D8A13A",
          error: "#B3483F",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1.9rem",
        },
      },
      "light",
      "dark",
      "cupcake",
      "corporate",
      "business",
      "night",
      "forest",
      "luxury",
      "dracula",
      "winter",
      "dim",
      "nord",
    ],
    darkTheme: "meridian-dark",
    base: true,
    styled: true,
    utils: true,
  },
};
