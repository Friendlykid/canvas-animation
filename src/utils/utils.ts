import type { CanvasRenderingContext2D } from "canvas";
import { FRAME_RATE } from "../constants.js";
import { getCurrentNote, STATE } from "../state/state.js";

export const addFrameNumber = (
	ctx: CanvasRenderingContext2D,
	frameNumber: number,
	height: number,
) => {
	ctx.fillStyle = "white";
	ctx.font = "24px Arial";
	ctx.strokeStyle = "black";
	ctx.lineWidth = 2;
	ctx.strokeText(`Frame ${frameNumber}`, 20, height - 20);
	ctx.fillText(`Frame ${frameNumber}`, 20, height - 20);
};

export const addBassLabel = (
	ctx: CanvasRenderingContext2D,
	frameNumber: number,
	height: number,
) => {
	const note = getCurrentNote("bass", frameNumber);
	if (!note) return;
	ctx.fillStyle = "white";
	ctx.font = "24px Arial";
	ctx.strokeStyle = "black";
	ctx.lineWidth = 2;
	ctx.strokeText(
		`Bass is playing: ${(note.progress * 100).toFixed(3)}%`,
		20,
		height - 60,
	);
	ctx.fillText(
		`Bass is playing: ${(note.progress * 100).toFixed(3)}%`,
		20,
		height - 60,
	);
};

export const computeCoordinates = (
	progress: number,
	drawheight: number,
	drawwidth: number,
	isKickPlaying: boolean,
): { sx: number; sy: number } => {
	const easeProgress = progress * progress * (3 - 2 * progress); // Smooth curve
	const offsetX = Math.sin(easeProgress * Math.PI) * 150;
	const offsetY = easeProgress * 100 - 50; // Vertical movement

	// Calculate desired source coordinates
	let sx = STATE.width / 2 + offsetX - drawwidth / 2;
	let sy = STATE.height / 2 + offsetY - drawheight / 2;
	if (isKickPlaying) {
		const shakeIntensity = progress * 3; // pixels
		const angle = Math.random() * 2 * Math.PI;
		const shakeX = Math.cos(angle) * shakeIntensity * Math.random();
		const shakeY = Math.sin(angle) * shakeIntensity * Math.random();
		sx += shakeX;
		sy += shakeY;
	}

	// Clamp source coordinates to image boundaries
	sx = Math.max(0, Math.min(sx, STATE.width - drawwidth));
	sy = Math.max(0, Math.min(sy, STATE.height - drawheight));

	return { sx, sy };
};

export const getRegion = ({
	height,
	width,
	sx,
	sy,
}: {
	sx: number;
	sy: number;
	width: number;
	height: number;
}) => {
	const startX = Math.floor(sx);
	const endX = Math.min(Math.ceil(sx + width), STATE.width);
	const startY = Math.floor(sy);
	const endY = Math.min(Math.ceil(sy + height), STATE.height);

	return { startX, endX, startY, endY };
};

export const secondsToFrames = (seconds: number): number => {
	return Math.floor(seconds * FRAME_RATE);
};
