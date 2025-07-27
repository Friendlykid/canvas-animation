import { type Canvas, createCanvas, type Image } from "canvas";
import { FRAME_RATE, SONG_PARTS } from "../constants.js";
import { heavy } from "./heavy.js";
import { introMask } from "./intro.js";

const isIntro = (frame: number): boolean => {
	return frame / FRAME_RATE < SONG_PARTS.INTRO.end;
};

const isHeavyPart = (frame: number): boolean => {
	return (
		frame / FRAME_RATE >= SONG_PARTS.HEAVY_PART.start &&
		frame / FRAME_RATE < SONG_PARTS.HEAVY_PART.end
	);
};

export const alterImage = (
	image: Image,
	frame: number,
	visibleRegion: { sx: number; sy: number; width: number; height: number },
): Canvas => {
	const canvas = createCanvas(image.width, image.height);
	const ctx = canvas.getContext("2d");
	ctx.drawImage(image, 0, 0, image.width, image.height);
	const imageData = ctx.getImageData(0, 0, image.width, image.height);

	if (isIntro(frame)) {
		ctx.putImageData(introMask(imageData.data, frame, visibleRegion), 0, 0);
		return canvas;
	}

	if (isHeavyPart(frame)) {
		ctx.putImageData(heavy(imageData.data, frame, visibleRegion), 0, 0);
		return canvas;
	}

	ctx.putImageData(imageData, 0, 0);
	return canvas;
};
