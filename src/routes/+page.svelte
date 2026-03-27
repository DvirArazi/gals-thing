<script lang="ts">
	import { missions } from '$lib/missions';
</script>

<svelte:head>
	<title>Mission Board</title>
</svelte:head>

<div class="page-shell">
	<section class="hero">
		<p class="eyebrow">Mission Board</p>
		<h1>Objectives for the player</h1>
		<p class="lede">
			Each mission is loaded from its own folder. The text comes from a `.txt` file and every
			image in that same folder is shown as supporting reference art.
		</p>
	</section>

	<section class="missions" aria-label="Mission list">
		{#each missions as mission, index}
			<article class="mission-card">
				<div class="mission-copy">
					<p class="mission-number">MISSION {index + 1}</p>
					<p class="mission-text">{mission.instruction}</p>
				</div>

				<div class="image-strip">
					{#each mission.images as image, imageIndex}
						<figure class="image-frame">
							<img
								src={image}
								alt={`${mission.id} reference ${imageIndex + 1}`}
								loading="lazy"
							/>
						</figure>
					{/each}
				</div>
			</article>
		{/each}
	</section>
</div>

<style>
	:global(html) {
		overflow-x: hidden;
	}

	:global(*),
	:global(*::before),
	:global(*::after) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		background:
			radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 22rem),
			linear-gradient(180deg, #fff8eb 0%, #f5efe4 100%);
		color: #1f2937;
		font-family:
			"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, "URW Palladio L",
			serif;
		overflow-x: hidden;
	}

	.page-shell {
		min-height: 100vh;
		padding:
			1.25rem
			max(1rem, env(safe-area-inset-right))
			calc(6.75rem + env(safe-area-inset-bottom))
			max(1rem, env(safe-area-inset-left));
	}

	.hero {
		max-width: 34rem;
		margin: 0 auto 1.5rem;
		text-align: left;
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
		font-size: clamp(2rem, 10vw, 4.6rem);
		line-height: 0.92;
		text-wrap: balance;
	}

	.lede {
		margin: 0.85rem 0 0;
		max-width: 34rem;
		font-size: 0.98rem;
		line-height: 1.6;
		color: #475569;
	}

	.missions {
		display: grid;
		gap: 1rem;
		max-width: 72rem;
		margin: 0 auto;
	}

	.mission-card {
		display: grid;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid rgba(15, 23, 42, 0.08);
		border-radius: 1.35rem;
		background: rgba(255, 255, 255, 0.78);
		box-shadow: 0 1rem 2.2rem rgba(15, 23, 42, 0.08);
		backdrop-filter: blur(12px);
	}

	.mission-copy {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.mission-number {
		margin: 0 0 0.65rem;
		color: #9a3412;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.mission-text {
		margin: 0;
		font-size: 1rem;
		line-height: 1.6;
		color: #334155;
	}

	.image-strip {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.8rem;
	}

	.image-frame {
		margin: 0;
		overflow: hidden;
		border-radius: 1rem;
		background: #e2e8f0;
		box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08);
		aspect-ratio: 4 / 3;
	}

	img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (min-width: 640px) {
		.page-shell {
			padding-left: max(1.5rem, env(safe-area-inset-left));
			padding-right: max(1.5rem, env(safe-area-inset-right));
		}
	}

	@media (min-width: 820px) {
		.hero {
			margin-bottom: 2rem;
			text-align: center;
		}

		.lede {
			margin-left: auto;
			margin-right: auto;
		}

		.missions {
			gap: 1.5rem;
		}

		.mission-card {
			grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
			gap: 1.5rem;
			padding: 1.5rem;
			border-radius: 1.75rem;
		}

		.mission-number {
			font-size: 0.82rem;
		}

		.mission-text {
			font-size: 1.08rem;
			line-height: 1.7;
		}

		.image-strip {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			align-content: center;
		}

		.image-frame {
			border-radius: 1.2rem;
		}
	}

	@media (max-width: 359px) {
		.image-strip {
			grid-template-columns: 1fr;
		}
	}
</style>
