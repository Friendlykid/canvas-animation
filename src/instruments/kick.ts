import { KICK_LENGHT } from "../constants.js";
import type { KickEvent } from "../parseMidiEvents.js";

export const isKickPlaying = (kick: KickEvent[], frame: number): boolean => {
	return (
		(kick.filter((event) => event.frame + KICK_LENGHT + 1 >= frame)?.[0]
			?.frame ?? Number.MIN_SAFE_INTEGER) <= frame
	);
};
