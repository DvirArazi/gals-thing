import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const defaultDatabasePath = process.env.VERCEL
	? '/tmp/gals-thing.sqlite'
	: resolve('.data', 'gals-thing.sqlite');

const databasePath = process.env.SQLITE_DATABASE_PATH ?? defaultDatabasePath;

if (databasePath !== ':memory:') {
	mkdirSync(dirname(databasePath), { recursive: true });
}

const database = new DatabaseSync(databasePath);

database.exec(`
	PRAGMA foreign_keys = ON;
	PRAGMA journal_mode = WAL;

	CREATE TABLE IF NOT EXISTS players (
		id TEXT PRIMARY KEY,
		session_token TEXT NOT NULL UNIQUE,
		created_at TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS submissions (
		id TEXT PRIMARY KEY,
		player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
		mission_id TEXT NOT NULL,
		image_blob BLOB NOT NULL,
		image_mime TEXT NOT NULL,
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL,
		UNIQUE(player_id, mission_id)
	);

	CREATE INDEX IF NOT EXISTS submissions_by_mission ON submissions (mission_id);
	CREATE INDEX IF NOT EXISTS submissions_by_player ON submissions (player_id);
`);

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

type SubmissionWithBytes = SubmissionRecord & {
	imageBytes: Uint8Array;
};

const findPlayerBySessionTokenStatement = database.prepare(`
	SELECT
		id,
		session_token AS sessionToken,
		created_at AS createdAt
	FROM players
	WHERE session_token = ?
`);

const insertPlayerStatement = database.prepare(`
	INSERT INTO players (id, session_token, created_at)
	VALUES (?, ?, ?)
`);

const listPlayersStatement = database.prepare(`
	SELECT
		id,
		created_at AS createdAt
	FROM players
	ORDER BY created_at ASC
`);

const findSubmissionForMissionAndPlayerStatement = database.prepare(`
	SELECT
		id,
		player_id AS playerId,
		mission_id AS missionId,
		image_mime AS imageMime,
		created_at AS createdAt,
		updated_at AS updatedAt
	FROM submissions
	WHERE player_id = ? AND mission_id = ?
`);

const insertSubmissionStatement = database.prepare(`
	INSERT INTO submissions (
		id,
		player_id,
		mission_id,
		image_blob,
		image_mime,
		created_at,
		updated_at
	)
	VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const updateSubmissionStatement = database.prepare(`
	UPDATE submissions
	SET image_blob = ?, image_mime = ?, updated_at = ?
	WHERE id = ?
`);

const listPlayerSubmissionsStatement = database.prepare(`
	SELECT
		id,
		player_id AS playerId,
		mission_id AS missionId,
		image_mime AS imageMime,
		created_at AS createdAt,
		updated_at AS updatedAt
	FROM submissions
	WHERE player_id = ?
	ORDER BY mission_id ASC
`);

const listAllSubmissionsStatement = database.prepare(`
	SELECT
		id,
		player_id AS playerId,
		mission_id AS missionId,
		image_mime AS imageMime,
		created_at AS createdAt,
		updated_at AS updatedAt
	FROM submissions
	ORDER BY mission_id ASC, player_id ASC
`);

const getSubmissionImageStatement = database.prepare(`
	SELECT
		id,
		player_id AS playerId,
		mission_id AS missionId,
		image_blob AS imageBytes,
		image_mime AS imageMime,
		created_at AS createdAt,
		updated_at AS updatedAt
	FROM submissions
	WHERE id = ?
`);

const asPlayerRecord = (value: unknown) => value as PlayerRecord | undefined;
const asPlayerSummaryList = (value: unknown) => value as PlayerSummary[];
const asSubmissionRecord = (value: unknown) => value as SubmissionRecord | undefined;
const asSubmissionRecordList = (value: unknown) => value as SubmissionRecord[];
const asSubmissionWithBytes = (value: unknown) => value as SubmissionWithBytes | undefined;

export const createPlayer = (): PlayerRecord => {
	const id = crypto.randomUUID();
	const sessionToken = crypto.randomUUID();
	const createdAt = new Date().toISOString();

	insertPlayerStatement.run(id, sessionToken, createdAt);

	return { id, sessionToken, createdAt };
};

export const findPlayerBySessionToken = (sessionToken: string): PlayerRecord | null => {
	const player = asPlayerRecord(findPlayerBySessionTokenStatement.get(sessionToken));
	return player ?? null;
};

export const listPlayers = (): PlayerSummary[] =>
	asPlayerSummaryList(listPlayersStatement.all()).map((player) => ({
		id: player.id,
		createdAt: player.createdAt
	}));

export const saveSubmission = (input: {
	playerId: string;
	missionId: string;
	imageBytes: Uint8Array;
	imageMime: string;
}): SubmissionRecord => {
	const existing = asSubmissionRecord(
		findSubmissionForMissionAndPlayerStatement.get(input.playerId, input.missionId)
	);
	const timestamp = new Date().toISOString();

	if (existing) {
		updateSubmissionStatement.run(input.imageBytes, input.imageMime, timestamp, existing.id);

		return {
			...existing,
			imageMime: input.imageMime,
			updatedAt: timestamp
		};
	}

	const id = crypto.randomUUID();

	insertSubmissionStatement.run(
		id,
		input.playerId,
		input.missionId,
		input.imageBytes,
		input.imageMime,
		timestamp,
		timestamp
	);

	return {
		id,
		playerId: input.playerId,
		missionId: input.missionId,
		imageMime: input.imageMime,
		createdAt: timestamp,
		updatedAt: timestamp
	};
};

export const listPlayerSubmissions = (playerId: string): SubmissionRecord[] =>
	asSubmissionRecordList(listPlayerSubmissionsStatement.all(playerId)).map((submission) => ({
		id: submission.id,
		playerId: submission.playerId,
		missionId: submission.missionId,
		imageMime: submission.imageMime,
		createdAt: submission.createdAt,
		updatedAt: submission.updatedAt
	}));

export const listAllSubmissions = (): SubmissionRecord[] =>
	asSubmissionRecordList(listAllSubmissionsStatement.all()).map((submission) => ({
		id: submission.id,
		playerId: submission.playerId,
		missionId: submission.missionId,
		imageMime: submission.imageMime,
		createdAt: submission.createdAt,
		updatedAt: submission.updatedAt
	}));

export const getSubmissionImage = (submissionId: string): SubmissionWithBytes | null => {
	const submission = asSubmissionWithBytes(getSubmissionImageStatement.get(submissionId));
	return submission ?? null;
};
