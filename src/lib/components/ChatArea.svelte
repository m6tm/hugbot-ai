<script lang="ts">
/**
 * Composant ChatArea - Zone principale de chat
 */
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { chatStore, currentConversation, currentMessages } from "$lib/stores";
import ChatInput from "./ChatInput.svelte";
import MessageBubble from "./MessageBubble.svelte";
import ModelSelector from "./ModelSelector.svelte";
import SkeletonMessageBubble from "./ui/SkeletonMessageBubble.svelte";
import WelcomeScreen from "./WelcomeScreen.svelte";

let messagesContainer = $state<HTMLDivElement>();

$effect(() => {
	if ($currentMessages.length > 0 && messagesContainer) {
		setTimeout(() => {
			if (messagesContainer) {
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			}
		}, 100);
	}
});

function handleLoginClick() {
	chatStore.clearError();
	goto("/auth");
}

function dismissError() {
	chatStore.clearError();
}
</script>

<main class="chat-area">
  {#if !$currentConversation}
    <WelcomeScreen />
  {:else}
    <div class="chat-header">
      <div class="header-left">
        <h1 class="chat-title">{$currentConversation.title}</h1>
        <span class="message-count">
          {$currentMessages.length} message{$currentMessages.length > 1
            ? "s"
            : ""}
        </span>
      </div>
      <div class="header-right">
        <ModelSelector />
      </div>
    </div>

    <div class="messages-container" bind:this={messagesContainer}>
      {#if $chatStore.isMessagesLoading && $currentMessages.length === 0}
        <div class="messages-list">
          <!-- Skeletons -->
          <SkeletonMessageBubble align="right" />
          <SkeletonMessageBubble align="left" />
          <SkeletonMessageBubble align="right" />
        </div>
      {:else if $currentMessages.length === 0}
        <div class="empty-chat">
          <div class="empty-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              />
            </svg>
          </div>
          <p>Commencez la conversation en envoyant un message</p>
        </div>
      {:else}
        <div class="messages-list">
          {#each $currentMessages as message (message.id)}
            <MessageBubble {message} />
          {/each}

          {#if $chatStore.isStreaming}
            <MessageBubble
              message={{
                id: "streaming",
                conversationId: $currentConversation.id,
                role: "assistant",
                content: $chatStore.streamingContent,
                createdAt: new Date(),
                isStreaming: true,
              }}
            />
          {/if}
        </div>
      {/if}
    </div>

    {#if $chatStore.error && !($page.data.session && ($chatStore.error.includes("limite") || $chatStore.error.includes("Connectez-vous")))}
      <div class="error-banner">
        <div class="error-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{$chatStore.error}</span>
        </div>
        <div class="error-actions">
          {#if $chatStore.error.includes("Connectez-vous") || $chatStore.error.includes("limite")}
            <button class="error-btn primary" onclick={handleLoginClick}>
              Se connecter
            </button>
          {/if}
          <button
            class="error-btn dismiss"
            onclick={dismissError}
            aria-label="Fermer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </div>
    {/if}

    <ChatInput />
  {/if}
</main>

<style>
  .chat-area {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    background: var(--bg-chat);
    overflow: hidden;
  }

  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 24px;
    border-bottom: 1px solid var(--sidebar-border);
    background: var(--bg-header);
    backdrop-filter: blur(10px);
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  .header-right {
    flex-shrink: 0;
  }

  .chat-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .message-count {
    font-size: 13px;
    color: var(--text-muted);
    background: var(--bg-input);
    padding: 6px 12px;
    border-radius: 20px;
    display: inline-block;
    width: fit-content;
  }

  /* Header compact sur mobile */
  @media (max-width: 767px) {
    .chat-header {
      padding: 12px 16px 12px 72px;
      gap: 12px;
    }

    .header-left {
      display: none;
    }

    .header-right {
      flex: 1;
    }
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    scrollbar-width: thin;
    scrollbar-color: var(--scrollbar-thumb) transparent;
  }

  .messages-container::-webkit-scrollbar {
    width: 6px;
  }

  .messages-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .messages-container::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    border-radius: 3px;
  }

  .messages-list {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .empty-chat {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--text-muted);
    text-align: center;
  }

  .empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: var(--bg-input);
    border-radius: 20px;
    margin-bottom: 16px;
    color: var(--color-primary);
  }

  .empty-chat p {
    font-size: 15px;
    max-width: 300px;
  }

  .error-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    max-width: 900px;
    margin: 0 auto 16px;
    padding: 12px 16px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 12px;
    color: #ef4444;
  }

  .error-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .error-content svg {
    flex-shrink: 0;
  }

  .error-content span {
    font-size: 14px;
    line-height: 1.4;
  }

  .error-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .error-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .error-btn.primary {
    background: linear-gradient(
      135deg,
      var(--color-primary) 0%,
      var(--color-accent) 100%
    );
    color: white;
  }

  .error-btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .error-btn.dismiss {
    width: 32px;
    height: 32px;
    padding: 0;
    background: transparent;
    color: #ef4444;
  }

  .error-btn.dismiss:hover {
    background: rgba(239, 68, 68, 0.15);
  }

  @media (max-width: 767px) {
    .error-banner {
      margin: 0 16px 16px;
      flex-direction: column;
      align-items: stretch;
    }

    .error-actions {
      justify-content: flex-end;
    }
  }
</style>
