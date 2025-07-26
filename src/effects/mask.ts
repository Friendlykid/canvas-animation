import Color from "color";

export const saturationMask = (
	rgbaValues: Uint8ClampedArray<ArrayBufferLike>,
	/**
	 * values from 0 to 100
	 */
	saturation: number,
	imageWidth: number,
	imageHeight: number,
	visibleRegion?: { sx: number; sy: number; width: number; height: number },
) => {
	let min: number = Number.MAX_VALUE;
	let max: number = Number.MIN_VALUE;
	const copy = new Uint8ClampedArray(rgbaValues);

	// Determine the region to process
	const startX = visibleRegion ? Math.floor(visibleRegion.sx) : 0;
	const endX = visibleRegion
		? Math.min(Math.ceil(visibleRegion.sx + visibleRegion.width), imageWidth)
		: imageWidth;
	const startY = visibleRegion ? Math.floor(visibleRegion.sy) : 0;
	const endY = visibleRegion
		? Math.min(Math.ceil(visibleRegion.sy + visibleRegion.height), imageHeight)
		: imageHeight;

	for (let y = startY; y < endY; y++) {
		for (let x = startX; x < endX; x++) {
			const i = (y * imageWidth + x) * 4;
			const color = Color.rgb(copy[i], copy[i + 1], copy[i + 2]);
			if (color.saturationl() < min) {
				min = color.saturationl();
			}
			if (color.saturationl() > max) {
				max = color.saturationl();
			}
			if (color.saturationl() < saturation) {
				copy[i] = 0;
				copy[i + 1] = 0;
				copy[i + 2] = 0;
			} else {
				copy[i] = 255;
				copy[i + 1] = 255;
				copy[i + 2] = 255;
			}
		}
	}
	return copy;
};
export const lightnessMask = (
	rgbaValues: Uint8ClampedArray<ArrayBufferLike>,
	/**
	 * values from 0 to 100
	 */
	lightness: number,
	imageWidth: number,
	imageHeight: number,
	visibleRegion?: { sx: number; sy: number; width: number; height: number },
) => {
	const copy = new Uint8ClampedArray(rgbaValues);

	// Determine the region to process
	const startX = visibleRegion ? Math.floor(visibleRegion.sx) : 0;
	const endX = visibleRegion
		? Math.min(Math.ceil(visibleRegion.sx + visibleRegion.width), imageWidth)
		: imageWidth;
	const startY = visibleRegion ? Math.floor(visibleRegion.sy) : 0;
	const endY = visibleRegion
		? Math.min(Math.ceil(visibleRegion.sy + visibleRegion.height), imageHeight)
		: imageHeight;

	for (let y = startY; y < endY; y++) {
		for (let x = startX; x < endX; x++) {
			const i = (y * imageWidth + x) * 4;
			const color = Color.rgb(copy[i], copy[i + 1], copy[i + 2]);
			if (color.lightness() < lightness) {
				copy[i] = 0;
				copy[i + 1] = 0;
				copy[i + 2] = 0;
			} else {
				copy[i] = 255;
				copy[i + 1] = 255;
				copy[i + 2] = 255;
			}
		}
	}
	return copy;
};
