// Composants
export * from './components'
export * from './core'

//Handlers
export * from './handlers'

// Utils
import asyncForEach from "./utils/asyncForEach";
import download from "./utils/download";
import asyncActions from "./utils/asyncActions";
import forDateToDate from "./utils/forDateToDate";
import formatNumber from "./utils/formatNumber";
import generateNewID from "./utils/generateNewID";
import log from "./utils/log";
import sendWithToken from "./utils/sendWithToken";
import stringToDate from "./utils/stringToDate";
import timeoutPromise from "./utils/timeoutPromise";
import randomId from "./utils/randomId";
import { search } from "./utils/search";

import Document from "./classes/document.class"
import Repository from "./classes/repository.class"
import User from "./classes/user.class"
import {Promise} from "./classes/Promise"

// Types
export * from "./types";

import "./oldReset.scss";
import "./oldStyle.scss";
import "./oldTheme.scss";

////////////////////////////////////////////////////////////////////////

export {
	// Composants
	// Handlers
	//Utils
	asyncForEach,
	download,
	asyncActions,
	forDateToDate,
	formatNumber,
	generateNewID,
	log,
	sendWithToken,
	stringToDate,
	timeoutPromise,
	randomId,

	search,

	// Classes
	Repository,
	Document,
	User,
	Promise,
};
