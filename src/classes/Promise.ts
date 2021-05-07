/**
 * Promise that won't crash the app if its not handled
 */
export class Promise<T = void, C = void> {
	// "pending": waiting for resolve or reject. "resolved" resolve was called. "rejected" was called. "ended" thenFunction or catchFunction was called.
	public state: "pending" | "resolved" | "rejected" | "ended";
	private resolveValue?: T;
	private rejectValue?: C;

	private thenFunction?: (value: T) => void;
	private catchFunction?: (value: C) => void;

	constructor(
		callback: (
			resolve: (value: T) => void,
			reject: (value: C) => void,
		) => any
	) {
		this.state = "pending";

		callback(
			(value) => {
				if(this.state = "pending") {
					this.state = "resolved";
					this.resolveValue = value;

					if(this.thenFunction) {
						this.thenFunction(this.resolveValue);
						this.state = "ended";
					}
				}
			},
			(value) => {
				if(this.state = "pending") {
					this.state = "rejected";
					this.rejectValue = value;

					if(this.catchFunction) {
						this.catchFunction(this.rejectValue);
						this.state = "ended";
					}
				}
			},
		);

		return this
	}

	public then = (callback: (value: T) => void) => {
		this.thenFunction = callback

		if(this.state === "resolved") {
			this.thenFunction(<T>this.resolveValue);
			this.state = "ended";
		}

		return this;
	}

	public catch = (callback: (value: C) => void) => {
		this.catchFunction = callback

		if(this.state === "rejected") {
			this.catchFunction(<C>this.rejectValue);
			this.state = "ended";
		}

		return this;
	}

	static race = (promises: Promise<any, any>[]): Promise<any, any> => {
		return new Promise((resolve, reject) => {
			promises.forEach(promise => {
				promise
					.then(value => resolve(value))
					.catch(value => reject(value));
			})
		})
	}
}