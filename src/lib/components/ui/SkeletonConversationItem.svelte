<script lang="ts">
/**
 * Skeleton loader for conversation items in sidebar
 */
</script>

<div class="skeleton-item">
  <div class="skeleton-icon"></div>
  <div class="skeleton-content">
    <div class="skeleton-title"></div>
    <div class="skeleton-date"></div>
  </div>
</div>

<style>
  .skeleton-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px;
    margin-bottom: 4px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.02);
  }

  .skeleton-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--bg-input);
    animation: pulse 1.5s infinite ease-in-out;
    flex-shrink: 0;
  }

  .skeleton-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .skeleton-title {
    height: 14px;
    width: 70%;
    border-radius: 4px;
    background: var(--bg-input);
    animation: pulse 1.5s infinite ease-in-out;
  }

  .skeleton-date {
    height: 10px;
    width: 40%;
    border-radius: 4px;
    background: var(--bg-input);
    opacity: 0.6;
    animation: pulse 1.5s infinite ease-in-out;
    animation-delay: 0.2s;
  }

  @keyframes pulse {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.2;
    }
    100% {
      opacity: 0.5;
    }
  }
</style>
