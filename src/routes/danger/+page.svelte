<script lang="ts">
	import type { ActionData, PageData } from './$types';

	let { data, form } = $props<{
		data: PageData;
		form?: ActionData;
	}>();
</script>

<svelte:head>
	<title>Danger Zone</title>
</svelte:head>

<div class="danger-shell">
	<section class="danger-card">
		<p class="eyebrow">Danger Zone</p>
		<h1>Delete all players</h1>
		<p class="lede">
			This removes every player and, through cascade delete, all submitted photos tied to them.
		</p>

		<p class="count">
			Current players: <strong>{data.playerCount}</strong>
		</p>

		<form method="POST">
			<button class="danger-button" type="submit">Delete all players</button>
		</form>

		{#if form}
			<p class="result">
				Deleted <strong>{form.deletedPlayers}</strong> player{form.deletedPlayers === 1 ? '' : 's'}.
			</p>
		{/if}
	</section>
</div>

<style>
	:global(body) {
		margin: 0;
		background:
			radial-gradient(circle at top, rgba(248, 113, 113, 0.16), transparent 22rem),
			linear-gradient(180deg, #fff7f7 0%, #fee2e2 100%);
		color: #1f2937;
		font-family: Arial, sans-serif;
	}

	.danger-shell {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding:
			max(1.25rem, env(safe-area-inset-top))
			max(1rem, env(safe-area-inset-right))
			max(1.25rem, env(safe-area-inset-bottom))
			max(1rem, env(safe-area-inset-left));
	}

	.danger-card {
		width: min(100%, 34rem);
		padding: 1.5rem;
		border: 1px solid rgba(127, 29, 29, 0.12);
		border-radius: 1.5rem;
		background: rgba(255, 255, 255, 0.82);
		box-shadow: 0 1.5rem 3rem rgba(127, 29, 29, 0.12);
		backdrop-filter: blur(12px);
	}

	.eyebrow {
		margin: 0 0 0.6rem;
		color: #b91c1c;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 7vw, 3.3rem);
		line-height: 0.94;
	}

	.lede,
	.count,
	.result {
		margin: 0.95rem 0 0;
		font-size: 1rem;
		line-height: 1.6;
		color: #4b5563;
	}

	.count strong,
	.result strong {
		color: #111827;
	}

	form {
		margin-top: 1.25rem;
	}

	.danger-button {
		width: 100%;
		border: 0;
		border-radius: 1rem;
		padding: 1rem 1.15rem;
		background:
			radial-gradient(circle at top, rgba(255, 255, 255, 0.22), transparent 58%),
			linear-gradient(145deg, #ef4444, #b91c1c);
		color: #fff7f7;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
		box-shadow: 0 1rem 2rem rgba(127, 29, 29, 0.22);
		transition:
			transform 180ms ease,
			box-shadow 180ms ease,
			filter 180ms ease;
	}

	.danger-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 1.2rem 2.4rem rgba(127, 29, 29, 0.26);
		filter: saturate(1.04);
	}

	.danger-button:focus-visible {
		outline: 3px solid #fecaca;
		outline-offset: 3px;
	}

	@media (max-width: 640px) {
		.danger-card {
			padding: 1.15rem;
			border-radius: 1.25rem;
		}
	}
</style>
