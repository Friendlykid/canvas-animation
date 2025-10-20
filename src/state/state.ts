/**
 * State that is set up at the beggining of the animation and contains all the necessary data
 * to render the animation frames.
 */
export const STATE: State = {
	width: 0,
	height: 0,
};

export const setState = (newState: Partial<State>) => {
	Object.assign(STATE, newState);
};

export type State = {
	width: number;
	height: number;
};
