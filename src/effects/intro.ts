import { createImageData } from "canvas";
import { perlinNoise } from "../perlin.js";
import { lightnessMask, saturationMask } from "./mask.js";
import type { ImageEffect } from "./types.js";

let maskValue: number = 30;

export const introMask: ImageEffect = (imageData, frame, visibleRegion) => {
	const perlinValue = perlinNoise(frame);
	if (maskValue + 5 * perlinValue > 95) {
		maskValue -= Math.abs(5 * perlinValue);
	}
	if (maskValue + 5 * perlinValue < 20) {
		maskValue += Math.abs(5 * perlinValue);
	} else {
		maskValue += 5 * perlinValue; // Scale to 0-100
	}
	const lightnessData = lightnessMask(
		imageData.data,
		maskValue,
		imageData.width,
		imageData.height,
		visibleRegion,
	);
	const saturationData = saturationMask(
		imageData.data,
		maskValue,
		imageData.width,
		imageData.height,
		visibleRegion,
	);
	return createImageData(
		lightnessData.map((value, index) => {
			return value || saturationData[index];
		}),
		imageData.width,
		imageData.height,
	);
};
