// import { AsyncStorage } from "react-native";

import { name, mainAvatar, ronPaul } from "./index.js";
export const USER_DATA = "@USER_DATA";

export const saveUserData = userData => async dispatch => {
	try {
		if (
			userData.hasOwnProperty(nameornym) &&
			userData.hasOwnProperty(avatarUri)
		) {
			const saveData = JSON.stringify(userData);
			await AsyncStorage.setItem(USER_DATA, saveData);
		}
	} catch (err) {
		console.warn(err);
	}
};

export const getUserData = () => async dispatch => {
	try {
		// const saveData = JSON.stringify(userData);
		let userData;
		const saveData = await AsyncStorage.getItem(USER_DATA);
		// console.warn(saveData);
		if (saveData !== null) {
			let userData = JSON.parse(saveData);
		}
		if (typeof userData === "object") {
			const { nameornym, avatarUri } = userData;
			dispatch(name(nameornym));
			dispatch(mainAvatar(avatarUri));
		} else {
			// dispatch(name("Ron Paul"));
			// dispatch(ronPaul(require("../static/ron_paul_avatar.jpg")));
		}
	} catch (err) {
		console.warn(err);
	}
};
