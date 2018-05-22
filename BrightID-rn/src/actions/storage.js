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
		const userToken = await AsyncStorage.getItem("@USER_TOKEN:brighId");
		const nameornym = await AsyncStorage.getItem("@USER_NAME:nameornym");
		const avatarUri = await AsyncStorage.getItem("@USER_AVATAR:avatarUri");
		// console.warn(saveData);
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
		console.warn("here");
		dispatch(savingData());
		// save the users BrightID USER_TOKEN
		// TODO connect to backend API before storing locally
		const userToken = "user_token";
		console.warn(nameornym);
		console.warn(avatarUri);
		await AsyncStorage.setItem("@USER_TOKEN:brighId", userToken);
		// save the user's nameornym
		await AsyncStorage.setItem("@USER_NAME:nameornym", nameornym);
		// save the user's avatar uri
		await AsyncStorage.setItem("@USER_AVATAR:avatarUri", avatarUri);
		// if there are no errors... navigate to the homepage
		dispatch(saveDataSuccess({ userToken, nameornym, avatarUri }));
	} catch (err) {
		console.warn(err);
	}
};
