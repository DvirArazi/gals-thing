<script lang="ts">
	import { blurFade, slideUp } from '$lib/transitions/modal';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let previewOpen = $state(false);
	let previewDialogElement = $state<HTMLDivElement | null>(null);
	let selectedSubmission = $state<{
		alt: string;
		imageSrc: string;
	} | null>(null);

	const openPreview = (event: MouseEvent, alt: string) => {
		const trigger = event.currentTarget as HTMLButtonElement | null;
		const image = trigger?.querySelector('img');

		if (!image) {
			return;
		}

		selectedSubmission = {
			alt,
			imageSrc: image.currentSrc || image.src
		};
		previewOpen = true;
	};

	const closePreview = () => {
		previewOpen = false;
	};

	const handlePreviewBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			closePreview();
		}
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (previewOpen && event.key === 'Escape') {
			closePreview();
		}
	};

	$effect(() => {
		if (!previewOpen) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		queueMicrotask(() => previewDialogElement?.focus());

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});

	$effect(() => {
		if (!previewOpen) {
			selectedSubmission = null;
		}
	});
</script>

<svelte:head>
	<title>Admin Submissions</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

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
								</div>
							</th>

							{#each row.cells as cell}
								<td>
									{#if cell}
										<button
											class="submission-thumb"
											type="button"
											onclick={(event) =>
												openPreview(event, `Submitted photo from ${cell.playerLabel}`)}
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

{#if previewOpen && selectedSubmission}
	<div
		class="preview-backdrop"
		role="presentation"
		onclick={handlePreviewBackdropClick}
		transition:blurFade
	>
		<div
			bind:this={previewDialogElement}
			class="preview-modal"
			role="dialog"
			aria-modal="true"
			aria-label="Submitted photo"
			tabindex="-1"
			transition:slideUp
		>
			<button class="preview-close" type="button" aria-label="Close photo" onclick={closePreview}>
				×
			</button>
			<img
				class="preview-image"
				src={selectedSubmission.imageSrc}
				alt={selectedSubmission.alt}
			/>
		</div>
	</div>
{/if}

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
		width: 4.75rem;
		min-width: 4.75rem;
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
		justify-content: center;
	}

	.mission-cell img {
		display: block;
		width: 3rem;
		height: 3rem;
		border-radius: 0.8rem;
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

	.preview-backdrop {
		position: fixed;
		inset: 0;
		z-index: 50;
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

	.preview-modal {
		position: relative;
		width: fit-content;
		max-width: min(
			42rem,
			calc(100vw - 2rem - env(safe-area-inset-left) - env(safe-area-inset-right))
		);
		border-radius: 1rem;
		overflow: hidden;
		line-height: 0;
		box-shadow: 0 1.5rem 3rem rgba(15, 23, 42, 0.36);
	}

	.preview-close {
		position: absolute;
		top: 0.85rem;
		right: 0.85rem;
		z-index: 1;
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border: 0;
		border-radius: 999px;
		background: rgba(15, 23, 42, 0.46);
		color: #f8fafc;
		font-size: 1.5rem;
		line-height: 1;
		padding: 0 0 0.08rem;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.preview-close:focus-visible {
		outline: 3px solid #99f6e4;
		outline-offset: 2px;
	}

	.preview-image {
		display: block;
		width: auto;
		max-width: min(
			42rem,
			calc(100vw - 2rem - env(safe-area-inset-left) - env(safe-area-inset-right))
		);
		max-height: calc(100dvh - 2rem - env(safe-area-inset-top) - env(safe-area-inset-bottom));
		height: auto;
	}

	@media (max-width: 640px) {
		.preview-backdrop {
			padding-left: max(1.25rem, env(safe-area-inset-left));
			padding-right: max(1.25rem, env(safe-area-inset-right));
		}

		.preview-modal,
		.preview-image {
			max-width: calc(100vw - 2.5rem - env(safe-area-inset-left) - env(safe-area-inset-right));
		}
	}

	@media (max-width: 640px) {
		.submission-table th,
		.submission-table td {
			padding: 0.7rem;
		}

		.submission-table th:first-child {
			width: 4rem;
			min-width: 4rem;
		}

		.mission-cell img {
			width: 2.6rem;
			height: 2.6rem;
		}

		.submission-thumb {
			width: 4.2rem;
			height: 4.2rem;
		}
	}
</style>
