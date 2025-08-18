const asc = (arr: Uint8ClampedArray<ArrayBufferLike>) =>
	arr.sort((a, b) => a - b);

const sum = (arr: Uint8ClampedArray<ArrayBufferLike>) =>
	arr.reduce((a, b) => a + b, 0);

const mean = (arr: Uint8ClampedArray<ArrayBufferLike>) => sum(arr) / arr.length;

// sample standard deviation
export const std = (arr: Uint8ClampedArray<ArrayBufferLike>) => {
	const mu = mean(arr);
	const diffArr = arr.map((a) => (a - mu) ** 2);
	return Math.sqrt(sum(diffArr) / (arr.length - 1));
};

const quantile = (arr: Uint8ClampedArray<ArrayBufferLike>, q: number) => {
	const sorted = asc(arr);
	const pos = (sorted.length - 1) * q;
	const base = Math.floor(pos);
	const rest = pos - base;
	if (sorted[base + 1] !== undefined) {
		return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
	} else {
		return sorted[base];
	}
};

export const lowQuantil = (arr: Uint8ClampedArray<ArrayBufferLike>) =>
	quantile(arr, 0.1);

export const highQuantil = (arr: Uint8ClampedArray<ArrayBufferLike>) =>
	quantile(arr, 0.9);
export const median = (arr: Uint8ClampedArray<ArrayBufferLike>) =>
	quantile(arr, 0.5);
