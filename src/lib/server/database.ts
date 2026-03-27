import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

const databaseUrlEnvKeys = [
	'DATABASE_URL',
	'POSTGRES_URL',
	'POSTGRES_URL_NON_POOLING',
	'NEON_DATABASE_URL'
] as const;

const resolveDatabaseUrl = (): string | null => {
	for (const key of databaseUrlEnvKeys) {
		const value = process.env[key];

		if (value) {
			return value;
		}
	}

	return null;
};

let sql: NeonQueryFunction<false, false> | null = null;
let databaseReadyPromise: Promise<void> | null = null;

const getSql = () => {
	if (!sql) {
		const databaseUrl = resolveDatabaseUrl();

		if (!databaseUrl) {
			throw new Error(
				`A Postgres connection string is required. Set one of: ${databaseUrlEnvKeys.join(', ')}.`
			);
		}

		sql = neon(databaseUrl);
	}

	return sql;
};

const ensureDatabase = async () => {
	if (!databaseReadyPromise) {
		databaseReadyPromise = (async () => {
			const database = getSql();

			await database.transaction([
				database.query(`
					CREATE TABLE IF NOT EXISTS players (
						id TEXT PRIMARY KEY,
						session_token TEXT NOT NULL UNIQUE,
						created_at TEXT NOT NULL
					)
				`),
				database.query(`
					CREATE TABLE IF NOT EXISTS submissions (
						id TEXT PRIMARY KEY,
						player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
						mission_id TEXT NOT NULL,
						image_blob BYTEA NOT NULL,
						image_mime TEXT NOT NULL,
						created_at TEXT NOT NULL,
						updated_at TEXT NOT NULL,
						UNIQUE(player_id, mission_id)
					)
				`),
				database.query(
					'CREATE INDEX IF NOT EXISTS submissions_by_mission ON submissions (mission_id)'
				),
				database.query(
					'CREATE INDEX IF NOT EXISTS submissions_by_player ON submissions (player_id)'
				)
			]);
		})().catch((error) => {
			databaseReadyPromise = null;
			throw error;
		});
	}

	await databaseReadyPromise;
};

export type PlayerRecord = {
	id: string;
	sessionToken: string;
	createdAt: string;
};

export type PlayerSummary = {
	id: string;
	createdAt: string;
};

export type SubmissionRecord = {
	id: string;
	playerId: string;
	missionId: string;
	imageMime: string;
	createdAt: string;
	updatedAt: string;
};

type SubmissionWithBase64 = SubmissionRecord & {
	imageBase64: string;
};

export type SubmissionWithBytes = SubmissionRecord & {
	imageBytes: Uint8Array;
};

const asPlayerRecord = (value: unknown) => value as PlayerRecord | undefined;
const asPlayerSummaryList = (value: unknown) => value as PlayerSummary[];
const asSubmissionRecord = (value: unknown) => value as SubmissionRecord | undefined;
const asSubmissionRecordList = (value: unknown) => value as SubmissionRecord[];
const asSubmissionWithBase64 = (value: unknown) => value as SubmissionWithBase64 | undefined;

export const createPlayer = async (): Promise<PlayerRecord> => {
	await ensureDatabase();

	const id = crypto.randomUUID();
	const sessionToken = crypto.randomUUID();
	const createdAt = new Date().toISOString();

	await getSql().query(
		`
			INSERT INTO players (id, session_token, created_at)
			VALUES ($1, $2, $3)
		`,
		[id, sessionToken, createdAt]
	);

	return { id, sessionToken, createdAt };
};

export const findPlayerBySessionToken = async (sessionToken: string): Promise<PlayerRecord | null> => {
	await ensureDatabase();

	const rows = await getSql().query(
		`
			SELECT
				id,
				session_token AS "sessionToken",
				created_at AS "createdAt"
			FROM players
			WHERE session_token = $1
			LIMIT 1
		`,
		[sessionToken]
	);
	const player = asPlayerRecord(rows[0]);

	return player ?? null;
};

export const listPlayers = async (): Promise<PlayerSummary[]> => {
	await ensureDatabase();

	const rows = await getSql().query(
		`
			SELECT
				id,
				created_at AS "createdAt"
			FROM players
			ORDER BY created_at ASC
		`
	);

	return asPlayerSummaryList(rows).map((player) => ({
		id: player.id,
		createdAt: player.createdAt
	}));
};

export const saveSubmission = async (input: {
	playerId: string;
	missionId: string;
	imageBytes: Uint8Array;
	imageMime: string;
}): Promise<SubmissionRecord> => {
	await ensureDatabase();

	const id = crypto.randomUUID();
	const timestamp = new Date().toISOString();
	const imageBase64 = Buffer.from(input.imageBytes).toString('base64');
	const rows = await getSql().query(
		`
			INSERT INTO submissions (
				id,
				player_id,
				mission_id,
				image_blob,
				image_mime,
				created_at,
				updated_at
			)
			VALUES ($1, $2, $3, decode($4, 'base64'), $5, $6, $6)
			ON CONFLICT (player_id, mission_id)
			DO UPDATE SET
				image_blob = EXCLUDED.image_blob,
				image_mime = EXCLUDED.image_mime,
				updated_at = EXCLUDED.updated_at
			RETURNING
				id,
				player_id AS "playerId",
				mission_id AS "missionId",
				image_mime AS "imageMime",
				created_at AS "createdAt",
				updated_at AS "updatedAt"
		`,
		[id, input.playerId, input.missionId, imageBase64, input.imageMime, timestamp]
	);
	const submission = asSubmissionRecord(rows[0]);

	if (!submission) {
		throw new Error('Submission could not be saved.');
	}

	return submission;
};

export const listPlayerSubmissions = async (playerId: string): Promise<SubmissionRecord[]> => {
	await ensureDatabase();

	const rows = await getSql().query(
		`
			SELECT
				id,
				player_id AS "playerId",
				mission_id AS "missionId",
				image_mime AS "imageMime",
				created_at AS "createdAt",
				updated_at AS "updatedAt"
			FROM submissions
			WHERE player_id = $1
			ORDER BY mission_id ASC
		`,
		[playerId]
	);

	return asSubmissionRecordList(rows).map((submission) => ({
		id: submission.id,
		playerId: submission.playerId,
		missionId: submission.missionId,
		imageMime: submission.imageMime,
		createdAt: submission.createdAt,
		updatedAt: submission.updatedAt
	}));
};

export const listAllSubmissions = async (): Promise<SubmissionRecord[]> => {
	await ensureDatabase();

	const rows = await getSql().query(
		`
			SELECT
				id,
				player_id AS "playerId",
				mission_id AS "missionId",
				image_mime AS "imageMime",
				created_at AS "createdAt",
				updated_at AS "updatedAt"
			FROM submissions
			ORDER BY mission_id ASC, player_id ASC
		`
	);

	return asSubmissionRecordList(rows).map((submission) => ({
		id: submission.id,
		playerId: submission.playerId,
		missionId: submission.missionId,
		imageMime: submission.imageMime,
		createdAt: submission.createdAt,
		updatedAt: submission.updatedAt
	}));
};

export const getSubmissionImage = async (submissionId: string): Promise<SubmissionWithBytes | null> => {
	await ensureDatabase();

	const rows = await getSql().query(
		`
			SELECT
				id,
				player_id AS "playerId",
				mission_id AS "missionId",
				encode(image_blob, 'base64') AS "imageBase64",
				image_mime AS "imageMime",
				created_at AS "createdAt",
				updated_at AS "updatedAt"
			FROM submissions
			WHERE id = $1
			LIMIT 1
		`,
		[submissionId]
	);
	const submission = asSubmissionWithBase64(rows[0]);

	if (!submission) {
		return null;
	}

	return {
		id: submission.id,
		playerId: submission.playerId,
		missionId: submission.missionId,
		imageBytes: Buffer.from(submission.imageBase64, 'base64'),
		imageMime: submission.imageMime,
		createdAt: submission.createdAt,
		updatedAt: submission.updatedAt
	};
};
