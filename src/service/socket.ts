import io from "socket.io-client";
import log from '../utils/log'


export default class Socket {
	url: string;
	io: SocketIOClient.Socket

	constructor(url: string) {
		this.url = url;

		console.log("Starting Socket service :", url)
		this.io = io.connect(url)
		console.log("IO CONNECT", this.io)
	}

	private sendWithToken(object: any) {
		if (typeof object === "object") {
			return { ...object, token: localStorage.getItem("token") };
		} else {
			return { token: localStorage.getItem("token") };
		}
	}

	public emit = <ResponseType = {}>(action: string, data?: any, sendWithToken?: boolean): Promise<ResponseType> => {
		const requestId = log.request(action, action, data);
		let state: {current: boolean} = {current : false};

		//
		const socketPromise = new Promise<ResponseType>((resolve, reject) => {
			if (!this.io && !state.current) {
				state.current = true;
				log.response(action, requestId, {}, false, "No socket connection.");
				reject("No socket connection.");
			} else {
				this.io.emit(action, sendWithToken ? this.sendWithToken(data) : data, (response: any) => {
					if(!state.current) {
						state.current = true;

						if (response.error) {
							log.response(action, requestId, response, false, response.error);;
							reject(response);
						} else {
							log.response(action, requestId, response, true);
							resolve(response);
						}
					}
				});
			}
		})

		// Timeout after 10 seconds
		const timeoutPromise = new Promise<ResponseType>((_, reject) => {
			setTimeout(() => {
				if(!state.current) {
					state.current = true;
					log.response(action, requestId, "Error: Request timed out.", false);
					reject("Error: Request timed out.")
				}
			}, 10 * 1000);
		})

		return Promise.race([socketPromise, timeoutPromise])
	}

	public on = <ResponseType = {}>(action: string, callback: (data: ResponseType) => void) => {
		this.io.on(action, callback);
	}
}