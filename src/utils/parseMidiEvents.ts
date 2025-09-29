import type { MidiData, MidiNoteOffEvent, MidiNoteOnEvent } from "midi-file";
import { TICKS_PER_FRAME } from "../constants.js";

type BaseEventProps = {
	frame: number;
	id: number;
};

export type MidiEvent = (MidiNoteOnEvent | MidiNoteOffEvent) & BaseEventProps;

export type KickEvent = MidiNoteOnEvent & BaseEventProps;

/**
 *
 * @param midiData
 * @param length
 * @returns array of parsed MIDI events that contain on what frame they should start and on what they should end
 */
export const parseMidiEvents = (midiData: MidiData, frameLength?: number) => {
	const events = midiData.tracks.flat();
	let frameOffset = 0;
	for (let i = 0; i < events.length; i++) {
		const event = events[i];
		frameOffset += event.deltaTime / TICKS_PER_FRAME;
		events[i] = {
			...event,
			frame: Math.round(frameOffset),
		} as MidiEvent;
	}

	return events
		.filter(
			(event): event is MidiNoteOnEvent | MidiNoteOffEvent =>
				event.type === "noteOn" || (!frameLength && event.type === "noteOff"),
		)
		.map((event, i) => ({ ...event, id: i })) as MidiEvent[];
};
