<script lang="ts">
/**
 * Page de documentation de l'API
 */

import { onMount } from "svelte";
import { goto } from "$app/navigation";
import CodeBlock from "$lib/components/CodeBlock.svelte";

let copiedIndex: number | null = $state(null);
let baseUrl = $state("");

onMount(() => {
	baseUrl = window.location.origin;
});

function copyToClipboard(text: string, index: number) {
	navigator.clipboard.writeText(text);
	copiedIndex = index;
	setTimeout(() => {
		copiedIndex = null;
	}, 2000);
}

const endpoints = [
	{
		method: "POST",
		path: "/api/v1/chat/completions",
		description: "Cree une completion de chat avec streaming optionnel",
		auth: true,
	},
	{
		method: "GET",
		path: "/api/v1/models",
		description: "Liste les modeles disponibles",
		auth: false,
	},
];

const models = [
	{
		id: "deepseek-ai/DeepSeek-V3.2",
		name: "DeepSeek V3.2",
		description: "Modele DeepSeek puissant et rapide",
	},
	{
		id: "Qwen/Qwen2.5-72B-Instruct",
		name: "Qwen 2.5 72B",
		description: "Modele Alibaba tres performant",
	},
	{
		id: "meta-llama/Llama-3.3-70B-Instruct",
		name: "Llama 3.3 70B",
		description: "Modele Meta derniere generation",
	},
	{
		id: "mistralai/Mistral-Nemo-Instruct-2407",
		name: "Mistral Nemo",
		description: "Modele Mistral compact et efficace",
	},
	{
		id: "microsoft/Phi-3-mini-4k-instruct",
		name: "Phi-3 Mini",
		description: "Petit modele Microsoft tres capable",
	},
	{
		id: "google/gemma-2-27b-it",
		name: "Gemma 2 27B",
		description: "Modele Google open source",
	},
];
</script>

<div class="docs-container">
  <header class="docs-header">
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

    <div class="header-content">
      <div class="logo-badge">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"
          />
          <path d="M18 14h-8" />
          <path d="M15 18h-5" />
          <path d="M10 6h8v4h-8V6Z" />
        </svg>
      </div>
      <h1>Documentation API</h1>
      <p class="subtitle">API compatible OpenAI SDK pour Chat AI</p>
    </div>
  </header>

  <main class="docs-content">
    <!-- Introduction -->
    <section class="doc-section">
      <h2>Introduction</h2>
      <p>
        Cette API est compatible avec le SDK OpenAI, ce qui vous permet
        d'utiliser votre application existante en changeant simplement la <code
          >baseURL</code
        >. Elle supporte le streaming Server-Sent Events (SSE) pour des reponses
        en temps reel.
      </p>

      <div class="info-box">
        <div class="info-icon">
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
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </div>
        <div class="info-content">
          <strong>Base URL</strong>
          <code class="base-url">{baseUrl}/api/v1</code>
        </div>
      </div>
    </section>

    <!-- Authentification -->
    <section class="doc-section">
      <h2>Authentification</h2>
      <p>
        L'API utilise l'authentification Bearer Token. Incluez votre cle API
        Hugging Face dans l'en-tete <code>Authorization</code>.
      </p>

      <CodeBlock
        language="HTTP Header"
        code="Authorization: Bearer hf_xxxxxxxxxx"
      />

      <p class="note">
        Obtenez votre cle API gratuite sur <a
          href="https://huggingface.co/settings/tokens"
          target="_blank"
          rel="noopener noreferrer">huggingface.co/settings/tokens</a
        >
      </p>
    </section>

    <!-- Endpoints -->
    <section class="doc-section">
      <h2>Endpoints</h2>

      <div class="endpoints-list">
        {#each endpoints as endpoint}
          <div class="endpoint-card">
            <div class="endpoint-header">
              <span class="method {endpoint.method.toLowerCase()}"
                >{endpoint.method}</span
              >
              <code class="endpoint-path">{endpoint.path}</code>
              {#if endpoint.auth}
                <span class="auth-badge">Auth requise</span>
              {/if}
            </div>
            <p class="endpoint-desc">{endpoint.description}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- Chat Completions -->
    <section class="doc-section">
      <h2>POST /api/v1/chat/completions</h2>
      <p>Cree une completion de chat basee sur les messages fournis.</p>

      <h3>Parametres de requete</h3>
      <div class="params-table">
        <div class="param-row header">
          <span>Parametre</span>
          <span>Type</span>
          <span>Requis</span>
          <span>Description</span>
        </div>
        <div class="param-row">
          <code>model</code>
          <span>string</span>
          <span class="required">Oui</span>
          <span>ID du modele a utiliser</span>
        </div>
        <div class="param-row">
          <code>messages</code>
          <span>array</span>
          <span class="required">Oui</span>
          <span>Liste des messages de la conversation</span>
        </div>
        <div class="param-row">
          <code>temperature</code>
          <span>number</span>
          <span class="optional">Non</span>
          <span>Creativite (0.0 - 1.0, defaut: 0.7)</span>
        </div>
        <div class="param-row">
          <code>max_tokens</code>
          <span>number</span>
          <span class="optional">Non</span>
          <span>Nombre max de tokens (defaut: 1024)</span>
        </div>
        <div class="param-row">
          <code>stream</code>
          <span>boolean</span>
          <span class="optional">Non</span>
          <span>Activer le streaming SSE (defaut: false)</span>
        </div>
      </div>

      <h3>Exemple avec SDK OpenAI (Node.js)</h3>
      <CodeBlock
        language="typescript"
        code={`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${baseUrl}/api/v1",
  apiKey: "hf_xxxxxxxxxx",
});

// Mode standard
const response = await client.chat.completions.create({
  model: "deepseek-ai/DeepSeek-V3.2",
  messages: [
    { role: "system", content: "Tu es un assistant helpful." },
    { role: "user", content: "Bonjour !" }
  ],
  temperature: 0.7,
  max_tokens: 1024,
});

console.log(response.choices[0].message.content);`}
      />

      <h3>Exemple avec streaming</h3>
      <CodeBlock
        language="typescript"
        code={`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${baseUrl}/api/v1",
  apiKey: "hf_xxxxxxxxxx",
});

const stream = await client.chat.completions.create({
  model: "deepseek-ai/DeepSeek-V3.2",
  messages: [{ role: "user", content: "Raconte une histoire" }],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || "";
  process.stdout.write(content);
}`}
      />

      <h3>Exemple avec cURL</h3>
      <CodeBlock
        language="bash"
        code={`curl -X POST "${baseUrl}/api/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer hf_xxxxxxxxxx" \\
  -d '{
    "model": "deepseek-ai/DeepSeek-V3.2",
    "messages": [{"role": "user", "content": "Bonjour !"}],
    "temperature": 0.7,
    "max_tokens": 1024
  }'`}
      />

      <h3>Format de reponse</h3>
      <CodeBlock
        language="json"
        code={`{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1701234567,
  "model": "deepseek-ai/DeepSeek-V3.2",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Bonjour ! Comment puis-je vous aider ?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 15,
    "total_tokens": 25
  }
}`}
      />
    </section>

    <!-- Modeles -->
    <section class="doc-section">
      <h2>Modeles disponibles</h2>
      <p>Voici la liste des modeles actuellement disponibles :</p>

      <div class="models-grid">
        {#each models as model}
          <div class="model-card">
            <div class="model-name">{model.name}</div>
            <code class="model-id">{model.id}</code>
            <p class="model-desc">{model.description}</p>
          </div>
        {/each}
      </div>
    </section>

    <!-- Erreurs -->
    <section class="doc-section">
      <h2>Codes d'erreur</h2>

      <div class="errors-table">
        <div class="error-row header">
          <span>Code</span>
          <span>Type</span>
          <span>Description</span>
        </div>
        <div class="error-row">
          <span class="error-code">401</span>
          <code>missing_api_key</code>
          <span>Cle API manquante ou invalide</span>
        </div>
        <div class="error-row">
          <span class="error-code">400</span>
          <code>invalid_request</code>
          <span>Requete mal formee</span>
        </div>
        <div class="error-row">
          <span class="error-code">500</span>
          <code>api_error</code>
          <span>Erreur interne du serveur</span>
        </div>
      </div>
    </section>
  </main>

  <footer class="docs-footer">
    <p>Chat AI API v1.0 &bull; Compatible OpenAI SDK</p>
  </footer>
</div>

<style>
  .docs-container {
    min-height: 100vh;
    background: var(--bg-main);
    color: var(--text-main);
    transition:
      background-color 0.3s ease,
      color 0.3s ease;
  }

  .docs-header {
    padding: 40px;
    border-bottom: 1px solid var(--border-color);
    max-width: 1000px;
    margin: 0 auto;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    margin-bottom: 32px;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-btn:hover {
    background: var(--bg-hover);
    border-color: var(--color-primary);
    color: var(--color-primary);
    transform: translateX(-4px);
  }

  .header-content {
    text-align: center;
  }

  .logo-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: linear-gradient(
      135deg,
      var(--color-primary) 0%,
      var(--color-accent) 100%
    );
    border-radius: 16px;
    color: white;
    margin-bottom: 24px;
  }

  h1 {
    font-size: 36px;
    font-weight: 700;
    background: linear-gradient(
      135deg,
      var(--color-primary-dark) 0%,
      var(--color-accent) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 12px;
  }

  :global(.dark) h1 {
    background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    color: var(--text-muted);
    font-size: 18px;
    margin: 0;
  }

  .docs-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px;
  }

  .doc-section {
    margin-bottom: 48px;
  }

  .doc-section h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-main);
    margin: 0 0 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color);
  }

  .doc-section h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-secondary);
    margin: 32px 0 16px;
  }

  .doc-section p {
    color: var(--text-muted);
    line-height: 1.7;
    margin: 0 0 16px;
  }

  code {
    background: rgba(102, 126, 234, 0.15);
    color: #a5b4fc;
    padding: 2px 8px;
    border-radius: 4px;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 14px;
  }

  .info-box {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: rgba(102, 126, 234, 0.1);
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    margin: 24px 0;
  }

  .info-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(102, 126, 234, 0.2);
    border-radius: 10px;
    color: #667eea;
    flex-shrink: 0;
  }

  .info-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .info-content strong {
    color: var(--text-main);
    font-size: 14px;
  }

  .base-url {
    background: rgba(0, 0, 0, 0.3);
    padding: 8px 12px;
    font-size: 15px;
  }

  :global(:not(.dark)) .base-url {
    background: rgba(255, 255, 255, 0.5);
    color: #4f46e5;
  }

  .note {
    font-size: 14px;
    color: var(--text-muted);
  }

  .note a {
    color: var(--color-primary);
    text-decoration: none;
  }

  .note a:hover {
    text-decoration: underline;
  }

  .endpoints-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .endpoint-card {
    padding: 16px 20px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    transition: all 0.2s;
  }

  .endpoint-card:hover {
    background: var(--bg-hover);
    border-color: var(--color-primary);
  }

  .endpoint-header {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .method {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .method.post {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }

  .method.get {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
  }

  .endpoint-path {
    background: transparent;
    color: var(--text-main);
    font-size: 15px;
  }

  .auth-badge {
    padding: 4px 10px;
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
  }

  .endpoint-desc {
    margin: 8px 0 0;
    font-size: 14px;
    color: var(--text-muted);
  }

  .params-table,
  .errors-table {
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
  }

  .param-row,
  .error-row {
    display: grid;
    grid-template-columns: 140px 80px 80px 1fr;
    gap: 16px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
    align-items: center;
  }

  .error-row {
    grid-template-columns: 80px 160px 1fr;
  }

  .param-row.header,
  .error-row.header {
    background: var(--bg-input);
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 13px;
  }

  .param-row:last-child,
  .error-row:last-child {
    border-bottom: none;
  }

  .param-row code {
    background: transparent;
    color: #a5b4fc;
    padding: 0;
  }

  :global(:not(.dark)) .param-row code {
    color: #6366f1;
  }

  .param-row span,
  .error-row span {
    color: var(--text-muted);
    font-size: 14px;
  }

  .required {
    color: #ef4444 !important;
    font-weight: 500;
  }

  .optional {
    color: var(--text-dim) !important;
  }

  .error-code {
    font-weight: 600;
    color: #ef4444 !important;
  }

  .models-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-top: 16px;
  }

  .model-card {
    padding: 20px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    transition: all 0.2s;
  }

  .model-card:hover {
    background: var(--bg-hover);
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }

  .model-name {
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 8px;
  }

  .model-id {
    display: block;
    background: rgba(0, 0, 0, 0.3);
    padding: 6px 10px;
    font-size: 12px;
    margin-bottom: 12px;
    word-break: break-all;
    color: #e2e8f0;
  }

  :global(:not(.dark)) .model-id {
    background: #f1f5f9;
    color: #334155;
  }

  .model-desc {
    font-size: 13px;
    margin: 0;
    color: var(--text-muted);
  }

  .docs-footer {
    text-align: center;
    padding: 40px;
    border-top: 1px solid var(--border-color);
    color: var(--text-muted);
    font-size: 14px;
  }

  @media (max-width: 768px) {
    .docs-header,
    .docs-content {
      padding: 24px;
    }

    h1 {
      font-size: 28px;
    }

    .param-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .param-row.header {
      display: none;
    }

    .error-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .error-row.header {
      display: none;
    }

    .models-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
