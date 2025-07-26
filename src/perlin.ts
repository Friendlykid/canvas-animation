import pkg from "noisejs";
import { FRAME_COUNT } from "./constants.js";

const { Noise } = pkg;

const noise = new Noise(10);

export const perlinNoise = (frame: number): number => {
	return noise.perlin2((20 * frame) / FRAME_COUNT, Math.floor(frame / 1600));
};

export const perlinNoise2D = (x: number, y: number): number => {
	return noise.perlin2(x, y);
};
