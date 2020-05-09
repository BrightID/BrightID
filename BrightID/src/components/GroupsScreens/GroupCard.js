// @flow

import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { DEVICE_TYPE } from '@/utils/constants';
import { getGroupName, ids2connections } from '@/utils/groups';
import GroupPhoto from './GroupPhoto';
/**
 * Group Card in the Groups Screen
 */

class GroupCard extends React.PureComponent<Props> {
  setStatus = () => {
    const { group } = this.props;
    if (group.isNew) {
      const notJoinedIds = group.founders.filter(
        (founder) => !group.members.includes(founder),
      );
      const notJoinedNames = ids2connections(notJoinedIds).map((o) => o.name);
      return (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingMessage}>
            Waiting for {notJoinedNames.join(' and ')} to join
          </Text>
        </View>
      );
    } else {
      const unknowsCount = ids2connections(group.members).filter(
        (o) => o.name === 'Stranger',
      ).length;
      return (
        <View>
          <View style={styles.membersContainer}>
            <Text style={styles.membersLabel}>Known members: </Text>
            <Text style={styles.membersKnown}>
              {group.members.length - unknowsCount}{' '}
            </Text>
            <Text style={styles.membersLabel}>Unknown: </Text>
            <Text style={styles.membersUnknown}>{unknowsCount}</Text>
          </View>
        </View>
      );
    }
  };

  render() {
    const { group } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.photoContainer}>
          <GroupPhoto group={group} />
        </View>
        <View style={styles.info}>
          {group.type === 'primary' ? (
            <Text style={styles.primary}>Primary Group</Text>
          ) : (
            <View />
          )}
          <Text testID="groupName" style={styles.name}>{getGroupName(group)}</Text>
          <this.setStatus />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#fff',
    height: DEVICE_TYPE === 'large' ? 94 : 80,
    marginBottom: DEVICE_TYPE === 'large' ? 11.8 : 6,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.43,
    shadowRadius: 4,
  },
  photoContainer: {
    minWidth: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    marginLeft: 25,
    flex: 1,
    height: DEVICE_TYPE === 'large' ? 71 : 65,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  name: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_TYPE === 'large' ? 20 : 18,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  waitingContainer: {},
  membersContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  primary: {
    fontSize: DEVICE_TYPE === 'large' ? 14 : 12,
    color: '#139c60',
  },
  membersLabel: {
    fontFamily: 'ApexNew-Medium',
    fontSize: DEVICE_TYPE === 'large' ? 14 : 12,
    color: '#9b9b9b',
    marginRight: 3,
    paddingTop: 1.5,
  },
  membersKnown: {
    color: '#139c60',
    fontSize: DEVICE_TYPE === 'large' ? 16 : 12,
  },
  membersUnknown: {
    color: '#e39f2f',
    fontSize: DEVICE_TYPE === 'large' ? 16 : 12,
  },
  waitingMessage: {
    fontFamily: 'ApexNew-Medium',
    fontSize: DEVICE_TYPE === 'large' ? 16 : 12,
    color: '#e39f2f',
  },
});

export default connect()(GroupCard);
