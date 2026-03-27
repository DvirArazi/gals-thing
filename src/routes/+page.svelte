<script lang="ts">
	import type { SubmissionPreview } from '$lib/submissions';
	import { blurFade, slideUp } from '$lib/transitions/modal';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	let missionSubmissions = $state<Record<string, SubmissionPreview>>({});
	let uploadStates = $state<Record<string, 'uploading' | 'saved' | 'error'>>({});
	let previewOpen = $state(false);
	let previewDialogElement = $state<HTMLDivElement | null>(null);
	let previewedSubmission = $state<{
		alt: string;
		imageSrc: string;
	} | null>(null);

	const uploadTargetBytes = 3_500_000;
	const initialMaxDimension = 1600;
	const minimumMaxDimension = 960;
	const compressionQualities = [0.86, 0.78, 0.7, 0.62];

	const missionLabel = (index: number) => `Mission ${index + 1}`;

	const fitWithin = (width: number, height: number, maxDimension: number) => {
		if (Math.max(width, height) <= maxDimension) {
			return { width, height };
		}

		if (width >= height) {
			return {
				width: maxDimension,
				height: Math.max(1, Math.round((height / width) * maxDimension))
			};
		}

		return {
			width: Math.max(1, Math.round((width / height) * maxDimension)),
			height: maxDimension
		};
	};

	const loadImage = (url: string) =>
		new Promise<HTMLImageElement>((resolve, reject) => {
			const image = new Image();

			image.onload = () => resolve(image);
			image.onerror = () => reject(new Error('The selected image could not be read.'));
			image.src = url;
		});

	const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
		new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error('The image could not be prepared for upload.'));
						return;
					}

					resolve(blob);
				},
				'image/jpeg',
				quality
			);
		});

	const compressImageForUpload = async (file: File) => {
		const objectUrl = URL.createObjectURL(file);

		try {
			const image = await loadImage(objectUrl);
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');

			if (!context) {
				throw new Error('Camera uploads are not supported in this browser.');
			}

			const originalMaxDimension = Math.max(image.naturalWidth, image.naturalHeight);
			let maxDimension = Math.min(originalMaxDimension, initialMaxDimension);

			while (true) {
				const targetSize = fitWithin(image.naturalWidth, image.naturalHeight, maxDimension);
				canvas.width = targetSize.width;
				canvas.height = targetSize.height;
				context.clearRect(0, 0, canvas.width, canvas.height);
				context.drawImage(image, 0, 0, canvas.width, canvas.height);

				for (const quality of compressionQualities) {
					const blob = await canvasToBlob(canvas, quality);

					if (blob.size <= uploadTargetBytes || maxDimension <= minimumMaxDimension) {
						return blob;
					}
				}

				if (maxDimension <= minimumMaxDimension) {
					return canvasToBlob(canvas, compressionQualities.at(-1) ?? 0.62);
				}

				maxDimension = Math.max(minimumMaxDimension, Math.round(maxDimension * 0.82));
			}
		} finally {
			URL.revokeObjectURL(objectUrl);
		}
	};

	const uploadMissionImage = async (missionId: string, file: File) => {
		uploadStates[missionId] = 'uploading';

		try {
			const compressedImage = await compressImageForUpload(file);
			const formData = new FormData();
			formData.set('missionId', missionId);
			formData.set('image', compressedImage, `${missionId}.jpg`);

			const response = await fetch('/api/submissions', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('The upload could not be saved.');
			}

			const payload = (await response.json()) as { submission: SubmissionPreview };
			missionSubmissions[missionId] = payload.submission;
			uploadStates[missionId] = 'saved';
		} catch (error) {
			uploadStates[missionId] = 'error';
			console.error(error);
		}
	};

	const handleCameraChange = async (event: Event, missionId: string) => {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];

		input.value = '';

		if (!file || uploadStates[missionId] === 'uploading') {
			return;
		}

		await uploadMissionImage(missionId, file);
	};

	const openSubmissionPreview = (event: MouseEvent, alt: string) => {
		const trigger = event.currentTarget as HTMLButtonElement | null;
		const image = trigger?.querySelector('img');

		if (!image) {
			return;
		}

		previewedSubmission = {
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
		missionSubmissions = { ...data.submissions };
	});

	$effect(() => {
		if (!previewOpen) {
			previewedSubmission = null;
		}
	});
</script>

<svelte:head>
	<title>Mission Board</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="page-shell">
	<section class="hero">
		<h1>Take pictures of the objects below</h1>
	</section>

	<section class="missions" aria-label="Mission targets">
		{#each data.missions as mission, index}
			<article class="mission-card" style={`--mission-layer: ${data.missions.length - index}`}>
				<div class="reference-frame">
					<img
						class="reference-image"
						src={mission.image}
						alt={`Mission reference ${index + 1}`}
						loading="lazy"
					/>

					<input
						id={`camera-${mission.id}`}
						class="camera-input"
						type="file"
						accept="image/*"
						capture="environment"
						onchange={(event) => handleCameraChange(event, mission.id)}
					/>

					{#if missionSubmissions[mission.id]}
						<button
							class="mission-snapshot"
							type="button"
							onclick={(event) =>
								openSubmissionPreview(event, `Your submission for ${missionLabel(index)}`)}
							aria-label={`Open your photo for ${missionLabel(index)}`}
						>
							<img
								src={missionSubmissions[mission.id].imageUrl}
								alt={`Your submission for ${missionLabel(index)}`}
								loading="lazy"
							/>
						</button>
					{/if}

					<label
						class:busy={uploadStates[mission.id] === 'uploading'}
						class="camera-button"
						for={`camera-${mission.id}`}
						aria-label={`Capture a photo for ${missionLabel(index)}`}
					>
						{#if uploadStates[mission.id] === 'uploading'}
							<span class="camera-spinner" aria-hidden="true"></span>
						{:else}
							<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<path
									d="M7.5 6.5h2.12l1.3-1.8h2.16l1.3 1.8h2.12A2.8 2.8 0 0 1 19.3 9.3v7.2a2.8 2.8 0 0 1-2.8 2.8H7.5a2.8 2.8 0 0 1-2.8-2.8V9.3a2.8 2.8 0 0 1 2.8-2.8Z"
									stroke="currentColor"
									stroke-width="1.8"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<circle cx="12" cy="12.9" r="3.2" stroke="currentColor" stroke-width="1.8" />
							</svg>
						{/if}
					</label>
				</div>
			</article>
		{/each}
	</section>
</div>

{#if previewOpen && previewedSubmission}
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
			<img class="preview-image" src={previewedSubmission.imageSrc} alt={previewedSubmission.alt} />
		</div>
	</div>
{/if}

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

	h1 {
		margin: 0;
		font-size: clamp(2rem, 10vw, 4.6rem);
		line-height: 0.92;
		text-wrap: balance;
	}

	.missions {
		display: grid;
		gap: 1rem;
		max-width: 72rem;
		margin: 0 auto;
		grid-template-columns: minmax(0, 1fr);
	}

	.mission-card {
		position: relative;
		z-index: var(--mission-layer, 1);
		margin: 0;
		overflow: visible;
		border: 1px solid rgba(15, 23, 42, 0.08);
		border-radius: 1.35rem;
		background: rgba(255, 255, 255, 0.78);
		box-shadow: 0 1rem 2.2rem rgba(15, 23, 42, 0.08);
		backdrop-filter: blur(12px);
	}

	.reference-frame {
		position: relative;
		border-radius: inherit;
		background: #efe4d3;
	}

	.reference-image {
		display: block;
		width: 100%;
		height: 100%;
		aspect-ratio: 4 / 3;
		border-radius: inherit;
		background: #efe4d3;
		object-fit: cover;
	}

	.camera-input {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		border: 0;
		overflow: hidden;
		clip: rect(0 0 0 0);
		clip-path: inset(50%);
	}

	.camera-button {
		position: absolute;
		right: 1rem;
		bottom: 1rem;
		z-index: 1;
		display: grid;
		place-items: center;
		width: 3.6rem;
		height: 3.6rem;
		border-radius: 999px;
		background:
			radial-gradient(circle at top, rgba(255, 255, 255, 0.24), transparent 58%),
			linear-gradient(145deg, #f97316, #ea580c);
		color: #fff7ed;
		box-shadow: 0 1rem 2rem rgba(154, 52, 18, 0.3);
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
		transition:
			transform 180ms ease,
			box-shadow 180ms ease,
			filter 180ms ease;
	}

	.camera-button svg {
		width: 1.45rem;
		height: 1.45rem;
	}

	.camera-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 1.2rem 2.4rem rgba(154, 52, 18, 0.34);
		filter: saturate(1.06);
	}

	.camera-button:focus-visible {
		outline: 3px solid #fed7aa;
		outline-offset: 3px;
	}

	.camera-button.busy {
		pointer-events: none;
	}

	.camera-spinner {
		width: 1.35rem;
		height: 1.35rem;
		border: 2px solid rgba(255, 247, 237, 0.32);
		border-top-color: #fff7ed;
		border-radius: 999px;
		animation: spin 720ms linear infinite;
	}

	.mission-snapshot {
		position: absolute;
		left: -0.45rem;
		bottom: -0.35rem;
		z-index: 3;
		display: inline-flex;
		padding: 0;
		border: 0;
		border-radius: 0.45rem;
		background: transparent;
		box-shadow: none;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		transform: rotate(20deg);
		transform-origin: center;
		touch-action: manipulation;
		transition:
			transform 180ms ease,
			box-shadow 180ms ease;
	}

	.mission-snapshot:hover {
		transform: rotate(5deg) translateY(-2px);
	}

	.mission-snapshot:focus-visible {
		outline: none;
	}

	.mission-snapshot img {
		display: block;
		width: auto;
		height: auto;
		max-width: 160px;
		max-height: 160px;
		border-radius: 0.45rem;
		box-shadow: 0 0.9rem 1.8rem rgba(15, 23, 42, 0.24);
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

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (min-width: 640px) {
		.page-shell {
			padding-left: max(1.5rem, env(safe-area-inset-left));
			padding-right: max(1.5rem, env(safe-area-inset-right));
		}

		.missions {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 820px) {
		.hero {
			margin-bottom: 2rem;
			text-align: center;
		}

		.missions {
			gap: 1.5rem;
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	@media (max-width: 640px) {
		.mission-snapshot {
			left: -0.35rem;
			bottom: -0.25rem;
		}

		.preview-backdrop {
			padding-left: max(1.25rem, env(safe-area-inset-left));
			padding-right: max(1.25rem, env(safe-area-inset-right));
		}

		.preview-modal,
		.preview-image {
			max-width: calc(100vw - 2.5rem - env(safe-area-inset-left) - env(safe-area-inset-right));
		}

		.camera-button {
			right: 0.85rem;
			bottom: 0.85rem;
			width: 3.25rem;
			height: 3.25rem;
		}
	}
</style>
