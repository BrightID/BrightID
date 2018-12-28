// @flow
import { Alert } from 'react-native';
import {
  deleteEligibleGroup,
  setCurrentGroups,
  setEligibleGroups,
  setNewGroupCoFounders,
} from '../../actions/index';
import api from '../../Api/BrightId';
import { uInt8ArrayToUrlSafeB64 } from '../../utils/encoding';

export const toggleNewGroupCoFounder = (publicKey) => (
  dispatch: dispatch,
  getState: getState,
) => {
  let coFounders = [...getState().main.newGroupCoFounders];
  let match = JSON.stringify(publicKey);
  let index = coFounders.findIndex((item) => JSON.stringify(item) === match);
  if (index >= 0) {
    coFounders.splice(index, 1);
  } else if (coFounders.length < 2) coFounders.push(publicKey);
  dispatch(setNewGroupCoFounders(coFounders));
};

export const createNewGroup = () => async (
  dispatch: () => null,
  getState: () => {},
) => {
  let { newGroupCoFounders } = getState().main;
  if (newGroupCoFounders.length < 2) {
    return Alert.alert(
      'Cannot create group',
      'You need two other people to form a group',
    );
  }
  let response = await api.createGroup(
    newGroupCoFounders[0],
    newGroupCoFounders[1],
  );
  // alert(JSON.stringify(response, null, 2));
  console.log(response);

  if (response.error) Alert.alert('Cannot create group', response.errorMessage);

  if (response.data && response.data.id) return true;
};

export const joinGroup = (groupId) => async (
  dispatch: () => null,
  getState: () => {},
) => {
  let result = await api.joinGroup(groupId);
  if (result.success) {
    let { eligibleGroups, currentGroups, publicKey } = getState().main;
    let newCurrentGroups = [];
    let userKey = uInt8ArrayToUrlSafeB64(publicKey);
    eligibleGroups = [...eligibleGroups].reduce((filtered, group) => {
      if (group.id === groupId) {
        if (group.knownMembers.indexOf(userKey) < 0)
          group.knownMembers.push(userKey);
      }
      // when third co-founder join the group, the group will move to current groups
      if (group.knownMembers.length > 2) {
        newCurrentGroups.push(group);
      } else {
        filtered.push(group);
      }
      return filtered;
    }, []);
    dispatch(setEligibleGroups(eligibleGroups));
    if (newCurrentGroups.length > 0) {
      dispatch(setCurrentGroups([...currentGroups, ...newCurrentGroups]));
    }
  }
  return result;
};

export const deleteNewGroup = (groupId) => async (dispatch: () => null) => {
  // return alert(JSON.stringify(publicKey, groupId));
  let result = await api.deleteGroup(groupId);
  if (result.success) dispatch(deleteEligibleGroup(groupId));
  return result;
};
