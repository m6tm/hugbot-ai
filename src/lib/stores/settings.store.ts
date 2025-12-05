/**
 * Store pour gerer les modeles et parametres AI
 */

import { writable, get } from "svelte/store";
import {
  availableModels,
  getDefaultModel,
  getModelById,
  type AIModel,
} from "$lib/config/models";

interface SettingsState {
  currentModelId: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  isApiKeyConfigured: boolean;
}

const STORAGE_KEY = "chat_ai_settings";

function loadSettings(): SettingsState {
  if (typeof localStorage === "undefined") {
    return getDefaultSettings();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...getDefaultSettings(),
        ...parsed,
        isApiKeyConfigured: !!parsed.apiKey,
      };
    }
  } catch {
    // Ignore
  }

  return getDefaultSettings();
}

function getDefaultSettings(): SettingsState {
  return {
    currentModelId: getDefaultModel().id,
    apiKey: "",
    temperature: 0.7,
    maxTokens: 1024,
    isApiKeyConfigured: false,
  };
}

function saveSettings(state: SettingsState): void {
  if (typeof localStorage === "undefined") return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      currentModelId: state.currentModelId,
      apiKey: state.apiKey,
      temperature: state.temperature,
      maxTokens: state.maxTokens,
    })
  );
}

function createSettingsStore() {
  const { subscribe, set, update } = writable<SettingsState>(
    getDefaultSettings()
  );

  return {
    subscribe,

    /**
     * Initialise le store depuis le localStorage
     */
    init() {
      const settings = loadSettings();
      set(settings);
    },

    /**
     * Change le modele actif
     */
    setModel(modelId: string) {
      const model = getModelById(modelId);
      if (!model) return;

      update((state) => {
        const newState = { ...state, currentModelId: modelId };
        saveSettings(newState);
        return newState;
      });
    },

    /**
     * Configure la cle API
     */
    setApiKey(apiKey: string) {
      update((state) => {
        const newState = {
          ...state,
          apiKey,
          isApiKeyConfigured: !!apiKey,
        };
        saveSettings(newState);
        return newState;
      });
    },

    /**
     * Met a jour la temperature
     */
    setTemperature(temperature: number) {
      update((state) => {
        const newState = { ...state, temperature };
        saveSettings(newState);
        return newState;
      });
    },

    /**
     * Met a jour le max tokens
     */
    setMaxTokens(maxTokens: number) {
      update((state) => {
        const newState = { ...state, maxTokens };
        saveSettings(newState);
        return newState;
      });
    },

    /**
     * Recupere le modele actuel
     */
    getCurrentModel(): AIModel {
      const state = get({ subscribe });
      return getModelById(state.currentModelId) || getDefaultModel();
    },

    /**
     * Recupere tous les modeles disponibles
     */
    getAvailableModels(): AIModel[] {
      return availableModels;
    },

    /**
     * Reset les parametres
     */
    reset() {
      const defaultSettings = getDefaultSettings();
      set(defaultSettings);
      saveSettings(defaultSettings);
    },
  };
}

export const settingsStore = createSettingsStore();
