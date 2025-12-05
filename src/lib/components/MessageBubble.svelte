<script lang="ts">
  /**
   * Composant MessageBubble - Bulle de message
   */
  import type { Message } from "$lib/domain/entities/message";

  interface Props {
    message: Message;
  }

  let { message }: Props = $props();

  let copied = $state(false);

  const isUser = $derived(message.role === "user");

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(message.content);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2000);
    } catch {
      console.error("Impossible de copier le texte");
    }
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>

<div class="message-bubble" class:user={isUser} class:assistant={!isUser}>
  <div class="avatar">
    {#if isUser}
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
        <circle cx="12" cy="8" r="5" />
        <path d="M20 21a8 8 0 1 0-16 0" />
      </svg>
    {:else}
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
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M15 13v2" />
        <path d="M9 13v2" />
      </svg>
    {/if}
  </div>

  <div class="content-wrapper">
    <div class="header">
      <span class="role">{isUser ? "Vous" : "Assistant"}</span>
      <span class="time">{formatTime(message.createdAt)}</span>
    </div>

    <div class="content">
      <p>{message.content}</p>
      {#if message.isStreaming}
        <span class="typing-indicator">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </span>
      {/if}
    </div>

    {#if !isUser && !message.isStreaming}
      <div class="actions">
        <button
          class="action-btn"
          onclick={copyToClipboard}
          aria-label={copied ? "Copie" : "Copier"}
        >
          {#if copied}
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
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>Copie</span>
          {:else}
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
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path
                d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
              />
            </svg>
            <span>Copier</span>
          {/if}
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .message-bubble {
    display: flex;
    gap: 16px;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message-bubble.user {
    flex-direction: row-reverse;
  }

  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    flex-shrink: 0;
  }

  .user .avatar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .assistant .avatar {
    background: linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%);
    color: #1a1a2e;
  }

  .content-wrapper {
    flex: 1;
    max-width: 75%;
  }

  .user .content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .user .header {
    flex-direction: row-reverse;
  }

  .role {
    font-size: 13px;
    font-weight: 600;
    color: #e5e7eb;
  }

  .time {
    font-size: 11px;
    color: #6b7280;
  }

  .content {
    padding: 16px 20px;
    border-radius: 16px;
    line-height: 1.6;
  }

  .user .content {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .assistant .content {
    background: rgba(255, 255, 255, 0.05);
    color: #e5e7eb;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom-left-radius: 4px;
  }

  .content p {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .typing-indicator {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;
  }

  .dot {
    width: 6px;
    height: 6px;
    background: #667eea;
    border-radius: 50%;
    animation: bounce 1.4s ease-in-out infinite;
  }

  .dot:nth-child(1) {
    animation-delay: 0s;
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes bounce {
    0%,
    60%,
    100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-6px);
    }
  }

  .actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .message-bubble:hover .actions {
    opacity: 1;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #9ca3af;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
</style>
