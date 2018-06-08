//store/index.js
import thunkMiddleware from "redux-thunk";
import {applyMiddleware, createStore} from "redux";
import reducer from "../reducer";
import {setPPKeys} from "../actions/index";
import nacl from "tweetnacl"

const store = createStore(reducer, applyMiddleware(thunkMiddleware));

export const setupPPKeys = ppKeys => async dispatch => {

    try {

        if (ppKeys.hasOwnProperty("publicKey") &&
            ppKeys.hasOwnProperty("privateKey")) {
            dispatch(setPPKeys({"connectionPPKeys": ppKeys}));
        }
    } catch (err) {
        console.error(err);
    }

};

export const generatePPKeys = () => async dispatch => {

    try {

        dispatch(setPPKeys({"connectionPKeys": nacl.sign.keyPair()}));

    } catch (err) {
        console.error(err);
    }
};

export default store;

// TODO Set up async storage middleware to save the redux of the application
