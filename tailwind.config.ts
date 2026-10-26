import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          500: "#3B82F6",
          600: "#2446A6", // Primary
          700: "#18347D", // Primary Dark
          800: "#1E293B",
          900: "#0F172A",
        },
        mqm: {
          accuracy: {
            text: "#B91C1C",
            bg: "#FEE2E2",
            border: "#F87171",
          },
          fluency: {
            text: "#C2410C",
            bg: "#FFEDD5",
            border: "#FB923C",
          },
          terminology: {
            text: "#7E22CE",
            bg: "#F3E8FF",
            border: "#C084FC",
          },
          style: {
            text: "#1D4ED8",
            bg: "#DBEAFE",
            border: "#60A5FA",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
