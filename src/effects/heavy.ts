import { createImageData } from "canvas";
import { STATE } from "../state/state.js";
import { perlinToRange } from "../utils/convert.js";
import { perlinNoise } from "../utils/perlin.js";
import { getRegion } from "../utils/utils.js";
import type { ImageEffect } from "./types.js";

export const heavy: ImageEffect = (frame, { height, sx, sy, width }) => {
	const copy = new Uint8ClampedArray(STATE.originalImageData.length);

	const { startX, endX, startY, endY } = getRegion({ height, sx, sy, width });

	const perlinValue = perlinNoise(frame);

	const _lightnessValue = perlinToRange(
		perlinValue,
		STATE.quantilLowLightness,
		STATE.quantilHighLightness,
	);

	const _saturationValue = perlinToRange(
		perlinValue,
		STATE.quantilLowSaturation,
		STATE.quantilHighSaturation,
	);
	// TODO:
	// 		morfnout lightness a saturation masky dohromady
	// 		po intru by efekt měl postupně najet
	return createImageData(copy, STATE.width, STATE.height);
};
