import { missions } from '$lib/missions';
import { buildSubmissionImageUrl } from '$lib/submissions';
import { listAllSubmissions, listPlayers } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const players = listPlayers().map((player, index) => ({
		id: player.id,
		label: `Player ${index + 1}`,
		createdAt: player.createdAt
	}));
	const submissions = listAllSubmissions();
	const submissionLookup = new Map(
		submissions.map((submission) => [`${submission.missionId}:${submission.playerId}`, submission] as const)
	);

	return {
		players,
		totalSubmissions: submissions.length,
		rows: missions.map((mission, index) => ({
			id: mission.id,
			label: `Mission ${index + 1}`,
			referenceImage: mission.image,
			cells: players.map((player) => {
				const submission = submissionLookup.get(`${mission.id}:${player.id}`);

				if (!submission) {
					return null;
				}

				return {
					id: submission.id,
					playerLabel: player.label,
					imageUrl: buildSubmissionImageUrl(submission.id, submission.updatedAt),
					updatedAt: submission.updatedAt
				};
			})
		}))
	};
};
