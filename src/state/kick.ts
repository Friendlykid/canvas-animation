import { KICK_LENGTH } from "../constants.js";
import { STATE } from "./state.js";

export const isKickPlaying = (frame: number): boolean => {
	return (
		(STATE.kick.filter((event) => event.frame + KICK_LENGTH + 1 >= frame)?.[0]
			?.frame ?? Number.MIN_SAFE_INTEGER) <= frame
	);
};
