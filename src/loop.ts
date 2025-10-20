import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createCanvas, loadImage } from "canvas";
import { FRAME_COUNT, OUTPUT_DIR } from "./constants.js";
import { introMask } from "./effects/intro.js";
import { STATE } from "./state/state.js";
import { introSkew } from "./utils/introSkew.js";
import { isOutro } from "./utils/utils.js";

const add = 3653 - 3624;

export const loop = async () => {
	const canvas = createCanvas(STATE.width, STATE.height);
	const ctx = canvas.getContext("2d");

	ctx.imageSmoothingEnabled = false;

	mkdirSync(OUTPUT_DIR, { recursive: true });
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
		writeFileSync(`${OUTPUT_DIR}/frame_${frame}.png`, buffer);
		console.timeEnd(`frame ${frame}/${FRAME_COUNT}`);
	}
};
