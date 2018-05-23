//reducer/index.js
import { combineReducers } from "redux";
// reducer/web3.js

import {
	TRUST_SCORE,
	GROUPS_COUNT,
	SEARCH_PARAM,
	ALL_CONNECTIONS,
	RON_PAUL,
	SAVING_DATA,
	SAVE_DATA_SUCCESS,
	LOADING_USER,
	USER_DATA,
	REMOVE_USER_DATA
} from "../actions";

// immutable js optional, but works really well with redux

import { fromJS } from "immutable";

/**
 * INITIAL STATE
 * structure the state of tha app here
 *
 * @param trustScore String
 * @param	name String
 * @param userAvatar Image
 * @param groupsCount Number
 * @param searchParam String
 * @param allConnections List => Map
 */

const initialState = fromJS({
	trustScore: "",
	name: "",
	avatar: "",
	userToken: "",
	groupsCount: 0,
	searchParam: "",
	allConnections: [{ name: "Rand Paul" }],
	ronPaul: "",
	savingData: false,
	saveDataSuccess: false
});

const mainReducer = (state = initialState, action) => {
	switch (action.type) {
		case TRUST_SCORE:
			return state.set("trustScore", action.payload);
		case LOADING_USER:
			return state.set("loadingUser", true);
		case USER_DATA:
			return state.merge({
				userAvatar: action.avatarUri,
				name: action.nameornym,
				userToken: action.userToken,
				loadingUser: false
			});
		case GROUPS_COUNT:
			return state.set("groupsCount", action.payload);
		case SEARCH_PARAM:
			return state.set("searchParam", action.value);
		case ALL_CONNECTIONS:
			return state.merge({
				allConnections: action.connections
			});
		case SAVING_DATA:
			return state.set("savingData", true);
		case SAVE_DATA_SUCCESS:
			// userToken is used for navigation out of onboarding flow
			return state.merge({
				userAvatar: action.avatarUri,
				name: action.nameornym,
				userToken: action.userToken,
				savingData: false
			});
		case REMOVE_USER_DATA:
			return state.merge({ avatarUri: "", name: "", userToken: "" });
		default:
			return state;
	}
};

// unnecessary for now, but when the app gets larger, combine reducers here

const reducer = combineReducers({
	main: mainReducer
});

export default reducer;
