<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let previewOpen = $state(false);
	let selectedSubmission = $state<{
		title: string;
		imageUrl: string;
	} | null>(null);

	const openPreview = (title: string, imageUrl: string) => {
		selectedSubmission = { title, imageUrl };
		previewOpen = true;
	};

	$effect(() => {
		if (!previewOpen) {
			selectedSubmission = null;
		}
	});
</script>

<svelte:head>
	<title>Admin Submissions</title>
</svelte:head>

<div class="admin-shell">
	<section class="hero">
		<p class="eyebrow">Admin</p>
		<h1>Submitted photos</h1>
		<p class="lede">
			{data.totalSubmissions} saved photo{data.totalSubmissions === 1 ? '' : 's'} across
			{data.players.length} player{data.players.length === 1 ? '' : 's'}.
		</p>
	</section>

	{#if data.players.length === 0}
		<p class="empty-state">No players have opened the mission board yet.</p>
	{:else}
		<div class="table-shell">
			<table class="submission-table">
				<thead>
					<tr>
						<th scope="col">Mission</th>
						{#each data.players as player}
							<th scope="col">{player.label}</th>
						{/each}
					</tr>
				</thead>

				<tbody>
					{#each data.rows as row}
						<tr>
							<th scope="row">
								<div class="mission-cell">
									<img src={row.referenceImage} alt={`${row.label} reference`} loading="lazy" />
									<span>{row.label}</span>
								</div>
							</th>

							{#each row.cells as cell}
								<td>
									{#if cell}
										<button
											class="submission-thumb"
											type="button"
											onclick={() => openPreview(`${row.label} · ${cell.playerLabel}`, cell.imageUrl)}
										>
											<img
												src={cell.imageUrl}
												alt={`${row.label} submission by ${cell.playerLabel}`}
												loading="lazy"
											/>
										</button>
									{:else}
										<span class="empty-cell">-</span>
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<Modal bind:open={previewOpen} title={selectedSubmission?.title ?? 'Submission'}>
	{#if selectedSubmission}
		<div class="preview-shell">
			<img
				class="preview-image"
				src={selectedSubmission.imageUrl}
				alt={selectedSubmission.title}
			/>
		</div>
	{/if}
</Modal>

<style>
	:global(body) {
		background:
			radial-gradient(circle at top right, rgba(56, 189, 248, 0.16), transparent 24rem),
			linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
	}

	.admin-shell {
		min-height: 100vh;
		padding:
			1.25rem
			max(1rem, env(safe-area-inset-right))
			calc(2rem + env(safe-area-inset-bottom))
			max(1rem, env(safe-area-inset-left));
		color: #0f172a;
	}

	.hero {
		max-width: 40rem;
		margin: 0 auto 1.5rem;
	}

	.eyebrow {
		margin: 0 0 0.6rem;
		color: #0f766e;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 8vw, 4rem);
		line-height: 0.94;
		text-wrap: balance;
	}

	.lede,
	.empty-state {
		margin: 0.9rem 0 0;
		color: #475569;
		font-size: 0.98rem;
		line-height: 1.6;
	}

	.empty-state {
		max-width: 40rem;
		margin-left: auto;
		margin-right: auto;
	}

	.table-shell {
		max-width: 100%;
		overflow-x: auto;
		padding-bottom: 0.5rem;
	}

	.submission-table {
		min-width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		background: rgba(255, 255, 255, 0.82);
		border: 1px solid rgba(148, 163, 184, 0.24);
		border-radius: 1.4rem;
		overflow: hidden;
		box-shadow: 0 1rem 2.4rem rgba(15, 23, 42, 0.08);
	}

	.submission-table th,
	.submission-table td {
		padding: 0.85rem;
		border-bottom: 1px solid rgba(226, 232, 240, 0.92);
		border-right: 1px solid rgba(226, 232, 240, 0.92);
		text-align: center;
		vertical-align: middle;
	}

	.submission-table thead th {
		position: sticky;
		top: 0;
		background: rgba(248, 250, 252, 0.96);
		backdrop-filter: blur(10px);
		font-size: 0.82rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.submission-table th:first-child {
		text-align: left;
		min-width: 12rem;
	}

	.submission-table tr:last-child th,
	.submission-table tr:last-child td {
		border-bottom: 0;
	}

	.submission-table th:last-child,
	.submission-table td:last-child {
		border-right: 0;
	}

	.mission-cell {
		display: flex;
		align-items: center;
		gap: 0.85rem;
	}

	.mission-cell img {
		display: block;
		width: 3.6rem;
		height: 3.6rem;
		border-radius: 0.9rem;
		object-fit: cover;
		box-shadow: 0 0.8rem 1.6rem rgba(15, 23, 42, 0.12);
	}

	.submission-thumb {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 5rem;
		height: 5rem;
		padding: 0.2rem;
		border: 0;
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.9);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transition:
			transform 160ms ease,
			box-shadow 160ms ease;
	}

	.submission-thumb:hover {
		transform: translateY(-2px);
		box-shadow: 0 0.9rem 1.8rem rgba(15, 23, 42, 0.12);
	}

	.submission-thumb:focus-visible {
		outline: 3px solid #14b8a6;
		outline-offset: 3px;
	}

	.submission-thumb img {
		display: block;
		width: 100%;
		height: 100%;
		border-radius: 0.8rem;
		object-fit: cover;
	}

	.empty-cell {
		color: #94a3b8;
		font-weight: 700;
	}

	.preview-shell {
		display: grid;
	}

	.preview-image {
		display: block;
		width: min(100%, 34rem);
		max-height: 72dvh;
		margin: 0 auto;
		border-radius: 1rem;
		object-fit: contain;
		background: rgba(255, 255, 255, 0.88);
		box-shadow: 0 1rem 2.4rem rgba(15, 23, 42, 0.16);
	}

	@media (max-width: 640px) {
		.submission-table th,
		.submission-table td {
			padding: 0.7rem;
		}

		.submission-table th:first-child {
			min-width: 10.5rem;
		}

		.mission-cell {
			gap: 0.65rem;
		}

		.mission-cell img {
			width: 3.1rem;
			height: 3.1rem;
		}

		.submission-thumb {
			width: 4.2rem;
			height: 4.2rem;
		}
	}
</style>
