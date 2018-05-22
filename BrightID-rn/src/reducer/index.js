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
	USER_DATA
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
 * @param connectionsCount Number
 * @param groupsCount Number
 * @param searchParam String
 * @param allConnections List => Map
 */

const initialState = fromJS({
	trustScore: "",
	name: "",
	avatar: "",
	userToken: "",
	connectionsCount: 0,
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
			state.set("trustScore", action.payload);
			break;
		case LOADING_USER:
			state.set("loadingUser", true);
			break;
		case USER_DATA:
			state.set("userAvatar", action.avatarUri);
			state.set("name", action.nameornym);
			state.set("userToken", action.userToken);
			state.set("loadingUser", false);
			break;
		case GROUPS_COUNT:
			state.set("groupsCount", action.payload);
			break;
		case SEARCH_PARAM:
			state.set("searchParam", action.value);
			break;
		case ALL_CONNECTIONS:
			// turn connections array an immutable List of Structs
			// const connections = fromJS(connections);
			state.set("allConnections", action.connections);
			state.set("connectionsCount", action.connections.length);
			break;
		case SAVING_DATA:
			state.set("savingData", true);
			break;
		case SAVE_DATA_SUCCESS:
			// userToken is used for navigation out of onboarding flow
			state.set("userAvatar", action.avatarUri);
			state.set("name", action.nameornym);
			state.set("userToken", action.userToken);
			state.set("savingData", false);
			break;
		default:
			return state;
	}
};

// unnecessary for now, but when the app gets larger, combine reducers here

const reducer = combineReducers({
	main: mainReducer
});

export default reducer;
