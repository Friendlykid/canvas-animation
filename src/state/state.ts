import type { KickEvent, MidiEvent } from "../utils/parseMidiEvents.js";
/**
 * State that is set up at the beggining of the animation and contains all the necessary data
 * to render the animation frames.
 */
export const STATE: State = {
	originalImageData: new Uint8ClampedArray(0),
	kick: [],
	snare: [],
	bass: [],
	synth: [],
	keys: [],
	width: 0,
	height: 0,
	medianSaturation: 0,
	medianLightness: 0,
	quantilLowSaturation: 0,
	quantilHighSaturation: 0,
	quantilLowLightness: 0,
	quantilHighLightness: 0,
};

export const setState = (newState: Partial<State>) => {
	Object.assign(STATE, newState);
};

export type State = {
	originalImageData: Uint8ClampedArray<ArrayBufferLike>;
	kick: KickEvent[];
	snare: MidiEvent[];
	bass: MidiEvent[];
	synth: MidiEvent[];
	keys: MidiEvent[];
	width: number;
	height: number;
	medianSaturation: number;
	medianLightness: number;
	quantilLowSaturation: number;
	quantilHighSaturation: number;
	quantilLowLightness: number;
	quantilHighLightness: number;
};

type InstrumentKey = {
	[K in keyof State]: State[K] extends (MidiEvent | KickEvent)[] ? K : never;
}[keyof State];

export const getCurrentNote = (instrument: InstrumentKey, frame: number) => {
	const events = STATE[instrument];

	// For polyphonic instruments, find all currently playing notes
	const playingNotes: Array<{
		noteNumber: number;
		startFrame: number;
		endFrame: number;
		duration: number;
	}> = [];

	// Group events by note number to track note on/off pairs
	const noteGroups = new Map<number, MidiEvent[]>();

	for (const event of events) {
		const existingEvents = noteGroups.get(event.noteNumber);
		if (existingEvents) {
			existingEvents.push(event);
		} else {
			noteGroups.set(event.noteNumber, [event]);
		}
	}

	// For each note, find pairs and check if playing at current frame
	for (const [noteNumber, noteEvents] of noteGroups) {
		const sortedEvents = noteEvents.sort((a, b) => a.frame - b.frame);

		for (let i = 0; i < sortedEvents.length; i++) {
			const event = sortedEvents[i];

			if (event.type === "noteOn" && event.velocity > 0) {
				// Find the corresponding noteOff event
				const noteOffEvent = sortedEvents
					.slice(i + 1)
					.find(
						(e) =>
							e.type === "noteOff" || (e.type === "noteOn" && e.velocity === 0),
					);

				const startFrame = event.frame;
				const endFrame = noteOffEvent ? noteOffEvent.frame : frame + 1; // If no noteOff, assume it ends after current frame

				// Check if this note is playing at the current frame
				if (startFrame <= frame && frame < endFrame) {
					playingNotes.push({
						noteNumber,
						startFrame,
						endFrame,
						duration: endFrame - startFrame,
					});
				}
			}
		}
	}

	// Return the longest playing note, or null if no notes are playing
	if (playingNotes.length === 0) {
		return null;
	}

	const longestNote = playingNotes.reduce((longest, current) =>
		current.duration > longest.duration ? current : longest,
	);

	return {
		noteNumber: longestNote.noteNumber,
		startFrame: longestNote.startFrame,
		endFrame: longestNote.endFrame,
		progress: (frame - longestNote.startFrame) / longestNote.duration,
	};
};

export const getNotes = (instrument: InstrumentKey, frame: number) => {
	const events = STATE[instrument];

	// For polyphonic instruments, find all currently playing notes
	const playingNotes: Array<{
		noteNumber: number;
		startFrame: number;
		endFrame: number;
		duration: number;
	}> = [];

	// Group events by note number to track note on/off pairs
	const noteGroups = new Map<number, MidiEvent[]>();

	for (const event of events) {
		const existingEvents = noteGroups.get(event.noteNumber);
		if (existingEvents) {
			existingEvents.push(event);
		} else {
			noteGroups.set(event.noteNumber, [event]);
		}
	}

	// For each note, find pairs and check if playing at current frame
	for (const [noteNumber, noteEvents] of noteGroups) {
		const sortedEvents = noteEvents.sort((a, b) => a.frame - b.frame);

		for (let i = 0; i < sortedEvents.length; i++) {
			const event = sortedEvents[i];

			if (event.type === "noteOn" && event.velocity > 0) {
				// Find the corresponding noteOff event
				const noteOffEvent = sortedEvents
					.slice(i + 1)
					.find(
						(e) =>
							e.type === "noteOff" || (e.type === "noteOn" && e.velocity === 0),
					);

				const startFrame = event.frame;
				const endFrame = noteOffEvent ? noteOffEvent.frame : frame + 1; // If no noteOff, assume it ends after current frame

				// Check if this note is playing at the current frame
				if (startFrame <= frame && frame < endFrame) {
					playingNotes.push({
						noteNumber,
						startFrame,
						endFrame,
						duration: endFrame - startFrame,
					});
				}
			}
		}
	}

	// Return the longest playing note, or null if no notes are playing
	if (playingNotes.length === 0) {
		return null;
	}

	return playingNotes.map((note) => ({
		...note,
		progress: (frame - note.startFrame) / note.duration,
	}));
};
