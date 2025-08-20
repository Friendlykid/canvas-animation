import { readFile } from "node:fs/promises";
import { createCanvas, loadImage } from "canvas";
import Color from "color";
import { parseMidi } from "midi-file";
import { loop } from "./loop.js";
import { setState } from "./state/state.js";
import { highQuantil, lowQuantil, median } from "./utils/computeQuantils.js";
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

	const image = await loadImage("assets/cesta.jpg");
	const canvas = createCanvas(image.width, image.height);
	const ctx = canvas.getContext("2d");
	ctx.drawImage(image, 0, 0, image.width, image.height);
	const imageData = ctx.getImageData(0, 0, image.width, image.height);

	const saturationArray: Uint8ClampedArray<ArrayBufferLike> =
		new Uint8ClampedArray(imageData.data.length / 4);
	for (let i = 0; i < imageData.data.length; i += 4) {
		const color = Color.rgb([
			imageData.data[i],
			imageData.data[i + 1],
			imageData.data[i + 2],
		]);
		const saturation = color.saturationl();
		saturationArray[i / 4] = saturation;
	}

	const lightnessArray: Uint8ClampedArray<ArrayBufferLike> =
		new Uint8ClampedArray(imageData.data.length / 4);
	for (let i = 0; i < imageData.data.length; i += 4) {
		const color = Color.rgb([
			imageData.data[i],
			imageData.data[i + 1],
			imageData.data[i + 2],
		]);
		const lightness = color.lightness();
		lightnessArray[i / 4] = lightness;
	}

	const medianSaturation = median(saturationArray);
	const medianLightness = median(lightnessArray);

	const quantilLowSaturation = lowQuantil(saturationArray);
	const quantilLowLightness = lowQuantil(lightnessArray);

	const quantilHighSaturation = highQuantil(saturationArray);
	const quantilHighLightness = highQuantil(lightnessArray);
	setState({
		kick: parseMidiEvents(kickMidi, 0) as KickEvent[],
		snare: parseMidiEvents(snareMidi, 0),
		bass: parseMidiEvents(bassMidi, 0),
		synth: parseMidiEvents(synthMidi, 0),
		keys: parseMidiEvents(keysMidi, 0),
		originalImageData: imageData.data,
		height: image.height,
		width: image.width,
		medianSaturation,
		medianLightness,
		quantilLowSaturation,
		quantilLowLightness,
		quantilHighSaturation,
		quantilHighLightness,
	});

	console.log("median saturation: ", medianSaturation);
	console.log("median lightness: ", medianLightness);
	console.log("quantil low saturation: ", quantilLowSaturation);
	console.log("quantil low lightness: ", quantilLowLightness);
	console.log("quantil high saturation: ", quantilHighSaturation);
	console.log("quantil high lightness: ", quantilHighLightness);

	ctx.drawImage(image, 0, 0, image.width, image.height);

	loop({
		image,
	});
};

main();
