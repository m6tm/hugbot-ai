/**
 * Store pour les evenements UI
 */

import { writable } from "svelte/store";

interface UIState {
	focusChatInputTrigger: number;
}

const initialState: UIState = {
	focusChatInputTrigger: 0,
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
	};
}

export const uiStore = createUIStore();
