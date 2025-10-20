/** biome-ignore-all lint/suspicious/noAssignInExpressions: <protože proto> */
import { createImageData, type ImageData } from "canvas";
import { FRAME_RATE, SONG_PARTS } from "../constants.js";
import { STATE } from "../state/state.js";
import { perlinToRange } from "../utils/convert.js";
import { perlinNoise } from "../utils/perlin.js";
import { isOutro } from "../utils/utils.js";
import { lightnessMask, saturationMask } from "./mask.js";

const FREQ_RATE = 1.4;

const easeInOutSine = (x: number): number => {
	return -(Math.cos(Math.PI * x * FREQ_RATE) - 1) / 2;
};

const easeOutBounceDeep = (x: number): number => {
	const n1 = 8.2; // a bit steeper
	const d1 = 2.75;

	if (x < 1 / d1) {
		return n1 * x * x;
	} else if (x < 2 / d1) {
		return n1 * (x -= 1.5 / d1) * x + 0.7; // lower rebound
	} else if (x < 2.5 / d1) {
		return n1 * (x -= 2.25 / d1) * x + 0.9; // lower rebound
	} else {
		return n1 * (x -= 2.625 / d1) * x + 0.975; // lower rebound
	}
};

export const introMask = (frame: number, imageData: ImageData) => {
	const perlinValue = perlinNoise(frame);

	let base = 0;

	const isOutroBool = isOutro(frame);

	if (isOutroBool) {
		const outroProgress =
			(frame - SONG_PARTS.OUTRO.start * FRAME_RATE) /
			((SONG_PARTS.OUTRO.end - SONG_PARTS.OUTRO.start) * FRAME_RATE);
		base = Math.abs(
			100 *
				(easeOutBounceDeep(outroProgress) +
					(outroProgress < 0.3 ? easeInOutSine(outroProgress * 3) / 15 : 0)),
		);
	}

	const lightnessValue = perlinToRange(perlinValue, 100 - (base || 100), 100);

	const saturationValue = perlinToRange(perlinValue, 0, 100 - base);

	const lightnessData = lightnessMask(lightnessValue, imageData);
	const saturationData = saturationMask(saturationValue, imageData);
	return createImageData(
		(isOutroBool ? saturationData : lightnessData).map((value, index) => {
			return (
				value || (isOutroBool ? lightnessData[index] : saturationData[index])
			);
		}),
		STATE.width,
		STATE.height,
	);
};
