export type SubmissionPreview = {
	id: string;
	missionId: string;
	imageUrl: string;
	updatedAt: string;
};

export const buildSubmissionImageUrl = (submissionId: string, updatedAt: string) =>
	`/submission-images/${submissionId}?v=${encodeURIComponent(updatedAt)}`;
