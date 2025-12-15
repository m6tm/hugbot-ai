<script lang="ts">
/**
 * Page des parametres
 */

import {
	ArrowLeft,
	Check,
	ChevronRight,
	Database,
	FileText,
	Heart,
	Loader2,
	Mic,
	Moon,
	Sun,
	X,
} from "lucide-svelte";
import { onMount } from "svelte";
import { slide } from "svelte/transition";
import { enhance } from "$app/forms";
import { goto } from "$app/navigation";
import { RAGService } from "$lib/ai/rag";
import { integrationsStore, settingsStore, themeStore } from "$lib/stores";

let { data } = $props();

// Local state for form inputs
let apiKey = $state("");
let temperature = $state(0.7);
let maxTokens = $state(1024);
let codeTheme = $state("tokyo-night");
let systemInstruction = $state("");

// Telegram Integration Locals
let telegramEnabled = $state(false);
let telegramBotToken = $state("");
let telegramChatId = $state("");
let telegramSendOnNewMessage = $state(true);
let telegramSendOnError = $state(true);
let telegramTestStatus = $state<"idle" | "testing" | "success" | "error">(
	"idle",
);
let telegramErrorMessage = $state("");

// Knowledge Base Locals
let kbText = $state("");
let isIndexing = $state(false);
let kbSuccess = $state(false);

// Help toggle
let isHelpCollapsed = $state(true);

// Server State to track dirty status
let serverState = $state({
	apiKey: "",
	temperature: 0.7,
	maxTokens: 1024,
	codeTheme: "tokyo-night",
	systemInstruction: "",
	telegramEnabled: false,
	telegramBotToken: "",
	telegramChatId: "",
	telegramSendOnNewMessage: true,
	telegramSendOnError: true,
});

onMount(async () => {
	// 1. Initialize Stores from Dexie
	await integrationsStore.init();
	await settingsStore.init();

	// 2. Set Local State from Stores (Dexie)
	apiKey = $settingsStore.apiKey;
	temperature = $settingsStore.temperature;
	maxTokens = $settingsStore.maxTokens;
	codeTheme = $settingsStore.codeTheme;
	systemInstruction = $settingsStore.systemInstruction;

	const integrations = $integrationsStore;
	telegramEnabled = integrations.telegram.enabled;
	telegramBotToken = integrations.telegram.botToken;
	telegramChatId = integrations.telegram.chatId;
	telegramSendOnNewMessage = integrations.telegram.sendOnNewMessage;
	telegramSendOnError = integrations.telegram.sendOnError;

	// 3. Set Server State reference from Props of correct data
	if (data.settings) {
		serverState = {
			apiKey: data.settings.apiKey || "",
			// Use server data if valid, else default.
			// Note: If server has 0.7 and dexie has 0.8, isDirty should be true.
			temperature: data.settings.temperature ?? 0.7,
			maxTokens: data.settings.maxTokens ?? 1024,
			codeTheme: data.settings.codeTheme || "tokyo-night",
			systemInstruction: data.settings.systemInstruction || "",
			telegramEnabled: data.settings.telegramEnabled ?? false,
			telegramBotToken: data.settings.telegramBotToken || "",
			telegramChatId: data.settings.telegramChatId || "",
			telegramSendOnNewMessage: data.settings.telegramSendOnNewMessage ?? true,
			telegramSendOnError: data.settings.telegramSendOnError ?? true,
		};
	}
});

function isDirty(section: string) {
	if (section === "appearance") {
		return codeTheme !== serverState.codeTheme; // Theme light/dark is local only via themeStore typically? Or we added it? codeTheme is in DB.
	}
	if (section === "ai") {
		return (
			apiKey !== serverState.apiKey ||
			temperature !== serverState.temperature ||
			maxTokens !== serverState.maxTokens
		);
	}
	if (section === "system") {
		return systemInstruction !== serverState.systemInstruction;
	}
	if (section === "integrations") {
		return (
			telegramEnabled !== serverState.telegramEnabled ||
			telegramBotToken !== serverState.telegramBotToken ||
			telegramChatId !== serverState.telegramChatId ||
			telegramSendOnNewMessage !== serverState.telegramSendOnNewMessage ||
			telegramSendOnError !== serverState.telegramSendOnError
		);
	}
	return false;
}

import type { ActionResult } from "@sveltejs/kit";

const handleSubmit = ({ formData }: { formData: FormData }) => {
	const section = formData.get("section") as string;

	// Populate FormData manually since inputs might lack name attributes
	if (section === "appearance") {
		formData.set("codeTheme", codeTheme);
		settingsStore.setCodeTheme(codeTheme);
	} else if (section === "ai") {
		formData.set("apiKey", apiKey);
		formData.set("temperature", temperature.toString());
		formData.set("maxTokens", maxTokens.toString());
		settingsStore.setApiKey(apiKey);
		settingsStore.setTemperature(temperature);
		settingsStore.setMaxTokens(maxTokens);
	} else if (section === "system") {
		formData.set("systemInstruction", systemInstruction);
		settingsStore.setSystemInstruction(systemInstruction);
	} else if (section === "integrations") {
		formData.set("telegramEnabled", String(telegramEnabled));
		formData.set("telegramBotToken", telegramBotToken);
		formData.set("telegramChatId", telegramChatId);
		formData.set("telegramSendOnNewMessage", String(telegramSendOnNewMessage));
		formData.set("telegramSendOnError", String(telegramSendOnError));

		integrationsStore.setTelegramConfig({
			enabled: telegramEnabled,
			botToken: telegramBotToken,
			chatId: telegramChatId,
			sendOnNewMessage: telegramSendOnNewMessage,
			sendOnError: telegramSendOnError,
		});
		integrationsStore.toggleTelegram(telegramEnabled);
	}

	return async ({
		result,
		update,
	}: {
		result: ActionResult;
		update: () => Promise<void>;
	}) => {
		if (result.type === "success") {
			// Update Server State Reference to reflect successful save
			if (section === "appearance") {
				serverState.codeTheme = codeTheme;
			} else if (section === "ai") {
				serverState.apiKey = apiKey;
				serverState.temperature = temperature;
				serverState.maxTokens = maxTokens;
			} else if (section === "system") {
				serverState.systemInstruction = systemInstruction;
			} else if (section === "integrations") {
				serverState.telegramEnabled = telegramEnabled;
				serverState.telegramBotToken = telegramBotToken;
				serverState.telegramChatId = telegramChatId;
				serverState.telegramSendOnNewMessage = telegramSendOnNewMessage;
				serverState.telegramSendOnError = telegramSendOnError;
			}
		}
		await update();
	};
};

// ... Helper functions for UI interactions (telegram tests, help toggle) ...

function handleTelegramToggle() {
	telegramEnabled = !telegramEnabled;
	// Don't save immediately to store, wait for Save button.
	// integrationsStore.toggleTelegram(telegramEnabled); <--- Removed auto-save
}

function toggleHelp() {
	isHelpCollapsed = !isHelpCollapsed;
}

async function testTelegramConnection() {
	if (!telegramBotToken) return;
	telegramTestStatus = "testing";
	telegramErrorMessage = "";
	const result =
		await integrationsStore.testTelegramConnection(telegramBotToken);
	if (result.ok) {
		telegramTestStatus = "success";
		if (result.bot?.username) {
			telegramErrorMessage = `Bot @${result.bot.username} connecte`;
		}
	} else {
		telegramTestStatus = "error";
		telegramErrorMessage = result.error || "Erreur de connexion";
	}
	setTimeout(() => {
		telegramTestStatus = "idle";
		telegramErrorMessage = "";
	}, 4000);
}

async function sendTelegramTestMessage() {
	if (!telegramBotToken || !telegramChatId) return;
	telegramTestStatus = "testing";
	telegramErrorMessage = "";
	const result = await integrationsStore.sendTelegramTestMessage(
		telegramBotToken,
		telegramChatId,
	);
	if (result.ok) {
		telegramTestStatus = "success";
		telegramErrorMessage = "Message envoye !";
	} else {
		telegramTestStatus = "error";
		telegramErrorMessage = result.error || "Echec de l'envoi";
	}
	setTimeout(() => {
		telegramTestStatus = "idle";
		telegramErrorMessage = "";
	}, 4000);
}

async function handleAddDocument() {
	if (!kbText.trim()) return;
	isIndexing = true;
	try {
		const ragService = RAGService.getInstance();
		await ragService.addDocument(kbText);
		kbText = "";
		kbSuccess = true;
		setTimeout(() => {
			kbSuccess = false;
		}, 3000);
	} catch (e) {
		console.error("Indexing failed", e);
	} finally {
		isIndexing = false;
	}
}
</script>

<div class="settings-container">
  <header class="settings-header">
    <button
      class="back-btn"
      onclick={() => goto("/")}
      aria-label="Retour a l'accueil"
    >
      <ArrowLeft size={20} />
      <span>Retour</span>
    </button>
    <h1>Parametres</h1>
    <p class="subtitle">Gerez vos preferences et configurations AI</p>
  </header>

  <div class="settings-grid">
    <!-- Section Apparence -->
    <form
      method="POST"
      action="?/saveSettings"
      use:enhance={handleSubmit}
      class="settings-form"
    >
      <input type="hidden" name="section" value="appearance" />
      <section class="settings-card">
        <div class="card-header">
          <div class="icon-wrapper theme">
            <Sun size={20} />
          </div>
          <h2>Apparence</h2>
        </div>

        <div class="card-content">
          <div class="setting-item">
            <div class="setting-label">
              <span>Theme de l'interface</span>
              <small>Choisissez entre le mode clair et sombre</small>
            </div>
            <button
              class="theme-toggle"
              onclick={(e) => { e.preventDefault(); themeStore.toggle(); }}
            >
              {#if $themeStore.isDark}
                <Moon size={16} class="theme-icon" />
                Mode Sombre
              {:else}
                <Sun size={16} class="theme-icon" />
                Mode Clair
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

          <div class="card-footer">
            <button class="save-btn-small" disabled={!isDirty('appearance')}>
               Enregistrer
            </button>
          </div>
        </div>
      </section>
    </form>

    <!-- Section Configuration AI -->
    <form
      method="POST"
      action="?/saveSettings"
      use:enhance={handleSubmit}
      class="settings-form"
    >
      <input type="hidden" name="section" value="ai" />
      <section class="settings-card">
        <div class="card-header">
          <div class="icon-wrapper ai">
            <Mic size={20} />
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

          <div class="card-footer">
            <button class="save-btn-small" disabled={!isDirty('ai')}>
               Enregistrer
            </button>
          </div>
        </div>
      </section>
    </form>

    <!-- Section Instructions Systeme -->
    <form
      method="POST"
      action="?/saveSettings"
      use:enhance={handleSubmit}
      class="settings-form"
    >
      <input type="hidden" name="section" value="system" />
      <section class="settings-card">
        <div class="card-header">
          <div class="icon-wrapper system">
            <FileText size={20} />
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
          
          <div class="card-footer">
            <button class="save-btn-small" disabled={!isDirty('system')}>
               Enregistrer
            </button>
          </div>
        </div>
      </section>
    </form>

    <!-- Section Knowledge Base -->
    <section class="settings-card">
      <div class="card-header">
        <div class="icon-wrapper database">
          <Database size={20} />
        </div>
        <h2>Base de Connaissance (RAG Local)</h2>
      </div>

      <div class="card-content">
        <div class="setting-item full-width">
          <div class="setting-label">
            <span>Ajouter des documents</span>
            <small
              >Ces informations seront utilisées par l'IA pour répondre.</small
            >
          </div>
          <div class="input-wrapper">
            <textarea
              bind:value={kbText}
              class="text-area"
              rows="6"
              placeholder="Collez ici du texte ou de la documentation..."
            ></textarea>

            <div
              class="button-group"
              style="justify-content: flex-end; margin-top: 10px;"
            >
              <button
                class="save-btn-small"
                onclick={handleAddDocument}
                disabled={isIndexing || !kbText}
              >
                {#if isIndexing}
                  <Loader2 size={16} class="spin" /> Indexation...
                {:else if kbSuccess}
                  <Check size={16} /> Ajouté !
                {:else}
                  Ajouter à la base
                {/if}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Intégrations -->
    <form
      method="POST"
      action="?/saveSettings"
      use:enhance={handleSubmit}
      class="settings-form"
    >
      <input type="hidden" name="section" value="integrations" />
      <section class="settings-card">
        <div class="card-header">
          <div class="icon-wrapper integration">
            <Heart size={20} />
          </div>
          <h2>Intégrations</h2>
        </div>

        <div class="card-content">
          <div class="integration-help">
            <p>
              Connectez ChatAI à vos systèmes externes pour recevoir des
              notifications en temps réel.
            </p>
            <a href="/docs/integrations" class="docs-link">
              <FileText size={16} />
              Voir la documentation
            </a>
          </div>
          <!-- Intégration Telegram -->
          <div class="integration-item">
            <div class="integration-header">
              <div class="integration-info">
                <div class="integration-title">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.61-.52.36-.99.53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.74 4.02-1.76 6.7-2.92 8.03-3.49 3.82-1.58 4.62-1.85 5.14-1.86.11 0 .37.03.53.16.14.11.18.26.2.37.02.06.04.19.02.3z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>Telegram</span>
                </div>
                <small>Recevez des notifications via Telegram</small>
              </div>
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  checked={telegramEnabled}
                  onchange={handleTelegramToggle}
                />
                <span class="toggle-slider"></span>
              </label>
            </div>

            {#if telegramEnabled}
              <div class="integration-config">
                <div class="setting-item">
                  <div class="setting-label">
                    <span>Token du Bot</span>
                    <small>Créez un bot via @BotFather sur Telegram</small>
                  </div>
                  <div class="input-wrapper">
                    <input
                      type="password"
                      placeholder="1234567890:ABCdefghijklmnopqrstuvwxyz"
                      bind:value={telegramBotToken}
                      class="text-input"
                    />
                    <div class="button-group">
                      <button
                        class="test-btn"
                        onclick={(e) => { e.preventDefault(); testTelegramConnection(); }}
                        disabled={!telegramBotToken ||
                          telegramTestStatus === "testing"}
                      >
                        {#if telegramTestStatus === "testing"}
                          Test...
                        {:else if telegramTestStatus === "success"}
                          <Check size={14} />
                          Valide
                        {:else if telegramTestStatus === "error"}
                          <X size={14} />
                          Erreur
                        {:else}
                          Tester Bot
                        {/if}
                      </button>
                    </div>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-label">
                    <span>Chat ID</span>
                    <small>ID du chat où envoyer les notifications</small>
                  </div>
                  <div class="input-wrapper">
                    <input
                      type="text"
                      placeholder="-1001234567890"
                      bind:value={telegramChatId}
                      class="text-input"
                    />
                    <div class="button-group">
                      <button
                        class="test-btn"
                        onclick={(e) => { e.preventDefault(); sendTelegramTestMessage(); }}
                        disabled={!telegramBotToken ||
                          !telegramChatId ||
                          telegramTestStatus === "testing"}
                      >
                        {#if telegramTestStatus === "testing"}
                          Envoi...
                        {:else if telegramTestStatus === "success"}
                          <Check size={14} />
                          Envoyé
                        {:else if telegramTestStatus === "error"}
                          <X size={14} />
                          Échec
                        {:else}
                          Test Message
                        {/if}
                      </button>
                    </div>
                  </div>
                </div>

                {#if telegramErrorMessage}
                  <div
                    class="telegram-status"
                    class:success={telegramTestStatus === "success"}
                    class:error={telegramTestStatus === "error"}
                  >
                    {telegramErrorMessage}
                  </div>
                {/if}

                <div class="setting-item">
                  <div class="setting-label">
                    <span>Options de notification</span>
                    <small>Configurez quand recevoir des notifications</small>
                  </div>
                  <div class="checkbox-group">
                    <label class="checkbox-item">
                      <input
                        type="checkbox"
                        bind:checked={telegramSendOnNewMessage}
                      />
                      <span>Nouveaux messages</span>
                    </label>
                    <label class="checkbox-item">
                      <input type="checkbox" bind:checked={telegramSendOnError} />
                      <span>Erreurs système</span>
                    </label>
                  </div>
                </div>

                <!-- Tutoriel d'aide -->
                <div class="telegram-help">
                  <div
                    class="help-title"
                    onclick={() => {
                      isHelpCollapsed = !isHelpCollapsed;
                    }}
                    role="button"
                    tabindex="0"
                    onkeydown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        isHelpCollapsed = !isHelpCollapsed;
                      }
                    }}
                  >
                    <ChevronRight
                      size={16}
                      class={`help-icon ${!isHelpCollapsed ? "rotated" : ""}`}
                    />
                    <span>Comment configurer ?</span>
                  </div>

                  {#if !isHelpCollapsed}
                    <div
                      class="help-content"
                      transition:slide={{ duration: 300 }}
                    >
                      <div class="help-section">
                        <h5>Obtenir le Token du Bot</h5>
                        <ol>
                          <li>
                            Ouvrez Telegram et recherchez <strong
                              >@BotFather</strong
                            >
                          </li>
                          <li>
                            Envoyez <code>/newbot</code> et suivez les instructions
                          </li>
                          <li>
                            Copiez le token fourni (format: <code
                              >123456:ABC-xyz...</code
                            >)
                          </li>
                        </ol>
                      </div>

                      <div class="help-section">
                        <h5>Obtenir votre Chat ID</h5>
                        <div class="help-method">
                          <strong>Méthode simple :</strong>
                          <ol>
                            <li>
                              Recherchez <strong>@userinfobot</strong> sur Telegram
                            </li>
                            <li>Envoyez-lui n'importe quel message</li>
                            <li>Il vous répondra avec votre Chat ID</li>
                          </ol>
                        </div>
                        <div class="help-method">
                          <strong>Pour un groupe :</strong>
                          <ol>
                            <li>Ajoutez votre bot au groupe</li>
                            <li>Envoyez un message dans le groupe</li>
                            <li>
                              Visitez : <code
                                >https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code
                              >
                            </li>
                            <li>
                              Cherchez <code>"chat":{'"id":'}</code> dans la réponse
                            </li>
                          </ol>
                        </div>
                        <div class="help-note">
                          <strong>Note :</strong>
                          Les Chat ID personnels sont positifs (ex:
                          <code>123456789</code>), les groupes sont négatifs (ex:
                          <code>-1001234567890</code>)
                        </div>
                      </div>
                    </div>
                  {/if}
                </div>

                <div class="integration-actions">
                  <button
                    class="save-btn-small"
                    disabled={!isDirty('integrations')}
                  >
                     Enregistrer
                  </button>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </section>
    </form>


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

  .back-btn :global(svg) {
    transition: transform 0.2s ease;
  }

  .back-btn:hover :global(svg) {
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

  .icon-wrapper.integration {
    background: rgba(147, 51, 234, 0.1);
    color: #9333ea;
  }

  .icon-wrapper.database {
    background: rgba(236, 72, 153, 0.1);
    color: #ec4899;
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



  /* Styles pour les intégrations */
  .integration-item {
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    background: var(--bg-input);
  }

  .integration-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .integration-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .integration-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    color: var(--text-main);
  }

  .integration-title svg {
    color: #0088cc;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 24px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--border-color);
    transition: 0.3s;
    border-radius: 24px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }

  input:checked + .toggle-slider {
    background-color: #9333ea;
  }

  input:checked + .toggle-slider:before {
    transform: translateX(24px);
  }

  .integration-config {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .button-group {
    display: flex;
    gap: 8px;
  }

  .test-btn {
    padding: 8px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-main);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .test-btn:hover:not(:disabled) {
    background: var(--bg-hover);
    border-color: var(--border-hover);
  }

  .test-btn:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
  }

  .checkbox-item input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #9333ea;
  }

  .integration-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
  }

  .save-btn-small {
    padding: 8px 16px;
    background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .save-btn-small:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(147, 51, 234, 0.3);
  }

  .save-btn-small:disabled {
    background: #10b981;
    cursor: default;
  }

  .integration-help {
    margin-bottom: 24px;
    padding: 16px;
    background: var(--bg-input);
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .integration-help p {
    margin: 0 0 12px 0;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .docs-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #818cf8;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
  }

  .docs-link:hover {
    color: #6366f1;
    text-decoration: underline;
  }

  .telegram-status {
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    margin-top: 8px;
  }

  .telegram-status.success {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #10b981;
  }

  .telegram-status.error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  /* Styles pour le tutoriel Telegram */
  .telegram-help {
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    margin-top: 16px;
  }

  .help-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 16px;
    font-size: 15px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: background-color 0.2s ease;
    user-select: none;
  }

  .help-title:hover {
    background: var(--bg-hover);
  }

  .help-title:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  :global(.help-icon) {
    transition: transform 0.3s ease;
  }

  :global(.help-icon.rotated) {
    transform: rotate(90deg);
  }

  .help-content {
    overflow: hidden;
  }

  .help-title :global(svg) {
    color: #818cf8;
  }

  .help-section {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
  }

  .help-section:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .help-section h5 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-main);
    margin: 0 0 12px 0;
  }

  .help-section ol {
    margin: 0;
    padding-left: 20px;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 1.6;
  }

  .help-section li {
    margin-bottom: 6px;
  }

  .help-section code {
    background: var(--bg-card);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    color: #818cf8;
    font-family: monospace;
  }

  .help-method {
    margin-bottom: 12px;
  }

  .help-method strong {
    display: block;
    color: var(--text-main);
    font-size: 13px;
    margin-bottom: 6px;
  }

  .help-note {
    background: rgba(129, 140, 248, 0.1);
    border: 1px solid rgba(129, 140, 248, 0.2);
    border-radius: 8px;
    padding: 12px;
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 12px;
  }

  .help-note strong {
    color: #818cf8;
  }

  .help-note code {
    background: var(--bg-card);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    color: #818cf8;
  }
  .card-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
  }
</style>
