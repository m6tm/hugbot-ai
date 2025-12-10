<script lang="ts">
/**
 * Composant IconButton - Bouton avec icone
 */
type IconType =
	| "menu"
	| "send"
	| "close"
	| "settings"
	| "sun"
	| "moon"
	| "copy"
	| "check";

interface Props {
	icon: IconType;
	onclick?: () => void;
	ariaLabel: string;
	size?: "sm" | "md" | "lg";
	variant?: "ghost" | "filled";
	disabled?: boolean;
}

const {
	icon,
	onclick,
	ariaLabel,
	size = "md",
	variant = "ghost",
	disabled = false,
}: Props = $props();

const sizes = {
	sm: 28,
	md: 36,
	lg: 44,
};

const iconSizes = {
	sm: 16,
	md: 20,
	lg: 24,
};
</script>

<button
  class="icon-button {variant} {size}"
  {onclick}
  aria-label={ariaLabel}
  {disabled}
  style="--btn-size: {sizes[size]}px"
>
  {#if icon === "menu"}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={iconSizes[size]}
      height={iconSizes[size]}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  {:else if icon === "send"}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={iconSizes[size]}
      height={iconSizes[size]}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  {:else if icon === "close"}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={iconSizes[size]}
      height={iconSizes[size]}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  {:else if icon === "settings"}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={iconSizes[size]}
      height={iconSizes[size]}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  {:else if icon === "sun"}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={iconSizes[size]}
      height={iconSizes[size]}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  {:else if icon === "moon"}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={iconSizes[size]}
      height={iconSizes[size]}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  {:else if icon === "copy"}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={iconSizes[size]}
      height={iconSizes[size]}
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
  {:else if icon === "check"}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={iconSizes[size]}
      height={iconSizes[size]}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  {/if}
</button>

<style>
  .icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--btn-size);
    height: var(--btn-size);
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .icon-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ghost {
    background: transparent;
    color: #9ca3af;
  }

  .ghost:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .filled {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .filled:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  }

  .filled:active:not(:disabled) {
    transform: scale(0.98);
  }
</style>
