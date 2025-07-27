import { createImageData } from "canvas";
import Color from "color";
import { FRAME_COUNT } from "../constants.js";
import { STATE } from "../state/state.js";
import { perlinNoise2D } from "../utils/perlin.js";
import type { ImageEffect } from "./types.js";

export const heavy: ImageEffect = (pixelArr, frame, visibleRegion) => {
	const copy = new Uint8ClampedArray(pixelArr);

	const startX = visibleRegion ? Math.floor(visibleRegion.sx) : 0;
	const endX = visibleRegion
		? Math.min(Math.ceil(visibleRegion.sx + visibleRegion.width), STATE.width)
		: STATE.width;
	const startY = visibleRegion ? Math.floor(visibleRegion.sy) : 0;
	const endY = visibleRegion
		? Math.min(Math.ceil(visibleRegion.sy + visibleRegion.height), STATE.height)
		: STATE.height;

	for (let i = startX; i < endX; i++) {
		for (let j = startY; j < endY; j++) {
			const perlinWidthValue = perlinNoise2D(
				i / STATE.width + frame / FRAME_COUNT,
				j / STATE.height,
			);
			const perlinHeightValue = perlinNoise2D(
				i / STATE.width,
				j / STATE.height + frame / FRAME_COUNT,
			);
			const saturation = (100 * perlinWidthValue) / 4;
			const lightness = 50 * perlinHeightValue + 10;
			const index = j * STATE.width * 4 + i * 4;
			const color = Color.rgb([copy[index], copy[index + 1], copy[index + 2]])
				.lightness(lightness)
				.saturate(saturation);
			copy[index] = color.red();
			copy[index + 1] = color.green();
			copy[index + 2] = color.blue();
			copy[index + 3] = 255;
		}
	}
	return createImageData(copy, STATE.width, STATE.height);
};
