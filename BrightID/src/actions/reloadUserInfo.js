// @flow

import nacl from 'tweetnacl';
import { userTrustScore, setGroupsCount, setUserData } from './index';
import api from '../Api/BrightIdApi';
import {setCurrentGroups, setEligibleGroups} from "./index";

/**
 * Sets the app up with dummy data
 * based on the project's spec found in the wiki
 * Using https://mockaroo.com/ to mock data
 *
 * This function is called in App.js
 */

export default reloadUserInfo = () => async (
    dispatch: () => null,
    getState: () => {},
) => {
    // async is unncessary here, but this is a useful template for handling the API
    try {
        let {publicKey} = getState().main;
        let result = await api.getUserInfo(publicKey);
        if(result && result.data && result.data.eligibleGroups){
            let {eligibleGroups, currentGroups} = result.data;
            dispatch(setEligibleGroups(eligibleGroups));
            dispatch(setCurrentGroups(currentGroups));
        }
    } catch (err) {
        console.log(err);
    }
};
