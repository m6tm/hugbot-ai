<script lang="ts">
/**
 * Composant ChatInput - Zone de saisie du message
 */
import { chatStore, uiStore } from "$lib/stores";
import IconButton from "./ui/IconButton.svelte";

let message = $state("");
let textareaRef: HTMLTextAreaElement;

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

function handleSubmit(e?: SubmitEvent) {
	e?.preventDefault();
	if (isDisabled) return;

	const content = message.trim();
	if (!content) return;

	message = "";
	resetTextareaHeight();
	chatStore.sendMessage(content);
}

function handleKeydown(e: KeyboardEvent) {
	if (e.key === "Enter" && !e.shiftKey) {
		e.preventDefault();
		handleSubmit();
	}
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
  <div class="input-wrapper">
    <textarea
      bind:this={textareaRef}
      bind:value={message}
      oninput={adjustTextareaHeight}
      onkeydown={handleKeydown}
      placeholder="Ecrivez votre message..."
      rows="1"
      disabled={$chatStore.isStreaming}
    ></textarea>

    <div class="input-actions">
      <IconButton
        icon="send"
        ariaLabel="Envoyer le message"
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
</style>
