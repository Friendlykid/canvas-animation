import type { CanvasRenderingContext2D } from "canvas";
import { FRAME_RATE, SONG_PARTS } from "../constants.js";

const isIntro = (frame: number): boolean => {
	return frame / FRAME_RATE < SONG_PARTS.INTRO.end;
};
export const introSkew = (ctx: CanvasRenderingContext2D, frame: number) => {
	ctx.resetTransform();
	if (isIntro(frame)) {
		const introProgress = frame / FRAME_RATE / SONG_PARTS.INTRO.end; // 0 to 1
		const skewValue = -1 + introProgress; // -1 to 0
		const scaleValue = 2 - introProgress;
		ctx.setTransform(scaleValue, 0, skewValue, scaleValue, 0, 0);
	}
};
