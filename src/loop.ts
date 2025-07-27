import { mkdirSync, writeFileSync } from "node:fs";
import { createCanvas, type Image } from "canvas";
import { FRAME_COUNT, OUTPUT_DIR, ZOOM_MAX, ZOOM_MIN } from "./constants.js";
import { alterImage } from "./effects/alterImage.js";
import { isKickPlaying } from "./state/kick.js";
import {
	addBassLabel,
	addFrameNumber,
	computeCoordinates,
} from "./utils/utils.js";

export const loop = ({ image }: { image: Image }) => {
	const canvas = createCanvas(image.width, image.height);
	const ctx = canvas.getContext("2d");

	// Create the output directory if it doesn't exist
	mkdirSync(OUTPUT_DIR, { recursive: true });

	for (let frame = 0; frame < FRAME_COUNT; frame++) {
		const progress = frame / FRAME_COUNT;
		const currentZoom = ZOOM_MAX - progress * (ZOOM_MAX - ZOOM_MIN);
		//const currentZoom = 1; // for testing
		ctx.restore();

		const drawwidth = image.width / currentZoom;
		const drawheight = image.height / currentZoom;

		const { sx, sy } = computeCoordinates(
			progress,
			drawheight,
			drawwidth,
			image.width,
			image.height,
			isKickPlaying(frame),
		);
		ctx.clearRect(0, 0, image.width, image.height);

		ctx.drawImage(
			alterImage(image, frame, {
				sx,
				sy,
				width: drawwidth,
				height: drawheight,
			}),
			sx,
			sy,
			drawwidth,
			drawheight,
			0,
			0,
			image.width,
			image.height,
		);
		addFrameNumber(ctx, frame, image.height);
		addBassLabel(ctx, frame, image.height);
		const buffer = canvas.toBuffer("image/png");
		writeFileSync(`${OUTPUT_DIR}/frame_${frame}.png`, buffer);
		console.log(`Frame ${frame + 1}/${FRAME_COUNT}`);
	}
};
