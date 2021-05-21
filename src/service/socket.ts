import io from "socket.io-client";
import log from '../utils/log'

import { Promise } from '../classes/Promise'

import { SocketError } from '../types'
import axios from "axios";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default class Socket {
	socketURL: string;
	httpURL: string;
	io: SocketIOClient.Socket

	constructor(socketURL: string, httpURL?: string) {
		this.socketURL = socketURL;
		this.httpURL = httpURL || socketURL;

		console.log("Starting Socket service :", socketURL)
		this.io = io.connect(socketURL)
		console.log("IO CONNECT", this.io)
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////

	private sendWithToken(object?: any) {
		if (typeof object === "object") {
			return { ...object, token: localStorage.getItem("token") };
		} else {
			return { token: localStorage.getItem("token") };
		}
	}

	/**
	 *	if no domain has been given, add this.url
	 */
	private validURL(route: string) {
		const matches = route.match(/\.|\//g);

		if(matches && matches[0] && matches[0] === ".") {
			return route;
		}
		else if(route.length > 0) {
			const urlLastChar = this.httpURL[this.httpURL.length - 1];
			const routeFirstChar = route[route.length - 1];

			const domain = urlLastChar === "/" ? this.httpURL.slice(0, this.httpURL.length - 1) : this.httpURL;
			const cleanRoute = routeFirstChar === "/" ? route.slice(1, route.length) : route;

			return `${domain}/${cleanRoute}`;
		} else {
			return route
		}
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// SOCKET ///////////////////////////////////////////////////////////////////////////////////////////////////

	public emit = <ResponseType = {}, ErrorType = {}>(action: string, data?: any, sendWithToken?: boolean): Promise<ResponseType, SocketError<ErrorType>> => {
		const requestId = log.request(`Socket: ${action}`, action, data);
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
							log.response(`Socket: ${action}`, requestId, response, false, response.error);;
							reject(response);
						} else {
							log.response(`Socket: ${action}`, requestId, response, true);
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

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// HTTP /////////////////////////////////////////////////////////////////////////////////////////////////////

	public get = <ResponseType = {}>(route: string, body?: any) => {
		const requestId = log.request(`HTTP/GET: ${route}`, route, body);

		return new Promise<typeof body, ResponseType>((resolve, reject) => {
			axios.get<typeof body, ResponseType>(this.validURL(route), this.sendWithToken(body))
				.then((response) => {
					log.response(`HTTP/GET: ${route}`, requestId, response, true);
					resolve(response);
				})
				.catch((response) => {
					log.response(`HTTP/GET: ${route}`, requestId, response, false, response.error);
					reject(response);
				})
		})
	}

	public post = <ResponseType = {}>(route: string, body?: any, head?: any) => {
		const requestId = log.request(`HTTP/POST: ${route}`, route, body);

		return new Promise<typeof body, ResponseType>((resolve, reject) => {
			axios.post<typeof body, ResponseType>(this.validURL(route), this.sendWithToken(body), head)
				.then((response) => {
					log.response(`HTTP/POST: ${route}`, requestId, response, true);
					resolve(response);
				})
				.catch((response) => {
					log.response(`HTTP/POST: ${route}`, requestId, response, false, response.error);
					reject(response);
				})
		});
	}
}