//store/index.js
import thunkMiddleware from "redux-thunk";
import { createStore, applyMiddleware } from "redux";
import reducer from "../reducer";

const store = createStore(reducer, applyMiddleware(thunkMiddleware));

export default store;

// TODO Set up async storage middleware to save the redux of the application
