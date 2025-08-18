/**
 *
 * @param value between -1 and 1
 * @param min min value
 * @param max max value
 */
export const perlinToRange = (
	value: number,
	min: number,
	max: number,
): number => {
	return ((value + 1) / 2) * (max - min) + min;
};
