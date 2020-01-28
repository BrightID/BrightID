// @flow
import { Alert } from 'react-native';
import {
  deleteEligibleGroup,
  joinGroup,
  joinGroupAsCoFounder,
  setNewGroupCoFounders,
} from '../../actions/index';
import api from '../../Api/BrightId';

export const toggleNewGroupCoFounder = (id: string) => (
  dispatch: dispatch,
  getState: getState,
) => {
  let coFounders = [...getState().newGroupCoFounders];
  const index = coFounders.indexOf(id);
  if (index >= 0) {
    coFounders.splice(index, 1);
  } else if (coFounders.length < 2) {
    coFounders.push(id);
  }
  dispatch(setNewGroupCoFounders(coFounders));
};

export const createNewGroup = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  let { newGroupCoFounders } = getState();
  if (newGroupCoFounders.length < 2) {
    Alert.alert(
      'Cannot create group',
      'You need two other people to form a group',
    );
    return false;
  }
  try {
    return await api.createGroup(newGroupCoFounders[0], newGroupCoFounders[1]);
  } catch (err) {
    Alert.alert('Cannot create group', err.message);
    return false;
  }
};

export const join = (group: group) => async (dispatch: dispatch) => {
  await api.joinGroup(group.id);
  if (group.isNew && group.knownMembers.length < 2) {
    // only creator has joined
    dispatch(joinGroupAsCoFounder(group.id));
  } else {
    // creator and other co-founder have already joined; treat it as a normal group
    dispatch(joinGroup(group));
  }
};

export const deleteNewGroup = (groupId: string) => async (
  dispatch: dispatch,
) => {
  await api.deleteGroup(groupId);
  dispatch(deleteEligibleGroup(groupId));
};
