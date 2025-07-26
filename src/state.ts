export const state: State = {
	sortCycles: 20,
	lightnessMask: 30,
	saturationMask: 10,
	kick: { isPlaying: false, framesLeft: 0 },
	snare: { isPlaying: false, framesLeft: 0 },
	bass: { isPlaying: false },
	synth: { isPlaying: false },
	keys: { isPlaying: false },
};

type InstrumentState<T extends string = ""> = Omit<
	{
		isPlaying: boolean;
		framesLeft?: number;
	},
	T
>;

export type State = {
	sortCycles: number;
	kick?: InstrumentState;
	snare?: InstrumentState;
	bass?: InstrumentState<"framesLeft">;
	synth?: InstrumentState<"framesLeft">;
	keys?: InstrumentState<"framesLeft">;
	lightnessMask: number;
	saturationMask: number;
};
