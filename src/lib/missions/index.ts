export type Mission = {
	id: string;
	instruction: string;
	images: string[];
};

const instructionModules = import.meta.glob('./*/*.txt', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

const imageModules = import.meta.glob('./*/*.{avif,gif,jpeg,jpg,png,svg,webp}', {
	eager: true,
	import: 'default'
}) as Record<string, string>;

const toMissionId = (path: string) => path.split('/').at(-2) ?? 'untitled-mission';

const missionMap = new Map<string, Mission>();

for (const [path, instruction] of Object.entries(instructionModules).sort(([left], [right]) =>
	left.localeCompare(right)
)) {
	const id = toMissionId(path);

	missionMap.set(id, {
		id,
		instruction: instruction.trim(),
		images: []
	});
}

for (const [path, image] of Object.entries(imageModules).sort(([left], [right]) =>
	left.localeCompare(right)
)) {
	const id = toMissionId(path);
	const mission = missionMap.get(id);

	if (!mission) {
		continue;
	}

	mission.images.push(image);
}

export const missions = [...missionMap.values()];
