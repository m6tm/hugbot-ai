/**
 * Store pour gerer le theme de l'application
 * Utilise localStorage pour le stockage local
 */

import { derived, writable } from "svelte/store";
import { theme as defaultTheme } from "$lib/config/theme";

type ThemeMode = "light" | "dark" | "system";

const THEME_KEY = "hugbot_theme";

interface ThemeState {
	mode: ThemeMode;
	isDark: boolean;
}

function isLocalStorageAvailable(): boolean {
	if (typeof window === "undefined") return false;
	try {
		const test = "__storage_test__";
		window.localStorage.setItem(test, test);
		window.localStorage.removeItem(test);
		return true;
	} catch {
		return false;
	}
}

function createThemeStore() {
	const { subscribe, set, update } = writable<ThemeState>({
		mode: "dark",
		isDark: true,
	});

	return {
		subscribe,

		/**
		 * Initialise le theme depuis localStorage
		 */
		async init() {
			if (typeof window === "undefined") return;

			if (!isLocalStorageAvailable()) {
				this.applyTheme(true);
				return;
			}

			try {
				const stored = localStorage.getItem(THEME_KEY);
				if (stored) {
					const mode = stored as ThemeMode;
					const isDark = this.resolveIsDark(mode);
					set({ mode, isDark });
					this.applyTheme(isDark);
				} else {
					this.applyTheme(true);
				}

				const currentState = await new Promise<ThemeState>((resolve) => {
					const unsubscribe = subscribe((state) => {
						resolve(state);
						setTimeout(() => unsubscribe(), 0);
					});
				});

				if (currentState.mode === "system") {
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
			} catch {
				this.applyTheme(true);
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
		async setMode(mode: ThemeMode) {
			const isDark = this.resolveIsDark(mode);

			if (isLocalStorageAvailable()) {
				localStorage.setItem(THEME_KEY, mode);
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

				if (isLocalStorageAvailable()) {
					localStorage.setItem(THEME_KEY, newMode);
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
