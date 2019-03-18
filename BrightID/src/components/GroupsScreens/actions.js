// @flow
import { Alert } from 'react-native';
import {
  deleteEligibleGroup,
  joinGroup,
  joinGroupAsCoFounder,
  setNewGroupCoFounders,
} from '../../actions/index';
import api from '../../Api/BrightId';

export const toggleNewGroupCoFounder = (publicKey) => (
  dispatch: dispatch,
  getState: getState,
) => {
  let coFounders = [...getState().main.newGroupCoFounders];
  const index = coFounders.indexOf(publicKey);
  if (index >= 0) {
    coFounders.splice(index, 1);
  } else if (coFounders.length < 2) {
    coFounders.push(publicKey);
  }
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

  if (response.error) Alert.alert('Cannot create group', response.errorMessage);

  if (response.data && response.data.id) return true;
};

export const join = (group) => async (dispatch: () => null) => {
  let result = await api.joinGroup(group.id);
  if (result.success) {
    if (group.isNew && group.knownMembers.length < 2) {
      // only creator has joined
      dispatch(joinGroupAsCoFounder(group.id));
    } else {
      // creator and other co-founder have already joined; treat it as a normal group
      dispatch(joinGroup(group));
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
