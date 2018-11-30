// @flow

import {deleteEligibleGroup, setCurrentGroups, setEligibleGroups, setNewGroupCoFounders} from "../../actions/index";
import { NavigationActions } from 'react-navigation'
import api from '../../Api/BrightIdApi';
import {obj2b64} from "../../utils/encoding";

export const toggleNewGroupCoFounder = (publicKey) => (
    dispatch: () => null,
    getState: () => {},
) => {
    let coFounders = [...getState().main.newGroupCoFounders];
    let match = JSON.stringify(publicKey);
    let index = coFounders.findIndex(item => (JSON.stringify(item)===match));
    if(index >= 0){
        coFounders.splice(index, 1);
    }else{
        // limit to 2 co-founder
        if(coFounders.length < 2)
            coFounders.push(publicKey);
    }
    dispatch(setNewGroupCoFounders(coFounders));
}

export const creatNewGroup = () => async (
    dispatch: () => null,
    getState: () => {},
) => {
    let {publicKey, newGroupCoFounders} = getState().main;
    // alert(JSON.stringify({
    //     publicKey, newGroupCoFounders
    // },null,2));
    let response = await api.createGroup(publicKey, newGroupCoFounders[0], newGroupCoFounders[1]);
    alert(JSON.stringify(response,null,2));
    if(response.data && response.data.id)
        return true;
    else {
        return false;
    }
}

export const joinToGroup = (groupId) => async (
    dispatch: () => null,
    getState: () => {},
) => {
    let {publicKey} = getState().main;
    let result = await api.joinAGroup(groupId);
    if(result.success){
        let {eligibleGroups, currentGroups, publicKey} = getState().main;
        let newCurrentGroups = [];
        let userKey = api.urlSafe(obj2b64(publicKey));
        eligibleGroups = [... eligibleGroups].reduce((filtered, group) => {
            if(group.id == groupId){
                if(group.knownMembers.indexOf(userKey) < 0)
                    group.knownMembers.push(userKey);
            }
            // when third co-founder join the group, the group will move to current groups
            if(group.knownMembers.length > 2){
                newCurrentGroups.push(group)
            }else{
                filtered.push(group);
            }
            return filtered;
        },[]);
        await dispatch(setEligibleGroups(eligibleGroups));
        if(newCurrentGroups.length > 0){
            await dispatch(setCurrentGroups([...currentGroups, ...newCurrentGroups]));
        }
    }
    return result;
};

export const deleteNewGroup = (groupId) => async (
    dispatch: () => null,
    getState: () => {},
) => {
    let {publicKey} = getState().main;
    // return alert(JSON.stringify(publicKey, groupId));
    let result = await api.deleteGroup(groupId);
    if(result.success)
        dispatch(deleteEligibleGroup(groupId));
    return result;
}