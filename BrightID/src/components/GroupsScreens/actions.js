// @flow
import { Alert } from 'react-native';
import { newGroupId } from '../../utils/groups';
import {
  deleteEligibleGroup,
  joinGroup,
  joinGroupAsCoFounder,
  setNewGroupCoFounders,
  createGroup,
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

export const createNewGroup = (type) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  let { id, newGroupCoFounders, connections } = getState();
  if (newGroupCoFounders.length < 2) {
    Alert.alert(
      'Cannot create group',
      'You need two other people to form a group',
    );
    return false;
  }
  if (type === 'primary') {
    const u1 = connections.find(c => c.id === newGroupCoFounders[0]);
    const u2 = connections.find(c => c.id === newGroupCoFounders[1]);
    if (u1.hasPrimaryGroup || u2.hasPrimaryGroup) {
      const name = u1.hasPrimaryGroup ? u1.name : u2.name;
      Alert.alert(
        'Cannot create group',
        `${name} already has a primary group`,
      );
      return false;
    }
  }
  try {
    const groupId = newGroupId();
    const newGroup = {
      founders: [id, newGroupCoFounders[0], newGroupCoFounders[1]],
      members: [id],
      id: groupId,
      isNew: true,
      score: 0,
      type
    };
    dispatch(createGroup(newGroup));
    await api.createGroup(newGroupCoFounders[0], newGroupCoFounders[1], type);
    return true;
  } catch (err) {
    Alert.alert('Cannot create group', err.message);
    return false;
  }
};

export const join = (group: group) => async (dispatch: dispatch) => {
  await api.joinGroup(group.id);
  if (group.isNew && group.members.length < 2) {
    // only creator has joined
    dispatch(joinGroupAsCoFounder(group));
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
