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
import { db, isIndexedDBAvailable } from "$lib/infrastructure/database/db";

interface SettingsState {
  currentModelId: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  isApiKeyConfigured: boolean;
}

const SETTINGS_ID = "main_settings";

function getDefaultSettings(): SettingsState {
  return {
    currentModelId: getDefaultModel().id,
    apiKey: "",
    temperature: 0.7,
    maxTokens: 1024,
    isApiKeyConfigured: false,
  };
}

async function loadSettings(): Promise<SettingsState> {
  if (!isIndexedDBAvailable()) {
    return getDefaultSettings();
  }

  try {
    const stored = await db.settings.get(SETTINGS_ID);
    if (stored) {
      return {
        currentModelId: stored.currentModelId || getDefaultModel().id,
        apiKey: stored.apiKey || "",
        temperature: stored.temperature ?? 0.7,
        maxTokens: stored.maxTokens ?? 1024,
        isApiKeyConfigured: !!stored.apiKey,
      };
    }
  } catch {
    // Ignore
  }

  return getDefaultSettings();
}

async function saveSettings(state: SettingsState): Promise<void> {
  if (!isIndexedDBAvailable()) return;

  await db.settings.put({
    id: SETTINGS_ID,
    currentModelId: state.currentModelId,
    apiKey: state.apiKey,
    temperature: state.temperature,
    maxTokens: state.maxTokens,
  });
}

function createSettingsStore() {
  const { subscribe, set, update } = writable<SettingsState>(
    getDefaultSettings()
  );

  return {
    subscribe,

    /**
     * Initialise le store depuis IndexedDB
     */
    async init() {
      const settings = await loadSettings();
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
    async reset() {
      const defaultSettings = getDefaultSettings();
      set(defaultSettings);
      await saveSettings(defaultSettings);
    },
  };
}

export const settingsStore = createSettingsStore();
