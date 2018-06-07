//store/index.js
import thunkMiddleware from "redux-thunk";
import {applyMiddleware, createStore} from "redux";
import reducer from "../reducer";
import {setConnectionPPKeys} from "../actions/index";
import nacl from "tweetnacl"

const store = createStore(reducer, applyMiddleware(thunkMiddleware));

export const setupPPKeys = connectionPPKeys => async dispatch => {

    try {

        if (connectionPPKeys.hasOwnProperty("ppk")) {
            dispatch(setConnectionPPKeys(connectionPPKeys));
        }
    } catch (err) {
        console.error(err);
    }

};

export const generatePPKeys = () => async dispatch => {

    try {

        dispatch(setConnectionPPKeys(nacl.sign.keyPair()));

    } catch (err) {
        console.error(err);
    }
};

export default store;

// TODO Set up async storage middleware to save the redux of the application
