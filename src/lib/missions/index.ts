export type Mission = {
	id: string;
	image: string;
};

const imageModules = import.meta.glob('./*.{avif,gif,jpeg,jpg,png,svg,webp}', {
	eager: true,
	import: 'default'
}) as Record<string, string>;

const toMissionId = (path: string) =>
	path
		.split('/')
		.at(-1)
		?.replace(/\.(avif|gif|jpe?g|png|svg|webp)$/i, '') ?? 'untitled-mission';

export const missions = Object.entries(imageModules)
	.sort(([left], [right]) => left.localeCompare(right))
	.map(([path, image]) => ({
		id: toMissionId(path),
		image
	}));
