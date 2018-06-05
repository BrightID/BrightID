//store/index.js
import thunkMiddleware from "redux-thunk";
import {createStore, applyMiddleware} from "redux";
import reducer from "../reducer";
import {setPPKeys} from "../actions/index";
import nacl from "tweetnacl"
import axios from "axios"

const store = createStore(reducer, applyMiddleware(thunkMiddleware));

export const setupPPKeys = ppKeys => async dispatch => {

    try {

        if (ppKeys.hasOwnProperty("key1") && ppKeys.hasOwnProperty("key2")) {
            dispatch(setPPKeys(ppKeys));
        }
    } catch (err) {
        console.error(err);
    }
};

export const generatePPKeys = () => async dispatch => {

    try {

        key1 = nacl.box.keyPair();
        key2 = nacl.box.keyPair();

        axios.post("http://rest.learncode.academy/api/brightid/keys",
            {"key1": key1.publicKey, "key2": key2.publicKey},
            {'Content-Type': 'application/json'})
            .then((response) => {
                if (response === "ok") {
                    dispatch(setPPKeys({"key1": key1, "key2": key2}));
                }
            })
            .catch((err) => {
                //Proper error handling
                console.error(err);
            })

    } catch (err) {
        console.error(err);
    }
};

export default store;

// TODO Set up async storage middleware to save the redux of the application
