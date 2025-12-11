/**
 * Store pour les evenements UI
 */

import { writable } from "svelte/store";

interface EditingMessage {
  messageId: string;
  content: string;
}

interface UIState {
  focusChatInputTrigger: number;
  editingMessage: EditingMessage | null;
}

const initialState: UIState = {
  focusChatInputTrigger: 0,
  editingMessage: null,
};

function createUIStore() {
  const { subscribe, update } = writable<UIState>(initialState);

  return {
    subscribe,

    /**
     * Declenche le focus sur l'input de chat
     */
    focusChatInput() {
      update((state) => ({
        ...state,
        focusChatInputTrigger: state.focusChatInputTrigger + 1,
      }));
    },

    /**
     * Demarre l'edition d'un message
     */
    startEditMessage(messageId: string, content: string) {
      update((state) => ({
        ...state,
        editingMessage: { messageId, content },
        focusChatInputTrigger: state.focusChatInputTrigger + 1,
      }));
    },

    /**
     * Annule l'edition en cours
     */
    cancelEditMessage() {
      update((state) => ({
        ...state,
        editingMessage: null,
      }));
    },
  };
}

export const uiStore = createUIStore();
