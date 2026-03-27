import { dev } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { createPlayer, findPlayerBySessionToken } from '$lib/server/database';

const playerSessionCookie = 'player_session';
const sessionDurationSeconds = 60 * 60 * 24 * 365;
const playerRouteExclusions = ['/admin', '/submission-images/'];

const shouldBootstrapPlayer = (pathname: string) =>
	!playerRouteExclusions.some((prefix) => pathname.startsWith(prefix));

export const handle: Handle = async ({ event, resolve }) => {
	if (!shouldBootstrapPlayer(event.url.pathname)) {
		return resolve(event);
	}

	const existingSessionToken = event.cookies.get(playerSessionCookie);
	const existingPlayer = existingSessionToken
		? findPlayerBySessionToken(existingSessionToken)
		: null;
	const player = existingPlayer ?? createPlayer();

	if (!existingPlayer) {
		event.cookies.set(playerSessionCookie, player.sessionToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: sessionDurationSeconds
		});
	}

	event.locals.player = {
		id: player.id,
		createdAt: player.createdAt
	};

	return resolve(event);
};
