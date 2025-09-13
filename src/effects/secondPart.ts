import { createImageData } from "canvas";
import Color from "color";
import { FRAME_COUNT, FRAME_RATE, SONG_PARTS } from "../constants.js";
import { getCurrentNote, getNotes, STATE } from "../state/state.js";
import { perlinToRange } from "../utils/convert.js";
import { perlinNoise, perlinNoise2D } from "../utils/perlin.js";
import { getRegion } from "../utils/utils.js";
import { lightnessMask, saturationMask } from "./mask.js";
import type { ImageEffect } from "./types.js";

const LOW_BASS_NOTE = 15;
const HIGH_BASS_NOTE = 40;

const BASS_NOTE_RANGE = HIGH_BASS_NOTE - LOW_BASS_NOTE;

const getBassRegion = (
	frame: number,
	noteNumber: number,
	progress: number,
	startY: number,
	endY: number,
) => {
	const rowRange = endY - startY;
	const noteNorm = (noteNumber - LOW_BASS_NOTE) / BASS_NOTE_RANGE;
	const perlinValue = perlinNoise(5 * frame);
	// Lower notes: bigger bands, higher notes: smaller bands
	const perlinRange = perlinToRange(perlinValue, 0.01, 2);
	const bandHeightMin = 15;
	let bandHeight = Math.max(
		bandHeightMin,
		Math.floor(
			perlinRange *
				((1 - progress) * 1.1) ** 2 *
				rowRange *
				(0.3 * (1 - noteNorm * 0.8)),
		),
	);
	if (bandHeight <= 2 * bandHeightMin) {
		const add = Math.floor(
			perlinToRange(perlinValue, 1, 10) * (Math.sin(frame * 0.5) + 1),
		);
		bandHeight += add;
	}
	const bandPosition = (1 - noteNorm) * (rowRange - bandHeight);
	return {
		startRow: startY + bandPosition,
		endRow: startY + bandPosition + bandHeight,
	};
};

let highestSynthNoteCache: number | null = null;
let lowestSynthNoteCache: number | null = null;

let highestKeyNoteCache: number | null = null;
let lowestKeyNoteCache: number | null = null;

const getSynthRegion = (
	frame: number,
	noteNumber: number,
	startColumn: number,
	endColumn: number,
	synthNoteBandWidth: number,
) => {
	const columnRange = endColumn - startColumn;
	const perlinValue = perlinNoise(5 * frame + 100); // Offset from bass perlin for variety
	const perlinRange = perlinToRange(perlinValue, 0.1, 1.1);

	// Calculate band width based on progress (wider at beginning, narrower at end)
	const bandWidthMin = 10;
	const bandWidth = Math.max(
		bandWidthMin,
		Math.floor(perlinRange * columnRange * 0.02),
	);

	// Calculate position based on note number (higher notes = further right)
	// Find where in the full synth range this note falls
	const notePosition =
		(highestSynthNoteCache! - noteNumber) * synthNoteBandWidth;
	const bandPosition = startColumn + notePosition;

	return {
		startColumn: Math.floor(bandPosition),
		endColumn: Math.floor(bandPosition + bandWidth),
		synthNoteBandWidth,
	};
};

const getSynthRegions = (
	frame: number,
	startColumn: number,
	endColumn: number,
) => {
	const synthNotes = getNotes("synth", frame);
	if (!synthNotes) return [];
	if (highestSynthNoteCache === null) {
		highestSynthNoteCache = STATE.synth.reduce(
			(accNote, note) =>
				accNote > note.noteNumber ? accNote : note.noteNumber,
			0,
		);
	}
	if (lowestSynthNoteCache === null) {
		lowestSynthNoteCache = STATE.synth.reduce(
			(accNote, note) =>
				accNote < note.noteNumber ? accNote : note.noteNumber,
			Number.MAX_VALUE,
		);
	}
	const synthNoteBandWidth = Math.floor(
		(endColumn - startColumn) / (highestSynthNoteCache - lowestSynthNoteCache),
	);
	return synthNotes.map((note) => {
		const { noteNumber } = note;
		return getSynthRegion(
			frame,
			noteNumber,
			startColumn,
			endColumn,
			synthNoteBandWidth,
		);
	});
};

const getKeysRegions = (
	frame: number,
	startColumn: number,
	endColumn: number,
) => {
	const keysNotes = getNotes("keys", frame);
	if (!keysNotes) return [];
	if (highestKeyNoteCache === null) {
		highestKeyNoteCache = STATE.keys.reduce(
			(accNote, note) =>
				accNote > note.noteNumber ? accNote : note.noteNumber,
			0,
		);
	}
	if (lowestKeyNoteCache === null) {
		lowestKeyNoteCache = STATE.keys.reduce(
			(accNote, note) =>
				accNote < note.noteNumber ? accNote : note.noteNumber,
			Number.MAX_VALUE,
		);
	}
	const synthNoteBandWidth = Math.floor(
		(endColumn - startColumn) / (highestKeyNoteCache - lowestKeyNoteCache),
	);
	return keysNotes.map((note) => {
		const { noteNumber, velocity } = note;
		return {
			...getSynthRegion(
				frame,
				noteNumber,
				startColumn,
				endColumn,
				synthNoteBandWidth,
			),
			velocity,
		};
	});
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
		({ startRow, endRow } = getBassRegion(
			frame,
			bassNote.noteNumber,
			bassNote.progress,
			startY,
			endY,
		));
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

	const synthRegions = getSynthRegions(frame, startX, endX);
	const keysRegions = getKeysRegions(frame, startX, endX);

	for (let row = startY; row <= endY; row++) {
		const perlinRowValue = perlinNoise2D(
			row / (10 * STATE.height),
			frame / FRAME_COUNT,
		);

		const perlinRowFastValue = perlinNoise2D(row, frame / FRAME_COUNT);

		const perlinRowSlowerValue = perlinNoise2D(row / 10, frame / FRAME_COUNT);

		for (let column = startX; column <= endX; column++) {
			const perlinColumnValue = perlinNoise2D(
				column / STATE.width,
				frame / FRAME_COUNT,
			);
			const perlinEdgeStartValue = perlinNoise2D(
				(20 * column * ((bassNote?.noteNumber ?? 5) / 5)) / STATE.height +
					(10 * frame) / FRAME_COUNT,
				(70 * frame) / FRAME_COUNT,
			);

			const perlinEdgeEndValue = perlinNoise2D(
				(20 * column * ((bassNote?.noteNumber ?? 5) / 5)) / STATE.height,
				(FRAME_COUNT - 70 * frame) / FRAME_COUNT,
			);
			const i = (row * STATE.width + column) * 4;
			const originalColor = Color.rgb(copy[i], copy[i + 1], copy[i + 2]);
			const startBassRowEdge = startRow
				? startRow + 10 * perlinEdgeStartValue
				: undefined;

			const endBassRowEdge = endRow
				? endRow + 10 * perlinEdgeEndValue
				: undefined;

			const randomValue = Math.random() + 0.4;

			if ((perlinRowValue + 1) / 2 < randomValue) {
				const perlinPixelValue = perlinNoise2D(
					column / STATE.width + frame / FRAME_COUNT,
					row / STATE.height + frame / FRAME_COUNT,
				);
				const color = Color.hsl([
					originalColor.hue() + perlinToRange(perlinPixelValue, 0, 360),
					originalColor.saturationl() + (perlinColumnValue + 1) * 10,
					originalColor.lightness() + (perlinRowValue + 1) * 10,
				]);
				copy[i] = color.red();
				copy[i + 1] = color.green();
				copy[i + 2] = color.blue();
			}
			// outside bass region: leave pixel unchanged
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
			// synth effect
			if (
				synthRegions.some(
					(r) =>
						column >= r.startColumn + perlinRowFastValue * 4 &&
						column <= r.endColumn - perlinRowFastValue * 4,
				)
			) {
				const perlinPixelFastValue = perlinNoise2D(
					(20 * column) / STATE.width +
						20 *
							((SONG_PARTS.SECOND_PART.start / FRAME_RATE -
								frame -
								SONG_PARTS.SECOND_PART.end * FRAME_RATE -
								SONG_PARTS.SECOND_PART.start * FRAME_RATE) /
								(SONG_PARTS.SECOND_PART.end * FRAME_RATE -
									SONG_PARTS.SECOND_PART.start * FRAME_RATE)),
					(20 * row) / STATE.height +
						20 *
							((SONG_PARTS.SECOND_PART.start / FRAME_RATE -
								frame -
								SONG_PARTS.SECOND_PART.end * FRAME_RATE -
								SONG_PARTS.SECOND_PART.start * FRAME_RATE) /
								(SONG_PARTS.SECOND_PART.end * FRAME_RATE -
									SONG_PARTS.SECOND_PART.start * FRAME_RATE)),
				);
				const color = Color.hsl([
					originalColor.hue() + perlinToRange(perlinPixelFastValue, 0, 360),
					Math.min(
						100,
						originalColor.saturationl() +
							perlinToRange(perlinPixelFastValue, 0, 20),
					),
					Math.min(
						100,
						originalColor.lightness() +
							perlinToRange(perlinPixelFastValue, -30, 50),
					),
				]);
				copy[i] = color.red();
				copy[i + 1] = color.green();
				copy[i + 2] = color.blue();
			}
			// keys effect
			const keyNote = keysRegions.find(
				(r) =>
					column >= r.startColumn + perlinRowSlowerValue * 4 &&
					column <= r.endColumn - perlinRowSlowerValue * 4 &&
					row >=
						startY +
							(((endY - startY) / 6) * r.velocity) / 127 +
							perlinToRange(perlinValueGlobal, 0, (endY - startY) / 4),
			);
			if (keyNote) {
				const perlinPixelSlowerValue = perlinNoise2D(
					column / STATE.width +
						(SONG_PARTS.SECOND_PART.start / FRAME_RATE -
							frame -
							SONG_PARTS.SECOND_PART.end * FRAME_RATE -
							SONG_PARTS.SECOND_PART.start * FRAME_RATE) /
							(SONG_PARTS.SECOND_PART.end * FRAME_RATE -
								SONG_PARTS.SECOND_PART.start * FRAME_RATE),
					row / STATE.height +
						(SONG_PARTS.SECOND_PART.start / FRAME_RATE -
							frame -
							SONG_PARTS.SECOND_PART.end * FRAME_RATE -
							SONG_PARTS.SECOND_PART.start * FRAME_RATE) /
							(SONG_PARTS.SECOND_PART.end * FRAME_RATE -
								SONG_PARTS.SECOND_PART.start * FRAME_RATE),
				);
				const color = Color.hsl([
					originalColor.hue(),
					originalColor.saturationl(),
					Math.min(
						100,
						originalColor.lightness() +
							perlinToRange(perlinPixelSlowerValue, 10, 40),
					),
				]);
				copy[i] = color.red();
				copy[i + 1] = color.green();
				copy[i + 2] = color.blue();
			}
			if (
				startBassRowEdge !== undefined &&
				endBassRowEdge !== undefined &&
				bassNote &&
				row >= startBassRowEdge &&
				row < endBassRowEdge
			) {
				// Calculate smooth falloff for saturation near edges
				const bandCenter = (startBassRowEdge + endBassRowEdge) / 2;
				const bandHalf = (endBassRowEdge - startBassRowEdge) / 2;
				const distFromCenter = Math.abs(row - bandCenter);
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
				}
			}
		}
	}

	return createImageData(copy, STATE.width, STATE.height);
};
