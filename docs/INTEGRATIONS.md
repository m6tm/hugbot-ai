# Intégrations ChatAI

Ce document décrit l'implémentation du système d'intégrations pour ChatAI, permettant de connecter l'application à des systèmes externes pour recevoir des notifications.

## Architecture

### Structure des fichiers

```
src/
├── lib/
│   ├── services/
│   │   └── telegram.service.ts      # Service pour les notifications Telegram
│   ├── stores/
│   │   └── integrations.store.ts    # Store Svelte pour les intégrations
│   └── components/
│       └── TelegramTester.svelte    # Composant de test pour Telegram
├── routes/
│   ├── settings/
│   │   └── +page.svelte            # Page des paramètres avec section intégrations
│   └── docs/
│       └── integrations/
│           └── +page.svelte        # Documentation des intégrations
```

### Composants principaux

#### 1. IntegrationsStore (`src/lib/stores/integrations.store.ts`)
- Gère la configuration des intégrations
- Stockage persistant via IndexedDB
- API pour tester les connexions
- Configuration spécifique par intégration

#### 2. TelegramService (`src/lib/services/telegram.service.ts`)
- Service singleton pour les notifications Telegram
- Support de différents types de notifications
- Gestion des erreurs et retry logic
- API compatible avec l'API Bot Telegram

#### 3. Interface utilisateur
- Section dédiée dans les paramètres
- Tests de connexion en temps réel
- Configuration guidée
- Documentation intégrée

## Intégrations disponibles

### Telegram

#### Configuration
```typescript
interface TelegramIntegration {
  enabled: boolean;
  botToken: string;
  chatId: string;
  sendOnNewMessage: boolean;
  sendOnError: boolean;
}
```

#### Types de notifications
- **Nouveaux messages** : Notifications lors de nouvelles conversations
- **Erreurs système** : Alertes automatiques en cas d'erreur
- **Statuts système** : Notifications de statut (online/offline/maintenance)
- **Statistiques** : Rapports d'utilisation périodiques

#### Configuration requise
1. Créer un bot via @BotFather sur Telegram
2. Obtenir le token du bot
3. Récupérer le Chat ID (personnel ou groupe)
4. Configurer les options de notification

## Utilisation

### Configuration d'une intégration

```typescript
import { integrationsStore } from "$lib/stores";

// Configurer Telegram
integrationsStore.setTelegramConfig({
  botToken: "votre-token-bot",
  chatId: "votre-chat-id",
  sendOnNewMessage: true,
  sendOnError: true
});

// Activer l'intégration
integrationsStore.toggleTelegram(true);
```

### Envoi de notifications

```typescript
import { telegramService } from "$lib/services/telegram.service";

// Initialiser le service
await telegramService.init();

// Notification générique
await telegramService.sendNotification("Message de test");

// Notification de nouvelle conversation
await telegramService.notifyNewMessage(
  "Question de l'utilisateur",
  "Réponse de l'IA"
);

// Notification d'erreur
await telegramService.notifyError(
  "Description de l'erreur",
  "Contexte optionnel"
);

// Statut système
await telegramService.notifySystemStatus(
  "online",
  "Système opérationnel"
);
```

### Tests et debugging

Le composant `TelegramTester` permet de :
- Tester la validité du bot
- Vérifier la connexion au chat
- Simuler différents types de notifications
- Debugger les problèmes de configuration

## Intégration avec l'application

### Chat Store Integration

Le store de chat a été modifié pour envoyer automatiquement des notifications :

```typescript
// Dans sendMessage() du chat.store.ts
try {
  const integrations = get(integrationsStore);
  if (integrations.telegram.enabled) {
    await telegramService.updateConfig(integrations.telegram);
    await telegramService.notifyNewMessage(content, assistantMessage.content);
  }
} catch (telegramError) {
  console.warn("Erreur lors de l'envoi de notification Telegram:", telegramError);
}
```

### Gestion des erreurs

Les erreurs de notification sont loggées mais ne bloquent pas le fonctionnement principal :

```typescript
// Notifications d'erreur automatiques
try {
  if (integrations.telegram.enabled && integrations.telegram.sendOnError) {
    await telegramService.notifyError(
      (error as Error).message,
      "Envoi de message"
    );
  }
} catch (telegramError) {
  console.warn("Erreur lors de l'envoi de notification d'erreur:", telegramError);
}
```

## Base de données

### Schéma IndexedDB

```typescript
interface SettingsRecord {
  id: string;
  // ... autres paramètres
  telegram?: {
    enabled: boolean;
    botToken: string;
    chatId: string;
    sendOnNewMessage: boolean;
    sendOnError: boolean;
  };
}
```

Les paramètres d'intégrations sont stockés dans la même table que les autres paramètres avec l'ID `integrations_settings`.

## Sécurité

### Tokens et clés API
- Les tokens sont stockés de manière sécurisée dans IndexedDB
- Pas d'exposition côté client des tokens dans les logs
- Champs de type `password` dans l'interface

### Validation
- Validation des tokens via l'API Telegram
- Vérification des Chat IDs avant envoi
- Gestion des erreurs d'API

## Extensibilité

### Ajouter une nouvelle intégration

1. **Étendre le store** :
```typescript
// Dans integrations.store.ts
export interface IntegrationsState {
  telegram: TelegramIntegration;
  discord: DiscordIntegration; // Nouvelle intégration
}
```

2. **Créer le service** :
```typescript
// src/lib/services/discord.service.ts
export class DiscordService {
  // Implémentation similaire à TelegramService
}
```

3. **Ajouter l'interface** :
```svelte
<!-- Dans settings/+page.svelte -->
<div class="integration-item">
  <!-- Configuration Discord -->
</div>
```

4. **Documentation** :
- Ajouter une section dans `docs/integrations/+page.svelte`
- Mettre à jour ce README

### Intégrations prévues

- **Discord** : Webhooks et bots Discord
- **Slack** : Intégration avec les canaux Slack
- **Email** : Notifications SMTP
- **Webhooks** : Intégrations HTTP personnalisées

## Tests

### Tests unitaires (à implémenter)
```typescript
// tests/integrations/telegram.service.test.ts
describe('TelegramService', () => {
  test('should send notification successfully', async () => {
    // Test d'envoi de notification
  });
  
  test('should handle API errors gracefully', async () => {
    // Test de gestion d'erreurs
  });
});
```

### Tests d'intégration
- Utiliser le composant `TelegramTester`
- Vérifier les notifications en conditions réelles
- Tester la persistance des configurations

## Monitoring

### Logs
- Erreurs de notifications loggées dans la console
- Statuts de succès/échec trackés
- Pas de log des tokens sensibles

### Métriques (à implémenter)
- Nombre de notifications envoyées
- Taux de succès par intégration
- Temps de réponse des APIs externes

## Maintenance

### Mise à jour des APIs
- API Telegram Bot : https://core.telegram.org/bots/api
- Vérifier les changements de breaking changes
- Tester les nouvelles fonctionnalités

### Configuration
- Backup des configurations d'intégrations
- Migration des schémas de données
- Gestion des versions de configuration

---

**Auteur** : Système d'intégrations ChatAI  
**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2024