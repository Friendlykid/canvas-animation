import type { ImageData } from "canvas";
import Color from "color";
import { FRAME_RATE, SONG_PARTS } from "../constants.js";
import { perlinToRange } from "../utils/convert.js";
import { isOutro } from "../utils/utils.js";

const easeOutExpo = (x: number) => {
	return x === 1 ? 1 : 1 - 2 ** (-10 * x);
};

function easeOutCubic(x: number): number {
	return 1 - (1 - x) ** 3;
}

const LIGHTEN_MAX = 40;

export const saturationMask = (
	/**
	 * values from 0 to 100
	 */
	saturation: number,
	imageData: ImageData,
	perlinValue: number,
	frame: number,
) => {
	const isOutroBool = isOutro(frame);
	const copy = new Uint8ClampedArray(imageData.data);
	let lightenFactor = 0;
	let outroProgress = 0;
	let darkenValue = 0;
	if (isOutroBool) {
		outroProgress =
			(frame - SONG_PARTS.OUTRO.start * FRAME_RATE) /
			((SONG_PARTS.OUTRO.end - SONG_PARTS.OUTRO.start) * FRAME_RATE);
		darkenValue = (0.8 * easeOutCubic(outroProgress) + 0.2) / 5;
		lightenFactor += easeOutExpo(outroProgress) * LIGHTEN_MAX;
		console.log("frame: ", frame, "lightenFactor: ", lightenFactor);
	}
	const saturationValue = perlinToRange(
		perlinValue,
		isOutroBool ? 60 : 30,
		isOutroBool ? 100 : 70,
	);
	const length = copy.length;
	for (let i = 0; i < length; i += 4) {
		const color = Color.rgb(copy[i], copy[i + 1], copy[i + 2]);

		if (color.saturationl() < saturation) {
			copy[i] = 0;
			copy[i + 1] = 0;
			copy[i + 2] = 0;
		} else {
			let newColor = Color.rgb(copy[i], copy[i + 1], copy[i + 2]).saturate(
				saturationValue,
			);
			if (isOutroBool && lightenFactor !== 0) {
				newColor = Color.hsl(
					newColor.hue(),
					Math.max(newColor.saturationl() + 20, 100),
					((newColor.lightness() % 100) + lightenFactor) % (100 + LIGHTEN_MAX),
				).blacken(darkenValue);
			}
			copy[i] = newColor.red();
			copy[i + 1] = newColor.green();
			copy[i + 2] = newColor.blue();
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
) => {
	const copy = new Uint8ClampedArray(imageData.data);
	const length = copy.length;
	for (let i = 0; i < length; i += 4) {
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

	return copy;
};
