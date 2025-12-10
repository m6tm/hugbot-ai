<script lang="ts">
import hljs from "highlight.js";
import { settingsStore } from "$lib/stores";

interface Props {
	code: string;
	language?: string;
}

const { code, language = "plaintext" } = $props();

let copied = $state(false);

const detectedLanguage = $derived(
	language && hljs.getLanguage(language) ? language : "plaintext",
);

const highlighted = $derived(
	hljs.highlight(code, { language: detectedLanguage }).value,
);

const languageLabel = $derived(language || "code");

function cycleCodeTheme() {
	const themes = ["tokyo-night", "github-dark", "dracula"];
	const current = $settingsStore.codeTheme;
	const nextIndex = (themes.indexOf(current) + 1) % themes.length;
	settingsStore.setCodeTheme(themes[nextIndex]);
}

function copyToClipboard() {
	navigator.clipboard.writeText(code);
	copied = true;
	setTimeout(() => {
		copied = false;
	}, 2000);
}
</script>

<div class="code-block {$settingsStore.codeTheme}">
  <div class="code-header">
    <span class="code-language">{languageLabel}</span>
    <div class="code-actions">
      <button
        class="theme-switch-btn"
        title="Changer le thème"
        onclick={cycleCodeTheme}
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
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path
            d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"
          />
        </svg>
      </button>
      <button class="copy-code-btn" onclick={copyToClipboard}>
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
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copie !
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
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          Copier
        {/if}
      </button>
    </div>
  </div>
  <pre><code class="hljs language-{detectedLanguage}">{@html highlighted}</code
    ></pre>
</div>
