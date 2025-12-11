<script lang="ts">
/**
 * Composant ChatInput - Zone de saisie du message
 */
import { chatStore, uiStore } from "$lib/stores";
import IconButton from "./ui/IconButton.svelte";

let message = $state("");
let textareaRef: HTMLTextAreaElement;

const isEditing = $derived($uiStore.editingMessage !== null);
const isDisabled = $derived($chatStore.isStreaming || !message.trim());

// Ecoute les evenements de focus depuis le uiStore
$effect(() => {
	const trigger = $uiStore.focusChatInputTrigger;
	if (trigger > 0 && textareaRef) {
		setTimeout(() => {
			textareaRef?.focus();
		}, 100);
	}
});

// Charge le contenu du message a editer
$effect(() => {
	const editingMessage = $uiStore.editingMessage;
	if (editingMessage) {
		message = editingMessage.content;
		adjustTextareaHeight();
	}
});

async function handleSubmit(e?: SubmitEvent) {
	e?.preventDefault();
	if (isDisabled) return;

	const content = message.trim();
	if (!content) return;

	const editingMessage = $uiStore.editingMessage;

	message = "";
	resetTextareaHeight();

	if (editingMessage) {
		uiStore.cancelEditMessage();
		await chatStore.editMessage(editingMessage.messageId, content);
	} else {
		await chatStore.sendMessage(content);
	}
}

function handleKeydown(e: KeyboardEvent) {
	if (e.key === "Enter" && !e.shiftKey) {
		e.preventDefault();
		handleSubmit();
	} else if (e.key === "Escape" && isEditing) {
		cancelEdit();
	}
}

function cancelEdit() {
	uiStore.cancelEditMessage();
	message = "";
	resetTextareaHeight();
}

function adjustTextareaHeight() {
	if (!textareaRef) return;
	textareaRef.style.height = "auto";
	textareaRef.style.height = `${Math.min(textareaRef.scrollHeight, 200)}px`;
}

function resetTextareaHeight() {
	if (!textareaRef) return;
	textareaRef.style.height = "auto";
}
</script>

<form class="chat-input-container" onsubmit={handleSubmit}>
  {#if isEditing}
    <div class="edit-indicator">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      </svg>
      <span>Modification du message</span>
      <button type="button" class="cancel-edit-btn" onclick={cancelEdit}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
        Annuler
      </button>
    </div>
  {/if}

  <div class="input-wrapper" class:editing={isEditing}>
    <textarea
      bind:this={textareaRef}
      bind:value={message}
      oninput={adjustTextareaHeight}
      onkeydown={handleKeydown}
      placeholder={isEditing
        ? "Modifiez votre message..."
        : "Ecrivez votre message..."}
      rows="1"
      disabled={$chatStore.isStreaming}
    ></textarea>

    <div class="input-actions">
      <IconButton
        icon="send"
        ariaLabel={isEditing ? "Envoyer la modification" : "Envoyer le message"}
        variant="filled"
        disabled={isDisabled}
        onclick={() => handleSubmit()}
      />
    </div>
  </div>

  <p class="disclaimer">
    Cette IA peut faire des erreurs. Verifiez les informations importantes.
  </p>
</form>

<style>
  .chat-input-container {
    padding: 16px 24px 24px;
    background: transparent;
  }

  .input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    max-width: 900px;
    margin: 0 auto;
    padding: 12px 16px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    transition: all 0.2s ease;
  }

  .input-wrapper:focus-within {
    border-color: var(--color-primary);
    background: var(--bg-card);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  textarea {
    flex: 1;
    min-height: 24px;
    max-height: 200px;
    padding: 8px 0;
    background: transparent;
    border: none;
    color: var(--text-main);
    font-size: 15px;
    line-height: 1.5;
    resize: none;
    outline: none;
    font-family: inherit;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  textarea::-webkit-scrollbar {
    display: none;
  }

  textarea::placeholder {
    color: var(--text-dim);
  }

  textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .input-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .disclaimer {
    text-align: center;
    font-size: 12px;
    color: var(--text-muted);
    margin: 12px 0 0;
  }

  .edit-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 900px;
    margin: 0 auto 8px;
    padding: 8px 16px;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.15) 0%,
      rgba(118, 75, 162, 0.15) 100%
    );
    border: 1px solid rgba(102, 126, 234, 0.3);
    border-radius: 10px;
    color: var(--color-primary);
    font-size: 13px;
    font-weight: 500;
  }

  .edit-indicator svg {
    flex-shrink: 0;
  }

  .edit-indicator span {
    flex: 1;
  }

  .cancel-edit-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-muted);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-edit-btn:hover {
    background: var(--bg-hover);
    color: var(--text-main);
    border-color: var(--text-muted);
  }

  .input-wrapper.editing {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
  }
</style>
