import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0c1110",
        panel: "#111917",
        line: "#22312d",
        mint: "#62f4bd",
        coral: "#ff7c6e",
        amber: "#ffc857",
        sky: "#69d2ff"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"]
      },
      opacity: {
        "6": "0.06",
        "7": "0.07",
        "8": "0.08",
        "12": "0.12",
        "14": "0.14",
        "22": "0.22",
        "35": "0.35",
        "38": "0.38",
        "45": "0.45",
        "48": "0.48",
        "54": "0.54",
        "56": "0.56",
        "58": "0.58",
        "62": "0.62",
        "66": "0.66",
        "68": "0.68",
        "74": "0.74",
        "76": "0.76",
        "82": "0.82"
      },
      boxShadow: {
        glow: "0 0 40px rgba(98, 244, 189, 0.18)",
        coral: "0 0 28px rgba(255, 124, 110, 0.2)"
      }
    }
  },
  plugins: []
};

export default config;
