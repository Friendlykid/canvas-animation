import { createImageData } from "canvas";
import Color from "color";
import { FRAME_COUNT } from "../constants.js";
import { getCurrentNote, STATE } from "../state/state.js";
import { perlinToRange } from "../utils/convert.js";
import { perlinNoise, perlinNoise2D } from "../utils/perlin.js";
import { getRegion } from "../utils/utils.js";
import { lightnessMask, saturationMask } from "./mask.js";
import type { ImageEffect } from "./types.js";

const LOW_BASS_NOTE = 15;
const HIGH_BASS_NOTE = 40;

const BASS_NOTE_RANGE = HIGH_BASS_NOTE - LOW_BASS_NOTE;

const getBassRegion = (noteNumber: number, startY: number, endY: number) => {
	const rowRange = endY - startY;
	const bandHeight = Math.max(4, Math.floor(rowRange * 0.1)); // 10% of region height, at least 4px
	const bandPosition =
		(Math.abs(noteNumber - LOW_BASS_NOTE) / BASS_NOTE_RANGE) *
		(rowRange - bandHeight);
	return {
		startRow: startY + bandPosition,
		endRow: startY + bandPosition + bandHeight,
	};
};

export const secondPart: ImageEffect = (frame, { height, sx, sy, width }) => {
	const { endX, endY, startX, startY } = getRegion({ height, sx, sy, width });
	const bassNote = getCurrentNote("bass", frame);
	const copy = new Uint8ClampedArray(STATE.originalImageData);
	let {
		startRow,
		endRow,
	}: { startRow: number | undefined; endRow: number | undefined } = {
		startRow: undefined,
		endRow: undefined,
	};
	if (bassNote) {
		({ startRow, endRow } = getBassRegion(bassNote.noteNumber, startY, endY));
	}
	const perlinValueGlobal = perlinNoise(frame);

	const lightnessValue = perlinToRange(
		perlinValueGlobal,
		0,
		STATE.quantilHighLightness,
	);

	const saturationValue = perlinToRange(
		perlinValueGlobal,
		STATE.quantilLowSaturation,
		STATE.quantilHighSaturation,
	);

	const lightnessPixels = lightnessMask(lightnessValue, {
		height,
		sx,
		sy,
		width,
	});
	const saturationPixels = saturationMask(saturationValue, {
		height,
		sx,
		sy,
		width,
	});

	for (let y = startY; y < endY; y++) {
		const perlinRowValue = perlinNoise2D(y / STATE.height, frame / FRAME_COUNT);
		for (let x = startX; x < endX; x++) {
			const perlinColumnValue = perlinNoise2D(
				x / STATE.width,
				frame / FRAME_COUNT,
			);
			const perlinEdgeStartValue = perlinNoise2D(
				(20 * x * ((bassNote?.noteNumber ?? 5) / 5)) / STATE.height +
					(10 * frame) / FRAME_COUNT,
				(70 * frame) / FRAME_COUNT,
			);

			const perlinEdgeEndValue = perlinNoise2D(
				(20 * x * ((bassNote?.noteNumber ?? 5) / 5)) / STATE.height,
				(FRAME_COUNT - 70 * frame) / FRAME_COUNT,
			);
			const i = (y * STATE.width + x) * 4;
			const originalColor = Color.rgb(copy[i], copy[i + 1], copy[i + 2]);
			const startBassRowEdge = startRow
				? startRow + 10 * perlinEdgeStartValue
				: undefined;

			const endBassRowEdge = endRow
				? endRow + 10 * perlinEdgeEndValue
				: undefined;
			if (
				startBassRowEdge !== undefined &&
				endBassRowEdge !== undefined &&
				bassNote &&
				y >= startBassRowEdge &&
				y < endBassRowEdge
			) {
				//todo tady udělat okraj podle perlin noisu tak, aby se hýbal postupně
				// Calculate smooth falloff for saturation near edges
				const bandCenter = (startBassRowEdge + endBassRowEdge) / 2;
				const bandHalf = (endBassRowEdge - startBassRowEdge) / 2;
				const distFromCenter = Math.abs(y - bandCenter);
				// Use a cosine falloff (1 at center, 0 at edge)
				const edgeFactor = Math.cos(
					(distFromCenter / bandHalf) * (Math.PI / 2),
				);
				// Clamp edgeFactor to [0,1]
				const smoothFactor = Math.max(0, edgeFactor);
				const randomValue = Math.random();
				if ((perlinRowValue + 1) / 2 > randomValue) {
					const saturate = perlinToRange(perlinRowValue, 0, 100) * smoothFactor;
					const color = Color.hsl([
						originalColor.hue(),
						saturate,
						originalColor.lightness(),
					]);
					copy[i] = color.red();
					copy[i + 1] = color.green();
					copy[i + 2] = color.blue();
					continue;
				}
				continue;
			}
			const randomValue = Math.random() + 0.4;
			const perlinPixelValue = perlinNoise2D(
				x / STATE.width + frame / FRAME_COUNT,
				y / STATE.height + frame / FRAME_COUNT,
			);
			if ((perlinRowValue + 1) / 2 < randomValue) {
				const color = Color.hsl([
					originalColor.hue() + perlinToRange(perlinPixelValue, 0, 360),
					originalColor.saturationl() + (perlinColumnValue + 1) * 10,
					originalColor.lightness() + (perlinRowValue + 1) * 10,
				]);
				copy[i] = color.red();
				copy[i + 1] = color.green();
				copy[i + 2] = color.blue();
			}
			// pixel in bass region: modify saturation based on perlin noise
			// outside bass region: leave pixel unchanged
			// todo pokračuj tady
			if (saturationPixels[i] === 0 && lightnessPixels[i + 1] === 0) {
				const color = originalColor.blacken(perlinRowValue + 1);
				copy[i] = color.red();
				copy[i + 1] = color.green();
				copy[i + 2] = color.blue();
			} else if (
				saturationPixels[i] === 255 &&
				lightnessPixels[i + 1] === 255
			) {
				const color = originalColor.lighten(perlinRowValue + 1);
				copy[i] = color.red();
				copy[i + 1] = color.green();
				copy[i + 2] = color.blue();
			}
		}
	}

	return createImageData(copy, STATE.width, STATE.height);
};
