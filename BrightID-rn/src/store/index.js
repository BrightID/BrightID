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

        if (ppKeys.hasOwnProperty("ppk")) {
            dispatch(setPPKeys(ppKeys));
        }
    } catch (err) {
        console.error(err);
    }
};

export const generatePPKeys = () => async dispatch => {

    try {

        ppk = nacl.sign.keyPair();

        axios.post("http://rest.learncode.academy/api/brightid/keys",
            {"publicKey": ppk.publicKey},
            {'Content-Type': 'application/json'})
            .then((response) => {
                if (response === "ok") {
                    dispatch(setPPKeys(ppk));
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
