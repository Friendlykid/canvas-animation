import { createImageData } from "canvas";
import { STATE } from "../state/state.js";
import { perlinToRange } from "../utils/convert.js";
import { perlinNoise } from "../utils/perlin.js";
import { lightnessMask, saturationMask } from "./mask.js";
import type { ImageEffect } from "./types.js";

export const introMask: ImageEffect = (frame, visibleRegion) => {
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

	const lightnessData = lightnessMask(lightnessValue, visibleRegion);
	const saturationData = saturationMask(saturationValue, visibleRegion);
	return createImageData(
		lightnessData.map((value, index) => {
			return value || saturationData[index];
		}),
		STATE.width,
		STATE.height,
	);
};
