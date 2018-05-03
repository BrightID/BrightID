//reducer/index.js
import { combineReducers } from "redux";
// reducer/web3.js

import { TRUST_SCORE, CONNECTIONS, GROUPS, AVATAR, NAME } from "../actions";

// immutable js optional, but works really well with redux

import { fromJS } from "immutable";

/**
 * INITIAL STATE
 * structure the state of tha app here
 *
 * @param trustScore String
 * @param	name String
 * @param avatar Image
 * @param connections Number
 * @param groups Number
 *
 */

const initialState = fromJS({
	trustScore: "",
	name: "",
	avatar: "",
	connections: 0,
	groups: 0
});

const mainReducer = (state = initialState, action) => {
	switch (action.type) {
		case TRUST_SCORE:
			return state.set("trustScore", action.payload);
		case NAME:
			return state.set("name", action.payload);
		case AVATAR:
			return state.set("avatar", action.payload);
		case CONNECTIONS:
			return state.set("connections", action.payload);
		case GROUPS:
			return state.set("groups", action.payload);
		default:
			return state;
	}
};

// unnecessary for now, but when the app gets larger, combine reducers here

const reducer = combineReducers({
	main: mainReducer
});

export default reducer;
