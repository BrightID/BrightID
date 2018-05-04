import {
	trustScore,
	connectionsCount,
	groupsCount,
	name,
	mainAvatar
} from "./index";

/**
 * Sets the app up with dummy data
 * based on the project's spec found in the wiki
 *
 * This function is called in App.js
 */

export const setUpDefault = () => async dispatch => {
	// async is unncessary here, but this is a useful template for handling the API
	try {
		dispatch(trustScore("99.9"));
		dispatch(connectionsCount(222));
		dispatch(groupsCount(4));
		dispatch(name("Ron Paul"));
		dispatch(mainAvatar(require("../ron_paul_avatar.jpg")));
	} catch (err) {
		console.log(err);
	}
};
