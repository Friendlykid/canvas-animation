import type { ImageData } from "canvas";

export type ImageEffect = (
	frame: number,
	visibleRegion: { sx: number; sy: number; width: number; height: number },
) => ImageData;
