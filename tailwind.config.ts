import type { Config } from "tailwindcss";

/**
 * Sistema visual KikeAds.
 *
 * Las reglas de marca están codificadas aquí a propósito: el radio máximo es 4px
 * y las sombras están deshabilitadas, así que `rounded-xl` o `shadow-lg` no
 * existen como utilidades. Para cambiar el sistema visual se edita este archivo
 * y las variables de `app/globals.css`, no los componentes.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        negro: "#0D0D0D",
        carbon: "#1E1E1E",
        crema: "#F4F1EA",
        mostaza: "#D6A52C",
        oliva: "#556B57",
        // Único color fuera de la paleta: las banderas de severidad alta.
        // 5.8:1 sobre crema, cumple AA.
        alerta: "#A3231B",
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Escala de titulares Bebas Neue. Interlineado cerrado, tracking abierto.
        "d-sm": ["2rem", { lineHeight: "0.95", letterSpacing: "0.02em" }],
        "d-md": ["2.75rem", { lineHeight: "0.92", letterSpacing: "0.02em" }],
        "d-lg": ["3.75rem", { lineHeight: "0.9", letterSpacing: "0.02em" }],
        "d-xl": ["5rem", { lineHeight: "0.88", letterSpacing: "0.02em" }],
      },
      maxWidth: {
        lectura: "38rem",
      },
    },
    // Radio máximo 4px: la estética es editorial, no SaaS.
    borderRadius: {
      none: "0",
      sm: "2px",
      DEFAULT: "3px",
      md: "4px",
      full: "9999px", // solo para puntos e indicadores circulares
    },
    // Sin sombras. El relieve se consigue con bordes y contraste de color.
    boxShadow: {
      none: "none",
    },
  },
  plugins: [],
};

export default config;
