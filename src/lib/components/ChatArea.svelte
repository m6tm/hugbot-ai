<script lang="ts">
/**
 * Composant ChatArea - Zone principale de chat
 */
import { chatStore, currentConversation, currentMessages } from "$lib/stores";
import ChatInput from "./ChatInput.svelte";
import MessageBubble from "./MessageBubble.svelte";
import ModelSelector from "./ModelSelector.svelte";
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
      {#if $currentMessages.length === 0}
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
</style>
