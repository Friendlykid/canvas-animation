export const SONG_LENGTH = 138.352948 as const; // in seconds

// VIDEO constants

/**
 * Number of frames per second
 */
export const FRAME_RATE = 12 as const;

export const FRAME_COUNT = Math.floor(FRAME_RATE * SONG_LENGTH);

export const OUTPUT_DIR = "dist/frames";

// Length of each sound that have fixed length in frames
export const KICK_LENGTH = FRAME_RATE / 6; //TODO for 24 fps shorten it to FRAME_RATE / 8
export const SNARE_1_LENGTH = FRAME_RATE / 6;
export const SNARE_2_LENGTH = FRAME_RATE / 2;

export const TICKS_PER_BEAT = 96 as const;

export const BEATS_PER_MINUTE = 170 as const;

export const ZOOM_MAX = 3 as const; // Maximum zoom level
export const ZOOM_MIN = 1 as const; // Minimum zoom level

export const TICKS_PER_FRAME =
	(TICKS_PER_BEAT * (BEATS_PER_MINUTE / 60)) / FRAME_RATE;

export type SongPart = {
	/**
	 * in seconds
	 */
	start: number;
	/**
	 * in seconds
	 */
	end: number;
};

export const SONG_PARTS = {
	INTRO: { start: 0, end: 271 / 12 },
	HEAVY_PART: { start: 271 / 12, end: 816 / 12 },
	SECOND_PART: { start: 816 / 12, end: Number.MAX_VALUE }, // until the end of the song
};
