import { mkdir, writeFile } from "node:fs/promises";
import { createCanvas, type Image } from "canvas";
import { FRAME_COUNT, OUTPUT_DIR, ZOOM_MAX, ZOOM_MIN } from "./constants.js";
import { alterImage } from "./effects/alterImage.js";
import { isKickPlaying } from "./state/kick.js";
import { STATE } from "./state/state.js";
import { introSkew } from "./utils/introSkew.js";
import {
	addBassLabel,
	addFrameNumber,
	computeCoordinates,
} from "./utils/utils.js";

const BATCH_SIZE = 10; // Number of frames to process in each batch

// Function to process a single frame
const processFrame = async (image: Image, frame: number): Promise<void> => {
	const canvas = createCanvas(STATE.width, STATE.height);
	const ctx = canvas.getContext("2d");

	const progress = frame / FRAME_COUNT;
	const currentZoom = ZOOM_MAX - progress * (ZOOM_MAX - ZOOM_MIN);
	//const currentZoom = 1; // for testing

	const drawwidth = image.width / currentZoom;
	const drawheight = image.height / currentZoom;

	const { sx, sy } = computeCoordinates(
		progress,
		drawheight,
		drawwidth,
		isKickPlaying(frame),
	);

	ctx.clearRect(0, 0, STATE.width, STATE.height);

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

	introSkew(ctx, frame);

	addFrameNumber(ctx, frame, STATE.height);
	addBassLabel(ctx, frame, STATE.height);

	const buffer = ctx.canvas.toBuffer("image/png");
	console.time(`write_frame_${frame}`);
	await writeFile(`${OUTPUT_DIR}/frame_${frame}.png`, buffer);
	console.timeEnd(`write_frame_${frame}`);
};

export const loop = async ({ image }: { image: Image }) => {
	// Create the output directory if it doesn't exist
	await mkdir(OUTPUT_DIR, { recursive: true });
	// 950 for synth part, 1350 for keys part, 1626 for outro
	const startIndex = 0;
	const totalBatches = Math.ceil((FRAME_COUNT - startIndex) / BATCH_SIZE);

	console.log(
		`Starting processing frames from ${startIndex} to ${FRAME_COUNT} frames in ${totalBatches} batches of ${BATCH_SIZE}`,
	);

	// Process batches sequentially, but frames within each batch in parallel
	for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
		console.time(`batch_${batchIndex}`);

		// Calculate frame indexes for this batch
		const startFrame = startIndex + batchIndex * BATCH_SIZE;
		const endFrame = Math.min(startFrame + BATCH_SIZE, FRAME_COUNT);
		const batchFrames = Array.from(
			{ length: endFrame - startFrame },
			(_, i) => startFrame + i,
		).filter((frame) => frame < FRAME_COUNT);

		console.log(
			`Processing batch ${batchIndex + 1}/${totalBatches} (frames ${startFrame}-${endFrame - 1})`,
		);

		// Process all frames in this batch concurrently
		const batchPromises = batchFrames.map((frame) => {
			return processFrame(image, frame);
		});
		await Promise.all(batchPromises);

		console.log(`Completed batch ${batchIndex + 1}/${totalBatches}`);
		console.timeEnd(`batch_${batchIndex}`);
	}
};
