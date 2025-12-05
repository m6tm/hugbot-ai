/**
 * Store pour gerer le theme de l'application
 */

import { writable, derived } from "svelte/store";
import { theme as defaultTheme } from "$lib/config/theme";

type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
}

function createThemeStore() {
  const { subscribe, set, update } = writable<ThemeState>({
    mode: "dark",
    isDark: true,
  });

  return {
    subscribe,

    /**
     * Initialise le theme depuis le localStorage
     */
    init() {
      if (typeof window === "undefined") return;

      const stored = localStorage.getItem("chat_ai_theme");
      if (stored) {
        const mode = stored as ThemeMode;
        const isDark = this.resolveIsDark(mode);
        set({ mode, isDark });
        this.applyTheme(isDark);
      } else {
        this.applyTheme(true);
      }

      if (stored === "system") {
        window
          .matchMedia("(prefers-color-scheme: dark)")
          .addEventListener("change", (e) => {
            update((state) => {
              if (state.mode === "system") {
                const isDark = e.matches;
                this.applyTheme(isDark);
                return { ...state, isDark };
              }
              return state;
            });
          });
      }
    },

    /**
     * Resoud si le mode sombre doit etre applique
     */
    resolveIsDark(mode: ThemeMode): boolean {
      if (mode === "dark") return true;
      if (mode === "light") return false;
      if (typeof window !== "undefined") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return true;
    },

    /**
     * Applique le theme au document
     */
    applyTheme(isDark: boolean) {
      if (typeof document === "undefined") return;

      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },

    /**
     * Change le mode du theme
     */
    setMode(mode: ThemeMode) {
      const isDark = this.resolveIsDark(mode);

      if (typeof localStorage !== "undefined") {
        localStorage.setItem("chat_ai_theme", mode);
      }

      this.applyTheme(isDark);
      set({ mode, isDark });
    },

    /**
     * Toggle entre light et dark
     */
    toggle() {
      update((state) => {
        const newMode: ThemeMode = state.isDark ? "light" : "dark";
        const isDark = !state.isDark;

        if (typeof localStorage !== "undefined") {
          localStorage.setItem("chat_ai_theme", newMode);
        }

        this.applyTheme(isDark);
        return { mode: newMode, isDark };
      });
    },
  };
}

export const themeStore = createThemeStore();

export const themeConfig = derived(themeStore, ($theme) => {
  return {
    ...defaultTheme,
    isDark: $theme.isDark,
  };
});
