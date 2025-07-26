import type { CanvasRenderingContext2D } from "canvas";
import { FRAME_RATE } from "./constants.js";

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

export const computeCoordinates = (
	progress: number,
	drawheight: number,
	drawwidth: number,
	width: number,
	height: number,
	isKickPlaying: boolean,
): { sx: number; sy: number } => {
	const easeProgress = progress * progress * (3 - 2 * progress); // Smooth curve
	const offsetX = Math.sin(easeProgress * Math.PI) * 150;
	const offsetY = easeProgress * 100 - 50; // Vertical movement

	// Calculate desired source coordinates
	let sx = width / 2 + offsetX - drawwidth / 2;
	let sy = height / 2 + offsetY - drawheight / 2;
	if (isKickPlaying) {
		const shakeIntensity = 3; // pixels
		const angle = Math.random() * 2 * Math.PI;
		const shakeX = Math.cos(angle) * shakeIntensity * Math.random();
		const shakeY = Math.sin(angle) * shakeIntensity * Math.random();
		sx += shakeX;
		sy += shakeY;
	}

	// Clamp source coordinates to image boundaries
	sx = Math.max(0, Math.min(sx, width - drawwidth));
	sy = Math.max(0, Math.min(sy, height - drawheight));

	return { sx, sy };
};

export const secondsToFrames = (seconds: number): number => {
	return Math.floor(seconds * FRAME_RATE);
};
