import { cubicOut } from 'svelte/easing';

const backdropOpacity = 0.48;
const backdropBlur = 10;

export const blurFade = (_node: Element) => ({
	duration: 240,
	easing: cubicOut,
	css: (t: number) => `
		opacity: ${t};
		background-color: rgba(15, 23, 42, ${backdropOpacity * t});
		backdrop-filter: blur(${backdropBlur * t}px);
		-webkit-backdrop-filter: blur(${backdropBlur * t}px);
	`
});

export const slideUp = (_node: Element) => ({
	duration: 320,
	easing: cubicOut,
	css: (t: number, u: number) => `
		transform: translateY(${u * 88}px) scale(${0.96 + t * 0.04});
		opacity: ${0.4 + t * 0.6};
	`
});
