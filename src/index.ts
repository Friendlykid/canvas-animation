import { readFile } from "node:fs/promises";
import { createCanvas, loadImage } from "canvas";
import { parseMidi } from "midi-file";
import { loop } from "./loop.js";
import { setState } from "./state/state.js";
import { type KickEvent, parseMidiEvents } from "./utils/parseMidiEvents.js";

const main = async () => {
	const snareFile = await readFile("assets/SNARE.mid");
	const kickFile = await readFile("assets/KICK.mid");
	const bassFile = await readFile("assets/BASS.mid");
	const synthFile = await readFile("assets/SYNTH.mid");
	const keysFile = await readFile("assets/KEYS.mid");

	const snareMidi = parseMidi(snareFile);
	const kickMidi = parseMidi(kickFile);
	const bassMidi = parseMidi(bassFile);
	const synthMidi = parseMidi(synthFile);
	const keysMidi = parseMidi(keysFile);

	const image = await loadImage("assets/stul.jpg");
	const canvas = createCanvas(image.width, image.height);
	const ctx = canvas.getContext("2d");
	ctx.drawImage(image, 0, 0, image.width, image.height);
	const imageData = ctx.getImageData(0, 0, image.width, image.height);
	setState({
		kick: parseMidiEvents(kickMidi, 0) as KickEvent[],
		snare: parseMidiEvents(snareMidi, 0),
		bass: parseMidiEvents(bassMidi, 0),
		synth: parseMidiEvents(synthMidi, 0),
		keys: parseMidiEvents(keysMidi, 0),
		originalImageData: imageData.data,
		height: image.height,
		width: image.width,
	});

	console.log("total length: ", imageData.data.length);
	console.log("total pixels: ", imageData.data.length / 4);
	console.log("byte length: ", imageData.data.byteLength);
	ctx.drawImage(image, 0, 0, image.width, image.height);

	loop({
		image,
	});
};

main();
