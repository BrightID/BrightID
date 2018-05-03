import { trustScore, connections, groups, name, avatar } from "./index";

export const setUpDefault = () => async dispatch => {
	// async is unncessary here, but this is a useful template for handling the API
	try {
		dispatch(trustScore("99.9"));
		dispatch(connections(222));
		dispatch(groups(4));
		dispatch(name("Ron Paul"));
		dispatch(avatar(require("../ron_paul_avatar.jpg")));
	} catch (err) {
		console.log(err);
	}
};
