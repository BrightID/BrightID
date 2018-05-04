//reducer/index.js
import { combineReducers } from "redux";
// reducer/web3.js

import {
	TRUST_SCORE,
	CONNECTIONS_COUNT,
	GROUPS_COUNT,
	AVATAR,
	NAME,
	SEARCH_PARAM
} from "../actions";

// immutable js optional, but works really well with redux

import { fromJS } from "immutable";

/**
 * INITIAL STATE
 * structure the state of tha app here
 *
 * @param trustScore String
 * @param	name String
 * @param avatar Image
 * @param connectionsCount Number
 * @param groupsCount Number
 * @param searchParam String
 *
 */

const initialState = fromJS({
	trustScore: "",
	name: "",
	avatar: "",
	connectionsCount: 0,
	groupsCount: 0,
	searchParam: ""
});

const mainReducer = (state = initialState, action) => {
	switch (action.type) {
		case TRUST_SCORE:
			return state.set("trustScore", action.payload);
		case NAME:
			return state.set("name", action.payload);
		case AVATAR:
			return state.set("avatar", action.payload);
		case CONNECTIONS_COUNT:
			return state.set("connectionsCount", action.payload);
		case GROUPS_COUNT:
			return state.set("groupsCount", action.payload);
		case SEARCH_PARAM:
			return state.set("searchParam", action.value);
		default:
			return state;
	}
};

// unnecessary for now, but when the app gets larger, combine reducers here

const reducer = combineReducers({
	main: mainReducer
});

export default reducer;
