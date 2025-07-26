import { readFile } from "node:fs/promises";
import { createCanvas, loadImage } from "canvas";
import { parseMidi } from "midi-file";
import { KICK_LENGHT } from "./constants.js";
import { loop } from "./loop.js";
import { type KickEvent, parseMidiEvents } from "./parseMidiEvents.js";

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

	const parsedMidi = {
		snareEvents: parseMidiEvents(snareMidi, 0),
		kickEvents: parseMidiEvents(kickMidi, KICK_LENGHT) as KickEvent[], // we dont need noteOff event for kick
		bassEvents: parseMidiEvents(bassMidi),
		synthEvents: parseMidiEvents(synthMidi),
		keysEvents: parseMidiEvents(keysMidi),
	};

	const image = await loadImage("assets/stul.jpg");
	const canvas = createCanvas(image.width, image.height);
	const ctx = canvas.getContext("2d");
	ctx.drawImage(image, 0, 0, image.width, image.height);
	const imageData = ctx.getImageData(0, 0, image.width, image.height);
	console.log("total length: ", imageData.data.length);
	console.log("total pixels: ", imageData.data.length / 4);
	console.log("byte length: ", imageData.data.byteLength);
	loop({
		image,
		bass: parsedMidi.bassEvents,
		keys: parsedMidi.keysEvents,
		kick: parsedMidi.kickEvents,
		snare: parsedMidi.snareEvents,
		synth: parsedMidi.synthEvents,
	});
};

main();
