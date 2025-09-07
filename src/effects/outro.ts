import { createImageData } from "canvas";
import Color from "color";
import { FRAME_COUNT, FRAME_RATE, SONG_PARTS } from "../constants.js";
import { STATE } from "../state/state.js";
import { getRegion } from "../utils/utils.js";
import type { ImageEffect } from "./types.js";

export const outro: ImageEffect = (frame, { height, sx, sy, width }) => {
	const lightnessValue =
		(100 * (frame - SONG_PARTS.SECOND_PART.end * FRAME_RATE)) /
		(FRAME_COUNT - SONG_PARTS.SECOND_PART.end * FRAME_RATE);
	const newImageData = new Uint8ClampedArray(STATE.originalImageData);
	const { startX, endX, startY, endY } = getRegion({ height, sx, sy, width });
	console.log(lightnessValue);
	for (let y = startY; y < endY; y++) {
		for (let x = startX; x < endX; x++) {
			const i = (y * STATE.width + x) * 4;
			const color = Color.rgb(
				newImageData[i],
				newImageData[i + 1],
				newImageData[i + 2],
			);
			if (color.lightness() < lightnessValue) {
				newImageData[i] = 0;
				newImageData[i + 1] = 0;
				newImageData[i + 2] = 0;
			}
		}
	}
	return createImageData(newImageData, STATE.width, STATE.height);
};
