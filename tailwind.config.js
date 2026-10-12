/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        background: "#E6EDF4",
        surface: "#FFFFFF",
        "surface-muted": "#EEF4F9",
        "brand-navy": {
          DEFAULT: "#162E4A",
          dark: "#0F2034",
          light: "#214268",
        },
        emergency: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
          dark: "#991B1B",
          accent: "#EF4444",
        },
        success: {
          DEFAULT: "#059669",
          light: "#D1FAE5",
          dark: "#065F46",
          accent: "#10B981",
        },
        electric: {
          DEFAULT: "#2563EB",
          light: "#DBEAFE",
          dark: "#1E40AF",
          accent: "#3B82F6",
        },
        warning: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
          dark: "#92400E",
          accent: "#F59E0B",
        },
        "emergency-red": {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
          dark: "#991B1B",
        },
        "success-green": {
          DEFAULT: "#059669",
          light: "#D1FAE5",
          dark: "#065F46",
        },
        "accent-blue": {
          DEFAULT: "#2563EB",
          light: "#DBEAFE",
          dark: "#1E40AF",
        },
        "warning-amber": {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
          dark: "#92400E",
        },
      },
      animation: {
        pulse_fast: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ping_slow: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};
