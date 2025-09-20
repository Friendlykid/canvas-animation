import { mkdirSync, writeFileSync } from "node:fs";
import { createCanvas, type Image } from "canvas";
import { FRAME_COUNT, OUTPUT_DIR, ZOOM_MAX, ZOOM_MIN } from "./constants.js";
import { alterImage } from "./effects/alterImage.js";
import { isKickPlaying } from "./state/kick.js";
import { STATE } from "./state/state.js";
import { introSkew } from "./utils/introSkew.js";
import { computeCoordinates } from "./utils/utils.js";

export const loop = ({ image }: { image: Image }) => {
	const canvas = createCanvas(STATE.width, STATE.height);
	const ctx = canvas.getContext("2d");

	ctx.imageSmoothingEnabled = false;

	// Create the output directory if it doesn't exist
	mkdirSync(OUTPUT_DIR, { recursive: true });
	// cca 250 pro heavy part, 814 for second part, 1626 for outro
	for (let frame = 1083; frame < 1224; frame++) {
		const progress = (frame || 1) / FRAME_COUNT;
		const currentZoom = ZOOM_MAX - progress * (ZOOM_MAX - ZOOM_MIN);
		//const currentZoom = 1; // for testing
		ctx.restore();

		const drawwidth = image.width / currentZoom;
		const drawheight = image.height / currentZoom;

		const { sx, sy } = computeCoordinates(
			progress,
			drawheight,
			drawwidth,
			isKickPlaying(frame),
		);
		ctx.clearRect(0, 0, STATE.width, STATE.height);
		console.time(`effect:${frame}`);

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
			STATE.width,
			STATE.height,
		);
		console.timeEnd(`effect:${frame}`);

		introSkew(ctx, frame);
		const buffer = canvas.toBuffer("image/png");
		writeFileSync(`${OUTPUT_DIR}/frame_${frame}.png`, buffer);
		console.log(`Frame ${frame + 1}/${FRAME_COUNT}`);
	}
};
