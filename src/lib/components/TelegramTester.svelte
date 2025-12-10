<script lang="ts">
/**
 * Composant pour tester les intégrations Telegram
 */

import { onMount } from "svelte";
import { telegramService } from "$lib/services/telegram.service";
import { integrationsStore } from "$lib/stores";

let botToken = $state("");
let chatId = $state("");
let customTestMessage = $state("🤖 Test de connexion ChatAI");
let testStatus = $state<"idle" | "testing" | "success" | "error">("idle");
let testResult = $state("");
let isConnected = $state(false);

// Fonctions de test définies en avance pour référence
async function runTestConnection() {
	await testConnection();
}

async function runTestMessageSend() {
	await testMessageSend();
}

async function runTestNewConversation() {
	await testNewConversation();
}

async function runTestError() {
	await testError();
}

async function runTestSystemStatus() {
	await testSystemStatus();
}

// Types de tests disponibles
const testTypes: Array<{
	id: string;
	name: string;
	description: string;
	action: () => Promise<void>;
}> = [
	{
		id: "connection",
		name: "Test de connexion",
		description: "Vérifie si le bot est valide",
		action: runTestConnection,
	},
	{
		id: "message",
		name: "Test de message",
		description: "Envoie un message de test",
		action: runTestMessageSend,
	},
	{
		id: "newConversation",
		name: "Simulation nouvelle conversation",
		description: "Simule une notification de nouvelle conversation",
		action: runTestNewConversation,
	},
	{
		id: "error",
		name: "Simulation d'erreur",
		description: "Simule une notification d'erreur",
		action: runTestError,
	},
	{
		id: "systemStatus",
		name: "Statut système",
		description: "Envoie un statut système",
		action: runTestSystemStatus,
	},
];

onMount(() => {
	// Charger la configuration actuelle
	const integrations = $integrationsStore;
	botToken = integrations.telegram.botToken;
	chatId = integrations.telegram.chatId;
});

async function testConnection() {
	if (!botToken) return;

	testStatus = "testing";
	testResult = "Vérification du bot...";

	try {
		const success = await integrationsStore.testTelegramConnection(botToken);
		if (success) {
			testStatus = "success";
			testResult = "✅ Bot valide et opérationnel";
			isConnected = true;
		} else {
			testStatus = "error";
			testResult = "❌ Bot invalide ou inaccessible";
			isConnected = false;
		}
	} catch (error) {
		testStatus = "error";
		testResult = `❌ Erreur: ${(error as Error).message}`;
		isConnected = false;
	}

	setTimeout(resetTest, 3000);
}

async function testMessageSend() {
	if (!botToken || !chatId) return;

	testStatus = "testing";
	testResult = "Envoi du message...";

	try {
		await telegramService.updateConfig({
			enabled: true,
			botToken,
			chatId,
			sendOnNewMessage: true,
			sendOnError: true,
		});

		const success = await telegramService.sendNotification(customTestMessage);
		if (success) {
			testStatus = "success";
			testResult = "✅ Message envoyé avec succès";
		} else {
			testStatus = "error";
			testResult = "❌ Échec de l'envoi du message";
		}
	} catch (error) {
		testStatus = "error";
		testResult = `❌ Erreur: ${(error as Error).message}`;
	}

	setTimeout(resetTest, 3000);
}

async function testNewConversation() {
	if (!botToken || !chatId) return;

	testStatus = "testing";
	testResult = "Envoi de simulation...";

	try {
		await telegramService.updateConfig({
			enabled: true,
			botToken,
			chatId,
			sendOnNewMessage: true,
			sendOnError: true,
		});

		const success = await telegramService.notifyNewMessage(
			"Comment créer une API REST en Node.js ?",
			"Pour créer une API REST en Node.js, vous devez d'abord installer Express.js qui est un framework web rapide et minimaliste...",
		);

		if (success) {
			testStatus = "success";
			testResult = "✅ Notification de conversation envoyée";
		} else {
			testStatus = "error";
			testResult = "❌ Échec de l'envoi de la notification";
		}
	} catch (error) {
		testStatus = "error";
		testResult = `❌ Erreur: ${(error as Error).message}`;
	}

	setTimeout(resetTest, 3000);
}

async function testError() {
	if (!botToken || !chatId) return;

	testStatus = "testing";
	testResult = "Envoi de simulation d'erreur...";

	try {
		await telegramService.updateConfig({
			enabled: true,
			botToken,
			chatId,
			sendOnNewMessage: true,
			sendOnError: true,
		});

		const success = await telegramService.notifyError(
			"Clé API Hugging Face invalide",
			"Envoi de message",
		);

		if (success) {
			testStatus = "success";
			testResult = "✅ Notification d'erreur envoyée";
		} else {
			testStatus = "error";
			testResult = "❌ Échec de l'envoi de la notification d'erreur";
		}
	} catch (error) {
		testStatus = "error";
		testResult = `❌ Erreur: ${(error as Error).message}`;
	}

	setTimeout(resetTest, 3000);
}

async function testSystemStatus() {
	if (!botToken || !chatId) return;

	testStatus = "testing";
	testResult = "Envoi de statut système...";

	try {
		await telegramService.updateConfig({
			enabled: true,
			botToken,
			chatId,
			sendOnNewMessage: true,
			sendOnError: true,
		});

		const success = await telegramService.notifySystemStatus(
			"online",
			"Système ChatAI opérationnel et prêt à traiter vos demandes.",
		);

		if (success) {
			testStatus = "success";
			testResult = "✅ Statut système envoyé";
		} else {
			testStatus = "error";
			testResult = "❌ Échec de l'envoi du statut";
		}
	} catch (error) {
		testStatus = "error";
		testResult = `❌ Erreur: ${(error as Error).message}`;
	}

	setTimeout(resetTest, 3000);
}

function resetTest() {
	testStatus = "idle";
	testResult = "";
}

function updateStore() {
	integrationsStore.setTelegramConfig({
		botToken,
		chatId,
	});
}
</script>

<div class="telegram-tester">
  <div class="tester-header">
    <div class="header-icon">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.61-.52.36-.99.53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.74 4.02-1.76 6.7-2.92 8.03-3.49 3.82-1.58 4.62-1.85 5.14-1.86.11 0 .37.03.53.16.14.11.18.26.2.37.02.06.04.19.02.3z"
          fill="currentColor"
        />
      </svg>
    </div>
    <div>
      <h3>Testeur Telegram</h3>
      <p>Testez votre configuration Telegram</p>
    </div>
  </div>

  <div class="config-section">
    <h4>Configuration</h4>
    <div class="config-grid">
      <div class="config-item">
        <label for="bot-token">Token du Bot</label>
        <input
          id="bot-token"
          type="password"
          bind:value={botToken}
          placeholder="1234567890:ABCdefghijklmnopqrstuvwxyz"
          class="config-input"
        />
      </div>
      <div class="config-item">
        <label for="chat-id">Chat ID</label>
        <input
          id="chat-id"
          type="text"
          bind:value={chatId}
          placeholder="-1001234567890"
          class="config-input"
        />
      </div>
    </div>
    <button class="update-btn" onclick={updateStore}>
      Sauvegarder dans les paramètres
    </button>
  </div>

  <div class="message-section">
    <h4>Message personnalisé</h4>
    <textarea
      bind:value={customTestMessage}
      placeholder="Votre message de test..."
      class="message-input"
      rows="3"
    ></textarea>
  </div>

  <div class="tests-section">
    <h4>Tests disponibles</h4>
    <div class="tests-grid">
      {#each testTypes as test}
        <div class="test-card">
          <div class="test-info">
            <h5>{test.name}</h5>
            <p>{test.description}</p>
          </div>
          <button
            class="test-btn"
            onclick={test.action}
            disabled={testStatus === "testing" ||
              (test.id !== "connection" && !isConnected)}
          >
            {#if testStatus === "testing"}
              <div class="spinner"></div>
              Test...
            {:else}
              Tester
            {/if}
          </button>
        </div>
      {/each}
    </div>
  </div>

  {#if testResult}
    <div
      class="test-result"
      class:success={testStatus === "success"}
      class:error={testStatus === "error"}
    >
      <div class="result-content">
        {testResult}
      </div>
    </div>
  {/if}

  <div class="help-section">
    <h4>Aide</h4>
    <div class="help-content">
      <div class="help-item">
        <strong>1. Connexion :</strong> Vérifiez d'abord que votre bot est valide
      </div>
      <div class="help-item">
        <strong>2. Configuration :</strong> Assurez-vous que le Chat ID est correct
      </div>
      <div class="help-item">
        <strong>3. Tests :</strong> Testez les différents types de notifications
      </div>
      <div class="help-item">
        <strong>💡 Astuce :</strong> Utilisez @userinfobot pour obtenir votre Chat
        ID
      </div>
    </div>
  </div>
</div>

<style>
  .telegram-tester {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 24px;
    margin: 20px 0;
  }

  .tester-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
  }

  .header-icon {
    width: 48px;
    height: 48px;
    background: rgba(0, 136, 204, 0.1);
    color: #0088cc;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tester-header h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-main);
    margin: 0;
  }

  .tester-header p {
    color: var(--text-muted);
    margin: 4px 0 0 0;
    font-size: 14px;
  }

  .config-section,
  .message-section,
  .tests-section,
  .help-section {
    margin-bottom: 32px;
  }

  .config-section h4,
  .message-section h4,
  .tests-section h4,
  .help-section h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 16px;
  }

  .config-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  @media (max-width: 640px) {
    .config-grid {
      grid-template-columns: 1fr;
    }
  }

  .config-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .config-item label {
    font-weight: 500;
    color: var(--text-main);
    font-size: 14px;
  }

  .config-input {
    padding: 10px 12px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-main);
    font-size: 14px;
    transition: all 0.2s;
  }

  .config-input:focus {
    outline: none;
    border-color: #0088cc;
    box-shadow: 0 0 0 2px rgba(0, 136, 204, 0.2);
  }

  .update-btn {
    padding: 8px 16px;
    background: linear-gradient(135deg, #0088cc 0%, #005fa3 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .update-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 136, 204, 0.3);
  }

  .message-input {
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
  }

  .message-input:focus {
    outline: none;
    border-color: #0088cc;
    box-shadow: 0 0 0 2px rgba(0, 136, 204, 0.2);
  }

  .tests-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .test-card {
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .test-info {
    flex: 1;
  }

  .test-info h5 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-main);
    margin: 0 0 4px 0;
  }

  .test-info p {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
    line-height: 1.4;
  }

  .test-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-main);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .test-btn:hover:not(:disabled) {
    background: var(--bg-hover);
    border-color: var(--border-hover);
    color: #0088cc;
  }

  .test-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid var(--border-color);
    border-top: 2px solid #0088cc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .test-result {
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 24px;
    border: 1px solid;
  }

  .test-result.success {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    color: #10b981;
  }

  .test-result.error {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .result-content {
    font-weight: 500;
    font-size: 14px;
  }

  .help-content {
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 16px;
  }

  .help-item {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 8px;
  }

  .help-item:last-child {
    margin-bottom: 0;
  }

  .help-item strong {
    color: var(--text-main);
  }
</style>
