import { createImageData } from "canvas";
import Color from "color";
import { FRAME_COUNT } from "../constants.js";
import { perlinNoise2D } from "../perlin.js";
import type { ImageEffect } from "./types.js";

export const heavy: ImageEffect = (imageData, frame, visibleRegion) => {
	const copy = new Uint8ClampedArray(imageData.data);
	let maxSaturation = -Infinity;
	let maxLightness = -Infinity;
	let minSaturation = Infinity;
	let minLightness = Infinity;

	// Determine the region to process
	const startX = visibleRegion ? Math.floor(visibleRegion.sx) : 0;
	const endX = visibleRegion ? Math.min(Math.ceil(visibleRegion.sx + visibleRegion.width), imageData.width) : imageData.width;
	const startY = visibleRegion ? Math.floor(visibleRegion.sy) : 0;
	const endY = visibleRegion ? Math.min(Math.ceil(visibleRegion.sy + visibleRegion.height), imageData.height) : imageData.height;

	for (let i = startX; i < endX; i++) {
		for (let j = startY; j < endY; j++) {
			const perlinWidthValue = perlinNoise2D(
				i / imageData.width + frame / FRAME_COUNT,
				j / imageData.height,
			);
			const perlinHeightValue = perlinNoise2D(
				i / imageData.width,
				j / imageData.height + frame / FRAME_COUNT,
			);
			const saturation = (100 * perlinWidthValue) / 4;
			const lightness = 50 * perlinHeightValue + 10;
			if (maxLightness < lightness) {
				maxLightness = lightness;
			}
			if (minLightness > lightness) {
				minLightness = lightness;
			}
			if (maxSaturation < saturation) {
				maxSaturation = saturation;
			}
			if (minSaturation > saturation) {
				minSaturation = saturation;
			}
			const index = j * imageData.width * 4 + i * 4;
			const color = Color.rgb([copy[index], copy[index + 1], copy[index + 2]])
				.lightness(lightness)
				.saturate(saturation);
			copy[index] = color.red();
			copy[index + 1] = color.green();
			copy[index + 2] = color.blue();
			copy[index + 3] = 255; // Ensure alpha is set to fully opaque
		}
	}
	console.log("Max saturation:", maxSaturation);
	console.log("Min saturation:", minSaturation);
	console.log("Max lightness:", maxLightness);
	console.log("Min lightness:", minLightness);
	return createImageData(copy, imageData.width, imageData.height);
};
