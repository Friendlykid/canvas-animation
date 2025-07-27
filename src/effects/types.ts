import type { ImageData } from "canvas";

export type ImageEffect = (
	pixelArr: Uint8ClampedArray<ArrayBufferLike>,
	frame: number,
	visibleRegion: { sx: number; sy: number; width: number; height: number },
) => ImageData;
