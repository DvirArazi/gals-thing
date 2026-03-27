import { error } from '@sveltejs/kit';
import { getSubmissionImage } from '$lib/server/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const submission = await getSubmissionImage(params.submissionId);

	if (!submission) {
		throw error(404, 'Image not found.');
	}

	const imageBytes = new Uint8Array(submission.imageBytes.byteLength);
	imageBytes.set(submission.imageBytes);

	return new Response(imageBytes, {
		headers: {
			'content-type': submission.imageMime,
			'cache-control': 'private, max-age=31536000, immutable'
		}
	});
};
