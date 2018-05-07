import {
	trustScore,
	connectionsCount,
	groupsCount,
	name,
	mainAvatar,
	allConnections
} from "./index";

import { fromJS } from "immutable";
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
		dispatch(
			allConnections(
				fromJS([
					{ name: "friend1" },
					{ name: "friend3" },
					{ name: "friend2" },
					{ name: "friend4" },
					{ name: "friend5" },
					{ name: "friend7" },
					{ name: "friend6" },
					{ name: "friend9" },
					{ name: "friend8" }
				])
			)
		);
	} catch (err) {
		console.log(err);
	}
};
