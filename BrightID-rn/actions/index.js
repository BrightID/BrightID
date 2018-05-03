//actions/index.js

export const TRUST_SCORE = "TRUST_SCORE";
export const CONNECTIONS = "CONNECTIONS";
export const GROUPS = "GROUPS";
export const NAME = "NAME";
export const AVATAR = "AVATAR";

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

export const connections = payload => ({
	type: CONNECTIONS,
	payload
});

export const groups = payload => ({
	type: GROUPS,
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
