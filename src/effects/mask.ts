import Color from "color";
import { STATE } from "../state/state.js";
import { getRegion } from "../utils/utils.js";

export const saturationMask = (
	/**
	 * values from 0 to 100
	 */
	saturation: number,
	{
		height,
		sx,
		sy,
		width,
	}: { sx: number; sy: number; width: number; height: number },
	isNotBlack?: boolean,
	isNotWhite?: boolean,
) => {
	const copy = new Uint8ClampedArray(STATE.originalImageData);

	// Determine the region to process
	const { startX, endX, startY, endY } = getRegion({ height, sx, sy, width });

	for (let y = startY; y < endY; y++) {
		for (let x = startX; x < endX; x++) {
			const i = (y * STATE.width + x) * 4;
			const color = Color.rgb(copy[i], copy[i + 1], copy[i + 2]);

			if (color.saturationl() < saturation && !isNotBlack) {
				copy[i] = 0;
				copy[i + 1] = 0;
				copy[i + 2] = 0;
			} else if (!isNotWhite) {
				copy[i] = 255;
				copy[i + 1] = 255;
				copy[i + 2] = 255;
			}
		}
	}
	return copy;
};
export const lightnessMask = (
	/**
	 * values from 0 to 100
	 */
	lightness: number,
	{
		height,
		sx,
		sy,
		width,
	}: { sx: number; sy: number; width: number; height: number },
	/**
	 *
	 */
	isNotBlack?: boolean,
	isNotWhite?: boolean,
) => {
	const copy = new Uint8ClampedArray(STATE.originalImageData);

	// Determine the region to process
	const { startX, endX, startY, endY } = getRegion({ height, sx, sy, width });

	for (let y = startY; y < endY; y++) {
		for (let x = startX; x < endX; x++) {
			const i = (y * STATE.width + x) * 4;
			const color = Color.rgb(copy[i], copy[i + 1], copy[i + 2]);
			if (color.lightness() < lightness && !isNotBlack) {
				copy[i] = 0;
				copy[i + 1] = 0;
				copy[i + 2] = 0;
			} else if (!isNotWhite) {
				copy[i] = 255;
				copy[i + 1] = 255;
				copy[i + 2] = 255;
			}
		}
	}
	return copy;
};
