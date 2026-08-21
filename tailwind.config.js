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
  // daisyui: {
  //   themes: [
  //     {
  //       "meridian-light": {
  //         primary: "#C7A248",
  //         "primary-content": "#ffffff",
  //         secondary: "#1F3F60",
  //         "secondary-content": "#ffffff",
  //         accent: "#4C9A6A",
  //         "accent-content": "#ffffff",
  //         neutral: "#F3F4F6",
  //         "neutral-content": "#1F2937",
  //         "base-100": "#FFFFFF",
  //         "base-200": "#F8FAFC",
  //         "base-300": "#EEF2F7",
  //         "base-content": "#111827",
  //         info: "#3B82F6",
  //         success: "#22C55E",
  //         warning: "#F59E0B",
  //         error: "#EF4444",
  //         "--rounded-box": "1rem",
  //         "--rounded-btn": "0.5rem",
  //         "--rounded-badge": "1.9rem",
  //       },
  //     },
  //     {
  //       "meridian-dark": {
  //         primary: "#C7A248",
  //         "primary-content": "#0B1622",
  //         secondary: "#1F3F60",
  //         "secondary-content": "#F7F5F1",
  //         accent: "#4C9A6A",
  //         "accent-content": "#0B1622",
  //         neutral: "#101A2C",
  //         "neutral-content": "#F7F5F1",
  //         "base-100": "#0B1622", // <-- Card Background (Dark Navy)
  //         "base-200": "#101A2C", // <-- Layout Background
  //         "base-300": "#16233A", // <-- Borders
  //         "base-content": "#F7F5F1",
  //         info: "#4A7FB5",
  //         success: "#4C9A6A",
  //         warning: "#D8A13A",
  //         error: "#B3483F",
  //         "--rounded-box": "1rem",
  //         "--rounded-btn": "0.5rem",
  //         "--rounded-badge": "1.9rem",
  //       },
  //     },
  //     "light",
  //     "dark",
  //     "cupcake",
  //     "corporate",
  //     "business",
  //     "night",
  //     "forest",
  //     "luxury",
  //     "dracula",
  //     "winter",
  //     "dim",
  //     "nord",
  //   ],
  //   darkTheme: "meridian-dark",
  //   base: true,
  //   styled: true,
  //   utils: true,
  // },
  // daisyui: {
  //   themes: [
  //     {
  //       "meridian-light": {
  //         primary: "#C7A248",
  //         "primary-content": "#ffffff",

  //         secondary: "#1F3F60",
  //         "secondary-content": "#ffffff",

  //         accent: "#4C9A6A",
  //         "accent-content": "#ffffff",

  //         neutral: "#F3F4F6",
  //         "neutral-content": "#1F2937",

  //         "base-100": "#FFFFFF",
  //         "base-200": "#F8FAFC",
  //         "base-300": "#EEF2F7",
  //         "base-content": "#111827",

  //         info: "#3B82F6",
  //         success: "#22C55E",
  //         warning: "#F59E0B",
  //         error: "#EF4444",

  //         "--rounded-box": "1rem",
  //         "--rounded-btn": "0.5rem",
  //         "--rounded-badge": "1.9rem",
  //       },
  //     },

  //     {
  //       "meridian-dark": {
  //         primary: "#C7A248",
  //         "primary-content": "#0B1622",

  //         secondary: "#1F3F60",
  //         "secondary-content": "#F7F5F1",

  //         accent: "#4C9A6A",
  //         "accent-content": "#0B1622",

  //         neutral: "#101A2C",
  //         "neutral-content": "#F7F5F1",

  //         "base-100": "#0B1622",
  //         "base-200": "#101A2C",
  //         "base-300": "#16233A",
  //         "base-content": "#F7F5F1",

  //         info: "#4A7FB5",
  //         success: "#4C9A6A",
  //         warning: "#D8A13A",
  //         error: "#B3483F",

  //         "--rounded-box": "1rem",
  //         "--rounded-btn": "0.5rem",
  //         "--rounded-badge": "1.9rem",
  //       },
  //     },

  //     "light",
  //     "dark",
  //     "cupcake",
  //     "bumblebee",
  //     "emerald",
  //     "corporate",
  //     "synthwave",
  //     "retro",
  //     "cyberpunk",
  //     "valentine",
  //     "halloween",
  //     "garden",
  //     "forest",
  //     "aqua",
  //     "lofi",
  //     "pastel",
  //     "fantasy",
  //     "wireframe",
  //     "black",
  //     "luxury",
  //     "dracula",
  //     "cmyk",
  //     "autumn",
  //     "business",
  //     "acid",
  //     "lemonade",
  //     "night",
  //     "coffee",
  //     "winter",
  //     "dim",
  //     "nord",
  //     "sunset",
  //     "caramellatte",
  //     "abyss",
  //     "silk",
  //   ],

  //   darkTheme: "meridian-dark",
  //   base: true,
  //   styled: true,
  //   utils: true,
  // },

  daisyui: {
    themes: [
      // =====================================================
      // MERIDIAN LIGHT
      // =====================================================
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
          "info-content": "#ffffff",

          success: "#22C55E",
          "success-content": "#ffffff",

          warning: "#F59E0B",
          "warning-content": "#ffffff",

          error: "#EF4444",
          "error-content": "#ffffff",

          "--rounded-box": "1rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1.9rem",
        },
      },

      // =====================================================
      // MERIDIAN DARK
      // =====================================================
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

          "base-100": "#0B1622",
          "base-200": "#101A2C",
          "base-300": "#16233A",
          "base-content": "#F7F5F1",

          info: "#4A7FB5",
          "info-content": "#F7F5F1",

          success: "#4C9A6A",
          "success-content": "#F7F5F1",

          warning: "#D8A13A",
          "warning-content": "#0B1622",

          error: "#B3483F",
          "error-content": "#F7F5F1",

          "--rounded-box": "1rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1.9rem",
        },
      },

      // =====================================================
      // GREEN
      // =====================================================
      {
        green: {
          primary: "oklch(66% 0.179 58.318)",
          "primary-content": "oklch(98% 0.022 95.277)",

          secondary: "oklch(64% 0.2 131.684)",
          "secondary-content": "oklch(98% 0.031 120.757)",

          accent: "oklch(57% 0.245 27.325)",
          "accent-content": "oklch(97% 0.013 17.38)",

          neutral: "oklch(62% 0.194 149.214)",
          "neutral-content": "oklch(98% 0.018 155.826)",

          "base-100": "oklch(98% 0.018 155.826)",
          "base-200": "oklch(96% 0.044 156.743)",
          "base-300": "oklch(92% 0.084 155.995)",
          "base-content": "oklch(39% 0.095 152.535)",

          info: "oklch(74% 0.16 232.661)",
          "info-content": "oklch(29% 0.066 243.157)",

          success: "oklch(76% 0.177 163.223)",
          "success-content": "oklch(26% 0.051 172.552)",

          warning: "oklch(82% 0.189 84.429)",
          "warning-content": "oklch(27% 0.077 45.635)",

          error: "oklch(71% 0.202 349.761)",
          "error-content": "oklch(28% 0.109 3.907)",

          "--rounded-box": "0rem",
          "--rounded-btn": "2rem",
          "--rounded-badge": "2rem",
        },
      },

      // =====================================================
      // MINT
      // =====================================================
      {
        mint: {
          // primary: "oklch(0% 0 0)",
          primary: "oklch(60% 0.118 184.704)",
          "primary-content": "oklch(100% 0 0)",

          secondary: "oklch(62% 0.214 259.815)",
          "secondary-content": "oklch(97% 0.014 254.604)",

          accent: "oklch(63% 0.237 25.331)",
          "accent-content": "oklch(97% 0.013 17.38)",

          neutral: "oklch(60% 0.118 184.704)",
          "neutral-content": "oklch(98% 0.014 180.72)",

          "base-100": "oklch(98% 0.014 180.72)",
          "base-200": "oklch(95% 0.051 180.801)",
          "base-300": "oklch(91% 0.096 180.426)",
          "base-content": "oklch(38% 0.063 188.416)",

          info: "oklch(62% 0.214 259.815)",
          "info-content": "oklch(97% 0.014 254.604)",

          success: "oklch(69% 0.17 162.48)",
          "success-content": "oklch(97% 0.021 166.113)",

          warning: "oklch(76% 0.188 70.08)",
          "warning-content": "oklch(98% 0.022 95.277)",

          error: "oklch(65% 0.241 354.308)",
          "error-content": "oklch(97% 0.014 343.198)",

          "--rounded-box": "1rem",
          "--rounded-btn": "0.25rem",
          "--rounded-badge": "2rem",
        },
      },

      // =====================================================
      // DAISYUI BUILT-IN THEMES
      // =====================================================
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
    ],

    darkTheme: "meridian-dark",

    base: true,
    styled: true,
    utils: true,
  },

  plugins: [require("daisyui")],
};
