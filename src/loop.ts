import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createCanvas, loadImage } from "canvas";
import { FRAME_COUNT, OUTPUT_DIR, SONG_PARTS } from "./constants.js";
import { introMask } from "./effects/intro.js";
import { STATE } from "./state/state.js";
import { introSkew } from "./utils/introSkew.js";
import { isOutro } from "./utils/utils.js";

const add = 3653 - SONG_PARTS.OUTRO.start * 24;

const OUTRO_OUTPUT_DIR = "dist/outro_frames";

export const loop = async () => {
	const canvas = createCanvas(STATE.width, STATE.height);
	const ctx = canvas.getContext("2d");

	ctx.imageSmoothingEnabled = false;

	mkdirSync(OUTRO_OUTPUT_DIR, { recursive: true });
	for (let frame = 3620; frame < FRAME_COUNT; frame++) {
		console.time(`frame ${frame}/${FRAME_COUNT}`);

		const image = await loadImage(
			path.join(
				"kecakFrames",
				`frame${frame + 1 + (isOutro(frame) ? add : 0)}.png`,
			),
		);
		ctx.drawImage(image, 0, 0, image.width, image.height);

		ctx.putImageData(
			introMask(frame, ctx.getImageData(0, 0, image.width, image.height)),
			0,
			0,
		);

		introSkew(ctx, frame);
		const buffer = canvas.toBuffer("image/png");
		if (isOutro(frame)) {
			writeFileSync(`${OUTRO_OUTPUT_DIR}/frame_${frame}.png`, buffer);
		}
		writeFileSync(`${OUTPUT_DIR}/frame_${frame}.png`, buffer);
		console.timeEnd(`frame ${frame}/${FRAME_COUNT}`);
	}
};
