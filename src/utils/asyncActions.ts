export default class asyncAction  {
	DO: string;
	DONE: string;
	FAIL: string;

	constructor(action: string) {
		this.DO = `${action}_DO`;
		this.DONE = `${action}_DONE`;
		this.FAIL = `${action}_FAIL`;
	}
}
