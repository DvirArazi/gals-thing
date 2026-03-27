<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label = '?',
		ariaLabel = 'Open button',
		onClick,
		children
	} = $props<{
		label?: string;
		ariaLabel?: string;
		onClick?: () => void;
		children?: Snippet;
	}>();
</script>

<button class="floating-button" type="button" aria-label={ariaLabel} onclick={onClick}>
	{#if children}
		{@render children()}
	{:else}
		<span class="button-label">{label}</span>
	{/if}
</button>

<style>
	.floating-button {
		position: fixed;
		left: max(1rem, env(safe-area-inset-left));
		bottom: calc(env(safe-area-inset-bottom) + 1rem);
		z-index: 30;
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem 0.75rem 0.8rem;
		border: 0;
		border-radius: 999px;
		background:
			radial-gradient(circle at top, rgba(255, 255, 255, 0.32), transparent 58%),
			linear-gradient(135deg, #f59e0b, #f97316);
		color: #1c1917;
		box-shadow: 0 1rem 2rem rgba(124, 45, 18, 0.22);
		cursor: pointer;
		transition:
			transform 180ms ease,
			box-shadow 180ms ease,
			filter 180ms ease;
	}

	.floating-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 1.25rem 2.5rem rgba(124, 45, 18, 0.26);
		filter: saturate(1.1);
	}

	.floating-button:focus-visible {
		outline: 3px solid #fde68a;
		outline-offset: 4px;
	}

	.button-label,
	.floating-button :global(.button-text) {
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.18em;
		line-height: 1;
		text-transform: uppercase;
	}

	.floating-button :global(.bonus-icon) {
		display: grid;
		place-items: center;
		width: 2.2rem;
		height: 2.2rem;
		border-radius: 999px;
		background: rgba(255, 251, 235, 0.62);
		box-shadow: inset 0 0 0 1px rgba(120, 53, 15, 0.12);
		flex-shrink: 0;
	}

	.floating-button :global(.bonus-icon svg) {
		width: 1.2rem;
		height: 1.2rem;
	}

	@media (max-width: 640px) {
		.floating-button {
			width: 3rem;
			height: 3rem;
			padding: 0;
			justify-content: center;
			box-shadow: 0 0.9rem 1.8rem rgba(124, 45, 18, 0.24);
		}

		.button-label,
		.floating-button :global(.button-text) {
			display: none;
		}

		.floating-button :global(.bonus-icon) {
			width: 1.75rem;
			height: 1.75rem;
		}
	}
</style>
