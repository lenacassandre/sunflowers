import log from "./log";

const message = "Request timed out";

export default function promiseWithTimeout(promise: Promise<any>, timeout: number, callback?: (message: string) => void): Promise<any> {
	const timeoutPromise = new Promise((_resolve, reject) => {
		setTimeout(() => {
			if(callback) {
				callback(message)
			}

			reject(message);
		}, timeout * 1000);
	});

	return Promise.race([promise, timeoutPromise]);
}
