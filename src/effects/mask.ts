import type { ImageData } from "canvas";
import Color from "color";

export const saturationMask = (
	/**
	 * values from 0 to 100
	 */
	saturation: number,
	imageData: ImageData,
	isNotBlack?: boolean,
	isNotWhite?: boolean,
) => {
	const copy = new Uint8ClampedArray(imageData.data);
	const length = copy.length;
	for (let i = 0; i < length; i += 4) {
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

	return copy;
};
export const lightnessMask = (
	/**
	 * values from 0 to 100
	 */
	lightness: number,
	imageData: ImageData,
	isNotBlack?: boolean,
	isNotWhite?: boolean,
) => {
	const copy = new Uint8ClampedArray(imageData.data);
	const length = copy.length;
	for (let i = 0; i < length; i += 4) {
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

	return copy;
};
