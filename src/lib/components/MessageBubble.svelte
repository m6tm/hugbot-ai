<script lang="ts">
/**
 * Composant MessageBubble - Bulle de message
 */

import hljs from "highlight.js";
import { marked, type Tokens } from "marked";
import type { Message } from "$lib/domain/entities/message";
import { chatStore, settingsStore, uiStore } from "$lib/stores";

interface Props {
	message: Message;
}

const { message }: Props = $props();

let copied = $state(false);

const isUser = $derived(message.role === "user");

// Renderer personnalise pour les blocs de code avec highlight.js
const renderer = new marked.Renderer();

renderer.code = ({ text, lang }: Tokens.Code) => {
	const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
	const highlighted = hljs.highlight(text, { language }).value;
	const languageLabel = lang || "code";

	return `<div class="code-block">
      <div class="code-header">
        <span class="code-language">${languageLabel}</span>
        <div class="code-actions">
          <button class="theme-switch-btn" title="Changer le thème">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
            </svg>
          </button>
          <button class="copy-code-btn" onclick="navigator.clipboard.writeText(this.closest('.code-block').querySelector('code').textContent)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
            Copier
          </button>
        </div>
      </div>
      <pre><code class="hljs language-${language}">${highlighted}</code></pre>
    </div>`;
};

// Configuration de marked
marked.setOptions({
	breaks: true,
	gfm: true,
});

marked.use({ renderer });

/**
 * Parse le contenu markdown et retourne le HTML
 */
function parseMarkdown(content: string): string {
	if (isUser) {
		return content;
	}
	return marked.parse(content) as string;
}

const parsedContent = $derived(parseMarkdown(message.content));

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

function cycleCodeTheme() {
	const themes = ["tokyo-night", "github-dark", "dracula"];
	const current = $settingsStore.codeTheme;
	const nextIndex = (themes.indexOf(current) + 1) % themes.length;
	settingsStore.setCodeTheme(themes[nextIndex]);
}

function handleMarkdownClick(event: MouseEvent) {
	const target = event.target as HTMLElement;
	const btn = target.closest(".theme-switch-btn");
	if (btn) {
		cycleCodeTheme();
	}
}

async function handleRegenerate() {
	try {
		await chatStore.regenerateMessage(message.id);
	} catch (error) {
		console.error("Erreur lors de la regeneration:", error);
	}
}

function startEditing() {
	uiStore.startEditMessage(message.id, message.content);
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
      {#if isUser}
        <p>{message.content}</p>
      {:else}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="markdown-content {$settingsStore.codeTheme}"
          onclick={handleMarkdownClick}
        >
          {@html parsedContent}
        </div>
      {/if}
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
        <button
          class="action-btn"
          onclick={handleRegenerate}
          aria-label="Regenerer"
          disabled={$chatStore.isStreaming}
        >
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
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
          <span>Regenerer</span>
        </button>
      </div>
    {/if}

    {#if isUser && !$chatStore.isStreaming}
      <div class="actions">
        <button class="action-btn" onclick={startEditing} aria-label="Modifier">
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
          <span>Modifier</span>
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Themes de coloration syntaxique */
  .markdown-content.tokyo-night {
    --code-bg: #1a1b26;
    --code-text: #a9b1d6;
    --code-comment: #565f89;
    --code-keyword: #bb9af7;
    --code-string: #9ece6a;
    --code-number: #ff9e64;
    --code-function: #7aa2f7;
    --code-class: #2ac3de;
    --code-tag: #f7768e;
  }

  .markdown-content.github-dark {
    --code-bg: #0d1117;
    --code-text: #c9d1d9;
    --code-comment: #8b949e;
    --code-keyword: #ff7b72;
    --code-string: #a5d6ff;
    --code-number: #79c0ff;
    --code-function: #d2a8ff;
    --code-class: #f0883e;
    --code-tag: #7ee787;
  }

  .markdown-content.dracula {
    --code-bg: #282a36;
    --code-text: #f8f8f2;
    --code-comment: #6272a4;
    --code-keyword: #ff79c6;
    --code-string: #f1fa8c;
    --code-number: #bd93f9;
    --code-function: #50fa7b;
    --code-class: #8be9fd;
    --code-tag: #ffb86c;
  }

  /* Application des variables */
  .markdown-content :global(.code-block) {
    margin: 1em 0;
    border-radius: 10px;
    overflow: hidden;
    background: var(--code-bg);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* ... Mapping des classes hljs vers les variables ... */
  .markdown-content :global(.hljs-comment),
  .markdown-content :global(.hljs-quote) {
    color: var(--code-comment);
    font-style: italic;
  }

  .markdown-content :global(.hljs-keyword),
  .markdown-content :global(.hljs-selector-tag) {
    color: var(--code-keyword);
  }

  .markdown-content :global(.hljs-string),
  .markdown-content :global(.hljs-template-variable),
  .markdown-content :global(.hljs-addition) {
    color: var(--code-string);
  }

  .markdown-content :global(.hljs-number),
  .markdown-content :global(.hljs-literal) {
    color: var(--code-number);
  }

  .markdown-content :global(.hljs-function),
  .markdown-content :global(.hljs-title),
  .markdown-content :global(.hljs-section),
  .markdown-content :global(.hljs-built_in) {
    color: var(--code-function);
  }

  .markdown-content :global(.hljs-class .hljs-title),
  .markdown-content :global(.hljs-type) {
    color: var(--code-class);
  }

  .markdown-content :global(.hljs-variable),
  .markdown-content :global(.hljs-template-variable) {
    color: var(--code-text);
  }

  .markdown-content :global(.hljs-tag),
  .markdown-content :global(.hljs-name),
  .markdown-content :global(.hljs-attribute) {
    color: var(--code-tag);
  }

  .markdown-content :global(.code-block code) {
    color: var(--code-text);
  }

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
    background: linear-gradient(
      135deg,
      var(--color-primary) 0%,
      var(--color-accent) 100%
    );
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

  /* Layout mobile : avatar au-dessus du message */
  @media (max-width: 767px) {
    .message-bubble {
      flex-direction: column;
      gap: 8px;
    }

    .message-bubble.user {
      flex-direction: column;
      align-items: flex-end;
    }

    .message-bubble.user .avatar {
      order: 0;
    }

    .avatar {
      width: 32px;
      height: 32px;
    }

    .content-wrapper {
      max-width: 100%;
      width: 100%;
    }

    .user .content-wrapper {
      align-items: flex-end;
    }
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
    color: var(--text-main);
  }

  .time {
    font-size: 11px;
    color: var(--text-dim);
  }

  .content {
    padding: 16px 20px;
    border-radius: 16px;
    line-height: 1.6;
  }

  .user .content {
    background: linear-gradient(
      135deg,
      var(--color-primary) 0%,
      var(--color-accent) 100%
    );
    color: white;
    border-bottom-right-radius: 4px;
  }

  .assistant .content {
    background: var(--bg-input);
    color: var(--text-main);
    border: 1px solid var(--border-color);
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
    background: var(--color-primary);
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
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-muted);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: var(--bg-hover);
    color: var(--text-main);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Styles pour le contenu Markdown */
  .markdown-content {
    line-height: 1.7;
  }

  .markdown-content :global(h1),
  .markdown-content :global(h2),
  .markdown-content :global(h3),
  .markdown-content :global(h4),
  .markdown-content :global(h5),
  .markdown-content :global(h6) {
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: 600;
    color: var(--text-main);
  }

  .markdown-content :global(h1) {
    font-size: 1.5em;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.3em;
  }

  .markdown-content :global(h2) {
    font-size: 1.3em;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.3em;
  }

  .markdown-content :global(h3) {
    font-size: 1.15em;
  }

  .markdown-content :global(h4) {
    font-size: 1em;
  }

  .markdown-content :global(p) {
    margin: 0.8em 0;
  }

  .markdown-content :global(p:first-child) {
    margin-top: 0;
  }

  .markdown-content :global(p:last-child) {
    margin-bottom: 0;
  }

  .markdown-content :global(ul),
  .markdown-content :global(ol) {
    margin: 0.8em 0;
    padding-left: 1.5em;
  }

  .markdown-content :global(li) {
    margin: 0.3em 0;
  }

  .markdown-content :global(li::marker) {
    color: var(--color-primary);
  }

  .markdown-content :global(strong) {
    font-weight: 600;
    color: var(--text-main);
  }

  .markdown-content :global(em) {
    font-style: italic;
    color: var(--text-secondary);
  }

  .markdown-content :global(:not(pre) > code) {
    background: rgba(102, 126, 234, 0.15);
    color: #a5b4fc;
    padding: 0.15em 0.4em;
    border-radius: 4px;
    font-family: "Fira Code", "JetBrains Mono", "Consolas", monospace;
    font-size: 0.9em;
  }

  /* Styles pour les blocs de code avec highlight.js */
  /* Note: On garde le theme sombre pour les blocs de code meme en mode light */

  .markdown-content :global(blockquote) {
    border-left: 3px solid var(--color-primary);
    margin: 1em 0;
    padding: 0.5em 1em;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 0 8px 8px 0;
    color: var(--text-secondary);
  }

  .markdown-content :global(blockquote p) {
    margin: 0;
  }

  .markdown-content :global(a) {
    color: #818cf8;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .markdown-content :global(a:hover) {
    color: #a5b4fc;
    text-decoration: underline;
  }

  .markdown-content :global(hr) {
    border: none;
    border-top: 1px solid var(--border-color);
    margin: 1.5em 0;
  }

  .markdown-content :global(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }

  .markdown-content :global(th),
  .markdown-content :global(td) {
    border: 1px solid var(--border-color);
    padding: 0.5em 0.8em;
    text-align: left;
  }

  .markdown-content :global(th) {
    background: rgba(102, 126, 234, 0.2);
    font-weight: 600;
  }

  .markdown-content :global(tr:nth-child(even)) {
    background: rgba(255, 255, 255, 0.02);
  }
</style>
