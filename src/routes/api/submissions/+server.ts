import { json, type RequestHandler } from '@sveltejs/kit';
import { missions } from '$lib/missions';
import { buildSubmissionImageUrl } from '$lib/submissions';
import { saveSubmission } from '$lib/server/database';

const maxUploadBytes = 3_500_000;
const missionIds = new Set(missions.map((mission) => mission.id));

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.player) {
		return json({ message: 'Player session is required.' }, { status: 401 });
	}

	const formData = await request.formData();
	const missionId = formData.get('missionId');
	const image = formData.get('image');

	if (typeof missionId !== 'string' || !missionIds.has(missionId)) {
		return json({ message: 'Mission is invalid.' }, { status: 400 });
	}

	if (!(image instanceof File)) {
		return json({ message: 'Image upload is required.' }, { status: 400 });
	}

	if (!image.type.startsWith('image/')) {
		return json({ message: 'Uploaded file must be an image.' }, { status: 400 });
	}

	if (image.size === 0 || image.size > maxUploadBytes) {
		return json({ message: 'Uploaded image is too large.' }, { status: 413 });
	}

	const submission = await saveSubmission({
		playerId: locals.player.id,
		missionId,
		imageBytes: new Uint8Array(await image.arrayBuffer()),
		imageMime: image.type
	});

	return json({
		submission: {
			id: submission.id,
			missionId: submission.missionId,
			imageUrl: buildSubmissionImageUrl(submission.id, submission.updatedAt),
			updatedAt: submission.updatedAt
		}
	});
};
