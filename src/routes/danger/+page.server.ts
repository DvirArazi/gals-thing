import { deleteAllPlayers, listPlayers } from '$lib/server/database';
import type { Actions, PageServerLoad } from './$types';

const playerSessionCookie = 'player_session';

export const load: PageServerLoad = async () => {
	const players = await listPlayers();

	return {
		playerCount: players.length
	};
};

export const actions: Actions = {
	default: async ({ cookies }) => {
		const deletedPlayers = await deleteAllPlayers();

		cookies.delete(playerSessionCookie, { path: '/' });

		return {
			deletedPlayers
		};
	}
};
