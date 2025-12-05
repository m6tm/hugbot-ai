/**
 * Configuration du theme de l'application Chat AI
 * Modifiez les valeurs ici pour personnaliser l'apparence
 */

export const theme = {
  // Couleurs principales
  colors: {
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
      950: "#082f49",
    },
    accent: {
      50: "#fdf4ff",
      100: "#fae8ff",
      200: "#f5d0fe",
      300: "#f0abfc",
      400: "#e879f9",
      500: "#d946ef",
      600: "#c026d3",
      700: "#a21caf",
      800: "#86198f",
      900: "#701a75",
      950: "#4a044e",
    },
    neutral: {
      50: "#fafafa",
      100: "#f4f4f5",
      200: "#e4e4e7",
      300: "#d4d4d8",
      400: "#a1a1aa",
      500: "#71717a",
      600: "#52525b",
      700: "#3f3f46",
      800: "#27272a",
      900: "#18181b",
      950: "#09090b",
    },
  },

  // Mode sombre par defaut
  darkMode: true,

  // Arriere-plans
  backgrounds: {
    sidebar: "bg-neutral-900",
    main: "bg-neutral-950",
    chat: "bg-neutral-800",
    input: "bg-neutral-800",
    hover: "bg-neutral-700",
    userMessage: "bg-primary-600",
    assistantMessage: "bg-neutral-800",
  },

  // Textes
  text: {
    primary: "text-white",
    secondary: "text-neutral-400",
    muted: "text-neutral-500",
    accent: "text-primary-400",
  },

  // Bordures
  borders: {
    color: "border-neutral-700",
    radius: {
      sm: "rounded-lg",
      md: "rounded-xl",
      lg: "rounded-2xl",
      full: "rounded-full",
    },
  },

  // Espacements
  spacing: {
    sidebar: {
      width: "w-72",
      padding: "p-4",
    },
    chat: {
      maxWidth: "max-w-4xl",
      padding: "p-6",
    },
  },

  // Animations
  animations: {
    transition: "transition-all duration-200 ease-in-out",
    hover: "hover:scale-[1.02]",
    typing: "animate-pulse",
  },

  // Ombres
  shadows: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    glow: "shadow-lg shadow-primary-500/20",
  },
} as const;

export type Theme = typeof theme;
