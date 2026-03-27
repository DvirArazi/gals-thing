import { error } from '@sveltejs/kit';
import { missions } from '$lib/missions';
import { buildSubmissionImageUrl } from '$lib/submissions';
import { listPlayerSubmissions } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.player) {
		throw error(500, 'Player session is not available.');
	}

	const submissions = Object.fromEntries(
		listPlayerSubmissions(locals.player.id).map((submission) => [
			submission.missionId,
			{
				id: submission.id,
				missionId: submission.missionId,
				imageUrl: buildSubmissionImageUrl(submission.id, submission.updatedAt),
				updatedAt: submission.updatedAt
			}
		])
	);

	return {
		missions,
		submissions
	};
};
