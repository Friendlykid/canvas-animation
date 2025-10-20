import path from "node:path";
import { loadImage } from "canvas";
import { loop } from "./loop.js";
import { setState } from "./state/state.js";

const main = async () => {
	const image = await loadImage(path.join("kecakFrames", `frame1.png`));

	setState({ height: image.height, width: image.width });
	await loop();
};

main();
