<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import FloatingButton from '$lib/components/FloatingButton.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();
	let bonusOpen = $state(false);
	const showBonusButton = $derived(
		!page.url.pathname.startsWith('/admin') && !page.url.pathname.startsWith('/danger')
	);
	const bonusChecklistStorageKey = 'gals-thing:bonus-checklist';
	const bonusItems = [
		{ id: 'id0', text: 'הדוגמן קופץ באוויר כך שלא רואים רגליים מתחת לברכיים שלו.' },
		{ id: 'id1', text: 'הצלם שם את היד מול המצלמה כך שנראה שהוא מועך את הדוגמן הפצפון.' },
		{ id: 'id2', text: 'ראש הדוגמן קרוב למצלמה כך שהוא נראה כמו ענק לוקח ביס ממשהו ברקע.' },
		{ id: 'id3', text: 'הצלם מרים את היד מול המצלמה כך שנראת כמו במה אופקית שהדוגמן שוכב עליה.' },
		{ id: 'id4', text: 'הדוגמן נוגע עם כל יד ורגל בצבעים שונים (4 צבעים).' },
		{ id: 'id5', text: 'הדוגמן הפוך.' },
		{ id: 'id6', text: 'רואים השתקפות של הצלם, הדוגמן מחקה אותו.' },
		{ id: 'id7', text: 'הדוגמן מאחורי עץ כך שנראה כאילו לעץ יש ידיים.' },
		{ id: 'id8', text: 'הדוגמן מוחבא, ניתן למצוא אותו (בבירור) אך חייב לקחת לפחות 3 שניות.' },
		{ id: 'id9', text: 'הדוגמן עושה פוזת מדיטציה על רגל אחת עם עיניים עצומות.' },
		
	] as const;

	const createBonusChecklistState = () =>
		Object.fromEntries(bonusItems.map((item) => [item.id, false])) as Record<
			(string & {}) | (typeof bonusItems)[number]['id'],
			boolean
		>;

	let checkedBonuses = $state<Record<(typeof bonusItems)[number]['id'], boolean>>(
		createBonusChecklistState()
	);
	let bonusChecklistReady = $state(false);

	onMount(() => {
		const fallbackState = createBonusChecklistState();

		if (!browser) {
			return;
		}

		const storedValue = localStorage.getItem(bonusChecklistStorageKey);

		if (storedValue) {
			try {
				const parsedValue = JSON.parse(storedValue) as Record<string, unknown>;

				checkedBonuses = bonusItems.reduce(
					(state, item) => {
						state[item.id] = parsedValue[item.id] === true;
						return state;
					},
					{ ...fallbackState }
				);
			} catch {
				checkedBonuses = fallbackState;
			}
		}

		bonusChecklistReady = true;
	});

	$effect(() => {
		if (!showBonusButton) {
			bonusOpen = false;
		}
	});

	$effect(() => {
		const snapshot = bonusItems.map((item) => checkedBonuses[item.id]).join('|');

		if (!browser || !bonusChecklistReady) {
			return;
		}

		snapshot;
		localStorage.setItem(bonusChecklistStorageKey, JSON.stringify(checkedBonuses));
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
		<ul class="bonus-checklist" dir="rtl">
			{#each bonusItems as item}
				<li>
					<label>
						<input type="checkbox" bind:checked={checkedBonuses[item.id]} />
						<span>{item.text}</span>
					</label>
				</li>
			{/each}
		</ul>
	</Modal>
{/if}
