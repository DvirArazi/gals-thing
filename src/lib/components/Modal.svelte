<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cubicOut } from 'svelte/easing';

	let { open = $bindable(false), title = 'Modal', children } = $props<{
		open?: boolean;
		title?: string;
		children?: Snippet;
	}>();

	let dialogElement = $state<HTMLDivElement | null>(null);
	const backdropOpacity = 0.48;
	const backdropBlur = 10;

	const close = () => {
		open = false;
	};

	const blurFade = (_node: Element) => ({
		duration: 240,
		easing: cubicOut,
		css: (t: number) => `
			opacity: ${t};
			background-color: rgba(15, 23, 42, ${backdropOpacity * t});
			backdrop-filter: blur(${backdropBlur * t}px);
			-webkit-backdrop-filter: blur(${backdropBlur * t}px);
		`
	});

	const slideUp = (_node: Element) => ({
		duration: 320,
		easing: cubicOut,
		css: (t: number, u: number) => `
			transform: translateY(${u * 88}px) scale(${0.96 + t * 0.04});
			opacity: ${0.4 + t * 0.6};
		`
	});

	const handleBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			close();
		}
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (open && event.key === 'Escape') {
			close();
		}
	};

	$effect(() => {
		if (!open) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		queueMicrotask(() => dialogElement?.focus());

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="backdrop" role="presentation" onclick={handleBackdropClick} transition:blurFade>
		<div
			bind:this={dialogElement}
			class="modal"
			role="dialog"
			aria-modal="true"
			aria-labelledby="instructions-title"
			tabindex="-1"
			transition:slideUp
		>
			<div class="header">
				<h2 id="instructions-title">{title}</h2>
				<button class="close-button" type="button" aria-label="Close modal" onclick={close}>
					×
				</button>
			</div>

			<div class="content">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: grid;
		place-items: center;
		padding:
			max(1rem, env(safe-area-inset-top))
			max(1rem, env(safe-area-inset-right))
			max(1rem, env(safe-area-inset-bottom))
			max(1rem, env(safe-area-inset-left));
		background-color: rgba(15, 23, 42, 0.48);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.modal {
		width: min(100%, 36rem);
		max-height: min(82dvh, 42rem);
		overflow: auto;
		overscroll-behavior: contain;
		border-radius: 1.5rem;
		background: linear-gradient(180deg, #f8fafc, #eef2ff);
		color: #0f172a;
		box-shadow: 0 1.75rem 4rem rgba(15, 23, 42, 0.3);
		padding: 1.5rem;
		outline: none;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	h2 {
		margin: 0;
		font-size: clamp(1.4rem, 2vw, 1.8rem);
	}

	.close-button {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border: 0;
		border-radius: 999px;
		background: rgba(148, 163, 184, 0.18);
		color: inherit;
		font-size: 1.5rem;
		line-height: 1;
		padding: 0 0 0.08rem;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
		transition: background 180ms ease;
	}

	.close-button:hover {
		background: rgba(148, 163, 184, 0.32);
	}

	.close-button:focus-visible {
		outline: 3px solid #0f766e;
		outline-offset: 2px;
	}

	.content {
		font-size: 1rem;
		line-height: 1.65;
	}

	.content :global(ol) {
		margin: 0;
		padding-left: 1.35rem;
	}

	.content :global(li + li) {
		margin-top: 0.75rem;
	}

	.content :global(.bonus-checklist) {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.75rem;
	}

	.content :global(.bonus-checklist li) {
		margin: 0;
	}

	.content :global(.bonus-checklist label) {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.85rem 1rem;
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.65);
		box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.22);
		-webkit-tap-highlight-color: transparent;
	}

	.content :global(.bonus-checklist input) {
		width: 1.1rem;
		height: 1.1rem;
		margin: 0;
		align-self: center;
		flex-shrink: 0;
		appearance: none;
		-webkit-appearance: none;
		border: 2px solid #d97706;
		border-radius: 0.3rem;
		background-color: #fff7ed;
		background-position: center;
		background-repeat: no-repeat;
		background-size: 0.86rem 0.86rem;
		box-shadow: none;
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
		transition:
			background-color 120ms ease,
			border-color 120ms ease;
	}

	.content :global(.bonus-checklist input:checked) {
		border-color: #d97706;
		background-color: #d97706;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='white' d='M6.3 11.2 2.8 7.7l1.4-1.4 2.1 2.1 5.5-5.5 1.4 1.4z'/%3E%3C/svg%3E");
	}

	.content :global(.bonus-checklist input:checked:active),
	.content :global(.bonus-checklist input:checked:focus),
	.content :global(.bonus-checklist input:checked:focus-visible) {
		border-color: #d97706;
		background-color: #d97706;
	}

	.content :global(.bonus-checklist input:focus-visible) {
		outline: 2px solid #fdba74;
		outline-offset: 2px;
	}

	.content :global(.bonus-checklist input + span) {
		transition:
			color 120ms ease,
			text-decoration-color 120ms ease;
	}

	.content :global(.bonus-checklist input:checked + span) {
		color: #64748b;
		text-decoration: line-through;
		text-decoration-thickness: 2px;
		text-decoration-color: rgba(100, 116, 139, 0.85);
	}

	@media (max-width: 640px) {
		.backdrop {
			padding-left: max(1.25rem, env(safe-area-inset-left));
			padding-right: max(1.25rem, env(safe-area-inset-right));
		}

		.modal {
			width: min(32rem, calc(100vw - 2.5rem - env(safe-area-inset-left) - env(safe-area-inset-right)));
			max-width: 100%;
			max-height: min(86dvh, 42rem);
			padding: 1.1rem;
			border-radius: 1.25rem;
		}

		.header {
			margin-bottom: 0.85rem;
		}

		.content {
			font-size: 0.95rem;
			line-height: 1.55;
		}

		.content :global(.bonus-checklist label) {
			align-items: center;
			padding: 0.8rem 0.9rem;
		}
	}
</style>
