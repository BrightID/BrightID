// @flow

import { AsyncStorage } from "react-native";
import {
	savingData,
	saveDataSuccess,
	loadingUser,
	userData,
	handleError
} from "./index.js";

export const getUserData = () => async dispatch => {
	// this action will determine whether or not to naviage to the Signup or homescreen
	// this action will be called inside of ./setUpDefault.js
	try {
		dispatch(loadingUser());
		// const saveData = JSON.stringify(userData);
		// var userToken, userName, userAvata;
		const userData = await AsyncStorage.getItem("userData");
		const { userToken, nameornym, avatarUri } = JSON.parse(userData);

		console.warn(userData);

		if (userToken !== null && nameornym !== null && avatarUri !== null) {
			dispatch(userData({ userToken, nameornym, avatarUri }));
		} else {
			dispatch(handleError("Missing User data"));
			if (userToken === null) {
				dispatch(handleError("Missing User Token"));
			}
			if (nameornym === null) {
				dispatch(handleError("Missing User Name or Nym"));
			}
			if (avatarUri === null) {
				dispatch(handleError("Missing User Avatar Uri"));
			}
		}
	} catch (err) {
		console.warn(err);
	}
};

// saves the user data after 'create my brightID' is clicked
// during the onboard flow

export const saveUserData = (
	nameornym: String,
	avatarUri: String
) => async dispatch => {
	try {
		// console.warn("here");
		dispatch(savingData());
		// save the users BrightID USER_TOKEN
		// TODO connect to backend API before storing locally
		const userToken = "user_token";
		// console.warn(nameornym);
		// console.warn(avatarUri);
		const userData = {
			userToken: "user_token",
			nameornym,
			avatarUri
		};

		await AsyncStorage.setItem("userData", JSON.stringify(userData));
		// if there are no errors... navigate to the homepage
		dispatch(saveDataSuccess({ userToken, nameornym, avatarUri }));
	} catch (err) {
		console.warn(err);
	}
};
