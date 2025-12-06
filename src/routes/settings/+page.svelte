<script lang="ts">
  /**
   * Page des parametres
   */
  import { settingsStore, themeStore } from "$lib/stores";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let apiKey = $state("");
  let temperature = $state(0.7);
  let maxTokens = $state(1024);
  let codeTheme = $state("tokyo-night");
  let systemInstruction = $state("");
  let isSaved = $state(false);

  onMount(() => {
    // Charger les valeurs actuelles
    apiKey = $settingsStore.apiKey;
    temperature = $settingsStore.temperature;
    maxTokens = $settingsStore.maxTokens;
    codeTheme = $settingsStore.codeTheme;
    systemInstruction = $settingsStore.systemInstruction;
  });

  function handleSave() {
    settingsStore.setApiKey(apiKey);
    settingsStore.setTemperature(temperature);
    settingsStore.setMaxTokens(maxTokens);
    settingsStore.setCodeTheme(codeTheme);
    settingsStore.setSystemInstruction(systemInstruction);

    isSaved = true;
    setTimeout(() => {
      isSaved = false;
    }, 3000);
  }
</script>

<div class="settings-container">
  <header class="settings-header">
    <button
      class="back-btn"
      onclick={() => goto("/")}
      aria-label="Retour a l'accueil"
    >
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
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
      <span>Retour</span>
    </button>
    <h1>Parametres</h1>
    <p class="subtitle">Gerez vos preferences et configurations AI</p>
  </header>

  <div class="settings-grid">
    <!-- Section Apparence -->
    <section class="settings-card">
      <div class="card-header">
        <div class="icon-wrapper theme">
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
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2" />
            <path d="M12 21v2" />
            <path d="m4.22 4.22 1.42 1.42" />
            <path d="m18.36 18.36 1.42 1.42" />
            <path d="M1 12h2" />
            <path d="M21 12h2" />
            <path d="m4.22 19.78 1.42-1.42" />
            <path d="m18.36 5.64 1.42-1.42" />
          </svg>
        </div>
        <h2>Apparence</h2>
      </div>

      <div class="card-content">
        <div class="setting-item">
          <div class="setting-label">
            <span>Theme de l'interface</span>
            <small>Choisissez entre le mode clair et sombre</small>
          </div>
          <button class="theme-toggle" onclick={() => themeStore.toggle()}>
            {#if $themeStore.isDark}
              <span class="theme-icon">🌙</span> Mode Sombre
            {:else}
              <span class="theme-icon">☀️</span> Mode Clair
            {/if}
          </button>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <span>Theme du code</span>
            <small>Style des blocs de code</small>
          </div>
          <select bind:value={codeTheme} class="select-input">
            <option value="tokyo-night">Tokyo Night</option>
            <option value="github-dark">GitHub Dark</option>
            <option value="dracula">Dracula</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Section Configuration AI -->
    <section class="settings-card">
      <div class="card-header">
        <div class="icon-wrapper ai">
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
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </div>
        <h2>Configuration AI (Hugging Face)</h2>
      </div>

      <div class="card-content">
        <div class="setting-item">
          <div class="setting-label">
            <span>Cle API Hugging Face</span>
            <small>Necessaire pour utiliser les modeles open source</small>
          </div>
          <div class="input-wrapper">
            <input
              type="password"
              placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              bind:value={apiKey}
              class="text-input"
            />
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              class="link-helper"
            >
              Obtenir une cle gratuite →
            </a>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <span>Temperature ({temperature})</span>
            <small>Plus la valeur est elevee, plus l'IA est creative</small>
          </div>
          <div class="slider-wrapper">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              bind:value={temperature}
              class="range-input"
            />
            <div class="range-labels">
              <span>Precis</span>
              <span>Creatif</span>
            </div>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-label">
            <span>Longueur maximale ({maxTokens} tokens)</span>
            <small>Limite la longueur des reponses</small>
          </div>
          <div class="slider-wrapper">
            <input
              type="range"
              min="256"
              max="4096"
              step="256"
              bind:value={maxTokens}
              class="range-input"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Section Instructions Systeme -->
    <section class="settings-card">
      <div class="card-header">
        <div class="icon-wrapper system">
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            ></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h2>Instructions Systeme</h2>
      </div>

      <div class="card-content">
        <div class="setting-item full-width">
          <div class="setting-label">
            <span>Prompt Systeme</span>
            <small
              >Instructions globales pour definir le comportement de l'IA.</small
            >
          </div>
          <div class="input-wrapper">
            <textarea
              bind:value={systemInstruction}
              class="text-area"
              rows="10"
              placeholder="Entrez vos instructions systeme ici..."
            ></textarea>
            <div class="helper-text">
              Ces instructions seront envoyees a chaque debut de conversation
              pour guider l'IA.
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="settings-actions">
      <button class="save-btn" onclick={handleSave} disabled={isSaved}>
        {#if isSaved}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Enregistre !
        {:else}
          Enregistrer les modifications
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  .settings-container {
    flex: 1;
    padding: 40px;
    overflow-y: auto;
    background: var(--bg-main);
    color: var(--text-secondary);
    transition:
      background-color 0.3s ease,
      color 0.3s ease;
  }

  .settings-header {
    margin-bottom: 40px;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }

  h1 {
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(
      135deg,
      var(--color-primary-dark) 0%,
      var(--color-accent) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
  }

  :global(.dark) h1 {
    background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    color: var(--text-muted);
    font-size: 16px;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    margin-bottom: 24px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    color: var(--text-muted);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-btn:hover {
    background: var(--bg-hover);
    border-color: var(--border-hover);
    color: var(--color-primary);
    transform: translateX(-4px);
  }

  .back-btn svg {
    transition: transform 0.2s ease;
  }

  .back-btn:hover svg {
    transform: translateX(-2px);
  }

  .settings-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }

  .settings-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 24px;
    transition:
      background-color 0.3s ease,
      border-color 0.3s ease;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
  }

  .icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-wrapper.theme {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }

  .icon-wrapper.ai {
    background: rgba(99, 102, 241, 0.1);
    color: #818cf8;
  }

  .icon-wrapper.system {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-main);
    margin: 0;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .setting-item {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    align-items: start;
  }

  .setting-item.full-width {
    grid-template-columns: 1fr;
  }

  @media (max-width: 640px) {
    .setting-item {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }

  .setting-label {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .setting-label span {
    font-weight: 500;
    color: var(--text-main);
  }

  .setting-label small {
    color: var(--text-muted);
    font-size: 13px;
  }

  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-main);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .theme-toggle:hover {
    background: var(--bg-hover);
    border-color: var(--border-hover);
  }

  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .text-input {
    width: 100%;
    padding: 10px 12px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-main);
    font-size: 14px;
    transition: all 0.2s;
  }

  .text-area {
    width: 100%;
    padding: 12px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-main);
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    transition: all 0.2s;
    min-height: 150px;
    line-height: 1.5;
  }

  .text-area:focus {
    outline: none;
    border-color: #818cf8;
    box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.2);
  }

  .helper-text {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .select-input {
    width: 100%;
    padding: 10px 12px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-main);
    font-size: 14px;
    transition: all 0.2s;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    background-size: 16px;
  }

  .select-input:focus {
    outline: none;
    border-color: #818cf8;
    box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.2);
  }

  .text-input:focus {
    outline: none;
    border-color: #818cf8;
    box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.2);
  }

  .link-helper {
    font-size: 12px;
    color: #818cf8;
    text-decoration: none;
  }

  .link-helper:hover {
    text-decoration: underline;
  }

  .slider-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .range-input {
    width: 100%;
    height: 6px;
    background: var(--border-color);
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }

  .range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: #818cf8;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.1s;
  }

  .range-input::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  .range-labels {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .settings-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .save-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .save-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .save-btn:disabled {
    background: #10b981;
    cursor: default;
  }
</style>
