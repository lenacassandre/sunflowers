import io from "socket.io-client";
import log from '../utils/log'

import { Promise } from '../classes/Promise'

import { SocketError } from '../types'

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

	public emit = <ResponseType = {}, ErrorType = {}>(action: string, data?: any, sendWithToken?: boolean): Promise<ResponseType, SocketError<ErrorType>> => {
		const requestId = log.request(action, action, data);
		let state: {resolved: boolean} = {resolved : false};

		//
		const socketPromise = new Promise<ResponseType, SocketError<ErrorType>>((resolve, reject) => {
			if (!this.io && !state.resolved) {
				state.resolved = true;
				log.response(action, requestId, {}, false, "No socket connection.");
				reject(<SocketError<ErrorType>>{error:"No socket connection."});
			} else {
				this.io.emit(action, sendWithToken ? this.sendWithToken(data) : data, (response: ResponseType | SocketError<ErrorType>) => {
					if(!state.resolved) {
						state.resolved = true;

						if ("error" in response) {
							log.response(action, requestId, response, false, response.error);;
							reject(response);
						} else {
							log.response(action, requestId, response, true);
							resolve(<ResponseType>response);
						}
					}
				});
			}
		})

		// Timeout after 10 seconds
		const timeoutPromise = new Promise<ResponseType, SocketError<ErrorType>>((_, reject) => {
			setTimeout(() => {
				if(!state.resolved) {
					state.resolved = true;
					log.response(action, requestId, "Error: Request timed out.", false);
					reject(<SocketError<ErrorType>>{error: "Error: Request timed out."})
				}
			}, 10 * 1000);
		})

		return Promise.race([socketPromise, timeoutPromise])
	}

	public on = <ResponseType = {}>(action: string, callback: (data: ResponseType) => void) => {
		this.io.on(action, callback);
	}
}