<script lang="ts">
  /**
   * Page de documentation des intégrations
   */
  import { goto } from "$app/navigation";
  import CodeBlock from "$lib/components/CodeBlock.svelte";
</script>

<div class="docs-container">
  <header class="docs-header">
    <button
      class="back-btn"
      onclick={() => goto("/docs")}
      aria-label="Retour à la documentation"
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
    <h1>Intégrations</h1>
    <p class="subtitle">
      Connectez ChatAI à vos systèmes externes pour recevoir des notifications
    </p>
  </header>

  <div class="docs-content">
    <!-- Section Telegram -->
    <section class="integration-section">
      <div class="section-header">
        <div class="integration-icon telegram">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.61-.52.36-.99.53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.74 4.02-1.76 6.7-2.92 8.03-3.49 3.82-1.58 4.62-1.85 5.14-1.86.11 0 .37.03.53.16.14.11.18.26.2.37.02.06.04.19.02.3z" fill="currentColor"/>
          </svg>
        </div>
        <div>
          <h2>Telegram</h2>
          <p>Recevez des notifications en temps réel sur Telegram</p>
        </div>
      </div>

      <div class="setup-steps">
        <h3>Configuration</h3>

        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>Créer un Bot Telegram</h4>
            <p>Envoyez un message à <strong>@BotFather</strong> sur Telegram :</p>
            <CodeBlock code="/newbot" language="text" />
            <p>Suivez les instructions et notez le <strong>token</strong> fourni.</p>
          </div>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>Obtenir votre Chat ID</h4>
            <p>Pour recevoir des notifications personnelles :</p>
            <ol>
              <li>Envoyez un message à <strong>@userinfobot</strong></li>
              <li>Le bot vous donnera votre Chat ID personnel</li>
            </ol>

            <p>Pour un groupe ou canal :</p>
            <ol>
              <li>Ajoutez votre bot au groupe/canal</li>
              <li>Envoyez un message dans le groupe</li>
              <li>Visitez : <code>https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code></li>
              <li>Trouvez le Chat ID dans la réponse JSON</li>
            </ol>
          </div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>Configuration dans ChatAI</h4>
            <p>Allez dans les <strong>Paramètres → Intégrations</strong> et :</p>
            <ol>
              <li>Activez l'intégration Telegram</li>
              <li>Saisissez votre token de bot</li>
              <li>Saisissez votre Chat ID</li>
              <li>Configurez les options de notification</li>
              <li>Testez la connexion</li>
            </ol>
          </div>
        </div>
      </div>

      <div class="features">
        <h3>Fonctionnalités</h3>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h4>Nouveaux Messages</h4>
            <p>Notifications lors de nouvelles conversations</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">❌</div>
            <h4>Erreurs Système</h4>
            <p>Alertes automatiques en cas d'erreur</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔧</div>
            <h4>Test de Connexion</h4>
            <p>Vérification de la configuration</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h4>Statistiques</h4>
            <p>Rapports d'utilisation périodiques</p>
          </div>
        </div>
      </div>

      <div class="api-reference">
        <h3>Référence API</h3>
        <p>Les notifications utilisent l'API Telegram Bot :</p>

        <div class="code-example">
          <h4>Exemple de notification</h4>
          <CodeBlock
            code={`🤖 **Nouvelle conversation ChatAI**

**Utilisateur:**
Comment créer une API REST ?

**Réponse IA:**
Pour créer une API REST, vous devez...`}
            language="markdown"
          />
        </div>

        <div class="code-example">
          <h4>Notification d'erreur</h4>
          <CodeBlock
            code={`❌ **Erreur ChatAI**

**Contexte:** Envoi de message
**Erreur:** API Key invalide

**Heure:** 01/01/2024 14:30:25`}
            language="markdown"
          />
        </div>
      </div>

      <div class="troubleshooting">
        <h3>Dépannage</h3>

        <div class="trouble-item">
          <h4>Le bot ne répond pas</h4>
          <ul>
            <li>Vérifiez que le token est correct</li>
            <li>Assurez-vous que le bot est créé via @BotFather</li>
            <li>Testez le token avec l'API Telegram : <code>/getMe</code></li>
          </ul>
        </div>

        <div class="trouble-item">
          <h4>Messages non reçus</h4>
          <ul>
            <li>Vérifiez le Chat ID</li>
            <li>Pour un groupe, assurez-vous que le bot est membre</li>
            <li>Vérifiez les permissions du bot</li>
          </ul>
        </div>

        <div class="trouble-item">
          <h4>Erreur "Chat not found"</h4>
          <ul>
            <li>Envoyez d'abord un message au bot</li>
            <li>Vérifiez que le Chat ID est au bon format (négatif pour les groupes)</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Section Intégrations futures -->
    <section class="future-integrations">
      <h2>Intégrations à venir</h2>
      <div class="coming-soon-grid">
        <div class="coming-soon-card">
          <div class="integration-icon discord">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" fill="currentColor"/>
            </svg>
          </div>
          <h4>Discord</h4>
          <p>Notifications via webhooks Discord</p>
          <span class="coming-soon">Bientôt</span>
        </div>

        <div class="coming-soon-card">
          <div class="integration-icon slack">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="currentColor"/>
            </svg>
          </div>
          <h4>Slack</h4>
          <p>Intégration avec les canaux Slack</p>
          <span class="coming-soon">Bientôt</span>
        </div>

        <div class="coming-soon-card">
          <div class="integration-icon email">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h4>Email</h4>
          <p>Notifications par email SMTP</p>
          <span class="coming-soon">Bientôt</span>
        </div>

        <div class="coming-soon-card">
          <div class="integration-icon webhook">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="16,6 12,2 8,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h4>Webhooks</h4>
          <p>Intégration personnalisée via HTTP</p>
          <span class="coming-soon">Bientôt</span>
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  .docs-container {
    flex: 1;
    padding: 40px;
    overflow-y: auto;
    background: var(--bg-main);
    color: var(--text-secondary);
  }

  .docs-header {
    margin-bottom: 40px;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
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

  h1 {
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
  }

  .subtitle {
    color: var(--text-muted);
    font-size: 16px;
  }

  .docs-content {
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
  }

  .integration-section {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 32px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
  }

  .integration-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .integration-icon.telegram {
    background: rgba(0, 136, 204, 0.1);
    color: #0088cc;
  }

  .section-header h2 {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-main);
    margin: 0 0 4px 0;
  }

  .section-header p {
    color: var(--text-muted);
    margin: 0;
  }

  .setup-steps {
    margin-bottom: 48px;
  }

  .setup-steps h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 24px;
  }

  .step {
    display: flex;
    gap: 16px;
    margin-bottom: 32px;
  }

  .step-number {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #0088cc 0%, #005fa3 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .step-content h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
    margin: 0 0 8px 0;
  }

  .step-content p {
    color: var(--text-secondary);
    margin-bottom: 12px;
    line-height: 1.6;
  }

  .step-content ol {
    color: var(--text-secondary);
    padding-left: 20px;
  }

  .step-content li {
    margin-bottom: 4px;
    line-height: 1.5;
  }

  .step-content code {
    background: var(--bg-input);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    color: var(--text-main);
  }

  .features {
    margin-bottom: 48px;
  }

  .features h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 24px;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }

  .feature-card {
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
  }

  .feature-icon {
    font-size: 24px;
    margin-bottom: 12px;
  }

  .feature-card h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
    margin: 0 0 8px 0;
  }

  .feature-card p {
    color: var(--text-muted);
    font-size: 14px;
    margin: 0;
  }

  .api-reference {
    margin-bottom: 48px;
  }

  .api-reference h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 16px;
  }

  .api-reference p {
    color: var(--text-secondary);
    margin-bottom: 24px;
  }

  .code-example {
    margin-bottom: 24px;
  }

  .code-example h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 12px;
  }

  .troubleshooting h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 24px;
  }

  .trouble-item {
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
  }

  .trouble-item h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
    margin: 0 0 12px 0;
  }

  .trouble-item ul {
    color: var(--text-secondary);
    padding-left: 20px;
    margin: 0;
  }

  .trouble-item li {
    margin-bottom: 8px;
    line-height: 1.5;
  }

  .future-integrations {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 32px;
  }

  .future-integrations h2 {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 24px;
  }

  .coming-soon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }

  .coming-soon-card {
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    position: relative;
    opacity: 0.7;
  }

  .coming-soon-card .integration-icon.discord {
    background: rgba(114, 137, 218, 0.1);
    color: #7289da;
  }

  .coming-soon-card .integration-icon.slack {
    background: rgba(74, 21, 75, 0.1);
    color: #4a154b;
  }

  .coming-soon-card .integration-icon.email {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  .coming-soon-card .integration-icon.webhook {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }

  .coming-soon-card h4 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-main);
    margin: 12px 0 8px 0;
  }

  .coming-soon-card p {
    color: var(--text-muted);
    font-size: 14px;
    margin-bottom: 16px;
  }

  .coming-soon {
    display: inline-block;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  @media (max-width: 768px) {
    .docs-container {
      padding: 20px;
    }

    .integration-section {
      padding: 24px;
    }

    .section-header {
      flex-direction: column;
      text-align: center;
      gap: 12px;
    }

    .step {
      flex-direction: column;
      gap: 12px;
    }

    .step-number {
      align-self: flex-start;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .coming-soon-grid {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
  }
</style>
