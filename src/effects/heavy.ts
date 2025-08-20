import { createImageData } from "canvas";
import Color from "color";
import { FRAME_RATE, SONG_PARTS } from "../constants.js";
import { STATE } from "../state/state.js";
import { perlinToRange } from "../utils/convert.js";
import { perlinNoise } from "../utils/perlin.js";
import { getRegion } from "../utils/utils.js";
import { lightnessMask, saturationMask } from "./mask.js";
import type { ImageEffect } from "./types.js";

const FADE_IN_DURATION =
	SONG_PARTS.HEAVY_PART.end * FRAME_RATE -
	SONG_PARTS.HEAVY_PART.start * FRAME_RATE; // in seconds

//saturate max to 10

export const heavy: ImageEffect = (frame, { height, sx, sy, width }) => {
	const { startX, endX, startY, endY } = getRegion({ height, sx, sy, width });

	const perlinValue = perlinNoise(frame);

	const lightnessValue = perlinToRange(
		perlinValue,
		STATE.quantilLowLightness,
		STATE.quantilHighLightness,
	);

	const saturationValue = perlinToRange(
		perlinValue,
		STATE.quantilLowSaturation,
		STATE.quantilHighSaturation,
	);
	const lightnessPixels = lightnessMask(lightnessValue, {
		height,
		sx,
		sy,
		width,
	});
	const saturationPixels = saturationMask(saturationValue, {
		height,
		sx,
		sy,
		width,
	});
	const lightenFactor =
		(2 / FADE_IN_DURATION) *
		(FADE_IN_DURATION -
			(frame - Math.floor(SONG_PARTS.HEAVY_PART.start * FRAME_RATE)));
	const LPixelsNew = new Uint8ClampedArray(STATE.originalImageData);

	for (let y = startY; y < endY; y++) {
		for (let x = startX; x < endX; x++) {
			const i = (y * STATE.width + x) * 4;
			if (
				lightnessPixels[i] === 255 &&
				lightnessPixels[i + 1] === 255 &&
				lightnessPixels[i + 2] === 255
			) {
				const color = Color.rgb(
					LPixelsNew[i],
					LPixelsNew[i + 1],
					LPixelsNew[i + 2],
				).lighten(lightenFactor < 0 ? 0 : lightenFactor);
				LPixelsNew[i] = color.red();
				LPixelsNew[i + 1] = color.green();
				LPixelsNew[i + 2] = color.blue();
			}
		}
	}
	// TODO:
	// 		morfnout lightness a saturation masky dohromady
	// 		po intru by efekt měl postupně najet
	return createImageData(
		lightnessPixels.map((value, index) => {
			if (value === 255) {
				return LPixelsNew[index];
			}
			return value || saturationPixels[index];
		}),
		STATE.width,
		STATE.height,
	);
};
