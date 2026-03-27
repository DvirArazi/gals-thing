<script lang="ts">
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import FloatingButton from '$lib/components/FloatingButton.svelte';
	import Modal from '$lib/components/Modal.svelte';

	let { children } = $props();
	let bonusOpen = $state(false);
	const showBonusButton = $derived(!page.url.pathname.startsWith('/admin'));

	$effect(() => {
		if (!showBonusButton) {
			bonusOpen = false;
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

{#if showBonusButton}
	<FloatingButton ariaLabel="Open bonus checklist" onClick={() => (bonusOpen = true)}>
		<span class="bonus-icon" aria-hidden="true">
			<svg viewBox="0 0 24 24" fill="none">
				<path
					d="m12 2.75 2.57 5.2 5.73.84-4.15 4.04.98 5.7L12 15.85l-5.13 2.68.98-5.7-4.15-4.04 5.73-.84z"
					fill="currentColor"
				/>
			</svg>
		</span>
		<span class="button-text">Bonus</span>
	</FloatingButton>

	<Modal bind:open={bonusOpen} title="Bonus Checklist">
		<ul class="bonus-checklist">
			<li>
				<label>
					<input type="checkbox" />
					<span>Spot the brightest object in the mission art.</span>
				</label>
			</li>
			<li>
				<label>
					<input type="checkbox" />
					<span>Pick one mission image and describe it in five words.</span>
				</label>
			</li>
			<li>
				<label>
					<input type="checkbox" />
					<span>Choose the mission that looks hardest and explain why.</span>
				</label>
			</li>
			<li>
				<label>
					<input type="checkbox" />
					<span>Complete one mission without reopening the checklist.</span>
				</label>
			</li>
		</ul>
	</Modal>
{/if}
