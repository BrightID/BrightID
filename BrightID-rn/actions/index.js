//actions/index.js

export const TRUST_SCORE = "TRUST_SCORE";
export const CONNECTIONS_COUNT = "CONNECTIONS_COUNT";
export const GROUPS_COUNT = "GROUPS_COUNT";
export const NAME = "NAME";
export const AVATAR = "AVATAR";
export const SEARCH_PARAM = "SEARCH_PARAM";

/**
 * Redux boilerplate, pass data through the app
 * Async actions / async functions can be implemented
 *
 * @param type derived from constants
 * @param	payload data passed into the redux reducer
 *
 */

export const trustScore = payload => ({
	type: TRUST_SCORE,
	payload
});

export const connectionsCount = payload => ({
	type: CONNECTIONS_COUNT,
	payload
});

export const groupsCount = payload => ({
	type: GROUPS_COUNT,
	payload
});

export const name = payload => ({
	type: NAME,
	payload
});

export const avatar = payload => ({
	type: AVATAR,
	payload
});

export const searchParam = value => ({
	type: SEARCH_PARAM,
	value
});
