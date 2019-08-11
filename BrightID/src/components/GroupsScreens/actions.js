// @flow
import { Alert } from 'react-native';
import {
  deleteEligibleGroup,
  joinGroup,
  joinGroupAsCoFounder,
  setNewGroupCoFounders,
} from '../../actions/index';
import api from '../../Api/BrightId';

export const toggleNewGroupCoFounder = (publicKey: string) => (
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
  dispatch: dispatch,
  getState: getState,
) => {
  let { newGroupCoFounders } = getState().main;
  if (newGroupCoFounders.length < 2) {
    Alert.alert(
      'Cannot create group',
      'You need two other people to form a group',
    );
    return false;
  }
  try {
    await api.createGroup(newGroupCoFounders[0], newGroupCoFounders[1]);
  } catch (err) {
    Alert.alert(err.message || 'Cannot create group', err.stack);
  }
};

export const join = (group: group) => async (dispatch: dispatch) => {
  let result = await api.joinGroup(group.id);
  if (result.ok) {
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

export const deleteNewGroup = (groupId: string) => async (
  dispatch: dispatch,
) => {
  // return alert(JSON.stringify(publicKey, groupId));
  let result = await api.deleteGroup(groupId);
  if (result.ok) dispatch(deleteEligibleGroup(groupId));
  return result;
};
